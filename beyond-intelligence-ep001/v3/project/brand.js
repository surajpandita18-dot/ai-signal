// Beyond Intelligence brand kit renderer. Usage: node brand.js <outdir>
const path = require('path');
const { chromium } = require('playwright');

const OUT = path.resolve(process.argv[2]);
const F = '/usr/share/fonts/opentype/inter/';

const C = { bg: '#121110', bg2: '#1B1916', ink: '#EDE8DE', amber: '#D99A3D', grey: '#8C867B', hair: '#2E2B26' };

const css = `
@font-face{font-family:I;src:url(file://${F}Inter-Light.otf);font-weight:300}
@font-face{font-family:I;src:url(file://${F}Inter-Regular.otf);font-weight:400}
@font-face{font-family:I;src:url(file://${F}Inter-Medium.otf);font-weight:500}
@font-face{font-family:I;src:url(file://${F}Inter-SemiBold.otf);font-weight:600}
@font-face{font-family:I;src:url(file://${F}Inter-Bold.otf);font-weight:700}
*{margin:0;padding:0;box-sizing:border-box}
html,body{background:transparent;font-family:I,sans-serif;color:${C.ink};-webkit-font-smoothing:antialiased}
.grain{position:absolute;inset:0;pointer-events:none;opacity:.07;mix-blend-mode:overlay;
 background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>")}
.vig{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,transparent 40%,rgba(0,0,0,.55) 100%)}
`;

// The mark: a 3x3 lattice (Go intersections / network nodes) and one amber node
// that has stepped outside the grid -> "beyond".
function mark(size, { stroke = C.ink, accent = C.amber, line = true } = {}) {
  const s = size, g = s / 4.2, o = s * 0.14, r = s * 0.052, lw = Math.max(1.2, s * 0.018);
  let el = '';
  if (line) for (let i = 0; i < 3; i++) {
    el += `<line x1="${o}" y1="${o + 2 * g - i * g + g * 0}" x2="${o + 2 * g}" y2="${o + 2 * g - i * g}" stroke="${stroke}" stroke-opacity=".35" stroke-width="${lw}"/>`;
    el += `<line x1="${o + i * g}" y1="${o + 0 + g * 0}" x2="${o + i * g}" y2="${o + 2 * g}" stroke="${stroke}" stroke-opacity=".35" stroke-width="${lw}"/>`;
  }
  // grid sits in lower-left; shift down so the escaped node has room top-right
  const dy = g * 0.9;
  let nodes = '';
  for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++)
    nodes += `<circle cx="${o + x * g}" cy="${o + y * g}" r="${r}" fill="${stroke}"/>`;
  const ex = o + 2 * g + g * 0.95, ey = o - g * 0.95;
  const esc = `<line x1="${o + 2 * g}" y1="${o}" x2="${ex}" y2="${ey}" stroke="${accent}" stroke-width="${lw}" stroke-dasharray="${lw * 2.2} ${lw * 2}"/>
  <circle cx="${ex}" cy="${ey}" r="${r * 1.35}" fill="${accent}"/>`;
  return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}"><g transform="translate(0 ${dy})">${el}${nodes}${esc}</g></svg>`;
}

function word(sz, { gap = 0.42, color = C.ink } = {}) {
  return `<div style="line-height:.92;letter-spacing:${gap}em;font-weight:300;font-size:${sz}px;color:${color};margin-right:-${gap}em">BEYOND</div>
  <div style="line-height:1.05;letter-spacing:.06em;font-weight:700;font-size:${sz * 1.0}px;color:${color};margin-top:${sz * .12}px">INTELLIGENCE</div>`;
}

