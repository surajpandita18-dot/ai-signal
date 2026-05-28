'use client'

import { useState } from 'react'

const OPTIONS = [
  { key: 'changed',      icon: '→', label: 'Changed something I\'m building' },
  { key: 'thinking',     icon: '◐', label: 'Made me think differently' },
  { key: 'good_to_know', icon: '○', label: 'Good to know' },
  { key: 'not_relevant', icon: '×', label: 'Not relevant today' },
] as const

type OptionKey = typeof OPTIONS[number]['key']
type Step = 'form' | 'done'

export function FeedbackForm({ signalNumber }: { signalNumber?: number }) {
  const [step,       setStep]       = useState<Step>('form')
  const [selected,   setSelected]   = useState<OptionKey | null>(null)
  const [message,    setMessage]    = useState('')
  const [replyEmail, setReplyEmail] = useState('')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating:        selected,
          message:       message || undefined,
          reply_email:   replyEmail || undefined,
          signal_number: signalNumber,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      setStep('done')
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'done') {
    return (
      <div className="feedback-done">
        <div className="feedback-done-icon">✓</div>
        <p className="feedback-done-title">Got it. Thank you.</p>
        <p className="feedback-done-sub">Suraj will read this. It actually helps shape what gets covered.</p>
      </div>
    )
  }

  return (
    <form className="feedback-form" onSubmit={handleSubmit}>
      {/* Rating options */}
      <div className="feedback-section">
        <p className="feedback-label">How was today's signal?</p>
        <div className="feedback-options">
          {OPTIONS.map(opt => (
            <button
              key={opt.key}
              type="button"
              className={`feedback-option${selected === opt.key ? ' selected' : ''}`}
              onClick={() => setSelected(opt.key)}
            >
              <span className="feedback-option-icon">{opt.icon}</span>
              <span className="feedback-option-label">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      <div className="feedback-section">
        <label className="feedback-label" htmlFor="fb-message">
          Anything specific? <span className="feedback-optional">(optional)</span>
        </label>
        <textarea
          id="fb-message"
          className="feedback-textarea"
          placeholder="What worked, what didn't, what you'd like to see more of..."
          rows={4}
          value={message}
          onChange={e => setMessage(e.target.value)}
          maxLength={1000}
        />
      </div>

      {/* Reply email */}
      <div className="feedback-section">
        <label className="feedback-label" htmlFor="fb-email">
          Your email <span className="feedback-optional">(optional — if you want a reply)</span>
        </label>
        <input
          id="fb-email"
          type="email"
          className="feedback-input"
          placeholder="you@example.com"
          value={replyEmail}
          onChange={e => setReplyEmail(e.target.value)}
        />
      </div>

      {error && <p className="feedback-error">{error}</p>}

      <button
        type="submit"
        className={`feedback-submit${!selected ? ' disabled' : ''}${loading ? ' loading' : ''}`}
        disabled={!selected || loading}
      >
        {loading ? 'Sending…' : 'Send feedback →'}
      </button>
    </form>
  )
}
