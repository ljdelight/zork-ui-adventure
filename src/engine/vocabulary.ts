import type { Act, Dir, Texts } from './types';

export const DIR_ALIASES: Record<string, Dir> = {
  n: 'north', north: 'north',
  s: 'south', south: 'south',
  e: 'east', east: 'east',
  w: 'west', west: 'west',
  u: 'up', up: 'up', upstairs: 'up', ascend: 'up',
  d: 'down', down: 'down', downstairs: 'down', descend: 'down',
};

export const STOPWORDS = new Set(['the', 'a', 'an', 'some', 'my', 'at', 'with', 'from']);
export const ARTICLES = new Set(['the', 'a', 'an', 'some', 'my']);

/** Prepositions that join two noun phrases: PUT X ON Y, ASK X ABOUT Y, THROW X DOWN Y. */
export const PREPOSITIONS = [
  'to', 'at', 'on', 'onto', 'in', 'into', 'inside', 'under', 'around', 'about', 'with',
  'down', 'off', 'over', 'out', 'across', 'through',
];

export const MOVE_VERBS = ['go', 'walk', 'run', 'head', 'move', 'travel'];

/** Multi-word verbs, rewritten before parsing. */
export const PHRASAL: [RegExp, string][] = [
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
  [/^put on\b/, 'wear'],
  [/^try on\b/, 'wear'],
  [/^listen to\b/, 'listen'],
  [/^set (?:fire|light) to\b/, 'burn'],
  [/^shake hands with\b/, 'shake'],
  [/^lie down\b/, 'sleep'],
  [/^sit down\b/, 'sit'],
];

const groups: Record<string, string[]> = {
  look: ['l', 'look'],
  examine: ['x', 'examine', 'inspect', 'check', 'study'],
  search: ['search', 'rummage'],
  read: ['read'],
  inventory: ['i', 'inv', 'inventory'],
  take: ['take', 'get', 'grab', 'carry', 'steal'],
  drop: ['drop', 'discard'],
  light: ['light', 'ignite', 'kindle'],
  extinguish: ['extinguish', 'douse', 'snuff'],
  open: ['open', 'pry', 'prise', 'unclench'],
  close: ['close', 'shut'],
  unlock: ['unlock'],
  lock: ['lock'],
  put: ['put', 'place', 'insert', 'hang', 'fix', 'mount'],
  tie: ['tie', 'attach', 'fasten', 'knot', 'bind', 'lash'],
  untie: ['untie', 'unknot', 'unfasten'],
  give: ['give', 'offer', 'feed', 'hand'],
  throw: ['throw', 'toss', 'hurl', 'fling', 'chuck', 'lob', 'pitch'],
  talk: ['talk', 'speak', 'ask', 'tell', 'greet', 'hello', 'hi', 'question'],
  kiss: ['kiss', 'smooch', 'snog'],
  hug: ['hug', 'embrace', 'comfort', 'hold', 'cuddle'],
  eat: ['eat', 'bite', 'devour', 'consume'],
  enter: ['enter'],
  climb: ['climb', 'scale'],
  wait: ['wait', 'z'],
  score: ['score'],
  hint: ['hint', 'hints'],
  help: ['help', '?'],
  restart: ['restart'],

  // Senses and other things you can technically try.
  smell: ['smell', 'sniff', 'inhale', 'whiff', 'snuffle'],
  taste: ['taste', 'lick', 'chew', 'nibble', 'gnaw', 'suck', 'slurp'],
  touch: [
    'touch', 'feel', 'finger', 'rub', 'stroke', 'pat', 'poke', 'prod', 'caress', 'tickle', 'fondle', 'pet', 'tap',
    'grope', 'nudge',
  ],
  listen: ['listen', 'hear'],
  shake: ['shake', 'rattle', 'jiggle', 'wiggle', 'waggle', 'brandish', 'swing'],
  roll: ['roll', 'bowl', 'juggle'],
  turn: ['turn', 'twist', 'spin', 'twirl', 'rotate', 'flip'],
  hit: [
    'hit', 'strike', 'punch', 'kick', 'slap', 'smack', 'whack', 'bash', 'thump', 'headbutt', 'attack', 'fight',
    'stab', 'bonk', 'spank',
  ],
  break: ['break', 'smash', 'shatter', 'crush', 'destroy', 'snap', 'tear', 'rip', 'bend'],
  pull: ['pull', 'tug', 'yank', 'drag', 'lift', 'raise', 'heave'],
  push: ['push', 'shove', 'press', 'lean'],
  squeeze: ['squeeze', 'pinch', 'wring', 'crumple', 'squish'],
  wear: ['wear', 'don'],
  polish: ['polish', 'clean', 'wipe', 'shine', 'wash', 'buff'],
  burn: ['burn', 'torch', 'scorch'],
};

