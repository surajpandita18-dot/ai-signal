import type { Reaction } from '@/lib/types/extended-data'

interface ReactionsPanelProps {
  reactions: Reaction[]
}

export function ReactionsPanel({ reactions }: ReactionsPanelProps) {
  if (reactions.length === 0) return null

  return (
    <div className="reaction-grid">
      {reactions.map((r, i) => (
        <div key={i} className="reaction-card">
          <p className="reaction-quote">&ldquo;{r.quote}&rdquo;</p>
          <div className="reaction-attr">
            <div className="reaction-avatar" />
            <div className="reaction-meta">
              <div className="reaction-name">{r.name}</div>
              <div className="reaction-role">{r.role}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
