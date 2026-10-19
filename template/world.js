// World engine distilled from GCL Campus (site/scene.js). Everything visible comes from world.config.js.
import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { WORLD } from './world.config.js';

const $ = s => document.querySelector(s);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const N = WORLD.size, C = N / 2;
const at = (x, z, y = 0) => new THREE.Vector3(x - C, y, z - C);   // grid units 0..N, centred at the origin
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const canvas = $('#scene');
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); }
catch { document.body.classList.add('no-webgl'); $('.nogl').hidden = false; throw new Error('No WebGL'); }
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);                                   // sky gradient is CSS behind the canvas
renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(WORLD.colors.haze, N * 4.5, N * 6.5);

const mats = new Map();
const mat = (c, key = c) => { if (!mats.has(key)) mats.set(key, new THREE.MeshStandardMaterial({ color: c, roughness: 0.85 })); return mats.get(key); };
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const mesh = (geo, m, x = 0, y = 0, z = 0, shadow = true) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = shadow; o.receiveShadow = true; return o; };
const flat = (x, z, w, d, y, c) => scene.add(mesh(box(w, 0.02, d), mat(c), x - C + w / 2, y, z - C + d / 2, false));
let seed = WORLD.seed || 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647; // same world every visit

/* ---------- Camera: orthographic isometric, tilt locked, spin allowed ---------- */
const FR = N * 0.62, OFFSET = new THREE.Vector3(60, 52, 60), HOME_ZOOM = 0.9;
const camera = new THREE.OrthographicCamera(-FR, FR, FR, -FR, 30, 240);
camera.position.copy(OFFSET);
const controls = new MapControls(camera, canvas);
controls.enableDamping = !reduceMotion; controls.dampingFactor = 0.08;
controls.minZoom = 0.6; controls.maxZoom = 4; controls.zoomToCursor = true;
controls.minPolarAngle = controls.maxPolarAngle = new THREE.Spherical().setFromVector3(OFFSET).phi;

scene.add(new THREE.HemisphereLight('#E6EEFF', WORLD.colors.ground, 1.45));
const sun = new THREE.DirectionalLight('#FFF1DC', 2.1);
sun.position.set(N * 0.9, N * 1.4, N * 0.4); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -N, right: N, top: N, bottom: -N, near: 1, far: N * 4 });
sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.02; scene.add(sun);

/* ---------- Ground: presentation slab like an architect's model (layers never coplanar = no z-fight flicker) ---------- */
const SLAB = N + 10;
scene.add(mesh(box(SLAB, 0.06, SLAB), mat(WORLD.colors.ground), 0, -0.03, 0, false));
scene.add(mesh(box(SLAB + 0.04, 0.08, SLAB + 0.04), mat(WORLD.colors.trim), 0, -0.1, 0, false));
scene.add(mesh(box(SLAB, 0.9, SLAB), mat('#F3EFE7'), 0, -0.6, 0));
{ const floor = mesh(new THREE.PlaneGeometry(400, 400), mat(WORLD.colors.floor), 0, -1.2, 0, false); floor.rotation.x = -Math.PI / 2; scene.add(floor); }
for (const [x, z, w, d, c] of WORLD.areas || []) flat(x, z, w, d, 0.006, c);            // lawns, plazas, water, soil…
for (const [x, z, w, d] of WORLD.paths || []) { flat(x - 0.07, z - 0.07, w + 0.14, d + 0.14, 0.011, '#CDBFA6'); flat(x, z, w, d, 0.015, WORLD.colors.path); }

