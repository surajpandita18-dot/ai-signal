// Original editorial cards / motion-graphic key frames for "The Bigger Picture" (style frames for approval).
// Usage: node cards.js <outdir06> <outdir07>
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const O6 = path.resolve(process.argv[2]), O7 = path.resolve(process.argv[3]);
const NR = path.resolve(__dirname, 'node_modules/@fontsource/newsreader/files');
const IN = '/usr/share/fonts/opentype/inter';
const P = { paper: '#F1ECE2', ink: '#151515', red: '#E2412B', grey: '#6E6A62', rule: '#CFC7B6' };
const css = `
@font-face{font-family:NR;src:url(file://${NR}/newsreader-latin-400-normal.woff2);font-weight:400}
@font-face{font-family:NR;src:url(file://${NR}/newsreader-latin-500-normal.woff2);font-weight:500}
@font-face{font-family:NR;src:url(file://${NR}/newsreader-latin-600-normal.woff2);font-weight:600}
@font-face{font-family:NR;src:url(file://${NR}/newsreader-latin-400-italic.woff2);font-style:italic}
@font-face{font-family:I;src:url(file://${IN}/Inter-Medium.otf);font-weight:500}
@font-face{font-family:I;src:url(file://${IN}/Inter-SemiBold.otf);font-weight:600}
@font-face{font-family:I;src:url(file://${IN}/Inter-Bold.otf);font-weight:700}
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1920px;position:relative;overflow:hidden;font-family:I}
.paper{background:${P.paper};background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.3  0 0 0 0 0.27  0 0 0 0 0.2  0 0 0 .09 0'/></filter><rect width='400' height='400' filter='url(%23n)'/></svg>")}
.kick{font:600 24px I;letter-spacing:.22em;color:${P.red};text-transform:uppercase}
.mark{background:linear-gradient(transparent 58%, ${P.red}55 58%, ${P.red}55 92%, transparent 92%)}
.lab{position:absolute;font:500 20px I;letter-spacing:.12em;color:${P.grey};text-transform:uppercase}
`;
const card = (inner, top = 520) => `<div style="position:absolute;inset:0;background:#2b2a27"></div>
<div class="paper" style="position:absolute;left:70px;right:70px;top:${top}px;padding:64px 64px 56px;box-shadow:0 30px 80px rgba(0,0,0,.45);border-radius:6px">${inner}</div>`;

