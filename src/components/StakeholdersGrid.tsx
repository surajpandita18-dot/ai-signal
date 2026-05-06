import type { StakeholdersData } from '@/lib/types/extended-data'

const CELL_LABELS: Record<string, string> = {
  win:             '↑ Win',
  lose:            '↓ Lose',
  evidence_strong: 'Strong',
  evidence_weak:   'Weak',
  open_question:   '?',
  before:          'Before',
  after:           'After',
}

interface StakeholdersGridProps {
  data: StakeholdersData
}

export function StakeholdersGrid({ data }: StakeholdersGridProps) {
  if (data.cells.length === 0) return null

  return (
    <div className="stakeholder-grid">
      <div className="stakeholder-title">{data.title}</div>
      <h4 className="stakeholder-subtitle">{data.subtitle}</h4>
      <div className="stakeholder-matrix">
        {data.cells.map((cell, i) => (
          <div key={i} className={`stakeholder-cell ${cell.type}`}>
            <span className="stakeholder-cell-label">{CELL_LABELS[cell.type] ?? cell.type}</span>
            <div className="stakeholder-who">{cell.who}</div>
            <div
              className="stakeholder-why"
              dangerouslySetInnerHTML={{ __html: cell.why.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
