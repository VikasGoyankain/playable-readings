/* The user's sculpted characters (assets/models/poet, reduced by
   tools/prep-poet-models.mjs into models.gen.js), made into figures with the
   same behaviour as person() in figures.js: nod, shake, droop, lean, look,
   speak. A character with no sculpt keeps its hand-built figure.

   The sculpts come unpainted, so they are painted here: skin, hair and beard
   by height on the head, sandals at the feet, cloth below, and every fold
   darkened by how deep it is (a cheap ambient occlusion from the mesh's own
   curvature). The head is cut free at the neck so it can move. */
import * as THREE from 'three';
import { MODELS } from './models.gen.js';
import { enableActing } from './act.js';

function decode(b64, Type) {
  const bin = atob(b64), u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return new Type(u8.buffer);
}

const cache = {};
/* o: height, cloth, cloth2 (the outer cloak, on the back and shoulders), skin, hair, beard, sandal */
function geometries(name, o) {
  const key = name + JSON.stringify(o);
  if (cache[key]) return cache[key];
  const m = MODELS[name];
  const pos = decode(m.pos, Float32Array), idx = decode(m.idx, m.wide ? Uint32Array : Uint16Array);
  const n = pos.length / 3;
  /* stand it on the ground, centred, at its height */
  let lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
  for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], pos[i * 3 + k]); hi[k] = Math.max(hi[k], pos[i * 3 + k]); }
  const H = o.height || 1.78, s = H / (hi[1] - lo[1]);
  for (let i = 0; i < n; i++) {
    pos[i * 3] = (pos[i * 3] - (lo[0] + hi[0]) / 2) * s;
    pos[i * 3 + 1] = (pos[i * 3 + 1] - lo[1]) * s;
    pos[i * 3 + 2] = (pos[i * 3 + 2] - (lo[2] + hi[2]) / 2) * s;
  }
  /* heights as sculpted, for painting and for the neck, whatever the pose */
  const oy = new Float32Array(n); for (let i = 0; i < n; i++) oy[i] = pos[i * 3 + 1];
  let drop = 0;
  /* seated: the standing sculpt is bent forward at the hip and back at the
     knee, smoothly over a band at each joint, so the drapery stays whole */
  if (o.seated) {
    const yh = H * 0.53, yk = H * 0.285, band = H * 0.07, z0 = -0.03;
    const ss = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    const rot = (y, z, py, pz, th) => { const dy = y - py, dz = z - pz, c = Math.cos(th), s = Math.sin(th); return [py + dy * c + dz * s, pz - dy * s + dz * c]; };
    const [ky, kz] = rot(yk, z0, yh, z0, Math.PI / 2);
    for (let i = 0; i < n; i++) {
      const y0 = pos[i * 3 + 1];
      let [y, z] = rot(y0, pos[i * 3 + 2], yh, z0, (Math.PI / 2) * ss(yh + band, yh - band, y0));
      [y, z] = rot(y, z, ky, kz, -(Math.PI / 2) * ss(yk + band, yk - band, y0));
      pos[i * 3 + 1] = y - (yh - yk); pos[i * 3 + 2] = z;
    }
    drop = yh - yk;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  g.computeVertexNormals();
  const nor = g.attributes.normal.array;

  /* the head: where it is, so hair, face and beard can be told apart */
  const NECK = H * 0.835;
  let cz = 0, cx = 0, cn = 0;
  for (let i = 0; i < n; i++) if (oy[i] > H * 0.9) { cx += pos[i * 3]; cz += pos[i * 3 + 2]; cn++; }
  cx /= cn || 1; cz /= cn || 1;

  /* ambient occlusion from curvature: a vertex whose neighbours rise in
     front of its normal sits in a fold */
  const occ = new Float32Array(n), cnt = new Float32Array(n);
  for (let t = 0; t < idx.length; t += 3) for (let e = 0; e < 3; e++) {
    const a = idx[t + e], b = idx[t + (e + 1) % 3];
    for (const [p, q] of [[a, b], [b, a]]) {
      const dx = pos[q * 3] - pos[p * 3], dy = pos[q * 3 + 1] - pos[p * 3 + 1], dz = pos[q * 3 + 2] - pos[p * 3 + 2];
      const l = Math.hypot(dx, dy, dz) || 1;
      occ[p] += (dx * nor[p * 3] + dy * nor[p * 3 + 1] + dz * nor[p * 3 + 2]) / l; cnt[p]++;
    }
  }
  const C = k => new THREE.Color(k);
  const skin = C(o.skin || 0xc29674), hair = C(o.hair || 0x3a2a1e), beard = o.beard ? C(o.beard) : null;
  const cloth = C(o.cloth || 0xe9e2d2), cloth2 = o.cloth2 ? C(o.cloth2) : null, sandal = C(o.sandal || 0x5a3c22);
  const col = new Float32Array(n * 3), c = new THREE.Color();
  for (let i = 0; i < n; i++) {
    const x = pos[i * 3], y = oy[i], z = pos[i * 3 + 2];
    const front = z - cz, side = Math.abs(x - cx);
    if (y > NECK) {
      const top = y > H * 0.955 || (y > H * 0.885 && (front < -0.02 || side > 0.075)) || (y > H * 0.93 && front < 0.05);
      if (top) c.copy(o.bald && y > H * 0.93 && side < 0.06 ? skin : hair);
      else if (beard && y < H * 0.895 && front > 0.0) c.copy(beard);
      else c.copy(skin);
    } else if (y < H * 0.035) c.copy(sandal);
    else {
      c.copy(cloth2 && front < -0.02 && y > H * 0.3 ? cloth2 : cloth);
      c.multiplyScalar(0.86 + 0.14 * Math.min(1, y / (H * 0.5)));       /* a little dust toward the hem */
    }
    const ao = Math.max(0, Math.min(1, 0.5 + (occ[i] / (cnt[i] || 1)) * 2.2));
    c.multiplyScalar(1 - ao * 0.55);
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));

  /* the right arm (the figure's right is -x), weighted to move from the
     shoulder: fully at the hand, fading into the shoulder and the robe's side,
     as one bone would. The sculpts' arms are not separate from the robe, so
     this bends the cloth with them instead of tearing it. Seated figures keep
     their hands in their laps. */
  const arm = new Float32Array(n), ss = (a, b, v) => { const k = Math.max(0, Math.min(1, (v - a) / (b - a))); return k * k * (3 - 2 * k); };
  if (!o.seated) for (let i = 0; i < n; i++) {
    const dx = pos[i * 3] - cx, y = oy[i];
    arm[i] = ss(-0.105 * H, -0.155 * H, dx) * ss(0.83 * H, 0.72 * H, y) * ss(0.33 * H, 0.42 * H, y);
  }
  g.setAttribute('aArm', new THREE.BufferAttribute(arm, 1));
  /* the end of that arm is a hand: skin, not cloth (still shaded by its folds) */
  for (let i = 0; i < n; i++) if (arm[i] > 0.75 && oy[i] < 0.53 * H && oy[i] > 0.4 * H) {
    const ao = Math.max(0, Math.min(1, 0.5 + (occ[i] / (cnt[i] || 1)) * 2.2));
    col[i * 3] = skin.r * (1 - ao * 0.45); col[i * 3 + 1] = skin.g * (1 - ao * 0.45); col[i * 3 + 2] = skin.b * (1 - ao * 0.45);
  }
  const shoulder = new THREE.Vector3(cx - 0.15 * H, 0.8 * H - drop, cz);

  /* cut the head free: triangles above the neck go to their own geometry,
     drawn about a pivot at the neck */
  const hIdx = [], bIdx = [];
  for (let t = 0; t < idx.length; t += 3) {
    const y = (oy[idx[t]] + oy[idx[t + 1]] + oy[idx[t + 2]]) / 3;
    (y > NECK + 0.02 ? hIdx : bIdx).push(idx[t], idx[t + 1], idx[t + 2]);
  }
  const body = g.clone(); body.setIndex(bIdx);
  const head = g.clone(); head.setIndex(hIdx); head.translate(-cx, -(NECK - drop), -cz);
  return (cache[key] = { g, body, head, pivot: new THREE.Vector3(cx, NECK - drop, cz), shoulder });
}