const pages = {
  // 1. Primary horizontal lockup (dark)
  'logo-horizontal-dark': { w: 2400, h: 900, html: `<div style="width:100%;height:100%;background:${C.bg};display:flex;align-items:center;justify-content:center;gap:90px;position:relative">
    ${mark(360)}<div style="border-left:2px solid ${C.hair};padding-left:90px">${word(118)}
    <div style="margin-top:44px;font-size:34px;letter-spacing:.14em;color:${C.grey};font-weight:400">UNDERSTANDING THE INTELLIGENCE BEHIND THE MACHINES</div></div><div class="grain"></div></div>` },
  // 1b. Transparent horizontal lockup (no tagline)
  'logo-horizontal-transparent': { w: 2000, h: 600, transparent: true, html: `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;gap:70px">${mark(300)}<div>${word(112)}</div></div>` },
  // 1c. Stacked lockup
  'logo-stacked-dark': { w: 1600, h: 1600, html: `<div style="width:100%;height:100%;background:${C.bg};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative">
    ${mark(380)}<div style="margin-top:70px">${word(120)}</div>
    <div style="margin-top:50px;font-size:30px;letter-spacing:.14em;color:${C.grey}">UNDERSTANDING THE INTELLIGENCE<br>BEHIND THE MACHINES</div><div class="grain"></div></div>` },
  // 2. Monogram / profile picture
  'monogram-profile': { w: 1080, h: 1080, html: `<div style="width:100%;height:100%;background:${C.bg};display:flex;align-items:center;justify-content:center;position:relative">${mark(620)}<div class="grain"></div></div>` },
  'monogram-transparent': { w: 1024, h: 1024, transparent: true, html: `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center">${mark(900)}</div>` },
  // 3. Watermark (transparent, sized for 1080x1920 overlay)
  'watermark': { w: 420, h: 60, transparent: true, html: `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:flex-end;gap:12px;opacity:.55">
    ${mark(40, { line: false })}<div style="font-size:19px;letter-spacing:.2em;font-weight:600;text-shadow:0 1px 3px rgba(0,0,0,.6)">BEYOND INTELLIGENCE</div></div>` },
  // 5. Lower third (transparent overlay 1080x1920)
  'lower-third': { w: 1080, h: 1920, transparent: true, html: `<div style="position:absolute;left:72px;top:1120px">
    <div style="display:flex;align-items:stretch;gap:22px"><div style="width:5px;background:${C.amber}"></div>
    <div style="background:rgba(18,17,16,.82);padding:22px 34px 24px 28px;backdrop-filter:blur(4px)">
      <div style="font-size:46px;font-weight:700;letter-spacing:.12em">SURAJ PANDITA</div>
      <div style="font-size:30px;font-weight:400;color:${C.grey};margin-top:8px;letter-spacing:.03em">AI Product Manager</div></div></div></div>` },
};

