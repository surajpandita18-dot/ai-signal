#!/usr/bin/env node
/**
 * Surface-level rubric runner — deterministic visual + email evaluator.
 *
 * Complementary to /src/lib/pipeline/rubric.ts (which scores CONTENT axes).
 * This one scores READABILITY (typography), DESIGN (visual), BRAND VOICE
 * (regex-checkable), and (for emails only) EMAIL SAFETY axes.
 *
 * USAGE
 *   node scripts/rubric.mjs <target>
 *     <target> = a URL                e.g. https://ai-signal-eta.vercel.app/i/001
 *              | "email:001" | "email:002" | "email:003"
 *              | "email:welcome"
 *              | "all"                (web landing + i/001 + 3 emails + welcome)
 *
 * OUTPUT
 *   /tmp/rubric-<slug>.json   per-target full report (deterministic)
 *   stdout                    one-line-per-axis summary + aggregate
 *
 * EXIT
 *   0 → aggregate ≥ 4.0
 *   1 → 3.0 ≤ aggregate < 4.0
 *   2 → aggregate < 3.0
 *
 * DEPS USED (no new installs):
 *   - playwright (already in devDeps)
 *   - esbuild    (already a transitive dep)
 *   - @react-email/render (already in deps)
 *
 * Determinism: every signal is a measured DOM/regex value. No LLM calls.
 * Two runs on the same content produce identical scores.
 */

import { chromium } from 'playwright'
import { build as esbuild } from 'esbuild'
import { writeFile, mkdir, readFile, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO = path.resolve(__dirname, '..')

// ─── Rubric specification ───────────────────────────────────────────────────
// Each criterion: { id, label, axis, kind: 'web'|'email'|'both', weight, score(measurement) }
// `measurement` is computed per surface; `score` maps measurement → 1..5.

const AXES = {
  READABILITY: 'Readability',
  DESIGN: 'Design',
  VOICE: 'Brand voice',
  EMAIL: 'Email-only',
}

// Approved emoji whitelist (from CLAUDE.md voice).
const APPROVED_EMOJIS = new Set(['⚡', '🔨', '↳', '▸', '▾', '⧉', '✓', '■', '→'])

// Banned brand-voice tokens (FOMO triggers).
// Negation guard: AI Basically often uses the literal token in a denial frame
// ("no hype, no FOMO", "no scarcity"). Strip those before checking.
const FOMO_PATTERNS = [
  /missing out/i,
  /\blimited[- ]time\b/i,
  /\bact now\b/i,
  /only \d+ left/i,
  /\bFOMO\b/i,
  /\bscarcity\b/i,
  /\burgency\b/i,
]
const NEGATION_RE = /\bno\s+(hype|fomo|scarcity|urgency|panic)\b/gi

// Approved brand wordmark — exact rendering.
const WORDMARK_RE = /AI,\s*Basically\./

// Regex for finding emoji in arbitrary text. Reasonable coverage; deterministic.
const EMOJI_RE =
  /[\u{1F300}-\u{1FAFF}\u{1F900}-\u{1F9FF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}]/gu

// WCAG contrast helpers.
function srgbToLin(c) {
  const cs = c / 255
  return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4)
}
function luminance({ r, g, b }) {
  return 0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b)
}
function contrastRatio(c1, c2) {
  const L1 = luminance(c1)
  const L2 = luminance(c2)
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1]
  return (hi + 0.05) / (lo + 0.05)
}
function parseRgb(str) {
  if (!str) return null
  const m = /rgba?\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)(?:[ ,/]+([\d.]+))?\s*\)/.exec(str)
  if (!m) return null
  const a = m[4] === undefined ? 1 : parseFloat(m[4])
  if (a < 0.99) return null // skip semi-transparent
  return { r: +m[1], g: +m[2], b: +m[3] }
}

// ─── Scoring rules ──────────────────────────────────────────────────────────
// Every scorer takes the measurement object for that criterion and returns 1..5.

function scoreLineLength(m) {
  // m: { avg, withinIdealRatio }  — withinIdealRatio of measured lines in 45–75.
  const r = m.withinIdealRatio
  if (r >= 0.85) return 5
  if (r >= 0.7) return 4
  if (r >= 0.5) return 3
  if (r >= 0.3) return 2
  return 1
}

function scoreFontSize(m, isEmail) {
  const min = isEmail ? 14 : 15
  const ratio = m.bodyAtOrAboveMinRatio
  if (m.medianPx >= min && ratio >= 0.9) return 5
  if (m.medianPx >= min && ratio >= 0.75) return 4
  if (m.medianPx >= min - 1 && ratio >= 0.6) return 3
  if (m.medianPx >= min - 2) return 2
  return 1
}

