import type { IndiaSignal as IndiaSignalType } from '@/lib/content-model'

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
            <h4>{c.h4}</h4>
            <p>{c.body}</p>
            <div className="sig-you">↳ Why you care: {c.why_you}</div>
          </div>
        ))}
      </div>
      <div className="signal-foot">
        {foot} <a href={foot_cta_url}>{foot_cta} →</a>
      </div>
    </>
  )
}
