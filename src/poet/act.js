/* What any figure can be asked to do on stage, sculpted or hand-built:
   walk somewhere (with the rise and fall of a step), turn to face a point,
   and follow someone with its eyes. Added to a figure's userData; the figure's
   own update() still does its nods, droops and speaking. */
import * as THREE from 'three';

const tmp = new THREE.Vector3();
const ease = t => t * t * (3 - 2 * t);
const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));

export function enableActing(g) {
  const u = g.userData, A = { walk: null, face: null, look: null };
  const own = u.update;
  /* walk to (x, z) in secs, then turn to endFace (an angle, or a point {x, z}) */
  u.walkTo = (x, z, secs = 2.5, endFace = null) => {
    const from = g.position.clone(), to = new THREE.Vector3(x, from.y, z);
    if (from.distanceTo(to) < 0.02) { if (endFace != null) u.face(endFace); return; }
    A.walk = { from, to, t: 0, secs, endFace, y: from.y };
    A.face = { to: Math.atan2(x - from.x, z - from.z), speed: 5 };
  };
  /* turn the whole body: to an angle, or toward a point {x, z} or an object */
  u.face = (target, speed = 2.2) => {
    let ry = target;
    if (typeof target !== 'number') { const p = target.isObject3D ? target.getWorldPosition(tmp) : target; ry = Math.atan2(p.x - g.position.x, p.z - g.position.z); }
    A.face = { to: ry, speed };
  };
  /* the head follows someone (an Object3D, or null to look ahead) */
  u.watch = obj => { A.look = obj; if (!obj) u.set('look', 0); };
  u.walking = () => !!A.walk;
  u.update = (dt, t) => {
    own(dt, t);
    if (A.walk) {
      const w = A.walk;
      w.t = Math.min(1, w.t + dt / w.secs);
      g.position.lerpVectors(w.from, w.to, ease(w.t));
      const steps = w.from.distanceTo(w.to) / 0.36, ph = w.t * steps * Math.PI;
      const amp = Math.sin(w.t * Math.PI);                     /* the step: up and down, side to side, settling at the end */
      g.position.y = w.y + Math.abs(Math.sin(ph)) * 0.035 * amp;
      g.rotation.z = Math.sin(ph) * 0.025 * amp;
      if (w.t >= 1) { A.walk = null; g.position.y = w.y; g.rotation.z = 0; if (w.endFace != null) u.face(w.endFace); }
    }
    if (A.face) {
      const d = wrap(A.face.to - g.rotation.y), st = Math.min(Math.abs(d), dt * A.face.speed * (0.3 + Math.min(1, Math.abs(d))));
      g.rotation.y += Math.sign(d) * st;
      if (Math.abs(d) < 0.003) A.face = null;
    }
    if (A.look) {
      const h = A.look.userData && A.look.userData.head ? A.look.userData.head : A.look;
      h.getWorldPosition(tmp);
      u.set('look', Math.max(-1.1, Math.min(1.1, wrap(Math.atan2(tmp.x - g.position.x, tmp.z - g.position.z) - g.rotation.y))));
    }
  };
  if (!u.gesture) u.gesture = () => {};
  return g;
}
