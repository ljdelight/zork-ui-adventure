import { DIRS, type Dir, type Item, type Output, type Room, type State, type Text } from './types';
import { GAME_SUBTITLE, GAME_TITLE, ITEMS, MAX_SCORE, ROOMS, initialState } from './world';

const RECIPIENTS = ['girl', 'child', 'ghost', 'figure', 'her'];

const DIR_ALIASES: Record<string, Dir> = {
  n: 'north', north: 'north',
  s: 'south', south: 'south',
  e: 'east', east: 'east',
  w: 'west', west: 'west',
  u: 'up', up: 'up', upstairs: 'up', ascend: 'up',
  d: 'down', down: 'down', downstairs: 'down', descend: 'down',
};

const STOPWORDS = new Set(['the', 'a', 'an', 'some', 'my', 'at', 'with', 'from']);

const resolve = (t: Text, s: State) => (typeof t === 'function' ? t(s) : t);

interface Target {
  kind: 'item' | 'scenery';
  id: string;
  name: string;
  item?: Item;
  text?: Text;
}

export class Game {
  state: State;
  private out: Output[] = [];
  private lastCommand = '';

  constructor(state?: State) {
    this.state = state ?? initialState();
  }

  get room(): Room {
    return ROOMS[this.state.room];
  }

  /** Opening text for a fresh game, or a re-description of the current room when resuming. */
  start(resumed = false): Output[] {
    this.out = [];
    if (resumed) {
      this.system('Welcome back. Your progress was restored.');
    } else {
      this.system(`${GAME_TITLE.toUpperCase()}\n${GAME_SUBTITLE}\nType HELP for instructions, or tap the buttons below.`);
    }
    this.describeRoom();
    return this.out;
  }

