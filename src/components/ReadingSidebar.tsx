'use client'

import { SidebarScoreCard } from './SidebarScoreCard'
import { SidebarProbablyCard } from './SidebarProbablyCard'
import type { TomorrowDraft } from '@/lib/types/extended-data'

interface UpcomingTeaser {
  dayOfWeek: string
  date: string
  text: string
  status: 'lead' | 'sealed'
}

interface ReadingSidebarProps {
  readPct: number
  signalNumber: number
  teasers?: UpcomingTeaser[]
  drafts?: TomorrowDraft[]
}

export function ReadingSidebar({ readPct, teasers, drafts }: ReadingSidebarProps) {
  const envelopes = teasers ?? []

  const hasRealContent = (drafts && drafts.length > 0) || envelopes.length > 0

  return (
    <aside className="sidebar">
      <SidebarScoreCard readPct={readPct} />
      {hasRealContent && <SidebarProbablyCard teasers={envelopes} drafts={drafts} />}
    </aside>
  )
}
