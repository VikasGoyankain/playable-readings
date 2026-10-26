/* The five defences the Save the Poet harness plays (play-poet.mjs), also
   played by harvest-poet.mjs so that every line on them is voiced. Each step is
   ['b', button text], ['cards', [card titles]] or ['docs'] (read the case file). */
const LAW_BEST = [
  ['cards', ['Testimony of Marcus Lucullus', 'The envoys of Heraclea', 'The record office fire']], ['b', 'Answer'], ['b', 'Continue'],
  ['cards', ['Years in Rome']], ['b', 'Answer'], ['b', 'Continue'],
  ['cards', ['The lists of Metellus', 'Appius and Gabinius']], ['b', 'Answer'], ['b', 'Continue'],
  ['cards', ['On campaign', 'The empty census', 'Lived as a citizen']], ['b', 'Answer'], ['b', 'Continue']];
const OPEN_GOOD = [
  ['b', 'Begin the trial'], ['docs'], ['b', 'Put the papers down'], ['b', 'Tell me everything'], ['b', 'Continue'],
  ['b', 'Rise to speak'], ['b', 'Thank the jury'], ['b', 'Continue'],
  ['cards', ['Born at Antioch', 'Famous young', 'Rome, 102 BC', 'The house of the Luculli', 'Heraclea', '89 BC: before Metellus']], ['b', 'Tell the story'], ['b', 'Continue'],
  ['b', 'Did you arrange'], ['b', 'What became'], ['b', 'Thank the witness'],
  ['b', 'Whisper to Archias'], ['b', 'Ask the clerk'], ['b', 'Let Grattius speak']];
const SPEAK4 = [['b', 'Speak'], ['b', 'Continue'], ['b', 'Continue'], ['b', 'Continue'], ['b', 'Continue'], ['b', 'Continue']];

export const PATHS = {
  /* what Cicero actually did */
  cicero: [...OPEN_GOOD, ...LAW_BEST, ['b', 'Leave the law there'],
    ['b', 'Answer his real question'], ['b', 'Continue'],
    ['cards', ['Through every age', 'Great men honoured poets', 'Alexander at Achilles', "Rome's own glory"]], ...SPEAK4,
    ['b', 'Law and humanity together'], ['b', 'The jury votes']],
  /* a perfect legal case, and nothing else */
  lawyer: [...OPEN_GOOD, ...LAW_BEST, ['b', 'Leave the law there'], ['b', 'Rest your case'], ['b', 'Continue'],
    ['b', 'Only the law'], ['b', 'The jury votes']],
  /* a good student who does not know the speech: sound law, turns to literature, imperfect order */
  decent: [...OPEN_GOOD.slice(0, 3), ['b', 'The law is clear'], ['b', 'Continue'], ...OPEN_GOOD.slice(5),
    ['cards', ['Testimony of Marcus Lucullus', 'The envoys of Heraclea']], ['b', 'Answer'], ['b', 'Continue'],
    ['cards', ['Years in Rome']], ['b', 'Answer'], ['b', 'Continue'],
    ['cards', ['The lists of Metellus']], ['b', 'Answer'], ['b', 'Continue'],
    ['cards', ['The empty census', 'Lived as a citizen']], ['b', 'Answer'], ['b', 'Continue'],
    ['b', 'Leave the law there'], ['b', 'Answer his real question'], ['b', 'Continue'],
    ['cards', ['Poets are sacred', "Sulla", 'Alexander at Achilles', 'Rest for the mind']], ...SPEAK4,
    ['b', 'Only the law'], ['b', 'The jury votes']],
  /* sensible, with ordinary mistakes */
  middling: [['b', 'Begin the trial'], ['docs'], ['b', 'Put the papers down'], ['b', 'The law is clear'], ['b', 'Continue'],
    ['b', 'Rise to speak'], ['b', 'Go straight to the law'], ['b', 'Continue'],
    ['cards', ['Born at Antioch', 'Friend of the great', 'Heraclea', 'Rome, 102 BC', '89 BC: before Metellus']], ['b', 'Tell the story'], ['b', 'Continue'],
    ['b', 'Were you at Heraclea'], ['b', 'Did you arrange'], ['b', 'Thank the witness'], ['b', 'Let Grattius speak'],
    ['cards', ['Testimony of Marcus Lucullus', 'The envoys of Heraclea']], ['b', 'Answer'], ['b', 'Continue'],
    ['cards', ['Years in Rome']], ['b', 'Answer'], ['b', 'Continue'],
    ['cards', ['The lists of Metellus']], ['b', 'Answer'], ['b', 'Continue'],
    ['cards', ['Other cities']], ['b', 'Answer'], ['b', 'Continue'],
    ['b', 'Leave the law there'], ['b', 'Answer his real question'], ['b', 'Continue'],
    ['cards', ["Sulla", 'Poets are sacred', 'Rest for the mind', 'Even Pompey']], ...SPEAK4,
    ['b', 'Only the heart'], ['b', 'The jury votes']],
  /* skips the reading, answers badly, ends on a boast */
  careless: [['b', 'Begin the trial'], ['b', 'Put the papers down'], ['b', 'The law is clear'], ['b', 'Continue'],
    ['b', 'Rise to speak'], ['b', 'Attack the prosecution'], ['b', 'Continue'],
    ['cards', ['Friend of the great', 'The Mithridatic war', 'Born at Antioch', 'Tarentum', 'The Cimbrian poem', 'Heraclea']], ['b', 'Tell the story'], ['b', 'Continue'],
    ['b', 'Do you know Archias'], ['b', 'What do you think of his poetry'], ['b', 'Thank the witness'], ['b', 'Let Grattius speak'],
    ['cards', ['The envoys of Heraclea']], ['b', 'Answer'], ['b', 'Continue'],
    ['b', 'Say nothing'], ['b', 'Continue'], ['b', 'Say nothing'], ['b', 'Continue'], ['b', 'Say nothing'], ['b', 'Continue'],
    ['b', 'Leave the law there'], ['b', 'Pile on more legal points'], ['b', 'Answer his real question'], ['b', 'Continue'],
    ['cards', ["Rome's own glory", "Sulla"]], ['b', 'Speak'], ['b', 'Continue'], ['b', 'Continue'], ['b', 'Continue'],
    ['b', 'Mention your own consulship'], ['b', 'The jury votes']],
};

/* plays one step in the page; returns true, or why it could not */
export function stepIn(kind, arg) {
  /* in cinema mode, skip the speaking as an impatient player would */
  if (window.__poet.busy && window.__poet.busy()) window.__poet.skipAll();
  const vis = el => el.offsetParent !== null && !el.disabled;
  if (kind === 'docs') { document.querySelectorAll('.doc').forEach(d => d.click()); return true; }
  if (kind === 'cards') {
    const cards = [...document.querySelectorAll('#panel .card')].filter(vis);
    for (const t of arg) { const c = cards.find(c => c.querySelector('b').textContent.startsWith(t)); if (!c) return 'no card ' + t; c.click(); }
    return true;
  }
  const btns = [...document.querySelectorAll('button')].filter(vis);
  const x = btns.find(e => e.textContent.replace(/\s+/g, ' ').includes(arg));
  if (!x) return 'no button "' + arg + '"; visible: ' + btns.map(e => e.textContent.trim().slice(0, 28)).join(' | ');
  x.click(); return true;
}
