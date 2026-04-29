'use client'

import { useState, useEffect, useRef } from 'react'

// Live counter state — ticks continuously regardless of phrase
let _tokens = 47392
let _water = 12.4
let _startups = 23

interface HeroBroadcastProps {
  broadcastPhrases?: string[]
}

// phrase definitions — live counter values injected at render time
function getPhrases(tokens: number, water: number, startups: number, broadcastPhrases?: string[]) {
  return [
    // Editorial — items 1-3 use cron-generated data-anchored phrases when available
    broadcastPhrases?.[0]
      ? { plain: broadcastPhrases[0], html: broadcastPhrases[0] }
      : { plain: "Today's signal: pricing economics shifted overnight.", html: "Today's signal: <em>pricing economics shifted overnight.</em>" },
    broadcastPhrases?.[1]
      ? { plain: broadcastPhrases[1], html: broadcastPhrases[1] }
      : { plain: 'OpenAI quietly cut model costs by 10×. Most teams haven\'t noticed yet.', html: 'OpenAI quietly cut model costs by <span class="bc-num">10×</span>. Most teams haven\'t noticed yet.' },
    broadcastPhrases?.[2]
      ? { plain: broadcastPhrases[2], html: broadcastPhrases[2] }
      : { plain: 'If you ship AI products, your unit economics changed today.', html: 'If you ship AI products, your <em>unit economics changed today.</em>' },
    // Live counters
    { plain: `While you've been here, AI has burned ${tokens.toLocaleString()} tokens for free.`, html: `While you've been here, AI has burned <span class="bc-num">${tokens.toLocaleString()}</span> tokens for free.` },
    { plain: `${water.toFixed(1)} gallons of water cooled GPUs in the time it took to reach this line.`, html: `<span class="bc-num">${water.toFixed(1)}</span> gallons of water cooled GPUs in the time it took to reach this line.` },
    { plain: `${startups} new AI startups registered globally since you opened this page.`, html: `<span class="bc-num">${startups}</span> new AI startups registered globally since you opened this page.` },
    // Backstory
    { plain: 'Why 06:14 IST? It\'s when the first commit of the day lands in Bengaluru.', html: '<em>Why 06:14 IST?</em> It\'s when the first commit of the day lands in Bengaluru.' },
    { plain: 'Today\'s signal cleared 168 articles, 6 newsletters, 1 bar.', html: 'Today\'s signal cleared <span class="bc-num">168</span> articles, <span class="bc-num">6</span> newsletters, <span class="bc-num">1</span> bar.' },
  ]
}

