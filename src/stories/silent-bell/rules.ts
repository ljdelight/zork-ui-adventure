import type { Game } from '../../engine/game';
import type { Cmd, Rule } from '../../engine/types';

const flags = (g: Game) => g.state.flags;

/** True if a throw is aimed somewhere this room sends things ("down the well", "off the tower"). */
const aimedAway = (g: Game, c: Cmd) =>
  !!c.prep && !!g.room.throwTargets?.some((t) => t.match.test(`${c.prep} ${c.secondPhrase}`));

function meetWen(g: Game): boolean {
  flags(g).wenMet = true;
  g.state.items.rope = 'inv';
  g.say(
    'The young man by the stove does not look up. “If you’ve come to rob Tom, you’re late. If ' +
      'you’ve come to pray over him, you can fuck right off; he hated priests, and priests hated us.” ' +
      'He wipes his nose on a green sleeve and drags a hand through his beard. “Wen Kard. Player, singer, the finest Mary Magdalene in four ' +
      'counties, and kisser of other women’s husbands. Tom was the only one I ever kept.”\n\n' +
      'Then he sees the lantern, and you, properly. “Oh, Christ. You’re going up to the abbey. Brave ' +
      'little bastard.” He nudges a coil of rope by his knee. The end of it is tied in a noose. ' +
      '“Take that. I walked it out here meaning to do something stupid, and Tom would haunt me for it, and ' +
      'God knows there’s enough haunting going round tonight.” He shoves it at you. “Go on. ' +
      'Before I change my mind.”\n\nYou pick the noose apart with cold fingers. Now you have a coil of rope.',
  );
  return true;
}

function tieRope(g: Game): boolean {
  g.state.items.rope = 'nowhere';
  flags(g).ropeTied = true;
  g.say(
    'You loop the rope twice around the crossbeam and pull the knot tight. The free end ' +
      'uncoils down into the shaft and slaps against water far below.',
  );
  g.award('rope', 5);
  return true;
}

function untieRope(g: Game): boolean {
  flags(g).ropeTied = false;
  g.state.items.rope = 'inv';
  g.say('You haul the rope up, hand over hand, and coil it over your shoulder.');
  return true;
}

function unlockGate(g: Game): boolean {
  if (g.state.room !== 'abbeygate') {
    g.say('There is nothing here that key would fit.');
    return false;
  }
  if (flags(g).gateOpen) {
    g.say('The gate is already open.');
    return false;
  }
  if (!g.has('key')) {
    g.say("You don't have anything that fits the lock.");
    return false;
  }
  flags(g).gateOpen = true;
  g.say(
    'The iron key grinds in the lock, sticks, and then turns with a crack like a breaking bone. ' +
      'You put your shoulder to the gate and it swings inward, shrieking.',
  );
  g.award('gate', 10);
  return true;
}

function openGate(g: Game): boolean {
  if (flags(g).gateOpen) g.say('It is already open.');
  else if (g.has('key')) return unlockGate(g);
  else g.say('It is locked. You would need a key.');
  return false;
}

function openHand(g: Game): boolean {
  if (flags(g).handOpened) {
    g.say('His hand is already open. It stays open.');
    return false;
  }
  flags(g).handOpened = true;
  g.state.items.reliquary = 'tidepools';
  g.say(
    'You kneel in the freezing water and pry his fingers open, one by one. They are soft, like ' +
      'dough. The last one does not want to let go, and then, all at once, it does. A small gold ' +
      'reliquary drops into the pool.\n\nWhen you look up, his face is turned toward you. You did not turn it.',
  );
  return true;
}

function hangClapper(g: Game): boolean {
  g.state.items.clapper = 'nowhere';
  flags(g).clapperHung = true;
  g.say(
    'Straining, you heave the clapper up inside the bell and hook its iron loop over the empty ' +
      'hook. It settles into place with a low, expectant hum that you feel in your teeth.',
  );
  g.award('hang', 10);
  return true;
}

function feedGirl(g: Game, c: Cmd): boolean {
  if (!c.obj && !g.has('cake')) {
    g.say("You aren't holding anything like that.");
    return false;
  }
  g.state.items.cake = 'nowhere';
  flags(g).childFed = true;
  g.state.items.ring = 'stones';
  g.say(
    'You hold out the soul cake. She takes it in both hands, the way small children do, and eats it ' +
      'in careful bites, and where the crumbs fall the frost melts. “Mam used to make these,” ' +
      'she says. “She’s waiting in the fields with the others. Ring it soon. They’re so tired.”\n\n' +
      'Then the hood is empty and falls in on itself, and is not there at all. Something lies in the ' +
      'frost where she sat: a silver ring.',
  );
  return true;
}

function burnNote(g: Game): boolean {
  g.state.items.note = 'nowhere';
  g.say(
    'You hold the letter to the flame. It curls, blackens, and goes up in a little rush of light. ' +
      'Anselm’s last words drift away as smoke. You find you remember every one of them anyway.',
  );
  return true;
}

