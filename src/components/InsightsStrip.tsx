import React from 'react'
import type { InsightCell } from '@/lib/types/extended-data'

interface InsightsStripProps {
  cells: InsightCell[]
}

function parseHighlight(text: string): React.ReactNode {
  if (!text.includes('==')) return text
  return text.split(/(==.*?==)/g).map((part, i) =>
    part.startsWith('==') && part.endsWith('==')
      ? <span key={i} className="highlight">{part.slice(2, -2)}</span>
      : part
  )
}

export function InsightsStrip({ cells }: InsightsStripProps) {
  if (cells.length === 0) return null

  return (
    <div className="insights-strip">
      {cells.map((cell, i) => (
        <div key={i} className="insight-cell">
          <div className="insight-icon">{cell.icon}</div>
          <div className="insight-label">{cell.label}</div>
          <div className="insight-text">{parseHighlight(cell.text)}</div>
        </div>
      ))}
    </div>
  )
}
