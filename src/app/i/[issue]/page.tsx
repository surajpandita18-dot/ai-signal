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
import Closer from '@/components/sections/Closer'
import Referral from '@/components/sections/Referral'
import Poll from '@/components/sections/Poll'

export default async function Page({
  params,
}: {
  params: Promise<{ issue: string }>
}) {
  const { issue } = await params
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .eq('slug', issue)
    .eq('status', 'published')
    .single()

  if (error || !data) notFound()

  // db/types/database.ts isn't ready yet — assert at the fetch boundary.
  const content = data as unknown as IssueContent

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