function ringBell(g: Game): boolean {
  if (g.state.room !== 'belfry') {
    g.say('There is no bell here.');
    return false;
  }
  if (!flags(g).clapperHung) {
    g.say(
      'You thump the bronze with your fist. It produces a dull, disappointed thunk. ' +
        'A bell without a clapper is no bell at all.',
    );
    return false;
  }
  g.say(
    'You set your shoulder to the great rim and push. Slowly, slowly the bell swings out over ' +
      'the drop — and back — and the clapper meets the bronze.',
  );
  g.say('BONNNNNNG.');
  g.say(
    'The note rolls out over the graves, the orchard, the village, the fields. Down in the fields ' +
      'the figures lift their faces toward it, all together, the way a congregation looks up at the ' +
      'elevation of the Host. Then, one by one, they lie down, and the ground takes them back.\n\n' +
      'Last of all, at the edge of the dead orchard, a woman in a gray shawl raises her hand to you. ' +
      'It is your mother’s wave; you would know it anywhere. Then she lies down too.\n\n' +
      'Deep beneath the abbey, something that is not a man screams in fury, and falls silent. ' +
      'The bell goes on humming for a long time. In the east, the sky is graying. It is All Saints’ Day.' +
      (flags(g).wenMet
        ? '\n\nWhen you come down at last, Wen Kard is sitting on the abbey steps in his ruined green coat, the dawn lighting his hair and beard like a bonfire, ' +
          'with Tom’s old wool cap in his lap, swearing quietly and magnificently at the sunrise. He looks up. ' +
          '“Well,” he says. “Fuck me. You actually did it.” He holds out a hand for you to help him up, ' +
          'and doesn’t let go of yours straight away. “Come on. Somebody has to bury Tom properly, and ' +
          'I’m not doing it in these shoes.”'
        : ''),
  );
  g.award('bell', 25);
  g.win();
  return true;
}

export const RULES: Rule[] = [
  // Wen and the rope
  { on: 'talk', obj: 'wen', when: (g) => !flags(g).wenMet, do: meetWen },

  // The well
  {
    on: 'take',
    obj: 'rope',
    room: ['well', 'wellbottom'],
    when: (g) => !!flags(g).ropeTied,
    say: (g) => (g.state.room === 'well' ? 'You would need to untie it first.' : 'It is tied fast at the top.'),
  },
  { on: ['tie', 'put'], obj: 'rope', room: 'well', do: tieRope },
  { on: ['tie', 'put'], obj: 'rope', say: 'There is nothing here worth tying the rope to.' },
  { on: 'untie', obj: 'rope', room: 'well', when: (g) => !!flags(g).ropeTied, do: untieRope },
  { on: 'untie', obj: 'rope', room: 'wellbottom', when: (g) => !!flags(g).ropeTied, say: 'You can only reach the knot from the top.' },

  // The abbey gate
  { on: 'open', obj: ['gate', 'lock'], do: openGate },
  { on: 'unlock', obj: ['gate', 'lock'], do: unlockGate },
  { on: 'unlock', room: 'abbeygate', when: (_, c) => !c.objPhrase, do: unlockGate },
  { on: ['put', 'tie'], obj: 'key', room: 'abbeygate', do: unlockGate },
  { on: 'close', obj: 'gate', when: (g) => !!flags(g).gateOpen, say: 'The gate is rusted open now. It is not going anywhere.' },

  // The drowned sailor
  { on: ['open', 'search'], obj: 'man', room: 'tidepools', do: openHand },
  { on: 'close', obj: 'man', when: (g) => !!flags(g).handOpened, say: 'You are not touching him again.' },

  // Maud
  { on: 'give', second: 'girl', when: (g) => !!flags(g).childFed, say: 'There is no one here. You hope.' },
  {
    on: 'give',
    second: 'girl',
    when: (_, c) => !!c.obj && c.obj.id !== 'cake',
    say: (_, c) => `She does not look at the ${c.obj!.name}. “That’s not for us,” she says. “You know what’s for us.”`,
  },
  { on: 'give', second: 'girl', do: feedGirl },

  // The clapper and the bell
  { on: ['put', 'tie'], obj: 'clapper', room: 'belfry', do: hangClapper },
  {
    on: ['put', 'tie'],
    obj: 'clapper',
    say: (_, c) => (c.secondPhrase ? `That doesn't belong on the ${c.secondPhrase}.` : 'There is nowhere here to put it.'),
  },
  {
    on: ['ring', 'hit', 'push', 'shake'],
    obj: 'bell',
    when: (_, c) => c.action === 'ring' || ['hit', 'strike', 'push', 'swing'].includes(c.verb),
    do: ringBell,
  },
  {
    on: ['ring', 'hit', 'push'],
    when: (g, c) => !c.objPhrase && (c.action === 'ring' || (g.state.room === 'belfry' && ['hit', 'strike', 'push'].includes(c.verb))),
    do: ringBell,
  },

  // Things you should not throw
  { on: 'throw', obj: 'lantern', say: 'You draw back your arm, and then you think about the dark. You keep hold of the lantern.' },
  { on: 'throw', obj: 'rope', room: 'well', when: aimedAway, say: 'You would rather keep hold of one end. Perhaps tie it to the crossbeam.' },
  { on: 'throw', obj: 'clapper', room: 'belfry', when: aimedAway, say: 'You did not drag it all the way up here to throw it off the tower.' },
  {
    on: 'throw',
    room: ['shore', 'tidepools'],
    when: (g, c) => aimedAway(g, c) && c.obj?.id !== 'note',
    say: (_, c) =>
      `You draw back your arm, and the sea goes very quiet, as if waiting for the ${c.obj!.name}. ` +
      'You lower your arm. Whatever it wants, it is not having that.',
  },
  {
    on: 'throw',
    second: 'wen',
    say: (_, c) => `Wen catches the ${c.obj!.name} one-handed without looking up, and lobs it straight back to you. “Manners.”`,
  },

  { on: 'burn', obj: 'note', when: (g) => g.has('note'), do: burnNote },
  { on: 'xyzzy', say: 'A hollow voice whispers: “Wrong story, friend.”' },
];
