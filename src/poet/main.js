/* The director of "Save the Poet" in 3D. The trial itself is the game in
   save-the-poet.html; it announces what happens ("poet" events) and this file
   turns each event into a shot, a gesture, a sound or a vision in the Forum. */
import { show, setPost, snapPost, setLook, onFrame } from './stage.js';
import { buildForum, buildStudy } from './forum.js';
import { startAudio, crowd, lyre, chime, tablet, drip, setSound, soundOn, duck, knock, creak } from './audio.js';

const forum = buildForum();
const study = buildStudy();
show(forum);
snapPost('fade', 1);
setPost('fade', 0.25, 0.5);
setPost('exposure', 0.92);       /* the Forum turns slowly behind the title */
document.body.classList.add('three');

let where = 'title', level = 1, back = null, scene = forum;
function goTo(s) { if (scene !== s) { scene = s; show(s); } }
function cut(name, dur, then, after) {
  if (back) { clearTimeout(back); back = null; }
  forum.shot(name, dur);
  if (then && !window.__noBack) back = setTimeout(() => { back = null; forum.shot(then, 2.6); }, after || (then === 'cicero' ? 5200 : 4200));
}
const WHO = { 'Quintus, the praetor': 'quintus', 'Grattius': 'grattius', 'Cicero': 'cicero', 'Marcus Lucullus': 'lucullus', 'The clerk': 'clerk', 'Archias': 'archias', 'Archias, whispering': 'archias' };
const SHOT_FOR = { quintus: 'praetor', grattius: 'grattius', lucullus: 'witness', clerk: 'praetor', archias: 'archias' };

/* the voices: one MP3 per line beside the page (built by tools/make-voice-poet.mjs).
   window.__VOICE = {base, d: {hash: seconds}} is written into the page by the build. */
const VOICE = window.__VOICE || null;
let vEl = null, lineDur = 0;
window.__voice = (line, done) => {
  const dur = VOICE && VOICE.d[line.hash];
  if (!dur) return 0;
  if (!vEl) vEl = new Audio();
  let called = false;
  const end = () => { if (called) return; called = true; duck(false); done(); };
  vEl.onended = end;
  vEl.onerror = () => setTimeout(end, dur * 1000);
  vEl.muted = !soundOn();
  vEl.src = VOICE.base + line.hash + '.mp3';
  const p = vEl.play();
  if (p && p.catch) p.catch(() => setTimeout(end, dur * 1000));
  duck(true);
  return dur;
};
window.__voiceStop = () => { if (vEl) { vEl.onended = vEl.onerror = null; vEl.pause(); } duck(false); };

/* stage business: what the words of a line ask the people to do. Matched
   against each line as it is spoken (or skipped), and each choice as made. */
const STAGE = [
  [/^A knock\./, () => { knock(); setTimeout(creak, 900); study.cue('enter'); }],
  [/^He lays the case file/, () => study.cue('lay')],
  [/^Well\? Can you save me/, () => study.cue('plead')],
  [/Archias, by your side, does not look up/, () => forum.cue('downcast')],
  [/^The court is in session/, () => forum.cue('session')],
  [/^Judges, this man is a Syrian/, () => forum.cue('accuse')],
  [/^The water clock is turned for you/, () => forum.cue('rise')],
  [/^You call your first witness/, () => forum.cue('witness')],
  [/^Three envoys from Heraclea/, () => forum.cue('envoys')],
  [/Varro is checking the sun/, () => forum.cue('restless')],
  [/^Heads come up along the benches/, () => forum.cue('headsUp')],
  [/^He gathers his scrolls slowly/, () => forum.cue('leave')],
];
const CHOICES = [
  [/You taught me everything/, () => study.cue('grateful')],
  [/The law is clear/, () => study.cue('hasty')],
  [/Tell me everything/, () => study.cue('listen')],
  [/Attack the prosecution/, () => { forum.people.cicero.userData.face(forum.people.grattius); forum.gesture('cicero', 'point', 4); }],
  [/Mention your own consulship/, () => { forum.people.cicero.userData.set('droop', -0.35); setTimeout(() => forum.people.cicero.userData.set('droop', 0), 6000); }],
];
const stage = text => { for (const [re, fn] of STAGE) if (re.test(text)) fn(); };
/* how each speaker's arm moves with his words */
function gestureFor(key, text, secs) {
  if (scene !== forum) return;
  if (key === 'cicero') forum.gesture('cicero', 'orate', secs);
  else if (key === 'grattius') forum.gesture('grattius', /this man|Syrian|little Greek|his name|He never|show/.test(text) ? 'point' : 'orate', secs);
  else if (key === 'quintus') forum.gesture('quintus', /absolvo|condemno/.test(text) ? 'offer' : 'raise', Math.min(secs, 2.4));
  else if (key === 'lucullus') forum.gesture('lucullus', 'orate', secs);
  else if (key === 'archias') forum.gesture('archias', 'plead', secs);
}

