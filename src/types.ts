export type Dir = 'north' | 'south' | 'east' | 'west' | 'up' | 'down';

export const DIRS: Dir[] = ['north', 'south', 'east', 'west', 'up', 'down'];

/** Where an item currently is: a room id, the player's inventory, or nowhere yet. */
export type ItemLocation = string | 'inv' | 'nowhere';

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

export type Text = string | ((s: State) => string);

export interface Room {
  id: string;
  name: string;
  description: Text;
  exits: Partial<Record<Dir, string>>;
  /** Returns a message if the exit is blocked, otherwise null. */
  guards?: Partial<Record<Dir, (s: State) => string | null>>;
  dark?: boolean;
  /** Unsettling lines that sometimes play as the player moves about. */
  ambience?: string[];
  /** If the player is here without light, this text plays and they are moved to `peril.exit`. */
  peril?: { text: string; exit: string };
  /** Fixed, untakeable things. Keys are pipe-separated nouns: "well|shaft". */
  scenery?: Record<string, Text>;
}

export interface Item {
  id: string;
  name: string;
  nouns: string[];
  description: Text;
  start: ItemLocation;
  treasure?: number;
  readable?: string;
}

export type OutputKind = 'echo' | 'title' | 'text' | 'system' | 'ambient' | 'win';

export interface Output {
  kind: OutputKind;
  text: string;
}
