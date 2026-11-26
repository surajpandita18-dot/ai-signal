// Stories you never heard · Ep 01 · The Turk — style A "The Page" (raranoormega-style Substack carousel). usage: node ep01-the-turk.js
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const D = __dirname, OUT = path.join(D, 'out', 'ep01-the-turk'); fs.mkdirSync(OUT, { recursive: true });
const F = path.join(__dirname, '..', 'last-24-hours-in-ai', 'fonts') + '/';
const NM = F;
const img = f => 'file://' + path.join(D, 'img', f);
const SERIES = 'Stories you never heard';
const TAGLINE = 'the people and ideas behind AI, told by an AI product manager';

const css = `
@font-face{font-family:I;src:url(file://${NM}inter-latin-400-normal.woff2);font-weight:400}
@font-face{font-family:I;font-style:italic;src:url(file://${NM}inter-latin-400-italic.woff2);font-weight:400}
@font-face{font-family:I;font-style:italic;src:url(file://${NM}inter-latin-600-italic.woff2);font-weight:600}
@font-face{font-family:I;font-style:italic;src:url(file://${NM}inter-latin-700-italic.woff2);font-weight:700}
@font-face{font-family:I;src:url(file://${F}inter-latin-500-normal.woff2);font-weight:500}
@font-face{font-family:I;src:url(file://${F}inter-latin-600-normal.woff2);font-weight:600}
@font-face{font-family:I;src:url(file://${F}inter-latin-700-normal.woff2);font-weight:700}
@font-face{font-family:I;src:url(file://${F}inter-latin-800-normal.woff2);font-weight:800}
@font-face{font-family:S;src:url(file://${F}newsreader-latin-wght-normal.woff2);font-weight:200 800}
@font-face{font-family:S;font-style:italic;src:url(file://${F}newsreader-latin-wght-italic.woff2);font-weight:200 800}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1350px;overflow:hidden}
.s{position:relative;width:1080px;height:1350px;overflow:hidden;background:#fff;color:#4A4A4A;font-family:I,sans-serif}
.body{position:absolute;left:150px;right:150px;font-size:35px;line-height:1.78;text-align:justify;hyphens:auto;letter-spacing:.005em}
.body p+p,.body p+.bar,.body .bar+p,.body .rule+p,.body p+.rule,.body ul+p,.body p+ul{margin-top:44px}
.body em{font-style:italic}
.body b{color:#1E1E1E;font-weight:700}
.hl{background:#FFF1C2;box-decoration-break:clone;-webkit-box-decoration-break:clone;padding:2px 4px}
.bar{border-left:7px solid #D45D8F;padding-left:38px;color:#1E1E1E;font-weight:700;text-align:left}
.rule{border-top:1.5px solid #DADADA;border-bottom:1.5px solid #DADADA;padding:48px 20px;text-align:center;font-style:italic;font-weight:600;color:#333}
ul{list-style:none} ul li{position:relative;padding-left:66px} ul li+li{margin-top:30px}
ul li:before{content:"";position:absolute;left:18px;top:24px;width:11px;height:11px;border-radius:50%;background:#333}
.foot{position:absolute;left:120px;right:120px;bottom:78px;display:flex;align-items:center;gap:22px;font-size:23px;color:#A0A0A0}
.foot i{flex:1;height:1.5px;background:#C9C9C9}
.cap{text-align:center;font-size:31px;line-height:1.5;color:#8A8A8A}
`;
const page = (i, inner, opt = {}) => `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><div class="s">${inner}
${opt.noFoot ? '' : `<div class="foot"><span>@thinksafari</span><i></i><span>${i}</span></div>`}</div></body></html>`;

function dots() { let d = ''; for (let k = 0; k < 1000; k++) { const x = 8 + (k % 40) * 19.5, y = 8 + Math.floor(k / 40) * 19.5;
  d += `<circle cx="${x}" cy="${y}" r="${k < 700 ? 7 : 6}" fill="${k < 700 ? '#F0C24B' : '#fff'}" stroke="${k < 700 ? 'none' : '#C4C4C4'}" stroke-width="1.6"/>`; }
  return `<svg width="782" height="490" viewBox="0 0 782 490">${d}</svg>`; }

