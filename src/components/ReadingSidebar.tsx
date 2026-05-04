'use client'

import { SidebarScoreCard } from './SidebarScoreCard'
import { SidebarProbablyCard } from './SidebarProbablyCard'

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
}

export function ReadingSidebar({ readPct, teasers }: ReadingSidebarProps) {
  const envelopes = teasers ?? []

  return (
    <aside className="sidebar">
      <SidebarScoreCard readPct={readPct} />
      <SidebarProbablyCard teasers={envelopes} />
    </aside>
  )
}
