import { rect, circle, ellipse, path, poly, line, flame, type Ctx } from '../../../engine/sketch';

/** Figures and props particular to The Silent Bell. */

export function lantern(c: Ctx, x: number, y: number, s: number, lit: boolean) {
  if (lit) c.add(circle(x, y - 22 * s, 60 * s, c.radial([[0, '#ffd27a', 0.5], [1, '#ffb347', 0]])));
  c.add(path(`M${x - 8 * s},${y - 52 * s} Q${x},${y - 66 * s} ${x + 8 * s},${y - 52 * s}`, 'none', `stroke="#8a6a2a" stroke-width="${2.5 * s}"`));
  c.add(poly([[x - 12 * s, y - 40 * s], [x + 12 * s, y - 40 * s], [x + 6 * s, y - 52 * s], [x - 6 * s, y - 52 * s]], '#b8902f'));
  c.add(rect(x - 10 * s, y - 40 * s, 20 * s, 32 * s, lit ? '#ffdc8a' : '#3d3a33', `opacity="${lit ? 0.95 : 0.8}"`));
  if (lit) flame(c, x, y - 14 * s, 0.6 * s);
  c.add(rect(x - 11 * s, y - 40 * s, 3 * s, 32 * s, '#b8902f'), rect(x + 8 * s, y - 40 * s, 3 * s, 32 * s, '#b8902f'));
  c.add(rect(x - 14 * s, y - 8 * s, 28 * s, 8 * s, '#9a7626'));
}

export function key(c: Ctx, x: number, y: number, s: number) {
  c.add(circle(x, y, 26 * s, c.radial([[0, '#fff3c4', 0.45], [1, '#fff3c4', 0]])));
  c.add(circle(x - 14 * s, y, 7 * s, 'none', `stroke="#9aa0a8" stroke-width="${3.5 * s}"`));
  c.add(rect(x - 7 * s, y - 2 * s, 26 * s, 4 * s, '#9aa0a8'));
  c.add(rect(x + 13 * s, y + 2 * s, 3 * s, 6 * s, '#9aa0a8'), rect(x + 7 * s, y + 2 * s, 3 * s, 4 * s, '#9aa0a8'));
}

export function clapperShape(c: Ctx, x: number, y: number, s: number) {
  c.add(circle(x, y - 10 * s, 6 * s, 'none', `stroke="#5a4a3a" stroke-width="${3 * s}"`));
  c.add(rect(x - 2 * s, y - 6 * s, 4 * s, 28 * s, '#8a6a3a'));
  c.add(path(`M${x},${y + 18 * s} C${x + 14 * s},${y + 22 * s} ${x + 14 * s},${y + 46 * s} ${x},${y + 48 * s} C${x - 14 * s},${y + 46 * s} ${x - 14 * s},${y + 22 * s} ${x},${y + 18 * s} Z`, c.linear([[0, '#e0a95a'], [1, '#8a5a24']], 1, 0)));
}

// -----------------------------------------------------------------------------
// Scenes — All Hallows' Eve

export const NIGHT: [number, string][] = [[0, '#07060d'], [0.5, '#1c0f26'], [0.8, '#43192a'], [1, '#6a2a1e']];

export function turnipLantern(c: Ctx, x: number, y: number, s: number) {
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

export function gibbet(c: Ctx, x: number, groundY: number) {
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

/** A shrouded body lying flat, seen from the side. */
export function shroud(c: Ctx, x: number, y: number, len: number, h: number) {
  c.add(path(`M${x},${y} Q${x + len * 0.1},${y - h} ${x + len * 0.45},${y - h * 0.8} Q${x + len * 0.75},${y - h * 0.9} ${x + len},${y - h * 0.5} L${x + len},${y} Z`, '#cfc7b4'));
  c.add(ellipse(x + len * 0.08, y - h * 0.55, h * 0.55, h * 0.5, '#d8d0be'));
  for (let i = 1; i < 4; i++) c.add(line(x + len * (i / 4), y - h * 0.85, x + len * (i / 4) - 4, y, '#a8a090', 1, 'opacity="0.7"'));
}

export function ghostGirl(c: Ctx, x: number, y: number, s: number) {
  c.add(ellipse(x, y - 30 * s, 70 * s, 60 * s, c.radial([[0, '#cfe0e8', 0.28], [1, '#cfe0e8', 0]])));
  c.add(path(`M${x - 22 * s},${y} Q${x - 20 * s},${y - 40 * s} ${x - 12 * s},${y - 58 * s} Q${x},${y - 72 * s} ${x + 12 * s},${y - 58 * s} Q${x + 20 * s},${y - 40 * s} ${x + 22 * s},${y} Z`, '#9aa2aa', 'opacity="0.88"'));
  c.add(ellipse(x, y - 50 * s, 8 * s, 10 * s, '#2a2e34'));
  c.add(ellipse(x + 2 * s, y - 49 * s, 5 * s, 7 * s, '#c4c0b4', 'opacity="0.8"'));
  c.add(circle(x, y - 51 * s, 1.4 * s, '#000'), circle(x + 4 * s, y - 51 * s, 1.4 * s, '#000'));
  c.add(ellipse(x, y, 26 * s, 4 * s, '#000', 'opacity="0.25"'));
}

/** Wen Kard, sitting on the floor: a big man, red hair, a massive scruffy beard, a green and gold player's coat. */

/** Wen Kard, sitting on the floor: a big man, red hair, a massive scruffy beard, a green and gold player's coat. */
export function wen(c: Ctx, x: number, y: number, s = 1.35) {
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

/** Tom, dead in his chair, head bowed. */
export function tom(c: Ctx, x: number, y: number) {
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
