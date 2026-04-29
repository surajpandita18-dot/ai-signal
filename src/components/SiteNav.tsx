'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

function SoonLink({ text }: { text: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'default' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ color: 'var(--text-mute)' }}>{text}</span>
      <span
        aria-hidden="true"
        style={{
          width: 5,
          height: 5,
          background: 'var(--warm)',
          borderRadius: '50%',
          boxShadow: '0 0 0 2px var(--warm-soft)',
          flexShrink: 0,
        }}
      />
      {hovered && (
        <span
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--text)',
            color: 'var(--bg)',
            padding: '6px 10px',
            borderRadius: 6,
            fontFamily: 'var(--ff-body)',
            fontSize: 11,
            fontWeight: 500,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 30,
          }}
        >
          Live with your subscription
        </span>
      )}
    </span>
  )
}

interface SiteNavProps {
  signalNumber?: number
}

export function SiteNav({ signalNumber }: SiteNavProps) {
  const [scrolled, setScrolled] = useState(false)
  const [hoverSubscribe, setHoverSubscribe] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <style>{`
        @media (max-width: 640px) {
          .site-nav-inner { padding: 14px 16px !important; }
          .site-nav-inner .nav-links a:not(.nav-cta) { display: none; }
        }
      `}</style>
      <header
        className="site-nav-inner"
        style={{
          position: 'sticky',
          top: 3,
          zIndex: 60,
          padding: '18px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(250, 250, 247, 0.88)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
          boxShadow: scrolled ? '0 1px 16px rgba(0,0,0,0.06)' : 'none',
          transition: 'box-shadow 0.3s ease',
        }}
      >
        {/* Wordmark */}
        <div className="anim d1" style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div
            style={{
              width: 28,
              height: 28,
              background: 'var(--text)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FAFAF7',
              fontFamily: 'var(--ff-mono)',
              fontSize: 14,
              fontWeight: 800,
              position: 'relative',
            }}
          >
            S
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 5,
                right: 5,
                width: 7,
                height: 7,
                background: 'var(--warm)',
                borderRadius: '50%',
                boxShadow: '0 0 0 2px var(--text)',
                animation: 'livePulse 1.8s ease-in-out infinite',
                display: 'block',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, gap: 3 }}>
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--text)',
                fontFamily: 'var(--ff-body)',
              }}
            >
              AI{' '}
              <em
                style={{
                  fontFamily: 'var(--ff-display)',
                  fontStyle: 'italic',
                  fontWeight: 500,
                  color: 'var(--text)',
                  letterSpacing: '-0.01em',
                }}
              >
                Signal
              </em>
              {signalNumber !== undefined && (
                <span
                  style={{
                    marginLeft: 8,
                    fontFamily: 'var(--ff-mono)',
                    fontSize: 11,
                    fontWeight: 500,
                    color: 'var(--text-mute)',
                    letterSpacing: '0.08em',
                    fontStyle: 'normal',
                  }}
                >
                  #{signalNumber}
                </span>
              )}
            </span>
            <span
              style={{
                fontFamily: 'var(--ff-mono)',
                fontSize: 8.5,
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--text-faint)',
              }}
            >
              daily signal
            </span>
          </div>
        </div>

        {/* Nav links */}
        <nav
          className="nav-links anim d1"
          style={{
            display: 'flex',
            gap: 28,
            alignItems: 'center',
            fontSize: 14,
            color: 'var(--text-mute)',
            fontWeight: 500,
          }}
        >
          <Link
            href="/archive"
            style={{
              color: 'var(--text-mute)',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-mute)')}
          >
            Archive
          </Link>
          <Link
            href="/about"
            style={{
              color: 'var(--text-mute)',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-mute)')}
          >
            About
          </Link>
          <SoonLink text="Sponsor" />
          <a
            href="#subscribe"
            className="nav-cta"
            style={{
              color: hoverSubscribe ? 'var(--signal)' : 'var(--text)',
              fontWeight: 600,
              fontSize: 14,
              borderBottom: hoverSubscribe
                ? '1px solid var(--signal)'
                : '1px solid var(--text)',
              letterSpacing: '-0.005em',
              transition: 'color 0.2s, border-color 0.2s',
              textDecoration: 'none',
              paddingBottom: 1,
            }}
            onMouseEnter={() => setHoverSubscribe(true)}
            onMouseLeave={() => setHoverSubscribe(false)}
          >
            Subscribe →
          </a>
        </nav>
      </header>
    </>
  )
}
