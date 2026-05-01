'use client'

import { useState, type FormEvent } from 'react'

interface SubscribeInputProps {
  label: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function SubscribeInput({ label }: SubscribeInputProps) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inputFocused, setInputFocused] = useState(false)
  const [buttonFocused, setButtonFocused] = useState(false)
  const [buttonHovered, setButtonHovered] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!email || !EMAIL_RE.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      const data: { ok?: boolean; error?: string } = await res.json()
      if (!res.ok || data.error) {
        setError(data.error ?? 'Something went wrong. Please try again.')
      } else {
        setSubmitted(true)
      }
    } catch (err) {
      clearTimeout(timeoutId)
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request timed out. Please try again.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <p
        className="font-mono"
        style={{
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--text-secondary)',
        }}
      >
        You&apos;re subscribed. First signal at 9 AM IST.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <p
        className="font-mono"
        style={{
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: '8px',
        }}
      >
        {label}
      </p>
      <div style={{ display: 'flex', gap: '8px', maxWidth: '480px' }}>
        <input
          type="email"
          placeholder="your@email.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="font-sans"
          style={{
            flex: 1,
            border: '1px solid var(--border)',
            backgroundColor: 'var(--surface)',
            color: 'var(--text-primary)',
            fontSize: '14px',
            padding: '12px 16px',
            borderRadius: '4px',
            outline: inputFocused ? '2px solid var(--accent)' : 'none',
            outlineOffset: '2px',
          }}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
        />
        <button
          type="submit"
          disabled={loading}
          className="font-mono"
          style={{
            border: 'none',
            backgroundColor: 'var(--accent)',
            color: '#fff',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '12px 20px',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            outline: buttonFocused ? '2px solid var(--accent)' : 'none',
            outlineOffset: '2px',
            whiteSpace: 'nowrap',
            opacity: loading ? 0.6 : buttonHovered ? 0.85 : 1,
            transition: 'opacity 150ms ease',
          }}
          onFocus={() => setButtonFocused(true)}
          onBlur={() => setButtonFocused(false)}
          onMouseEnter={() => setButtonHovered(true)}
          onMouseLeave={() => setButtonHovered(false)}
        >
          {loading ? '...' : 'Subscribe'}
        </button>
      </div>
      {error && (
        <p
          className="font-sans"
          style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginTop: '8px',
          }}
        >
          {error}
        </p>
      )}
    </form>
  )
}
