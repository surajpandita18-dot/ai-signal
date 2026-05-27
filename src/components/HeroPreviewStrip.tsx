import type { PreviewCard } from '@/lib/types/extended-data'

const ANCHOR_MAP: Record<string, string> = {
  'By the numbers': '#sec-numbers',
  'Why it matters': '#sec-context',
  'The move':       '#sec-move',
  'The fact':       '#sec-facts',
}

interface HeroPreviewStripProps {
  cards: PreviewCard[]
}

export function HeroPreviewStrip({ cards }: HeroPreviewStripProps) {
  if (cards.length === 0) return null

  return (
    <div className="hero-preview-strip anim d5">
      {cards.map((card) => (
        <a key={card.index} href={ANCHOR_MAP[card.label] ?? '#'} className="hero-preview-card">
          <div className="hero-preview-header">
            <div className="hero-preview-icon">{card.index}</div>
            <span className="preview-label">{card.label}</span>
          </div>
          <span className="preview-value">{card.value}</span>
          <span className="preview-arrow">Read section →</span>
        </a>
      ))}
    </div>
  )
}
