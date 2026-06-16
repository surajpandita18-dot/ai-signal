/* eslint-disable */
/**
 * Email QA harness.
 * Renders IssueEmail (for each of 3 issues) + WelcomeEmail to /tmp/email-*.html,
 * then loads each in Playwright at 4 widths and records:
 *   - full-page screenshots → /tmp/email-qa/<slug>-<width>.png
 *   - overflow report      → /tmp/email-overflow.json
 *
 * Run with: node scripts/audit-email.cjs
 */
const path = require('node:path')
const fs = require('node:fs')

// --- Set up TSX require hook via sucrase ----------------------------------
// Use the automatic JSX runtime so files that don't `import React` (e.g.
// WelcomeEmail.tsx) still compile correctly.
const { addHook } = require('pirates')
const { transform } = require('sucrase')
addHook(
  (code, filePath) => {
    const { code: out } = transform(code, {
      transforms: ['typescript', 'jsx', 'imports'],
      jsxRuntime: 'automatic',
      production: false,
      filePath,
    })
    return out
  },
  { exts: ['.ts', '.tsx'] },
)

const REPO = path.resolve(__dirname, '..')
const ISSUES = ['001', '002', '003']
const WIDTHS = [600, 480, 375, 360]
const OUT_DIR = '/tmp/email-qa'
const OVERFLOW_PATH = '/tmp/email-overflow.json'

;(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  // Dynamic import for the ESM render package.
  const { render } = await import('@react-email/render')
  const React = require('react')
  const IssueEmail = require(path.join(REPO, 'emails/IssueEmail.tsx')).default
  const WelcomeEmail = require(path.join(REPO, 'emails/WelcomeEmail.tsx')).default
  const { chromium } = require('playwright')

  // ---- 1. Render HTML --------------------------------------------------
  const targets = [] // { slug, htmlPath }

  for (const slug of ISSUES) {
    const json = JSON.parse(
      fs.readFileSync(path.join(REPO, 'content/issues', `${slug}.json`), 'utf-8'),
    )
    const html = await render(
      React.createElement(IssueEmail, {
        content: json,
        siteUrl: 'https://ai-signal-eta.vercel.app',
      }),
    )
    const p = `/tmp/email-${slug}.html`
    fs.writeFileSync(p, html, 'utf-8')
    targets.push({ slug, htmlPath: p })
    console.log(`[render] ${slug} → ${p} (${html.length} bytes)`)
  }
  {
    const html = await render(
      React.createElement(WelcomeEmail, {
        siteUrl: 'https://ai-signal-eta.vercel.app',
      }),
    )
    const p = '/tmp/email-welcome.html'
    fs.writeFileSync(p, html, 'utf-8')
    targets.push({ slug: 'welcome', htmlPath: p })
    console.log(`[render] welcome → ${p} (${html.length} bytes)`)
  }

  // ---- 2. Screenshot + measure ----------------------------------------
  const overflow = {}
  const browser = await chromium.launch()
  try {
    for (const { slug, htmlPath } of targets) {
      overflow[slug] = {}
      for (const w of WIDTHS) {
        const ctx = await browser.newContext({
          viewport: { width: w, height: 800 },
          deviceScaleFactor: 1,
        })
        const page = await ctx.newPage()
        await page.goto('file://' + htmlPath, { waitUntil: 'load' })
        await page.waitForTimeout(100)
        const shot = path.join(OUT_DIR, `${slug}-${w}.png`)
        await page.screenshot({ path: shot, fullPage: true })

        const result = await page.evaluate((vw) => {
          const offenders = []
          const all = document.querySelectorAll('*')
          for (const el of all) {
            const rect = el.getBoundingClientRect()
            const sw = el.scrollWidth || 0
            const cw = el.clientWidth || 0
            const overByScroll = sw - cw
            const overByRight = rect.right - vw
            if (overByScroll > 0 || overByRight > 0.5) {
              const tag = el.tagName.toLowerCase()
              const cls = (el.getAttribute('class') || '').slice(0, 40)
              const txt = (el.textContent || '').trim().slice(0, 60).replace(/\s+/g, ' ')
              offenders.push({
                tag,
                cls,
                scrollOver: overByScroll,
                rightOver: +overByRight.toFixed(2),
                rectRight: +rect.right.toFixed(2),
                rectLeft: +rect.left.toFixed(2),
                text: txt,
              })
            }
          }
          return offenders
        }, w)

        overflow[slug][w] = result
        const sample = result.slice(0, 4).map((r) => `${r.tag}.${r.cls || ''} +${r.scrollOver}/${r.rightOver}`)
        console.log(`[shot] ${slug} @${w}  offenders=${result.length}  ${sample.join(' | ')}`)
        await ctx.close()
      }
    }
  } finally {
    await browser.close()
  }

  fs.writeFileSync(OVERFLOW_PATH, JSON.stringify(overflow, null, 2), 'utf-8')
  console.log(`\nWrote overflow report → ${OVERFLOW_PATH}`)

  // Compact summary
  let total = 0
  for (const slug of Object.keys(overflow)) {
    for (const w of Object.keys(overflow[slug])) {
      total += overflow[slug][w].length
    }
  }
  console.log(`TOTAL offender rows (all widths, all targets): ${total}`)
})().catch((err) => {
  console.error(err)
  process.exit(1)
})
