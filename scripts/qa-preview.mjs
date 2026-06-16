import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const OUT = '/tmp/aib-qa'
const PREVIEW = 'https://ai-signal-jjcbe62vv-surajpandita18-dots-projects.vercel.app'

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()

for (const [label, url, vp] of [
  ['preview-landing-desktop', '/', { width: 1400, height: 900 }],
  ['preview-issue-desktop',   '/i/001?preview=1', { width: 1400, height: 900 }],
  ['preview-issue-mobile',    '/i/001?preview=1', { width: 390, height: 844 }],
]) {
  const ctx = await browser.newContext({ viewport: vp })
  const page = await ctx.newPage()
  console.log(`[${label}] ${PREVIEW}${url}`)
  await page.goto(PREVIEW + url, { waitUntil: 'networkidle', timeout: 30000 })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(700)
  await page.screenshot({ path: `${OUT}/${label}.png`, fullPage: true })
  await ctx.close()
}
await browser.close()
console.log('DONE')