/* the arm is turned in the vertex shader, so it costs nothing on the CPU and
   its shadow moves with it: forward (uArm.x) and out to the side (uArm.y) */
const ARM_GLSL = `
  attribute float aArm; uniform vec2 uArm; uniform vec3 uShoulder;
  vec3 armTurn(vec3 v, float w) {
    float f = -uArm.x * w, s = -uArm.y * w;
    v = vec3(v.x, v.y * cos(f) - v.z * sin(f), v.y * sin(f) + v.z * cos(f));
    return vec3(v.x * cos(s) - v.y * sin(s), v.x * sin(s) + v.y * cos(s), v.z);
  }`;
function armed(material, U) {
  material.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>' + ARM_GLSL)
      .replace('#include <begin_vertex>', '#include <begin_vertex>\n  transformed = uShoulder + armTurn(transformed - uShoulder, aArm);');
    if (sh.vertexShader.includes('#include <beginnormal_vertex>'))
      sh.vertexShader = sh.vertexShader.replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\n  objectNormal = armTurn(objectNormal, aArm);');
  };
  material.customProgramCacheKey = () => 'poet-arm';
  return material;
}
const headMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.88, metalness: 0 });
/* arm positions: [forward, out], in radians */
const GESTURE = { rest: [0, 0], orate: [0.8, 0.26], point: [1.2, 0.3], offer: [0.85, 0.08], raise: [1.25, 0.22], plead: [0.6, -0.05] };   /* past about 70 degrees the robe would stretch */

export const hasSculpt = name => !!(MODELS[name] && MODELS[name].pos);

