// Last 24 hours in AI — daily Instagram carousel for @thinksafari
// usage: node make.js issues/<YYYY-MM-DD>.json   → writes issues/<YYYY-MM-DD>/day<NN>-<k>.png + contact-sheet.png
// Design: news slides in the thebrainlab infographic style, "my take" as a Kiki-style essay card. See README.md.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');

const ROOT = __dirname;
const font = f => 'file://' + path.join(ROOT, 'fonts', f);
const OR = '#E07B4F', OR2 = '#E9A07D', OR3 = '#F3CDB8', INK = '#1A1916', OX = '#9C4A2E';
const pad = n => String(n).padStart(2, '0');

const css = `
@font-face{font-family:I;src:url(${font('inter-latin-500-normal.woff2')});font-weight:500}
@font-face{font-family:I;src:url(${font('inter-latin-600-normal.woff2')});font-weight:600}
@font-face{font-family:I;src:url(${font('inter-latin-700-normal.woff2')});font-weight:700}
@font-face{font-family:I;src:url(${font('inter-latin-800-normal.woff2')});font-weight:800}
@font-face{font-family:N;src:url(${font('newsreader-latin-wght-normal.woff2')});font-weight:200 800}
@font-face{font-family:N;font-style:italic;src:url(${font('newsreader-latin-wght-italic.woff2')});font-weight:200 800}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1350px;overflow:hidden}
.s{position:relative;width:1080px;height:1350px;overflow:hidden;background:#FAF2E9;color:${INK};font-family:I,sans-serif;text-align:center}
.top{position:absolute;top:70px;left:0;right:0;font-size:20px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#8A8278}
.top b{color:${OR}}
.t{font-weight:800;letter-spacing:-.055em;line-height:.98}
.aka{font-weight:500;font-size:38px;letter-spacing:-.02em;color:#5F5850;margin-top:14px;line-height:1.2}
.cap{font-weight:700;font-size:29px;line-height:1.27;letter-spacing:-.01em;text-transform:uppercase;text-wrap:balance}
.lab{font-weight:700;font-size:20px;letter-spacing:.02em;text-transform:uppercase}
.india{color:#B4532A}
.src{position:absolute;bottom:62px;left:80px;right:80px;font-weight:700;font-size:21px;color:#8A8278;text-transform:uppercase;letter-spacing:.01em}
.col{position:absolute;left:90px;right:90px;top:128px;bottom:118px;display:flex;flex-direction:column;justify-content:center;align-items:center}
.pill{display:inline-flex;align-items:center;gap:18px;background:${INK};color:#FAF2E9;border-radius:40px;padding:14px 30px;font-weight:800;letter-spacing:.06em}
.mono{border-radius:50%;background:${OX};color:#FAF2E9;font-family:N;font-style:italic;display:flex;align-items:center;justify-content:center;flex:none}
.bg{position:absolute;inset:0;background:radial-gradient(70% 55% at 30% 20%,#8D8A84 0%,#5B5853 45%,#2C2A27 100%)}
.card{position:absolute;left:56px;right:56px;top:50%;transform:translateY(-46%);background:#F4EDD6;padding:44px 48px 40px;text-align:left;font-family:N,serif;color:#2A2723;box-shadow:0 30px 60px -30px rgba(0,0,0,.6)}
.card h2{font-family:N;font-weight:650;font-size:66px;line-height:1.04;letter-spacing:-.012em;color:#3A3632}
.card .sub{font-style:italic;font-size:31px;color:#7A736A;margin-top:12px}
.card p{font-size:35px;line-height:1.42;margin-top:24px;text-align:justify;hyphens:auto;text-wrap:pretty}
.card p b{font-weight:650}
.card .row{display:flex;align-items:center;gap:16px;margin-top:30px;padding-top:24px;border-top:1px solid #D9CFB5}
.card .nm{font-family:I;font-size:19px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#3A3632}
.card .rl{font-family:I;font-size:17px;color:#7A736A;letter-spacing:.06em;margin-top:3px;text-transform:uppercase}
`;
const grainDark = `<svg style="position:absolute;inset:0;mix-blend-mode:overlay;opacity:.55" width="1080" height="1350"><filter id="gd"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="7"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#gd)"/></svg>
<svg style="position:absolute;inset:0;mix-blend-mode:soft-light;opacity:.9" width="1080" height="1350"><filter id="gb"><feTurbulence type="fractalNoise" baseFrequency=".006" numOctaves="2" seed="11"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#gb)"/></svg>`;
const grainLight = `<svg style="position:absolute;inset:0;mix-blend-mode:multiply;opacity:.07;pointer-events:none" width="1080" height="1350"><filter id="gl"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#gl)"/></svg>`;

