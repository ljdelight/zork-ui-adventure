import { ACTIONS, PRECONDITIONS, SELF_RESPONDING } from './actions';
import {
  DIRS, type Act, type Cmd, type Dir, type Item, type Output, type Room, type Rule, type State, type Story,
  type Target, type Text, type Texts, type Thing,
} from './types';
import {
  ACTS, ARTICLES, BLIND_ACTIONS, DEFAULT_TEXTS, DIR_ALIASES, MOVE_VERBS, PHRASAL, PREPOSITIONS, VERBS,
} from './vocabulary';

/** Words that mean "nothing in particular": FEEL AROUND, SMELL THE AIR, EXAMINE ROOM. */
export const AROUND = new Set(['around', 'about', 'room', 'here', 'air', 'yourself', 'self', 'me']);

/** TAKE ALL. */
const ALL = new Set(['all', 'everything']);

/** Actions that do not need their object phrase to name something present. */
const FREEFORM = new Set(['wait', 'score', 'hint', 'help', 'restart', 'inventory', 'enter', 'climb']);

const SPLIT = new RegExp(`^(.+?)\\s+(${PREPOSITIONS.join('|')})(?:\\s+(.*))?$`);

export const resolveText = (t: Text, s: State) => (typeof t === 'function' ? t(s) : t);
export const asThing = (v: Text | Thing): Thing => (typeof v === 'object' ? v : { look: v });
export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const list = <T>(v: T | T[] | undefined): T[] => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

export function initialState(story: Story): State {
  const items: State['items'] = {};
  for (const item of Object.values(story.items)) items[item.id] = item.start;
  return { room: story.start, items, flags: {}, visited: [], awarded: [], score: 0, moves: 0, won: false };
}

export class Game {
  state: State;
  readonly texts: Texts;
  readonly acts: Record<string, Act>;
  private readonly verbs: Record<string, string>;
  private readonly phrasal: [RegExp, string][];
  private out: Output[] = [];
  private lastCommand = '';

  constructor(
    readonly story: Story,
    state?: State,
  ) {
    this.state = state ?? initialState(story);
    const t = story.texts ?? {};
    this.texts = {
      ...DEFAULT_TEXTS,
      ...t,
      generic: { ...DEFAULT_TEXTS.generic, ...t.generic } as Texts['generic'],
      person: { ...DEFAULT_TEXTS.person, ...t.person },
      alone: { ...DEFAULT_TEXTS.alone, ...t.alone },
    };
    this.acts = { ...ACTS };
    for (const [id, act] of Object.entries(story.acts ?? {})) {
      const base = this.acts[id];
      this.acts[id] = { verbs: [...(base?.verbs ?? []), ...(act.verbs ?? [])], text: act.text ?? base?.text ?? '' };
    }
    const actVerbs = Object.entries(this.acts).flatMap(([id, act]) => act.verbs.map((v) => [v, id]));
    this.verbs = { ...VERBS, ...Object.fromEntries(actVerbs), ...story.verbs };
    this.phrasal = [...(story.phrasal ?? []), ...PHRASAL];
  }

  get room(): Room {
    return this.story.rooms[this.state.room];
  }

  get items(): Record<string, Item> {
    return this.story.items;
  }

  /** Opening text for a fresh game, or a re-description of the current room when resuming. */
  start(resumed = false): Output[] {
    this.out = [];
    if (resumed) this.system('Welcome back. Your progress was restored.');
    else
      this.system(
        `${this.story.title.toUpperCase()}\n${this.story.subtitle}\nType HELP for instructions, or tap the buttons below.`,
      );
    this.describeRoom();
    return this.out;
  }

