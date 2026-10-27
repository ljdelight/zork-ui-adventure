# Writing your own story

The engine in `src/engine/` knows nothing about any particular story. A story is one plain object
(`Story`, defined in `src/engine/types.ts`) holding rooms, items, puzzle rules and optional extras.
The Silent Bell in `src/stories/silent-bell/` is a complete example, and `tests/engine.test.ts` has
a ten-minute one.

## 1. Make a folder and point the app at it

```
src/stories/my-story/
  index.ts       // exports the Story
  rooms.ts       // split by region once it grows (see silent-bell/rooms/)
  items.ts
  rules.ts
```

Then in `src/story.ts`:

```ts
export { default } from './stories/my-story';
```

## 2. The minimum

```ts
import type { Story } from '../../engine';

const story: Story = {
  id: 'my-story',             // also names the save slot
  title: 'The Lighthouse',
  subtitle: 'A short tale of the sea.',
  start: 'shore',
  maxScore: 20,
  rooms: {
    shore: {
      id: 'shore',
      name: 'Shore',
      description: 'Pebbles and spray. A lighthouse stands to the north.',
      exits: { north: 'lamproom' },
    },
    // ...
  },
  items: {},
};
export default story;
```

That is already playable: movement, LOOK, EXAMINE, TAKE, DROP, INVENTORY, HELP, SCORE and so on all work.

## 3. Things in rooms, and every whacky verb

Scenery is keyed by pipe-separated nouns; the first noun is the thing's id. A bare string is just
its description. An object can also answer any verb through `on`:

```ts
scenery: {
  'keeper|man|old man': {
    look: 'An old keeper with one eye.',
    person: true,                       // gets "person" stock replies, can be given things
    on: {
      smell: 'Pipe smoke and paraffin.',
      taste: '“Not on a first date.”',
      hit: 'He catches your wrist. He is stronger than he looks.',
      take: '“Hands off.”',             // refusal when someone tries to pick him up
      kiss: 'He laughs until he coughs.',
    },
  },
  pebbles: 'Gray and round.',
},
```

Items work the same way: `on` on an `Item` answers verbs about it.

The action ids you can respond to (see `src/engine/vocabulary.ts` for every verb mapped to each):

| Action    | Some verbs that reach it                          |
| --------- | ------------------------------------------------- |
| `smell`   | smell, sniff, inhale                              |
| `taste`   | taste, lick, chew, nibble, suck                   |
| `touch`   | touch, feel, finger, rub, poke, stroke, tickle    |
| `listen`  | listen (to), hear                                 |
| `shake`   | shake, rattle, wiggle, swing                      |
| `roll`    | roll, juggle                                      |
| `turn`    | turn, twist, spin, flip                           |
| `hit`     | hit, kick, punch, slap, strike, headbutt          |
| `break`   | break, smash, tear, snap                          |
| `pull`    | pull, tug, yank, lift                             |
| `push`    | push, shove, press                                |
| `squeeze` | squeeze, pinch, crumple                           |
| `wear`    | wear, put on, try on                              |
| `polish`  | polish, clean, wipe, wash                         |
| `burn`    | burn, set fire to (needs a lit light source)      |
| `eat`     | eat, bite (falls back to the `taste` response)    |
| `open`, `close`, `unlock`, `lock`, `untie`, `kiss`, `hug` | the obvious ones |

Anything without its own response gets stock text, with separate wording for objects, scenery
and people. Smell, taste, touch and listen still work in the dark.

Rooms can answer a **bare** sense ("smell", "listen", "feel around") with `senses`, and give their own
replies to object-less acts (dance, sing, pray, jump, scream, sleep, swim, dig, spit, fart...) with `acts`:

```ts
senses: { smell: 'Brine and gull droppings.', listen: 'Surf.' },
acts: { dance: 'You dance on the pebbles. A gull watches, unimpressed.' },
```

## 4. Items

```ts
lamp: {
  id: 'lamp', name: 'storm lamp', nouns: ['storm lamp', 'lamp'], start: 'shore',
  description: 'A battered storm lamp.',
  lightSource: true,          // LIGHT/EXTINGUISH it; lit, it lights dark rooms. Flag: lampLit
  readable: undefined,        // text for READ
  treasure: 10,               // points on first pickup, and counts as a treasure
  points: undefined,          // points on first pickup, not a treasure
  firstTake: 'You prise it from the rocks. Taken.',
  on: { light: 'The wick catches.', throw: 'It lands with a clank.' },
},
```

