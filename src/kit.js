// cubby kit: the building blocks every item is made from, plus the STYLE knobs that change how they look.
// Coordinates are "z-up" (x right, y back, z up).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// A style never redraws an item. It only turns these knobs.
export const STYLES = {
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

export function mat(color, kind = 'paint') {
  const key = color + kind;
  if (mats.has(key)) return mats.get(key);
  const S = look.style;
  let m;
  const glow = kind.startsWith('glow');
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

function add(g, mesh, pos, rot) {
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
  return add(g, new THREE.Mesh(geo, mat(color, o.kind)), pos, o.rot);
}
export function cyl(g, r, h, pos, color, o = {}) {
  const geo = new THREE.CylinderGeometry(o.r2 ?? r, r, h, look.style.flat ? 8 : 36);
  geo.rotateX(Math.PI / 2);
  return add(g, new THREE.Mesh(geo, mat(color, o.kind)), pos, o.rot);
}
export function blob(g, scale, pos, color, o = {}) {
  const geo = look.style.flat ? new THREE.IcosahedronGeometry(1, 1) : new THREE.SphereGeometry(1, 28, 18);
  geo.scale(scale[0], scale[1], scale[2]); if (look.style.flat) geo.computeVertexNormals();
  return add(g, new THREE.Mesh(geo, mat(color, o.kind)), pos, o.rot);
}
export function torus(g, R, r, pos, color, o = {}) {
  return add(g, new THREE.Mesh(new THREE.TorusGeometry(R, r, look.style.flat ? 5 : 10, look.style.flat ? 10 : 32), mat(color, o.kind)), pos, o.rot);
}
