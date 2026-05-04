import React from 'react'
import Link from 'next/link'

export interface ArchiveIssue {
  id: string
  issue_number: number
  slug: string
  published_at: string | null
  teaser: string | null
  headline: string | null
  category: string | null
}

const ARCHIVE_CAT_CLASS: Record<string, string> = {
  models:         'archive-cat-infra',
  infrastructure: 'archive-cat-infra',
  tools:          'archive-cat-reg',
  regulation:     'archive-cat-reg',
  policy:         'archive-cat-policy',
  talent:         'archive-cat-talent',
  business:       'archive-cat-business',
  research:       'archive-cat-research',
  product:        'archive-cat-product',
}

interface ArchiveSectionProps {
  issues?: ArchiveIssue[]
}

function formatPublishedAt(published_at: string | null): string {
  if (!published_at) return ''
  return new Date(published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
}

export function ArchiveSection({ issues }: ArchiveSectionProps) {
  const displayIssues = issues ?? []
  return (
    <section id="archive" className="archive">
      {/* Header */}
      <div className="archive-header">
        <div>
          <h2 className="archive-title">
            Past <em className="ital">transmissions</em>
          </h2>
          <p className="archive-subtitle">
            The full archive — including expired signals and bonus dispatches — opens up{' '}
            <em>when you subscribe</em>.
          </p>
        </div>
        <a href="/archive" className="archive-link">
          View full archive →
        </a>
      </div>

      {/* Cards grid */}
      <div className="archive-cards">
        {displayIssues.map((issue) => (
          <Link
            key={issue.id}
            href="/archive"
            className="archive-card-link"
          >
            <article className="archive-card anim d2">
              <div className="archive-card-meta">
                {issue.category && (
                  <span className={`archive-cat ${ARCHIVE_CAT_CLASS[issue.category.toLowerCase()] ?? 'archive-cat-infra'}`}>
                    {issue.category.toUpperCase()}
                  </span>
                )}
                <span className="archive-day">{formatPublishedAt(issue.published_at)}</span>
              </div>

              <h3 className="archive-card-title">
                {issue.headline ?? `Signal #${issue.issue_number}`}
              </h3>

              {issue.teaser && (
                <p className="archive-card-teaser">{issue.teaser}</p>
              )}

              <div className="archive-card-foot">
                <span className="expired-tag">Subscriber archive</span>
                <span>Read →</span>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  )
}
