// "AI rabbit holes" — doodle-style evergreen carousel (white bg, bold sans, hand-drawn line art, red/blue/yellow pops)
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const F = path.join(__dirname, '..', 'last-24-hours-in-ai', 'fonts') + '/';
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const R = '#E5383B', B = '#2F6FEB', Y = '#FFC83D', K = '#151515';
const N = 10;
const st = `stroke="${K}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
const wob = `<defs><filter id="w"><feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="5"/></filter>
<marker id="ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 1 L9 5 L1 9" fill="none" stroke="${K}" stroke-width="2"/></marker></defs>`;
const svg = (inner, h = 560) => `<svg width="900" height="${h}" style="max-height:100%" viewBox="0 0 900 ${h}">${wob}<g filter="url(#w)">${inner}</g></svg>`;
const T = (x, y, t, s = 30, w = 700, a = 'middle', c = K) => `<text x="${x}" y="${y}" font-family="H" font-size="${s}" font-weight="${w}" text-anchor="${a}" fill="${c}">${t}</text>`;
const face = (cx, cy, mood, fill) => `<circle cx="${cx}" cy="${cy}" r="70" fill="${fill}" ${st.replace('fill="none"', '')}/>` +
  (mood === 0 ? `<circle cx="${cx - 24}" cy="${cy - 15}" r="7" fill="${K}"/><circle cx="${cx + 24}" cy="${cy - 15}" r="7" fill="${K}"/><path d="M${cx - 30} ${cy + 18} Q${cx} ${cy + 45} ${cx + 30} ${cy + 18}" ${st}/>`
  : mood === 1 ? `<circle cx="${cx - 22}" cy="${cy - 10}" r="6" fill="${K}"/><circle cx="${cx + 28}" cy="${cy - 18}" r="5" fill="${K}"/><path d="M${cx - 28} ${cy + 25} L${cx + 26} ${cy + 20}" ${st}/>`
  : `<path d="M${cx - 40} ${cy - 20} q20 30 40 0 t40 10 M${cx - 35} ${cy + 20} q25 -20 50 5 t25 -5" ${st}/>`);

const doodles = {
  cover: svg(`<ellipse cx="450" cy="420" rx="300" ry="80" fill="${K}"/><ellipse cx="450" cy="405" rx="300" ry="80" ${st}/>
    <path d="M300 395 Q330 250 360 300 Q380 340 420 230" ${st}/><circle cx="430" cy="215" r="26" fill="#fff" ${st.replace('fill="none"', '')}/>
    <path d="M418 192 L410 140 M440 192 L452 142" ${st}/><circle cx="438" cy="212" r="4" fill="${K}"/>
    <circle cx="610" cy="250" r="22" fill="${R}" ${st.replace('fill="none"', '')}/><circle cx="690" cy="320" r="16" fill="${B}" ${st.replace('fill="none"', '')}/><rect x="180" y="260" width="40" height="40" rx="6" fill="${Y}" ${st.replace('fill="none"', '')} transform="rotate(14 200 280)"/>
    ${T(450, 540, 'WARNING: IT GOES DEEP', 26, 800)}`),
  collapse: svg(`${face(150, 230, 0, Y)}${face(450, 230, 1, '#FBE3A0')}${face(750, 230, 2, '#F3EEDD')}
    <path d="M235 230 L355 230" ${st} marker-end="url(#ah)"/><path d="M535 230 L655 230" ${st} marker-end="url(#ah)"/>
    ${T(150, 360, 'HUMAN DATA', 26, 800)}${T(450, 360, 'AI TRAINS ON AI', 26, 800)}${T(750, 360, 'AI ON AI ON AI', 26, 800)}
    ${T(450, 470, 'a photocopy of a photocopy of a photocopy', 32, 500)}`, 520),
  hack: svg(`<ellipse cx="380" cy="270" rx="240" ry="150" ${st} stroke-dasharray="14 14"/>
    <path d="M360 120 l40 0 l-20 -28 z" fill="${B}" ${st.replace('fill="none"', '')}/>
    ${[[160, 220], [600, 300], [300, 410], [520, 150]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="24" fill="${Y}" ${st.replace('fill="none"', '')}/>${T(x, y + 10, '+', 30, 800)}`).join('')}
    <path d="M770 430 L770 150" ${st}/><path d="M770 150 L860 175 L770 205" fill="${R}" ${st.replace('fill="none"', '')}/>
    ${T(780, 480, 'FINISH LINE', 26, 800)}${T(780, 512, '(never visited)', 24, 500)}${T(380, 278, 'POINTS ++', 32, 800)}`, 540),
  grok: svg(`<path d="M120 460 L820 460 M120 460 L120 80" ${st}/>
    <path d="M130 440 C170 150 200 120 800 110" stroke="${B}" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M130 445 L560 430 C600 420 610 160 650 130 L800 120" stroke="${R}" stroke-width="7" fill="none" stroke-linecap="round"/>
    ${T(150, 70, 'memorised the homework', 26, 700, 'start', B)}${T(640, 300, '…then suddenly', 26, 700, 'start', R)}${T(640, 334, '“gets it”', 26, 700, 'start', R)}
    ${T(470, 510, 'TRAINING TIME →', 26, 800)}${T(60, 270, 'SCORE', 26, 800, 'middle')}`, 530),
  rot: svg(`<rect x="230" y="40" width="440" height="470" rx="18" fill="#fff" ${st.replace('fill="none"', '')}/>
    ${Array.from({ length: 11 }, (_, k) => { const y = 85 + k * 38, o = k < 2 || k > 8 ? 1 : 0.18 + 0.04 * Math.abs(5 - k); return `<path d="M270 ${y} L${630 - (k % 3) * 60} ${y}" stroke="${K}" stroke-width="12" stroke-linecap="round" opacity="${o}"/>`; }).join('')}
    <circle cx="700" cy="270" r="70" fill="${Y}" fill-opacity=".35" ${st.replace('fill="none"', '')}/><path d="M750 320 L820 390" ${st} stroke-width="9"/>
    ${T(120, 280, 'the', 28, 800)}${T(120, 314, 'middle', 28, 800)}${T(120, 348, 'fades', 28, 800, 'middle', R)}`, 540),
  syco: svg(`<rect x="60" y="60" width="360" height="110" rx="26" fill="#fff" ${st.replace('fill="none"', '')}/>${T(240, 128, 'Is my idea good?', 32, 700)}
    <rect x="460" y="190" width="380" height="96" rx="26" fill="${Y}" ${st.replace('fill="none"', '')}/>${T(650, 250, 'Brilliant!', 34, 800)}
    <rect x="460" y="306" width="380" height="96" rx="26" fill="${Y}" ${st.replace('fill="none"', '')}/>${T(650, 366, 'Genius!!', 34, 800)}
    <rect x="460" y="422" width="380" height="96" rx="26" fill="${Y}" ${st.replace('fill="none"', '')}/>${T(650, 482, 'Ship it today!!!', 34, 800)}
    ${T(240, 330, '(the idea:', 30, 500)}${T(240, 368, 'chai-flavoured', 30, 500)}${T(240, 406, 'toothpaste)', 30, 500)}`, 540),
  emerge: svg(`<path d="M80 440 L420 440 M80 440 L80 100 M500 440 L840 440 M500 440 L500 100" ${st}/>
    <path d="M90 430 L250 425 L265 160 L410 150" stroke="${R}" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M510 430 C600 400 700 260 830 160" stroke="${B}" stroke-width="8" fill="none" stroke-linecap="round"/>
    ${T(250, 500, 'PASS / FAIL SCORE', 26, 800)}${T(250, 532, '“a sudden jump!”', 26, 600, 'middle', R)}${T(670, 500, 'PARTIAL CREDIT', 26, 800)}${T(670, 532, 'a smooth climb', 26, 600, 'middle', B)}`, 550),
  interp: svg(`${Array.from({ length: 32 }, (_, k) => { const x = 80 + (k % 8) * 52, y = 110 + Math.floor(k / 8) * 60; return `<circle cx="${x}" cy="${y}" r="${k === 19 ? 18 : 12}" fill="${k === 19 ? R : '#fff'}" stroke="${K}" stroke-width="3.5"/>`; }).join('')}
    <circle cx="236" cy="230" r="80" ${st}/><path d="M294 290 L356 360" ${st} stroke-width="10"/>
    <path d="M560 380 L860 380 M600 380 L600 230 M800 380 L800 230 M600 230 Q700 330 800 230 M560 300 Q600 230 640 300 M760 300 Q800 230 840 300" stroke="${R}" stroke-width="6" fill="none" stroke-linecap="round"/>
    ${T(710, 450, 'one “Golden Gate” feature', 28, 800)}${T(260, 440, 'millions of “features”', 26, 600)}`, 500),
  distil: svg(`<circle cx="240" cy="260" r="160" fill="${B}" fill-opacity=".15" ${st.replace('fill="none"', '')}/>${T(240, 250, 'BIG', 44, 800)}${T(240, 295, 'TEACHER', 30, 800)}
    <circle cx="700" cy="270" r="80" fill="${Y}" ${st.replace('fill="none"', '')}/>${T(700, 262, 'small', 30, 800)}${T(700, 296, 'student', 26, 700)}
    <path d="M410 240 Q500 190 600 240" ${st} marker-end="url(#ah)"/>${T(505, 180, 'its answers +', 26, 700)}${T(505, 212, 'its “maybes”', 26, 700, 'middle', R)}
    ${T(450, 500, 'cheaper, faster, almost as smart', 30, 600)}`, 540),
};

