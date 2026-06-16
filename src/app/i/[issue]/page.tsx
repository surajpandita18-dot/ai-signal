import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { IssueContent } from '@/lib/content-model'
import type { Database } from '../../../../db/types/database'

type IssueRow = Database['public']['Tables']['issues']['Row']

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aibasically-eta.vercel.app'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ issue: string }>
}): Promise<Metadata> {
  const { issue } = await params
  const ogUrl = `${SITE_URL}/og/${issue}`
  const url = `${SITE_URL}/i/${issue}`
  return {
    title: `AI, Basically. — Issue ${issue}`,
    openGraph: {
      title: `AI, Basically. — Issue ${issue}`,
      description: 'Explained like a normal person would.',
      url,
      siteName: 'AI, Basically.',
      images: [{ url: ogUrl, width: 1200, height: 630 }],
      locale: 'en_IN',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `AI, Basically. — Issue ${issue}`,
      description: 'Explained like a normal person would.',
      images: [ogUrl],
    },
  }
}

import Masthead from '@/components/issue/Masthead'
import Hero from '@/components/issue/Hero'
import Section from '@/components/issue/Section'
import Foot from '@/components/issue/Foot'
import ReadingProgress from '@/components/issue/ReadingProgress'
import SectionPilot from '@/components/interactive/SectionPilot'

