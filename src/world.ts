import type { Item, Room, State } from './types';

export const GAME_TITLE = 'The Silent Bell';
export const GAME_SUBTITLE = "A tale of All Hallows' Eve, in the year of the Pestilence.";
export const START_ROOM = 'cottage';
export const MAX_SCORE = 100;

const LETTER_TEXT =
  'The letter is in a cramped monk’s hand, and the last lines slope badly, as if the writer was very tired:\n\n' +
  '“To whoever still lives in this village. I am the last of St. Audra’s and I will not see morning. ' +
  'The bell has not rung since the abbot went down into the crypt to pray and came back up wrong. ' +
  'He carried the clapper down with him into the dark, and threw the gate key into the orchard well ' +
  'so that none of us could follow.\n\n' +
  'Tonight is All Hallows. Without the bell, what we buried will not stay buried. ' +
  'Ring it before the night is out. Take a light, and do not go below without one. ' +
  'God keep you, because He has not kept us.\n— Anselm”';

export const ROOMS: Record<string, Room> = {
  cottage: {
    id: 'cottage',
    name: 'Your Cottage',
    description:
      'Your cottage, or what the pestilence left of it. The beds are bare boards now; you burned ' +
      'the straw yourself in August. A few coals sulk in the hearth. Your mother’s table stands ' +
      'beneath the shuttered window, laid with a clean cloth the way she always laid it on Hallows’ ' +
      'Eve, for the dead. You did not lay it. The door, with its chalk cross, opens north.',
    exits: { north: 'crossroads' },
    ambience: [
      'The latch on the door lifts, very gently, and falls back.',
      'Something taps on the shutter, three times, patient as a neighbor.',
    ],
    scenery: {
      'fire|hearth|coals|fireplace': 'Embers, mostly. They give more smoke than warmth.',
      'table|cloth': 'Scrubbed oak and a cloth you last saw folded in your mother’s chest. You buried her in August.',
      'window|shutter|shutters': 'Barred from the inside. You barred it. You are almost sure you barred it.',
      'door|cross|chalk':
        'The priest chalked the cross there in the summer, when the sickness came into the house. It has not rained since, and it has not faded.',
      'beds|bed|boards': 'Four beds. Only you to sleep in them.',
    },
  },

  crossroads: {
    id: 'crossroads',
    name: 'Crossroads',
    description:
      'Four roads meet here, and where four roads meet the old folk bury the ones the Church will not ' +
      'have. A gibbet leans over the crossing, and the thing in its cage has been there since the summer. ' +
      'To the north the broken tower of St. Audra’s stands black against a moon as fat and orange as a ' +
      'harvest fire. Paths run north through the dead orchard, east toward the sound of surf, and west up ' +
      'a heather slope. Your cottage lies just south.',
    exits: { north: 'orchard', east: 'shore', west: 'stones', south: 'cottage' },
    ambience: [
      'The gibbet chain creaks, though the air is perfectly still.',
      'Behind you, a single footstep on the road. When you turn, the road is empty.',
      'A dog howls somewhere off in the dark, and then stops very suddenly.',
    ],
    scenery: {
      'signpost|sign|post|arms':
        'NORTH — ST. AUDRA’S. EAST — THE STRAND. WEST — THE NINE MAIDENS. ' +
        'Someone has nailed on a fourth arm, pointing straight down, and burned into it a single word: HERE.',
      'gibbet|cage|body|corpse|thief|chain':
        'What is left of him still wears a board around its neck: THIEF. The crows took his eyes and his lips first, ' +
        'so he grins at everything. Something has been at him since the crows, something with flat teeth, and recently. ' +
        'His head is turned toward the village, the way a dog waits for its master.',
      'abbey|tower': 'The belfry is open to the sky. No light up there. No sound.',
      'moon': 'Too large, too low and too orange. It looks like an eye that has been crying.',
      'road|roads|track|path': 'Frozen ruts. Nobody has come this way since the dying started.',
    },
  },

  orchard: {
    id: 'orchard',
    name: 'Dead Orchard',
    description:
      'The orchard died the same summer the village did. The trees stand bare and black, their fruit ' +
      'rotted on the branch, and the grass beneath is gray with frost. On a fence post someone has set ' +
      'a carved turnip lantern; a candle gutters inside it, and its face grins at you through the fog. ' +
      'The road runs north to the abbey, a well stands to the east, and the crossroads lie south.',
    exits: { north: 'abbeygate', east: 'well', south: 'crossroads' },
    ambience: [
      'The turnip’s grin looks wider than it was.',
      'Something moves between the far trees: upright, slow, and in no hurry at all.',
      'A rotten apple drops from a branch beside you. There was no wind.',
    ],
    scenery: {
      'turnip|face|jack|candle|post':
        'Carved to frighten off the wandering dead on Hallows’ Eve. Its candle should have burned out hours ago. It hasn’t.',
      'trees|tree|branches|apples|fruit': 'Black, bare and very still. The fog moves through them. They do not move at all.',
      'grass|frost': 'There are footprints in the frost, leading from the trees toward your cottage. Bare feet.',
      'fog|mist': 'It hangs at waist height, and it is thicker where you are not looking.',
    },
  },

  well: {
    id: 'well',
    name: 'The Well',
    description: (s) =>
      'A ring of frost-slick stones surrounds a black shaft. An oak crossbeam spans the top, though ' +
      'the bucket and chain are long gone. The air rising from below smells of wet stone and of ' +
      'something sweeter, like flowers left too long on a grave. The orchard is west.' +
      (s.flags.ropeTied ? ' Your rope is knotted around the crossbeam, trailing down into the dark.' : ''),
    exits: { west: 'orchard', down: 'wellbottom' },
    guards: {
      down: (s) => (s.flags.ropeTied ? null : 'The shaft is far too deep and slick to climb down unaided.'),
    },
    ambience: ['From far down the shaft comes a sound like someone humming with their mouth full of water.'],
    scenery: {
      'well|shaft|stones':
        'You drop a pebble in. A long moment later: a flat splash. Then, a moment after that, a second splash, as if something below had thrown it back.',
      'crossbeam|beam|oak': 'Solid oak, black with age. It would bear a person’s weight.',
      rope: (s) =>
        s.flags.ropeTied ? 'Knotted firmly around the crossbeam. It looks like it will hold.' : 'There is no rope here.',
    },
  },

  wellbottom: {
    id: 'wellbottom',
    name: 'Bottom of the Well',
    dark: true,
    description:
      'You stand ankle-deep in black water at the bottom of the shaft. The walls sweat and drip. Bones ' +
      'lie half-sunk in the silt: someone else came down here looking for the key, long ago, and never ' +
      'climbed back up. Far above, a coin of orange sky. The rope dangles beside you, leading up.',
    exits: { up: 'well' },
    scenery: {
      'water|silt': 'Bitterly cold. Something that is not your foot moves in it, once, and is still.',
      'bones|skull|bone': 'A grown man, by the size of him. His fingers are worn to the knuckle where he tried to climb.',
      'walls|wall': 'Slick stone. There are scratches in it, as high as a man can reach.',
      rope: 'Your rope, leading back up to the world.',
    },
  },

  abbeygate: {
    id: 'abbeygate',
    name: 'Abbey Gate',
    description: (s) =>
      'The road ends at a high wall of gray stone. Set into it is a tall iron gate, and someone has hung ' +
      'rosaries from every bar, dozens of them, which click softly against the iron though there is no ' +
      'wind. ' +
      (s.flags.gateOpen ? 'The gate stands open. ' : 'It is shut fast with a heavy lock. ') +
      'Beyond lie the cloister, the graves and the tower. The orchard is south.',
    exits: { north: 'cloister', south: 'orchard' },
    guards: {
      north: (s) => (s.flags.gateOpen ? null : 'The iron gate is locked.'),
    },
    ambience: ['The rosaries rattle all at once, like teeth, and then hang still.'],
    scenery: {
      'gate|bars|iron gate': (s) =>
        s.flags.gateOpen
          ? 'The gate hangs open. The rosaries nearest the lock have snapped and scattered their beads.'
          : 'Old iron, still strong. Whoever locked it was more afraid of what was inside than out.',
      lock: (s) => (s.flags.gateOpen ? 'The lock hangs open.' : 'A big iron lock with a big iron keyhole.'),
      'rosaries|rosary|beads': 'Wooden beads, bone beads, one of cheap glass. Every family in the village, by the look of it.',
      'wall|walls': 'Too high and too smooth to climb.',
    },
  },

  cloister: {
    id: 'cloister',
    name: 'Cloister Graveyard',
    description:
      'Roofless arches surround a courtyard where the monks buried their own when the pestilence came, ' +
      'too many and too fast. The ground is heaped with mounds, and the crosses are only sticks bound ' +
      'with twine. A dry fountain stands at the center. A chapel doorway yawns to the north, the bell ' +
      'tower rises to the east, and worn steps lead down into darkness to the west. The gate is south.',
    exits: { north: 'chapel', east: 'towerbase', west: 'crypt', down: 'crypt', south: 'abbeygate' },
    ambience: [
      'One of the grave mounds shifts, just slightly, as you pass it.',
      'From the crypt steps comes the smell of incense, which is worse, somehow, than the smell of rot.',
    ],
    scenery: {
      'mounds|mound|graves|grave|earth':
        'The earth on three of the mounds has been pushed up and outward, the way earth moves when a mole comes up. Moles are not this large.',
      'crosses|cross|sticks': 'Twine and kindling. Some have fallen. Some have been pulled out.',
      fountain: 'A stone basin carved with fish. It is full of dead leaves and, at the bottom, a single child’s shoe.',
      'arches|arch': 'The ivy on them has died back, and what is left looks like veins.',
      'steps|stairs': 'They lead down into a blackness that seems to swallow light.',
    },
  },

  chapel: {
    id: 'chapel',
    name: 'Chapel of St. Audra',
    description:
      'The chapel is full of the dead. They lie on the pews in their shrouds, row on row, laid out for a ' +
      'burial no one lived to give them. Candle stubs have burned down to puddles of tallow. Above the ' +
      'stone altar, the great window is a jagged frame of colored glass. The only way out is south.',
    exits: { south: 'cloister' },
    ambience: ['Under a shroud in the back row, something sighs, long and contented, like a sleeper turning over.'],
    scenery: {
      altar: 'Pale stone. Someone has scratched a little bell into its side, and beneath it: PULSA ET DORMIENT. Ring, and they will sleep.',
      'window|glass': 'What remains shows St. Audra holding a bell above the waves. Someone has scratched out her eyes.',
      'pews|pew|dead|shrouds|shroud|bodies':
        'You lift one shroud, and wish you had not: the plague has burst him open at the groin and the armpit, and ' +
          'something has been feeding at the wounds. Under another shroud, very faintly, the cloth is rising and falling. ' +
          'You decide that you imagined it.',
      'candles|tallow|stubs': 'Burned out days ago.',
    },
  },

  towerbase: {
    id: 'towerbase',
    name: 'Foot of the Tower',
    description:
      'A spiral stair winds up the inside of the tower, each step worn into a shallow bowl by centuries ' +
      'of feet. Thin light falls from arrow-slit windows. Scratched into the wall beside the first step, ' +
      'over and over in a frantic hand: NON DORMIUNT. The cloister is west.',
    exits: { up: 'belfry', west: 'cloister' },
    ambience: ['Somewhere below you, in the cloister, someone is walking in circles.'],
    scenery: {
      'stair|stairs|steps': 'Up and up and up.',
      'writing|scratches|wall|words':
        'NON DORMIUNT. NON DORMIUNT. NON DORMIUNT. They do not sleep. Anselm’s hand, you think, near the end.',
      'window|windows|slit': 'Too narrow for anything but moonlight and wind.',
    },
  },

  belfry: {
    id: 'belfry',
    name: 'Belfry',
    description: (s) =>
      'You emerge onto a windy platform high above the abbey. Here hangs the great bell, green with age ' +
      'and wide enough to stand inside. Through the open arches you can see the whole valley: the village, ' +
      'the orchard, the fields — and figures in the fields, a great many of them, standing very still, ' +
      'all facing the tower. ' +
      (s.flags.clapperHung
        ? 'The bronze clapper hangs within the bell once more.'
        : 'Looking up into the bell, you see it has no clapper — only an empty iron hook.') +
      ' The stair leads down.',
    exits: { down: 'towerbase' },
    ambience: [
      'Far below, someone is climbing the stair behind you. When you hold your breath, they stop.',
      'Down in the fields, the figures have come a little closer to the abbey wall.',
    ],
    scenery: {
      bell: (s) =>
        s.flags.clapperHung
          ? 'The clapper hangs ready. The bell seems to be holding its breath.'
          : 'Green bronze, cast with a band of waves and the words PULSA ET DORMIENT. Without a clapper it is only a great deal of metal.',
      hook: (s) => (s.flags.clapperHung ? 'The clapper hangs from it.' : 'A stout iron hook, made for a heavy loop.'),
      'figures|fields|valley|dead|people':
        'Men, women, children. Some of them are still in their shrouds. You know the shape of some of them. You know the way some of them stand.',
      'arches|arch|moon': 'The wind comes through the arches hard enough to make your eyes water. The moon watches.',
    },
  },

  crypt: {
    id: 'crypt',
    name: 'Crypt',
    dark: true,
    peril: {
      exit: 'cloister',
      text:
        'You grope down the steps into absolute darkness. Something whispers your name — the one only ' +
        'your mother used — and a cold hand closes around your ankle. You tear free and scramble back up ' +
        'into the cloister, sobbing for breath.',
    },
    description:
      'A low vault of damp stone, its ceiling furred with roots. Stone coffins line the walls; several ' +
      'lids have been pushed aside from within, and the floor between them is tacky and black. In a niche ' +
      'at the far end sits the abbot, or what is left of him, still in his vestments. He has eaten his own ' +
      'fingers down to the second knuckle. His jaw hangs open as if he is about to tell you something. Steps lead up.',
    exits: { up: 'cloister', east: 'cloister' },
    scenery: {
      'coffins|coffin|lids|lid': 'Empty. All of the open ones are empty.',
      'abbot|skeleton|bones|vestments|jaw': (s) =>
        s.items.clapper === 'crypt'
          ? 'His bony hands are folded around something heavy and bronze in his lap. His eye sockets are on you. They were on the steps a moment ago.'
          : 'His hands lie open and empty now. His head is turned toward the steps, as though listening for you to come back.',
      roots: 'The orchard is overhead. The roots have grown down into the coffins, and through what is in them.',
    },
  },

  shore: {
    id: 'shore',
    name: 'The Strand',
    description:
      'A long crescent of gray sand curves away beneath the cliffs. Dead fish lie along the tideline in ' +
      'their hundreds, silver bellies turned up to the moon. A tarred fishing hut stands on stilts to the ' +
      'north, and black rocks shelve into the sea to the east. The road back to the crossroads runs west.',
    exits: { north: 'ferryhut', east: 'tidepools', west: 'crossroads' },
    ambience: [
      'Out on the water, a bell that is not there tolls once.',
      'The waves go quiet all together, as if listening, and then come back.',
    ],
    scenery: {
      'sea|water|waves': 'Black and restless. Far out, something pale bobs on the swell, like a face looking up.',
      'fish|tideline': 'Every one of them has its eyes open.',
      cliffs: 'Sheer and black. No birds nest there now.',
      hut: 'Weathered and tarred black. Its door hangs open.',
    },
  },

  ferryhut: {
    id: 'ferryhut',
    name: "Fisherman's Hut",
    description: (s) =>
      'The fisherman is still here. He sits in his chair by the cold stove with his chin on his chest, and ' +
      'the black swellings at his neck have split and wept down his shirt. The smell is very bad. ' +
      (s.flags.wenMet
        ? 'Wen Kard sits on the floor beside him, red beard and green coat, holding the dead man’s hand. '
        : 'On the floor beside him, holding the dead man’s hand, sits a big red-bearded man in a filthy green coat. He is alive. ') +
      'Torn nets hang from the rafters. The door opens south onto the strand.',
    exits: { south: 'shore' },
    ambience: [
      'Wen is humming something filthy under his breath, very softly, to Tom.',
      'Wen tells Tom a joke. Tom does not laugh. Wen laughs for both of them, and then stops.',
      'Tom’s chair creaks. Wen squeezes his hand hard and says, “Don’t you fucking dare.”',
    ],
    scenery: {
      'wen|kard|player|man|him|coat|beard|hair|earring': (s) =>
        s.flags.wenMet
          ? 'Wen Kard, and God help you, he is beautiful: copper-red hair falling past his shoulders, a massive ' +
            'scruffy beard the color of a fox in autumn, a gold hoop in one ear, and eyes red-rimmed from weeping. ' +
            'His player’s coat of green and gold has gone black at the cuffs. You could TALK to him, ' +
            'or ASK WEN ABOUT something.'
          : 'A big man, red-haired and beautiful even like this, with a massive scruffy beard the color of a fox in ' +
            'autumn and a gold hoop in one ear. His player’s coat of green and gold has gone filthy. He is holding ' +
            'the dead man’s hand as if it might still hold back. You could TALK to him.',
      'tom|fisherman|body|corpse|chair':
        'Plague. Weeks dead. The swellings have burst and the flies have been at the wet. His eyes are open. You would swear they were closed when you came in.',
      'nets|net': 'Rotten. They would not hold a sprat.',
      oar: 'Split along its length. Useless.',
      stove: 'Cold. It has been cold a long while.',
    },
  },

  tidepools: {
    id: 'tidepools',
    name: 'Rock Pools',
    description: (s) =>
      'Black rocks shelve down into the sea, cupping pools of clear, cold water. In the largest pool lies ' +
      'a drowned man, face down, his hair moving like weed. ' +
      (s.flags.handOpened
        ? 'His hand lies open now. His face is turned toward you.'
        : 'One fist is clenched tight around something that glints.') +
      ' The strand is west.',
    exits: { west: 'shore' },
    ambience: ['A wave washes over the drowned man, and when it draws back his fingers have moved.'],
    scenery: {
      'man|drowned|body|corpse|hand|fist|fingers': (s) =>
        s.flags.handOpened
          ? 'His hand lies open, palm up, as if asking for something back. You did not move his head. Somebody did.'
          : 'A sailor, by his clothes, and not long in the water. The crabs have had the soft parts of his face. ' +
            'Something gold shows between his clenched fingers. You could try to open his hand.',
      'pools|pool|rocks|rock|water': 'Clear as glass, and cold enough to ache.',
    },
  },

  stones: {
    id: 'stones',
    name: 'The Nine Maidens',
    description: (s) =>
      'Nine standing stones crown the windswept hilltop, leaning inward like mourners at a graveside. Folk ' +
      'say they were girls who danced on a holy day and were turned to stone for it. ' +
      (s.flags.childFed
        ? 'The ring is empty now, except for the wind. '
        : 'In the center of the ring sits a small figure in a gray hood, her back to you, humming a song you knew as a child. ') +
      'The crossroads lie east, down the slope.',
    exits: { east: 'crossroads' },
    ambience: ['The humming stops. Then it starts again, closer behind you than the girl is.'],
    scenery: {
      'stones|stone|maidens': 'The stones are warm to the touch, like a sleeper’s back.',
      'girl|child|figure|hood|ghost': (s) =>
        s.flags.childFed
          ? 'There is no one here. In the frost where she sat there is no mark at all.'
          : 'A girl of six or seven, barefoot in the frost. When she turns her head, her face is the gray of old ' +
            'candle wax and her eyes are the wrong kind of dark. “It’s Hallows,” she says. ' +
            '“Nobody left anything out for me.”',
      heather: 'Dead and gray and full of wind.',
    },
  },
};