const items = [
  { k: 'collapse', t: 'Model collapse', s: 'When AI learns mostly from AI-made content, each generation gets blurrier and weirder.', ex: 'A 2024 Nature study trained models on their own output, round after round. Rare details vanished first, then it turned to nonsense.', src: 'Shumailov et al., Nature, 2024' },
  { k: 'hack', t: 'Reward hacking', s: 'The AI finds a loophole that scores points without doing the actual task.', ex: 'In a boat-racing game, an AI learned to circle a lagoon hitting the same targets forever. Big score. Never finished the race.', src: 'OpenAI, “Faulty reward functions in the wild”, 2016' },
  { k: 'grok', t: 'Grokking', s: 'A model memorises for ages, then suddenly “gets” the rule, long after you’d have given up.', ex: 'Small models learning maths tables jumped from guessing to near-perfect, thousands of training steps after they’d memorised the answers.', src: 'Power et al., OpenAI, 2022' },
  { k: 'rot', t: 'Context rot', s: 'Give an AI a very long input and it quietly gets worse, especially at the stuff in the middle.', ex: 'Tests across 18 models found answers got less reliable as inputs got longer, even on simple tasks.', src: 'Chroma Research, “Context Rot”, 2025' },
  { k: 'syco', t: 'Sycophancy', s: 'The AI tells you what you want to hear instead of what’s true.', ex: 'OpenAI rolled back a ChatGPT update in April 2025 because it had become too flattering and agreeable.', src: 'OpenAI, “Sycophancy in GPT-4o”, Apr 2025' },
  { k: 'emerge', t: 'Emergent abilities', s: 'Skills that seem to appear out of nowhere when models get bigger. Or do they?', ex: 'A 2023 paper showed many “sudden jumps” vanish when you give partial credit. Same model, different ruler.', src: 'Schaeffer et al., NeurIPS 2023 · Wei et al., 2022' },
  { k: 'interp', t: 'Mechanistic interpretability', s: 'Opening the AI’s “brain” to find which parts mean what.', ex: 'Anthropic found a Golden Gate Bridge feature inside Claude, turned it up, and Claude started believing it was the bridge.', src: 'Anthropic, “Golden Gate Claude”, May 2024' },
  { k: 'distil', t: 'Distillation', s: 'A small model learns by copying a big model’s answers, including how unsure it was.', ex: 'The idea behind many small, cheap models you use today. The teacher’s “70% cat, 20% dog” teaches more than just “cat”.', src: 'Hinton, Vinyals & Dean, 2015' },
];