  exec(raw: string): Output[] {
    this.out = [];
    const input = raw.trim();
    if (!input) return this.out;
    this.out.push({ kind: 'echo', text: input });

    if (this.state.won && !/^(restart|score|help)$/i.test(input)) {
      this.say(this.texts.afterWin);
      return this.out;
    }

    let normalized = input.toLowerCase().replace(/[^a-z0-9?\s]/g, ' ').replace(/\s+/g, ' ').trim();
    if (normalized === 'g' || normalized === 'again') {
      if (!this.lastCommand) {
        this.say('There is nothing to repeat.');
        return this.out;
      }
      normalized = this.lastCommand;
    } else {
      this.lastCommand = normalized;
    }

    const counted = this.dispatch(normalized);
    if (counted) this.state.moves++;
    this.checkPeril();
    if (counted) this.ambience();
    return this.out;
  }

  // ---------------------------------------------------------------------------
  // Queries (also used by the UI)

  availableExits(): Dir[] {
    return DIRS.filter((d) => this.room.exits[d]);
  }

  visibleItems(): string[] {
    if (this.isDark()) return [];
    return Object.keys(this.items).filter((id) => this.state.items[id] === this.state.room);
  }

  inventory(): string[] {
    return Object.keys(this.items).filter((id) => this.state.items[id] === 'inv');
  }

  has(itemId: string): boolean {
    return this.state.items[itemId] === 'inv';
  }

  isLit(itemId: string): boolean {
    return !!this.state.flags[`${itemId}Lit`];
  }

  /** A lit light source the player is carrying, if any. */
  heldLight(): Item | undefined {
    return Object.values(this.items).find((i) => i.lightSource && this.has(i.id) && this.isLit(i.id));
  }

  isDark(): boolean {
    if (!this.room.dark) return false;
    return !Object.values(this.items).some((i) => {
      const loc = this.state.items[i.id];
      return i.lightSource && this.isLit(i.id) && (loc === 'inv' || loc === this.state.room);
    });
  }

  // ---------------------------------------------------------------------------
  // Output and state changes (for rules and actions)

  say(text: string) {
    this.out.push({ kind: 'text', text });
  }

  system(text: string) {
    this.out.push({ kind: 'system', text });
  }

  resolve(t: Text): string {
    return resolveText(t, this.state);
  }

  award(key: string, points: number) {
    if (this.state.awarded.includes(key)) return;
    this.state.awarded.push(key);
    this.state.score += points;
    this.system(`[Your score just went up by ${points}.]`);
  }

  /** Ends the game in victory. Say the ending (and award points) first. */
  win() {
    this.state.won = true;
    this.out.push({
      kind: 'win',
      text: `*** You have won ***\nFinal score: ${this.state.score} of ${this.story.maxScore}, in ${this.state.moves + 1} moves.`,
    });
  }

  restart() {
    this.state = initialState(this.story);
    this.lastCommand = '';
    this.system(this.texts.restart);
    this.describeRoom();
  }

  /** Runs a command as if the player typed it (handy for rules that redirect). */
  run(command: string): boolean {
    return this.dispatch(command);
  }

  // ---------------------------------------------------------------------------
  // Parsing

  private dispatch(cmd: string): boolean {
    let words = cmd.split(' ');
    for (const [re, replacement] of this.phrasal) {
      if (re.test(cmd)) {
        words = cmd.replace(re, replacement).trim().split(' ');
        break;
      }
    }
    const verb = words[0];
    const rest = words.slice(1).join(' ');

    // Bare directions, and "go north" / "walk to the n".
    if (DIR_ALIASES[verb] && rest === '') return this.move(DIR_ALIASES[verb]);
    if (MOVE_VERBS.includes(verb)) {
      const w = rest.split(' ').filter((x) => !ARTICLES.has(x) && x !== 'to' && x !== 'towards');
      const dir = DIR_ALIASES[w[0] ?? ''];
      if (!dir) {
        this.say('Which way? (north, south, east, west, up or down)');
        return false;
      }
      return this.move(dir);
    }

    const action = this.verbs[verb];
    if (!action) {
      this.say(`I don't know how to "${verb}". Type HELP for a list of things to try.`);
      return false;
    }
    return this.perform(this.parse(verb, action, rest));
  }

