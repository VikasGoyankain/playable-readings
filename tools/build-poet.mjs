/* Builds the 3D "Save the Poet" into one self-contained file,
   ../save-the-poet-3d.html, that opens by double-click with no network.
   The trial itself (text, choices, jury, verdict, reflection) is the game in
   ../save-the-poet.html; this wraps it in the 3D Forum: src/poet/main.js
   listens to the game's "poet" events and directs the scene.
   Usage: node build-poet.mjs */
import fs from 'fs';
import * as esbuild from 'esbuild';
import { BOARD_CSS, BOARD_JS } from './board.mjs';

const BANNER = '/*! Bundled: three.js (c) 2010-2025 three.js authors, MIT License. ' +
  'Scene code, sound and text: original. See LICENSES.md */';
const out = await esbuild.build({
  entryPoints: ['../src/poet/main.js'], bundle: true, minify: true, format: 'iife', target: 'es2020',
  write: false, legalComments: 'eof', nodePaths: ['node_modules'],
});
const js = out.outputFiles[0].text;

const CSS3D = `
/* ---------- the 3D Forum behind the trial ---------- */
body.three{background:#000;overflow:hidden}
#view{position:fixed;inset:0;z-index:0}
#view canvas{display:block;width:100%;height:100%}
#shade{position:fixed;inset:0;z-index:1;pointer-events:none;
 background:linear-gradient(to top,rgba(10,8,6,.7) 0%,rgba(10,8,6,.3) 34%,rgba(10,8,6,0) 56%),linear-gradient(to bottom,rgba(10,8,6,.55) 0%,rgba(10,8,6,0) 20%)}
.err{position:fixed;inset:0;display:grid;place-items:center;padding:2rem;text-align:center;color:#b8ab95;z-index:9}
body.three #title{position:relative;z-index:2;min-height:100vh;background:radial-gradient(ellipse 55% 60% at 50% 50%,rgba(10,8,6,.7),rgba(10,8,6,.2) 80%)}
body.three #title h1{text-shadow:0 2px 30px rgba(0,0,0,.8)}
body.three #court{position:fixed;inset:0;z-index:2;display:flex;flex-direction:column;max-width:none;padding:0 1rem;pointer-events:none}
body.three #court > *{pointer-events:auto}
body.three #bar{position:relative;background:none;max-width:62rem;width:100%;margin:0 auto;text-shadow:0 1px 8px #000}
body.three #jury{max-width:40rem;width:100%;margin:0 auto;gap:.3rem}
body.three .j{background:rgba(24,19,14,.7);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);padding:.25rem .15rem .3rem}
body.three .j svg{max-width:2.4rem}
body.three .j .o{display:none}
body.three .j .n{font-size:.6rem}
body.three #tip{margin:.2rem 0 0;text-shadow:0 1px 6px #000;color:#b8ab95;pointer-events:none}
body.three #murmur{margin:.2rem 0 0;text-shadow:0 1px 8px #000,0 0 3px #000;color:#efe4cc;pointer-events:none}
body.three #stage{margin:auto auto calc(.8rem + env(safe-area-inset-bottom,0px));width:min(60rem,100%);max-height:50vh;overflow-y:auto;
 background:rgba(18,14,10,.86);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border-color:rgba(232,189,106,.25);box-shadow:0 20px 60px rgba(0,0,0,.5)}
body.three #reflect{position:fixed;inset:0;z-index:3;overflow-y:auto;max-width:none;background:rgba(12,10,8,.93);padding:2.4rem max(1.2rem,calc(50% - 22rem)) 4rem}
@media (max-width:760px){body.three #stage{max-height:56vh}body.three #jury{grid-template-columns:repeat(8,1fr)}body.three .j .n{display:none}}

/* ---------- cinema mode: one spoken subtitle at a time, choices when the speaking stops ---------- */
html.cine body.three #stage{position:relative;margin:auto auto calc(1rem + env(safe-area-inset-bottom,0px));width:min(52rem,100%);max-height:none;overflow:visible;
 background:none;border:0;box-shadow:none;padding:0;min-height:0;-webkit-backdrop-filter:none;backdrop-filter:none}
html.cine #lines{display:none}
#cap{margin:0 auto .9rem;max-width:44rem;min-height:1.5em;text-align:center;font-size:clamp(1.1rem,.95rem + .75vw,1.46rem);line-height:1.45;color:#fbf1dc;
 text-shadow:0 2px 14px #000,0 0 4px #000,0 0 1px #000;cursor:pointer;text-wrap:balance}
#cap.in{animation:capIn .35s ease-out}
@keyframes capIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
#cap.nar{font-style:italic;color:#efe4cc}
#cap .who{display:block;margin-bottom:.3rem;font:.66rem/1.4 ui-sans-serif,system-ui,sans-serif;letter-spacing:.22em;text-transform:uppercase;color:var(--gold);font-style:normal}
#cap.gr .who{color:#e08a66}
#cap .la{display:block;margin-top:.4rem;font-size:.74em;font-style:italic;color:var(--gold2)}
body:not(.latin) #cap .la{display:none}
html.cine .skip{position:absolute;right:0;bottom:100%;margin-bottom:.5rem;border:1px solid rgba(232,189,106,.35);background:rgba(18,14,10,.55);color:#e6dccb;border-radius:3px;
 padding:.45rem .75rem;cursor:pointer;font:.62rem/1 ui-sans-serif,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;opacity:0;pointer-events:none;transition:opacity .3s}
html.cine body.speaking .skip{opacity:.85;pointer-events:auto}
html.cine body.three #panel{margin:0;max-height:46vh;overflow-y:auto;background:rgba(18,14,10,.86);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);
 border:1px solid rgba(232,189,106,.25);border-radius:8px;padding:.8rem 1rem;box-shadow:0 20px 60px rgba(0,0,0,.5);transition:opacity .45s,transform .45s}
html.cine #panel:empty{display:none}
html.cine body.three #panel:has(> .go:only-child){background:none;border:0;box-shadow:none;padding:0;-webkit-backdrop-filter:none;backdrop-filter:none}
html.cine #panel .go{margin-top:.4rem}
html.cine body.speaking #panel:not(:has(.tablets)){position:absolute;left:0;right:0;bottom:0;visibility:hidden;opacity:0;transform:translateY(14px);pointer-events:none}
html.cine .choices{display:grid;grid-template-columns:1fr 1fr;gap:.5rem}
html.cine .ch{padding:.65rem .85rem}
html.cine .ch span{font-size:.82rem}
/* the classroom-board switches, moved into the bar during the trial */
.board-corner.inbar{position:static;display:flex;gap:.3rem}
.board-corner.inbar button{border:1px solid var(--line);border-radius:3px;padding:.45rem .6rem;min-height:0;color:var(--soft);font:.62rem/1 ui-sans-serif,system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase}
@media (max-width:760px){.board-corner.inbar{display:none}}
/* the transcript: everything said in this scene, on request */
html.cine body.transcript #lines{display:block;max-height:38vh;overflow-y:auto;text-align:left;background:rgba(18,14,10,.92);border:1px solid rgba(232,189,106,.25);border-radius:8px;padding:1rem 1.2rem;margin-bottom:.6rem}
html.cine body.transcript #lines p{font-size:.95rem;line-height:1.6;margin:0 0 .7rem}
html.cine body.transcript #cap{display:none}
/* the jury: a strip of faces */
html.cine body.three #jury{max-width:25rem;gap:.25rem;margin:.1rem auto 0}
html.cine body.three .j{padding:.15rem .1rem .2rem}
html.cine body.three .j svg{max-width:1.9rem}
html.cine body.three .j .n{display:none}
html.cine body.three .j .lean{height:3px;margin:.2rem .2rem 0}
html.cine #tip:empty{display:none}
/* insights and evidence: a card in the corner */
#toasts{position:fixed;z-index:4;right:1rem;top:4.4rem;display:flex;flex-direction:column;gap:.45rem;max-width:min(21rem,calc(100vw - 2rem));pointer-events:none}
.toast{font:.8rem/1.45 ui-sans-serif,system-ui,sans-serif;color:#f6dea0;background:rgba(24,19,14,.9);border:1px solid rgba(232,189,106,.45);border-radius:6px;padding:.6rem .8rem;
 -webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);opacity:0;transform:translateX(18px);transition:opacity .5s,transform .5s;box-shadow:0 8px 24px rgba(0,0,0,.4)}
.toast.in{opacity:1;transform:none}
.toast b{color:#fbf1dc;font-weight:normal}
@media (max-width:760px){html.cine .choices{grid-template-columns:1fr}#cap{font-size:1.02rem}#toasts{top:auto;bottom:40vh;right:.6rem}}
`;

