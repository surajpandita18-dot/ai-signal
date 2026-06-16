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
// Convention across issues 001-004: each step body opens with the
// framework verb-phrase as a label sentence ("Bound the loop." /
// "Split the surface."), followed by the actual teaching clause. The
// framework name is already shown above the numbered steps, so echoing
// the label again is zero info. Some issues wrap the label in <b>, some
// wrap the detail in <b> — don't trust the bold tag. Just strip ALL HTML
// then drop the leading label sentence.
function firstClause(html: string): string {
  const text = stripHtml(html).trim()
  let working = text
  const labelEnd = text.indexOf('. ')
  if (labelEnd !== -1 && labelEnd < 50) working = text.slice(labelEnd + 2)
  if (working.length <= 90) return working
  const wb = working.lastIndexOf(' ', 87)
  return (wb === -1 ? working.slice(0, 87) : working.slice(0, wb)).trimEnd() + '…'
}

/**
 * Show the hand-curated 1-2 sentence `teaser_q` on the issue-page teaser
 * (and library card via parallel logic). Falls back to the full `q` when
 * `teaser_q` is absent — so legacy content still renders. The FULL `q`
 * lives on /interviews/<slug> where the brief earns the space.
 */
function teaseQuestion(interview: { q: string; teaser_q?: string }): string {
  const source = interview.teaser_q?.trim() || interview.q
  return source.trim().replace(/^["']|["']$/g, '')
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
          <div className="q">{teaseQuestion(interview)}</div>
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
