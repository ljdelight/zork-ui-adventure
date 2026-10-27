# The Silent Bell

A dark All Hallows' Eve text adventure in the classic parser style, built with TypeScript and Vite.
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
`src/walkthrough.ts` and is the same one the test suite plays.

## Layout

- `src/world.ts`: rooms, items and descriptions (the game content)
- `src/engine.ts`: parser and game rules (no DOM, so it is testable)
- `src/scenes.ts`: procedural SVG illustration for each room
- `src/main.ts`, `src/style.css`, `index.html`: the browser UI
- `tests/`: Vitest suite

## Deployment

Every push to `main` runs `.github/workflows/pages.yml`, which tests, builds and publishes
`dist/` to GitHub Pages. In the repository settings, Pages must use **GitHub Actions** as its source.
