'use client'

import { useState, useEffect } from 'react'

interface ExpiryBadgeProps {
  publishedAt: string
  signalNumber: number
}

function getRemaining(publishedAt: string) {
  const expiresAt = new Date(publishedAt).getTime() + 24 * 60 * 60 * 1000
  const diff = expiresAt - Date.now()
  if (diff <= 0) return null
  const totalMs = 24 * 60 * 60 * 1000
  const elapsed = totalMs - diff
  const pct = Math.min(100, Math.round((elapsed / totalMs) * 100))
  const h = Math.floor(diff / (1000 * 60 * 60))
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return { h, m, pct }
}

function pad(n: number) { return String(n).padStart(2, '0') }

export function ExpiryBadge({ publishedAt, signalNumber }: ExpiryBadgeProps) {
  const [remaining, setRemaining] = useState<{ h: number; m: number; pct: number } | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    function update() { setRemaining(getRemaining(publishedAt)) }
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [publishedAt])

  const num = String(signalNumber).padStart(3, '0')

  return (
    <div
      role="status"
      aria-label={remaining ? `Signal ${signalNumber}, expires in ${remaining.h} hours ${remaining.m} minutes` : `Signal ${signalNumber}`}
      style={{
        marginBottom: '48px',
        padding: '24px',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        backgroundColor: 'var(--surface)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top row: signal number + live indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <span
          className="font-mono"
          style={{
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          Signal #{num}
        </span>
        {remaining && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span
              className="live-dot"
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--live)',
                boxShadow: '0 0 6px var(--live-glow)',
                display: 'inline-block',
              }}
            />
            <span
              className="font-mono"
              style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--live)',
              }}
            >
              Live
            </span>
          </span>
        )}
      </div>

      {/* Countdown — the hero */}
      <div style={{ marginBottom: '8px' }}>
        <span
          className="font-mono"
          style={{
            fontSize: '64px',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            color: 'var(--text-primary)',
            display: 'block',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {mounted && remaining ? `${pad(remaining.h)}:${pad(remaining.m)}` : '--:--'}
        </span>
      </div>

      {/* Label */}
      <p
        className="font-mono"
        style={{
          fontSize: '10px',
          fontWeight: 500,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: '20px',
        }}
      >
        Hours remaining
      </p>

      {/* Progress bar */}
      {mounted && remaining && (
        <div>
          <div
            style={{
              height: '2px',
              backgroundColor: 'var(--border)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${remaining.pct}%`,
                backgroundColor: 'var(--accent)',
                borderRadius: '2px',
                transformOrigin: 'left',
                animation: 'progressReveal 0.8s ease forwards',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
            <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>PUBLISHED</span>
            <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>{remaining.pct}% elapsed</span>
            <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>EXPIRES</span>
          </div>
        </div>
      )}
    </div>
  )
}
