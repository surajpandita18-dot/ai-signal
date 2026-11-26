// Editorial graphics for "The Bigger Picture" Ep: overlays (transparent) + full-frame plates. node graphics.js <outdir> <assetsdir>
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const O = path.resolve(process.argv[2]), A = path.resolve(process.argv[3]);
const NR = path.resolve(__dirname, 'node_modules/@fontsource/newsreader/files'), IN = '/usr/share/fonts/opentype/inter';
const P = { paper: '#F1ECE2', ink: '#151515', red: '#E2412B', grey: '#6E6A62', rule: '#CFC7B6' };
const css = `
@font-face{font-family:NR;src:url(file://${NR}/newsreader-latin-500-normal.woff2);font-weight:500}
@font-face{font-family:NR;src:url(file://${NR}/newsreader-latin-600-normal.woff2);font-weight:600}
@font-face{font-family:NR;src:url(file://${NR}/newsreader-latin-400-italic.woff2);font-style:italic}
@font-face{font-family:I;src:url(file://${IN}/Inter-Medium.otf);font-weight:500}
@font-face{font-family:I;src:url(file://${IN}/Inter-SemiBold.otf);font-weight:600}
@font-face{font-family:I;src:url(file://${IN}/Inter-Bold.otf);font-weight:700}
*{margin:0;padding:0;box-sizing:border-box}html,body{width:1080px;height:1920px;background:transparent;overflow:hidden;position:relative;font-family:I}
.paper{background:${P.paper};background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.3  0 0 0 0 0.27  0 0 0 0 0.2  0 0 0 .09 0'/></filter><rect width='400' height='400' filter='url(%23n)'/></svg>")}
.kick{font:600 24px I;letter-spacing:.22em;color:${P.red};text-transform:uppercase}
.lab{position:absolute;font:500 20px I;letter-spacing:.1em;color:${P.grey};text-transform:uppercase}
.chip{position:absolute;right:70px;padding:18px 30px;border:3px solid ${P.red};background:rgba(21,21,21,.78);color:#fff;font:700 40px I;letter-spacing:.12em;border-radius:6px}
.mk{background:linear-gradient(transparent 55%, ${P.red}66 55%, ${P.red}66 93%, transparent 93%)}
`;
const img = (f) => `file://${A}/${f}`;
const F = {};
// hook type (overlay, lower area over the face)
F['ov_hook.png'] = `<div style="position:absolute;left:0;right:0;top:1180px;height:740px;background:linear-gradient(180deg,transparent,rgba(10,10,10,.78) 30%)"></div>
  <div style="position:absolute;left:70px;right:70px;top:1300px;font:600 84px/1.04 NR;color:${P.paper}">Your phone is the reason you have <span style="color:${P.red}">no identity.</span></div>`;
// tags (three cumulative overlays)
const tags = ['INSTAGRAM', 'YOUTUBE', 'ALGORITHM'];
for (let k = 1; k <= 3; k++) F[`ov_tags_${k}.png`] = tags.slice(0, k).map((t, i) => `<div class="chip" style="top:${560 + i * 110}px">${t}</div>`).join('');
// small credit / AI labels are drawn by ffmpeg drawtext later
// posters on blurred self background
for (const p of ['poster_the_truman_show_1998', 'poster_her_2013', 'poster_interstellar_2014', 'poster_fight_club_1999', 'poster_dead_poets_society_1989'])
  F[`pl_${p}.png`] = `<div style="position:absolute;inset:-60px;background:url(${img('01_Movie_References/' + p + '.jpg')}) center/cover;filter:blur(40px) brightness(.45) saturate(.8)"></div>
  <div style="position:absolute;left:110px;top:260px;width:860px;height:1290px;background:url(${img('01_Movie_References/' + p + '.jpg')}) center/cover;box-shadow:0 40px 90px rgba(0,0,0,.6)"></div>`;