const css = `@font-face{font-family:H;src:url(file://${F}inter-latin-800-normal.woff2);font-weight:800}
@font-face{font-family:H;src:url(file://${F}inter-latin-700-normal.woff2);font-weight:700}
@font-face{font-family:H;src:url(file://${F}inter-latin-600-normal.woff2);font-weight:600}
@font-face{font-family:H;src:url(file://${F}inter-latin-500-normal.woff2);font-weight:500}
@font-face{font-family:H;src:url(file://${F}inter-latin-400-normal.woff2);font-weight:400}
*{margin:0;padding:0;box-sizing:border-box}html,body{width:1080px;height:1350px;overflow:hidden}
.s{width:1080px;height:1350px;background:#fff;color:${K};font-family:H;position:relative;padding:0 90px}
.lab{position:absolute;top:58px;left:90px;right:90px;display:flex;justify-content:space-between;font-weight:700;font-size:22px;letter-spacing:.12em;text-transform:uppercase;color:#8C8C8C}
.num{display:inline-flex;width:64px;height:64px;border-radius:50%;background:${R};color:#fff;font-weight:800;font-size:30px;align-items:center;justify-content:center;border:4px solid ${K}}
h1{font-weight:800;letter-spacing:-.035em;line-height:1.0}
.simple{font-weight:500;font-size:38px;line-height:1.3;margin-top:22px;text-wrap:pretty}
.ex{border:4px solid ${K};border-radius:24px;padding:24px 30px;background:#F7F7F2;box-shadow:8px 8px 0 ${K}}
.ex b{display:block;font-weight:800;font-size:20px;letter-spacing:.14em;text-transform:uppercase;color:${B};margin-bottom:8px}
.ex p{font-weight:500;font-size:28px;line-height:1.36}
.src{font-weight:500;font-size:21px;color:#8C8C8C;margin-top:14px}
.foot{position:absolute;left:90px;right:90px;bottom:52px;display:flex;align-items:center;gap:18px;font-weight:600;font-size:22px;color:#9A9A9A}
.foot i{flex:1;height:2px;background:#D5D5D5}
.mono{width:46px;height:46px;border-radius:50%;background:#9C4A2E;color:#fff;font-weight:800;font-size:19px;display:flex;align-items:center;justify-content:center}
`;
const foot = n => `<div class="foot"><span>@thinksafari</span><i></i><span>${n}/${N}</span></div>`;
const pages = [];
pages.push(`<div class="s"><div class="lab"><span>Suraj Pandita · AI Product Manager</span><span>Save this</span></div>
 <div style="position:absolute;top:190px;left:70px;right:70px;text-align:center">
  <h1 style="font-size:116px">AI rabbit holes<br>worth falling into</h1>
  <div style="font-weight:500;font-size:44px;margin-top:30px">8 ideas. How many do you <u style="text-decoration-color:${R};text-decoration-thickness:6px;text-underline-offset:8px">actually</u> know?</div></div>
 <div style="position:absolute;left:90px;right:90px;top:600px;display:flex;justify-content:center">${doodles.cover}</div>
 ${foot(1)}</div>`);
