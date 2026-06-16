import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const OUT = '/tmp/aib-qa'
const PROD = 'https://ai-signal-eta.vercel.app'

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()

for (const [label, url, vp] of [
  ['r2-i002-desktop',  '/i/002', { width: 1400, height: 900 }],
  ['r2-i002-mobile',   '/i/002', { width: 390,  height: 844 }],
  ['r2-i003-desktop',  '/i/003', { width: 1400, height: 900 }],
  ['r2-i003-mobile',   '/i/003', { width: 390,  height: 844 }],
  ['r2-archive',       '/archive', { width: 1400, height: 900 }],
]) {
  const ctx = await browser.newContext({ viewport: vp })
  const page = await ctx.newPage()
  console.log(`[${label}] ${PROD}${url}`)
  await page.goto(PROD + url, { waitUntil: 'networkidle', timeout: 30000 })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(700)
  await page.screenshot({ path: `${OUT}/${label}.png`, fullPage: true })
  await ctx.close()
}
await browser.close()
console.log('DONE')
