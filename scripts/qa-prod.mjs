import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const OUT = '/tmp/aib-qa'
const PROD = 'https://ai-signal-eta.vercel.app'

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()

for (const [label, url, vp] of [
  ['prod-landing-desktop', '/', { width: 1400, height: 900 }],
  ['prod-archive-desktop', '/archive', { width: 1400, height: 900 }],
  ['prod-404-desktop',     '/i/001', { width: 1400, height: 900 }],
]) {
  const ctx = await browser.newContext({ viewport: vp })
  const page = await ctx.newPage()
  console.log(`[${label}] ${PROD}${url}`)
  await page.goto(PROD + url, { waitUntil: 'networkidle', timeout: 30000 })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${OUT}/${label}.png`, fullPage: true })
  await ctx.close()
}
await browser.close()
console.log('DONE')