export const ITEMS: Record<string, Item> = {
  lantern: {
    id: 'lantern',
    name: 'brass lantern',
    nouns: ['brass lantern', 'lantern', 'lamp', 'light'],
    start: 'cottage',
    description: (s) =>
      s.flags.lanternLit
        ? 'Your father’s brass lantern, burning with a small, brave flame.'
        : 'Your father’s brass lantern. There is oil in it, and a tinderbox clipped to the side. It is unlit.',
  },
  note: {
    id: 'note',
    name: 'monk’s letter',
    nouns: ['monks letter', 'letter', 'note', 'paper'],
    start: 'cottage',
    description: 'A sheet of vellum, folded small. It was nailed to the inside of your door. Something is written on it.',
    readable: LETTER_TEXT,
  },
  cake: {
    id: 'cake',
    name: 'soul cake',
    nouns: ['soul cake', 'cake', 'bread', 'soulcake'],
    start: 'cottage',
    description:
      'A round of spiced bread marked with a cross, the kind left out for the dead on All Hallows’ Eve. ' +
      'Your mother baked them every year. It is still warm.',
  },
  rope: {
    id: 'rope',
    name: 'coil of rope',
    nouns: ['coil of rope', 'rope', 'coil'],
    start: 'nowhere',
    description:
      'Tarred hemp, thick as your thumb and long enough for most things. One end was already tied in a noose. You have picked the knot out.',
  },
  key: {
    id: 'key',
    name: 'iron key',
    nouns: ['iron key', 'key'],
    start: 'wellbottom',
    description: 'A heavy iron key as long as your hand, its bow shaped like a little bell. It is very cold.',
  },
  clapper: {
    id: 'clapper',
    name: 'bronze clapper',
    nouns: ['bronze clapper', 'clapper'],
    start: 'crypt',
    description:
      'A teardrop of bronze as long as your forearm, with an iron loop at the top. It is very heavy, and the abbot’s grip has left marks in the verdigris.',
  },
  candlestick: {
    id: 'candlestick',
    name: 'silver candlestick',
    nouns: ['silver candlestick', 'candlestick', 'candle', 'silver'],
    start: 'chapel',
    treasure: 10,
    description: 'Tarnished silver, finely worked with lilies and bells. Worth a small fortune, to anyone still alive to buy it.',
  },
  reliquary: {
    id: 'reliquary',
    name: 'gold reliquary',
    nouns: ['gold reliquary', 'reliquary', 'gold', 'relic'],
    start: 'nowhere',
    treasure: 10,
    description:
      'A gold reliquary no bigger than your thumb, with a crystal window. Inside is a sliver of bone. St. Audra’s, perhaps. It is warm, the way the cake was warm.',
  },
  ring: {
    id: 'ring',
    name: 'silver ring',
    nouns: ['silver ring', 'ring'],
    start: 'nowhere',
    treasure: 10,
    description: 'A woman’s silver ring, far too big for a child. Inside the band someone has engraved a name: MAUD.',
  },
};

export function initialState(): State {
  const items: State['items'] = {};
  for (const item of Object.values(ITEMS)) items[item.id] = item.start;
  return {
    room: START_ROOM,
    items,
    flags: {},
    visited: [],
    awarded: [],
    score: 0,
    moves: 0,
    won: false,
  };
}
