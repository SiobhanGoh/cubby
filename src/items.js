// The catalogue. Every item is ONE entry:
//   name, category, color (its default main colour: a hex, or the name of a palette slot),
//   optional flags (sits: can stand on furniture, wall: hangs on a wall, flat: lies on the floor),
//   optional behaviour (idle, click), and a recipe build(g, p, c) that makes it from kit pieces.
//   g = the group to build into, p = the room palette, c = this item's main colour.
// Adding a new item = adding one entry here. Nothing else in the app changes.
import { box, cyl, blob, torus, sub, pivot, moving } from './kit.js';
const PI = Math.PI, DARK = '#2B2228';
const sp = (c, r, d) => { const n = Math.hypot(...d); return [c[0] + r[0] * d[0] / n, c[1] + r[1] * d[1] / n, c[2] + r[2] * d[2] / n]; };
function face(g, c, r, o = {}) {
  const sep = o.sep ?? .42, eh = o.eh ?? .22;
  for (const s of [-1, 1]) {
    const p = sp(c, r, [s * sep, -1, eh]);
    blob(g, [r[0] * .15, r[0] * .15, r[0] * .15], p, DARK, { kind: 'ceramic', part: 'eye' });
    blob(g, [r[0] * .05, r[0] * .05, r[0] * .05], [p[0] + r[0] * .05, p[1] - r[0] * .11, p[2] + r[0] * .06], '#FFFFFF', { part: 'eye' });
  }
  blob(g, [r[0] * .13, r[0] * .1, r[0] * .09], sp(c, r, [0, -1, -.08]), o.nose ?? '#E27D7A');
}
function ears(g, c, r, color, h = .07, w = .035) {
  for (const s of [-1, 1]) {
    const p = sp(c, r, [s * .55, -.05, 1]), e = sub(g, 'ear');
    cyl(e, w, h, [p[0], p[1], p[2] + h * .25], color, { r2: .004, rot: [0, s * .25, 0] });
    cyl(e, w * .55, h * .7, [p[0], p[1] - w * .5, p[2] + h * .2], '#F6B9B0', { r2: .002, rot: [0, s * .25, 0] });
    pivot(e, [p[0], p[1], p[2] - .01]);
  }
}
function legs(g, spots, r, h, color, paw) {                 // four legs, each turning at the hip
  for (const [x, y] of spots) { const l = sub(g, 'leg'); cyl(l, r, h, [x, y, h / 2], color); if (paw) blob(l, [r * 1.15, r * 1.4, r * .7], [x, y - r * .3, r * .6], paw, { kind: 'fabric' }); pivot(l, [x, y, h]); }
}
function monitor(g, ox, oy, yaw, screen) {
  const w = .52, h = .31;
  cyl(g, .09, .012, [ox, oy + .04, .006], '#22232E', { kind: 'plastic' });
  box(g, [.04, .025, .2], [ox, oy + .05, .1], '#22232E', { kind: 'plastic', r: .006 });
  box(g, [w, .025, h], [ox, oy, .2 + h / 2], '#17181F', { kind: 'plastic', r: .008, rot: [0, 0, yaw] });
  box(g, [w - .03, .004, h - .03], [ox + .014 * Math.sin(yaw), oy - .014 * Math.cos(yaw), .2 + h / 2], screen, { kind: 'glow0.5/1.7', r: 0, rot: [0, 0, yaw], act: { glow: true } });
}
function pc(g, n, rgb) {
  const sc = ['#BFE3FF', '#FFC2E6', '#B9F3FF'];
  if (n === 1) monitor(g, 0, .1, 0, sc[0]);
  else if (n === 2) { monitor(g, -.26, .08, .22, sc[0]); monitor(g, .26, .08, -.22, sc[1]); }
  else { monitor(g, 0, .14, 0, sc[0]); monitor(g, -.5, .03, .5, sc[1]); monitor(g, .5, .03, -.5, sc[2]); }
  const body = rgb ? '#22232E' : '#E9EAEE';
  box(g, [.36, .12, .016], [0, -.2, .008], body, { kind: 'plastic', r: .005 });
  if (rgb) box(g, [.34, .1, .004], [0, -.2, .018], '#FF62D3', { kind: 'glow0.5/2', r: 0 });
  blob(g, [.025, .04, .016], [.27, -.2, .012], body, { kind: 'plastic' });
  const tx = { 1: .48, 2: .72, 3: .93 }[n];
  box(g, [.19, .4, .42], [tx, .05, .21], rgb ? '#1A1B24' : '#DADDE5', { kind: 'plastic', r: .014 });
  if (rgb) [.1, .21, .32].forEach((z, k) => torus(g, .05, .008, [tx, -.152, z], ['#FF62D3', '#4FE3FF', '#A77BFF'][k], { kind: 'glow1.2/4', rot: [PI / 2, 0, 0] }));
  else cyl(g, .012, .004, [tx, -.152, .36], '#7FE0A6', { kind: 'glow1.5/3', rot: [PI / 2, 0, 0] });
}

export const CATEGORIES = ['Chairs', 'Beds', 'Tables', 'Tech', 'Pets', 'Plants', 'Lighting', 'Storage', 'Decor'];

