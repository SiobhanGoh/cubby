import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { box, cyl, blob, glowMats, STYLES, look, setStyle } from './kit.js';
import { ITEMS, CATEGORIES, PALETTES, TEMPLATES, TINTS } from './items.js';

const PI = Math.PI, W = 3.2, H = 2.6, T = 0.12, KEY = 'cubby.room.v2';
let P = PALETTES.matcha, paletteId = 'matcha', templateId = 'matcha';
const $ = s => document.querySelector(s);
const canvas = $('#c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.NeutralToneMapping;
const scene = new THREE.Scene();
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04).texture;
const root = new THREE.Group(); root.rotation.x = -PI / 2; scene.add(root);   // z-up world
const toRoot = v => [v.x, -v.z, v.y];                                          // three.js world -> our z-up coords

// ---------------------------------------------------------------- the empty room
const shell = new THREE.Group(); root.add(shell);
const skyMat = new THREE.MeshBasicMaterial({ color: '#A8D8F5' });
const bulbs = [], strips = [], drops = [];
const rainMat = new THREE.MeshBasicMaterial({ color: '#EAF2FA', transparent: true, opacity: .75 });
// Each style has its own window: where the hole is, how the panes divide, and how it is dressed.
const WINDOWS = {
  clay:    { y: [.8, 1.95], z: [1.0, 2.1], grid: [2, 2], dress: 'curtains' },
  story:   { y: [.95, 1.8], z: [.85, 2.2], grid: [2, 3], dress: 'shutters' },
  y2k:     { y: [.5, 2.3], z: [1.2, 2.05], grid: [1, 1], dress: 'blind' },
  neon:    { y: [.55, 2.25], z: [.45, 2.3], grid: [3, 1], dress: 'venetian' },
  lowpoly: { y: [.9, 1.9], z: [1.1, 2.0], grid: [2, 1], dress: 'louvre' },
  japandi: { y: [.55, 2.25], z: [.9, 2.1], grid: [4, 3], dress: 'shoji' },
};
function buildShell() {
  shell.clear(); bulbs.length = 0; strips.length = 0; drops.length = 0;
  const w = WINDOWS[look.id], [y0, y1] = w.y, [z0, z1] = w.z, my = (y0 + y1) / 2, mz = (z0 + z1) / 2, ww = y1 - y0, wh = z1 - z0;
  box(shell, [W + T, W + T, .16], [W / 2 - T / 2, W / 2 + T / 2, -.08], P.floor, { r: .04 });
  box(shell, [W, T, H], [W / 2, W + T / 2, H / 2], P.wall2, { r: .03 });
  box(shell, [T, y0, H], [-T / 2, y0 / 2, H / 2], P.wall, { r: .03 });
  box(shell, [T, W + T - y1, H], [-T / 2, (y1 + W + T) / 2, H / 2], P.wall, { r: .03 });
  box(shell, [T, ww, z0], [-T / 2, my, z0 / 2], P.wall, { r: 0 });
  box(shell, [T, ww, H - z1], [-T / 2, my, (z1 + H) / 2], P.wall, { r: 0 });
  const fc = w.dress === 'shoji' || w.dress === 'louvre' ? P.wood : P.cream, ft = w.dress === 'blind' ? .09 : .05;
  for (const [sy, sz, ly, lz] of [[ww + ft * 2, ft, my, z0], [ww + ft * 2, ft, my, z1], [ft, wh, y0, mz], [ft, wh, y1, mz]]) box(shell, [.07, sy, sz], [-.02, ly, lz], fc, { r: .012 });
  const bar = w.dress === 'shoji' ? .018 : .03;
  for (let i = 1; i < w.grid[0]; i++) box(shell, [.05, bar, wh], [-.02, y0 + i * ww / w.grid[0], mz], fc, { r: .006 });
  for (let i = 1; i < w.grid[1]; i++) box(shell, [.05, ww, bar], [-.02, my, z0 + i * wh / w.grid[1]], fc, { r: .006 });
  if (w.dress !== 'venetian') box(shell, [.22, ww + .16, .04], [.06, my, z0 - .03], fc, { r: .015 });
  if (w.dress === 'curtains') {
    for (const cy of [y0 - .12, y1 + .12]) for (let i = 0; i < 4; i++) { const m = box(shell, [.03, .075, wh + .3], [.06 + (i % 2) * .018, cy - .105 + i * .07, mz + .12], P.soft2, { kind: 'fabric', r: .014 }); strips.push({ m, x: m.position.x, z: m.position.z, h: wh + .3, i: strips.length }); }
    box(shell, [.03, ww + .7, .025], [.08, my, z1 + .18], P.metal, { kind: 'metal', r: .01 });
  }
  if (w.dress === 'shutters') {
    for (const cy of [y0 - .26, y1 + .26]) {
      box(shell, [.04, .42, wh], [.02, cy, mz], P.soft, { r: .012 });
      for (let k = 0; k < 7; k++) box(shell, [.02, .32, .03], [.045, cy, z0 + .12 + k * (wh - .24) / 6], P.accent2, { r: .006, rot: [0, .5, 0] });
    }
    box(shell, [.17, ww + .1, .13], [.12, my, z0 - .12], P.wood, { r: .02 });
    for (let k = 0; k < 7; k++) {
      const y = y0 + .05 + k * (ww - .1) / 6;
      blob(shell, [.06, .06, .05], [.12, y, z0 - .02], k % 2 ? P.leaf : P.leaf2);
      blob(shell, [.035, .035, .035], [.13, y + .02, z0 + .04], [P.accent, '#FFFFFF', P.soft][k % 3]);
    }
  }
  if (w.dress === 'blind') {
    box(shell, [.035, ww + .08, wh * .38], [.03, my, z1 - wh * .19], P.accent, { kind: 'fabric', r: .012 });
    box(shell, [.06, ww + .12, .06], [.035, my, z1 + .02], P.accent2, { r: .025 });
    cyl(shell, .004, .22, [.05, y1 - .12, z1 - wh * .38 - .11], P.cream);
    blob(shell, [.025, .025, .025], [.05, y1 - .12, z1 - wh * .38 - .23], P.accent2);
  }
  if (w.dress === 'venetian') for (let k = 0; k < 11; k++) box(shell, [.05, ww, .012], [.04, my, z1 - .06 - k * .075], P.soft2, { r: .004, rot: [0, .45, 0] });
  if (w.dress === 'louvre') for (let c = 0; c < 2; c++) for (let k = 0; k < 7; k++) box(shell, [.11, ww / 2 - .05, .012], [-.01, y0 + ww / 4 + c * ww / 2, z0 + .08 + k * (wh - .16) / 6], '#D8F0F2', { kind: 'glass', r: 0, rot: [0, .7, 0] }).castShadow = false;
  if (w.dress === 'shoji') box(shell, [.015, ww / 2, wh], [.03, y0 + ww / 4, mz], '#FFF8EA', { kind: 'glow0.35/0.15', r: 0 });
  box(shell, [W, .02, .08], [W / 2, W - .01, .04], P.cream, { r: .006 });
  box(shell, [.02, W, .08], [.01, W / 2, .04], P.cream, { r: .006 });
  const ceil = new THREE.Mesh(new THREE.BoxGeometry(W + 1, W + 1, .05), new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }));
  ceil.position.set(W / 2, W / 2, H + .03); ceil.castShadow = true; shell.add(ceil);
  for (let i = 0; i < 46; i++) { const d = new THREE.Mesh(new THREE.BoxGeometry(.006, .006, .16), rainMat); d.position.set(-.16 - Math.random() * .1, y0 + Math.random() * ww, z0 + Math.random() * wh); d.userData = { z0, z1, v: 2.6 + Math.random() * 1.4 }; d.visible = false; shell.add(d); drops.push(d); }
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(wh + .25, ww + .25), skyMat); sky.position.set(-.3, my, mz); sky.rotation.y = PI / 2; shell.add(sky);
  ['#FFD27A', '#FFB0C4', '#FFE9A8', '#B8F0DC'].forEach((c, k) => {
    for (let i = k; i < 26; i += 4) {
      const u = .15 + i / 25 * (W - .3), z = 2.42 - .08 * Math.sin(PI * ((u * 2) % 1));
      bulbs.push(blob(shell, [.02, .02, .026], [.1, u, z], c, { kind: 'glow0.6/2.6' }), blob(shell, [.02, .02, .026], [u, W - .1, z], c, { kind: 'glow0.6/2.6' }));
    }
  });
  bulbs.forEach(b => { b.castShadow = false; });
  if (P.tile) for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) if ((i + j) % 2 === 0) box(shell, [.4, .4, .008], [.2 + i * .4, .2 + j * .4, .004], P.tile, { r: 0 }).castShadow = false;
  if (look.style.leds) {
    box(shell, [.02, W - .2, .02], [.02, W / 2, 2.5], '#4FE3FF', { kind: 'glow1.5/5', r: 0 }).castShadow = false;
    box(shell, [W - .2, .02, .02], [W / 2, W - .02, 2.5], '#FF62D3', { kind: 'glow1.5/5', r: 0 }).castShadow = false;
  }
}

