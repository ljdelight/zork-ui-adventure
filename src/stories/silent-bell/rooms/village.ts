import type { Room, State } from '../../../engine/types';

/** Text for Maud, who is only there until she has been fed. */
const maud = (text: string) => (s: State) =>
  s.flags.childFed ? 'There is no one here now. Only the frost, and the wind.' : text;

export const VILLAGE: Record<string, Room> = {
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
    senses: {
      smell: 'Peat smoke, lye, lavender. Under it, faint and stubborn, the sweet rot of the summer.',
      listen: 'The coals tick. The wind fingers the thatch.',
    },
    acts: {
      jump: 'You jump. The floorboards boom. Under them, something knocks twice in reply.',
      sleep: 'You lie down on the bare boards. On the next bed, something lies down too, with a long sigh. You get up.',
      knock: 'You knock on the inside of your own door. From outside, someone knocks back, politely, three times.',
    },
    scenery: {
      'fire|hearth|coals|fireplace': {
        look: 'Embers, mostly. They give more smoke than warmth.',
        on: {
          smell: 'Peat smoke and the last of the apple wood.',
          touch: 'You hold your hands over the coals. Warmth, thin and grudging. Then the coals hiss, as though someone has spat on them.',
          taste: 'You are not licking a fire. You have that much sense left.',
          listen: 'The coals tick and settle. Under that, if you listen, a soft sound like someone breathing through their nose.',
          hit: 'You kick the coals. Sparks fly up the chimney, and for a moment you see a face in them.',
        },
      },
      'table|cloth': {
        look: 'Scrubbed oak and a cloth you last saw folded in your mother’s chest. You buried her in August.',
        on: {
          smell: 'Lye soap and lavender. The cloth smells of her chest.',
          touch: 'The cloth is warm in one place, as if someone has just been resting their hand on it.',
          hit: 'You bang a fist on the table. The cloth does not move. It should have.',
          pull: 'You tug the cloth. It will not come; it is as though someone is holding the other end.',
        },
      },
      'window|shutter|shutters': {
        look: 'Barred from the inside. You barred it. You are almost sure you barred it.',
        on: {
          listen: 'Nothing. Then three taps. Then nothing.',
          touch: 'The shutter bar is cold. On the other side of the wood something presses, gently, and lets go.',
          pull: 'You take hold of the bar, and then you leave it exactly where it is.',
        },
      },
      'door|cross|chalk': {
        look: 'The priest chalked the cross there in the summer, when the sickness came into the house. It has not rained since, and it has not faded.',
        on: {
          smell: 'Chalk dust.',
          touch: 'The chalk cross is dry, but your fingers come away clean.',
          listen: 'You put your ear to the door. On the other side, someone else has their ear to it too.',
        },
      },
      'beds|bed|boards': {
        look: 'Four beds. Only you to sleep in them.',
        on: { smell: 'Sour straw, though the straw is long gone.', touch: 'Bare boards, cold. Except one, which is warm.' },
      },
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
    enter: 'south',
    ambience: [
      'The gibbet chain creaks, though the air is perfectly still.',
      'Behind you, a single footstep on the road. When you turn, the road is empty.',
      'A dog howls somewhere off in the dark, and then stops very suddenly.',
    ],
    senses: { smell: 'Frost, pitch and the gibbet. Mostly the gibbet.', listen: 'The gibbet chain creaks. Far off, surf.' },
    scenery: {
      'signpost|sign|post|arms': {
        look:
          'NORTH — ST. AUDRA’S. EAST — THE STRAND. WEST — THE NINE MAIDENS. ' +
          'Someone has nailed on a fourth arm, pointing straight down, and burned into it a single word: HERE.',
        on: {
          touch: 'The burned word HERE is warm, as if the brand was set to it tonight.',
          smell: 'Charred wood.',
          turn: 'You twist the downward arm to point at the road. When you look back, it points down again.',
        },
      },
      'gibbet|cage|body|corpse|thief|chain': {
        look:
          'What is left of him still wears a board around its neck: THIEF. The crows took his eyes and his lips first, ' +
          'so he grins at everything. Something has been at him since the crows, something with flat teeth, and recently. ' +
          'His head is turned toward the village, the way a dog waits for its master.',
        person: true,
        on: {
          smell: 'You get close enough to smell him, and wish you hadn’t: pitch and rot and, sweetly, crow.',
          touch: 'You reach up and touch the cage. Very slowly, the thief’s head turns toward your hand. You let go.',
          listen: 'Chain. Creak. Chain. Then something like a sigh, from inside the cage.',
          push: 'The cage swings, and the thief nods at you, and keeps on nodding long after it should have stopped.',
          shake: 'The cage swings, and the thief nods at you, and keeps on nodding long after it should have stopped.',
          hit: 'You kick the gibbet post. The cage jerks, and the thief’s grin bobs up and down at you, approving.',
          taste: 'No. Some things are beyond even tonight.',
        },
      },
      'abbey|tower': 'The belfry is open to the sky. No light up there. No sound.',
      moon: {
        look: 'Too large, too low and too orange. It looks like an eye that has been crying.',
        on: {
          touch: 'You hold up your thumb and hide the moon behind it. When you take your thumb away, it seems a little closer.',
          listen: 'The moon makes no sound. Tonight that feels deliberate.',
        },
      },
      'road|roads|track|path': {
        look: 'Frozen ruts. Nobody has come this way since the dying started.',
        on: { touch: 'Frozen as hard as iron.', smell: 'Frost, and old dung, and nobody.' },
      },
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
    senses: {
      smell: 'Rotten apples and wet earth and, from the turnip, candle smoke.',
      listen: 'Now and then an apple drops. Nothing else moves. Something does anyway.',
    },
    scenery: {
      'turnip|face|jack|candle|post': {
        look: 'Carved to frighten off the wandering dead on Hallows’ Eve. Its candle should have burned out hours ago. It hasn’t.',
        on: {
          smell: 'Hot turnip and candle smoke: the smell of every Hallows of your childhood.',
          taste: 'Raw turnip, bitter and cold. It tasted better when you were small.',
          touch: 'The skin is warm. The candle inside must be hotter than any candle has a right to be.',
          hit: 'You draw back your foot, and the turnip’s grin seems to widen. You put your foot down again.',
          listen: 'The candle gutters. It sounds, faintly, like someone trying not to laugh.',
          turn: 'You turn its face away from the road. A moment later, without a sound, it is grinning at you again.',
        },
      },
      'trees|tree|branches|apples|apple|fruit': {
        look: 'Black, bare and very still. The fog moves through them. They do not move at all.',
        on: {
          touch: 'The bark is cold and damp and gives under your thumb like old bread.',
          smell: 'Rotten apples, cider-sweet.',
          taste: 'You pull a rotted apple off a branch and bite. Worm, and something worse than worm. You spit.',
          shake: 'You shake a branch. A dozen black apples fall, and not one of them makes a sound when it lands.',
          listen: 'The branches do not creak. Trees should creak.',
        },
      },
      'grass|frost|footprints': {
        look: 'There are footprints in the frost, leading from the trees toward your cottage. Bare feet.',
        on: { touch: 'The frost crunches. The footprints are colder than the frost around them.', smell: 'Frost and rot.' },
      },
      'fog|mist': {
        look: 'It hangs at waist height, and it is thicker where you are not looking.',
        on: {
          touch: 'Your hand vanishes into it to the wrist. Something in there brushes your fingers, softly, and you pull back.',
          taste: 'Wet and cold and faintly sweet, like somebody else’s breath.',
          smell: 'Earth. Freshly turned earth.',
        },
      },
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
    enter: 'down',
    guards: {
      down: (s) => (s.flags.ropeTied ? null : 'The shaft is far too deep and slick to climb down unaided.'),
    },
    ambience: ['From far down the shaft comes a sound like someone humming with their mouth full of water.'],
    senses: { smell: 'Wet stone and grave flowers.', listen: 'Humming, from far down the shaft.' },
    acts: {
      jump: 'You look down the shaft. No. There are easier ways to the bottom, and better ones.',
      sing: 'You sing into the well. The humming below stops, and then, very sweetly, it sings your song back up to you.',
      shout: 'Your shout drops down the shaft. A moment later it comes back up, in a voice that is not yours.',
      spit: 'You spit down the well. Long after it should have landed, something below spits back.',
      piss: 'You consider it. The humming down the shaft goes very quiet, as though waiting to see if you dare. You don’t.',
    },
    throwTargets: [
      {
        match: /\b(well|shaft|down|hole)\b/,
        to: 'wellbottom',
        text: (item) =>
          `You drop the ${item.name} into the well. A long, long moment later: a flat splash.` +
          (item.id === 'key' ? ' Brother Anselm would be pleased. You are not.' : ''),
      },
    ],
    scenery: {
      'well|shaft|stones': {
        look: 'You drop a pebble in. A long moment later: a flat splash. Then, a moment after that, a second splash, as if something below had thrown it back.',
        on: {
          smell: 'Wet stone, and flowers, and under the flowers, whatever flowers are put there to cover.',
          listen: 'Humming. A long way down, someone is humming with their mouth full of water.',
          touch: 'The stones are slick with frost. One is warm, as though someone has just stood up from it.',
          taste: 'You lick a frosty stone. Your tongue sticks for one awful moment, and comes away bleeding.',
        },
      },
      'crossbeam|beam|oak': {
        look: 'Solid oak, black with age. It would bear a person’s weight.',
        on: { touch: 'Black oak, hard as stone.', pull: 'You hang your weight from it. It does not so much as creak.' },
      },
      rope: {
        look: (s) =>
          s.flags.ropeTied ? 'Knotted firmly around the crossbeam. It looks like it will hold.' : 'There is no rope here.',
        on: { pull: (s) => (s.flags.ropeTied ? 'You give it a hard tug. The knot holds.' : 'There is no rope here.') },
      },
    },
  },

  wellbottom: {
    id: 'wellbottom',
    name: 'Bottom of the Well',
    dark: true,
    darkText:
      'It is pitch dark. Water drips somewhere close by, and the cold soaks through your boots. ' +
      'You can feel the rope swaying beside you.',
    description:
      'You stand ankle-deep in black water at the bottom of the shaft. The walls sweat and drip. Bones ' +
      'lie half-sunk in the silt: someone else came down here looking for the key, long ago, and never ' +
      'climbed back up. Far above, a coin of orange sky. The rope dangles beside you, leading up.',
    exits: { up: 'well' },
    senses: {
      smell: 'Stagnant water and old bone.',
      listen: 'Drips. Your own breath, too loud. Very far above, the wind.',
      touch:
        'You feel about you: slick wall, the swaying rope, water to the ankle, and something under the silt that ' +
        'might be a stick and is not.',
    },
    acts: {
      jump: 'You jump, and splash, and the humming far above stops. Then it starts again.',
      swim: 'You are already in up to your ankles, which is quite enough.',
      dig: 'You grope in the silt. Bones, mostly.',
    },
    scenery: {
      'water|silt': {
        look: 'Bitterly cold. Something that is not your foot moves in it, once, and is still.',
        on: {
          touch: 'It is cold enough to stop a heart. Something brushes your ankle, unhurried.',
          taste: 'Iron and silt and something like a funeral. You spit.',
          smell: 'Stagnant, sweet, and wrong.',
          listen: 'Drip. Drip. Drip. And once, very close, a small splash that was not a drip.',
        },
      },
      'bones|skull|bone': {
        look: 'A grown man, by the size of him. His fingers are worn to the knuckle where he tried to climb.',
        person: true,
        on: {
          touch: 'The skull is smooth under your fingers. The jaw moves when you touch it. It is only loose. It is only loose.',
          smell: 'Nothing. They have been down here long enough to stop smelling.',
          hit: 'You kick the skull. It rolls under the water and comes to rest facing you.',
        },
      },
      'walls|wall': {
        look: 'Slick stone. There are scratches in it, as high as a man can reach.',
        on: { touch: 'Slick and cold and scored with scratches: fingernail scratches, as high as a man can reach.' },
      },
      rope: {
        look: 'Your rope, leading back up to the world.',
        on: { pull: 'You give it a tug. Far above, the crossbeam creaks reassuringly.', touch: 'Wet hemp. The way home.' },
      },
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
    senses: { smell: 'Heather, frost and, faintly, warm bread.', listen: 'The wind among the stones, and someone humming.' },
    acts: {
      dance:
        'Folk say these nine were turned to stone for dancing on a holy day. You manage three steps before your ' +
        'feet go cold and heavy as millstones, and you stop very quickly indeed.',
      sing: maud('You hum along with the girl. She stops, tilts her head, and picks up the tune again, one note behind you.'),
    },
    scenery: {
      'stones|stone|maidens': {
        look: 'The stones are warm to the touch, like a sleeper’s back.',
        on: {
          touch: 'Warm, like a sleeper’s back. Under your palm, slow as the seasons, the stone is breathing.',
          smell: 'Lichen and rain.',
          taste: 'Lichen, and faintly, salt, like tears.',
          hit: 'You kick one of the maidens. Your toe complains. She does not; she has suffered worse.',
          listen: 'The wind through the ring makes nine notes, close together, like girls whispering.',
          push: 'She leans a fraction of an inch further in, and stops.',
        },
      },
      'girl|child|figure|hood|ghost|her|maud': {
        look: (s) =>
          s.flags.childFed
            ? 'There is no one here. In the frost where she sat there is no mark at all.'
            : 'A girl of six or seven, barefoot in the frost. When she turns her head, her face is the gray of old ' +
              'candle wax and her eyes are the wrong kind of dark. “It’s Hallows,” she says. ' +
              '“Nobody left anything out for me.”',
        person: true,
        talk: {
          fallback: maud('She hums on, not looking at you. “Nobody left anything out for me,” she says again. “It’s Hallows.”'),
        },
        on: {
          take: 'Your hand passes through her hood like it is fog. It is so cold it burns.',
          touch: maud('Your hand goes through her shoulder into a cold that burns. She does not seem to notice.'),
          smell: maud('Frost and wax and, faintly, bread. She smells like a kitchen on a winter morning.'),
          taste: maud('Absolutely not.'),
          hit: maud('Your hand passes straight through her. She keeps humming. You feel very ashamed.'),
          listen: maud('She is humming “The Holly and the Ivy,” wrong in the same place you always got it wrong.'),
        },
      },
      heather: {
        look: 'Dead and gray and full of wind.',
        on: { smell: 'Dry heather, honey-faint.', touch: 'Brittle, and full of wind.' },
      },
    },
  },
};
