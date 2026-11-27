// THINKSAFARI — Last 24 Hours in AI — Day 03 (27 Nov 2026). Design Bible v1.0. 9 slides 1080x1350.
const { chromium } = require('playwright'); const fs = require('fs');
const D = __dirname, OUT = D + '/out'; fs.mkdirSync(OUT, { recursive: true });
const IN = '/usr/share/fonts/opentype/inter', NR = '/tmp/claude-0/-home-user-ai-signal/5976107c-b177-5eb8-bcfe-35877bf990a4/scratchpad/indiv/ep3/project/node_modules/@fontsource/newsreader/files';
const K = { cream: '#F5EBDD', ink: '#191715', or: '#C97856', grey: '#827A70', div: '#E8DED1', panel: '#EFE2D0' };
const css = `
@font-face{font-family:I;font-weight:400;src:url(file://${IN}/Inter-Regular.otf)}@font-face{font-family:I;font-weight:500;src:url(file://${IN}/Inter-Medium.otf)}
@font-face{font-family:I;font-weight:600;src:url(file://${IN}/Inter-SemiBold.otf)}@font-face{font-family:I;font-weight:700;src:url(file://${IN}/Inter-Bold.otf)}
@font-face{font-family:I;font-weight:800;src:url(file://${IN}/Inter-ExtraBold.otf)}@font-face{font-family:I;font-weight:900;src:url(file://${IN}/Inter-Black.otf)}
@font-face{font-family:NR;font-weight:400;src:url(file://${NR}/newsreader-latin-400-normal.woff2)}@font-face{font-family:NR;font-weight:500;src:url(file://${NR}/newsreader-latin-500-normal.woff2)}
@font-face{font-family:NR;font-style:italic;font-weight:400;src:url(file://${NR}/newsreader-latin-400-italic.woff2)}
*{margin:0;padding:0;box-sizing:border-box}body{width:1080px;height:1350px;position:relative;overflow:hidden;background:${K.cream};color:${K.ink};font-family:I}
.a{position:absolute}.m{left:80px;right:80px}
.meta{left:80px;right:80px;top:64px;display:flex;justify-content:space-between;font:600 19px I;letter-spacing:.16em;text-transform:uppercase;color:${K.grey};border-bottom:2px solid ${K.div};padding-bottom:18px}
.cat{font:700 19px I;letter-spacing:.16em;text-transform:uppercase;color:${K.or}}
.H{font:900 86px/0.98 I;letter-spacing:-.035em;text-transform:lowercase;text-wrap:balance}
.sub{font:500 32px/1.35 I;color:#4A443D;text-wrap:pretty}
.b{font:400 29px/1.45 I;color:#2E2A26;text-wrap:pretty}
.b b{font-weight:700;color:${K.ink}}
.src{font:500 21px/1.4 I;color:${K.grey}}
.chip{display:inline-block;font:700 17px I;letter-spacing:.12em;text-transform:uppercase;padding:7px 12px;border-radius:4px}
.ok{background:${K.ink};color:${K.cream}}.rep{border:2px solid ${K.or};color:${K.or}}
.box{border:2px solid ${K.ink};border-radius:10px;padding:16px 20px;font:700 25px/1.2 I;background:${K.cream};text-align:center}
`;
const meta = n => `<div class="a meta"><span>Last 24 hours in AI · Day 03</span><span>by Suraj · ${String(n).padStart(2, '0')}/09</span></div>`;
const story = (n, cat, chip, H, sub, visual, what, why, src) => `${meta(n)}
  <div class="a m" style="top:132px;display:flex;justify-content:space-between;align-items:center"><span class="cat">${cat}</span>${chip}</div>
  <div class="a m H" style="top:186px;font-size:74px">${H}</div>
  <div class="a m sub" style="top:356px">${sub}</div>
  ${visual}
  <div class="a m" style="top:930px;display:flex;gap:40px;border-top:2px solid ${K.div};padding-top:24px">
   <div style="flex:1"><div class="cat" style="color:${K.grey};font-size:17px">What happened</div><div class="b" style="margin-top:10px;font-size:28px">${what}</div></div>
   <div style="flex:1"><div class="cat" style="font-size:17px">Why it matters</div><div class="b" style="margin-top:10px;font-size:28px">${why}</div></div></div>
  <div class="a m src" style="bottom:56px;border-top:2px solid ${K.div};padding-top:14px">${src}</div>`;
