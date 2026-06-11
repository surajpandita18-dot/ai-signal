import type { JobSignal as JobSignalType } from '@/lib/content-model'
import CopyOnClick from '@/components/interactive/CopyOnClick'

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

export default function JobSignal({ rows, spotlight, upskill, interview }: JobSignalType) {
  const interviewPlainText = [
    ...interview.steps.map((s) => `${s.n}. ${stripHtml(s.body_html)}`),
    stripHtml(interview.tip_html),
  ]
    .filter(Boolean)
    .join('\n')

  return (
    <div className="jobs">
      {rows.map((row, i) => (
        <div key={i} className="jobrow">
          <div className="what" dangerouslySetInnerHTML={{ __html: row.what_html }} />
          <div className={`trend ${row.trend}`}>
            {row.trend === 'up' ? '↑ Hiring' : '🔥 Skill'}
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
          <div className="lab">{interview.q_label}</div>
          <div className="q">{interview.q}</div>
        </div>
        <CopyOnClick textToCopy={interviewPlainText}>
          <div className="iv-a">
            {interview.steps.map((step) => (
              <div key={step.n} className="step">
                <b>{step.n}.</b>
                <span dangerouslySetInnerHTML={{ __html: step.body_html }} />
              </div>
            ))}
            <div className="tip" dangerouslySetInnerHTML={{ __html: interview.tip_html }} />
          </div>
        </CopyOnClick>
      </div>
    </div>
  )
}
