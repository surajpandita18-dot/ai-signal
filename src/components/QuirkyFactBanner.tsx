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
    <div className="quirky-fact reveal">
      <div className="quirky-fact-eyebrow">Before you go</div>
      <div className="quirky-fact-label">{fact.label}</div>
      <p className="quirky-fact-text">{fact.text}</p>
      <div className="quirky-fact-nav">
        <button
          className="quirky-fact-btn"
          onClick={() => setOffset(o => o - 1)}
          aria-label="Previous fact"
        >
          ← Prev
        </button>
        <span className="quirky-fact-counter">{idx + 1} / {TOTAL}</span>
        <button
          className="quirky-fact-btn"
          onClick={() => setOffset(o => o + 1)}
          aria-label="Next fact"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
