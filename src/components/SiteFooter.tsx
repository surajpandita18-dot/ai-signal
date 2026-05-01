import React from 'react'

interface FooterLink {
  label: string
  href: string
}

const FOOTER_LINKS: FooterLink[] = [
  { label: 'Twitter', href: 'https://twitter.com' },
  { label: 'RSS', href: '/rss.xml' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Contact', href: 'mailto:suraj.pandita18@gmail.com' },
]

export function SiteFooter() {
  return (
    <footer
      style={{
        maxWidth: 1280,
        margin: '80px auto 0',
        padding: '40px 32px 60px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 24,
        fontSize: 13,
        color: 'var(--text-mute)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--text)',
            letterSpacing: '-0.02em',
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              background: 'var(--text)',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--bg)',
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            S
          </div>
          <span>AI Signal</span>
        </div>
        <span
          style={{
            fontFamily: 'var(--ff-display)',
            fontSize: 14,
            color: 'var(--text-mute)',
            fontStyle: 'normal',
          }}
        >
          <em style={{ fontStyle: 'italic', color: 'var(--text-soft)' }}>
            Made with care in Bengaluru
          </em>
          {' '}· 06:14 IST, every morning
        </span>
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        {FOOTER_LINKS.map(link => (
          <a
            key={link.label}
            href={link.href}
            style={{
              color: 'inherit',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
          >
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  )
}
