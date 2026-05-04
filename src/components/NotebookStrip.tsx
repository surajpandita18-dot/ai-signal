import { NotebookFacts } from './NotebookFacts'

interface NotebookStripProps {
  className?: string
}

export function NotebookStrip({ className }: NotebookStripProps) {
  return (
    <section className={`notebook-strip reveal${className ? ` ${className}` : ''}`}>
      <div className="notebook">
        {/* masking tape — decorative, top center */}
        <span className="nb-tape" aria-hidden="true" />
        {/* red margin line — decorative, left vertical */}
        <span className="nb-margin" aria-hidden="true" />
        {/* corner doodle: hand-drawn star */}
        <div className="nb-doodle" aria-hidden="true">
          <svg viewBox="0 0 36 36">
            <path d="M18 4 L21 14 L31 14 L23 20 L26 30 L18 24 L10 30 L13 20 L5 14 L15 14 Z" />
            <path d="M3 6 L7 10 M7 6 L3 10" strokeWidth="1" />
          </svg>
        </div>
        <NotebookFacts />
      </div>
    </section>
  )
}
