interface PMAngleProps {
  text: string
}

function boldHtml(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}

export function PMAngle({ text }: PMAngleProps) {
  if (!text) return null
  return (
    <div className="pm-angle">
      <div className="pm-angle-eyebrow">
        <span className="pm-angle-diamond" aria-hidden="true">◆</span>
        The PM read
      </div>
      <p
        className="pm-angle-body"
        dangerouslySetInnerHTML={{ __html: boldHtml(text) }}
      />
    </div>
  )
}