// ---------------------------------------------------------------- items: the room is a list of specs
const placed = [];
const colorOf = (def, spec) => spec.tint || (def.color ? (def.color[0] === '#' ? def.color : P[def.color]) : '#FFFFFF');
function buildInto(entry) {
  entry.inner.clear();
  entry.def.build(entry.inner, P, colorOf(entry.def, entry.spec));
  entry.inner.traverse(o => { if (o.isMesh) { o.userData.entry = entry; if (entry.def.flat) o.castShadow = false; } });
}
function addItem(spec, drop) {
  const def = ITEMS[spec.item]; if (!def) return null;
  const outer = new THREE.Group(), inner = new THREE.Group(); outer.add(inner);
  const entry = { def, spec, outer, inner, squish: drop ? 1 : 0, drop: drop ? 1 : 0, t0: Math.random() * 10 };
  buildInto(entry); sync(entry); root.add(outer); placed.push(entry);
  return entry;
}
function sync(e) { e.outer.position.set(...e.spec.pos); e.outer.rotation.z = (e.spec.rz || 0) * PI / 180; }
function removeItem(e) { root.remove(e.outer); placed.splice(placed.indexOf(e), 1); if (selected === e) select(null); }
function bounds(e) {                      // the item's footprint in room coordinates
  root.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(e.outer);
  return { x0: b.min.x, x1: b.max.x, y0: -b.max.z, y1: -b.min.z, z0: b.min.y, z1: b.max.y };
}
const down = new THREE.Raycaster();
function surfaceUnder(e, x, y) {          // how high is the furniture under this spot? (so a mug can stand on a desk)
  const meshes = [];
  for (const o of placed) if (o !== e && !o.def.sits && !o.def.wall) o.inner.traverse(m => { if (m.isMesh) meshes.push(m); });
  root.updateMatrixWorld(true);
  down.set(new THREE.Vector3(x, 2.4, -y), new THREE.Vector3(0, -1, 0));
  const hit = down.intersectObjects(meshes, false)[0];
  return hit ? Math.max(0, Math.round(hit.point.y * 1000) / 1000) : 0;
}
// Build mode works on a draft. Nothing is kept until Save; leaving build mode throws the draft away.
let saved = null, dirty = false;
const snapshot = () => ({ style: look.id, palette: paletteId, template: templateId, items: placed.map(e => ({ item: e.spec.item, pos: [...e.spec.pos], rz: e.spec.rz || 0, tint: e.spec.tint || null, link: e.spec.link || null })) });
function setDirty(v) { dirty = v; const b = $('#save'); b.disabled = !v; b.textContent = v ? 'Save' : 'Saved'; }
const hist = []; let hi = -1;
function resetHistory() { hist.length = 0; hist.push(snapshot()); hi = 0; syncUndo(); }
function syncUndo() { $('#undo').disabled = hi <= 0; $('#redo').disabled = hi >= hist.length - 1; }
function save() { hist.length = hi + 1; hist.push(snapshot()); if (hist.length > 80) hist.shift(); hi = hist.length - 1; setDirty(JSON.stringify(hist[hi]) !== JSON.stringify(saved)); syncUndo(); }
function step(d) { if (mode !== 'build' || hi + d < 0 || hi + d >= hist.length) return; hi += d; restore(hist[hi]); setDirty(JSON.stringify(hist[hi]) !== JSON.stringify(saved)); syncUndo(); }
function commit() { saved = snapshot(); try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (err) { /* storage unavailable: fine */ } setDirty(false); toast('Saved'); }
function restore(d) {
  select(null); while (placed.length) removeItem(placed[0]);
  templateId = TEMPLATES[d.template] ? d.template : 'matcha';
  if (d.style !== look.id || d.palette !== paletteId || !shell.children.length) applyLook(d.style, d.palette, false);
  for (const s of d.items) addItem({ item: s.item, pos: [...s.pos], rz: s.rz || 0, tint: s.tint || null, link: s.link || null });
  setDirty(false);
}
let toastT = 0;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 1800); }
function load() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(KEY)); } catch (err) { d = null; }
  if (!d || !Array.isArray(d.items) || !d.items.length) { useTemplate('matcha', false); saved = snapshot(); setDirty(false); return; }
  restore(d); saved = snapshot();
}
function applyLook(styleId, palId, keepItems = true) {       // change the style and/or palette of everything
  setStyle(styleId || look.id); paletteId = PALETTES[palId] ? palId : paletteId; P = PALETTES[paletteId];
  scene.environmentIntensity = look.style.env;
  buildShell();
  if (keepItems) for (const e of placed) buildInto(e);
  setMood(mood); refreshThumbs(); renderLook();
}
function useTemplate(id, animate = true) {
  const t = TEMPLATES[id]; templateId = id; select(null);
  while (placed.length) removeItem(placed[0]);
  applyLook(t.style, t.palette, false);
  for (const s of t.items) addItem({ item: s.item, pos: [...s.pos], rz: s.rz, tint: s.tint }, animate);
  settle(); save();
}

