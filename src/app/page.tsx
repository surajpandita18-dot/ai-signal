import { createServerSupabaseClient } from '@/lib/supabase-server'
import { IssueHeader } from '@/components/IssueHeader'
import { StoryCard } from '@/components/StoryCard'
import { LongRead } from '@/components/LongRead'
import type { LongRead as LongReadType, Story } from '../../db/types/database'

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()

  const { data: issue } = await supabase
    .from('issues')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(1)
    .single()

  if (!issue) {
    return (
      <main style={{ backgroundColor: 'var(--background)', minHeight: '100vh', padding: '48px 24px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <p className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            First issue coming soon.
          </p>
        </div>
      </main>
    )
  }

  const { data: storiesData } = await supabase
    .from('stories')
    .select('*')
    .eq('issue_id', issue.id)
    .order('position', { ascending: true })

  const stories = (storiesData ?? []) as Story[]
  const longRead = issue.long_read as LongReadType | null

  return (
    <main style={{ backgroundColor: 'var(--background)', minHeight: '100vh', padding: '48px 24px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <p
          className="font-mono"
          style={{
            fontSize: '11px',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-muted)',
            marginBottom: '32px',
          }}
        >
          AI Signal · Issue #{issue.issue_number}
        </p>

        <IssueHeader
          issueNumber={issue.issue_number}
          publishedAt={issue.published_at!}
          editorNote={issue.editor_note ?? ''}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} position={story.position} />
          ))}
        </div>

        {longRead && <LongRead longRead={longRead} />}
      </div>
    </main>
  )
}
