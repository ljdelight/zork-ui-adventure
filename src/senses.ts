import type { State, Text } from './types';

/**
 * Flavor responses for the "you can technically try it" verbs: smelling, licking, fingering,
 * kicking, rolling and so on. None of these advance the plot; they exist so the world answers back.
 */
export type Action =
  | 'smell' | 'taste' | 'touch' | 'listen' | 'shake' | 'roll' | 'turn' | 'hit' | 'break'
  | 'pull' | 'push' | 'squeeze' | 'wear' | 'polish' | 'burn' | 'throw' | 'eat';

export const VERB_ACTIONS: Record<string, Action> = {
  smell: 'smell', sniff: 'smell', inhale: 'smell', whiff: 'smell', snuffle: 'smell',
  taste: 'taste', lick: 'taste', chew: 'taste', nibble: 'taste', gnaw: 'taste', suck: 'taste', slurp: 'taste',
  touch: 'touch', feel: 'touch', finger: 'touch', rub: 'touch', stroke: 'touch', pat: 'touch', poke: 'touch',
  prod: 'touch', caress: 'touch', tickle: 'touch', fondle: 'touch', pet: 'touch', tap: 'touch', grope: 'touch',
  nudge: 'touch',
  listen: 'listen', hear: 'listen',
  shake: 'shake', rattle: 'shake', jiggle: 'shake', wiggle: 'shake', waggle: 'shake', brandish: 'shake',
  roll: 'roll', bowl: 'roll', juggle: 'roll',
  turn: 'turn', twist: 'turn', spin: 'turn', twirl: 'turn', rotate: 'turn', flip: 'turn',
  punch: 'hit', kick: 'hit', slap: 'hit', smack: 'hit', whack: 'hit', bash: 'hit', thump: 'hit',
  headbutt: 'hit', attack: 'hit', fight: 'hit', stab: 'hit', bonk: 'hit', spank: 'hit',
  break: 'break', smash: 'break', shatter: 'break', crush: 'break', destroy: 'break', snap: 'break',
  tear: 'break', rip: 'break', bend: 'break',
  pull: 'pull', tug: 'pull', yank: 'pull', drag: 'pull', lift: 'pull', raise: 'pull', heave: 'pull',
  shove: 'push', press: 'push', lean: 'push',
  squeeze: 'squeeze', pinch: 'squeeze', wring: 'squeeze', crumple: 'squeeze', squish: 'squeeze',
  wear: 'wear', don: 'wear',
  polish: 'polish', clean: 'polish', wipe: 'polish', shine: 'polish', wash: 'polish', buff: 'polish',
  burn: 'burn', torch: 'burn', scorch: 'burn',
};

/** Senses that work by feel, smell and sound, so they still function in the dark. */
export const BLIND_ACTIONS = new Set<Action>(['smell', 'taste', 'touch', 'listen']);

/** People (and things that used to be people), who get different generic responses. */
export const PEOPLE = new Set([
  'ferryhut/wen', 'ferryhut/tom', 'stones/girl', 'crypt/abbot', 'tidepools/man',
  'crossroads/gibbet', 'chapel/pews', 'wellbottom/bones', 'belfry/figures',
]);

const girl = (text: string) => (s: State) =>
  s.flags.childFed ? 'There is no one here now. Only the frost, and the wind.' : text;