const S = [
 // 1 · cover: series + Substack card over the real engraving
 page(1, `<div style="position:absolute;inset:0;background:url(${img('bg1.jpg')}) center/cover"></div>
  <div style="position:absolute;left:118px;right:118px;top:120px;background:#fff;padding:36px 40px 40px">
   <div style="font-size:22px;letter-spacing:.07em;color:#7A7A7A;font-weight:500">STORIES YOU NEVER HEARD · A SERIES BY @THINKSAFARI</div>
   <div style="font-weight:700;font-size:56px;line-height:1.16;letter-spacing:-.015em;color:#111;margin-top:22px">A machine beat Napoleon at chess. There was a man inside it.</div>
   <div style="font-size:31px;line-height:1.5;color:#8A8A8A;margin-top:18px">For 84 years, nobody knew. And 250 years later, the same trick is still inside the AI you use.</div>
   <div style="font-size:22px;letter-spacing:.07em;color:#333;font-weight:600;margin-top:30px">SURAJ PANDITA · AI PRODUCT MANAGER</div>
   <div style="font-size:22px;letter-spacing:.07em;color:#8A8A8A;font-weight:500;margin-top:10px">NOV 26, 2026</div>
   <div style="height:1.5px;background:#E2E2E2;margin:30px 0"></div>
   <div style="height:300px;background:url(${img('bg2.jpg')}) center 42%/cover"></div>
  </div>
  <div style="position:absolute;left:0;right:0;bottom:56px;text-align:center;font-family:S,serif;font-weight:600;font-size:27px;color:#F7F2E8;text-shadow:0 1px 10px rgba(0,0,0,.75)">@thinksafari</div>`, { noFoot: true }),

 // 2 · opening
 page(2, `<div class="body" style="top:230px">
  <p><em>Let me tell you about a chess game from 1770.</em></p>
  <p>In Vienna, Wolfgang von Kempelen showed the court a wooden cabinet with a chessboard on top. Before every game, he opened its doors so everyone could see the gears inside.</p>
  <p><span class="hl"><em>Then the machine played. And it won.</em></span></p>
  <p>It toured Europe and America. Benjamin Franklin saw it in Paris. It played Napoleon, and Charles Babbage.</p></div>`),

 // 3 · the trick
 page(3, `<div class="body" style="top:210px">
  <p>People called it the first thinking machine. They argued for years about how it worked.</p>
  <p class="bar"><span class="hl">The gears did nothing. A chess master sat inside the cabinet, slid out of sight each time a door was opened, and played through magnets under the board.</span></p>
  <p>In 1836, Edgar Allan Poe wrote an essay arguing it had to be a person. He was right.</p></div>`),

 // 4 · image: what they were shown
 page(4, `<div style="position:absolute;left:150px;right:150px;top:200px;height:780px;background:url(${img('bg3.jpg')}) center/cover;border:1.5px solid #E2E2E2"></div>
  <div class="cap" style="position:absolute;left:150px;right:150px;top:1010px">What the audience was shown: gears.<br>What they weren’t: the man inside.</div>
  <div class="cap" style="position:absolute;left:150px;right:150px;top:1130px;font-size:20px;color:#B0B0B0">Engraving by Karl Gottlieb von Windisch, 1783 · public domain</div>`),

 // 5 · 84 years (centered italic between rules)
 page(5, `<div class="body" style="top:330px">
  <p style="text-align:center;font-weight:800;font-size:96px;line-height:1;color:#111;letter-spacing:-.03em">84 years.</p>
  <div class="rule" style="margin-top:60px">From 1770 until a fire destroyed it in Philadelphia in 1854, <b>a person pretended to be a machine, and the world believed it.</b></div></div>`),

 // 6 · 2005
 page(6, `<div class="body" style="top:230px">
  <p><em>You’d think we learned something.</em></p>
  <p>In 2005, Amazon launched a service that lets software send small tasks, like labelling a photo, to real people through an API.</p>
  <p>They named it after the chess machine: <b>Amazon Mechanical Turk.</b></p>
  <p class="bar"><span class="hl">Amazon called it “artificial artificial intelligence.”</span></p></div>`),

 // 7 · Just Walk Out (data image + caption)
 page(7, `<div style="position:absolute;left:149px;top:250px">${dots()}</div>
  <div class="cap" style="position:absolute;left:150px;right:150px;top:800px"><b style="color:#333">Amazon’s “Just Walk Out” stores, 2022.</b><br>About 700 of every 1,000 sales were reviewed by a team in India, The Information reported in 2024.</div>
  <div class="cap" style="position:absolute;left:150px;right:150px;top:1010px;font-size:24px;color:#ABABAB">Amazon said the team mainly helped train the AI.</div>`),

 // 8 · honest twist
 page(8, `<div class="body" style="top:200px">
  <p><em>But here’s the honest twist.</em></p>
  <p>In 2025, when the startup Builder.ai collapsed, the internet decided its AI had secretly been “700 Indian engineers.” It went viral everywhere.</p>
  <p class="bar"><span class="hl">It wasn’t true.</span> The Pragmatic Engineer, which had repeated it, spoke to former staff and retracted. They were outsourced app developers. The collapse was about money.</p>
  <p>Even stories about hidden truth can hide the truth.</p></div>`),

 // 9 · my take as an AI PM (bullets + highlighted close)
 page(9, `<div class="body" style="top:200px">
  <p>As an AI product manager, here’s what I take from this. Every AI has people inside it:</p>
  <ul style="margin-top:34px"><li>people who label the data it learns from,</li><li>people who review what it gets&nbsp;wrong,</li><li>and engineers who handle the cases it&nbsp;can’t.</li></ul>
  <p>Very often, those people are in India.</p>
  <p class="bar"><span class="hl">That isn’t the scandal. Hiding it is. So when a product says “fully automated”, ask where the humans are.</span></p></div>`),

 // 10 · closing card (slate card over the engraving, like the ref's last slide)
 page(10, `<div style="position:absolute;inset:0;background:url(${img('bg1.jpg')}) center/cover"></div>
  <div style="position:absolute;left:96px;right:96px;top:110px"><div style="background:#4B5A6E;border-radius:14px 14px 0 0;padding:58px 50px 44px;text-align:center">
   <div style="font-family:S,serif;font-size:60px;line-height:1.2;color:#F4F1EA">There’s always someone inside the box. The honest ones open the door.</div>
   <div style="font-size:23px;letter-spacing:.08em;color:#D5DAE2;font-weight:500;margin-top:34px">STORIES YOU NEVER HEARD · @THINKSAFARI</div>
   <div style="font-family:S,serif;font-style:italic;font-size:30px;color:#D5DAE2;margin-top:16px">${TAGLINE}</div>
  </div>
  <div style="height:360px;background:url(${img('bg2.jpg')}) center 42%/cover;border-radius:0 0 14px 14px"></div></div>
  <div style="position:absolute;left:96px;right:96px;top:1040px;background:rgba(255,255,255,.94);border-radius:14px;padding:26px 34px;text-align:center;font-size:27px;line-height:1.45;color:#333">Comment <b>TURK</b> and I’ll DM you 5 questions to ask any “AI5 questions to ask any “AI-powered” product. Follow for the next story.#8209;powered” product.<br>Follow for the next story.</div>`, { noFoot: true }),
];

(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  for (let i = 0; i < S.length; i++) {
    const f = path.join(OUT, `s${i + 1}.html`); fs.writeFileSync(f, S[i]);
    await pg.goto('file://' + f); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(200);
    const low = await pg.evaluate(() => [...document.querySelectorAll('.body')].map(e => Math.round(e.getBoundingClientRect().bottom)).filter(v => v > 1230));
    if (low.length) console.log('slide', i + 1, 'text runs into footer', low);
    await pg.screenshot({ path: path.join(OUT, `the-turk-${String(i + 1).padStart(2, '0')}.png`) });
  }
  await b.close(); console.log('done');
})();
