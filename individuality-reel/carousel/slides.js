// @thinksafari carousel: "Your taste might not be yours" (1080x1350). node slides.js
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const D = __dirname, OUT = D + '/out', A = D + '/assets';
const NR = '/tmp/claude-0/-home-user-ai-signal/5976107c-b177-5eb8-bcfe-35877bf990a4/scratchpad/indiv/ep3/project/node_modules/@fontsource/newsreader/files', IN = '/usr/share/fonts/opentype/inter';
const P = { paper: '#F6F1E7', ink: '#1B1A17', saf: '#E39B2D', ox: '#9E2B25', mut: '#6B6355' };
const N = 9;
const grain = (op, mode) => `<div style="position:absolute;inset:0;pointer-events:none;mix-blend-mode:${mode};opacity:${op};background-image:url(&quot;data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>&quot;)"></div>`;
const css = `
@font-face{font-family:NR;src:url(file://${NR}/newsreader-latin-400-normal.woff2);font-weight:400}
@font-face{font-family:NR;src:url(file://${NR}/newsreader-latin-500-normal.woff2);font-weight:500}
@font-face{font-family:NR;src:url(file://${NR}/newsreader-latin-600-normal.woff2);font-weight:600}
@font-face{font-family:NR;src:url(file://${NR}/newsreader-latin-400-italic.woff2);font-weight:400;font-style:italic}
@font-face{font-family:NR;src:url(file://${NR}/newsreader-latin-500-italic.woff2);font-weight:500;font-style:italic}
@font-face{font-family:I;src:url(file://${IN}/Inter-Medium.otf);font-weight:500}
@font-face{font-family:I;src:url(file://${IN}/Inter-SemiBold.otf);font-weight:600}
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1350px;position:relative;overflow:hidden;font-family:NR}
.dark{background:radial-gradient(120% 90% at 30% 20%,#2a2722,${P.ink} 70%);color:${P.paper}}
.light{background:radial-gradient(120% 90% at 70% 10%,#FBF7EF,${P.paper} 60%);color:${P.ink}}
.lab{font:600 24px I;letter-spacing:.18em;text-transform:uppercase}
.top{position:absolute;left:96px;right:96px;top:84px;display:flex;justify-content:space-between}
.h{font-weight:500;letter-spacing:-.01em}
.b{font:400 43px/1.38 NR}
.src{position:absolute;left:96px;right:96px;bottom:110px;font:500 22px/1.4 I;letter-spacing:.02em}
em{font-style:italic}
`;
const top = (dark, label, i) => `<div class="top lab" style="color:${dark ? P.saf : P.ox}"><span>${label}</span><span style="color:${dark ? '#8d8576' : P.mut}">${i} / ${N}</span></div>`;
const S = [];
// 1 cover — the feed of sameness (a grid of identical cards, one different)
S.push(['dark', (() => {
  let g = ''; for (let r = 0; r < 6; r++) for (let c = 0; c < 4; c++) { const odd = r === 3 && c === 2;
    g += `<div style="position:absolute;left:${c * 196}px;top:${r * 196}px;width:176px;height:176px;border-radius:14px;background:${odd ? P.saf : '#3a362f'};box-shadow:0 10px 30px rgba(0,0,0,.35)">
      <div style="margin:26px 22px 0;height:72px;border-radius:8px;background:${odd ? '#f3c27a' : '#4a453c'}"></div>
      <div style="margin:16px 22px 0;height:10px;border-radius:5px;background:${odd ? P.ink : '#565046'};width:70%"></div>
      <div style="margin:10px 22px 0;height:10px;border-radius:5px;background:${odd ? P.ink : '#565046'};width:45%"></div></div>`; }
  return `<div style="position:absolute;left:420px;top:-60px;width:800px;height:1200px;transform:rotate(-8deg);opacity:.95">${g}</div>
  <div style="position:absolute;inset:0;background:linear-gradient(90deg,${P.ink} 30%,rgba(27,26,23,.85) 52%,rgba(27,26,23,0) 85%)"></div>
  ${top(1, 'Deep Read · Substack', 1)}
  <div style="position:absolute;left:96px;top:400px;width:640px">
    <div class="h" style="font-size:112px;line-height:1.0">Your taste might not be <em style="color:${P.saf}">yours.</em></div>
    <div style="margin-top:44px;font:italic 400 40px/1.35 NR;color:#d9d1c1">A Substack essay asked a question I can't stop thinking about. Swipe.</div></div>`; })()]);
// 2 setup — the essay (real screenshot)
S.push(['light', `${top(0, 'The essay', 2)}
  <div class="h" style="position:absolute;left:96px;right:96px;top:170px;font-size:64px;line-height:1.08">In November 2025, a writer called JC published this on Substack.</div>
  <img src="file://${A}/essay_header.png" style="position:absolute;left:96px;top:410px;left:120px;width:840px;border-radius:14px;box-shadow:0 30px 70px rgba(27,26,23,.35);transform:rotate(-1.2deg)">
  <div class="b" style="position:absolute;left:96px;right:96px;top:1060px">The question in the subtitle is the whole game: <em>are you choosing what you like, or is it choosing you?</em></div>`]);