function scoreLineHeight(m) {
  // m: { medianRatio, atOrAboveRatio }
  if (m.medianRatio >= 1.5 && m.atOrAboveRatio >= 0.9) return 5
  if (m.medianRatio >= 1.5 && m.atOrAboveRatio >= 0.75) return 4
  if (m.medianRatio >= 1.4) return 3
  if (m.medianRatio >= 1.3) return 2
  return 1
}

function scoreParagraphWords(m) {
  // m: { avg, oversizedRatio (>120 words) }
  const a = m.avg
  if (a >= 40 && a <= 80 && m.oversizedRatio === 0) return 5
  if (a >= 30 && a <= 100 && m.oversizedRatio <= 0.1) return 4
  if (a <= 120 && m.oversizedRatio <= 0.2) return 3
  if (a <= 150) return 2
  return 1
}

function scoreHeadingHierarchy(m) {
  // m: { h1Count, skips }
  if (m.h1Count === 1 && m.skips === 0) return 5
  if (m.h1Count === 1 && m.skips <= 1) return 4
  if (m.h1Count <= 1 && m.skips <= 2) return 3
  if (m.h1Count <= 2) return 2
  return 1
}

function scoreActiveVoice(m) {
  // m: { activeRatio }
  if (m.activeRatio >= 0.8) return 5
  if (m.activeRatio >= 0.7) return 4
  if (m.activeRatio >= 0.6) return 3
  if (m.activeRatio >= 0.5) return 2
  return 1
}

function scoreContrast(m) {
  // m: { failBody, failLarge, total }
  const total = Math.max(1, m.total)
  const failRatio = (m.failBody + m.failLarge) / total
  if (failRatio === 0) return 5
  if (failRatio <= 0.02) return 4
  if (failRatio <= 0.05) return 3
  if (failRatio <= 0.1) return 2
  return 1
}

function scorePalette(m) {
  if (m.distinctHues <= 6) return 5
  if (m.distinctHues <= 8) return 4
  if (m.distinctHues <= 10) return 3
  if (m.distinctHues <= 14) return 2
  return 1
}

function scoreWhitespace(m) {
  // m: { backgroundRatio } target 0.6–0.8
  const r = m.backgroundRatio
  if (r >= 0.6 && r <= 0.8) return 5
  if (r >= 0.55 && r <= 0.85) return 4
  if (r >= 0.5 && r <= 0.9) return 3
  if (r >= 0.4) return 2
  return 1
}

function scoreTapTargets(m) {
  if (m.failures === 0) return 5
  if (m.failures <= 1) return 4
  if (m.failures <= 3) return 3
  if (m.failures <= 6) return 2
  return 1
}

function scoreOverflow(m) {
  if (m.overflowingElements === 0) return 5
  if (m.overflowingElements <= 1) return 4
  if (m.overflowingElements <= 3) return 3
  if (m.overflowingElements <= 6) return 2
  return 1
}

function scoreLayoutConsistency(m) {
  // m: { withinTolerance (0..1) }  — fraction of section gaps within 10% of median
  const r = m.withinTolerance
  if (r >= 0.95) return 5
  if (r >= 0.85) return 4
  if (r >= 0.7) return 3
  if (r >= 0.5) return 2
  return 1
}

function scoreNoFOMO(m) {
  if (m.hits === 0) return 5
  if (m.hits === 1) return 3
  return 1
}

function scoreEmojiDiscipline(m) {
  if (m.unapproved === 0) return 5
  if (m.unapproved <= 1) return 4
  if (m.unapproved <= 3) return 3
  if (m.unapproved <= 6) return 2
  return 1
}

function scoreExclamation(m) {
  // m: { bodyExclamations }
  if (m.bodyExclamations === 0) return 5
  if (m.bodyExclamations === 1) return 4
  if (m.bodyExclamations <= 2) return 3
  if (m.bodyExclamations <= 4) return 2
  return 1
}

function scoreWordmark(m) {
  return m.found ? 5 : 1
}

function scoreAccentDot(m) {
  return m.found ? 5 : 1
}

function scoreNoScript(m) {
  return m.scriptCount === 0 ? 5 : 1
}

function scoreNoExternalImg(m) {
  return m.externalImgCount === 0 ? 5 : m.externalImgCount <= 1 ? 3 : 1
}

function scoreNoCssVars(m) {
  if (m.cssVarHits === 0 && m.classAttrCount === 0) return 5
  if (m.cssVarHits === 0 && m.classAttrCount <= 3) return 4
  if (m.cssVarHits <= 1) return 3
  return 1
}

function scoreContainerWidth(m) {
  return m.maxWidthMatches600 ? 5 : 1
}

