import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { HomePageClient } from '@/components/HomePageClient'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { SignalExpired } from '@/components/SignalExpired'
import { SubscribeInput } from '@/components/SubscribeInput'
import { isWithin24h } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'AI Signal — One story. Every day. Gone in 24 hours.',
  description: 'One story. Every day. Gone in 24 hours. The single most important thing in AI, curated daily.',
  openGraph: {
    title: 'AI Signal — One story. Every day. Gone in 24 hours.',
    description: 'One story. Every day. Gone in 24 hours. The single most important thing in AI, curated daily.',
    url: 'https://aisignal.so',
    siteName: 'AI Signal',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Signal — One story. Every day. Gone in 24 hours.',
    description: 'One story. Every day. Gone in 24 hours.',
  },
}

export default async function HomePage() {
  // Dev mode — no Supabase credentials
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <>
        <SiteNav />
        <div style={{ maxWidth: 720, margin: '80px auto', padding: '0 32px' }}>
          <p style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, color: 'var(--text-mute)' }}>
            Dev mode — no Supabase credentials. Copy .env.local.example → .env.local.
          </p>
        </div>
        <SiteFooter />
      </>
    )
  }

  const supabase = await createServerSupabaseClient()

  const { data: issue } = await supabase
    .from('issues')
    .select('*')
    .in('status', ['published', 'no_signal'])
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // State C — no signal published yet
  if (!issue) {
    return (
      <>
        <SiteNav />
        <div style={{ maxWidth: 720, margin: '80px auto', padding: '0 32px' }}>
          <p
            style={{
              fontFamily: 'var(--ff-mono)',
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-mute)',
              marginBottom: 32,
            }}
          >
            First signal coming soon.
          </p>
          <SubscribeInput label="Be first when we launch." />
        </div>
        <SiteFooter />
      </>
    )
  }

  // State D — no_signal day
  if (issue.status === 'no_signal') {
    return (
      <>
        <SiteNav />
        <div style={{ maxWidth: 720, margin: '80px auto', padding: '0 32px' }}>
          <p
            style={{
              fontFamily: 'var(--ff-mono)',
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-mute)',
              marginBottom: 16,
            }}
          >
            No signal today.
          </p>
          {issue.editor_note && (
            <p style={{ fontSize: 15, lineHeight: 1.6 }}>{issue.editor_note}</p>
          )}
        </div>
        <SiteFooter />
      </>
    )
  }

  const active = issue.published_at ? isWithin24h(issue.published_at) : false

  // State B — signal expired
  if (!active) {
    const { data: storiesData } = await supabase
      .from('stories')
      .select('headline')
      .eq('issue_id', issue.id)
      .order('position', { ascending: true })
      .limit(1)

    const headline = storiesData && storiesData.length > 0 ? storiesData[0].headline : ''

    return (
      <>
        <SiteNav />
        <div style={{ maxWidth: 720, margin: '80px auto', padding: '0 32px' }}>
          <SignalExpired
            headline={headline}
            publishedAt={issue.published_at ?? new Date().toISOString()}
            signalNumber={issue.issue_number}
            tomorrowCategory={undefined}
          />
          <SubscribeInput label="Tomorrow's signal drops at 9 AM IST. Subscribe to be first." />
        </div>
        <SiteFooter />
      </>
    )
  }

  // State A — active signal
  const { data: storiesData } = await supabase
    .from('stories')
    .select('*')
    .eq('issue_id', issue.id)
    .order('position', { ascending: true })
    .limit(1)

  const story = storiesData && storiesData.length > 0 ? storiesData[0] : null

  if (!story) {
    return (
      <>
        <SiteNav signalNumber={issue.issue_number} />
        <div style={{ maxWidth: 720, margin: '80px auto', padding: '0 32px' }}>
          <p
            style={{
              fontFamily: 'var(--ff-mono)',
              fontSize: 11,
              color: 'var(--text-mute)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Signal loading…
          </p>
        </div>
        <SiteFooter />
      </>
    )
  }

  const broadcastPhrases = Array.isArray(story.broadcast_phrases) && story.broadcast_phrases.length === 3
    ? story.broadcast_phrases
    : undefined

  return (
    <HomePageClient
      story={story}
      publishedAt={issue.published_at ?? new Date().toISOString()}
      signalNumber={issue.issue_number}
      broadcastPhrases={broadcastPhrases}
    />
  )
}
