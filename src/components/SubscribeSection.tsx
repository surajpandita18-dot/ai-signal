'use client'

import React, { useState } from 'react'

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'

export function SubscribeSection() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setErrorMsg('Enter a valid email.')
      setStatus('error')
      return
    }
    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok || res.status === 409) {
        setStatus('success')
      } else {
        throw new Error('Unexpected response')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Something went wrong. Try again.')
    }
  }

  return (
    <section id="subscribe" className="subscribe">
      <div className="subscribe-card">
        {/* Left: headline */}
        <h2 className="sub-headline anim d1">
          Get tomorrow&apos;s signal{' '}
          <em className="ital">before</em> it expires.
        </h2>

        {/* Right: form */}
        <div className="sub-side anim d2">
          <div className="sub-eyebrow">— The dispatch</div>
          <p className="sub-text">
            One transmission, every morning at 06:14 IST. Built for builders, engineers, and
            product people who&apos;d rather ship than scroll.
          </p>

          {status === 'success' ? (
            <p className="sub-success">
              ✓ You&apos;re in. See you tomorrow at 06:14 IST.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="sub-form">
              <label htmlFor="subscribe-email" className="visually-hidden">
                Email address
              </label>
              <input
                id="subscribe-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="sub-input"
                required
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="sub-btn"
              >
                {status === 'loading' ? '…' : 'Subscribe'}
              </button>
            </form>
          )}

          {status === 'error' && (
            <p className="sub-error">{errorMsg}</p>
          )}

          <div className="sub-trust">
            <span>✓ Free forever</span>
            <span>✓ No spam</span>
            <span>✓ Unsubscribe anytime</span>
          </div>
        </div>
      </div>
    </section>
  )
}