function scoreInlineOnly(m) {
  // m: { externalCssLinks, styleTagCount }
  if (m.externalCssLinks === 0 && m.styleTagCount === 0) return 5
  if (m.externalCssLinks === 0 && m.styleTagCount <= 1) return 4
  return 1
}

function scoreSubject(m) {
  // m: { len }
  if (m.len === 0) return 1
  if (m.len <= 40) return 5
  if (m.len <= 50) return 4
  if (m.len <= 65) return 3
  return 2
}

function scorePreview(m) {
  if (m.len === 0) return 1
  if (m.len <= 80) return 5
  if (m.len <= 90) return 4
  if (m.len <= 110) return 3
  return 2
}

// ─── Browser measurement (web mode) ─────────────────────────────────────────

async function measureWeb(url) {
  const browser = await chromium.launch()
  const desktop = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    deviceScaleFactor: 1,
  })
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
  })

  const desktopPage = await desktop.newPage()
  await desktopPage.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
  await desktopPage.evaluate(() => document.fonts.ready)

  const mobilePage = await mobile.newPage()
  await mobilePage.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
  await mobilePage.evaluate(() => document.fonts.ready)

  const measurements = await measureFromPage(desktopPage, false)
  const overflow = await mobilePage.evaluate(() => {
    let bad = 0
    document.querySelectorAll('*').forEach((el) => {
      if (el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0) bad++
    })
    return { overflowingElements: bad }
  })
  const tapTargets = await mobilePage.evaluate(() => {
    let failures = 0
    const sel = 'a,button,[role=button],input,select,textarea'
    document.querySelectorAll(sel).forEach((el) => {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) return // invisible — skip
      if (r.width < 44 || r.height < 44) failures++
    })
    return { failures }
  })
  measurements.overflow = overflow
  measurements.tapTargets = tapTargets

  // Subject / preview not applicable to web.
  await desktop.close()
  await mobile.close()
  await browser.close()
  return measurements
}

// ─── Browser measurement (email mode) ───────────────────────────────────────

async function measureEmail(html, subjectLine) {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({
    viewport: { width: 600, height: 800 },
    deviceScaleFactor: 1,
  })
  const page = await ctx.newPage()
  await page.setContent(html, { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)
  const measurements = await measureFromPage(page, true)

  const ctx2 = await browser.newContext({ viewport: { width: 375, height: 800 } })
  const page2 = await ctx2.newPage()
  await page2.setContent(html, { waitUntil: 'load' })
  const overflow = await page2.evaluate(() => {
    let bad = 0
    document.querySelectorAll('*').forEach((el) => {
      if (el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0) bad++
    })
    return { overflowingElements: bad }
  })
  const tapTargets = await page2.evaluate(() => {
    let failures = 0
    document.querySelectorAll('a,button').forEach((el) => {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) return
      if (r.height < 28) failures++ // email tap targets — relaxed (28px) since text links inside paragraphs are normal
    })
    return { failures }
  })
  measurements.overflow = overflow
  measurements.tapTargets = tapTargets
  measurements.emailRaw = await analyseEmailRaw(html, subjectLine, page)

  await ctx.close()
  await ctx2.close()
  await browser.close()
  return measurements
}

// Pull preview text from <Preview> output (react-email renders it as a hidden span).
// react-email pads the preview with zero-width / non-breaking chars so Gmail's
// snippet line is exactly the preview text and nothing else. We strip those.
function extractPreviewFromHtml(html) {
  const m = /<div[^>]*display:\s*none[^>]*>([\s\S]*?)<\/div>/i.exec(html)
  if (!m) return ''
  let s = m[1].replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/g, ' ')
  // Strip react-email padding: invisible / spacing codepoints used to pad the
  // hidden preview span so Gmail snippets show only the real preview text.
  let out = ''
  for (const ch of s) {
    const cp = ch.codePointAt(0)
    if (
      cp === 0x00a0 ||
      cp === 0x00ad ||
      (cp >= 0x200b && cp <= 0x200f) ||
      cp === 0x202f ||
      cp === 0x205f ||
      cp === 0x2060 ||
      cp === 0xfeff ||
      cp === 0x3000
    ) {
      continue
    }
    out += ch
  }
  return out.replace(/\s+/g, ' ').trim()
}

