/* The people of the Forum, built from simple solids and coloured per vertex:
   Romans in togas (white wool, the praetor's with a purple border), Greeks in
   chiton and himation, plain citizens in tunics. Each named figure is a group
   with a separate head, so it can nod, shake its head, look round or droop.
   When the sculpted figures arrive they replace these by name (see sculpt()). */
import * as THREE from 'three';
import { enableActing } from './act.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { part, M, V } from '../im/kit.js';

const lathe = (pts, seg = 16) => new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), seg);
const mat = () => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.88, metalness: 0 });

/* ---------------- heads ---------------- */
function headGeometry(o) {
  const P = [];
  const skin = o.skin || 0xc49a78, hair = o.hair ?? 0x2a2018;
  P.push(part(new THREE.SphereGeometry(0.11, 18, 14), skin, false, M(0, 0, 0, 0, 0, 0, 0.9, 1.08, 1)));     /* the skull */
  P.push(part(new THREE.SphereGeometry(0.075, 12, 8), skin, false, M(0, -0.06, 0.03, 0, 0, 0, 1, 0.8, 1)));  /* the jaw */
  P.push(part(new THREE.ConeGeometry(0.018, 0.05, 6), skin, false, M(0, -0.005, 0.105, Math.PI / 2.4)));    /* the nose */
  for (const s of [-1, 1]) {
    P.push(part(new THREE.SphereGeometry(0.022, 8, 6), skin, false, M(s * 0.097, -0.005, 0, 0, 0, 0, 0.5, 1, 0.8)));    /* ears */
    P.push(part(new THREE.SphereGeometry(0.012, 6, 5), 0x1a120c, false, M(s * 0.036, 0.018, 0.093)));                 /* eyes */
    P.push(part(new THREE.BoxGeometry(0.035, 0.007, 0.01), o.brow || hair || 0x3a2a1e, false, M(s * 0.036, 0.042, 0.098, 0, 0, -s * 0.12))); /* brows */
  }
  if (o.bald) {
    P.push(part(new THREE.TorusGeometry(0.085, 0.022, 6, 16, Math.PI * 1.2), hair, false, M(0, 0.0, -0.01, Math.PI / 2, 0, Math.PI * 0.9)));
  } else if (hair !== null) {
    P.push(part(new THREE.SphereGeometry(0.114, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.42), hair, false, M(0, 0.022, -0.012, -0.32, 0, 0, 0.96, 1.06, 1.04)));
  }
  if (o.beard) {
    P.push(part(new THREE.SphereGeometry(0.08, 12, 8, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55), o.beard, false, M(0, -0.04, 0.03, 0, 0, 0, 1, 1.15, 1.05)));
  }
  if (o.wreath) P.push(part(new THREE.TorusGeometry(0.108, 0.012, 5, 18), 0x6b7a3a, false, M(0, 0.05, -0.01, Math.PI / 2.2)));
  return mergeGeometries(P);
}

