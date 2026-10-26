/* Voices Save the Poet with Kokoro-82M (Apache-2.0), at build time.
   Reads the lines gathered by harvest-poet.mjs (each {who, text, hash}, the
   hash being the game's own FNV-1a of "who|text") and writes one MP3 per line
   to ../assets/voice-poet, with index.json mapping hash -> duration. The game
   loads them beside the page; a line with no recording plays as a subtitle.
   Rerunning only voices what is new or recast.
   Usage: node make-voice-poet.mjs [--force] [--dry] */
import fs from 'fs';
import { KokoroTTS } from 'kokoro-js';
import { repitch, reverb, tremble, normalise, mp3 } from './voice-dsp.mjs';

const OUT = '../assets/voice-poet';
const KBPS = 40;
const FORCE = process.argv.includes('--force');

/* the cast. The Forum is open air: a short slap of stone, never a hall */
const CAST = {
  narrator: { voice: 'bm_george',  speed: 0.95, pitch: 1.00, wet: 0.06, size: 0.45 },
  cicero:   { voice: 'bm_daniel',  speed: 0.96, pitch: 0.98, wet: 0.14, size: 0.62 },
  grattius: { voice: 'am_onyx',    speed: 1.00, pitch: 0.97, wet: 0.14, size: 0.6 },
  quintus:  { voice: 'am_michael', speed: 0.92, pitch: 0.92, wet: 0.18, size: 0.7 },
  archias:  { voice: 'bm_lewis',   speed: 0.86, pitch: 1.03, wet: 0.08, size: 0.45, tremolo: 0.06 },
  lucullus: { voice: 'am_fenrir',  speed: 0.95, pitch: 0.95, wet: 0.16, size: 0.6 },
  clerk:    { voice: 'am_puck',    speed: 1.02, pitch: 1.00, wet: 0.12, size: 0.5 },
};
const WHO = { '': 'narrator', 'Cicero': 'cicero', 'Grattius': 'grattius', 'Quintus, the praetor': 'quintus',
  'Archias': 'archias', 'Archias, whispering': 'archias', 'Marcus Lucullus': 'lucullus', 'The clerk': 'clerk' };

/* how the names are said: Kokoro reads English spelling, so a few Latin and
   Greek names are respelt (the screen keeps the real spelling) */
const SAY = [[/\bArchias\b/g, 'Arkias'], [/\bHeraclea\b/g, 'Herakleea'], [/\bLuculli\b/g, 'Lucullee'], [/\bMetelli\b/g, 'Metellee'],
  [/\bPapius\b/g, 'Pappius'], [/\babsolvo\b/g, 'ab-solvo'], [/\bcondemno\b/g, 'con-demno'], [/\bAufidius\b/g, 'Ow-fiddius'],
  [/\bGnaeus\b/g, 'Nayus'], [/\bTheophanes\b/g, 'Theoffaneez'], [/\bCimbri\b/g, 'Kimbree'], [/\bHortensii\b/g, 'Hortensee'],
  [/\b62 BC\b/g, 'sixty-two B.C.'], [/\b(\d+) BC\b/g, '$1 B.C.'], [/—/g, ', ']];
const spoken = t => SAY.reduce((s, [a, b]) => s.replace(a, b), t);

const lines = JSON.parse(fs.readFileSync(OUT + '/lines.json', 'utf8'));
const idxPath = OUT + '/index.json';
const index = fs.existsSync(idxPath) ? JSON.parse(fs.readFileSync(idxPath, 'utf8')) : {};
/* recordings of lines the game no longer says are removed */
const keep = new Set(lines.map(l => l.hash));
for (const k of Object.keys(index)) if (!keep.has(k)) { delete index[k]; fs.rmSync(OUT + '/' + k + '.mp3', { force: true }); }
fs.writeFileSync(idxPath, JSON.stringify(index, null, 1));
const castOf = l => CAST[WHO[l.who] || 'narrator'];
const sig = l => JSON.stringify([castOf(l), spoken(l.text)]);
const todo = lines.filter(l => FORCE || !index[l.hash] || index[l.hash].sig !== sig(l) || !fs.existsSync(OUT + '/' + l.hash + '.mp3'));
const unknown = [...new Set(lines.map(l => l.who).filter(w => !(w in WHO)))];
if (unknown.length) console.log('no voice cast for: ' + unknown.join(', ') + ' (read by the narrator)');
console.log(`${lines.length} lines, ${todo.length} to voice`);
if (process.argv.includes('--dry')) { for (const l of todo) console.log((WHO[l.who] || 'narrator').padEnd(9) + spoken(l.text)); process.exit(0); }
if (!todo.length) process.exit(0);

const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'q8', device: 'cpu' });
let done = 0;
for (const l of todo) {
  const c = castOf(l);
  const a = await tts.generate(spoken(l.text), { voice: c.voice, speed: c.speed });
  const sr = a.sampling_rate;
  let x = repitch(a.audio, c.pitch);
  x = tremble(x, sr, c.tremolo);
  x = normalise(reverb(x, sr, c.wet, c.size, 0.5));
  const lead = Math.round(0.08 * sr), all = new Float32Array(lead + x.length);
  all.set(x, lead);
  fs.writeFileSync(OUT + '/' + l.hash + '.mp3', mp3(all, sr, KBPS));
  index[l.hash] = { sig: sig(l), dur: +(all.length / sr).toFixed(2), who: WHO[l.who] || 'narrator', text: l.text.slice(0, 70) };
  fs.writeFileSync(idxPath, JSON.stringify(index, null, 1));
  done++;
  console.log(`${String(done).padStart(3)}/${todo.length}  ${index[l.hash].dur.toFixed(1).padStart(5)}s  ${index[l.hash].who.padEnd(9)} ${index[l.hash].text.slice(0, 56)}`);
}