// ---------------------------------------------------------------- lights and moods
const hemi = new THREE.HemisphereLight('#e4f1ff', '#efe4d2', 2.7); scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff1de', 3); root.add(sun); root.add(sun.target);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -.0004; sun.shadow.normalBias = .02; sun.shadow.radius = 5;
Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: .5, far: 30 });
sun.target.position.set(1.5, 1.5, .6);
const fill = new THREE.DirectionalLight('#ffffff', 1.1); root.add(fill); root.add(fill.target); fill.position.set(6, -5, 6); fill.target.position.set(1.5, 1.5, .8);
const lampLight = new THREE.PointLight('#ffc070', 0, 4.5, 1.6); root.add(lampLight);
lampLight.castShadow = true; lampLight.shadow.mapSize.set(1024, 1024); lampLight.shadow.bias = -.002; lampLight.shadow.radius = 6;
const stringLight = new THREE.PointLight('#ffd9a0', 0, 5, 1.4); stringLight.position.set(1.4, 1.9, 2.25); root.add(stringLight);
const MOODS = {
  morning: { label: 'Morning', dir: [1, -.35, -.62], sun: '#fff1de', sunI: 3.0, sky: '#e4f1ff', ground: '#efe4d2', hemiI: 2.7, fillI: 1.1, win: '#A8D8F5', glow: 0, lamp: 0, str: 0, exp: 1.0, bg: ['#F7F3EA', '#E6EEDD'] },
  golden: { label: 'Golden hour', dir: [1, -.3, -.36], sun: '#ff9a4d', sunI: 4.4, sky: '#ffdcc0', ground: '#e6b590', hemiI: 1.9, fillI: .7, win: '#F6B48A', glow: .25, lamp: 0, str: 0, exp: 1.0, bg: ['#FBE6D2', '#F3C4A8'] },
  night: { label: 'Night', dir: [1, -.35, -.6], sun: '#8fa8ff', sunI: .5, sky: '#39448c', ground: '#1c1a36', hemiI: .6, fillI: .12, win: '#1E2A5A', glow: 1, lamp: 9, str: 2.2, exp: 1.15, bg: ['#191B3A', '#2A2550'] },
  rain: { label: 'Rain', dir: [1, -.1, -.5], sun: '#cdd9ea', sunI: .9, sky: '#dfe6f0', ground: '#cfc8be', hemiI: 3.0, fillI: .9, win: '#9FAABA', glow: .2, lamp: 0, str: 0, exp: .95, bg: ['#DDE3EA', '#C6CFDA'] },
};
const ORDER = ['morning', 'golden', 'night', 'rain'];
const cur = { dir: new THREE.Vector3(1, -.35, -.62), sun: new THREE.Color('#fff1de'), sunI: 3, sky: new THREE.Color('#e4f1ff'), ground: new THREE.Color('#efe4d2'), hemiI: 2.7, fillI: 1.1, win: new THREE.Color('#A8D8F5'), glow: 0, lamp: 0, str: 0, exp: 1 };
let mood = 'morning', moodSetting = 'auto', lampOverride = null;
const weather = { place: null, ok: false, raining: false, sr: 6.5, ss: 19, temp: null, msg: '' };
function clockMood() {
  const d = new Date(), h = d.getHours() + d.getMinutes() / 60;
  const base = h >= weather.sr && h < weather.ss - 1.25 ? 'morning' : h >= weather.ss - 1.25 && h < weather.ss + .3 ? 'golden' : 'night';
  return weather.ok && weather.raining && base !== 'night' ? 'rain' : base;
}
const isRaining = () => mood === 'rain' || (moodSetting === 'auto' && weather.ok && weather.raining);
const hours = iso => { const t = String(iso).split('T')[1] || '6:30'; return +t.slice(0, 2) + +t.slice(3, 5) / 60; };
async function loadWeather() {
  if (!weather.place) return;
  try {
    const p = weather.place, r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=' + p.lat + '&longitude=' + p.lon + '&current=temperature_2m,precipitation,weather_code&daily=sunrise,sunset&timezone=auto&forecast_days=1');
    const d = await r.json(), c = d.current;
    weather.raining = c.precipitation > 0 || (c.weather_code >= 51 && c.weather_code <= 99 && !(c.weather_code >= 71 && c.weather_code <= 77));
    weather.temp = Math.round(c.temperature_2m); weather.sr = hours(d.daily.sunrise[0]); weather.ss = hours(d.daily.sunset[0]); weather.ok = true;
    weather.msg = p.name + ' · ' + weather.temp + '°C · ' + (weather.raining ? 'raining now' : 'no rain');
  } catch (err) { weather.ok = false; weather.msg = 'Could not reach the weather service from here.'; }
  if (moodSetting === 'auto') setMood(clockMood());
  renderMoodBox();
}
async function setCity(name) {
  weather.msg = 'Looking for ' + name + '…'; renderMoodBox();
  try {
    const r = await fetch('https://geocoding-api.open-meteo.com/v1/search?count=1&name=' + encodeURIComponent(name)), d = await r.json(), g = d.results && d.results[0];
    if (!g) { weather.msg = 'Could not find a place called ' + name + '.'; renderMoodBox(); return; }
    weather.place = { name: g.name, lat: g.latitude, lon: g.longitude };
    try { localStorage.setItem('cubby.place', JSON.stringify(weather.place)); } catch (err) { /* fine */ }
    chooseMood('auto'); await loadWeather();
  } catch (err) { weather.msg = 'Could not reach the weather service from here.'; renderMoodBox(); }
}
function renderMoodBox() {
  document.querySelectorAll('#moods button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === moodSetting)));
  $('#wmsg').textContent = weather.msg || (weather.place ? '' : 'Add your city and Auto will follow your real sunrise, sunset and rain.');
}
setInterval(loadWeather, 15 * 60000);
function chooseMood(s) { moodSetting = s; setMood(s === 'auto' ? clockMood() : s); }
function resetPets() { for (const e of placed) if (e.pet) { e.pet = null; sync(e); e.inner.rotation.set(0, 0, 0); const h = e.inner.children[e.def.pet.head]; if (h && h.userData.bz !== undefined) { h.position.z = h.userData.bz; h.rotation.x = 0; } } }
setInterval(() => { if (moodSetting === 'auto' && clockMood() !== mood) setMood(clockMood()); }, 30000);
const tmpC = new THREE.Color(), tmpV = new THREE.Vector3();
function setMood(name) {
  mood = name; lampOverride = null; const m = MOODS[name];
  const bg = name === 'morning' ? P.bg : m.bg;
  document.body.style.setProperty('--bg0', bg[0]); document.body.style.setProperty('--bg1', bg[1]);
  document.body.classList.toggle('dark', name === 'night' || (name === 'morning' && !!P.dark)); $('#mood span').textContent = moodSetting === 'auto' ? 'Auto · ' + m.label : m.label;
}
function stepMood(k) {
  const m = MOODS[mood];
  cur.dir.lerp(tmpV.set(...m.dir), k); cur.sun.lerp(tmpC.set(m.sun), k); cur.sky.lerp(tmpC.set(m.sky), k); cur.ground.lerp(tmpC.set(m.ground), k); cur.win.lerp(tmpC.set(m.win), k);
  for (const key of ['sunI', 'hemiI', 'fillI', 'glow', 'str', 'exp']) cur[key] += (m[key] - cur[key]) * k;
  const lamp = placed.find(e => e.spec.item === 'lamp');
  const lampT = !lamp ? 0 : lampOverride === null ? m.lamp : (lampOverride ? 9 : 0);
  cur.lamp += (lampT - cur.lamp) * Math.min(1, k * 3);
  if (lamp) lampLight.position.set(lamp.spec.pos[0], lamp.spec.pos[1], lamp.spec.pos[2] + .3);
  sun.position.copy(sun.target.position).addScaledVector(tmpV.copy(cur.dir).normalize(), -12);
  sun.color.copy(cur.sun); sun.intensity = cur.sunI; hemi.color.copy(cur.sky); hemi.groundColor.copy(cur.ground); hemi.intensity = cur.hemiI;
  fill.intensity = cur.fillI; skyMat.color.copy(cur.win); lampLight.intensity = cur.lamp; stringLight.intensity = cur.str; renderer.toneMappingExposure = cur.exp;
}

// ---------------------------------------------------------------- camera
const cam = new THREE.OrthographicCamera(-3, 3, 3, -3, .1, 60);
const target = new THREE.Vector3(1.45, .95, -1.55);
cam.position.copy(target).add(new THREE.Vector3(1, .86, 1).normalize().multiplyScalar(18));
const controls = new OrbitControls(cam, canvas);
controls.target.copy(target); controls.enablePan = false; controls.enableDamping = true; controls.dampingFactor = .08;
controls.minZoom = .75; controls.maxZoom = 2.6; controls.minPolarAngle = .75; controls.maxPolarAngle = 1.25;
controls.minAzimuthAngle = .3; controls.maxAzimuthAngle = PI / 2 - .3; controls.rotateSpeed = .6;
function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight, a = w / h;
  const build = mode === 'build';
  const halfH = a >= 1 ? (build ? 4.5 : 3.0) : (build ? 3.3 : 2.7) / a, halfW = halfH * a;
  const lift = build ? halfH * (a >= 1 ? .36 : .24) : 0;                        // leave room for the build tray
  Object.assign(cam, { left: -halfW, right: halfW, top: halfH - lift, bottom: -halfH - lift }); cam.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}
