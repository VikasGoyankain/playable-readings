/* The Roman Forum, a spring morning in 62 BC, and the court that sits in it.
   Everything is built in code: travertine paving, the Temple of Castor, the
   basilica's arcade, the Rostra with its ships' beaks, the praetor's tribunal
   under an awning, the jury benches, the bronze water clock, a crowd, birds,
   and dust in the sun. Named people can nod, shake their heads, droop and
   speak; the camera has a shot for every speaker.  */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { paint, rng, makeSky, makeCrowd, makeRig, part, M, V } from '../im/kit.js';
import { person, crowdGeometry } from './figures.js';
import { sculpted, hasSculpt, sculptCrowd, asSculpt } from './sculpt.js';

/* how each sculpt is painted (see sculpt.js) */
const SCULPT = {
  cicero: { height: 1.78, cloth: 0xece5d6, hair: 0x3a2a1e, skin: 0xc29674 },
  archias: { height: 1.72, cloth: 0xe2d8c2, cloth2: 0x5f6e84, hair: 0xb8b4ac, beard: 0xaeaaa2, skin: 0xb88c66 },
};
import { LOW, look } from './stage.js';

/* ---------------- painted materials ---------------- */
const R = rng(62);
function speck(g, w, h, n, a, dark) {
  for (let i = 0; i < n; i++) {
    g.fillStyle = dark ? `rgba(60,45,30,${a * R()})` : `rgba(${R() < 0.5 ? '70,55,40' : '255,248,235'},${a * R()})`;
    g.fillRect(R() * w, R() * h, 1 + R() * 2.5, 1 + R() * 2);
  }
}
const TX = {
  paving: () => paint(512, 512, (g, w, h) => {
    g.fillStyle = '#a89878'; g.fillRect(0, 0, w, h);
    const rows = 4;
    for (let y = 0; y < rows; y++) {
      let x = -R() * 120;
      while (x < w) {
        const sw = 110 + R() * 140, v = R() * 26 - 13;
        g.fillStyle = `rgb(${198 + v},${184 + v},${150 + v})`;
        g.fillRect(x + 3, y * h / rows + 3, sw - 6, h / rows - 6);
        x += sw;
      }
    }
    speck(g, w, h, 9000, 0.22);
    for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(90,70,45,${0.15 + R() * 0.2})`; g.beginPath(); g.ellipse(R() * w, R() * h, 1 + R() * 3, 0.6 + R() * 1.4, R() * 3, 0, 7); g.fill(); }
  }, [20, 20]),
  travertine: () => paint(256, 256, (g, w, h) => {
    g.fillStyle = '#d8ccae'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 2) { g.fillStyle = `rgba(150,125,90,${0.05 + 0.05 * Math.sin(y * 0.21 + R())})`; g.fillRect(0, y, w, 1); }
    speck(g, w, h, 4000, 0.25);
    g.strokeStyle = 'rgba(120,100,70,.35)'; g.lineWidth = 2;
    for (let y = 0; y < h; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  }, [1, 1]),
  marble: () => paint(256, 512, (g, w, h) => {
    g.fillStyle = '#efe9dc'; g.fillRect(0, 0, w, h);
    /* fluting: soft vertical shading */
    for (let x = 0; x < w; x++) { const f = 0.5 + 0.5 * Math.cos((x / w) * Math.PI * 2 * 12); g.fillStyle = `rgba(110,95,70,${0.16 * f})`; g.fillRect(x, 0, 1, h); }
    g.strokeStyle = 'rgba(150,140,130,.18)'; g.lineWidth = 1;
    for (let i = 0; i < 14; i++) { g.beginPath(); let x = R() * w, y = 0; g.moveTo(x, y); while (y < h) { x += (R() - 0.5) * 16; y += 12; g.lineTo(x, y); } g.stroke(); }
    speck(g, w, h, 1500, 0.12);
  }, [1, 1]),
  wall: () => paint(256, 256, (g, w, h) => {
    g.fillStyle = '#c8b694'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(110,90,60,.45)'; g.lineWidth = 2;
    for (let y = 0; y < h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); const off = (y / 32) % 2 ? 0 : 48; for (let x = off; x < w; x += 96) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 32); g.stroke(); } }
    speck(g, w, h, 3500, 0.22);
  }, [3, 2]),
  roof: () => paint(256, 256, (g, w, h) => {
    g.fillStyle = '#9a4a2c'; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 16) { g.fillStyle = 'rgba(60,20,10,.35)'; g.fillRect(x, 0, 3, h); g.fillStyle = 'rgba(255,180,140,.15)'; g.fillRect(x + 6, 0, 4, h); }
    for (let y = 0; y < h; y += 24) { g.fillStyle = 'rgba(40,15,8,.25)'; g.fillRect(0, y, w, 2); }
    speck(g, w, h, 2000, 0.2);
  }, [6, 3]),
  awning: () => paint(256, 128, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, 0);
    gr.addColorStop(0, '#8e2a1c'); gr.addColorStop(0.5, '#a8402a'); gr.addColorStop(1, '#8e2a1c');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(232,189,106,.8)'; g.fillRect(0, h - 10, w, 4); g.fillRect(0, 6, w, 3);
    for (let x = 0; x < w; x += 4) { g.fillStyle = `rgba(0,0,0,${0.04 + 0.04 * Math.sin(x)})`; g.fillRect(x, 0, 2, h); }
  }, [1, 1]),
  bronze: () => paint(128, 128, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#6a4a22'); gr.addColorStop(0.5, '#a8783a'); gr.addColorStop(1, '#5a3c1a');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(60,120,100,${0.15 * R()})`; g.fillRect(R() * w, R() * h, 3, 3); }
  }, [1, 1]),
  wood: () => paint(256, 64, (g, w, h) => {
    g.fillStyle = '#6a4a2e'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 2) { g.fillStyle = `rgba(30,18,8,${0.1 + 0.15 * Math.abs(Math.sin(y * 0.7 + R()))})`; g.fillRect(0, y, w, 1); }
  }, [1, 1]),
};

/* ---------------- architecture ---------------- */
const std = (map, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ map, roughness: 0.82, metalness: 0 }, o));
function box(w, h, d, m, x, y, z, ry = 0) {
  const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  b.position.set(x, y, z); b.rotation.y = ry; b.castShadow = true; b.receiveShadow = true; return b;
}
/* a column: base, fluted shaft, Corinthian-ish capital; returned as one geometry, about h tall */
function columnGeometry(h, r) {
  const shaft = new THREE.CylinderGeometry(r * 0.88, r, h * 0.84, 20, 1, true);
  shaft.translate(0, h * 0.06 + h * 0.42, 0);
  const base = new THREE.CylinderGeometry(r * 1.25, r * 1.32, h * 0.06, 20); base.translate(0, h * 0.03, 0);
  const torus = new THREE.TorusGeometry(r * 1.08, r * 0.12, 8, 20); torus.rotateX(Math.PI / 2); torus.translate(0, h * 0.065, 0);
  const cap = new THREE.CylinderGeometry(r * 1.32, r * 0.92, h * 0.09, 20); cap.translate(0, h * 0.945, 0);
  const abacus = new THREE.BoxGeometry(r * 2.8, h * 0.025, r * 2.8); abacus.translate(0, h * 0.99, 0);
  const geos = [shaft, base, torus, cap, abacus].map(g => { g = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k); return g; });
  return mergeGeometries(geos);
}
function columns(list, h, r, m) {
  const mesh = new THREE.InstancedMesh(columnGeometry(h, r), m, list.length);
  const m4 = new THREE.Matrix4();
  list.forEach(([x, y, z], i) => mesh.setMatrixAt(i, m4.makeTranslation(x, y, z)));
  mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}
