type MastheadProps = {
  issueNumber: number
  dateDisplay: string
  readTimeMin: number
  streakCaption: string
}

export default function Masthead({
  issueNumber,
  dateDisplay,
  readTimeMin,
  streakCaption,
}: MastheadProps) {
  const padded = String(issueNumber).padStart(3, '0')
  return (
    <div className="mast">
      <div className="brand">
        <span className="wordmark">
          AI, Basically<span className="dot">.</span>
        </span>
        <span className="tagline">Explained like a normal person would.</span>
      </div>
      <div className="meta">
        № {padded}
        <br />
        {dateDisplay} · {readTimeMin} min
        <br />
        <span className="streak">{streakCaption}</span>
      </div>
    </div>
  )
}