const F = {
  [O6 + '/quote_card_oladimeji_ajegbile.png']: card(`<div class="kick">Substack Note</div>
    <div style="margin-top:34px;font:500 54px/1.22 NR;color:${P.ink}">“If you don't spend enough time getting to know yourself, you'll end up absorbing <span class="mark">everyone else's definition of you.</span>”</div>
    <div style="margin-top:44px;height:2px;background:${P.rule}"></div>
    <div style="margin-top:26px;font:600 28px I;color:${P.ink}">Oladimeji Ajegbile</div>
    <div style="margin-top:8px;font:500 24px I;color:${P.grey}">Substack Note · 11 March 2026 · substack.com/@diimejii</div>`, 560),
  [O6 + '/citation_card_jc_weekly_scrapbook.png']: card(`<div style="font:italic 400 30px NR;color:${P.grey}">the weekly scrapbook</div>
    <div style="margin-top:26px;font:600 70px/1.08 NR;color:${P.ink}">your phone is the reason you have no identity</div>
    <div style="margin-top:28px;font:italic 400 36px/1.3 NR;color:${P.grey}">is your algorithm a reflection of you, or have you become nothing but a mirror of your algorithm?</div>
    <div style="margin-top:40px;height:2px;background:${P.rule}"></div>
    <div style="margin-top:24px;font:500 24px I;color:${P.grey}">jc · Substack essay · 15 November 2025</div>`, 520),
  [O7 + '/title_culture_industry.png']: `<div class="paper" style="position:absolute;inset:0"></div>
    <div style="position:absolute;left:90px;right:90px;top:640px">
    <div class="kick">A concept in philosophy</div>
    <div style="margin-top:30px;font:600 118px/1.0 NR;color:${P.ink}">The Culture<br>Industry</div>
    <div style="margin-top:40px;width:120px;height:6px;background:${P.red}"></div>
    <div style="margin-top:36px;font:500 32px/1.4 I;color:${P.ink}">Theodor W. Adorno &amp; Max Horkheimer</div>
    <div style="margin-top:6px;font:italic 400 34px NR;color:${P.grey}">Dialectic of Enlightenment, 1947</div></div>
    <div class="lab" style="left:90px;top:1210px;text-transform:none;letter-spacing:.02em;font-size:24px">Written decades before social media. Used here as a lens, not a prediction.</div>`,
  [O7 + '/diagram_recommendation_loop.png']: (() => {
    const N = ['You like<br>something once', 'It gets<br>recommended', 'More of<br>the same', 'Your feed feels<br>familiar', 'It starts to feel<br>like “your taste”'];
    const cx = 540, cy = 900, R = 300; let nodes = '', arcs = '';
    N.forEach((t, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / 5, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
      nodes += `<div style="position:absolute;left:${x - 125}px;top:${y - 62}px;width:250px;height:124px;border:3px solid ${i === 0 ? P.red : P.ink};background:${P.paper};border-radius:62px;display:flex;align-items:center;justify-content:center;text-align:center;font:600 25px/1.2 I;color:${P.ink}">${t}</div>`; });
    arcs = `<svg width="1080" height="1920" style="position:absolute;inset:0"><defs><marker id="m" markerWidth="12" markerHeight="12" refX="6" refY="6" orient="auto"><path d="M0,0 L12,6 L0,12 z" fill="${P.red}"/></marker></defs>
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${P.red}" stroke-width="4" stroke-dasharray="14 12"/>
      ${[0, 1, 2, 3, 4].map(i => { const a = -Math.PI / 2 + (i + .5) * 2 * Math.PI / 5; return `<path d="M${cx + R * Math.cos(a - .05)},${cy + R * Math.sin(a - .05)} L${cx + R * Math.cos(a + .02)},${cy + R * Math.sin(a + .02)}" stroke="${P.red}" stroke-width="4" marker-end="url(#m)"/>`; }).join('')}
      <circle cx="${cx + 470}" cy="${cy + 420}" r="16" fill="${P.ink}" opacity=".35"/></svg>`;
    return `<div class="paper" style="position:absolute;inset:0"></div>${arcs}${nodes}
      <div style="position:absolute;left:90px;top:330px" class="kick">How a recommendation loop works</div>
      <div style="position:absolute;left:90px;top:380px;font:600 60px/1.05 NR;color:${P.ink}">More of what you<br>already clicked</div>
      <div class="lab" style="right:90px;bottom:440px;text-align:right">something outside<br>the bubble →</div>
      <div class="lab" style="left:90px;bottom:330px">Illustration</div>`;
  })(),
  [O7 + '/graphic_same_opinions.png']: (() => {
    let b = ''; for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) b += `<div style="position:absolute;left:${110 + c * 300}px;top:${520 + r * 190}px;width:250px;height:130px;background:${r === 2 && c === 1 ? P.red : '#fff'};border:3px solid ${P.ink};border-radius:24px 24px 24px 4px">
      <div style="margin:34px 30px 0;height:10px;border-radius:5px;background:${r === 2 && c === 1 ? '#fff' : P.ink};opacity:.8"></div><div style="margin:18px 30px 0;width:60%;height:10px;border-radius:5px;background:${r === 2 && c === 1 ? '#fff' : P.ink};opacity:.5"></div></div>`;
    return `<div class="paper" style="position:absolute;inset:0"></div><div style="position:absolute;left:90px;top:330px" class="kick">…and even the same opinions</div>${b}<div class="lab" style="left:90px;bottom:330px">Illustration</div>`;
  })(),
  [O7 + '/hook_typography.png']: `<div style="position:absolute;inset:0;background:#2b2a27"></div>
    <div style="position:absolute;left:80px;right:80px;top:300px;font:600 96px/1.02 NR;color:${P.paper}">Your phone is the reason you have <span style="color:${P.red}">no identity.</span></div>
    <div class="lab" style="left:80px;top:250px;color:#bbb">Hook type · over your face in the edit</div>`,
  [O7 + '/end_card_bigger_picture.png']: `<div style="position:absolute;inset:0;background:${P.ink}"></div>
    <div style="position:absolute;left:0;right:0;top:820px;text-align:center"><div style="font:600 30px I;letter-spacing:.34em;color:${P.paper}">THE BIGGER PICTURE</div>
    <div style="margin:30px auto;width:80px;height:5px;background:${P.red}"></div>
    <div style="font:italic 400 44px NR;color:${P.paper}">the idea worth sharing</div></div>`,
};
(async () => {
  [O6, O7].forEach(d => fs.mkdirSync(d, { recursive: true }));
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  for (const [f, html] of Object.entries(F)) {
    const h = f + '.html'; fs.writeFileSync(h, `<html><head><style>${css}</style></head><body>${html}</body></html>`);
    await pg.goto('file://' + h); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(150);
    await pg.screenshot({ path: f }); fs.unlinkSync(h);
  }
  await b.close(); console.log('cards', Object.keys(F).length);
})();
