/* The readings, as the home page lists them. To add a reading, add an entry.
   `art` is the inside of a 300x150 SVG; its classes animate on the home page. */
export const GAMES = [
  {
    file: 'before-the-law.html', text: 'before-the-law-text.html',
    tag: 'Franz Kafka &#183; 1915', title: 'Before the Law', minutes: 15,
    blurb: 'You are a man from the country, come to ask for admittance to the Law. The gate stands open. A doorkeeper says: not now. Every choice costs years.',
    art: `<defs><radialGradient id="rad" cx="50%" cy="60%" r="50%"><stop offset="0" stop-color="#ffd27a" stop-opacity=".9"/><stop offset=".5" stop-color="#ffb050" stop-opacity=".25"/><stop offset="1" stop-color="#ffb050" stop-opacity="0"/></radialGradient></defs>
      <ellipse class="glow" cx="150" cy="96" rx="90" ry="60" fill="url(#rad)"/>
      <path d="M118 140V70a32 32 0 0 1 64 0v70" fill="none" stroke="#c8a060" stroke-width="3"/>
      <path d="M126 140V74a24 24 0 0 1 48 0v66z" fill="#ffd690" opacity=".55"/>
      <rect x="190" y="88" width="10" height="52" fill="#3a332c"/><circle cx="195" cy="82" r="7" fill="#3a332c"/>
      <rect x="84" y="112" width="8" height="28" fill="#2a2520"/><circle cx="88" cy="107" r="5" fill="#2a2520"/>
      <line x1="0" y1="140" x2="300" y2="140" stroke="#3a332c"/>`,
  },
  {
    file: 'imperial-message.html', text: 'imperial-message-text.html',
    tag: 'Franz Kafka &#183; 1917', title: 'An Imperial Message', minutes: 12,
    blurb: 'A dying Emperor whispers a message meant for you alone. As his messenger you carry it through crowds and palaces without end, then wait at your window for it to arrive.',
    art: `<g fill="none" stroke="#c8a060" stroke-opacity=".55">
        <circle cx="110" cy="75" r="8"/><circle cx="110" cy="75" r="15"/><circle cx="110" cy="75" r="25"/>
        <circle cx="110" cy="75" r="38" stroke-opacity=".4"/><circle cx="110" cy="75" r="55" stroke-opacity=".3"/><circle cx="110" cy="75" r="78" stroke-opacity=".2"/><circle cx="110" cy="75" r="108" stroke-opacity=".12"/>
      </g>
      <line x1="118" y1="75" x2="270" y2="75" stroke="#9aa2b8" stroke-dasharray="3 4" stroke-opacity=".5"/>
      <circle class="runner" cx="114" cy="75" r="3" fill="#ffd27a"/>
      <rect x="266" y="68" width="14" height="14" fill="#1a1e2c" stroke="#9aa2b8" stroke-opacity=".6"/>
      <rect class="glow" x="270" y="72" width="6" height="6" fill="#ffc070"/>`,
  },
  {
    file: 'save-the-poet.html', text: 'save-the-poet-text.html', about: 'save-the-poet-about.html',
    tag: 'Cicero &#183; 62 BC', title: 'Save the Poet', minutes: 20,
    blurb: 'You are Cicero. Your old teacher, the Greek poet Archias, is on trial for his citizenship. Eight jurors, one water clock: win the law, then the room.',
    /* a laurel for the poet, the court's water clock, and the two wax tablets: A, I acquit; C, I condemn */
    art: `<g fill="none" stroke="#c8a060" stroke-opacity=".6" stroke-width="2">
        <path d="M62 128c-26-14-36-44-26-74"/><path d="M98 128c26-14 36-44 26-74"/></g>
      <g fill="#c8a060" fill-opacity=".5">${[0, 1, 2, 3, 4].map(i => `<ellipse cx="${41 - i * 1.5}" cy="${118 - i * 15}" rx="4" ry="8" transform="rotate(${-40 + i * 10} ${41 - i * 1.5} ${118 - i * 15})"/><ellipse cx="${119 + i * 1.5}" cy="${118 - i * 15}" rx="4" ry="8" transform="rotate(${40 - i * 10} ${119 + i * 1.5} ${118 - i * 15})"/>`).join('')}</g>
      <path d="M186 40h44l-6 46a6 6 0 0 1-6 5h-20a6 6 0 0 1-6-5z" fill="none" stroke="#c8a060" stroke-width="2.5"/>
      <path d="M190 62h36l-3 24a5 5 0 0 1-5 4h-20a5 5 0 0 1-5-4z" fill="#6f9fbf" fill-opacity=".5"/>
      <line x1="208" y1="92" x2="208" y2="116" stroke="#9ec0d8" stroke-opacity=".7" stroke-dasharray="2 4"/>
      <circle class="glow" cx="208" cy="120" r="3" fill="#ffd27a"/>
      <path d="M190 132h36" stroke="#3a332c" stroke-width="3"/>
      <rect x="244" y="96" width="22" height="28" rx="2" fill="#2a2013" stroke="#c8a060" stroke-opacity=".6"/><text x="255" y="116" text-anchor="middle" font-family="Georgia,serif" font-size="15" fill="#e8bd6a">A</text>
      <rect x="270" y="100" width="22" height="28" rx="2" fill="#2a2013" stroke="#8a5a3c" stroke-opacity=".6"/><text x="281" y="120" text-anchor="middle" font-family="Georgia,serif" font-size="15" fill="#c96a4a">C</text>
      <line x1="0" y1="140" x2="300" y2="140" stroke="#3a332c"/>`,
  },
];
