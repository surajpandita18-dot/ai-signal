import { readFile } from 'node:fs/promises'
import path from 'node:path'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import SubscribeForm from './subscribe-form'
import type { Database } from '../../db/types/database'

type IssueRow = Database['public']['Tables']['issues']['Row']
type LatestSelect = Pick<
  IssueRow,
  'slug' | 'issue_number' | 'hero_headline_html' | 'date_display' | 'read_time_min' | 'tldr'
>

function stripHtml(s: string): string {
  return s
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

async function loadLatest(): Promise<LatestSelect | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('issues')
    .select('slug, issue_number, hero_headline_html, date_display, read_time_min, tldr')
    .eq('status', 'published')
    .order('issue_number', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (data) return data
  // Fallback: read the highest-numbered JSON in content/issues/ so the
  // landing card still works in dev or if Supabase is empty.
  try {
    const dir = path.join(process.cwd(), 'content/issues')
    const fs = await import('node:fs/promises')
    const files = await fs.readdir(dir)
    const slugs = files
      .filter((f) => /^\d{3}\.json$/.test(f))
      .map((f) => f.replace('.json', ''))
      .sort()
      .reverse()
    if (slugs.length === 0) return null
    const raw = await readFile(path.join(dir, `${slugs[0]}.json`), 'utf8')
    const parsed = JSON.parse(raw)
    return {
      slug: parsed.slug,
      issue_number: parsed.issue_number,
      hero_headline_html: parsed.hero_headline_html,
      date_display: parsed.date_display,
      read_time_min: parsed.read_time_min,
      tldr: parsed.tldr,
    }
  } catch {
    return null
  }
}

export default async function LandingPage() {
  const latest = await loadLatest()
  const latestHeadline = latest ? stripHtml(latest.hero_headline_html) : ''
  const firstTldrBody = (() => {
    if (!latest || !Array.isArray(latest.tldr) || latest.tldr.length === 0) return ''
    const first = latest.tldr[0] as { body?: string }
    return first.body ?? ''
  })()

  return (
    <main className="issue">
      <div className="grid">
        <header className="mast">
          <div className="brand">
            <Link
              href="/"
              style={{ textDecoration: 'none' }}
              className="wordmark"
            >
              AI, Basically<span className="dot">.</span>
            </Link>
            <span className="tagline">
              Explained like a normal person would. ·{' '}
              <Link
                href="/about"
                style={{
                  color: 'var(--accent)',
                  textDecoration: 'none',
                  borderBottom: '1px solid transparent',
                  transition: 'border-color .15s ease',
                }}
                className="tagline-byline"
              >
                by Suraj Pandita
              </Link>
            </span>
          </div>
          <div className="meta">
            <CadenceRibbon />
          </div>
        </header>

        <section className="hero">
          <div className="eyebrow">AI&nbsp;· made&nbsp;plain</div>
          <h1>
            One AI shift matters this week.<br />
            Here&rsquo;s <em>what to do about it.</em>
          </h1>
          <p className="sub">
            One curated read every Saturday &mdash; in plain language, with the
            &ldquo;so what do I do on Monday&rdquo; spelled out. No hype, no
            takes, no &ldquo;10 tools you must try.&rdquo;
          </p>
          <SubscribeForm />

          {latest ? (
            <LatestIssueCard
              slug={latest.slug}
              headline={latestHeadline}
              teaser={firstTldrBody}
              readTime={latest.read_time_min}
              date={latest.date_display}
              issueNumber={latest.issue_number}
            />
          ) : (
            <p
              style={{
                marginTop: 14,
                fontFamily: "'Archivo Narrow', sans-serif",
                fontSize: 13,
                letterSpacing: '.04em',
                color: 'var(--accent)',
              }}
            >
              Or{' '}
              <Link href="/archive" style={{ color: 'var(--accent)' }}>
                browse the archive &rarr;
              </Link>
            </p>
          )}
        </section>

        <section className="sec">
          <div className="label">
            <span className="nm-lab">What you get</span>
            <span className="hint">
              Four small promises. Kept every week.
            </span>
          </div>
          <div>
            <ul className="steps" style={{ listStyle: 'none', display: 'grid', gap: 14, fontFamily: "'Newsreader', serif", fontSize: 16, lineHeight: 1.65 }}>
              <li>
                <b style={{ fontWeight: 600 }}>One thing, not ten.</b> The single
                shift in AI this week that&rsquo;s worth your attention.
              </li>
              <li>
                <b style={{ fontWeight: 600 }}>What to actually do.</b> A
                concrete next move, sized for a normal week.
              </li>
              <li>
                <b style={{ fontWeight: 600 }}>Notes from inside production.</b> A
                paper, a code snippet, a metric &mdash; the kind of thing
                engineers usually only share over coffee.
              </li>
              <li>
                <b style={{ fontWeight: 600 }}>India signal.</b> What&rsquo;s
                shipping locally that the global press isn&rsquo;t covering.
              </li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  )
}

/**
 * Cadence ribbon: 7 dots Mon-Sun, Saturday in oxblood with a subtle pulse.
 * Renders the "weekly Saturday" promise visually instead of as a meta text.
 * Pure CSS animation respects prefers-reduced-motion via the global rule.
 */
function CadenceRibbon() {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  return (
    <div
      aria-label="Weekly · Saturday 08:00 IST"
      title="Weekly · Saturday 08:00 IST"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: "'Archivo Narrow', sans-serif",
        fontSize: 11,
        letterSpacing: '.08em',
        color: 'var(--grey)',
        textTransform: 'uppercase',
      }}
    >
      <span>Weekly</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        {days.map((d, i) => {
          const isSat = i === 5
          return (
            <span
              key={i}
              aria-hidden="true"
              className={isSat ? 'cad-dot cad-sat' : 'cad-dot'}
              style={{
                width: isSat ? 8 : 5,
                height: isSat ? 8 : 5,
                borderRadius: '50%',
                background: isSat ? 'var(--accent)' : 'var(--hair)',
                display: 'inline-block',
              }}
            />
          )
        })}
      </span>
      <span>Sat 08:00 IST</span>
    </div>
  )
}