// 3 turn 1 — the post that started it
S.push(['light', `${top(0, 'Where it started', 3)}
  <div class="h" style="position:absolute;left:96px;right:96px;top:170px;font-size:62px;line-height:1.08">JC opens with an Instagram post. The algorithm is the one talking.</div>
  <div style="position:absolute;left:96px;right:96px;top:420px;padding:56px 60px;background:#fff;border-radius:16px;box-shadow:0 24px 60px rgba(27,26,23,.18)">
    <div style="font:500 44px/1.36 NR">“I'm literally an algorithm designed to maintain your attention by learning from your behavior and <span style="background:linear-gradient(transparent 60%,${P.saf}66 60%)">mirroring it back</span>…”</div>
    <div style="margin-top:34px;font:500 40px/1.36 NR">“…you aren't merely disturbed by social media, but that you are <span style="background:linear-gradient(transparent 60%,${P.saf}66 60%)">disturbed by your own reflection.</span>”</div></div>
  <div class="src" style="color:${P.mut}">Quoted in JC, “your phone is the reason you have no identity”, The Weekly Scrapbook, 15 Nov 2025</div>`]);
// 4 big number
S.push(['dark', `${top(1, 'The proof', 4)}
  <div style="position:absolute;left:84px;top:200px;font:500 380px/1 NR;color:${P.saf};letter-spacing:-.03em">80%</div>
  <div class="h" style="position:absolute;left:96px;right:96px;top:640px;font-size:58px;line-height:1.12">of the hours people stream on Netflix are shaped by what Netflix recommends.</div>
  <div class="b" style="position:absolute;left:96px;right:96px;top:870px;color:#d9d1c1">That's not a critic saying it. That's Netflix's own engineers, in their own paper. We call it taste. A lot of it is a menu.</div>
  <div class="src" style="color:#8d8576">Gomez-Uribe &amp; Hunt (Netflix), “The Netflix Recommender System”, ACM Transactions on Management Information Systems, 2015</div>`]);
// 5 twist — 1947
S.push(['light', `${top(0, 'The twist', 5)}
  <div class="h" style="position:absolute;left:96px;right:96px;top:170px;font-size:66px;line-height:1.06">But this fear is older than the internet. Much older.</div>
  <div class="b" style="position:absolute;left:96px;right:96px;top:350px">In 1947, philosophers Theodor Adorno and Max Horkheimer named it the <b style="font-weight:600">Culture Industry</b>: films, radio and magazines made on an assembly line, sold as personal choice.</div>
  <div style="position:absolute;left:96px;right:96px;top:690px;border-left:8px solid ${P.ox};padding:6px 0 6px 44px">
    <div style="font:italic 500 64px/1.12 NR;color:${P.ox}">“Culture today is infecting everything with sameness.”</div></div>
  <div class="b" style="position:absolute;left:96px;right:96px;top:960px;color:${P.mut}">Algorithms didn't invent this. They made it personal, and made it faster.</div>
  <div class="src" style="color:${P.mut}">Horkheimer &amp; Adorno, Dialectic of Enlightenment (1947), Jephcott trans., Stanford UP 2002, p. 94</div>`]);
// 6 synthesis visual — reflection vs mirror
S.push(['light', (() => {
  const loop = `<svg width="888" height="580" style="position:absolute;left:96px;top:330px">
    <defs><marker id="m" markerWidth="14" markerHeight="14" refX="7" refY="7" orient="auto"><path d="M0,0 L14,7 L0,14z" fill="${P.ox}"/></marker></defs>
    <g font-family="I" font-weight="600" font-size="26" letter-spacing="2" fill="${P.mut}"><text x="0" y="24">REFLECTION</text><text x="470" y="24">MIRROR</text></g>
    <g fill="none" stroke="${P.ink}" stroke-width="4"><circle cx="110" cy="200" r="70"/><rect x="250" y="130" width="140" height="140" rx="18"/></g>
    <path d="M185,200 L238,200" stroke="${P.ox}" stroke-width="5" marker-end="url(#m)"/>
    <g font-family="NR" font-size="32" fill="${P.ink}" text-anchor="middle"><text x="110" y="210">you</text><text x="320" y="210">feed</text></g>
    <text x="0" y="350" font-family="NR" font-size="34" fill="${P.ink}"><tspan x="0">The feed shows</tspan><tspan x="0" dy="44">who you are.</tspan></text>
    <line x1="440" y1="40" x2="440" y2="520" stroke="#DCD6C8" stroke-width="3"/>
    <circle cx="680" cy="230" r="140" fill="none" stroke="${P.ox}" stroke-width="5" stroke-dasharray="16 12"/><path d="M780,131 A140,140 0 0 1 800,150" fill="none" stroke="${P.ox}" stroke-width="5" marker-end="url(#m)"/><path d="M580,329 A140,140 0 0 1 560,310" fill="none" stroke="${P.ox}" stroke-width="5" marker-end="url(#m)"/><rect x="625.0" y="64" width="110" height="52" rx="26" fill="${P.paper}" stroke="${P.ink}" stroke-width="3"/><text x="680" y="100" font-family="NR" font-size="30" fill="${P.ink}" text-anchor="middle">you</text><rect x="765.0" y="204" width="110" height="52" rx="26" fill="${P.paper}" stroke="${P.ink}" stroke-width="3"/><text x="820" y="240" font-family="NR" font-size="30" fill="${P.ink}" text-anchor="middle">click</text><rect x="625.0" y="344" width="110" height="52" rx="26" fill="${P.paper}" stroke="${P.ink}" stroke-width="3"/><text x="680" y="380" font-family="NR" font-size="30" fill="${P.ink}" text-anchor="middle">feed</text><rect x="465.0" y="204" width="150" height="52" rx="26" fill="${P.paper}" stroke="${P.ink}" stroke-width="3"/><text x="540" y="240" font-family="NR" font-size="30" fill="${P.ink}" text-anchor="middle">more of it</text><text x="470" y="470" font-family="NR" font-size="34" fill="${P.ink}"><tspan x="470">You become what</tspan><tspan x="470" dy="44">the feed shows.</tspan></text></svg>`;
  return `${top(0, 'The difference', 6)}
  <div class="h" style="position:absolute;left:96px;right:96px;top:170px;font-size:62px;line-height:1.08">A reflection copies you. A mirror loop slowly <em>edits</em> you.</div>${loop}
  <div class="b" style="position:absolute;left:96px;right:96px;top:960px">Each click teaches the feed. The feed teaches you back. After a while, nobody can say who started it.</div>`; })()]);
