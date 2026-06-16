// Pixel QA — screenshot the Next.js render vs the HTML design source for comparison.
// Outputs into /tmp/aib-qa/ (gitignored implicitly — outside repo).
// Run: node scripts/qa-screenshots.mjs
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const OUT = '/tmp/aib-qa'
const SRC_HTML = 'file:///Users/surajpandita/Downloads/ai-basically-FINAL.html'
const APP_URL = 'http://localhost:3001/i/001?preview=1'

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch()

async function shot(label, opts, fn) {
  const ctx = await browser.newContext({ viewport: opts.viewport, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  console.log(`\n[${label}] loading ${opts.url}`)
  await page.goto(opts.url, { waitUntil: 'networkidle', timeout: 30000 })
  // wait for web fonts to render so screenshots are font-stable
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(500)
  await fn(page, OUT + '/' + label + '.png')
  await ctx.close()
}

// 1. SOURCE HTML — desktop frame (#mount-desktop element only)
await shot('src-desktop', {
  url: SRC_HTML,
  viewport: { width: 1400, height: 900 },
}, async (page, out) => {
  const el = await page.locator('#mount-desktop').first()
  await el.scrollIntoViewIfNeeded()
  const box = await el.boundingBox()
  if (!box) throw new Error('mount-desktop not found')
  await el.screenshot({ path: out })
  console.log(`  saved ${out}  (${box.width}x${box.height})`)
})

// 2. SOURCE HTML — mobile frame (#mount-mobile is wrapped in .vp-mobile)
await shot('src-mobile', {
  url: SRC_HTML,
  viewport: { width: 800, height: 1000 },
}, async (page, out) => {
  const el = await page.locator('.vp-mobile').first()
  await el.scrollIntoViewIfNeeded()
  await el.screenshot({ path: out })
  const box = await el.boundingBox()
  console.log(`  saved ${out}  (${box.width}x${box.height})`)
})

// 3. NEXT.JS — desktop full page at 1400 wide
await shot('next-desktop', {
  url: APP_URL,
  viewport: { width: 1400, height: 900 },
}, async (page, out) => {
  await page.screenshot({ path: out, fullPage: true })
  console.log(`  saved ${out}`)
})

// 4. NEXT.JS — mobile full page at 390 wide (iPhone-ish)
await shot('next-mobile', {
  url: APP_URL,
  viewport: { width: 390, height: 844 },
}, async (page, out) => {
  await page.screenshot({ path: out, fullPage: true })
  console.log(`  saved ${out}`)
})

// 5. NEXT.JS — landing
await shot('next-landing', {
  url: 'http://localhost:3001/',
  viewport: { width: 1400, height: 900 },
}, async (page, out) => {
  await page.screenshot({ path: out, fullPage: true })
  console.log(`  saved ${out}`)
})

await browser.close()
console.log('\nDONE')
