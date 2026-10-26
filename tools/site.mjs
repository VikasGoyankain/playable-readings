/* Everything the published site needs to know about itself: where it lives,
   what each page is called, and the <head> tags (description, canonical,
   share preview, icon, structured data) that go with it.

   If the site moves, change SITE here and run `node package.mjs`. */

/* the public address of dist/, with a trailing slash */
export const SITE = 'https://vikasgoyankain.github.io/playable-readings/';
/* the whole published site as one zip: GitHub makes it from the gh-pages branch */
export const ZIP = 'https://github.com/VikasGoyankain/playable-readings/archive/refs/heads/gh-pages.zip';
export const SITE_NAME = 'Playable Readings';
export const TAGLINE = 'Feel Kafka. Don’t just read him.';
export const AUTHOR = 'Vikas Goyanka';
export const AUTHOR_LINE = 'Vikas Goyanka, LLB26057, National Law University, Delhi';
export const PROFESSOR = 'Prof. (Dr.) Prasannanshu';

/* the tab icon: a lit gateway. Inlined as a data URI so every page keeps its
   icon even when it is copied somewhere on its own. */
export const ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="13" fill="#0a090b"/><path d="M21 55V28a11 11 0 0 1 22 0v27z" fill="#ffd690" fill-opacity=".55"/><path d="M17 55V28a15 15 0 0 1 30 0v27" fill="none" stroke="#e8bd6a" stroke-width="4.5" stroke-linecap="round"/></svg>';
const ICON_URI = 'data:image/svg+xml,' + encodeURIComponent(ICON_SVG);

const WHO = { '@type': 'Person', name: AUTHOR, affiliation: { '@type': 'CollegeOrUniversity', name: 'National Law University, Delhi' } };
const kafka = (title, de, year) => ({ '@type': 'CreativeWork', name: title, alternateName: de, datePublished: String(year), inLanguage: 'de', author: { '@type': 'Person', name: 'Franz Kafka' } });
const game = (file, name, mins, desc, about, teaches = 'Close reading and interpretation of Franz Kafka’s parable, experienced first-hand', image = file.startsWith('before') ? 'og-before-the-law.jpg' : 'og-imperial-message.jpg') => ({
  '@type': ['VideoGame', 'LearningResource'],
  '@id': SITE + file + '#game',
  name, url: SITE + file, description: desc, inLanguage: 'en',
  author: WHO, isAccessibleForFree: true, isBasedOn: about, about,
  genre: ['Interactive fiction', 'Educational game'], gamePlatform: 'Web browser', applicationCategory: 'Game',
  operatingSystem: 'Any', playMode: 'SinglePlayer', timeRequired: 'PT' + mins + 'M',
  learningResourceType: 'Interactive game', educationalUse: ['Classroom activity', 'Discussion', 'Self study'],
  educationalLevel: ['Senior secondary', 'Undergraduate'], audience: { '@type': 'EducationalAudience', educationalRole: ['student', 'teacher'] },
  teaches, image: SITE + image,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
});

const BTL_DESC = 'Play Kafka’s “Before the Law” from the inside: you are the man from the country, the gate stands open, and every choice costs years. A free, narrated 3D game for the classroom, about fifteen minutes.';
const IM_DESC = 'Play Kafka’s “An Imperial Message”: carry a dying Emperor’s message through a palace that never ends, then wait at your window for it to arrive. A free, narrated 3D game for the classroom, about twelve minutes.';
const BTL = game('before-the-law.html', 'Before the Law', 15, BTL_DESC, kafka('Before the Law', 'Vor dem Gesetz', 1915));
const IM = game('imperial-message.html', 'An Imperial Message', 12, IM_DESC, kafka('An Imperial Message', 'Eine kaiserliche Botschaft', 1917));
const POET_DESC = 'Play Cicero’s Pro Archia: you are Cicero, defending your old teacher, the Greek poet Archias, before eight Roman jurors and a water clock. Win the law, then win the room. A free, voiced 3D courtroom game, about twenty minutes.';
const PRO_ARCHIA = { '@type': 'CreativeWork', name: 'Pro Archia Poeta', alternateName: 'For the Poet Archias', dateCreated: '-0061', inLanguage: 'la', author: { '@type': 'Person', name: 'Marcus Tullius Cicero' } };
const POET = game('save-the-poet.html', 'Save the Poet', 20, POET_DESC, PRO_ARCHIA, 'Classical rhetoric and the structure of a legal speech, through Cicero’s defence of Archias (62 BC), played first-hand', 'og-save-the-poet.jpg');

