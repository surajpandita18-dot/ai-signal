'use client'

import React, { useState, useEffect, useRef } from 'react'

interface HeroBroadcastProps {
  phrases: string[]   // story.broadcast_phrases (TEXT[]) — NOT issue
  category: string    // story.category
}

const FALLBACK_PHRASES = ["Today's signal is being broadcast."]

export function HeroBroadcast({ phrases, category }: HeroBroadcastProps) {
  const [displayed, setDisplayed] = useState('')
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [showFull, setShowFull] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  const isDeletingRef = useRef(false)
  const charIdxRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Live counter refs — mutable, no re-render needed
  const liveTokensRef = useRef(47392)
  const liveWaterRef = useRef(12.4)
  const liveStartupsRef = useRef(23)

  // Detect reduced-motion on mount (client-side only)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Tick live counters — only when motion is allowed
  useEffect(() => {
    if (reducedMotion) return
    const t1 = setInterval(() => {
      liveTokensRef.current += Math.floor(Math.random() * 30) + 5
    }, 200)
    const t2 = setInterval(() => {
      liveWaterRef.current += Math.random() * 0.04 + 0.02
    }, 800)
    const t3 = setInterval(() => {
      if (Math.random() > 0.5) liveStartupsRef.current += 1
    }, 4500)
    return () => { clearInterval(t1); clearInterval(t2); clearInterval(t3) }
  }, [reducedMotion])

  // Plain text pool — used char-by-char during typing
  function buildPhrases(): string[] {
    const typeA = phrases.length > 0 ? phrases : FALLBACK_PHRASES
    return [
      ...typeA,
      `While you’ve been here, AI has burned ${liveTokensRef.current.toLocaleString()} tokens for free.`,
      `${liveWaterRef.current.toFixed(1)} gallons of water cooled GPUs in the time it took to reach this line.`,
      `${liveStartupsRef.current} new AI startups registered globally since you opened this page.`,
      `Why 06:14 IST? It’s when the first commit of the day lands in Bengaluru.`,
      `Today’s signal cleared 168 articles, 6 newsletters, 1 bar.`,
    ]
  }

  // Rich HTML pool — used only for showFull render, matches v10 innerHTML switch
  function buildRichPhrases(): string[] {
    const typeA = phrases.length > 0 ? phrases : FALLBACK_PHRASES
    const numRe = /(\$[\d,.]+[A-Za-z%]*|\b\d+(?:\.\d+)?[%×xMBKk]?\b)/g
    const richTypeA = typeA.map(p => p.replace(numRe, '<span class="num">$1</span>'))
    return [
      ...richTypeA,
      `While you’ve been here, AI has burned <span class="num">${liveTokensRef.current.toLocaleString()}</span> tokens for free.`,
      `<span class="num">${liveWaterRef.current.toFixed(1)}</span> gallons of water cooled GPUs in the time it took to reach this line.`,
      `<span class="num">${liveStartupsRef.current}</span> new AI startups registered globally since you opened this page.`,
      `<span class="ital">Why 06:14 IST?</span> It’s when the first commit of the day lands in Bengaluru.`,
      `Today’s signal cleared <span class="num">168</span> articles, <span class="num">6</span> newsletters, <span class="num">1</span> bar.`,
    ]
  }

  // Typewriter loop — skip when reducedMotion
  useEffect(() => {
    if (reducedMotion) return

    function step() {
      const allPhrases = buildPhrases()
      const phrase = allPhrases[phraseIdx % allPhrases.length] ?? ''

      if (!isDeletingRef.current) {
        charIdxRef.current += 1
        if (charIdxRef.current >= phrase.length) {
          setDisplayed(phrase)
          setShowFull(true)
          timerRef.current = setTimeout(() => {
            setShowFull(false)
            isDeletingRef.current = true
            step()
          }, 3200)
          return
        }
        setDisplayed(phrase.slice(0, charIdxRef.current))
        const delay = 30 + Math.random() * 25
        timerRef.current = setTimeout(step, delay)
      } else {
        charIdxRef.current = Math.max(0, charIdxRef.current - 3)
        if (charIdxRef.current <= 0) {
          setDisplayed('')
          isDeletingRef.current = false
          timerRef.current = setTimeout(() => {
            setPhraseIdx((i) => (i + 1) % buildPhrases().length)
          }, 500)
          return
        }
        setDisplayed(phrase.slice(0, charIdxRef.current))
        timerRef.current = setTimeout(step, 14)
      }
    }

    isDeletingRef.current = false
    charIdxRef.current = 0
    setDisplayed('')
    setShowFull(false)

    const initialDelay = phraseIdx === 0 ? 1200 : 500
    timerRef.current = setTimeout(step, initialDelay)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phraseIdx, reducedMotion])

  const allPhrases = buildPhrases()
  const richPhrases = buildRichPhrases()
  const currentRich = richPhrases[phraseIdx % richPhrases.length] ?? ''

  return (
    <div
      className="hero-broadcast anim d5"
      aria-live="polite"
      aria-label="Today's broadcast"
    >
      <span className="hero-broadcast-scan" aria-hidden="true" />

      <div className="hero-broadcast-eyebrow" aria-hidden="true">
        Today&apos;s broadcast
      </div>

      <div className="hero-broadcast-line">
        {reducedMotion ? (
          <span>{(phrases.length > 0 ? phrases : FALLBACK_PHRASES)[0] ?? ''}</span>
        ) : showFull ? (
          // Switch to innerHTML (rich) when phrase fully typed — matches v10 pattern
          <span dangerouslySetInnerHTML={{ __html: currentRich }} />
        ) : (
          <span>
            {displayed}
            <span className="caret" aria-hidden="true" />
          </span>
        )}
      </div>

      <div className="hero-broadcast-meta">
        <span>
          <span className="live-pip" aria-hidden="true" />
          Live · today&apos;s broadcast
        </span>
        <span className="divider" aria-hidden="true">·</span>
        <span className="topic-pill" aria-label={`Category: ${category}`}>
          {category}
        </span>
      </div>
    </div>
  )
}