// cafe triptych
F['pl_cafes.png'] = ['ai_05a_cafe', 'ai_05b_cafe', 'ai_05c_cafe'].map((c, i) => `<div style="position:absolute;top:0;bottom:0;left:${i * 363}px;width:354px;background:url(${img('08_AI_Illustrations_Gemini/' + c + '.png')}) ${30 + i * 20}% 0%/auto 2150px;filter:saturate(.92) contrast(1.03)"></div>`).join('') + `<div style="position:absolute;inset:0;background:#151515;z-index:-1"></div>`;
// portraits
F['pl_portraits.png'] = `<div class="paper" style="position:absolute;inset:0"></div>
  <div style="position:absolute;left:90px;top:300px" class="kick">The Frankfurt School</div>
  ${[['04_Adorno_and_Culture_Industry/adorno_portrait_supplied.jpg', 'Theodor W. Adorno', '1903–1969', 90], ['04_Adorno_and_Culture_Industry/horkheimer_portrait.jpg', 'Max Horkheimer', '1895–1973', 560]].map(([f, n, y, x]) => `
   <div style="position:absolute;left:${x}px;top:420px;width:430px;padding:18px 18px 70px;background:#fff;box-shadow:0 18px 50px rgba(0,0,0,.25);transform:rotate(${x < 300 ? -1.5 : 1.5}deg)">
    <div style="height:520px;background:url(${img(f)}) center 25%/cover;filter:grayscale(1) contrast(1.05)"></div>
    <div style="position:absolute;left:18px;bottom:18px;font:600 30px NR;color:${P.ink}">${n} <span style="font:500 20px I;color:${P.grey}">${y}</span></div></div>`).join('')}
  <div style="position:absolute;left:90px;right:90px;top:1130px;font:italic 400 40px/1.3 NR;color:${P.ink}">“The Culture Industry: Enlightenment as Mass Deception” — <span style="font-style:normal">in</span> Dialectic of Enlightenment, 1947</div>
  <div class="lab" style="left:90px;top:1290px;text-transform:none;letter-spacing:.02em;font-size:22px">Adorno: public domain (Wikimedia Commons) · Horkheimer: Jeremy J. Shapiro, CC BY-SA 3.0</div>`;
