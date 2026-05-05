import type { InsightCell } from '@/lib/types/extended-data'

interface InsightsStripProps {
  cells: InsightCell[]
}

export function InsightsStrip({ cells }: InsightsStripProps) {
  if (cells.length === 0) return null

  return (
    <div className="insights-strip">
      {cells.map((cell, i) => (
        <div key={i} className="insight-cell">
          <div className="insight-icon">{cell.icon}</div>
          <div className="insight-label">{cell.label}</div>
          <div className="insight-text">{cell.text}</div>
        </div>
      ))}
    </div>
  )
}
