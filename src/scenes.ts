import type { State } from './types';

/**
 * Procedural SVG illustrations, one per location. Each scene reads game state so the
 * picture reflects what the player has done (rope tied, gate open, items taken...).
 * Everything is drawn in a 640x360 viewBox.
 */

const W = 640;
const H = 360;

let sceneCounter = 0;

class Ctx {
  defs: string[] = [];
  body: string[] = [];
  private prefix = `s${++sceneCounter}`;
  private n = 0;

  constructor(public seed: number) {}

  id(name: string) {
    return `${this.prefix}-${name}-${this.n++}`;
  }

  rand = () => {
    this.seed = (this.seed * 1664525 + 1013904223) >>> 0;
    return this.seed / 4294967296;
  };

  range(a: number, b: number) {
    return a + this.rand() * (b - a);
  }

  add(...parts: string[]) {
    this.body.push(...parts);
  }

  linear(stops: [number, string, number?][], x2 = 0, y2 = 1): string {
    const id = this.id('lg');
    this.defs.push(
      `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops
        .map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op !== undefined ? ` stop-opacity="${op}"` : ''}/>`)
        .join('')}</linearGradient>`,
    );
    return `url(#${id})`;
  }

  radial(stops: [number, string, number?][], cx = 0.5, cy = 0.5, r = 0.5): string {
    const id = this.id('rg');
    this.defs.push(
      `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops
        .map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op !== undefined ? ` stop-opacity="${op}"` : ''}/>`)
        .join('')}</radialGradient>`,
    );
    return `url(#${id})`;
  }

  /**
   * Renders the scene as an ink-and-wash sketch: each shape is drawn as a color wash and then
   * immediately outlined in pen (so nearer shapes still cover the lines behind them), the whole
   * picture is given a hand-drawn wobble, and cross-hatching and paper grain go on top.
   */
  render(): string {
    const p = this.prefix;
    const art = this.body
      .map((part) => `${part}<g class="ink">${part}</g><g class="ink ink2" transform="translate(1.4 -0.9)">${part}</g>`)
      .join('');
    const filters =
      // Hand-drawn wobble: edges pushed around by low-frequency noise, colors slightly muted.
      `<filter id="${p}-wash" x="-2%" y="-2%" width="104%" height="104%" color-interpolation-filters="sRGB">` +
      `<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="4" result="n"/>` +
      `<feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G" result="d"/>` +
      `<feColorMatrix in="d" type="saturate" values="0.8"/></filter>` +
      // Paper grain.
      `<filter id="${p}-paper" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" seed="9" stitchTiles="stitch"/>` +
      `<feColorMatrix type="matrix" values="0 0 0 0 0.92  0 0 0 0 0.86  0 0 0 0 0.74  0.55 0 0 0 -0.18"/></filter>` +
      // Cross-hatching, faded in toward the edges of the picture.
      `<pattern id="${p}-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">` +
      `<line x1="0" y1="0" x2="0" y2="7" stroke="#120c08" stroke-width="1.1"/></pattern>` +
      `<pattern id="${p}-hatch2" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-52)">` +
      `<line x1="0" y1="0" x2="0" y2="9" stroke="#120c08" stroke-width="0.9"/></pattern>` +
      `<radialGradient id="${p}-edge" cx="0.5" cy="0.5" r="0.72"><stop offset="0.3" stop-color="#000"/><stop offset="1" stop-color="#fff"/></radialGradient>` +
      `<radialGradient id="${p}-edge2" cx="0.5" cy="0.5" r="0.72"><stop offset="0.55" stop-color="#000"/><stop offset="1" stop-color="#fff"/></radialGradient>` +
      `<mask id="${p}-m1"><rect width="${W}" height="${H}" fill="url(#${p}-edge)"/></mask>` +
      `<mask id="${p}-m2"><rect width="${W}" height="${H}" fill="url(#${p}-edge2)"/></mask>`;
    // In each pen copy the shape becomes an outline. Glows, fog and other translucent effects,
    // and shapes that are already just strokes, are left out so they don't get outlined.
    // Mid-tone shapes (stone, wood, cloth) also get pen hatching inside them, like shading in an ink drawing.
    const k = `.${p} .ink`;
    const style =
      `<style>${k} *{fill:none!important;stroke:#140e0a;stroke-opacity:0.85;stroke-width:1.15px;stroke-linejoin:round;stroke-linecap:round}` +
      `.${p} .ink2 *{stroke-opacity:0.4;stroke-width:0.8px}` +
      `${k}:not(.ink2) :is([fill^="#3"],[fill^="#4"],[fill^="#5"],[fill^="#6"],[fill^="#7"],[fill^="#8"]){fill:url(#${p}-hatch)!important;fill-opacity:0.38}` +
      `${k} line,${k} [fill="none"],${k} [opacity],${k} [fill*="-rg-"],${k} text{display:none}</style>`;
    return (
      `<svg class="${p}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">` +
      `<defs>${filters}${this.defs.join('')}</defs>${style}` +
      `<rect width="${W}" height="${H}" fill="#0e0b10"/>` +
      // Scaled up a touch so the wobble never pulls the picture's edges inside the frame.
      `<g filter="url(#${p}-wash)"><g transform="translate(-10 -6) scale(1.032)">${art}</g></g>` +
      `<rect width="${W}" height="${H}" fill="url(#${p}-hatch)" mask="url(#${p}-m1)" opacity="0.9"/>` +
      `<rect width="${W}" height="${H}" fill="url(#${p}-hatch2)" mask="url(#${p}-m2)" opacity="0.85"/>` +
      `<rect width="${W}" height="${H}" filter="url(#${p}-paper)" style="mix-blend-mode:multiply" opacity="0.6"/>` +
      `</svg>`
    );
  }
}

// -----------------------------------------------------------------------------
// Primitives

