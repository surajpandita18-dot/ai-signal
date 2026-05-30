'use client'

import { useState } from 'react'
import { StoryArticle } from './StoryArticle'
import { ReadingSidebar } from './ReadingSidebar'
import type { Database } from '../../db/types/database'

type StoryRow = Database['public']['Tables']['stories']['Row']
type IssueRow = Database['public']['Tables']['issues']['Row']

type Story = StoryRow & {
  stats?: Array<{ label: string; value: string; delta: string | null; detail: string }> | null
  action_items?: string[] | null
  counter_view?: string | null
  counter_view_headline?: string | null
}

interface SignalPageClientProps {
  story: Story | null
  issue: IssueRow
  signalNumber: number
}

export function SignalPageClient({ story, issue, signalNumber }: SignalPageClientProps) {
  const [readPct, setReadPct] = useState(0)

  if (!story) {
    return (
      <main className="page-fallback" style={{ margin: '64px auto 80px', fontFamily: 'var(--ff-mono)', fontSize: 11, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Signal loading…
      </main>
    )
  }

  return (
    <>
      <main className="signal-layout">
        {/* Article */}
        <div>
          <StoryArticle
            story={story}
            publishedAt={issue.published_at ?? new Date().toISOString()}
            signalNumber={signalNumber}
            onReadPctChange={setReadPct}
          />
        </div>

        {/* Sidebar */}
        <div className="signal-sidebar">
          <ReadingSidebar readPct={readPct} signalNumber={signalNumber} />
        </div>
      </main>
    </>
  )
}