export const ITEMS = {
  // ------------------------------------------------------------ chairs
  chair: { name: 'Wooden chair', category: 'Chairs', color: 'accent', build(g, p, c) {
    for (const sx of [-.18, .18]) for (const sy of [-.18, .18]) cyl(g, .02, .44, [sx, sy, .22], p.wood);
    box(g, [.44, .44, .07], [0, 0, .465], c, { r: .03 });
    box(g, [.44, .07, .48], [0, .2, .73], c, { r: .03 });
  } },
  gaming: { name: 'Gaming chair', category: 'Chairs', color: '#FF3D8B', build(g, p, c) {
    const main = '#22232E', t = [-.13, 0, 0];
    for (let i = 0; i < 5; i++) { const a = i * 2 * PI / 5; box(g, [.26, .045, .03], [.13 * Math.cos(a), .13 * Math.sin(a), .06], '#17181F', { kind: 'plastic', r: .008, rot: [0, 0, a] }); blob(g, [.03, .03, .03], [.26 * Math.cos(a), .26 * Math.sin(a), .03], '#0E0E12', { kind: 'plastic' }); }
    cyl(g, .028, .3, [0, 0, .22], '#9AA0AD', { kind: 'metal' });
    box(g, [.48, .48, .1], [0, -.02, .43], main, { kind: 'fabric', r: .04 });
    box(g, [.46, .1, .74], [0, .25, .86], main, { kind: 'fabric', r: .045, rot: t });
    box(g, [.54, .11, .2], [0, .3, 1.2], main, { kind: 'fabric', r: .05, rot: t });
    box(g, [.26, .05, .1], [0, .225, 1.2], c, { kind: 'fabric', r: .025, rot: t });
    for (const s of [-1, 1]) {
      box(g, [.07, .44, .07], [s * .22, -.02, .48], c, { kind: 'fabric', r: .03 });
      box(g, [.06, .03, .62], [s * .15, .195, .84], c, { kind: 'fabric', r: .012, rot: t });
      box(g, [.06, .03, .62], [s * .15, .31, .86], c, { kind: 'fabric', r: .012, rot: t });
      box(g, [.08, .13, .5], [s * .25, .24, .8], main, { kind: 'fabric', r: .03, rot: t });
      box(g, [.035, .035, .2], [s * .29, .02, .56], '#17181F', { kind: 'plastic', r: .008 });
      box(g, [.07, .26, .03], [s * .29, 0, .67], '#17181F', { kind: 'plastic', r: .012 });
    }
  } },
  recliner: { name: 'Recliner', category: 'Chairs', color: '#B5835E', build(g, p, c) {
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) cyl(g, .03, .06, [sx * .28, sy * .26, .03], '#3A2A22');
    box(g, [.72, .7, .22], [0, 0, .17], c, { kind: 'fabric', r: .08 });
    box(g, [.44, .5, .15], [0, -.05, .34], c, { kind: 'fabric', r: .06 });
    const bk = moving(g, { turn: ['x', -.42] }); box(bk, [.5, .2, .64], [0, .3, .62], c, { kind: 'fabric', r: .09, rot: [-.12, 0, 0] }); pivot(bk, [0, .22, .32]);
    for (const s of [-1, 1]) box(g, [.17, .68, .34], [s * .31, 0, .38], c, { kind: 'fabric', r: .08 });
    const ft = moving(g, { v: [0, -.3, .12] }); box(ft, [.3, .22, .04], [0, -.2, .2], '#3A2A22', { kind: 'metal', r: .01 }); box(ft, [.44, .12, .3], [0, -.3, .2], c, { kind: 'fabric', r: .05 });
  } },
  princess: { name: 'Princess chair', category: 'Chairs', color: '#F4A9C4', build(g, p, c) {
    const gold = '#E3B54A';
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) cyl(g, .028, .32, [sx * .17, sy * .17, .16], gold, { kind: 'gold', r2: .012, rot: [PI, 0, 0] });
    cyl(g, .27, .04, [0, 0, .33], gold, { kind: 'gold' });
    cyl(g, .255, .1, [0, 0, .4], c, { kind: 'fabric' });
    for (const s of [-1, 1]) cyl(g, .018, .32, [s * .16, .2, .56], gold, { kind: 'gold' });
    blob(g, [.3, .045, .36], [0, .235, .86], gold, { kind: 'gold' });
    blob(g, [.26, .06, .32], [0, .215, .86], c, { kind: 'fabric' });
    for (const [bx, bz] of [[0, .86], [-.11, .96], [.11, .96], [-.11, .76], [.11, .76], [0, 1.05], [0, .67]])
      blob(g, [.016, .012, .016], [bx, .215 - .058 * Math.sqrt(Math.max(0, 1 - (bx / .26) ** 2 - ((bz - .86) / .32) ** 2)), bz], gold, { kind: 'gold' });
    for (const [bx, bh] of [[-.08, .07], [0, .11], [.08, .07]]) cyl(g, .03, bh, [bx, .235, 1.22 + bh / 2], gold, { kind: 'gold', r2: .004 });
  } },
  kopitiam: { name: 'Kopitiam chair', category: 'Chairs', color: '#D8362E', build(g, p, c) {
    const o = { kind: 'plastic', r: .01 }, t = [-.12, 0, 0];
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) box(g, [.05, .05, .44], [sx * .19, sy * .17, .22], c, { ...o, rot: [sy * .06, -sx * .06, 0] });
    box(g, [.44, .42, .035], [0, 0, .44], c, o);
    for (const s of [-1, 1]) {
      box(g, [.045, .035, .46], [s * .195, .22, .68], c, { ...o, rot: t });
      box(g, [.035, .4, .03], [s * .215, .02, .64], c, o);
      box(g, [.035, .035, .2], [s * .215, -.16, .54], c, o);
    }
    box(g, [.435, .035, .09], [0, .245, .88], c, { ...o, rot: t });
    for (const bx of [-.1, 0, .1]) box(g, [.05, .02, .36], [bx, .22, .66], c, { kind: 'plastic', r: .006, rot: t });
  } },
  bubble: { name: 'Bubble chair', category: 'Chairs', color: '#B9A0FF', build(g, p, c) {
    const o = { kind: 'plastic' };
    blob(g, [.34, .34, .15], [0, 0, .15], c, o); blob(g, [.3, .3, .1], [0, -.02, .27], c, o); blob(g, [.36, .15, .32], [0, .26, .44], c, o);
    for (const s of [-1, 1]) blob(g, [.11, .28, .15], [s * .32, .02, .33], c, o);
  } },
  beanbag: { name: 'Beanbag', category: 'Chairs', color: 'accent2', build(g, p, c) {
    blob(g, [.4, .4, .2], [0, 0, .18], c, { kind: 'fabric' }); blob(g, [.3, .3, .2], [0, .06, .34], c, { kind: 'fabric' }); blob(g, [.1, .1, .05], [0, .08, .53], c, { kind: 'fabric' });
  } },
  sofa: { name: 'Sofa', category: 'Chairs', color: 'soft', build(g, p, c) {
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) cyl(g, .025, .08, [sx * .62, sy * .25, .04], p.wood);
    box(g, [1.45, .7, .26], [0, 0, .21], c, { kind: 'fabric', r: .08 }); box(g, [1.45, .2, .5], [0, .27, .55], c, { kind: 'fabric', r: .09 });
    for (const s of [-1, 1]) { box(g, [.18, .7, .34], [s * .64, 0, .42], c, { kind: 'fabric', r: .08 }); box(g, [.56, .46, .12], [s * .29, -.06, .39], c, { kind: 'fabric', r: .05 }); }
    box(g, [.3, .1, .3], [-.3, .12, .58], p.accent, { kind: 'fabric', r: .05, rot: [-.3, 0, .2] });
  } },
  stool: { name: 'Stool', category: 'Chairs', color: 'accent2', build(g, p, c) {
    cyl(g, .17, .05, [0, 0, .4], c);
    for (let i = 0; i < 3; i++) { const a = i * 2 * PI / 3; cyl(g, .018, .4, [.11 * Math.cos(a), .11 * Math.sin(a), .2], p.wood); }
  } },
  // ------------------------------------------------------------ beds
  bed: { name: 'Bed', category: 'Beds', color: 'soft', build(g, p, c) {
    box(g, [1.05, 2.05, .28], [0, 0, .14], p.wood);
    box(g, [1.05, .1, .95], [0, 1.0, .475], p.wood, { r: .05 });
    box(g, [.98, 1.9, .2], [0, -.02, .38], p.cream, { kind: 'fabric', r: .08 });
    box(g, [.62, .38, .13], [0, .68, .55], '#FFFFFF', { kind: 'fabric', r: .06 });
    box(g, [1.08, 1.3, .12], [0, -.33, .52], c, { kind: 'fabric', r: .06, act: { v: [0, -.33, .03], s: [1, .5, 1.5] } });
    box(g, [1.1, .18, .05], [0, .28, .58], p.soft2, { kind: 'fabric', r: .025, act: { v: [0, -.66, .1], s: [1, 1.6, 1] } });
  } },
  futon: { name: 'Futon', category: 'Beds', color: '#DCD2C2', build(g, p, c) {
    box(g, [1.2, 2.15, .1], [0, 0, .05], p.wood, { r: .02 });
    box(g, [1.0, 1.95, .12], [0, 0, .16], p.cream, { kind: 'fabric', r: .05 });
    box(g, [1.04, 1.25, .1], [0, -.34, .26], c, { kind: 'fabric', r: .045, act: { v: [0, -.32, .03], s: [1, .5, 1.5] } });
    box(g, [.5, .28, .09], [0, .72, .27], '#FFFFFF', { kind: 'fabric', r: .04 });
  } },
  canopy: { name: 'Canopy bed', category: 'Beds', color: '#F4A9C4', build(g, p, c) {
    const fr = '#FFFFFF', gold = '#E3B54A', dr = '#FBE3EC';
    box(g, [1.05, 2.05, .28], [0, 0, .14], fr); box(g, [1.05, .1, 1.1], [0, 1.0, .55], fr, { r: .05 });
    box(g, [.98, 1.9, .2], [0, -.02, .38], p.cream, { kind: 'fabric', r: .08 }); box(g, [.62, .38, .13], [0, .68, .55], '#FFFFFF', { kind: 'fabric', r: .06 });
    box(g, [1.08, 1.3, .12], [0, -.33, .52], c, { kind: 'fabric', r: .06, act: { v: [0, -.33, .03], s: [1, .5, 1.5] } }); box(g, [1.1, .18, .05], [0, .28, .58], '#FFFFFF', { kind: 'fabric', r: .025, act: { v: [0, -.66, .1], s: [1, 1.6, 1] } });
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) { cyl(g, .03, 1.95, [sx * .5, sy * 1.0, .975], fr); blob(g, [.045, .045, .045], [sx * .5, sy * 1.0, 1.98], gold, { kind: 'gold' }); box(g, [.13, .13, 1.0], [sx * .5, sy * .97, 1.4], dr, { kind: 'fabric', r: .05 }); }
      box(g, [.04, 2.0, .04], [sx * .5, 0, 1.92], fr, { r: .01 });
      for (let i = 0; i < 7; i++) blob(g, [.03, .15, .09], [sx * .5, -.86 + i * .29, 1.84], dr, { kind: 'fabric' });
    }
    for (const sy of [-1, 1]) box(g, [1.0, .04, .04], [0, sy * 1.0, 1.92], fr, { r: .01 });
    for (let i = 0; i < 4; i++) blob(g, [.14, .03, .09], [-.4 + i * .27, -1.0, 1.84], dr, { kind: 'fabric' });
  } },
  roundbed: { name: 'Round bed', category: 'Beds', color: '#FF8FCF', build(g, p, c) {
    cyl(g, .85, .22, [0, 0, .11], p.wood, { kind: 'plastic' }); cyl(g, .8, .18, [0, 0, .31], p.cream, { kind: 'fabric' });
    blob(g, [.78, .12, .58], [0, .8, .5], c, { kind: 'plastic' });
    for (const s of [-1, 1]) blob(g, [.2, .13, .07], [s * .25, .45, .44], '#FFFFFF', { kind: 'fabric' });
    blob(g, [.72, .46, .045], [0, -.3, .41], p.soft, { kind: 'fabric', act: { v: [0, -.25, .02], s: [1, .5, 1.6] } });
  } },
  // ------------------------------------------------------------ tables
  desk: { name: 'Desk', category: 'Tables', color: 'wood2', build(g, p, c) {
    box(g, [1.2, .62, .05], [0, 0, .74], c, { r: .02 });
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) box(g, [.05, .05, .72], [sx * .54, sy * .25, .36], p.wood, { r: .012 });
    box(g, [.42, .55, .18], [.32, .01, .62], c, { r: .02 });
    const dr = moving(g, { v: [0, -.3, 0] }); box(dr, [.37, .5, .13], [.32, -.03, .62], c, { r: .012 }); box(dr, [.33, .44, .02], [.32, -.03, .68], '#3A2A22', { r: 0 }); blob(dr, [.022, .022, .022], [.32, -.29, .62], p.metal, { kind: 'metal' });
  } },
  gamingdesk: { name: 'Gaming desk', category: 'Tables', color: '#4FE3FF', build(g, p, c) {
    box(g, [1.9, .66, .04], [0, 0, .74], '#1C1D27', { kind: 'plastic', r: .014 });
    for (const s of [-1, 1]) { box(g, [.05, .6, .04], [s * .85, 0, .02], '#101117', { kind: 'metal', r: .008 }); box(g, [.05, .06, .72], [s * .85, .1, .37], '#101117', { kind: 'metal', r: .008 }); }
    box(g, [1.8, .015, .015], [0, -.335, .715], c, { kind: 'glow1/4', r: 0 });
  } },
  kopitable: { name: 'Kopitiam table', category: 'Tables', color: '#F4F1EC', build(g, p, c) {
    cyl(g, .24, .03, [0, 0, .015], '#5A3B28'); cyl(g, .04, .68, [0, 0, .37], '#5A3B28'); cyl(g, .1, .06, [0, 0, .68], '#5A3B28');
    cyl(g, .44, .035, [0, 0, .73], c, { kind: 'ceramic' });
  } },
  sidetable: { name: 'Side table', category: 'Tables', color: '#FFFFFF', build(g, p, c) {
    cyl(g, .2, .03, [0, 0, .45], c, { kind: 'plastic' }); cyl(g, .025, .45, [0, 0, .225], c, { kind: 'plastic' }); cyl(g, .14, .02, [0, 0, .01], c, { kind: 'plastic' });
  } },
  lowtable: { name: 'Low table', category: 'Tables', color: 'wood2', build(g, p, c) {
    cyl(g, .48, .04, [0, 0, .3], c);
    for (let i = 0; i < 4; i++) { const a = PI / 4 + i * PI / 2; cyl(g, .025, .28, [.3 * Math.cos(a), .3 * Math.sin(a), .14], p.wood); }
  } },
  vanity: { name: 'Vanity', category: 'Tables', color: '#FFFFFF', build(g, p, c) {
    const gold = '#E3B54A';
    box(g, [.95, .45, .05], [0, 0, .7], c, { r: .015 }); box(g, [.87, .4, .12], [0, 0, .62], c, { r: .01 });
    for (const sx of [-1, 1]) { blob(g, [.018, .018, .018], [sx * .2, -.205, .62], gold, { kind: 'gold' }); for (const sy of [-1, 1]) cyl(g, .025, .58, [sx * .41, sy * .17, .29], c, { r2: .012, rot: [PI, 0, 0] }); }
    blob(g, [.24, .03, .3], [0, .2, 1.1], gold, { kind: 'gold' }); blob(g, [.21, .032, .27], [0, .192, 1.1], '#DCEFF7', { kind: 'metal' }); cyl(g, .012, .14, [0, .2, .78], gold, { kind: 'gold' });
  } },
  coffeetable: { name: 'Coffee table', category: 'Tables', color: 'wood2', build(g, p, c) {
    box(g, [.9, .5, .04], [0, 0, .36], c, { r: .02 }); box(g, [.8, .42, .03], [0, 0, .12], c, { r: .015 });
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) box(g, [.04, .04, .36], [sx * .4, sy * .2, .18], p.wood, { r: .01 });
  } },
  // ------------------------------------------------------------ tech
  laptop: { name: 'Laptop', category: 'Tech', sits: true, color: '#C9CED8', build(g, p, c) {
    box(g, [.34, .24, .016], [0, 0, .008], c, { kind: 'metal', r: .006 });
    box(g, [.28, .1, .003], [0, -.04, .017], '#8E94A3', { r: 0 });
    const lid = moving(g, { turn: ['x', 1.77] }); box(lid, [.34, .012, .23], [0, .14, .125], c, { kind: 'metal', r: .006, rot: [-.2, 0, 0] });
    box(lid, [.31, .004, .2], [0, .132, .125], '#BFE3FF', { kind: 'glow0.5/1.6', r: 0, rot: [-.2, 0, 0], act: { glow: true } }); pivot(lid, [0, .118, .018]);
  } },
  tablet: { name: 'Tablet', category: 'Tech', sits: true, color: '#E9EAEE', build(g, p, c) {
    box(g, [.12, .1, .012], [0, .04, .006], '#B9BDC8', { kind: 'metal', r: .004 });
    box(g, [.05, .012, .14], [0, .075, .07], '#B9BDC8', { kind: 'metal', r: .004, rot: [.35, 0, 0] });
    box(g, [.21, .012, .28], [0, .03, .155], c, { kind: 'metal', r: .006, rot: [-.3, 0, 0] });
    box(g, [.19, .004, .26], [0, .0225, .155], '#FFD9EC', { kind: 'glow0.5/1.6', r: 0, rot: [-.3, 0, 0], act: { glow: true } });
  } },
  pc1: { name: 'PC · 1 screen', category: 'Tech', sits: true, build(g) { pc(g, 1, false); } },
  pc2: { name: 'PC · 2 screens', category: 'Tech', sits: true, build(g) { pc(g, 2, false); } },
  pc3: { name: 'Gaming PC · 3 screens', category: 'Tech', sits: true, build(g) { pc(g, 3, true); } },
  tv: { name: 'TV and console', category: 'Tech', color: 'wood', build(g, p, c) {
    box(g, [1.2, .36, .36], [0, 0, .26], c, { r: .015 }); for (const sx of [-1, 1]) for (const sy of [-1, 1]) cyl(g, .018, .1, [sx * .52, sy * .12, .05], p.metal);
    box(g, [1.0, .04, .58], [0, .08, .78], '#17181F', { kind: 'plastic', r: .012 }); box(g, [.96, .004, .54], [0, .058, .78], '#B9E3FF', { kind: 'glow0.5/1.7', r: 0, act: { glow: true } });
    box(g, [.3, .1, .03], [0, .06, .46], '#17181F', { kind: 'plastic', r: .008 });
    box(g, [.26, .18, .05], [-.35, -.04, .465], '#F4F1EC', { kind: 'plastic', r: .015 }); box(g, [.14, .08, .03], [.3, -.08, .455], '#22232E', { kind: 'plastic', r: .014 });
  } },
  recordplayer: { name: 'Record player', category: 'Tech', sits: true, idle: 'record', color: 'accent2', hint: 'Paste your Spotify, YouTube Music or Apple Music link', build(g, p, c) {
    box(g, [.4, .34, .1], [0, 0, .05], c, { r: .02 }); cyl(g, .13, .012, [-.04, 0, .106], '#2B2730'); cyl(g, .045, .014, [-.04, 0, .108], p.accent);
    cyl(g, .012, .03, [.15, .11, .115], '#C9CED8', { kind: 'metal' }); box(g, [.012, .2, .012], [.12, .02, .125], '#C9CED8', { kind: 'metal', r: 0, rot: [0, 0, .3] });
  } },
  speaker: { name: 'Speaker', category: 'Tech', sits: true, color: '#22232E', build(g, p, c) {
    box(g, [.2, .18, .34], [0, 0, .17], c, { kind: 'plastic', r: .02 });
    cyl(g, .065, .01, [0, -.092, .12], '#3A3D4D', { rot: [PI / 2, 0, 0] }); cyl(g, .035, .01, [0, -.092, .26], '#3A3D4D', { rot: [PI / 2, 0, 0] });
  } },
  // ------------------------------------------------------------ pets
  cat: { name: 'Loaf cat', category: 'Pets', sits: true, click: 'hearts', color: '#F3A55A', build(g, p, c) {
    const belly = '#FFE6CC', h = [0, -.19, .17], hr = [.105, .1, .092], f = { kind: 'fabric' };
    legs(g, [[-.07, -.1], [.07, -.1], [-.07, .14], [.07, .14]], .028, .09, c, belly);
    const bd = sub(g, 'body'); blob(bd, [.14, .2, .11], [0, .05, .11], c, f);
    for (const y of [-.04, .06, .16]) blob(bd, [.1 * Math.sqrt(1 - ((y - .05) / .2) ** 2), .016, .01], [0, y, .11 + .108 * Math.sqrt(1 - ((y - .05) / .2) ** 2)], '#D9813E', f);
    for (const s of [-1, 1]) blob(bd, [.035, .04, .025], [s * .06, -.13, .03], belly, { kind: 'fabric', part: 'paw' });
    const tl = sub(bd, 'tail'); blob(tl, [.028, .15, .028], [.1, .26, .05], c, { kind: 'fabric', rot: [0, 0, .5] }); pivot(tl, [.03, .2, .06]);
    const hd = sub(bd, 'head'); blob(hd, hr, h, c, f); blob(hd, [.05, .035, .035], sp(h, hr, [0, -1, -.35]), belly, f); ears(hd, h, hr, c); face(hd, h, hr); pivot(hd, [0, -.12, .13]);
    pivot(bd, [0, .05, .02]);
  } },
  tuxedo: { name: 'Tuxedo cat', category: 'Pets', sits: true, click: 'hearts', color: '#2F2B33', build(g, p, c) {
    const belly = '#F7F2EA', b = [0, .03, .16], br = [.105, .11, .16], h = [0, -.02, .38], hr = [.1, .095, .088], f = { kind: 'fabric' };
    legs(g, [[-.06, -.06], [.06, -.06], [-.06, .1], [.06, .1]], .028, .1, c, belly);
    const bd = sub(g, 'body'); blob(bd, br, b, c, f); blob(bd, [.06, .035, .09], sp(b, br, [0, -1, .15]), belly, f);
    for (const s of [-1, 1]) blob(bd, [.03, .035, .03], [s * .045, -.09, .03], belly, { kind: 'fabric', part: 'paw' });
    const tl = sub(bd, 'tail'); blob(tl, [.11, .03, .03], [.1, .12, .035], c, { kind: 'fabric', rot: [0, 0, -.4] }); pivot(tl, [.02, .1, .04]);
    const hd = sub(bd, 'head'); blob(hd, hr, h, c, f); blob(hd, [.05, .035, .035], sp(h, hr, [0, -1, -.4]), belly, f); ears(hd, h, hr, c, .08); face(hd, h, hr); pivot(hd, [0, 0, .3]);
    pivot(bd, [0, .08, .06]);
  } },
  bunny: { name: 'Bunny', category: 'Pets', sits: true, click: 'hearts', color: '#FFFFFF', build(g, p, c) {
    const pink = '#F9B8C6', h = [0, -.11, .2], hr = [.082, .078, .076], f = { kind: 'fabric' };
    const bd = sub(g, 'body'); blob(bd, [.1, .13, .1], [0, .04, .1], c, f); blob(bd, [.04, .04, .04], [0, .17, .1], c, f);
    for (const s of [-1, 1]) { blob(bd, [.03, .04, .022], [s * .055, -.07, .025], c, f); blob(bd, [.035, .07, .028], [s * .08, .1, .028], c, f); }
    const hd = sub(bd, 'head'); blob(hd, hr, h, c, f);
    for (const s of [-1, 1]) {
      const e = sub(hd, 'ear'); blob(e, [.024, .018, .1], [s * .04, -.09, .35], c, { kind: 'fabric', rot: [.15, s * .18, 0] }); blob(e, [.013, .01, .07], [s * .04, -.105, .35], pink, { kind: 'fabric', rot: [.15, s * .18, 0] }); pivot(e, [s * .035, -.09, .26]);
      blob(hd, [.02, .012, .012], sp(h, hr, [s * .55, -1, -.25]), pink, f);
    }
    face(hd, h, hr, { sep: .5, nose: pink }); pivot(hd, [0, -.06, .15]);
    pivot(bd, [0, .06, .02]);
  } },
  corgi: { name: 'Corgi', category: 'Pets', sits: true, click: 'hearts', color: '#E9A04E', build(g, p, c) {
    const white = '#FFF6EA', h = [0, -.24, .33], hr = [.105, .1, .098], f = { kind: 'fabric' };
    legs(g, [[-.07, -.1], [.07, -.1], [-.07, .2], [.07, .2]], .032, .12, c, white);
    const bd = sub(g, 'body'); blob(bd, [.115, .24, .115], [0, .06, .2], c, f); blob(bd, [.085, .07, .09], [0, -.15, .19], white, f); blob(bd, [.09, .06, .09], [0, .27, .2], white, f);
    const tl = sub(bd, 'tail'); blob(tl, [.03, .05, .03], [0, .33, .27], c, f); pivot(tl, [0, .29, .25]);
    const hd = sub(bd, 'head'); blob(hd, hr, h, c, f); blob(hd, [.055, .08, .05], [0, -.33, .3], white, f); blob(hd, [.02, .016, .015], [0, -.41, .315], DARK, { kind: 'ceramic' }); blob(hd, [.018, .008, .025], [0, -.385, .262], '#F08A8A');
    for (const s of [-1, 1]) {
      const e = sub(hd, 'ear'); cyl(e, .05, .13, [s * .07, -.23, .47], c, { r2: .008, rot: [0, s * .22, 0] }); cyl(e, .028, .09, [s * .07, -.245, .46], '#F6C9A8', { r2: .004, rot: [0, s * .22, 0] }); pivot(e, [s * .065, -.23, .41]);
      blob(hd, [.016, .016, .016], sp(h, hr, [s * .45, -1, .3]), DARK, { kind: 'ceramic', part: 'eye' });
    }
    pivot(hd, [0, -.16, .27]); pivot(bd, [0, .06, .12]);
  } },
  golden: { name: 'Golden retriever', category: 'Pets', sits: true, click: 'hearts', color: '#E8B56A', build(g, p, c) {
    const h = [0, -.38, .34], hr = [.15, .15, .14], f = { kind: 'fabric' }, dark = '#C98F45';
    legs(g, [[-.11, -.2], [.11, -.2], [-.12, .26], [.12, .26]], .045, .2, c, '#F6DDB0');
    const bd = sub(g, 'body'); blob(bd, [.2, .38, .17], [0, .05, .17], c, f); blob(bd, [.14, .12, .13], [0, -.24, .2], c, f);
    for (const s of [-1, 1]) { blob(bd, [.055, .15, .045], [s * .1, -.43, .045], c, { kind: 'fabric', part: 'paw' }); blob(bd, [.08, .12, .07], [s * .18, .24, .07], c, { kind: 'fabric', part: 'paw' }); }
    const tl = sub(bd, 'tail'); blob(tl, [.045, .18, .045], [.06, .52, .14], dark, { kind: 'fabric', rot: [.3, 0, .3] }); pivot(tl, [0, .38, .16]);
    const hd = sub(bd, 'head'); blob(hd, hr, h, c, f); blob(hd, [.078, .1, .065], [0, -.5, .3], '#F6DDB0', f); blob(hd, [.03, .024, .022], [0, -.6, .325], DARK, { kind: 'ceramic' }); blob(hd, [.024, .01, .035], [0, -.57, .245], '#F08A8A');
    for (const s of [-1, 1]) {
      const e = sub(hd, 'ear'); blob(e, [.045, .075, .11], [s * .15, -.36, .31], dark, { kind: 'fabric', rot: [0, s * .2, 0] }); pivot(e, [s * .14, -.36, .41]);
      blob(hd, [.02, .02, .02], sp(h, hr, [s * .42, -1, .32]), DARK, { kind: 'ceramic', part: 'eye' });
    }
    pivot(hd, [0, -.26, .26]); pivot(bd, [0, .05, .03]);
  } },
  fishbowl: { name: 'Goldfish', category: 'Pets', sits: true, color: '#FF8A3C', build(g, p, c) {
    cyl(g, .1, .02, [0, 0, .03], '#F2D9A8');
    blob(g, [.045, .02, .028], [0, -.01, .14], c, { kind: 'ceramic' }).userData.swim = true;
    blob(g, [.012, .012, .05], [.05, .03, .08], '#4F9E66');
    blob(g, [.14, .14, .13], [0, 0, .14], '#BFEAF7', { kind: 'glass' }).castShadow = false;
    torus(g, .085, .012, [0, 0, .255], '#DDF3FA', { kind: 'ceramic' });
  } },
  hamster: { name: 'Hamster', category: 'Pets', sits: true, click: 'hearts', color: '#E9B872', build(g, p, c) {
    const h = [0, -.05, .075], hr = [.07, .075, .065], f = { kind: 'fabric' };
    const bd = sub(g, 'body'); blob(bd, [.075, .09, .065], [0, .02, .065], c, f); blob(bd, [.05, .04, .045], [0, -.07, .05], '#FFF6EA', f);
    for (const s of [-1, 1]) blob(bd, [.018, .022, .012], [s * .03, -.1, .012], '#F6B9B0');
    const hd = sub(bd, 'head'); blob(hd, hr, h, c, f);
    for (const s of [-1, 1]) { const e = sub(hd, 'ear'); blob(e, [.022, .012, .022], [s * .045, -.04, .135], c, f); pivot(e, [s * .045, -.04, .12]); }
    face(hd, h, hr, { sep: .5, eh: .3 }); pivot(hd, [0, -.02, .06]); pivot(bd, [0, .06, .01]);
  } },
  parrot: { name: 'Parrot', category: 'Pets', click: 'hearts', color: '#4FC48A', build(g, p, c) {
    const f = { kind: 'fabric' };
    cyl(g, .16, .03, [0, 0, .015], p.wood); cyl(g, .015, 1.0, [0, 0, .5], p.wood); cyl(g, .012, .4, [0, 0, 1.0], p.wood, { rot: [0, PI / 2, 0] });
    const bd = sub(g, 'body'); blob(bd, [.065, .06, .1], [0, 0, 1.12], c, f);
    for (const s of [-1, 1]) { const w = sub(bd, 'wing'); blob(w, [.02, .05, .075], [s * .06, .01, 1.11], '#3F9A72', f); pivot(w, [s * .055, .01, 1.18]); w.userData.side = s; }
    const tl = sub(bd, 'tail'); blob(tl, [.025, .02, .09], [0, .05, 1.0], '#E2615A', { kind: 'fabric', rot: [.4, 0, 0] }); pivot(tl, [0, .03, 1.06]);
    const hd = sub(bd, 'head'); blob(hd, [.055, .055, .055], [0, -.015, 1.24], c, f); cyl(hd, .022, .05, [0, -.07, 1.23], '#F6C46A', { r2: .003, rot: [PI / 2 + .4, 0, 0] });
    for (const s of [-1, 1]) blob(hd, [.012, .012, .012], [s * .035, -.05, 1.255], DARK, { kind: 'ceramic', part: 'eye' });
    pivot(hd, [0, 0, 1.19]); pivot(bd, [0, 0, 1.02]);
  } },
  turtle: { name: 'Turtle', category: 'Pets', sits: true, click: 'hearts', color: '#6FAE8A', build(g, p, c) {
    for (const s of [-1, 1]) for (const y of [-.08, .08]) { const l = sub(g, 'leg'); blob(l, [.035, .03, .018], [s * .11, y, .02], '#A9D6A0'); pivot(l, [s * .08, y, .03]); }
    const bd = sub(g, 'body'); blob(bd, [.11, .13, .06], [0, 0, .06], c, { kind: 'ceramic' }); blob(bd, [.085, .1, .03], [0, 0, .095], '#4F8A68', { kind: 'ceramic' });
    const hd = sub(bd, 'head'); blob(hd, [.04, .045, .035], [0, -.15, .06], '#A9D6A0'); for (const s of [-1, 1]) blob(hd, [.008, .008, .008], [s * .022, -.185, .07], DARK, { part: 'eye' }); pivot(hd, [0, -.1, .06]);
    pivot(bd, [0, 0, .02]);
  } },
  // ------------------------------------------------------------ plants
  monstera: { name: 'Monstera', category: 'Plants', color: 'pot', build(g, p, c) {
    cyl(g, .14, .32, [0, 0, .16], c, { kind: 'ceramic', r2: .17 }); cyl(g, .14, .02, [0, 0, .315], '#5A3A2A');
    [[0, 0, .85, 0], [.12, .05, .7, .9], [-.1, .08, .75, 2.2], [.05, -.12, .62, 3.4], [-.06, -.06, .95, 4.4], [.1, .1, 1.0, 5.4], [-.12, 0, .55, 1.6]].forEach(([dx, dy, h, a], i) => {
      const st = sub(g, 'stem'); cyl(st, .008, h - .3, [dx * .5, dy * .5, .3 + (h - .3) / 2], p.leaf);
      const lf = sub(st, 'leaf'); blob(lf, [.17, .11, .012], [dx + .06 * Math.cos(a), dy + .06 * Math.sin(a), h], i % 2 ? p.leaf : p.leaf2, { rot: [.25, -.45, a] }); pivot(lf, [dx * .5, dy * .5, h - .02]);
      pivot(st, [dx * .3, dy * .3, .31]);
    });
  } },
  snake: { name: 'Snake plant', category: 'Plants', color: '#F4EFE7', build(g, p, c) {
    cyl(g, .13, .34, [0, 0, .17], c, { kind: 'ceramic' });
    for (let i = 0; i < 8; i++) { const a = i * 2.4, r = .04 + .012 * (i % 3), h = .34 + .06 * ((i * 5) % 4), st = sub(g, 'stem'); blob(st, [.04, .012, h], [r * Math.cos(a), r * Math.sin(a), .3 + h * .9], i % 2 ? '#3F7F58' : '#7FB069', { rot: [.12 * Math.sin(a), -.12 * Math.cos(a), a] }); st.userData.stiff = .35; pivot(st, [r * Math.cos(a), r * Math.sin(a), .32]); }
  } },
  cactus: { name: 'Cactus', category: 'Plants', sits: true, color: '#D27D5E', build(g, p, c) {
    cyl(g, .1, .14, [0, 0, .07], c, { kind: 'ceramic', r2: .12 }); blob(g, [.075, .075, .2], [0, 0, .32], '#5FA873');
    for (const [s, z, h] of [[-1, .3, .09], [1, .37, .07]]) { blob(g, [.05, .03, .03], [s * .09, 0, z], '#5FA873'); blob(g, [.035, .035, h], [s * .13, 0, z + h * .7], '#5FA873'); }
    blob(g, [.03, .03, .02], [0, 0, .525], '#FF8FB5');
  } },
  succulents: { name: 'Succulent trio', category: 'Plants', sits: true, build(g) {
    [[-.16, '#7FBF9A', '#F6C46A'], [0, '#9AD0B0', '#EE9A82'], [.16, '#6FAE8A', '#89B5D8']].forEach(([x, c, pot], k) => {
      cyl(g, .055, .09, [x, 0, .045], pot, { kind: 'ceramic' });
      for (let i = 0; i < 6; i++) { const a = i * PI / 3 + k; blob(g, [.035, .018, .012], [x + .028 * Math.cos(a), .028 * Math.sin(a), .1], c, { rot: [0, -.5, a] }); }
      blob(g, [.02, .02, .02], [x, 0, .115], c);
    });
  } },
  bonsai: { name: 'Bonsai', category: 'Plants', sits: true, color: '#6E7F8E', build(g, p, c) {
    box(g, [.32, .2, .07], [0, 0, .045], c, { kind: 'ceramic', r: .014 });
    cyl(g, .028, .14, [-.02, 0, .15], '#6B4A35', { rot: [0, .3, 0] }); cyl(g, .022, .14, [.03, 0, .26], '#6B4A35', { rot: [0, -.6, 0] }); cyl(g, .016, .12, [-.03, 0, .34], '#6B4A35', { rot: [0, .9, 0] });
    for (const [x, y, z, s, col] of [[-.1, 0, .4, 1, '#5D7F5A'], [.1, .02, .33, .8, '#86A47F'], [.02, -.02, .47, .7, '#86A47F'], [-.16, .03, .32, .55, '#5D7F5A']]) blob(g, [.13 * s, .11 * s, .055 * s], [x, y, z], col);
  } },
  palm: { name: 'Palm', category: 'Plants', color: '#D9B48A', build(g, p, c) {
    cyl(g, .17, .3, [0, 0, .15], c, { kind: 'fabric' });
    const st = sub(g, 'stem'); st.userData.stiff = .3; cyl(st, .022, .95, [0, 0, .75], '#8C6E55');
    for (let i = 0; i < 9; i++) { const a = i * 2 * PI / 9, fr = sub(st, 'leaf'); blob(fr, [.3, .055, .01], [.24 * Math.cos(a), .24 * Math.sin(a), 1.2 - .1 * (i % 2)], i % 2 ? p.leaf : p.leaf2, { rot: [0, .45 + .25 * (i % 2), a] }); fr.userData.ang = a; pivot(fr, [0, 0, 1.22]); }
    blob(st, [.04, .04, .05], [0, 0, 1.24], p.leaf); pivot(st, [0, 0, .3]);
  } },
  // ------------------------------------------------------------ lighting
  lamp: { name: 'Desk lamp', category: 'Lighting', sits: true, click: 'lamp', color: 'accent', build(g, p, c) {
    cyl(g, .075, .03, [0, 0, .015], p.metal, { kind: 'metal' }); cyl(g, .01, .34, [0, 0, .19], p.metal, { kind: 'metal' });
    cyl(g, .12, .15, [0, -.04, .38], c, { r2: .05, rot: [.35, 0, 0] });
    blob(g, [.035, .035, .035], [0, -.05, .34], '#FFF1C8', { kind: 'glow0.4/3' });
  } },
  floorlamp: { name: 'Floor lamp', category: 'Lighting', color: '#FFF6E4', build(g, p, c) {
    cyl(g, .14, .03, [0, 0, .015], '#E3B54A', { kind: 'gold' }); cyl(g, .012, 1.4, [0, 0, .72], '#E3B54A', { kind: 'gold' });
    cyl(g, .17, .22, [0, 0, 1.48], c, { kind: 'glow0.15/1.1', r2: .1, act: { glow: true } });
  } },
  mushroom: { name: 'Mushroom lamp', category: 'Lighting', sits: true, color: '#FFB38A', build(g, p, c) {
    cyl(g, .035, .12, [0, 0, .06], '#FFFFFF', { kind: 'ceramic' }); blob(g, [.1, .1, .07], [0, 0, .15], c, { kind: 'glow0.35/1.8', act: { glow: true } });
  } },
  lava: { name: 'Lava lamp', category: 'Lighting', sits: true, color: '#FF8FCF', build(g, p, c) {
    cyl(g, .06, .1, [0, 0, .05], '#C9D3E6', { kind: 'metal', r2: .04 }); blob(g, [.05, .05, .13], [0, 0, .22], c, { kind: 'glow0.5/2', act: { glow: true } }); cyl(g, .035, .06, [0, 0, .36], '#C9D3E6', { kind: 'metal', r2: .02 });
  } },
  fan: { name: 'Standing fan', category: 'Decor', color: '#F4F1EC', idle: 'spin', build(g, p, c) {
    cyl(g, .2, .04, [0, 0, .02], c, { kind: 'plastic' }); cyl(g, .02, 1.15, [0, 0, .6], c, { kind: 'plastic' });
    cyl(g, .07, .14, [0, .02, 1.22], c, { kind: 'plastic', rot: [PI / 2, 0, 0] });
    for (const y of [-.03, -.09]) torus(g, .25, .01, [0, y, 1.22], '#B9BDC8', { kind: 'metal', rot: [PI / 2, 0, 0] });
    for (let i = 0; i < 3; i++) { const a = i * 2 * PI / 3 + .4; blob(g, [.11, .008, .055], [.11 * Math.cos(a), -.06, 1.22 + .11 * Math.sin(a)], '#5FA8D8', { kind: 'plastic', rot: [0, -a, 0] }); }
  } },
  paperlamp: { name: 'Paper lamp', category: 'Lighting', color: '#FFF3DC', build(g, p, c) {
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) box(g, [.02, .02, .8], [sx * .11, sy * .11, .4], p.wood, { r: 0 });
    box(g, [.2, .2, .62], [0, 0, .45], c, { kind: 'glow0.3/1.3', r: 0, act: { glow: true } }); for (const z of [.14, .45, .76]) box(g, [.24, .24, .015], [0, 0, z], p.wood, { r: 0 });
  } },
  neonheart: { name: 'Neon heart', category: 'Lighting', wall: true, color: '#FF62D3', build(g, p, c) {
    for (const s of [-1, 1]) { torus(g, .12, .016, [s * .12, -.03, .1], c, { kind: 'glow1.2/4', rot: [PI / 2, 0, 0], act: { glow: true } }); cyl(g, .016, .36, [s * .115, -.03, -.1], c, { kind: 'glow1.2/4', rot: [0, s * -.72, 0], act: { glow: true } }); }
  } },
  // ------------------------------------------------------------ storage
  bookshelf: { name: 'Bookshelf', category: 'Storage', color: 'wood', build(g, p, c) {
    const w = .75, h = 1.85, d = .32;
    for (const sx of [-1, 1]) box(g, [.03, d, h], [sx * w / 2, 0, h / 2], c, { r: .008 });
    box(g, [w, .02, h], [0, d / 2 - .01, h / 2], c, { r: 0 });
    for (let i = 0; i <= 3; i++) {
      const z = .02 + i * (h - .04) / 3;
      box(g, [w, d, .03], [0, 0, z], c, { r: .006 });
      if (i === 3) break;
      let x = -w / 2 + .05, k = 0;
      while (x < w / 2 - .09) { const bw = [.05, .07, .045, .06][(k + i) % 4], bh = [.36, .3, .4, .33][(k * 3 + i) % 4]; box(g, [bw, .22, bh], [x + bw / 2, .02, z + .015 + bh / 2], p.books[(k + i) % p.books.length], { r: .008, part: 'book' }); x += bw + .008; k++; }
    }
  } },
  cabinet: { name: 'Low cabinet', category: 'Storage', color: 'wood2', build(g, p, c) {
    box(g, [1.0, .33, .42], [0, .005, .33], c, { r: .015 }); box(g, [.94, .01, .36], [0, -.158, .33], '#3A2A22', { r: 0 });
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) cyl(g, .018, .12, [sx * .43, sy * .11, .06], p.wood);
      const d = moving(g, { turn: ['z', sx * 1.75] }); box(d, [.485, .02, .39], [sx * .245, -.172, .33], c, { r: .008 }); blob(d, [.014, .014, .014], [sx * .05, -.19, .36], p.metal, { kind: 'metal' }); pivot(d, [sx * .49, -.172, .33]);
    }
  } },
  wardrobe: { name: 'Wardrobe', category: 'Storage', color: 'wood', build(g, p, c) {
    box(g, [.95, .48, 1.9], [0, .01, .97], c, { r: .02 }); box(g, [.88, .01, 1.78], [0, -.232, .97], '#3A2A22', { r: 0 }); cyl(g, .012, .84, [0, -.1, 1.6], p.metal, { kind: 'metal', rot: [0, PI / 2, 0] });
    for (const s of [-1, 1]) {
      for (const sy of [-1, 1]) cyl(g, .02, .04, [s * .4, sy * .18, .01], p.metal);
      box(g, [.2, .03, .5], [s * .2, -.1, 1.3], [p.soft, p.accent2][s < 0 ? 0 : 1], { kind: 'fabric', r: .012 });
      const d = moving(g, { turn: ['z', s * 1.7] }); box(d, [.46, .02, 1.84], [s * .235, -.245, .97], c, { r: .008 }); cyl(d, .012, .16, [s * .05, -.265, 1.0], p.metal, { kind: 'metal' }); pivot(d, [s * .465, -.245, .97]);
    }
  } },
  toychest: { name: 'Toy chest', category: 'Storage', color: '#F4A9C4', build(g, p, c) {
    box(g, [.62, .38, .3], [0, 0, .15], c, { r: .02 }); box(g, [.56, .32, .01], [0, 0, .301], '#3A2A22', { r: 0 }); const lid = moving(g, { turn: ['x', -1.25] }); box(lid, [.65, .41, .07], [0, 0, .335], '#FFFFFF', { r: .025 }); pivot(lid, [0, .2, .3]); box(g, [.07, .02, .09], [0, -.2, .25], '#E3B54A', { kind: 'gold', r: .008 });
  } },
  // ------------------------------------------------------------ decor
  rug: { name: 'Round rug', category: 'Decor', flat: true, color: 'accent', build(g, p, c) {
    cyl(g, .85, .025, [0, 0, .013], p.soft2, { kind: 'fabric' }); cyl(g, .6, .027, [0, 0, .014], c, { kind: 'fabric' }); cyl(g, .36, .029, [0, 0, .015], p.soft2, { kind: 'fabric' });
  } },
  cloudrug: { name: 'Cloud rug', category: 'Decor', flat: true, color: '#FFFFFF', build(g, p, c) {
    for (const [x, y, r] of [[0, 0, .5], [.42, .1, .36], [-.42, .05, .38], [.15, -.3, .34], [-.2, -.28, .32], [.1, .32, .33], [-.25, .3, .3]]) blob(g, [r, r, .03], [x, y, .012], c, { kind: 'fabric' });
  } },
  frames: { name: 'Photo wall', category: 'Decor', wall: true, color: 'wood', build(g, p, c) {
    [[-.55, .5, .38, 0, p.accent], [.02, .34, .46, .05, p.soft], [.45, .36, .28, -.05, p.accent2]].forEach(([x0, w, h, z, col]) => {
      box(g, [w, .03, h], [x0 + w / 2, -.015, z], c, { r: .008 });
      box(g, [w - .06, .01, h - .06], [x0 + w / 2, -.032, z], p.soft2, { r: 0 });
      blob(g, [Math.min(w, h) * .16, .004, Math.min(w, h) * .16], [x0 + w * .62, -.038, z + h * .12], col);
      box(g, [w - .06, .004, (h - .06) * .4], [x0 + w / 2, -.039, z - (h - .06) * .3], p.leaf2, { r: 0 });
    });
  } },
  clock: { name: 'Wall clock', category: 'Decor', wall: true, color: 'accent', build(g, p, c) {
    cyl(g, .2, .04, [0, -.02, 0], c, { rot: [PI / 2, 0, 0] }); cyl(g, .165, .045, [0, -.022, 0], '#FFFDF8', { rot: [PI / 2, 0, 0] });
    box(g, [.018, .01, .09], [0, -.05, .045], DARK, { r: 0 }); box(g, [.012, .01, .14], [0, -.052, .07], DARK, { r: 0 }); blob(g, [.014, .008, .014], [0, -.056, 0], c);
  } },
  poster: { name: 'Poster', category: 'Decor', wall: true, color: 'accent2', build(g, p, c) {
    box(g, [.5, .012, .7], [0, -.006, 0], '#FFFDF8', { r: 0 }); box(g, [.44, .006, .64], [0, -.014, 0], c, { r: 0 });
    blob(g, [.12, .004, .12], [0, -.02, .1], '#FFE9A8'); box(g, [.44, .004, .2], [0, -.019, -.22], p.soft, { r: 0 });
  } },
  mirror: { name: 'Mirror', category: 'Decor', wall: true, color: '#E3B54A', build(g, p, c) {
    blob(g, [.26, .02, .4], [0, -.015, 0], c, { kind: 'gold' }); blob(g, [.225, .022, .365], [0, -.02, 0], '#DCEFF7', { kind: 'metal' });
  } },
  teddy: { name: 'Teddy bear', category: 'Decor', sits: true, click: 'hearts', color: '#C98F5B', build(g, p, c) {
    blob(g, [.1, .09, .11], [0, 0, .11], c, { kind: 'fabric' }); const h = [0, -.01, .27], hr = [.085, .08, .075]; blob(g, hr, h, c, { kind: 'fabric' });
    blob(g, [.04, .03, .03], [0, -.08, .255], '#F3DDB8', { kind: 'fabric' }); face(g, h, hr, { sep: .4, eh: .25, nose: DARK });
    for (const s of [-1, 1]) { blob(g, [.03, .02, .03], [s * .07, 0, .335], c, { kind: 'fabric' }); blob(g, [.035, .05, .035], [s * .1, -.04, .11], c, { kind: 'fabric' }); blob(g, [.04, .06, .035], [s * .06, -.09, .03], c, { kind: 'fabric' }); }
  } },
  books: { name: 'Book stack', category: 'Decor', sits: true, build(g, p) {
    [[.26, .19, .04, 0], [.24, .18, .035, .2], [.22, .16, .04, -.15], [.2, .15, .03, .1]].reduce((z, [w, d, h, r], i) => { box(g, [w, d, h], [0, 0, z + h / 2], p.books[i % p.books.length], { r: .006, rot: [0, 0, r] }); return z + h; }, 0);
  } },
  teaset: { name: 'Tea set', category: 'Decor', sits: true, color: '#6E7F8E', build(g, p, c) {
    box(g, [.34, .22, .015], [0, 0, .008], p.wood, { r: .004 }); blob(g, [.06, .06, .05], [-.07, 0, .07], c, { kind: 'ceramic' }); cyl(g, .012, .07, [-.14, 0, .08], c, { kind: 'ceramic', rot: [0, -1.0, 0] });
    for (const [x, y] of [[.06, -.04], [.12, .04]]) cyl(g, .028, .04, [x, y, .035], '#F4EFE7', { kind: 'ceramic' });
  } },
  guitar: { name: 'Guitar', category: 'Decor', color: '#E0A77C', build(g, p, c) {
    cyl(g, .16, .03, [0, 0, .015], p.metal, { kind: 'metal' }); cyl(g, .012, .5, [0, .06, .25], p.metal, { kind: 'metal' });
    const t = [-.18, 0, 0];
    blob(g, [.17, .05, .2], [0, 0, .28], c, { rot: t }); blob(g, [.13, .05, .15], [0, .05, .52], c, { rot: t }); blob(g, [.045, .052, .045], [0, .015, .42], DARK, { rot: t });
    box(g, [.045, .03, .55], [0, .13, .88], '#6B4A35', { r: .008, rot: t }); box(g, [.07, .035, .13], [0, .19, 1.2], '#6B4A35', { r: .012, rot: t });
  } },
  mug: { name: 'Mug', category: 'Decor', sits: true, color: 'accent2', build(g, p, c) {
    cyl(g, .04, .09, [0, 0, .045], c, { kind: 'ceramic' }); torus(g, .028, .008, [.05, 0, .05], c, { kind: 'ceramic', rot: [PI / 2, 0, 0] });
  } },
};

