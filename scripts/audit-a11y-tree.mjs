import { chromium } from 'playwright'

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } })
const page = await ctx.newPage()
await page.goto('https://aibasically-eta.vercel.app/i/001?preview=1', { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)

// Build a screen-reader-like tree of important roles & headings.
const tree = await page.evaluate(() => {
  function walk(el, depth = 0, out = []) {
    if (!el || el.nodeType !== 1) return out
    const tag = el.tagName.toLowerCase()
    const role = el.getAttribute('role')
    const ariaLabel = el.getAttribute('aria-label')
    const ariaExpanded = el.getAttribute('aria-expanded')
    const isLandmark = ['main', 'nav', 'header', 'footer', 'aside', 'section'].includes(tag) || ['banner', 'main', 'navigation', 'contentinfo', 'complementary', 'region'].includes(role)
    const isHeading = /^h[1-6]$/.test(tag)
    const isInteractive = tag === 'button' || tag === 'a' || tag === 'input' || tag === 'select' || tag === 'textarea'
    const hidden = el.getAttribute('aria-hidden') === 'true'
    if (hidden) return out
    if (isLandmark || isHeading || isInteractive) {
      const text = (el.textContent || el.placeholder || ariaLabel || '').trim().slice(0, 60).replace(/\s+/g, ' ')
      out.push({ depth, tag, role, ariaLabel, ariaExpanded, text })
    }
    for (const c of el.children) walk(c, depth + 1, out)
    return out
  }
  return walk(document.body)
})

console.log('SCREEN-READER-LIKE TREE (issue 001):\n')
for (const node of tree) {
  const indent = '  '.repeat(Math.min(node.depth, 8))
  const meta = []
  if (node.role) meta.push(`role=${node.role}`)
  if (node.ariaLabel) meta.push(`aria-label="${node.ariaLabel.slice(0, 30)}"`)
  if (node.ariaExpanded != null) meta.push(`aria-expanded=${node.ariaExpanded}`)
  const text = node.text ? `: "${node.text}"` : ''
  console.log(`${indent}<${node.tag}>${text}${meta.length ? ' [' + meta.join(' ') + ']' : ''}`)
}

await ctx.close()
await browser.close()