window.addEventListener('resize', resize);

// ---------------------------------------------------------------- build mode: select, drag, rotate, recolour, duplicate, delete
let mode = 'build', selected = null, drag = null, press = null;
const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
const ring = new THREE.Mesh(new THREE.RingGeometry(.94, 1, 48), new THREE.MeshBasicMaterial({ color: '#FF8A65', transparent: true, opacity: .95, depthTest: false, side: THREE.DoubleSide }));
ring.renderOrder = 20; ring.visible = false; root.add(ring);
function setRay(e) { const r = canvas.getBoundingClientRect(); ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ptr, cam); }
function pick(e) { setRay(e); for (const h of ray.intersectObjects(root.children, true)) if (h.object.userData.entry) return h.object.userData.entry; return null; }
function planeHit(normal, constant) { const v = new THREE.Vector3(); return ray.ray.intersectPlane(new THREE.Plane(normal, constant), v) ? toRoot(v) : null; }
const snap = v => Math.round(v / .05) * .05;
function select(e) {
  selected = e; ring.visible = !!e; if (!e) $('#linkform').hidden = true;
  $('#sel').hidden = !e; $('#empty').hidden = !!e;
  if (!e) return;
  $('#selname').textContent = e.def.name; $('#linkform').hidden = true; renderLink();
  $('#swatches').hidden = !e.def.color;
  document.querySelectorAll('#swatches button').forEach(b => b.setAttribute('aria-pressed', String((e.spec.tint || '') === (b.dataset.c || ''))));
}
function fitInside(e) {                    // keep an item inside the four walls
  if (e.def.wall) return;
  const b = bounds(e);
  if (b.x0 < 0) e.spec.pos[0] -= b.x0; if (b.x1 > W) e.spec.pos[0] -= b.x1 - W;
  if (b.y0 < 0) e.spec.pos[1] -= b.y0; if (b.y1 > W) e.spec.pos[1] -= b.y1 - W;
  sync(e);
}
function riders(e) {                       // things standing on this piece of furniture move with it
  if (e.def.sits || e.def.wall || e.def.flat) return [];
  const b = bounds(e);
  return placed.filter(o => o.def.sits && o.spec.pos[2] > .05 && o.spec.pos[0] > b.x0 && o.spec.pos[0] < b.x1 && o.spec.pos[1] > b.y0 && o.spec.pos[1] < b.y1);
}
function settle() { for (const o of placed) if (o.def.sits) { o.spec.pos[2] = surfaceUnder(o, o.spec.pos[0], o.spec.pos[1]); sync(o); } }
const solid = o => !o.def.flat && !o.def.wall && !o.def.sits;
function collides(e) {                    // would this piece of furniture be inside another one?
  if (!solid(e)) return false;
  const b = bounds(e), g = .06;
  return placed.some(o => { if (o === e || !solid(o)) return false; const c = bounds(o); return b.x0 < c.x1 - g && b.x1 > c.x0 + g && b.y0 < c.y1 - g && b.y1 > c.y0 + g; });
}
function moveTo(e, x, y) {
  const px = e.spec.pos[0], py = e.spec.pos[1], was = collides(e);
  const dx = x - px, dy = y - py;
  const tryAt = (a, b) => { e.spec.pos[0] = a; e.spec.pos[1] = b; sync(e); fitInside(e); return was || !collides(e); };
  if (!tryAt(x, y) && !tryAt(x, py) && !tryAt(px, y)) { e.spec.pos[0] = px; e.spec.pos[1] = py; sync(e); }
  if (e.def.sits) { e.spec.pos[2] = surfaceUnder(e, e.spec.pos[0], e.spec.pos[1]); sync(e); }
  return [dx, dy];
}
canvas.addEventListener('pointerdown', e => {
  press = [e.clientX, e.clientY];
  if (mode !== 'build') return;
  const hit = pick(e);
  if (!hit) return;
  select(hit); controls.enabled = false; canvas.setPointerCapture(e.pointerId);
  const start = planeHit(new THREE.Vector3(0, 1, 0), -hit.spec.pos[2]);
  drag = { e: hit, off: start ? [hit.spec.pos[0] - start[0], hit.spec.pos[1] - start[1]] : [0, 0], riders: riders(hit).map(o => ({ o, d: [o.spec.pos[0] - hit.spec.pos[0], o.spec.pos[1] - hit.spec.pos[1]] })), moved: false };
});
canvas.addEventListener('pointermove', e => {
  if (!drag) { if (mode !== 'build' && e.pointerType !== 'touch') { const h = pick(e); canvas.style.cursor = h && h.def.click ? 'pointer' : 'grab'; } return; }
  if (!drag.moved && press && Math.hypot(e.clientX - press[0], e.clientY - press[1]) < 5) return;
  drag.moved = true; setRay(e);
  const it = drag.e;
  if (it.def.wall) {
    const L = planeHit(new THREE.Vector3(1, 0, 0), 0), R = planeHit(new THREE.Vector3(0, 0, 1), W);
    const okL = L && L[1] > .3 && L[1] < W - .3 && L[2] > .4 && L[2] < 2.3, okR = R && R[0] > .3 && R[0] < W - .3 && R[2] > .4 && R[2] < 2.3;
    if (okR) { it.spec.pos = [snap(R[0]), W, snap(R[2])]; it.spec.rz = 0; } else if (okL) { it.spec.pos = [0, snap(L[1]), snap(L[2])]; it.spec.rz = 90; }
    sync(it); return;
  }
  const p = planeHit(new THREE.Vector3(0, 1, 0), -it.spec.pos[2]); if (!p) return;
  moveTo(it, snap(p[0] + drag.off[0]), snap(p[1] + drag.off[1]));
  for (const r of drag.riders) { r.o.spec.pos[0] = it.spec.pos[0] + r.d[0]; r.o.spec.pos[1] = it.spec.pos[1] + r.d[1]; sync(r.o); }
});
canvas.addEventListener('pointerup', e => {
  const wasClick = press && Math.hypot(e.clientX - press[0], e.clientY - press[1]) < 6;
  if (drag) { if (drag.moved) { settle(); drag.e.squish = .6; save(); } drag = null; controls.enabled = true; return; }
  if (!wasClick) return;
  if (mode === 'build') { select(null); return; }
  const hit = pick(e); $('#linkbar').hidden = true; if (!hit) return;
  hit.squish = 1; if (hit.spec.link) showLink(hit);
  if (hit.def.click === 'lamp') lampOverride = !(cur.lamp > 1);
  if (hit.def.click === 'hearts') spawnHearts(hit);
});
function rotateSel() {
  const e = selected; if (!e || e.def.wall) return;
  const rs = riders(e), a = PI / 4, c = Math.cos(a), s = Math.sin(a);
  for (const o of rs) { const dx = o.spec.pos[0] - e.spec.pos[0], dy = o.spec.pos[1] - e.spec.pos[1]; o.spec.pos[0] = e.spec.pos[0] + dx * c - dy * s; o.spec.pos[1] = e.spec.pos[1] + dx * s + dy * c; o.spec.rz = ((o.spec.rz || 0) + 45) % 360; sync(o); }
  const was = collides(e), keep = [...e.spec.pos];
  e.spec.rz = ((e.spec.rz || 0) + 45) % 360; sync(e);
  const before = [...e.spec.pos]; fitInside(e);
  if (!was && collides(e)) {             // no room to turn here: put everything back
    e.spec.rz = (e.spec.rz + 315) % 360; e.spec.pos = keep; sync(e);
    for (const o of rs) { const dx = o.spec.pos[0] - keep[0], dy = o.spec.pos[1] - keep[1]; o.spec.pos[0] = keep[0] + dx * c + dy * s; o.spec.pos[1] = keep[1] - dx * s + dy * c; o.spec.rz = ((o.spec.rz || 0) + 315) % 360; sync(o); }
    toast('No room to turn it here'); return;
  }
  for (const o of rs) { o.spec.pos[0] += e.spec.pos[0] - before[0]; o.spec.pos[1] += e.spec.pos[1] - before[1]; sync(o); }
  settle(); e.squish = .5; save();
}
function spawn(id, near) {
  const def = ITEMS[id];
  const e = addItem({ item: id, pos: def.wall ? [1.6, W, 1.9] : [1.6, 1.6, 0], rz: near ? near.spec.rz : (def.wall ? 0 : 45), tint: near ? near.spec.tint : null }, true);
  if (def.wall) {
    const taken = placed.filter(o => o.def.wall && o !== e && o.spec.rz !== 90).length;
    e.spec.pos = [Math.min(W - .7, .8 + taken * .5), W, 1.9 - (taken % 2) * .5]; sync(e);
  } else {
    // look for a free patch of floor, starting from the open middle of the room
    const others = placed.filter(o => o !== e && !o.def.flat && !o.def.wall && !o.def.sits).map(bounds);
    const spots = [];
    for (let x = .3; x <= W - .3; x += .25) for (let y = .3; y <= W - .3; y += .25) spots.push([x, y]);
    spots.sort((a, b) => Math.hypot(a[0] - 1.9, a[1] - 1.1) - Math.hypot(b[0] - 1.9, b[1] - 1.1));
    let found = false;
    for (const [x, y] of spots) {
      e.spec.pos[0] = x; e.spec.pos[1] = y; sync(e); fitInside(e);
      const b = bounds(e);
      if (!others.some(o => b.x0 < o.x1 - .03 && b.x1 > o.x0 + .03 && b.y0 < o.y1 - .03 && b.y1 > o.y0 + .03)) { found = true; break; }
    }
    if (!found) { e.spec.pos[0] = spots[0][0]; e.spec.pos[1] = spots[0][1]; sync(e); fitInside(e); }   // room is full: put it in the middle
  }
  settle(); select(e); save();
}
$('#rot').onclick = rotateSel;
$('#dup').onclick = () => { if (selected) spawn(selected.spec.item, selected); };
$('#del').onclick = () => { if (selected) { removeItem(selected); settle(); save(); } };
window.addEventListener('keydown', e => {
  if (mode === 'build' && (e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) { e.preventDefault(); step(e.shiftKey ? 1 : -1); return; }
  if (mode !== 'build' || !selected || /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
  if (e.key === 'r' || e.key === 'R') rotateSel();
  if (e.key === 'Delete' || e.key === 'Backspace') { removeItem(selected); settle(); save(); }
});

// ---------------------------------------------------------------- the catalogue tray (built from the ITEMS list)
function thumbnails() {
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); r.setSize(120, 120); r.toneMapping = THREE.NeutralToneMapping;
  const s = new THREE.Scene(), rt = new THREE.Group(); rt.rotation.x = -PI / 2; s.add(rt);
  s.add(new THREE.HemisphereLight('#ffffff', '#efe4d2', 2.6)); const d = new THREE.DirectionalLight('#fff4e6', 2.2); d.position.set(3, 6, 4); s.add(d);
  const c = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 50), out = {};
  for (const [id, def] of Object.entries(ITEMS)) {
    rt.clear(); const g = new THREE.Group(); rt.add(g); if (!def.wall) g.rotation.z = PI / 4;
    def.build(g, P, colorOf(def, {})); s.updateMatrixWorld(true);
    const b = new THREE.Box3().setFromObject(g), ctr = b.getCenter(new THREE.Vector3()), size = b.getSize(new THREE.Vector3()), half = Math.max(size.x, size.y, size.z) * .62 + .03;
    Object.assign(c, { left: -half, right: half, top: half, bottom: -half }); c.updateProjectionMatrix();
    c.position.copy(ctr).add(new THREE.Vector3(1, .86, 1).normalize().multiplyScalar(10)); c.lookAt(ctr);
    r.render(s, c); out[id] = r.domElement.toDataURL('image/png');
  }
  r.dispose(); r.forceContextLoss();
  return out;
}
let category = 'Chairs', tab = 'things';
function refreshThumbs() {
  const thumbs = thumbnails();
  document.querySelectorAll('#strip .card').forEach(b => { b.querySelector('img').src = thumbs[b.dataset.id]; });
}
function buildTray() {
  const chips = $('#chips'), strip = $('#strip');
  CATEGORIES.forEach(cat => { const b = document.createElement('button'); b.type = 'button'; b.textContent = cat; b.onclick = () => { category = cat; renderTray(); strip.scrollLeft = 0; }; chips.append(b); });
  for (const [id, def] of Object.entries(ITEMS)) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'card'; b.dataset.cat = def.category; b.dataset.id = id; b.setAttribute('aria-label', 'Add ' + def.name);
    const img = document.createElement('img'); img.alt = ''; const s = document.createElement('span'); s.textContent = def.name;
    b.append(img, s); b.onclick = () => spawn(id); strip.append(b);
  }
  TINTS.forEach(c => { const b = document.createElement('button'); b.type = 'button'; b.dataset.c = c; b.style.background = c; b.setAttribute('aria-label', 'Colour ' + c); b.onclick = () => recolor(c); $('#swatches').append(b); });
  const o = document.createElement('button'); o.type = 'button'; o.dataset.c = ''; o.className = 'orig'; o.textContent = 'Original'; o.onclick = () => recolor(null); $('#swatches').append(o);
  for (const [id, s] of Object.entries(STYLES)) { const b = document.createElement('button'); b.type = 'button'; b.dataset.id = id; b.textContent = s.name; b.onclick = () => { applyLook(id, paletteId); save(); }; $('#styles').append(b); }
  for (const [id, p] of Object.entries(PALETTES)) {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.id = id;
    for (const k of ['wall', 'soft', 'accent', 'accent2']) { const d = document.createElement('i'); d.style.background = p[k]; b.append(d); }
    b.append(p.name); b.onclick = () => { applyLook(look.id, id); save(); }; $('#palettes').append(b);
  }
  for (const [id, t] of Object.entries(TEMPLATES)) {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.id = id; const p = PALETTES[t.palette];
    b.style.background = 'linear-gradient(135deg,' + p.wall + ' 0 50%,' + p.soft + ' 50% 75%,' + p.accent + ' 75%)';
    const s = document.createElement('span'); s.textContent = t.name; const k = document.createElement('small'); k.textContent = STYLES[t.style].name; b.append(s, k);
    b.onclick = () => useTemplate(id); $('#templates').append(b);
  }
  document.querySelectorAll('[data-tab]').forEach(b => { b.onclick = () => { tab = b.dataset.tab; renderTray(); }; });
  renderTray();
}
function renderLook() {
  document.querySelectorAll('#styles button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.id === look.id)));
  document.querySelectorAll('#palettes button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.id === paletteId)));
}
function renderTray() {
  document.querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tab === tab)));
  $('#things').hidden = tab !== 'things'; $('#lookpane').hidden = tab !== 'look'; renderLook();
  document.querySelectorAll('#chips button').forEach(b => b.setAttribute('aria-pressed', String(b.textContent === category)));
  document.querySelectorAll('#strip .card').forEach(b => { b.hidden = b.dataset.cat !== category; });
}
function recolor(c) { if (!selected) return; selected.spec.tint = c; buildInto(selected); selected.squish = .5; select(selected); save(); }
function setMode(m) {
  if (m !== 'build' && mode === 'build' && dirty && saved) { restore(saved); toast('Changes discarded'); }
  if (m === 'build') { resetPets(); resetHistory(); }
  mode = m; document.body.dataset.mode = m; if (m === 'live') select(null); $('#linkbar').hidden = true;
  document.querySelectorAll('[data-mode-btn]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.modeBtn === m)));
  canvas.style.cursor = 'grab'; resize();
}
document.querySelectorAll('[data-mode-btn]').forEach(b => { b.onclick = () => setMode(b.dataset.modeBtn); });
$('#mood').onclick = () => { renderMoodBox(); $('#moodbox').hidden = false; };
$('#closemood').onclick = () => { $('#moodbox').hidden = true; };
document.querySelectorAll('#moods button').forEach(b => { b.onclick = () => { chooseMood(b.dataset.m); renderMoodBox(); }; });
$('#cityform').onsubmit = e => { e.preventDefault(); const v = $('#city').value.trim(); if (v) setCity(v); };
$('#save').onclick = commit;
$('#undo').onclick = () => step(-1); $('#redo').onclick = () => step(1);

// ---------------------------------------------------------------- links: any item can open an app or a site
const APPS = [['open.spotify.com', 'Spotify'], ['spotify.link', 'Spotify'], ['music.youtube.com', 'YouTube Music'], ['music.apple.com', 'Apple Music'], ['youtube.com', 'YouTube'], ['youtu.be', 'YouTube'], ['github.com', 'GitHub'], ['notion.so', 'Notion'], ['docs.google.com', 'Google Docs'], ['drive.google.com', 'Google Drive'], ['mail.google.com', 'Gmail'], ['calendar.google.com', 'Google Calendar'],
  ['instagram.com', 'Instagram'], ['tiktok.com', 'TikTok'], ['linkedin.com', 'LinkedIn'], ['discord.com', 'Discord'], ['discord.gg', 'Discord'], ['figma.com', 'Figma'], ['netflix.com', 'Netflix'], ['twitch.tv', 'Twitch'], ['x.com', 'X'], ['canva.com', 'Canva'], ['kaggle.com', 'Kaggle'], ['soundcloud.com', 'SoundCloud']];
function safeUrl(v) { try { let s = String(v || '').trim(); if (!s) return null; if (!/^[a-z][a-z0-9+.-]*:/i.test(s)) s = 'https://' + s; const u = new URL(s); return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : null; } catch (err) { return null; } }
function linkName(url) { try { const h = new URL(url).hostname.replace(/^www\./, ''); const a = APPS.find(([d]) => h === d || h.endsWith('.' + d)); return a ? a[1] : h; } catch (err) { return 'link'; } }
function renderLink() {
  const e = selected, row = $('#linkform'); if (!e) { row.hidden = true; return; }
  $('#linkbtn').setAttribute('aria-pressed', String(!!e.spec.link));
  $('#url').value = e.spec.link || ''; $('#url').placeholder = e.def.hint || 'Paste a link this opens in live mode';
  $('#unlink').hidden = !e.spec.link;
}
$('#linkbtn').onclick = () => { const row = $('#linkform'); row.hidden = !row.hidden; if (!row.hidden) { renderLink(); row.hidden = false; $('#url').focus(); } };
$('#linkform').onsubmit = ev => { ev.preventDefault(); if (!selected) return; const u = safeUrl($('#url').value); if (!u) { toast('That does not look like a web link'); return; } selected.spec.link = u; renderLink(); toast('Opens ' + linkName(u) + ' in live mode'); save(); };
$('#unlink').onclick = () => { if (!selected) return; selected.spec.link = null; renderLink(); save(); };
function showLink(e) { const a = $('#golink'); a.href = e.spec.link; $('#goname').textContent = 'Open ' + linkName(e.spec.link); $('#gohost').textContent = new URL(e.spec.link).hostname.replace(/^www\./, ''); $('#linkbar').hidden = false; }

// ---------------------------------------------------------------- sharing: the whole room packed into a short code
const IDS = Object.keys(ITEMS), SIDS = Object.keys(STYLES), PIDS = Object.keys(PALETTES);
const h16 = s => { let h = 2166136261; for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0) % 65536; };
const byHash = new Map(IDS.map(id => [h16(id), id]));
const A32 = 'abcdefghijklmnopqrstuvwxyz234567';
function encodeRoom(d) {
  const b = [1, SIDS.indexOf(d.style), PIDS.indexOf(d.palette), d.items.length];
  for (const it of d.items) {
    const h = h16(it.item), t = it.tint ? parseInt(it.tint.slice(1), 16) : -1;
    const lk = it.link ? [...new TextEncoder().encode(it.link)].slice(0, 255) : null;
    b.push(h >> 8, h & 255, Math.round(it.pos[0] / .025), Math.round(it.pos[1] / .025), Math.round(it.pos[2] / .0125), Math.round((((it.rz || 0) % 360) + 360) % 360 / 5), (t < 0 ? 0 : 1) | (lk ? 2 : 0));
    if (t >= 0) b.push(t >> 16, (t >> 8) & 255, t & 255);
    if (lk) b.push(lk.length, ...lk);
  }
  let out = '', bits = 0, n = 0;
  for (const v of b) { bits = (bits << 8) | (v & 255); n += 8; while (n >= 5) { out += A32[(bits >> (n - 5)) & 31]; n -= 5; } bits &= (1 << n) - 1; }
  if (n) out += A32[(bits << (5 - n)) & 31];
  return 'cubby' + out;
}
function decodeRoom(code) {
  try {
    let s = String(code).trim(); if (s.includes('#')) s = s.slice(s.lastIndexOf('#') + 1); s = s.toLowerCase(); if (!s.startsWith('cubby')) return null;
    const b = []; let bits = 0, n = 0;
    for (const ch of s.slice(5)) { const v = A32.indexOf(ch); if (v < 0) return null; bits = (bits << 5) | v; n += 5; if (n >= 8) { b.push((bits >> (n - 8)) & 255); n -= 8; } bits &= (1 << n) - 1; }
    if (b[0] !== 1 || !SIDS[b[1]] || !PIDS[b[2]]) return null;
    const d = { style: SIDS[b[1]], palette: PIDS[b[2]], template: 'matcha', items: [] }; let i = 4;
    for (let k = 0; k < b[3]; k++) {
      const id = byHash.get((b[i] << 8) | b[i + 1]); const it = { item: id, pos: [b[i + 2] * .025, b[i + 3] * .025, b[i + 4] * .0125], rz: b[i + 5] * 5, tint: null, link: null };
      const fl = b[i + 6]; i += 7;
      if (fl & 1) { it.tint = '#' + ((b[i] << 16) | (b[i + 1] << 8) | b[i + 2]).toString(16).padStart(6, '0'); i += 3; }
      if (fl & 2) { const n = b[i]; it.link = safeUrl(new TextDecoder().decode(new Uint8Array(b.slice(i + 1, i + 1 + n)))); i += 1 + n; }
      if (i > b.length) return null; if (id) d.items.push(it);
    }
    return d;
  } catch (err) { return null; }
}
function visit(code) {
  const d = decodeRoom(code); if (!d) return false;
  if (mode === 'build') setMode('live');
  restore(d); mode = 'visit'; document.body.dataset.mode = 'visit'; resize(); return true;
}
const canLink = /github\.io$/.test(location.hostname);
$('#share').onclick = () => { $('#code').value = (canLink ? location.origin + location.pathname + '#' : '') + encodeRoom(saved); $('#codelabel').textContent = canLink ? 'Your room link' : 'Your room code'; $('#paste').value = ''; $('#sharemsg').textContent = dirty ? 'This is your last saved room. Unsaved changes are not included.' : ''; $('#sharebox').hidden = false; };
$('#closeshare').onclick = () => { $('#sharebox').hidden = true; };
$('#copy').onclick = async () => { const c = $('#code'); try { await navigator.clipboard.writeText(c.value); toast(canLink ? 'Link copied' : 'Code copied'); } catch (err) { c.focus(); c.select(); toast('Press Ctrl+C to copy'); } };
$('#govisit').onclick = () => { if (visit($('#paste').value)) { $('#sharebox').hidden = true; } else { $('#sharemsg').textContent = 'That code does not look right. Check you pasted all of it.'; } };
$('#back').onclick = () => { restore(saved); setMode('live'); };

