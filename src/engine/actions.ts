import type { Game } from './game';
import type { Cmd, Item } from './types';
import { DIR_ALIASES } from './vocabulary';

type Handler = (g: Game, c: Cmd) => boolean;

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const what = (g: Game, c: Cmd) => {
  // "X what?" reads badly, so abbreviations use the action's name.
  g.say(`${cap(c.verb.length > 2 ? c.verb : c.action)} what?`);
  return false;
};

/** Actions whose handlers consult the target's `on` responses themselves, rather than being short-circuited. */
export const SELF_RESPONDING = new Set([
  'look', 'examine', 'search', 'read', 'take', 'drop', 'light', 'extinguish', 'put', 'tie', 'give', 'throw', 'eat', 'talk',
]);

/**
 * Checks that run before story rules. Returning a boolean ends the command (with that move-count);
 * returning undefined lets it continue.
 */
export const PRECONDITIONS: Record<string, (g: Game, c: Cmd) => boolean | undefined> = {
  drop(g, c) {
    if (!c.objPhrase) return what(g, c);
    if (c.obj?.kind !== 'item' || !g.has(c.obj.id)) {
      g.say("You aren't carrying that.");
      return false;
    }
  },
  put: holding,
  tie: holding,
  throw(g, c) {
    if (!c.objPhrase) return what(g, c);
    if (c.obj?.kind === 'scenery') {
      g.say('You can’t pick that up, let alone throw it.');
      return false;
    }
    if (!g.has(c.obj!.id)) {
      g.say("You aren't holding that.");
      return false;
    }
  },
  give(g, c) {
    if (c.obj && (c.obj.kind !== 'item' || !g.has(c.obj.id))) {
      g.say("You aren't holding anything like that.");
      return false;
    }
    if (!c.second?.thing?.person) {
      g.say('There is no one here to give anything to.');
      return false;
    }
    if (!c.obj && c.objPhrase) return what(g, c);
  },
  burn(g) {
    if (g.heldLight()) return undefined;
    const unlit = Object.values(g.items).find((i) => i.lightSource && g.has(i.id));
    g.say(unlit ? `Your ${unlit.name} is not lit.` : 'You have nothing to burn it with.');
    return false;
  },
};

function holding(g: Game, c: Cmd): boolean | undefined {
  if (!c.objPhrase) return what(g, c);
  if (c.obj?.kind !== 'item' || !g.has(c.obj.id)) {
    g.say(`You aren't holding the ${c.obj!.name}.`);
    return false;
  }
}

/** Smell, taste, kick, roll... reached only when the target has no response of its own. */
const react: Handler = (g, c) => {
  if (!c.obj) {
    const r = g.room.senses?.[c.action] ?? g.texts.alone[c.action];
    g.say(r !== undefined ? g.resolve(r) : `${cap(c.verb)} what?`);
    return false;
  }
  g.say(g.generic(c.action, c.obj));
  return false;
};

/** Default handler for verbs whose real behavior comes from responses and rules. */
const stock: Handler = (g, c) => {
  if (!c.obj) return what(g, c);
  g.say(g.generic(c.action, c.obj));
  return false;
};

function firstItem(g: Game, test: (i: Item) => boolean): Item | undefined {
  return Object.values(g.items).find((i) => test(i) && (g.has(i.id) || g.state.items[i.id] === g.state.room));
}

function takeItem(g: Game, id: string) {
  const item = g.items[id];
  const firstTime = !g.state.flags[`${id}Taken`];
  g.state.items[id] = 'inv';
  g.state.flags[`${id}Taken`] = true;
  g.say(firstTime && item.firstTake ? g.resolve(item.firstTake) : `${cap(item.name)}: taken.`);
  const points = item.treasure ?? item.points;
  if (points) g.award(`take:${id}`, points);
}

const examine: Handler = (g, c) => {
  if (!c.objPhrase) return what(g, c);
  if (!c.obj) {
    g.describeRoom();
    return false;
  }
  g.say(g.resolve(c.obj.item?.description ?? c.obj.thing!.look));
  return false;
};