function LatestIssueCard({
  slug,
  headline,
  teaser,
  readTime,
  date,
  issueNumber,
}: {
  slug: string
  headline: string
  teaser: string
  readTime: number
  date: string
  issueNumber: number
}) {
  const padded = String(issueNumber).padStart(3, '0')
  return (
    <Link
      href={`/i/${slug}`}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      className="latest-card"
    >
      <div
        style={{
          marginTop: 22,
          padding: '18px 18px 16px',
          border: '1px solid var(--ink)',
          background: 'var(--bg)',
          boxShadow: '4px 4px 0 var(--ink)',
          transition: 'transform .15s ease, box-shadow .15s ease',
        }}
        className="lc-inner"
      >
        <div
          style={{
            fontFamily: "'Archivo Narrow', sans-serif",
            fontSize: 10.5,
            letterSpacing: '.12em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            marginBottom: 6,
          }}
        >
          This Saturday&rsquo;s issue · № {padded} · Free
        </div>
        <h3
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 500,
            fontSize: 'clamp(20px, 3vw, 26px)',
            lineHeight: 1.2,
            letterSpacing: '-0.015em',
            color: 'var(--ink)',
            margin: '0 0 10px',
          }}
        >
          {headline}
        </h3>
        {teaser && (
          <p
            style={{
              fontFamily: "'Newsreader', serif",
              fontSize: 15,
              lineHeight: 1.55,
              color: 'var(--ink)',
              margin: '0 0 10px',
            }}
          >
            {teaser}
          </p>
        )}
        <div
          style={{
            fontFamily: "'Archivo Narrow', sans-serif",
            fontSize: 12,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            color: 'var(--grey)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}
        >
          <span>
            {readTime} min read · {date}
          </span>
          <span
            style={{
              color: 'var(--accent)',
              fontWeight: 600,
            }}
            className="lc-arrow"
          >
            Read &rarr;
          </span>
        </div>
      </div>
    </Link>
  )
}
