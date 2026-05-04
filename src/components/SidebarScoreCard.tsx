'use client'

import { useEffect, useRef, useState } from 'react'

interface ScoreMessage {
  title: string
  detail: string
}

function getScoreMessage(pct: number): ScoreMessage {
  if (pct < 10) return { title: 'Just landed.', detail: 'Most readers leave before the second paragraph. Stay.' }
  if (pct < 25) return { title: 'Past the headline.', detail: 'You made it past the headline. That alone puts you ahead.' }
  if (pct < 50) return { title: 'Halfway in.', detail: 'The data section is below — usually where readers quit.' }
  if (pct < 75) return { title: 'Past the data.', detail: "You're reading the part most subscribers skip." }
  if (pct < 95) return { title: 'Almost there.', detail: "The Devil's Advocate is below. That's where the real edge is." }
  return { title: 'Inner circle.', detail: "You read the whole thing. Welcome — tomorrow's signal drops at 06:14 IST." }
}

function getPaceLabel(wpm: number): string {
  if (wpm < 260) return 'steady pace'
  if (wpm < 290) return 'good pace'
  return 'fast reader'
}

const CIRCUMFERENCE = 263.89

interface SidebarScoreCardProps {
  readPct?: number
}

export function SidebarScoreCard({ readPct: readPctProp }: SidebarScoreCardProps) {
  const [displayPct, setDisplayPct] = useState(0)
  const [showPace, setShowPace] = useState(false)
  const [wpm, setWpm] = useState(260)
  const targetPctRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const prefersReducedMotion = useRef(false)
  const paceShownRef = useRef(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
  }, [])

  // Prop-driven mode: when readPctProp is provided, animate toward it
  useEffect(() => {
    if (readPctProp === undefined) return

    targetPctRef.current = readPctProp

    if (readPctProp >= 25 && !paceShownRef.current) {
      paceShownRef.current = true
      const variation = Math.round(Math.random() * 20) - 10
      setWpm(240 + Math.round((readPctProp / 100) * 80) + variation)
      setShowPace(true)
    }

    if (prefersReducedMotion.current) {
      setDisplayPct(readPctProp)
      return
    }

    const animate = () => {
      setDisplayPct(prev => {
        const diff = targetPctRef.current - prev
        if (Math.abs(diff) < 0.3) return targetPctRef.current
        return prev + diff * 0.18
      })
      rafRef.current = requestAnimationFrame(animate)
    }

    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [readPctProp])

  // Scroll-driven mode: when no prop, derive from scroll
  useEffect(() => {
    if (readPctProp !== undefined) return

    function getScrollPct(): number {
      const wrap = document.querySelector('.story-wrap') as HTMLElement | null
      if (!wrap) {
        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        if (docHeight <= 0) return 0
        return Math.min(100, Math.max(0, (scrollTop / docHeight) * 100))
      }
      const rect = wrap.getBoundingClientRect()
      const wrapTop = rect.top + window.scrollY
      const wrapHeight = wrap.offsetHeight
      const scrolled = window.scrollY - wrapTop
      if (wrapHeight <= 0) return 0
      return Math.min(100, Math.max(0, (scrolled / wrapHeight) * 100))
    }

    function animate() {
      setDisplayPct(prev => {
        const diff = targetPctRef.current - prev
        if (Math.abs(diff) < 0.3) return targetPctRef.current
        return prev + diff * 0.18
      })
      rafRef.current = requestAnimationFrame(animate)
    }

    function onScroll() {
      const pct = getScrollPct()
      targetPctRef.current = pct
      if (pct >= 25 && !paceShownRef.current) {
        paceShownRef.current = true
        const variation = Math.round(Math.random() * 20) - 10
        setWpm(240 + Math.round((pct / 100) * 80) + variation)
        setShowPace(true)
      }
      if (prefersReducedMotion.current) {
        setDisplayPct(pct)
      } else if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readPctProp])

  const roundedPct = Math.round(displayPct)
  const dashOffset = CIRCUMFERENCE * (1 - displayPct / 100)
  const msg = getScoreMessage(roundedPct)
  const paceLabel = getPaceLabel(wpm)

  return (
    <div className="score-card">
      {/* eyebrow */}
      <div className="score-eyebrow">
        <span className="score-eyebrow-pip" aria-hidden="true" />
        Today&apos;s read
      </div>

      {/* ring */}
      <div className="score-body">
        <div className="score-ring">
          <svg
            viewBox="0 0 100 100"
            aria-label={`Reading progress: ${roundedPct}%`}
            role="img"
          >
            <defs>
              <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2B5BFF" />
                <stop offset="100%" stopColor="#FF6B35" />
              </linearGradient>
            </defs>
            <circle
              cx="50" cy="50" r="42"
              className="score-ring-bg"
              aria-hidden="true"
            />
            <circle
              cx="50" cy="50" r="42"
              className="score-ring-fill"
              strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 50 50)"
              aria-hidden="true"
            />
          </svg>
          <div className="score-ring-text" aria-hidden="true">
            <span className="score-ring-num">
              {roundedPct}
              <em className="pct">%</em>
            </span>
          </div>
        </div>
      </div>

      {/* message */}
      <div className="score-msg">
        <p className="score-msg-title">{msg.title}</p>
        <p className="score-msg-detail">{msg.detail}</p>
      </div>

      {/* pace */}
      {showPace && (
        <div className="score-pace">
          <span className="score-pace-pip" aria-hidden="true" />
          Reading at <strong>{wpm}</strong> wpm &middot; {paceLabel}
        </div>
      )}
    </div>
  )
}