import OneThing from '@/components/sections/OneThing'
import SoWhat from '@/components/sections/SoWhat'
import BuildNotes from '@/components/sections/BuildNotes'
import JobSignal from '@/components/sections/JobSignal'
import UnderTheHood from '@/components/sections/UnderTheHood'
import TheRep from '@/components/sections/TheRep'
import Toolbox from '@/components/sections/Toolbox'
import RealityCheck from '@/components/sections/RealityCheck'
import IndiaSignal from '@/components/sections/IndiaSignal'
import Sponsor from '@/components/sections/Sponsor'
import Decoder from '@/components/sections/Decoder'
import Closer from '@/components/sections/Closer'
import Referral from '@/components/sections/Referral'
import Poll from '@/components/sections/Poll'

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ issue: string }>
  searchParams: Promise<{ preview?: string }>
}) {
  const { issue } = await params
  const { preview } = await searchParams

  let content: IssueRow | null = null

  if (preview === '1' || process.env.AIB_PREVIEW_FROM_JSON === '1') {
    // QA path: read the seed JSON directly. Used before the Supabase
    // migration is applied. Once published_at + status='published' rows
    // exist, drop the ?preview=1 query param to go through Supabase.
    // The DB-only fields are synthesized as empty strings; the poll API
    // rejects empty issue_id with 400 (PollClient swallows the error), so
    // preview-mode poll clicks are a correct no-op pre-publish.
    try {
      const file = path.join(process.cwd(), 'content/issues', `${issue}.json`)
      const raw = await readFile(file, 'utf8')
      const parsed = JSON.parse(raw) as IssueContent
      content = {
        ...parsed,
        id: '',
        created_at: '',
        updated_at: '',
        decoder: parsed.decoder ?? null,
      }
    } catch {
      notFound()
    }
  } else {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .eq('slug', issue)
      .eq('status', 'published')
      .single()
    if (error || !data) notFound()
    content = data
  }

  if (!content) notFound()

  // JSON fallback for fields that may not yet exist on the DB row.
  // - decoder: column doesn't exist on the live table yet (single ALTER TABLE
  //   pending; see supabase/migrations/20260612000001_add_decoder.sql)
  // - tldr.target: rows seeded before the navigator shipped don't carry per-
  //   row anchor targets; the JSON has them now.
  // - job_signal.interview deep fields (framework_name, counters, traps,
  //   sample_answer_html, etc.): rows seeded before the prep-brief rubric
  //   was authored only carry the teaser shape. The JobSignal teaser uses
  //   framework_name, and /interviews/<slug> needs all the deep fields.
  // Once an ops step copies the JSON into the DB row, this becomes a no-op.
  const decoderMissing = !content.decoder
  const tldrTargetsMissing =
    Array.isArray(content.tldr) &&
    content.tldr.length > 0 &&
    !content.tldr.some((r) => r.target)
  const interview = content.job_signal?.interview as
    | (typeof content.job_signal.interview & {
        framework_name?: string
        counters?: unknown[]
      })
    | undefined
  const interviewBriefMissing =
    !!interview && !interview.framework_name && !interview.counters?.length
  if (decoderMissing || tldrTargetsMissing || interviewBriefMissing) {
    try {
      const file = path.join(process.cwd(), 'content/issues', `${issue}.json`)
      const seed = JSON.parse(await readFile(file, 'utf8')) as IssueContent
      const patch: Partial<IssueRow> = {}
      if (decoderMissing && seed.decoder) patch.decoder = seed.decoder
      if (tldrTargetsMissing && seed.tldr?.some((r) => r.target)) {
        patch.tldr = seed.tldr
      }
      if (interviewBriefMissing && seed.job_signal?.interview) {
        const seedInterview = seed.job_signal.interview as typeof seed.job_signal.interview & {
          framework_name?: string
          counters?: unknown[]
        }
        if (seedInterview.framework_name || seedInterview.counters?.length) {
          patch.job_signal = {
            ...content.job_signal,
            interview: seed.job_signal.interview,
          }
        }
      }
      if (Object.keys(patch).length > 0) {
        content = { ...content, ...patch }
      }
    } catch {
      /* no seed = no patch; components handle missing fields gracefully */
    }
  }

  return (
    <main className="issue">
      <div className="grid">
        <Masthead
          issueNumber={content.issue_number}
          dateDisplay={content.date_display}
          readTimeMin={content.read_time_min}
          streakCaption={content.streak_caption}
        />
        <Hero
          eyebrow={content.hero_eyebrow}
          headlineHtml={content.hero_headline_html}
          subHtml={content.hero_sub_html}
          tldr={content.tldr}
        />
        <Section
          n="01"
          label="The One Thing"
          hint="The one development that actually matters this week."
          deep
        >
          <OneThing {...content.one_thing} />
        </Section>
        <Section
          n="02"
          label="So What For Me?"
          hint="Same news, your angle. Pick your track above — the deep lens rotates each week."
        >
          <SoWhat {...content.so_what} />
        </Section>
      </div>

      <BuildNotes {...content.build_notes} />

      <div className="grid">
        <Section
          n="03"
          label="Job Signal"
          hint="Where the jobs are, the money's going, and what they'll ask you."
        >
          <JobSignal {...content.job_signal} issueSlug={issue} />
        </Section>
        <Section
          n="04"
          label="Under the Hood"
          hint="One AI concept, taken apart in plain English."
          deep
        >
          <UnderTheHood {...content.under_the_hood} />
        </Section>
        <Section
          n="05"
          label="The Rep"
          hint="Do it, or just read it — both pay off. Rep type rotates weekly."
        >
          <TheRep {...content.the_rep} />
        </Section>
        <Section
          n="06"
          label="Toolbox"
          hint="One productivity move. Any job, any role."
        >
          <Toolbox data={content.toolbox} />
        </Section>
        <Section
          n="07"
          label="Reality Check"
          hint="The honest bit. AI's real costs — no doom, no denial."
          deep
        >
          <RealityCheck {...content.reality_check} />
        </Section>
        <Section
          n="08"
          label="India Signal"
          hint="India-only. Geography & sector rotate each issue — not just metro-fintech."
        >
          <IndiaSignal {...content.india_signal} />
        </Section>
        <Sponsor data={content.sponsor} />
        <Decoder data={content.decoder ?? null} />
      </div>

      <Closer {...content.closer} />
      <Referral />
      <Poll issueId={content.id} {...content.poll} />
      <Foot
        replyPrompt={content.foot.reply_prompt}
        nextIssue={content.foot.next_issue}
      />
      <ReadingProgress />
      <SectionPilot />
    </main>
  )
}
