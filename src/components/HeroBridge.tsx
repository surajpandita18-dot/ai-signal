interface HeroBridgeProps {
  text?: string
}

export function HeroBridge({ text = "What you're about to read" }: HeroBridgeProps) {
  return (
    <div className="hero-bridge anim d5">
      <span className="hero-bridge-text">{text}</span>
      <span className="hero-bridge-line" aria-hidden="true" />
    </div>
  )
}
