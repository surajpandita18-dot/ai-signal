// Last 7 days in AI · Week 01 · doodle format. Render: node weekly-doodle.js issues/2026-11-28-week01.doodle.js
// Facts checked against the source pages on 28 Nov 2026. Screenshots in issues/shots-week01/ (top of each source page).
module.exports = {
  week: 1, range: '21–27 Nov 2026',
  cover: {
    title: '6 AI Stories That Actually Mattered This Week', size: 104,
    sub: 'Explained like a normal person would.<br>How many did you catch?',
    doodle: ({ svg, T, st, sf, R, B, Y, K }) => svg(`
      <rect x="110" y="70" width="680" height="330" rx="22" ${sf('#fff')}/><path d="M110 140 L790 140" ${st}/>
      <path d="M220 40 L220 100 M680 40 L680 100" ${st} stroke-width="9"/>
      ${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((dd, k) => T(160 + k * 97, 122, dd, 26, 800)).join('')}
      ${[0, 1, 2, 3, 4, 5, 6].map(k => `<rect x="${125 + k * 97}" y="160" width="80" height="80" rx="10" ${sf(['#fff', Y, '#fff', R, '#fff', B, '#fff'][k])}/>`).join('')}
      <path d="M140 300 q40 -30 80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0" ${st}/>
      ${T(450, 370, 'too much happened. here’s what counts.', 28, 700)}`, 460)
  },
  stories: [
    {
      title: 'Proof: Correct. Readable: No.', size: 80,
      text: 'An Anthropic mathematician says he and Claude proved the Riemann hypothesis, maths’ most famous open problem since 1859. A computer checked all 17 million lines. No human has read it end to end. Yet.',
      doodle: ({ svg, T, st, sf, R, K }) => svg(`<path d="M120 300 L780 300" ${st}/>
        <rect x="230" y="282" width="140" height="18" ${sf('#fff')}/>${T(300, 262, '1 page', 36, 800)}${T(300, 345, 'WHAT TEACHERS WANT', 24, 800)}
        <rect x="530" y="60" width="140" height="240" ${sf(R)}/>${T(600, 42, '17M lines', 36, 800)}${T(600, 345, 'WHAT THEY GOT', 24, 800)}`, 370),
      shot: 'shots-week01/riemann.png', cite: 'Science News · Nov 2026 · checked by the Lean community, 21 Nov', real: 4, realNote: 'machine-checked'
    },
    {
      title: 'AI Agents Got Passports This Week', size: 80,
      text: 'Meta launched Muse, an AI agent that shops for you, in the UK. Anthropic opened its Claude Duet agent waitlist to India. The best feature? Muse has to ask you before it pays.',
      doodle: ({ svg, T, st, sf, R, B, Y, K }) => svg(`
        ${[['You', '“find me shoes”', '#fff'], ['Agent', 'searches, picks', Y], ['Asks you', 'before paying', '#E2ECFD'], ['Buys', 'only then', '#fff']].map(([a, b, c], k) => `<rect x="${20 + k * 222}" y="80" width="180" height="120" rx="18" ${sf(c)} ${k === 3 ? 'stroke-dasharray="12 10"' : ''}/>${T(110 + k * 222, 140, a, 32, 800)}${T(110 + k * 222, 178, b, 20, 600)}${k < 3 ? `<path d="M${204 + k * 222} 140 L${238 + k * 222} 140" ${st} marker-end="url(#ah)"/>` : ''}`).join('')}
        <circle cx="554" cy="270" r="34" ${sf(R)}/>${T(554, 281, '?', 34, 800, 'middle', '#fff')}${T(554, 340, 'the button that builds trust', 24, 700)}`, 360),
      shot: 'shots-week01/agents.png', cite: 'Meta Newsroom, 23 Nov · Claude Duet page · Duet is waitlist only', real: 4, realNote: 'launched'
    },
    {
      title: 'The Hackers Hired An AI Intern Too', size: 80,
      text: 'Microsoft says state-backed hackers from China and North Korea now use ARTEX, an AI agent built for security testing, to break into networks. Sometimes in minutes. No new tricks. Just way faster.',
      doodle: ({ svg, T, st, sf, R, Y, K }) => svg(`
        <rect x="140" y="150" width="190" height="150" rx="18" ${sf(Y)}/><path d="M180 150 L180 95 Q180 45 235 45 Q290 45 290 95" ${st} stroke-width="9"/>
        <circle cx="235" cy="215" r="16" fill="${K}"/><path d="M235 225 L235 260" ${st} stroke-width="8"/>
        ${T(235, 350, 'SAME OLD LOCK', 26, 800)}
        <circle cx="620" cy="190" r="110" ${sf('#fff')}/><path d="M620 190 L620 110 M620 190 L680 225" ${st} stroke-width="8"/><path d="M600 60 L640 60 M620 60 L620 80" ${st}/>
        <path d="M470 150 L380 150 M470 190 L400 190 M470 230 L380 230" stroke="${R}" stroke-width="7" stroke-linecap="round"/>
        ${T(620, 350, 'FASTER BURGLAR', 26, 800, 'middle', R)}`, 380),
      shot: 'shots-week01/artex.png', cite: 'Microsoft Security Blog · 25 Nov 2026', real: 4, realNote: 'Microsoft’s own report'
    },
    {
      title: 'Passed 98% Of Tests. Matched A Quarter Of Reality.', size: 66,
      text: 'Anthropic had Claude rewrite its main API in Rust. In April it passed about 98% of tests, but matched only about a quarter of real traffic. Months of fixing later: about 70% less CPU per request.',
      doodle: ({ svg, T, st, sf, R, B, K }) => svg(`<path d="M120 300 L780 300" ${st}/>
        <rect x="200" y="70" width="160" height="230" ${sf(B)}/>${T(280, 50, '~98%', 44, 800)}${T(280, 345, 'TESTS PASSED', 24, 800)}
        <rect x="540" y="242" width="160" height="58" ${sf(R)}/>${T(620, 222, '~25%', 44, 800)}${T(620, 345, 'REAL TRAFFIC MATCHED', 24, 800)}`, 370),
      shot: 'shots-week01/rust.png', cite: 'Anthropic Engineering, “Migrating our Messages API to Rust” · 25 Nov', real: 5, realNote: 'their own numbers'
    },
    {
      title: 'The Cloud Went Up. The Chips Went East.', size: 74,
      text: 'The US cleared SpaceX for up to 1 million data-centre satellites. And Bloomberg found Nvidia’s top Blackwell rack in Shanghai loan filings. Those chips need a US licence for China. How they got there? Unknown.',
      doodle: ({ svg, T, st, sf, R, B, Y, K }) => svg(`
        <ellipse cx="230" cy="190" rx="170" ry="60" ${st} stroke-dasharray="10 12"/><circle cx="230" cy="190" r="48" ${sf('#E2ECFD')}/>${T(230, 199, 'EARTH', 22, 800)}
        <rect x="378" y="160" width="44" height="30" rx="5" ${sf(Y)}/><path d="M360 175 L378 175 M422 175 L440 175" ${st}/>
        ${T(230, 330, 'DATA CENTRES → ORBIT', 24, 800)}
        <rect x="580" y="110" width="170" height="170" rx="16" ${sf('#fff')}/>${[0, 1, 2, 3].map(k => `<path d="M${605 + k * 40} 110 L${605 + k * 40} 85 M${605 + k * 40} 280 L${605 + k * 40} 305" ${st}/>`).join('')}
        ${T(665, 215, '?', 80, 800, 'middle', R)}${T(665, 350, 'CHIPS → SHANGHAI', 24, 800)}`, 380),
      shot: 'shots-week01/chips.png', cite: 'FCC order, 25 Nov · The Next Web citing Bloomberg, 27 Nov', real: 3, realNote: 'route unknown'
    },
    {
      title: 'India’s Sovereign AI Now Has Three Jobs', size: 74,
      text: 'India launched Chariot&#8209;1, its own LLM with a voice model for 10 Indian languages. MeitY cleared Sarvam for hosting Chinese open models. And C-DAC Pune is getting about 3,300 GPUs.',
      doodle: ({ svg, T, sf, R, B, Y }) => svg(`
        ${[['MODEL', 'Chariot‑1', Y], ['MONEY', 'Sarvam’s business', '#E2ECFD'], ['CHIPS', '~3,300 GPUs, Pune', '#FDE2E2']].map(([a, b, c], k) => `<rect x="${40 + k * 285}" y="80" width="250" height="170" rx="20" ${sf(c)}/>${T(165 + k * 285, 160, a, 40, 800)}${T(165 + k * 285, 205, b, 22, 700)}`).join('')}
        ${T(450, 320, 'all three, in one week', 28, 700)}`, 350),
      shot: 'shots-week01/india.png', cite: 'PIB (Chariot‑1), 26 Nov · Inc42, 26 Nov · NewsBytes, 27 Nov', real: 3, realNote: 'govt’s own numbers'
    },
  ],
  verdict: {
    sub: 'What got the noise this week, and what deserved it.',
    over: [{ t: 'Google’s six AI maths papers', why: 'Still not peer-reviewed. Your bank is fine.' }, { t: 'Data centres in space', why: 'Approved on paper. Nobody’s checked if it works.' }],
    under: [{ t: '98% tests vs ~25% reality', why: 'The most honest AI-coding lesson of the year.' }, { t: 'Muse’s “ask before buying” button', why: 'Boring. It’s why people will trust agents.' }],
    ask: 'Disagree? Comment the one you’d swap.'
  },
  take: {
    title: 'This was the week AI had to show its work.',
    p: ['A computer checked the maths. Real traffic checked Claude’s code. Muse checks with you before it pays.',
      'At work, every AI demo looks finished. The real work starts when you ask: how will we know when it’s wrong?',
      'For Indian AI founders: <b>build the checker before the feature.</b>']
  },
  quiz: { q: 'Claude’s Rust rewrite passed ~98% of tests. How much real traffic did it match?', size: 66, options: ['About 25%', 'About 60%', 'About 98%'], answer: 'A' }
};