/* ---------- Zones: buildings (or any landmark) you can click ---------- */
const pickables = [], objects = {};
function signTexture(text, colour) {
  const c = document.createElement('canvas'); c.width = 640; c.height = 108;
  const g = c.getContext('2d');
  g.fillStyle = colour; g.beginPath(); g.roundRect(4, 4, 632, 100, 18); g.fill();
  g.fillStyle = '#FFFFFF'; g.font = '700 48px Inter, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text.toUpperCase(), 320, 58, 600);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
for (const z of WORLD.zones) {
  const { id, x, z: zz, w, d, h, roof = "hip", color } = z;
  const g = new THREE.Group(); g.position.copy(at(x, zz)); scene.add(g);
  const body = mesh(box(w, h, d), new THREE.MeshStandardMaterial({ color: z.wall || '#F6F1E8', roughness: 0.85 }), 0, h / 2, 0);
  g.add(mesh(box(w + 0.2, 0.14, d + 0.2), mat('#D6CCBA'), 0, 0.07, 0), body);          // plinth + body
  for (let i = 0; i < Math.floor(w / 0.9); i++) {                                       // windows on the two camera-facing walls
    const wx = -w / 2 + 0.45 + i * 0.9 + (w % 0.9) / 2;
    g.add(mesh(box(0.42, h * 0.32, 0.04), mat('#9CC3DE', 'glass'), wx, h * 0.55, d / 2 + 0.02, false));
  }
  for (let i = 0; i < Math.floor(d / 0.9); i++) {
    const wz = -d / 2 + 0.45 + i * 0.9 + (d % 0.9) / 2;
    g.add(mesh(box(0.04, h * 0.32, 0.42), mat('#9CC3DE', 'glass'), w / 2 + 0.02, h * 0.55, wz, false));
  }
  g.add(mesh(box(0.5, h * 0.45, 0.05), mat('#6B5A48'), 0, h * 0.225, d / 2 + 0.03, false)); // door, faces +z
  if (roof === 'flat') g.add(mesh(box(w + 0.16, 0.18, d + 0.16), mat(color), 0, h + 0.09, 0));
  else { const geo = new THREE.ConeGeometry(1, Math.min(w, d) * 0.45, 4); geo.rotateY(Math.PI / 4); const r = mesh(geo, mat(color), 0, h + Math.min(w, d) * 0.225, 0); r.scale.set(w / 1.414 * 1.12, 1, d / 1.414 * 1.12); g.add(r); }
  const sign = mesh(new THREE.PlaneGeometry(Math.min(w * 0.8, 3), 0.5), new THREE.MeshBasicMaterial({ map: signTexture(z.name, color), transparent: true }), 0, h * 0.86, d / 2 + 0.05, false);
  g.add(sign);
  g.traverse(m => { if (m.isMesh) { m.userData.id = id; pickables.push(m); } });
  objects[id] = { group: g, body, size: new THREE.Vector3(w, h, d), top: at(x, zz, h + Math.min(w, d) * 0.5 + 0.3), r: Math.max(w, d) * 0.75 };
}

/* ---------- Nature + furniture: collision-aware seeded scatter (never on paths or zones) ---------- */
const blocked = (x, z, pad) => [...WORLD.zones.map(o => [o.x - o.w / 2, o.z - o.d / 2, o.w, o.d]), ...(WORLD.paths || [])]
  .some(([bx, bz, bw, bd]) => x > bx - pad && x < bx + bw + pad && z > bz - pad && z < bz + bd + pad);
const trees = [];
for (let tries = 0; trees.length < (WORLD.trees ?? 40) && tries < 4000; tries++) {
  const x = rnd() * (N + 4) - 2, z = rnd() * (N + 4) - 2;
  if (!blocked(x, z, 0.9) && trees.every(([a, b]) => Math.hypot(a - x, b - z) > 1.3)) trees.push([x, z]);
}
const inst = (geo, m, list, fn) => {
  const im = new THREE.InstancedMesh(geo, m, list.length); im.castShadow = true; im.receiveShadow = true;
  const o = new THREE.Object3D(); list.forEach((v, i) => { o.position.set(0, 0, 0); o.scale.set(1, 1, 1); const col = fn(o, v, i); o.updateMatrix(); im.setMatrixAt(i, o.matrix); if (col) im.setColorAt(i, new THREE.Color(col)); });
  scene.add(im); return im;
};
const white = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.9, flatShading: true }); // instance colours tint it
inst(new THREE.CylinderGeometry(0.08, 0.12, 0.8, 6), mat('#7A5A3E'), trees, (o, [x, z]) => { o.position.copy(at(x, z, 0.4)); });
inst(new THREE.IcosahedronGeometry(0.62, 0), white, trees, (o, [x, z]) => { o.position.copy(at(x, z, 1.15)); o.scale.setScalar(0.8 + rnd() * 0.5); return WORLD.colors.foliage[Math.floor(rnd() * WORLD.colors.foliage.length)]; });

