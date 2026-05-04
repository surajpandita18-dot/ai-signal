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
      <p className="sub-success">
        You&apos;re subscribed. First signal at 06:14 IST.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      {label && (
        <p className="sub-label">{label}</p>
      )}
      <div className="sub-form">
        <label htmlFor="subscribe-input-email" className="visually-hidden">
          Email address
        </label>
        <input
          id="subscribe-input-email"
          type="email"
          placeholder="your@email.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="sub-input"
        />
        <button
          type="submit"
          disabled={loading}
          className="sub-btn"
        >
          {loading ? '…' : 'Subscribe'}
        </button>
      </div>
      {error && (
        <p className="sub-error">{error}</p>
      )}
    </form>
  )
}
