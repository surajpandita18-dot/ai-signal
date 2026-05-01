'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// ─── facts data ──────────────────────────────────────────────────────────────

const FACTS = [
  { cat: 'numbers', html: 'Today, humanity will consume <span class="nb-num">2.4 trillion</span> AI tokens before breakfast IST.' },
  { cat: 'numbers', html: 'GPT-5 Mini just answered <span class="nb-num">47,000</span> questions in the time you read this card.' },
  { cat: 'numbers', html: 'Claude has written ~<span class="nb-num">900M</span> lines of code this month — more than every human at Google combined.' },
  { cat: 'industry', html: '<span class="nb-num">1 in 4</span> Indian developers used an AI assistant before lunch today.' },
  { cat: 'numbers', html: 'A single GPT-5 Mini query now costs <span class="nb-num">$0.000004</span> — less than a grain of rice.' },
  { cat: 'trivia', html: 'The average AI model is now obsolete in <span class="nb-num">6 months</span>. Your phone is older.' },
  { cat: 'industry', html: 'AI job postings grew <span class="nb-num">38%</span> globally — and <span class="nb-num">51%</span> in India alone.' },
  { cat: 'trivia', html: 'AI Signal goes out at <span class="nb-num">06:14 IST</span> — when the first commit of the day usually lands.' },
  { cat: 'industry', html: 'There are now <span class="nb-num">14,000+</span> AI startups in Bengaluru alone. Three are unicorns.' },
  { cat: 'numbers', html: 'OpenAI processes ~<span class="nb-num">100 billion</span> tokens every hour — the entire Library of Congress, every 4 minutes.' },
  { cat: 'trivia', html: 'The first AI to pass the bar exam scored <span class="nb-num">90th</span> percentile. The average human lawyer? 68th.' },
  { cat: 'industry', html: 'The total private capital raised by AI labs in 2025 alone — over <span class="nb-num">$80 billion</span> — exceeds the GDP of <span class="nb-num">90+ countries</span>.' },
] as const

type FactCat = typeof FACTS[number]['cat']
type Category = 'all' | FactCat

type Fact = { cat: string; html: string }

function filterFacts(category: Category): readonly Fact[] {
  if (category === 'all') return FACTS
  const filtered = (FACTS as readonly Fact[]).filter(f => f.cat === category)
  return filtered.length > 0 ? filtered : FACTS
}

// ─── component ───────────────────────────────────────────────────────────────

