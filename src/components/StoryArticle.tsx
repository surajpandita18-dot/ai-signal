'use client'

import React, { useState, useEffect, useRef } from 'react'
import type { Database } from '../../db/types/database'

// ---------- Text helpers ----------

function parseBold(text: string): React.ReactNode {
  if (!text.includes('**')) return text
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} style={{ fontWeight: 700 }}>{part.slice(2, -2)}</strong>
      : part
  )
}

function renderAction(text: string): React.ReactNode {
  if (text.includes('**')) return parseBold(text)
  // Auto-bold: everything up to the first period + space after ≥8 chars
  const m = text.match(/^(.{8,}?[.])\s+/)
  if (m) return <><strong style={{ fontWeight: 700 }}>{m[1]}</strong>{' '}{text.slice(m[0].length)}</>
  return text
}

function domainInitial(url: string): string {
  try { return new URL(url).hostname.replace('www.', '').charAt(0).toUpperCase() }
  catch { return '→' }
}

// Extend the Story type locally — stats/action_items/counter_view columns added by migration
// If SEED has already updated database.ts these will be redundant but safe (merged)
type StoryRow = Database['public']['Tables']['stories']['Row']
type Story = StoryRow & {
  stats?: Array<{ label: string; value: string; delta: string | null; detail: string }> | null
  action_items?: string[] | null
  counter_view?: string | null
  counter_view_headline?: string | null
}

interface StoryArticleProps {
  story: Story
  publishedAt: string
  signalNumber: number
  onReadPctChange?: (pct: number) => void
}

// ---------- ShareButtons (internal, not exported) ----------

function ShareButtons() {
  const [copied, setCopied] = useState(false)

  function shareX() {
    const text = encodeURIComponent(
      `Reading AI Signal — the one AI story that matters today.`
    )
    const url = encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  function copyLink() {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        })
        .catch(() => {
          /* clipboard unavailable */
        })
    }
  }

  function bookmark() {
    // Placeholder — bookmark feature coming in Phase 5
  }

  const btnStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: 'var(--bg-card)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-mute)',
    fontSize: 13,
    transition: 'color 0.2s, border-color 0.2s, transform 0.2s',
    flexShrink: 0,
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <span
        style={{
          fontFamily: 'var(--ff-display)',
          fontStyle: 'italic',
          fontSize: 13,
          color: 'var(--text-mute)',
          marginRight: 4,
          letterSpacing: '-0.005em',
        }}
      >
        Share —
      </span>

      {/* X / Twitter */}
      <button
        type="button"
        onClick={shareX}
        aria-label="Share on X"
        style={btnStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text)'
          e.currentTarget.style.borderColor = 'var(--text)'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-mute)'
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </button>

      {/* Copy link */}
      <button
        type="button"
        onClick={copyLink}
        aria-label="Copy link"
        style={btnStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text)'
          e.currentTarget.style.borderColor = 'var(--text)'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-mute)'
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        {copied
          ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
          : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        }
      </button>

      {/* Bookmark */}
      <button
        type="button"
        onClick={bookmark}
        aria-label="Save"
        style={btnStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text)'
          e.currentTarget.style.borderColor = 'var(--text)'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-mute)'
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
      </button>
    </div>
  )
}

// ---------- Category styles ----------

const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  models:   { bg: 'var(--signal-soft)',    text: 'var(--signal-deep)' },
  tools:    { bg: 'var(--warm-soft)',      text: 'var(--warm)' },
  business: { bg: 'var(--money-soft)',     text: 'var(--money)' },
  policy:   { bg: 'rgba(14,165,233,0.1)', text: 'var(--water)' },
  research: { bg: 'rgba(202,138,4,0.1)',  text: 'var(--energy)' },
}

function categoryChip(category: string): { bg: string; text: string } {
  return CATEGORY_STYLES[category.toLowerCase()] ?? { bg: 'var(--signal-soft)', text: 'var(--signal-deep)' }
}

// ---------- FeedbackVote ----------

type VoteKey = 'changed' | 'thinking' | 'known' | 'irrelevant'

const VOTE_BUTTONS: { key: VoteKey; icon: string; label: string }[] = [
  { key: 'changed',    icon: '✓', label: 'Changed my decision' },
  { key: 'thinking',  icon: '◐', label: 'Made me think' },
  { key: 'known',     icon: '○', label: 'Already knew this' },
  { key: 'irrelevant',icon: '×', label: 'Not relevant' },
]

