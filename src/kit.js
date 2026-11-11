// cubby kit: the building blocks every item is made from, plus the STYLE knobs that change how they look.
// Coordinates are "z-up" (x right, y back, z up).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// A style never redraws an item. It only turns these knobs.
export const STYLES = {
  real:    { name: 'Realistic',     round: .3,   flat: false, rough: .7,  toon: false, outline: false, coat: 0, env: .5,  leds: false, tex: true },
  clay:    { name: 'Soft clay',     round: 1,    flat: false, rough: .72, toon: false, outline: false, coat: 0, env: .15, leds: false },
  story:   { name: 'Storybook',     round: .35,  flat: false, rough: 1,   toon: true,  outline: true,  coat: 0, env: 0,   leds: false },
  y2k:     { name: 'Y2K gloss',     round: 1.3,  flat: false, rough: .22, toon: false, outline: false, coat: 1, env: .45,  leds: false },
  neon:    { name: 'Midnight neon', round: .6,   flat: false, rough: .5,  toon: false, outline: false, coat: 0, env: .1,  leds: true },
  lowpoly: { name: 'Low-poly',      round: 0,    flat: true,  rough: .85, toon: false, outline: false, coat: 0, env: .1,  leds: false },
  japandi: { name: 'Japandi',       round: .25,  flat: false, rough: .88, toon: false, outline: false, coat: 0, env: .1,  leds: false },
};
export const look = { style: STYLES.clay, id: 'clay' };
export function setStyle(id) { look.style = STYLES[id] || STYLES.clay; look.id = STYLES[id] ? id : 'clay'; mats.clear(); glowMats.length = 0; }

