'use client'

import { useRef } from 'react'
import { HeroBroadcast } from '@/components/HeroBroadcast'

interface HeroZoneProps {
  date?: string
  broadcastPhrases?: string[]
}

export function HeroZone({
  date = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }),
  broadcastPhrases,
}: HeroZoneProps) {
  const headlineRef = useRef<HTMLHeadingElement>(null)

  function handleHeadlineMouseMove(e: React.MouseEvent<HTMLHeadingElement>) {
    const el = headlineRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `translate(${x * 6}px, ${y * 4}px)`
  }

  function handleHeadlineMouseLeave() {
    if (headlineRef.current) headlineRef.current.style.transform = ''
  }

  return (
    <section
      className="hero-section"
      style={{
        background: `radial-gradient(ellipse 80% 50% at 30% 20%, rgba(43,91,255,0.06), transparent 65%),
          radial-gradient(ellipse 60% 40% at 75% 80%, rgba(255,107,53,0.04), transparent 70%),
          linear-gradient(180deg, #F6F7FB 0%, #FAFAF7 100%)`,
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid var(--border)',
        paddingBottom: 0,
      }}
    >
      <style>{`
        .hero-headline:hover .hero-ital {
          text-shadow: 0 8px 30px rgba(43,91,255,0.35);
          transform: translateY(-3px) rotate(-1.5deg);
        }
        .hero-section::before {
          content: '';
          position: absolute;
          top: -5%; right: -5%;
          width: 540px; height: 360px;
          background: radial-gradient(ellipse 50% 60% at 50% 50%, rgba(255,107,53,0.05), transparent 70%);
          filter: blur(60px);
          pointer-events: none;
          z-index: 0;
          opacity: 0.8;
        }
        .hero-section::after {
          content: '';
          position: absolute;
          bottom: -10%; left: -8%;
          width: 720px; height: 480px;
          background: radial-gradient(ellipse 50% 60% at 50% 50%, rgba(43,91,255,0.10), transparent 70%);
          filter: blur(70px);
          pointer-events: none;
          z-index: 0;
          opacity: 0.85;
        }
        @keyframes heroShapeFloat {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(8px, -10px); }
        }
        @keyframes heroShapeFloatRotate {
          0%, 100% { transform: rotate(-8deg) translate(0, 0); }
          50% { transform: rotate(-7deg) translate(-6px, 4px); }
        }
        @keyframes fragmentBreath {
          0%, 100% { opacity: 0; transform: rotate(-4deg) translateY(2px); }
          25%, 75% { opacity: 0.32; transform: rotate(-4deg) translateY(0); }
          50% { opacity: 0.42; transform: rotate(-4deg) translateY(-1px); }
        }
        .hero-shape-warm {
          position: absolute;
          width: 280px; height: 280px;
          top: 8%; right: 6%;
          background: radial-gradient(circle, rgba(255,107,53,0.18), rgba(255,107,53,0.06) 60%, transparent 75%);
          border-radius: 50%;
          filter: blur(8px);
          pointer-events: none;
          animation: heroShapeFloat 14s ease-in-out infinite;
        }
        .hero-shape-cobalt {
          position: absolute;
          width: 380px; height: 240px;
          bottom: 12%; left: -4%;
          background: radial-gradient(ellipse 60% 50% at 50% 50%, rgba(43,91,255,0.14), rgba(43,91,255,0.04) 60%, transparent 75%);
          border-radius: 50%;
          filter: blur(20px);
          pointer-events: none;
          animation: heroShapeFloatRotate 18s ease-in-out infinite;
        }
        .hero-fragment {
          position: absolute;
          top: 14%; left: 8%;
          font-family: var(--ff-display);
          font-style: italic;
          font-size: 17px;
          color: var(--text-faint);
          opacity: 0;
          letter-spacing: -0.01em;
          transform: rotate(-4deg);
          animation: fragmentBreath 9s ease-in-out infinite;
          pointer-events: none;
        }
        @media (max-width: 720px) {
          .hero-shape-warm { width: 180px; height: 180px; top: 4%; right: -10%; }
          .hero-shape-cobalt { width: 240px; height: 160px; bottom: 8%; left: -20%; }
          .hero-fragment { display: none; }
        }
      `}</style>

      {/* Floating backdrop graphics */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <span className="hero-shape-warm" />
        <span className="hero-shape-cobalt" />
        <span className="hero-fragment">One signal.</span>
      </div>

      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '88px 32px 56px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Eyebrow pill */}
        <div
          className="anim d2"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            margin: '0 auto 56px',
            padding: '8px 18px',
            background: 'var(--bg-card, #FFFFFF)',
            border: '1px solid var(--border)',
            borderRadius: 999,
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              background: 'var(--warm, #FF6B35)',
              borderRadius: '50%',
              boxShadow: '0 0 0 3px var(--warm-soft, #FFE8DD)',
              animation: 'livePulse 1.6s ease-in-out infinite',
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: 'var(--ff-mono, ui-monospace, monospace)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--text-soft, #2D2A26)',
            }}
          >
            {date} · Today&apos;s signal
          </span>
        </div>

        {/* Big headline — two lines with magnetic hover */}
        <h1
          ref={headlineRef}
          className="hero-headline anim d3"
          onMouseMove={handleHeadlineMouseMove}
          onMouseLeave={handleHeadlineMouseLeave}
          style={{
            fontFamily: 'var(--ff-display, "Instrument Serif", serif)',
            fontSize: 'clamp(48px, 7.8vw, 104px)',
            lineHeight: 0.98,
            fontWeight: 400,
            letterSpacing: '-0.035em',
            color: 'var(--text, #14110F)',
            margin: '0 auto',
            maxWidth: 1100,
            willChange: 'transform',
            transition: 'transform 0.4s cubic-bezier(0.2,0.8,0.2,1)',
            cursor: 'default',
          }}
        >
          Today&apos;s one AI story.
          <br />
          <em
            className="hero-ital"
            style={{
              fontStyle: 'italic',
              color: 'var(--signal, #2B5BFF)',
              display: 'inline-block',
              fontSize: '0.62em',
              letterSpacing: '-0.025em',
              lineHeight: 1.05,
              marginTop: '0.15em',
              transition: 'all 0.5s cubic-bezier(0.2,0.8,0.2,1)',
            }}
          >
            The one that should change a decision.
          </em>
        </h1>

        {/* Sub */}
        <p
          className="anim d4"
          style={{
            fontSize: 19,
            lineHeight: 1.55,
            color: 'var(--text-mute, #5C574F)',
            maxWidth: 540,
            margin: '32px auto 0',
            letterSpacing: '-0.005em',
          }}
        >
          Filed{' '}
          <strong style={{ color: 'var(--text, #14110F)', fontWeight: 600 }}>
            06:14 IST
          </strong>
          {' '}· Reading time 3 minutes · For people who ship.
        </p>

        <HeroBroadcast broadcastPhrases={broadcastPhrases} />
      </div>
    </section>
  )
}