async function analyseEmailRaw(html, subjectLine, page) {
  const scriptCount = (html.match(/<script\b/gi) || []).length
  const externalImgCount = (
    html.match(/<img[^>]+src\s*=\s*"https?:\/\/(?!data:)/gi) || []
  ).length
  const cssVarHits = (html.match(/var\(--/g) || []).length
  // class="…" usage outside react-email internals; sample
  const classAttrCount = (html.match(/\sclass\s*=\s*"/gi) || []).length
  const externalCssLinks = (
    html.match(/<link[^>]+rel\s*=\s*"stylesheet"/gi) || []
  ).length
  const styleTagCount = (html.match(/<style\b/gi) || []).length
  const maxWidthMatches600 =
    /max-width:\s*600px/i.test(html) || /width=["']?600/i.test(html)
  const previewText = extractPreviewFromHtml(html)
  return {
    scriptCount,
    externalImgCount,
    cssVarHits,
    classAttrCount,
    externalCssLinks,
    styleTagCount,
    maxWidthMatches600,
    subject: subjectLine ?? '',
    preview: previewText,
  }
}

// Generic measurement of a loaded Playwright page.
async function measureFromPage(page, isEmail) {
  // 1) Line length per content paragraph
  const charMetrics = await page.evaluate(() => {
    function* contentEls(root) {
      const blocks = root.querySelectorAll('p,li')
      for (const el of blocks) yield el
    }
    const ctx = document.createElement('canvas').getContext('2d')
    const lines = []
    for (const el of contentEls(document.body)) {
      const cs = getComputedStyle(el)
      const text = (el.textContent || '').trim()
      if (text.length < 20) continue
      const w = el.clientWidth
      if (w === 0) continue
      ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
      const avgChar = ctx.measureText('aiouenrtlsd ').width / 12 || 8
      const charsPerLine = w / avgChar
      lines.push(charsPerLine)
    }
    const within = lines.filter((c) => c >= 45 && c <= 75).length
    const avg = lines.length ? lines.reduce((a, b) => a + b, 0) / lines.length : 0
    return { avg, withinIdealRatio: lines.length ? within / lines.length : 0, sampled: lines.length }
  })

  // 2) Font size + line-height
  const typo = await page.evaluate(() => {
    const blocks = document.querySelectorAll('p,li')
    const sizes = []
    const heights = []
    blocks.forEach((el) => {
      const cs = getComputedStyle(el)
      const text = (el.textContent || '').trim()
      if (text.length < 10) return
      const fs = parseFloat(cs.fontSize)
      const lh = parseFloat(cs.lineHeight)
      if (!isNaN(fs)) sizes.push(fs)
      if (!isNaN(lh) && fs > 0) heights.push(lh / fs)
    })
    sizes.sort((a, b) => a - b)
    heights.sort((a, b) => a - b)
    const med = (a) => (a.length ? a[Math.floor(a.length / 2)] : 0)
    const medianPx = med(sizes)
    const medianRatio = med(heights)
    return {
      medianPx,
      bodyAtOrAboveMinRatio:
        sizes.length === 0
          ? 0
          : sizes.filter((s) => s >= 14).length / sizes.length,
      medianRatio,
      atOrAboveRatio:
        heights.length === 0
          ? 0
          : heights.filter((r) => r >= 1.5).length / heights.length,
      sampled: sizes.length,
    }
  })

  // 3) Paragraph word counts
  const paraStats = await page.evaluate(() => {
    const ps = document.querySelectorAll('p')
    const counts = []
    ps.forEach((p) => {
      const t = (p.textContent || '').trim()
      if (t.length < 20) return
      counts.push(t.split(/\s+/).length)
    })
    const sum = counts.reduce((a, b) => a + b, 0)
    return {
      avg: counts.length ? sum / counts.length : 0,
      oversized: counts.filter((c) => c > 120).length,
      oversizedRatio: counts.length
        ? counts.filter((c) => c > 120).length / counts.length
        : 0,
      total: counts.length,
    }
  })

  // 4) Heading hierarchy
  const headings = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
    const levels = all.map((h) => parseInt(h.tagName[1]))
    let skips = 0
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] - levels[i - 1] > 1) skips++
    }
    return {
      h1Count: levels.filter((l) => l === 1).length,
      skips,
      totalHeadings: levels.length,
    }
  })

  // 5) Active voice ratio (heuristic — sentences without "by-NP" or `was/were/been + VBN`)
  const voice = await page.evaluate(() => {
    const text = Array.from(document.querySelectorAll('p,li'))
      .map((el) => el.textContent || '')
      .join(' ')
    const sentences = text
      .split(/[.!?]+\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 12)
    if (!sentences.length) return { activeRatio: 0, sampled: 0 }
    // Crude passive detection: "is/are/was/were/been/being" + verb ending in "ed" or "en"
    const passiveRe =
      /\b(is|are|was|were|been|being|be)\s+(?:\w+\s+){0,2}\w+(?:ed|en)\b/i
    const passive = sentences.filter((s) => passiveRe.test(s)).length
    return {
      activeRatio: 1 - passive / sentences.length,
      sampled: sentences.length,
    }
  })

  // 6) Color contrast — sample body text + small buttons
  const contrast = await page.evaluate(() => {
    function parse(str) {
      const m = /rgba?\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)(?:[ ,/]+([\d.]+))?\s*\)/.exec(
        str,
      )
      if (!m) return null
      const a = m[4] === undefined ? 1 : parseFloat(m[4])
      if (a < 0.99) return null
      return { r: +m[1], g: +m[2], b: +m[3] }
    }
    function lin(c) {
      const cs = c / 255
      return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4)
    }
    function lum({ r, g, b }) {
      return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
    }
    function bg(el) {
      let cur = el
      while (cur && cur !== document.body) {
        const c = getComputedStyle(cur).backgroundColor
        const p = parse(c)
        if (p) return p
        cur = cur.parentElement
      }
      const bb = parse(getComputedStyle(document.body).backgroundColor)
      return bb ?? { r: 255, g: 255, b: 255 }
    }
    const els = Array.from(document.querySelectorAll('p,li,h1,h2,h3,h4,a,button,span'))
    let failBody = 0
    let failLarge = 0
    let total = 0
    for (const el of els) {
      const text = (el.textContent || '').trim()
      if (text.length < 6) continue
      const cs = getComputedStyle(el)
      const fg = parse(cs.color)
      if (!fg) continue
      const bgc = bg(el)
      const ratio =
        (Math.max(lum(fg), lum(bgc)) + 0.05) /
        (Math.min(lum(fg), lum(bgc)) + 0.05)
      const fs = parseFloat(cs.fontSize)
      const isLarge = fs >= 18 || (fs >= 14 && cs.fontWeight >= 700)
      total++
      if (isLarge) {
        if (ratio < 3.0) failLarge++
      } else {
        if (ratio < 4.5) failBody++
      }
    }
    return { failBody, failLarge, total }
  })

  // 7) Palette discipline
  const palette = await page.evaluate(() => {
    const hues = new Set()
    function parse(str) {
      const m = /rgba?\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)/.exec(str)
      if (!m) return null
      return [+m[1], +m[2], +m[3]]
    }
    // Quantise to nearest 32 — anything closer than 32 in each channel collapses.
    const q = (n) => Math.round(n / 32) * 32
    document.querySelectorAll('*').forEach((el) => {
      const cs = getComputedStyle(el)
      const fg = parse(cs.color)
      const bg = parse(cs.backgroundColor)
      const bc = parse(cs.borderColor)
      ;[fg, bg, bc].forEach((c) => {
        if (!c) return
        // skip pure black/white/transparent neutrals from count? No — count them
        const key = `${q(c[0])},${q(c[1])},${q(c[2])}`
        hues.add(key)
      })
    })
    return { distinctHues: hues.size }
  })

  // 8) Whitespace ratio — sample text *glyph* coverage using DOM Range bounding rects.
  //    Ranges around live text nodes give us the actual ink bounds (line by line),
  //    not the container bounding boxes which over-count empty inter-line whitespace.
  const whitespace = await page.evaluate(() => {
    const w = document.documentElement.clientWidth
    const h = document.documentElement.scrollHeight
    const stride = 8
    const lefMargin = w * 0.05
    const rightEdge = w * 0.95
    const samples = []
    for (let y = 0; y < h; y += stride) {
      for (let x = lefMargin; x < rightEdge; x += stride) {
        samples.push({ x, y })
      }
    }
    // Collect ranges from all visible text nodes — these are the per-line ink rectangles.
    const ranges = []
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    let node
    while ((node = walker.nextNode())) {
      const text = (node.nodeValue || '').replace(/\s+/g, '')
      if (text.length < 2) continue
      const r = document.createRange()
      r.selectNodeContents(node)
      const rects = r.getClientRects()
      for (const rect of rects) {
        if (rect.width === 0 || rect.height === 0) continue
        ranges.push({
          l: rect.left + window.scrollX,
          t: rect.top + window.scrollY,
          r: rect.right + window.scrollX,
          b: rect.bottom + window.scrollY,
        })
      }
    }
    let ink = 0
    for (const s of samples) {
      for (const rec of ranges) {
        if (s.x >= rec.l && s.x <= rec.r && s.y >= rec.t && s.y <= rec.b) {
          ink++
          break
        }
      }
    }
    const backgroundRatio = samples.length ? 1 - ink / samples.length : 0
    return { backgroundRatio, sampled: samples.length, inkSamples: ink, ranges: ranges.length }
  })

  // 9) Layout consistency — measure gap between top-level numbered sections (if any)
  const layout = await page.evaluate(() => {
    // Heuristic: numbered sections labelled with two-digit prefix "01", "02"...
    const all = Array.from(
      document.querySelectorAll('section, .section, [class*=section]'),
    )
    // Pick the children that contain a leading "01"/"02" label
    const numbered = all.filter((s) => /\b0[0-9]\b/.test(s.textContent || ''))
    if (numbered.length < 3) {
      return { withinTolerance: 1, sampled: numbered.length, gaps: [] }
    }
    const tops = numbered.map((el) => el.getBoundingClientRect().top + window.scrollY)
    tops.sort((a, b) => a - b)
    const gaps = []
    for (let i = 1; i < tops.length; i++) gaps.push(tops[i] - tops[i - 1])
    gaps.sort((a, b) => a - b)
    const median = gaps[Math.floor(gaps.length / 2)] || 1
    const within = gaps.filter((g) => Math.abs(g - median) / median <= 0.1).length
    return { withinTolerance: gaps.length ? within / gaps.length : 1, gaps, median }
  })

  // 10) Brand voice — collect plain body text once
  const voiceText = await page.evaluate(() => document.body.innerText || '')

  // Count FOMO hits, after first removing any "no X" denial frames so that
  // copy like "no hype, no FOMO" is not penalised.
  const fomoCheckText = voiceText.replace(NEGATION_RE, ' ')
  const fomoHits = FOMO_PATTERNS.reduce(
    (acc, re) => acc + (re.test(fomoCheckText) ? 1 : 0),
    0,
  )

  // Emoji discipline: count emojis in body text and check against approved set.
  const emojiMatches = voiceText.match(EMOJI_RE) || []
  let unapprovedEmoji = 0
  for (const e of emojiMatches) {
    if (!APPROVED_EMOJIS.has(e)) unapprovedEmoji++
  }
  // Special-case approved arrows that show up as unicode 0x2192:
  // already in APPROVED_EMOJIS.

  // Exclamations in body — strip TLDR labels (the "In this issue" eyebrow uses ! sometimes).
  // We count "!" in paragraph/li content only, NOT headings.
  const bodyExclamations = await page.evaluate(() => {
    let count = 0
    document.querySelectorAll('p,li').forEach((el) => {
      count += ((el.textContent || '').match(/!/g) || []).length
    })
    return count
  })

  // Wordmark check + accent dot
  const wordmarkFound = WORDMARK_RE.test(voiceText)
  const accentDot = await page.evaluate(() => {
    // Look for any "AI, Basically." instance and inspect the trailing dot's colour.
    const spans = Array.from(document.querySelectorAll('span,b,strong,h1,h2,h3,a,div,p'))
    for (const el of spans) {
      if (!/AI,\s*Basically/.test(el.textContent || '')) continue
      // Find a child span containing only "."
      const dots = el.querySelectorAll('span')
      for (const d of dots) {
        if ((d.textContent || '').trim() === '.') {
          const c = getComputedStyle(d).color
          return { color: c, found: true }
        }
      }
    }
    return { color: '', found: false }
  })

  // Accent dot is "found" iff its computed color matches the accent token.
  // The accent token #9C4A2E = rgb(156, 74, 46)
  const accentDotMatches =
    accentDot.found && /rgb\(\s*156,\s*74,\s*46/.test(accentDot.color)

  return {
    isEmail,
    typography: {
      lineLength: charMetrics,
      fontSize: typo,
      lineHeight: {
        medianRatio: typo.medianRatio,
        atOrAboveRatio: typo.atOrAboveRatio,
        sampled: typo.sampled,
      },
      paragraphWords: paraStats,
      headings,
      activeVoice: voice,
    },
    design: {
      contrast,
      palette,
      whitespace,
      layout,
    },
    voice: {
      fomo: { hits: fomoHits },
      emoji: { totalCount: emojiMatches.length, unapproved: unapprovedEmoji },
      exclamation: { bodyExclamations },
      wordmark: { found: wordmarkFound },
      accentDot: { found: accentDotMatches, computedColor: accentDot.color },
    },
  }
}