/** verb -> action id */
export const VERBS: Record<string, string> = Object.fromEntries(
  Object.entries(groups).flatMap(([action, verbs]) => verbs.map((v) => [v, action])),
);

/** Senses that work by feel, smell and sound, so they still function in the dark. */
export const BLIND_ACTIONS = new Set(['smell', 'taste', 'touch', 'listen']);

/** Verbs that need no object. Stories add room-specific text with `room.acts`. */
export const ACTS: Record<string, Act> = {
  jump: { verbs: ['jump', 'hop', 'leap', 'skip'], text: 'You jump on the spot. Nothing comes of it.' },
  dance: { verbs: ['dance', 'jig', 'caper', 'waltz', 'boogie', 'prance'], text: 'You dance a few steps. Nobody applauds.' },
  sing: { verbs: ['sing', 'hum', 'whistle', 'chant', 'yodel'], text: 'You sing a few bars. Your voice sounds very small.' },
  pray: { verbs: ['pray', 'kneel', 'genuflect'], text: 'You pray. If anyone is listening, they keep it to themselves.' },
  cry: { verbs: ['cry', 'weep', 'sob', 'wail', 'blubber'], text: 'You cry for a while. It helps, a little.' },
  shout: {
    verbs: ['shout', 'scream', 'yell', 'howl', 'holler', 'shriek', 'roar', 'bellow'],
    text: 'You shout. Nothing answers.',
  },
  sleep: { verbs: ['sleep', 'nap', 'rest', 'lie', 'doze'], text: 'This is no time for sleeping.' },
  sit: { verbs: ['sit', 'squat', 'crouch'], text: 'You sit for a moment and get your breath back.' },
  swim: { verbs: ['swim', 'bathe', 'wade', 'paddle', 'dive'], text: 'There is nowhere to swim here.' },
  dig: { verbs: ['dig', 'excavate', 'burrow'], text: 'The ground is too hard, and you have no spade.' },
  spit: { verbs: ['spit', 'hock', 'gob'], text: 'You spit. How refined.' },
  curse: { verbs: ['curse', 'swear', 'damn', 'blaspheme', 'cuss'], text: 'You swear, long and inventively.' },
  laugh: { verbs: ['laugh', 'giggle', 'chuckle', 'cackle', 'snicker'], text: 'You laugh. It echoes oddly.' },
  wave: { verbs: ['wave', 'beckon', 'salute'], text: 'You wave at no one in particular.' },
  clap: { verbs: ['clap', 'applaud'], text: 'You clap your hands. The sound falls flat.' },
  knock: { verbs: ['knock', 'rap', 'bang'], text: 'You knock. Nobody answers.' },
  piss: { verbs: ['piss', 'pee', 'urinate', 'wee', 'relieve'], text: 'Not here.' },
  fart: { verbs: ['fart', 'toot', 'trump'], text: 'Your body betrays you, loudly.' },
  cough: { verbs: ['cough', 'sneeze', 'hiccup', 'wheeze'], text: 'You cough.' },
  breathe: { verbs: ['breathe', 'pant', 'sigh'], text: 'You breathe in. You breathe out. Good. Keep doing that.' },
  think: { verbs: ['think', 'ponder', 'consider', 'remember', 'meditate'], text: 'You think hard. (HINT might help.)' },
  bow: { verbs: ['bow', 'curtsy', 'curtsey'], text: 'You bow. Nobody bows back.' },
  hide: { verbs: ['hide', 'cower', 'duck'], text: 'There is nowhere to hide here.' },
};