// 6. Section title card (overlay) + 4. end card + 7. cover — templated
function sectionTitle(label, kicker) {
  return { w: 1080, h: 1920, transparent: true, html: `<div style="position:absolute;left:72px;right:72px;top:300px">
    <div style="font-size:24px;letter-spacing:.3em;color:${C.amber};font-weight:600">${kicker}</div>
    <div style="height:2px;width:90px;background:${C.amber};margin:20px 0 24px"></div>
    <div style="font-size:78px;font-weight:700;letter-spacing:.04em;line-height:1.02;text-shadow:0 2px 20px rgba(0,0,0,.6)">${label}</div></div>` };
}
function endCard(ep, title) {
  return { w: 1080, h: 1920, html: `<div style="width:100%;height:100%;background:${C.bg};position:relative;display:flex;flex-direction:column;align-items:center;text-align:center">
    <div style="margin-top:560px">${mark(260)}</div>
    <div style="margin-top:54px">${word(78)}</div>
    <div style="margin-top:30px;font-size:26px;color:${C.grey};letter-spacing:.06em">Understanding the intelligence behind the machines.</div>
    <div style="margin-top:110px;font-size:24px;letter-spacing:.35em;color:${C.amber};font-weight:600">EPISODE ${ep}</div>
    <div style="margin-top:22px;font-size:40px;font-weight:600;letter-spacing:.04em;line-height:1.2;max-width:820px">${title}</div>
    <div style="position:absolute;bottom:380px;left:0;right:0;font-size:24px;color:${C.grey};letter-spacing:.08em">Created by</div>
    <div style="position:absolute;bottom:322px;left:0;right:0;font-size:32px;font-weight:600;letter-spacing:.14em">SURAJ PANDITA</div>
    <div style="position:absolute;bottom:280px;left:0;right:0;font-size:24px;color:${C.grey};letter-spacing:.04em">AI Product Manager</div>
    <div class="vig"></div><div class="grain"></div></div>` };
}
function titleCard(ep, title) {
  return { w: 1080, h: 1920, html: `<div style="width:100%;height:100%;background:${C.bg};position:relative">
    <div style="position:absolute;left:80px;top:560px;display:flex;align-items:center;gap:22px">${mark(70, { line: false })}<div style="font-size:22px;letter-spacing:.26em;font-weight:600">BEYOND INTELLIGENCE</div></div>
    <div style="position:absolute;left:80px;top:760px;font-size:24px;letter-spacing:.35em;color:${C.amber};font-weight:600">EPISODE ${ep}</div>
    <div style="position:absolute;left:80px;right:80px;top:820px;font-size:92px;font-weight:700;line-height:1.02;letter-spacing:.01em">${title}</div>
    <div class="vig"></div><div class="grain"></div></div>` };
}
function cover(ep, line, img) {
  return { w: 1080, h: 1920, html: `<div style="width:100%;height:100%;background:${C.bg};position:relative;overflow:hidden">
    ${img ? `<div style="position:absolute;inset:0;background:url(file://${img}) 78% 40%/cover;filter:grayscale(.55) contrast(1.08) brightness(.62) sepia(.15)"></div>` : ''}
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(18,17,16,.15) 0%,rgba(18,17,16,.35) 40%,rgba(18,17,16,.96) 72%)"></div>
    <div style="position:absolute;left:76px;top:330px;display:flex;align-items:center;gap:20px">${mark(64, { line: false })}<div style="font-size:24px;letter-spacing:.26em;font-weight:600">BEYOND INTELLIGENCE</div></div>
    <div style="position:absolute;left:76px;right:76px;top:1090px">
      <div style="font-size:26px;letter-spacing:.35em;color:${C.amber};font-weight:600">EPISODE ${ep}</div>
      <div style="height:3px;width:110px;background:${C.amber};margin:26px 0 30px"></div>
      <div style="font-size:112px;font-weight:700;line-height:.98;letter-spacing:-.005em">${line}</div></div>
    <div class="grain"></div></div>` };
}

const ART = process.argv[3]; // optional cover image path
Object.assign(pages, {
  'template-section-title': sectionTitle('MOVE 37', 'GAME 2 · 2016'),
  'template-end-card': endCard('001', 'ALPHAGO: THE MOVE THAT<br>SURPRISED THE WORLD'),
  'template-title-card': titleCard('001', 'ALPHAGO:<br>THE MOVE THAT<br>SURPRISED<br>THE WORLD'),
  'cover-ep001': cover('001', 'THE AI THAT<br>SURPRISED<br><span style="color:' + C.amber + '">THE WORLD</span>', ART),
});

(async () => {
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  for (const [name, p] of Object.entries(pages)) {
    const pg = await b.newPage({ viewport: { width: p.w, height: p.h } });
    const f = path.join(OUT, '_' + name + '.html');
    require('fs').writeFileSync(f, `<html><head><style>${css}</style></head><body style="width:${p.w}px;height:${p.h}px;position:relative">${p.html}</body></html>`);
    await pg.goto('file://' + f, { waitUntil: 'load' });
    await pg.evaluate(() => document.fonts.ready);
    await pg.screenshot({ path: path.join(OUT, name + '.png'), omitBackground: !!p.transparent });
    await pg.close();
  }
  await b.close();
  for (const n of Object.keys(pages)) require('fs').unlinkSync(path.join(OUT, '_' + n + '.html'));
  console.log('rendered', Object.keys(pages).length);
})();
