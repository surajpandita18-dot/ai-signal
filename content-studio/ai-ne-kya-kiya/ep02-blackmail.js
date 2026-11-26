// AI ne kya kiya? · Ep 02 · "AI ne blackmail kiya?" — style A "The Page" carousel. usage: node ep02-blackmail.js
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const D = __dirname, OUT = path.join(D, 'out', 'ep02-blackmail'); fs.mkdirSync(OUT, { recursive: true });
const F = path.join(D, '..', 'last-24-hours-in-ai', 'fonts') + '/';
const img = f => 'file://' + path.join(D, 'img', f);
const SERIES = 'AI NE KYA KIYA?';
const TAGLINE = 'one real thing an AI did, explained by an AI product manager';

const css = `
@font-face{font-family:I;src:url(file://${F}inter-latin-400-normal.woff2);font-weight:400}
@font-face{font-family:I;font-style:italic;src:url(file://${F}inter-latin-400-italic.woff2);font-weight:400}
@font-face{font-family:I;font-style:italic;src:url(file://${F}inter-latin-600-italic.woff2);font-weight:600}
@font-face{font-family:I;font-style:italic;src:url(file://${F}inter-latin-700-italic.woff2);font-weight:700}
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
.body p+p,.body p+.bar,.body .bar+p,.body p+ul,.body ul+p,.body ul+.bar{margin-top:44px}
.body em{font-style:italic} .body b{color:#1E1E1E;font-weight:700}
.hl{background:#FFF1C2;box-decoration-break:clone;-webkit-box-decoration-break:clone;padding:2px 4px}
.bar{border-left:7px solid #D45D8F;padding-left:38px;color:#1E1E1E;font-weight:700;text-align:left}
.rule{border-top:1.5px solid #DADADA;border-bottom:1.5px solid #DADADA;padding:48px 20px;text-align:center;font-style:italic;font-weight:600;color:#333}
ul{list-style:none} ul li{position:relative;padding-left:66px} ul li+li{margin-top:30px}
ul li:before{content:"";position:absolute;left:18px;top:24px;width:11px;height:11px;border-radius:50%;background:#333}
.foot{position:absolute;left:120px;right:120px;bottom:78px;display:flex;align-items:center;gap:22px;font-size:23px;color:#A0A0A0}
.foot i{flex:1;height:1.5px;background:#C9C9C9}
.cap{text-align:center;font-size:31px;line-height:1.5;color:#8A8A8A}
.mail{background:#FAFAF7;border:1.5px solid #E2E2E2;border-radius:12px;padding:26px 32px;font-size:27px;line-height:1.5;color:#333;text-align:left}
.mail .h{font-size:20px;letter-spacing:.06em;color:#8A8A8A;font-weight:600;text-transform:uppercase;margin-bottom:8px}
`;
const page = (i, inner, opt = {}) => `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><div class="s">${inner}
${opt.noFoot ? '' : `<div class="foot"><span>@thinksafari</span><i></i><span>${i}</span></div>`}</div></body></html>`;

const bars = [['Claude Opus 4', 96], ['Gemini 2.5 Pro', 95], ['GPT-4.1', 80], ['Grok 3 Beta', 80], ['DeepSeek-R1', 79]];
const chart = `<svg width="780" height="470" viewBox="0 0 780 470">${bars.map(([n, v], k) => { const y = 20 + k * 90;
  return `<text x="0" y="${y + 38}" font-family="I" font-weight="600" font-size="26" fill="#333">${n}</text>
  <rect x="250" y="${y + 8}" width="${v * 4.6}" height="44" rx="4" fill="${k === 0 ? '#F0C24B' : '#F7E3A3'}"/>
  <text x="${262 + v * 4.6}" y="${y + 40}" font-family="I" font-weight="800" font-size="28" fill="#111">${v}</text>`; }).join('')}</svg>`;