// ─── Build the per-target report ────────────────────────────────────────────

function buildReport(targetLabel, measurements) {
  const isEmail = measurements.isEmail
  const t = measurements.typography
  const d = measurements.design
  const v = measurements.voice
  const e = measurements.emailRaw

  const criteria = []
  function add(id, axis, label, weight, score, raw) {
    criteria.push({ id, axis, label, weight, score, raw })
  }

  // Readability
  add('line_length', AXES.READABILITY, 'Line length (45–75 ch)', 2, scoreLineLength(t.lineLength), t.lineLength)
  add('font_size', AXES.READABILITY, `Body font size (≥${isEmail ? 14 : 15}px)`, 2, scoreFontSize(t.fontSize, isEmail), t.fontSize)
  add('line_height', AXES.READABILITY, 'Body line-height (≥1.5)', 2, scoreLineHeight(t.lineHeight), t.lineHeight)
  add('paragraph_words', AXES.READABILITY, 'Avg paragraph words (40–80)', 1, scoreParagraphWords(t.paragraphWords), t.paragraphWords)
  add('headings', AXES.READABILITY, 'Heading hierarchy', 2, scoreHeadingHierarchy(t.headings), t.headings)
  add('active_voice', AXES.READABILITY, 'Active voice ≥60%', 1, scoreActiveVoice(t.activeVoice), t.activeVoice)

  // Design
  add('contrast', AXES.DESIGN, 'WCAG 2.1 contrast', 3, scoreContrast(d.contrast), d.contrast)
  add('palette', AXES.DESIGN, 'Palette ≤6 hues', 1, scorePalette(d.palette), d.palette)
  add('whitespace', AXES.DESIGN, 'Whitespace 60–80%', 1, scoreWhitespace(d.whitespace), d.whitespace)
  add('tap_targets', AXES.DESIGN, 'Tap targets ≥44px @390', 2, scoreTapTargets(measurements.tapTargets), measurements.tapTargets)
  add('overflow', AXES.DESIGN, 'No horizontal overflow', 3, scoreOverflow(measurements.overflow), measurements.overflow)
  add('layout', AXES.DESIGN, 'Numbered section gap consistency', 1, scoreLayoutConsistency(d.layout), d.layout)

  // Voice
  add('no_fomo', AXES.VOICE, 'No FOMO triggers', 3, scoreNoFOMO(v.fomo), v.fomo)
  add('emoji', AXES.VOICE, 'Approved emoji only', 1, scoreEmojiDiscipline(v.emoji), v.emoji)
  add('exclamation', AXES.VOICE, 'No exclamation in body', 1, scoreExclamation(v.exclamation), v.exclamation)
  add('wordmark', AXES.VOICE, 'Wordmark renders', 1, scoreWordmark(v.wordmark), v.wordmark)
  add('accent_dot', AXES.VOICE, '.dot uses accent', 1, scoreAccentDot(v.accentDot), v.accentDot)

  // Email-only
  if (isEmail) {
    add('no_script', AXES.EMAIL, 'No <script>', 3, scoreNoScript(e), e)
    add('no_external_img', AXES.EMAIL, 'No external <img>', 2, scoreNoExternalImg(e), e)
    add('no_css_vars', AXES.EMAIL, 'No CSS vars / class names', 1, scoreNoCssVars(e), e)
    add('container_600', AXES.EMAIL, 'Container max-width 600', 2, scoreContainerWidth(e), e)
    add('inline_only', AXES.EMAIL, 'Inline styles only', 2, scoreInlineOnly(e), e)
    add('subject', AXES.EMAIL, 'Subject ≤50 chars', 1, scoreSubject({ len: e.subject.length }), { ...e, len: e.subject.length })
    add('preview', AXES.EMAIL, 'Preview ≤90 chars', 1, scorePreview({ len: e.preview.length }), { ...e, len: e.preview.length })
  }

  const totalWeight = criteria.reduce((a, c) => a + c.weight, 0)
  const weightedSum = criteria.reduce((a, c) => a + c.score * c.weight, 0)
  const aggregate = totalWeight ? weightedSum / totalWeight : 0

  const verdict =
    aggregate >= 4.0 ? 'SHIP' : aggregate >= 3.0 ? 'NEEDS_POLISH' : 'BLOCK'

  return {
    target: targetLabel,
    surface: isEmail ? 'email' : 'web',
    aggregate: round(aggregate, 2),
    verdict,
    criteria,
    rawMeasurements: measurements,
  }
}