function FeedbackVote() {
  const [voted, setVoted] = useState<VoteKey | null>(null)

  return (
    <>
      <style>{`
        .feedback-btn {
          background: var(--bg-card);
          border: 0.5px solid var(--border-mid);
          padding: 9px 14px;
          border-radius: 6px;
          font-family: var(--ff-body);
          font-size: 12.5px;
          font-weight: 500;
          color: var(--text-soft);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          transition: border-color 0.2s, color 0.2s, transform 0.2s, box-shadow 0.2s;
          letter-spacing: -0.005em;
        }
        .feedback-btn:hover {
          border-color: var(--signal);
          color: var(--signal);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(43,91,255,0.08);
        }
        .feedback-btn.voted-state {
          background: var(--signal-soft);
          border-color: var(--signal);
          color: var(--signal-deep);
          pointer-events: none;
        }
        .feedback-thanks {
          font-family: var(--ff-display);
          font-style: italic;
          font-size: 14px;
          color: var(--green);
          margin-top: 14px;
          letter-spacing: -0.005em;
          transition: opacity 0.4s;
        }
        @media (max-width: 720px) {
          .feedback-buttons-row { flex-direction: column !important; }
          .feedback-btn { width: 100%; justify-content: center; }
        }
      `}</style>
      <div
        style={{
          marginTop: 32,
          paddingTop: 28,
          borderTop: '1px dashed var(--border-mid)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--ff-display)',
            fontStyle: 'italic',
            fontSize: 16,
            color: 'var(--text-soft)',
            marginBottom: 16,
            letterSpacing: '-0.005em',
          }}
        >
          Was this useful today?
        </div>
        <div
          className="feedback-buttons-row"
          style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}
        >
          {VOTE_BUTTONS.map(({ key, icon, label }) => (
            <button
              key={key}
              type="button"
              className={`feedback-btn${voted === key ? ' voted-state' : ''}`}
              onClick={() => setVoted(key)}
              data-vote={key}
            >
              <span style={{ fontSize: 11, color: 'inherit' }}>{icon}</span>
              {label}
            </button>
          ))}
        </div>
        {voted && (
          <div className="feedback-thanks">
            Thanks — that helps shape tomorrow's signal.
          </div>
        )}
      </div>
    </>
  )
}

// ---------- StandupCard ----------

type StandupFormat = 'slack' | 'email' | 'whatsapp' | 'linkedin'

function buildStandupContent(story: Story) {
  const tldr = story.headline
  const implication = story.summary.replace(/\*\*(.*?)\*\*/g, '$1').slice(0, 160)
  const actions = story.action_items ?? []
  const action0 = typeof actions[0] === 'string' ? actions[0].replace(/\*\*(.*?)\*\*/g, '$1') : 'Review the implications for your team.'
  const action1 = typeof actions[1] === 'string' ? actions[1].replace(/\*\*(.*?)\*\*/g, '$1') : 'Assess your current approach in light of this.'
  const action2 = typeof actions[2] === 'string' ? actions[2].replace(/\*\*(.*?)\*\*/g, '$1') : 'Share this signal with relevant stakeholders.'
  const domain = 'aisignal.so'

  function getClipboard(format: StandupFormat): string {
    if (format === 'slack') {
      return `*🧠 AI Signal · Today*\n\n${tldr}\n\n→ *Why it matters:* ${implication}\n→ *What I'd do:* ${action0}\n\n_3 min read_ · ${domain}`
    }
    if (format === 'email') {
      return `Hey —\n\nQuick share from this morning's AI Signal: ${tldr}\n\nThe implication: ${implication}\n\n${action0}\n\nFull read (3 min): https://${domain}\n\n— shared via AI Signal`
    }
    if (format === 'whatsapp') {
      return `*AI Signal · Today* 🧠\n\n${tldr.slice(0, 80)}.\n\n*Worth reading before your next meeting.*\n\nhttps://${domain}`
    }
    // linkedin
    return `${tldr}\n\n${implication}\n\nThree things teams should do this week:\n\n→ ${action0}\n\n→ ${action1}\n\n→ ${action2}\n\nThe old defaults may now be the expensive choice.\n\nWhat's the first thing you'd change?\n\n—\nRead AI Signal — one AI story every day at 6:14 AM IST.\n\nhttps://${domain}`
  }

  function getPreviewHtml(format: StandupFormat): string {
    if (format === 'slack') {
      return `<b>🧠 AI Signal · Today</b>\n\n${tldr}\n\n<span style="color:var(--warm);font-weight:600">→</span> <b>Why it matters:</b> ${implication}\n<span style="color:var(--warm);font-weight:600">→</span> <b>What I'd do:</b> ${action0}\n\n<span style="color:var(--text-mute);font-style:italic">3 min read</span> · <span style="color:var(--signal);text-decoration:underline">${domain}</span>`
    }
    if (format === 'email') {
      return `Hey —\n\nQuick share from this morning's AI Signal: ${tldr}\n\nThe implication: ${implication}\n\n${action0}\n\nFull read (3 min): <span style="color:var(--signal);text-decoration:underline">https://${domain}</span>\n\n<span style="color:var(--text-mute);font-style:italic">— shared via AI Signal</span>`
    }
    if (format === 'whatsapp') {
      return `<b>AI Signal · Today</b> 🧠\n\n${tldr.slice(0, 80)}.\n\n<b>Worth reading before your next meeting.</b>\n\n<span style="color:var(--signal);text-decoration:underline">https://${domain}</span>`
    }
    return `${tldr}\n\n${implication}\n\nThree things teams should do this week:\n\n<span style="color:var(--warm);font-weight:600">→</span> ${action0}\n\n<span style="color:var(--warm);font-weight:600">→</span> ${action1}\n\n<span style="color:var(--warm);font-weight:600">→</span> ${action2}\n\n<i>The old defaults may now be the expensive choice.</i>\n\n<span style="color:var(--signal);text-decoration:underline">https://${domain}</span>`
  }

  return { getClipboard, getPreviewHtml }
}