// ---------- illustration library (pick a type per story in the JSON) ----------
const defs = `<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10" fill="none" stroke="${INK}" stroke-width="1.6"/></marker></defs>`;
const L = (x, y, t, anchor = 'start', size = 20, fill = INK) => String(t).split('|').map((ln, k) => `<text x="${x}" y="${y + k * (size + 5)}" text-anchor="${anchor}" font-family="I" font-weight="700" font-size="${size}" fill="${fill}">${ln}</text>`).join('');
const ILL = {
  // {type:'dots', n:148, cols:37, lit:'last'|[indices], left:'LABEL', right:'LABEL|LINE 2'}  → many attempts / one that matters
  dots(o) {
    const n = o.n, cols = o.cols || Math.min(n, 28), gap = o.gap || Math.min(22, 640 / cols), r = o.r || Math.max(3.5, gap / 4.4);
    const lit = o.lit === 'last' ? new Set([n - 1]) : new Set(o.lit || []);
    const rows = Math.ceil(n / cols), w = cols * gap, h = rows * gap;
    let d = ''; for (let k = 0; k < n; k++) { const x = 40 + (k % cols) * gap, y = 50 + Math.floor(k / cols) * gap;
      d += lit.has(k) && o.lit !== 'last' ? `<circle cx="${x}" cy="${y}" r="${r * 1.8}" fill="${OR}"/>` : (o.hollow ? `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#C9BFB2" stroke-width="2"/>` : `<circle cx="${x}" cy="${y}" r="${r}" fill="${OR3}"/>`); }
    let extra = '';
    if (o.lit === 'last') extra = `<path d="M${w + 60} ${50 + h / 2 - gap / 2} L ${w + 110} ${50 + h / 2 - gap / 2}" stroke="${INK}" stroke-width="3" marker-end="url(#ah)"/><circle cx="${w + 150}" cy="${50 + h / 2 - gap / 2}" r="30" fill="${OR}"/>` + L(w + 150, 50 + h / 2 + 50, o.right || '', 'middle');
    const H = 50 + h + 70;
    return `<svg width="900" height="${H}" viewBox="0 0 900 ${H}">${defs}${d}${extra}${L(40, 50 + h + 30, o.left || '')}${o.lit !== 'last' && o.right ? L(40 + w, 50 + h + 30, o.right, 'end') : ''}</svg>`;
  },
  // {type:'bars', items:[{v:'$15B+', label:'MAY 2026', h:.5},{v:'$30B', label:'NOV 2026', h:1, accent:true}]}  → before/after numbers
  bars(o) {
    const n = o.items.length, bw = 140, gap = (720 - n * bw) / (n + 1); let g = `<line x1="90" y1="250" x2="810" y2="250" stroke="${INK}" stroke-width="3"/>`;
    o.items.forEach((it, i) => { const x = 90 + gap + i * (bw + gap), hh = Math.max(16, 190 * it.h), y = 250 - hh;
      g += it.accent ? `<rect x="${x}" y="${y}" width="${bw}" height="${hh}" fill="${OR}"/>` : `<rect x="${x}" y="${y}" width="${bw}" height="${hh}" fill="none" stroke="${INK}" stroke-width="3.4"/>`;
      g += `<text x="${x + bw / 2}" y="${y - 14}" text-anchor="middle" font-family="I" font-weight="800" font-size="38" letter-spacing="-1.5" fill="${INK}">${it.v}</text>` + L(x + bw / 2, 282, it.label, 'middle'); });
    return `<svg width="900" height="300" viewBox="0 0 900 300">${g}</svg>`;
  },
  // {type:'flow', nodes:[{t:'GPT-6', s:'REASONING + CODE', label:'DESIGN'},{t:'…', accent:true}]}  → A → B → C
  flow(o) {
    const n = o.nodes.length, bw = n > 3 ? 170 : 200, gap = (860 - n * bw) / (n - 1 || 1); let g = '';
    o.nodes.forEach((nd, i) => { const x = 20 + i * (bw + gap);
      g += nd.accent ? `<rect x="${x}" y="70" width="${bw}" height="120" rx="16" fill="${INK}"/>` : `<rect x="${x}" y="70" width="${bw}" height="120" rx="16" fill="none" stroke="${INK}" stroke-width="3.4" ${nd.dashed ? 'stroke-dasharray="8 7"' : ''}/>`;
      g += `<text x="${x + bw / 2}" y="${nd.s ? 128 : 140}" text-anchor="middle" font-family="I" font-weight="800" font-size="${String(nd.t).length > 9 ? 24 : 34}" letter-spacing="-1" fill="${nd.accent ? '#FAF2E9' : INK}">${nd.t}</text>`;
      if (nd.s) g += `<text x="${x + bw / 2}" y="164" text-anchor="middle" font-family="I" font-weight="700" font-size="16" fill="${nd.accent ? OR2 : '#5F5850'}">${nd.s}</text>`;
      if (nd.label) g += L(x + bw / 2, 232, nd.label, 'middle');
      if (i < n - 1) g += `<path d="M${x + bw + 10} 130 L ${x + bw + gap - 12} 130" stroke="${INK}" stroke-width="3" ${nd.dotted ? 'stroke-dasharray="2 8" stroke-linecap="round"' : ''} marker-end="url(#ah)"/>`;
      if (nd.dot) g += `<circle cx="${x + bw - 14}" cy="84" r="14" fill="${OR}"/>`; });
    return `<svg width="900" height="270" viewBox="0 0 900 270">${defs}${g}</svg>`;
  },
  // {type:'ladder', steps:[['ANSWERS','IT REPLIES'],…], hot:2}  → stages / levels
  ladder(o) {
    const st = o.steps, sw = 820 / st.length, rise = 260 / st.length; let g = '', x = 40, y = 350;
    st.forEach((s, k) => { const nx = x + sw, ny = y - rise; const hot = k >= (o.hot ?? st.length - 2);
      g += `<path d="M${x} ${y} L${x} ${ny} L${nx} ${ny}" fill="none" stroke="${INK}" stroke-width="3.4"/>`;
      g += `<circle cx="${x + sw / 2}" cy="${ny - 30}" r="${hot ? 22 : 13}" fill="${hot ? OR : 'none'}" stroke="${hot ? 'none' : OR2}" stroke-width="3"/>`;
      g += L(x + sw / 2, ny + 40, s[0], 'middle', 19) + `<text x="${x + sw / 2}" y="${ny + 66}" text-anchor="middle" font-family="I" font-weight="600" font-size="16" fill="#8A8278">${s[1] || ''}</text>`; x = nx; y = ny; });
    return `<svg width="900" height="370" viewBox="0 0 900 370">${g}</svg>`;
  },
  // {type:'svg', svg:'<svg width="900" …>…</svg>'}  → hand-drawn, story-specific (preferred when it says more)
  svg(o) { return o.svg; },
};
const ill = o => o ? (ILL[o.type] || (() => ''))(o) : '';

