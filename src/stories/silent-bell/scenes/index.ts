import type { State } from '../../../engine/types';
import {
  W, H, rect, circle, ellipse, path, poly, line, sky, stars, ridge, tufts, stoneWall, archPath, pointedArch,
  flame, vignette, lanternLight, waves, text, harvestMoon, deadTree, fog, crows, figure, renderSketch,
  type Scene,
} from '../../../engine/sketch';
import { lantern, key, clapperShape, NIGHT, turnipLantern, gibbet, shroud, ghostGirl, wen, tom } from './shapes';

/**
 * One illustration per room. Each reads game state so the picture reflects what the player
 * has done (rope tied, gate open, items taken...).
 */
const scenes: Record<string, Scene<State>> = {
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
  return renderSketch(scenes, roomId, state, dark);
}