/* ---------------- bodies ---------------- */
/* standing, about 1.75 tall to the crown, facing +z */
function bodyGeometry(o) {
  const P = [];
  const cloth = o.cloth ?? 0xeee8da, under = o.under ?? 0xe4dccb, skin = o.skin || 0xc49a78, shoe = o.shoe || 0x5a3a22;
  const kind = o.kind || 'toga';
  if (kind === 'tunic' || kind === 'stola') {
    const long = kind === 'stola';
    P.push(part(lathe(long ? [[0, 0.05], [0.24, 0.05], [0.22, 0.6], [0.2, 1.05], [0.23, 1.3], [0.2, 1.42], [0.08, 1.48], [0, 1.48]]
                           : [[0, 0.52], [0.25, 0.52], [0.23, 0.9], [0.21, 1.1], [0.24, 1.32], [0.2, 1.42], [0.08, 1.48], [0, 1.48]]), cloth, false));
    if (!long) for (const s of [-1, 1]) P.push(part(new THREE.CylinderGeometry(0.06, 0.05, 0.52, 7), skin, false, M(s * 0.09, 0.27, 0)));
    P.push(part(new THREE.CylinderGeometry(0.215, 0.215, 0.05, 14), o.belt || 0x4a3624, false, M(0, 1.0, 0)));
    if (o.shawl) P.push(part(new THREE.CylinderGeometry(0.24, 0.29, 0.34, 14, 1, true), o.shawl, false, M(0, 1.3, -0.01)));
  } else {
    /* the long garment to the ankles: toga, or the Greek chiton */
    P.push(part(lathe([[0, 0.06], [0.27, 0.06], [0.26, 0.4], [0.23, 0.95], [0.25, 1.18], [0.27, 1.34], [0.2, 1.44], [0.08, 1.49], [0, 1.49]]), kind === 'greek' ? under : cloth, false));
    if (kind === 'greek') {
      /* the himation: wrapped round the hips and up over the left shoulder */
      P.push(part(new THREE.CylinderGeometry(0.29, 0.31, 0.62, 16, 1, true), cloth, false, M(0, 0.62, 0, 0, 0, 0.05)));
      P.push(part(new THREE.BoxGeometry(0.2, 0.9, 0.06), cloth, false, M(0.06, 1.05, 0.2, 0.15, 0, 0.62)));
      P.push(part(new THREE.BoxGeometry(0.22, 0.75, 0.06), cloth, false, M(0.1, 1.08, -0.22, -0.1, 0, 0.55)));
    } else {
      /* the toga: a broad band from the left shoulder across the chest, the hanging fold (sinus) in front, and the
         left arm wrapped in it; the praetor's has a purple border along that band */
      const band = o.border ? o.border : cloth;
      P.push(part(new THREE.BoxGeometry(0.17, 0.92, 0.07), cloth, false, M(-0.02, 1.02, 0.235, 0.05, 0, -0.62)));
      P.push(part(new THREE.BoxGeometry(0.19, 0.95, 0.07), cloth, false, M(-0.04, 1.04, -0.23, -0.06, 0, -0.55)));
      if (o.border) P.push(part(new THREE.BoxGeometry(0.035, 0.94, 0.075), band, false, M(-0.085, 1.0, 0.24, 0.05, 0, -0.62)));
      P.push(part(new THREE.TorusGeometry(0.2, 0.045, 6, 16, Math.PI), cloth, false, M(0.02, 0.86, 0.17, 0, 0, Math.PI + 0.2)));
      P.push(part(new THREE.CylinderGeometry(0.075, 0.09, 0.62, 8), cloth, false, M(-0.29, 1.03, 0.07, 0.35, 0, 0.12)));       /* the wrapped left arm */
      if (o.clavus) P.push(part(new THREE.BoxGeometry(0.04, 0.32, 0.01), o.clavus, false, M(0.1, 1.24, 0.255)));                  /* the senator's stripe */
    }
  }
  /* the right arm: a short sleeve and a bare forearm */
  P.push(part(new THREE.CylinderGeometry(0.065, 0.07, 0.3, 8), kind === 'greek' ? under : cloth, false, M(0.27, 1.26, 0.02, 0, 0, 0.14)));
  P.push(part(new THREE.CylinderGeometry(0.045, 0.05, 0.32, 7), skin, false, M(0.29, 0.98, 0.07, 0.2, 0, 0.06)));
  P.push(part(new THREE.SphereGeometry(0.047, 8, 6), skin, false, M(0.3, 0.8, 0.12)));
  if (kind === 'greek' || kind === 'tunic' || kind === 'stola') {
    P.push(part(new THREE.CylinderGeometry(0.06, 0.07, 0.3, 8), kind === 'greek' ? cloth : (o.cloth ?? 0xeee8da), false, M(-0.27, 1.26, 0.02, 0, 0, -0.14)));
    P.push(part(new THREE.CylinderGeometry(0.045, 0.05, 0.32, 7), skin, false, M(-0.29, 0.98, 0.07, 0.2, 0, -0.06)));
    P.push(part(new THREE.SphereGeometry(0.047, 8, 6), skin, false, M(-0.3, 0.8, 0.12)));
  }
  P.push(part(new THREE.CylinderGeometry(0.05, 0.058, 0.09, 8), skin, false, M(0, 1.52, 0)));   /* the neck */
  for (const s of [-1, 1]) P.push(part(new THREE.BoxGeometry(0.09, 0.05, 0.22), shoe, false, M(s * 0.1, 0.03, 0.05)));
  if (o.scroll) P.push(part(new THREE.CylinderGeometry(0.03, 0.03, 0.26, 8), 0xe2d4ae, false, M(0.3, 0.82, 0.18, 0, 0, Math.PI / 2)));
  if (o.tablet) P.push(part(new THREE.BoxGeometry(0.26, 0.18, 0.025), 0x8a6a3a, false, M(0, 0.98, 0.3, -0.3)));
  return mergeGeometries(P);
}
/* seated: the same garment folded over the knees */
function seatedGeometry(o) {
  const P = [];
  const cloth = o.cloth ?? 0xeee8da, skin = o.skin || 0xc49a78, shoe = o.shoe || 0x5a3a22;
  P.push(part(lathe([[0, 0.5], [0.26, 0.5], [0.24, 0.72], [0.25, 0.86], [0.27, 1.0], [0.2, 1.1], [0.08, 1.15], [0, 1.15]]), cloth, false));
  P.push(part(new THREE.BoxGeometry(0.46, 0.16, 0.5), cloth, false, M(0, 0.5, 0.2)));             /* lap and thighs */
  P.push(part(new THREE.BoxGeometry(0.44, 0.48, 0.14), cloth, false, M(0, 0.26, 0.42)));          /* the drape over the shins */
  for (const s of [-1, 1]) P.push(part(new THREE.BoxGeometry(0.09, 0.05, 0.2), shoe, false, M(s * 0.1, 0.025, 0.5)));
  if (o.kind !== 'greek') {
    P.push(part(new THREE.BoxGeometry(0.17, 0.62, 0.07), cloth, false, M(-0.03, 0.82, 0.235, 0.05, 0, -0.62)));
    if (o.border) P.push(part(new THREE.BoxGeometry(0.035, 0.64, 0.075), o.border, false, M(-0.08, 0.8, 0.24, 0.05, 0, -0.62)));
    if (o.clavus) P.push(part(new THREE.BoxGeometry(0.04, 0.22, 0.01), o.clavus, false, M(0.1, 0.94, 0.255)));
  } else {
    P.push(part(new THREE.BoxGeometry(0.2, 0.62, 0.06), o.himation || 0x5a6a7a, false, M(0.06, 0.82, 0.21, 0.15, 0, 0.6)));
  }
  for (const s of [-1, 1]) {
    P.push(part(new THREE.CylinderGeometry(0.065, 0.07, 0.36, 8), cloth, false, M(s * 0.27, 0.86, 0.06, 0.3, 0, s * 0.12)));
    P.push(part(new THREE.SphereGeometry(0.047, 8, 6), skin, false, M(s * 0.2, 0.6, 0.3)));
  }
  P.push(part(new THREE.CylinderGeometry(0.05, 0.058, 0.09, 8), skin, false, M(0, 1.18, 0)));
  return mergeGeometries(P);
}