// Pets wander, stretch and groom in live mode. speed = room units per second, hop = bounce height, head = which piece nods.
// How each pet moves. speed = room units per second; lift = how far the body rises when it stands up;
// tilt = how far a sitting body leans forward to walk; gait = walk | hop | scurry | paddle | perch.
const pets = {
  cat: { speed: .3, lift: .065, tilt: 0, gait: 'walk', stride: 26, tail: [.35, 1.6] }, tuxedo: { speed: .3, lift: .05, tilt: .95, gait: 'walk', stride: 26, tail: [.35, 1.6] },
  bunny: { speed: .5, lift: 0, tilt: 0, gait: 'hop', hop: .11 }, corgi: { speed: .36, lift: 0, tilt: 0, gait: 'walk', stride: 30, tail: [.5, 7], stands: true },
  golden: { speed: .34, lift: .15, tilt: 0, gait: 'walk', stride: 16, tail: [.45, 5] }, hamster: { speed: .34, lift: 0, tilt: 0, gait: 'scurry', sniff: true },
  turtle: { speed: .06, lift: .012, tilt: 0, gait: 'paddle', stride: 90, calm: true }, parrot: { speed: 0, lift: 0, tilt: 0, gait: 'perch', tail: [.12, 1.2] },
};
for (const [id, cfg] of Object.entries(pets)) ITEMS[id].pet = cfg;
for (const id of ['gaming', 'stool', 'sidetable', 'kopitable', 'beanbag', 'bubble']) ITEMS[id].click = 'spin';
ITEMS.fishbowl.idle = 'swim'; ITEMS.clock.idle = 'clock';