function round(n, d) {
  const m = Math.pow(10, d)
  return Math.round(n * m) / m
}

// ─── Email rendering — compile TSX → JS in-memory, render to HTML ───────────

let emailCache = null
async function loadEmailRenderers() {
  if (emailCache) return emailCache
  const tmpDir = path.join(REPO, '.rubric-tmp')
  await mkdir(tmpDir, { recursive: true })

  // Bundle emails into ESM so we can dynamic-import them.
  const entryIssue = path.join(REPO, 'emails/IssueEmail.tsx')
  const entryWelcome = path.join(REPO, 'emails/WelcomeEmail.tsx')

  await esbuild({
    entryPoints: [entryIssue, entryWelcome],
    outdir: tmpDir,
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node18',
    jsx: 'automatic',
    loader: { '.tsx': 'tsx', '.ts': 'ts' },
    external: ['react', 'react-dom', 'react-dom/server', '@react-email/render', '@react-email/components'],
    logLevel: 'silent',
  })

  const IssueMod = await import(pathToFileURL(path.join(tmpDir, 'IssueEmail.js')).href)
  const WelcomeMod = await import(pathToFileURL(path.join(tmpDir, 'WelcomeEmail.js')).href)
  const { render } = await import('@react-email/render')

  emailCache = {
    IssueEmail: IssueMod.default,
    WelcomeEmail: WelcomeMod.default,
    render,
    tmpDir,
  }
  return emailCache
}

