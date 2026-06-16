import { chromium } from 'playwright'

const PROD = 'https://aibasically.co'
const URLS = [
  ['landing', '/'],
  ['about', '/about'],
  ['issue', '/i/001?preview=1'],
  ['archive', '/archive'],
]

const browser = await chromium.launch()

for (const [label, urlPath] of URLS) {
  console.log(`\n=== FOCUS WALK ${label} ===`)
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(PROD + urlPath, { waitUntil: 'networkidle' })

  // Find all clickable-looking spans (poll opts, track chips) — these are
  // mouse-only interactive elements that screen-reader/keyboard users can't reach.
  const orphans = await page.evaluate(() => {
    const out = []
    // Find spans with onClick or class indicating they're interactive
    const interactiveClasses = ['.poll .opt', '.track-chip', '.copyable', '.share-card']
    for (const cls of interactiveClasses) {
      const els = [...document.querySelectorAll(cls)]
      for (const el of els) {
        const tag = el.tagName.toLowerCase()
        const tabindex = el.getAttribute('tabindex')
        const role = el.getAttribute('role')
        const ariaLabel = el.getAttribute('aria-label')
        if (tag === 'span' || tag === 'div') {
          out.push({
            selector: cls,
            tag,
            tabindex,
            role,
            ariaLabel,
            text: (el.textContent || '').trim().slice(0, 40),
          })
        }
      }
    }
    return out
  })

  console.log(`  Clickable non-focusable spans/divs: ${orphans.length}`)
  for (const o of orphans.slice(0, 12)) {
    console.log(`    ${o.tag}.${o.selector} text="${o.text}" tabindex=${o.tabindex} role=${o.role} aria-label=${o.ariaLabel}`)
  }

  // Press Tab repeatedly and capture focused element's outline color/style
  await page.evaluate(() => {
    const style = document.createElement('style')
    style.textContent = '* { caret-color: transparent; }'
    document.head.appendChild(style)
  })
  const tabResults = []
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab')
    const info = await page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body) return null
      const cs = getComputedStyle(el)
      // Check pseudo :focus-visible styles
      return {
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || el.placeholder || el.getAttribute('aria-label') || '').trim().slice(0, 40),
        outline: cs.outline,
        outlineStyle: cs.outlineStyle,
        outlineColor: cs.outlineColor,
        outlineOffset: cs.outlineOffset,
        boxShadow: cs.boxShadow,
      }
    })
    if (info) tabResults.push(info)
  }

  console.log(`\n  Tab sequence (${tabResults.length} stops):`)
  for (const t of tabResults) {
    const ringInfo = t.outlineStyle !== 'none' && t.outlineStyle !== ''
      ? `outline=${t.outlineStyle}/${t.outlineColor}`
      : t.boxShadow !== 'none'
      ? `shadow`
      : 'NO RING'
    console.log(`    ${t.tag.padEnd(8)} ${ringInfo.padEnd(40)} "${t.text}"`)
  }

  await ctx.close()
}

await browser.close()
console.log('\nDONE')
