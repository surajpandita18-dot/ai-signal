import type { DecisionAid as DecisionAidData } from '@/lib/types/extended-data'

const VERDICT_LABELS: Record<string, string> = {
  go:   'GO',
  wait: 'WAIT',
  no:   'NO',
}

interface DecisionAidProps {
  aid: DecisionAidData
}

export function DecisionAid({ aid }: DecisionAidProps) {
  if (aid.rows.length === 0) return null

  return (
    <div className="decision-aid">
      <div className="decision-title">Decision Aid</div>
      <h4 className="decision-question">{aid.title}</h4>
      <div className="decision-flow">
        {aid.rows.map((row, i) => (
          <div key={i} className="decision-row">
            <div className="decision-q-block">
              <div className="decision-q">
                <span className="q-num">{row.q_num}</span>
                {row.question}
              </div>
              {row.verdict_text && (
                <div className="decision-guidance">{row.verdict_text}</div>
              )}
            </div>
            <span className={`decision-pill ${row.verdict}`}>
              {VERDICT_LABELS[row.verdict] ?? row.verdict.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
      <div className="decision-verdict">
        <div className="decision-verdict-label">Verdict</div>
        <div className="decision-verdict-text">{aid.final_verdict}</div>
      </div>
    </div>
  )
}
