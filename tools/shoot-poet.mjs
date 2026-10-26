/* Stills of the 3D "Save the Poet". Each shot is set up through the game's own
   events, then the scene clock is stepped by hand (window.__freeze/__advance),
   so every frame shows the exact moment named however slow the renderer is.
   Usage: node shoot-poet.mjs [outDir] [names...] */
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(process.argv[2] || here);
const only = process.argv.slice(3);
fs.mkdirSync(out, { recursive: true });
const b = await puppeteer.launch({ headless: true, protocolTimeout: 900000,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--mute-audio'] });
const page = await b.newPage();
await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
const errs = [];
page.on('pageerror', e => errs.push(e.message));
page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto(pathToFileURL(path.join(here, '../save-the-poet-3d.html')).href, { waitUntil: 'load', timeout: 120000 });
await page.waitForFunction('window.__frames > 2', { timeout: 120000 });
await page.evaluate(() => { window.__freeze = true; window.__advance = 0; window.__noBack = true; });
const step = async secs => {
  await page.evaluate(s => { window.__advance = s; }, secs);
  await page.waitForFunction('!(window.__advance > 0.001)', { timeout: 600000, polling: 100 });
};
const fire = (type, data) => page.evaluate((type, data) => window.dispatchEvent(new CustomEvent('poet', { detail: { type, data } })), type, data);
const hideUI = on => page.evaluate(on => { for (const e of document.querySelectorAll('#title, #court, #reflect, #shade, #toasts, .board-corner')) e.style.visibility = on ? 'hidden' : ''; }, on);
const shot = async (name, setup, secs = 3, ui = false) => {
  if (only.length && !only.includes(name)) return;
  await setup();
  await step(secs);
  await hideUI(!ui);
  await page.screenshot({ path: path.join(out, 'p3-' + name + '.png') });
  await hideUI(false);
  console.log('p3-' + name + '.png   frames so far ' + await page.evaluate('window.__frames'));
};

await shot('title', async () => {}, 4, true);
await shot('study', async () => { await fire('act', 'The night before'); }, 3);
/* the staging: the words of a line, acted */
const line = (text, who = '') => fire('line', { text, who, dur: 4 });
await shot('enter', async () => { await fire('act', 'The night before'); await step(1); await line('A knock. Archias comes in'); }, 2.6);
await shot('lay', async () => { await step(2); await line('He lays the case file on your table.'); }, 2.4);
await shot('plead', async () => { await step(2); await line('Well? Can you save me?', 'Archias'); }, 1.8);
await shot('establish', async () => { await fire('act', 'The Forum, morning'); }, 1.2);
await shot('wide', async () => {}, 7);
await shot('grattius', async () => { await fire('act', 'The Forum, morning'); await step(1); await fire('say', 'Grattius'); }, 2.6);
await shot('accuse', async () => { await page.evaluate(() => window.__poet3d.forum.shot('wide', 0.1)); await line('Judges, this man is a Syrian: a Greek who sings for his supper.', 'Grattius'); }, 3.2);
await shot('orate', async () => { await line('The water clock is turned for you.'); await step(2.5); await page.evaluate(() => window.__poet3d.forum.shot('cicero', 0.1)); await line('If I have any talent, judges', 'Cicero'); }, 1.6);
await shot('gest', async () => {
  await page.evaluate(() => { const f = window.__poet3d.forum; f.shot('archias', 0.1); const p = f.camera.position.clone().set(0.6, 1.7, -4.2), q = p.clone().set(0.2, 1.1, 0.2); f.rig.set(p, q); f.rig.snap && f.rig.snap(); f.gesture('cicero', 'raise', 0); f.gesture('grattius', 'point', 0); f.gesture('archias', 'plead', 0); });
}, 2);
await shot('cicero', async () => { await page.evaluate(() => window.__poet3d.forum.shot('cicero', 0.1)); }, 1);
await shot('jury', async () => {
  await page.evaluate(() => { const f = window.__poet3d.forum; f.shot('jury', 0.1); const J = { sem: 70, var: 20, tit: 40, ati: 80, pub: 25, gna: 60, mam: 60, ser: 70 };
    for (const id in J) f.react(id, id === 'var' ? -3 : 3, { a: J[id], w: J[id] }); });
}, 1.2);
await shot('praetor', async () => { await page.evaluate(() => window.__poet3d.forum.shot('praetor', 0.1)); }, 1);
await shot('witness', async () => { await fire('witness'); }, 3);
await shot('clock', async () => { await fire('water', 0.35); await page.evaluate(() => window.__poet3d.forum.shot('clock', 0.1)); }, 2);
await shot('vision', async () => { await fire('act', 'The defence of literature'); await fire('argument', 'alex'); await page.evaluate(() => window.__poet3d.forum.shot('vision', 0.1)); }, 3);
await shot('urn', async () => { await fire('act', 'The urn'); for (const id of ['sem', 'var', 'tit']) await fire('vote', { id, acquit: id !== 'var' }); }, 3.2);
await shot('ending', async () => { await fire('ending', 8); }, 6);
console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no page errors');
await b.close();
