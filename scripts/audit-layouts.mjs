#!/usr/bin/env node
/**
 * Multi-device layout + readability audit.
 *
 *   node scripts/audit-layouts.mjs            # audits the live site
 *   node scripts/audit-layouts.mjs http://localhost:3000  # local dev
 *
 * What it does:
 *   1. Screenshots every key route at 3 web viewports (390 mobile, 768 tablet,
 *      1400 desktop) and the email HTML at 3 email widths (360, 600, 700).
 *   2. Runs deterministic in-page checks on each web viewport:
 *        - any element wider than viewport (horizontal overflow)
 *        - any single text block consuming > 45% of viewport height on mobile
 *          (the "bloat" check Suraj called out on the interview teaser)
 *        - body-text font-size below 13px
 *        - heading hierarchy gaps (skipping h2/h3)
 *        - links without visible text content
 *        - tap-target size on mobile < 36px (WCAG suggests 44, we're a little loose)
 *   3. Writes screenshots to /tmp/aib-layout-audit/ and a machine-readable
 *      JSON report to /tmp/aib-layout-audit.json.
 *   4. Exits non-zero if any P0 (overflow, tap-target, bloat) check fires.
 *
 * Pair with scripts/audit-layouts-judge.mjs to get an LLM visual review of the
 * screenshots — that script picks up the JSON + screenshots and produces a
 * human-language readability verdict. Run audit first, judge second.
 *
 * The list of routes + the bloat thresholds are deliberately conservative.
 * Loosen them only after logging in system/MISTAKES.md why.
 */
import { chromium } from 'playwright'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

const OUT = '/tmp/aib-layout-audit'
const REPORT = '/tmp/aib-layout-audit.json'
const SITE = process.argv[2] || 'https://ai-signal-eta.vercel.app'

// Routes to audit. Cover the full reader user-flow surface, not just landing.
const ROUTES = [
  ['landing', '/'],
  ['about', '/about'],
  ['archive', '/archive'],
  ['interviews-index', '/interviews'],
  ['issue-001', '/i/001'],
  ['issue-002', '/i/002'],
  ['issue-003', '/i/003'],
  ['issue-004-preview', '/i/004?preview=1'],
  ['interview-001', '/interviews/001'],
  ['interview-002', '/interviews/002'],
  ['interview-003', '/interviews/003'],
  ['interview-004', '/interviews/004'],
]

const VIEWPORTS = [
  ['mobile', { width: 390, height: 844 }],
  ['tablet', { width: 768, height: 1024 }],
  ['desktop', { width: 1400, height: 900 }],
]

const P0_BLOAT_PCT = 45 // single text block ≥ this % of viewport height = flag
const P1_MIN_FONT = 13
const P0_MIN_TAP = 36

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch()
/** @type {Array<{route: string; viewport: string; flags: Array<{level: 'P0'|'P1'; kind: string; detail: string}>}>} */
const results = []