/* one entry per published page */
export const PAGES = {
  'index.html': {
    path: '', priority: '1.0', image: 'og-image.jpg',
    title: 'Playable Readings: Kafka’s parables and Cicero’s Pro Archia, as games',
    desc: 'Play the readings instead of memorising them: three free games, Kafka’s Before the Law and An Imperial Message, and Cicero’s Pro Archia as Save the Poet. They run in any browser, on a laptop, phone or classroom board, with nothing to install. Made at National Law University, Delhi.',
    alt: 'Playable Readings: feel the text, don’t just read it. Before the Law, An Imperial Message and Save the Poet as games.',
    ld: [
      { '@type': 'WebSite', '@id': SITE + '#site', name: SITE_NAME, alternateName: 'Playable Kafka', url: SITE, inLanguage: 'en',
        description: 'Works of literature turned into games, so that students feel a text before they discuss it.', author: WHO },
      BTL, IM, POET,
    ],
  },
  'for-teachers.html': {
    path: 'for-teachers.html', priority: '0.9', image: 'og-image.jpg',
    title: 'For teachers: let your students feel Kafka before they discuss him',
    desc: 'How to use two free Kafka games in one class period: a ready lesson plan, discussion questions, and notes for running them on a classroom board or on student laptops. No sign-up, no installation, works offline.',
    alt: 'For teachers: a lesson plan for two playable Kafka parables.',
    ld: [{ '@type': 'Article', headline: 'For teachers: let your students feel Kafka before they discuss him', url: SITE + 'for-teachers.html',
      inLanguage: 'en', author: WHO, isAccessibleForFree: true, about: [{ '@id': BTL['@id'] }, { '@id': IM['@id'] }],
      audience: { '@type': 'EducationalAudience', educationalRole: 'teacher' } }],
  },
  'acknowledgements.html': {
    path: 'acknowledgements.html', priority: '0.5', image: 'og-acknowledgements.jpg',
    title: 'Acknowledgements: Prof. (Dr.) Prasannanshu, the teacher these games were made for',
    desc: 'These games were made in honour of Prof. (Dr.) Prasannanshu of National Law University, Delhi: what his teaching gave his students, his scholarship, his books and where to find him.',
    alt: 'Acknowledgements: a portrait of Prof. (Dr.) Prasannanshu in a ring of gold light.',
    ld: [{ '@type': 'AboutPage', name: 'Acknowledgements', url: SITE + 'acknowledgements.html', inLanguage: 'en', author: WHO, isPartOf: { '@id': SITE + '#site' },
      about: { '@type': 'Person', name: 'Prasannanshu', honorificPrefix: 'Prof. (Dr.)', jobTitle: 'Professor', worksFor: { '@type': 'CollegeOrUniversity', name: 'National Law University, Delhi' } } }],
  },
  'before-the-law.html': {
    path: 'before-the-law.html', priority: '0.9', image: 'og-before-the-law.jpg',
    title: 'Before the Law, playable: Kafka’s parable as a 3D game',
    desc: BTL_DESC, alt: 'Before the Law: a lit gateway, a doorkeeper, and a man waiting.', ld: [BTL],
  },
  'before-the-law-text.html': {
    path: 'before-the-law-text.html', priority: '0.6', image: 'og-before-the-law.jpg',
    title: 'Before the Law, text-only: Kafka’s parable as interactive fiction',
    desc: 'The text-only version of the playable “Before the Law”: the same choices and the same years, without 3D or narration. It runs on any device, however old.',
    alt: 'Before the Law: a lit gateway, a doorkeeper, and a man waiting.',
    ld: [{ ...BTL, '@id': SITE + 'before-the-law-text.html#game', url: SITE + 'before-the-law-text.html', name: 'Before the Law (text-only)' }],
  },
  'imperial-message.html': {
    path: 'imperial-message.html', priority: '0.9', image: 'og-imperial-message.jpg',
    title: 'An Imperial Message, playable: Kafka’s parable as a 3D game',
    desc: IM_DESC, alt: 'An Imperial Message: a messenger at the centre of endless rings, and a distant window.', ld: [IM],
  },
  'save-the-poet.html': {
    path: 'save-the-poet.html', priority: '0.9', image: 'og-save-the-poet.jpg',
    title: 'Save the Poet: Cicero’s Pro Archia as a playable 3D trial',
    desc: POET_DESC, alt: 'Save the Poet: a laurel, the court’s water clock, and the wax tablets of the verdict.', ld: [POET],
  },
  'save-the-poet-text.html': {
    path: 'save-the-poet-text.html', priority: '0.6', image: 'og-save-the-poet.jpg',
    title: 'Save the Poet, text-only: Cicero’s Pro Archia as interactive fiction',
    desc: 'The text-only version of Save the Poet: the same trial, jury, water clock and verdict, without 3D or voices. It runs on any device, however old.',
    alt: 'Save the Poet: a laurel, the court’s water clock, and the wax tablets of the verdict.',
    ld: [{ ...POET, '@id': SITE + 'save-the-poet-text.html#game', url: SITE + 'save-the-poet-text.html', name: 'Save the Poet (text-only)' }],
  },
  'save-the-poet-about.html': {
    path: 'save-the-poet-about.html', priority: '0.7', image: 'og-save-the-poet.jpg',
    title: 'About Save the Poet: Cicero, Archias and the making of the game',
    desc: 'Background to Save the Poet: Cicero’s Pro Archia and the trial of 62 BC, what each part of the game stands for, how it was made, and what in it is original and what is invented.',
    alt: 'Save the Poet: a laurel, the court’s water clock, and the wax tablets of the verdict.',
    ld: [{ '@type': 'AboutPage', name: 'About Save the Poet', url: SITE + 'save-the-poet-about.html', inLanguage: 'en', author: WHO, isPartOf: { '@id': SITE + '#site' }, about: [{ '@id': POET['@id'] }, PRO_ARCHIA] }],
  },
  'imperial-message-text.html': {
    path: 'imperial-message-text.html', priority: '0.6', image: 'og-imperial-message.jpg',
    title: 'An Imperial Message, text-only: Kafka’s parable as interactive fiction',
    desc: 'The text-only version of the playable “An Imperial Message”, with Kafka’s original German alongside. It runs on any device, however old.',
    alt: 'An Imperial Message: a messenger at the centre of endless rings, and a distant window.',
    ld: [{ ...IM, '@id': SITE + 'imperial-message-text.html#game', url: SITE + 'imperial-message-text.html', name: 'An Imperial Message (text-only)' }],
  },
};