  exec(raw: string): Output[] {
    this.out = [];
    const input = raw.trim();
    if (!input) return this.out;
    this.out.push({ kind: 'echo', text: input });

    if (this.state.won && !/^(restart|score|help)$/i.test(input)) {
      this.say('The bell has rung, and the dead are sleeping. Type RESTART to play again.');
      return this.out;
    }

    let normalized = input.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
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

  /** Exits from the current room that are visible to the player (for UI buttons). */
  availableExits(): Dir[] {
    return DIRS.filter((d) => this.room.exits[d]);
  }

  /** Item ids the player can see lying in the current room. */
  visibleItems(): string[] {
    if (this.isDark()) return [];
    return Object.keys(ITEMS).filter((id) => this.state.items[id] === this.state.room);
  }

  inventory(): string[] {
    return Object.keys(ITEMS).filter((id) => this.state.items[id] === 'inv');
  }

  isDark(): boolean {
    if (!this.room.dark) return false;
    const lantern = this.state.items.lantern;
    const lanternHere = lantern === 'inv' || lantern === this.state.room;
    return !(this.state.flags.lanternLit && lanternHere);
  }

  // ---------------------------------------------------------------------------
  // Output helpers

  private say(text: string) {
    this.out.push({ kind: 'text', text });
  }

  private system(text: string) {
    this.out.push({ kind: 'system', text });
  }

  private award(key: string, points: number) {
    if (this.state.awarded.includes(key)) return;
    this.state.awarded.push(key);
    this.state.score += points;
    this.system(`[Your score just went up by ${points}.]`);
  }

  // ---------------------------------------------------------------------------
  // Parsing

  /** Returns true if the command should count as a move. */
  private dispatch(cmd: string): boolean {
    const words = cmd.split(' ');
    let verb = words[0];
    let rest = words.slice(1).join(' ');

    // Multi-word verbs.
    const phrasal: [RegExp, string][] = [
      [/^pick up\b/, 'take'],
      [/^look at\b/, 'examine'],
      [/^look in\b/, 'examine'],
      [/^turn on\b/, 'light'],
      [/^switch on\b/, 'light'],
      [/^turn off\b/, 'extinguish'],
      [/^switch off\b/, 'extinguish'],
      [/^put out\b/, 'extinguish'],
      [/^blow out\b/, 'extinguish'],
      [/^put down\b/, 'drop'],
      [/^climb down\b/, 'go down'],
      [/^climb up\b/, 'go up'],
      [/^go to\b/, 'go'],
    ];
    for (const [re, replacement] of phrasal) {
      if (re.test(cmd)) {
        const expanded = cmd.replace(re, replacement).trim().split(' ');
        verb = expanded[0];
        rest = expanded.slice(1).join(' ');
        break;
      }
    }

    // Bare directions, and "go north" / "walk n" / "climb [rope]".
    if (DIR_ALIASES[verb] && rest === '') return this.move(DIR_ALIASES[verb]);
    if (verb === 'climb') {
      const dir = DIR_ALIASES[rest.split(' ')[0]];
      return dir ? this.move(dir) : this.climb();
    }
    if (['go', 'walk', 'run', 'head', 'move', 'travel'].includes(verb)) {
      const words = rest.split(' ').filter((w) => !STOPWORDS.has(w) && w !== 'to' && w !== 'towards');
      const dir = DIR_ALIASES[words[0] ?? ''];
      if (!dir) {
        this.say('Which way? (north, south, east, west, up or down)');
        return false;
      }
      return this.move(dir);
    }

    const obj = this.stripStops(rest);

    switch (verb) {
      case 'l':
      case 'look':
        if (obj) return this.examine(obj);
        this.describeRoom();
        return false;
      case 'x':
      case 'examine':
      case 'inspect':
      case 'check':
        return this.examine(obj);
      case 'read':
        return this.read(obj);
      case 'i':
      case 'inv':
      case 'inventory':
        this.showInventory();
        return false;
      case 'take':
      case 'get':
      case 'grab':
      case 'carry':
        return this.take(obj);
      case 'drop':
      case 'discard':
        return this.drop(obj);
      case 'light':
      case 'ignite':
        return this.light(obj);
      case 'extinguish':
      case 'douse':
      case 'snuff':
        return this.extinguish(obj);
      case 'search':
        if (this.findTarget(obj)?.id === 'man') return this.open(obj);
        return this.examine(obj);
      case 'open':
      case 'pry':
      case 'prise':
      case 'unclench':
        return this.open(obj);
      case 'close':
      case 'shut':
        return this.close(obj);
      case 'unlock':
        return this.unlock(obj);
      case 'tie':
      case 'attach':
      case 'fasten':
      case 'knot':
      case 'hang':
      case 'put':
      case 'place':
      case 'insert':
      case 'fix':
        return this.putOrTie(verb, obj);
      case 'untie':
        return this.untie(obj);
      case 'give':
      case 'offer':
      case 'feed':
      case 'throw':
      case 'toss':
        return this.give(verb, obj);
      case 'ring':
      case 'strike':
      case 'swing':
      case 'push':
      case 'hit':
        return this.ring(obj);
      case 'talk':
      case 'speak':
      case 'ask':
      case 'tell':
      case 'greet':
      case 'hello':
      case 'hi':
        return this.talk(obj);
      case 'kiss':
      case 'hug':
      case 'comfort':
      case 'hold':
        return this.kiss(verb, obj);
      case 'eat':
      case 'bite':
        return this.eat(obj);
      case 'enter':
        return this.enter();
      case 'wait':
      case 'z':
        this.say('Time passes. The wind keeps its own counsel.');
        return true;
      case 'score':
        this.showScore();
        return false;
      case 'hint':
      case 'hints':
        this.say(this.hint());
        return false;
      case 'help':
      case '?':
        this.help();
        return false;
      case 'xyzzy':
      case 'plugh':
        this.say('A hollow voice whispers: “Wrong story, friend.”');
        return false;
      case 'restart':
        this.state = initialState();
        this.lastCommand = '';
        this.system('You close your eyes, and the evening begins again.');
        this.describeRoom();
        return false;
      default:
        this.say(`I don't know how to "${verb}". Type HELP for a list of things to try.`);
        return false;
    }
  }

  private stripStops(phrase: string): string {
    return phrase
      .split(' ')
      .filter((w) => w && !STOPWORDS.has(w))
      .join(' ');
  }

  private matchesNoun(phrase: string, noun: string): boolean {
    return new RegExp(`(^|\\s)${noun}(\\s|$)`).test(phrase);
  }

  /** Find something the player can refer to: carried or visible items first, then room scenery. */
  private findTarget(phrase: string): Target | null {
    if (!phrase) return null;
    const dark = this.isDark();
    const candidates = Object.values(ITEMS).filter((item) => {
      const loc = this.state.items[item.id];
      return loc === 'inv' || (!dark && loc === this.state.room);
    });
    // Prefer the longest matching noun so "silver ring" beats "silver".
    let best: { item: Item; len: number } | null = null;
    for (const item of candidates) {
      for (const noun of item.nouns) {
        if (this.matchesNoun(phrase, noun) && (!best || noun.length > best.len)) {
          best = { item, len: noun.length };
        }
      }
    }
    if (best) return { kind: 'item', id: best.item.id, name: best.item.name, item: best.item };

    if (dark) return null;
    for (const [keys, text] of Object.entries(this.room.scenery ?? {})) {
      const nouns = keys.split('|');
      if (nouns.some((n) => this.matchesNoun(phrase, n))) {
        return { kind: 'scenery', id: nouns[0], name: nouns[0], text };
      }
    }
    return null;
  }

  private notHere(phrase: string) {
    if (this.isDark()) this.say("It's too dark to see anything like that.");
    else this.say(`You don't see any ${phrase} here.`);
  }

  private has(itemId: string) {
    return this.state.items[itemId] === 'inv';
  }

  // ---------------------------------------------------------------------------
  // Movement and description

  private move(dir: Dir): boolean {
    const dest = this.room.exits[dir];
    if (!dest) {
      this.say(this.isDark() ? 'You blunder into cold stone. Not that way.' : "You can't go that way.");
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

  private climb(): boolean {
    if (this.room.exits.up) return this.move('up');
    if (this.room.exits.down) return this.move('down');
    this.say('There is nothing here to climb.');
    return false;
  }

  private enter(): boolean {
    const target: Partial<Record<string, Dir>> = {
      crossroads: 'south', shore: 'north', abbeygate: 'north', cloister: 'north', well: 'down',
    };
    const dir = target[this.state.room];
    if (dir) return this.move(dir);
    this.say('Enter what, exactly?');
    return false;
  }

  /** Now and then, something unsettling happens nearby. Deterministic per move so tests are stable. */
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
    // describeRoom printed only a title for the dark room; replace it with the peril text.
    if (this.out[this.out.length - 1]?.kind === 'title') this.out.pop();
    this.say(peril.text);
    this.state.room = peril.exit;
    this.describeRoom();
  }

  describeRoom() {
    const room = this.room;
    const firstVisit = !this.state.visited.includes(room.id);
    if (firstVisit) this.state.visited.push(room.id);

    this.out.push({ kind: 'title', text: room.name });
    if (this.isDark()) {
      if (room.peril) return; // checkPeril will narrate.
      this.say(
        'It is pitch dark. Water drips somewhere close by, and the cold soaks through your boots. ' +
          'You can feel the rope swaying beside you.',
      );
      return;
    }
    this.say(resolve(room.description, this.state));
    const items = this.visibleItems();
    if (items.length) {
      const names = items.map((id) => `a ${ITEMS[id].name}`);
      this.say(`You can see ${listify(names)} here.`);
    }
  }

  private showInventory() {
    const inv = this.inventory();
    if (!inv.length) {
      this.say('You are empty-handed.');
      return;
    }
    const names = inv.map((id) => {
      const lit = id === 'lantern' && this.state.flags.lanternLit ? ' (lit)' : '';
      return `  a ${ITEMS[id].name}${lit}`;
    });
    this.say(`You are carrying:\n${names.join('\n')}`);
  }

  private showScore() {
    const treasures = Object.values(ITEMS).filter((i) => i.treasure);
    const found = treasures.filter((i) => this.state.awarded.includes(`take:${i.id}`)).length;
    this.system(
      `Score: ${this.state.score} of ${MAX_SCORE}, in ${this.state.moves} moves. ` +
        `Treasures found: ${found} of ${treasures.length}.`,
    );
  }

  private help() {
    this.system(
      [
        'Explore by typing short commands, or use the compass and buttons.',
        '',
        'MOVING:  north (n), south (s), east (e), west (w), up (u), down (d)',
        'LOOKING: look (l), examine (x) <thing>, read <thing>',
        'THINGS:  take <thing>, drop <thing>, inventory (i), open, unlock',
        'OTHER:   light/extinguish lantern, tie, give <thing> to <someone>, ring',
        'META:    score, hint, again (g), restart',
        '',
        'Your progress is saved automatically in this browser.',
      ].join('\n'),
    );
  }

  private hint(): string {
    const s = this.state;
    const f = s.flags;
    if (!this.has('lantern') && s.items.lantern === 'cottage')
      return 'Read the letter nailed to your door, and take the lantern. You will want light. The soul cake is for someone, too.';
    if (!f.ropeTied && s.items.key === 'wellbottom') {
      if (!this.has('rope'))
        return 'The orchard well is too deep to climb. Someone in the fisherman\u2019s hut on the strand is still alive. Talk to him.';
      return 'Try tying the rope to the well.';
    }
    if (s.items.key === 'wellbottom')
      return 'Something waits at the bottom of the well. Make sure your lantern is lit.';
    if (!f.gateOpen) return 'That iron key must fit the abbey gate.';
    if (s.items.clapper === 'crypt')
      return 'The monks carried the clapper down among their dead. The crypt is under the cloister — bring a light.';
    if (!f.clapperHung) return 'Carry the clapper up the tower and hang it in the bell.';
    if (!s.won) return 'Ring the bell!';
    return 'You have done everything that matters.';
  }

  // ---------------------------------------------------------------------------
  // Actions

  private examine(phrase: string): boolean {
    if (!phrase) {
      this.say('Examine what?');
      return false;
    }
    if (['room', 'around', 'here'].includes(phrase)) {
      this.describeRoom();
      return false;
    }
    const t = this.findTarget(phrase);
    if (!t) {
      this.notHere(phrase);
      return false;
    }
    if (t.kind === 'item') this.say(resolve(t.item!.description, this.state));
    else this.say(resolve(t.text!, this.state));
    return false;
  }

  private read(phrase: string): boolean {
    const t = this.findTarget(phrase || 'note');
    if (!t) {
      this.notHere(phrase || 'note');
      return false;
    }
    if (t.item?.readable) this.say(t.item.readable);
    else if (t.kind === 'item') this.say(`There is nothing written on the ${t.name}.`);
    else this.say(resolve(t.text!, this.state));
    return false;
  }

  private take(phrase: string): boolean {
    if (!phrase) {
      this.say('Take what?');
      return false;
    }
    if (phrase === 'all' || phrase === 'everything') {
      const items = this.visibleItems();
      if (!items.length) {
        this.say('There is nothing here to take.');
        return false;
      }
      for (const id of items) this.takeItem(id);
      return true;
    }
    const t = this.findTarget(phrase);
    if (!t) {
      if (phrase.includes('rope') && this.state.flags.ropeTied && ['well', 'wellbottom'].includes(this.state.room)) {
        this.say(this.state.room === 'well' ? 'You would need to untie it first.' : 'It is tied fast at the top.');
        return false;
      }
      this.notHere(phrase);
      return false;
    }
    if (t.kind === 'scenery') {
      if (t.id === 'girl') this.say('Your hand passes through her hood like it is fog. It is so cold it burns.');
      else if (t.id === 'man') this.say('You are not carrying a drowned man anywhere. Perhaps you could open his hand.');
      else if (t.id === 'tom') this.say('Wen looks at you. \u201cTouch him and I\u2019ll break your fucking arm.\u201d He means it.');
      else if (t.id === 'wen') this.say('\u201cDarling, I\u2019m flattered, but you couldn\u2019t carry me. Tom could. Tom did, once, all the way home from the Michaelmas fair.\u201d');
      else if (t.id === 'bell') this.say('Ha.');
      else this.say("That's not something you can carry.");
      return false;
    }
    if (this.has(t.id)) {
      this.say('You already have that.');
      return false;
    }
    this.takeItem(t.id);
    return true;
  }

  private takeItem(id: string) {
    const item = ITEMS[id];
    this.state.items[id] = 'inv';
    if (id === 'clapper' && !this.state.awarded.includes('take:clapper')) {
      this.say(
        "You ease the clapper out of the abbot's grip. As it comes free, his head turns, slowly, " +
          'to follow your hands. Then it stops, as if it has lost interest. You do not breathe again ' +
          'until you are sure. Taken.',
      );
    } else if (id === 'key' && !this.state.awarded.includes('take:key')) {
      this.say('You fish about in the freezing water and come up with the iron key. Taken.');
    } else {
      this.say(`${capitalize(item.name)}: taken.`);
    }
    if (id === 'key') this.award('take:key', 10);
    if (id === 'clapper') this.award('take:clapper', 10);
    if (item.treasure) this.award(`take:${id}`, item.treasure);
  }

  private drop(phrase: string): boolean {
    if (!phrase) {
      this.say('Drop what?');
      return false;
    }
    const t = this.findTarget(phrase);
    if (!t || t.kind !== 'item' || !this.has(t.id)) {
      this.say("You aren't carrying that.");
      return false;
    }
    this.state.items[t.id] = this.state.room;
    this.say(`${capitalize(t.name)}: dropped.`);
    return true;
  }

  private light(phrase: string): boolean {
    const t = this.findTarget(phrase || 'lantern');
    if (!t || t.id !== 'lantern') {
      if (t) this.say("You can't light that.");
      else this.notHere(phrase || 'lantern');
      return false;
    }
    if (this.state.flags.lanternLit) {
      this.say('The lantern is already lit.');
      return false;
    }
    this.state.flags.lanternLit = true;
    this.say('You strike the tinderbox. The wick catches, and warm gold light blooms inside the glass.');
    if (this.room.dark) this.describeRoom();
    return true;
  }

  private extinguish(phrase: string): boolean {
    const t = this.findTarget(phrase || 'lantern');
    if (!t || t.id !== 'lantern') {
      this.say("That isn't burning.");
      return false;
    }
    if (!this.state.flags.lanternLit) {
      this.say("The lantern isn't lit.");
      return false;
    }
    this.state.flags.lanternLit = false;
    this.say('You turn the wick down. The flame shrinks to nothing.');
    if (this.room.dark && !this.room.peril) this.say('Darkness closes in around you.');
    return true;
  }

  private open(phrase: string): boolean {
    const t = this.findTarget(phrase);
    if (!t) {
      this.notHere(phrase || 'that');
      return false;
    }
    if (t.id === 'gate') {
      if (this.state.flags.gateOpen) this.say('It is already open.');
      else if (this.has('key')) return this.unlock('gate');
      else this.say('It is locked. You would need a key.');
      return false;
    }
    if (t.id === 'man') {
      if (this.state.flags.handOpened) {
        this.say('His hand is already open. It stays open.');
        return false;
      }
      this.state.flags.handOpened = true;
      this.state.items.reliquary = 'tidepools';
      this.say(
        'You kneel in the freezing water and pry his fingers open, one by one. They are soft, like ' +
          'dough. The last one does not want to let go, and then, all at once, it does. A small gold ' +
          'reliquary drops into the pool.\n\nWhen you look up, his face is turned toward you. You did not turn it.',
      );
      return true;
    }
    if (t.id === 'lantern') {
      this.say('You peer through the little glass door. The wick is trimmed and ready. Try LIGHT LANTERN.');
      return false;
    }
    if (t.id === 'note') return this.read('note');
    this.say("That's not something you can open.");
    return false;
  }

  private close(phrase: string): boolean {
    const t = this.findTarget(phrase);
    if (t?.id === 'gate' && this.state.flags.gateOpen) {
      this.say('The gate is rusted open now. It is not going anywhere.');
    } else if (t?.id === 'man' && this.state.flags.handOpened) {
      this.say('You are not touching him again.');
    } else {
      this.say("That's not something you can close.");
    }
    return false;
  }

  private unlock(phrase: string): boolean {
    const t = this.findTarget(phrase || 'gate');
    if (!t || (t.id !== 'gate' && t.id !== 'lock')) {
      if (!t) this.notHere(phrase || 'gate');
      else this.say("There's no lock on that.");
      return false;
    }
    if (this.state.flags.gateOpen) {
      this.say('The gate is already open.');
      return false;
    }
    if (!this.has('key')) {
      this.say("You don't have anything that fits the lock.");
      return false;
    }
    this.state.flags.gateOpen = true;
    this.say(
      'The iron key grinds in the lock, sticks, and then turns with a crack like a breaking bone. ' +
        'You put your shoulder to the gate and it swings inward, shrieking.',
    );
    this.award('gate', 10);
    return true;
  }

  /** Handles TIE ROPE TO WELL, HANG CLAPPER ON HOOK, PUT X IN Y, etc. */
  private putOrTie(verb: string, phrase: string): boolean {
    const [objPhrase, targetPhrase = ''] = phrase.split(/\s+(?:to|on|onto|in|into|around|inside|under)\s+/);
    const t = this.findTarget(objPhrase);
    if (!t) {
      this.notHere(objPhrase || 'that');
      return false;
    }
    if (t.kind !== 'item' || !this.has(t.id)) {
      this.say(`You aren't holding the ${t.name}.`);
      return false;
    }

    if (t.id === 'rope') {
      if (this.state.room !== 'well') {
        this.say('There is nothing here worth tying the rope to.');
        return false;
      }
      this.state.items.rope = 'nowhere';
      this.state.flags.ropeTied = true;
      this.say(
        'You loop the rope twice around the crossbeam and pull the knot tight. The free end ' +
          'uncoils down into the shaft and slaps against water far below.',
      );
      this.award('rope', 5);
      return true;
    }

    if (t.id === 'clapper') {
      if (this.state.room !== 'belfry') {
        this.say(
          targetPhrase ? `That doesn't belong on the ${targetPhrase}.` : 'There is nowhere here to put it.',
        );
        return false;
      }
      this.state.items.clapper = 'nowhere';
      this.state.flags.clapperHung = true;
      this.say(
        'Straining, you heave the clapper up inside the bell and hook its iron loop over the empty ' +
          'hook. It settles into place with a low, expectant hum that you feel in your teeth.',
      );
      this.award('hang', 10);
      return true;
    }

    if (t.id === 'key' && this.state.room === 'abbeygate') return this.unlock('gate');

    if (verb === 'give' || RECIPIENTS.some((r) => this.matchesNoun(targetPhrase, r))) return this.give('give', phrase);

    this.say(`You can't see how to ${verb} the ${t.name} like that.`);
    return false;
  }

  private untie(phrase: string): boolean {
    if (!phrase.includes('rope')) {
      this.say('There is nothing to untie.');
      return false;
    }
    if (this.state.room !== 'well' || !this.state.flags.ropeTied) {
      this.say(this.state.flags.ropeTied ? 'You can only reach the knot from the top.' : 'There is nothing to untie.');
      return false;
    }
    this.state.flags.ropeTied = false;
    this.state.items.rope = 'inv';
    this.say('You haul the rope up, hand over hand, and coil it over your shoulder.');
    return true;
  }

  private give(verb: string, phrase: string): boolean {
    let objPhrase: string;
    let recipient: string;
    if (verb === 'feed') {
      // FEED GIRL, FEED CAKE TO GIRL, FEED GIRL CAKE
      const parts = phrase.split(/\s+to\s+/);
      if (parts.length > 1) [objPhrase, recipient] = parts;
      else {
        recipient = phrase;
        objPhrase = 'cake';
      }
    } else {
      const parts = phrase.split(/\s+(?:to|at)\s+/);
      if (parts.length > 1) [objPhrase, recipient] = parts;
      else {
        // GIVE GIRL CAKE
        objPhrase = phrase;
        recipient = phrase;
      }
    }

    if (!RECIPIENTS.some((r) => this.matchesNoun(recipient, r))) {
      if (verb === 'throw' || verb === 'toss') {
        const t = this.findTarget(objPhrase);
        if (t?.kind === 'item' && this.has(t.id)) {
          this.state.items[t.id] = this.state.room;
          this.say(`You toss the ${t.name}. It lands a short way off.`);
          return true;
        }
      }
      this.say('There is no one here to give anything to.');
      return false;
    }
    if (this.state.room !== 'stones' || this.state.flags.childFed) {
      this.say('There is no one here. You hope.');
      return false;
    }
    const t = this.findTarget(objPhrase.replace(/\b(girl|child|ghost|figure|her)\b/g, '').trim() || 'cake');
    if (!t || t.kind !== 'item' || !this.has(t.id)) {
      this.say("You aren't holding anything like that.");
      return false;
    }
    if (t.id !== 'cake') {
      this.say(`She does not look at the ${t.name}. \u201cThat\u2019s not for us,\u201d she says. \u201cYou know what\u2019s for us.\u201d`);
      return false;
    }
    this.state.items.cake = 'nowhere';
    this.state.flags.childFed = true;
    this.state.items.ring = 'stones';
    this.say(
      'You hold out the soul cake. She takes it in both hands, the way small children do, and eats it ' +
        'in careful bites, and where the crumbs fall the frost melts. \u201cMam used to make these,\u201d ' +
        'she says. \u201cShe\u2019s waiting in the fields with the others. Ring it soon. They\u2019re so tired.\u201d\n\n' +
        'Then the hood is empty and falls in on itself, and is not there at all. Something lies in the ' +
        'frost where she sat: a silver ring.',
    );
    return true;
  }

  private ring(phrase: string): boolean {
    if (phrase && !/\bbell\b/.test(phrase)) {
      const t = this.findTarget(phrase);
      if (!t) this.notHere(phrase);
      else this.say('Nothing happens.');
      return false;
    }
    if (this.state.room !== 'belfry') {
      this.say('There is no bell here.');
      return false;
    }
    if (!this.state.flags.clapperHung) {
      this.say(
        'You thump the bronze with your fist. It produces a dull, disappointed thunk. ' +
          'A bell without a clapper is no bell at all.',
      );
      return false;
    }
    this.state.won = true;
    this.say(
      'You set your shoulder to the great rim and push. Slowly, slowly the bell swings out over ' +
        'the drop — and back — and the clapper meets the bronze.',
    );
    this.say('BONNNNNNG.');
    this.say(
      'The note rolls out over the graves, the orchard, the village, the fields. Down in the fields ' +
        'the figures lift their faces toward it, all together, the way a congregation looks up at the ' +
        'elevation of the Host. Then, one by one, they lie down, and the ground takes them back.\n\n' +
        'Last of all, at the edge of the dead orchard, a woman in a gray shawl raises her hand to you. ' +
        'It is your mother\u2019s wave; you would know it anywhere. Then she lies down too.\n\n' +
        'Deep beneath the abbey, something that is not a man screams in fury, and falls silent. ' +
        'The bell goes on humming for a long time. In the east, the sky is graying. It is All Saints\u2019 Day.' +
        (this.state.flags.wenMet
          ? '\n\nWhen you come down at last, Wen Kard is sitting on the abbey steps in his ruined green coat, the dawn lighting his hair and beard like a bonfire, ' +
            'with Tom\u2019s old wool cap in his lap, swearing quietly and magnificently at the sunrise. He looks up. ' +
            '\u201cWell,\u201d he says. \u201cFuck me. You actually did it.\u201d He holds out a hand for you to help him up, ' +
            'and doesn\u2019t let go of yours straight away. \u201cCome on. Somebody has to bury Tom properly, and ' +
            'I\u2019m not doing it in these shoes.\u201d'
          : ''),
    );
    this.award('bell', 25);
    this.out.push({
      kind: 'win',
      text: `*** You have won ***\nFinal score: ${this.state.score} of ${MAX_SCORE}, in ${this.state.moves + 1} moves.`,
    });
    return true;
  }

  private wenHere(phrase: string): boolean {
    if (this.state.room !== 'ferryhut') return false;
    return !phrase || /\b(wen|kard|player|man|him)\b/.test(phrase);
  }

  /** TALK TO WEN, ASK WEN ABOUT BELL, TELL WEN ABOUT GIRL... */
  private talk(phrase: string): boolean {
    const [who, topic = ''] = phrase.replace(/^to\s+/, '').split(/\s+about\s+/);
    if (!this.wenHere(who)) {
      if (this.state.room === 'stones' && !this.state.flags.childFed) {
        this.say('She hums on, not looking at you. \u201cNobody left anything out for me,\u201d she says again. \u201cIt\u2019s Hallows.\u201d');
      } else if (this.state.room === 'crypt') {
        this.say('The abbot\u2019s jaw works, once, wetly. You decide not to wait for the rest of the sentence.');
      } else {
        this.say('Nobody answers. Out here, that is the best you can hope for.');
      }
      return false;
    }

    if (!this.state.flags.wenMet) {
      this.state.flags.wenMet = true;
      this.state.items.rope = 'inv';
      this.say(
        'The young man by the stove does not look up. \u201cIf you\u2019ve come to rob Tom, you\u2019re late. If ' +
          'you\u2019ve come to pray over him, you can fuck right off; he hated priests, and priests hated us.\u201d ' +
          'He wipes his nose on a green sleeve and drags a hand through his beard. \u201cWen Kard. Player, singer, the finest Mary Magdalene in four ' +
          'counties, and kisser of other women\u2019s husbands. Tom was the only one I ever kept.\u201d\n\n' +
          'Then he sees the lantern, and you, properly. \u201cOh, Christ. You\u2019re going up to the abbey. Brave ' +
          'little bastard.\u201d He nudges a coil of rope by his knee. The end of it is tied in a noose. ' +
          '\u201cTake that. I walked it out here meaning to do something stupid, and Tom would haunt me for it, and ' +
          'God knows there\u2019s enough haunting going round tonight.\u201d He shoves it at you. \u201cGo on. ' +
          'Before I change my mind.\u201d\n\nYou pick the noose apart with cold fingers. Now you have a coil of rope.',
      );
      return true;
    }

    const topics: [RegExp, string][] = [
      [/bell|abbey|tower/, '\u201cNot rung since the abbot went funny. And I mean funny, darling, not my kind of funny. Tom saw him in the orchard at Lammas, on his knees, eating the windfalls. Worms and all. Then he went down into his crypt and the bell stopped.\u201d'],
      [/tom|fisherman|him|lover|husband/, '\u201cSix years. Nobody in this shithole knew, or everybody knew and pretended not to, which is the same thing with better manners.\u201d He strokes the dead man\u2019s swollen knuckles. \u201cHands like a bear. Cried at weddings. He\u2019d have liked you.\u201d'],
      [/girl|child|maud|stones|maidens/, '\u201cLittle Maud? Died in July, and her mam a week after. Her mam baked like a saint and swore like a sailor; I adored her.\u201d He looks away. \u201cIf you see Maud up at the stones, you be kind to her. She was always hungry.\u201d'],
      [/crypt|abbot|dark|dead/, '\u201cDon\u2019t go down there without a light. I mean it. Things go down there in the dark and come up a different shape.\u201d He shudders. \u201cAnd if the abbot looks at you, don\u2019t look back.\u201d'],
      [/well|key|gate|anselm|monk/, '\u201cBrother Anselm came through here weeping about a key and a well. I gave him a drink. I gave him four. He didn\u2019t make sense after any of them, but he kissed me on the forehead when he left, which no monk has ever done sober.\u201d'],
      [/drowned|sailor|reliquary|pools/, '\u201cThe sailor in the rock pools? Washed up Tuesday, holding on to something like it was the last of God. Nobody\u2019s had the stomach to look. You might.\u201d'],
      [/wen|yourself|you|kard|player/, '\u201cMe? I was the Magdalene every Easter. Wept real tears at the foot of the cross. The men in the front row wept hardest, and I knew where half of them had been the night before.\u201d A wet grin. \u201cAsk me again when we\u2019re not all dying.\u201d'],
      [/rope|noose/, '\u201cDon\u2019t. I know. Just go and use it for something better.\u201d'],
    ];
    const hit = topic && topics.find(([re]) => re.test(topic));
    if (hit) this.say(hit[1]);
    else
      this.say(
        '\u201cI\u2019m a player, darling, not a priest. Ask me about something I know: the bell, Tom, the ' +
          'crypt, the little girl, the well, that poor drowned sod. Or me. I\u2019m very interesting.\u201d',
      );
    return false;
  }

  private kiss(verb: string, phrase: string): boolean {
    if (this.wenHere(phrase) && phrase) {
      this.say(
        verb === 'kiss'
          ? 'He laughs, a real one, startled out of him. \u201cNot in front of Tom, you shameless thing. Ask me again at dawn, if there is one.\u201d But he squeezes your hand before he lets it go.'
          : 'He stiffens, then leans into you, all bones and stale wine and grief, and shakes for a while. \u201cRight,\u201d he says eventually, into your shoulder. \u201cRight. Go and ring your fucking bell.\u201d',
      );
      return false;
    }
    this.say(phrase ? 'You think better of it.' : `${capitalize(verb)} whom?`);
    return false;
  }

  private eat(phrase: string): boolean {
    const t = this.findTarget(phrase);
    if (t?.id === 'cake') {
      this.say(
        'You raise it to your mouth, and stop. It is not for the living. Your mother taught you that much.',
      );
    } else if (t) {
      this.say("That doesn't look edible.");
    } else {
      this.notHere(phrase || 'food');
    }
    return false;
  }
}

function listify(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