export const ACTIONS: Record<string, Handler> = {
  look(g, c) {
    if (c.objPhrase) return examine(g, c);
    g.describeRoom();
    return false;
  },
  examine,
  search: examine,

  read(g, c) {
    const t = c.obj?.item ?? (c.obj ? null : firstItem(g, (i) => !!i.readable));
    if (c.obj?.thing) g.say(g.resolve(c.obj.thing.look));
    else if (!t) return what(g, c);
    else g.say(t.readable ?? `There is nothing written on the ${t.name}.`);
    return false;
  },

  inventory(g) {
    const inv = g.inventory();
    if (!inv.length) g.say('You are empty-handed.');
    else
      g.say(
        `You are carrying:\n${inv.map((id) => `  a ${g.items[id].name}${g.isLit(id) ? ' (lit)' : ''}`).join('\n')}`,
      );
    return false;
  },

  take(g, c) {
    if (!c.objPhrase) return what(g, c);
    if (c.objPhrase === 'all' || c.objPhrase === 'everything') {
      const items = g.visibleItems();
      if (!items.length) g.say('There is nothing here to take.');
      for (const id of items) takeItem(g, id);
      return items.length > 0;
    }
    const t = c.obj!;
    if (t.kind === 'scenery') {
      const r = g.response(t, 'take');
      g.say(r !== undefined ? g.resolve(r) : "That's not something you can carry.");
      return false;
    }
    if (g.has(t.id)) {
      g.say('You already have that.');
      return false;
    }
    takeItem(g, t.id);
    return true;
  },

  drop(g, c) {
    g.state.items[c.obj!.id] = g.state.room;
    g.say(`${cap(c.obj!.name)}: dropped.`);
    return true;
  },

  light(g, c) {
    const item = c.obj ? c.obj.item : firstItem(g, (i) => !!i.lightSource);
    if (!item) return c.obj ? (g.say("You can't light that."), false) : what(g, c);
    if (!item.lightSource) {
      g.say("You can't light that.");
      return false;
    }
    if (g.isLit(item.id)) {
      g.say(`The ${item.name} is already lit.`);
      return false;
    }
    g.state.flags[`${item.id}Lit`] = true;
    g.say(g.resolve(item.on?.light ?? `You light the ${item.name}.`));
    if (g.room.dark) g.describeRoom();
    return true;
  },

  extinguish(g, c) {
    const item = c.obj ? c.obj.item : firstItem(g, (i) => !!i.lightSource && g.isLit(i.id));
    if (!item?.lightSource) {
      g.say("That isn't burning.");
      return false;
    }
    if (!g.isLit(item.id)) {
      g.say(`The ${item.name} isn't lit.`);
      return false;
    }
    g.state.flags[`${item.id}Lit`] = false;
    g.say(g.resolve(item.on?.extinguish ?? `The ${item.name} goes out.`));
    if (g.room.dark && !g.room.peril && g.isDark()) g.say('Darkness closes in around you.');
    return true;
  },

  open: stock,
  close: stock,
  unlock: stock,
  lock: stock,
  untie: stock,

  put(g, c) {
    if (c.second?.thing?.person) return g.perform({ ...c, action: 'give' });
    g.say(`You can't see how to ${c.verb} the ${c.obj!.name} like that.`);
    return false;
  },
  tie(g, c) {
    return ACTIONS.put(g, c);
  },

  give(g, c) {
    if (!c.obj) return what(g, c);
    g.say(`Nobody here wants the ${c.obj.name}.`);
    return false;
  },

  throw(g, c) {
    const item = c.obj!.item!;
    const where = `${c.prep} ${c.secondPhrase}`.trim();
    const dest = c.prep ? g.room.throwTargets?.find((t) => t.match.test(where)) : undefined;
    if (dest) {
      g.state.items[item.id] = dest.to;
      g.say(typeof dest.text === 'function' ? dest.text(item) : dest.text.replace('{item}', item.name));
      return true;
    }
    if (c.second?.thing?.person) return g.perform({ ...c, action: 'give' });
    g.state.items[item.id] = g.state.room;
    if (c.second) g.say(`The ${item.name} strikes the ${c.second.name} and drops to the ground.`);
    else g.say(item.on?.throw !== undefined ? g.resolve(item.on.throw) : g.generic('throw', c.obj!));
    return true;
  },

  talk(g, c) {
    const who = c.obj;
    const conv = who?.thing?.talk;
    if (!who || !conv) {
      g.say(who && !who.thing?.person ? `The ${who.name} has nothing to say.` : g.texts.noReply);
      return false;
    }
    const topic = c.secondPhrase;
    const hit = topic ? conv.topics?.find(([re]) => re.test(topic)) : undefined;
    g.say(g.resolve(hit?.[1] ?? (topic ? conv.fallback : (conv.greeting ?? conv.fallback))));
    return false;
  },

  kiss(g, c) {
    if (!c.obj) {
      g.say(`${cap(c.verb)} whom?`);
      return false;
    }
    return stock(g, c);
  },
  hug(g, c) {
    return ACTIONS.kiss(g, c);
  },

  eat(g, c) {
    if (!c.obj) return what(g, c);
    const r = g.response(c.obj, 'eat') ?? g.response(c.obj, 'taste');
    g.say(r !== undefined ? g.resolve(r) : g.generic('eat', c.obj));
    return false;
  },

  enter(g) {
    if (g.room.enter) return g.move(g.room.enter);
    g.say('Enter what, exactly?');
    return false;
  },

  climb(g, c) {
    const dir = DIR_ALIASES[c.phrase.split(' ')[0]];
    if (dir) return g.move(dir);
    if (g.room.exits.up) return g.move('up');
    if (g.room.exits.down) return g.move('down');
    g.say('There is nothing here to climb.');
    return false;
  },

  wait(g) {
    g.say(g.texts.wait);
    return true;
  },

  score(g) {
    const treasures = Object.values(g.items).filter((i) => i.treasure);
    const found = treasures.filter((i) => g.state.awarded.includes(`take:${i.id}`)).length;
    g.system(
      `Score: ${g.state.score} of ${g.story.maxScore}, in ${g.state.moves} moves.` +
        (treasures.length ? ` Treasures found: ${found} of ${treasures.length}.` : ''),
    );
    return false;
  },

  hint(g) {
    g.say(g.story.hint?.(g) ?? 'You are on your own, I’m afraid.');
    return false;
  },

  help(g) {
    g.system(g.texts.help);
    return false;
  },

  restart(g) {
    g.restart();
    return false;
  },

  smell: react,
  taste: react,
  touch: react,
  listen: react,
  shake: react,
  roll: react,
  turn: react,
  hit: react,
  break: react,
  pull: react,
  push: react,
  squeeze: react,
  wear: react,
  polish: react,
  burn: react,
};
