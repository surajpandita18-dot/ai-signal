'use client'

import { useState, useEffect } from 'react'

interface ReadingSidebarProps {
  readPct: number
  signalNumber: number
}

function getMessage(pct: number): { title: string; detail: string } {
  if (pct < 10)
    return { title: 'Just landed.', detail: 'Most readers leave before the second paragraph. Stay.' }
  if (pct < 25)
    return { title: 'Past the headline.', detail: 'You made it past the headline. That alone puts you ahead.' }
  if (pct < 50)
    return { title: 'Halfway in.', detail: 'The data section is below — usually where readers quit.' }
  if (pct < 75)
    return { title: 'Past the data.', detail: "You're reading the part most subscribers skip." }
  if (pct < 95)
    return { title: 'Almost there.', detail: "The Devil's Advocate is below. That's where the real edge is." }
  return { title: 'Inner circle.', detail: "You read the whole thing. Welcome — tomorrow's signal drops at 06:14 IST." }
}

function getPaceLabel(wpm: number): string {
  if (wpm < 250) return 'Easy pace'
  if (wpm < 320) return 'Steady pace'
  return 'Sprint'
}

// Envelope stack — "Tomorrow, probably"
const ENVELOPES = [
  {
    day: 'TUE',
    date: '28 Apr',
    text: "Anthropic's enterprise pricing leak — and what it means for you.",
    status: 'lead' as const,
  },
  {
    day: 'WED',
    date: '29 Apr',
    text: 'Multi-agent orchestration burns: the bill nobody is talking about.',
    status: 'sealed' as const,
  },
  {
    day: 'THU',
    date: '30 Apr',
    text: "India's inference cost arbitrage is real. Here's the math.",
    status: 'sealed' as const,
  },
]

