import type { Poll as PollType } from '@/lib/content-model'

export default function Poll({ question, options }: PollType) {
  return (
    <div className="poll">
      <div className="q">{question}</div>
      <div className="opts">
        {options.map((o, i) => (
          <span key={i} className="opt">
            {o}
          </span>
        ))}
      </div>
    </div>
  )
}
