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
    <section id="subscribe" style={{ maxWidth: 1280, margin: '100px auto 0', padding: '0 32px' }}>
      <div
        style={{
          background: 'var(--text)',
          color: 'var(--bg)',
          borderRadius: 24,
          padding: '64px 56px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 64,
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow blob behind */}
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: 500,
            height: 500,
            background: 'radial-gradient(circle, var(--signal) 0%, transparent 60%)',
            opacity: 0.4,
            pointerEvents: 'none',
          }}
        />

        {/* Left: headline */}
        <h2
          className="reveal"
          style={{
            fontFamily: 'var(--ff-display)',
            fontSize: 'clamp(32px,4vw,48px)',
            lineHeight: 1.05,
            fontWeight: 400,
            letterSpacing: '-0.025em',
            position: 'relative',
            zIndex: 1,
          }}
        >
          Get tomorrow&apos;s signal{' '}
          <em style={{ fontStyle: 'italic', color: 'var(--signal-soft)' }}>before</em> it expires.
        </h2>

        {/* Right: form */}
        <div className="reveal" style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              fontFamily: 'var(--ff-mono)',
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              color: 'var(--signal-soft)',
              marginBottom: 18,
            }}
          >
            — The dispatch
          </div>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.75)',
              marginBottom: 28,
            }}
          >
            One transmission, every morning at 06:14 IST. Built for builders, engineers, and
            product people who&apos;d rather ship than scroll.
          </p>

          {status === 'success' ? (
            <p
              style={{
                color: 'var(--signal-soft)',
                fontFamily: 'var(--ff-mono)',
                fontSize: 14,
              }}
            >
              ✓ You&apos;re in. See you tomorrow at 06:14 IST.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{
                display: 'flex',
                gap: 8,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 12,
                padding: 6,
              }}
            >
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  padding: '12px 14px',
                  color: 'white',
                  fontSize: 15,
                  fontFamily: 'var(--ff-body)',
                }}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                style={{
                  background: 'var(--signal)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {status === 'loading' ? '…' : 'Subscribe'}
              </button>
            </form>
          )}

          {status === 'error' && (
            <p style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,100,100,0.9)' }}>
              {errorMsg}
            </p>
          )}

          <div
            style={{
              marginTop: 18,
              fontSize: 13,
              color: 'rgba(255,255,255,0.55)',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              flexWrap: 'wrap',
            }}
          >
            <span>✓ Free forever</span>
            <span>✓ No spam</span>
            <span>✓ Unsubscribe anytime</span>
          </div>
        </div>
      </div>
    </section>
  )
}
