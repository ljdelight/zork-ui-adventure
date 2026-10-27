/**
 * A small kit for drawing procedural SVG illustrations in an ink-and-wash style. Stories build
 * their scenes from these pieces; see renderSketch. Everything is drawn in a 640x360 viewBox.
 */

export const W = 640;

export const H = 360;

let sceneCounter = 0;

export class Ctx {
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

export const rect = (x: number, y: number, w: number, h: number, fill: string, extra = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;

export const circle = (cx: number, cy: number, r: number, fill: string, extra = '') =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${extra}/>`;

export const ellipse = (cx: number, cy: number, rx: number, ry: number, fill: string, extra = '') =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;

export const path = (d: string, fill: string, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;

export const poly = (pts: [number, number][], fill: string, extra = '') =>
  `<polygon points="${pts.map((p) => p.join(',')).join(' ')}" fill="${fill}" ${extra}/>`;

export const line = (x1: number, y1: number, x2: number, y2: number, stroke: string, w = 1, extra = '') =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${w}" ${extra}/>`;

export function sky(c: Ctx, stops: [number, string][]) {
  c.add(rect(0, 0, W, H, c.linear(stops)));
}

export function stars(c: Ctx, count: number, maxY: number, opacity = 0.8) {
  for (let i = 0; i < count; i++) {
    const r = c.rand() < 0.15 ? 1.6 : 0.9;
    c.add(circle(c.range(0, W), c.range(0, maxY), r, '#fff', `opacity="${(c.range(0.3, 1) * opacity).toFixed(2)}"`));
  }
}


/** A rolling ridge line from baseY, filled down to the bottom. */

/** A rolling ridge line from baseY, filled down to the bottom. */
export function ridge(c: Ctx, baseY: number, amp: number, fill: string, freq = 1) {
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

export function tufts(c: Ctx, y0: number, y1: number, count: number, color: string) {
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

export function stoneWall(c: Ctx, x: number, y: number, w: number, h: number, base: string, mortar: string, bh = 18) {
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

/** Shape of a round-topped arch as a path. */
export const archPath = (x: number, y: number, w: number, h: number) =>
  `M${x},${y + h} L${x},${y + w / 2} A${w / 2},${w / 2} 0 0 1 ${x + w},${y + w / 2} L${x + w},${y + h} Z`;

/** Gothic pointed arch. */

/** Gothic pointed arch. */
export const pointedArch = (x: number, y: number, w: number, h: number) =>
  `M${x},${y + h} L${x},${y + w * 0.6} Q${x},${y} ${x + w / 2},${y} Q${x + w},${y} ${x + w},${y + w * 0.6} L${x + w},${y + h} Z`;

export function flame(c: Ctx, x: number, y: number, s: number) {
  c.add(circle(x, y - 6 * s, 30 * s, c.radial([[0, '#ffcf6b', 0.55], [1, '#ff8a2a', 0]])));
  c.add(path(`M${x},${y - 18 * s} C${x + 8 * s},${y - 8 * s} ${x + 6 * s},${y} ${x},${y} C${x - 6 * s},${y} ${x - 8 * s},${y - 8 * s} ${x},${y - 18 * s} Z`, '#ff9d2e'));
  c.add(path(`M${x},${y - 11 * s} C${x + 4 * s},${y - 5 * s} ${x + 3 * s},${y} ${x},${y} C${x - 3 * s},${y} ${x - 4 * s},${y - 5 * s} ${x},${y - 11 * s} Z`, '#ffe9a8'));
}

export function vignette(c: Ctx, strength = 0.55) {
  c.add(rect(0, 0, W, H, c.radial([[0.55, '#000', 0], [1, '#000', strength]], 0.5, 0.5, 0.75)));
}

/** Darkness pressing in around a lantern-lit area. */

/** Darkness pressing in around a lantern-lit area. */
export function lanternLight(c: Ctx, cx = 0.5, cy = 0.6) {
  c.add(rect(0, 0, W, H, c.radial([[0, '#ffb347', 0.12], [0.5, '#000', 0.2], [1, '#000', 0.92]], cx, cy, 0.7)));
}

export function gulls(c: Ctx, count: number, y0: number, y1: number) {
  for (let i = 0; i < count; i++) {
    const x = c.range(40, W - 40);
    const y = c.range(y0, y1);
    const s = c.range(0.6, 1.3);
    c.add(path(`M${x - 8 * s},${y} Q${x - 4 * s},${y - 5 * s} ${x},${y} Q${x + 4 * s},${y - 5 * s} ${x + 8 * s},${y}`, 'none', `stroke="#2a2430" stroke-width="1.6"`));
  }
}

export function waves(c: Ctx, y0: number, y1: number, color: string, count: number) {
  for (let i = 0; i < count; i++) {
    const y = c.range(y0, y1);
    const x = c.range(-20, W);
    const len = c.range(20, 70) * (0.5 + (y - y0) / (y1 - y0));
    c.add(path(`M${x},${y} q${len / 4},-3 ${len / 2},0 t${len / 2},0`, 'none', `stroke="${color}" stroke-width="1.4" opacity="0.6"`));
  }
}

export const text = (x: number, y: number, str: string, size: number, fill: string, extra = '') =>
  `<text x="${x}" y="${y}" font-family="Georgia, serif" font-size="${size}" fill="${fill}" ${extra}>${str}</text>`;

export function harvestMoon(c: Ctx, x: number, y: number, r: number) {
  c.add(circle(x, y, r * 3.4, c.radial([[0, '#ff8a2a', 0.32], [1, '#ff5a10', 0]])));
  c.add(circle(x, y, r, c.radial([[0, '#ffd890'], [0.65, '#f4943e'], [1, '#c85a22']], 0.4, 0.38, 0.65)));
  c.add(circle(x - r * 0.3, y - r * 0.15, r * 0.17, '#cf6c2c', 'opacity="0.55"'), circle(x + r * 0.32, y + r * 0.28, r * 0.12, '#cf6c2c', 'opacity="0.55"'));
  c.add(ellipse(x + r * 0.3, y + r * 0.38, r * 1.7, r * 0.11, '#140a18', 'opacity="0.75"'));
}

/** A leafless tree, grown by recursive branching. */

/** A leafless tree, grown by recursive branching. */
export function bareTree(c: Ctx, x: number, y: number, len: number, angle: number, width: number, color: string, depth = 0) {
  const x2 = x + Math.cos(angle) * len;
  const y2 = y + Math.sin(angle) * len;
  c.add(line(x, y, x2, y2, color, width, 'stroke-linecap="round"'));
  if (depth >= 5 || len < 6) return;
  const n = c.rand() < 0.3 ? 3 : 2;
  for (let i = 0; i < n; i++) {
    bareTree(c, x2, y2, len * c.range(0.62, 0.8), angle + c.range(-0.75, 0.75), width * 0.66, color, depth + 1);
  }
}

export const deadTree = (c: Ctx, x: number, y: number, size: number, color = '#0c080c') =>
  bareTree(c, x, y, size, -Math.PI / 2 + c.range(-0.12, 0.12), size / 6, color);

export function fog(c: Ctx, y0: number, y1: number, count: number, opacity = 0.08) {
  for (let i = 0; i < count; i++) {
    c.add(ellipse(c.range(-40, W + 40), c.range(y0, y1), c.range(90, 200), c.range(8, 18), '#c8bcd8', `opacity="${opacity}"`));
  }
}

export function crows(c: Ctx, count: number, y0: number, y1: number) {
  gulls(c, count, y0, y1);
}

/** A standing silhouette: one of the dead, waiting. */

/** A standing silhouette: one of the dead, waiting. */
export function figure(c: Ctx, x: number, y: number, h: number, color = '#09070b', face = false) {
  const w = h * 0.28;
  c.add(path(`M${x - w / 2},${y} L${x - w * 0.3},${y - h * 0.78} Q${x},${y - h * 0.86} ${x + w * 0.3},${y - h * 0.78} L${x + w / 2},${y} Z`, color));
  c.add(circle(x, y - h * 0.88, h * 0.1, color));
  if (face) c.add(ellipse(x, y - h * 0.88, h * 0.055, h * 0.07, '#c8c0b0', 'opacity="0.35"'));
}

export type Scene<S> = (c: Ctx, s: S, dark: boolean) => void;

/** Renders one room's scene. Seeded by room id so scatter (stars, grass) is stable between visits. */
export function renderSketch<S>(scenes: Record<string, Scene<S>>, roomId: string, state: S, dark: boolean): string {
  let seed = 7;
  for (const ch of roomId) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const c = new Ctx(seed);
  (scenes[roomId] ?? ((cc) => cc.add(rect(0, 0, W, H, '#000'))))(c, state, dark);
  return c.render();
}
