/* Plays Save the Poet (text-only) along several paths and reports the verdict,
   so the balance can be tuned and kept honest: Cicero's own choices should win,
   a purely legal defence should be in danger, and a careless one should lose.
   Usage: node play-poet.mjs [path-name] [file]   (default: every path) */
import puppeteer from 'puppeteer';
import path from 'path';
import { pathToFileURL } from 'url';
import { PATHS, stepIn } from './poet-paths.mjs';

const only = process.argv[2] && process.argv[2] !== 'all' ? process.argv[2] : null;
const file = pathToFileURL(path.resolve(process.argv[3] || '../save-the-poet.html')).href;

const b = await puppeteer.launch({ headless: true });
let bad = 0;
for (const [name, steps] of Object.entries(PATHS)) {
  if (only && only !== name) continue;
  const page = await b.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto(file);
  let stopped = false;
  for (const [kind, arg] of steps) {
    await new Promise(r => setTimeout(r, 80));
    const ok = await page.evaluate(stepIn, kind, arg);
    if (ok !== true) {
      const ended = await page.evaluate(() => !!window.__ended || /water has run out/.test(document.getElementById('lines').textContent));
      if (ended && kind === 'b') { stopped = 'ran out of water before: ' + arg; break; }
      console.log(name + ': STOPPED at ' + kind + ' ' + JSON.stringify(arg) + ': ' + ok); bad++; stopped = true; break;
    }
  }
  if (typeof stopped === 'string') await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(e => /jury votes/.test(e.textContent)); if (x) x.click(); });
  await page.waitForFunction(() => { if (window.__poet.busy && window.__poet.busy()) window.__poet.skipAll(); return window.__ended === true; }, { timeout: 30000, polling: 200 }).catch(() => {});
  /* SHOTS=<dir> saves the verdict and the reflection page */
  if (process.env.SHOTS) {
    await page.setViewport({ width: 1280, height: 900 });
    await page.screenshot({ path: path.join(process.env.SHOTS, 'poet-' + name + '-verdict.png'), fullPage: true });
    await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(e => /What happened here/.test(e.textContent)); if (x) x.click(); });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(process.env.SHOTS, 'poet-' + name + '-reflect.png'), fullPage: true });
  }
  const r = await page.evaluate(() => { const S = __poet.state(); return { result: S.result, water: Math.round(S.water), ins: Object.keys(S.ins).length,
    scores: Object.fromEntries(Object.entries(S.jurors).map(([k, v]) => [k, [v.p, v.w, v.a, __poet.score(k)].map(Math.round)])) }; });
  console.log(`${name.padEnd(9)} acquit ${r.result}/8   water left ${r.water}   insights ${r.ins}/12  ${typeof stopped === 'string' ? '(' + stopped + ')' : ''} ${errs.length ? 'ERRORS ' + errs.join(' | ') : ''}`);
  console.log('          p/w/a/score  ' + Object.entries(r.scores).map(([k, v]) => k + ' ' + v.join('/')).join('  '));
  await page.close();
}
await b.close();
if (bad) process.exit(1);