function pediment(w, h, d, m) {
  const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.lineTo(-w / 2, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false });
  g.translate(0, 0, -d / 2);
  const mesh = new THREE.Mesh(g, m); mesh.castShadow = true; mesh.receiveShadow = true; return mesh;
}
/* a temple on a high podium, with a portico of columns at the front */
function temple(o, mats) {
  const g = new THREE.Group();
  const { w, d, ph, ch, cols, deep } = o;
  g.add(box(w, ph, d, mats.trav, 0, ph / 2, 0));
  for (let i = 0; i < 6; i++) g.add(box(w * 0.7, ph / 6, 1.2 + i * 0.0, mats.trav, 0, ph / 12 + i * ph / 6 - ph / 2 + ph / 2, d / 2 + 0.6 + (5 - i) * 0.55));
  const r = Math.min(0.55, (w / cols) * 0.18), list = [];
  for (let i = 0; i < cols; i++) for (let k = 0; k < deep; k++) list.push([-w / 2 + r * 1.6 + i * (w - r * 3.2) / (cols - 1), ph, d / 2 - r * 1.6 - k * 2.6]);
  for (let k = 1; k < 5; k++) for (const s of [-1, 1]) list.push([s * (w / 2 - r * 1.6), ph, d / 2 - r * 1.6 - (deep - 1) * 2.6 - k * 2.6]);
  g.add(columns(list, ch, r, mats.marble));
  g.add(box(w * 0.86, ch * 0.92, d * 0.62, mats.wall, 0, ph + ch * 0.46, -d * 0.16));
  g.add(box(w + 0.4, ch * 0.13, d + 0.3, mats.trav, 0, ph + ch + ch * 0.065, 0));
  const ped = pediment(w + 0.4, ch * 0.28, 0.5, mats.trav); ped.position.set(0, ph + ch * 1.13, d / 2 + 0.05); g.add(ped);
  for (const s of [-1, 1]) {
    const rf = box(w / 2 / Math.cos(0.4) + 0.4, 0.22, d + 0.6, mats.roof, s * w / 4, ph + ch * 1.27, 0);
    rf.rotation.z = -s * 0.4; g.add(rf);
  }
  /* a gilded statue on the gable */
  const st = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), mats.gold); st.position.set(0, ph + ch * 1.45, d / 2); g.add(st);
  g.position.set(o.x, 0, o.z); g.rotation.y = o.ry || 0;
  return g;
}
/* a two-storey arcade: the long front of a basilica */
function arcade(o, mats) {
  const g = new THREE.Group();
  const { n, bay, h } = o, L = n * bay;
  g.add(box(L, 0.5, 8, mats.trav, 0, 0.25, -2));
  for (let s = 0; s < 2; s++) {
    const y0 = 0.5 + s * h;
    for (let i = 0; i <= n; i++) g.add(box(bay * 0.28, h * 0.9, 1.2, mats.trav, -L / 2 + i * bay, y0 + h * 0.45, 0));
    for (let i = 0; i < n; i++) {
      const arch = new THREE.Mesh(new THREE.TorusGeometry(bay * 0.36, 0.22, 6, 14, Math.PI), mats.trav);
      arch.position.set(-L / 2 + (i + 0.5) * bay, y0 + h * 0.62, 0.3); arch.castShadow = true; g.add(arch);
    }
    g.add(box(L + 0.6, h * 0.12, 1.4, mats.trav, 0, y0 + h * 0.96, 0));
  }
  g.add(box(L, h * 1.8, 7, mats.wall, 0, 0.5 + h * 0.9, -4.2));
  const rf = box(L + 1, 0.3, 9, mats.roof, 0, 0.5 + h * 2.1, -2.6); rf.rotation.x = -0.18; g.add(rf);
  g.position.set(o.x, 0, o.z); g.rotation.y = o.ry || 0;
  return g;
}
/* the Rostra: the speakers' platform, its face hung with bronze ships' beaks */
function rostra(o, mats) {
  const g = new THREE.Group();
  g.add(box(10, 3, 5, mats.trav, 0, 1.5, 0));
  g.add(box(10.4, 0.25, 5.4, mats.trav, 0, 3.1, 0));
  for (let i = 0; i < 6; i++) {
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.3, 6), mats.bronze);
    beak.rotation.x = Math.PI / 2; beak.position.set(-3.75 + i * 1.5, 1.8, 2.9); beak.castShadow = true; g.add(beak);
  }
  for (const s of [-1, 1]) {
    const ped = box(1, 1.2, 1, mats.trav, s * 4.2, 3.8, 1.6); g.add(ped);
    const statue = person({ kind: 'toga', cloth: 0x8a6a3a, skin: 0x8a6a3a, hair: 0x6a4a22 });
    statue.traverse(m => { if (m.isMesh) m.material = mats.bronze; });
    statue.position.set(s * 4.2, 4.4, 1.6); statue.scale.setScalar(1.25); g.add(statue);
  }
  g.position.set(o.x, 0, o.z); g.rotation.y = o.ry || 0;
  return g;
}

/* ---------------- gold visions for Act IV ---------------- */
function visionTexture(id) {
  return paint(512, 512, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.strokeStyle = '#ffe2a0'; g.fillStyle = '#ffe2a0'; g.lineWidth = 9; g.shadowColor = '#ffb040'; g.shadowBlur = 18; g.lineCap = 'round'; g.lineJoin = 'round';
    const cx = w / 2, cy = h / 2;
    const glow = () => { const gr = g.createRadialGradient(cx, cy, 10, cx, cy, w / 2); gr.addColorStop(0, 'rgba(255,214,140,.22)'); gr.addColorStop(1, 'rgba(255,214,140,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#ffe2a0'; };
    glow();
    const P = (pts, close) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); if (close) g.closePath(); g.stroke(); };
    const man = (x, y, s, kneel) => { /* a figure in a few strokes */
      g.beginPath(); g.arc(x, y - 92 * s, 16 * s, 0, 7); g.stroke();
      P([[x, y - 76 * s], [x, y - (kneel ? 20 : 10) * s]]);
      P([[x - 34 * s, y - 50 * s], [x, y - 64 * s], [x + 34 * s, y - 46 * s]]);
      if (kneel) P([[x, y - 20 * s], [x + 30 * s, y - 2 * s], [x + 30 * s, y + 20 * s]]), P([[x, y - 20 * s], [x - 26 * s, y + 18 * s]]);
      else P([[x - 20 * s, y + 50 * s], [x, y - 10 * s], [x + 20 * s, y + 50 * s]]);
    };
    if (id === 'rest') { /* an open scroll and a lamp */
      P([[110, 300], [400, 300]]); g.beginPath(); g.ellipse(110, 270, 18, 30, 0, 0, 7); g.stroke(); g.beginPath(); g.ellipse(400, 270, 18, 30, 0, 0, 7); g.stroke();
      for (let y = 250; y < 295; y += 12) P([[150, y], [360, y]]);
      g.beginPath(); g.ellipse(256, 190, 50, 18, 0, 0, 7); g.stroke(); g.beginPath(); g.moveTo(300, 185); g.quadraticCurveTo(330, 120, 312, 100); g.stroke();
    } else if (id === 'ages') { man(170, 320, 1.15); man(350, 330, 0.95); P([[200, 250], [320, 250]]); g.beginPath(); g.arc(260, 250, 30, Math.PI, 0); g.stroke(); }
    else if (id === 'great') { man(190, 330, 1.2); man(330, 330, 1.05); g.beginPath(); g.arc(330, 170, 30, 0.2, Math.PI - 0.2); g.stroke(); P([[300, 200], [300, 160]]); P([[360, 200], [360, 160]]); }
    else if (id === 'alex') { /* the tomb of Achilles: a mound with a helmet, a kneeling king */
      g.beginPath(); g.moveTo(240, 380); g.quadraticCurveTo(360, 220, 470, 380); g.stroke();
      g.beginPath(); g.arc(355, 245, 30, Math.PI, 0); g.stroke(); P([[325, 245], [385, 245]]); P([[355, 215], [355, 180]]);
      man(160, 330, 1.1, true); P([[230, 180], [230, 400]]);
    } else if (id === 'sacred') { /* a lyre among rocks, radiating */
      g.beginPath(); g.moveTo(200, 360); g.quadraticCurveTo(160, 200, 220, 150); g.stroke();
      g.beginPath(); g.moveTo(312, 360); g.quadraticCurveTo(352, 200, 292, 150); g.stroke();
      P([[200, 360], [312, 360]]); P([[210, 170], [302, 170]]);
      for (let i = 0; i < 5; i++) P([[226 + i * 15, 172], [226 + i * 15, 356]]);
      for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; P([[256 + Math.cos(a) * 150, 256 + Math.sin(a) * 150], [256 + Math.cos(a) * 210, 256 + Math.sin(a) * 210]]); }
    } else if (id === 'glory') { /* the eagle standard and a laurel wreath */
      P([[256, 120], [256, 420]]); g.beginPath(); g.moveTo(256, 140); g.quadraticCurveTo(170, 110, 140, 160); g.quadraticCurveTo(200, 150, 256, 175); g.quadraticCurveTo(312, 150, 372, 160); g.quadraticCurveTo(342, 110, 256, 140); g.stroke();
      g.beginPath(); g.arc(256, 300, 90, Math.PI * 0.15, Math.PI * 0.85, true); g.stroke();
      for (let i = 0; i < 9; i++) { const a = Math.PI * 0.15 + i * 0.09 * Math.PI; g.beginPath(); g.ellipse(256 + Math.cos(a) * 90, 300 - Math.sin(a) * -90, 12, 5, a, 0, 7); g.stroke(); }
    } else if (id === 'pompey') { man(256, 260, 1.2); P([[290, 190], [330, 130]]); for (let i = 0; i < 7; i++) man(90 + i * 56, 440, 0.45); }
    else if (id === 'sulla') { /* a scroll tossed away, a coin */
      g.save(); g.translate(200, 260); g.rotate(-0.5); P([[-80, 0], [80, 0]]); g.beginPath(); g.ellipse(-80, -20, 10, 20, 0, 0, 7); g.stroke(); g.restore();
      g.beginPath(); g.arc(340, 300, 40, 0, 7); g.stroke(); g.beginPath(); g.arc(340, 300, 28, 0, 7); g.stroke();
    }
  });
}

