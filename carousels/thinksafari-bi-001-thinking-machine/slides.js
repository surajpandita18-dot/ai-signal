// THINKSAFARI · The Curious Mind · Beyond Intelligence 001 — "The Thinking Machine". 9 slides 1080x1350.
const { chromium } = require('playwright'); const fs = require('fs');
const D = __dirname, P = D + '/photos', OUT = D + '/out'; fs.mkdirSync(OUT, { recursive: true });
const F = D + '/../carousel3/fonts/node_modules/@fontsource';
const C = { blk: '#0C0C0D', nav: '#0F1420', ivo: '#EEE8DC', ink: '#141414', gold: '#B4975A', grey: '#8B9099', dgrey: '#6B6F77', blue: '#4C7DFF', body: '#D8D3C8', ibody: '#2B2A27' };
const css = `
@font-face{font-family:IS;src:url(file://${F}/instrument-serif/files/instrument-serif-latin-400-normal.woff2)}
@font-face{font-family:IS;font-style:italic;src:url(file://${F}/instrument-serif/files/instrument-serif-latin-400-italic.woff2)}
@font-face{font-family:DS;font-weight:400;src:url(file://${F}/dm-sans/files/dm-sans-latin-400-normal.woff2)}
@font-face{font-family:DS;font-weight:500;src:url(file://${F}/dm-sans/files/dm-sans-latin-500-normal.woff2)}
@font-face{font-family:DS;font-weight:600;src:url(file://${F}/dm-sans/files/dm-sans-latin-600-normal.woff2)}
*{margin:0;padding:0;box-sizing:border-box}body{width:1080px;height:1350px;position:relative;overflow:hidden;font-family:DS}
.a{position:absolute}.m{left:84px;right:84px}
img{position:absolute;display:block;object-fit:cover}
.h{font:400 76px/1.03 IS;letter-spacing:-.012em;text-wrap:balance}
.q{font:italic 400 76px/1.03 IS;text-wrap:balance}
.b{font:400 33px/1.45 DS;text-wrap:pretty}
.lab{font:600 20px DS;letter-spacing:.2em;text-transform:uppercase}
.cap{font:400 22px/1.35 DS}
.src{font:400 21px/1.4 DS}
.foot{left:84px;right:84px;bottom:54px;display:flex;justify-content:space-between;font:400 20px DS;letter-spacing:.01em}
`;
const foot = (i, col) => `<div class="a foot" style="color:${col}"><span>ThinkSafari · The Curious Mind</span><span>Beyond Intelligence 001 · ${i}/9</span></div>`;
const bars = [['Knowledge', 72], ['Comprehension', 79], ['Application', 69], ['Analysis', 72], ['Synthesis', 76], ['Evaluation', 55]];
const S = [
 // 01 cover
 [C.blk, `<div class="a m lab" style="top:72px;color:${C.gold};display:flex;justify-content:space-between"><span>ThinkSafari</span><span>Beyond Intelligence · 001</span></div>
  <img src="file://${P}/01_ibm704_nasa.jpg" style="left:0;top:128px;width:1080px;height:760px;object-position:50% 45%">
  <div class="a cap" style="right:84px;top:898px;color:${C.dgrey}">IBM 704 at NACA Langley, 1950s. Photo: NASA (public domain)</div>
  <div class="a m" style="top:968px"><div class="h" style="font-size:100px;color:${C.ivo}">AI can think for you.</div>
   <div class="q" style="font-size:100px;color:${C.gold}">But should it?</div></div>
  <div class="a cap" style="left:84px;bottom:54px;color:${C.grey};font-size:20px">The Thinking Machine</div>`],
 // 02 the shift
 [C.ivo, `<div class="a m lab" style="top:96px;color:${C.gold}">The shift</div>
  <div class="a m" style="top:150px"><div class="h" style="color:${C.ink}">For centuries, machines carried our physical weight. Now they’re lifting the mental kind.</div></div>
  <img src="file://${P}/02_laptop_notebook.jpg" style="left:300px;top:560px;width:780px;height:520px;object-position:50% 50%;filter:grayscale(1) contrast(1.04)">
  <div class="a" style="left:84px;top:600px;width:190px;font:italic 400 44px/1.25 IS;color:${C.ink}">Write.<br>Decide.<br>Explain.<br>Research.<br>Create.</div>
  <div class="a cap" style="right:84px;top:1090px;color:${C.dgrey}">Photo: Startup Stock Photos (CC0)</div>
  <div class="a m b" style="top:1146px;font-size:31px;color:${C.ibody}">Most of it saves real time. Some of it used to be how we thought.</div>
  ${foot(2, C.dgrey)}`],
 // 03 cognitive offloading
 [C.nav, `<div class="a m lab" style="top:96px;color:${C.gold}">The science</div>
  <div class="a m" style="top:150px"><div class="h" style="color:${C.ivo}">We have always handed our thinking to tools.</div>
   <div class="b" style="margin-top:22px;color:${C.body}">Psychologists call it <i style="font:italic 400 38px IS;color:${C.ivo}">cognitive offloading</i>: using the world outside your head to lighten the work inside it.</div></div>
  ${[['03a_cameron_letter_1875', 'Writing', 'Socrates warned it would weaken memory.', '50% 30%'], ['03b_printing_press', 'Printing', 'The abbot Trithemius argued for copying by hand.', '40% 55%'], ['03c_calculator', 'Calculators', 'Arithmetic teachers objected.', '50% 50%']].map(([f, t, d, pos], k) => `
   <img src="file://${P}/${f}.jpg" style="left:${84 + k * 312}px;top:560px;width:288px;height:300px;object-position:${pos};filter:grayscale(1)">
   <div class="a" style="left:${84 + k * 312}px;top:876px;width:288px"><div style="font:400 36px IS;color:${C.ivo}">${t}</div><div class="cap" style="color:${C.grey};margin-top:4px">${d}</div></div>`).join('')}
  <div class="a m" style="top:1060px;border-top:1px solid #2C3342;padding-top:24px"><div class="b" style="font-size:31px;color:${C.body}"><span style="color:${C.gold}">Generative AI is different in kind:</span> it doesn’t just store or calculate. It drafts the reasoning itself.</div></div>
  ${foot(3, C.dgrey)}`],
 // 04 the question
 [C.blk, `<img src="file://${P}/04_chess_hand.jpg" style="left:0;top:0;width:1080px;height:720px;object-position:50% 50%;filter:grayscale(1) contrast(1.05)">
  <div class="a cap" style="right:84px;top:732px;color:${C.dgrey}">Photo: Nenad Stojkovic (CC BY 2.0)</div>
  <div class="a m" style="top:800px"><div class="h" style="font-size:70px;color:${C.ivo}">What happens when we stop struggling with hard problems?</div>
   <div class="b" style="margin-top:22px;color:${C.body};font-size:31px">In 1983 the psychologist Lisanne Bainbridge named the “irony of automation”: hand the routine to a machine, and people lose the practice they need when things go wrong.</div></div>
  ${foot(4, C.dgrey)}`],
 // 05 the research
 [C.ivo, `<div class="a m lab" style="top:96px;color:${C.gold}">The research</div>
  <div class="a" style="left:84px;top:140px;font:400 180px/1 IS;letter-spacing:-.03em;color:${C.ink}">319</div>
  <div class="a b" style="left:420px;top:178px;width:576px;color:${C.ibody};font-size:31px">knowledge workers shared 936 real examples of using generative AI at work.</div>
  <div class="a m b" style="top:360px;font-size:30px;color:${C.ibody}">How often critical thinking felt like <b style="font-weight:500">less effort</b> with AI:</div>
  ${bars.map(([n, v], k) => `<div class="a" style="left:84px;top:${440 + k * 72}px;width:912px;display:flex;align-items:center;gap:20px">
     <div style="width:230px;font:400 27px DS;color:${C.ibody}">${n}</div>
     <div style="flex:1;height:14px;background:#DCD5C7;position:relative"><div style="position:absolute;left:0;top:0;bottom:0;width:${v}%;background:${n === 'Evaluation' ? C.blue : C.gold}"></div></div>
     <div style="width:70px;text-align:right;font:400 34px IS;color:${C.ink}">${v}%</div></div>`).join('')}
  <div class="a m b" style="top:880px;font-size:30px;color:${C.ibody}">The more people trusted the AI, the less critical thinking they reported. The more they trusted themselves, the more they did.</div>
  <div class="a m src" style="top:1080px;color:${C.dgrey}">Lee et al., “The Impact of Generative AI on Critical Thinking”, Microsoft Research, CHI 2025. Limits: self-reported, mostly younger frequent AI users, English only. It shows a link, not a decline.</div>
  ${foot(5, C.dgrey)}`],
 // 06 the twist
 [C.blk, `<img src="file://${P}/06_keypunch_tamu.jpg" style="left:0;top:0;width:640px;height:780px;object-position:55% 50%">
  <div class="a cap" style="left:84px;top:792px;width:520px;color:${C.dgrey}">Punched-card operators checking data, Texas A&M, 1950s. Cushing Library (CC BY 2.0)</div>
  <div class="a" style="left:690px;top:110px;width:316px"><div class="lab" style="color:${C.gold}">The twist</div>
   <div class="h" style="margin-top:22px;font-size:66px;color:${C.ivo}">AI doesn’t remove thinking.</div>
   <div class="q" style="margin-top:6px;font-size:66px;color:${C.gold}">It moves it.</div></div>
  <div class="a m" style="top:900px">${[['gathering information', 'verifying it'], ['solving the problem', 'fitting the answer in'], ['doing the task', 'overseeing it']].map(([x, y]) =>
   `<div style="display:flex;gap:18px;align-items:baseline;margin-bottom:14px;font:400 31px DS;color:${C.body}"><span style="color:${C.grey}">From ${x}</span><span style="color:${C.gold}">→</span><span style="color:${C.ivo}">${y}</span></div>`).join('')}</div>
  <div class="a m src" style="top:1150px;color:${C.dgrey}">The three shifts reported by Lee et al. (2025).</div>
  ${foot(6, C.dgrey)}`],
 // 07 two ways
 [C.nav, `<div class="a m lab" style="top:96px;color:${C.gold}">Two ways of using AI</div>
  <div class="a m" style="top:150px"><div class="h" style="color:${C.ivo}">Same tool. Two habits.</div></div>
  <img src="file://${P}/09_laptop_dark.jpg" style="left:84px;top:300px;width:444px;height:560px;object-position:55% 50%">
  <img src="file://${P}/07b_writing_by_hand.jpg" style="left:552px;top:300px;width:444px;height:560px;object-position:55% 50%;filter:grayscale(1)">
  <div class="a" style="left:84px;top:890px;width:444px"><div style="font:italic 400 46px IS;color:${C.grey}">The substitute</div><div class="b" style="margin-top:10px;font-size:30px;color:${C.body}">Ask. Accept.<br>Paste.</div></div>
  <div class="a" style="left:552px;top:890px;width:444px"><div style="font:italic 400 46px IS;color:${C.gold}">The thinking partner</div><div class="b" style="margin-top:10px;font-size:30px;color:${C.body}">Ask. Question. Rewrite.<br>Decide for yourself.</div></div>
  <div class="a m cap" style="top:1180px;color:${C.dgrey}">Photos: Negative Space (CC0), Green Chameleon (CC0)</div>
  ${foot(7, C.dgrey)}`],
 // 08 the bigger idea
 [C.ivo, `<div class="a m lab" style="top:96px;color:${C.gold}">The bigger idea</div>
  <div class="a m" style="top:300px"><div style="font:400 104px/1.0 IS;letter-spacing:-.015em;color:${C.ink};text-wrap:balance">In an age of instant answers, the rarest skill may be knowing <i style="color:${C.gold}">when to question one.</i></div></div>
  <div class="a m cap" style="top:1080px;color:${C.dgrey}">Our interpretation, not a research finding.</div>
  ${foot(8, C.dgrey)}`],
 // 09 closing
 [C.blk, `<img src="file://${P}/99_ames_704.jpg" style="left:84px;top:120px;width:912px;height:700px;object-position:50% 50%">
  <div class="a cap" style="right:84px;top:832px;color:${C.dgrey}">IBM 704 computing lab, NASA Ames, 1958. Photo: NASA (public domain)</div>
  <div class="a m" style="top:910px"><div style="font:400 62px/1.08 IS;color:${C.ivo};text-wrap:balance">If a machine can do more of our thinking, <i style="color:${C.gold}">what should we keep thinking about ourselves?</i></div></div>
  ${foot(9, C.dgrey)}`],
];
const names = ['01-cover', '02-the-shift', '03-cognitive-offloading', '04-the-question', '05-the-research', '06-the-twist', '07-two-ways', '08-the-bigger-idea', '09-closing'];
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  for (let i = 0; i < S.length; i++) { const f = OUT + '/_s.html';
    fs.writeFileSync(f, `<html><head><style>${css}</style></head><body style="background:${S[i][0]}">${S[i][1]}</body></html>`);
    await pg.goto('file://' + f); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(250);
    await pg.screenshot({ path: `${OUT}/${names[i]}.png` }); }
  fs.unlinkSync(OUT + '/_s.html'); await b.close(); console.log('ok');
})();