const handlers = {
  line(l) {
    lineDur = l.dur || 0; stage(l.text);
    const key = WHO[l.who];
    if (key) { gestureFor(key, l.text, Math.max(1.5, lineDur)); if (scene === forum) forum.attend(key); }
  },
  skipline(l) { stage(l.text); },
  choice(text) { for (const [re, fn] of CHOICES) if (re.test(text)) fn(); },
  begin() {
    startAudio(); crowd(0.35); lyre('open');
    where = 'begin';
    corner(true);
  },
  act(name) {
    if (name === 'The night before') {
      goTo(study); study.cue('start'); snapPost('fade', 1); setPost('fade', 0, 0.6); setPost('exposure', 1.15); crowd(0);
      return;
    }
    if (name === 'The Forum, morning') {
      goTo(forum); forum.cue('start'); snapPost('fade', 1); setPost('fade', 0, 0.5); setPost('exposure', 1.0);
      crowd(0.4);
      forum.shot('establish', 0.05);
      setTimeout(() => forum.shot('wide', 7), 200);
      return;
    }
    goTo(forum); setPost('fade', 0);
    if (name === 'The story of a life') cut('cicero', 2.4);
    else if (name === 'The turn') { setPost('gold', 0); cut('jury', 2.6); setTimeout(() => cut('clock', 2.4, 'cicero'), 4200); }
    else if (name === 'The defence of literature') { forum.crowdGrow(); crowd(0.6); forum.mood('gold'); setPost('gold', 0.1); lyre('vision'); cut('vision', 3.2, 'cicero'); }
    else if (name === 'Your last words') { forum.vision(null); forum.mood('day'); setPost('gold', 0); cut('cicero', 2.4); }
    else if (name === 'The urn') { forum.vision(null); forum.mood('day'); setPost('gold', 0); forum.urn(true); setPost('dim', 0.18); crowd(0.15); cut('urn', 2.8); }
  },
  say(who) {
    const key = WHO[who]; if (!key) return;
    if (scene === study && key === 'archias') { study.speak(key, 5); return; }
    goTo(forum);
    forum.speak(key, Math.max(2, lineDur || (key === 'grattius' ? 7 : 5)));
    if (key === 'cicero') return;
    cut(SHOT_FOR[key] || 'wide', 2.2, 'cicero', lineDur ? lineDur * 1000 + 700 : 0);
  },
  witness() { cut('witness', 2.6); },
  envoys() { forum.showEnvoys(); cut('envoys', 2.4, 'cicero'); },
  jury(d) {
    if (scene !== forum) return;
    let moved = 0;
    for (const id in d.deltas) { forum.react(id, d.deltas[id], d.jurors[id]); if (Math.abs(d.deltas[id]) > 1.5) moved++; }
    if (moved >= 3 && !back && where !== 'title') cut('jury', 2.0, 'cicero');
  },
  water(f) { level = f; forum.water(f); },
  insight() { chime(); },
  argument(id) {
    forum.vision(id); forum.mood('gold'); setPost('gold', 0.25); lyre('vision');
    forum.speak('cicero', 8);
    cut('vision', 2.6, 'cicero', 9000);
  },
  vote(v) { forum.tablet(v.id, v.acquit); tablet(v.acquit); },
  ending(A) {
    const won = A >= 4, big = A >= 7;
    forum.ending(won, big); forum.cue(won ? 'won' : 'lost');
    setPost('dim', won ? 0 : 0.5); setPost('gold', big ? 0.12 : 0); forum.mood(won ? 'day' : 'grey');
    crowd(won ? (big ? 1 : 0.5) : 0.1); lyre(won ? 'win' : 'lose');
    cut('high', 6);
  },
  reflection() { setPost('fade', 0.7, 0.8); crowd(0.1); },
};
window.addEventListener('poet', e => { const h = handlers[e.detail.type]; if (h) h(e.detail.data); });

/* the head follows the pointer a little, as in the other games */
window.addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse') return;
  setLook((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
});
onFrame(dt => { if (scene === forum) drip(dt, where === 'title' ? 0 : level); });

/* the classroom-board switches live in the top corner on the title, and in
   the bar during the trial, where the corner holds the name of the act */
function corner(inBar) {
  const c = document.querySelector('.board-corner'), bar = document.getElementById('bar');
  if (!c || !bar) return;
  if (inBar) bar.insertBefore(c, document.getElementById('insBtn')); else document.body.appendChild(c);
  c.classList.toggle('inbar', inBar);
}

/* a sound switch in the bar */
const bar = document.getElementById('bar');
if (bar) {
  const b = document.createElement('button'); b.type = 'button'; b.className = 'tog'; b.textContent = 'Sound on';
  b.addEventListener('click', () => { setSound(!soundOn()); if (vEl) vEl.muted = !soundOn(); b.textContent = soundOn() ? 'Sound on' : 'Sound off'; });
  bar.insertBefore(b, document.getElementById('insBtn'));
}
/* the "Try again" buttons return to the title, where the Forum turns again */
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('button');
  if (!t) return;
  if (/Try (the trial )?again/.test(t.textContent)) {
    where = 'title'; corner(false); goTo(forum); forum.cue('start'); forum.orbit(true); forum.urn(false); forum.vision(null);
    setPost('dim', 0); setPost('gold', 0); setPost('fade', 0.25); crowd(0.2);
  }
});
window.__poet3d = { forum, study };
