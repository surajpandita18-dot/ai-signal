import React from 'react'
import { ChaiButton } from './ChaiButton'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-left">
        <div className="footer-mark">
          <div className="mark-icon" aria-hidden="true">S</div>
          <span className="footer-mark-text">AI Signal</span>
        </div>
        <span className="footer-tagline">
          <em>Made with care in Bengaluru</em>
          {' '}· 06:14 IST, every morning
        </span>
      </div>

      <div className="links">
        <a href="https://twitter.com/aisignal" rel="noopener">Twitter</a>
        <a href="/rss.xml">RSS</a>
        <a href="/about">About</a>
        <a href="/feedback">Feedback</a>
        <a href="mailto:hi@aisignal.so">Contact</a>
        <ChaiButton />
      </div>
    </footer>
  )
}
