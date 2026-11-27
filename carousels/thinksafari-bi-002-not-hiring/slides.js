// THINKSAFARI · Beyond Intelligence 002 — "We may not be firing, but we’re not hiring." 7 slides 1080x1350.
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
.q{font:italic 400 76px/1.04 IS;text-wrap:balance}
.b{font:400 32px/1.45 DS;text-wrap:pretty}
.lab{font:600 20px DS;letter-spacing:.2em;text-transform:uppercase}
.cap{font:400 22px/1.35 DS}
.src{font:400 21px/1.4 DS}
.foot{left:84px;right:84px;bottom:54px;display:flex;justify-content:space-between;font:400 20px DS;letter-spacing:.01em}
`;
const foot = (i, col) => `<div class="a foot" style="color:${col}"><span>ThinkSafari · The Curious Mind</span><span>Beyond Intelligence 002 · ${i}/7</span></div>`;
const S = [
 // 01 cover
 [C.blk, `<div class="a m lab" style="top:72px;color:${C.gold};display:flex;justify-content:space-between"><span>ThinkSafari</span><span>Beyond Intelligence · 002</span></div>
  <img src="file://${P}/01_empty_office.jpg" style="left:0;top:128px;width:1080px;height:720px;object-position:50% 50%;filter:grayscale(1) contrast(1.05)">
  <div class="a cap" style="right:84px;top:858px;color:${C.dgrey}">Photo: Matt Moloney (CC0)</div>
  <div class="a m" style="top:930px"><div class="h" style="font-size:94px;color:${C.ivo}">“We may not be firing,</div>
   <div class="q" style="font-size:94px;color:${C.gold}">but we’re not hiring.”</div></div>
  <div class="a cap" style="left:84px;bottom:54px;color:${C.grey};font-size:20px">What 58 companies told Anthropic about AI and jobs</div>`],
 // 02 the fear + the study
 [C.ivo, `<div class="a m lab" style="top:96px;color:${C.gold}">The question</div>
  <div class="a m" style="top:150px"><div class="h" style="color:${C.ink}">Everyone asks whether AI will take our jobs. Few ask the companies already using it.</div></div>
  <img src="file://${P}/02_office_building.jpg" style="left:84px;top:520px;width:600px;height:450px;object-position:50% 50%;filter:grayscale(1)">
  <div class="a cap" style="left:84px;top:982px;width:600px;color:${C.dgrey}">Firstmark Building, Buffalo. Western New York Architecture Deep Cuts (CC BY-SA 2.0)</div>
  <div class="a b" style="left:720px;top:520px;width:276px;font-size:29px;color:${C.ibody}">In November 2026, Anthropic’s economists published 66 interviews with people at 58 US companies in the middle of adopting AI.</div>
  ${foot(2, C.dgrey)}`],
 // 03 the numbers
 [C.nav, `<div class="a m lab" style="top:96px;color:${C.gold}">What they found</div>
  ${[['2', 'companies had seen AI fully eliminate a position and someone lose their job.', C.ivo], ['⅔', 'of the companies reported hiring less because of AI.', C.gold], ['10', 'companies reported hiring more, mostly people to implement AI.', C.ivo]].map(([n, t, col], k) => `
   <div class="a" style="left:84px;top:${170 + k * 290}px;width:912px;display:flex;gap:40px;align-items:center;${k ? 'border-top:1px solid #2C3342;padding-top:30px' : ''}">
    <div style="width:250px;font:400 190px/1 IS;letter-spacing:-.03em;color:${col}">${n}</div>
    <div class="b" style="flex:1;color:${C.body}">${t}</div></div>`).join('')}
  <div class="a m src" style="top:1080px;color:${C.dgrey}">Wilmers, Massenkoff &amp; McCrory, “Working with AI”, Anthropic, 23 Nov 2026. 58 of Anthropic’s own enterprise customers; interviews, not a representative sample.</div>
  ${foot(3, C.dgrey)}`],
 // 04 the job that never gets posted
 [C.blk, `<img src="file://${P}/04_now_hiring.jpg" style="left:0;top:0;width:1080px;height:719px;object-position:50% 50%;filter:grayscale(1) contrast(1.05)">
  <div class="a cap" style="right:84px;top:731px;color:${C.dgrey}">Job fair, Greenville, NC. Photo: SGRC (public domain)</div>
  <div class="a m" style="top:800px"><div class="h" style="font-size:72px;color:${C.ivo}">The job you lose isn’t always yours.</div>
   <div class="q" style="font-size:72px;color:${C.gold}">It’s the one never posted.</div>
   <div class="b" style="margin-top:22px;color:${C.body};font-size:30px">A third of those hiring declines came from teams shrinking quietly: people left, and no one replaced them.</div></div>
  ${foot(4, C.dgrey)}`],
 // 05 where the value went
 [C.ivo, `<div class="a m lab" style="top:96px;color:${C.gold}">Where the value went</div>
  <div class="a m" style="top:150px"><div class="h" style="color:${C.ink}">Most AI uses added value by doing more, not by spending less.</div>
   <div class="b" style="margin-top:24px;color:${C.ibody}">The highest-value uses went further than swapping in software. They reorganised roles and the workplace itself.</div></div>
  <div class="a m" style="top:690px;border-left:6px solid ${C.gold};padding-left:40px"><div class="q" style="font-size:64px;color:${C.ink}">“Two people plus Claude is the most amazing thing… if two people agree on something, just ship it.”</div>
   <div class="cap" style="margin-top:20px;color:${C.dgrey}">An interviewee, quoted in the report (names are pseudonymous)</div></div>
  ${foot(5, C.dgrey)}`],
 // 06 closer to the money
 [C.nav, `<div class="a m lab" style="top:96px;color:${C.gold}">The limit</div>
  <div class="a m" style="top:330px"><div class="q" style="font-size:98px;line-height:1.0;color:${C.ivo}">“The closer you are to the money, the harder it is for models to excel in that job.”</div>
   <div class="cap" style="margin-top:28px;color:${C.grey}">From the report’s conclusion</div></div>
  <div class="a m b" style="top:1010px;font-size:30px;color:${C.body}"><span style="color:#B4975A">Our reading:</span> the work closest to revenue, built on trust and judgement, is where models struggled most.</div>
  ${foot(6, C.dgrey)}`],
 // 07 ending
 [C.blk, `<img src="file://${P}/08_empty_chairs.jpg" style="left:84px;top:120px;width:912px;height:684px;object-position:50% 50%">
  <div class="a cap" style="right:84px;top:816px;color:${C.dgrey}">Photo: jjes84 (CC BY 2.0)</div>
  <div class="a m" style="top:900px"><div style="font:400 64px/1.08 IS;color:${C.ivo};text-wrap:balance">If AI doesn’t take your job but quietly removes the next one, <i style="color:${C.gold}">who notices?</i></div>
   <div class="cap" style="margin-top:20px;color:${C.dgrey}">Our question, not the study’s.</div></div>
  ${foot(7, C.dgrey)}`],
];
const names = ['01-cover', '02-the-question', '03-the-numbers', '04-never-posted', '05-the-value', '06-the-limit', '07-closing'];
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  for (let i = 0; i < S.length; i++) { const f = OUT + '/_s.html';
    fs.writeFileSync(f, `<html><head><style>${css}</style></head><body style="background:${S[i][0]}">${S[i][1]}</body></html>`);
    await pg.goto('file://' + f); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(250);
    await pg.screenshot({ path: `${OUT}/${names[i]}.png` }); }
  fs.unlinkSync(OUT + '/_s.html'); await b.close(); console.log('ok');
})();
