const CALLS = [
  {
    signal: 4,
    label: 'Funding round',
    date: 'Apr 30',
    called: 'Anthropic nears $900B+ valuation — round closes within two weeks.',
    outcome: 'Closed in 10 days',
    verify: 'TechCrunch & Bloomberg',
  },
  {
    signal: 21,
    label: 'Infrastructure deal',
    date: 'May 7',
    called: 'Anthropic rents xAI GPUs — Claude limits about to jump for everyone.',
    outcome: '$1.25B/month · limits +1,500%',
    verify: 'Announced May 6, confirmed next day',
  },
  {
    signal: 32,
    label: 'Valuation milestone',
    date: 'May 26',
    called: 'OpenRouter doubles to $1.3B — model routing is becoming infrastructure.',
    outcome: 'Exactly $1.3B Series B · $113M raised',
    verify: 'Announced that same week',
  },
]

export function TrackRecord() {
  return (
    <div className="track-record">
      <div className="track-record-header">
        <div>
          <span className="track-record-eyebrow">
            <span className="track-record-pip" aria-hidden="true" />
            Verified track record
          </span>
          <p className="track-record-intro">
            We filed these signals before the story broke in mainstream tech press. Here&apos;s what we wrote — and what happened.
          </p>
        </div>
      </div>
      <div className="track-record-cards">
        {CALLS.map(({ signal, label, date, called, outcome, verify }) => (
          <a key={signal} href={`/signal/${signal}`} className="track-record-card">
            <div className="track-record-card-top">
              <span className="track-record-sig">#{signal}</span>
              <span className="track-record-label">{label}</span>
              <span className="track-record-date">{date}</span>
            </div>

            <div className="track-record-our-call">
              <span className="track-record-call-eyebrow">What we wrote</span>
              <p className="track-record-called">{called}</p>
            </div>

            <div className="track-record-card-foot">
              <span className="track-record-check" aria-hidden="true">✓</span>
              <div>
                <div className="track-record-outcome">{outcome}</div>
                <div className="track-record-detail">{verify}</div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
