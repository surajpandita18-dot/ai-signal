const CALLS = [
  {
    signal: 4,
    called: 'Anthropic nears $900B+ valuation round within two weeks.',
    outcome: 'Closed within 10 days. Confirmed by TechCrunch and Bloomberg.',
  },
  {
    signal: 21,
    called: 'Anthropic rents xAI GPUs, lifts Claude usage limits for all users.',
    outcome: '$1.25B/month deal. Claude Code limits up 1,500%+. Announced May 6.',
  },
  {
    signal: 32,
    called: 'OpenRouter doubles valuation to $1.3B — model routing is now infrastructure.',
    outcome: '$113M Series B at exactly $1.3B. Announced within the week.',
  },
]

export function TrackRecord() {
  return (
    <div className="track-record">
      <div className="track-record-eyebrow">
        <span className="track-record-pip" />
        Called before anyone else
      </div>
      <div className="track-record-list">
        {CALLS.map(({ signal, called, outcome }) => (
          <a
            key={signal}
            href={`/signal/${signal}`}
            className="track-record-item"
          >
            <span className="track-record-num">#{signal}</span>
            <div className="track-record-body">
              <div className="track-record-called">{called}</div>
              <div className="track-record-outcome">
                <span className="track-record-check">✓</span>
                {outcome}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
