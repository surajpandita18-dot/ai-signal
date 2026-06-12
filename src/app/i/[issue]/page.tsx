import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { IssueContent } from '@/lib/content-model'

import Masthead from '@/components/issue/Masthead'
import Hero from '@/components/issue/Hero'
import Section from '@/components/issue/Section'
import Foot from '@/components/issue/Foot'
import ReadingProgress from '@/components/issue/ReadingProgress'

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

  let content: (IssueContent & { id?: string }) | null = null

  if (preview === '1' || process.env.AIB_PREVIEW_FROM_JSON === '1') {
    // QA path: read the seed JSON directly. Used before the Supabase
    // migration is applied. Once published_at + status='published' rows
    // exist, drop the ?preview=1 query param to go through Supabase.
    try {
      const file = path.join(process.cwd(), 'content/issues', `${issue}.json`)
      const raw = await readFile(file, 'utf8')
      content = JSON.parse(raw) as IssueContent
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
    content = data as unknown as IssueContent & { id: string }
  }

  if (!content) notFound()

  // Decoder JSON fallback: until the issues table gets a `decoder jsonb` column
  // (single ALTER TABLE; see supabase/migrations/20260612000001_add_decoder.sql),
  // the DB row won't carry decoder content. Read it from the bundled JSON seed
  // instead. Once the column is added + populated, the DB row's value wins.
  if (!content.decoder) {
    try {
      const file = path.join(process.cwd(), 'content/issues', `${issue}.json`)
      const seed = JSON.parse(await readFile(file, 'utf8')) as IssueContent
      if (seed.decoder) content = { ...content, decoder: seed.decoder }
    } catch {
      /* no seed = no decoder; component handles null */
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
          <JobSignal {...content.job_signal} />
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
      <Poll issueId={(content as unknown as { id: string }).id} {...content.poll} />
      <Foot
        replyPrompt={content.foot.reply_prompt}
        nextIssue={content.foot.next_issue}
      />
      <ReadingProgress />
    </main>
  )
}