/* ---------- Selection: outline, bobbing pin, pulsing ring, smooth fly-to ---------- */
const ACCENT = WORLD.colors.accent;
const pin = new THREE.Group(), pinMat = new THREE.MeshStandardMaterial({ color: ACCENT, roughness: 0.4 });
{ const tip = mesh(new THREE.ConeGeometry(0.22, 0.55, 20), pinMat, 0, 0.36, 0); tip.rotation.x = Math.PI; pin.add(mesh(new THREE.SphereGeometry(0.28, 20, 14), pinMat, 0, 0.72, 0), tip); }
const marker = new THREE.Group(); marker.add(pin); marker.visible = false; scene.add(marker);
const ring = new THREE.Mesh(new THREE.RingGeometry(1, 1.1, 56), new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.6 }));
ring.rotation.x = -Math.PI / 2; ring.visible = false; scene.add(ring);
let outline = null, selected = null, anim = null;
const offset = () => camera.position.clone().sub(controls.target);
const tween = (toT, toZ, toOff = null) => { anim = { t: reduceMotion ? 1 : 0, fromT: controls.target.clone(), toT, fromZ: camera.zoom, toZ, fromOff: offset(), toOff }; };

function select(id) {
  if (id && !objects[id]) id = null;
  selected = id;
  if (outline) { outline.parent.remove(outline); outline.geometry.dispose(); outline = null; }
  const o = objects[id];
  ring.visible = marker.visible = !!o;
  if (o) {
    outline = new THREE.LineSegments(new THREE.EdgesGeometry(box(o.size.x + 0.14, o.size.y, o.size.z + 0.14)), new THREE.LineBasicMaterial({ color: ACCENT }));
    outline.position.y = o.size.y / 2; o.group.add(outline);
    marker.position.copy(o.top); ring.position.set(o.group.position.x, 0.04, o.group.position.z); ring.scale.setScalar(o.r);
    tween(o.group.position.clone().setY(0), Math.max(camera.zoom, 1.8));
  }
  renderPanel();
  history.replaceState(null, '', id ? '#' + id : location.pathname);
}

