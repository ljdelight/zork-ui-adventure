import type { Item } from '../../engine/types';

const LETTER_TEXT =
  'The letter is in a cramped monk’s hand, and the last lines slope badly, as if the writer was very tired:\n\n' +
  '“To whoever still lives in this village. I am the last of St. Audra’s and I will not see morning. ' +
  'The bell has not rung since the abbot went down into the crypt to pray and came back up wrong. ' +
  'He carried the clapper down with him into the dark, and threw the gate key into the orchard well ' +
  'so that none of us could follow.\n\n' +
  'Tonight is All Hallows. Without the bell, what we buried will not stay buried. ' +
  'Ring it before the night is out. Take a light, and do not go below without one. ' +
  'God keep you, because He has not kept us.\n— Anselm”';

export const ITEMS: Record<string, Item> = {
  lantern: {
    id: 'lantern',
    name: 'brass lantern',
    nouns: ['brass lantern', 'lantern', 'lamp', 'light'],
    start: 'cottage',
    lightSource: true,
    description: (s) =>
      s.flags.lanternLit
        ? 'Your father’s brass lantern, burning with a small, brave flame.'
        : 'Your father’s brass lantern. There is oil in it, and a tinderbox clipped to the side. It is unlit.',
    on: {
      light: 'You strike the tinderbox. The wick catches, and warm gold light blooms inside the glass.',
      extinguish: 'You turn the wick down. The flame shrinks to nothing.',
      open: 'You peer through the little glass door. The wick is trimmed and ready. Try LIGHT LANTERN.',
      smell: 'Hot brass and lamp oil, and under it, very faintly, your father’s pipe tobacco.',
      taste: 'Brass and soot. Your tongue does not thank you.',
      touch: (s) =>
        s.flags.lanternLit
          ? 'The glass is almost too hot to hold. You hold it anyway.'
          : 'Cold brass, dented where your father dropped it at the Martinmas fair.',
      listen: (s) =>
        s.flags.lanternLit ? 'The flame hisses softly: a very small sound against so much dark.' : 'Oil sloshes faintly inside.',
      shake: 'Oil sloshes. Plenty left. The flame, if there is one, ducks and recovers.',
      roll: 'You are not rolling your only light across the frost.',
      hit: 'You give it a smack. The flame shudders, and so do you.',
      break: 'Break your only light? Tonight? You would sooner break your own arm.',
      polish: 'You rub the brass on your sleeve until your own face looks back at you, stretched and yellow. You stop.',
      wear: 'You hang it from your belt for a moment. It scorches your thigh. Back into your hand it goes.',
      burn: 'It is already doing its best.',
      eat: 'You are hungry, but not that hungry.',
    },
  },
  note: {
    id: 'note',
    name: 'monk’s letter',
    nouns: ['monks letter', 'letter', 'note', 'paper', 'vellum'],
    start: 'cottage',
    description: 'A sheet of vellum, folded small. It was nailed to the inside of your door. Something is written on it.',
    readable: LETTER_TEXT,
    on: {
      open: LETTER_TEXT,
      smell: 'Vellum and candle smoke, and the sour sweat of a frightened man.',
      taste: 'Ink, mostly. Iron gall. It makes your teeth ache.',
      touch: 'The vellum is soft as skin. It was skin, of course: a calf’s.',
      listen: 'Paper is quiet. This paper is quieter than most.',
      roll: 'You roll it into a tight little tube and peer through it like a spyglass. The world is still there. Pity.',
      squeeze: 'You crumple it, then smooth it out again, guiltily.',
      break: 'You start to tear it, and stop. He died writing this.',
      throw: 'The letter flutters to the ground like a dropped leaf.',
      eat: 'You tear off a corner and chew it. It tastes of iron gall and despair. You spit it out.',
    },
  },
  cake: {
    id: 'cake',
    name: 'soul cake',
    nouns: ['soul cake', 'cake', 'bread', 'soulcake'],
    start: 'cottage',
    description:
      'A round of spiced bread marked with a cross, the kind left out for the dead on All Hallows’ Eve. ' +
      'Your mother baked them every year. It is still warm.',
    on: {
      eat: 'You raise it to your mouth, and stop. It is not for the living. Your mother taught you that much.',
      smell: 'Clove and nutmeg and burnt sugar, exactly like your mother’s. Your eyes sting.',
      taste: 'You touch your tongue to it, quickly, guiltily. Sweet. You are not allowed any more than that.',
      touch: 'Still warm, though the hearth is nearly dead and it has been sitting out all evening.',
      listen:
        'You hold it to your ear like a fool. Very faintly, from somewhere inside it, you think you hear your ' +
        'mother humming. You lower it, quickly.',
      shake: 'A few crumbs fall. Where they land, the frost melts.',
      roll: 'It rolls a short way on its edge, wobbles, and falls over cross-side up. Your mother would have called that luck. You pick it up again.',
      squeeze: 'It gives like a living thing, and springs back.',
      break: 'You will not break a soul cake. That is for the dead to do.',
      throw: 'You lob the soul cake. It lands cross-side up, which is something.',
    },
  },
  rope: {
    id: 'rope',
    name: 'coil of rope',
    nouns: ['coil of rope', 'rope', 'coil'],
    start: 'nowhere',
    description:
      'Tarred hemp, thick as your thumb and long enough for most things. One end was already tied in a noose. You have picked the knot out.',
    on: {
      smell: 'Tar and salt and Tom’s pipe. And Wen’s sweat, where he gripped it.',
      taste: 'Tar. Horrible. Your mouth will taste of boats until Candlemas.',
      touch: 'Rough hemp. Your fingers find the kink where the noose was, and slide away from it.',
      pull: 'You test it between your fists. It would hold a grown man. That was the idea.',
      shake: 'It snakes and slaps against the ground.',
      roll: 'You coil it neatly, sailor-fashion, the way your father showed you.',
      wear: 'You loop it over your head without thinking, and then you think, and take it off very fast.',
      break: 'Tarred hemp, thick as your thumb. It would outlast you.',
      burn: 'Tar catches easily. You snatch it away from the flame before it does.',
    },
  },
  key: {
    id: 'key',
    name: 'iron key',
    nouns: ['iron key', 'key'],
    start: 'wellbottom',
    points: 10,
    firstTake: 'You fish about in the freezing water and come up with the iron key. Taken.',
    description: 'A heavy iron key as long as your hand, its bow shaped like a little bell. It is very cold.',
    on: {
      smell: 'Rust and pond water.',
      taste: 'Cold iron and well water, and something dead.',
      touch: 'So cold it hurts. It does not warm at all in your hand.',
      listen: 'Held to your ear it sounds like the inside of a shell: far-off water, and someone breathing.',
      shake: 'The little bell shaped into its bow does not ring. It has no clapper either.',
      turn: 'You turn it in the empty air. Somewhere a long way off, a lock you cannot see goes click.',
      break: 'Iron as thick as your thumb. No.',
    },
  },
  clapper: {
    id: 'clapper',
    name: 'bronze clapper',
    nouns: ['bronze clapper', 'clapper'],
    start: 'crypt',
    points: 10,
    firstTake:
      "You ease the clapper out of the abbot's grip. As it comes free, his head turns, slowly, " +
      'to follow your hands. Then it stops, as if it has lost interest. You do not breathe again ' +
      'until you are sure. Taken.',
    description:
      'A teardrop of bronze as long as your forearm, with an iron loop at the top. It is very heavy, and the abbot’s grip has left marks in the verdigris.',
    on: {
      smell: 'Verdigris and incense. And the abbot. Mostly the abbot.',
      taste: 'You lick the bronze. It tastes of pennies and of a dead man’s palms. You spit for a long time.',
      touch: 'The abbot’s finger marks are pressed into the green crust. Yours fit inside them, almost.',
      listen: 'It hums against your ear, very faintly, like a held breath.',
      hit: 'You rap it with your knuckles. A low note comes out of it: the ghost of what it could be.',
      roll: 'You set it down and it rolls in a slow, lopsided circle and stops pointing at the tower. You pick it back up.',
      shake: 'It is far too heavy to shake, and heavy things do not like being swung about in the dark.',
      throw: 'You heave the clapper a yard or two. It lands with a deep, dull thud, like a church door shutting.',
    },
  },
  candlestick: {
    id: 'candlestick',
    name: 'silver candlestick',
    nouns: ['silver candlestick', 'candlestick', 'candle', 'silver'],
    start: 'chapel',
    treasure: 10,
    description: 'Tarnished silver, finely worked with lilies and bells. Worth a small fortune, to anyone still alive to buy it.',
    on: {
      smell: 'Tallow and tarnish.',
      taste: 'Silver, tarnish, and a monk’s fingers.',
      touch: 'Cold, intricate work: lilies and bells, every petal veined.',
      polish: 'You polish one little bell on its stem until it shines. One clean thing, tonight.',
      turn: 'Lilies and bells and lilies and bells, around and around.',
      shake: 'A curl of old tallow drops out of the socket.',
      break: 'Silver bends; it doesn’t break. You don’t want it bent.',
    },
  },
  reliquary: {
    id: 'reliquary',
    name: 'gold reliquary',
    nouns: ['gold reliquary', 'reliquary', 'gold', 'relic'],
    start: 'nowhere',
    treasure: 10,
    description:
      'A gold reliquary no bigger than your thumb, with a crystal window. Inside is a sliver of bone. St. Audra’s, perhaps. It is warm, the way the cake was warm.',
    on: {
      smell: 'Myrrh, very faint and very old.',
      taste: 'You put it to your lips the way the faithful do. It is warm, and for a moment you feel, absurdly, forgiven.',
      touch: 'Warm. It is always warm.',
      listen: 'Hold it to your ear and you hear the sea. You would anyway; it has been in the sea.',
      shake: 'The bone inside clicks against the crystal like a tooth.',
      polish: 'You rub the crystal clear. The sliver of bone inside seems to lean toward the light.',
      break: 'You will not crack open a saint, not even for a look.',
      wear: 'There is a little loop for a cord. You have no cord. You keep it close anyway.',
    },
  },
  ring: {
    id: 'ring',
    name: 'silver ring',
    nouns: ['silver ring', 'ring'],
    start: 'nowhere',
    treasure: 10,
    description: 'A woman’s silver ring, far too big for a child. Inside the band someone has engraved a name: MAUD.',
    on: {
      smell: 'Silver and, faintly, flour.',
      taste: 'Flour and silver. A baker’s ring.',
      touch: 'Worn thin on one side by years of kneading bread.',
      wear: 'You slide it onto your thumb. It is loose even there. You take it off again; it is not yours to wear.',
      turn: 'You spin it on your palm. It wobbles to a stop with MAUD facing up.',
      roll: 'You walk it across your knuckles like a gambler, once, and catch it.',
      polish: 'You rub it on your sleeve. The name inside comes up bright.',
    },
  },
};