/* the voices, if they have been made (make-voice-poet.mjs): hash -> seconds */
const VIDX = '../assets/voice-poet/index.json';
const voice = fs.existsSync(VIDX) ? Object.fromEntries(Object.entries(JSON.parse(fs.readFileSync(VIDX, 'utf8'))).map(([k, v]) => [k, v.dur])) : {};
const VOICE_JS = 'window.__VOICE=' + JSON.stringify({ base: process.env.VOICE_BASE || 'assets/voice-poet/', d: voice }) + ';';

let html = fs.readFileSync('../save-the-poet.html', 'utf8');
const need = ['</style>', '<section id="title">', '</body>', '</head>'];
for (const n of need) if (!html.includes(n)) throw new Error('save-the-poet.html has no ' + n);
html = html
  .replace('</style>', () => CSS3D + BOARD_CSS + '</style>')
  .replace('</head>', () => '<script>' + BOARD_JS + VOICE_JS + '</script>\n</head>')
  .replace('<html lang="en">', '<html lang="en" class="cine">')
  .replace('<section id="title">', () => '<div id="view"></div><div id="shade"></div>\n<section id="title">')
  .replace('</body>', () => '<script>' + BANNER + js + '</script>\n</body>')
  .replace('<title>Save the Poet</title>', '<title>Save the Poet</title>');
fs.writeFileSync('../save-the-poet-3d.html', html);
console.log('save-the-poet-3d.html  ' + (html.length / 1048576).toFixed(2) + ' MB   (js ' + (js.length / 1024).toFixed(0) + ' KB, ' + Object.keys(voice).length + ' voiced lines)');
