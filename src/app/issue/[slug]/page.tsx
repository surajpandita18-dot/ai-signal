import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { IssueHeader } from '@/components/IssueHeader'
import { StoryCard } from '@/components/StoryCard'
import { LongRead } from '@/components/LongRead'
import type { LongRead as LongReadType, Story } from '../../../../db/types/database'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function fetchIssue(slug: string) {
  const supabase = await createServerSupabaseClient()
  const { data: issue } = await supabase
    .from('issues')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  if (!issue) return null

  const { data: stories } = await supabase
    .from('stories')
    .select('*')
    .eq('issue_id', issue.id)
    .order('position', { ascending: true })

  return { issue, stories: stories ?? [] }
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const result = await fetchIssue(slug)
  if (!result) return { title: 'AI Signal' }

  const date = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(result.issue.published_at!))

  return { title: `AI Signal #${result.issue.issue_number} — ${date}` }
}

export default async function IssuePage({ params }: PageProps) {
  const { slug } = await params
  const result = await fetchIssue(slug)
  if (!result) notFound()

  const { issue, stories } = result
  const longRead = issue.long_read as LongReadType | null

  return (
    <>
      <SiteNav signalNumber={issue.issue_number} />
      <main style={{ maxWidth: 720, margin: '64px auto 80px', padding: '0 32px' }}>
        <IssueHeader
          issueNumber={issue.issue_number}
          publishedAt={issue.published_at!}
          editorNote={issue.editor_note ?? ''}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>

        {longRead && <LongRead longRead={longRead} />}
      </main>
      <SiteFooter />
    </>
  )
}
