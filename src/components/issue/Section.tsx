import type { ReactNode } from 'react'

type SectionProps = {
  n: string
  label: string
  hint: string
  deep?: boolean
  children: ReactNode
}

export default function Section({ n, label, hint, deep, children }: SectionProps) {
  return (
    <div className={`sec${deep ? ' deep' : ''}`}>
      <div className="label">
        <span className="n">{n}</span>
        <span className="nm-lab">{label}</span>
        <span className="hint">{hint}</span>
      </div>
      <div>{children}</div>
    </div>
  )
}
