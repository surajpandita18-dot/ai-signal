import React from 'react'
import { HeroBroadcast } from './HeroBroadcast'
import { HeroPreviewStrip } from './HeroPreviewStrip'
import type { TickerData, PreviewCard } from '@/lib/types/extended-data'

interface HeroZoneProps {
  issueDate: string    // e.g. "27 April 2026"
  publishTime: string  // e.g. "06:14 IST"
  readMinutes: number  // from story.read_minutes
  headline?: string    // today's article headline
  signalNumber?: number
  phrases?: string[]
  category?: string
  tickers?: TickerData[]
  previewCards?: PreviewCard[]
}

export function HeroZone({ issueDate, publishTime, readMinutes, headline, signalNumber, phrases, category, previewCards }: HeroZoneProps) {
  const timeParts = publishTime.split(' ')
  const timeOnly = timeParts[0] ?? publishTime
  const tzPart = timeParts.slice(1).join(' ')
  const hourOnly = timeOnly.split(':')[0]

  return (
    <section className="hero-zone" aria-label="Hero zone">
      <div className="hero-banner">
        <div className="hero-graphics" aria-hidden="true">
          <span className="hero-shape hero-shape-warm" />
          <span className="hero-shape hero-shape-cobalt" />
          <span className="hero-fragment">One signal.</span>
        </div>

        <div className="hero-eyebrow anim d2">
          <span className="hero-eyebrow-pip" />
          <span className="hero-eyebrow-text">
            {issueDate}&nbsp;&nbsp;·&nbsp;&nbsp;Today&apos;s signal
          </span>
        </div>

        <div className="headline-stage">
          <h1 className="big-headline">
            <span className="hw hw1">One</span>
            {' '}
            <span className="hw hw2">AI</span>
            {' '}
            <span className="hw hw3">story.</span>
            <br />
            <span className="hw hw4"><span className="sub-line-inner ital">The one worth your next 5 minutes.</span></span>
          </h1>
        </div>

        {headline && (
          <a
            href="#"
            className="hero-today-headline anim d3"
            onClick={(e) => {
              e.preventDefault()
              document.querySelector('.story-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
          >
            <div className="hero-today-meta">
              {signalNumber && <span className="hero-today-sig">Signal #{signalNumber}</span>}
              {category && <span className="hero-today-cat">{category}</span>}
            </div>
            <span className="hero-today-text">{headline}</span>
            <span className="hero-today-arrow">Read the signal <span className="hta-arrow">→</span></span>
          </a>
        )}

        <p className="hero-sub anim d4">
          <span className="hero-sub-item">Filed <strong>{timeOnly}&nbsp;{tzPart}</strong></span>
          <span className="hero-sub-sep">·</span>
          <span className="hero-sub-item"><strong>{readMinutes}&nbsp;min</strong>&nbsp;read</span>
          <span className="hero-sub-sep">·</span>
          <span className="hero-sub-tagline">For people who ship</span>
        </p>

        <div className="hero-why anim d4" aria-label={`Why ${publishTime}?`}>
          <span className="hero-why-pip">{hourOnly}</span>
          <div>
            <strong>Why {timeOnly}{tzPart ? ` ${tzPart}` : ''}?</strong>{' '}
            It&apos;s when the first commit of the day lands in Bengaluru.
            We file before you stand up.
          </div>
        </div>

        {phrases && phrases.length > 0 && (
          <HeroBroadcast phrases={phrases} category={category ?? 'models'} />
        )}

        {previewCards && previewCards.length > 0 && (
          <HeroPreviewStrip cards={previewCards} />
        )}
      </div>
    </section>
  )
}
