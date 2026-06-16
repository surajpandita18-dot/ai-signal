import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import { readFileSync, writeFileSync } from 'node:fs'

const OUT = '/tmp/aib-mobile-audit'
const URL = 'https://aibasically-eta.vercel.app/i/001?preview=1'

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()

const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  hasTouch: true,
  isMobile: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
})
const page = await ctx.newPage()
console.log(`Navigating ${URL}`)
await page.goto(URL, { waitUntil: 'networkidle', timeout: 45000 })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(1200)

// 1. Full page screenshot
await page.screenshot({ path: `${OUT}/full-page.png`, fullPage: true })

// 2. Above-the-fold only
await page.screenshot({ path: `${OUT}/above-the-fold.png`, fullPage: false })

// 3. Section-by-section scroll captures (every ~800px)
const totalHeight = await page.evaluate(() => document.body.scrollHeight)
console.log(`Total page height: ${totalHeight}px`)

const stepH = 700
let i = 0
for (let y = 0; y < totalHeight; y += stepH) {
  await page.evaluate((y) => window.scrollTo(0, y), y)
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${OUT}/scroll-${String(i).padStart(2,'0')}-y${y}.png`, fullPage: false })
  i++
  if (i > 25) break
}

// 4. Element measurement pass — collect bounding boxes of every interactive element
await page.evaluate(() => window.scrollTo(0, 0))
await page.waitForTimeout(300)

const selectors = {
  'track-chip': '.issue .track-chip',
  'foldbtn': '.issue .foldbtn',
  'bn-foldbtn': '.issue .bn-foldbtn',
  'codecopy': '.issue .codecopy',
  'share-card': '.issue .share-card',
  'ref-copy': '.issue .ref-copy',
  'ref-rung': '.issue .ref-rung',
  'poll-opt': '.issue .poll .opt',
  'sig-tag': '.issue .sig-tag',
  'sponsor-cta': '.issue .sp-cta',
  'foldbtn-deep': '.issue .deepfold .foldbtn, .issue button.foldbtn',
  'lens-row': '.issue .lens',
  'signal-foot-link': '.issue .signal-foot a',
  'hero-h1': '.issue .hero h1',
  'mast-wordmark': '.issue .mast .wordmark',
  'tldr-row': '.issue .tldr li',
  'progress-bar': '.issue .progress',
  'jobrow': '.issue .jobrow',
  'try-cta': '.issue .toolbox .try',
}

const measurements = {}
for (const [name, sel] of Object.entries(selectors)) {
  measurements[name] = await page.$$eval(sel, (els) =>
    els.map(el => {
      const r = el.getBoundingClientRect()
      const cs = window.getComputedStyle(el)
      return {
        text: (el.innerText || el.textContent || '').slice(0, 50).replace(/\s+/g, ' '),
        w: Math.round(r.width),
        h: Math.round(r.height),
        x: Math.round(r.left),
        y: Math.round(r.top + window.scrollY),
        padding: cs.padding,
        fontSize: cs.fontSize,
        display: cs.display,
      }
    })
  )
}

writeFileSync(`${OUT}/measurements.json`, JSON.stringify(measurements, null, 2))

// 5. Specific shots: lens picker bar (track-chips), build notes dark band, referral, india signal, closer/poll
const targets = [
  { name: 'track-chip-bar', sel: '.issue .track-bar' },
  { name: 'buildnotes', sel: '.issue .buildnotes' },
  { name: 'codeblock', sel: '.issue .codeblock' },
  { name: 'referral', sel: '.issue .referral' },
  { name: 'india-signal', sel: '.issue .signal2' },
  { name: 'closer-band', sel: '.issue .closer-band' },
  { name: 'poll', sel: '.issue .poll' },
  { name: 'masthead', sel: '.issue .mast' },
  { name: 'hero', sel: '.issue .hero' },
  { name: 'tldr', sel: '.issue .tldr' },
  { name: 'so-what', sel: '.issue .lenses' },
  { name: 'under-the-hood', sel: '.issue .hood' },
  { name: 'reality-check', sel: '.issue .reality' },
]

for (const { name, sel } of targets) {
  const el = await page.$(sel)
  if (!el) { console.log(`[skip] ${name} not found`); continue }
  try {
    await el.scrollIntoViewIfNeeded()
    await page.waitForTimeout(250)
    await el.screenshot({ path: `${OUT}/elem-${name}.png` })
  } catch (e) {
    console.log(`[err] ${name}: ${e.message}`)
  }
}

// 6. Test fold button open behaviour to capture scroll-position-jump risk
await page.evaluate(() => window.scrollTo(0, 0))
const foldBtn = await page.$('.issue .foldbtn')
if (foldBtn) {
  await foldBtn.scrollIntoViewIfNeeded()
  await page.waitForTimeout(200)
  const beforeY = await page.evaluate(() => window.scrollY)
  await foldBtn.click()
  await page.waitForTimeout(400)
  const afterY = await page.evaluate(() => window.scrollY)
  await page.screenshot({ path: `${OUT}/fold-after-open.png`, fullPage: false })
  console.log(`Fold scroll: before=${beforeY} after=${afterY}`)
}

// 7. Body / scroll metrics
const metrics = await page.evaluate(() => ({
  scrollHeight: document.body.scrollHeight,
  viewportH: window.innerHeight,
  viewportW: window.innerWidth,
  dpr: window.devicePixelRatio,
}))
writeFileSync(`${OUT}/metrics.json`, JSON.stringify(metrics, null, 2))
console.log('METRICS', metrics)

await ctx.close()
await browser.close()
console.log('DONE')