/* a sculpted figure, with the behaviour of person() */
export function sculpted(name, o = {}) {
  if (!hasSculpt(name)) return null;
  const G = geometries(name, o);
  const g = new THREE.Group();
  const torso = new THREE.Group();
  /* each figure its own arm uniforms (the shader program itself is shared) */
  const U = { uArm: { value: new THREE.Vector2() }, uShoulder: { value: G.shoulder } };
  const bodyMat = armed(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.88, metalness: 0 }), U);
  const body = new THREE.Mesh(G.body, bodyMat); body.castShadow = true; body.receiveShadow = true;
  body.customDepthMaterial = armed(new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking }), U);
  body.customDistanceMaterial = armed(new THREE.MeshDistanceMaterial(), U);
  const head = new THREE.Group(); head.position.copy(G.pivot);
  const hm = new THREE.Mesh(G.head, headMat); hm.castShadow = true; head.add(hm);
  torso.add(body, head); g.add(torso);
  const st = { nod: 0, shake: 0, droop: 0, lean: 0, look: 0, t: Math.random() * 10, speak: 0, armF: 0, armS: 0 };
  const goal = { droop: 0, lean: 0, look: 0 };
  let arm = GESTURE.rest, armBeat = 0, armTimer = null;
  g.userData = {
    head, torso, st, goal, name, sculpt: true,
    nod() { st.nod = 1; }, shake() { st.shake = 1; },
    set(k, v) { goal[k] = v; },
    speak(on) { st.speak = on ? 1 : 0; },
    /* a gesture of the right arm, held for secs (0: until the next one) */
    gesture(kind, secs = 0) {
      arm = GESTURE[kind] || GESTURE.rest; armBeat = kind === 'orate' ? 1 : 0;
      clearTimeout(armTimer);
      if (secs) armTimer = setTimeout(() => { arm = GESTURE.rest; armBeat = 0; }, secs * 1000);
    },
    update(dt, t) {
      for (const k in goal) st[k] += (goal[k] - st[k]) * Math.min(1, dt * 2);
      /* the arm eases to its gesture; an orator's arm beats with the phrases */
      const beat = armBeat * (Math.sin(t * 2.3 + st.t) * 0.12 + Math.sin(t * 0.9) * 0.08);
      st.armF += (arm[0] + beat - st.armF) * Math.min(1, dt * 3.2); st.armS += (arm[1] - st.armS) * Math.min(1, dt * 3.2);
      U.uArm.value.set(st.armF, st.armS);
      st.nod = Math.max(0, st.nod - dt * 0.9); st.shake = Math.max(0, st.shake - dt * 0.9);
      const breathe = Math.sin(t * 1.3 + st.t) * 0.008;
      const talk = st.speak ? Math.sin(t * 6.1 + st.t) * 0.035 + Math.sin(t * 1.7) * 0.03 : 0;
      head.rotation.x = st.droop * 0.4 + Math.sin(st.nod * Math.PI * 4) * 0.16 * st.nod + talk - st.lean * 0.08 + breathe;
      head.rotation.y = st.look * 0.8 + Math.sin(st.shake * Math.PI * 5) * 0.26 * st.shake + Math.sin(t * 0.4 + st.t) * 0.05;
      /* the whole body sways a little as it speaks, and leans from the ankles */
      torso.rotation.x = st.droop * 0.06 + st.lean * 0.05;
      torso.rotation.z = st.speak ? Math.sin(t * 1.1 + st.t) * 0.012 : 0;
      torso.position.y = breathe * 0.3;
    },
  };
  return enableActing(g);
}

/* one geometry for the instanced crowd: the light version of a sculpt if
   there is one, painted, with the cloth marked for each person's tint */
export function sculptCrowd(name, o = {}) {
  const lo = MODELS[name + '_crowd'] ? name + '_crowd' : name;
  if (!hasSculpt(lo)) return null;
  const { g } = geometries(lo, Object.assign({ cloth: 0xffffff }, o));
  const geo = g.clone();
  const p = geo.attributes.position, n = p.count, H = o.height || 1.78, mask = new Float32Array(n);
  for (let i = 0; i < n; i++) mask[i] = p.getY(i) > H * 0.835 || p.getY(i) < H * 0.035 ? 0 : 1;
  geo.setAttribute('tintMask', new THREE.BufferAttribute(mask, 1));
  return geo;
}

/* the hand-built figure's description, read as a sculpt: toga-wearers are
   drawn from Cicero's sculpt, Greeks from Archias'. Returns null for the
   kinds no sculpt covers (tunic, stola), which keep their hand-built figure. */
export function asSculpt(o) {
  if (o.kind === 'toga' && hasSculpt('cicero'))
    return ['cicero', { seated: o.seated, cloth: o.cloth || 0xebe4d4, hair: o.hair, skin: o.skin, bald: o.bald, beard: o.beard, height: o.height }];
  if (o.kind === 'greek' && hasSculpt('archias'))
    return ['archias', { seated: o.seated, cloth: o.under || 0xe2d8c2, cloth2: o.cloth || o.himation, hair: o.hair, skin: o.skin, beard: o.beard, height: o.height }];
  return null;
}