const mats = new Map();
export const glowMats = [];
const BEVEL = 0.045;
const ramp = new THREE.DataTexture(new Uint8Array([120, 120, 120, 255, 200, 200, 200, 255, 255, 255, 255, 255]), 3, 1);
ramp.minFilter = ramp.magFilter = THREE.NearestFilter; ramp.needsUpdate = true;
const ink = new THREE.MeshBasicMaterial({ color: '#3A2A2A', side: THREE.BackSide });
ink.onBeforeCompile = s => { s.vertexShader = s.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = position + normalize(normal) * 0.011;'); };

// ---- textures drawn in code, so the realistic style needs no image files
const texs = new Map();
function rnd(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function canvasTex(key, size, draw, srgb) {
  if (texs.has(key)) return texs.get(key);
  const c = document.createElement('canvas'); c.width = c.height = size; draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  texs.set(key, t); return t;
}
function grain(x, s, r, n, y0, y1) {                    // streaks of slightly lighter and darker wood
  for (let i = 0; i < n; i++) {
    const y = y0 + r() * (y1 - y0), dark = r() < .6; x.strokeStyle = dark ? 'rgba(40,20,5,' + (.04 + r() * .11) + ')' : 'rgba(255,240,215,' + (.03 + r() * .08) + ')'; x.lineWidth = .4 + r() * 1.6;
    x.beginPath(); const a = r() * 3, w = .6 + r() * 2.2; for (let px = 0; px <= s; px += 8) { const py = y + Math.sin(px / s * 6.28 * (1 + r() * .2) + a) * w; px ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke();
  }
}
const woodTex = color => canvasTex('wood' + color, 256, (x, s) => { const r = rnd(7); x.fillStyle = color; x.fillRect(0, 0, s, s); grain(x, s, r, 190, 0, s); }, true);
const plankTex = color => canvasTex('plank' + color, 1024, (x, s) => {
  const r = rnd(11), rows = 10, h = s / rows; x.fillStyle = color; x.fillRect(0, 0, s, s);
  for (let i = 0; i < rows; i++) {
    let px = -r() * s * .5;
    while (px < s) { const len = s * (.35 + r() * .45), tone = (r() - .5) * .16; x.fillStyle = tone > 0 ? 'rgba(255,235,205,' + tone + ')' : 'rgba(35,15,0,' + -tone + ')'; x.fillRect(px, i * h, len, h); x.fillStyle = 'rgba(30,15,5,.45)'; x.fillRect(px + len - 1.5, i * h, 2, h); px += len; }
    grain(x, s, r, 26, i * h + 2, (i + 1) * h - 2); x.fillStyle = 'rgba(30,15,5,.5)'; x.fillRect(0, i * h - 1, s, 2);
  }
}, true);
const weaveTex = () => canvasTex('weave', 64, (x, s) => { x.fillStyle = '#808080'; x.fillRect(0, 0, s, s); for (let i = 0; i < s; i += 4) for (let j = 0; j < s; j += 4) { x.fillStyle = ((i + j) / 4) % 2 ? '#a8a8a8' : '#585858'; x.fillRect(i, j, 4, 2); x.fillStyle = ((i + j) / 4) % 2 ? '#686868' : '#989898'; x.fillRect(i, j + 2, 2, 2); } }, false);
const speckTex = () => canvasTex('speck', 128, (x, s) => { const r = rnd(3), d = x.createImageData(s, s); for (let i = 0; i < s * s; i++) { const v = 118 + r() * 22; d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255; } x.putImageData(d, 0, 0); }, false);
function woody(color) { const c = new THREE.Color(color), h = {}; c.getHSL(h); return h.h > .035 && h.h < .13 && h.s > .16 && h.s < .8 && h.l > .18 && h.l < .8; }
function realMat(color, kind) {
  if (kind === 'floor') { const t = plankTex(color).clone(); t.repeat.set(1.6, 1.6); t.needsUpdate = true; return new THREE.MeshStandardMaterial({ map: t, roughness: .42, roughnessMap: speckTex() }); }
  if (kind === 'wall') { const b = speckTex().clone(); b.repeat.set(10, 10); b.needsUpdate = true; return new THREE.MeshStandardMaterial({ color, roughness: .93, bumpMap: b, bumpScale: .6 }); }
  if (kind === 'wood' || (kind === 'paint' && woody(color))) return new THREE.MeshStandardMaterial({ map: woodTex(color), roughness: .5 });
  if (kind === 'fabric') { const b = weaveTex().clone(); b.repeat.set(14, 14); b.needsUpdate = true; return new THREE.MeshPhysicalMaterial({ color, roughness: .96, bumpMap: b, bumpScale: 1.2, sheen: .5, sheenRoughness: .6, sheenColor: new THREE.Color(color).lerp(new THREE.Color('#ffffff'), .5) }); }
  if (kind === 'ceramic') return new THREE.MeshPhysicalMaterial({ color, roughness: .22, clearcoat: .7, clearcoatRoughness: .12 });
  if (kind === 'plastic') return new THREE.MeshStandardMaterial({ color, roughness: .38 });
  if (kind === 'metal') return new THREE.MeshStandardMaterial({ color, roughness: .28, metalness: 1 });
  if (kind === 'gold') return new THREE.MeshStandardMaterial({ color, roughness: .22, metalness: 1 });
  return new THREE.MeshStandardMaterial({ color, roughness: .78 });
}

export function mat(color, kind = 'paint') {
  const key = color + kind;
  if (mats.has(key)) return mats.get(key);
  const S = look.style;
  let m;
  const glow = kind.startsWith('glow');
  if (S.tex && !glow && kind !== 'glass') { m = realMat(color, kind); m.userData.kind = kind; mats.set(key, m); return m; }
  if (S.toon && !glow && kind !== 'glass') m = new THREE.MeshToonMaterial({ color, gradientMap: ramp });
  else if (S.coat && !glow && kind !== 'glass') m = new THREE.MeshPhysicalMaterial({ color, roughness: S.rough, clearcoat: 1, clearcoatRoughness: .08 });
  else m = new THREE.MeshStandardMaterial({ color, roughness: S.rough, metalness: 0, flatShading: S.flat });
  if (!S.toon) {
    if (kind === 'metal') { m.roughness = S.coat ? .12 : .35; m.metalness = S.coat ? 1 : .6; }
    if (kind === 'gold') { m.roughness = .28; m.metalness = 1; }
    if (kind === 'ceramic' || kind === 'plastic') m.roughness = Math.min(S.rough, .3);
    if (kind === 'fabric' && !S.coat) m.roughness = .95;
  }
  if (kind === 'glass') { m.transparent = true; m.opacity = .32; m.roughness = .05; m.depthWrite = false; }
  if (glow) {
    const [day, night] = kind.slice(4).split('/').map(Number);
    m.emissive = new THREE.Color(color); m.emissiveIntensity = day; glowMats.push({ m, day, night });
  }
  m.userData.kind = kind;
  mats.set(key, m);
  return m;
}

function add(g, mesh, pos, rot, part, act) {
  if (part) mesh.userData.part = part;
  if (act) { mesh.userData.part = 'act'; mesh.userData.act = act; }
  mesh.position.set(pos[0], pos[1], pos[2]);
  if (rot) mesh.rotation.set(rot[0], rot[1], rot[2], 'ZYX');
  mesh.castShadow = true; mesh.receiveShadow = true;
  g.add(mesh);
  const k = mesh.material.userData.kind;
  if (look.style.outline && k !== 'glass' && !k.startsWith('glow')) {          // storybook ink line
    const o = new THREE.Mesh(mesh.geometry, ink); o.userData.outline = true; mesh.add(o);
  }
  return mesh;
}

export function box(g, size, pos, color, o = {}) {
  const r = Math.min((o.r ?? BEVEL) * look.style.round, Math.min(...size) * 0.45);
  const geo = r > 0.002 ? new RoundedBoxGeometry(size[0], size[1], size[2], 4, r) : new THREE.BoxGeometry(...size);
  return add(g, new THREE.Mesh(geo, mat(color, o.kind)), pos, o.rot, o.part, o.act);
}
export function cyl(g, r, h, pos, color, o = {}) {
  const geo = new THREE.CylinderGeometry(o.r2 ?? r, r, h, look.style.flat ? 8 : 36);
  geo.rotateX(Math.PI / 2);
  return add(g, new THREE.Mesh(geo, mat(color, o.kind)), pos, o.rot, o.part, o.act);
}
export function blob(g, scale, pos, color, o = {}) {
  const geo = look.style.flat ? new THREE.IcosahedronGeometry(1, 1) : new THREE.SphereGeometry(1, 28, 18);
  geo.scale(scale[0], scale[1], scale[2]); if (look.style.flat) geo.computeVertexNormals();
  return add(g, new THREE.Mesh(geo, mat(color, o.kind)), pos, o.rot, o.part, o.act);
}
export function torus(g, R, r, pos, color, o = {}) {
  return add(g, new THREE.Mesh(new THREE.TorusGeometry(R, r, look.style.flat ? 5 : 10, look.style.flat ? 10 : 32), mat(color, o.kind)), pos, o.rot, o.part, o.act);
}

// Moving parts. sub() makes a named group (a head, a tail, a leg, a stem); pivot() sets the point it turns around.
export function sub(g, part) { const s = new THREE.Group(); s.userData.part = part; g.add(s); return s; }
export function pivot(s, p) { for (const c of s.children) { c.position.x -= p[0]; c.position.y -= p[1]; c.position.z -= p[2]; } s.position.set(p[0], p[1], p[2]); return s; }

// moving(g, how) makes a group that reacts to a click: how = { v: [slide x, y, z], s: [scale x, y, z], turn: ['x' | 'y' | 'z', angle] }
export function moving(g, how) { const s = sub(g, 'act'); s.userData.act = how; return s; }