/* ---------------- the scene ---------------- */
export function buildForum() {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xd6dee6, 0.0042);
  const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 900);
  const rig = makeRig(camera, look);
  rig.yaw = 0.18; rig.pitch = 0.1;

  const mats = {
    trav: std(TX.travertine()), marble: std(TX.marble(), { roughness: 0.55 }), wall: std(TX.wall()),
    roof: std(TX.roof()), bronze: std(TX.bronze(), { metalness: 0.65, roughness: 0.4 }),
    wood: std(TX.wood()), gold: std(null, { color: 0xd6a648, metalness: 0.9, roughness: 0.3, emissive: 0x3a2808 }),
    awning: std(TX.awning(), { side: THREE.DoubleSide, roughness: 0.95 }),
  };

  /* sky and light: a clear spring morning, the sun low in the east */
  const sky = makeSky({ top: 0x2c5ea8, mid: 0x86b4de, low: 0xdfe5ea, glowDir: V(0.6, 0.35, -0.7), glowCol: 0xfff0c8, glow: 0.6 });
  scene.add(sky.mesh);
  const hemi = new THREE.HemisphereLight(0xbcd4f0, 0x8a7454, 0.6);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffe9c8, 3.4);
  sun.position.set(26, 34, 18); sun.target.position.set(0, 0, -6);
  sun.castShadow = !LOW;
  sun.shadow.mapSize.set(LOW ? 1024 : 2048, LOW ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 120 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target);

  /* the ground */
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), std(TX.paving(), { roughness: 0.92 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const hillMat = new THREE.MeshStandardMaterial({ color: 0x6f7d4e, roughness: 1 });
  for (const [x, z, r, h] of [[-70, -90, 50, 26], [60, -110, 60, 20], [-120, 20, 50, 18]]) {
    const hill = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), hillMat);
    hill.scale.y = h / r; hill.position.set(x, -2, z); scene.add(hill);
  }

  /* the buildings round the court */
  scene.add(temple({ x: 9, z: -27, w: 13, d: 22, ph: 5.5, ch: 9, cols: 8, deep: 2 }, mats));           /* Castor and Pollux */
  scene.add(temple({ x: -15, z: -31, w: 11, d: 18, ph: 4.5, ch: 8, cols: 6, deep: 1, ry: 0.35 }, mats)); /* Saturn */
  const cap = temple({ x: -58, z: -92, w: 14, d: 20, ph: 4, ch: 8, cols: 6, deep: 2, ry: 0.4 }, mats);  /* Jupiter on the Capitol */
  cap.position.y = 20; scene.add(cap);
  scene.add(arcade({ x: -19, z: -6, n: 9, bay: 4.2, h: 5.2, ry: Math.PI / 2 }, mats));                     /* the basilica */
  scene.add(arcade({ x: 20, z: -2, n: 7, bay: 4.2, h: 4.6, ry: -Math.PI / 2 }, mats));
  scene.add(rostra({ x: -7, z: -20, ry: 0.3 }, mats));
  for (const [x, z] of [[-14, 14], [14, 16], [-16, -18], [17, -16]]) {               /* statues on columns */
    scene.add(columns([[x, 0, z]], 6, 0.35, mats.marble));
    const s = sculpted('cicero', { cloth: 0xffffff }) || person({ kind: 'toga' }); s.traverse(m => { if (m.isMesh) m.material = mats.bronze; }); s.position.set(x, 6.1, z); s.scale.setScalar(1.1); scene.add(s);
  }
  for (const [x, z] of [[-34, -50], [-40, -46], [30, -48], [36, -44], [-44, 10]]) {    /* cypresses */
    const c = new THREE.Mesh(new THREE.ConeGeometry(1.4, 11, 8), new THREE.MeshStandardMaterial({ color: 0x2f4a2a, roughness: 1 }));
    c.position.set(x, 5.5, z); c.castShadow = true; scene.add(c);
  }

  /* ---------------- the court ---------------- */
  /* the tribunal: the praetor's raised platform, under a red awning */
  scene.add(box(6.4, 1.2, 3.6, mats.trav, 0, 0.6, -8.8));
  for (let i = 0; i < 2; i++) scene.add(box(2.4, 0.8 - i * 0.4, 0.5, mats.trav, 0, (0.8 - i * 0.4) / 2, -6.75 + i * 0.5));   /* the steps */
  const chair = new THREE.Group();
  chair.add(box(0.9, 0.08, 0.7, mats.gold, 0, 0.62, 0));
  for (const s of [-1, 1]) { const leg = box(0.06, 0.75, 0.06, mats.gold, s * 0.38, 0.3, 0); leg.rotation.z = s * 0.35; chair.add(leg); const leg2 = leg.clone(); leg2.rotation.z = -s * 0.35; chair.add(leg2); }
  chair.position.set(0, 1.2, -9.3); scene.add(chair);
  const awning = new THREE.Mesh(new THREE.PlaneGeometry(8, 5, 12, 6), mats.awning);
  awning.rotation.x = -Math.PI / 2 + 0.08; awning.position.set(0, 5.4, -9); awning.castShadow = true; scene.add(awning);
  for (const [x, z] of [[-3.8, -6.6], [3.8, -6.6], [-3.8, -11.4], [3.8, -11.4]]) scene.add(box(0.14, 5.4, 0.14, mats.wood, x, 2.7, z));
  /* the benches: jury on the right, prosecution on the left, a stool for the accused */
  const jb = [];
  for (let r = 0; r < 2; r++) {
    scene.add(box(1.0, 0.45 + r * 0.45, 6.2, mats.trav, 5.6 + r * 1.1, (0.45 + r * 0.45) / 2, -4.6));
    jb.push(box(0.6, 0.12, 6.0, mats.wood, 5.6 + r * 1.1, 0.5 + r * 0.45, -4.6)); scene.add(jb[r]);
  }
  scene.add(box(0.6, 0.45, 3.6, mats.wood, -5.2, 0.225, -4.2));
  scene.add(box(0.5, 0.48, 0.5, mats.wood, 1.7, 0.24, 0.9));

  /* the water clock: an upper bronze vessel draining into a basin, on a stand */
  const clock = new THREE.Group();
  clock.add(box(0.8, 1.1, 0.8, mats.trav, 0, 0.55, 0));
  const vessel = new THREE.Mesh(new THREE.LatheGeometry([[0.02, 0], [0.28, 0.05], [0.38, 0.3], [0.42, 0.62], [0.44, 0.66]].map(p => new THREE.Vector2(p[0], p[1])), 24), mats.bronze);
  vessel.position.y = 1.45; vessel.material.side = THREE.DoubleSide; clock.add(vessel);
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.22, 0.36, 16), mats.bronze);
  collar.position.y = 1.28; clock.add(collar);
  const waterMat = new THREE.MeshStandardMaterial({ color: 0x7ab8d8, emissive: 0x1a3a50, roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.9 });
  /* the water is its surface: a disc that sinks and narrows with the vessel's own profile */
  const VESSEL = [[0.02, 0], [0.28, 0.05], [0.38, 0.3], [0.42, 0.62], [0.44, 0.66]];
  const water = new THREE.Mesh(new THREE.CylinderGeometry(0.97, 0.97, 0.02, 24), waterMat);
  water.position.y = 1.45; clock.add(water);
  const basin = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [0.32, 0.02], [0.4, 0.18], [0.42, 0.22]].map(p => new THREE.Vector2(p[0], p[1])), 24), mats.bronze);
  basin.position.set(0.5, 0.0, 0.3); basin.material.side = THREE.DoubleSide;
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.3, 6), new THREE.MeshBasicMaterial({ color: 0xa8d0e8, transparent: true, opacity: 0.7 }));
  stream.position.set(0.42, 0.9, 0.22);
  clock.add(basin, stream);
  clock.position.set(-4.6, 0, -7.6); clock.scale.setScalar(0.85); scene.add(clock);
  let waterLevel = 1, waterH = 0.6;

  /* the urn for the verdict, hidden until then */
  const urn = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [0.18, 0.02], [0.28, 0.25], [0.24, 0.55], [0.15, 0.7], [0.18, 0.78]].map(p => new THREE.Vector2(p[0], p[1])), 24), mats.bronze);
  urn.material.side = THREE.DoubleSide; urn.position.set(0, 0, -5.4); urn.visible = false; urn.castShadow = true; scene.add(urn);

  /* ---------------- people ---------------- */
  const P = {};
  /* the user's sculpts stand in for the hand-built figures wherever there is one */
  const add = (key, o, x, z, ry, y = 0) => {
    const as = SCULPT[key] ? [key, SCULPT[key]] : asSculpt(o);
    const p = (as && sculpted(as[0], as[1])) || person(o); p.position.set(x, y, z); p.rotation.y = ry; scene.add(p); P[key] = p; return p; };
  add('cicero', { kind: 'toga', hair: 0x4a3626, skin: 0xc29674 }, 0, 0.2, Math.PI + 0.25);
  if (hasSculpt('archias')) add('archias', {}, 2.1, 0.1, Math.PI + 0.3);
  else add('archias', { kind: 'greek', seated: true, cloth: 0xe6dcc8, himation: 0x5a6a80, hair: 0xb8b4ac, beard: 0xb0aca4, skin: 0xb88c66 }, 1.7, 0.9, Math.PI + 0.35, 0.02);
  add('grattius', { kind: 'toga', hair: 0x141010, skin: 0xc49a78 }, -4.4, -2.6, Math.PI / 2 - 0.2);
  add('quintus', { kind: 'toga', seated: true, border: 0x5a1a4a, hair: 0x5a4030, skin: 0xc49a78 }, 0, -9.3, 0, 1.2);
  /* in the city the lictors wore the toga */
  add('lictor1', { kind: hasSculpt('cicero') ? 'toga' : 'tunic', cloth: hasSculpt('cicero') ? 0xe4dccb : 0x8a3020, hair: 0x2a1e14 }, -2.4, -9.4, 0.15, 1.2);
  add('lictor2', { kind: hasSculpt('cicero') ? 'toga' : 'tunic', cloth: hasSculpt('cicero') ? 0xe4dccb : 0x8a3020, hair: 0x3a2a1e }, 2.4, -9.4, -0.15, 1.2);
  for (const k of ['lictor1', 'lictor2']) {           /* the fasces: rods bound round an axe */
    const f = new THREE.Group();
    f.add(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 10), new THREE.MeshStandardMaterial({ color: 0x8a6a3e, roughness: 0.9 })));
    const ax = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.18, 0.16), new THREE.MeshStandardMaterial({ color: 0xb0b0b0, metalness: 0.8, roughness: 0.3 }));
    ax.position.set(0, 0.62, 0.1); f.add(ax);
    f.position.set(0.32, 1.1, 0.12); P[k].add(f);
  }
  /* the clerk: a Greek freedman, as court scribes often were */
  add('clerk', hasSculpt('archias') ? { kind: 'greek', cloth: 0x7a6a50, under: 0xd8ccb4, hair: 0x2a2018 } : { kind: 'tunic', cloth: 0x7a6a50, hair: 0x2a2018, tablet: true }, 3.6, -6.6, -0.5);
  add('sub1', { kind: 'toga', seated: true, hair: 0x2a1e14 }, -5.2, -4.8, Math.PI / 2, 0.45);
  add('sub2', { kind: 'toga', seated: true, hair: 0x3a2a1e }, -5.2, -3.6, Math.PI / 2, 0.45);
  add('lucullus', { kind: 'toga', clavus: 0x6a1a3a, hair: 0x9a948a, skin: 0xc8a080 }, -1.6, -4.4, 0.4);
  P.lucullus.visible = false;
  const envoys = [];
  [[-2.6, -5.4, 0x8a2a1a], [-3.3, -5.0, 0x7a3a2a], [-1.9, -5.8, 0x6a2a2a]].forEach(([x, z, c], i) => {
    envoys.push(add('envoy' + i, { kind: 'greek', cloth: c, under: 0xe6dcc8, hair: 0x8a8070, beard: 0x8a8070, tablet: i === 0 }, x, z, 0.5));
    envoys[i].visible = false;
  });
  /* the jury: Sempronius, Varro, Titus, Atilius in front; Publius, Gnaeus, Mamilius, Servius behind */
  const JUR = [
    ['sem', { bald: true, hair: 0xd8d4cc, clavus: 0x6a1a3a, skin: 0xc8a080 }], ['var', { hair: 0x4a3a2a, skin: 0xd0a888 }],
    ['tit', { hair: 0x8a8478, skin: 0xa87a54 }], ['ati', { hair: 0x2a2018, clavus: 0x6a1a3a, skin: 0xc49a78 }],
    ['pub', { hair: 0x1a1410, clavus: 0x6a1a3a, skin: 0xc8a080 }], ['gna', { hair: 0x3a2a1e, skin: 0xb88c66 }],
    ['mam', { hair: 0x5a4a3a, bald: true, skin: 0xc49a78 }], ['ser', { hair: 0x6a5040, beard: 0x6a5040, skin: 0xc8a080 }],
  ];
  const jurors = {};
  JUR.forEach(([id, o], i) => {
    const row = i < 4 ? 0 : 1, k = i % 4;
    const p = add('j_' + id, Object.assign({ kind: 'toga', seated: true }, o), 5.6 + row * 1.1, -6.9 + k * 1.5, -Math.PI / 2 + 0.28 - k * 0.05, 0.56 + row * 0.45);
    jurors[id] = p;
  });

  /* the crowd: citizens round the court, more of them as Act IV draws listeners */
  const CAP = LOW ? 120 : 280;
  const kinds = [
    { o: { kind: 'toga' }, n: 0.45 }, { o: { kind: 'tunic', cloth: 0xffffff }, n: 0.35 }, { o: { kind: 'stola', cloth: 0xffffff, shawl: 0xffffff }, n: 0.2 },
  ];
  /* with sculpts, the long-robed crowd (tunic and stola) is drawn from Archias' robe */
  if (hasSculpt('archias')) { kinds.splice(1, 2, { o: { kind: 'greek', cloth: 0xffffff }, n: 0.5 }); kinds[0].n = 0.5; }
  const crowds = kinds.map(k => {
    const as = asSculpt(k.o), sg = as && sculptCrowd(as[0], { hair: 0x2a2018, cloth: 0xffffff, cloth2: 0xffffff });
    return makeCrowd('commoner', Math.ceil(CAP * k.n), { geometry: sg || crowdGeometry(Object.assign({ hair: 0x2a2018 }, k.o)) });
  });
  crowds.forEach(c => scene.add(c.mesh));
  const tints = [0xfaf6ee, 0xe8dcc6, 0xd8c8a8, 0xa8886a, 0x8a5a3a, 0x6a7a8a, 0x9a3a2a, 0x7a8a5a, 0xc8a878];
  const spots = [];
  /* rings behind the court, and along the sides; the later ones fill in during Act IV */
  for (let i = 0; i < CAP * 6 && spots.length < CAP; i++) {
    const a = R() * Math.PI * 2, rad = 9.5 + Math.pow(R(), 0.8) * 8;
    const x = Math.cos(a) * rad * 1.05, z = -4 + Math.sin(a) * rad * 0.85;
    if (z < -12 && Math.abs(x) < 6) continue;                       /* not on the tribunal */
    if (spots.some(([sx, sz]) => (sx - x) ** 2 + (sz - z) ** 2 < 0.45)) continue;
    spots.push([x, z]);
  }
  /* nearest the court first: they are the ones already there; the rest arrive in Act IV */
  spots.sort((a, b) => (a[0] ** 2 + (a[1] + 4) ** 2) - (b[0] ** 2 + (b[1] + 4) ** 2));
  const people = [];
  spots.forEach(([x, z], i) => {
    const c = crowds[i % crowds.length], idx = Math.floor(i / crowds.length);
    if (idx >= c.capacity) return;
    const face = Math.atan2(-x, -(z + 4)) + (R() - 0.5) * 0.5;
    people.push({ c, idx, x, z, face, s: 0.92 + R() * 0.14, on: i < CAP * 0.55, tint: tints[Math.floor(R() * tints.length)] });
  });
  const crowdState = { cheer: 0, away: 0 };
  function layCrowd() {
    for (const p of people) {
      if (p.on) {
        p.c.place(p.idx, p.x, 0, p.z, p.face + crowdState.away * Math.PI, p.s);
        p.c.tint(p.idx, p.tint);
        p.c.phase(p.idx, (p.x * 13.1 + p.z * 7.7) % 1);
      } else p.c.hide(p.idx);
    }
    crowds.forEach(c => c.flush());
  }
  layCrowd();

  /* birds wheeling over the Forum */
  const BN = LOW ? 8 : 18;
  const birds = new THREE.InstancedMesh(new THREE.ConeGeometry(0.08, 0.5, 3), new THREE.MeshBasicMaterial({ color: 0x3a3430 }), BN);
  birds.frustumCulled = false; scene.add(birds);
  const bird = Array.from({ length: BN }, () => ({ r: 14 + R() * 12, h: 16 + R() * 10, sp: 0.15 + R() * 0.12, ph: R() * 7 }));
  /* dust in the sunlight */
  const DN = LOW ? 200 : 600, dpos = new Float32Array(DN * 3);
  for (let i = 0; i < DN; i++) { dpos[i * 3] = (R() - 0.5) * 20; dpos[i * 3 + 1] = R() * 7; dpos[i * 3 + 2] = -12 + R() * 18; }
  const dgeo = new THREE.BufferGeometry(); dgeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
  const dust = new THREE.Points(dgeo, new THREE.PointsMaterial({ color: 0xfff0d0, size: 0.05, transparent: true, opacity: 0.55, depthWrite: false }));
  scene.add(dust);
  /* petals for an acquittal */
  const PN = 400, ppos = new Float32Array(PN * 3), pvel = new Float32Array(PN * 3);
  const pgeo = new THREE.BufferGeometry(); pgeo.setAttribute('position', new THREE.BufferAttribute(ppos, 3));
  const petals = new THREE.Points(pgeo, new THREE.PointsMaterial({ color: 0xffd6a0, size: 0.12, transparent: true, opacity: 0.9, depthWrite: false }));
  petals.visible = false; scene.add(petals);

  /* the visions of Act IV: gold drawings in the sky over the tribunal, and shafts of light */
  const visions = {};
  const vgroup = new THREE.Group(); vgroup.position.set(0, 12.5, -16); vgroup.scale.setScalar(1.35); scene.add(vgroup);
  for (const id of ['rest', 'ages', 'great', 'alex', 'sacred', 'glory', 'pompey', 'sulla']) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshBasicMaterial({ map: visionTexture(id), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    m.userData = { o: 0, goal: 0 };
    vgroup.add(m); visions[id] = m;
  }
  const shafts = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 2.2, 22, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xffe2a0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    s.position.set(-6 + i * 3, 9, -10 + (i % 2) * 2); s.rotation.z = (i - 2) * 0.08; shafts.add(s);
  }
  scene.add(shafts);
  let shaftGoal = 0, shaftNow = 0;

  /* tablets flying to the urn at the verdict */
  const tabs = [];
  const tabTex = { A: paint(64, 64, (g) => { g.fillStyle = '#c8a060'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#3a2a10'; g.font = 'bold 44px Georgia'; g.textAlign = 'center'; g.fillText('A', 32, 48); }),
                   C: paint(64, 64, (g) => { g.fillStyle = '#8a3a2a'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#f2e0c8'; g.font = 'bold 44px Georgia'; g.textAlign = 'center'; g.fillText('C', 32, 48); }) };

  /* ---------------- moods of light ---------------- */
  const MOODS = {
    day: { top: 0x2c5ea8, mid: 0x86b4de, low: 0xdfe5ea, fog: 0xd6dee6, sun: 0xffe9c8, si: 3.4, hemi: 0.6, glow: 0.6 },
    gold: { top: 0x1a1a3a, mid: 0x7a4a5a, low: 0xe8a060, fog: 0x8a6a5a, sun: 0xffb070, si: 2.6, hemi: 0.35, glow: 1.4 },
    grey: { top: 0x4a5260, mid: 0x8a929a, low: 0xb0b4b8, fog: 0xa0a4aa, sun: 0xc8d0dc, si: 1.4, hemi: 0.45, glow: 0.1 },
  };
  const C = k => new THREE.Color(k);
  let moodGoal = MOODS.day;
  function moodStep(dt) {
    const k = Math.min(1, dt * 0.6), g = moodGoal, u = sky.u;
    u.top.value.lerp(C(g.top), k); u.mid.value.lerp(C(g.mid), k); u.low.value.lerp(C(g.low), k);
    u.glow.value += (g.glow - u.glow.value) * k;
    scene.fog.color.lerp(C(g.fog), k);
    sun.color.lerp(C(g.sun), k); sun.intensity += (g.si - sun.intensity) * k; hemi.intensity += (g.hemi - hemi.intensity) * k;
  }

  /* ---------------- shots ---------------- */
  const SHOT = {
    establish: [V(2, 16, 30), V(0, 1.6, -6)],
    wide: [V(0.5, 4.4, 7.2), V(0, 1.2, -6)],
    cicero: [V(-1.5, 2.05, 2.6), V(4.8, 1.5, -4.2)],
    jury: [V(0.4, 1.75, -1.4), V(6.2, 1.45, -4.8)],
    praetor: [V(0.3, 2.3, -3.6), V(0, 2.1, -9.2)],
    grattius: [V(-1.4, 1.85, -0.9), V(-4.4, 1.6, -2.6)],
    witness: [V(0.2, 1.75, -1.3), V(-1.6, 1.6, -4.4)],
    envoys: [V(0.4, 1.8, -1.0), V(-2.6, 1.4, -5.4)],
    archias: [V(0.6, 1.45, 3.0), V(1.7, 1.2, 0.9)],
    clock: [V(-5.5, 3.0, -6.0), V(-4.45, 1.3, -7.75)],
    vision: [V(0.6, 2.2, 2.8), V(0, 10.5, -15)],
    urn: [V(2.4, 1.9, -2.6), V(0.6, 1.0, -5.6)],
    high: [V(-6, 11, 16), V(0, 1, -5)],
  };
  let orbit = 0, orbiting = true;
  rig.set(V(0, 14, 30), V(0, 2, -6));
  function shot(name, dur = 2.4) {
    const s = SHOT[name]; if (!s) return;
    orbiting = false;
    rig.to(s[0], s[1], dur, 'inOut');
  }

  /* ---------------- update ---------------- */
  function update(dt, t) {
    moodStep(dt);
    if (orbiting) {
      orbit += dt * 0.035;
      rig.set(V(Math.sin(orbit) * 30, 13 + Math.sin(orbit * 0.7) * 2, -6 + Math.cos(orbit) * 30), V(0, 2, -7));
    }
    rig.update(dt);
    for (const k in P) if (P[k].userData.update) P[k].userData.update(dt, t);
    crowds.forEach(c => { c.uTime.value = t * (1 + crowdState.cheer * 3); });
    /* the awning breathes in the wind */
    const ap = awning.geometry.attributes.position;
    for (let i = 0; i < ap.count; i++) { const x = ap.getX(i), y = ap.getY(i); ap.setZ(i, Math.sin(x * 0.9 + t * 1.6) * 0.06 + Math.sin(y * 1.3 + t * 1.1) * 0.05); }
    ap.needsUpdate = true;
    /* the water clock drains toward the time left */
    const lv = Math.max(0.03, waterLevel);
    waterH = THREE.MathUtils.lerp(waterH, 0.6 * lv, Math.min(1, dt * 2));
    let r = VESSEL[0][0];
    for (let i = 1; i < VESSEL.length; i++) if (waterH <= VESSEL[i][1]) { const [r0, y0] = VESSEL[i - 1], [r1, y1] = VESSEL[i]; r = r0 + (r1 - r0) * (waterH - y0) / (y1 - y0); break; }
    water.scale.set(r, 1, r);
    water.position.y = 1.45 + waterH;
    stream.visible = waterLevel > 0.01;
    stream.material.opacity = 0.5 + 0.2 * Math.sin(t * 20);
    /* birds */
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
    bird.forEach((b, i) => {
      const a = t * b.sp + b.ph;
      q.setFromEuler(new THREE.Euler(Math.PI / 2, 0, -a - Math.PI / 2 + Math.sin(t * 6 + i) * 0.3));
      m4.compose(V(Math.cos(a) * b.r, b.h + Math.sin(t * 0.7 + i) * 1.5, -10 + Math.sin(a) * b.r), q, V(1, 1, 1));
      birds.setMatrixAt(i, m4);
    });
    birds.instanceMatrix.needsUpdate = true;
    /* dust drifts */
    const dp = dgeo.attributes.position;
    for (let i = 0; i < DN; i++) { let y = dp.getY(i) + dt * 0.08; if (y > 7) y = 0; dp.setY(i, y); dp.setX(i, dp.getX(i) + Math.sin(t * 0.3 + i) * dt * 0.05); }
    dp.needsUpdate = true;
    /* visions and light */
    for (const id in visions) {
      const v = visions[id], u = v.userData;
      u.o += (u.goal - u.o) * Math.min(1, dt * 1.2);
      v.material.opacity = u.o;
      v.position.y = Math.sin(t * 0.4) * 0.3; v.scale.setScalar(0.92 + u.o * 0.1);
      v.lookAt(camera.position);
    }
    shaftNow += (shaftGoal - shaftNow) * Math.min(1, dt * 0.8);
    shafts.children.forEach((s, i) => { s.material.opacity = shaftNow * (0.06 + 0.04 * Math.sin(t * 0.7 + i)); });
    /* tablets */
    for (const tb of tabs) {
      tb.k = Math.min(1, tb.k + dt * 0.9);
      const e = tb.k < 0.5 ? 2 * tb.k * tb.k : 1 - Math.pow(-2 * tb.k + 2, 2) / 2;
      tb.m.position.lerpVectors(tb.from, tb.to, e); tb.m.position.y += Math.sin(e * Math.PI) * 1.4;
      tb.m.rotation.y += dt * 4; tb.m.visible = tb.k < 1;
    }
    /* petals */
    if (petals.visible) {
      const pp = pgeo.attributes.position;
      for (let i = 0; i < PN; i++) {
        let y = pp.getY(i) - dt * (0.6 + (i % 7) * 0.08);
        if (y < 0) y = 12;
        pp.setY(i, y); pp.setX(i, pp.getX(i) + Math.sin(t * 1.5 + i) * dt * 0.4);
      }
      pp.needsUpdate = true;
    }
  }

  /* ---------------- staging: what the words ask the people to do ---------------- */
  const later = [];
  const after = (s, fn) => later.push(setTimeout(fn, s * 1000));
  const U = k => P[k].userData;
  const HOME = {};
  for (const k of ['grattius', 'archias', 'cicero', 'lucullus']) HOME[k] = [P[k].position.x, P[k].position.z, P[k].rotation.y];
  /* everyone who matters turns their eyes to whoever speaks */
  const LISTEN = ['cicero', 'archias', 'grattius', 'quintus', 'lucullus', 'sub1', 'sub2', 'clerk', 'lictor1', 'lictor2'];
  function attend(key) {
    const s = P[key]; if (!s) return;
    for (const k of LISTEN) if (k !== key && P[k] && !U(k).walking()) U(k).watch(s);
    for (const id in jurors) jurors[id].userData.watch(s);
  }
  const CUES = {
    start() {
      later.forEach(clearTimeout); later.length = 0;
      for (const k in HOME) { P[k].position.set(HOME[k][0], 0, HOME[k][1]); P[k].rotation.y = HOME[k][2]; U(k).set('droop', 0); U(k).set('lean', 0); U(k).gesture('rest'); }
    },
    /* "Archias, by your side, does not look up." */
    downcast() { U('archias').set('droop', 0.75); U('archias').watch(null); },
    /* "The court is in session." */
    session() { U('quintus').gesture('raise', 2.6); attend('quintus'); },
    /* Grattius steps out to accuse, and points at the man */
    accuse() {
      U('grattius').walkTo(-2.4, -1.2, 2.4, P.archias);
      after(2.5, () => U('grattius').gesture('point', 0));
      after(1.5, () => { U('archias').set('droop', 0.85); });
    },
    /* he goes back to his bench; the room turns to Cicero */
    rise() {
      U('grattius').gesture('rest');
      U('grattius').walkTo(HOME.grattius[0], HOME.grattius[1], 2.4, P.cicero);
      U('cicero').face({ x: 2.5, z: -6.5 }, 1.2);
      attend('cicero');
    },
    witness() {
      const L = P.lucullus; L.visible = true; L.position.set(-3.8, 0, 2.2);
      U('lucullus').walkTo(HOME.lucullus[0], HOME.lucullus[1], 3.6, P.cicero);
      attend('lucullus');
    },
    envoys() {
      envoys.forEach((e, i) => { const x = e.position.x, z = e.position.z; e.visible = true; e.position.set(x - 4, 0, z + 1.5); e.userData.walkTo(x, z, 3.2 + i * 0.3, P.quintus); });
      after(3.8, () => envoys[0].userData.gesture('offer', 2.5));
    },
    /* the turn: the room sags, and each juror shows it his own way */
    restless() {
      jurors.var && (jurors.var.userData.set('droop', -0.7), jurors.var.userData.watch(null));
      jurors.pub && jurors.pub.userData.watch(jurors.gna);
      jurors.tit && (jurors.tit.userData.set('droop', 0.3), jurors.tit.userData.watch(null));
    },
    /* "Heads come up along the benches." */
    headsUp() { for (const id in jurors) { jurors[id].userData.set('droop', 0); jurors[id].userData.set('lean', 0.6); } attend('cicero'); },
    won() { U('archias').set('droop', -0.1); U('archias').face(P.cicero); U('archias').watch(P.cicero); U('cicero').face(P.archias); U('cicero').watch(P.archias); },
    lost() { U('archias').set('droop', 0.8); U('archias').watch(null); U('cicero').set('droop', 0.4); },
    /* "He gathers his scrolls slowly." Then he walks away through the crowd */
    leave() { after(2, () => U('archias').walkTo(6.5, 9, 11, null)); U('cicero').watch(P.archias); },
  };

  /* ---------------- what the game can ask of the scene ---------------- */
  return {
    scene, camera, update, rig, people: P, jurors, shot,
    cue(name) { if (CUES[name]) CUES[name](); },
    attend,
    gesture(key, kind, secs) { if (P[key]) U(key).gesture(kind, secs); },
    orbit(on) { orbiting = on; },
    mood(name) { moodGoal = MOODS[name] || MOODS.day; },
    speak(key, secs = 4) {
      if (!P[key]) return;
      P[key].userData.speak(true);
      setTimeout(() => { P[key].userData.speak(false); }, secs * 1000);
    },
    react(id, delta, j) {
      const p = jurors[id]; if (!p) return;
      if (delta > 1.5) p.userData.nod(); else if (delta < -1.5) p.userData.shake();
      p.userData.set('droop', j.a < 30 ? 1 : j.a < 50 ? 0.35 : 0);
      p.userData.set('lean', j.w > 60 ? 1 : j.w < 38 ? -0.6 : 0);
    },
    water(f) { waterLevel = f; },
    showWitness() { P.lucullus.visible = true; },
    showEnvoys() { envoys.forEach(e => { e.visible = true; }); P.lucullus.visible = false; },
    vision(id) { for (const k in visions) visions[k].userData.goal = k === id ? 0.95 : 0; shaftGoal = id ? 1 : 0; },
    crowdGrow() { people.forEach(p => { p.on = true; }); layCrowd(); },
    urn(on) { urn.visible = on; },
    tablet(id, acquit) {
      const j = jurors[id]; if (!j) return;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34), new THREE.MeshBasicMaterial({ map: tabTex[acquit ? 'A' : 'C'], side: THREE.DoubleSide }));
      const from = j.position.clone().add(V(0, 1.4, 0)); m.position.copy(from); scene.add(m);
      tabs.push({ m, from, to: V(0, 1.0, -5.4), k: 0 });
      j.userData.nod();
    },
    ending(won, big) {
      if (won) {
        petals.visible = big;
        if (big) for (let i = 0; i < PN; i++) { ppos[i * 3] = (R() - 0.5) * 18; ppos[i * 3 + 1] = R() * 12; ppos[i * 3 + 2] = -10 + R() * 16; }
        crowdState.cheer = big ? 1 : 0.4;
        P.archias.userData.set('droop', 0); P.archias.userData.set('lean', 1);
      } else {
        crowdState.away = 0; P.archias.userData.set('droop', 1);
      }
    },
    sun,
  };
}

/* ---------------- the prologue: Cicero's study at night ---------------- */
export function buildStudy() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0806);
  scene.fog = new THREE.Fog(0x0a0806, 4, 12);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.05, 60);
  const rig = makeRig(camera, look);
  rig.yaw = 0.12; rig.pitch = 0.06;
  const plaster = std(paint(256, 256, (g, w, h) => { g.fillStyle = '#7a5a3e'; g.fillRect(0, 0, w, h); speck(g, w, h, 5000, 0.2); g.fillStyle = 'rgba(120,40,30,.5)'; g.fillRect(0, h * 0.62, w, h * 0.38); g.fillStyle = 'rgba(232,189,106,.4)'; g.fillRect(0, h * 0.6, w, 4); }, [3, 1]));
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), std(TX.paving(), { roughness: 0.9 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(12, 5), plaster); back.position.set(0, 2.5, -3); back.receiveShadow = true; scene.add(back);
  const side = new THREE.Mesh(new THREE.PlaneGeometry(12, 5), plaster); side.rotation.y = Math.PI / 2; side.position.set(-3, 2.5, 0); scene.add(side);
  /* a window onto the night: moon and roofs */
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.4), new THREE.MeshBasicMaterial({ map: paint(128, 160, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0a1430'); gr.addColorStop(1, '#2a3a5a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(R() * w, R() * h * 0.6, 1, 1); }
    g.fillStyle = '#f2ecd8'; g.beginPath(); g.arc(90, 40, 12, 0, 7); g.fill();
    g.fillStyle = '#0a0a12'; for (let x = 0; x < w; x += 22) g.fillRect(x, h - 30 - R() * 20, 20, 60);
  }) }));
  win.position.set(1.4, 2.4, -2.98); scene.add(win);
  const wood = std(TX.wood());
  const table = new THREE.Group();
  table.add(box(1.8, 0.08, 0.9, wood, 0, 0.78, 0));
  for (const [x, z] of [[-0.8, -0.38], [0.8, -0.38], [-0.8, 0.38], [0.8, 0.38]]) table.add(box(0.07, 0.78, 0.07, wood, x, 0.39, z));
  for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.42, 10), std(null, { color: 0xe6d6ae })); s.rotation.z = Math.PI / 2; s.rotation.y = R() * 0.6; s.position.set(-0.6 + R() * 0.8, 0.86, -0.25 + R() * 0.4); table.add(s); }
  table.position.set(0, 0, -1); scene.add(table);
  /* shelves of scrolls */
  for (let r = 0; r < 4; r++) {
    scene.add(box(2.4, 0.05, 0.4, wood, -1.2, 0.6 + r * 0.55, -2.75));
    for (let i = 0; i < 14; i++) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.34, 8), std(null, { color: [0xd8c8a0, 0xc8b088, 0xb89870][i % 3] })); s.rotation.x = Math.PI / 2; s.position.set(-2.3 + i * 0.16, 0.68 + r * 0.55, -2.68); scene.add(s); }
  }
  /* the lamp */
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), std(TX.bronze(), { metalness: 0.6, roughness: 0.4 })); lamp.scale.set(1.6, 0.6, 1); lamp.position.set(0.4, 0.86, -0.9); scene.add(lamp);
  const fl = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffc070 })); fl.scale.set(1, 2, 1); fl.position.set(0.5, 0.95, -0.9); scene.add(fl);
  const light = new THREE.PointLight(0xffb060, 5, 7, 1.6); light.position.set(0.5, 1.05, -0.9); light.castShadow = !LOW; scene.add(light);
  scene.add(new THREE.AmbientLight(0x2a3050, 0.6));
  const moon = new THREE.DirectionalLight(0x8090c0, 0.4); moon.position.set(2, 3, -4); scene.add(moon);
  /* a low warm fill from the viewer's side, so faces read and the lamp stays the key */
  const fill = new THREE.PointLight(0xc08050, 1.6, 9, 1.4); fill.position.set(-1.8, 1.8, 2.2); scene.add(fill);
  /* the right-hand wall, with the door Archias knocks at */
  const DOOR_Z = -1.7, DOOR_W = 0.95, DOOR_H = 2.2, WX = 2.8;
  scene.add(box(0.12, 5, 3 + DOOR_Z - DOOR_W / 2, plaster, WX, 2.5, (-3 + DOOR_Z - DOOR_W / 2) / 2));
  scene.add(box(0.12, 5, 6 - (DOOR_Z + DOOR_W / 2), plaster, WX, 2.5, (6 + DOOR_Z + DOOR_W / 2) / 2));
  scene.add(box(0.12, 5 - DOOR_H, DOOR_W, plaster, WX, DOOR_H + (5 - DOOR_H) / 2, DOOR_Z));
  for (const s of [-1, 1]) scene.add(box(0.2, DOOR_H, 0.08, wood, WX - 0.02, DOOR_H / 2, DOOR_Z + s * DOOR_W / 2));    /* the jambs */
  const hinge = new THREE.Group(); hinge.position.set(WX - 0.04, 0, DOOR_Z - DOOR_W / 2); scene.add(hinge);   /* hinged on the far side, so it opens away from him */
  const door = box(0.06, DOOR_H - 0.04, DOOR_W - 0.04, wood, 0, (DOOR_H - 0.04) / 2, (DOOR_W - 0.04) / 2); door.castShadow = true; hinge.add(door);
  /* beyond the door: a moonlit passage, seen only when it opens */
  const out = new THREE.PointLight(0x7088c0, 0, 6, 1.5); out.position.set(WX + 1.2, 1.6, DOOR_Z); scene.add(out);
  scene.add(box(0.1, 5, 3, std(null, { color: 0x1a1a24 }), WX + 1.8, 2.5, DOOR_Z));
  const outFloor = new THREE.Mesh(new THREE.PlaneGeometry(2, 3), std(TX.paving(), { roughness: 0.9 })); outFloor.rotation.x = -Math.PI / 2; outFloor.position.set(WX + 1, 0.002, DOOR_Z); scene.add(outFloor);
  let doorGoal = 0, doorAng = 0;

  const archias = sculpted('archias', SCULPT.archias) || person({ kind: 'greek', cloth: 0xe6dcc8, himation: 0x5a6a80, hair: 0xb8b4ac, beard: 0xb0aca4, skin: 0xb88c66, scroll: true });
  scene.add(archias);
  const cicero = sculpted('cicero', SCULPT.cicero) || person({ kind: 'toga', seated: true, hair: 0x4a3626, skin: 0xc29674 });
  scene.add(cicero);
  /* the case of papers: clutched to Archias' chest, then laid on the table */
  const leather = std(null, { color: 0x4a2c18, roughness: 0.7 });
  const caseFile = new THREE.Group();
  caseFile.add(box(0.36, 0.09, 0.26, leather, 0, 0, 0));
  caseFile.add(box(0.37, 0.095, 0.03, std(null, { color: 0x2a180c }), 0, 0, 0.05));
  caseFile.traverse(m => { if (m.isMesh) m.castShadow = true; });
  const onTable = () => { scene.attach(caseFile); caseFile.position.set(0.25, 0.865, -0.85); caseFile.rotation.set(0, 0.25, 0); };
  const atChest = () => { archias.add(caseFile); caseFile.position.set(0, 1.12, 0.2); caseFile.rotation.set(-1.2, 0, 0); };
  const reading = Math.atan2(0.3, -0.8);   /* Cicero's face turned down to the scrolls on the table */
  const later = [];
  const after = (s, fn) => later.push(setTimeout(fn, s * 1000));
  function reset() {
    later.forEach(clearTimeout); later.length = 0;
    archias.position.set(WX + 0.9, 0, DOOR_Z); archias.rotation.y = -Math.PI / 2; archias.userData.watch(null);
    cicero.position.set(-0.5, 0, -0.2); cicero.rotation.y = reading; cicero.userData.set('droop', 0.55); cicero.userData.watch(null);
    atChest(); doorGoal = 0;
  }
  reset();
  rig.set(V(-1.6, 1.5, 2.4), V(0.4, 1.1, -0.8));
  let push = 0;
  /* what the words of the prologue ask the room to do */
  const CUES = {
    start: reset,
    enter() {
      doorGoal = -1.35;
      after(0.7, () => archias.userData.walkTo(1.15, -0.55, 3.2, cicero));
      after(0.3, () => { cicero.userData.set('droop', 0); cicero.userData.face(archias, 1.2); cicero.userData.watch(archias); });
      after(4.2, () => { doorGoal = -0.25; });
    },
    lay() {
      archias.userData.walkTo(0.55, -0.45, 1.3, { x: 0.25, z: -0.85 });
      after(1.4, () => { archias.userData.set('lean', 1.4); archias.userData.set('droop', 0.5); archias.userData.gesture('offer', 1.6); });
      after(2.2, onTable);
      after(3.0, () => { archias.userData.set('lean', 0); archias.userData.set('droop', 0.15); archias.userData.walkTo(1.0, -0.35, 1.2, cicero); });
      after(1.0, () => { cicero.userData.watch(caseFile); });
      after(4.0, () => { cicero.userData.watch(archias); });
    },
    plead() { archias.userData.face(cicero); archias.userData.set('lean', 1); archias.userData.set('droop', -0.25); archias.userData.gesture('plead', 4); },
    grateful() {
      cicero.userData.walkTo(0.05, -0.25, 1.3, archias);
      after(1.2, () => { cicero.userData.gesture('offer', 2.5); archias.userData.set('lean', 0); archias.userData.set('droop', 0); archias.userData.nod(); });
    },
    hasty() { cicero.userData.face(reading); cicero.userData.watch(caseFile); cicero.userData.set('droop', -0.2); archias.userData.set('lean', 0); archias.userData.set('droop', 0.45); },
    listen() { cicero.userData.face(archias); cicero.userData.set('lean', 0.8); archias.userData.set('lean', 0); archias.userData.set('droop', 0); after(4, () => cicero.userData.nod()); after(9, () => cicero.userData.nod()); },
  };
  return {
    scene, camera, rig, people: { archias, cicero },
    update(dt, t) {
      push += dt;
      rig.set(V(-1.6 + push * 0.02, 1.5, 2.4 - Math.min(push * 0.03, 1.1)), V(0.4, 1.15, -0.8));
      rig.update(dt);
      const k = 0.85 + 0.15 * Math.sin(t * 13) * Math.sin(t * 7.3);
      fl.scale.set(k, 2 * k, k); light.intensity = 4.2 + k;
      doorAng += (doorGoal - doorAng) * Math.min(1, dt * 2.2); hinge.rotation.y = doorAng; out.intensity = Math.min(1, -doorAng) * 2.2;
      archias.userData.update(dt, t); cicero.userData.update(dt, t);
    },
    cue(name) { if (CUES[name]) CUES[name](); },
    speak(key, secs = 4) {
      const p = key === 'archias' ? archias : key === 'cicero' ? cicero : null; if (!p) return;
      const other = p === archias ? cicero : archias;
      p.userData.speak(true); setTimeout(() => p.userData.speak(false), secs * 1000);
      if (!p.userData.walking()) p.userData.watch(other);
      if (!other.userData.walking()) other.userData.watch(p);
    },
  };
}