for (const [vpLabel, viewport] of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport })
  const page = await ctx.newPage()
  for (const [routeLabel, route] of ROUTES) {
    const url = SITE + route
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(400)

      const flags = await page.evaluate(
        ({ vpW, vpH, P0_BLOAT_PCT, P1_MIN_FONT, P0_MIN_TAP, isMobile }) => {
          /** @type {Array<{level: 'P0'|'P1'; kind: string; detail: string}>} */
          const out = []
          // 1. Horizontal overflow — any element wider than the viewport.
          //    Skip absolutely-positioned drawer/menu elements that legitimately
          //    overflow when collapsed.
          const all = Array.from(document.body.querySelectorAll('*'))
          for (const el of all) {
            const r = el.getBoundingClientRect()
            const cs = getComputedStyle(el)
            if (cs.position === 'fixed' || cs.position === 'absolute') continue
            if (r.width > vpW + 1) {
              out.push({
                level: 'P0',
                kind: 'horizontal-overflow',
                detail: `<${el.tagName.toLowerCase()}> width=${Math.round(r.width)}px vs vp ${vpW}px (${el.className || el.id || 'no class'})`,
              })
              if (out.filter((f) => f.kind === 'horizontal-overflow').length >= 3) break
            }
          }
          // 2. Bloat — a single text-bearing block whose height > P0_BLOAT_PCT
          //    of viewport on mobile. Editorial ledes (`.lede`, `.sub`, the
          //    long-form sample-answer body) are EXPECTED to be substantial;
          //    they're the heart of the read. Skip them. The real bloat we want
          //    to catch is TEASER cards (`.q` interview teaser, etc.) that
          //    accidentally render full long-form content.
          if (isMobile) {
            const skipParentClasses = ['lede', 'sub', 'one-thing', 'so_what', 'finding', 'fix', 'sample', 'sample-answer', 'hero']
            // h1 deliberately excluded — page-level title is supposed to be
            // visually dominant. Bloat check targets card-like / teaser-like
            // elements where compactness is the design intent.
            const blocks = Array.from(document.querySelectorAll('h2, h3, .q, blockquote'))
            for (const el of blocks) {
              // Skip if the element or any ancestor carries a "this is meant
              // to be substantial" class.
              let skip = false
              let cur = el
              while (cur && cur !== document.body) {
                const cls = (cur.className && typeof cur.className === 'string') ? cur.className : ''
                if (skipParentClasses.some((c) => cls.split(/\s+/).includes(c))) { skip = true; break }
                cur = cur.parentElement
              }
              if (skip) continue
              const r = el.getBoundingClientRect()
              const t = (el.textContent || '').trim()
              if (!t || t.length < 30) continue
              if (r.height > (vpH * P0_BLOAT_PCT) / 100) {
                out.push({
                  level: 'P0',
                  kind: 'bloat',
                  detail: `<${el.tagName.toLowerCase()}.${el.className || ''}> height=${Math.round(r.height)}px (${Math.round((r.height / vpH) * 100)}% of viewport) — "${t.slice(0, 80)}…"`,
                })
                if (out.filter((f) => f.kind === 'bloat').length >= 3) break
              }
            }
          }
          // 3. Body-text font-size too small.
          const txt = Array.from(document.querySelectorAll('p, li, dd, dt')).filter(
            (el) => (el.textContent || '').trim().length > 0,
          )
          for (const el of txt.slice(0, 50)) {
            const fs = parseFloat(getComputedStyle(el).fontSize)
            if (fs && fs < P1_MIN_FONT) {
              out.push({
                level: 'P1',
                kind: 'small-text',
                detail: `<${el.tagName.toLowerCase()}> font-size=${fs}px < ${P1_MIN_FONT}px floor`,
              })
              if (out.filter((f) => f.kind === 'small-text').length >= 3) break
            }
          }
          // 4. Tap targets on mobile — STANDALONE buttons/CTAs should be ≥ 36px.
          //    Skip inline text links inside paragraphs / spans — those are
          //    legitimately small because they're inline text, not tap targets.
          //    Apply only to: <button>, [role=button], standalone <a> NOT
          //    inside a paragraph (i.e. a direct child of nav / section / li /
          //    div without surrounding text run).
          if (isMobile) {
            const tappables = Array.from(
              document.querySelectorAll('button, [role="button"], a'),
            )
            for (const el of tappables) {
              const r = el.getBoundingClientRect()
              if (r.width === 0 || r.height === 0) continue
              // Skip inline text links — those whose direct parent is a <p>,
              // <span>, <small>, <em>, <strong>, <i>, <b>, or paragraph-content
              // element. They're text decoration, not interactive surfaces.
              if (el.tagName === 'A') {
                const parent = el.parentElement
                if (parent) {
                  const pTag = parent.tagName.toLowerCase()
                  if (['p', 'span', 'small', 'em', 'strong', 'i', 'b', 'h1', 'h2', 'h3', 'h4'].includes(pTag)) continue
                  // Also skip if it has only inline text siblings (i.e. it's
                  // floating in a text run inside a container div).
                  const cs = getComputedStyle(el)
                  if (cs.display === 'inline' && (parent.textContent || '').replace(el.textContent || '', '').trim().length > 0) continue
                }
              }
              if (r.height < P0_MIN_TAP) {
                out.push({
                  level: 'P0',
                  kind: 'tap-target',
                  detail: `<${el.tagName.toLowerCase()}> ${Math.round(r.width)}×${Math.round(r.height)}px (need ≥ ${P0_MIN_TAP}px) — "${(el.textContent || '').trim().slice(0, 40)}"`,
                })
                if (out.filter((f) => f.kind === 'tap-target').length >= 3) break
              }
            }
          }
          // 5. Heading hierarchy — flag h3 with no preceding h2, etc.
          const hs = Array.from(document.querySelectorAll('h1, h2, h3, h4'))
          let last = 1
          for (const h of hs) {
            const lvl = parseInt(h.tagName[1], 10)
            if (lvl > last + 1) {
              out.push({
                level: 'P1',
                kind: 'heading-skip',
                detail: `${h.tagName} after h${last} — "${(h.textContent || '').trim().slice(0, 40)}"`,
              })
              if (out.filter((f) => f.kind === 'heading-skip').length >= 3) break
            }
            last = lvl
          }
          return out
        },
        { vpW: viewport.width, vpH: viewport.height, P0_BLOAT_PCT, P1_MIN_FONT, P0_MIN_TAP, isMobile: vpLabel === 'mobile' },
      )

      const shotPath = path.join(OUT, `${routeLabel}-${vpLabel}.png`)
      await page.screenshot({ path: shotPath, fullPage: true })

      results.push({ route: routeLabel, viewport: vpLabel, url, flags, screenshot: shotPath })
      const p0 = flags.filter((f) => f.level === 'P0').length
      const p1 = flags.filter((f) => f.level === 'P1').length
      const tag = p0 ? `❌ ${p0} P0` : p1 ? `⚠ ${p1} P1` : '✓'
      console.log(`[${vpLabel}] ${routeLabel.padEnd(20)} ${tag}`)
    } catch (e) {
      console.log(`[${vpLabel}] ${routeLabel} FAIL: ${e.message}`)
      results.push({ route: routeLabel, viewport: vpLabel, url, error: e.message, flags: [] })
    }
  }
  await ctx.close()
}

