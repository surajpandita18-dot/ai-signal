import Link from 'next/link'

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
        <Link
          href="/"
          className="wordmark"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          AI, Basically<span className="dot">.</span>
        </Link>
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
