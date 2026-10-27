import type { Game } from '../../engine/game';
import type { Story } from '../../engine/types';
import { ITEMS } from './items';
import { ABBEY } from './rooms/abbey';
import { COAST } from './rooms/coast';
import { VILLAGE } from './rooms/village';
import { RULES } from './rules';
import { renderScene } from './scenes';
import { WALKTHROUGH } from './walkthrough';

function hint(g: Game): string {
  const s = g.state;
  const f = s.flags;
  if (!g.has('lantern') && s.items.lantern === 'cottage')
    return 'Read the letter nailed to your door, and take the lantern. You will want light. The soul cake is for someone, too.';
  if (!f.ropeTied && s.items.key === 'wellbottom') {
    if (!g.has('rope'))
      return 'The orchard well is too deep to climb. Someone in the fisherman’s hut on the strand is still alive. Talk to him.';
    return 'Try tying the rope to the well.';
  }
  if (s.items.key === 'wellbottom') return 'Something waits at the bottom of the well. Make sure your lantern is lit.';
  if (!f.gateOpen) return 'That iron key must fit the abbey gate.';
  if (s.items.clapper === 'crypt')
    return 'The monks carried the clapper down among their dead. The crypt is under the cloister — bring a light.';
  if (!f.clapperHung) return 'Carry the clapper up the tower and hang it in the bell.';
  if (!s.won) return 'Ring the bell!';
  return 'You have done everything that matters.';
}

export const SILENT_BELL: Story = {
  id: 'silent-bell',
  title: 'The Silent Bell',
  subtitle: "A tale of All Hallows' Eve, in the year of the Pestilence.",
  start: 'cottage',
  maxScore: 100,
  rooms: { ...VILLAGE, ...ABBEY, ...COAST },
  items: ITEMS,
  rules: RULES,
  verbs: { ring: 'ring', toll: 'ring', peal: 'ring', xyzzy: 'xyzzy', plugh: 'xyzzy' },
  hint,
  walkthrough: WALKTHROUGH,
  scene: renderScene,
  chips: (g) => (g.state.room === 'ferryhut' && !g.state.flags.wenMet ? [{ label: 'Talk to him', command: 'talk to man', accent: true }] : []),

  acts: {
    jump: { text: 'You jump on the spot. The frost crunches. Nobody is watching. You hope.' },
    dance: {
      text:
        'You dance a few steps of a jig, alone, on All Hallows’ Eve, in a dead village. It is the bravest and ' +
        'stupidest thing you have done all night.',
    },
    sing: { text: 'You sing a verse of something your mother used to sing. Your voice sounds very small out here.' },
    pray: {
      verbs: ['cross'],
      text: 'You pray. The words come out in the wrong order. Nobody seems to be listening, or worse, somebody is.',
    },
    cry: { text: 'You cry for a while, quietly, for your mother and your brothers and the whole stupid village. It helps more than you’d expect.' },
    shout: { text: 'You scream. The sound goes out across the dead land, and nothing comes back. Not even an echo.' },
    sleep: { text: 'You cannot sleep. Not tonight. Not until the bell rings.' },
    sit: { text: 'You sit a moment in the frost and get your breath back.' },
    dig: { text: 'The ground is frozen hard. You have no spade and, frankly, no business.' },
    spit: { text: 'You spit. It freezes before it lands.' },
    curse: { text: 'You swear, long and inventively. Wen would be proud.' },
    laugh: { text: 'You laugh. It comes out wrong, and you stop.' },
    wave: { text: 'You wave at no one. After a moment, somewhere out in the dark, something waves back.' },
    clap: { text: 'You clap your hands. The sound falls dead, as if the air is too thick to carry it.' },
    knock: { text: 'You knock on nothing in particular. Something, somewhere, knocks back.' },
    piss: { text: 'Not here. Not with all of them watching.' },
    fart: { text: 'Your body betrays you. In the hush of the dead night it is very loud. Somewhere, the dead are judging you.' },
    cough: { text: 'You cough. The sound goes on a little longer than you made it.' },
    think: { text: 'You think about the bell, and the clapper, and the dark. Mostly the dark. (HINT might help.)' },
    bow: { text: 'You bow to the night. The night does not bow back.' },
    hide: { text: 'There is nowhere to hide from what is out tonight. You hide anyway, briefly, behind your hands.' },
  },

  texts: {
    generic: {
      smell: (n) => `The ${n} smells of frost and old smoke, like everything else tonight.`,
      taste: (n, sc) =>
        sc
          ? `You put your tongue to the ${n}. Cold and bitter, and you will be tasting it for an hour.`
          : `You lick the ${n}. It tastes of cold and dirt, and you feel foolish.`,
      touch: (n) => `The ${n} is cold, and a little damp, the way everything is tonight.`,
      squeeze: (n) => `You squeeze the ${n}. It doesn’t squeeze back. Thank God.`,
      polish: (n) => `You rub the ${n} with your sleeve. It is still grimy, but you feel better.`,
      burn: (n) => `You hold the lantern flame to the ${n}. It blackens, stinks, and refuses to burn.`,
    },
    person: {
      smell: 'You lean in and sniff. The grave. Everyone smells of the grave tonight.',
      taste: 'No. Whatever else happens tonight, not that.',
      touch: 'You reach out, and then your hand decides for you, and comes back.',
      listen: 'Not a breath. Not a heartbeat. You listen longer than you should.',
      hit: 'Violence will not help. Very little will.',
      eat: 'No. Whatever else happens tonight, not that.',
    },
    alone: {
      smell: 'Frost and woodsmoke, and under it the sweetish rot that has hung over everything since summer.',
      taste: 'The air tastes of frost and old smoke.',
      listen: 'Wind. And under the wind, nothing. Which is somehow worse.',
      roll: 'You roll about in the frost. Nobody sees. Small mercies.',
      turn: 'You turn around. Nothing is behind you. Now.',
    },
    blunder: 'You blunder into cold stone. Not that way.',
    wait: 'Time passes. The wind keeps its own counsel.',
    noReply: 'Nobody answers. Out here, that is the best you can hope for.',
    afterWin: 'The bell has rung, and the dead are sleeping. Type RESTART to play again.',
    restart: 'You close your eyes, and the evening begins again.',
    help: [
      'Explore by typing short commands, or use the compass and buttons.',
      '',
      'MOVING:  north (n), south (s), east (e), west (w), up (u), down (d)',
      'LOOKING: look (l), examine (x) <thing>, read <thing>',
      'THINGS:  take <thing>, drop <thing>, inventory (i), open, unlock',
      'OTHER:   light/extinguish lantern, tie, give <thing> to <someone>, ring',
      'SENSES:  smell, taste, touch, listen, and anything else you might try:',
      '         kick, lick, roll, shake, throw, pray, dance, sing...',
      'META:    score, hint, again (g), restart',
      '',
      'Your progress is saved automatically in this browser.',
    ].join('\n'),
  },
};

export default SILENT_BELL;