export function HeroBroadcast({ broadcastPhrases }: HeroBroadcastProps) {
  const [tokens, setTokens] = useState(_tokens)
  const [water, setWater] = useState(_water)
  const [startups, setStartups] = useState(_startups)
  const [displayed, setDisplayed] = useState('')
  const [phraseIdx, setPhraseIdx] = useState(0)
  const isDeletingRef = useRef(false)
  const [showFull, setShowFull] = useState(false)
  const charIdxRef = useRef(0)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tokensRef = useRef(_tokens)
  const waterRef = useRef(_water)
  const startupsRef = useRef(_startups)

  // Live counter intervals
  useEffect(() => {
    const t1 = setInterval(() => {
      _tokens += Math.floor(Math.random() * 30) + 5
      tokensRef.current = _tokens
      setTokens(_tokens)
    }, 200)
    const t2 = setInterval(() => {
      _water += Math.random() * 0.04 + 0.02
      waterRef.current = _water
      setWater(parseFloat(_water.toFixed(1)))
    }, 800)
    const t3 = setInterval(() => {
      if (Math.random() > 0.5) { _startups += 1; startupsRef.current = _startups; setStartups(_startups) }
    }, 4500)
    return () => { clearInterval(t1); clearInterval(t2); clearInterval(t3) }
  }, [])

  // Type-on loop
  useEffect(() => {
    function step() {
      const phrases = getPhrases(tokensRef.current, waterRef.current, startupsRef.current, broadcastPhrases)
      const phrase = phrases[phraseIdx]
      const plain = phrase.plain

      if (!isDeletingRef.current) {
        charIdxRef.current++
        if (charIdxRef.current >= plain.length) {
          setDisplayed(plain)
          setShowFull(true)
          typingTimer.current = setTimeout(() => {
            setShowFull(false)
            isDeletingRef.current = true
            step()
          }, 3200)
          return
        }
        setDisplayed(plain.slice(0, charIdxRef.current))
        typingTimer.current = setTimeout(step, 30 + Math.random() * 25)
      } else {
        charIdxRef.current = Math.max(0, charIdxRef.current - 3)
        if (charIdxRef.current <= 0) {
          setDisplayed('')
          isDeletingRef.current = false
          setPhraseIdx(i => (i + 1) % phrases.length)
          return
        }
        setDisplayed(plain.slice(0, charIdxRef.current))
        typingTimer.current = setTimeout(step, 14)
      }
    }

    typingTimer.current = setTimeout(step, phraseIdx === 0 ? 1200 : 500)
    return () => { if (typingTimer.current) clearTimeout(typingTimer.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phraseIdx])

  const phrases = getPhrases(tokensRef.current, waterRef.current, startupsRef.current, broadcastPhrases)

  return (
    <>
      <style>{`
        @keyframes broadcastBreath {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        @keyframes scanTravel {
          0% { left: -30%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
        @keyframes caretBlink {
          50% { opacity: 0; }
        }
        .bc-num {
          font-family: var(--ff-mono);
          font-style: normal;
          font-weight: 700;
          color: var(--warm);
          font-size: 0.92em;
          letter-spacing: -0.005em;
        }
        .hero-broadcast-inner em {
          font-style: italic;
        }
        .bc-scan {
          position: absolute;
          top: 50%;
          left: -30%;
          height: 1px;
          width: 30%;
          background: linear-gradient(90deg, transparent 0, transparent 20%, rgba(255,107,53,0.35) 50%, transparent 80%, transparent 100%);
          transform: translateY(-50%);
          animation: scanTravel 7s ease-in-out infinite;
          pointer-events: none;
          z-index: 0;
        }
        .bc-breath {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 80% at 30% 50%, rgba(43,91,255,0.05), transparent 70%),
            radial-gradient(ellipse 50% 70% at 70% 50%, rgba(255,107,53,0.04), transparent 70%);
          border-radius: 16px;
          z-index: -2;
          animation: broadcastBreath 8s ease-in-out infinite;
        }
        .bc-noise {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.92' numOctaves='2'/><feColorMatrix values='0 0 0 0 0.08 0 0 0 0 0.07 0 0 0 0 0.06 0 0 0 0.4 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
          opacity: 0.05;
          border-radius: 16px;
          z-index: -1;
          pointer-events: none;
        }
      `}</style>

      <div
        className="anim d5"
        style={{
          margin: '56px auto 0',
          maxWidth: 760,
          position: 'relative',
          padding: '36px 32px 30px',
          isolation: 'isolate',
        }}
      >
        <div className="bc-breath" aria-hidden="true" />
        <div className="bc-noise" aria-hidden="true" />
        <div className="bc-scan" aria-hidden="true" />

        {/* Eyebrow */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            fontFamily: 'var(--ff-mono)',
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: 'var(--text-mute)',
            marginBottom: 18,
            position: 'relative',
            zIndex: 2,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 6,
              height: 6,
              background: 'var(--warm)',
              borderRadius: '50%',
              boxShadow: '0 0 0 3px var(--warm-soft)',
              animation: 'livePulse 1.6s ease-in-out infinite',
            }}
          />
          Today&apos;s broadcast
        </div>

        {/* Type-on text */}
        <div
          className="hero-broadcast-inner"
          style={{
            fontFamily: 'var(--ff-display)',
            fontSize: 24,
            lineHeight: 1.4,
            color: 'var(--text)',
            fontWeight: 400,
            letterSpacing: '-0.012em',
            minHeight: 68,
            position: 'relative',
            zIndex: 2,
          }}
        >
          {showFull ? (
            <span dangerouslySetInnerHTML={{ __html: phrases[phraseIdx].html }} />
          ) : (
            <span>{displayed}</span>
          )}
          <span
            aria-hidden="true"
            style={{
              display: 'inline-block',
              width: 2,
              height: 22,
              background: 'var(--warm)',
              marginLeft: 3,
              transform: 'translateY(3px)',
              animation: 'caretBlink 0.9s steps(2) infinite',
              boxShadow: '0 0 6px rgba(255,107,53,0.4)',
            }}
          />
        </div>

        {/* Meta line */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            marginTop: 22,
            fontFamily: 'var(--ff-mono)',
            fontSize: 10,
            color: 'var(--text-faint)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontWeight: 600,
            position: 'relative',
            zIndex: 2,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              aria-hidden="true"
              style={{
                width: 5,
                height: 5,
                background: 'var(--green)',
                borderRadius: '50%',
                animation: 'livePulse 1.4s ease-in-out infinite',
                display: 'inline-block',
              }}
            />
            Filed 06:14 IST
          </span>
          <span style={{ color: 'var(--border-mid)' }}>·</span>
          <span>3 min read</span>
          <span style={{ color: 'var(--border-mid)' }}>·</span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '3px 8px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              fontSize: 9,
              color: 'var(--text)',
            }}
          >
            Models
          </span>
        </div>
      </div>
    </>
  )
}
