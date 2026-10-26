/* All sound is made in the browser, so nothing is fetched: the murmur of the
   Forum, the drip of the water clock, a lyre for Archias, a bell for each
   insight, and the click of wax tablets in the urn. */
let ac = null, master, crowdGain, crowdFilter, dripT = 0, on = true;

export function startAudio() {
  if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
  try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
  master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
  /* the crowd: brown noise, band-passed to the range of voices, slowly breathing */
  const len = ac.sampleRate * 4, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
  const src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
  crowdFilter = ac.createBiquadFilter(); crowdFilter.type = 'bandpass'; crowdFilter.frequency.value = 420; crowdFilter.Q.value = 0.7;
  crowdGain = ac.createGain(); crowdGain.gain.value = 0;
  src.connect(crowdFilter).connect(crowdGain).connect(master); src.start();
}
export function setSound(v) { on = v; if (master) master.gain.setTargetAtTime(v ? 0.9 : 0, ac.currentTime, 0.2); }
export function soundOn() { return on; }

let crowdLevel = 0, ducked = false;
export function crowd(level) {
  crowdLevel = level;
  if (!ac) return;
  crowdGain.gain.setTargetAtTime(level * 0.22 * (ducked ? 0.4 : 1), ac.currentTime, 1.2);
}
/* the crowd hushes while someone speaks */
export function duck(on) {
  ducked = on;
  if (ac) crowdGain.gain.setTargetAtTime(crowdLevel * 0.22 * (on ? 0.4 : 1), ac.currentTime, on ? 0.25 : 1.0);
}

/* a plucked string (Karplus-Strong in a buffer) */
function pluck(freq, when = 0, vol = 0.25, decay = 0.996) {
  if (!ac) return;
  const sr = ac.sampleRate, n = Math.floor(sr * 2.4), buf = ac.createBuffer(1, n, sr), d = buf.getChannelData(0);
  const p = Math.max(2, Math.round(sr / freq)), ring = new Float32Array(p);
  for (let i = 0; i < p; i++) ring[i] = Math.random() * 2 - 1;
  for (let i = 0, k = 0; i < n; i++, k = (k + 1) % p) { const nx = (k + 1) % p; ring[k] = (ring[k] + ring[nx]) * 0.5 * decay; d[i] = ring[k]; }
  const s = ac.createBufferSource(); s.buffer = buf;
  const g = ac.createGain(); g.gain.value = vol;
  s.connect(g).connect(master); s.start(ac.currentTime + when);
}
/* the lyre: a few notes of a Dorian-ish scale */
const SCALE = [293.7, 329.6, 349.2, 392, 440, 493.9, 523.3, 587.3];
export function lyre(motif = 'open') {
  const M = {
    open: [[0, 0], [2, 0.35], [4, 0.7], [3, 1.2], [4, 1.5], [7, 2.0]],
    vision: [[4, 0], [5, 0.25], [7, 0.5], [6, 1.0]],
    win: [[0, 0], [2, 0.2], [4, 0.4], [7, 0.6], [4, 1.0], [7, 1.3], [7, 1.31]],
    lose: [[4, 0], [3, 0.5], [2, 1.0], [0, 1.6]],
  }[motif] || [];
  M.forEach(([n, t]) => pluck(SCALE[n], t, 0.22));
}
export function chime() { if (!ac) return; pluck(880, 0, 0.12, 0.998); pluck(1318.5, 0.08, 0.08, 0.998); }
export function tablet(acquit) {
  if (!ac) return;
  const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
  o.type = 'triangle'; o.frequency.setValueAtTime(acquit ? 520 : 140, t); o.frequency.exponentialRampToValueAtTime(acquit ? 480 : 90, t + 0.3);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
  o.connect(g).connect(master); o.start(t); o.stop(t + 0.6);
}
/* the water clock: a drip, more often as the time runs out */
export function drip(dt, level) {
  if (!ac || level <= 0) return;
  dripT -= dt;
  if (dripT > 0) return;
  dripT = 0.5 + level * 1.8;
  const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(1300 + Math.random() * 200, t); o.frequency.exponentialRampToValueAtTime(500, t + 0.08);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05 + (1 - level) * 0.08, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
  o.connect(g).connect(master); o.start(t); o.stop(t + 0.15);
}
/* three knocks on a wooden door: short low thuds of filtered noise */
export function knock() {
  if (!ac) return;
  for (let k = 0; k < 3; k++) {
    const t = ac.currentTime + k * 0.32 + (k === 2 ? 0.06 : 0);
    const n = Math.floor(ac.sampleRate * 0.12), buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ac.sampleRate * 0.018));
    const s = ac.createBufferSource(); s.buffer = buf;
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 420; f.Q.value = 3;
    const g = ac.createGain(); g.gain.value = 1.4;
    s.connect(f).connect(g).connect(master); s.start(t);
  }
}
/* the creak of a door on its hinge */
export function creak() {
  if (!ac) return;
  const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter();
  o.type = 'sawtooth'; o.frequency.setValueAtTime(150, t); o.frequency.linearRampToValueAtTime(110, t + 0.9);
  f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 6;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 0.15); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.0);
  o.connect(f).connect(g).connect(master); o.start(t); o.stop(t + 1.1);
}