/* ---------------- a person ---------------- */
/* o: kind (toga | greek | tunic | stola), seated, cloth, under, border, clavus, skin, hair, beard, bald, scroll, tablet */
export function person(o = {}) {
  const g = new THREE.Group();
  const m = mat();
  const body = new THREE.Mesh(o.seated ? seatedGeometry(o) : bodyGeometry(o), m);
  body.castShadow = true; body.receiveShadow = true;
  const head = new THREE.Group();
  const hm = new THREE.Mesh(headGeometry(o), m);
  hm.castShadow = true;
  head.add(hm);
  head.position.set(0, o.seated ? 1.32 : 1.66, 0);
  const torso = new THREE.Group();   /* leans and slumps as one */
  torso.add(body, head);
  g.add(torso);
  /* reactions: nod, shake, droop, lean; all eased in update() */
  const st = { nod: 0, shake: 0, droop: 0, lean: 0, look: 0, turn: 0, t: Math.random() * 10, speak: 0, gesture: 0 };
  const goal = { droop: 0, lean: 0, look: 0 };
  g.userData = {
    head, torso, st, goal, name: o.name,
    nod() { st.nod = 1; }, shake() { st.shake = 1; },
    set(k, v) { goal[k] = v; },
    speak(on) { st.speak = on ? 1 : 0; },
    update(dt, t) {
      for (const k in goal) st[k] += (goal[k] - st[k]) * Math.min(1, dt * 2);
      st.nod = Math.max(0, st.nod - dt * 0.9); st.shake = Math.max(0, st.shake - dt * 0.9);
      const breathe = Math.sin(t * 1.3 + st.t) * 0.012;
      const talk = st.speak ? Math.sin(t * 7.3 + st.t) * 0.03 + Math.sin(t * 2.1) * 0.04 : 0;
      head.rotation.x = st.droop * 0.55 + Math.sin(st.nod * Math.PI * 4) * 0.22 * st.nod + talk - st.lean * 0.1 + breathe;
      head.rotation.y = st.look + Math.sin(st.shake * Math.PI * 5) * 0.35 * st.shake + Math.sin(t * 0.4 + st.t) * 0.06;
      torso.rotation.x = st.droop * 0.18 + st.lean * 0.12;
      torso.position.y = -st.droop * 0.05 + breathe * 0.4;
    },
  };
  return enableActing(g);
}

/* the same figure as a single geometry, for the crowd's instancing */
export function crowdGeometry(o) {
  const b = (o.seated ? seatedGeometry : bodyGeometry)(o);
  const h = headGeometry(o);
  h.translate(0, o.seated ? 1.32 : 1.66, 0);
  const g = mergeGeometries([b, h]);
  /* the crowd shader tints per person: mark the clothes, not the skin */
  const col = g.attributes.color, n = col.count, mask = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const r = col.getX(i), gg = col.getY(i), bb = col.getZ(i);
    mask[i] = (r > 0.75 && gg > 0.72 && bb > 0.6) ? 1 : 0;     /* white wool takes the tint */
  }
  g.setAttribute('tintMask', new THREE.BufferAttribute(mask, 1));
  return g;
}

export { V };