  private parse(verb: string, action: string, rest: string): Cmd {
    let phrase = rest.split(' ').filter((w) => w && !ARTICLES.has(w)).join(' ');
    phrase = phrase.replace(/^(?:to|at|on|of|in|into|over|against|with)\s+/, '');
    const c: Cmd = { verb, action, phrase, objPhrase: phrase, obj: null, prep: '', secondPhrase: '', second: null };

    const about = phrase.match(/^about\s+(.*)$/);
    const m = about ? null : phrase.match(SPLIT);
    if (about) [c.objPhrase, c.prep, c.secondPhrase] = ['', 'about', about[1]];
    else if (m) [c.objPhrase, c.prep, c.secondPhrase] = [m[1], m[2], m[3] ?? ''];

    if (this.acts[action] || FREEFORM.has(action) || (action === 'take' && ALL.has(c.objPhrase))) return c;
    const blind = BLIND_ACTIONS.has(action);
    if (c.objPhrase && !AROUND.has(c.objPhrase)) c.obj = this.findTarget(c.objPhrase, { blind });
    if (c.secondPhrase) c.second = this.findTarget(c.secondPhrase);

    if (action === 'give' && !m) {
      // GIVE GIRL CAKE, FEED GIRL
      c.obj = this.findTarget(phrase, { kind: 'item' });
      c.second = this.findTarget(phrase, { kind: 'scenery', person: true });
      if (c.second && !c.obj) c.objPhrase = '';
    }
    if (action === 'talk' && !c.obj && !c.objPhrase) c.obj = this.soleTalker();
    return c;
  }

  /** Runs a parsed command: preconditions, then story rules, then responses, then the default. */
  perform(c: Cmd): boolean {
    const unresolved = c.objPhrase && !c.obj && !AROUND.has(c.objPhrase) && !ALL.has(c.objPhrase);
    if (unresolved && !this.acts[c.action] && !FREEFORM.has(c.action)) {
      this.notHere(c.objPhrase);
      return false;
    }
    const blocked = PRECONDITIONS[c.action]?.(this, c);
    if (blocked !== undefined) return blocked;

    const rule = this.story.rules?.find((r) => this.matches(r, c));
    if (rule) {
      if (rule.say) this.say(typeof rule.say === 'function' ? rule.say(this, c) : rule.say);
      return rule.do ? rule.do(this, c) : false;
    }

    if (c.obj && !SELF_RESPONDING.has(c.action)) {
      const r = this.response(c.obj, c.action);
      if (r !== undefined) {
        this.say(this.resolve(r));
        return false;
      }
    }

    const handler = ACTIONS[c.action];
    if (handler) return handler(this, c);

    const act = this.acts[c.action];
    if (act) {
      this.say(this.resolve(this.room.acts?.[c.action] ?? act.text));
      return true;
    }
    // A story-defined action with no rule that caught it.
    this.say(c.obj ? (this.texts.generic[c.action]?.(c.obj.name, c.obj.kind === 'scenery') ?? 'Nothing happens.') : `${capitalize(c.verb)} what?`);
    return false;
  }

  private matches(r: Rule, c: Cmd): boolean {
    if (!list(r.on).includes(c.action)) return false;
    if (r.room && !list(r.room).includes(this.state.room)) return false;
    if (r.obj && !list(r.obj).includes(c.obj?.id ?? '')) return false;
    if (r.second && !list(r.second).includes(c.second?.id ?? '')) return false;
    return !r.when || r.when(this, c);
  }

  // ---------------------------------------------------------------------------
  // Targets

  matchesNoun(phrase: string, noun: string): boolean {
    return new RegExp(`(^|\\s)${noun}(\\s|$)`).test(phrase);
  }

