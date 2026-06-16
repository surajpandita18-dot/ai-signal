import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const OUT = '/tmp/aib-qa'
const PROD = 'https://aibasically-eta.vercel.app/i/001'

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()

// 1. TLDR area at top — to show hover affordance + tappable rows
for (const [label, vp] of [
  ['nav-tldr-desktop', { width: 1400, height: 900 }],
  ['nav-tldr-mobile',  { width: 390,  height: 844 }],
]) {
  const ctx = await browser.newContext({ viewport: vp })
  const page = await ctx.newPage()
  await page.goto(PROD, { waitUntil: 'networkidle', timeout: 30000 })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(500)
  // Hover the first TLDR row to show the hover state on desktop
  if (vp.width >= 800) {
    await page.locator('.tldr li').nth(2).hover()
    await page.waitForTimeout(150)
  }
  await page.screenshot({ path: `${OUT}/${label}.png`, clip: { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, 900) } })
  await ctx.close()
}

// 2. Section Pilot in default + open state — scroll past hero first
for (const [label, vp, openPilot] of [
  ['nav-pilot-desktop-closed', { width: 1400, height: 900 }, false],
  ['nav-pilot-desktop-open',   { width: 1400, height: 900 }, true],
  ['nav-pilot-mobile-closed',  { width: 390,  height: 844 }, false],
  ['nav-pilot-mobile-open',    { width: 390,  height: 844 }, true],
]) {
  const ctx = await browser.newContext({ viewport: vp })
  const page = await ctx.newPage()
  await page.goto(PROD, { waitUntil: 'networkidle', timeout: 30000 })
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(() => {
    const sec = document.getElementById('sec-04')
    if (sec) sec.scrollIntoView({ block: 'start' })
  })
  await page.waitForTimeout(1000)

  if (openPilot) {
    const btn = await page.locator('.section-pilot button').first()
    await btn.click().catch(() => {})
    await page.waitForTimeout(300)
  }

  await page.screenshot({ path: `${OUT}/${label}.png`, clip: { x: 0, y: 0, width: vp.width, height: Math.min(vp.height, 900) } })
  await ctx.close()
}

await browser.close()
console.log('DONE')
