import type { IndiaSignal as IndiaSignalType } from '@/lib/content-model'

// Defensive strip: older content (and the seeded DB rows) wrote "Why you care"
// inside the value, so the template's prefix produced a duplicate
// (`↳ Why you care: ↳ Why you care: …`). Strip any leading variant here so the
// JSX template is the single source of the prefix.
function stripWhyCare(s: string): string {
  return s
    .replace(/^\s*[↳⤷→]?\s*Why you care\s*[:\-—]\s*/i, '')
    .trim()
}

export default function IndiaSignal({
  cards,
  foot,
  foot_cta,
  foot_cta_url,
}: IndiaSignalType) {
  return (
    <>
      <div className="signal2">
        {cards.map((c, i) => (
          <div key={i} className="sig">
            <div className="sig-top">
              <span className="sig-cat">{c.cat}</span>
              <span className={`sig-tag${c.status_hot ? ' hot' : ''}`}>{c.status}</span>
            </div>
            <h4>{c.source_url ? <a href={c.source_url} target="_blank" rel="noopener noreferrer">{c.h4}</a> : c.h4}</h4>
            <p>{c.body}</p>
            <div className="sig-you">↳ Why you care: {stripWhyCare(c.why_you)}</div>
          </div>
        ))}
      </div>
      <div className="signal-foot">
        {foot} <a href={foot_cta_url}>{foot_cta} →</a>
      </div>
    </>
  )
}
