'use client'

import { useState } from 'react'
import type { Story, SubscriberRole, StorySource } from '../../db/types/database'

interface StoryCardProps {
  story: Story
  userRole?: SubscriberRole
  position: number
}

const LENSES: { key: SubscriberRole; label: string; field: keyof Pick<Story, 'lens_pm' | 'lens_founder' | 'lens_builder'> }[] = [
  { key: 'pm', label: 'For PMs', field: 'lens_pm' },
  { key: 'founder', label: 'For Founders', field: 'lens_founder' },
  { key: 'builder', label: 'For Builders', field: 'lens_builder' },
]

export function StoryCard({ story, userRole, position }: StoryCardProps) {
  const [expanded, setExpanded] = useState(false)

  const sources = story.sources as StorySource[]

  return (
    <article
      style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '4px',
        padding: '24px',
      }}
    >
      {/* Metadata row */}
      <div
        className="flex items-center gap-2 font-mono"
        style={{
          fontSize: '11px',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--text-secondary)',
          marginBottom: '12px',
        }}
      >
        <span>{String(position).padStart(2, '0')}</span>
        <span style={{ color: 'var(--border)' }}>·</span>
        <span>{story.category}</span>
        <span style={{ color: 'var(--border)' }}>·</span>
        <span>{story.read_minutes} min read</span>
      </div>

      {/* Headline */}
      <h2
        className="font-serif"
        style={{
          fontSize: '22px',
          fontWeight: 600,
          lineHeight: 1.3,
          color: 'var(--text-primary)',
          marginBottom: '12px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {story.headline}
      </h2>

      {/* Summary */}
      <p
        className="font-sans"
        style={{
          fontSize: '15px',
          lineHeight: 1.6,
          color: 'var(--text-primary)',
          marginBottom: '16px',
        }}
      >
        {story.summary}
      </p>

      {/* Why it matters */}
      <div
        style={{
          borderLeft: '3px solid var(--accent)',
          backgroundColor: 'var(--card-bg-deeper)',
          padding: '12px',
          marginBottom: '16px',
        }}
      >
        <p
          className="font-mono"
          style={{
            fontSize: '11px',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-secondary)',
            marginBottom: '6px',
          }}
        >
          Why it matters
        </p>
        <p
          className="font-sans"
          style={{
            fontSize: '15px',
            lineHeight: 1.6,
            color: 'var(--text-primary)',
          }}
        >
          {story.why_it_matters}
        </p>
      </div>

      {/* Go deeper button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => setExpanded(!expanded)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setExpanded(!expanded)
            }
          }}
          className="font-sans"
          style={{
            border: '1px solid var(--border)',
            backgroundColor: 'transparent',
            color: 'var(--text-primary)',
            fontSize: '13px',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            outline: 'none',
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = '0 0 0 2px var(--accent)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = 'none'
          }}
          aria-expanded={expanded}
        >
          {expanded ? 'Collapse ↑' : 'Go deeper ↓'}
        </button>
      </div>

      {/* Expanded content — CSS grid row animation, no layout shift */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: expanded ? '1fr' : '0fr',
          transition: 'grid-template-rows 150ms ease',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div style={{ paddingTop: '24px' }}>

            {/* Three-lens grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ marginBottom: '24px' }}>
              {LENSES.map(({ key, label, field }) => {
                const isActive = userRole === key
                return (
                  <div
                    key={key}
                    style={{
                      border: `1px solid ${isActive ? 'var(--text-secondary)' : 'var(--border)'}`,
                      borderRadius: '4px',
                      padding: '12px',
                    }}
                  >
                    <p
                      className="font-mono"
                      style={{
                        fontSize: '11px',
                        fontWeight: isActive ? 600 : 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: 'var(--text-secondary)',
                        marginBottom: '8px',
                      }}
                    >
                      {label}
                    </p>
                    <p
                      className="font-sans"
                      style={{
                        fontSize: '15px',
                        lineHeight: 1.6,
                        color: 'var(--text-primary)',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {story[field] ?? ''}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* The deeper read */}
            {story.deeper_read && (
              <div style={{ marginBottom: '24px' }}>
                <p
                  className="font-mono"
                  style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--text-secondary)',
                    marginBottom: '8px',
                  }}
                >
                  The deeper read
                </p>
                <p
                  className="font-serif"
                  style={{
                    fontSize: '15px',
                    lineHeight: 1.7,
                    fontStyle: 'italic',
                    color: 'var(--text-primary)',
                  }}
                >
                  {story.deeper_read}
                </p>
              </div>
            )}

            {/* Sources */}
            {sources.length > 0 && (
              <div>
                <p
                  className="font-mono"
                  style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--text-secondary)',
                    marginBottom: '8px',
                  }}
                >
                  Sources
                </p>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  {sources.map((source, i) => (
                    <a
                      key={i}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono"
                      style={{
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      {source.label} ↗
                    </a>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </article>
  )
}
