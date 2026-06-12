import Link from 'next/link'

/**
 * Global site footer — appears on every page via the root layout.
 * Lives outside the .issue scope so it doesn't fight issue.css styles.
 * Stays restrained: brand line + email + LinkedIn + cadence. No nav menu,
 * no social icons, no "subscribe again" CTA. The voice constitution
 * (CLAUDE.md) calls for restraint; a busy footer breaks it.
 */
export default function SiteFooter() {
  return (
    <footer
      style={{
        maxWidth: 1000,
        margin: '0 auto',
        padding: '40px 30px',
        borderTop: '1px solid var(--hair)',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 16,
        alignItems: 'baseline',
        fontFamily: "'Archivo Narrow', sans-serif",
        fontSize: 12,
        letterSpacing: '.04em',
        color: 'var(--grey)',
      }}
      className="site-footer"
    >
      <div>
        <Link
          href="/"
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--ink)',
            textDecoration: 'none',
            letterSpacing: '-.015em',
          }}
        >
          AI, Basically<span style={{ color: 'var(--accent)' }}>.</span>
        </Link>
        <div
          style={{
            marginTop: 6,
            fontFamily: "'Newsreader', serif",
            fontStyle: 'italic',
            fontSize: 13,
            letterSpacing: 0,
            textTransform: 'none',
            color: 'var(--grey)',
          }}
        >
          Weekly · Saturday 08:00 IST
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          gap: 22,
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          textTransform: 'uppercase',
        }}
      >
        <Link href="/about" style={{ color: 'var(--grey)' }}>
          About
        </Link>
        <Link href="/archive" style={{ color: 'var(--grey)' }}>
          Archive
        </Link>
        <a
          href="mailto:hello@aibasically.co"
          style={{ color: 'var(--accent)' }}
          title="Send feedback or say hi"
        >
          Feedback
        </a>
        <a
          href="https://www.linkedin.com/in/surajpandita/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--grey)' }}
        >
          LinkedIn
        </a>
      </div>
    </footer>
  )
}
