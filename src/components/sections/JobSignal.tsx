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

// Reduce a step's body to its first clause for the teaser card.
// Splits on ":" (most steps lead with a label) or the first comma; caps at 50.
function firstClause(html: string): string {
  const text = stripHtml(html)
  const colon = text.indexOf(':')
  const comma = text.indexOf(',')
  let cut = -1
  if (colon !== -1) cut = colon
  else if (comma !== -1) cut = comma
  const clause = cut === -1 ? text : text.slice(0, cut)
  const trimmed = clause.trim()
  return trimmed.length > 50 ? trimmed.slice(0, 47).trimEnd() + '…' : trimmed
}

/**
 * Teaser for the interview question on the issue page. The full question
 * (60-80 words for debug-shaped scenarios) lives at /interviews/<slug>;
 * cramming it inline reads as a wall. We show ~120 chars worth — usually
 * the scenario setup — and cut at a word boundary. Reader gets the shape,
 * clicks the CTA below for the full question + brief.
 */
function teaseQuestion(q: string, max = 130): string {
  if (q.length <= max) return q
  const cut = q.lastIndexOf(' ', max)
  return (cut === -1 ? q.slice(0, max) : q.slice(0, cut)).trimEnd() + '…'
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
          {frameworkName ? (
            <div
              style={{
                fontFamily: "'Archivo Narrow', sans-serif",
                fontWeight: 600,
                fontSize: 11,
                letterSpacing: '.12em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
                marginBottom: 8,
              }}
            >
              Framework · {frameworkName}
            </div>
          ) : null}
          <div
            style={{
              fontFamily: "'Archivo Narrow', sans-serif",
              fontWeight: 600,
              fontSize: 12,
              letterSpacing: '.06em',
              textTransform: 'uppercase',
              color: 'var(--grey)',
              marginBottom: 4,
            }}
          >
            The framework in 4 steps
          </div>
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