// ---------- slide templates ----------
function build(d) {
  const N = d.slides.length + 3; // cover + summary + slides + close
  const dayLbl = `Day ${pad(d.day)}`;
  const page = (i, inner, opt = {}) => `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><div class="s">${inner}
${opt.noTop ? '' : `<div class="top" style="${opt.dark ? 'color:#CFC8BC' : ''}">Last 24 hours <b>in</b> AI · ${dayLbl} · ${d.author.name}, AI PM · ${i}/${N}</div>`}
${opt.dark ? '' : grainLight}</div></body></html>`;
  const kick = (k, dt) => `<div class="lab" style="color:${OR};font-size:22px;letter-spacing:.14em;margin-bottom:16px">${k}${dt ? `<span style="color:#8A8278"> · ${dt}</span>` : ''}</div>`;
  const out = [];

  // 1 · cover — series first, today's hook in the swipe strip
  out.push(page(1, `
 <div style="position:absolute;top:48px;left:0;right:0;display:flex;justify-content:center"><div style="display:inline-flex;align-items:center;gap:16px">
  <div class="mono" style="width:60px;height:60px;font-size:28px">${d.author.initials}</div>
  <div style="text-align:left;line-height:1.22"><div style="font-weight:700;font-size:27px">by ${d.author.name}</div><div style="font-weight:500;font-size:21px;color:#6F675D">${d.author.role} · a daily series</div></div></div></div>
 <div style="position:absolute;left:70px;right:70px;top:148px;bottom:112px;display:flex;flex-direction:column;justify-content:space-between;align-items:center">
  <div class="pill" style="font-size:30px"><span style="color:${OR}">DAY ${pad(d.day)}</span><span style="opacity:.45">|</span><span>${d.date.toUpperCase()}</span></div>
  <div><div class="t" style="font-size:140px">last 24 hours<br>in AI</div>
   <div class="aka" style="font-size:36px;max-width:880px;margin:20px auto 0">aka. everything that moved in AI since yesterday, explained like a friend would</div></div>
  <div style="width:100%"><div class="lab" style="font-size:20px;letter-spacing:.16em;color:#8A8278;margin-bottom:22px">What you get, every day</div>
   <div style="display:flex;justify-content:space-between">
    ${[['1', 'News', 'what happened'], ['2', 'Money', 'who raised what'], ['3', 'Models', 'the tech, simply'], ['4', 'India', 'what it means'], ['5', 'My take', 'as an AI PM']].map(([n, t, s]) => `<div style="width:170px;display:flex;flex-direction:column;align-items:center;gap:10px">
     <div style="width:60px;height:60px;border-radius:50%;background:${OR};color:#FAF2E9;font-weight:800;font-size:27px;display:flex;align-items:center;justify-content:center">${n}</div>
     <div class="lab" style="font-size:21px">${t}</div><div style="font-weight:500;font-size:19px;color:#6F675D;line-height:1.2">${s}</div></div>`).join('')}
   </div></div>
  <div style="width:100%;display:flex;align-items:center;gap:26px;background:${INK};color:#FAF2E9;border-radius:26px;padding:26px 30px 26px 36px;text-align:left">
   <div style="flex:1"><div class="lab" style="font-size:19px;letter-spacing:.16em;color:${OR};margin-bottom:8px">Today · ${d.summary.length} stories inside</div>
    <div style="font-weight:800;font-size:34px;line-height:1.15;letter-spacing:-.02em">${d.cover.today}</div></div>
   <div style="width:86px;height:86px;border-radius:50%;background:${OR};display:flex;align-items:center;justify-content:center;flex:none">
    <svg width="40" height="40" viewBox="0 0 40 40"><path d="M8 20 H31 M21 9 L32 20 L21 31" stroke="#FAF2E9" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div>
 </div>
 <div class="src">Swipe → for today’s episode</div>`, { noTop: true }));

  // 2 · standalone summary (Instagram often re-shows a carousel from slide 2)
  out.push(page(2, `
 <div class="col" style="left:84px;right:84px;align-items:stretch">
  <div class="t" style="font-size:100px">${d.summary.length} things that<br>moved in AI</div>
  <div class="aka" style="margin-bottom:30px">aka. day ${pad(d.day)} in 60 seconds. save this.</div>
  ${d.summary.map((r, i) => `<div style="display:grid;grid-template-columns:58px 200px 1fr;align-items:baseline;text-align:left;padding:16px 0;border-top:2px solid #E6DACB">
   <span style="font-weight:800;font-size:30px;color:${OR}">${pad(i + 1)}</span><span class="lab" style="font-size:18px;color:#8A8278;letter-spacing:.08em">${r.cat} · ${r.date}</span><span style="font-weight:700;font-size:30px;letter-spacing:-.012em;line-height:1.22">${r.text}</span></div>`).join('')}
 </div>
 <div class="src">${d.summaryNote || 'Every story from the last 24 hours · sources on each slide'}</div>`));

  // 3..N-1 · content slides
  d.slides.forEach((s, j) => {
    const i = j + 3;
    if (s.type === 'news') out.push(page(i, `
 <div class="col" style="gap:${s.gap || 40}px">
  <div>${kick(s.k, s.d)}<div class="t" style="font-size:${s.size || 100}px">${s.t}</div><div class="aka">${s.aka}</div></div>
  ${s.il ? `<div style="display:flex;justify-content:center">${ill(s.il)}</div>` : ''}
  <div class="cap">${s.p}</div>
  ${s.india ? `<div class="cap india" style="font-size:27px">${s.india}</div>` : ''}
 </div>
 <div class="src">${s.src}</div>`));
    else if (s.type === 'stats') out.push(page(i, `
 <div class="col" style="gap:46px">
  <div>${kick(s.k, s.d)}<div class="t" style="font-size:${s.size || 100}px">${s.t}</div><div class="aka">${s.aka}</div></div>
  <div style="display:flex;gap:56px;width:100%">${s.stats.map(x => `<div style="flex:1"><div class="t" style="font-size:${x.size || 132}px">${x.v}</div><div class="cap" style="font-size:24px;margin-top:14px;color:#5F5850">${x.l}</div></div>`).join('')}</div>
  ${s.p ? `<div class="cap">${s.p}</div>` : ''}
  ${s.india ? `<div class="cap india" style="font-size:27px">${s.india}</div>` : ''}
 </div>
 <div class="src">${s.src}</div>`));
    else if (s.type === 'picture') out.push(page(i, `
 <div class="col" style="gap:52px">
  <div>${kick(s.k || 'The big picture')}<div class="t" style="font-size:${s.size || 108}px">${s.t}</div><div class="aka">${s.aka}</div></div>
  ${ill(s.il)}
  <div class="cap" style="font-size:31px">${s.p}</div>
 </div>
 <div class="src">${s.src || ''}</div>`));
    else if (s.type === 'take') out.push(page(i, `<div class="bg"></div>${grainDark}
 <div class="card">
  <div class="lab" style="color:${OX};font-size:19px;letter-spacing:.14em;margin-bottom:14px">${s.k}</div>
  <h2>${s.t}</h2>${s.sub ? `<div class="sub">${s.sub}</div>` : ''}
  ${s.p.map(x => `<p>${x}</p>`).join('')}
  <div class="row"><div class="mono" style="width:56px;height:56px;font-size:26px">${d.author.initials}</div><div><div class="nm">${d.author.name} · my take</div><div class="rl">${d.author.role} in India · opinion, not news</div></div></div>
 </div>`, { dark: true }));
  });

  // last · close
  out.push(page(N, `
 <div class="col" style="gap:40px">
  <div class="t" style="font-size:120px">which one got you?</div>
  <div class="aka" style="margin-top:-22px">aka. reply with a number, 1 to ${d.summary.length}</div>
  <div class="cap" style="color:${OR};font-size:32px">Comment DAILY and I’ll DM you every new episode.</div>
  <div class="cap">Send this to the friend who keeps asking “what’s new in AI?”</div>
  <div class="pill" style="font-size:25px;margin-top:10px"><span>LAST 24 HOURS IN AI</span><span style="opacity:.45">|</span><span style="color:${OR}">DAY ${pad(d.day + 1)} TOMORROW</span></div>
  <div style="display:flex;align-items:center;gap:20px;text-align:left;margin-top:26px;border-top:2px solid #E6DACB;padding-top:34px;width:100%">
   <div class="mono" style="width:76px;height:76px;font-size:34px">${d.author.initials}</div>
   <div style="font-weight:500;font-size:28px;line-height:1.35;color:#3A362F">I’m <b style="font-weight:800">${d.author.name}</b>, an AI product manager in India. I read the AI news every day so you can build with&nbsp;it.</div></div>
 </div>
 <div class="src">${d.handle} · follow for day ${pad(d.day + 1)}</div>`));
  return out;
}

