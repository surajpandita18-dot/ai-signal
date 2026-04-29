'use client'

import { useState } from 'react'
import type { Story, SubscriberRole, StorySource } from '../../db/types/database'

interface StoryCardProps {
  story: Story
  userRole?: SubscriberRole
  publishedAt?: string
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  models:   { bg: 'var(--signal-soft)',  text: 'var(--signal-deep)' },
  tools:    { bg: 'var(--warm-soft)',    text: 'var(--warm)' },
  business: { bg: 'var(--money-soft)',   text: 'var(--money)' },
  policy:   { bg: 'var(--water-soft)',   text: 'var(--water)' },
  research: { bg: 'var(--energy-soft)', text: 'var(--energy)' },
}

const LENSES = [
  { key: 'pm' as SubscriberRole,      label: 'For PMs',      field: 'lens_pm' as const },
  { key: 'founder' as SubscriberRole, label: 'For Founders', field: 'lens_founder' as const },
  { key: 'builder' as SubscriberRole, label: 'For Builders', field: 'lens_builder' as const },
]

function getExpiryText(publishedAt: string): string {
  const expires = new Date(new Date(publishedAt).getTime() + 24 * 60 * 60 * 1000)
  const diff = expires.getTime() - Date.now()
  if (diff <= 0) return ''
  const h = Math.floor(diff / (1000 * 60 * 60))
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${h}h ${m}m left`
}

export function StoryCard({ story, userRole, publishedAt }: StoryCardProps) {
  const [hoveredSource, setHoveredSource] = useState<number | null>(null)

  const sources: StorySource[] = Array.isArray(story.sources) ? (story.sources as StorySource[]) : []
  const catStyle = CATEGORY_STYLES[story.category] ?? CATEGORY_STYLES.models
  const expiryText = publishedAt ? getExpiryText(publishedAt) : ''

  const hasLenses = story.lens_pm || story.lens_founder || story.lens_builder

  return (
    <article
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '48px',
        boxShadow:
          '0 1px 2px rgba(0,0,0,0.02), 0 4px 8px rgba(0,0,0,0.03), 0 16px 32px rgba(0,0,0,0.04)',
        position: 'relative',
      }}
    >
      {/* Meta row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            background: catStyle.bg,
            color: catStyle.text,
            padding: '5px 11px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            fontFamily: 'var(--ff-mono)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {story.category}
        </span>

        <span style={{ color: 'var(--text-faint)', fontSize: '14px' }}>·</span>

        <span
          style={{
            fontFamily: 'var(--ff-mono)',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-mute)',
          }}
        >
          {story.read_minutes ? `${story.read_minutes} min read` : '5 min read'}
        </span>

        {expiryText && (
          <>
            <span style={{ color: 'var(--text-faint)', fontSize: '14px' }}>·</span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--warm-soft)',
                border: '1px solid rgba(255, 107, 53, 0.25)',
                padding: '5px 11px',
                borderRadius: '6px',
                fontFamily: 'var(--ff-mono)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--warm)',
              }}
            >
              {expiryText}
            </span>
          </>
        )}
      </div>

      {/* Headline */}
      <h1
        style={{
          fontFamily: 'var(--ff-display)',
          fontSize: 'clamp(34px, 4.6vw, 52px)',
          lineHeight: 1.06,
          letterSpacing: '-0.025em',
          fontWeight: 400,
          color: 'var(--text)',
          margin: 0,
        }}
      >
        {story.headline}
      </h1>

      {/* Summary */}
      <p
        style={{
          fontSize: '19px',
          lineHeight: 1.55,
          color: 'var(--text-soft)',
          margin: '28px 0 32px',
          fontFamily: 'var(--ff-body)',
        }}
      >
        {story.summary}
      </p>

      {/* Why it matters — Signal block */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--signal-faint), var(--bg-card))',
          border: '1px solid var(--signal-soft)',
          borderLeft: '4px solid var(--signal)',
          borderRadius: '14px',
          padding: '24px 28px',
          marginBottom: '40px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--ff-mono)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--signal)',
            marginBottom: '10px',
          }}
        >
          Why it matters
        </div>
        <p
          style={{
            fontSize: '17px',
            lineHeight: 1.6,
            color: 'var(--text)',
            fontFamily: 'var(--ff-body)',
          }}
        >
          {story.why_it_matters}
        </p>
      </div>

      {/* Three-lens perspective grid */}
      {hasLenses && (
        <div style={{ marginBottom: '40px' }}>
          <div
            style={{
              fontFamily: 'var(--ff-mono)',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              color: 'var(--text-mute)',
              marginBottom: '16px',
            }}
          >
            Role perspective
          </div>
          <div
            className="grid grid-cols-1 sm:grid-cols-3"
            style={{ gap: '12px' }}
          >
            {LENSES.map(({ key, label, field }) => {
              const content = story[field]
              if (!content) return null
              const isActive = userRole === key
              return (
                <div
                  key={key}
                  style={{
                    background: isActive ? 'var(--signal-faint)' : 'var(--bg-soft)',
                    border: `1px solid ${isActive ? 'var(--signal-soft)' : 'var(--border)'}`,
                    borderRadius: '12px',
                    padding: '20px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--ff-mono)',
                      fontSize: '10px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      color: isActive ? 'var(--signal)' : 'var(--text-mute)',
                      marginBottom: '8px',
                    }}
                  >
                    {label}
                  </div>
                  <p
                    style={{
                      fontSize: '15px',
                      lineHeight: 1.6,
                      color: 'var(--text-soft)',
                      fontFamily: 'var(--ff-body)',
                    }}
                  >
                    {content}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Editorial take — AI Signal voice */}
      {(story.editorial_take ?? story.pull_quote) && (
        <div
          style={{
            margin: '0 0 40px',
            padding: '28px 32px',
            background: 'var(--bg-soft)',
            borderRadius: '14px',
            position: 'relative',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '14px',
              left: '18px',
              fontFamily: 'var(--ff-display)',
              fontStyle: 'italic',
              fontSize: '56px',
              color: 'var(--text-faint)',
              lineHeight: 0.9,
              opacity: 0.5,
              userSelect: 'none',
            }}
          >
            &ldquo;
          </div>
          <p
            style={{
              fontFamily: 'var(--ff-display)',
              fontSize: '24px',
              lineHeight: 1.3,
              fontWeight: 400,
              letterSpacing: '-0.012em',
              paddingLeft: '36px',
              color: 'var(--text)',
            }}
          >
            {story.editorial_take ?? story.pull_quote}
          </p>
        </div>
      )}

      {/* Read the original — primary source link */}
      {story.deeper_read && (
        <a
          href={story.deeper_read}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '16px 20px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            textDecoration: 'none',
            color: 'var(--text)',
            marginBottom: '40px',
            transition: 'border-color 0.2s, background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--signal)'
            e.currentTarget.style.background = 'var(--signal-faint)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.background = 'var(--bg-card)'
          }}
        >
          <div
            style={{
              width: '36px', height: '36px', borderRadius: '7px',
              background: 'var(--text)', color: 'var(--bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--ff-mono)', fontWeight: 800, fontSize: '14px', flexShrink: 0,
            }}
          >
            {(() => { try { return new URL(story.deeper_read).hostname.replace('www.', '').charAt(0).toUpperCase() } catch { return '→' } })()}
          </div>
          <div style={{ flex: 1, lineHeight: 1.3 }}>
            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', fontWeight: 600, color: 'var(--text-mute)', marginBottom: '2px', textTransform: 'lowercase' }}>
              {(() => { try { return new URL(story.deeper_read).hostname.replace('www.', '') } catch { return '' } })()}
            </div>
            <div style={{ fontSize: '15px', fontWeight: 500 }}>Read the original</div>
          </div>
          <span style={{ color: 'var(--text-mute)', fontSize: '16px' }}>↗</span>
        </a>
      )}

      {/* Sources — stacked link cards */}
      {sources.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <div
            style={{
              fontFamily: 'var(--ff-mono)',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              color: 'var(--text-mute)',
              marginBottom: '14px',
            }}
          >
            Sources
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sources.map((source, i) => (
              <a
                key={i}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setHoveredSource(i)}
                onMouseLeave={() => setHoveredSource(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  background: hoveredSource === i ? 'var(--signal-faint)' : 'var(--bg-card)',
                  border: `1px solid ${hoveredSource === i ? 'var(--signal)' : 'var(--border)'}`,
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: 'var(--text)',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--ff-mono)',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: hoveredSource === i ? 'var(--signal)' : 'var(--text)',
                    transition: 'color 0.2s',
                  }}
                >
                  {source.label}
                </span>
                <span
                  style={{
                    color: hoveredSource === i ? 'var(--signal)' : 'var(--text-mute)',
                    fontSize: '16px',
                    transition: 'color 0.2s',
                  }}
                >
                  ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}
