import './style.css';
import { Game, type Dir, type Output, type State } from './engine';
import story from './story';

const SAVE_KEY = `${story.id}-save-v2`;
const MAX_LOG_ENTRIES = 400;

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const logEl = $<HTMLDivElement>('log');
const sceneEl = $<HTMLDivElement>('scene');
const captionEl = $<HTMLDivElement>('caption');
const statsEl = $<HTMLDivElement>('stats');
const chipsEl = $<HTMLDivElement>('chips');
const compassEl = $<HTMLDivElement>('compass');
const input = $<HTMLInputElement>('input');

const finePointer = window.matchMedia('(pointer: fine)').matches;

function loadSave(): State | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? (JSON.parse(raw) as State) : null;
  } catch {
    return null;
  }
}

function save(state: State) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable (private mode etc.) — the game still works, just won't persist.
  }
}

const saved = loadSave();
const game = new Game(story, saved ?? undefined);
document.title = story.title;
document.querySelector('.brand')!.textContent = story.title;

// -----------------------------------------------------------------------------
// Rendering

function appendOutput(outputs: Output[]) {
  for (const o of outputs) {
    const el = document.createElement('p');
    el.className = `out out-${o.kind}`;
    el.textContent = o.kind === 'echo' ? `> ${o.text}` : o.text;
    logEl.appendChild(el);
  }
  while (logEl.childElementCount > MAX_LOG_ENTRIES) logEl.firstElementChild?.remove();
  logEl.scrollTop = logEl.scrollHeight;
}

let currentSvg = '';

function updateScene() {
  const svg = story.scene?.(game.state.room, game.state, game.isDark()) ?? '';
  // Scene ids are unique per render, so compare with ids stripped to detect real changes.
  const signature = svg.replace(/s\d+-/g, '');
  if (signature === currentSvg) return;
  const roomChanged = sceneEl.dataset.room !== game.state.room;
  currentSvg = signature;
  sceneEl.dataset.room = game.state.room;

  const layer = document.createElement('div');
  layer.className = 'scene-layer';
  layer.innerHTML = svg;
  if (roomChanged && sceneEl.childElementCount) layer.classList.add('entering');
  sceneEl.appendChild(layer);

  const old = Array.from(sceneEl.children).filter((c) => c !== layer);
  if (layer.classList.contains('entering')) {
    void layer.offsetWidth; // force a reflow so the fade-in transition starts from opacity 0
    layer.classList.remove('entering');
    window.setTimeout(() => old.forEach((o) => o.remove()), 700);
  } else {
    old.forEach((o) => o.remove());
  }
  captionEl.textContent = game.isDark() ? 'Darkness' : game.room.name;
}

function updateStats() {
  const s = game.state;
  statsEl.innerHTML = `<span class="long">Score </span>${s.score}/${story.maxScore}<span class="long"> · Moves ${s.moves}</span>`;
}

function updateCompass() {
  const exits = new Set<Dir>(game.availableExits());
  compassEl.querySelectorAll<HTMLButtonElement>('button[data-dir]').forEach((b) => {
    b.disabled = !exits.has(b.dataset.dir as Dir) || game.state.won;
  });
}

function chip(label: string, command: string, accent = false) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = accent ? 'chip accent' : 'chip';
  b.textContent = label;
  b.dataset.cmd = command;
  return b;
}

/** A short noun for an item, e.g. "brass lantern" -> "lantern". */
const shortName = (id: string) => game.items[id].nouns[1] ?? game.items[id].nouns[0];

function updateChips() {
  chipsEl.replaceChildren();
  if (game.state.won) {
    chipsEl.append(chip('Play again', 'restart', true), chip('Score', 'score'));
    return;
  }
  chipsEl.append(chip('Look', 'look'), chip('Inventory', 'inventory'), chip('Hint', 'hint'));
  const s = game.state;
  const needsLight = game.isDark() || game.room.dark || game.room.exits.down;
  for (const id of game.inventory()) {
    if (game.items[id].lightSource && !game.isLit(id) && needsLight)
      chipsEl.append(chip(`Light ${shortName(id)}`, `light ${shortName(id)}`, true));
  }
  for (const id of game.visibleItems()) chipsEl.append(chip(`Take ${shortName(id)}`, `take ${shortName(id)}`, true));
  for (const c of story.chips?.(game) ?? []) chipsEl.append(chip(c.label, c.command, c.accent));
  for (const id of Object.keys(game.items)) {
    const here = s.items[id] === 'inv' || (s.items[id] === s.room && !game.isDark());
    if (game.items[id].readable && here) chipsEl.append(chip(`Read ${shortName(id)}`, `read ${shortName(id)}`));
  }
}

function refresh() {
  updateScene();
  updateStats();
  updateCompass();
  updateChips();
  save(game.state);
}

// -----------------------------------------------------------------------------
// Input

