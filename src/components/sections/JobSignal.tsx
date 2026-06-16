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

// Reduce a step's body to its first clause for the teaser card. Splits on
// the first ":" (most steps lead with a label like "Bound the loop. Cap…").
// Falls back to first sentence (.) — never cuts at a comma any more because
// step bodies often have natural commas mid-clause that mangle the meaning
// ("split tools into reversible,..." reads worse than the full first sentence).
// Cap at 80 chars with word-boundary truncation.
function firstClause(html: string): string {
  const text = stripHtml(html)
  const colon = text.indexOf(':')
  const period = text.indexOf('. ')
  let cut = -1
  if (colon !== -1 && (period === -1 || colon < period)) cut = colon
  else if (period !== -1) cut = period
  const clause = cut === -1 ? text : text.slice(0, cut)
  const trimmed = clause.trim()
  if (trimmed.length <= 80) return trimmed
  const wb = trimmed.lastIndexOf(' ', 77)
  return (wb === -1 ? trimmed.slice(0, 77) : trimmed.slice(0, wb)).trimEnd() + '…'
}

/**
 * Teaser for the interview question on the issue page. The full question
 * (60-80 words for debug-shaped scenarios) lives at /interviews/<slug>;
 * cramming it inline reads as a wall. Show JUST the first sentence — that's
 * the scenario setup. The question verb ("walk me through how you'd debug")
 * lives at the destination. Sentence-boundary cut avoids the "CX flags…"
 * mid-sentence chop that the previous 130-char hard-cap caused.
 */
function teaseQuestion(q: string): string {
  const text = q.trim().replace(/^["']|["']$/g, '')
  const period = text.indexOf('. ')
  if (period !== -1 && period < 220) return text.slice(0, period + 1) + ' …'
  if (text.length <= 180) return text
  const wb = text.lastIndexOf(' ', 177)
  return (wb === -1 ? text.slice(0, 177) : text.slice(0, wb)).trimEnd() + '…'
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