const OK = '<span class="chip ok">Confirmed</span>', REP = '<span class="chip rep">Reported</span>', REPBOE = '<span class="chip rep">As reported</span>';
const S = [
 // 01 cover
 `<div class="a m" style="top:64px;display:flex;justify-content:space-between;font:700 22px I;letter-spacing:.18em;text-transform:uppercase"><span>ThinkSafari</span><span style="color:${K.grey}">Day 03 · 27 Nov 2026</span></div>
  <div class="a m" style="top:200px;font:900 150px/0.9 I;letter-spacing:-.05em">last 24<br>hours<br>in ai<span style="color:${K.or}">.</span></div>
  <div class="a m sub" style="top:690px;max-width:820px;font-size:34px">Four stories from the last 24 hours, checked against their sources. What happened, why it matters, and what connects them.</div>
  <div class="a m" style="top:880px;border-top:2px solid ${K.ink};padding-top:26px">
   <div class="cat">Lead story</div>
   <div style="margin-top:12px;font:800 54px/1.05 I;letter-spacing:-.025em;text-transform:lowercase;text-wrap:balance">the bank of england says ai’s money is getting “circular and opaque”</div></div>
  <div class="a m src" style="bottom:56px">Window: 26 Nov 10:30 GMT → 27 Nov 10:30 GMT</div>`,
 // 02 briefing
 `${meta(2)}<div class="a m H" style="top:140px;font-size:92px">the briefing</div>
  ${[['Money', 'The Bank of England warns AI financing is “increasingly complex, circular and opaque”, with over $4 trillion in potential exposure.'],
     ['Chips', 'Nvidia has reportedly paused AI server shipments to Malaysia, Singapore, Thailand and Indonesia under new US rules.'],
     ['Jobs', 'SAP is reportedly weighing at least 10,000 job cuts as it rebuilds around AI. SAP hasn’t confirmed.'],
     ['Policy', 'Canada expands its AI compute fund from C$300 million to C$1 billion, with bigger subsidies for Canadian-owned compute.']].map(([c, t], k) => `
   <div class="a m" style="top:${330 + k * 220}px;display:flex;gap:34px;border-top:2px solid ${K.div};padding-top:24px">
    <div style="width:60px;font:900 54px/1 I;color:${K.or}">${k + 1}</div>
    <div style="flex:1"><div class="cat">${c}</div><div class="b" style="margin-top:8px;font-size:30px">${t}</div></div></div>`).join('')}`,
 // 03 BoE — circular flow
 story(3, 'Money · 26 Nov', REPBOE, 'the money behind ai is going in circles', 'The same companies are investors, customers and suppliers to each other. That makes risk harder to see.',
  `<svg class="a" style="left:80px;top:470px" width="920" height="440">
    <defs><marker id="ar" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto"><path d="M0,0 L12,6 L0,12z" fill="${K.or}"/></marker></defs>
    <g fill="none" stroke="${K.or}" stroke-width="4" marker-end="url(#ar)">
     <path d="M330,90 Q460,40 590,90"/><path d="M700,170 Q760,240 700,310"/><path d="M590,390 Q460,440 330,390"/><path d="M220,310 Q160,240 220,170"/></g>
    ${[[160, 70, 'Big Tech'], [600, 70, 'AI labs'], [600, 310, 'Chipmakers'], [160, 310, 'Lenders']].map(([x, y, t]) => `<rect x="${x}" y="${y}" width="170" height="80" rx="10" fill="${K.cream}" stroke="${K.ink}" stroke-width="2.5"/><text x="${x + 85}" y="${y + 50}" text-anchor="middle" font-family="I" font-weight="700" font-size="25" fill="${K.ink}">${t}</text>`).join('')}
    <text x="460" y="225" text-anchor="middle" font-family="I" font-weight="900" font-size="64" fill="${K.ink}">$4T+</text>
    <text x="460" y="262" text-anchor="middle" font-family="I" font-weight="500" font-size="20" fill="${K.grey}">potential exposure (BoE staff estimate)</text></svg>`,
  'The Bank of England’s November Financial Stability Report called AI financing <b>“increasingly complex, circular and opaque”</b>.',
  'If AI revenue disappoints, the stress may not stay with Big Tech. It can spread through the lenders.',
  'Bank of England, Financial Stability Report, 26 Nov 2026, as reported by The Next Web, Scottish Financial News and others. Estimate, not confirmed losses.'),
 // 04 Nvidia — policy flow
 story(4, 'Chips · 26 Nov', REP, 'nvidia hits pause on four countries', 'A new US licence rule is closing routes that let advanced AI chips reach China.',
  `<div class="a m" style="top:500px;height:400px">
    <div style="display:flex;align-items:center;gap:18px">
     <div class="box" style="width:250px">US licence rule<div style="font:500 18px I;color:${K.grey};margin-top:6px">for AI chips to data centres</div></div>
     <div style="font:900 40px I;color:${K.or}">→</div>
     <div class="box" style="width:180px">Nvidia</div>
     <div style="font:900 40px I;color:${K.or}">→</div>
     <div class="box" style="width:230px">Server makers<div style="font:500 18px I;color:${K.grey};margin-top:6px">e.g. Dell, Supermicro</div></div></div>
    <div style="margin-top:44px;display:grid;grid-template-columns:repeat(4,1fr);gap:16px">
     ${['Malaysia', 'Singapore', 'Thailand', 'Indonesia'].map(c => `<div style="border:2px dashed ${K.or};border-radius:10px;padding:22px 10px;text-align:center;font:700 25px I;color:${K.ink}"><div style="font:900 36px I;color:${K.or}">✕</div>${c}</div>`).join('')}</div>
    <div class="src" style="margin-top:14px">Shipments paused, per the FT. Brazil is also named in the US rule.</div></div>`,
  'Nvidia reportedly told server partners to stop shipping its AI servers to four South-East Asian countries.',
  'AI hardware now moves along political lines. Data centres in the region may wait for licences.',
  'Financial Times, via US News / Business Standard, 26 Nov 2026. Duration and exact scope not disclosed.'),
 // 05 SAP — number + status ladder
 story(5, 'Jobs · 26 Nov', REP, 'sap may cut 10,000 jobs to rebuild for ai', 'About 9% of its workforce, with product, engineering and sales in focus, per Bloomberg.',
  `<div class="a m" style="top:520px">
    <div style="display:flex;align-items:flex-end;gap:30px"><div style="font:900 190px/0.85 I;letter-spacing:-.05em">10,000<span style="color:${K.or}">+</span></div></div>
    <div style="margin-top:46px;display:flex;gap:12px;align-items:center">
     ${[['Rumoured', 0], ['Reported', 1], ['Announced', 0], ['Done', 0]].map(([t, on], k) => `${k ? `<div style="font:900 30px I;color:${K.div}">→</div>` : ''}<div style="flex:1;padding:18px 8px;text-align:center;border-radius:8px;font:700 24px I;${on ? `background:${K.or};color:${K.cream}` : `background:${K.panel};color:${K.grey}`}">${t}</div>`).join('')}</div>
    <div class="src" style="margin-top:14px">Where this story stands today</div></div>`,
  'Bloomberg reports SAP asked departments to identify cuts as it pushes an AI-first strategy.',
  'A major software company reorganising around AI, not just adding it. The number may change after labour talks.',
  'Bloomberg via Business Standard and BusinessWorld, 26 Nov 2026. SAP: it “regularly reviews its organisation”; no confirmation.'),
 // 06 Canada — funding + who benefits
 story(6, 'Policy · 26 Nov', OK, 'canada bets on its own compute', 'Its AI Compute Access Fund grows from C$300 million to C$1 billion.',
  `<div class="a m" style="top:500px">
    <div style="display:flex;align-items:flex-end;gap:40px;height:250px">
     <div style="text-align:center"><div style="width:150px;height:75px;background:${K.panel};border-radius:6px"></div><div style="font:800 30px I;margin-top:10px">C$300M</div><div class="src">before</div></div>
     <div style="text-align:center"><div style="width:150px;height:250px;background:${K.or};border-radius:6px"></div></div>
     <div style="padding-bottom:20px"><div style="font:900 92px/1 I;letter-spacing:-.03em">C$1B</div><div class="src" style="margin-top:6px">after</div></div></div>
    <div style="margin-top:26px;display:flex;gap:14px;align-items:center;font:600 24px I">
     <div class="box" style="font-size:22px">Small &amp; mid-size firms</div><span style="color:${K.or};font:900 30px I">→</span>
     <div class="box" style="font-size:22px">Compute costs subsidised</div><span style="color:${K.or};font:900 30px I">→</span>
     <div class="box" style="font-size:22px;border-color:${K.or}">More for Canadian-owned</div></div></div>`,
  'Canada added C$700 million. The first call targets health and life sciences, with applications due 4 January 2027.',
  '“Sovereign compute” is becoming policy: governments now pay more if your AI runs on home soil.',
  'Government of Canada announcement in Toronto, via The Next Web and Unite.AI, 26 Nov 2026. Subsidy split not yet confirmed.'),
 // 07 big picture
 `${meta(7)}<div class="a m" style="top:130px"><span class="cat">The big picture · editorial framing</span></div>
  <div class="a m H" style="top:186px;font-size:84px">ai’s bill is arriving in four currencies</div>
  <div class="a m" style="top:470px;display:grid;grid-template-columns:1fr 1fr;gap:22px">
   ${[['Debt', 'Who carries the risk if the spending doesn’t pay off?', 'Bank of England'], ['Borders', 'Who is allowed to buy the chips at all?', 'Nvidia × US rules'], ['Sovereignty', 'Whose soil does your AI run on?', 'Canada'], ['People', 'Who gets reorganised when it does work?', 'SAP']].map(([t, q, s]) => `
    <div style="background:${K.panel};border-radius:12px;padding:30px 30px 26px;height:300px;position:relative">
     <div style="font:900 52px/1 I;letter-spacing:-.03em;text-transform:lowercase">${t}</div>
     <div class="b" style="margin-top:16px;font-size:28px">${q}</div>
     <div class="cat" style="position:absolute;left:30px;bottom:24px;font-size:16px">${s}</div></div>`).join('')}</div>
  <div class="a m sub" style="top:1150px;font-size:28px">The models get the headlines. The cost of everything around them is the real story this week.</div>`,
 // 08 My Take (serif column)
 `${meta(8)}<div class="a m" style="top:130px;display:flex;justify-content:space-between"><span class="cat">My take</span><span class="chip rep">Opinion</span></div>
  <div class="a m" style="top:200px;font:500 66px/1.08 NR;letter-spacing:-.01em;text-wrap:balance">The AI race is no longer about who has the best model. It’s about who can <i>afford, access and absorb</i> it.</div>
  <div class="a m" style="top:600px;font:400 31px/1.5 NR;color:#2E2A26">
   <p>When you build AI products, the demo is the cheap part. The expensive part comes after: reliability, permissions, cost per request, and the people who have to change how they work.</p>
   <p style="margin-top:22px">This week showed that lesson at the scale of countries. Banks are asking who holds the debt. Governments are deciding who gets the chips and whose soil the data sits on. Companies are deciding which roles to redraw.</p></div>
  <div class="a m" style="top:1110px;border-top:2px solid ${K.ink};padding-top:22px;font:italic 400 40px/1.25 NR">Models are getting cheaper to use. Everything around them is getting more expensive.</div>`,
 // 09 sources / closing
 `${meta(9)}<div class="a m H" style="top:140px;font-size:92px">sources</div>
  <div class="a m" style="top:300px">${[
   ['Bank of England', 'Financial Stability Report, 26 Nov 2026 (as reported by The Next Web, Scottish Financial News, AJ Bell, StockAnalysis)'],
   ['Financial Times', 'Nvidia pauses server shipments to four South-East Asian countries, 26 Nov 2026 (via US News, Business Standard, The National)'],
   ['Bloomberg', 'SAP weighs cutting at least 10,000 positions, 26 Nov 2026 (via Business Standard, BusinessWorld)'],
   ['Government of Canada', 'AI Compute Access Fund expansion, 26 Nov 2026 (via The Next Web, Unite.AI)']].map(([p, t]) => `
   <div style="border-top:2px solid ${K.div};padding:20px 0"><div class="cat" style="color:${K.ink}">${p}</div><div class="b" style="font-size:26px;margin-top:6px;color:#4A443D">${t}</div></div>`).join('')}</div>
  <div class="a m" style="top:1040px;background:${K.ink};color:${K.cream};border-radius:12px;padding:30px 34px">
   <div style="font:800 36px/1.2 I;letter-spacing:-.02em">Save this edition. Send it to the friend who still thinks AI is just chatbots.</div>
   <div style="font:500 22px I;color:#C9BFB2;margin-top:10px">Links in the caption · New edition tomorrow</div></div>`,
];
const names = ['01-cover', '02-briefing', '03-boe', '04-nvidia', '05-sap', '06-canada', '07-big-picture', '08-my-take', '09-sources'];
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  for (let i = 0; i < S.length; i++) { const f = OUT + '/_s.html';
    fs.writeFileSync(f, `<html><head><style>${css}</style></head><body>${S[i]}</body></html>`);
    await pg.goto('file://' + f); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(200);
    await pg.screenshot({ path: `${OUT}/${names[i]}.png` }); }
  fs.unlinkSync(OUT + '/_s.html'); await b.close(); console.log('ok');
})();