export function NotebookFacts() {
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [factIndex, setFactIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [animState, setAnimState] = useState<'idle' | 'scribbling' | 'writing'>('idle')

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const scribbleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const writeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Store current fact count in a ref so the interval callback always has fresh data
  const factCountRef = useRef<number>(FACTS.length)

  const safeFacts = filterFacts(activeCategory)

  // Keep ref in sync
  factCountRef.current = safeFacts.length

  // ── animation helper ──────────────────────────────────────────────────────

  const changeFact = useCallback((newIndex: number) => {
    if (scribbleTimerRef.current) clearTimeout(scribbleTimerRef.current)
    if (writeTimerRef.current) clearTimeout(writeTimerRef.current)

    setAnimState('scribbling')
    scribbleTimerRef.current = setTimeout(() => {
      setFactIndex(newIndex)
      setAnimState('writing')
      writeTimerRef.current = setTimeout(() => setAnimState('idle'), 900)
    }, 380)
  }, [])

  // ── auto-advance interval ─────────────────────────────────────────────────

  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      // Use functional updater + ref so we don't capture stale closure values
      setFactIndex(i => {
        const next = (i + 1) % factCountRef.current
        changeFact(next)
        return i // changeFact calls setFactIndex(next) internally; returning i is fine here
      })
    }, 5500)
  }, [changeFact])

  useEffect(() => {
    if (!isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    startInterval()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, activeCategory, startInterval])

  // ── cleanup on unmount ────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (scribbleTimerRef.current) clearTimeout(scribbleTimerRef.current)
      if (writeTimerRef.current) clearTimeout(writeTimerRef.current)
    }
  }, [])

  // ── category change — reset index ─────────────────────────────────────────

  const handleCategoryChange = (cat: Category) => {
    setActiveCategory(cat)
    setFactIndex(0)
    setAnimState('idle')
  }

  // ── manual navigation ─────────────────────────────────────────────────────

  const handlePrev = () => {
    const newIdx = (factIndex - 1 + safeFacts.length) % safeFacts.length
    changeFact(newIdx)
    if (isPlaying) startInterval()
  }

  const handleNext = () => {
    const newIdx = (factIndex + 1) % safeFacts.length
    changeFact(newIdx)
    if (isPlaying) startInterval()
  }

  const handlePlayPause = () => {
    setIsPlaying(p => !p)
  }

  // ── clamp factIndex when category changes ─────────────────────────────────

  const safeIndex = Math.min(factIndex, safeFacts.length - 1)
  const currentFact = safeFacts[safeIndex]

  const pad2 = (n: number) => String(n).padStart(2, '0')

  const CATEGORIES: { key: Category; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'numbers', label: 'Nums' },
    { key: 'trivia', label: 'Trivia' },
    { key: 'industry', label: 'Industry' },
  ]

  return (
    <>
      <style>{`
        @keyframes paperSway {
          0%, 100% { transform: rotate(-0.4deg) translateY(0); }
          25%       { transform: rotate(-0.2deg) translateY(-1px); }
          50%       { transform: rotate(0.1deg)  translateY(0); }
          75%       { transform: rotate(-0.1deg) translateY(1px); }
        }
        @keyframes writeIn {
          from { clip-path: inset(0 100% 0 0); opacity: 0; }
          to   { clip-path: inset(0 0% 0 0);   opacity: 1; }
        }
        @keyframes scribble {
          to { width: 100%; }
        }
        .notebook-wrap {
          background: repeating-linear-gradient(
            180deg,
            #FFF8DC 0,
            #FFF8DC 30px,
            #E8D88A 30px,
            #E8D88A 31px
          );
          border-radius: 16px;
          padding: 28px 36px 24px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 12px 32px rgba(184,134,11,0.16);
          transform: rotate(-0.4deg);
          position: relative;
          animation: paperSway 6s ease-in-out infinite;
          transition: transform 0.4s ease;
        }
        .notebook-wrap:hover {
          transform: rotate(0deg) !important;
          animation-play-state: paused;
        }
        /* red margin line */
        .notebook-wrap::after {
          content: '';
          position: absolute;
          top: 14px; bottom: 14px; left: 60px;
          width: 1px;
          background: rgba(220,80,80,0.35);
        }
        /* elaborate masking tape */
        .nb-tape {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%) rotate(-1.2deg);
          width: 92px;
          height: 22px;
          background:
            repeating-linear-gradient(90deg, rgba(255,255,255,0.18) 0 2px, transparent 2px 6px),
            linear-gradient(180deg, #FBE9A8 0%, #F4DC8A 100%);
          border-left: 1px dashed rgba(180,140,60,0.25);
          border-right: 1px dashed rgba(180,140,60,0.25);
          box-shadow: 0 2px 4px rgba(180,140,60,0.18), 0 1px 1px rgba(0,0,0,0.06);
          opacity: 0.92;
          z-index: 3;
          pointer-events: none;
        }
        .nb-tape::before,
        .nb-tape::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0;
          width: 6px;
          background: linear-gradient(180deg, transparent, rgba(255,255,255,0.4), transparent);
        }
        .nb-tape::before { left: 0; }
        .nb-tape::after  { right: 0; }
        /* corner doodle */
        .nb-doodle {
          position: absolute;
          top: 12px; right: 18px;
          width: 36px; height: 36px;
          color: var(--ink-pen);
          opacity: 0.5;
          transform: rotate(15deg);
        }
        .nb-doodle svg {
          width: 100%; height: 100%;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.4;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        /* scribble-out state */
        .nb-fact-scribbling {
          position: relative;
        }
        .nb-fact-scribbling::after {
          content: '';
          position: absolute;
          top: 50%; left: 0;
          width: 0; height: 2px;
          background: #2B4A8F;
          transform: translateY(-50%) rotate(-1deg);
          animation: scribble 0.35s ease-out forwards;
          pointer-events: none;
        }
        /* write-in state */
        .nb-fact-writing {
          animation: writeIn 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        /* highlighted numbers */
        .nb-num {
          color: #C0392B;
          font-weight: 700;
          text-decoration: underline;
          text-decoration-color: rgba(192,57,43,0.4);
          text-decoration-thickness: 2px;
          text-underline-offset: 3px;
        }
        /* notebook grid layout */
        .nb-row {
          display: grid;
          grid-template-columns: 220px 1fr auto;
          gap: 32px;
          align-items: center;
          padding-left: 36px;
        }
        /* controls */
        .nb-btn {
          width: 30px; height: 30px;
          border-radius: 50%;
          border: 1px solid rgba(43,74,143,0.25);
          background: rgba(255,255,255,0.7);
          color: var(--ink-pen);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s, color 0.2s, transform 0.2s;
          padding: 0;
        }
        .nb-btn:hover {
          background: var(--ink-pen);
          color: white;
          transform: scale(1.08);
        }
        .nb-tab {
          font-family: var(--ff-mono);
          font-size: 8.5px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 3px 9px;
          border: 1px solid rgba(43,74,143,0.25);
          border-radius: 999px;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, border-color 0.2s;
        }
        .nb-tab:hover { background: rgba(255,255,255,0.95); }
        .nb-tab-active {
          background: var(--ink-pen);
          color: white;
          border-color: var(--ink-pen);
        }
        .nb-tab-inactive {
          background: rgba(255,255,255,0.5);
          color: var(--ink-pen);
        }
        /* responsive */
        @media (max-width: 880px) {
          .nb-row {
            grid-template-columns: 1fr;
            gap: 16px;
            padding-left: 16px;
          }
          .nb-actions-inner {
            flex-direction: row !important;
            justify-content: space-between;
            width: 100%;
          }
          .notebook-wrap {
            padding: 22px 20px 18px;
          }
        }
      `}</style>

      <div className="reveal" style={{ maxWidth: 1280, margin: '32px auto 0', padding: '0 32px' }}>
        <div className="notebook-wrap">

          {/* masking tape */}
          <span className="nb-tape" aria-hidden="true" />

          {/* corner doodle */}
          <div className="nb-doodle">
            <svg viewBox="0 0 36 36" aria-hidden="true">
              <path d="M18 4 L21 14 L31 14 L23 20 L26 30 L18 24 L10 30 L13 20 L5 14 L15 14 Z" />
              <path d="M3 6 L7 10 M7 6 L3 10" strokeWidth="1" />
            </svg>
          </div>

          {/* 3-column row */}
          <div className="nb-row">

            {/* Left: title + counter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <p style={{
                fontFamily: 'var(--ff-hand)',
                fontSize: 34,
                color: 'var(--ink-pen)',
                fontWeight: 700,
                lineHeight: 1,
                textDecoration: 'underline',
                textDecorationColor: 'rgba(43,74,143,0.4)',
                textDecorationThickness: '2px',
                textUnderlineOffset: '5px',
              }}>
                Did you know?
              </p>
              <p style={{
                fontFamily: 'var(--ff-hand)',
                fontSize: 17,
                color: 'rgba(43,74,143,0.7)',
                fontWeight: 500,
                marginTop: 4,
              }}>
                Fact {pad2(safeIndex + 1)} of {pad2(safeFacts.length)}
              </p>
            </div>

            {/* Center: fact text */}
            <div style={{ position: 'relative', minHeight: 60, display: 'flex', alignItems: 'center' }}>
              <p
                className={
                  animState === 'scribbling'
                    ? 'nb-fact-scribbling'
                    : animState === 'writing'
                    ? 'nb-fact-writing'
                    : ''
                }
                style={{
                  fontFamily: 'var(--ff-hand)',
                  fontSize: 26,
                  lineHeight: 1.2,
                  color: 'var(--ink-pen)',
                  fontWeight: 600,
                  position: 'relative',
                }}
                dangerouslySetInnerHTML={{ __html: currentFact?.html ?? '' }}
              />
            </div>

            {/* Right: controls + category tabs */}
            <div
              className="nb-actions-inner"
              style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}
            >
              {/* prev / play / next */}
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  className="nb-btn"
                  title="Previous"
                  onClick={handlePrev}
                  aria-label="Previous fact"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>

                <button
                  className="nb-btn"
                  title={isPlaying ? 'Pause' : 'Play'}
                  onClick={handlePlayPause}
                  aria-label={isPlaying ? 'Pause auto-advance' : 'Play auto-advance'}
                >
                  {isPlaying ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="6" y="5" width="4" height="14" fill="currentColor" />
                      <rect x="14" y="5" width="4" height="14" fill="currentColor" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                      <polygon points="6,4 20,12 6,20" fill="currentColor" />
                    </svg>
                  )}
                </button>

                <button
                  className="nb-btn"
                  title="Next"
                  onClick={handleNext}
                  aria-label="Next fact"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>
              </div>

              {/* category tabs */}
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                {CATEGORIES.map(({ key, label }) => (
                  <button
                    key={key}
                    className={`nb-tab ${activeCategory === key ? 'nb-tab-active' : 'nb-tab-inactive'}`}
                    onClick={() => handleCategoryChange(key)}
                    aria-pressed={activeCategory === key}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
