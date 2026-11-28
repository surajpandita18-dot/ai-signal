// "Last 7 days in AI" — doodle format (white page, huge bold sans, hand-drawn line art, red/blue/yellow pops,
// real source screenshots). Usage: node weekly-doodle.js issues/<date>-weekNN.doodle.js
// The data file exports { week, range, cover, stories[], verdict, take, quiz } — see issues/2026-11-28-week01.doodle.js.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const F = path.join(__dirname, 'fonts') + '/';
const R = '#E5383B', B = '#2F6FEB', Y = '#FFC83D', K = '#151515';
const file = path.resolve(process.argv[2]); const d = require(file);
const OUT = file.replace(/\.doodle\.js$/, '-doodle'); fs.mkdirSync(OUT, { recursive: true });
const N = d.stories.length + 4;

// doodle helpers (also passed to the data file's doodle functions)
const st = `stroke="${K}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
const sf = fill => `fill="${fill}" stroke="${K}" stroke-width="5" stroke-linejoin="round"`;
const T = (x, y, t, s = 30, w = 700, a = 'middle', c = K) => `<text x="${x}" y="${y}" font-family="H" font-size="${s}" font-weight="${w}" text-anchor="${a}" fill="${c}">${t}</text>`;
const svg = (inner, h = 460) => `<svg width="900" height="${h}" viewBox="0 0 900 ${h}" style="max-height:100%;max-width:100%"><defs>
<filter id="w"><feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="5"/></filter>
<marker id="ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 1 L9 5 L1 9" fill="none" stroke="${K}" stroke-width="2"/></marker></defs><g filter="url(#w)">${inner}</g></svg>`;
const H = { st, sf, T, svg, R, B, Y, K };

const css = `${[400, 500, 600, 700, 800].map(w => `@font-face{font-family:H;src:url(file://${F}inter-latin-${w}-normal.woff2);font-weight:${w}}`).join('')}
*{margin:0;padding:0;box-sizing:border-box}html,body{width:1080px;height:1350px;overflow:hidden}
.s{width:1080px;height:1350px;background:#fff;color:${K};font-family:H;position:relative}
.lab{position:absolute;top:56px;left:90px;right:90px;display:flex;justify-content:space-between;font-weight:700;font-size:21px;letter-spacing:.12em;text-transform:uppercase;color:#8C8C8C}
.lab b{color:${R}}
.num{flex:none;display:inline-flex;width:62px;height:62px;border-radius:50%;background:${R};color:#fff;font-weight:800;font-size:29px;align-items:center;justify-content:center;border:4px solid ${K}}
h1{font-weight:800;letter-spacing:-.035em;line-height:1.02;text-wrap:balance}
.txt{font-weight:500;font-size:32px;line-height:1.34;margin-top:18px;text-wrap:pretty}
.card{border:4px solid ${K};border-radius:22px;background:#fff;box-shadow:9px 9px 0 ${K}}
.cite{font-weight:600;font-size:21px;color:#555;margin-top:20px;display:flex;justify-content:space-between;gap:20px;align-items:center}
.meter{display:inline-flex;gap:7px;align-items:center;white-space:nowrap;font-weight:700;font-size:19px;letter-spacing:.06em;text-transform:uppercase;color:#8C8C8C}
.meter i{width:17px;height:17px;border-radius:50%;border:3px solid ${K};display:inline-block}.meter i.on{background:${K}}
.foot{position:absolute;left:90px;right:90px;bottom:48px;display:flex;align-items:center;gap:18px;font-weight:600;font-size:21px;color:#9A9A9A}
.foot i{flex:1;height:2px;background:#D5D5D5}
.mono{flex:none;width:58px;height:58px;border-radius:50%;background:#9C4A2E;color:#fff;font-weight:800;font-size:24px;display:flex;align-items:center;justify-content:center}`;
const lab = (r = 'Count them →') => `<div class="lab"><span>Last 7 days <b>in</b> AI · Week ${String(d.week).padStart(2, '0')}</span><span>${r}</span></div>`;
const foot = n => `<div class="foot"><span>@thinksafari</span><i></i><span>${n}/${N}</span></div>`;
const meter = (n, note) => `<span class="meter">How real ${[1, 2, 3, 4, 5].map(k => `<i class="${k <= n ? 'on' : ''}"></i>`).join('')}&nbsp;${note}</span>`;
const pages = [];

// 1 · cover
pages.push(`<div class="s">${lab(d.range)}
 <div style="position:absolute;top:150px;left:80px;right:80px;text-align:center">
  <h1 style="font-size:${d.cover.size || 112}px">${d.cover.title}</h1>
  <div style="font-weight:500;font-size:40px;line-height:1.3;margin-top:28px">${d.cover.sub}</div></div>
 <div style="position:absolute;left:90px;right:90px;top:${d.cover.doodleTop || 640}px;height:500px;display:flex;justify-content:center;align-items:center">${d.cover.doodle(H)}</div>
 <div style="position:absolute;left:90px;right:90px;bottom:110px;display:flex;align-items:center;justify-content:center;gap:16px;font-weight:600;font-size:24px;color:#555"><div class="mono" style="width:46px;height:46px;font-size:19px">SP</div>by Suraj Pandita · AI Product Manager</div>
 ${foot(1)}</div>`);

// stories
d.stories.forEach((s, i) => pages.push(`<div class="s">${lab()}
 <div style="position:absolute;top:118px;bottom:104px;left:90px;right:90px;display:flex;flex-direction:column">
  <div style="display:flex;align-items:flex-start;gap:22px"><span class="num" style="margin-top:6px">${i + 1}</span><h1 style="font-size:${s.size || 74}px">${s.title}</h1></div>
  <div class="txt">${s.text}</div>
  <div style="flex:1;min-height:0;display:flex;align-items:center;justify-content:center;padding:10px 0">${s.doodle(H)}</div>
${s.shot ? `  <div style="position:relative;transform:rotate(-1.1deg);margin:0 8px">
   <span style="position:absolute;top:-21px;left:22px;z-index:2;background:${R};color:#fff;font-weight:800;font-size:19px;letter-spacing:.14em;padding:7px 15px;border:3px solid ${K};border-radius:30px">THE SOURCE</span>
   <div class="card" style="height:${s.shotH || 210}px;overflow:hidden;position:relative">
    <img src="file://${path.join(path.dirname(file), s.shot)}" style="width:100%;height:100%;object-fit:contain;object-position:center;display:block">
    <div style="position:absolute;left:0;right:0;bottom:0;height:60px;background:linear-gradient(rgba(255,255,255,0),#fff)"></div></div></div>` : ''}
  <div class="cite"><span>${s.cite}</span>${meter(s.real, s.realNote)}</div></div>
 ${foot(i + 2)}</div>`));

// verdict
const col = (lab2, c, items) => `<div class="card" style="flex:1;padding:28px 28px 34px;background:${c}"><div style="font-weight:800;font-size:22px;letter-spacing:.14em;text-transform:uppercase">${lab2}</div>
 ${items.map(x => `<div style="margin-top:26px;padding-top:24px;border-top:3px solid ${K}"><div style="font-weight:800;font-size:37px;line-height:1.12;letter-spacing:-.02em">${x.t}</div><div style="font-weight:500;font-size:27px;line-height:1.32;margin-top:10px;color:#333">${x.why}</div></div>`).join('')}</div>`;
pages.push(`<div class="s">${lab('Your call')}
 <div style="position:absolute;top:130px;left:90px;right:90px">
  <h1 style="font-size:96px">Overhyped vs<br>underrated</h1>
  <div class="txt">${d.verdict.sub}</div>
  <div style="display:flex;gap:28px;margin-top:40px">${col('Overhyped', '#FDE2E2', d.verdict.over)}${col('Underrated', '#E2ECFD', d.verdict.under)}</div>
  <div style="font-weight:700;font-size:32px;margin-top:44px">${d.verdict.ask}</div></div>
 ${foot(N - 2)}</div>`);

// my take
pages.push(`<div class="s">${lab('My take')}
 <div style="position:absolute;top:150px;left:90px;right:90px">
  <div style="font-weight:800;font-size:22px;letter-spacing:.14em;text-transform:uppercase;color:${R}">My take, as an AI PM</div>
  <h1 style="font-size:100px;margin-top:18px">${d.take.title}</h1>
  ${d.take.p.map(x => `<div class="txt" style="font-size:40px;margin-top:36px">${x}</div>`).join('')}
  <div style="display:flex;align-items:center;gap:18px;margin-top:56px;padding-top:30px;border-top:3px solid #E5E5E5"><div class="mono">SP</div>
   <div style="font-weight:500;font-size:25px;line-height:1.35">Suraj Pandita · AI Product Manager in India<br><span style="color:#8C8C8C">Opinion, not news</span></div></div></div>
 ${foot(N - 1)}</div>`);

// quiz + CTA
pages.push(`<div class="s">${lab('10-second quiz')}
 <div style="position:absolute;top:140px;left:90px;right:90px">
  <h1 style="font-size:${d.quiz.size || 76}px">${d.quiz.q}</h1>
  <div style="display:grid;gap:18px;margin-top:40px">${d.quiz.options.map((o, k) => `<div class="card" style="display:flex;align-items:center;gap:22px;padding:18px 24px;font-weight:800;font-size:38px;box-shadow:6px 6px 0 ${K};background:${[Y, '#E2ECFD', '#FDE2E2'][k]}"><span class="num" style="width:54px;height:54px;font-size:25px;background:${K}">${'ABC'[k]}</span>${o}</div>`).join('')}</div>
  <div style="font-weight:700;font-size:34px;line-height:1.35;margin-top:48px">Comment your answer.<br><span style="color:${R}">Save this</span> and send it to the friend who still says “AI is just autocomplete”.</div>
  <div style="font-weight:500;font-size:28px;color:#555;margin-top:22px">New episode every Saturday, 8 AM.</div></div>
 ${foot(N)}</div>`);

(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  const pngs = [];
  for (let i = 0; i < pages.length; i++) {
    const f = path.join(OUT, `.s${i}.html`); fs.writeFileSync(f, `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${pages[i]}</body></html>`);
    await pg.goto('file://' + f); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(200);
    const w = await pg.evaluate(() => { const ft = document.querySelector('.foot').getBoundingClientRect().top; let m = 0; document.querySelectorAll('.s > div:not(.foot):not(.lab)').forEach(e => { m = Math.max(m, e.getBoundingClientRect().bottom); }); return m > ft - 6 ? `runs into footer by ${Math.round(m - ft + 6)}px` : ''; });
    if (w) console.log(`slide ${i + 1}: ${w}`);
    const p = path.join(OUT, `week${String(d.week).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}.png`); await pg.screenshot({ path: p }); pngs.push(p); fs.unlinkSync(f);
  }
  const sheet = `<body style="margin:0;background:#777;width:${4 * 368 + 8}px">${pngs.map(p => `<img src="file://${p}" style="width:360px;height:450px;margin:4px">`).join('')}</body>`;
  const sh = path.join(OUT, '.sheet.html'); fs.writeFileSync(sh, sheet); await pg.setViewportSize({ width: 4 * 368 + 8, height: 3 * 458 + 8 });
  await pg.goto('file://' + sh); await pg.waitForTimeout(300); await pg.screenshot({ path: path.join(OUT, 'contact-sheet.png'), fullPage: true }); fs.unlinkSync(sh);
  await b.close(); console.log(`${pngs.length} slides → ${OUT}`);
})();