(async () => {
  const file = process.argv[2]; if (!file) { console.error('usage: node make.js issues/<date>.json'); process.exit(1); }
  const d = JSON.parse(fs.readFileSync(file, 'utf8'));
  const out = path.resolve(file.replace(/\.json$/, '')); fs.mkdirSync(out, { recursive: true });
  const pages = build(d);
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  const warn = [], pngs = [];
  for (let i = 0; i < pages.length; i++) {
    const html = path.join(out, `.slide-${i + 1}.html`); fs.writeFileSync(html, pages[i]);
    await pg.goto('file://' + html); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(150);
    const w = await pg.evaluate(() => { const r = []; document.querySelectorAll('.col, .card').forEach(e => { const bb = e.getBoundingClientRect(); if (e.scrollHeight > e.clientHeight + 2) r.push(`content too tall by ${e.scrollHeight - e.clientHeight}px`); if (bb.top < 40 || bb.bottom > 1260) r.push(`block touches edge (${Math.round(bb.top)}–${Math.round(bb.bottom)})`); });
      const src = document.querySelector('.src'), col = document.querySelector('.col'); if (src && col) { const a = col.lastElementChild?.getBoundingClientRect(), s = src.getBoundingClientRect(); if (a && a.bottom > s.top - 10) r.push('text runs into the source line'); } return r; });
    w.forEach(x => warn.push(`slide ${i + 1}: ${x}`));
    const png = path.join(out, `day${pad(d.day)}-${pad(i + 1)}.png`); await pg.screenshot({ path: png }); pngs.push(png); fs.unlinkSync(html);
  }
  // contact sheet at 1/3 scale for a quick visual check
  const cols = 4, tw = 360, th = 450, rows = Math.ceil(pngs.length / cols);
  const sheet = `<body style="margin:0;background:#777;width:${cols * (tw + 8) + 8}px">${pngs.map(p => `<img src="file://${p}" style="width:${tw}px;height:${th}px;margin:4px">`).join('')}</body>`;
  const sh = path.join(out, '.sheet.html'); fs.writeFileSync(sh, sheet);
  await pg.setViewportSize({ width: cols * (tw + 8) + 8, height: rows * (th + 8) + 8 }); await pg.goto('file://' + sh); await pg.waitForTimeout(300);
  await pg.screenshot({ path: path.join(out, 'contact-sheet.png'), fullPage: true }); fs.unlinkSync(sh);
  await b.close();
  console.log(`${pages.length} slides → ${out}`); console.log(warn.length ? 'WARNINGS:\n' + warn.join('\n') : 'no layout warnings');
})();
