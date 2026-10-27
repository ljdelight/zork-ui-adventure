import type { Game } from './game';

export type Dir = 'north' | 'south' | 'east' | 'west' | 'up' | 'down';

export const DIRS: Dir[] = ['north', 'south', 'east', 'west', 'up', 'down'];

/** Where an item currently is: a room id, the player's inventory ('inv'), or 'nowhere'. */
export type ItemLocation = string;

export interface State {
  room: string;
  items: Record<string, ItemLocation>;
  flags: Record<string, boolean>;
  visited: string[];
  awarded: string[];
  score: number;
  moves: number;
  won: boolean;
}

/** Text that may depend on the current state. */
export type Text = string | ((s: State) => string);

/**
 * Responses keyed by action id ('smell', 'taste', 'hit', 'open', 'kiss', 'take'...). For flavor actions
 * the response is simply said. A few built-ins use it as their message: 'take' on scenery is the refusal,
 * 'light'/'extinguish' replace the default message, 'throw' is how a thrown item lands.
 */
export type Responses = Partial<Record<string, Text>>;

/** A fixed, untakeable thing in a room. A bare Text is shorthand for `{ look: text }`. */
export interface Thing {
  look: Text;
  /** People (and things that were people) get different generic responses. */
  person?: boolean;
  on?: Responses;
  talk?: Conversation;
}

export interface Conversation {
  /** Said for TALK TO X with no topic. Defaults to `fallback`. */
  greeting?: Text;
  /** ASK X ABOUT <topic>: the first matching pattern answers. */
  topics?: [RegExp, Text][];
  /** Said when no topic matches. */
  fallback: Text;
}

/** Where a thrown item lands: if `match` matches "<prep> <target>" (e.g. "down well"), it moves to `to`. */
export interface ThrowTarget {
  match: RegExp;
  to: ItemLocation;
  text: string | ((item: Item) => string);
}

export interface Room {
  id: string;
  name: string;
  description: Text;
  exits: Partial<Record<Dir, string>>;
  /** Returns a message if the exit is blocked, otherwise null. */
  guards?: Partial<Record<Dir, (s: State) => string | null>>;
  dark?: boolean;
  /** Said instead of the description when the room is dark. */
  darkText?: string;
  /** Unsettling lines that sometimes play as the player moves about. */
  ambience?: string[];
  /** If the player is here without light, this text plays and they are moved to `peril.exit`. */
  peril?: { text: string; exit: string };
  /** Keys are pipe-separated nouns: "well|shaft". The first noun is the thing's id. */
  scenery?: Record<string, Text | Thing>;
  /** What a bare sense verb picks up here: { smell: '...', listen: '...' }. */
  senses?: Responses;
  /** Room-specific replies to acts such as dance, sing or pray. */
  acts?: Partial<Record<string, Text>>;
  /** Which way ENTER goes from here. */
  enter?: Dir;
  /** Where things thrown here can land, besides the floor. */
  throwTargets?: ThrowTarget[];
}

export interface Item {
  id: string;
  name: string;
  /** Longest first is not required; the longest matching noun always wins. */
  nouns: string[];
  description: Text;
  start: ItemLocation;
  /** Points for first picking it up; also counts it as a treasure in the score line. */
  treasure?: number;
  /** Points for first picking it up, without counting it as a treasure. */
  points?: number;
  readable?: string;
  /** Can be lit, and lights dark rooms while lit. Its lit flag is `${id}Lit`. */
  lightSource?: boolean;
  /** Said the first time it is taken, instead of "X: taken." */
  firstTake?: Text;
  on?: Responses;
}

/** Something the parser resolved a noun phrase to. */
export interface Target {
  kind: 'item' | 'scenery';
  id: string;
  name: string;
  item?: Item;
  thing?: Thing;
}

/** A parsed command, as rules and actions see it. */
export interface Cmd {
  /** The verb as typed, after phrasal expansion ("kick", not "hit"). */
  verb: string;
  /** The canonical action id ("hit"). */
  action: string;
  /** Everything after the verb, stopwords removed. */
  phrase: string;
  objPhrase: string;
  obj: Target | null;
  /** The preposition joining the two nouns: "to", "on", "down", "about"... */
  prep: string;
  secondPhrase: string;
  second: Target | null;
}

/** Puzzle logic. The first rule whose filters all match handles the command. */
export interface Rule {
  on: string | string[];
  /** Target ids (an item id, or a scenery thing's first noun). */
  obj?: string | string[];
  second?: string | string[];
  room?: string | string[];
  when?: (g: Game, cmd: Cmd) => boolean;
  /** Shorthand: say this and do not count a move. */
  say?: string | ((g: Game, cmd: Cmd) => string);
  /** Do anything. Returns whether the command counts as a move. */
  do?: (g: Game, cmd: Cmd) => boolean;
}

/** A verb that needs no object, like dance or pray. */
export interface Act {
  verbs: string[];
  text: Text;
}

/** Generic fallback for an action on a target with no response of its own. */
export type GenericText = (name: string, scenery: boolean) => string;

export interface Texts {
  generic: Record<string, GenericText>;
  person: Partial<Record<string, string>>;
  /** A bare verb ("smell") when the room has no sense of its own. */
  alone: Partial<Record<string, string>>;
  dark: string;
  /** Walking into a wall in the dark. */
  blunder: string;
  wait: string;
  noReply: string;
  afterWin: string;
  restart: string;
  help: string;
}

export interface Chip {
  label: string;
  command: string;
  accent?: boolean;
}

export interface Story {
  /** Used for the save slot. */
  id: string;
  title: string;
  subtitle: string;
  start: string;
  maxScore: number;
  rooms: Record<string, Room>;
  items: Record<string, Item>;
  rules?: Rule[];
  /** Extra verbs, or overrides: verb -> action id. */
  verbs?: Record<string, string>;
  /** Extra multi-word verbs: [/^ring out\b/, 'ring']. Checked before the engine's own. */
  phrasal?: [RegExp, string][];
  /** New acts, or new text/verbs for the engine's acts. */
  acts?: Record<string, Partial<Act>>;
  /** Overrides for the engine's stock text. Each map is merged over the defaults. */
  texts?: Partial<Omit<Texts, 'generic' | 'person' | 'alone'>> & {
    generic?: Partial<Record<string, GenericText>>;
    person?: Partial<Record<string, string>>;
    alone?: Partial<Record<string, string>>;
  };
  hint?: (g: Game) => string;
  /** A complete solution, used by lazy mode and tests. */
  walkthrough?: string[];
  /** Renders the illustration for a room as an SVG string. */
  scene?: (roomId: string, state: State, dark: boolean) => string;
  /** Extra quick-action buttons for the current situation. */
  chips?: (g: Game) => Chip[];
}

export type OutputKind = 'echo' | 'title' | 'text' | 'system' | 'ambient' | 'win';

export interface Output {
  kind: OutputKind;
  text: string;
}
