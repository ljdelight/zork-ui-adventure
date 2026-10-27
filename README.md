# The Silent Bell

A dark All Hallows' Eve text adventure in the classic parser style, built with TypeScript and Vite,
on a small engine you can reuse for your own stories.
Every location has its own illustration, drawn as SVG in code, and the pictures change as
you play (rope on the well, gate open, clapper back in the bell, lantern light in dark places).
It runs in desktop and mobile browsers.

## Run it

```sh
npm install
npm run dev       # local dev server
npm run build     # static production build in dist/
npm run preview   # serve the production build
npm test          # engine tests, including a full winning walkthrough
```

`dist/` uses relative paths, so it can be hosted from any static file host or subfolder.

## Playing

Type commands like `north`, `take lantern`, `examine well`, `give cake to girl`, or use
the compass and action buttons. `help` lists commands, `hint` nudges you along, and progress
autosaves in your browser.

### Lazy mode (demo / test mode)

Click **Play for me** in the top bar and the game plays itself: it restarts, types each
command of the walkthrough into the prompt, and plays through to the ending. Click
**Stop demo** or press Esc to take over. Add `?demo` to the URL to start it on page load,
or `?demo=fast` to run at full speed (handy for a quick smoke test). The script lives in
`src/stories/silent-bell/walkthrough.ts` and is the same one the test suite plays.

## Layout

- `src/engine/`: the story-agnostic engine (no DOM, so it is testable)
  - `game.ts`: parser, targeting, rules dispatch, movement and description
  - `actions.ts`: built-in actions (take, open, throw, talk, smell, kick...)
  - `vocabulary.ts`: verbs, acts and stock text
  - `sketch.ts`: the ink-and-wash SVG drawing kit
  - `types.ts`: the `Story` format
- `src/stories/silent-bell/`: The Silent Bell (rooms, items, puzzle rules, scenes, walkthrough)
- `src/story.ts`: which story the app plays
- `src/main.ts`, `src/style.css`, `index.html`: the browser UI
- `tests/`: Vitest suite, including a tiny second story that exercises the engine

## Writing your own story

See [docs/WRITING_A_STORY.md](docs/WRITING_A_STORY.md). In short: make a folder under
`src/stories/`, export a `Story` object, and point `src/story.ts` at it. Rooms and items answer
any verb (smell, lick, kick, roll...) through an `on` map, and puzzles are rules checked before the
engine's defaults.

## Deployment

Every push to `main` runs `.github/workflows/pages.yml`, which tests, builds and publishes
`dist/` to GitHub Pages. In the repository settings, Pages must use **GitHub Actions** as its source.