// standardised
F['pl_standardised.png'] = (() => {
  let g = ''; for (let r = 0; r < 6; r++) for (let c = 0; c < 4; c++) g += `<div style="position:absolute;left:${110 + c * 222}px;top:${430 + r * 175}px;width:196px;height:146px;border:3px solid ${P.ink};background:#fff"><div style="margin:22px auto 0;width:60%;height:62px;background:${P.ink};opacity:.85;clip-path:polygon(50% 0,100% 100%,0 100%)"></div><div style="margin:12px auto 0;width:70%;height:8px;background:${P.ink};opacity:.4"></div></div>`;
  return `<div class="paper" style="position:absolute;inset:0"></div><div style="position:absolute;left:90px;top:300px" class="kick">Mass-produced culture</div>${g}
   <div style="position:absolute;left:150px;top:820px;transform:rotate(-8deg);border:10px solid ${P.red};color:${P.red};font:800 104px I;letter-spacing:.06em;padding:8px 34px;background:rgba(241,236,226,.82)">STANDARDISED</div>
   <div class="lab" style="left:90px;top:1500px">Illustration</div>`;
})();
// loop diagram states 0..5 (labels follow the spoken order)
const L = ['You like something<br>once', 'More of the same', 'Your preferences become<br>predictable', 'Your feed becomes<br>familiar'];
const loop = (k) => {
  const cx = 540, cy = 930, R = 290; let nodes = '';
  L.forEach((t, i) => { const a = -Math.PI / 2 + i * Math.PI / 2, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a), on = i < k;
    nodes += `<div style="position:absolute;left:${Math.max(60, Math.min(1020 - 340, x - 170))}px;top:${y - 80}px;width:340px;height:160px;border:3px solid ${on ? P.red : '#bdb5a5'};background:${on ? '#fff' : P.paper};border-radius:80px;display:flex;align-items:center;justify-content:center;text-align:center;font:600 34px/1.18 I;color:${on ? P.ink : '#b0a898'}">${t}</div>`; });
  const arc = Math.min(k, 4);
  const svg = `<svg width="1080" height="1920" style="position:absolute;inset:0"><circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#d8d0c0" stroke-width="4" stroke-dasharray="14 12"/>
    ${arc > 1 ? `<path d="M ${cx} ${cy - R} A ${R} ${R} 0 ${arc > 3 ? 1 : 0} 1 ${cx + R * Math.cos(-Math.PI / 2 + (arc - 1) * Math.PI / 2)} ${cy + R * Math.sin(-Math.PI / 2 + (arc - 1) * Math.PI / 2)}" fill="none" stroke="${P.red}" stroke-width="5"/>` : ''}
    ${k >= 5 ? `<circle cx="${cx}" cy="${cy}" r="${R + 150}" fill="none" stroke="${P.ink}" stroke-width="3" opacity=".25"/><circle cx="960" cy="1500" r="22" fill="${P.ink}" opacity=".45"/>` : ''}</svg>`;
  return `<div class="paper" style="position:absolute;inset:0"></div>${svg}${nodes}
    <div style="position:absolute;left:90px;top:300px" class="kick">How a recommendation loop works</div>
    ${k >= 5 ? `<div class="lab" style="right:90px;top:1550px;text-align:right;color:${P.ink}">something outside<br>the bubble</div>` : ''}
    <div class="lab" style="left:90px;top:1640px">Illustration</div>`;
};
for (let k = 1; k <= 5; k++) F[`pl_loop_${k}.png`] = loop(k);

// ---- v2 refinement plates ----
F['pl_citation_big.png'] = `<div class="paper" style="position:absolute;inset:0"></div>
  <div style="position:absolute;left:80px;right:80px;top:330px">
   <div style="font:italic 400 40px NR;color:${P.grey}">the weekly scrapbook</div>
   <div style="margin-top:14px;font:500 26px I;color:${P.grey};letter-spacing:.04em">jc · Substack essay · 15 November 2025</div>
   <div style="margin-top:60px;font:600 112px/1.02 NR;color:${P.ink}"><span class="mk">your phone is the reason you have no identity</span></div>
   <div style="margin-top:50px;font:italic 400 46px/1.3 NR;color:${P.grey}">is your algorithm a reflection of you, or have you become nothing but a mirror of your algorithm?</div></div>
  <div class="lab" style="left:80px;top:1390px;text-transform:none;letter-spacing:.02em;font-size:22px">Essay title and subtitle as published · theweeklyscrapbook.substack.com</div>`;
F['pl_quote_big.png'] = `<div class="paper" style="position:absolute;inset:0"></div>
  <div style="position:absolute;left:80px;right:80px;top:330px">
   <div class="kick">Substack Note · March 2026</div>
   <div style="margin-top:44px;font:500 76px/1.16 NR;color:${P.ink}">“If you don't spend enough time getting to know yourself, you'll end up absorbing <span class="mk">everyone else's definition of you.</span>”</div>
   <div style="margin-top:56px;height:3px;background:${P.rule}"></div>
   <div style="margin-top:30px;font:600 36px I;color:${P.ink}">Oladimeji Ajegbile</div>
   <div style="margin-top:8px;font:500 26px I;color:${P.grey}">Substack Note, 11 March 2026 · substack.com/@diimejii</div></div>`;
const tit = (small) => `<div style="position:absolute;left:90px;top:${small ? 250 : 620}px" class="kick">A concept in philosophy</div>
  <div style="position:absolute;left:90px;right:90px;top:${small ? 300 : 680}px;font:600 ${small ? 92 : 132}px/1.0 NR;color:${P.ink}">The Culture${small ? ' ' : '<br>'}Industry</div>`;
