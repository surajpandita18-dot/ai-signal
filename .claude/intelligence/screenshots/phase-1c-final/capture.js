const { chromium } = require('playwright');
const path = require('path');

const OUT = path.join(__dirname);
const BASE = 'http://localhost:3000';

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, name), fullPage: true });
  console.log('saved:', name);
}

(async () => {
  const browser = await chromium.launch();

  // ── Desktop 1440x900 ──────────────────────────────────
  const desk = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const dp = await desk.newPage();

  // Homepage
  await dp.goto(BASE, { waitUntil: 'networkidle' });
  await shot(dp, 'desktop-homepage.png');

  // Find signal link on homepage (href starts with /signal/)
  const signalHref = await dp.evaluate(() => {
    const a = [...document.querySelectorAll('a[href]')]
      .find(el => el.getAttribute('href')?.startsWith('/signal/'));
    return a ? a.getAttribute('href') : null;
  });
  console.log('signal href:', signalHref);

  if (signalHref) {
    await dp.goto(BASE + signalHref, { waitUntil: 'networkidle' });
    await shot(dp, 'desktop-signal.png');

    // Scroll to insight icons area
    await dp.evaluate(() => {
      const el = document.querySelector('.insights-strip');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await dp.screenshot({ path: path.join(OUT, 'desktop-signal-insights.png') });

    // Scroll to decision aid
    await dp.evaluate(() => {
      const el = document.querySelector('.decision-aid');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await dp.screenshot({ path: path.join(OUT, 'desktop-signal-decision.png') });
  }
  await desk.close();

  // ── Mobile 375x812 ────────────────────────────────────
  const mob = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const mp = await mob.newPage();

  await mp.goto(BASE, { waitUntil: 'networkidle' });
  await shot(mp, 'mobile-homepage.png');

  if (signalHref) {
    await mp.goto(BASE + signalHref, { waitUntil: 'networkidle' });
    await shot(mp, 'mobile-signal.png');
  }
  await mob.close();

  // ── Text dump — key rendered values ───────────────────
  const check = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const cp = await check.newPage();
  if (signalHref) {
    await cp.goto(BASE + signalHref, { waitUntil: 'networkidle' });
    const vals = await cp.evaluate(() => {
      const t = s => document.querySelector(s)?.textContent?.trim() ?? '[NOT FOUND]';
      return {
        blockTitles:    [...document.querySelectorAll('.block-title')].map(e => e.textContent.trim()),
        stakeholderSub: t('.stakeholders-subtitle'),
        cascadeSub:     t('.cascade-subtitle'),
        insightIcons:   [...document.querySelectorAll('.insight-icon')].map(e => {
          const s = window.getComputedStyle(e);
          return { bg: s.backgroundColor, color: s.color };
        }),
        decisionPills:  [...document.querySelectorAll('.decision-pill')].map(e => e.textContent.trim()),
        sidebarVisible: (() => {
          const el = document.querySelector('.sidebar');
          if (!el) return 'NO SIDEBAR ELEMENT';
          const r = el.getBoundingClientRect();
          return r.width > 0 ? `visible (${r.width}px wide)` : 'hidden/zero-width';
        })(),
      };
    });
    console.log('\n=== CONTENT CHECK ===');
    console.log(JSON.stringify(vals, null, 2));
  }
  await check.close();
  await browser.close();
})();
