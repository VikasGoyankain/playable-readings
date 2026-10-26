/* The sound treatment shared by the voice scripts: pitch, a little tremble,
   a room (Freeverb), loudness, and MP3 at a low bitrate for speech. */
import fs from 'fs';
import vm from 'vm';
vm.runInThisContext(fs.readFileSync('node_modules/lamejs/lame.min.js', 'utf8'));
const lamejs = globalThis.lamejs;

export function repitch(x, p) {
  if (p === 1) return x;
  const n = Math.floor(x.length / p), y = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const f = i * p, k = Math.floor(f), a = f - k;
    y[i] = (x[k] || 0) * (1 - a) + (x[k + 1] || 0) * a;
  }
  return y;
}

/* Freeverb, mono: eight damped combs into four allpasses */
export function reverb(x, sr, wet, size, tail) {
  const scale = sr / 44100;
  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617].map(l => Math.round(l * scale));
  const alls = [556, 441, 341, 225].map(l => Math.round(l * scale));
  const fb = 0.70 + 0.28 * size, damp = 0.3;
  const n = x.length + Math.round(tail * sr), y = new Float32Array(n);
  const cb = combs.map(l => ({ b: new Float32Array(l), i: 0, s: 0 }));
  const ab = alls.map(l => ({ b: new Float32Array(l), i: 0 }));
  for (let t = 0; t < n; t++) {
    const inp = (t < x.length ? x[t] : 0) * 0.015;
    let o = 0;
    for (const c of cb) {
      const v = c.b[c.i];
      c.s = v * (1 - damp) + c.s * damp;
      c.b[c.i] = inp + c.s * fb;
      c.i = (c.i + 1) % c.b.length;
      o += v;
    }
    for (const a of ab) {
      const v = a.b[a.i];
      a.b[a.i] = o + v * 0.5;
      a.i = (a.i + 1) % a.b.length;
      o = v - o;
    }
    y[t] = (t < x.length ? x[t] : 0) * (1 - wet * 0.5) + o * wet * 3;
  }
  return y;
}

export function tremble(x, sr, depth) {
  if (!depth) return x;
  const y = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) {
    const t = i / sr;
    y[i] = x[i] * (1 - depth * (0.5 + 0.5 * Math.sin(t * 2 * Math.PI * 5.3 + Math.sin(t * 1.7))));
  }
  return y;
}

export function normalise(x) {
  let peak = 0, sum = 0;
  for (const v of x) { peak = Math.max(peak, Math.abs(v)); sum += v * v; }
  const rms = Math.sqrt(sum / x.length) || 1;
  const g = Math.min(0.1 / rms, 0.92 / (peak || 1));
  return x.map(v => v * g);
}

export function mp3(x, sr, kbps = 48) {
  const enc = new lamejs.Mp3Encoder(1, sr, kbps);
  const pcm = new Int16Array(x.length);
  for (let i = 0; i < x.length; i++) pcm[i] = Math.max(-1, Math.min(1, x[i])) * 32767;
  const parts = [];
  for (let i = 0; i < pcm.length; i += 1152) {
    const b = enc.encodeBuffer(pcm.subarray(i, i + 1152));
    if (b.length) parts.push(Buffer.from(b));
  }
  const e = enc.flush(); if (e.length) parts.push(Buffer.from(e));
  return Buffer.concat(parts);
}

