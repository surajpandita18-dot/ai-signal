import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const OUT = '/tmp/aib-flows'
const SITE = 'https://aibasically.co'

const TARGETS = [
  ['landing', '/'],
  ['about', '/about'],
  ['archive', '/archive'],
  ['interviews-index', '/interviews'],
  ['issue-001', '/i/001'],
  ['issue-003', '/i/003'],
  ['interview-001', '/interviews/001'],
  ['interview-002', '/interviews/002'],
  ['interview-003', '/interviews/003'],
]

const VIEWPORTS = [
  ['desktop', { width: 1400, height: 900 }],
  ['mobile', { width: 390, height: 844 }],
]

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()
for (const [label, vpName] of VIEWPORTS.map((v) => [v[0], v[1]])) {
  const [vpLabel, vp] = [label, vpName]
  const ctx = await browser.newContext({ viewport: vp })
  const page = await ctx.newPage()
  for (const [name, path] of TARGETS) {
    const url = SITE + path
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(500)
      await page.screenshot({
        path: `${OUT}/${name}-${vpLabel}.png`,
        fullPage: true,
      })
      console.log(`[ok] ${name}-${vpLabel}`)
    } catch (e) {
      console.log(`[fail] ${name}-${vpLabel}: ${e.message}`)
    }
  }
  await ctx.close()
}
await browser.close()
console.log('DONE')
