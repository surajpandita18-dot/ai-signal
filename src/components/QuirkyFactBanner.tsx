'use client'

import { useState } from 'react'
import { AI_FACTS } from '@/lib/ai-facts'

function getDayOfYear(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  return Math.floor((now.getTime() - start.getTime()) / 86400000)
}

const TOTAL = AI_FACTS.length

export function QuirkyFactBanner() {
  const [offset, setOffset] = useState(0)
  const todayIdx = getDayOfYear() % TOTAL
  const idx = (todayIdx + offset + TOTAL) % TOTAL
  const fact = AI_FACTS[idx]

  return (
    <div className="qf-section reveal">
      <div className="quirky-fact">
        <div className="quirky-fact-head">
          <span className="quirky-fact-badge">Signal Static</span>
          <span className="quirky-fact-counter">{idx + 1} / {TOTAL}</span>
        </div>
        <div className="quirky-fact-label">{fact.label}</div>
        <p className="quirky-fact-text">{fact.text}</p>
        <div className="quirky-fact-nav">
          <button
            className="quirky-fact-btn"
            onClick={() => setOffset(o => o - 1)}
            aria-label="Previous fact"
          >
            &larr; Prev
          </button>
          <button
            className="quirky-fact-btn"
            onClick={() => setOffset(o => o + 1)}
            aria-label="Next fact"
          >
            Next &rarr;
          </button>
        </div>
      </div>
    </div>
  )
}
