import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'

export const metadata: Metadata = {
  title: 'Sponsor — AI Signal',
  description: 'Reach 2,000+ senior engineers, PMs, and founders in the Indian AI ecosystem. One placement. High attention.',
  openGraph: {
    title: 'Sponsor AI Signal',
    description: 'Reach senior builders in the Indian AI ecosystem. One story, one sponsor, every day.',
    url: 'https://aisignal.so/sponsor',
    siteName: 'AI Signal',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Sponsor AI Signal',
    description: 'Reach senior builders in the Indian AI ecosystem.',
  },
}

export default function SponsorPage() {
  return (
    <>
      <SiteNav />

      <main className="about-page">

        <Link href="/" className="about-back">
          ← Today&apos;s signal
        </Link>

        {/* Hero */}
        <div className="about-hero">
          <p className="about-kicker">Advertising</p>
          <h1 className="about-headline">
            One story.<br />
            One sponsor.<br />
            <em>High attention.</em>
          </h1>
          <p className="about-deck">
            AI Signal has one placement per issue. No sidebar, no banner, no retargeting.
            Your message reaches readers who are already paying attention — because they
            came here specifically to read about AI.
          </p>
        </div>

        {/* Audience */}
        <section className="about-section">
          <div className="about-section-label">01 — The audience</div>
          <h2 className="about-section-title">Who reads AI Signal.</h2>
          <div className="about-body">
            <p>
              Senior engineers, product managers, and early-stage founders in the Indian tech
              ecosystem. Primarily Bengaluru, Mumbai, Delhi NCR — with a growing slice of Indian
              builders at global companies. These are people with real purchasing decisions, real
              teams, and a low tolerance for noise.
            </p>
          </div>

          {/* Audience stats */}
          <div className="sponsor-stats">
            <div className="sponsor-stat">
              <div className="sponsor-stat-value">2,000+</div>
              <div className="sponsor-stat-label">Subscribers</div>
              <div className="sponsor-stat-detail">And growing daily</div>
            </div>
            <div className="sponsor-stat">
              <div className="sponsor-stat-value">68%</div>
              <div className="sponsor-stat-label">Open rate</div>
              <div className="sponsor-stat-detail">Industry avg is 21%</div>
            </div>
            <div className="sponsor-stat">
              <div className="sponsor-stat-value">06:14</div>
              <div className="sponsor-stat-label">Filed IST</div>
              <div className="sponsor-stat-detail">Before the standup</div>
            </div>
          </div>

          <div className="about-body" style={{ marginTop: '28px' }}>
            <p>
              The median reader is a senior IC or early founder, 28–38, working on products
              that intersect with AI. They read the signal before their first meeting of the day.
              They share it in Slack. They act on it.
            </p>
          </div>
        </section>

        {/* Placement */}
        <section className="about-section">
          <div className="about-section-label">02 — The placement</div>
          <h2 className="about-section-title">One slot. No auction.</h2>
          <div className="about-body">
            <p>
              Every issue has one sponsored slot — a native text block that appears between the
              action checklist and the standup card. It is labeled clearly as a sponsor. It is
              written in the same voice as the rest of the signal. Readers trust it because
              it is not trying to hide.
            </p>
            <p>
              We do not run image ads, banner ads, or pre-roll anything. The signal is a reading
              experience and the sponsor slot respects that.
            </p>
          </div>

          <div className="about-steps" style={{ marginTop: '32px' }}>
            <div className="about-step">
              <span className="about-step-num">✓</span>
              <div>
                <strong>Native text block</strong>
                <p>Labeled as sponsor. Written to match editorial voice. No images.</p>
              </div>
            </div>
            <div className="about-step">
              <span className="about-step-num">✓</span>
              <div>
                <strong>One sponsor per issue</strong>
                <p>Your message is not competing with four other brands on the same page.</p>
              </div>
            </div>
            <div className="about-step">
              <span className="about-step-num">✓</span>
              <div>
                <strong>Positioned between action items and standup card</strong>
                <p>Highest-engagement section of the issue — where readers pause to act.</p>
              </div>
            </div>
            <div className="about-step">
              <span className="about-step-num">✓</span>
              <div>
                <strong>We write the copy</strong>
                <p>
                  You give us the brief. We write something that fits the editorial tone.
                  You approve before it runs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Good fit */}
        <section className="about-section">
          <div className="about-section-label">03 — Good fit</div>
          <h2 className="about-section-title">Who we work with.</h2>
          <div className="about-body">
            <p>
              Developer tools. AI infrastructure. SaaS products used by engineering or product teams.
              Courses and resources for builders. Recruiting for technical roles. Research reports
              or data products.
            </p>
            <p>
              We do not run placements for consumer products, crypto, gambling, or anything we
              would not use ourselves. If you have to ask, the answer is probably no.
            </p>
          </div>
        </section>

        {/* Pull quote */}
        <blockquote className="about-quote">
          <p>
            "The best sponsorship is one the reader does not resent. That means relevance,
            restraint, and a clear value proposition — not a banner."
          </p>
          <cite>— The standard every placement is held to</cite>
        </blockquote>

        {/* CTA */}
        <section className="about-section">
          <div className="about-section-label">04 — Get in touch</div>
          <h2 className="about-section-title">How to book a slot.</h2>
          <div className="about-body">
            <p>
              Slots are booked weekly. Availability is limited to one sponsor per day.
              Reach out with your product, your target audience, and what you are trying to say.
              We will tell you honestly if it is a fit.
            </p>
          </div>

          <div className="about-contact" style={{ marginTop: '28px' }}>
            <a
              href="mailto:sponsor@aisignal.so"
              className="about-contact-link"
            >
              sponsor@aisignal.so ↗
            </a>
            <a
              href="https://linkedin.com/in/surajpandita"
              target="_blank"
              rel="noopener noreferrer"
              className="about-contact-link"
            >
              LinkedIn ↗
            </a>
          </div>
        </section>

        {/* CTA block */}
        <div className="about-cta">
          <p className="about-cta-text">
            One slot available per day. Most weeks book out fast.
          </p>
          <a href="mailto:sponsor@aisignal.so" className="about-cta-btn">
            Enquire about a slot →
          </a>
        </div>

      </main>

      <SiteFooter />
    </>
  )
}
