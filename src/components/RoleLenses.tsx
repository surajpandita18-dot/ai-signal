interface RoleLensesProps {
  pm: string
  founder: string
  builder: string
}

function boldHtml(s: string): string {
  return s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}

const ROLES = [
  {
    key: 'pm' as const,
    label: 'Product Manager',
    mark: '◆',
    cls: 'role-lens-pm',
  },
  {
    key: 'founder' as const,
    label: 'Founder',
    mark: '△',
    cls: 'role-lens-founder',
  },
  {
    key: 'builder' as const,
    label: 'Engineer',
    mark: '○',
    cls: 'role-lens-builder',
  },
]

export function RoleLenses({ pm, founder, builder }: RoleLensesProps) {
  const values = { pm, founder, builder }

  return (
    <div className="role-lenses" id="sec-lenses">
      <div className="role-lenses-eyebrow">Read this as your role</div>
      <div className="role-lenses-grid">
        {ROLES.map(({ key, label, mark, cls }) => {
          const text = values[key]
          if (!text) return null
          return (
            <div key={key} className={`role-lens-card ${cls}`}>
              <div className="role-lens-header">
                <span className="role-lens-mark" aria-hidden="true">{mark}</span>
                <span className="role-lens-label">{label}</span>
              </div>
              <p
                className="role-lens-body"
                dangerouslySetInnerHTML={{ __html: boldHtml(text) }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
