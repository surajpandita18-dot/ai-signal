import React from 'react'
import type { Reaction } from '@/lib/types/extended-data'

function parseBold(text: string): React.ReactNode {
  if (!text.includes('**')) return text
  return text.split(/(\*\*.*?\*\*)/g).map((p, i) =>
    p.startsWith('**') && p.endsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : p
  )
}

interface ReactionsPanelProps {
  reactions: Reaction[]
}

export function ReactionsPanel({ reactions }: ReactionsPanelProps) {
  if (reactions.length === 0) return null

  return (
    <div className="reaction-grid">
      {reactions.map((r, i) => (
        <div key={i} className="reaction-card">
          <p className="reaction-quote">&ldquo;{parseBold(r.quote)}&rdquo;</p>
          <div className="reaction-attr">
            <div className="reaction-avatar" aria-hidden="true">{r.name[0]}</div>
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
