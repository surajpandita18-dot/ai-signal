interface IssueHeaderProps {
  issueNumber: number
  publishedAt: string
  editorNote: string
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

export function IssueHeader({ issueNumber, publishedAt, editorNote }: IssueHeaderProps) {
  const formattedDate = dateFormatter.format(new Date(publishedAt))

  return (
    <header>
      <p
        className="font-mono"
        style={{
          fontSize: '11px',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--text-secondary)',
          marginBottom: '24px',
        }}
      >
        Issue #{issueNumber} · {formattedDate}
      </p>

      <p
        className="font-serif"
        style={{
          fontSize: '15px',
          lineHeight: 1.7,
          color: 'var(--text-primary)',
          marginBottom: '40px',
        }}
      >
        {editorNote}
      </p>

      <hr
        style={{
          border: 'none',
          borderTop: '1px solid var(--border)',
          marginBottom: '40px',
        }}
      />
    </header>
  )
}