const rect = (x: number, y: number, w: number, h: number, fill: string, extra = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
const circle = (cx: number, cy: number, r: number, fill: string, extra = '') =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${extra}/>`;
const ellipse = (cx: number, cy: number, rx: number, ry: number, fill: string, extra = '') =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const path = (d: string, fill: string, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const poly = (pts: [number, number][], fill: string, extra = '') =>
  `<polygon points="${pts.map((p) => p.join(',')).join(' ')}" fill="${fill}" ${extra}/>`;
const line = (x1: number, y1: number, x2: number, y2: number, stroke: string, w = 1, extra = '') =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${w}" ${extra}/>`;

function sky(c: Ctx, stops: [number, string][]) {
  c.add(rect(0, 0, W, H, c.linear(stops)));
}

function stars(c: Ctx, count: number, maxY: number, opacity = 0.8) {
  for (let i = 0; i < count; i++) {
    const r = c.rand() < 0.15 ? 1.6 : 0.9;
    c.add(circle(c.range(0, W), c.range(0, maxY), r, '#fff', `opacity="${(c.range(0.3, 1) * opacity).toFixed(2)}"`));
  }
}


/** A rolling ridge line from baseY, filled down to the bottom. */
function ridge(c: Ctx, baseY: number, amp: number, fill: string, freq = 1) {
  const p1 = c.range(0, 6);
  const p2 = c.range(0, 6);
  let d = `M0,${H} L0,${baseY}`;
  for (let x = 0; x <= W; x += 16) {
    const y = baseY - amp * (0.6 * Math.sin((x / W) * 5 * freq + p1) + 0.4 * Math.sin((x / W) * 13 * freq + p2));
    d += ` L${x},${y.toFixed(1)}`;
  }
  d += ` L${W},${H} Z`;
  c.add(path(d, fill));
}

function tufts(c: Ctx, y0: number, y1: number, count: number, color: string) {
  for (let i = 0; i < count; i++) {
    const x = c.range(0, W);
    const y = c.range(y0, y1);
    const s = 0.5 + ((y - y0) / (y1 - y0 || 1)) * 1.2;
    c.add(
      path(
        `M${x},${y} l${-3 * s},${-10 * s} l${3 * s},${7 * s} l${1 * s},${-12 * s} l${2 * s},${11 * s} l${4 * s},${-9 * s} l${-2 * s},${12 * s} Z`,
        color,
      ),
    );
  }
}


function stoneWall(c: Ctx, x: number, y: number, w: number, h: number, base: string, mortar: string, bh = 18) {
  c.add(rect(x, y, w, h, mortar));
  let row = 0;
  for (let yy = y; yy < y + h; yy += bh, row++) {
    let xx = x - (row % 2 ? 18 : 0);
    while (xx < x + w) {
      const bw = c.range(28, 46);
      const bx = Math.max(xx, x);
      const bwClamped = Math.min(xx + bw, x + w) - bx;
      if (bwClamped > 2) {
        const shade = c.range(-0.08, 0.08);
        c.add(rect(bx + 1, yy + 1, bwClamped - 2, Math.min(bh, y + h - yy) - 2, base, `opacity="${(0.85 + shade).toFixed(2)}"`));
      }
      xx += bw;
    }
  }
}

/** Shape of a round-topped arch as a path. */
const archPath = (x: number, y: number, w: number, h: number) =>
  `M${x},${y + h} L${x},${y + w / 2} A${w / 2},${w / 2} 0 0 1 ${x + w},${y + w / 2} L${x + w},${y + h} Z`;

/** Gothic pointed arch. */
const pointedArch = (x: number, y: number, w: number, h: number) =>
  `M${x},${y + h} L${x},${y + w * 0.6} Q${x},${y} ${x + w / 2},${y} Q${x + w},${y} ${x + w},${y + w * 0.6} L${x + w},${y + h} Z`;

function flame(c: Ctx, x: number, y: number, s: number) {
  c.add(circle(x, y - 6 * s, 30 * s, c.radial([[0, '#ffcf6b', 0.55], [1, '#ff8a2a', 0]])));
  c.add(path(`M${x},${y - 18 * s} C${x + 8 * s},${y - 8 * s} ${x + 6 * s},${y} ${x},${y} C${x - 6 * s},${y} ${x - 8 * s},${y - 8 * s} ${x},${y - 18 * s} Z`, '#ff9d2e'));
  c.add(path(`M${x},${y - 11 * s} C${x + 4 * s},${y - 5 * s} ${x + 3 * s},${y} ${x},${y} C${x - 3 * s},${y} ${x - 4 * s},${y - 5 * s} ${x},${y - 11 * s} Z`, '#ffe9a8'));
}

function lantern(c: Ctx, x: number, y: number, s: number, lit: boolean) {
  if (lit) c.add(circle(x, y - 22 * s, 60 * s, c.radial([[0, '#ffd27a', 0.5], [1, '#ffb347', 0]])));
  c.add(path(`M${x - 8 * s},${y - 52 * s} Q${x},${y - 66 * s} ${x + 8 * s},${y - 52 * s}`, 'none', `stroke="#8a6a2a" stroke-width="${2.5 * s}"`));
  c.add(poly([[x - 12 * s, y - 40 * s], [x + 12 * s, y - 40 * s], [x + 6 * s, y - 52 * s], [x - 6 * s, y - 52 * s]], '#b8902f'));
  c.add(rect(x - 10 * s, y - 40 * s, 20 * s, 32 * s, lit ? '#ffdc8a' : '#3d3a33', `opacity="${lit ? 0.95 : 0.8}"`));
  if (lit) flame(c, x, y - 14 * s, 0.6 * s);
  c.add(rect(x - 11 * s, y - 40 * s, 3 * s, 32 * s, '#b8902f'), rect(x + 8 * s, y - 40 * s, 3 * s, 32 * s, '#b8902f'));
  c.add(rect(x - 14 * s, y - 8 * s, 28 * s, 8 * s, '#9a7626'));
}

function vignette(c: Ctx, strength = 0.55) {
  c.add(rect(0, 0, W, H, c.radial([[0.55, '#000', 0], [1, '#000', strength]], 0.5, 0.5, 0.75)));
}

/** Darkness pressing in around a lantern-lit area. */
function lanternLight(c: Ctx, cx = 0.5, cy = 0.6) {
  c.add(rect(0, 0, W, H, c.radial([[0, '#ffb347', 0.12], [0.5, '#000', 0.2], [1, '#000', 0.92]], cx, cy, 0.7)));
}

function gulls(c: Ctx, count: number, y0: number, y1: number) {
  for (let i = 0; i < count; i++) {
    const x = c.range(40, W - 40);
    const y = c.range(y0, y1);
    const s = c.range(0.6, 1.3);
    c.add(path(`M${x - 8 * s},${y} Q${x - 4 * s},${y - 5 * s} ${x},${y} Q${x + 4 * s},${y - 5 * s} ${x + 8 * s},${y}`, 'none', `stroke="#2a2430" stroke-width="1.6"`));
  }
}

function waves(c: Ctx, y0: number, y1: number, color: string, count: number) {
  for (let i = 0; i < count; i++) {
    const y = c.range(y0, y1);
    const x = c.range(-20, W);
    const len = c.range(20, 70) * (0.5 + (y - y0) / (y1 - y0));
    c.add(path(`M${x},${y} q${len / 4},-3 ${len / 2},0 t${len / 2},0`, 'none', `stroke="${color}" stroke-width="1.4" opacity="0.6"`));
  }
}

function key(c: Ctx, x: number, y: number, s: number) {
  c.add(circle(x, y, 26 * s, c.radial([[0, '#fff3c4', 0.45], [1, '#fff3c4', 0]])));
  c.add(circle(x - 14 * s, y, 7 * s, 'none', `stroke="#9aa0a8" stroke-width="${3.5 * s}"`));
  c.add(rect(x - 7 * s, y - 2 * s, 26 * s, 4 * s, '#9aa0a8'));
  c.add(rect(x + 13 * s, y + 2 * s, 3 * s, 6 * s, '#9aa0a8'), rect(x + 7 * s, y + 2 * s, 3 * s, 4 * s, '#9aa0a8'));
}

function clapperShape(c: Ctx, x: number, y: number, s: number) {
  c.add(circle(x, y - 10 * s, 6 * s, 'none', `stroke="#5a4a3a" stroke-width="${3 * s}"`));
  c.add(rect(x - 2 * s, y - 6 * s, 4 * s, 28 * s, '#8a6a3a'));
  c.add(path(`M${x},${y + 18 * s} C${x + 14 * s},${y + 22 * s} ${x + 14 * s},${y + 46 * s} ${x},${y + 48 * s} C${x - 14 * s},${y + 46 * s} ${x - 14 * s},${y + 22 * s} ${x},${y + 18 * s} Z`, c.linear([[0, '#e0a95a'], [1, '#8a5a24']], 1, 0)));
}

// -----------------------------------------------------------------------------
// Scenes — All Hallows' Eve

const NIGHT: [number, string][] = [[0, '#07060d'], [0.5, '#1c0f26'], [0.8, '#43192a'], [1, '#6a2a1e']];

const text = (x: number, y: number, str: string, size: number, fill: string, extra = '') =>
  `<text x="${x}" y="${y}" font-family="Georgia, serif" font-size="${size}" fill="${fill}" ${extra}>${str}</text>`;

function harvestMoon(c: Ctx, x: number, y: number, r: number) {
  c.add(circle(x, y, r * 3.4, c.radial([[0, '#ff8a2a', 0.32], [1, '#ff5a10', 0]])));
  c.add(circle(x, y, r, c.radial([[0, '#ffd890'], [0.65, '#f4943e'], [1, '#c85a22']], 0.4, 0.38, 0.65)));
  c.add(circle(x - r * 0.3, y - r * 0.15, r * 0.17, '#cf6c2c', 'opacity="0.55"'), circle(x + r * 0.32, y + r * 0.28, r * 0.12, '#cf6c2c', 'opacity="0.55"'));
  c.add(ellipse(x + r * 0.3, y + r * 0.38, r * 1.7, r * 0.11, '#140a18', 'opacity="0.75"'));
}

/** A leafless tree, grown by recursive branching. */
function bareTree(c: Ctx, x: number, y: number, len: number, angle: number, width: number, color: string, depth = 0) {
  const x2 = x + Math.cos(angle) * len;
  const y2 = y + Math.sin(angle) * len;
  c.add(line(x, y, x2, y2, color, width, 'stroke-linecap="round"'));
  if (depth >= 5 || len < 6) return;
  const n = c.rand() < 0.3 ? 3 : 2;
  for (let i = 0; i < n; i++) {
    bareTree(c, x2, y2, len * c.range(0.62, 0.8), angle + c.range(-0.75, 0.75), width * 0.66, color, depth + 1);
  }
}

const deadTree = (c: Ctx, x: number, y: number, size: number, color = '#0c080c') =>
  bareTree(c, x, y, size, -Math.PI / 2 + c.range(-0.12, 0.12), size / 6, color);

function fog(c: Ctx, y0: number, y1: number, count: number, opacity = 0.08) {
  for (let i = 0; i < count; i++) {
    c.add(ellipse(c.range(-40, W + 40), c.range(y0, y1), c.range(90, 200), c.range(8, 18), '#c8bcd8', `opacity="${opacity}"`));
  }
}

function crows(c: Ctx, count: number, y0: number, y1: number) {
  gulls(c, count, y0, y1);
}

/** A standing silhouette: one of the dead, waiting. */
function figure(c: Ctx, x: number, y: number, h: number, color = '#09070b', face = false) {
  const w = h * 0.28;
  c.add(path(`M${x - w / 2},${y} L${x - w * 0.3},${y - h * 0.78} Q${x},${y - h * 0.86} ${x + w * 0.3},${y - h * 0.78} L${x + w / 2},${y} Z`, color));
  c.add(circle(x, y - h * 0.88, h * 0.1, color));
  if (face) c.add(ellipse(x, y - h * 0.88, h * 0.055, h * 0.07, '#c8c0b0', 'opacity="0.35"'));
}

function turnipLantern(c: Ctx, x: number, y: number, s: number) {
  c.add(rect(x - 4 * s, y, 8 * s, 70 * s, '#1a120c'));
  c.add(circle(x, y - 14 * s, 46 * s, c.radial([[0, '#ffa040', 0.45], [1, '#ff7020', 0]])));
  c.add(ellipse(x, y - 14 * s, 20 * s, 17 * s, '#d8c48a'));
  c.add(path(`M${x - 14 * s},${y - 26 * s} Q${x},${y - 36 * s} ${x + 14 * s},${y - 26 * s} Q${x},${y - 30 * s} ${x - 14 * s},${y - 26 * s} Z`, '#6a2a5a'));
  c.add(path(`M${x - 2 * s},${y - 31 * s} l-4,-10 m6,10 l5,-9`, 'none', `stroke="#3a4a22" stroke-width="${2 * s}"`));
  const glow = '#ffb848';
  c.add(poly([[x - 11 * s, y - 16 * s], [x - 4 * s, y - 16 * s], [x - 7 * s, y - 23 * s]], glow));
  c.add(poly([[x + 4 * s, y - 16 * s], [x + 11 * s, y - 16 * s], [x + 7 * s, y - 23 * s]], glow));
  c.add(poly([[x - 12 * s, y - 9 * s], [x - 8 * s, y - 5 * s], [x - 4 * s, y - 8 * s], [x, y - 3 * s], [x + 4 * s, y - 8 * s], [x + 8 * s, y - 5 * s], [x + 12 * s, y - 9 * s], [x + 6 * s, y - 1 * s], [x - 6 * s, y - 1 * s]], glow));
}

function gibbet(c: Ctx, x: number, groundY: number) {
  const wood = '#140c08';
  c.add(rect(x - 5, groundY - 210, 10, 210, wood), rect(x - 5, groundY - 210, 110, 9, wood));
  c.add(line(x, groundY - 160, x + 50, groundY - 205, wood, 6));
  c.add(line(x + 92, groundY - 201, x + 92, groundY - 176, '#2a2420', 2));
  const cx = x + 92;
  const top = groundY - 176;
  // The cage, and the thing in it
  c.add(path(`M${cx - 10},${top + 24} Q${cx - 14},${top + 56} ${cx - 6},${top + 92} L${cx + 8},${top + 92} Q${cx + 14},${top + 56} ${cx + 10},${top + 24} Z`, '#1a1210'));
  c.add(circle(cx + 2, top + 18, 8, '#b8ae98'), circle(cx - 1, top + 17, 2, '#0a0606'), circle(cx + 5, top + 17, 2, '#0a0606'));
  c.add(rect(cx - 2, top + 22, 9, 2, '#0a0606'));
  for (let i = 0; i <= 5; i++) {
    const bx = cx - 18 + i * 7.2;
    c.add(line(bx, top + 4, bx + (i - 2.5) * 1.5, top + 108, '#3a302a', 2));
  }
  c.add(ellipse(cx, top + 4, 18, 4, 'none', 'stroke="#3a302a" stroke-width="2"'), ellipse(cx, top + 108, 20, 4, 'none', 'stroke="#3a302a" stroke-width="2"'));
}

/** A shrouded body lying flat, seen from the side. */
function shroud(c: Ctx, x: number, y: number, len: number, h: number) {
  c.add(path(`M${x},${y} Q${x + len * 0.1},${y - h} ${x + len * 0.45},${y - h * 0.8} Q${x + len * 0.75},${y - h * 0.9} ${x + len},${y - h * 0.5} L${x + len},${y} Z`, '#cfc7b4'));
  c.add(ellipse(x + len * 0.08, y - h * 0.55, h * 0.55, h * 0.5, '#d8d0be'));
  for (let i = 1; i < 4; i++) c.add(line(x + len * (i / 4), y - h * 0.85, x + len * (i / 4) - 4, y, '#a8a090', 1, 'opacity="0.7"'));
}

function ghostGirl(c: Ctx, x: number, y: number, s: number) {
  c.add(ellipse(x, y - 30 * s, 70 * s, 60 * s, c.radial([[0, '#cfe0e8', 0.28], [1, '#cfe0e8', 0]])));
  c.add(path(`M${x - 22 * s},${y} Q${x - 20 * s},${y - 40 * s} ${x - 12 * s},${y - 58 * s} Q${x},${y - 72 * s} ${x + 12 * s},${y - 58 * s} Q${x + 20 * s},${y - 40 * s} ${x + 22 * s},${y} Z`, '#9aa2aa', 'opacity="0.88"'));
  c.add(ellipse(x, y - 50 * s, 8 * s, 10 * s, '#2a2e34'));
  c.add(ellipse(x + 2 * s, y - 49 * s, 5 * s, 7 * s, '#c4c0b4', 'opacity="0.8"'));
  c.add(circle(x, y - 51 * s, 1.4 * s, '#000'), circle(x + 4 * s, y - 51 * s, 1.4 * s, '#000'));
  c.add(ellipse(x, y, 26 * s, 4 * s, '#000', 'opacity="0.25"'));
}

/** Wen Kard, sitting on the floor: a big man, red hair, a massive scruffy beard, a green and gold player's coat. */
function wen(c: Ctx, x: number, y: number, s = 1.35) {
  const coat = '#2c5a3a';
  const coatDark = '#1e4029';
  const trim = '#c8a040';
  const hair = '#c2541e';
  const hairDark = '#8a3210';
  const skin = '#e6bc9c';
  const P = (dx: number, dy: number) => `${(x + dx * s).toFixed(1)},${(y + dy * s).toFixed(1)}`;
  // Legs, knees drawn up
  c.add(path(`M${P(-30, 0)} L${P(-38, -26)} L${P(-6, -30)} L${P(4, 0)} Z`, '#2a2018'));
  c.add(path(`M${P(0, 0)} L${P(18, -28)} L${P(44, -22)} L${P(40, 0)} Z`, '#241a12'));
  c.add(ellipse(x - 34 * s, y - 2 * s, 9 * s, 4 * s, '#140e0a'), ellipse(x + 42 * s, y - 2 * s, 9 * s, 4 * s, '#140e0a'));
  // Broad torso in the player's coat
  c.add(path(`M${P(-32, -24)} L${P(-36, -70)} Q${P(0, -82)} ${P(36, -70)} L${P(30, -24)} Z`, coat));
  c.add(path(`M${P(-2, -78)} L${P(-6, -24)} L${P(6, -24)} L${P(2, -78)} Z`, coatDark));
  c.add(line(x - 36 * s, y - 70 * s, x - 32 * s, y - 24 * s, trim, 2 * s), line(x + 36 * s, y - 70 * s, x + 30 * s, y - 24 * s, trim, 2 * s));
  // Arm reaching to Tom's hand
  c.add(path(`M${P(30, -66)} Q${P(52, -54)} ${P(70, -40)}`, 'none', `stroke="${coat}" stroke-width="${13 * s}" stroke-linecap="round"`));
  c.add(line(x + 60 * s, y - 47 * s, x + 66 * s, y - 42 * s, trim, 2 * s));
  c.add(circle(x + 73 * s, y - 38 * s, 5.5 * s, skin));
  // Hair to the shoulders
  c.add(path(`M${P(-19, -96)} Q${P(-26, -118)} ${P(0, -122)} Q${P(26, -118)} ${P(19, -96)} L${P(22, -72)} L${P(-22, -72)} Z`, hairDark));
  // Head
  c.add(ellipse(x, y - 100 * s, 14 * s, 16 * s, skin));
  c.add(path(`M${P(-16, -100)} Q${P(-14, -122)} ${P(2, -120)} Q${P(16, -120)} ${P(16, -100)} Q${P(8, -112)} ${P(-2, -110)} Q${P(-10, -110)} ${P(-16, -100)} Z`, hair));
  // The beard: massive and scruffy, down over his chest
  let beard = `M${P(-15, -100)}`;
  const pts = 15;
  for (let i = 0; i <= pts; i++) {
    const a = Math.PI * (1 - i / pts);
    const rx = 21 + c.range(-1.5, 1.5);
    const ry = 40 + (i % 2 ? 7 : -3) + c.range(-2, 2);
    beard += ` L${P(Math.cos(a) * rx, -96 + Math.sin(a) * ry)}`;
  }
  beard += ` L${P(15, -100)} Q${P(0, -90)} ${P(-15, -100)} Z`;
  c.add(path(beard, hair));
  for (let i = 0; i < 14; i++) {
    const bx = c.range(-16, 16);
    c.add(line(x + bx * s, y - 88 * s, x + (bx + c.range(-3, 3)) * s, y + (-62 + c.range(-6, 8)) * s, hairDark, 1.3 * s, 'opacity="0.75"'));
  }
  // Mustache, downcast eyes, gold earring
  c.add(path(`M${P(-9, -92)} Q${P(0, -96)} ${P(9, -92)} Q${P(0, -89)} ${P(-9, -92)} Z`, hairDark));
  c.add(line(x - 8 * s, y - 103 * s, x - 3 * s, y - 102 * s, '#3a2418', 1.8 * s), line(x + 3 * s, y - 102 * s, x + 8 * s, y - 103 * s, '#3a2418', 1.8 * s));
  c.add(path(`M${P(-10, -108)} L${P(-3, -107)} M${P(3, -107)} L${P(10, -108)}`, 'none', `stroke="${hairDark}" stroke-width="${2 * s}"`));
  c.add(circle(x - 15 * s, y - 95 * s, 2.8 * s, 'none', `stroke="${trim}" stroke-width="${1.5 * s}"`));
}

/** Tom, dead in his chair, head bowed. */
function tom(c: Ctx, x: number, y: number) {
  const wood = '#3a2818';
  c.add(rect(x - 30, y - 110, 6, 110, wood), rect(x - 30, y - 50, 60, 8, wood), rect(x + 24, y - 50, 6, 50, wood));
  c.add(path(`M${x - 22},${y - 50} L${x - 18},${y - 102} Q${x},${y - 110} ${x + 14},${y - 100} L${x + 20},${y - 50} Z`, '#3e3a30'));
  c.add(path(`M${x - 20},${y - 50} L${x + 34},${y - 46} L${x + 36},${y - 2} L${x + 24},${y - 2} L${x + 22},${y - 40} L${x - 18},${y - 42} Z`, '#2e2a24'));
  c.add(ellipse(x + 6, y - 106, 13, 14, '#8a8470'));
  c.add(circle(x - 6, y - 96, 5, '#140c0c'), circle(x + 14, y - 94, 4, '#140c0c'));
  // Hand hanging down, held
  c.add(path(`M${x - 16},${y - 92} Q${x - 30},${y - 60} ${x - 34},${y - 30}`, 'none', 'stroke="#3e3a30" stroke-width="10" stroke-linecap="round"'));
  c.add(circle(x - 34, y - 28, 5.5, '#8a8470'));
}

type Scene = (c: Ctx, s: State, dark: boolean) => void;

const scenes: Record<string, Scene> = {
  cottage(c, s) {
    c.add(rect(0, 0, W, H, '#2e2018'));
    for (let x = 0; x < W; x += 38) c.add(rect(x, 0, 2, 280, '#1a110b'), rect(x + 2, 0, 8, 280, '#3e2c20', 'opacity="0.4"'));
    c.add(rect(0, 34, W, 12, '#1a110b'));
    c.add(rect(0, 270, W, 90, '#1e150f'));
    for (let i = -6; i <= 6; i++) c.add(line(320 + i * 30, 270, 320 + i * 120, 360, '#120c08', 2));
    // Hearth: embers only
    stoneWall(c, 30, 120, 190, 160, '#4e4842', '#262320', 20);
    c.add(path(archPath(62, 176, 126, 104), '#0a0504'));
    c.add(rect(20, 108, 210, 16, '#3a281a'));
    c.add(ellipse(125, 272, 50, 8, '#5a1a08'));
    for (let i = 0; i < 14; i++) c.add(circle(c.range(85, 165), c.range(264, 274), c.range(1.5, 3.5), '#ff6a1a', `opacity="${c.range(0.5, 1).toFixed(2)}"`));
    flame(c, 125, 268, 0.9);
    // Shuttered window, orange moonlight bleeding through the cracks
    c.add(rect(430, 70, 140, 120, '#140c08'));
    for (let i = 0; i < 4; i++) c.add(rect(440 + i * 31, 80, 28, 100, '#2a1c12'));
    for (let i = 0; i < 3; i++) c.add(rect(467 + i * 31, 80, 3, 100, '#ff8a2a', 'opacity="0.55"'));
    c.add(rect(436, 124, 128, 10, '#140c08'));
    c.add(poly([[470, 180], [473, 180], [520, 360], [490, 360]], '#ff8a2a', 'opacity="0.05"'));
    // Table laid for the dead
    c.add(rect(360, 238, 230, 14, '#5a3e26'), rect(375, 258, 12, 80, '#3a281a'), rect(563, 258, 12, 80, '#3a281a'));
    c.add(path('M352,236 L598,236 L604,278 Q590,270 576,280 Q560,268 544,278 L532,252 L420,252 L408,280 Q392,268 378,280 Q364,270 348,278 Z', '#d8d0c0'));
    if (s.items.lantern === 'cottage') lantern(c, 410, 238, 1, !!s.flags.lanternLit);
    if (s.items.note === 'cottage') c.add(poly([[456, 234], [500, 228], [506, 236], [462, 240]], '#c8b890'), line(464, 234, 494, 231, '#6a5a3a', 1));
    if (s.items.cake === 'cottage') {
      c.add(ellipse(546, 232, 22, 9, '#a8682a'), ellipse(546, 228, 20, 8, '#c88a44'));
      c.add(line(538, 228, 554, 228, '#6a3a14', 2), line(546, 222, 546, 234, '#6a3a14', 2));
    }
    c.add(rect(0, 0, W, H, c.radial([[0, '#ff6a1a', 0.18], [1, '#ff6a1a', 0]], 0.2, 0.75, 0.5)));
    vignette(c, 0.75);
  },

  crossroads(c) {
    sky(c, NIGHT);
    stars(c, 40, 120, 0.5);
    harvestMoon(c, 150, 92, 44);
    ridge(c, 214, 14, '#160c18', 0.8);
    // St. Audra's on the ridge
    c.add(rect(430, 176, 70, 34, '#0c070e'), poly([[426, 176], [465, 156], [504, 176]], '#0c070e'));
    c.add(poly([[500, 210], [500, 118], [506, 112], [510, 120], [516, 110], [522, 118], [522, 210]], '#0c070e'));
    ridge(c, 236, 9, '#120d10', 1.3);
    c.add(rect(0, 250, W, 110, c.linear([[0, '#1c1a16'], [1, '#0c0b09']])));
    c.add(poly([[304, 232], [336, 232], [500, 360], [140, 360]], '#2e2418'));
    c.add(poly([[0, 272], [640, 258], [640, 278], [0, 298]], '#2a2016'));
    fog(c, 230, 290, 9, 0.09);
    tufts(c, 250, 360, 60, '#141410');
    gibbet(c, 70, 300);
    // Signpost, with a fourth arm pointing down
    c.add(rect(398, 150, 9, 140, '#1a120c'));
    c.add(poly([[340, 162], [396, 162], [396, 180], [340, 180], [330, 171]], '#3a2a1c'));
    c.add(poly([[409, 184], [468, 184], [478, 193], [468, 202], [409, 202]], '#34261a'));
    c.add(poly([[384, 146], [420, 132], [424, 146], [388, 160]], '#3a2a1c'));
    c.add(poly([[408, 210], [424, 210], [424, 250], [416, 262], [408, 250]], '#2a1c12'));
    c.add(text(410, 236, 'HERE', 7, '#8a2a1a', 'transform="rotate(90 416 236)"'));
    crows(c, 5, 150, 210);
    vignette(c, 0.6);
  },

  orchard(c) {
    sky(c, NIGHT);
    stars(c, 25, 90, 0.4);
    harvestMoon(c, 500, 70, 30);
    c.add(rect(0, 236, W, 124, c.linear([[0, '#2a2a2e'], [1, '#121214']])));
    for (let i = 0; i < 40; i++) c.add(circle(c.range(0, W), c.range(240, 360), c.range(0.8, 1.6), '#c8c8d8', 'opacity="0.35"'));
    c.add(poly([[300, 228], [340, 228], [420, 360], [230, 360]], '#1e1814', 'opacity="0.8"'));
    deadTree(c, 230, 246, 34, '#0a070a');
    deadTree(c, 440, 250, 38, '#0a070a');
    figure(c, 370, 248, 34, '#050406');
    fog(c, 220, 260, 8, 0.1);
    deadTree(c, 80, 300, 62);
    deadTree(c, 600, 310, 70);
    turnipLantern(c, 470, 276, 1.2);
    fog(c, 290, 340, 7, 0.08);
    tufts(c, 270, 360, 50, '#18181a');
    vignette(c, 0.65);
  },

  well(c, s) {
    sky(c, NIGHT);
    stars(c, 20, 80, 0.4);
    harvestMoon(c, 110, 66, 26);
    deadTree(c, 70, 240, 44, '#0a070a');
    deadTree(c, 570, 236, 50, '#0a070a');
    c.add(rect(0, 230, W, 130, c.linear([[0, '#202024'], [1, '#0e0e10']])));
    tufts(c, 240, 360, 40, '#16161a');
    c.add(rect(236, 110, 14, 140, '#2a1c12'), rect(390, 110, 14, 140, '#2a1c12'), rect(222, 104, 196, 14, '#34241a'));
    c.add(ellipse(320, 310, 104, 22, '#0a0a08'));
    stoneWall(c, 216, 236, 208, 76, '#4a4844', '#22211e', 19);
    c.add(ellipse(320, 236, 104, 24, '#44423e'), ellipse(320, 238, 88, 17, '#000'));
    for (let i = 0; i < 8; i++) c.add(ellipse(c.range(226, 414), c.range(240, 300), c.range(8, 18), c.range(4, 7), '#c8d0d8', 'opacity="0.18"'));
    if (s.flags.ropeTied) {
      c.add(path('M312,118 Q306,180 318,240', 'none', 'stroke="#a88a52" stroke-width="4"'));
      c.add(ellipse(312, 112, 10, 8, 'none', 'stroke="#a88a52" stroke-width="4"'));
    }
    fog(c, 270, 340, 8, 0.09);
    vignette(c, 0.6);
  },

  wellbottom(c, s, dark) {
    c.add(rect(0, 0, W, H, '#030303'));
    if (dark) {
      c.add(ellipse(320, 14, 56, 16, '#6a3a24', 'opacity="0.6"'));
      c.add(line(300, 30, 300, 360, '#a88a52', 2, 'opacity="0.1"'));
      return;
    }
    stoneWall(c, 0, 0, W, H, '#3a3c36', '#151612', 22);
    for (let i = 0; i < 10; i++) {
      const x = c.range(60, 580);
      const y = c.range(150, 260);
      c.add(line(x, y, x + c.range(-3, 3), y + c.range(14, 30), '#0a0a08', 1.5));
    }
    c.add(rect(0, 0, W, H, c.linear([[0, '#000', 0.88], [0.3, '#000', 0.1], [0.7, '#000', 0.1], [1, '#000', 0.88]], 1, 0)));
    c.add(ellipse(320, 10, 70, 20, '#8a4a2a'));
    c.add(rect(0, 280, W, 80, c.linear([[0, '#0c1a1c'], [1, '#040808']])));
    waves(c, 290, 350, '#2a5a5a', 14);
    // The last one who came looking
    c.add(circle(210, 296, 13, '#c4baa0'), circle(205, 294, 3.5, '#0a0a08'), circle(214, 294, 3.5, '#0a0a08'), rect(205, 302, 10, 3, '#0a0a08'));
    c.add(line(226, 304, 280, 312, '#b8ae94', 5, 'stroke-linecap="round"'), line(160, 314, 196, 306, '#b8ae94', 4, 'stroke-linecap="round"'));
    for (let i = 0; i < 4; i++) c.add(path(`M${238 + i * 8},${300} q4,10 0,18`, 'none', 'stroke="#b8ae94" stroke-width="2.5"'));
    c.add(path('M300,20 Q296,160 304,292', 'none', 'stroke="#a88a52" stroke-width="4"'));
    if (s.items.key === 'wellbottom') key(c, 400, 304, 1.2);
    lanternLight(c, 0.48, 0.72);
  },

  abbeygate(c, s) {
    sky(c, NIGHT);
    stars(c, 50, 150, 0.6);
    harvestMoon(c, 110, 70, 26);
    c.add(poly([[440, 200], [440, 60], [452, 48], [460, 58], [472, 44], [486, 56], [498, 50], [498, 200]], '#0c080e'));
    c.add(path(archPath(458, 70, 22, 34), '#43192a', 'opacity="0.8"'));
    stoneWall(c, 0, 170, 230, 190, '#34313a', '#18161c');
    stoneWall(c, 410, 170, 230, 190, '#34313a', '#18161c');
    c.add(rect(222, 110, 42, 250, '#3e3a44'), rect(376, 110, 42, 250, '#3e3a44'));
    c.add(rect(216, 102, 54, 12, '#4a4652'), rect(370, 102, 54, 12, '#4a4652'));
    c.add(rect(264, 130, 112, 230, c.linear([[0, '#2a1426'], [0.45, '#141410'], [1, '#0a0a08']])));
    c.add(path(archPath(280, 180, 30, 60), '#060608'), path(archPath(330, 180, 30, 60), '#060608'));
    figure(c, 318, 236, 30, '#020203');
    const bar = '#1a1412';
    const rosary = (x: number, y: number) => {
      c.add(ellipse(x, y + 12, 4, 12, 'none', 'stroke="#8a7a5a" stroke-width="1.2" stroke-dasharray="1.5 2"'));
      c.add(line(x, y + 24, x, y + 30, '#8a7a5a', 1.2), line(x - 2.5, y + 27, x + 2.5, y + 27, '#8a7a5a', 1.2));
    };
    if (s.flags.gateOpen) {
      for (let i = 0; i < 4; i++) c.add(line(266 + i * 6, 136 + i * 3, 266 + i * 6, 332 - i * 3, bar, 3));
      for (let i = 0; i < 4; i++) c.add(line(374 - i * 6, 136 + i * 3, 374 - i * 6, 332 - i * 3, bar, 3));
      for (let i = 0; i < 18; i++) c.add(circle(c.range(270, 370), c.range(330, 350), 1.3, '#8a7a5a'));
    } else {
      for (let x = 270; x <= 370; x += 12) {
        c.add(line(x, 130, x, 340, bar, 4), poly([[x - 4, 132], [x, 120], [x + 4, 132]], bar));
        rosary(x, c.range(160, 270));
      }
      c.add(rect(264, 150, 112, 6, bar), rect(264, 300, 112, 6, bar));
      c.add(rect(308, 222, 24, 30, '#2a1e14'), circle(320, 234, 3, '#000'), rect(318.5, 234, 3, 8, '#000'));
    }
    c.add(poly([[250, 360], [280, 330], [360, 330], [390, 360]], '#201a14'));
    fog(c, 310, 360, 8, 0.08);
    vignette(c, 0.6);
  },

  cloister(c) {
    sky(c, NIGHT);
    stars(c, 40, 120, 0.6);
    harvestMoon(c, 420, 60, 22);
    c.add(rect(510, 20, 80, 260, '#2e2a30'), poly([[506, 20], [520, 8], [530, 18], [548, 4], [566, 16], [594, 10], [594, 20]], '#2e2a30'));
    c.add(path(archPath(536, 40, 28, 46), '#07060d'), rect(546, 140, 8, 30, '#07060d'));
    let d = 'M0,250 L0,140';
    for (let x = 0; x <= 510; x += 20) d += ` L${x},${140 + c.range(-14, 6)}`;
    d += ' L510,250 Z';
    c.add(path(d, '#3e3a36'));
    for (let x = 18; x < 480; x += 74) c.add(path(archPath(x, 160, 46, 90), '#0e0c12'));
    c.add(path(pointedArch(240, 150, 56, 100), '#050407'));
    c.add(rect(0, 250, W, 110, c.linear([[0, '#1e1c16'], [1, '#0c0b08']])));
    // Graves, and the ones that have been opened from below
    for (let i = 0; i < 11; i++) {
      const x = 150 + (i % 6) * 80 + c.range(-14, 14);
      const y = 268 + Math.floor(i / 6) * 50 + c.range(-6, 6);
      const opened = i === 2 || i === 7 || i === 9;
      c.add(ellipse(x, y, 30, 8, '#2a2218'));
      if (opened) {
        c.add(ellipse(x, y, 16, 5, '#020202'));
        for (let k = 0; k < 6; k++) c.add(circle(x + c.range(-28, 28), y + c.range(-8, 6), c.range(2, 4), '#3a3024'));
      }
      const tilt = opened ? c.range(-30, 30) : c.range(-8, 8);
      c.add(`<g transform="rotate(${tilt.toFixed(1)} ${x} ${y - 6})">${line(x, y - 4, x, y - 30, '#5a4a36', 3)}${line(x - 8, y - 22, x + 8, y - 22, '#5a4a36', 3)}</g>`);
    }
    c.add(rect(312, 270, 16, 30, '#4a4640'), ellipse(320, 300, 60, 12, '#38342e'), ellipse(320, 296, 60, 12, '#4a4640'));
    c.add(poly([[20, 360], [40, 290], [140, 290], [130, 360]], '#030304'));
    for (let i = 0; i < 4; i++) c.add(line(38 - i * 4, 300 + i * 15, 138 - i * 2, 300 + i * 15, '#22222a', 2));
    fog(c, 260, 330, 10, 0.08);
    vignette(c, 0.6);
  },

  chapel(c, s) {
    c.add(rect(0, 0, W, H, '#28241f'));
    stoneWall(c, 0, 0, W, 280, '#34302b', '#1a1815', 24);
    const win = pointedArch(230, 30, 180, 190);
    c.add(path(win, '#1c0f26'));
    const colors = ['#7a1a1a', '#1e3a6a', '#9a7a2a', '#2a4a2a', '#4a1a5a'];
    for (let i = 0; i < 46; i++) {
      if (c.rand() < 0.35) continue;
      const x = c.range(238, 400);
      const y = c.range(60, 215);
      const k = c.range(8, 16);
      c.add(poly([[x, y], [x + k, y + c.range(-4, 6)], [x + c.range(0, k), y + k]], colors[i % colors.length], 'opacity="0.8"'));
    }
    c.add(path(win, 'none', 'stroke="#1e1b18" stroke-width="10"'), line(320, 40, 320, 220, '#1e1b18', 5), line(232, 140, 408, 140, '#1e1b18', 5));
    c.add(poly([[250, 220], [390, 220], [460, 360], [180, 360]], '#ff9a5a', 'opacity="0.05"'));
    c.add(rect(0, 280, W, 80, '#1c1916'));
    c.add(rect(250, 236, 140, 54, '#5a554c'), rect(240, 228, 160, 12, '#6a645a'));
    if (s.items.candlestick === 'chapel') {
      c.add(rect(310, 222, 20, 6, '#a8acb2'), rect(316, 192, 8, 30, '#b8bcc2'), rect(312, 190, 16, 4, '#a8acb2'));
      c.add(rect(316, 178, 8, 12, '#d8ceb4'));
    }
    // Pews laden with the dead
    const pew = (x: number, y: number, w: number) => {
      c.add(rect(x, y, w, 10, '#2e2014'), rect(x + 6, y + 10, 6, 24, '#22180e'), rect(x + w - 12, y + 10, 6, 24, '#22180e'));
      shroud(c, x + 6, y, w - 14, 16);
    };
    pew(10, 262, 200);
    pew(430, 262, 200);
    pew(-20, 310, 230);
    pew(440, 310, 230);
    for (let i = 0; i < 8; i++) c.add(ellipse(c.range(30, 610), c.range(345, 356), c.range(4, 8), 2, '#c8b890', 'opacity="0.5"'));
    vignette(c, 0.8);
  },

  towerbase(c) {
    stoneWall(c, 0, 0, W, H, '#3e3a36', '#1e1c1a', 20);
    c.add(rect(0, 0, W, H, c.linear([[0, '#000', 0.88], [0.35, '#000', 0.2], [0.65, '#000', 0.2], [1, '#000', 0.88]], 1, 0)));
    c.add(rect(474, 60, 12, 80, '#d0864a'));
    c.add(poly([[474, 70], [486, 70], [380, 360], [250, 360]], '#ff9a5a', 'opacity="0.07"'));
    for (let i = 13; i >= 0; i--) {
      const t = i * 0.5;
      const x = 320 + Math.sin(t) * 170;
      const y = 336 - i * 24;
      const w = 90 + Math.cos(t) * 40;
      const front = Math.cos(t) > -0.2;
      c.add(rect(x - w / 2, y, w, 9, front ? '#5e5a52' : '#3a3834'), rect(x - w / 2, y + 9, w, 14, front ? '#3a3732' : '#262420'));
    }
    c.add(rect(310, 0, 20, H, '#2a2622', 'opacity="0.9"'));
    for (let i = 0; i < 7; i++) {
      c.add(text(60 + (i % 2) * 18, 190 + i * 22, 'NON DORMIUNT', 13, '#d8ccb0', `opacity="0.32" transform="rotate(${c.range(-6, 6).toFixed(1)} 100 ${190 + i * 22})"`));
    }
    vignette(c, 0.65);
  },

  belfry(c, s) {
    sky(c, NIGHT);
    stars(c, 60, 180, 0.6);
    harvestMoon(c, 520, 76, 26);
    // The valley below, and the dead standing in it
    c.add(rect(0, 226, W, 134, c.linear([[0, '#1a1418'], [1, '#0a080a']])));
    for (let i = 0; i < 4; i++) c.add(line(0, 240 + i * 16, W, 236 + i * 18, '#241c1e', 1.5));
    for (let i = 0; i < 70; i++) {
      const y = c.range(238, 296);
      figure(c, c.range(50, 590), y, 6 + (y - 238) * 0.22, '#030203');
    }
    fog(c, 236, 290, 8, 0.08);
    c.add(path(`M0,0 H${W} V360 H600 V120 A280,110 0 0 0 40,120 V360 H0 Z`, '#1e1b22'));
    c.add(rect(0, 300, W, 60, '#161419'), rect(0, 296, W, 8, '#2a2730'));
    c.add(rect(150, 34, 340, 22, '#2a1c12'), rect(150, 56, 340, 4, '#140c08'));
    const bell = 'M250,250 C250,180 262,100 280,82 C296,66 344,66 360,82 C378,100 390,180 390,250 C410,258 410,270 320,272 C230,270 230,258 250,250 Z';
    c.add(rect(310, 56, 20, 20, '#1e2a22'));
    c.add(path(bell, c.linear([[0, '#1e3a2e'], [0.35, '#4f7a64'], [0.6, '#3a5e4c'], [1, '#14241c']], 1, 0)));
    c.add(path('M256,214 C300,222 340,222 384,214', 'none', 'stroke="#1e3a2e" stroke-width="5"'));
    c.add(rect(250, 60, 140, 220, c.radial([[0, '#ff8a2a', 0.14], [1, '#ff8a2a', 0]], 0.8, 0.2, 0.8)));
    c.add(ellipse(320, 262, 84, 9, '#060a08'));
    if (s.flags.clapperHung) clapperShape(c, 320, 222, 0.9);
    vignette(c, 0.55);
  },

  crypt(c, s, dark) {
    c.add(rect(0, 0, W, H, '#030303'));
    if (dark) return;
    stoneWall(c, 0, 0, W, H, '#34302b', '#14120f', 22);
    c.add(path('M0,0 H640 V40 Q320,140 0,40 Z', '#1a1814'));
    for (let i = 0; i < 4; i++) c.add(path(`M${i * 180 - 40},0 Q320,${150 + i * 6} ${680 - i * 180},0`, 'none', 'stroke="#1a1814" stroke-width="10"'));
    for (let i = 0; i < 16; i++) {
      const x = c.range(40, 600);
      c.add(path(`M${x},0 q${c.range(-12, 12)},${c.range(20, 40)} ${c.range(-8, 8)},${c.range(40, 90)}`, 'none', 'stroke="#3a2418" stroke-width="2"'));
    }
    c.add(poly([[0, 280], [640, 280], [640, 360], [0, 360]], '#1a1612'));
    for (let i = 0; i < 6; i++) c.add(ellipse(c.range(120, 520), c.range(300, 350), c.range(20, 50), c.range(4, 9), '#0a0404', 'opacity="0.85"'));
    // The abbot in his niche
    c.add(path(archPath(250, 110, 140, 170), '#0a0807'));
    c.add(poly([[278, 280], [296, 214], [344, 214], [362, 280]], '#4a1214'));
    c.add(line(320, 216, 320, 280, '#a8862a', 3), line(298, 230, 342, 230, '#a8862a', 2));
    c.add(poly([[306, 186], [320, 156], [334, 186]], '#d0c4a0'), line(320, 160, 320, 186, '#a8862a', 2));
    c.add(circle(320, 198, 15, '#c8bea4'), circle(314, 196, 3.8, '#0a0807'), circle(326, 196, 3.8, '#0a0807'));
    c.add(path('M312,206 L328,206 L326,220 L314,220 Z', '#0a0807'));
    for (let i = 0; i < 4; i++) c.add(rect(314 + i * 4, 206, 2, 3, '#c8bea4'));
    if (s.items.clapper === 'crypt') {
      clapperShape(c, 320, 228, 0.62);
      c.add(line(296, 262, 312, 256, '#c8bea4', 4), line(344, 262, 328, 256, '#c8bea4', 4));
    } else {
      c.add(line(298, 262, 290, 278, '#c8bea4', 4), line(342, 262, 350, 278, '#c8bea4', 4));
    }
    // Coffins, lids pushed aside from within
    const coffin = (pts: [number, number][], lid: [number, number][]) => {
      c.add(poly(pts, '#3a3630'));
      c.add(poly(pts.map(([x, y]) => [x + (x < 320 ? 8 : -8), y + 4] as [number, number]), '#050404', 'opacity="0.9"'));
      c.add(poly(lid, '#4a453c'));
    };
    coffin([[20, 300], [200, 268], [230, 290], [40, 340]], [[60, 330], [230, 300], [250, 320], [80, 354]]);
    coffin([[60, 250], [210, 230], [232, 246], [80, 272]], [[50, 236], [200, 214], [216, 226], [62, 252]]);
    coffin([[620, 300], [440, 268], [410, 290], [600, 340]], [[600, 326], [430, 296], [404, 314], [580, 350]]);
    coffin([[580, 250], [430, 230], [408, 246], [560, 272]], [[600, 238], [450, 214], [430, 226], [584, 254]]);
    lanternLight(c, 0.5, 0.65);
  },

  shore(c) {
    sky(c, NIGHT);
    stars(c, 40, 140, 0.5);
    harvestMoon(c, 420, 140, 34);
    c.add(rect(0, 196, W, 84, c.linear([[0, '#1a1a2a'], [1, '#0c0c16']])));
    c.add(poly([[404, 198], [436, 198], [466, 280], [374, 280]], '#ff8a2a', 'opacity="0.14"'));
    waves(c, 200, 278, '#6a5a6a', 30);
    c.add(poly([[0, 80], [40, 70], [80, 100], [120, 110], [150, 160], [170, 220], [200, 280], [0, 300]], '#0e0b10'));
    c.add(poly([[0, 120], [60, 110], [110, 150], [140, 230], [0, 260]], '#16121a'));
    c.add(line(520, 210, 520, 262, '#0a0706', 3), line(570, 210, 570, 262, '#0a0706', 3), line(545, 210, 545, 262, '#0a0706', 3));
    c.add(rect(510, 176, 70, 36, '#120e0c'), poly([[504, 178], [545, 152], [586, 178]], '#0a0806'), rect(538, 190, 12, 22, '#e08a3a', 'opacity="0.5"'));
    c.add(path('M0,300 Q200,260 400,272 T640,262 V360 H0 Z', c.linear([[0, '#4a4234'], [1, '#1e1a14']])));
    // Dead fish along the tideline
    for (let i = 0; i < 70; i++) {
      const x = c.range(150, 640);
      const y = 274 + (x - 150) * -0.02 + c.range(-4, 10);
      c.add(ellipse(x, y, 4, 1.4, '#c8ccd8', `opacity="0.7" transform="rotate(${c.range(-40, 40).toFixed(0)} ${x} ${y})"`));
    }
    vignette(c, 0.55);
  },

  ferryhut(c, s) {
    c.add(rect(0, 0, W, H, '#1e1610'));
    for (let x = 0; x < W; x += 30) c.add(rect(x, 0, 2, 290, '#100b07'), rect(x + 4, 0, 6, 290, '#2e2216', 'opacity="0.4"'));
    c.add(rect(0, 26, W, 14, '#100b07'), rect(0, 88, W, 10, '#100b07'));
    c.add(rect(160, 110, 80, 64, '#0e0a06'), rect(168, 118, 64, 48, c.linear([[0, '#43192a'], [0.6, '#6a2a1e'], [0.62, '#141420'], [1, '#0a0a12']])));
    c.add(circle(212, 132, 9, '#f4943e', 'opacity="0.9"'), line(200, 118, 200, 166, '#0e0a06', 4));
    let net = '';
    for (let i = 0; i < 10; i++) net += `M${20 + i * 14},40 Q${30 + i * 14},120 ${44 + i * 11},190 `;
    for (let j = 0; j < 6; j++) net += `M20,${60 + j * 22} Q90,${80 + j * 22} 150,${70 + j * 24} `;
    c.add(path(net, 'none', 'stroke="#8a7e62" stroke-width="1.2" opacity="0.45"'));
    c.add(rect(0, 290, W, 70, '#140f0a'));
    for (let x = 0; x < W; x += 60) c.add(line(x, 290, x - 30, 360, '#0a0705', 2));
    // Cold stove
    c.add(rect(560, 200, 60, 90, '#1a1a1a'), rect(574, 120, 14, 80, '#141414'), rect(570, 236, 40, 24, '#0a0a0a'));
    tom(c, 500, 300);
    wen(c, 360, 318);
    if (!s.flags.wenMet) {
      for (let i = 0; i < 4; i++) c.add(ellipse(240, 326 - i * 4, 34 - i * 5, 9 - i, 'none', 'stroke="#a88a52" stroke-width="4"'));
      c.add(path('M272,326 q20,-4 22,-24 q0,-14 -12,-14 q-12,0 -10,14 q2,14 22,24', 'none', 'stroke="#a88a52" stroke-width="3.5"'));
    }
    c.add(rect(0, 0, W, H, c.radial([[0, '#ff8a3a', 0.1], [1, '#ff8a3a', 0]], 0.3, 0.4, 0.4)));
    vignette(c, 0.75);
  },

  tidepools(c, s) {
    sky(c, NIGHT);
    harvestMoon(c, 140, 70, 24);
    crows(c, 3, 60, 120);
    c.add(rect(0, 170, W, 70, c.linear([[0, '#1a1a2a'], [1, '#0c0c16']])));
    waves(c, 175, 236, '#6a5a6a', 20);
    c.add(poly([[0, 220], [90, 200], [180, 214], [300, 206], [420, 216], [540, 200], [640, 214], [640, 360], [0, 360]], '#0e0e12'));
    c.add(poly([[0, 260], [120, 246], [200, 262], [0, 300]], '#16161c'), poly([[460, 250], [640, 236], [640, 300], [500, 290]], '#16161c'));
    const pool = c.linear([[0, '#4a3a4a'], [1, '#1a1a2a']]);
    c.add(ellipse(130, 246, 70, 14, pool), ellipse(520, 242, 60, 11, pool));
    c.add(ellipse(320, 300, 200, 46, pool), ellipse(320, 300, 200, 46, 'none', 'stroke="#060608" stroke-width="6"'));
    // The drowned man, face down
    c.add(path('M210,300 Q230,284 300,286 Q380,284 420,296 Q430,306 400,312 Q320,318 230,312 Q205,308 210,300 Z', '#1e2430'));
    c.add(path('M400,296 L470,300 L472,306 L402,310 Z', '#1e2430'), path('M300,312 L250,330 L258,334 L310,316 Z', '#1a202a'));
    c.add(ellipse(196, 300, 16, 13, s.flags.handOpened ? '#a8a49a' : '#1a1410'));
    if (s.flags.handOpened) c.add(circle(191, 298, 3, '#000'), circle(200, 296, 3, '#000'), ellipse(196, 306, 4, 2.5, '#000'));
    for (let i = 0; i < 7; i++) c.add(path(`M${186 + i * 2},${292} q-${10 + i * 3},${c.range(-8, 8)} -${22 + i * 4},${c.range(-6, 10)}`, 'none', 'stroke="#140e0a" stroke-width="2"'));
    if (s.flags.handOpened) {
      c.add(circle(478, 303, 6, '#8a8678'));
      for (let i = 0; i < 4; i++) c.add(line(482, 300 + i * 2, 492, 296 + i * 4, '#8a8678', 2));
      if (s.items.reliquary === 'tidepools')
        c.add(circle(500, 322, 16, c.radial([[0, '#ffd870', 0.6], [1, '#ffd870', 0]])), rect(496, 316, 8, 12, '#d8a83a'));
    } else {
      c.add(circle(478, 303, 7, '#8a8678'), circle(480, 300, 10, c.radial([[0, '#ffd870', 0.7], [1, '#ffd870', 0]])));
    }
    vignette(c, 0.6);
  },

  stones(c, s) {
    sky(c, NIGHT);
    stars(c, 80, 200, 0.6);
    harvestMoon(c, 150, 84, 32);
    c.add(path('M0,360 L0,260 Q320,180 640,260 L640,360 Z', '#16121a'));
    c.add(path('M0,360 L0,290 Q320,230 640,290 L640,360 Z', '#1e1820'));
    tufts(c, 240, 360, 100, '#2a2028');
    const ring = [] as { x: number; y: number; h: number; w: number }[];
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + 0.4;
      const depth = Math.sin(a);
      ring.push({ x: 320 + Math.cos(a) * 220, y: 252 + depth * 44, h: 70 + depth * 30 + c.range(-8, 8), w: 26 + depth * 8 });
    }
    ring.sort((a, b) => a.y - b.y);
    const back = ring.filter((st) => st.y < 252);
    const front = ring.filter((st) => st.y >= 252);
    const drawStone = ({ x, y, h, w }: (typeof ring)[number]) => {
      c.add(path(`M${x - w / 2},${y} L${x - w / 2 + 3},${y - h + 10} Q${x},${y - h - 6} ${x + w / 2 - 2},${y - h + 8} L${x + w / 2},${y} Z`, '#5a5660'));
      c.add(path(`M${x + 2},${y} L${x + 4},${y - h + 4} Q${x + w / 2},${y - h + 6} ${x + w / 2},${y} Z`, '#34303a'));
      c.add(ellipse(x, y, w * 0.7, 4, '#000', 'opacity="0.35"'));
    };
    back.forEach(drawStone);
    if (!s.flags.childFed) ghostGirl(c, 320, 262, 1);
    front.forEach(drawStone);
    if (s.items.ring === 'stones') {
      c.add(circle(322, 266, 16, c.radial([[0, '#ffffff', 0.5], [1, '#ffffff', 0]])), ellipse(322, 266, 6, 3, 'none', 'stroke="#e0e4ea" stroke-width="2"'));
    }
    fog(c, 250, 320, 8, 0.07);
    vignette(c, 0.55);
  },
};

export function renderScene(roomId: string, state: State, dark: boolean): string {
  // Seed by room so scatter (stars, grass) is stable between visits.
  let seed = 7;
  for (const ch of roomId) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const c = new Ctx(seed);
  (scenes[roomId] ?? ((cc) => cc.add(rect(0, 0, W, H, '#000'))))(c, state, dark);
  return c.render();
}
