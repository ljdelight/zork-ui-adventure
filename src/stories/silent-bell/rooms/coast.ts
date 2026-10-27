import type { Room, ThrowTarget } from '../../../engine/types';

/** Only the letter ever reaches the sea; a rule refuses everything else. */
const SEA: ThrowTarget = {
  match: /\b(sea|water|waves|pool|pools|ocean|surf|in|into)\b/,
  to: 'nowhere',
  text: 'The sea takes Anselm’s letter, turns it over twice like someone reading it, and pulls it under.',
};

export const COAST: Record<string, Room> = {
  shore: {
    id: 'shore',
    name: 'The Strand',
    description:
      'A long crescent of gray sand curves away beneath the cliffs. Dead fish lie along the tideline in ' +
      'their hundreds, silver bellies turned up to the moon. A tarred fishing hut stands on stilts to the ' +
      'north, and black rocks shelve into the sea to the east. The road back to the crossroads runs west.',
    exits: { north: 'ferryhut', east: 'tidepools', west: 'crossroads' },
    enter: 'north',
    ambience: [
      'Out on the water, a bell that is not there tolls once.',
      'The waves go quiet all together, as if listening, and then come back.',
    ],
    senses: { smell: 'Salt, weed and dead fish.', listen: 'Surf, and under it a bell that is not there.', taste: 'Salt on your lips.' },
    acts: {
      swim:
        'You wade in to your knees, and the cold closes on your heart like a fist. Out on the swell, something pale bobs closer. You wade out again, fast.',
    },
    throwTargets: [SEA],
    scenery: {
      'sea|water|waves': {
        look: 'Black and restless. Far out, something pale bobs on the swell, like a face looking up.',
        on: {
          touch: 'You crouch and put your hand in. The cold bites to the bone. When you pull it out, a long black hair is wound around your fingers.',
          taste: 'Salt, and something oily.',
          smell: 'Salt and dead fish.',
          listen: 'The waves come in and go out. Between them, a drowned bell, tolling.',
        },
      },
      'fish|tideline': {
        look: 'Every one of them has its eyes open.',
        on: {
          smell: 'Every one of them, all at once.',
          taste: 'You are not that hungry. Nobody is that hungry.',
          touch: 'Slick and cold. Its eye follows your finger.',
          hit: 'You kick a dead fish into the surf. The next wave brings it back to your feet, eyes open, facing you.',
        },
      },
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
    senses: { smell: 'Plague, old fish and rosewater.', listen: 'Wen humming, and the flies.' },
    acts: {
      dance:
        'Wen watches you for a moment, then laughs until he weeps. “Oh, darling. Your feet. Tom danced like that. Like a cart losing a wheel.”',
      sing: 'Wen joins in at once, in a voice like warm honey, and has the words filthy by the second verse.',
      pray: '“Don’t,” says Wen, not unkindly. “Not over him. He’d hate it.”',
      cry: 'Wen holds out his arms without a word, and you cry into his green coat, and he cries into your hair, and Tom watches the both of you.',
      shout: '“Christ on a donkey,” says Wen, clutching his chest. “Warn a person.”',
      sit: 'You sit beside Wen on the floor. He bumps your shoulder with his. Nobody says anything. It is nice.',
      spit: '“Not on my floor,” says Wen. “It’s Tom’s floor. Have some respect.”',
      curse: '“Amateur,” says Wen, and then shows you how it’s done. Your ears are hot for some time afterwards.',
      laugh: 'Wen laughs too, helplessly, the way people laugh at funerals.',
      knock: '“It’s open,” says Wen. “It’s a fucking hut.”',
      piss: '“Outside,” says Wen. “Downwind. And not on the boat.”',
      fart: 'Wen snorts so hard he has to wipe his eyes. “Oh, Tom would have loved that.”',
      bow: 'Wen applauds, slowly. “Lovely. Very Herod.”',
    },
    scenery: {
      'wen|kard|player|man|him|coat|beard|hair|earring': {
        look: (s) =>
          s.flags.wenMet
            ? 'Wen Kard, and God help you, he is beautiful: copper-red hair falling past his shoulders, a massive ' +
              'scruffy beard the color of a fox in autumn, a gold hoop in one ear, and eyes red-rimmed from weeping. ' +
              'His player’s coat of green and gold has gone black at the cuffs. You could TALK to him, ' +
              'or ASK WEN ABOUT something.'
            : 'A big man, red-haired and beautiful even like this, with a massive scruffy beard the color of a fox in ' +
              'autumn and a gold hoop in one ear. His player’s coat of green and gold has gone filthy. He is holding ' +
              'the dead man’s hand as if it might still hold back. You could TALK to him.',
        person: true,
        talk: {
          topics: [
            [/bell|abbey|tower/, '“Not rung since the abbot went funny. And I mean funny, darling, not my kind of funny. Tom saw him in the orchard at Lammas, on his knees, eating the windfalls. Worms and all. Then he went down into his crypt and the bell stopped.”'],
            [/tom|fisherman|him|lover|husband/, '“Six years. Nobody in this shithole knew, or everybody knew and pretended not to, which is the same thing with better manners.” He strokes the dead man’s swollen knuckles. “Hands like a bear. Cried at weddings. He’d have liked you.”'],
            [/girl|child|maud|stones|maidens/, '“Little Maud? Died in July, and her mam a week after. Her mam baked like a saint and swore like a sailor; I adored her.” He looks away. “If you see Maud up at the stones, you be kind to her. She was always hungry.”'],
            [/crypt|abbot|dark|dead/, '“Don’t go down there without a light. I mean it. Things go down there in the dark and come up a different shape.” He shudders. “And if the abbot looks at you, don’t look back.”'],
            [/well|key|gate|anselm|monk/, '“Brother Anselm came through here weeping about a key and a well. I gave him a drink. I gave him four. He didn’t make sense after any of them, but he kissed me on the forehead when he left, which no monk has ever done sober.”'],
            [/drowned|sailor|reliquary|pools/, '“The sailor in the rock pools? Washed up Tuesday, holding on to something like it was the last of God. Nobody’s had the stomach to look. You might.”'],
            [/wen|yourself|you|kard|player/, '“Me? I was the Magdalene every Easter. Wept real tears at the foot of the cross. The men in the front row wept hardest, and I knew where half of them had been the night before.” A wet grin. “Ask me again when we’re not all dying.”'],
            [/rope|noose/, '“Don’t. I know. Just go and use it for something better.”'],
          ],
          fallback:
            '“I’m a player, darling, not a priest. Ask me about something I know: the bell, Tom, the ' +
            'crypt, the little girl, the well, that poor drowned sod. Or me. I’m very interesting.”',
        },
        on: {
          take: '“Darling, I’m flattered, but you couldn’t carry me. Tom could. Tom did, once, all the way home from the Michaelmas fair.”',
          kiss: 'He laughs, a real one, startled out of him. “Not in front of Tom, you shameless thing. Ask me again at dawn, if there is one.” But he squeezes your hand before he lets it go.',
          hug: 'He stiffens, then leans into you, all bones and stale wine and grief, and shakes for a while. “Right,” he says eventually, into your shoulder. “Right. Go and ring your fucking bell.”',
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
      },
      'tom|fisherman|body|corpse|chair': {
        look: 'Plague. Weeks dead. The swellings have burst and the flies have been at the wet. His eyes are open. You would swear they were closed when you came in.',
        person: true,
        on: {
          take: 'Wen looks at you. “Touch him and I’ll break your fucking arm.” He means it.',
          smell: 'You get close enough to smell him. Wen watches you do it, and you stop.',
          touch: 'Wen’s hand tightens on Tom’s. “Gently.” You touch the dead man’s shoulder, gently. It is like touching a sack of cold water.',
          taste: 'Wen’s eyes narrow. “Try it,” he says softly. You don’t.',
          hit: 'Wen is on his feet before you have finished thinking it, and his face makes you take two steps back. “No.”',
          listen: 'Nothing. Wen is listening too, you realize. He has been listening for hours.',
        },
      },
      'nets|net': {
        look: 'Rotten. They would not hold a sprat.',
        on: { smell: 'Tar and old fish.', touch: 'They come apart in your fingers like wet bread.' },
      },
      oar: 'Split along its length. Useless.',
      stove: { look: 'Cold. It has been cold a long while.', on: { touch: 'Cold iron. It has been cold a long while.' } },
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
    senses: { smell: 'Salt, weed and drowned sailor.', listen: 'Water lapping, in and out.', taste: 'Salt spray.' },
    acts: {
      swim: 'You lower one foot into the pool beside the drowned man. He shifts toward it. You take your foot out.',
    },
    throwTargets: [SEA],
    scenery: {
      'man|drowned|body|corpse|hand|fist|fingers|sailor': {
        look: (s) =>
          s.flags.handOpened
            ? 'His hand lies open, palm up, as if asking for something back. You did not move his head. Somebody did.'
            : 'A sailor, by his clothes, and not long in the water. The crabs have had the soft parts of his face. ' +
              'Something gold shows between his clenched fingers. You could try to open his hand.',
        person: true,
        on: {
          take: 'You are not carrying a drowned man anywhere. Perhaps you could open his hand.',
          smell: 'Salt and weed. He has not been in the water long enough to smell worse. Nearly.',
          touch: 'Soft, cold and wrong, like touching a glove with no hand in it, except that there is a hand in it.',
          taste: 'No.',
          hit: 'You kick him. He rocks in the pool, and settles, and his head is turned a little more toward you than before.',
          listen: 'Water laps in and out of his open mouth, as if he is trying to say something with it.',
        },
      },
      'pools|pool|rocks|rock|water': {
        look: 'Clear as glass, and cold enough to ache.',
        on: { taste: 'Salt, and cold.', touch: 'Cold enough to ache to the elbow.' },
      },
    },
  },
};
