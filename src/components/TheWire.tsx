'use client'

import React, { useState, useEffect, useRef } from 'react'

// ─── NumFlash ─────────────────────────────────────────────────────────────────

function NumFlash({ value }: { value: string }) {
  const prevRef = useRef(value)
  const [flashing, setFlashing] = useState(false)

  useEffect(() => {
    if (prevRef.current !== value) {
      prevRef.current = value
      setFlashing(true)
      const t = setTimeout(() => setFlashing(false), 1000)
      return () => clearTimeout(t)
    }
  }, [value])

  return (
    <span
      className={flashing ? 'num flash' : 'num'}
    >
      {value}
    </span>
  )
}

// ─── WireDispatch ─────────────────────────────────────────────────────────────

interface WireDispatchProps {
  time: string
  origin: string
  city: string
  text: React.ReactNode
  delta: { dir: 'up' | 'down'; value: string }
  isLead?: boolean
  isBreaking?: boolean
}

function WireDispatch({ time, origin, city, text, delta, isLead, isBreaking }: WireDispatchProps) {
  const pl = isBreaking ? 33 : 36
  return (
    <article
      className={[
        'wire-dispatch',
        isLead ? 'lead' : '',
        isBreaking ? 'breaking' : '',
      ].filter(Boolean).join(' ')}
      style={{ paddingLeft: pl, paddingRight: 36 }}
    >
      {/* Col 1: timestamp + origin code stacked */}
      <div className="dispatch-meta">
        <span className="dispatch-time">{time}</span>
        <span className="dispatch-origin">{origin}</span>
      </div>

      {/* Col 2: city / dateline */}
      <div className="dispatch-loc">
        {isBreaking && <span className="breaking-prefix">BREAKING · </span>}
        {city}
      </div>

      {/* Col 3: body text — Fraunces italic */}
      <p className="dispatch-text">{text}</p>

      {/* Col 4: delta badge */}
      <span className={`dispatch-delta ${delta.dir}`}>
        ▲ {delta.value}
      </span>
    </article>
  )
}

// ─── TheWire ──────────────────────────────────────────────────────────────────