export const TINTS = ['#F4A582', '#EE8FA6', '#F2D57E', '#8FBF8A', '#8EC1E3', '#B9A3E3', '#8C6E55', '#4B4A6B', '#FFFFFF'];

// A palette fills the same named colour slots for every item. "tile" (optional) gives the floor a checker pattern.
const base = { cream: '#FFF8EE', pot: '#E08566', leaf: '#4F9E66', leaf2: '#79C58C' };
export const PALETTES = {
  natural: { ...base, name: 'Natural', wall: '#EFECE6', wall2: '#F4F2ED', floor: '#B98C5E', wood: '#7A5236', wood2: '#C49A6C', soft: '#8C9A88', soft2: '#EAE4D8', accent: '#B5683C', accent2: '#3E596B', metal: '#262626', cream: '#F6F3EC', pot: '#A85A3B', leaf: '#3B6642', leaf2: '#5A8655',
    books: ['#3E596B', '#B5683C', '#8C9A88', '#D9C9A8', '#5C4A3D'], bg: ['#D9D5CE', '#B9B4AC'] },
  matcha: { ...base, name: 'Matcha', wall: '#E3EAD3', wall2: '#EEF1E4', floor: '#D9C3A0', wood: '#C9A27A', wood2: '#E6D2B5', soft: '#8FC28C', soft2: '#F5E9CF', accent: '#F6C46A', accent2: '#EE9A82', metal: '#5B6462',
    books: ['#8FC28C', '#F6C46A', '#EE9A82', '#89B5D8', '#C9A7E0'], bg: ['#F7F3EA', '#E6EEDD'] },
  strawberry: { ...base, name: 'Strawberry milk', wall: '#FADDE2', wall2: '#FDEBEE', floor: '#E9C7A8', wood: '#E7B3A8', wood2: '#FFFFFF', soft: '#EF8EA7', soft2: '#FFF2F4', accent: '#FFC97A', accent2: '#F4A4BA', metal: '#E3B54A', pot: '#FFFFFF',
    books: ['#EF8EA7', '#FFC97A', '#B9A3E3', '#8EC9E3', '#9AD0B0'], bg: ['#FFF3F6', '#FBDDE6'] },
  ocean: { ...base, name: 'Ocean soda', wall: '#CDEFFA', wall2: '#E6F7FD', floor: '#A9D9EA', tile: '#FFB8E0', wood: '#7DB6DB', wood2: '#FFFFFF', soft: '#7FD8F0', soft2: '#FFFFFF', accent: '#FF8FCF', accent2: '#B9A0FF', metal: '#C9D3E6', cream: '#FFFFFF', pot: '#FF8FCF', leaf: '#4FC48A', leaf2: '#8BE3B0',
    books: ['#FF8FCF', '#B9A0FF', '#7FD8F0', '#FFE27A', '#9CF0C8'], bg: ['#E9F8FF', '#FFD9F0'] },
  midnight: { ...base, name: 'Midnight', wall: '#2A2E5C', wall2: '#33386B', floor: '#2C2747', wood: '#4C4170', wood2: '#6A5D96', soft: '#5664C4', soft2: '#3A3F7A', accent: '#FF62D3', accent2: '#4FE3FF', metal: '#1A1D3A', cream: '#C8C9EE', pot: '#7A5BC4', leaf: '#3E8F7A', leaf2: '#5FC2A2',
    books: ['#FF62D3', '#4FE3FF', '#A77BFF', '#FFD36F', '#6A5D96'], bg: ['#191B3A', '#2A2550'], dark: true },
  kopi: { ...base, name: 'Kopitiam', wall: '#F7E7B8', wall2: '#BFE0CF', floor: '#EFE6D2', tile: '#7FB89A', wood: '#B5764E', wood2: '#E0A77C', soft: '#5FA8A0', soft2: '#F7EEE4', accent: '#F2A33A', accent2: '#E2615A', metal: '#3F4A56', cream: '#FDF6EC', pot: '#E2615A', leaf: '#3F9A72', leaf2: '#6CC08E',
    books: ['#5FA8A0', '#F2A33A', '#E2615A', '#4F79B8', '#F7EEE4'], bg: ['#FFF6DE', '#E3F1E6'] },
  mocha: { ...base, name: 'Mocha', wall: '#ECE6DC', wall2: '#F2EDE5', floor: '#B89A7C', wood: '#9C7A5B', wood2: '#D3BFA5', soft: '#DCD2C2', soft2: '#F4EFE7', accent: '#A9B79B', accent2: '#C49B76', metal: '#3E3A36', cream: '#F7F3EC', pot: '#CFC4B4', leaf: '#5D7F5A', leaf2: '#86A47F',
    books: ['#A9B79B', '#C49B76', '#8C6E55', '#DCD2C2', '#6E7F8E'], bg: ['#EFEAE2', '#DCD5CA'] },
};

