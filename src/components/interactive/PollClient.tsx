'use client'

import { useState } from 'react'

type Props = {
  issueId: string
  question: string
  options: string[]
}

/**
 * Working poll. On click: marks the option .picked, POSTs to /api/poll,
 * shows "Noted — see you Saturday." Treats `already_voted` as a success
 * for the UX (still thanks the reader).
 */
export default function PollClient({ issueId, question, options }: Props) {
  const [picked, setPicked] = useState<string | null>(null)
  const [thanksShown, setThanksShown] = useState(false)

  async function vote(choice: string) {
    if (picked) return
    setPicked(choice)
    setThanksShown(true)
    try {
      await fetch('/api/poll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue_id: issueId, choice }),
      })
      // We deliberately don't surface backend errors here: the UX of the
      // poll is fire-and-forget. `already_voted` is a 200 from the API, so
      // the thanks message remains correct either way.
    } catch {
      // network error — leave the thanks shown; the reader has signalled
      // intent and there's nothing for them to do about it.
    }
  }

  return (
    <div className="poll">
      <div className="q">{question}</div>
      <div className="opts">
        {options.map((o, i) => (
          <button
            key={i}
            type="button"
            className={`opt${picked === o ? ' picked' : ''}`}
            onClick={() => vote(o)}
            disabled={picked !== null}
            style={{ font: 'inherit' }}
          >
            {o}
          </button>
        ))}
      </div>
      <div
        className={`poll-thanks${thanksShown ? ' show' : ''}`}
        role="status"
        aria-live="polite"
      >
        {thanksShown ? 'Noted — see you Saturday.' : ''}
      </div>
    </div>
  )
}