// ---------------------------------------------------------------- hearts
const hearts = [];
const heartGeo = (() => { const s = new THREE.Shape(); s.moveTo(0, -.5); s.bezierCurveTo(-.9, .1, -.5, .8, 0, .35); s.bezierCurveTo(.5, .8, .9, .1, 0, -.5); return new THREE.ShapeGeometry(s, 16); })();
function spawnHearts(entry) {
  const p = entry.outer.getWorldPosition(new THREE.Vector3());
  for (let i = 0; i < 4; i++) {
    const m = new THREE.Mesh(heartGeo, new THREE.MeshBasicMaterial({ color: i % 2 ? '#FF9BB5' : '#FF6F91', transparent: true, side: THREE.DoubleSide, depthTest: false }));
    m.position.copy(p).add(new THREE.Vector3((Math.random() - .5) * .25, .25, (Math.random() - .5) * .25)); m.renderOrder = 10;
    m.userData = { t: -i * .13, s: .07 + Math.random() * .04, dx: (Math.random() - .5) * .2 }; scene.add(m); hearts.push(m);
  }
}

// ---------------------------------------------------------------- pets: wander, stretch, groom
function freeSpot(e, x, y) {
  if (x < .3 || y < .3 || x > W - .3 || y > W - .3) return false;
  return !placed.some(o => { if (o === e || !solid(o)) return false; const b = bounds(o); return x > b.x0 - .17 && x < b.x1 + .17 && y > b.y0 - .17 && y < b.y1 + .17; });
}
function petStep(e, dt) {
  const cfg = e.def.pet, night = mood === 'night', onFloor = e.spec.pos[2] < .05;
  const p = e.pet || (e.pet = { state: 'idle', wait: 1.5 + Math.random() * 5, x: e.spec.pos[0], y: e.spec.pos[1], rz: (e.spec.rz || 0) * PI / 180, k: 0 });
  const out = { sy: 1, sz: 1, rx: 0, hz: 0 }, head = e.inner.children[cfg.head];
  if (head && head.userData.bz === undefined) head.userData.bz = head.position.z;
  let nod = 0;
  if (p.state === 'idle') {
    p.wait -= dt * (night ? .3 : 1);
    if (p.wait <= 0) {
      const r = Math.random(); p.k = 0;
      if (onFloor && !night && r < .5) {
        let found = null;
        for (let i = 0; i < 10 && !found; i++) {
          const a = Math.random() * 2 * PI, d = .4 + Math.random() * 1.1, tx = p.x + Math.cos(a) * d, ty = p.y + Math.sin(a) * d;
          if ([.25, .5, .75, 1].every(f => freeSpot(e, p.x + (tx - p.x) * f, p.y + (ty - p.y) * f))) found = [tx, ty, d];
        }
        if (found) { p.state = 'walk'; p.fx = p.x; p.fy = p.y; p.tx = found[0]; p.ty = found[1]; p.dist = found[2]; p.dur = found[2] / cfg.speed; p.trz = Math.atan2(p.tx - p.x, -(p.ty - p.y)); } else p.wait = 1.5;
      } else if (r < .75 && !cfg.calm) { p.state = 'stretch'; p.dur = 1.9; } else { p.state = 'groom'; p.dur = 2.6; }
    }
  } else {
    p.k += dt / p.dur; const k = Math.min(1, p.k), s = Math.sin(k * PI);
    if (p.state === 'walk') {
      let da = p.trz - p.rz; while (da > PI) da -= 2 * PI; while (da < -PI) da += 2 * PI; p.rz += da * Math.min(1, dt * 7);
      const ek = k * k * (3 - 2 * k); p.x = p.fx + (p.tx - p.fx) * ek; p.y = p.fy + (p.ty - p.fy) * ek;
      out.hz = Math.abs(Math.sin(ek * p.dist * (cfg.hop > .05 ? 7 : 16))) * cfg.hop; out.rx = Math.sin(ek * p.dist * 16) * .03;
    }
    if (p.state === 'stretch') { out.sy = 1 + .24 * s; out.sz = 1 - .15 * s; out.rx = -.1 * s; }
    if (p.state === 'groom') { nod = Math.sin(k * PI * 7) * .5 * s + .5 * s; out.rx = -.05 * s; }
    if (p.k >= 1) { p.state = 'idle'; p.wait = 2.5 + Math.random() * 7; }
  }
  if (head) { head.rotation.x = -nod * .28; head.position.z = head.userData.bz - nod * .018; }
  e.outer.position.x = p.x; e.outer.position.y = p.y; e.outer.rotation.z = p.rz;
  return out;
}

