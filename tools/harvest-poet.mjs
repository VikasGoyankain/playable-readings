/* Collects every line Save the Poet can speak, for make-voice-poet.mjs.
   Most lines are built while the trial runs (names, counts, the order you
   chose), so they are gathered by playing it: many random trials, with and
   without the class votes and the short trial, plus every vote and every
   ending asked for directly. Lines too varied to record in advance (the
   story you told, in your order) simply play as silent subtitles.
   Output: ../assets/voice-poet/lines.json, merged with what is already there.
   Usage: node harvest-poet.mjs [runs]   (default 80) */
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { PATHS, stepIn } from './poet-paths.mjs';

const RUNS = +process.argv[2] || 80;
const OUT = '../assets/voice-poet/lines.json';
const file = pathToFileURL(path.resolve('../save-the-poet.html')).href;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
const lines = new Map((fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : []).map(l => [l.hash, l]));
const before = lines.size;

const b = await puppeteer.launch({ headless: true });
let page, errs = 0;
/* a fresh page for every trial, so one that goes wrong cannot spoil the rest */
async function fresh() {
  if (page) await page.close().catch(() => {});
  page = await b.newPage();
  page.on('pageerror', e => { errs++; console.log('page error: ' + e.message); });
  await page.evaluateOnNewDocument(() => {
    window.__lines = [];
    window.addEventListener('poet', e => { if (e.detail.type === 'line') window.__lines.push(e.detail.data); });
  });
  await page.goto(file);
}
const save = () => fs.writeFileSync(OUT, JSON.stringify([...lines.values()].sort((a, b) => a.hash.localeCompare(b.hash)), null, 1));
/* lines that come out different every time (the story in the order you told it,
   the names of the undecided) are left as silent subtitles */
const ONE_OFF = /^You tell it: |(were|was) still undecided\.$/;
const take = async () => { for (const l of await page.evaluate(() => window.__lines.splice(0))) if (!ONE_OFF.test(l.text) && !lines.has(l.hash)) lines.set(l.hash, { who: l.who, text: l.text, hash: l.hash }); };

/* every vote, and every ending */
await fresh();
await page.evaluate(() => {
  const P = window.__poet, out = [];
  P.jurors.forEach(j => { out.push(P.voteLine(j, true), P.voteLine(j, false)); });
  for (let A = 0; A <= 8; A++) out.push(...P.endingLines(A));
  out.push(...P.storyLines());
  out.forEach(it => window.__lines.push(P.key(it)));
});
await take();


/* the five defences of play-poet.mjs */
for (const [name, steps] of Object.entries(PATHS)) {
  await fresh();
  for (const [kind, arg] of steps) {
    await new Promise(r => setTimeout(r, 20));
    if (await page.evaluate(stepIn, kind, arg) !== true) break;
  }
  await page.waitForFunction(() => window.__ended === true, { timeout: 30000 }).catch(() => console.log(name + ' did not end'));
  await take();
}
save();

/* random trials */
for (let r = 0; r < RUNS; r++) try {
  await fresh();
  const result = await page.evaluate(async (seed) => {
    let x = seed * 9301 + 49297;
    const rnd = () => (x = (x * 16807) % 2147483647) / 2147483647;
    const pick = a => a[Math.floor(rnd() * a.length)];
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const vis = el => el.offsetParent !== null && !el.disabled;
    document.getElementById('optClass').checked = rnd() < 0.3;
    document.getElementById('optShort').checked = rnd() < 0.2;
    document.getElementById('begin').click();
    for (let step = 0; step < 400 && !window.__ended; step++) {
      await wait(5);
      const panel = document.getElementById('panel');
      const vote = panel.querySelector('.vote');
      if (vote) {
        document.getElementById('vAll').value = 30; document.getElementById('vYes').value = Math.floor(rnd() * 31);
        [...panel.querySelectorAll('button')].find(e => /Count the hands/.test(e.textContent)).click(); continue;
      }
      panel.querySelectorAll('.doc').forEach(d => { if (rnd() < 0.6) d.click(); });
      const cards = [...panel.querySelectorAll('.deck .card')].filter(vis);
      const go = [...panel.querySelectorAll('.go button')].filter(e => e.offsetParent !== null);
      if (cards.length && !cards.some(c => c.classList.contains('on')) && go.length) {
        const n = 1 + Math.floor(rnd() * Math.min(6, cards.length));
        for (let i = 0; i < n; i++) pick(cards).click();
        const quiet = go.find(e => /Say nothing/.test(e.textContent));
        const main = go.find(e => e.classList.contains('next') && !e.disabled);
        if (quiet && rnd() < 0.15) quiet.click(); else if (main) main.click(); else if (quiet) quiet.click();
        continue;
      }
      const opts = [...panel.querySelectorAll('.ch, .go .next')].filter(vis);
      if (!opts.length) continue;
      pick(opts).click();
    }
    return window.__ended ? 'ended' : 'stuck';
  }, r + 1);
  const ended = await page.waitForFunction(() => window.__ended === true, { timeout: 30000 }).then(() => true, () => false);
  await take();
  if (!ended) console.log('run ' + r + ' did not reach a verdict (' + result + ')');
  save();
} catch (e) { console.log('run ' + r + ' failed: ' + e.message.split('\n')[0]); }
await b.close();

save();
const all = [...lines.values()];
const words = all.reduce((n, l) => n + l.text.split(' ').length, 0);
console.log(`${all.length} lines (${all.length - before} new), about ${words} words, ${Math.round(words / 150)} minutes spoken${errs ? ', ' + errs + ' page errors' : ''}`);