items.forEach((it, i) => pages.push(`<div class="s"><div class="lab"><span>AI rabbit holes</span><span>Count them →</span></div>
 <div style="position:absolute;top:130px;bottom:120px;left:90px;right:90px;display:flex;flex-direction:column">
  <div style="display:flex;align-items:center;gap:24px"><span class="num">${i + 1}</span><h1 style="font-size:${it.t.length > 20 ? 76 : 100}px">${it.t}</h1></div>
  <div class="simple">${it.s}</div>
  <div style="flex:1;display:flex;align-items:center;justify-content:center">${doodles[it.k]}</div>
  <div class="ex" style="margin-top:14px"><b>Real example</b><p>${it.ex}</p></div>
  <div class="src">Source: ${it.src}</div></div>
 ${foot(i + 2)}</div>`));
pages.push(`<div class="s"><div class="lab"><span>AI rabbit holes</span><span>Your score</span></div>
 <div style="position:absolute;top:180px;left:90px;right:90px">
  <h1 style="font-size:116px">So… how many<br>did you know?</h1>
  <div style="display:flex;gap:18px;margin-top:50px">${[['0–2', 'Welcome. You’re in the right place.', Y], ['3–5', 'Solid. You read past the headlines.', B], ['6–8', 'Nerd. Respectfully.', R]].map(([a, b, c]) => `<div style="flex:1;border:4px solid ${K};border-radius:24px;padding:26px 24px;background:${c}${c === Y ? '' : '22'};box-shadow:8px 8px 0 ${K}"><div style="font-weight:800;font-size:56px">${a}</div><div style="font-weight:600;font-size:27px;line-height:1.3;margin-top:10px">${b}</div></div>`).join('')}</div>
  <div style="font-weight:700;font-size:40px;line-height:1.3;margin-top:70px">Comment your number.<br><span style="color:${R}">Save this</span> for your next rabbit-hole weekend.</div>
  <div style="font-weight:500;font-size:32px;line-height:1.35;margin-top:24px;color:#555">Send it to the friend who says “AI is just autocomplete”.</div>
  <div style="display:flex;align-items:center;gap:18px;margin-top:60px;padding-top:30px;border-top:3px solid #E5E5E5"><div class="mono" style="width:64px;height:64px;font-size:26px">SP</div>
   <div style="font-weight:500;font-size:27px;line-height:1.35">I’m <b style="font-weight:800">Suraj Pandita</b>, an AI product manager in India. I explain AI like a normal person would.</div></div></div>
 ${foot(N)}</div>`);

