#!/usr/bin/env node
/**
 * LLM visual judge for the layout audit screenshots.
 *
 *   node scripts/audit-layouts.mjs           # produces screenshots + JSON
 *   node scripts/audit-layouts-judge.mjs     # this script judges them
 *
 * What it does:
 *   1. Reads /tmp/aib-layout-audit.json (the deterministic checks output).
 *   2. For each screenshot, sends it to Claude via the Anthropic SDK with a
 *      tight prompt asking: is this readable, balanced, well-laid-out for
 *      this viewport? Returns a 1-3 sentence verdict + a 0-5 score.
 *   3. Aggregates per-route and per-viewport scores.
 *   4. Writes a judgment report to /tmp/aib-layout-judge.json + prints a
 *      human-readable summary.
 *
 * Requires ANTHROPIC_API_KEY in env.
 *
 * Cost note: ~30 screenshots × ~$0.01 per vision call = ~$0.30 per audit
 * run. Cheap enough to run before every content push.
 */
import Anthropic from '@anthropic-ai/sdk'
import { readFile, writeFile } from 'node:fs/promises'

const REPORT_IN = '/tmp/aib-layout-audit.json'
const REPORT_OUT = '/tmp/aib-layout-judge.json'

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY not set — cannot run visual judge.')
  console.error('Workaround: export ANTHROPIC_API_KEY=... (use the Vercel project value).')
  process.exit(2)
}

const client = new Anthropic()

const audit = JSON.parse(await readFile(REPORT_IN, 'utf8'))

const RUBRIC = `You're auditing one screenshot from a calm-confidence weekly newsletter ("AI, Basically.").

Brand voice rules (CLAUDE.md):
- Calm confidence. NO FOMO, NO hype, NO LinkedIn cadence.
- Plain language. No "10 tools you must try" energy.
- Cream paper (#F4F1E8) + oxblood accent (#9C4A2E). Restrained typography.

Score this screenshot from 0 to 5 on READABILITY + LAYOUT for the named viewport:
- 5 = nothing to fix; reader can scan + read comfortably
- 4 = minor polish opportunity, ship as-is
- 3 = noticeable defect, fix before next push
- 2 = real defect, blocks the reading experience
- 1 = broken; reader bounces
- 0 = page renders blank / broken

Look specifically for:
- Bloat: any single block (paragraph, heading) that's too tall and dominates the viewport
- Cramped spacing or vertical rhythm breaks
- Long unwrapped lines (or, on narrow viewports, lines that wrap awkwardly)
- Typography hierarchy issues (h1 too big or too small for the content type)
- Crowded sidebars, ribbons, or auxiliary blocks
- Anything that would make a normal reader scroll away

Respond ONLY with a JSON object: {"score": 0-5, "issues": ["short one-line issue", ...], "ship_ok": true|false}
Keep "issues" to 0-3 items. If score >= 4, ship_ok = true.`

const judged = []
for (const entry of audit) {
  if (!entry.screenshot || entry.error) {
    judged.push({ ...entry, judge: null })
    continue
  }
  const buf = await readFile(entry.screenshot)
  const b64 = buf.toString('base64')
  try {
    const resp = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/png', data: b64 },
            },
            {
              type: 'text',
              text:
                `${RUBRIC}\n\nViewport: ${entry.viewport}\nRoute: ${entry.route}\nURL: ${entry.url}\n` +
                (entry.flags?.length
                  ? `Deterministic checks already flagged: ${entry.flags.map((f) => `${f.level} ${f.kind}: ${f.detail}`).join('; ')}\n`
                  : '') +
                '\nReturn ONLY the JSON object, no prose.',
            },
          ],
        },
      ],
    })
    const text = resp.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('')
    let parsed
    try {
      // Strip any code fences and parse
      const match = text.match(/\{[\s\S]*\}/)
      parsed = match ? JSON.parse(match[0]) : null
    } catch {
      parsed = null
    }
    judged.push({ ...entry, judge: parsed ?? { score: null, issues: [], raw: text } })
    const score = parsed?.score
    const tag = score === null || score === undefined ? '?' : score >= 4 ? `✓ ${score}` : score >= 3 ? `⚠ ${score}` : `❌ ${score}`
    const issuesStr = parsed?.issues?.length ? ` — ${parsed.issues[0]}` : ''
    console.log(`[${entry.viewport}] ${entry.route.padEnd(22)} ${tag}${issuesStr}`)
  } catch (e) {
    console.log(`[${entry.viewport}] ${entry.route} judge fail: ${e.message}`)
    judged.push({ ...entry, judge: { error: e.message } })
  }
}

await writeFile(REPORT_OUT, JSON.stringify(judged, null, 2))

const blockers = judged.filter((j) => j.judge?.score != null && j.judge.score < 3)
const warnings = judged.filter((j) => j.judge?.score === 3)
console.log(`---`)
console.log(`Blockers (<3): ${blockers.length}`)
console.log(`Warnings (=3): ${warnings.length}`)
console.log(`Report: ${REPORT_OUT}`)
if (blockers.length) {
  console.log(`---\nBLOCKERS:`)
  for (const b of blockers) {
    console.log(`  ${b.viewport}/${b.route}: ${b.judge.issues?.join(' · ') ?? '(no issues listed)'}`)
  }
}
process.exit(blockers.length > 0 ? 1 : 0)
