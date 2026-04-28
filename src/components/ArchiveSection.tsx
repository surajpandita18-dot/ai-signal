import React from 'react'
import Link from 'next/link'

interface ArchiveItem {
  cat: string
  title: string
  daysBack: number
}

const ARCHIVE_ITEMS: ArchiveItem[] = [
  {
    cat: 'INFRASTRUCTURE',
    daysBack: 1,
    title: 'Anthropic ships agentic file system primitives — quietly redrawing the eval map',
  },
  {
    cat: 'REGULATION',
    daysBack: 2,
    title: 'EU AI Act enforcement begins. Three startups pulled out of the market overnight.',
  },
  {
    cat: 'TALENT',
    daysBack: 3,
    title:
      'The post-research generation: where the people who left the big labs landed in Q1',
  },
]

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
}

export function ArchiveSection() {
  return (
    <section
      style={{
        maxWidth: 1280,
        margin: '100px auto 0',
        padding: '80px 32px 0',
        borderTop: '1px solid var(--border)',
      }}
    >
      <style>{`
        .archive-card-link:hover article {
          transform: translateY(-3px);
          border-color: var(--border-mid);
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
        }
        .archive-card-link article {
          position: relative;
          overflow: hidden;
          transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
        }
        .archive-card-link article::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: var(--signal);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .archive-card-link:hover article::after {
          transform: scaleX(1);
        }
        @media (max-width: 880px) {
          .archive-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 36,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: 'var(--ff-display)',
              fontSize: 44,
              lineHeight: 1,
              fontWeight: 400,
              letterSpacing: '-0.025em',
            }}
          >
            Past{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--signal)' }}>transmissions</em>
          </h2>
          <p
            style={{
              fontFamily: 'var(--ff-display)',
              fontSize: 16,
              lineHeight: 1.5,
              color: 'var(--text-mute)',
              marginTop: 10,
              maxWidth: 540,
              letterSpacing: '-0.005em',
            }}
          >
            The full archive — including expired signals and bonus dispatches — opens up{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--signal)' }}>when you subscribe</em>.
          </p>
        </div>
        <a
          href="/archive"
          style={{
            color: 'var(--text)',
            borderBottom: '1px solid var(--border-strong)',
            textDecoration: 'none',
            paddingBottom: 1,
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          View full archive →
        </a>
      </div>

      <div
        className="archive-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3,1fr)',
          gap: 20,
        }}
      >
        {ARCHIVE_ITEMS.map((item, i) => (
          <Link
            key={i}
            href="/archive"
            className="archive-card-link"
            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
          >
            <article
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: 28,
                cursor: 'pointer',
                minHeight: 240,
                display: 'flex',
                flexDirection: 'column',
              }}
              className="reveal"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <span
                  style={{
                    fontFamily: 'var(--ff-mono)',
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: 'var(--signal)',
                  }}
                >
                  {item.cat}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--ff-mono)',
                    fontSize: 11,
                    color: 'var(--text-mute)',
                  }}
                >
                  {daysAgo(item.daysBack)}
                </span>
              </div>
              <h3
                style={{
                  fontFamily: 'var(--ff-display)',
                  fontSize: 22,
                  lineHeight: 1.2,
                  fontWeight: 400,
                  flex: 1,
                  marginBottom: 18,
                  letterSpacing: '-0.015em',
                }}
              >
                {item.title}
              </h3>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 16,
                  borderTop: '1px solid var(--border)',
                  fontSize: 12,
                  color: 'var(--text-mute)',
                  fontWeight: 500,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      background: 'var(--text-faint)',
                      borderRadius: '50%',
                      display: 'inline-block',
                    }}
                  />
                  Subscriber archive
                </span>
                <span>Read →</span>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  )
}