export function TheWire() {
  const todayIST = (() => {
    return new Date().toLocaleDateString('en-GB', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric', month: 'long', year: 'numeric',
    }).toUpperCase()
  })()

  const [tokensVal, setTokensVal] = useState(4.2)
  const [co2Val, setCo2Val] = useState(142)
  const [powerVal, setPowerVal] = useState(0.31)
  const [clockStr, setClockStr] = useState('')

  useEffect(() => {
    const id = setInterval(() => {
      setTokensVal(v => parseFloat((v + Math.random() * 0.05 + 0.02).toFixed(1)))
    }, 1400)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setCo2Val(v => Math.round(v + Math.random() * 0.4 + 0.1))
    }, 2200)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setPowerVal(v => parseFloat(Math.max(0.28, Math.min(0.35, v + (Math.random() - 0.3) * 0.005)).toFixed(2)))
    }, 3500)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const parts = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
      }).formatToParts(now)
      const get = (type: string) => parts.find(p => p.type === type)?.value ?? '00'
      setClockStr(`${get('hour')}:${get('minute')}:${get('second')}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <style>{`
        /* ── Wire shell ── */
        .wire-shell {
          background:
            repeating-linear-gradient(0deg, transparent 0, transparent 38px, rgba(20,17,15,0.025) 38px, rgba(20,17,15,0.025) 39px),
            var(--bg-warm, #FBF8F1);
          color: var(--text);
          border: 1px solid var(--border-mid);
          border-radius: 6px;
          overflow: hidden;
          position: relative;
          box-shadow:
            0 1px 0 rgba(255,255,255,0.6) inset,
            0 8px 24px rgba(20,17,15,0.06),
            0 24px 64px rgba(20,17,15,0.04);
        }
        .wire-shell::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/><feColorMatrix values='0 0 0 0 0.08 0 0 0 0 0.07 0 0 0 0 0.06 0 0 0 0.5 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
          opacity: 0.06;
          pointer-events: none;
          z-index: 1;
        }

        /* ── Dispatch row ── */
        .wire-dispatch {
          display: grid;
          grid-template-columns: 88px 100px 1fr auto;
          gap: 24px;
          align-items: baseline;
          padding-top: 18px;
          padding-bottom: 18px;
          border-bottom: 1px solid var(--border);
          transition: background 0.25s;
          position: relative;
          z-index: 2;
        }
        .wire-dispatch:hover { background: rgba(20,17,15,0.02); }
        .wire-dispatch:last-child { border-bottom: none; }
        .wire-dispatch.lead {
          padding-top: 26px;
          padding-bottom: 26px;
          background: linear-gradient(180deg, rgba(255,107,53,0.04), transparent 60%);
          border-bottom: 1px solid var(--border-mid);
        }
        .wire-dispatch.breaking { border-left: 3px solid var(--warm); }

        /* ── Col 1: meta ── */
        .dispatch-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
          line-height: 1.2;
        }
        .dispatch-time {
          font-family: var(--ff-mono);
          font-size: 13px;
          font-weight: 700;
          color: var(--text);
          letter-spacing: 0.02em;
          font-variant-numeric: tabular-nums;
          line-height: 1;
        }
        .dispatch-origin {
          font-family: var(--ff-mono);
          font-size: 9px;
          font-weight: 600;
          color: var(--text-mute);
          letter-spacing: 0.18em;
          text-transform: uppercase;
          line-height: 1;
        }

        /* ── Col 2: dateline city ── */
        .dispatch-loc {
          font-family: var(--ff-mono);
          font-size: 11px;
          font-weight: 700;
          color: var(--text-soft);
          letter-spacing: 0.18em;
          text-transform: uppercase;
          white-space: nowrap;
          line-height: 1.3;
        }
        .dispatch-loc::after {
          content: ' →';
          color: var(--warm);
          font-weight: 600;
          margin-left: 4px;
        }
        .breaking-prefix { color: var(--warm); font-weight: 700; }

        /* ── Col 3: body text ── */
        .dispatch-text {
          font-family: var(--ff-fraunces), var(--ff-display), 'Georgia', serif;
          font-size: 17px;
          font-weight: 400;
          color: var(--text);
          line-height: 1.4;
          letter-spacing: -0.005em;
          font-variation-settings: "opsz" 14;
          margin: 0;
        }
        .wire-dispatch.lead .dispatch-text { font-size: 22px; line-height: 1.32; }
        .dispatch-text strong {
          font-family: var(--ff-mono);
          font-style: normal;
          font-weight: 700;
          font-size: 16px;
          color: var(--text);
          letter-spacing: -0.01em;
          margin: 0 1px;
        }
        .wire-dispatch.lead .dispatch-text strong { font-size: 20px; }
        .dispatch-text .num {
          font-family: var(--ff-mono);
          font-style: normal;
          font-weight: 700;
          font-size: 16px;
          color: var(--warm);
          letter-spacing: -0.01em;
          transition: color 0.4s, text-shadow 0.4s;
        }
        .dispatch-text .num.flash { animation: numFlash 1s ease-out; }
        .wire-dispatch.lead .dispatch-text .num { font-size: 20px; }

        /* ── Col 4: delta badge ── */
        .dispatch-delta {
          font-family: var(--ff-mono);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.04em;
          line-height: 1;
          padding: 5px 9px;
          border-radius: 2px;
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
        }
        .dispatch-delta.up {
          background: var(--green-soft);
          color: var(--green);
          border: 1px solid rgba(27,122,62,0.20);
        }
        .dispatch-delta.down {
          background: var(--warm-soft);
          color: var(--warm);
          border: 1px solid rgba(255,107,53,0.25);
        }

        /* ── Footer clock ── */
        .wire-clock-sep { color: var(--warm); animation: blink 1s ease-in-out infinite; }

        /* ── Mobile ── */
        @media (max-width: 880px) {
          .wire-zone-outer { padding: 0 16px !important; margin-top: 48px !important; }
          .wire-header-inner { grid-template-columns: 1fr !important; gap: 12px; text-align: center; }
          .wire-title-inner { justify-content: center; }
          .wire-live-badge { margin: 0 auto; }
          .wire-dispatch {
            grid-template-columns: auto 1fr auto !important;
            grid-template-rows: auto auto;
            gap: 10px 14px;
            padding-top: 16px !important;
            padding-bottom: 16px !important;
            padding-left: 18px !important;
            padding-right: 18px !important;
          }
          .wire-dispatch.breaking { padding-left: 15px !important; }
          .dispatch-meta { grid-row: 1; grid-column: 1; }
          .dispatch-loc  { grid-row: 1; grid-column: 2; align-self: center; }
          .dispatch-delta{ grid-row: 1; grid-column: 3; align-self: center; }
          .dispatch-text { grid-row: 2; grid-column: 1 / -1; font-size: 15px !important; }
          .wire-dispatch.lead .dispatch-text { font-size: 17px !important; }
          .wire-footer-inner { flex-direction: column; gap: 10px; padding: 14px 18px; }
        }
      `}</style>

      <section
        className="wire-zone-outer reveal"
        style={{ maxWidth: 1280, margin: '80px auto 0', padding: '0 32px' }}
      >
        <div className="wire-shell">

          {/* ── Masthead ── */}
          <div
            className="wire-header-inner"
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto',
              gap: 24,
              alignItems: 'center',
              padding: '28px 36px 22px',
              borderBottom: '2px solid var(--text)',
              position: 'relative',
              zIndex: 2,
            }}
          >
            {/* Wordmark */}
            <div className="wire-title-inner" style={{ display: 'flex', alignItems: 'baseline', gap: 16, lineHeight: 1 }}>
              <span
                style={{
                  fontFamily: 'var(--ff-fraunces), var(--ff-display), serif',
                  fontStyle: 'italic',
                  fontWeight: 500,
                  fontSize: 38,
                  color: 'var(--text)',
                  letterSpacing: '-0.025em',
                  lineHeight: 1,
                  fontVariationSettings: '"opsz" 72',
                }}
              >
                The{' '}
                <span style={{ color: 'var(--warm)', fontWeight: 600 }}>Wire</span>
              </span>
              <span
                style={{
                  fontFamily: 'var(--ff-mono)',
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'var(--text-mute)',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  borderLeft: '1px solid var(--border-mid)',
                  paddingLeft: 14,
                  marginLeft: 2,
                }}
              >
                · 047 · LIVE FEED
              </span>
            </div>

            {/* Dateline */}
            <div
              style={{
                textAlign: 'center',
                fontFamily: 'var(--ff-mono)',
                fontSize: 10,
                fontWeight: 600,
                color: 'var(--text-mute)',
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                lineHeight: 1.4,
              }}
            >
              <span style={{ color: 'var(--text)', fontWeight: 700 }}>{todayIST}</span>
              {' '}· While you were reading
            </div>

            {/* Live badge */}
            <div
              className="wire-live-badge"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontFamily: 'var(--ff-mono)',
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--warm)',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                lineHeight: 1,
                padding: '8px 14px',
                border: '1px solid rgba(255,107,53,0.35)',
                borderRadius: 2,
                background: 'var(--warm-soft)',
              }}
            >
              <span
                style={{
                  width: 7, height: 7,
                  background: 'var(--warm)',
                  borderRadius: '50%',
                  boxShadow: '0 0 0 3px rgba(255,107,53,0.18)',
                  animation: 'livePulse 1.4s ease-in-out infinite',
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
              Filed live
            </div>
          </div>

          {/* ── Dispatches ── */}
          <div style={{ position: 'relative', zIndex: 2 }}>

            <WireDispatch
              time="14:23 IST"
              origin="RTRS-AI"
              city="Paris"
              text={<>Mistral closes <strong>$240M</strong> Series C round, valuation reportedly hits <strong>$6B</strong>. Sources cite enterprise contract pipeline as primary driver of the raise.</>}
              delta={{ dir: 'up', value: '+8.4%' }}
              isLead
              isBreaking
            />

            <WireDispatch
              time="14:18 IST"
              origin="WSJ-DC"
              city="Global"
              text={<>AI inference now consuming <NumFlash value={`${powerVal}%`} /> of global electricity grid — up from 0.18% same period last year.</>}
              delta={{ dir: 'down', value: '+72.2%' }}
            />

            <WireDispatch
              time="14:09 IST"
              origin="NIKKEI"
              city="Tokyo"
              text={<>Nvidia order book reaches <strong>14,000 GPUs</strong> in the past hour. CO₂ from inference clocking <NumFlash value={`${co2Val}`} /> metric tons / hour worldwide.</>}
              delta={{ dir: 'up', value: '+11.6%' }}
            />

            <WireDispatch
              time="14:02 IST"
              origin="AISIG"
              city="Worldwide"
              text={<>Major providers processed <NumFlash value={`${tokensVal}T`} /> tokens this hour. Total AI infrastructure spend today: <strong>$847.2M</strong>.</>}
              delta={{ dir: 'up', value: '+8.4%' }}
            />
          </div>

          {/* ── Footer bar ── */}
          <div
            className="wire-footer-inner"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 36px',
              borderTop: '1px solid var(--border-mid)',
              background: 'rgba(20,17,15,0.03)',
              fontFamily: 'var(--ff-mono)',
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--text-mute)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              position: 'relative',
              zIndex: 2,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span>The Wire</span>
              <span style={{ width: 1, height: 12, background: 'var(--border-mid)', display: 'inline-block' }} />
              <span>Aggregated dispatches · Refreshed live</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>IST</span>
              <span
                style={{
                  color: 'var(--text)',
                  fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '0.04em',
                }}
                dangerouslySetInnerHTML={{
                  __html: clockStr.replace(
                    /:/g,
                    '<span class="wire-clock-sep">:</span>'
                  ),
                }}
              />
            </div>
          </div>

        </div>
      </section>
    </>
  )
}
