import Link from 'next/link'
import type { JobSignal as JobSignalType } from '@/lib/content-model'

// Strip HTML tags and decode the small handful of entities that show up
// in our content_html strings. Good enough for "innerText"-style copy.
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/ /g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim()
}

// Reduce a step's body to its load-bearing clause for the teaser card.
//
// Step body convention (verified across issues 001-004): each step opens
// with the framework verb-phrase as a label sentence ("Bound the loop."),
// followed by a <b>...</b> clause carrying the actual detail, then optional
// commentary. The teaser already shows the framework name above; we need
// the BOLD clause, not the label-sentence echo. Without this, the 5 numbered
// steps end up identical to the framework name above them — zero new info.
//
// Strategy: extract the first <b>...</b> content. Fall back to first
// sentence if no bold tag. Cap at 90 chars with word-boundary truncation.
function firstClause(html: string): string {
  const boldMatch = /<b\b[^>]*>([\s\S]*?)<\/b>/i.exec(html)
  const source = boldMatch ? boldMatch[1] : html
  const text = stripHtml(source).trim()
  // If we used the full body (no bold tag found), still strip the label
  // sentence prefix — e.g., "Bound the loop. Cap tool calls…" → "Cap tool…"
  let working = text
  if (!boldMatch) {
    const labelEnd = text.indexOf('. ')
    if (labelEnd !== -1 && labelEnd < 40) working = text.slice(labelEnd + 2)
  }
  if (working.length <= 90) return working
  const wb = working.lastIndexOf(' ', 87)
  return (wb === -1 ? working.slice(0, 87) : working.slice(0, wb)).trimEnd() + '…'
}

/**
 * Teaser for the interview question on the issue page. The full question
 * (60-80 words for debug-shaped scenarios) lives at /interviews/<slug>.
 *
 * Strategy: show ~2-3 sentences of the scenario setup (target ~280 chars),
 * cut at the LAST sentence boundary that fits. The question verb itself
 * ("walk me through how you'd debug") lives at the destination — reader
 * sees enough to know the scenario type, clicks the CTA for the full ask.
 *
 * Earlier attempts that this fixes:
 *  - hard 130-char cap → cut mid-sentence ("CX flags…")
 *  - cut at FIRST period → first sentence is often a short scene-setter
 *    ("You're an AI PM at an Indian lender.") leaving the reader with no
 *    real context. Suraj flagged this as "abhi bhi cut ho raha hai".
 */
function teaseQuestion(q: string): string {
  const text = q.trim().replace(/^["']|["']$/g, '')
  const MAX = 280
  if (text.length <= MAX) return text
  const slice = text.slice(0, MAX)
  const lastPeriod = slice.lastIndexOf('. ')
  // Require ≥100 chars of useful setup so we don't fall back to a tiny
  // first-sentence cut. If the last sentence boundary in the slice is
  // earlier than that, prefer the word-boundary cut at MAX.
  if (lastPeriod >= 100) return text.slice(0, lastPeriod + 1) + ' …'
  const wb = slice.lastIndexOf(' ')
  return (wb === -1 ? slice : slice.slice(0, wb)).trimEnd() + '…'
}

type JobSignalProps = JobSignalType & { issueSlug: string }

export default function JobSignal({
  rows,
  spotlight,
  upskill,
  interview,
  issueSlug,
}: JobSignalProps) {
  // `framework_name` is an optional field on the in-flight extended Interview
  // type (rolling out alongside /interviews/[slug]). Read defensively so this
  // component compiles against both the current base type and the extended one.
  const frameworkName = (interview as { framework_name?: string }).framework_name

  return (
    <div className="jobs">
      {rows.map((row, i) => (
        <div key={i} className="jobrow">
          <div className="what" dangerouslySetInnerHTML={{ __html: row.what_html }} />
          <div className={`trend ${row.trend}`}>
            <span aria-hidden="true">
              {row.trend === 'up' ? '↑ ' : '+ '}
            </span>
            {row.trend === 'up' ? 'Hiring' : 'Hot skill'}
          </div>
        </div>
      ))}

      <div className="spotlight">
        <div className="sp-h">{spotlight.header}</div>
        <div className="sp-b">
          <div className="stat">
            {spotlight.stat}
            <small>{spotlight.stat_sub}</small>
          </div>
          <div className="src">{spotlight.source}</div>
          <div className="sodo" dangerouslySetInnerHTML={{ __html: spotlight.sodo_html }} />
        </div>
      </div>

      <div className="upskill">
        <div className="h">{upskill.title}</div>
        <p dangerouslySetInnerHTML={{ __html: upskill.intro_html }} />
        <div className="ladder">
          {upskill.rungs.map((rung, i) => (
            <div key={i} className="rung">
              <span className="rl">{rung.label}</span>
              <p dangerouslySetInnerHTML={{ __html: rung.body_html }} />
            </div>
          ))}
        </div>
        <p className="ladder-note" dangerouslySetInnerHTML={{ __html: upskill.note_html }} />
      </div>

      <div className="interview">
        <div className="iv-q">
          <div className="lab">Interview Q · {interview.q_label}</div>
          <div className="q">{teaseQuestion(interview.q)}</div>
        </div>
        <div className="iv-a">
          {/* Single framework label — was rendered twice before (oxblood
              "FRAMEWORK · {name}" eyebrow AND a grey "THE FRAMEWORK IN 4
              STEPS" header). Combined into one line: grey eyebrow with the
              actual step count from data (was hardcoded to "4"), and the
              named framework on its own line when present. */}
          <div
            style={{
              fontFamily: "'Archivo Narrow', sans-serif",
              fontWeight: 600,
              fontSize: 12,
              letterSpacing: '.06em',
              textTransform: 'uppercase',
              color: 'var(--grey)',
              marginBottom: frameworkName ? 4 : 6,
            }}
          >
            {`The framework in ${interview.steps.length} steps`}
          </div>
          {frameworkName ? (
            <div
              style={{
                fontFamily: "'Newsreader', serif",
                fontStyle: 'italic',
                fontSize: 14,
                lineHeight: 1.4,
                color: 'var(--accent)',
                marginBottom: 10,
              }}
            >
              {frameworkName}
            </div>
          ) : null}
          {interview.steps.map((step) => (
            <div key={step.n} className="step">
              <b>{step.n}.</b>
              <span>{firstClause(step.body_html)}</span>
            </div>
          ))}
          <Link
            href={`/interviews/${issueSlug}`}
            style={{
              display: 'block',
              marginTop: 14,
              padding: '10px 12px',
              borderTop: '1px solid var(--hair)',
              fontFamily: "'Spline Sans Mono', monospace",
              fontSize: 12,
              color: 'var(--accent)',
              textDecoration: 'none',
              lineHeight: 1.5,
            }}
          >
            <span style={{ fontWeight: 600 }}>→ Read the full prep brief</span>
            <span
              style={{
                display: 'block',
                marginTop: 2,
                color: 'var(--grey)',
                fontSize: 11,
                letterSpacing: '.02em',
              }}
            >
              Model answer · counter-questions · traps
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