Item locations are a room id, `'inv'` (carried) or `'nowhere'` (not in play yet, or gone).

## 5. Puzzles are rules

A rule is checked before the engine's default behavior. The first rule whose filters all match wins.

```ts
rules: [
  // Say something and stop.
  { on: 'open', obj: 'door', when: (g) => !g.state.flags.doorUnlocked, say: 'It is locked.' },

  // Do something. Return true if it should count as a move.
  {
    on: ['unlock', 'open'],
    obj: 'door',
    do: (g) => {
      if (!g.has('key')) { g.say('You have no key.'); return false; }
      g.state.flags.doorUnlocked = true;
      g.say('The lock turns.');
      g.award('door', 10);
      return true;
    },
  },

  // Two nouns: PUT X ON Y, GIVE X TO Y, TIE X TO Y, THROW X AT Y.
  { on: 'give', obj: 'apple', second: 'keeper', do: (g) => { /* ... */ return true; } },

  // Your own verbs: map them in `verbs`, then catch them here.
  { on: 'wind', obj: 'lamp', do: (g) => { g.say('The beam sweeps the sea.'); g.award('lamp', 10); g.win(); return true; } },
],
verbs: { wind: 'wind', crank: 'wind' },
```

Filters: `on` (action ids), `obj` and `second` (target ids), `room`, and `when(g, cmd)` for anything
else. `cmd` also gives you `verb` (as typed, e.g. "kick"), `prep` and `secondPhrase`.

Useful `Game` methods inside rules: `say`, `system`, `award(key, points)`, `win()`, `has(itemId)`,
`move(dir)`, `describeRoom()`, `isLit(itemId)`, and `state` (`room`, `items`, `flags`, `score`...).

The engine checks a few things before your rules, so you don't have to: DROP, PUT, TIE and THROW need
the object carried, GIVE needs a person to give to, and BURN needs a lit light source.

## 6. People and conversation

```ts
'keeper|man': {
  look: 'An old keeper.',
  person: true,
  talk: {
    greeting: '“Evening.”',                       // TALK TO KEEPER
    topics: [[/lamp|light/, '“Wind it, or ships die.”']],  // ASK KEEPER ABOUT THE LAMP
    fallback: '“Couldn’t say.”',
  },
},
```

TALK with no name speaks to the only talker in the room. For a first meeting that changes things,
add a rule: `{ on: 'talk', obj: 'keeper', when: (g) => !g.state.flags.met, do: ... }`.

## 7. The rest of the room

- `guards: { north: (s) => (s.flags.doorOpen ? null : 'The door is shut.') }` blocks an exit.
- `dark: true` (+ optional `darkText`) needs a lit light source to see.
- `peril: { text, exit }` throws the player out if they arrive in the dark.
- `ambience: [...]` lines play now and then as the player acts.
- `enter: 'north'` is where ENTER goes.
- `throwTargets: [{ match: /\bsea\b/, to: 'nowhere', text: 'The sea takes the {item}.' }]` sends
  THROW X INTO THE SEA somewhere other than the floor.

## 8. Optional extras on the story

- `hint(g)` returns a nudge for HINT.
- `texts` overrides any stock wording (generic replies, person replies, help, the after-win line...).
- `acts` adds new object-less verbs, or changes the default text of existing ones:
  `acts: { polka: { verbs: ['polka'], text: 'You polka, badly.' } }`.
- `phrasal` adds multi-word verbs: `[[/^wind up\b/, 'wind']]`.
- `walkthrough` is a full solution, used by the "Play for me" demo and worth testing (see
  `tests/silent-bell.test.ts`).
- `chips(g)` adds quick-action buttons for the current situation.
- `scene(roomId, state, dark)` returns an SVG string for the picture. `src/engine/sketch.ts` has a
  drawing kit (sky, ridges, fog, trees, stone walls, arches, figures, the ink-and-wash renderer) and
  `renderSketch(scenes, roomId, state, dark)` to drive it; `silent-bell/scenes/` shows it in use.