/** Keyed by item id, or by "room/scenery" where scenery is the first noun of its key. */
export const REACTIONS: Record<string, Partial<Record<Action, Text>>> = {
  // --- Items ---------------------------------------------------------------
  lantern: {
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
  note: {
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
  cake: {
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
  rope: {
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
  key: {
    smell: 'Rust and pond water.',
    taste: 'Cold iron and well water, and something dead.',
    touch: 'So cold it hurts. It does not warm at all in your hand.',
    listen: 'Held to your ear it sounds like the inside of a shell: far-off water, and someone breathing.',
    shake: 'The little bell shaped into its bow does not ring. It has no clapper either.',
    turn: 'You turn it in the empty air. Somewhere a long way off, a lock you cannot see goes click.',
    break: 'Iron as thick as your thumb. No.',
  },
  clapper: {
    smell: 'Verdigris and incense. And the abbot. Mostly the abbot.',
    taste: 'You lick the bronze. It tastes of pennies and of a dead man’s palms. You spit for a long time.',
    touch: 'The abbot’s finger marks are pressed into the green crust. Yours fit inside them, almost.',
    listen: 'It hums against your ear, very faintly, like a held breath.',
    hit: 'You rap it with your knuckles. A low note comes out of it: the ghost of what it could be.',
    roll: 'You set it down and it rolls in a slow, lopsided circle and stops pointing at the tower. You pick it back up.',
    shake: 'It is far too heavy to shake, and heavy things do not like being swung about in the dark.',
    throw: 'You heave the clapper a yard or two. It lands with a deep, dull thud, like a church door shutting.',
  },
  candlestick: {
    smell: 'Tallow and tarnish.',
    taste: 'Silver, tarnish, and a monk’s fingers.',
    touch: 'Cold, intricate work: lilies and bells, every petal veined.',
    polish: 'You polish one little bell on its stem until it shines. One clean thing, tonight.',
    turn: 'Lilies and bells and lilies and bells, around and around.',
    shake: 'A curl of old tallow drops out of the socket.',
    break: 'Silver bends; it doesn’t break. You don’t want it bent.',
  },
  reliquary: {
    smell: 'Myrrh, very faint and very old.',
    taste: 'You put it to your lips the way the faithful do. It is warm, and for a moment you feel, absurdly, forgiven.',
    touch: 'Warm. It is always warm.',
    listen: 'Hold it to your ear and you hear the sea. You would anyway; it has been in the sea.',
    shake: 'The bone inside clicks against the crystal like a tooth.',
    polish: 'You rub the crystal clear. The sliver of bone inside seems to lean toward the light.',
    break: 'You will not crack open a saint, not even for a look.',
    wear: 'There is a little loop for a cord. You have no cord. You keep it close anyway.',
  },
  ring: {
    smell: 'Silver and, faintly, flour.',
    taste: 'Flour and silver. A baker’s ring.',
    touch: 'Worn thin on one side by years of kneading bread.',
    wear: 'You slide it onto your thumb. It is loose even there. You take it off again; it is not yours to wear.',
    turn: 'You spin it on your palm. It wobbles to a stop with MAUD facing up.',
    roll: 'You walk it across your knuckles like a gambler, once, and catch it.',
    polish: 'You rub it on your sleeve. The name inside comes up bright.',
  },

  // --- Your Cottage ----------------------------------------------------------
  'cottage/fire': {
    smell: 'Peat smoke and the last of the apple wood.',
    touch: 'You hold your hands over the coals. Warmth, thin and grudging. Then the coals hiss, as though someone has spat on them.',
    taste: 'You are not licking a fire. You have that much sense left.',
    listen: 'The coals tick and settle. Under that, if you listen, a soft sound like someone breathing through their nose.',
    hit: 'You kick the coals. Sparks fly up the chimney, and for a moment you see a face in them.',
  },
  'cottage/table': {
    smell: 'Lye soap and lavender. The cloth smells of her chest.',
    touch: 'The cloth is warm in one place, as if someone has just been resting their hand on it.',
    hit: 'You bang a fist on the table. The cloth does not move. It should have.',
    pull: 'You tug the cloth. It will not come; it is as though someone is holding the other end.',
  },
  'cottage/window': {
    listen: 'Nothing. Then three taps. Then nothing.',
    touch: 'The shutter bar is cold. On the other side of the wood something presses, gently, and lets go.',
    pull: 'You take hold of the bar, and then you leave it exactly where it is.',
  },
  'cottage/door': {
    smell: 'Chalk dust.',
    touch: 'The chalk cross is dry, but your fingers come away clean.',
    listen: 'You put your ear to the door. On the other side, someone else has their ear to it too.',
  },
  'cottage/beds': {
    smell: 'Sour straw, though the straw is long gone.',
    touch: 'Bare boards, cold. Except one, which is warm.',
  },

  // --- Crossroads ------------------------------------------------------------
  'crossroads/signpost': {
    touch: 'The burned word HERE is warm, as if the brand was set to it tonight.',
    smell: 'Charred wood.',
    turn: 'You twist the downward arm to point at the road. When you look back, it points down again.',
  },
  'crossroads/gibbet': {
    smell: 'You get close enough to smell him, and wish you hadn’t: pitch and rot and, sweetly, crow.',
    touch: 'You reach up and touch the cage. Very slowly, the thief’s head turns toward your hand. You let go.',
    listen: 'Chain. Creak. Chain. Then something like a sigh, from inside the cage.',
    push: 'The cage swings, and the thief nods at you, and keeps on nodding long after it should have stopped.',
    shake: 'The cage swings, and the thief nods at you, and keeps on nodding long after it should have stopped.',
    hit: 'You kick the gibbet post. The cage jerks, and the thief’s grin bobs up and down at you, approving.',
    taste: 'No. Some things are beyond even tonight.',
  },
  'crossroads/moon': {
    touch: 'You hold up your thumb and hide the moon behind it. When you take your thumb away, it seems a little closer.',
    listen: 'The moon makes no sound. Tonight that feels deliberate.',
  },
  'crossroads/road': {
    touch: 'Frozen as hard as iron.',
    smell: 'Frost, and old dung, and nobody.',
  },

  // --- Dead Orchard ----------------------------------------------------------
  'orchard/turnip': {
    smell: 'Hot turnip and candle smoke: the smell of every Hallows of your childhood.',
    taste: 'Raw turnip, bitter and cold. It tasted better when you were small.',
    touch: 'The skin is warm. The candle inside must be hotter than any candle has a right to be.',
    hit: 'You draw back your foot, and the turnip’s grin seems to widen. You put your foot down again.',
    listen: 'The candle gutters. It sounds, faintly, like someone trying not to laugh.',
    turn: 'You turn its face away from the road. A moment later, without a sound, it is grinning at you again.',
  },
  'orchard/trees': {
    touch: 'The bark is cold and damp and gives under your thumb like old bread.',
    smell: 'Rotten apples, cider-sweet.',
    taste: 'You pull a rotted apple off a branch and bite. Worm, and something worse than worm. You spit.',
    shake: 'You shake a branch. A dozen black apples fall, and not one of them makes a sound when it lands.',
    listen: 'The branches do not creak. Trees should creak.',
  },
  'orchard/grass': {
    touch: 'The frost crunches. The footprints are colder than the frost around them.',
    smell: 'Frost and rot.',
  },
  'orchard/fog': {
    touch: 'Your hand vanishes into it to the wrist. Something in there brushes your fingers, softly, and you pull back.',
    taste: 'Wet and cold and faintly sweet, like somebody else’s breath.',
    smell: 'Earth. Freshly turned earth.',
  },

  // --- The Well --------------------------------------------------------------
  'well/well': {
    smell: 'Wet stone, and flowers, and under the flowers, whatever flowers are put there to cover.',
    listen: 'Humming. A long way down, someone is humming with their mouth full of water.',
    touch: 'The stones are slick with frost. One is warm, as though someone has just stood up from it.',
    taste: 'You lick a frosty stone. Your tongue sticks for one awful moment, and comes away bleeding.',
  },
  'well/crossbeam': {
    touch: 'Black oak, hard as stone.',
    pull: 'You hang your weight from it. It does not so much as creak.',
  },
  'well/rope': {
    pull: (s) => (s.flags.ropeTied ? 'You give it a hard tug. The knot holds.' : 'There is no rope here.'),
  },

  // --- Bottom of the Well ----------------------------------------------------
  'wellbottom/water': {
    touch: 'It is cold enough to stop a heart. Something brushes your ankle, unhurried.',
    taste: 'Iron and silt and something like a funeral. You spit.',
    smell: 'Stagnant, sweet, and wrong.',
    listen: 'Drip. Drip. Drip. And once, very close, a small splash that was not a drip.',
  },
  'wellbottom/bones': {
    touch: 'The skull is smooth under your fingers. The jaw moves when you touch it. It is only loose. It is only loose.',
    smell: 'Nothing. They have been down here long enough to stop smelling.',
    hit: 'You kick the skull. It rolls under the water and comes to rest facing you.',
  },
  'wellbottom/walls': {
    touch: 'Slick and cold and scored with scratches: fingernail scratches, as high as a man can reach.',
  },
  'wellbottom/rope': {
    pull: 'You give it a tug. Far above, the crossbeam creaks reassuringly.',
    touch: 'Wet hemp. The way home.',
  },

  // --- Abbey Gate ------------------------------------------------------------
  'abbeygate/gate': {
    touch: 'The iron burns with cold. The rosaries stir against your knuckles like small fingers.',
    shake: (s) =>
      s.flags.gateOpen
        ? 'It hangs open and stays that way.'
        : 'You rattle the gate. It does not give. Every rosary on it rattles back at you.',
    pull: (s) => (s.flags.gateOpen ? 'It is open as far as it goes.' : 'Locked. It does not give an inch.'),
    listen: 'Click. Click. The beads, talking among themselves.',
    smell: 'Rust and beeswax.',
  },
  'abbeygate/rosaries': {
    touch: 'The beads are warm. All of them. As if they have only just been let go of.',
    listen: 'Click, click, like a hundred people praying very fast under their breath.',
    taste: 'You put a bone bead in your mouth. It tastes of bone. Of course it does.',
    pull: 'You tug a rosary. It snaps, and the beads scatter in the frost and roll, every one of them, toward the gate.',
  },
  'abbeygate/wall': {
    touch: 'Cold dressed stone. Not a handhold anywhere.',
  },

  // --- Cloister Graveyard ----------------------------------------------------
  'cloister/mounds': {
    smell: 'Turned earth, lime, and the thick sweet smell of the summer’s dead.',
    touch: 'The earth is loose, and warm, and it moves under your palm, very slightly, like something breathing underneath.',
    taste: 'You are not eating grave dirt. Not yet.',
    hit: 'You kick a mound. Something under it kicks back.',
    listen:
      'You press your ear to a mound before you can stop yourself. Underneath: a scratching, patient and slow, ' +
      'like someone writing a very long letter.',
  },
  'cloister/crosses': {
    pull: 'You pull a cross out of the ground. Underneath, the earth is warm. You put it back, carefully, and say sorry.',
    touch: 'Kindling and twine. Someone tied these knots with shaking hands.',
  },
  'cloister/fountain': {
    touch: 'Dry stone and dead leaves. The little shoe is damp, though nothing else is.',
    smell: 'Leaf mould.',
    listen: 'Nothing. Then, from the bottom of the dry basin, a small child’s breathing.',
  },
  'cloister/steps': {
    smell: 'Incense, and rot under the incense.',
    listen: 'From below: someone praying, very slowly, in a voice that has forgotten how.',
    touch: 'Worn smooth, and wet, though it has not rained.',
  },

  // --- Chapel ----------------------------------------------------------------
  'chapel/altar': {
    touch: 'The stone is cold, except for the little scratched bell, which is warm.',
    smell: 'Old wax.',
    push: 'It weighs more than the whole village.',
  },
  'chapel/window': {
    touch: 'You reach up and touch an edge of colored glass. It cuts you very neatly, and you swear.',
    break: 'There is not much left to break, and through what there is, St. Audra is still watching.',
  },
  'chapel/pews': {
    smell: 'You breathe in once, and then breathe through your mouth for as long as you stay in here.',
    touch: 'The shroud is warm under your fingers. The body under the shroud is cold. You would rather it were the other way round.',
    listen: 'Breathing. Slow, many-throated, and all in time.',
    taste: 'Absolutely not.',
  },
  'chapel/candles': {
    smell: 'Mutton fat.',
    taste: 'Tallow. Like eating a cold dinner off a dead man’s plate.',
    touch: 'Hard, cold tallow.',
  },

  // --- Foot of the Tower -----------------------------------------------------
  'towerbase/stair': {
    touch: 'Each step is worn into a bowl. Thousands of feet, and none of them going up tonight but yours.',
    listen: 'Your own heartbeat, and above it, the wind in the bell.',
  },
  'towerbase/writing': {
    touch: 'The letters are cut deep. Whatever he used, it was not a knife. There is a fingernail still lodged in the N.',
  },

  // --- Belfry ----------------------------------------------------------------
  'belfry/bell': {
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
  'belfry/hook': {
    pull: 'Solid iron, sunk deep. It will take the weight.',
  },
  'belfry/figures': {
    listen: 'Silence. Hundreds of people, and not one of them breathing.',
    smell: 'Even up here, on the wind: the fields, and what is standing in them.',
  },

  // --- Crypt -----------------------------------------------------------------
  'crypt/abbot': {
    smell: 'Incense, rot, and something sharp and coppery.',
    touch: 'You touch his sleeve. Under the cloth, the arm tenses.',
    taste: 'No. No. No.',
    hit: 'You strike him. His head lolls, and rolls back to face you, and his jaw works as if to say: again.',
    listen: 'Breath whistles through what is left of his teeth. He has no lungs. You hear it anyway.',
  },
  'crypt/coffins': {
    touch: 'The stone lids are scratched. On the inside.',
    listen: 'Something in the closed coffins is shifting, slowly, to get comfortable.',
  },
  'crypt/roots': {
    taste: 'Bitter and earthy, pale and soft as fingers. You spit them out.',
    touch: 'Cold and soft, and they move under your fingers like a hand closing.',
  },

  // --- The Strand ------------------------------------------------------------
  'shore/sea': {
    touch: 'You crouch and put your hand in. The cold bites to the bone. When you pull it out, a long black hair is wound around your fingers.',
    taste: 'Salt, and something oily.',
    smell: 'Salt and dead fish.',
    listen: 'The waves come in and go out. Between them, a drowned bell, tolling.',
  },
  'shore/fish': {
    smell: 'Every one of them, all at once.',
    taste: 'You are not that hungry. Nobody is that hungry.',
    touch: 'Slick and cold. Its eye follows your finger.',
    hit: 'You kick a dead fish into the surf. The next wave brings it back to your feet, eyes open, facing you.',
  },

  // --- Fisherman's Hut -------------------------------------------------------
  'ferryhut/wen': {
    smell:
      'Stale wine, woodsmoke and sweat, and under it all something lovely: rosewater, the last of it, from a ' +
      'bottle he has clearly been saving.',
    touch: 'You touch his shoulder. He puts his big hand over yours and holds it there a moment without looking up.',
    taste: 'He catches your face before you get there. “Darling. I’ve buried a man today. Buy me a drink first.”',
    hit: 'You swing at him. He catches your fist in one huge hand without even looking up. “Not tonight, love. I’d only cry harder.”',
    listen: 'He is humming under his breath: a bawdy song about a miller’s wife, slowed down until it sounds like a hymn.',
    shake: 'You shake his hand. He shakes back, hard, and doesn’t let go for a second too long.',
    pull: 'You tug his beard. “Ow. Fuck. Yes, it’s real. Everybody checks.”',
    squeeze: 'You squeeze his arm. He squeezes back, and sniffs, and pretends he didn’t.',
    burn: '“Try it,” says Wen, “and I’ll put that lantern somewhere the Church has opinions about.”',
    eat: '“Ooh. Later, maybe. If we live.”',
  },
  'ferryhut/tom': {
    smell: 'You get close enough to smell him. Wen watches you do it, and you stop.',
    touch: 'Wen’s hand tightens on Tom’s. “Gently.” You touch the dead man’s shoulder, gently. It is like touching a sack of cold water.',
    taste: 'Wen’s eyes narrow. “Try it,” he says softly. You don’t.',
    hit: 'Wen is on his feet before you have finished thinking it, and his face makes you take two steps back. “No.”',
    listen: 'Nothing. Wen is listening too, you realize. He has been listening for hours.',
  },
  'ferryhut/nets': {
    smell: 'Tar and old fish.',
    touch: 'They come apart in your fingers like wet bread.',
  },
  'ferryhut/stove': {
    touch: 'Cold iron. It has been cold a long while.',
  },

  // --- Rock Pools ------------------------------------------------------------
  'tidepools/man': {
    smell: 'Salt and weed. He has not been in the water long enough to smell worse. Nearly.',
    touch: 'Soft, cold and wrong, like touching a glove with no hand in it, except that there is a hand in it.',
    taste: 'No.',
    hit: 'You kick him. He rocks in the pool, and settles, and his head is turned a little more toward you than before.',
    listen: 'Water laps in and out of his open mouth, as if he is trying to say something with it.',
  },
  'tidepools/pools': {
    taste: 'Salt, and cold.',
    touch: 'Cold enough to ache to the elbow.',
  },

  // --- The Nine Maidens ------------------------------------------------------
  'stones/stones': {
    touch: 'Warm, like a sleeper’s back. Under your palm, slow as the seasons, the stone is breathing.',
    smell: 'Lichen and rain.',
    taste: 'Lichen, and faintly, salt, like tears.',
    hit: 'You kick one of the maidens. Your toe complains. She does not; she has suffered worse.',
    listen: 'The wind through the ring makes nine notes, close together, like girls whispering.',
    push: 'She leans a fraction of an inch further in, and stops.',
  },
  'stones/girl': {
    touch: girl('Your hand goes through her shoulder into a cold that burns. She does not seem to notice.'),
    smell: girl('Frost and wax and, faintly, bread. She smells like a kitchen on a winter morning.'),
    taste: girl('Absolutely not.'),
    hit: girl('Your hand passes straight through her. She keeps humming. You feel very ashamed.'),
    listen: girl('She is humming “The Holly and the Ivy,” wrong in the same place you always got it wrong.'),
  },
  'stones/heather': {
    smell: 'Dry heather, honey-faint.',
    touch: 'Brittle, and full of wind.',
  },
};

/** What a sense picks up when it is pointed at nothing in particular. */
export const ROOM_SENSES: Record<string, Partial<Record<Action, string>>> = {
  cottage: {
    smell: 'Peat smoke, lye, lavender. Under it, faint and stubborn, the sweet rot of the summer.',
    listen: 'The coals tick. The wind fingers the thatch.',
  },
  crossroads: { smell: 'Frost, pitch and the gibbet. Mostly the gibbet.', listen: 'The gibbet chain creaks. Far off, surf.' },
  orchard: {
    smell: 'Rotten apples and wet earth and, from the turnip, candle smoke.',
    listen: 'Now and then an apple drops. Nothing else moves. Something does anyway.',
  },
  well: { smell: 'Wet stone and grave flowers.', listen: 'Humming, from far down the shaft.' },
  wellbottom: {
    smell: 'Stagnant water and old bone.',
    listen: 'Drips. Your own breath, too loud. Very far above, the wind.',
    touch:
      'You feel about you: slick wall, the swaying rope, water to the ankle, and something under the silt that ' +
      'might be a stick and is not.',
  },
  abbeygate: { smell: 'Rust and frost and beeswax.', listen: 'The rosaries click against the iron.' },
  cloister: { smell: 'Lime, earth, and incense from the crypt steps.', listen: 'Somewhere among the graves, earth sliding softly onto earth.' },
  chapel: { smell: 'Tallow, old incense and the dead. Very much the dead.', listen: 'Breathing. You are fairly sure some of it is yours.' },
  towerbase: { smell: 'Cold stone and pigeon lime.', listen: 'Wind, moaning down the stair from the belfry.' },
  belfry: { smell: 'Wind, bronze and, from the fields, faintly, the grave.', listen: 'The wind in the bell’s mouth makes a low, unhappy note.' },
  crypt: { smell: 'Incense, damp, and the coppery smell of the floor.', listen: 'Dripping. Scraping. The abbot’s breath.' },
  shore: { smell: 'Salt, weed and dead fish.', listen: 'Surf, and under it a bell that is not there.', taste: 'Salt on your lips.' },
  ferryhut: { smell: 'Plague, old fish and rosewater.', listen: 'Wen humming, and the flies.' },
  tidepools: { smell: 'Salt, weed and drowned sailor.', listen: 'Water lapping, in and out.', taste: 'Salt spray.' },
  stones: { smell: 'Heather, frost and, faintly, warm bread.', listen: 'The wind among the stones, and someone humming.' },
};

/** Responses to a bare verb ("smell", "roll") when the room has nothing more specific. */
export const ALONE: Partial<Record<Action, string>> = {
  smell: 'Frost and woodsmoke, and under it the sweetish rot that has hung over everything since summer.',
  taste: 'The air tastes of frost and old smoke.',
  listen: 'Wind. And under the wind, nothing. Which is somehow worse.',
  shake: 'You shake yourself like a wet dog. It helps, a little.',
  roll: 'You roll about in the frost. Nobody sees. Small mercies.',
  turn: 'You turn around. Nothing is behind you. Now.',
};

type Generic = (name: string, scenery: boolean) => string;

export const GENERIC: Record<Action, Generic> = {
  smell: (n) => `The ${n} smells of frost and old smoke, like everything else tonight.`,
  taste: (n, sc) =>
    sc
      ? `You put your tongue to the ${n}. Cold and bitter, and you will be tasting it for an hour.`
      : `You lick the ${n}. It tastes of cold and dirt, and you feel foolish.`,
  touch: (n) => `The ${n} is cold, and a little damp, the way everything is tonight.`,
  listen: (n) => `You listen to the ${n}. It keeps its secrets.`,
  shake: (n, sc) => (sc ? `The ${n} is not going to be shaken by the likes of you.` : `You shake the ${n}. Nothing rattles.`),
  roll: (n, sc) => (sc ? 'You can’t roll that.' : `You roll the ${n} between your palms. It does not get any rounder.`),
  turn: (n, sc) => (sc ? 'It won’t turn.' : `You turn the ${n} over in your hands. It looks the same from every side.`),
  hit: (n, sc) => (sc ? `You hit the ${n}. Your knuckles lose.` : `You whack the ${n}. It takes it better than you do.`),
  break: (n) => `The ${n} is sturdier than your temper.`,
  pull: (n, sc) => (sc ? `You heave at the ${n}. It does not budge.` : `You tug at the ${n}. It stays in one piece.`),
  push: (n) => `You push the ${n}. It doesn’t move, and you feel faintly ridiculous.`,
  squeeze: (n) => `You squeeze the ${n}. It doesn’t squeeze back. Thank God.`,
  wear: (n) => `You can’t wear the ${n}.`,
  polish: (n) => `You rub the ${n} with your sleeve. It is still grimy, but you feel better.`,
  burn: (n) => `You hold the lantern flame to the ${n}. It blackens, stinks, and refuses to burn.`,
  throw: (n) => `You toss the ${n}. It lands a short way off.`,
  eat: () => 'That doesn’t look edible.',
};

export const PERSON_GENERIC: Partial<Record<Action, string>> = {
  smell: 'You lean in and sniff. The grave. Everyone smells of the grave tonight.',
  taste: 'No. Whatever else happens tonight, not that.',
  touch: 'You reach out, and then your hand decides for you, and comes back.',
  listen: 'Not a breath. Not a heartbeat. You listen longer than you should.',
  hit: 'Violence will not help. Very little will.',
  eat: 'No. Whatever else happens tonight, not that.',
  burn: 'You will not.',
};

/** Verbs that need no object, with room-specific responses. */
interface Act {
  verbs: string[];
  text: Text;
  rooms?: Record<string, Text>;
}

export const ACTS: Record<string, Act> = {
  jump: {
    verbs: ['jump', 'hop', 'leap', 'skip'],
    text: 'You jump on the spot. The frost crunches. Nobody is watching. You hope.',
    rooms: {
      belfry: 'You look over the edge at the long drop and the waiting figures, and step back. Not like that. Not tonight.',
      well: 'You look down the shaft. No. There are easier ways to the bottom, and better ones.',
      wellbottom: 'You jump, and splash, and the humming far above stops. Then it starts again.',
      cottage: 'You jump. The floorboards boom. Under them, something knocks twice in reply.',
    },
  },
  dance: {
    verbs: ['dance', 'jig', 'caper', 'waltz', 'boogie', 'prance'],
    text:
      'You dance a few steps of a jig, alone, on All Hallows’ Eve, in a dead village. It is the bravest and ' +
      'stupidest thing you have done all night.',
    rooms: {
      stones:
        'Folk say these nine were turned to stone for dancing on a holy day. You manage three steps before your ' +
        'feet go cold and heavy as millstones, and you stop very quickly indeed.',
      ferryhut:
        'Wen watches you for a moment, then laughs until he weeps. “Oh, darling. Your feet. Tom danced like that. Like a cart losing a wheel.”',
      chapel: 'You dance among the dead. Under one shroud, something taps a foot in time.',
      belfry: 'You dance on the windy platform. Down in the fields, the figures sway, very slightly, all together.',
    },
  },
  sing: {
    verbs: ['sing', 'hum', 'whistle', 'chant', 'yodel'],
    text: 'You sing a verse of something your mother used to sing. Your voice sounds very small out here.',
    rooms: {
      stones: girl('You hum along with the girl. She stops, tilts her head, and picks up the tune again, one note behind you.'),
      ferryhut: 'Wen joins in at once, in a voice like warm honey, and has the words filthy by the second verse.',
      chapel: 'Your voice rings off the stones. The dead in the pews are very quiet, the way an audience is quiet.',
      crypt: 'You start a hymn. The abbot’s jaw moves along with you, silently, one word ahead.',
      well: 'You sing into the well. The humming below stops, and then, very sweetly, it sings your song back up to you.',
    },
  },
  pray: {
    verbs: ['pray', 'kneel', 'genuflect', 'cross'],
    text: 'You pray. The words come out in the wrong order. Nobody seems to be listening, or worse, somebody is.',
    rooms: {
      chapel: 'You kneel at the altar. The scratched bell is warm under your folded hands. Pulsa et dormient, you think. Ring, and they will sleep.',
      crypt: 'You begin the Pater Noster. Behind you a dry voice joins in, saying the words backwards.',
      cloister: 'You pray over the nearest mound. The earth stops moving, for a while.',
      ferryhut: '“Don’t,” says Wen, not unkindly. “Not over him. He’d hate it.”',
    },
  },
  cry: {
    verbs: ['cry', 'weep', 'sob', 'wail', 'blubber'],
    text: 'You cry for a while, quietly, for your mother and your brothers and the whole stupid village. It helps more than you’d expect.',
    rooms: {
      ferryhut:
        'Wen holds out his arms without a word, and you cry into his green coat, and he cries into your hair, and Tom watches the both of you.',
    },
  },
  shout: {
    verbs: ['shout', 'scream', 'yell', 'howl', 'holler', 'shriek', 'roar', 'bellow'],
    text: 'You scream. The sound goes out across the dead land, and nothing comes back. Not even an echo.',
    rooms: {
      belfry: 'You scream into the wind. Down in the fields, every face turns up toward you at once.',
      crypt: 'Your scream fills the vault. When it stops, the abbot is a little closer to the steps than he was.',
      well: 'Your shout drops down the shaft. A moment later it comes back up, in a voice that is not yours.',
      ferryhut: '“Christ on a donkey,” says Wen, clutching his chest. “Warn a person.”',
    },
  },
  sleep: {
    verbs: ['sleep', 'nap', 'rest', 'lie', 'doze'],
    text: 'You cannot sleep. Not tonight. Not until the bell rings.',
    rooms: {
      cottage: 'You lie down on the bare boards. On the next bed, something lies down too, with a long sigh. You get up.',
    },
  },
  sit: {
    verbs: ['sit', 'squat', 'crouch'],
    text: 'You sit a moment in the frost and get your breath back.',
    rooms: {
      ferryhut: 'You sit beside Wen on the floor. He bumps your shoulder with his. Nobody says anything. It is nice.',
      belfry: 'You sit with your back against the bell. It is humming, very faintly, through your spine.',
    },
  },
  swim: {
    verbs: ['swim', 'bathe', 'wade', 'paddle', 'dive'],
    text: 'There is nowhere to swim here.',
    rooms: {
      shore:
        'You wade in to your knees, and the cold closes on your heart like a fist. Out on the swell, something pale bobs closer. You wade out again, fast.',
      tidepools: 'You lower one foot into the pool beside the drowned man. He shifts toward it. You take your foot out.',
      wellbottom: 'You are already in up to your ankles, which is quite enough.',
    },
  },
  dig: {
    verbs: ['dig', 'excavate', 'burrow'],
    text: 'The ground is frozen hard. You have no spade and, frankly, no business.',
    rooms: {
      cloister: 'You scrape at a mound with your fingers. The earth is loose and warm, and a moment later something underneath scrapes back. You stop.',
      wellbottom: 'You grope in the silt. Bones, mostly.',
    },
  },
  spit: {
    verbs: ['spit', 'hock', 'gob'],
    text: 'You spit. It freezes before it lands.',
    rooms: {
      well: 'You spit down the well. Long after it should have landed, something below spits back.',
      ferryhut: '“Not on my floor,” says Wen. “It’s Tom’s floor. Have some respect.”',
    },
  },
  curse: {
    verbs: ['curse', 'swear', 'damn', 'blaspheme', 'cuss'],
    text: 'You swear, long and inventively. Wen would be proud.',
    rooms: {
      ferryhut: '“Amateur,” says Wen, and then shows you how it’s done. Your ears are hot for some time afterwards.',
      chapel: 'You swear in a chapel full of dead monks. The silence afterwards is very pointed.',
    },
  },
  laugh: {
    verbs: ['laugh', 'giggle', 'chuckle', 'cackle', 'snicker'],
    text: 'You laugh. It comes out wrong, and you stop.',
    rooms: { ferryhut: 'Wen laughs too, helplessly, the way people laugh at funerals.' },
  },
  wave: {
    verbs: ['wave', 'beckon', 'salute'],
    text: 'You wave at no one. After a moment, somewhere out in the dark, something waves back.',
    rooms: { belfry: 'You wave at the figures in the fields. A few of them, slowly, raise their hands.' },
  },
  clap: {
    verbs: ['clap', 'applaud'],
    text: 'You clap your hands. The sound falls dead, as if the air is too thick to carry it.',
  },
  knock: {
    verbs: ['knock', 'rap', 'bang'],
    text: 'You knock on nothing in particular. Something, somewhere, knocks back.',
    rooms: {
      cottage: 'You knock on the inside of your own door. From outside, someone knocks back, politely, three times.',
      abbeygate: 'You rap on the gate. The rosaries click in reply.',
      ferryhut: '“It’s open,” says Wen. “It’s a fucking hut.”',
    },
  },
  piss: {
    verbs: ['piss', 'pee', 'urinate', 'wee', 'relieve'],
    text: 'Not here. Not with all of them watching.',
    rooms: {
      well: 'You consider it. The humming down the shaft goes very quiet, as though waiting to see if you dare. You don’t.',
      ferryhut: '“Outside,” says Wen. “Downwind. And not on the boat.”',
    },
  },
  fart: {
    verbs: ['fart', 'toot', 'trump'],
    text: 'Your body betrays you. In the hush of the dead night it is very loud. Somewhere, the dead are judging you.',
    rooms: {
      ferryhut: 'Wen snorts so hard he has to wipe his eyes. “Oh, Tom would have loved that.”',
      chapel: 'It echoes off the vaulting for an appalling length of time.',
    },
  },
  cough: {
    verbs: ['cough', 'sneeze', 'hiccup', 'wheeze'],
    text: 'You cough. The sound goes on a little longer than you made it.',
  },
  breathe: {
    verbs: ['breathe', 'pant', 'sigh'],
    text: 'You breathe in. You breathe out. Good. Keep doing that.',
  },
  think: {
    verbs: ['think', 'ponder', 'consider', 'remember', 'meditate'],
    text: 'You think about the bell, and the clapper, and the dark. Mostly the dark. (HINT might help.)',
  },
  bow: {
    verbs: ['bow', 'curtsy', 'curtsey'],
    text: 'You bow to the night. The night does not bow back.',
    rooms: { ferryhut: 'Wen applauds, slowly. “Lovely. Very Herod.”' },
  },
  hide: {
    verbs: ['hide', 'cower', 'duck'],
    text: 'There is nowhere to hide from what is out tonight. You hide anyway, briefly, behind your hands.',
  },
};

export const ACT_ALIASES: Record<string, string> = Object.fromEntries(
  Object.entries(ACTS).flatMap(([id, act]) => act.verbs.map((v) => [v, id])),
);
