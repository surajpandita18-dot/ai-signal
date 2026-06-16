import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const OUT = '/tmp/aib-qa'
const PROD = 'https://aibasically-eta.vercel.app'

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()

for (const [label, url, vp, expand] of [
  ['decoder-closed-desktop', '/i/001?preview=1', { width: 1400, height: 900 }, false],
  ['decoder-open-desktop',   '/i/001?preview=1', { width: 1400, height: 900 }, true],
  ['decoder-open-mobile',    '/i/001?preview=1', { width: 390,  height: 844 }, true],
]) {
  const ctx = await browser.newContext({ viewport: vp })
  const page = await ctx.newPage()
  console.log(`[${label}] ${PROD}${url}`)
  await page.goto(PROD + url, { waitUntil: 'networkidle', timeout: 30000 })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(700)

  if (expand) {
    // Click the Decoder fold button — the one with the .nm-lab "Decoder" near it.
    await page.evaluate(() => {
      const labels = Array.from(document.querySelectorAll('.nm-lab'))
      const decoderLabel = labels.find(l => l.textContent?.trim() === 'Decoder')
      if (decoderLabel) {
        const sec = decoderLabel.closest('.sec')
        const btn = sec?.querySelector('button.foldbtn')
        if (btn) btn.click()
      }
    })
    await page.waitForTimeout(500)
    // Scroll to it for the screenshot framing
    await page.evaluate(() => {
      const labels = Array.from(document.querySelectorAll('.nm-lab'))
      const decoderLabel = labels.find(l => l.textContent?.trim() === 'Decoder')
      if (decoderLabel) decoderLabel.scrollIntoView({ block: 'start' })
    })
    await page.waitForTimeout(300)
  }

  await page.screenshot({ path: `${OUT}/${label}.png`, fullPage: false })
  await ctx.close()
}
await browser.close()
console.log('DONE')
