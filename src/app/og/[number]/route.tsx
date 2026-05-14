import { ImageResponse } from 'next/og'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

const CATEGORY_COLOR: Record<string, string> = {
  models:   '#a78bfa',
  tools:    '#4ade80',
  business: '#fb923c',
  policy:   '#f59e0b',
  research: '#60a5fa',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ number: string }> }
) {
  const { number } = await params
  const n = parseInt(number, 10)

  let headline = 'AI Signal'
  let category = ''
  let issueNumber = n
  let dateStr = ''

  if (!isNaN(n)) {
    try {
      const sb = createAdminSupabaseClient()
      const { data: issue } = await sb
        .from('issues')
        .select('id, issue_number, published_at')
        .eq('issue_number', n)
        .eq('status', 'published')
        .maybeSingle()

      if (issue) {
        const { data: story } = await sb
          .from('stories')
          .select('headline, category')
          .eq('issue_id', issue.id)
          .limit(1)
          .maybeSingle()

        if (story) {
          headline = story.headline ?? headline
          category = story.category ?? ''
        }
        issueNumber = issue.issue_number
        dateStr = issue.published_at ? formatDate(issue.published_at) : ''
      }
    } catch {
      // fall through to default values
    }
  }

  const accent = CATEGORY_COLOR[category] ?? '#94a3b8'

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '1200px',
          height: '630px',
          backgroundColor: '#0a0a0a',
          padding: '60px 72px',
          position: 'relative',
        }}
      >
        {/* Dot-grid overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1.5px, transparent 1.5px)',
            backgroundSize: '28px 28px',
            display: 'flex',
          }}
        />

        {/* Left accent bar */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '4px',
            backgroundColor: accent,
            display: 'flex',
          }}
        />

        {/* Category badge */}
        {category ? (
          <div style={{ display: 'flex', marginBottom: '32px' }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: accent,
                border: `1.5px solid ${accent}`,
                padding: '5px 14px',
                borderRadius: '4px',
              }}
            >
              {category}
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', marginBottom: '32px', height: '28px' }} />
        )}

        {/* Headline */}
        <div style={{ display: 'flex', flex: 1, alignItems: 'center' }}>
          <div
            style={{
              fontFamily: 'serif',
              fontSize: headline.length > 90 ? '48px' : headline.length > 60 ? '56px' : '64px',
              fontWeight: 400,
              color: '#ffffff',
              lineHeight: 1.2,
              maxWidth: '1000px',
            }}
          >
            {headline}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginTop: '40px',
          }}
        >
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '14px',
              color: 'rgba(255,255,255,0.35)',
              letterSpacing: '0.06em',
            }}
          >
            {`Signal #${issueNumber}${dateStr ? ` · ${dateStr}` : ''}`}
          </span>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '15px',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.45)',
              letterSpacing: '0.28em',
            }}
          >
            AI SIGNAL
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