// Email twin — render to HTML via audit-email.cjs (already exists), then
// inspect at 3 widths.
console.log('--- email ---')
const emailRun = spawnSync('node', [path.resolve(import.meta.dirname, 'audit-email.cjs')], {
  encoding: 'utf8',
})
if (emailRun.status !== 0) {
  console.log('email render fail:', emailRun.stderr || emailRun.stdout)
} else {
  // audit-email.cjs already produced /tmp/email-001.html, /tmp/email-002.html,
  // /tmp/email-003.html, /tmp/email-welcome.html — wrap them at 3 widths.
  const emailWidths = [360, 600, 700]
  const ctx2 = await browser.newContext({ viewport: { width: 700, height: 900 } })
  const page = await ctx2.newPage()
  for (const slug of ['001', '002', '003', 'welcome']) {
    const htmlPath = `/tmp/email-${slug}.html`
    try {
      const html = await readFile(htmlPath, 'utf8')
      for (const w of emailWidths) {
        await page.setViewportSize({ width: w, height: 900 })
        await page.setContent(html, { waitUntil: 'load' })
        await page.waitForTimeout(200)
        const overflow = await page.evaluate((vw) => {
          const all = Array.from(document.body.querySelectorAll('*'))
          for (const el of all) {
            const r = el.getBoundingClientRect()
            if (r.width > vw + 1) {
              return `${el.tagName.toLowerCase()} width=${Math.round(r.width)}px vs ${vw}`
            }
          }
          return null
        }, w)
        const shotPath = path.join(OUT, `email-${slug}-${w}.png`)
        await page.screenshot({ path: shotPath, fullPage: true })
        const flags = overflow ? [{ level: 'P0', kind: 'email-overflow', detail: overflow }] : []
        results.push({ route: `email-${slug}`, viewport: `${w}px`, url: htmlPath, flags, screenshot: shotPath })
        const tag = flags.length ? `❌ ${flags.length} P0` : '✓'
        console.log(`[email@${w}] ${slug} ${tag}`)
      }
    } catch (e) {
      console.log(`email-${slug} skipped: ${e.message}`)
    }
  }
  await ctx2.close()
}

await browser.close()

await writeFile(REPORT, JSON.stringify(results, null, 2))

const totalP0 = results.flatMap((r) => r.flags || []).filter((f) => f.level === 'P0').length
const totalP1 = results.flatMap((r) => r.flags || []).filter((f) => f.level === 'P1').length
console.log(`---\nP0: ${totalP0} · P1: ${totalP1} · ${results.length} surface×viewport pairs audited`)
console.log(`Screenshots: ${OUT}`)
console.log(`Report: ${REPORT}`)
process.exit(totalP0 > 0 ? 1 : 0)