F['pl_culture_title.png'] = `<div class="paper" style="position:absolute;inset:0"></div>${tit(false)}
  <div style="position:absolute;left:90px;top:1000px;width:120px;height:6px;background:${P.red}"></div>
  <div style="position:absolute;left:90px;top:1040px;font:italic 400 38px NR;color:${P.grey}">Dialectic of Enlightenment, 1947</div>`;
F['pl_culture_portraits.png'] = `<div class="paper" style="position:absolute;inset:0"></div>${tit(true)}
  ${[['04_Adorno_and_Culture_Industry/adorno_portrait_supplied.jpg', 'Theodor W. Adorno', '1903–1969', 50, -1.2, 'center 22%'], ['04_Adorno_and_Culture_Industry/horkheimer_portrait.jpg', 'Max Horkheimer', '1895–1973', 550, 1.2, 'center 30%']].map(([f, n, y, x, r, pos]) => `
   <div style="position:absolute;left:${x}px;top:470px;width:480px;padding:20px 20px 96px;background:#fff;box-shadow:0 20px 60px rgba(0,0,0,.28);transform:rotate(${r}deg)">
    <div style="height:640px;background:url(${img(f)}) ${pos}/cover;filter:grayscale(1) contrast(1.06)"></div>
    <div style="position:absolute;left:22px;bottom:46px;font:600 38px NR;color:${P.ink}">${n}</div>
    <div style="position:absolute;left:22px;bottom:16px;font:500 22px I;color:${P.grey}">${y}</div></div>`).join('')}
  <div class="lab" style="left:60px;top:1310px;text-transform:none;letter-spacing:.02em;font-size:21px">Adorno: public domain (Wikimedia Commons) · Horkheimer: Jeremy J. Shapiro, CC BY-SA 3.0 (Wikimedia Commons)</div>`;
const grid = (cnt, stamp) => { let g = ''; for (let i = 0; i < 24; i++) { const r = Math.floor(i / 4), c = i % 4, on = i < cnt;
   g += `<div style="position:absolute;left:${110 + c * 222}px;top:${430 + r * 175}px;width:196px;height:146px;border:3px solid ${on ? P.ink : '#d6cfc0'};background:${on ? '#fff' : 'transparent'}">${on ? `<div style="margin:22px auto 0;width:60%;height:62px;background:${P.ink};opacity:.85;clip-path:polygon(50% 0,100% 100%,0 100%)"></div><div style="margin:12px auto 0;width:70%;height:8px;background:${P.ink};opacity:.4"></div>` : ''}</div>`; }
  return `<div class="paper" style="position:absolute;inset:0"></div><div style="position:absolute;left:90px;top:300px" class="kick">Mass-produced culture</div>${g}
   ${stamp ? `<div style="position:absolute;left:150px;top:820px;transform:rotate(-8deg);border:10px solid ${P.red};color:${P.red};font:800 104px I;letter-spacing:.06em;padding:8px 34px;background:rgba(241,236,226,.85)">STANDARDISED</div>` : ''}
   <div class="lab" style="left:90px;top:1500px">Illustration</div>`; };
F['pl_std_1.png'] = grid(4, false); F['pl_std_2.png'] = grid(12, false); F['pl_std_3.png'] = grid(24, false); F['pl_std_4.png'] = grid(24, true);
(async () => {
  fs.mkdirSync(O, { recursive: true });
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  for (const [n, html] of Object.entries(F)) {
    const h = path.join(O, '_' + n + '.html'); fs.writeFileSync(h, `<html><head><style>${css}</style></head><body>${html}</body></html>`);
    await pg.goto('file://' + h); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(200);
    await pg.screenshot({ path: path.join(O, n), omitBackground: n.startsWith('ov_') }); fs.unlinkSync(h);
  }
  await b.close(); console.log('graphics', Object.keys(F).length);
})();