  /**
   * Find something the player can refer to: carried or visible items first, then room scenery.
   * With `blind`, things in the room can be found by feel even in the dark.
   */
  findTarget(phrase: string, opts: { blind?: boolean; kind?: Target['kind']; person?: boolean } = {}): Target | null {
    if (!phrase) return null;
    const dark = this.isDark() && !opts.blind;
    if (opts.kind !== 'scenery') {
      // Prefer the longest matching noun so "silver ring" beats "silver".
      let best: { item: Item; len: number } | null = null;
      for (const item of Object.values(this.items)) {
        const loc = this.state.items[item.id];
        if (loc !== 'inv' && (dark || loc !== this.state.room)) continue;
        for (const noun of item.nouns) {
          if (this.matchesNoun(phrase, noun) && (!best || noun.length > best.len)) best = { item, len: noun.length };
        }
      }
      if (best) return { kind: 'item', id: best.item.id, name: best.item.name, item: best.item };
    }
    if (dark || opts.kind === 'item') return null;
    for (const [keys, value] of Object.entries(this.room.scenery ?? {})) {
      const nouns = keys.split('|');
      const thing = asThing(value);
      if (opts.person && !thing.person) continue;
      if (nouns.some((n) => this.matchesNoun(phrase, n))) return { kind: 'scenery', id: nouns[0], name: nouns[0], thing };
    }
    return null;
  }

  private soleTalker(): Target | null {
    const talkers = Object.entries(this.room.scenery ?? {}).filter(([, v]) => asThing(v).talk);
    if (talkers.length !== 1) return null;
    const [keys, value] = talkers[0];
    const id = keys.split('|')[0];
    return { kind: 'scenery', id, name: id, thing: asThing(value) };
  }

  /** The target's own response to an action, if it has one. */
  response(t: Target, action: string): Text | undefined {
    return (t.item?.on ?? t.thing?.on)?.[action];
  }

  /** The stock response to an action on a target with nothing of its own to say. */
  generic(action: string, t: Target): string {
    if (t.thing?.person) return this.texts.person[action] ?? 'You think better of it.';
    return this.texts.generic[action]?.(t.name, t.kind === 'scenery') ?? 'Nothing happens.';
  }

  notHere(phrase: string) {
    if (this.isDark()) this.say("It's too dark to see anything like that.");
    else this.say(`You don't see any ${phrase} here.`);
  }

  // ---------------------------------------------------------------------------
  // Movement and description

  move(dir: Dir): boolean {
    const dest = this.room.exits[dir];
    if (!dest) {
      this.say(this.isDark() ? this.texts.blunder : "You can't go that way.");
      return false;
    }
    const blocked = this.room.guards?.[dir]?.(this.state);
    if (blocked) {
      this.say(blocked);
      return false;
    }
    this.state.room = dest;
    this.describeRoom();
    return true;
  }

  describeRoom() {
    const room = this.room;
    if (!this.state.visited.includes(room.id)) this.state.visited.push(room.id);
    this.out.push({ kind: 'title', text: room.name });
    if (this.isDark()) {
      if (!room.peril) this.say(room.darkText ?? this.texts.dark); // checkPeril narrates perilous rooms
      return;
    }
    this.say(this.resolve(room.description));
    const items = this.visibleItems();
    if (items.length) this.say(`You can see ${listify(items.map((id) => `a ${this.items[id].name}`))} here.`);
  }

  /** Now and then, something happens nearby. Deterministic per move so tests are stable. */
  private ambience() {
    const lines = this.room.ambience;
    if (!lines?.length || this.state.won || this.isDark()) return;
    const roll = (this.state.moves * 7919 + this.state.room.length * 104729) % 100;
    if (roll >= 30) return;
    this.out.push({ kind: 'ambient', text: lines[this.state.moves % lines.length] });
  }

  /** If the player is somewhere perilous without light, bounce them out. */
  private checkPeril() {
    const peril = this.room.peril;
    if (!peril || !this.isDark()) return;
    if (this.out[this.out.length - 1]?.kind === 'title') this.out.pop();
    this.say(peril.text);
    this.state.room = peril.exit;
    this.describeRoom();
  }
}

export function listify(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}
