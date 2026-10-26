/* dist/save-the-poet-about.html: the companion page to Save the Poet. What
   the reading is and why it is in the course, the trial of 62 BC, what each
   part of the game stands for, what was made for it, and what in it is
   Cicero's, what is invented and what was made with tools. The discussion
   questions are read out of the game's own reflection page. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { head, PROFESSOR } from './site.mjs';
import { BOARD_CSS, BOARD_JS } from './board.mjs';
import { PAGE_CSS } from './teachers.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const game = fs.readFileSync(path.join(here, '../save-the-poet.html'), 'utf8');
const qs = /Questions to discuss<\/h3><ol>' \+([\s\S]*?)'<\/ol>'/.exec(game);
if (!qs) throw new Error('no discussion questions found in save-the-poet.html');
const QUESTIONS = [...qs[1].matchAll(/'<li>([\s\S]*?)<\/li>'/g)].map(m => m[1]);
if (QUESTIONS.length < 3) throw new Error('too few discussion questions found');

const row = (...c) => '<tr>' + c.map(x => '<td>' + x + '</td>').join('') + '</tr>';

export const POET_ABOUT = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="color-scheme" content="dark">
${head('save-the-poet-about.html', { files: true })}
<style>
${PAGE_CSS}
.la{font-style:italic;color:#f0dcae}
.sa{color:#f0dcae}
td.k{color:var(--gold)}
html.board .way a,html.board .way button{font-size:.56rem;letter-spacing:.1em;padding:1rem .5rem}
${BOARD_CSS}</style>
<script>${BOARD_JS}</script>
</head><body>
<nav class="way" aria-label="On this page">
  <a class="home" href="index.html">&#8592; Home</a><a href="#course">The course</a><a href="#trial">The trial</a><a href="#play">How it plays</a><a href="#means">What it means</a><a href="#made">What was made</a><a href="#original">Original or not</a><a href="#class">In class</a><span data-board-slot></span>
</nav>
<main>
<p class="eyebrow">About the game &#183; Cicero, <i>Pro Archia</i>, 62 BC</p>
<h1>Save the Poet</h1>
<p class="lead">A courtroom game made from one of Cicero&#8217;s speeches. You are Cicero. Your old teacher, the Greek poet Archias, is accused of living in Rome as a citizen when he is not one. <b>You have eight jurors to win and a water clock running out.</b> You can prove the law and still lose the room, which is the lesson Cicero teaches in the speech itself.</p>
<div class="cta"><a class="play gold" href="save-the-poet.html">&#9654; Play Save the Poet</a><a class="play" href="save-the-poet-text.html">Text-only version</a></div>
<dl class="facts">
  <div><dt>The reading</dt><dd>Cicero, <i>Pro Archia Poeta</i> (62 BC)</dd></div>
  <div><dt>Time</dt><dd>About 20 minutes; a short trial of about 8</dd></div>
  <div><dt>Players</dt><dd>One, or a whole class with hands-up votes</dd></div>
  <div><dt>Versions</dt><dd>3D and voiced, or text-only</dd></div>
  <div><dt>Language</dt><dd>English, with Cicero&#8217;s Latin under his key lines</dd></div>
</dl>

<h2 id="course">Where it sits in the course</h2>
<p><i>Pro Archia</i> is one of the readings in a course that joins law, language, literature and communication, and it is hard to find a text that joins them more closely. It is a real legal defence, on a real question of citizenship and evidence. It is a model of the parts of a classical speech. And for most of its length it is an argument about why literature matters at all.</p>
<ul>
  <li><b>Law.</b> Who is a citizen? What counts as proof when the official records have been destroyed? Is a missing name in a register evidence of anything?</li>
  <li><b>Language and communication.</b> The parts of a speech, in order: <i>exordium</i>, <i>narratio</i>, <i>confirmatio</i>, <i>refutatio</i>, <i>peroratio</i>. Knowing the audience. Choosing what to leave out.</li>
  <li><b>Literature.</b> Cicero&#8217;s claim that these studies feed the young, delight the old and give refuge in bad times, and that poets carry a people&#8217;s fame further than its armies.</li>
</ul>
<p>The game turns the reading into a task. A student does not memorise the five parts of a speech; they have to build one, under time, in front of listeners who react to every choice.</p>

<h2 id="trial">The trial of 62 BC</h2>
<p>Aulus Licinius Archias was a Greek poet, born at Antioch and famous while still young. He came to Rome in 102 BC, the year Marius and Catulus were consuls, and the noble family of the Luculli took him in. Through Marcus Lucullus he was made a citizen of Heraclea, an allied town in southern Italy. When a law of 89 BC gave Roman citizenship to citizens of allied towns who lived in Italy and declared themselves before a praetor within sixty days, Archias declared himself before the praetor Quintus Metellus.</p>
<p>In 65 BC the law of Papius ordered foreigners living in Rome without citizenship to leave the city. In 62 BC a man named Grattius prosecuted Archias under it. His case was simple. Heraclea&#8217;s records had burned in the Italian War, so there was no register to show, and Archias&#8217; name was in none of Rome&#8217;s census lists. The case was probably political: an attack on Lucius Lucullus, Archias&#8217; patron and a rival of Pompey. The praetor presiding was very likely Quintus Cicero, the orator&#8217;s younger brother.</p>
<p>Cicero, consul the year before, answered the law in a few sections: the testimony of Marcus Lucullus, the word of Heraclea&#8217;s envoys, the reliability of Metellus&#8217; lists, and the reasons Archias was absent from each census. Then, at section 12, he turned. He asked leave to speak about literature, and spent most of the speech on why a poet like Archias deserves to be a Roman. <b>No record of the verdict survives;</b> Archias is generally thought to have been acquitted.</p>

<h2 id="play">How it plays</h2>
<p>Every choice is answered. Each juror listens for different things and shows what he thinks, so the player reads the room while speaking to it.</p>
<table>
  <tr><th>Part of the game</th><th>Part of Cicero&#8217;s speech</th></tr>
  ${row('Prologue: the night before', 'Invented. Archias brings the case file; reading it gives the evidence you will need tomorrow')}
  ${row('Act I: how you begin', '<i>Exordium</i> (&#167;&#167; 1&#8211;4): Cicero says he owes his talent to Archias and asks leave to speak unusually')}
  ${row('Act II: the story of a life', '<i>Narratio</i> (&#167;&#167; 4&#8211;7): you choose six episodes of Archias&#8217; life, in order, and Cicero tells them')}
  ${row('Act III: proof and objections', '<i>Confirmatio</i> and <i>refutatio</i> (&#167;&#167; 8&#8211;11): question Lucullus, receive the envoys, answer four objections with the evidence you hold')}
  ${row('The turn', '&#167; 12: the law is won, the room is not. Rest your case, or speak about literature')}
  ${row('Act IV: the defence of literature', '&#167;&#167; 12&#8211;30: choose four of Cicero&#8217;s arguments and the order to make them in')}
  ${row('Your last words', '<i>Peroratio</i> (&#167;&#167; 31&#8211;32): law and humanity together, or something worse')}
  ${row('The verdict and after', 'Each juror votes in turn; then a page sets your speech beside Cicero&#8217;s, shows what each juror thought, and asks questions')}
</table>

<h2 id="means">What the things in it mean</h2>
<table>
  <tr><th>On screen</th><th>What it stands for</th></tr>
  ${row('The water clock', 'Roman courts timed speeches with a <i>clepsydra</i>, a vessel that drained at a steady rate; &#8220;to be given water&#8221; meant to be given time to speak. Every argument here costs water, and when it runs out the court has heard enough.')}
  ${row('The eight jurors', 'Real juries at this time were drawn from senators, equestrians and the <i>tribuni aerarii</i>, the treasury officers, and were far larger. Eight keeps each juror a person you can read: the old senator, the tax contractor, the veteran, the strict jurist, the young noble, Pompey&#8217;s man, the treasury official and the lover of verse.')}
  ${row('A juror&#8217;s face and bar', 'The bar is how far the law has convinced him. The face shows the rest: a warmer mouth for goodwill towards Archias, heavier eyelids as his attention drifts. A juror needs all three to vote for you.')}
  ${row('The tablets, A and C', 'Each juror scratched out one letter on a wax tablet: A for <i>absolvo</i>, I acquit; C for <i>condemno</i>, I condemn. In a Roman court a tied vote acquitted, and it does here.')}
  ${row('Evidence cards', 'The facts Cicero actually used, gathered by reading the case file, questioning the witness and whispering to Archias. An objection is answered by choosing the right cards.')}
  ${row('Insights', 'Twelve things a student of rhetoric would recognise, such as &#8220;Proof is not persuasion&#8221; or &#8220;Absence is not evidence&#8221;, found by doing what Cicero did.')}
  ${row('The vanity card', 'Cicero does bring his own consulship into this speech, telling the court that Archias had begun a poem about it (&#167; 28). The game lets you end on it, and lets the jury judge it.')}
  ${row('The golden visions', 'In Act IV the Forum turns to evening light and the examples Cicero gives appear in the sky: Alexander at Achilles&#8217; tomb, the poets and the generals.')}
  ${row('The Latin lines', 'Cicero&#8217;s own words, under the English of his most famous sentences.')}
  ${row('<span class="sa" lang="sa">&#2360;&#2366; &#2357;&#2367;&#2342;&#2381;&#2351;&#2366; &#2351;&#2366; &#2357;&#2367;&#2350;&#2369;&#2325;&#2381;&#2340;&#2351;&#2375;</span>', '<i>S&#257; vidy&#257; y&#257; vimuktaye</i>, &#8220;that alone is knowledge which sets us free&#8221; (from the Vishnu Purana). It is the game&#8217;s motto because it is Cicero&#8217;s argument too: these studies are not ornament; they free the mind.')}
  ${row('Hands-up votes', 'With &#8220;Playing with a class&#8221; ticked, the game stops three times for the room to vote, and the class&#8217;s verdict sways the undecided jurors.')}
</table>

<h2 id="made">What was made for it</h2>
<ul>
  <li><b>The design.</b> The two-way trial: a jury of eight that remembers, a time limit that makes every word cost something, and a defence that can genuinely be lost. The balance was tested by playing five kinds of defence through the game: Cicero&#8217;s own choices win 8 to 0, a purely legal defence ties 4 to 4, a careless one loses every vote.</li>
  <li><b>The script.</b> Every English line, written for the game from Cicero&#8217;s Latin: the narration, the passages of the speech, Grattius&#8217; accusations and the witnesses&#8217; answers.</li>
  <li><b>The Forum in 3D.</b> Temples, arcades, the tribunal and its awning, the benches, the water clock, a crowd of about three hundred that grows when Cicero turns to literature, and light that moves from morning sun to the gold of the visions.</li>
  <li><b>The staging.</b> The scene acts out what is said: a knock and Archias at the door, the case file laid on the table, Grattius stepping out to point at the accused, witnesses walking in, every head turning to whoever speaks.</li>
  <li><b>The voices.</b> 117 spoken lines in seven voices, shown as subtitles one at a time.</li>
  <li><b>The text-only version</b> and the reflection page, which sets each player&#8217;s speech beside Cicero&#8217;s.</li>
</ul>

<h2 id="original">What is original, and what is not</h2>
<table>
  <tr><th>Part</th><th>Where it comes from</th></tr>
  ${row('The events of the case', 'Cicero&#8217;s speech: Archias&#8217; life, Lucullus&#8217; testimony, the envoys, the burned records, Metellus&#8217; lists and the careless ones of Appius and Gabinius, the census absences, and every example in Act IV')}
  ${row('The Latin', 'Cicero, <i>Pro Archia</i>, in the public domain')}
  ${row('The English', 'Original, written for this game from the Latin. No published translation is quoted, so the wording will differ from your textbook&#8217;s')}
  ${row('Invented for the game', 'The eight jurors and their characters; Grattius&#8217; words (his speech is lost, so his arguments are rebuilt from Cicero&#8217;s replies); the night before; the clerk; the water costs; the scoring; the sentence Cicero says for each episode of the life')}
  ${row('Simplified', 'The jury&#8217;s size; the layout of the Forum, which is an impression rather than a plan; the timing of the trial, compressed into one sitting')}
  ${row('The figures', 'Two sculpts generated by the developer with Meshy AI from written descriptions, used for every person in the Forum. Their colour, the seated pose of the jurors, and the moving heads and arms are done in the game&#8217;s own code. The licence of the generated sculpts depends on the Meshy plan and is not yet confirmed')}
  ${row('The voices', 'Generated with Kokoro-82M, an open speech model (Apache License 2.0)')}
  ${row('Sound and music', 'Original: the crowd, the lyre, the drip of the water clock, the knock and the tablets are made in the browser as the game runs')}
  ${row('Software', 'The game&#8217;s code is original; the 3D drawing uses three.js (MIT License). Full details are in <a href="LICENSES.md">LICENSES.md</a>')}
</table>

<h2 id="tribute">A tribute</h2>
<p>In class, ${PROFESSOR} set aside a line-by-line reading of <i>Pro Archia</i> when he saw that it was boring the room. At section 12 Cicero does the same thing: he stops arguing technicalities, because a jury that is not listening cannot be persuaded. The game is built around that moment, and every player reaches it. <a href="acknowledgements.html">Read the acknowledgements.</a></p>

<h2 id="class">Using it in class</h2>
<div class="ways">
  <div><b>Together, on the board</b><p>Tick &#8220;Playing with a class&#8221;. One student plays; the room argues each choice and votes with hands up at three moments, including the verdict.</p></div>
  <div><b>Alone, then discuss</b><p>Each student plays the full trial, then the class compares verdicts: who won the law and lost the room, and why.</p></div>
  <div><b>In a hurry</b><p>Tick &#8220;Short trial&#8221; for about eight minutes, starting at the Forum with the evidence already in hand.</p></div>
</div>
<h3>Questions to discuss</h3>
<ol>
${QUESTIONS.map(q => '  <li>' + q + '</li>').join('\n')}
</ol>
<p>More on running the games in a class, on a board or on laptops, is on the <a href="for-teachers.html">page for teachers</a>.</p>

<h2 id="credit">Credit</h2>
<p class="note">Vikas Goyanka, <i>Save the Poet: Cicero&#8217;s Pro Archia, played</i>, in <i>Playable Readings</i> (National Law University, Delhi, 2026), made in honour of ${PROFESSOR}.</p>

<footer>Developed by <b>Vikas Goyanka</b> &#183; LLB26057 &#183; National Law University, Delhi<br><a href="index.html">The games</a> &#183; <a href="save-the-poet.html">Play Save the Poet</a> &#183; <a href="acknowledgements.html">Acknowledgements</a></footer>
</main>
</body></html>`;
