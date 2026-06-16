import { chromium } from 'playwright'
import { writeFile, mkdir } from 'node:fs/promises'

const OUT = '/tmp/aib-audit'
const PROD = 'https://aibasically-eta.vercel.app'

const URLS = [
  ['landing', '/'],
  ['about', '/about'],
  ['issue', '/i/001?preview=1'],
  ['archive', '/archive'],
  ['notfound', '/i/nonexistent'],
]

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()

const report = {}

for (const [label, urlPath] of URLS) {
  const fullUrl = PROD + urlPath
  console.log(`\n=== AUDITING ${label} :: ${fullUrl} ===`)

  const ctx = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  })

  const page = await ctx.newPage()

  // capture console & errors
  const consoleErrors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleErrors.push({ type: msg.type(), text: msg.text() })
    }
  })
  page.on('pageerror', (e) => consoleErrors.push({ type: 'pageerror', text: String(e) }))

  // capture network
  const requests = []
  page.on('response', async (res) => {
    try {
      const url = res.url()
      const type = res.request().resourceType()
      const status = res.status()
      const len = Number(res.headers()['content-length'] ?? 0)
      requests.push({ url, type, status, len })
    } catch {}
  })

  // perf observer
  await page.addInitScript(() => {
    window.__perfMarks = { lcp: 0, cls: 0, fcp: 0, fid: 0 }
    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          window.__perfMarks.lcp = Math.max(window.__perfMarks.lcp, e.startTime)
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true })
    } catch {}
    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          if (e.name === 'first-contentful-paint') {
            window.__perfMarks.fcp = e.startTime
          }
        }
      }).observe({ type: 'paint', buffered: true })
    } catch {}
    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          if (!e.hadRecentInput) window.__perfMarks.cls += e.value
        }
      }).observe({ type: 'layout-shift', buffered: true })
    } catch {}
  })

  const navStart = Date.now()
  try {
    await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 30000 })
  } catch (e) {
    console.log(`  ! navigation error: ${e.message}`)
  }
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(800)
  const navMs = Date.now() - navStart

  // Get perf marks
  const perfMarks = await page.evaluate(() => window.__perfMarks)
  // Compute total transfer
  const totalBytes = requests.reduce((a, r) => a + (r.len || 0), 0)
  const fontRequests = requests.filter(
    (r) => r.type === 'font' || /font|gstatic|fonts\.google/i.test(r.url),
  )

  // Heading hierarchy & landmarks
  const structure = await page.evaluate(() => {
    const h1s = [...document.querySelectorAll('h1')].map((e) => e.textContent?.trim().slice(0, 80))
    const h2s = [...document.querySelectorAll('h2')].map((e) => e.textContent?.trim().slice(0, 80))
    const h3s = [...document.querySelectorAll('h3')].map((e) => e.textContent?.trim().slice(0, 80))
    const main = document.querySelectorAll('main').length
    const nav = document.querySelectorAll('nav').length
    const header = document.querySelectorAll('header').length
    const footer = document.querySelectorAll('footer').length
    const aside = document.querySelectorAll('aside').length
    const imgs = [...document.querySelectorAll('img')].map((i) => ({
      src: i.src.slice(0, 80),
      alt: i.alt,
    }))
    const svgsNoLabel = [...document.querySelectorAll('svg')].filter(
      (s) => !s.getAttribute('aria-label') && !s.getAttribute('aria-labelledby') && s.getAttribute('aria-hidden') !== 'true',
    ).length
    const lang = document.documentElement.lang
    return { h1s, h2s, h3s, main, nav, header, footer, aside, imgs, svgsNoLabel, lang }
  })

  // Internal links
  const links = await page.evaluate(() => {
    return [...document.querySelectorAll('a')].map((a) => ({
      href: a.getAttribute('href'),
      text: a.textContent?.trim().slice(0, 60),
    }))
  })

  // Focusable elements & visible focus check
  const focusables = await page.evaluate(() => {
    const sel = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    return [...document.querySelectorAll(sel)].length
  })

  // tab through and check that focus is visible on each interactive element
  // We check via outline/box-shadow computed style after focus.
  const focusVisibility = await page.evaluate(() => {
    const sel = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    const nodes = [...document.querySelectorAll(sel)].slice(0, 20)
    const out = []
    for (const n of nodes) {
      n.focus()
      const cs = getComputedStyle(n)
      const hasOutline = cs.outlineStyle !== 'none' && cs.outlineWidth !== '0px'
      const hasShadow = cs.boxShadow !== 'none'
      out.push({
        tag: n.tagName.toLowerCase(),
        text: (n.textContent || n.placeholder || n.getAttribute('aria-label') || '')
          .trim()
          .slice(0, 40),
        outline: cs.outline,
        outlineStyle: cs.outlineStyle,
        outlineColor: cs.outlineColor,
        outlineWidth: cs.outlineWidth,
        boxShadow: cs.boxShadow,
        hasFocusRing: hasOutline || hasShadow,
      })
    }
    return out
  })

  // Compute color contrast for body text vs bg sampled at major regions
  const contrastSamples = await page.evaluate(() => {
    function srgbLinear(c) {
      c /= 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    }
    function lumOf(color) {
      const m = color.match(/\d+\.?\d*/g)
      if (!m) return 0
      const [r, g, b] = m.slice(0, 3).map(Number)
      return 0.2126 * srgbLinear(r) + 0.7152 * srgbLinear(g) + 0.0722 * srgbLinear(b)
    }
    function contrastRatio(c1, c2) {
      const l1 = lumOf(c1)
      const l2 = lumOf(c2)
      const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]
      return (hi + 0.05) / (lo + 0.05)
    }
    function effectiveBg(el) {
      let n = el
      while (n && n !== document.body) {
        const cs = getComputedStyle(n)
        if (cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent') {
          return cs.backgroundColor
        }
        n = n.parentElement
      }
      return getComputedStyle(document.body).backgroundColor
    }
    const selectors = [
      'h1', 'h2', 'p', '.sub', '.lede', '.eyebrow', '.tagline', '.meta',
      '.label .nm-lab', '.label .hint', '.label .n', '.tldr li', '.tldr .t-lab',
      '.foldbtn', '.track-chip', '.track-chip.on', '.lens .who', '.lens p',
      '.hood .q', '.hstep p', '.hstep b',
      '.buildnotes h2', '.bn-top', '.bn-takeaway', '.bn-box p', '.bn-link a',
      '.reality h3', '.reality p', '.reality .rc-top',
      '.signal2 .sig h4', '.signal2 .sig p', '.signal-foot',
      '.ref-head', '.ref-sub', '.ref-rung', '.ref-count', '.ref-copy',
      '.closer-band .joke', '.closer-band .lab', '.cc-tag', '.cc-rot',
      '.poll .q', '.poll .opt', '.poll .opt.picked', '.poll-thanks', '.foot',
      '.jobrow .what', '.jobrow .trend', '.spotlight .stat', '.spotlight .src',
      '.upskill p', '.upskill .h', '.rung p', '.rung .rl', '.ladder-note',
      '.interview .iv-q .q', '.interview .iv-q .lab', '.interview .iv-a .step', '.interview .iv-a .tip',
      '.stamp p', '.stamp b', '.toolbox .tool', '.toolbox .try',
      '.rep-tier p', '.rt-lab', '.sodo', '.rep-type', '.rotation-note',
      '.sponsor .sp-tag', '.sp-copy', '.sp-cta',
      'button', 'input', 'a',
    ]
    const out = []
    const seen = new Set()
    for (const sel of selectors) {
      const els = [...document.querySelectorAll(sel)]
      for (const el of els.slice(0, 1)) {
        const cs = getComputedStyle(el)
        const fg = cs.color
        const bg = effectiveBg(el)
        const fontSize = parseFloat(cs.fontSize)
        const fontWeight = parseInt(cs.fontWeight) || 400
        const isLarge = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700)
        const ratio = contrastRatio(fg, bg)
        const required = isLarge ? 3 : 4.5
        const key = `${sel}|${fg}|${bg}|${Math.round(fontSize)}`
        if (seen.has(key)) continue
        seen.add(key)
        out.push({
          selector: sel,
          text: (el.textContent || '').trim().slice(0, 40),
          fg,
          bg,
          fontSize,
          fontWeight,
          isLarge,
          ratio: Math.round(ratio * 100) / 100,
          required,
          pass: ratio >= required,
        })
      }
    }
    return out
  })

  // a11y snapshot
  let a11ySnap = null
  try {
    a11ySnap = await page.accessibility.snapshot({ interestingOnly: true })
  } catch (e) {
    a11ySnap = { error: e.message }
  }

  // Document HTML for reduced-motion check
  const hasReducedMotionCss = await page.evaluate(() => {
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.cssText && rule.cssText.includes('prefers-reduced-motion')) return true
        }
      } catch {}
    }
    return false
  })

  // Page text dump for voice consistency
  const bodyText = await page.evaluate(() => {
    return document.body.innerText.slice(0, 4000)
  })

  // Status code from initial response
  const initialReq = requests.find((r) => r.type === 'document')
  const status = initialReq?.status

  report[label] = {
    url: fullUrl,
    navMs,
    status,
    perfMarks,
    totalBytes,
    requestCount: requests.length,
    fontRequests: fontRequests.map((r) => ({ url: r.url.slice(0, 100), len: r.len, status: r.status })),
    structure,
    linksCount: links.length,
    links,
    focusables,
    focusVisibility,
    contrastSamples,
    consoleErrors,
    hasReducedMotionCss,
    bodyTextPreview: bodyText,
    a11ySnap: a11ySnap ? JSON.stringify(a11ySnap).slice(0, 6000) : null,
  }

  await ctx.close()
}

await browser.close()
await writeFile(`${OUT}/report.json`, JSON.stringify(report, null, 2))
console.log(`\nDONE. Report at ${OUT}/report.json`)
