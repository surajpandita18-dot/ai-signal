'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// ─── facts data ──────────────────────────────────────────────────────────────

const FACTS = [
  { cat: 'numbers',  html: 'Today, humanity will consume <span class="nb-num">2.4 trillion</span> AI tokens before breakfast IST.' },
  { cat: 'numbers',  html: 'GPT-5 Mini just answered <span class="nb-num">47,000</span> questions in the time you read this card.' },
  { cat: 'numbers',  html: 'Claude has written ~<span class="nb-num">900M</span> lines of code this month — more than every human at Google combined.' },
  { cat: 'industry', html: '<span class="nb-num">1 in 4</span> Indian developers used an AI assistant before lunch today.' },
  { cat: 'numbers',  html: 'A single GPT-5 Mini query now costs <span class="nb-num">$0.000004</span> — less than a grain of rice.' },
  { cat: 'trivia',   html: 'The average AI model is now obsolete in <span class="nb-num">6 months</span>. Your phone is older.' },
  { cat: 'industry', html: 'AI job postings grew <span class="nb-num">38%</span> globally — and <span class="nb-num">51%</span> in India alone.' },
  { cat: 'trivia',   html: 'AI Signal goes out at <span class="nb-num">06:14 IST</span> — when the first commit of the day usually lands.' },
  { cat: 'industry', html: 'There are now <span class="nb-num">14,000+</span> AI startups in Bengaluru alone. Three are unicorns.' },
  { cat: 'numbers',  html: 'OpenAI processes ~<span class="nb-num">100 billion</span> tokens every hour — the entire Library of Congress, every 4 minutes.' },
  { cat: 'trivia',   html: 'The first AI to pass the bar exam scored <span class="nb-num">90th</span> percentile. The average human lawyer? 68th.' },
  { cat: 'industry', html: 'Private capital raised by AI labs in 2025 alone — over <span class="nb-num">$80 billion</span> — exceeds the GDP of <span class="nb-num">90+ countries</span>.' },
] as const

type FactCat = (typeof FACTS)[number]['cat']
type Category = 'all' | FactCat

type Fact = { cat: string; html: string }

function filterFacts(category: Category): readonly Fact[] {
  if (category === 'all') return FACTS
  const filtered = (FACTS as readonly Fact[]).filter(f => f.cat === category)
  return filtered.length > 0 ? filtered : FACTS
}

// ─── constants ────────────────────────────────────────────────────────────────

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'all',      label: 'All' },
  { key: 'numbers',  label: 'Nums' },
  { key: 'trivia',   label: 'Trivia' },
  { key: 'industry', label: 'Industry' },
]

const ROTATION_MS = 5500

// ─── component ───────────────────────────────────────────────────────────────

export function NotebookFacts() {
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [factIndex, setFactIndex]           = useState(0)
  const [isPlaying, setIsPlaying]           = useState(true)
  const [animState, setAnimState]           = useState<'idle' | 'scribbling' | 'writing'>('idle')

  const intervalRef      = useRef<ReturnType<typeof setInterval> | null>(null)
  const scribbleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const writeTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const factCountRef     = useRef<number>(FACTS.length)
  const factIndexRef     = useRef<number>(0)

  const safeFacts = filterFacts(activeCategory)
  factCountRef.current = safeFacts.length

  // ── animation helper ──────────────────────────────────────────────────────

  const changeFact = useCallback((newIndex: number) => {
    if (scribbleTimerRef.current) clearTimeout(scribbleTimerRef.current)
    if (writeTimerRef.current)    clearTimeout(writeTimerRef.current)

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
      const next = (factIndexRef.current + 1) % factCountRef.current
      changeFact(next)
    }, ROTATION_MS)
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
      if (intervalRef.current)      clearInterval(intervalRef.current)
      if (scribbleTimerRef.current) clearTimeout(scribbleTimerRef.current)
      if (writeTimerRef.current)    clearTimeout(writeTimerRef.current)
    }
  }, [])

  // ── prefer-reduced-motion: stop auto-play ─────────────────────────────────

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) setIsPlaying(false)
  }, [])

  // ── category change ───────────────────────────────────────────────────────

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

  const handlePlayPause = () => setIsPlaying(p => !p)

  // ── derived values ────────────────────────────────────────────────────────

  const safeIndex   = Math.min(factIndex, safeFacts.length - 1)
  factIndexRef.current = safeIndex
  const currentFact = safeFacts[safeIndex]
  const pad2        = (n: number) => String(n).padStart(2, '0')

  const factTextClass = [
    'nb-fact-text',
    animState === 'scribbling' ? 'scribbling' : '',
    animState === 'writing'    ? 'writing'    : '',
  ].filter(Boolean).join(' ')

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="nb-row">
      {/* Left: title + counter */}
      <div className="nb-left">
        <span className="nb-title">Did you know?</span>
        <span className="nb-counter">
          Fact {pad2((safeIndex % 12) + 1)} of 12
        </span>
      </div>

      {/* Center: fact text */}
      <div className="nb-fact-wrap">
        <p
          className={factTextClass}
          dangerouslySetInnerHTML={{ __html: currentFact?.html ?? '' }}
        />
      </div>

      {/* Right: controls + category tabs */}
      <div className="nb-actions">
        <div className="nb-controls">
          <button
            className="nb-btn"
            onClick={handlePrev}
            aria-label="Previous fact"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <button
            className="nb-btn"
            onClick={handlePlayPause}
            aria-label={isPlaying ? 'Pause auto-rotating facts' : 'Resume auto-rotating facts'}
            aria-pressed={isPlaying}
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
            onClick={handleNext}
            aria-label="Next fact"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>

        <div className="nb-tabs">
          {CATEGORIES.map(({ key, label }) => (
            <button
              key={key}
              className={`nb-tab${activeCategory === key ? ' active' : ''}`}
              onClick={() => handleCategoryChange(key)}
              aria-pressed={activeCategory === key}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
