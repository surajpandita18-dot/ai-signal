interface SignalExpiredProps {
  headline: string
  publishedAt: string
  signalNumber: number
  tomorrowCategory?: string
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

export function SignalExpired({
  headline,
  publishedAt,
  signalNumber,
  tomorrowCategory,
}: SignalExpiredProps) {
  const formattedDate = dateFormatter.format(new Date(publishedAt))

  return (
    <div className="signal-expired">
      <div className="signal-expired-meta">
        <span className="signal-expired-num">Signal #{signalNumber}</span>
        <span className="signal-expired-dot" aria-hidden="true" />
        <span className="signal-expired-date">{formattedDate}</span>
        <span className="signal-expired-dot" aria-hidden="true" />
        <span className="signal-expired-badge">Read</span>
      </div>

      <p className="signal-expired-headline">{headline}</p>

      <hr className="signal-expired-rule" />

      <div className="signal-expired-tomorrow">
        <span className="signal-expired-pip" aria-hidden="true" />
        <p className="signal-expired-next">Next signal drops at 06:14 IST tomorrow.</p>
      </div>

      {tomorrowCategory && (
        <span className="signal-expired-cat">
          Tomorrow: {tomorrowCategory.toUpperCase()}
        </span>
      )}
    </div>
  )
}
