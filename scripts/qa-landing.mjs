import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const OUT = '/tmp/aib-qa'
const URL = 'https://aibasically-eta.vercel.app/'

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()

for (const [label, vp] of [
  ['landing-desktop', { width: 1400, height: 900 }],
  ['landing-mobile',  { width: 390,  height: 844 }],
]) {
  const ctx = await browser.newContext({ viewport: vp })
  const page = await ctx.newPage()
  console.log(`[${label}] ${URL}`)
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${OUT}/iter5-${label}.png`, fullPage: false })
  await ctx.close()
}
await browser.close()
console.log('DONE')