async function renderIssueEmail(issueSlug) {
  const { IssueEmail, render } = await loadEmailRenderers()
  const React = await import('react')
  const contentPath = path.join(REPO, `content/issues/${issueSlug}.json`)
  const content = JSON.parse(await readFile(contentPath, 'utf-8'))
  const html = await render(React.createElement(IssueEmail, { content }))
  // Derive a deterministic subject line:
  // Strip HTML from hero_headline_html, collapse to one line.
  const subject = stripTagsPlain(content.hero_headline_html)
  return { html, subject }
}

async function renderWelcomeEmail() {
  const { WelcomeEmail, render } = await loadEmailRenderers()
  const React = await import('react')
  const html = await render(React.createElement(WelcomeEmail, {}))
  const subject = "You're in — AI, Basically."
  return { html, subject }
}

function stripTagsPlain(html) {
  return (html || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z#0-9]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// ─── Driver ─────────────────────────────────────────────────────────────────

function slugForTarget(target) {
  return target.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '').slice(0, 80)
}

function printSummary(report) {
  const groups = {}
  for (const c of report.criteria) {
    groups[c.axis] = groups[c.axis] || []
    groups[c.axis].push(c)
  }
  console.log('')
  console.log(`── ${report.target} (${report.surface}) ──`)
  for (const axis of Object.keys(groups)) {
    const sub = groups[axis]
    const subSum = sub.reduce((a, c) => a + c.score * c.weight, 0)
    const subW = sub.reduce((a, c) => a + c.weight, 0)
    const subAvg = round(subSum / subW, 2)
    console.log(`  [${axis}] subtotal ${subAvg}`)
    for (const c of sub) {
      const tick = c.score >= 4 ? '✓' : c.score >= 3 ? '·' : '!'
      console.log(`    ${tick} ${c.score} (w${c.weight})  ${c.label}`)
    }
  }
  console.log(`  AGGREGATE ${report.aggregate}  → ${report.verdict}`)
}

async function runTarget(target) {
  let measurements
  let label = target
  if (target.startsWith('email:')) {
    const slug = target.slice('email:'.length)
    if (slug === 'welcome') {
      const { html, subject } = await renderWelcomeEmail()
      measurements = await measureEmail(html, subject)
      label = 'email:welcome'
    } else {
      const { html, subject } = await renderIssueEmail(slug)
      measurements = await measureEmail(html, subject)
      label = `email:${slug}`
    }
  } else {
    measurements = await measureWeb(target)
  }
  const report = buildReport(label, measurements)
  const outPath = `/tmp/rubric-${slugForTarget(label)}.json`
  await writeFile(outPath, JSON.stringify(report, null, 2))
  printSummary(report)
  console.log(`  → ${outPath}`)
  return report
}

async function main() {
  const target = process.argv[2]
  if (!target) {
    console.error('Usage: node scripts/rubric.mjs <url|email:001|email:welcome|all>')
    process.exit(2)
  }
  let reports = []
  if (target === 'all') {
    const targets = [
      'https://ai-signal-eta.vercel.app/',
      'https://ai-signal-eta.vercel.app/i/001',
      'email:001',
      'email:002',
      'email:003',
      'email:welcome',
    ]
    for (const t of targets) {
      try {
        reports.push(await runTarget(t))
      } catch (err) {
        console.error(`FAIL ${t}: ${err.message}`)
      }
    }
  } else {
    reports.push(await runTarget(target))
  }

  // Cleanup tmp dir
  try {
    const tmpDir = path.join(REPO, '.rubric-tmp')
    if (existsSync(tmpDir)) await rm(tmpDir, { recursive: true, force: true })
  } catch {}

  // Overall verdict — worst-case
  const worst = reports.reduce(
    (acc, r) => Math.min(acc, r.aggregate),
    Number.POSITIVE_INFINITY,
  )
  console.log('')
  console.log(`Worst aggregate across ${reports.length} target(s): ${round(worst, 2)}`)
  if (worst >= 4.0) process.exit(0)
  if (worst >= 3.0) process.exit(1)
  process.exit(2)
}

main().catch((err) => {
  console.error(err)
  process.exit(2)
})
