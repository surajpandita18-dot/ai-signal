// Confirm via Playwright whether "Archivo Expanded" actually loaded.
import { chromium } from 'playwright'

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } })
const page = await ctx.newPage()
await page.goto('https://aibasically-eta.vercel.app/i/001?preview=1', { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)

const info = await page.evaluate(() => {
  // Inspect a node we know uses Archivo Expanded
  const el = document.querySelector('.hstep .hn') || document.querySelector('.spotlight .stat')
  if (!el) return { error: 'no element found' }
  const cs = getComputedStyle(el)
  // Check if the font is actually loaded
  const fontList = [...document.fonts].map((f) => ({
    family: f.family,
    style: f.style,
    weight: f.weight,
    status: f.status,
  }))
  // Filter for Archivo Expanded
  const expanded = fontList.filter((f) => /Expanded/i.test(f.family))
  return {
    el: el.tagName + '.' + el.className,
    text: (el.textContent || '').slice(0, 30),
    fontFamily: cs.fontFamily,
    fontSize: cs.fontSize,
    fontWeight: cs.fontWeight,
    archivoExpandedEntries: expanded,
    totalFontFaces: fontList.length,
    allFamilies: [...new Set(fontList.map((f) => f.family))],
  }
})
console.log(JSON.stringify(info, null, 2))

// Try to find the stylesheet link in the page
const linkUrl = await page.evaluate(() => {
  const link = [...document.querySelectorAll('link[rel="stylesheet"]')].find((l) =>
    /Archivo\+Expanded/i.test(l.href),
  )
  return link ? link.href : null
})
console.log('\nGoogle Fonts CSS link in page:', linkUrl)
if (linkUrl) {
  // Fetch it via the page's context (correct user-agent etc.)
  const res = await page.evaluate(async (u) => {
    const r = await fetch(u)
    return { ok: r.ok, status: r.status, text: (await r.text()).slice(0, 400) }
  }, linkUrl)
  console.log('Fetched at runtime:', JSON.stringify(res, null, 2))
}

await ctx.close()
await browser.close()
console.log('DONE')
