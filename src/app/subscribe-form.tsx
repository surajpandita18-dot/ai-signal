'use client'

import { useEffect, useState } from 'react'

type State = 'idle' | 'submitting' | 'done' | 'error' | 'already'

const STORAGE_KEY = 'aib_subscribed'

export default function SubscribeForm() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<State>('idle')

  // Restore state across navigations: if the user already subscribed in this
  // browser, skip the form and show the calm confirmation instead.
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY)) {
        setState('already')
      }
    } catch {
      /* localStorage blocked — fall through to form */
    }
  }, [])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email) return
    setState('submitting')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'landing' }),
      })
      if (!res.ok) throw new Error('subscribe failed')
      try {
        localStorage.setItem(STORAGE_KEY, email.trim().toLowerCase())
      } catch {
        /* localStorage blocked — non-fatal */
      }
      setState('done')
    } catch {
      setState('error')
    }
  }

  if (state === 'done' || state === 'already') {
    return (
      <p
        style={{
          marginTop: 24,
          fontFamily: "'Newsreader', serif",
          fontStyle: 'italic',
          fontSize: 17,
          color: 'var(--accent)',
          maxWidth: 480,
        }}
      >
        {state === 'already'
          ? 'You’re in. Saturday at 8 AM IST.'
          : 'You’re in. First Saturday: see you then.'}
      </p>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{
        marginTop: 24,
        display: 'flex',
        gap: 10,
        flexWrap: 'wrap',
        maxWidth: 480,
      }}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@work.com"
        aria-label="Email address"
        disabled={state === 'submitting'}
        style={{
          flex: '1 1 240px',
          padding: '11px 14px',
          border: '1px solid var(--ink)',
          background: '#fff',
          color: 'var(--ink)',
          fontFamily: "'Archivo', sans-serif",
          fontSize: 14,
        }}
      />
      <button
        type="submit"
        disabled={state === 'submitting'}
        style={{
          padding: '11px 18px',
          background: 'var(--ink)',
          color: '#fff',
          border: '1px solid var(--ink)',
          fontFamily: "'Archivo Narrow', sans-serif",
          fontWeight: 600,
          fontSize: 12.5,
          letterSpacing: '.06em',
          textTransform: 'uppercase',
          cursor: 'pointer',
        }}
      >
        {state === 'submitting' ? 'Sending…' : 'Subscribe'}
      </button>
      {state === 'error' ? (
        <p
          style={{
            width: '100%',
            marginTop: 4,
            fontSize: 13,
            color: 'var(--accent)',
            fontFamily: "'Archivo Narrow', sans-serif",
          }}
        >
          Something broke. Try again in a minute.
        </p>
      ) : null}
    </form>
  )
}