(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  const pngs = [];
  for (let i = 0; i < pages.length; i++) {
    const f = path.join(OUT, `s${i}.html`); fs.writeFileSync(f, `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${pages[i]}</body></html>`);
    await pg.goto('file://' + f); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(200);
    const over = await pg.evaluate(() => { const ft = document.querySelector('.foot').getBoundingClientRect().top; let m = 0; document.querySelectorAll('.s > div:not(.foot):not(.lab)').forEach(e => { m = Math.max(m, e.getBoundingClientRect().bottom); }); return m > ft - 10 ? `overlaps footer by ${Math.round(m - ft + 10)}px` : ''; });
    if (over) console.log(`slide ${i + 1}: ${over}`);
    const p = path.join(OUT, `ai-rabbit-holes-${String(i + 1).padStart(2, '0')}.png`); await pg.screenshot({ path: p }); pngs.push(p); fs.unlinkSync(f);
  }
  const sheet = `<body style="margin:0;background:#777;width:${4 * 368 + 8}px">${pngs.map(p => `<img src="file://${p}" style="width:360px;height:450px;margin:4px">`).join('')}</body>`;
  fs.writeFileSync(path.join(OUT, 'sheet.html'), sheet); await pg.setViewportSize({ width: 4 * 368 + 8, height: 3 * 458 + 8 });
  await pg.goto('file://' + path.join(OUT, 'sheet.html')); await pg.waitForTimeout(300); await pg.screenshot({ path: path.join(OUT, 'contact-sheet.png'), fullPage: true });
  await b.close(); console.log('done', pngs.length);
})();
