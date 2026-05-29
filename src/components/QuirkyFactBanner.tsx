'use client'

import { useState } from 'react'
import { AI_FACTS } from '@/lib/ai-facts'

export function QuirkyFactBanner() {
  const [idx, setIdx] = useState(() => new Date().getDate() % AI_FACTS.length)
  const fact = AI_FACTS[idx]

  return (
    <div className="quirky-fact reveal">
      <div className="quirky-fact-eyebrow">Before you go</div>
      <div className="quirky-fact-label">{fact.label}</div>
      <p className="quirky-fact-text">{fact.text}</p>
      <button
        className="quirky-fact-btn"
        onClick={() => setIdx(i => (i + 1) % AI_FACTS.length)}
      >
        Another one →
      </button>
    </div>
  )
}
