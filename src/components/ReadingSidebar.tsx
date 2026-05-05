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

  return (
    <aside className="sidebar">
      <SidebarScoreCard readPct={readPct} />
      <SidebarProbablyCard teasers={envelopes} drafts={drafts} />
    </aside>
  )
}
