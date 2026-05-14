import Link from 'next/link'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Archive',
  description: 'Every signal, in order. The complete AI Signal archive.',
}

const CATEGORY_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  models:   { bg: 'var(--signal-soft)',  text: 'var(--signal-deep)', border: 'var(--signal)'  },
  tools:    { bg: 'var(--warm-soft)',    text: 'var(--warm)',        border: 'var(--warm)'    },
  business: { bg: 'var(--money-soft)',   text: 'var(--money)',       border: 'var(--money)'   },
  policy:   { bg: '#FEF3C7',            text: '#B45309',            border: '#D97706'        },
  research: { bg: '#DBEAFE',            text: '#1D4ED8',            border: '#2563EB'        },
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function stripMd(s: string): string {
  return s.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')
}

type ArchiveEntry = {
  issue_number: number
  published_at: string | null
  stories: { headline: string; summary: string; category: string }[]
}

async function fetchArchive(): Promise<ArchiveEntry[]> {
  const sb = createAdminSupabaseClient()
  const { data } = await sb
    .from('issues')
    .select('issue_number, published_at, stories(headline, summary, category)')
    .eq('status', 'published')
    .order('issue_number', { ascending: false })
  return ((data ?? []) as ArchiveEntry[]).filter(r => r.stories.length > 0)
}

export default async function ArchivePage() {
  const issues = await fetchArchive()
  const [hero, ...rest] = issues

  if (!hero) {
    return (
      <>
        <SiteNav />
        <main style={{ maxWidth: 720, margin: '80px auto 80px', padding: '0 32px' }}>
          <p style={{ fontFamily: 'var(--ff-mono)', fontSize: 13, color: 'var(--text-mute)' }}>
            No signals yet.
          </p>
        </main>
        <SiteFooter />
      </>
    )
  }

  const heroStory = hero.stories[0]
  const heroCat = CATEGORY_STYLE[heroStory.category] ?? CATEGORY_STYLE.models
  const heroExcerpt = stripMd(heroStory.summary).slice(0, 160)

  return (
    <>
      <SiteNav />
      <style>{`
        .archive-row {
          display: block;
          text-decoration: none;
          color: inherit;
          border-top: 1px solid var(--border);
          padding: 20px 0;
          transition: transform 0.15s ease;
        }
        .archive-row:hover { transform: translateX(4px); }
        .archive-row:hover .archive-hl { text-decoration: underline; text-underline-offset: 3px; text-decoration-color: var(--border-mid); }
        .archive-hero { transition: box-shadow 0.15s ease; }
        .archive-hero:hover { box-shadow: 0 4px 24px rgba(0,0,0,0.07); }
      `}</style>

      <main style={{ maxWidth: 720, margin: '80px auto 80px', padding: '0 32px' }}>

        {/* Page title */}
        <h1 style={{
          fontFamily: 'var(--ff-display)',
          fontSize: 'clamp(36px, 5vw, 52px)',
          fontWeight: 400,
          lineHeight: 1.05,
          letterSpacing: '-0.025em',
          marginBottom: 8,
        }}>
          Past <em style={{ fontStyle: 'italic', color: 'var(--signal)' }}>transmissions</em>
        </h1>
        <p style={{
          fontFamily: 'var(--ff-mono)',
          fontSize: 12,
          color: 'var(--text-faint)',
          letterSpacing: '0.05em',
          marginBottom: 40,
        }}>
          {issues.length} signal{issues.length !== 1 ? 's' : ''} in the archive
        </p>

        {/* Hero card — latest signal */}
        <Link href={`/signal/${hero.issue_number}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div
            className="archive-hero"
            style={{
              border: '1px solid var(--border)',
              borderLeft: `4px solid ${heroCat.border}`,
              borderRadius: 4,
              padding: '28px 32px',
              background: 'var(--bg-card)',
              marginBottom: 48,
            }}
          >
            {/* Top: badge + issue number */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <span style={{
                fontFamily: 'var(--ff-mono)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase' as const,
                color: heroCat.text,
                background: heroCat.bg,
                padding: '3px 10px',
                borderRadius: 3,
              }}>
                {heroStory.category}
              </span>
              <span style={{
                fontFamily: 'var(--ff-mono)',
                fontSize: 12,
                color: 'var(--text-faint)',
                letterSpacing: '0.06em',
              }}>
                Signal #{hero.issue_number}
              </span>
            </div>

            {/* Headline */}
            <h2 style={{
              fontFamily: 'var(--ff-display)',
              fontSize: 'clamp(26px, 4vw, 36px)',
              fontWeight: 400,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              color: 'var(--text)',
              marginBottom: 14,
            }}>
              {heroStory.headline}
            </h2>

            {/* Summary excerpt */}
            <p style={{
              fontSize: 15,
              lineHeight: 1.65,
              color: 'var(--text-mute)',
              marginBottom: 24,
            }}>
              {heroExcerpt}{heroExcerpt.length === 160 ? '…' : ''}
            </p>

            {/* Bottom: date + read link */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                fontFamily: 'var(--ff-mono)',
                fontSize: 12,
                color: 'var(--text-faint)',
                letterSpacing: '0.05em',
              }}>
                {hero.published_at ? formatDate(hero.published_at) : ''}
              </span>
              <span style={{
                fontFamily: 'var(--ff-mono)',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--signal)',
                letterSpacing: '0.03em',
              }}>
                Read signal →
              </span>
            </div>
          </div>
        </Link>

        {/* Past signals list */}
        {rest.length > 0 && (
          <div>
            {rest.map((issue) => {
              const story = issue.stories[0]
              const cat = CATEGORY_STYLE[story.category] ?? CATEGORY_STYLE.models
              return (
                <Link
                  key={issue.issue_number}
                  href={`/signal/${issue.issue_number}`}
                  className="archive-row"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' as const }}>
                    <span style={{
                      fontFamily: 'var(--ff-mono)',
                      fontSize: 11,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase' as const,
                      color: 'var(--text-faint)',
                    }}>
                      Signal #{issue.issue_number}
                    </span>
                    <span style={{ color: 'var(--border-mid)', fontSize: 10, lineHeight: 1 }}>·</span>
                    <span style={{
                      fontFamily: 'var(--ff-mono)',
                      fontSize: 11,
                      color: 'var(--text-faint)',
                      letterSpacing: '0.04em',
                    }}>
                      {issue.published_at ? formatDate(issue.published_at) : ''}
                    </span>
                    <span style={{ color: 'var(--border-mid)', fontSize: 10, lineHeight: 1 }}>·</span>
                    <span style={{
                      fontFamily: 'var(--ff-mono)',
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase' as const,
                      color: cat.text,
                      background: cat.bg,
                      padding: '1px 6px',
                      borderRadius: 2,
                    }}>
                      {story.category}
                    </span>
                  </div>

                  <h3
                    className="archive-hl"
                    style={{
                      fontFamily: 'var(--ff-display)',
                      fontSize: 'clamp(18px, 2.5vw, 22px)',
                      fontWeight: 400,
                      lineHeight: 1.3,
                      letterSpacing: '-0.015em',
                      color: 'var(--text)',
                    }}
                  >
                    {story.headline}
                  </h3>
                </Link>
              )
            })}
            <div style={{ borderTop: '1px solid var(--border)' }} />
          </div>
        )}
      </main>

      <SiteFooter />
    </>
  )
}