const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* The <title> and the tags that follow it, for one page. `files` adds the
   icon files that sit beside the site's own pages; the games keep to the
   inlined icon so that each stays a single self-contained file. */
export function head(file, { files = false } = {}) {
  const p = PAGES[file], url = SITE + p.path, img = SITE + p.image;
  const ld = JSON.stringify({ '@context': 'https://schema.org', '@graph': p.ld }).replace(/</g, '\\u003c');
  return `<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.desc)}">
<meta name="author" content="${esc(AUTHOR)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="theme-color" content="#0a090b">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(SITE_NAME)}">
<meta property="og:locale" content="en_IN">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${img}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(p.alt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(p.title)}">
<meta name="twitter:description" content="${esc(p.desc)}">
<meta name="twitter:image" content="${img}">
<meta name="twitter:image:alt" content="${esc(p.alt)}">
${files ? '<link rel="icon" type="image/png" sizes="96x96" href="favicon.png">\n<link rel="apple-touch-icon" href="apple-touch-icon.png">\n' : ''}<link rel="icon" type="image/svg+xml" href="${ICON_URI}">
<script type="application/ld+json">${ld}</script>`;
}

/* Puts a page's head tags into a finished HTML file, replacing its <title>. */
export function withHead(html, file, opts) {
  if (!/<title>[^<]*<\/title>/.test(html)) throw new Error(file + ': no <title> to replace');
  return html.replace(/<title>[^<]*<\/title>/, () => head(file, opts));
}