export const DEFAULT_TEXTS: Texts = {
  generic: {
    smell: (n) => `The ${n} smells much as you would expect.`,
    taste: (n) => `You lick the ${n}. It tastes of nothing much, and you feel foolish.`,
    touch: (n) => `The ${n} feels just as it looks.`,
    listen: (n) => `You listen to the ${n}. It keeps its secrets.`,
    shake: (n, sc) => (sc ? `The ${n} is not going to be shaken by the likes of you.` : `You shake the ${n}. Nothing rattles.`),
    roll: (n, sc) => (sc ? 'You can’t roll that.' : `You roll the ${n} between your palms. It does not get any rounder.`),
    turn: (n, sc) => (sc ? 'It won’t turn.' : `You turn the ${n} over in your hands. It looks the same from every side.`),
    hit: (n, sc) => (sc ? `You hit the ${n}. Your knuckles lose.` : `You whack the ${n}. It takes it better than you do.`),
    break: (n) => `The ${n} is sturdier than your temper.`,
    pull: (n, sc) => (sc ? `You heave at the ${n}. It does not budge.` : `You tug at the ${n}. It stays in one piece.`),
    push: (n) => `You push the ${n}. It doesn’t move, and you feel faintly ridiculous.`,
    squeeze: (n) => `You squeeze the ${n}. It doesn’t squeeze back.`,
    wear: (n) => `You can’t wear the ${n}.`,
    polish: (n) => `You rub the ${n} with your sleeve. It looks about the same.`,
    burn: (n) => `You hold the flame to the ${n}. It blackens, stinks, and refuses to burn.`,
    throw: (n) => `You toss the ${n}. It lands a short way off.`,
    eat: () => 'That doesn’t look edible.',
    open: () => "That's not something you can open.",
    close: () => "That's not something you can close.",
    unlock: () => "There's no lock on that.",
    lock: () => "There's no lock on that.",
    untie: () => 'There is nothing to untie.',
    kiss: () => 'You think better of it.',
    hug: () => 'You think better of it.',
  },
  person: {
    smell: 'You lean in and sniff. They do not appreciate it.',
    taste: 'No.',
    touch: 'You reach out, and then think better of it.',
    listen: 'You listen. Nothing.',
    hit: 'Violence will not help.',
    eat: 'No.',
    burn: 'You will not.',
    open: "That's not something you can open.",
    close: "That's not something you can close.",
    unlock: "There's no lock on that.",
    lock: "There's no lock on that.",
    untie: 'There is nothing to untie.',
  },
  alone: {
    smell: 'You smell nothing out of the ordinary.',
    taste: 'You taste nothing but your own mouth.',
    listen: 'You hear nothing out of the ordinary.',
    shake: 'You shake yourself like a wet dog. It helps, a little.',
    roll: 'You roll about on the ground. Nobody sees. Small mercies.',
    turn: 'You turn around. Nothing is behind you.',
  },
  dark: 'It is pitch dark.',
  blunder: 'You blunder into something solid. Not that way.',
  wait: 'Time passes.',
  noReply: 'There is no answer.',
  afterWin: 'The story is over. Type RESTART to play again.',
  restart: 'You close your eyes, and it all begins again.',
  help: [
    'Explore by typing short commands, or use the compass and buttons.',
    '',
    'MOVING:  north (n), south (s), east (e), west (w), up (u), down (d)',
    'LOOKING: look (l), examine (x) <thing>, read <thing>',
    'THINGS:  take, drop, inventory (i), open, unlock, light, put, tie, give, throw',
    'PEOPLE:  talk to <someone>, ask <someone> about <something>',
    'SENSES:  smell, taste, touch, listen, and anything else you might try:',
    '         kick, lick, roll, shake, pray, dance, sing...',
    'META:    score, hint, again (g), restart',
    '',
    'Your progress is saved automatically in this browser.',
  ].join('\n'),
};