function StandupCard({ story }: { story: Story }) {
  const [activeFormat, setActiveFormat] = useState<StandupFormat>('slack')
  const [copied, setCopied] = useState(false)
  const { getClipboard, getPreviewHtml } = buildStandupContent(story)

  const FORMAT_LABELS: Record<StandupFormat, string> = {
    slack: 'Slack',
    email: 'Email',
    whatsapp: 'WhatsApp',
    linkedin: 'LinkedIn',
  }

  async function handleCopy() {
    const text = getClipboard(activeFormat)
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.cssText = 'position:fixed;opacity:0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <>
      <style>{`
        .standup-tab-btn {
          flex: 1;
          background: transparent;
          border: none;
          padding: 8px 0 10px;
          font-family: var(--ff-mono);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-mute);
          cursor: pointer;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          transition: color 0.2s, border-color 0.2s;
        }
        .standup-tab-btn:hover { color: var(--text); }
        .standup-tab-btn.active {
          color: var(--text);
          border-bottom-color: var(--warm);
        }
        @media (max-width: 720px) {
          .standup-tabs-row { display: grid !important; grid-template-columns: 1fr 1fr; }
          .standup-tab-btn:nth-child(1),
          .standup-tab-btn:nth-child(3) { border-right: 1px solid rgba(180,140,60,0.15); }
        }
      `}</style>

      <div
        id="standup-card"
        style={{
          background: '#FBF8E8',
          border: '1px dashed rgba(180,140,60,0.3)',
          borderRadius: 6,
          padding: '24px 28px',
          margin: '32px 0 8px',
          transform: 'rotate(-0.5deg)',
          boxShadow: '0 4px 12px rgba(180,140,60,0.08), 0 1px 2px rgba(0,0,0,0.03)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div
            style={{
              width: 32, height: 32,
              background: 'rgba(180,140,60,0.15)',
              borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#8A6F2C', flexShrink: 0,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
              <rect x="9" y="3" width="6" height="3" rx="1"/><rect x="5" y="6" width="14" height="15" rx="2"/><path d="M9 12h6M9 16h4"/>
            </svg>
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div
              style={{
                fontFamily: 'var(--ff-display)',
                fontStyle: 'italic',
                fontSize: 17,
                color: 'var(--text)',
                fontWeight: 500,
                letterSpacing: '-0.005em',
                lineHeight: 1.1,
                marginBottom: 3,
              }}
            >
              Bring this to your standup
            </div>
            <div
              style={{
                fontFamily: 'var(--ff-mono)',
                fontSize: 9.5,
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--text-faint)',
              }}
            >
              9 AM · Quotable
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="standup-tabs-row"
          style={{
            display: 'flex',
            gap: 0,
            borderBottom: '1px solid rgba(180,140,60,0.2)',
            marginBottom: 14,
          }}
        >
          {(Object.keys(FORMAT_LABELS) as StandupFormat[]).map(fmt => (
            <button
              key={fmt}
              className={`standup-tab-btn${activeFormat === fmt ? ' active' : ''}`}
              onClick={() => setActiveFormat(fmt)}
              role="tab"
              aria-selected={activeFormat === fmt}
            >
              {FORMAT_LABELS[fmt]}
            </button>
          ))}
        </div>

        {/* Preview */}
        <div
          style={{
            background: '#FFFFFF',
            border: '0.5px solid var(--border)',
            borderRadius: 6,
            padding: '16px 18px',
            marginBottom: 14,
            fontSize: 13.5,
            lineHeight: 1.6,
            color: 'var(--text)',
            minHeight: 100,
            whiteSpace: 'pre-wrap',
            fontFamily: 'var(--ff-body)',
          }}
          dangerouslySetInnerHTML={{ __html: getPreviewHtml(activeFormat) }}
        />

        {/* Copy button */}
        <button
          type="button"
          onClick={handleCopy}
          style={{
            width: '100%',
            background: copied ? 'var(--green)' : 'var(--text)',
            color: 'white',
            border: 'none',
            padding: '11px 16px',
            borderRadius: 6,
            fontFamily: 'var(--ff-body)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'background 0.2s',
            letterSpacing: '-0.005em',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
            {copied
              ? <path d="M5 12l5 5L20 7"/>
              : <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></>
            }
          </svg>
          {copied ? 'Copied ✓' : `Copy for ${FORMAT_LABELS[activeFormat]}`}
        </button>
      </div>
    </>
  )
}

// ---------- StoryArticle ----------

export function StoryArticle({
  story,
  publishedAt,
  signalNumber,
  onReadPctChange,
}: StoryArticleProps) {
  const [timeLeft, setTimeLeft] = useState('')
  const [expired, setExpired] = useState(false)
  const [readPct, setReadPct] = useState(0)
  const articleRef = useRef<HTMLElement>(null)
  // High watermark — never decreases once set, locks at 100
  const highWatermark = useRef(0)
  // Engagement: user must pause ≥1s before progress commits
  const engaged = useRef(false)
  const engageTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Expiry countdown
  useEffect(() => {
    const published = new Date(publishedAt).getTime()
    const expiry = published + 24 * 60 * 60 * 1000

    function tick() {
      const remaining = expiry - Date.now()
      if (remaining <= 0) {
        setExpired(true)
        setTimeLeft('00:00:00')
        return
      }
      const h = Math.floor(remaining / 3600000)
      const m = Math.floor((remaining % 3600000) / 60000)
      const s = Math.floor((remaining % 60000) / 1000)
      setTimeLeft(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      )
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [publishedAt])

  // Reading progress — monotonic high watermark + engagement gate
  useEffect(() => {
    function commit(raw: number) {
      if (highWatermark.current >= 100) return  // locked at 100
      const next = Math.max(highWatermark.current, raw)
      if (next !== highWatermark.current) {
        highWatermark.current = next
        setReadPct(next)
        onReadPctChange?.(next)
      }
    }

    function onScroll() {
      if (!articleRef.current) return
      const rect = articleRef.current.getBoundingClientRect()
      const articleHeight = articleRef.current.offsetHeight
      const scrolledIntoArticle = -rect.top + window.innerHeight
      const raw = Math.max(0, Math.min(100, Math.round((scrolledIntoArticle / articleHeight) * 100)))

      // Start engagement timer on first scroll into article
      if (!engaged.current && raw > 0) {
        if (!engageTimer.current) {
          engageTimer.current = setTimeout(() => { engaged.current = true }, 1000)
        }
      }

      if (engaged.current) {
        commit(raw)
      } else if (raw > highWatermark.current) {
        // Even before engagement, allow small increments so the ring isn't dead
        commit(Math.min(raw, 15))
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (engageTimer.current) clearTimeout(engageTimer.current)
    }
  }, [onReadPctChange])

  return (
    <article
      ref={articleRef}
      className="reveal"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        padding: 48,
        boxShadow:
          '0 1px 2px rgba(0,0,0,0.02), 0 4px 8px rgba(0,0,0,0.03), 0 16px 32px rgba(0,0,0,0.04)',
        position: 'relative',
      }}
    >
      {/* Responsive stat grid + stat-card hover bar + builder grain + jump link */}
      <style>{`
        .story-jump-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--ff-mono);
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--text-faint);
          text-decoration: none;
          padding: 5px 10px;
          border: 1px dashed rgba(180,140,60,0.3);
          border-radius: 4px;
          background: rgba(251,248,232,0.5);
          cursor: pointer;
          transition: color 0.2s, border-color 0.2s, background 0.2s;
          margin-bottom: 18px;
          margin-right: auto;
        }
        .story-jump-link:hover {
          color: #8A6F2C;
          border-color: rgba(180,140,60,0.5);
          background: #FBF8E8;
        }
        .story-jump-link:hover .jump-icon {
          transform: translateY(2px);
        }
        .jump-icon {
          font-size: 11px;
          opacity: 0.7;
          transition: transform 0.2s;
        }
        @media (max-width: 640px) {
          .stat-grid { grid-template-columns: 1fr !important; }
        }
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 3px; height: 0;
          background: var(--signal);
          transition: height 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .stat-card:hover::before { height: 100%; }
        .builder-block::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
          opacity: 0.05;
          pointer-events: none;
          border-radius: 16px;
        }
      `}</style>

      {/* ── Jump link ── */}
      <a
        href="#standup-card"
        className="story-jump-link"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('standup-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }}
      >
        <span className="jump-icon">↓</span>
        Bring this to standup
      </a>

      {/* ── Section 1: Story meta bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 24,
          flexWrap: 'wrap',
        }}
      >
        {/* Category chip */}
        <span
          style={{
            background: categoryChip(story.category).bg,
            color: categoryChip(story.category).text,
            padding: '5px 11px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {story.category.toUpperCase()}
        </span>

        <span style={{ fontSize: 14, color: 'var(--text-mute)', fontWeight: 500 }}>
          {story.read_minutes} min read
        </span>
        <span style={{ color: 'var(--text-faint)' }}>·</span>
        <span style={{ fontSize: 14, color: 'var(--text-mute)', fontWeight: 500 }}>
          Filed 06:14 IST
        </span>

        {/* Expiry timer badge */}
        {!expired && timeLeft && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              background: 'var(--warm-soft)',
              border: '1px solid rgba(255,107,53,0.25)',
              padding: '5px 12px',
              borderRadius: 6,
              fontFamily: 'var(--ff-mono)',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--warm)',
            }}
          >
            {/* Clock icon */}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M6 3.5V6L7.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Expires in {timeLeft}
          </span>
        )}

        {expired && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              background: 'var(--bg-soft)',
              border: '1px solid var(--border)',
              padding: '5px 12px',
              borderRadius: 6,
              fontFamily: 'var(--ff-mono)',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-faint)',
            }}
          >
            Signal expired
          </span>
        )}
      </div>

      {/* ── Section 2: Headline + deck ── */}
      <h2
        style={{
          fontFamily: 'var(--ff-display)',
          fontSize: 'clamp(34px,4.6vw,52px)',
          lineHeight: 1.06,
          letterSpacing: '-0.025em',
          fontWeight: 400,
          marginBottom: 0,
        }}
      >
        {story.headline}
      </h2>

      <p
        style={{
          fontSize: 19,
          lineHeight: 1.55,
          color: 'var(--text-soft)',
          margin: '28px 0 32px',
        }}
      >
        {parseBold(story.summary)}
      </p>

      {/* ── Section 3: Author row ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '16px 0',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          marginBottom: 36,
        }}
      >
        {/* Avatar with green presence dot */}
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--signal), var(--warm))',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: 13,
            position: 'relative',
          }}
        >
          AS
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 11,
              height: 11,
              borderRadius: '50%',
              background: 'var(--green)',
              border: '2px solid var(--bg-card)',
            }}
          />
        </div>

        <div style={{ flex: 1, lineHeight: 1.3 }}>
          <div style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            AI Signal Editorial
            <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--signal)" style={{ flexShrink: 0 }}>
              <path d="M12 2l2.4 1.8 3-.4 1 2.8 2.8 1-.4 3L22.6 12l-1.8 2.4.4 3-2.8 1-1 2.8-3-.4L12 22.6l-2.4-1.8-3 .4-1-2.8-2.8-1 .4-3L1.4 12l1.8-2.4-.4-3 2.8-1 1-2.8 3 .4L12 2zm-1.5 13.5l6-6L15 8 10.5 12.5 8.5 10.5 7 12l3.5 3.5z"/>
            </svg>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-mute)' }}>
            @aisignal · today, 06:14 IST
          </div>
        </div>

        <ShareButtons />
      </div>

      {/* ── Section 4: Signal block — para 1 of why_it_matters ── */}
      {(() => {
        const para1html = (story.why_it_matters.split(/\n\n+/).map(p => p.trim()).filter(Boolean)[0] ?? '')
          .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight:600">$1</strong>')
        return (
          <div
            style={{
              background: 'linear-gradient(135deg,var(--signal-faint),var(--bg-card))',
              border: '1px solid var(--signal-soft)',
              borderLeft: '4px solid var(--signal)',
              borderRadius: 14,
              padding: '24px 28px',
              marginBottom: 40,
            }}
          >
            <div
              style={{
                color: 'var(--signal)',
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontFamily: 'var(--ff-mono)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                <path d="M5 3l14 9-14 9V3z"/>
              </svg>
              The Signal
            </div>
            <div style={{ fontSize: 17, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: para1html }} />
          </div>
        )
      })()}

      {/* ── Section 5: By the Numbers ── */}
      {story.stats && story.stats.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          {/* Numbered section header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: 7,
                background: 'var(--text)',
                color: 'var(--bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                fontFamily: 'var(--ff-mono)',
                flexShrink: 0,
              }}
            >
              1
            </span>
            <div>
              <span
                style={{
                  fontFamily: 'var(--ff-mono)',
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.16em',
                  color: 'var(--text-mute)',
                }}
              >
                By the numbers
              </span>
            </div>
          </div>
          <h3
            style={{
              fontFamily: 'var(--ff-display)',
              fontSize: 30,
              lineHeight: 1.1,
              fontWeight: 400,
              letterSpacing: '-0.02em',
              marginBottom: 16,
            }}
          >
            The data shifted overnight.
          </h3>

          {/* 3-col stat grid */}
          <div
            className="stat-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}
          >
            {story.stats.map((stat, i) => (
              <div
                key={i}
                className="stat-card"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: 20,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.25s, border-color 0.25s, box-shadow 0.25s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.borderColor = 'var(--border-mid)'
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.06)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--ff-mono)',
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: 'var(--text-mute)',
                    marginBottom: 8,
                    fontWeight: 500,
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--ff-display)',
                    fontSize: 30,
                    lineHeight: 1,
                    marginBottom: 6,
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  {stat.value}
                  {stat.delta && (
                    <span style={{ fontStyle: 'italic', color: 'var(--green)', fontSize: 16 }}>
                      {stat.delta}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-mute)', lineHeight: 1.4 }}>
                  {stat.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Section 6: Block 2 — Why it matters (paras 2+3 + pull quote) ── */}
      {(() => {
        const paras = story.why_it_matters.split(/\n\n+/).map(p => p.trim()).filter(Boolean)
        const para2 = paras[1]
        const para3 = paras[2]
        if (!para2 && !story.pull_quote) return null
        const toHtml = (s: string) => s.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text);font-weight:600">$1</strong>')
        return (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <span
                style={{
                  width: 26, height: 26, borderRadius: 7,
                  background: 'var(--text)', color: 'var(--bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, fontFamily: 'var(--ff-mono)', flexShrink: 0,
                }}
              >2</span>
              <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--text-mute)' }}>
                Why it matters
              </span>
            </div>
            <h3
              style={{
                fontFamily: 'var(--ff-display)',
                fontSize: 30,
                lineHeight: 1.1,
                fontWeight: 400,
                letterSpacing: '-0.02em',
                marginBottom: 16,
              }}
            >
              The bigger picture.
            </h3>
            <div style={{ fontSize: 18, lineHeight: 1.7, color: 'var(--text-soft)' }}>
              {para2 && (
                <p style={{ marginBottom: 20 }} dangerouslySetInnerHTML={{ __html: toHtml(para2) }} />
              )}
              {story.pull_quote && (
                <div style={{ margin: '28px 0', padding: '28px 32px', background: 'var(--bg-soft)', borderRadius: 14, position: 'relative' }}>
                  <span aria-hidden="true" style={{ position: 'absolute', top: 14, left: 18, fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontSize: 56, color: 'var(--text-faint)', lineHeight: 0.9, opacity: 0.5 }}>&ldquo;</span>
                  <p style={{ fontFamily: 'var(--ff-display)', fontSize: 24, lineHeight: 1.3, fontWeight: 400, letterSpacing: '-0.012em', paddingLeft: 36 }}>{story.pull_quote}</p>
                  <div style={{ marginTop: 14, paddingLeft: 36, fontFamily: 'var(--ff-mono)', fontSize: 11, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 500 }}>— AI Signal Editorial</div>
                </div>
              )}
              {para3 && (
                <p dangerouslySetInnerHTML={{ __html: toHtml(para3) }} />
              )}
            </div>
          </div>
        )
      })()}

      {/* ── Section 7: Role lenses ── */}

      {/* Builder lens — dark block style from HTML reference */}
      {story.lens_builder && (
        <div
          className="builder-block"
          style={{
            background: 'linear-gradient(135deg, #14110F, #1F1A16)',
            color: 'white',
            borderRadius: 16,
            padding: 32,
            position: 'relative',
            overflow: 'hidden',
            marginBottom: 32,
          }}
        >
          {/* Ambient glow */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '-40%',
              right: '-10%',
              width: 400,
              height: 400,
              background: 'radial-gradient(circle, var(--signal) 0%, transparent 60%)',
              opacity: 0.18,
              pointerEvents: 'none',
              filter: 'blur(40px)',
            }}
          />

          {/* Builder eyebrow */}
          <div
            style={{
              color: 'rgba(255,255,255,0.6)',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: 'var(--ff-mono)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 6,
                height: 6,
                background: 'var(--green)',
                borderRadius: '50%',
                boxShadow: '0 0 8px var(--green)',
                animation: 'livePulse 1.8s ease-in-out infinite',
                flexShrink: 0,
              }}
            />
            The Build · viewed from the code floor
          </div>

          {/* Builder copy */}
          <p
            style={{
              fontFamily: 'var(--ff-display)',
              fontSize: 26,
              lineHeight: 1.32,
              color: 'white',
              fontWeight: 400,
              letterSpacing: '-0.01em',
              marginBottom: 20,
              position: 'relative',
              zIndex: 1,
            }}
          >
            {story.lens_builder}
          </p>

          {/* Attribution */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6E7BFF, #2B5BFF)',
                flexShrink: 0,
              }}
            />
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.3 }}>
              <strong style={{ color: 'white', fontWeight: 600 }}>AI Signal · The Build</strong>
              <br />
              Editorial perspective from the code floor
            </div>
          </div>
        </div>
      )}

      {/* ── Section 7b/c: The Bet + The Burn — secondary lens cards ── */}
      {(story.lens_pm || story.lens_founder) && (
        <>
          <style>{`
            .lens-secondary {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
              margin-bottom: 40px;
              margin-top: -28px;
            }
            @media (max-width: 720px) {
              .lens-secondary { grid-template-columns: 1fr; }
            }
            .lens-card {
              background: var(--bg-card);
              border: 1px solid var(--border);
              border-radius: 12px;
              padding: 22px 22px 18px;
              transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
            }
            .lens-card:hover {
              border-color: var(--border-mid);
              transform: translateY(-2px);
              box-shadow: 0 8px 22px rgba(0,0,0,0.05);
            }
          `}</style>
          <div className="lens-secondary">
            {story.lens_pm && (
              <div className="lens-card">
                <div
                  style={{
                    fontFamily: 'var(--ff-display)',
                    fontStyle: 'italic',
                    fontSize: 16,
                    fontWeight: 500,
                    letterSpacing: '-0.01em',
                    color: 'var(--warm)',
                    marginBottom: 12,
                    lineHeight: 1,
                  }}
                >
                  The Bet
                </div>
                <p
                  style={{
                    fontFamily: 'var(--ff-display)',
                    fontSize: 17,
                    lineHeight: 1.4,
                    color: 'var(--text)',
                    fontWeight: 400,
                    letterSpacing: '-0.01em',
                    marginBottom: 14,
                  }}
                >
                  {story.lens_pm}
                </p>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    fontFamily: 'var(--ff-mono)',
                    fontSize: 10,
                    color: 'var(--text-mute)',
                    fontWeight: 500,
                    letterSpacing: '0.04em',
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      background: 'var(--warm)',
                      borderRadius: '50%',
                      flexShrink: 0,
                    }}
                  />
                  AI Signal · viewed from the bet
                </div>
              </div>
            )}
            {story.lens_founder && (
              <div className="lens-card">
                <div
                  style={{
                    fontFamily: 'var(--ff-display)',
                    fontStyle: 'italic',
                    fontSize: 16,
                    fontWeight: 500,
                    letterSpacing: '-0.01em',
                    color: 'var(--green)',
                    marginBottom: 12,
                    lineHeight: 1,
                  }}
                >
                  The Burn
                </div>
                <p
                  style={{
                    fontFamily: 'var(--ff-display)',
                    fontSize: 17,
                    lineHeight: 1.4,
                    color: 'var(--text)',
                    fontWeight: 400,
                    letterSpacing: '-0.01em',
                    marginBottom: 14,
                  }}
                >
                  {story.lens_founder}
                </p>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    fontFamily: 'var(--ff-mono)',
                    fontSize: 10,
                    color: 'var(--text-mute)',
                    fontWeight: 500,
                    letterSpacing: '0.04em',
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      background: 'var(--green)',
                      borderRadius: '50%',
                      flexShrink: 0,
                    }}
                  />
                  AI Signal · viewed from the burn
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Section 8: The Move — action checklist ── */}
      {story.action_items && story.action_items.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: 7,
                background: 'var(--text)',
                color: 'var(--bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                fontFamily: 'var(--ff-mono)',
                flexShrink: 0,
              }}
            >
              3
            </span>
            <span
              style={{
                fontFamily: 'var(--ff-mono)',
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.16em',
                color: 'var(--text-mute)',
              }}
            >
              The move · next 48h
            </span>
          </div>
          <h3
            style={{
              fontFamily: 'var(--ff-display)',
              fontSize: 30,
              lineHeight: 1.1,
              fontWeight: 400,
              letterSpacing: '-0.02em',
              marginBottom: 16,
            }}
          >
            Three things to do tomorrow.
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {story.action_items.filter((item): item is string => typeof item === 'string').map((item, i) => (
              <li
                key={i}
                style={{
                  display: 'flex',
                  gap: 14,
                  padding: '18px 20px',
                  background: 'var(--green-soft)',
                  border: '1px solid rgba(27,122,62,0.18)',
                  borderRadius: 12,
                  transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(2px)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(27,122,62,0.08)'
                  e.currentTarget.style.borderColor = 'rgba(27,122,62,0.32)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = 'rgba(27,122,62,0.18)'
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: 'var(--green)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  ✓
                </span>
                <span style={{ fontSize: 16, lineHeight: 1.55 }}>{renderAction(item)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Section 8b: Standup snippet ── */}
      <StandupCard story={story} />

      {/* ── Section 9: Devil's Advocate ── */}
      {story.counter_view && (
        <div
          style={{
            background: 'var(--beige)',
            border: '1px solid var(--beige-deep)',
            borderRadius: 14,
            padding: 28,
            marginBottom: 40,
            position: 'relative',
          }}
        >
          {/* Stamp */}
          <span
            style={{
              position: 'absolute',
              top: -10,
              right: 24,
              background: 'var(--text)',
              color: 'var(--bg)',
              padding: '4px 10px',
              borderRadius: 6,
              fontFamily: 'var(--ff-mono)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              transform: 'rotate(2deg)',
              display: 'inline-block',
            }}
          >
            Devil&apos;s Advocate
          </span>
          <div
            style={{
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: 'var(--ff-mono)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--text-mute)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"/><path d="M12 9v4M12 17h.01"/>
            </svg>
            The Counter-View
          </div>
          <h4
            style={{
              fontFamily: 'var(--ff-display)',
              fontSize: 24,
              lineHeight: 1.2,
              marginBottom: 12,
              fontWeight: 400,
              letterSpacing: '-0.015em',
            }}
          >
            {story.counter_view_headline ?? 'Another angle.'}
          </h4>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--text-soft)' }}>
            {parseBold(story.counter_view ?? '')}
          </p>
        </div>
      )}

      {/* ── Section 10: Deeper read ── */}
      {story.deeper_read && (
        <div
          style={{
            padding: '22px 26px',
            background: 'var(--bg-soft)',
            border: '1px solid var(--border)',
            borderLeft: '3px solid var(--signal)',
            borderRadius: 12,
            marginTop: 32,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--ff-mono)',
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              color: 'var(--signal)',
              marginBottom: 10,
            }}
          >
            Deeper read
          </div>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--text-soft)' }}>
            {story.deeper_read}
          </p>
        </div>
      )}

      {/* ── Section 11: Sources ── */}
      {story.sources && story.sources.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div
            style={{
              fontFamily: 'var(--ff-mono)',
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              color: 'var(--text-faint)',
              marginBottom: 10,
            }}
          >
            Sources
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {story.sources.map((src, i) => (
              <a
                key={i}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 18px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  textDecoration: 'none',
                  color: 'var(--text)',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--signal)'
                  e.currentTarget.style.background = 'var(--signal-faint)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.background = 'var(--bg-card)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 8,
                      background: 'var(--text)',
                      color: 'var(--bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--ff-mono)',
                      fontWeight: 800,
                      fontSize: 15,
                      flexShrink: 0,
                    }}
                  >
                    {domainInitial(src.url)}
                  </div>
                  <div style={{ lineHeight: 1.3 }}>
                    <div
                      style={{
                        fontFamily: 'var(--ff-mono)',
                        fontSize: 10,
                        fontWeight: 600,
                        color: 'var(--text-mute)',
                        marginBottom: 2,
                        textTransform: 'lowercase',
                      }}
                    >
                      {(() => { try { return new URL(src.url).hostname.replace('www.', '') } catch { return '' } })()}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>{src.label}</div>
                  </div>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-mute)', flexShrink: 0, transition: 'all 0.2s' }}>
                  <path d="M7 17L17 7M9 7h8v8"/>
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── Section 12: Read stamp ── */}
      <div
        style={{
          marginTop: 32,
          padding: 20,
          textAlign: 'center',
          fontFamily: 'var(--ff-hand)',
          fontSize: 22,
          color: 'var(--text-mute)',
          borderTop: '1px dashed var(--border-mid)',
          lineHeight: 1.3,
        }}
      >
        You read{' '}
        <strong style={{ color: 'var(--signal)' }}>{readPct}%</strong>{' '}
        of today&apos;s signal.
        <br />
        That puts you ahead of most readers.
      </div>

      {/* ── Section 13: Feedback vote ── */}
      <FeedbackVote />
    </article>
  )
}