const history: string[] = [];
let historyIndex = 0;

/** Runs a command typed or tapped by the player. Ignored while the demo is playing. */
function run(command: string) {
  if (demoActive) return;
  if (command.trim().toLowerCase() === 'restart') {
    if (!game.state.won && !window.confirm('Restart from the beginning? Your current progress will be lost.')) return;
    logEl.replaceChildren();
  }
  appendOutput(game.exec(command));
  refresh();
}

// The prompt is deliberately not a <form>: password managers (LastPass especially) treat any
// text box inside a form as a login field and ignore their own opt-out attributes.
function submitPrompt() {
  if (demoActive) return;
  const value = input.value.trim();
  if (!value) return;
  history.push(value);
  historyIndex = history.length;
  input.value = '';
  run(value);
}

$('btn-enter').addEventListener('click', () => {
  submitPrompt();
  if (finePointer) input.focus();
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.isComposing) {
    e.preventDefault();
    submitPrompt();
  } else if (e.key === 'ArrowUp' && historyIndex > 0) {
    historyIndex--;
    input.value = history[historyIndex];
    e.preventDefault();
  } else if (e.key === 'ArrowDown') {
    historyIndex = Math.min(history.length, historyIndex + 1);
    input.value = history[historyIndex] ?? '';
    e.preventDefault();
  }
});

compassEl.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-dir]');
  if (b && !b.disabled) run(b.dataset.dir!);
  if (finePointer) input.focus();
});

chipsEl.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-cmd]');
  if (b) run(b.dataset.cmd!);
  if (finePointer) input.focus();
});

$('btn-help').addEventListener('click', () => run('help'));
$('btn-restart').addEventListener('click', () => run('restart'));

// -----------------------------------------------------------------------------
// Lazy mode: the game plays itself by typing the walkthrough into the prompt.

const demoBtn = $<HTMLButtonElement>('btn-demo');
let demoActive = false;
let demoToken = 0; // bumped to cancel a running demo

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

function setDemoUi(on: boolean) {
  demoActive = on;
  document.body.classList.toggle('demo', on);
  input.readOnly = on;
  input.placeholder = on ? 'Lazy mode is playing…' : 'What do you do?';
  demoBtn.querySelector('.long')!.textContent = on ? 'Stop demo' : 'Play for me';
  demoBtn.querySelector('.short')!.textContent = on ? '■' : '▶';
  demoBtn.setAttribute('aria-label', on ? 'Stop demo' : 'Play for me');
}

function stopDemo() {
  demoToken++;
  input.value = '';
  setDemoUi(false);
}

async function startDemo(fast = false) {
  if (game.state.moves > 0 && !game.state.won) {
    if (!window.confirm('Lazy mode restarts the game and plays it for you. Your current progress will be lost.')) return;
  }
  const token = ++demoToken;
  const canceled = () => token !== demoToken;
  const typeDelay = fast ? 0 : 55;
  const thinkDelay = fast ? 120 : 1200;

  setDemoUi(true);
  logEl.replaceChildren();
  appendOutput(game.exec('restart').filter((o) => o.kind !== 'echo'));
  appendOutput([{ kind: 'system', text: 'LAZY MODE DEMO — sit back and watch. Press Stop demo (or Esc) to take over.' }]);
  refresh();

  for (const command of story.walkthrough ?? []) {
    await sleep(thinkDelay);
    for (const ch of command) {
      if (canceled()) return;
      input.value += ch;
      if (typeDelay) await sleep(typeDelay + Math.random() * 40);
    }
    await sleep(fast ? 0 : 300);
    if (canceled()) return;
    input.value = '';
    appendOutput(game.exec(command));
    refresh();
  }
  stopDemo();
}

demoBtn.addEventListener('click', () => (demoActive ? stopDemo() : void startDemo()));

// Desktop: typing anywhere goes to the prompt. Arrow keys outside the prompt move the player.
document.addEventListener('keydown', (e) => {
  if (demoActive) {
    if (e.key === 'Escape') stopDemo();
    return;
  }
  if (e.target === input || e.metaKey || e.ctrlKey || e.altKey) return;
  const arrows: Record<string, Dir> = { ArrowUp: 'north', ArrowDown: 'south', ArrowLeft: 'west', ArrowRight: 'east' };
  if (arrows[e.key] && (e.target as HTMLElement).tagName !== 'INPUT') {
    e.preventDefault();
    run(arrows[e.key]);
    return;
  }
  if (e.key.length === 1) input.focus();
});

// -----------------------------------------------------------------------------
// Boot

appendOutput(game.start(!!saved));
refresh();
if (finePointer) input.focus();

// Test hook: ?demo starts lazy mode on load, ?demo=fast plays it at full speed.
const demoParam = new URLSearchParams(location.search).get('demo');
if (demoParam !== null) void startDemo(demoParam === 'fast');