// A template = a style + a palette + a time of day + a list of items. Heights are worked out when it loads.
const I = (item, x, y, rz = 0, tint = null, z = 0) => ({ item, pos: [x, y, z], rz, tint });
export const TEMPLATES = {
  home: { name: 'Home', style: 'real', palette: 'natural', mood: 'morning', items: [
    I('rug', 1.9, 1.2, 0, '#D9CDB8'), I('bed', 1.03, 2.66, 90), I('cat', 1.45, 2.62, 60, '#D9A066'), I('desk', .33, 1.38, 90), I('laptop', .36, 1.25, 90), I('lamp', .2, 1.82, 90, '#262626'), I('mug', .5, .98, 0, '#F6F3EC'),
    I('chair', .98, 1.3, -75), I('bookshelf', 2.68, 3.03), I('books', 2.68, 3.03), I('monstera', .4, .38), I('recliner', 2.55, .7, 25, '#6F7C6C'), I('floorlamp', 2.9, 2.2), I('poster', 1.1, 3.2, 0, '#3E596B', 1.6), I('clock', 0, 2.6, 90, '#262626', 2.0)] },
  matcha: { name: 'Matcha study', style: 'clay', palette: 'matcha', mood: 'morning', items: [
    I('rug', 1.9, 1.2), I('bed', 1.03, 2.66, 90), I('cat', 1.45, 2.62, 60), I('desk', .33, 1.38, 90), I('laptop', .36, 1.25, 90), I('lamp', .2, 1.82, 90), I('mug', .5, .98),
    I('chair', .98, 1.3, -75), I('bookshelf', 2.68, 3.03), I('succulents', 2.68, 3.03), I('monstera', .4, .38), I('beanbag', 2.5, .75), I('frames', 1.1, 3.2, 0, null, 1.5)] },
  fairytale: { name: 'Fairytale', style: 'story', palette: 'strawberry', mood: 'morning', items: [
    I('cloudrug', 2.0, 1.05), I('canopy', 1.05, 2.62, 90), I('bunny', 1.5, 2.6, 55), I('desk', .33, 1.38, 90), I('tablet', .33, 1.2, 90), I('mushroom', .25, 1.75),
    I('princess', 1.0, 1.25, -55), I('floorlamp', 2.85, 1.9), I('palm', .38, .38), I('bunny', 2.25, .8, 30, '#D9B48A'), I('bookshelf', 2.72, 3.03), I('frames', 1.2, 3.2, 0, '#FFFFFF', 1.9)] },
  bubble: { name: 'Bubble pop', style: 'y2k', palette: 'ocean', mood: 'morning', items: [
    I('cloudrug', 1.9, 1.05), I('roundbed', 1.0, 2.2, 45), I('corgi', 1.95, .95, 40), I('desk', 2.55, 2.87, 0), I('pc1', 2.4, 2.87, 0), I('sidetable', .3, .5), I('lava', .3, .5),
    I('bubble', 2.45, 2.0, 150), I('cactus', .45, 1.0, 0, '#FF8FCF'), I('beanbag', 2.7, .6, 0, '#FFE27A')] },
  nightshift: { name: 'Night shift', style: 'neon', palette: 'midnight', mood: 'night', items: [
    I('rug', 2.0, 1.0), I('bed', .6, 2.1, 0), I('tuxedo', .6, 1.6, 50), I('gamingdesk', 2.15, 2.84, 0), I('pc3', 1.95, 2.84, 0), I('lamp', 2.95, 2.9, 0, '#FF62D3'),
    I('gaming', 2.0, 2.05, 160), I('snake', .35, .4, 0, '#4C4170'), I('sidetable', 1.3, .55, 0, '#4C4170'), I('fishbowl', 1.3, .55), I('lava', .2, 1.0, 0, '#4FE3FF'), I('beanbag', 2.7, .6)] },
  kopitiam: { name: 'Kopitiam lepak', style: 'lowpoly', palette: 'kopi', mood: 'morning', items: [
    I('bed', 1.03, 2.66, 90), I('kopitable', 1.95, 1.15), I('mug', 1.85, 1.1, 0, '#FFFFFF'), I('tablet', 2.1, 1.3, 30), I('kopitiam', 1.25, 1.2, 90), I('kopitiam', 2.05, 1.85, 10), I('kopitiam', 2.65, .95, -110),
    I('golden', 1.0, .5, 75), I('fan', 2.75, 2.75, 20), I('palm', .38, 1.8, 0, '#E2615A'), I('cabinet', .22, .75, 90), I('cactus', .22, .5), I('lamp', .2, 1.0, 90), I('frames', 1.2, 3.2, 0, null, 1.6)] },
  quiet: { name: 'Quiet', style: 'japandi', palette: 'mocha', mood: 'rain', items: [
    I('rug', 1.95, 1.1, 0, '#CFC2AE'), I('futon', 1.15, 2.6, 90), I('lowtable', 1.95, 1.1), I('laptop', 1.8, 1.0, 120), I('mug', 2.15, 1.25, 0, '#6E7F8E'), I('cabinet', .22, 1.38, 90),
    I('bonsai', .22, 1.2, 90), I('mushroom', .22, 1.7, 0, '#FFF3DC'), I('snake', .35, .38), I('tuxedo', 2.6, .55, 35, '#F4EFE7'), I('floorlamp', 2.85, 2.85)] },
};
