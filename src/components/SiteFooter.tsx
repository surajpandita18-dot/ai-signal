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
          className="site-footer__brand"
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
          {/* nbsp glue prevents awkward line break inside the cadence label */}
          Weekly · Saturday 08:00&nbsp;IST
        </div>
      </div>
      <nav
        aria-label="Footer"
        style={{
          display: 'flex',
          gap: 22,
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          textTransform: 'uppercase',
        }}
      >
        <Link href="/about" className="site-footer__link" style={{ color: 'var(--grey)' }}>
          About
        </Link>
        <Link href="/archive" className="site-footer__link" style={{ color: 'var(--grey)' }}>
          Archive
        </Link>
        <Link href="/interviews" className="site-footer__link" style={{ color: 'var(--grey)' }}>
          Interviews
        </Link>
        <a
          href="mailto:hello@aibasically.co"
          aria-label="Email feedback to hello@aibasically.co"
          className="site-footer__link"
          style={{ color: 'var(--accent)' }}
        >
          Feedback
        </a>
        <a
          href="https://www.linkedin.com/in/surajpandita/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Suraj Pandita on LinkedIn (opens in new tab)"
          className="site-footer__link"
          style={{ color: 'var(--grey)' }}
        >
          LinkedIn
        </a>
      </nav>
    </footer>
  )
}