// 7 honest twist — fairness
S.push(['dark', `${top(1, 'To be fair', 7)}
  <div class="h" style="position:absolute;left:96px;right:96px;top:170px;font-size:64px;line-height:1.08">So is it all the algorithm's fault? Not quite.</div>
  <div class="b" style="position:absolute;left:96px;right:96px;top:380px;color:#e6dfd0">Critics have long called Adorno elitist and short on evidence. Plenty of people find real, strange, wonderful things online.</div>
  <div class="b" style="position:absolute;left:96px;right:96px;top:640px;color:#e6dfd0">And the feed only offers. <span style="color:${P.saf}">We are the ones who keep saying yes.</span></div>
  <div class="b" style="position:absolute;left:96px;right:96px;top:880px;font-style:italic;color:#b8af9e">The problem isn't recommendations. It's forgetting how to look without one.</div>`]);
// 8 meaning — the quote + what to do
S.push(['light', `${top(0, 'What to do with this', 8)}
  <div style="position:absolute;left:96px;right:96px;top:170px;padding:48px 52px;background:${P.ink};color:${P.paper};border-radius:16px;box-shadow:0 24px 60px rgba(27,26,23,.3)">
    <div style="font:500 46px/1.28 NR">“If you don't spend enough time getting to know yourself, you'll end up absorbing <span style="color:${P.saf}">everyone else's definition of you.</span>”</div>
    <div style="margin-top:26px;font:500 22px I;letter-spacing:.04em;color:#a49c8c">OLADIMEJI AJEGBILE · SUBSTACK NOTE, 11 MARCH 2026</div></div>
  <div class="lab" style="position:absolute;left:96px;top:690px;color:${P.ox}">Try this week</div>
  <div class="b" style="position:absolute;left:96px;right:96px;top:740px;font-size:41px">
    <div>1. Pick one album or book by its cover, not its rating.</div>
    <div style="margin-top:18px">2. Search for something instead of scrolling for it.</div>
    <div style="margin-top:18px">3. Like one thing nobody you know likes. Notice why.</div></div>`]);
// 9 close
S.push(['dark', `${top(1, 'One question', 9)}
  <div class="h" style="position:absolute;left:96px;right:96px;top:230px;font-size:84px;line-height:1.06">If nobody recommended anything to you for a month, <em style="color:${P.saf}">what would you still love?</em></div>
  <div style="position:absolute;left:96px;right:96px;top:830px;border:2px solid ${P.saf};border-radius:16px;padding:40px 44px">
    <div style="font:500 40px/1.35 NR">Send this to the friend whose taste you actually trust.</div>
    <div style="margin-top:14px;font:italic 400 34px NR;color:#b8af9e">Save it for the next time your feed feels like a mirror.</div></div>
  <div class="lab" style="position:absolute;left:96px;bottom:110px;color:#8d8576">Follow @thinksafari for more deep reads</div>`]);
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  for (let i = 0; i < S.length; i++) { const [mode, body] = S[i]; const f = D + '/_s.html';
    fs.writeFileSync(f, `<html><head><style>${css}</style></head><body class="${mode}">${body}${mode === 'dark' ? grain(.07, 'screen') : grain(.16, 'multiply')}</body></html>`);
    await pg.goto('file://' + f); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(250);
    await pg.screenshot({ path: `${OUT}/your-taste-slide-${i + 1}.png` }); }
  fs.unlinkSync(D + '/_s.html'); await b.close(); console.log('slides', S.length);
})();
