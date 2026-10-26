/* A quick look at a sculpt without a browser: front, side and back views,
   z-buffered and shaded, written as one PNG. For checking what a downloaded
   model is before it goes into a game.   Usage: node look-model.mjs <file.glb> <out.png> */
import fs from 'fs';
import sharp from 'sharp';
import { NodeIO } from '@gltf-transform/core';

const [file, out] = process.argv.slice(2);
const doc = await new NodeIO().read(file);
const prim = doc.getRoot().listMeshes()[0].listPrimitives()[0];
const P = prim.getAttribute('POSITION').getArray(), I = prim.getIndices() ? prim.getIndices().getArray() : null;
const C = prim.getAttribute('COLOR_0') ? prim.getAttribute('COLOR_0').getArray() : null;
const n = I ? I.length : P.length / 3;
let lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], P[i + k]); hi[k] = Math.max(hi[k], P[i + k]); }
const H = 640, S = (H - 40) / (hi[1] - lo[1]), W = Math.round(H * 0.62);
const views = [[1, 0], [0, 1], [-1, 0]];   /* view direction as (sin, cos) of a turn about y */
const img = Buffer.alloc(W * 3 * H * 3, 24);
views.forEach(([s, c], v) => {
  const zb = new Float32Array(W * H).fill(-1e9);
  const pt = j => { const x = P[j * 3] - (lo[0] + hi[0]) / 2, z = P[j * 3 + 2] - (lo[2] + hi[2]) / 2;
    return [W / 2 + (x * c - z * s) * S, H - 20 - (P[j * 3 + 1] - lo[1]) * S, x * s + z * c]; };
  for (let t = 0; t < n; t += 3) {
    const ia = I ? I[t] : t, ib = I ? I[t + 1] : t + 1, ic = I ? I[t + 2] : t + 2;
    const a = pt(ia), b = pt(ib), d = pt(ic);
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = d[0] - a[0], vy = d[1] - a[1], vz = d[2] - a[2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, nl = Math.hypot(nx, ny, nz) || 1;
    const sh = 0.25 + 0.75 * Math.abs((nx * -0.4 + ny * -0.5 + nz * 0.75) / nl);
    const x0 = Math.max(0, Math.floor(Math.min(a[0], b[0], d[0]))), x1 = Math.min(W - 1, Math.ceil(Math.max(a[0], b[0], d[0])));
    const y0 = Math.max(0, Math.floor(Math.min(a[1], b[1], d[1]))), y1 = Math.min(H - 1, Math.ceil(Math.max(a[1], b[1], d[1])));
    const area = (b[0] - a[0]) * (d[1] - a[1]) - (d[0] - a[0]) * (b[1] - a[1]);
    if (!area) continue;
    const col = C ? [0, 1, 2].map(k => (C[ia * C.length / (P.length / 3) + k] ?? 0.8)) : [0.85, 0.82, 0.76];
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const w0 = ((b[0] - x) * (d[1] - y) - (d[0] - x) * (b[1] - y)) / area, w1 = ((d[0] - x) * (a[1] - y) - (a[0] - x) * (d[1] - y)) / area, w2 = 1 - w0 - w1;
      if (w0 < 0 || w1 < 0 || w2 < 0) continue;
      const z = w0 * a[2] + w1 * b[2] + w2 * d[2], k = y * W + x;
      if (z <= zb[k]) continue;
      zb[k] = z;
      const o = (y * W * 3 + v * W + x) * 3;
      for (let q = 0; q < 3; q++) img[o + q] = Math.min(255, col[q] * sh * 255);
    }
  }
});
await sharp(img, { raw: { width: W * 3, height: H, channels: 3 } }).png().toFile(out);
console.log(out, Math.round(n / 3) + ' triangles', 'height ' + (hi[1] - lo[1]).toFixed(2));
