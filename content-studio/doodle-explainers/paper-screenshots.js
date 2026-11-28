const { chromium } = require('playwright');
const P = { collapse: '2305.17493', hack: '1606.06565', grok: '2201.02177', rot: '2307.03172', syco: '2310.13548', emerge: '2304.15004', distil: '1503.02531' };
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1100, height: 1400 }, deviceScaleFactor: 2, userAgent: 'thinksafari-carousel/1.0 (research screenshot)' });
  for (const [k, id] of Object.entries(P)) {
    try {
      await pg.goto(`https://arxiv.org/abs/${id}`, { waitUntil: 'domcontentloaded', timeout: 30000 }); await pg.waitForTimeout(800);
      const box = await pg.evaluate(() => { const a = document.querySelector('#abs, #content-inner, #abs-outer'); const t = document.querySelector('h1.title'); const ab = document.querySelector('blockquote.abstract');
        if (!t || !ab) return null; const r1 = (document.querySelector('.dateline') || t).getBoundingClientRect(), r2 = ab.getBoundingClientRect(); const L = Math.min(r1.left, r2.left) - 20;
        return { x: Math.max(0, L), y: r1.top + window.scrollY - 20, width: Math.min(1000, r2.right - L + 20), height: Math.min(r2.bottom - r1.top + 40, 700) }; });
      if (!box) { console.log(k, 'no box'); continue; }
      await pg.screenshot({ path: `papers/${k}.png`, clip: box }); console.log(k, 'ok', JSON.stringify(box));
    } catch (e) { console.log(k, 'ERR', e.message.slice(0, 120)); }
    await pg.waitForTimeout(1500);
  }
  try {
    await pg.goto('https://transformer-circuits.pub/2024/scaling-monosemanticity/index.html', { waitUntil: 'domcontentloaded', timeout: 30000 }); await pg.waitForTimeout(2000);
    await pg.screenshot({ path: 'papers/interp.png', clip: { x: 0, y: 0, width: 1100, height: 700 } }); console.log('interp ok');
  } catch (e) { console.log('interp ERR', e.message.slice(0, 120)); }
  await b.close();
})();
