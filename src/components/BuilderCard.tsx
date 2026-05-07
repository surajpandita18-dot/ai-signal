'use client'

import { useState } from 'react'

interface BuilderCardProps {
  buildQuote: string   // story.editorial_take
  betQuote: string     // story.lenses.bet or story.lens_builder
  burnQuote: string    // story.lenses.burn or story.lens_founder
}

function boldHtml(s: string): string {
  return s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}

export function BuilderCard({ buildQuote, betQuote, burnQuote }: BuilderCardProps) {
  const [betHovered, setBetHovered] = useState(false)
  const [burnHovered, setBurnHovered] = useState(false)

  return (
    <div className="builder-outer">
      {/* Dark card — The Build */}
      <div className="builder-block">
        <div className="builder-eyebrow">
          <span aria-hidden="true" className="builder-live-dot" />
          The Build · viewed from the code floor
        </div>
        <p
          className="builder-quote"
          dangerouslySetInnerHTML={{ __html: boldHtml(buildQuote) }}
        />
        <div className="builder-attr">
          <div className="builder-avatar" aria-hidden="true" />
          <div className="builder-attr-text">
            <strong>AI Signal · The Build</strong>
            <br />
            Editorial perspective from the code floor
          </div>
        </div>
      </div>

      {/* Secondary cards — The Bet + The Burn */}
      <div className="builder-secondary">
        {/* The Bet — bull case */}
        <div
          className={`builder-card builder-bet${betHovered ? ' builder-card--hovered' : ''}`}
          onMouseEnter={() => setBetHovered(true)}
          onMouseLeave={() => setBetHovered(false)}
        >
          <div className="builder-card-eyebrow">
            <span className="builder-card-eyebrow-icon" aria-hidden="true">↑</span>
            The Bet · bull case
          </div>
          <p
            className="builder-card-quote"
            dangerouslySetInnerHTML={{ __html: boldHtml(betQuote) }}
          />
          <div className="builder-card-attr">
            <span className="builder-card-dot" aria-hidden="true" />
            AI Signal · viewed from the bet
          </div>
        </div>

        {/* The Burn — bear case */}
        <div
          className={`builder-card builder-burn${burnHovered ? ' builder-card--hovered' : ''}`}
          onMouseEnter={() => setBurnHovered(true)}
          onMouseLeave={() => setBurnHovered(false)}
        >
          <div className="builder-card-eyebrow">
            <span className="builder-card-eyebrow-icon" aria-hidden="true">↓</span>
            The Burn · bear case
          </div>
          <p
            className="builder-card-quote"
            dangerouslySetInnerHTML={{ __html: boldHtml(burnQuote) }}
          />
          <div className="builder-card-attr">
            <span className="builder-card-dot" aria-hidden="true" />
            AI Signal · viewed from the burn
          </div>
        </div>
      </div>
    </div>
  )
}