// ---------------------------------------------------------------- the loop
let last = performance.now(), elapsed = 0;
function frame() {
  const now = performance.now(), dt = Math.min((now - last) / 1000, .05); last = now; elapsed += dt; const t = elapsed;
  stepMood(1 - Math.exp(-dt * 2.6));
  for (const g of glowMats) g.m.emissiveIntensity = g.day + (g.night - g.day) * Math.max(cur.glow, g.night === 3 ? Math.min(1, cur.lamp / 6) : 0);
  bulbs.forEach((b, i) => b.scale.setScalar(1 + .18 * Math.sin(t * 2.2 + i * 1.7) * (.3 + cur.glow)));
  const live = mode !== 'build', rain = isRaining(), wind = (.7 + .5 * Math.sin(t * .31) + .3 * Math.sin(t * .83)) * (rain ? 1.7 : 1);
  for (const s of strips) { const a = Math.max(0, .015 + .07 * wind * (.5 + .5 * Math.sin(t * 1.2 + s.i * .55)) + .025 * Math.sin(t * 2.7 + s.i)); s.m.rotation.y = -a; s.m.position.x = s.x + Math.sin(a) * s.h / 2; s.m.position.z = s.z + (1 - Math.cos(a)) * s.h / 2; }
  for (const d of drops) { d.visible = rain; if (rain) { d.position.z -= d.userData.v * dt; if (d.position.z < d.userData.z0) d.position.z = d.userData.z1; } }
  for (const e of placed) {
    let sx = 1, sz = 1;
    if (e.squish > 0) { e.squish = Math.max(0, e.squish - dt * 2.2); const k = Math.sin((1 - e.squish) * PI * 3) * e.squish * .16; sz = 1 - k; sx = 1 + k * .6; }
    if (e.drop > 0) e.drop = Math.max(0, e.drop - dt * 3.2);
    if (e.def.idle === 'breathe' && mode !== 'build') { const b = Math.sin((t + e.t0) * 1.6) * .025; sz *= 1 + b; sx *= 1 - b * .4; }
    let py = 1, hz = 0;
    if (e.def.pet && live) { const a = petStep(e, dt); py = a.sy; sz *= a.sz; hz = a.hz; e.inner.rotation.x = a.rx; }
    e.inner.scale.set(sx, sx * py, sz); e.inner.position.z = e.drop * e.drop * .7 + hz;
    if (e.def.idle === 'record' && live) e.inner.children[2].rotation.z = t * 2.2, e.inner.children[2].scale.set(1, .7, 1);
    if (e.def.idle === 'swim' && live) { const f = e.inner.children[1], a = t * 1.3 + e.t0; f.position.x = .05 * Math.cos(a); f.position.y = .05 * Math.sin(a); f.rotation.z = a + PI / 2; }
    if (e.def.idle === 'clock') { const d = new Date(), mn = d.getMinutes() + d.getSeconds() / 60, hr = (d.getHours() % 12 + mn / 60) / 12 * 2 * PI, ma = mn / 60 * 2 * PI, hh = e.inner.children[2], mh = e.inner.children[3];
      hh.rotation.y = hr; hh.position.x = .045 * Math.sin(hr); hh.position.z = .045 * Math.cos(hr); mh.rotation.y = ma; mh.position.x = .07 * Math.sin(ma); mh.position.z = .07 * Math.cos(ma); }
    if (e.def.idle === 'spin' && mode !== 'build') e.inner.children.forEach((c, i) => { if (i >= 5) { const a = dt * 9; const x = c.position.x, z = c.position.z - 1.22; c.position.x = x * Math.cos(a) - z * Math.sin(a); c.position.z = 1.22 + x * Math.sin(a) + z * Math.cos(a); c.rotation.y -= a; } });
    if (e.def.idle === 'sway') {
      e.inner.rotation.x = Math.sin((t + e.t0) * .9) * .03 * wind; e.inner.rotation.y = Math.cos((t + e.t0) * .7) * .03 * wind;
      e.inner.children.forEach((c, i) => { if (i < 2) return; if (c.userData.rx === undefined) c.userData.rx = c.rotation.x; c.rotation.x = c.userData.rx + Math.sin(t * 1.9 + i * 1.3 + e.t0) * .07 * wind; });
    }
  }
  if (selected) {
    const b = bounds(selected), s = selected.spec, wall = selected.def.wall;
    const rad = wall ? Math.max(b.x1 - b.x0, b.y1 - b.y0, b.z1 - b.z0) / 2 + .08 : Math.max(b.x1 - b.x0, b.y1 - b.y0) / 2 + .1;
    ring.scale.setScalar(rad * (1 + .03 * Math.sin(t * 4)));
    if (wall) { ring.position.set((b.x0 + b.x1) / 2 + (s.rz === 90 ? .03 : 0), (b.y0 + b.y1) / 2 - (s.rz === 90 ? 0 : .03), (b.z0 + b.z1) / 2); ring.rotation.set(s.rz === 90 ? 0 : PI / 2, s.rz === 90 ? PI / 2 : 0, 0); }
    else { ring.position.set((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, s.pos[2] + .02); ring.rotation.set(0, 0, 0); }
  }
  for (let i = hearts.length - 1; i >= 0; i--) {
    const h = hearts[i], u = h.userData; u.t += dt;
    if (u.t < 0) { h.visible = false; continue; }
    h.visible = true; h.position.y += dt * .55; h.position.x += u.dx * dt; h.quaternion.copy(cam.quaternion); h.scale.setScalar(u.s * Math.min(1, u.t * 6)); h.material.opacity = Math.max(0, 1 - u.t / 1.3);
    if (u.t > 1.3) { scene.remove(h); h.material.dispose(); hearts.splice(i, 1); }
  }
  controls.update(); renderer.render(scene, cam); requestAnimationFrame(frame);
}
buildTray(); load(); chooseMood('auto'); setMode('build'); frame();
try { weather.place = JSON.parse(localStorage.getItem('cubby.place')); } catch (err) { weather.place = null; }
loadWeather();
if (location.hash.length > 6) visit(location.hash);
