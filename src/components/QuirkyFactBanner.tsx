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
          <span className="qf-sidebar-badge">&#9889; Static</span>
          <span className="qf-sidebar-counter">{idx + 1} / {TOTAL}</span>
        </div>
        <div key={`lbl-${idx}`} className="qf-sidebar-label qf-animate">{fact.label}</div>
        <p key={`txt-${idx}`} className="qf-sidebar-text qf-animate">{fact.text}</p>
        <div className="qf-sidebar-nav">
          <button
            className="qf-sidebar-btn"
            onClick={() => setOffset(o => o - 1)}
            aria-label="Previous fact"
          >
            &larr; Prev
          </button>
          <button
            className="qf-sidebar-btn"
            onClick={() => setOffset(o => o + 1)}
            aria-label="Next fact"
          >
            Next &rarr;
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="qf-section reveal">
      <div className="quirky-fact">
        <div className="quirky-fact-head">
          <span className="quirky-fact-badge">&#9889; Static</span>
          <span className="quirky-fact-counter">{idx + 1} / {TOTAL}</span>
        </div>
        <div key={`lbl-${idx}`} className="quirky-fact-label qf-animate">{fact.label}</div>
        <p key={`txt-${idx}`} className="quirky-fact-text qf-animate">{fact.text}</p>
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
