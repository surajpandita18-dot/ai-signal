import type { DecisionAid as DecisionAidData } from '@/lib/types/extended-data'

interface DecisionAidProps {
  aid: DecisionAidData
}

export function DecisionAid({ aid }: DecisionAidProps) {
  if (aid.rows.length === 0) return null

  return (
    <div className="decision-aid">
      <div className="decision-title">{aid.title}</div>
      <h4 className="decision-question">{aid.question}</h4>
      <div className="decision-flow">
        {aid.rows.map((row, i) => (
          <div key={i} className="decision-row">
            <div className="decision-q">
              <span className="q-num">{row.q_num}</span>
              {row.question}
            </div>
            <span className={`decision-pill ${row.verdict}`}>{row.verdict_text}</span>
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