export function ReadingSidebar({ readPct }: ReadingSidebarProps) {
  // r=42, circumference = 2π×42 ≈ 263.89
  const circumference = 2 * Math.PI * 42
  const offset = circumference * (1 - readPct / 100)
  const { title, detail } = getMessage(readPct)

  // Reading pace (appears after 25%)
  const wpm = 240 + Math.round((readPct / 100) * 80) + (Math.floor(Date.now() / 5000) % 20)
  const paceLabel = getPaceLabel(wpm)

  // Envelope hover
  const [envHovered, setEnvHovered] = useState(false)

  // Smooth displayed percentage
  const [displayedPct, setDisplayedPct] = useState(0)
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setDisplayedPct(prev => {
        const diff = readPct - prev
        if (Math.abs(diff) < 0.4) return readPct
        return prev + diff * 0.18
      })
    })
    return () => cancelAnimationFrame(id)
  }, [readPct, displayedPct])

  return (
    <>
      <style>{`
        @keyframes paceFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .env-stack {
          position: relative;
          height: 220px;
        }
        .env-card {
          position: absolute;
          left: 0; right: 0;
          background: var(--paper);
          border: 1px solid rgba(180,140,60,0.25);
          border-radius: 8px;
          padding: 14px 16px 12px;
          box-shadow: 0 4px 10px rgba(180,140,60,0.08), 0 1px 2px rgba(0,0,0,0.04);
          transition: transform 0.4s cubic-bezier(0.2,0.8,0.2,1), box-shadow 0.4s, opacity 0.4s;
          overflow: hidden;
        }
        /* hatched stripe at top */
        .env-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 28px;
          background: repeating-linear-gradient(45deg, rgba(180,140,60,0.06) 0, rgba(180,140,60,0.06) 4px, transparent 4px, transparent 10px);
          border-bottom: 1px solid rgba(180,140,60,0.18);
        }
        /* envelope flap arc */
        .env-flap {
          position: absolute;
          top: -1px; left: 50%;
          transform: translateX(-50%);
          width: 50%; height: 18px;
          background: var(--paper-deep);
          border-bottom-left-radius: 50% 100%;
          border-bottom-right-radius: 50% 100%;
          border: 1px solid rgba(180,140,60,0.25);
          border-top: none;
          z-index: 1;
        }
        .env-1 { top: 0; transform: rotate(-1deg); z-index: 3; }
        .env-2 { top: 16px; transform: rotate(0.8deg) translateY(8px) scale(0.97); z-index: 2; opacity: 0.85; }
        .env-3 { top: 30px; transform: rotate(-0.5deg) translateY(20px) scale(0.94); z-index: 1; opacity: 0.7; }
        .env-hovered .env-1 { transform: rotate(-1.5deg) translateY(-3px); box-shadow: 0 12px 24px rgba(180,140,60,0.15), 0 2px 4px rgba(0,0,0,0.05); }
        .env-hovered .env-2 { transform: rotate(1.5deg) translateY(12px) scale(0.97); opacity: 0.9; }
        .env-hovered .env-3 { transform: rotate(-1deg) translateY(28px) scale(0.94); opacity: 0.75; }
      `}</style>

      <aside
        style={{
          position: 'sticky',
          top: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* ── Card A: Reading Score ── */}
        <div
          className="reveal"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '26px 24px 22px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Ambient glow */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '-20%', right: '-20%',
              width: 200, height: 200,
              background: 'radial-gradient(circle, rgba(43,91,255,0.06), transparent 60%)',
              pointerEvents: 'none',
            }}
          />

          {/* Eyebrow */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: 'var(--ff-mono)',
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: 'var(--text-mute)',
              marginBottom: 14,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <span
              style={{
                width: 6, height: 6,
                background: 'var(--money)',
                borderRadius: '50%',
                animation: 'livePulse 1.4s ease-in-out infinite',
                flexShrink: 0,
              }}
            />
            Today&apos;s read
          </div>

          {/* Progress ring — centered, 130px */}
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <div style={{ position: 'relative', width: 130, height: 130, flexShrink: 0, margin: '6px auto 18px' }}>
              <svg viewBox="0 0 100 100" style={{ width: 130, height: 130, transform: 'rotate(-90deg)' }}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2B5BFF" />
                    <stop offset="100%" stopColor="#FF6B35" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--bg-soft)" strokeWidth="5" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="url(#scoreGrad)" strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${circumference}`}
                  strokeDashoffset={`${offset}`}
                  style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.2,0.8,0.2,1)' }}
                />
              </svg>
              <div
                style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--ff-display)',
                    fontSize: 38, fontWeight: 400,
                    color: 'var(--text)', lineHeight: 1,
                    letterSpacing: '-0.025em',
                  }}
                >
                  {Math.round(displayedPct)}
                  <em style={{ fontStyle: 'italic', color: 'var(--signal)', fontSize: 22, marginLeft: 1 }}>%</em>
                </span>
              </div>
            </div>
          </div>

          {/* Message — below ring, centered */}
          <div style={{ textAlign: 'center', lineHeight: 1.35, position: 'relative', zIndex: 1 }}>
            <div
              style={{
                fontFamily: 'var(--ff-display)',
                fontSize: 19, fontWeight: 500,
                color: 'var(--text)', marginBottom: 6,
                letterSpacing: '-0.01em', fontStyle: 'italic',
              }}
            >
              {title}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-mute)', lineHeight: 1.5, maxWidth: 220, margin: '0 auto' }}>
              {detail}
            </div>
          </div>

          {/* Reading pace — appears after 25% */}
          {readPct >= 25 && (
            <div
              style={{
                marginTop: 16,
                paddingTop: 14,
                borderTop: '1px dashed var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                fontFamily: 'var(--ff-mono)',
                fontSize: 10.5,
                color: 'var(--text-mute)',
                letterSpacing: '0.04em',
                fontWeight: 500,
                animation: 'paceFadeIn 0.5s ease-out',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <span
                style={{
                  width: 5, height: 5,
                  background: 'var(--green)',
                  borderRadius: '50%',
                  boxShadow: '0 0 0 2px var(--green-soft)',
                  animation: 'livePulse 1.6s ease-in-out infinite',
                }}
              />
              Reading at{' '}
              <strong style={{ color: 'var(--text)', fontWeight: 700 }}>{wpm}</strong>{' '}
              wpm · {paceLabel}
            </div>
          )}
        </div>

        {/* ── Card B: Tomorrow, probably — envelope stack ── */}
        <div
          className="reveal"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '22px 22px 26px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            position: 'relative',
          }}
          onMouseEnter={() => setEnvHovered(true)}
          onMouseLeave={() => setEnvHovered(false)}
        >
          <div style={{ marginBottom: 22, textAlign: 'left' }}>
            <span
              style={{
                display: 'block',
                fontFamily: 'var(--ff-display)',
                fontSize: 19,
                fontWeight: 500,
                color: 'var(--text)',
                letterSpacing: '-0.015em',
                lineHeight: 1.1,
                marginBottom: 4,
              }}
            >
              Tomorrow,{' '}
              <em style={{ fontStyle: 'italic', color: 'var(--signal)' }}>probably</em>
            </span>
            <span
              style={{
                fontFamily: 'var(--ff-mono)',
                fontSize: 9.5,
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--text-faint)',
              }}
            >
              three drafts on the desk
            </span>
          </div>

          <div className={`env-stack${envHovered ? ' env-hovered' : ''}`}>
            {ENVELOPES.map((env, i) => (
              <div key={env.day} className={`env-card env-${i + 1}`}>
                <div className="env-flap" />
                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 8,
                    marginTop: 22,
                    marginBottom: 8,
                    zIndex: 2,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--ff-mono)',
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: 'var(--ink-pen)',
                      background: 'rgba(43,74,143,0.10)',
                      padding: '3px 7px',
                      borderRadius: 3,
                    }}
                  >
                    {env.day}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--ff-mono)',
                      fontSize: 10,
                      color: 'var(--text-mute)',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {env.date}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: 'var(--ff-display)',
                    fontSize: 14.5,
                    lineHeight: 1.35,
                    color: env.status === 'sealed' ? 'var(--text-mute)' : 'var(--text)',
                    fontWeight: 400,
                    letterSpacing: '-0.005em',
                    marginBottom: 10,
                    position: 'relative',
                    zIndex: 2,
                    fontStyle: env.status === 'sealed' ? 'italic' : undefined,
                  }}
                >
                  {env.text}
                </p>
                {env.status === 'lead' ? (
                  <div
                    style={{
                      fontFamily: 'var(--ff-mono)',
                      fontSize: 9,
                      fontWeight: 600,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: 'var(--green)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <span
                      style={{
                        width: 5, height: 5,
                        background: 'var(--green)',
                        borderRadius: '50%',
                        animation: 'livePulse 1.6s ease-in-out infinite',
                      }}
                    />
                    Lead candidate · 06:14 IST
                  </div>
                ) : (
                  <div
                    style={{
                      fontFamily: 'var(--ff-mono)',
                      fontSize: 9,
                      fontWeight: 600,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: 'var(--text-faint)',
                    }}
                  >
                    Sealed · subscribe to peek
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </aside>
    </>
  )
}
