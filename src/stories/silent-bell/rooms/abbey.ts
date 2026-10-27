import type { Room } from '../../../engine/types';

export const ABBEY: Record<string, Room> = {
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
    enter: 'north',
    guards: {
      north: (s) => (s.flags.gateOpen ? null : 'The iron gate is locked.'),
    },
    ambience: ['The rosaries rattle all at once, like teeth, and then hang still.'],
    senses: { smell: 'Rust and frost and beeswax.', listen: 'The rosaries click against the iron.' },
    acts: { knock: 'You rap on the gate. The rosaries click in reply.' },
    scenery: {
      'gate|bars|iron gate': {
        look: (s) =>
          s.flags.gateOpen
            ? 'The gate hangs open. The rosaries nearest the lock have snapped and scattered their beads.'
            : 'Old iron, still strong. Whoever locked it was more afraid of what was inside than out.',
        on: {
          touch: 'The iron burns with cold. The rosaries stir against your knuckles like small fingers.',
          shake: (s) =>
            s.flags.gateOpen
              ? 'It hangs open and stays that way.'
              : 'You rattle the gate. It does not give. Every rosary on it rattles back at you.',
          pull: (s) => (s.flags.gateOpen ? 'It is open as far as it goes.' : 'Locked. It does not give an inch.'),
          listen: 'Click. Click. The beads, talking among themselves.',
          smell: 'Rust and beeswax.',
        },
      },
      lock: (s) => (s.flags.gateOpen ? 'The lock hangs open.' : 'A big iron lock with a big iron keyhole.'),
      'rosaries|rosary|beads': {
        look: 'Wooden beads, bone beads, one of cheap glass. Every family in the village, by the look of it.',
        on: {
          touch: 'The beads are warm. All of them. As if they have only just been let go of.',
          listen: 'Click, click, like a hundred people praying very fast under their breath.',
          taste: 'You put a bone bead in your mouth. It tastes of bone. Of course it does.',
          pull: 'You tug a rosary. It snaps, and the beads scatter in the frost and roll, every one of them, toward the gate.',
        },
      },
      'wall|walls': {
        look: 'Too high and too smooth to climb.',
        on: { touch: 'Cold dressed stone. Not a handhold anywhere.' },
      },
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
    enter: 'north',
    ambience: [
      'One of the grave mounds shifts, just slightly, as you pass it.',
      'From the crypt steps comes the smell of incense, which is worse, somehow, than the smell of rot.',
    ],
    senses: { smell: 'Lime, earth, and incense from the crypt steps.', listen: 'Somewhere among the graves, earth sliding softly onto earth.' },
    acts: {
      pray: 'You pray over the nearest mound. The earth stops moving, for a while.',
      dig: 'You scrape at a mound with your fingers. The earth is loose and warm, and a moment later something underneath scrapes back. You stop.',
    },
    scenery: {
      'mounds|mound|graves|grave|earth': {
        look: 'The earth on three of the mounds has been pushed up and outward, the way earth moves when a mole comes up. Moles are not this large.',
        on: {
          smell: 'Turned earth, lime, and the thick sweet smell of the summer’s dead.',
          touch: 'The earth is loose, and warm, and it moves under your palm, very slightly, like something breathing underneath.',
          taste: 'You are not eating grave dirt. Not yet.',
          hit: 'You kick a mound. Something under it kicks back.',
          listen:
            'You press your ear to a mound before you can stop yourself. Underneath: a scratching, patient and slow, ' +
            'like someone writing a very long letter.',
        },
      },
      'crosses|cross|sticks': {
        look: 'Twine and kindling. Some have fallen. Some have been pulled out.',
        on: {
          pull: 'You pull a cross out of the ground. Underneath, the earth is warm. You put it back, carefully, and say sorry.',
          touch: 'Kindling and twine. Someone tied these knots with shaking hands.',
        },
      },
      fountain: {
        look: 'A stone basin carved with fish. It is full of dead leaves and, at the bottom, a single child’s shoe.',
        on: {
          touch: 'Dry stone and dead leaves. The little shoe is damp, though nothing else is.',
          smell: 'Leaf mould.',
          listen: 'Nothing. Then, from the bottom of the dry basin, a small child’s breathing.',
        },
      },
      'arches|arch': 'The ivy on them has died back, and what is left looks like veins.',
      'steps|stairs': {
        look: 'They lead down into a blackness that seems to swallow light.',
        on: {
          smell: 'Incense, and rot under the incense.',
          listen: 'From below: someone praying, very slowly, in a voice that has forgotten how.',
          touch: 'Worn smooth, and wet, though it has not rained.',
        },
      },
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
    senses: { smell: 'Tallow, old incense and the dead. Very much the dead.', listen: 'Breathing. You are fairly sure some of it is yours.' },
    acts: {
      dance: 'You dance among the dead. Under one shroud, something taps a foot in time.',
      sing: 'Your voice rings off the stones. The dead in the pews are very quiet, the way an audience is quiet.',
      pray: 'You kneel at the altar. The scratched bell is warm under your folded hands. Pulsa et dormient, you think. Ring, and they will sleep.',
      curse: 'You swear in a chapel full of dead monks. The silence afterwards is very pointed.',
      fart: 'It echoes off the vaulting for an appalling length of time.',
    },
    scenery: {
      altar: {
        look: 'Pale stone. Someone has scratched a little bell into its side, and beneath it: PULSA ET DORMIENT. Ring, and they will sleep.',
        on: {
          touch: 'The stone is cold, except for the little scratched bell, which is warm.',
          smell: 'Old wax.',
          push: 'It weighs more than the whole village.',
        },
      },
      'window|glass': {
        look: 'What remains shows St. Audra holding a bell above the waves. Someone has scratched out her eyes.',
        on: {
          touch: 'You reach up and touch an edge of colored glass. It cuts you very neatly, and you swear.',
          break: 'There is not much left to break, and through what there is, St. Audra is still watching.',
        },
      },
      'pews|pew|dead|shrouds|shroud|bodies': {
        look:
          'You lift one shroud, and wish you had not: the plague has burst him open at the groin and the armpit, and ' +
          'something has been feeding at the wounds. Under another shroud, very faintly, the cloth is rising and falling. ' +
          'You decide that you imagined it.',
        person: true,
        on: {
          smell: 'You breathe in once, and then breathe through your mouth for as long as you stay in here.',
          touch: 'The shroud is warm under your fingers. The body under the shroud is cold. You would rather it were the other way round.',
          listen: 'Breathing. Slow, many-throated, and all in time.',
          taste: 'Absolutely not.',
        },
      },
      'candles|tallow|stubs': {
        look: 'Burned out days ago.',
        on: {
          smell: 'Mutton fat.',
          taste: 'Tallow. Like eating a cold dinner off a dead man’s plate.',
          touch: 'Hard, cold tallow.',
        },
      },
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
    senses: { smell: 'Cold stone and pigeon lime.', listen: 'Wind, moaning down the stair from the belfry.' },
    scenery: {
      'stair|stairs|steps': {
        look: 'Up and up and up.',
        on: {
          touch: 'Each step is worn into a bowl. Thousands of feet, and none of them going up tonight but yours.',
          listen: 'Your own heartbeat, and above it, the wind in the bell.',
        },
      },
      'writing|scratches|wall|words': {
        look: 'NON DORMIUNT. NON DORMIUNT. NON DORMIUNT. They do not sleep. Anselm’s hand, you think, near the end.',
        on: { touch: 'The letters are cut deep. Whatever he used, it was not a knife. There is a fingernail still lodged in the N.' },
      },
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
    senses: { smell: 'Wind, bronze and, from the fields, faintly, the grave.', listen: 'The wind in the bell’s mouth makes a low, unhappy note.' },
    acts: {
      jump: 'You look over the edge at the long drop and the waiting figures, and step back. Not like that. Not tonight.',
      dance: 'You dance on the windy platform. Down in the fields, the figures sway, very slightly, all together.',
      shout: 'You scream into the wind. Down in the fields, every face turns up toward you at once.',
      sit: 'You sit with your back against the bell. It is humming, very faintly, through your spine.',
      wave: 'You wave at the figures in the fields. A few of them, slowly, raise their hands.',
    },
    throwTargets: [
      {
        match: /\b(off|over|out|down|arch|arches|edge|fields|figures|valley|tower)\b/,
        to: 'cloister',
        text:
          'You fling the {item} out through the arches. It tumbles a long way and lands somewhere in the ' +
          'cloister graveyard. Down in the fields, a few of the figures turn their heads to watch it fall.',
      },
    ],
    scenery: {
      bell: {
        look: (s) =>
          s.flags.clapperHung
            ? 'The clapper hangs ready. The bell seems to be holding its breath.'
            : 'Green bronze, cast with a band of waves and the words PULSA ET DORMIENT. Without a clapper it is only a great deal of metal.',
        on: {
          take: 'Ha.',
          smell: 'Verdigris and old rain.',
          taste: 'You lick the bronze. It tastes of pennies and thunder.',
          touch: (s) =>
            s.flags.clapperHung
              ? 'It thrums under your palm, waiting.'
              : 'Cold bronze. Lay your palm flat on it and you can feel it, very faintly, humming the note it cannot make.',
          listen: 'Put your ear to the bronze and you hear the sea: the band of waves cast around its rim, singing to itself.',
          polish: 'You rub away a patch of green with your sleeve. Underneath, the bronze is the color of a sunrise.',
          hit: (s) =>
            s.flags.clapperHung
              ? 'You kick it. It sways, and the clapper swings, and almost, almost touches. You could RING it properly.'
              : 'Your foot meets bronze with a dull clonk. Your toes will remember this.',
        },
      },
      hook: {
        look: (s) => (s.flags.clapperHung ? 'The clapper hangs from it.' : 'A stout iron hook, made for a heavy loop.'),
        on: { pull: 'Solid iron, sunk deep. It will take the weight.' },
      },
      'figures|fields|valley|dead|people': {
        look: 'Men, women, children. Some of them are still in their shrouds. You know the shape of some of them. You know the way some of them stand.',
        person: true,
        on: {
          listen: 'Silence. Hundreds of people, and not one of them breathing.',
          smell: 'Even up here, on the wind: the fields, and what is standing in them.',
        },
      },
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
    senses: { smell: 'Incense, damp, and the coppery smell of the floor.', listen: 'Dripping. Scraping. The abbot’s breath.' },
    acts: {
      sing: 'You start a hymn. The abbot’s jaw moves along with you, silently, one word ahead.',
      pray: 'You begin the Pater Noster. Behind you a dry voice joins in, saying the words backwards.',
      shout: 'Your scream fills the vault. When it stops, the abbot is a little closer to the steps than he was.',
    },
    scenery: {
      'coffins|coffin|lids|lid': {
        look: 'Empty. All of the open ones are empty.',
        on: {
          touch: 'The stone lids are scratched. On the inside.',
          listen: 'Something in the closed coffins is shifting, slowly, to get comfortable.',
        },
      },
      'abbot|skeleton|bones|vestments|jaw': {
        look: (s) =>
          s.items.clapper === 'crypt'
            ? 'His bony hands are folded around something heavy and bronze in his lap. His eye sockets are on you. They were on the steps a moment ago.'
            : 'His hands lie open and empty now. His head is turned toward the steps, as though listening for you to come back.',
        person: true,
        talk: { fallback: 'The abbot’s jaw works, once, wetly. You decide not to wait for the rest of the sentence.' },
        on: {
          smell: 'Incense, rot, and something sharp and coppery.',
          touch: 'You touch his sleeve. Under the cloth, the arm tenses.',
          taste: 'No. No. No.',
          hit: 'You strike him. His head lolls, and rolls back to face you, and his jaw works as if to say: again.',
          listen: 'Breath whistles through what is left of his teeth. He has no lungs. You hear it anyway.',
        },
      },
      roots: {
        look: 'The orchard is overhead. The roots have grown down into the coffins, and through what is in them.',
        on: {
          taste: 'Bitter and earthy, pale and soft as fingers. You spit them out.',
          touch: 'Cold and soft, and they move under your fingers like a hand closing.',
        },
      },
    },
  },
};
