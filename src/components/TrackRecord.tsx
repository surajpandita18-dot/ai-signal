const CALLS = [
  {
    signal: 4,
    label: 'Funding round',
    called: 'Anthropic nears $900B+ valuation within two weeks.',
    outcome: 'Closed in 10 days',
    detail: 'Confirmed by TechCrunch & Bloomberg',
  },
  {
    signal: 21,
    label: 'Infrastructure deal',
    called: 'Anthropic rents xAI GPUs, lifts Claude limits for all.',
    outcome: '$1.25B/month · limits +1,500%',
    detail: 'Announced May 6, 2026',
  },
  {
    signal: 32,
    label: 'Valuation milestone',
    called: 'OpenRouter doubles to $1.3B — routing is infrastructure.',
    outcome: 'Exactly $1.3B Series B',
    detail: '$113M raised, announced that week',
  },
]

export function TrackRecord() {
  return (
    <div className="track-record">
      <div className="track-record-header">
        <span className="track-record-eyebrow">
          <span className="track-record-pip" aria-hidden="true" />
          Called before anyone else
        </span>
        <span className="track-record-sub">Three signals. Three accurate calls.</span>
      </div>
      <div className="track-record-cards">
        {CALLS.map(({ signal, label, called, outcome, detail }) => (
          <a key={signal} href={`/signal/${signal}`} className="track-record-card">
            <div className="track-record-card-top">
              <span className="track-record-sig">#{signal}</span>
              <span className="track-record-label">{label}</span>
            </div>
            <p className="track-record-called">{called}</p>
            <div className="track-record-card-foot">
              <span className="track-record-check">✓</span>
              <div>
                <div className="track-record-outcome">{outcome}</div>
                <div className="track-record-detail">{detail}</div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
