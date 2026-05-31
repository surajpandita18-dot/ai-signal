'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'ai-signal-streak'

function computeStreak(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return 1
    const { lastVisit, streak } = JSON.parse(raw) as { lastVisit: string; streak: number }
    const today = new Date().toISOString().split('T')[0]
    const diffMs = new Date(today).getTime() - new Date(lastVisit).getTime()
    const diffDays = Math.round(diffMs / 86400000)
    if (diffDays === 0) return streak
    if (diffDays === 1) return streak + 1
    return 1
  } catch { return 1 }
}

function saveStreak(streak: number) {
  try {
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lastVisit: today, streak }))
  } catch {}
}

export function ReadingStreak() {
  const [streak, setStreak] = useState<number | null>(null)

  useEffect(() => {
    const s = computeStreak()
    saveStreak(s)
    setStreak(s)
  }, [])

  if (!streak || streak < 2) return null

  return (
    <div className="reading-streak">
      <span className="reading-streak-fire">🔥</span>
      <span className="reading-streak-label">Day {streak} in a row</span>
    </div>
  )
}