/* ---------- Info panel (HTML card over the canvas) ---------- */
const panel = $('#panel');
function renderPanel() {
  const z = WORLD.zones.find(o => o.id === selected);
  panel.innerHTML = z
    ? `<small class="kicker" style="color:${z.color}">${esc(z.kicker || WORLD.title)}</small><h2>${esc(z.name)}</h2><p>${esc(z.blurb || '')}</p>
       ${z.facts ? `<dl>${z.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
       <button class="btn" data-close>Back to overview</button>`
    : `<small class="kicker">WELCOME</small><h2>${esc(WORLD.title)}</h2><p>${esc(WORLD.intro)}</p>
       <ul>${WORLD.zones.map(o => `<li><button data-select="${o.id}"><i style="background:${o.color}"></i>${esc(o.name)}</button></li>`).join('')}</ul>
       <p class="muted">Click any building · drag to pan · scroll to zoom</p>`;
}
document.addEventListener('click', e => {
  const s = e.target.closest('[data-select]'); if (s) return select(s.dataset.select);
  if (e.target.closest('[data-close]')) { select(null); tween(new THREE.Vector3(), HOME_ZOOM, OFFSET.clone()); }
  const a = e.target.closest('[data-action]')?.dataset.action;
  if (a === 'zoomin' || a === 'zoomout') tween(controls.target.clone(), THREE.MathUtils.clamp(camera.zoom * (a === 'zoomin' ? 1.3 : 1 / 1.3), controls.minZoom, controls.maxZoom));
  if (a === 'spin') tween(controls.target.clone(), camera.zoom, offset().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4));
  if (a === 'home') tween(new THREE.Vector3(), HOME_ZOOM, OFFSET.clone());
});
addEventListener('keydown', e => { if (e.key === 'Escape') select(null); });

/* ---------- Picking + hover ---------- */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
const pickAt = e => {
  const r = canvas.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  return ray.intersectObjects(pickables, false)[0]?.object.userData.id ?? null;
};
let down = null, hovered = null;
canvas.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; anim = null; });
canvas.addEventListener('pointerup', e => { if (down && Math.hypot(e.clientX - down[0], e.clientY - down[1]) < 5) select(pickAt(e)); down = null; }); // a click, not a drag
canvas.addEventListener('pointermove', e => {
  if (e.buttons) return;
  const id = pickAt(e); if (id === hovered) return;
  objects[hovered]?.body.material.emissive.set('#000000');
  hovered = id; objects[id]?.body.material.emissive.set(ACCENT).multiplyScalar(0.12);
  canvas.style.cursor = id ? 'pointer' : '';
});

/* ---------- HTML labels pinned to 3D anchors, decluttered every frame ---------- */
const labels = WORLD.zones.map(z => {
  const el = document.createElement('button'); el.type = 'button'; el.className = 'maplabel';
  el.innerHTML = `<i style="background:${z.color}"></i>${esc(z.name)}`;
  el.addEventListener('click', () => select(z.id)); $('#labels').append(el);
  return { id: z.id, el, anchor: objects[z.id].top, x: 0, y: 0, w: 0, h: 0 };
});
let measured = 0, panels = [];
function declutter() {             // selected label first; hide any that would overlap a placed label, a UI card or the edge
  if (performance.now() - measured > 400) {
    measured = performance.now();
    for (const l of labels) { l.w = l.el.offsetWidth; l.h = l.el.offsetHeight; }
    panels = [...document.querySelectorAll('.card')].map(e => e.getBoundingClientRect()).filter(r => r.width);
  }
  const placed = [], cw = canvas.clientWidth, ch = canvas.clientHeight;
  for (const l of [...labels].sort((a, b) => (b.id === selected) - (a.id === selected))) {
    const r = { left: l.x - l.w / 2 - 3, top: l.y - l.h - 9, right: l.x + l.w / 2 + 3, bottom: l.y + 3 };
    const hit = q => r.left < q.right && r.right > q.left && r.top < q.bottom && r.bottom > q.top;
    const off = !l.w || r.left < 0 || r.right > cw || r.top < 0 || r.bottom > ch || panels.some(hit) || placed.some(hit);
    l.el.classList.toggle('hid', off); l.el.classList.toggle('on', l.id === selected);
    if (!off) placed.push(r);
  }
}

function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight, a = w / h, fr = a < 1 ? FR / a * 0.75 : FR; // portrait: widen
  renderer.setSize(w, h, false);
  Object.assign(camera, { left: -fr * a, right: fr * a, top: fr, bottom: -fr }); camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(canvas); resize();
camera.zoom = HOME_ZOOM; camera.updateProjectionMatrix();

const v = new THREE.Vector3(), clock = new THREE.Clock(), BOUND = N * 0.55;
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
  if (anim) {                                              // 0.9s cubic ease-out
    anim.t = Math.min(1, anim.t + dt / 0.9); const k = 1 - Math.pow(1 - anim.t, 3);
    controls.target.lerpVectors(anim.fromT, anim.toT, k);
    const off = anim.toOff ? anim.fromOff.clone().lerp(anim.toOff, k).setLength(anim.fromOff.length()) : anim.fromOff;
    camera.position.copy(controls.target).add(off);
    camera.zoom = THREE.MathUtils.lerp(anim.fromZ, anim.toZ, k); camera.updateProjectionMatrix();
    if (anim.t >= 1) anim = null;
  }
  const before = controls.target.clone();                  // keep the world on screen
  controls.target.x = THREE.MathUtils.clamp(controls.target.x, -BOUND, BOUND);
  controls.target.z = THREE.MathUtils.clamp(controls.target.z, -BOUND, BOUND);
  camera.position.add(controls.target.clone().sub(before));
  controls.update();
  if (!reduceMotion) { pin.position.y = Math.sin(t * 2.4) * 0.12; ring.material.opacity = 0.35 + Math.sin(t * 2.4) * 0.25; }
  renderer.render(scene, camera);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  for (const l of labels) {
    v.copy(l.anchor).project(camera); l.x = (v.x + 1) / 2 * w; l.y = (1 - v.y) / 2 * h;
    l.el.style.transform = `translate(${l.x.toFixed(1)}px, ${l.y.toFixed(1)}px) translate(-50%, -100%)`;
  }
  declutter();
});

select(location.hash.slice(1) || null);                    // deep links: #<zone-id>