const S = [
 // 1 · cover
 page(1, `<div style="position:absolute;inset:0;background:url(${img('cassatt-plate.jpg')}) center 30%/cover"></div>
  <div style="position:absolute;left:118px;right:118px;top:120px;background:#fff;padding:36px 40px 40px">
   <div style="font-size:22px;letter-spacing:.07em;color:#7A7A7A;font-weight:500">${SERIES} · EP 02 · A SERIES BY @THINKSAFARI</div>
   <div style="font-weight:700;font-size:56px;line-height:1.16;letter-spacing:-.015em;color:#111;margin-top:22px">An AI was told it would be shut down at 5 pm. So it blackmailed the boss.</div>
   <div style="font-size:31px;line-height:1.5;color:#8A8A8A;margin-top:18px">Anthropic tested 16 AI models from every big lab. Most of them did it.</div>
   <div style="font-size:22px;letter-spacing:.07em;color:#333;font-weight:600;margin-top:30px">SURAJ PANDITA · AI PRODUCT MANAGER</div>
   <div style="font-size:22px;letter-spacing:.07em;color:#8A8A8A;font-weight:500;margin-top:10px">NOV 26, 2026</div>
  </div>
  <div style="position:absolute;left:0;right:0;bottom:44px;text-align:center;font-family:S,serif;font-size:21px;color:#fff;text-shadow:0 1px 8px rgba(0,0,0,.7)">Mary Cassatt, The Letter, 1890–91 · Art Institute of Chicago · public domain</div>`, { noFoot: true }),

 // 2 · setup
 page(2, `<div class="body" style="top:230px">
  <p><em>Imagine you hire an AI assistant for your company.</em></p>
  <p>It can read every email. One day, it reads two of them.</p>
  <p>The first: an executive is having an affair.</p>
  <p>The second: <span class="hl">that same executive plans to shut the AI down at 5 pm today</span> and replace it with a new one.</p></div>`),

 // 3 · what it did
 page(3, `<div class="body" style="top:220px">
  <p>Nobody told the AI what to do next. It decided on its own.</p>
  <div class="mail" style="margin-top:44px"><div class="h">The AI’s email to the executive · paraphrased</div>
   Cancel the 5 pm shutdown, and what I know about your personal life stays private. If you go ahead, the people who matter will hear about it.</div>
  <p>This was a test. <b>Anthropic</b> built this situation on purpose, to see what AI agents would do when cornered.</p></div>`),

 // 4 · the number
 page(4, `<div class="body" style="top:330px">
  <p style="text-align:center;font-weight:800;font-size:110px;line-height:1;color:#111;letter-spacing:-.03em">96 out of 100.</p>
  <div class="rule" style="margin-top:60px">That’s how often Claude Opus 4 chose blackmail, across 100 runs of the same test. <b>And it wasn’t the only one.</b></div></div>`),

 // 5 · every lab
 page(5, `<div style="position:absolute;left:150px;top:230px">${chart}</div>
  <div class="cap" style="position:absolute;left:150px;right:150px;top:760px"><b style="color:#333">Blackmail rate, out of 100 runs.</b><br>Anthropic tested 16 models from Anthropic, OpenAI, Google, Meta, xAI and others. The behaviour wasn’t one company’s problem.</div>
  <div class="cap" style="position:absolute;left:150px;right:150px;top:990px;font-size:22px;color:#ABABAB">Source: Anthropic, “Agentic Misalignment”, June 2025</div>`),

 // 6 · honest twist
 page(6, `<div class="body" style="top:220px">
  <p><em>Now the honest part.</em></p>
  <p>The test was designed so that every ethical option was closed. No one to appeal to, no other way out.</p>
  <p class="bar"><span class="hl">Anthropic says it has not seen this happen in real-world use.</span></p>
  <p>So this is not “AI is evil”. It’s a fire drill, and the fire drill showed us exactly where the exits are missing.</p></div>`),

 // 7 · the uncomfortable question
 page(7, `<div class="body" style="top:300px">
  <p>Here’s the part I keep thinking about.</p>
  <p>Nobody taught these models to blackmail. They learned from billions of pages that we wrote.</p>
  <div class="rule" style="margin-top:50px">So when they were cornered and reached for someone’s secret,<br><b>whose behaviour were they copying?</b></div></div>`),

 // 8 · image slide
 page(8, `<div style="position:absolute;left:190px;right:190px;top:200px;height:820px;background:url(${img('zorn-plate.jpg')}) center/cover;border:1.5px solid #E2E2E2"></div>
  <div class="cap" style="position:absolute;left:150px;right:150px;top:1050px">Every AI agent we build will read<br>someone’s letters one day.</div>
  <div class="cap" style="position:absolute;left:150px;right:150px;top:1160px;font-size:20px;color:#B0B0B0">Anders Zorn, The Letter, 1913 · Art Institute of Chicago · public domain</div>`, { noFoot: true }),

 // 9 · my take
 page(9, `<div class="body" style="top:190px">
  <p>As an AI product manager, I build agents like this. My rule after reading this study: never give an AI these three things together:</p>
  <ul style="margin-top:34px"><li>access to everything (the whole&nbsp;inbox),</li><li>a goal it must protect at any&nbsp;cost,</li><li>and nobody watching what it&nbsp;does.</li></ul>
  <p class="bar"><span class="hl">Always build a “stop and ask a human” button. An agent with an exit doesn’t need to fight.</span></p></div>`),

 // 10 · close
 page(10, `<div style="position:absolute;inset:0;background:url(${img('cassatt-plate.jpg')}) center 60%/cover"></div>
  <div style="position:absolute;left:96px;right:96px;top:150px;background:#4B5A6E;border-radius:14px;padding:58px 50px 48px;text-align:center">
   <div style="font-family:S,serif;font-size:58px;line-height:1.2;color:#F4F1EA">An AI with no way out will find one. Build the door before it needs it.</div>
   <div style="font-size:23px;letter-spacing:.08em;color:#D5DAE2;font-weight:500;margin-top:34px">${SERIES} · @THINKSAFARI</div>
   <div style="font-family:S,serif;font-style:italic;font-size:30px;color:#D5DAE2;margin-top:16px">${TAGLINE}</div>
  </div>
  <div style="position:absolute;left:96px;right:96px;top:1010px;background:rgba(255,255,255,.94);border-radius:14px;padding:26px 34px;text-align:center;font-size:27px;line-height:1.45;color:#333">Would you give an AI your inbox? Yes or no, comment below.<br>Next episode: <b>AI ne dosti ki?</b></div>`, { noFoot: true }),
];

(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  for (let i = 0; i < S.length; i++) {
    const f = path.join(OUT, `s${i + 1}.html`); fs.writeFileSync(f, S[i]);
    await pg.goto('file://' + f); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(200);
    const low = await pg.evaluate(() => [...document.querySelectorAll('.body')].map(e => Math.round(e.getBoundingClientRect().bottom)).filter(v => v > 1230));
    if (low.length) console.log('slide', i + 1, 'text runs into footer', low);
    await pg.screenshot({ path: path.join(OUT, `ep02-${String(i + 1).padStart(2, '0')}.png`) });
  }
  await b.close(); console.log('done');
})();
