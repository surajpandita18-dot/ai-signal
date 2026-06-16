// Horizontal overflow audit for /i/[slug] pages.
// Visits each issue at desktop (1400x900) and mobile (390x844).
// Opens Build Notes + Under the Hood folds, then measures every element:
//   - scrollWidth - clientWidth  > 0  → overflowing its container
//   - getBoundingClientRect().right > window.innerWidth  → escapes the viewport
// Writes /tmp/overflow-report.json AND screenshots offenders to /tmp/.

import { chromium } from 'playwright'
import { writeFileSync, mkdirSync } from 'node:fs'

const BASE = process.env.AUDIT_BASE ?? 'https://aibasically.co'
const SLUGS = ['001', '002', '003']
const VIEWPORTS = [
  { name: 'desktop', width: 1400, height: 900, isMobile: false },
  { name: 'mobile',  width: 390,  height: 844, isMobile: true  },
]
const OUT_DIR = '/tmp'
mkdirSync(OUT_DIR, { recursive: true })

// Ignore reasons —
//   - elements we know scroll on purpose (e.g. .codeblock)
//   - off-DOM elements (display:none / position:fixed full-bleed progress bar)
const ALLOWED_SELECTORS = new Set([
  '.issue .codeblock',          // intentional horizontal scroll for code
  '.issue .codeblock pre',      // same; pre is the actual scroll container
  '.issue .progress',           // fixed full-bleed bar, width animates
])

function shouldIgnore(selector) {
  return ALLOWED_SELECTORS.has(selector)
}

const SHOT_LIMIT = 30

async function auditPage(page, slug, viewport, shotCounter) {
  const url = `${BASE}/i/${slug}`
  console.log(`\n=== ${slug} @ ${viewport.name} (${viewport.width}x${viewport.height}) ===`)
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
  await page.evaluate(() => document.fonts && document.fonts.ready)
  await page.waitForTimeout(600)

  // Open every Build Notes fold + Under the Hood fold.
  const bnButtons = await page.$$('button.bn-foldbtn')
  for (const b of bnButtons) {
    try { await b.click(); } catch {}
  }
  const foldButtons = await page.$$('button.foldbtn')
  for (const b of foldButtons) {
    try { await b.click(); } catch {}
  }
  await page.waitForTimeout(500)

  // Run measurement in-page.
  const result = await page.evaluate(() => {
    function cssPath(el) {
      if (!(el instanceof Element)) return ''
      const parts = []
      while (el && el.nodeType === 1 && parts.length < 6) {
        let part = el.nodeName.toLowerCase()
        if (el.id) { part += `#${el.id}`; parts.unshift(part); break }
        if (el.className && typeof el.className === 'string') {
          const cls = el.className.trim().split(/\s+/).slice(0, 3).join('.')
          if (cls) part += `.${cls}`
        }
        parts.unshift(part)
        el = el.parentElement
      }
      return parts.join(' > ')
    }
    const VW = window.innerWidth
    const offenders = []
    const all = document.querySelectorAll('.issue, .issue *')
    for (const el of all) {
      const cs = window.getComputedStyle(el)
      if (cs.display === 'none' || cs.visibility === 'hidden') continue
      const rect = el.getBoundingClientRect()
      // Skip zero-area
      if (rect.width === 0 && rect.height === 0) continue
      // Skip SVG internals — scrollWidth on SVG text/rect/path is unreliable
      // (reports glyph extent, not viewport overflow). The wrapping <svg> is
      // already constrained to max-width:100% by .bn-svg / .hood-svg / the
      // overflow containment block. If the <svg> root itself overflowed, we'd
      // catch it via its own iteration.
      const ns = el.namespaceURI
      if (ns === 'http://www.w3.org/2000/svg' && el.tagName.toLowerCase() !== 'svg') continue
      const scrollOverflowX = el.scrollWidth - el.clientWidth
      const rightEscape = rect.right - VW
      const isContainerOverflow = scrollOverflowX > 1 // 1px tolerance
      const isViewportEscape = rect.right > VW + 1
      if (!isContainerOverflow && !isViewportEscape) continue
      offenders.push({
        path: cssPath(el),
        tag: el.tagName.toLowerCase(),
        cls: typeof el.className === 'string' ? el.className : '',
        text: (el.innerText || el.textContent || '').replace(/\s+/g,' ').slice(0, 80),
        scrollW: el.scrollWidth,
        clientW: el.clientWidth,
        scrollOverflowX: Math.round(scrollOverflowX),
        rectLeft: Math.round(rect.left),
        rectRight: Math.round(rect.right),
        rectWidth: Math.round(rect.width),
        viewportWidth: VW,
        rightEscape: Math.round(rightEscape),
        overflowX: cs.overflowX,
        whiteSpace: cs.whiteSpace,
        wordBreak: cs.wordBreak,
        display: cs.display,
      })
    }
    return offenders
  })

  // Filter allowed
  const filtered = result.filter(o => {
    const clsList = o.cls.split(/\s+/).filter(Boolean).map(c => `.${c}`).join('')
    const matchTry = (k) => o.path.endsWith(k) || o.path.includes(k)
    for (const allowed of [
      '.codeblock pre',
      '.codeblock',
      '.progress',
    ]) {
      if (matchTry(allowed)) return false
    }
    return true
  })

  // Screenshot a few unique offenders (dedupe by path family).
  const seen = new Set()
  for (const off of filtered) {
    const key = off.path.split(' > ').slice(-2).join(' > ')
    if (seen.has(key)) continue
    if (shotCounter.n >= SHOT_LIMIT) break
    seen.add(key)
    try {
      const handle = await page.evaluateHandle((sel) => {
        // We don't have selectors, so re-locate by approximate path: find first element whose path matches.
        return null
      }, off.path).catch(()=>null)
      // Simpler: locate by cls + text fragment.
      const target = await page.$(`xpath=//*[contains(concat(" ", normalize-space(@class), " "), " ${off.cls.split(/\s+/)[0]} ")]`).catch(()=>null)
      if (target) {
        await target.screenshot({ path: `${OUT_DIR}/overflow-${slug}-${viewport.name}-${shotCounter.n}.png` }).catch(()=>{})
      }
    } catch {}
    shotCounter.n += 1
  }

  console.log(`  → ${filtered.length} offenders (raw ${result.length})`)
  return filtered.map(o => ({ slug, viewport: viewport.name, ...o }))
}

const browser = await chromium.launch()
const all = []
const shotCounter = { n: 0 }
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
    hasTouch: vp.isMobile,
    isMobile: vp.isMobile,
    userAgent: vp.isMobile
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148'
      : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  })
  const page = await ctx.newPage()
  for (const slug of SLUGS) {
    const offs = await auditPage(page, slug, vp, shotCounter)
    all.push(...offs)
  }
  await ctx.close()
}
await browser.close()

writeFileSync(`${OUT_DIR}/overflow-report.json`, JSON.stringify({
  generatedAt: new Date().toISOString(),
  base: BASE,
  totalOffenders: all.length,
  offenders: all,
}, null, 2))

console.log(`\nWrote /tmp/overflow-report.json — ${all.length} total offenders`)
