'use client'

interface Teaser {
  text: string
}

interface SidebarProbablyCardProps {
  teasers?: Teaser[]
}

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const FALLBACK_TEASERS = [
  "Anthropic's enterprise pricing leak — and what it means for you.",
  "Multi-agent orchestration burns: the bill nobody is talking about.",
  "India's inference cost arbitrage is real. Here's the math.",
]

export function SidebarProbablyCard({ teasers = [] }: SidebarProbablyCardProps) {
  const today = new Date()

  const days = [1, 2, 3].map((offset) => {
    const d = new Date(today)
    d.setDate(today.getDate() + offset)
    return {
      day: DAY_LABELS[d.getDay()] ?? 'TBD',
      date: `${d.getDate()} ${MONTH_LABELS[d.getMonth()] ?? ''}`,
    }
  })

  return (
    <div className="probably-card anim d3">
      <div className="probably-header">
        <span className="probably-eyebrow">Tomorrow, <em>probably</em></span>
        <span className="probably-sub">three drafts on the desk</span>
      </div>
      <div className="probably-stack">
        {([0, 1, 2] as const).map((i) => {
          const teaserText = teasers[i]?.text ?? FALLBACK_TEASERS[i] ?? ''
          const isLead = i === 0
          return (
            <div
              key={i}
              className={`probably-env probably-env-${i + 1}${!isLead ? ' probably-env-locked' : ''}`}
            >
              <div className="probably-env-flap" />
              <div className="probably-env-meta">
                <span className="probably-env-day">{days[i]?.day}</span>
                <span className="probably-env-date">{days[i]?.date}</span>
              </div>
              <div className="probably-env-text">{teaserText}</div>
              {isLead ? (
                <div className="probably-env-status">Lead candidate · 06:14 IST</div>
              ) : (
                <div className="probably-env-lock">Sealed · subscribe to peek</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
