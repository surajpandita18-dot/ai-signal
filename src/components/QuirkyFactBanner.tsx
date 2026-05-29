'use client'

import { useState } from 'react'
import { AI_FACTS } from '@/lib/ai-facts'

function getDayOfYear(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  return Math.floor((now.getTime() - start.getTime()) / 86400000)
}

const TOTAL = AI_FACTS.length

interface QuirkyFactBannerProps {
  sidebar?: boolean
}

export function QuirkyFactBanner({ sidebar = false }: QuirkyFactBannerProps) {
  const [offset, setOffset] = useState(0)
  const todayIdx = getDayOfYear() % TOTAL
  const idx = (todayIdx + offset + TOTAL) % TOTAL
  const fact = AI_FACTS[idx]

  if (sidebar) {
    return (
      <div className="qf-sidebar-card">
        <div className="qf-sidebar-head">
          <span className="qf-sidebar-badge">Signal Static</span>
          <span className="qf-sidebar-counter">{idx + 1} / {TOTAL}</span>
        </div>
        <div className="qf-sidebar-label">{fact.label}</div>
        <p className="qf-sidebar-text">{fact.text}</p>
        <div className="qf-sidebar-nav">
          <button
            className="qf-sidebar-btn"
            onClick={() => setOffset(o => o - 1)}
            aria-label="Previous fact"
          >
            &larr;
          </button>
          <button
            className="qf-sidebar-btn"
            onClick={() => setOffset(o => o + 1)}
            aria-label="Next fact"
          >
            &rarr;
          </button>
        </div>
      </div>
    )
  }

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
