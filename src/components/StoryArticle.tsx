'use client'

import React, { useState, useEffect, useRef } from 'react'
import type { Database } from '../../db/types/database'
import { BuilderCard } from './BuilderCard'
import { CounterView } from './CounterView'
import { EditorialQuote } from './EditorialQuote'
import { InsightsStrip } from './InsightsStrip'
import { CascadeTimeline } from './CascadeTimeline'
import { StakeholdersGrid } from './StakeholdersGrid'
import { PrimaryChart } from './PrimaryChart'
import { DecisionAid } from './DecisionAid'
import { ReactionsPanel } from './ReactionsPanel'
import { InlineChaiStrip } from './InlineChaiStrip'
import { PMAngle } from './PMAngle'
import type { InsightCell, CascadeData, StakeholdersData, ComparisonChart, DecisionAid as DecisionAidData, Reaction, StandupMessages } from '@/lib/types/extended-data'

// ---------- Text helpers ----------

function parseBold(text: string): React.ReactNode {
  if (!text.includes('**')) return text
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part
  )
}

function renderAction(text: string): React.ReactNode {
  if (text.includes('**')) return parseBold(text)
  // Auto-bold: everything up to the first period + space after ≥8 chars
  const m = text.match(/^(.{8,}?[.])\s+/)
  if (m) return <><strong>{m[1]}</strong>{' '}{text.slice(m[0].length)}</>
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

function ShareButtons({ headline, signalNumber }: { headline: string; signalNumber: number }) {
  const [copied, setCopied] = useState(false)
  const articleUrl = `https://aisignal.so/signal/${signalNumber}`

  function shareX() {
    const text = encodeURIComponent(`${headline} — via AI Signal`)
    const url = encodeURIComponent(articleUrl)
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  function copyLink() {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard
        .writeText(articleUrl)
        .then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        })
        .catch(() => {
          /* clipboard unavailable */
        })
    }
  }

  return (
    <div className="share-row">
      <span className="share-label">Share —</span>

      {/* X / Twitter */}
      <button type="button" onClick={shareX} aria-label="Share on X" className="share-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </button>

      {/* Copy link */}
      <button type="button" onClick={copyLink} aria-label="Copy link" className="share-btn">
        {copied
          ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
          : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        }
      </button>
    </div>
  )
}



// ---------- FeedbackVote ----------

type VoteKey = 'changed' | 'thinking' | 'known' | 'irrelevant'

const VOTE_BUTTONS: { key: VoteKey; icon: string; label: string }[] = [
  { key: 'changed',    icon: '✓', label: 'Changed my decision' },
  { key: 'thinking',  icon: '◐', label: 'Made me think' },
  { key: 'known',     icon: '○', label: 'Already knew this' },
  { key: 'irrelevant',icon: '×', label: 'Not relevant' },
]

function FeedbackVote({ signalNumber }: { signalNumber: number }) {
  const storageKey = `vote-${signalNumber}`
  const [voted, setVoted] = useState<VoteKey | null>(() => {
    try { return (localStorage.getItem(storageKey) as VoteKey | null) } catch { return null }
  })

  function handleVote(key: VoteKey) {
    setVoted(key)
    try { localStorage.setItem(storageKey, key) } catch {}
  }

  return (
    <div className="feedback-vote">
      <div className="feedback-eyebrow">Was this useful today?</div>
      <div className="feedback-buttons">
        {VOTE_BUTTONS.map(({ key, icon, label }) => (
          <button
            key={key}
            type="button"
            className={`feedback-btn${voted === key ? ' voted-state' : ''}`}
            onClick={() => handleVote(key)}
            data-vote={key}
          >
            <span className="feedback-icon">{icon}</span>
            {label}
          </button>
        ))}
      </div>
      <div className={`feedback-thanks${voted ? ' shown' : ''}`}>
        Noted. See you tomorrow at 06:14.
      </div>
    </div>
  )
}

// ---------- ActionChecklist ----------

const ACTION_TAGS = [
  { label: 'Run',   cls: 'run',   icon: '▶' },
  { label: 'Flag',  cls: 'flag',  icon: '⚑' },
  { label: 'Check', cls: 'check', icon: '✓' },
] as const

function ActionChecklist({ items, signalNumber }: { items: string[]; signalNumber: number }) {
  const storageKey = `action-done-${signalNumber}`
  const [doneItems, setDoneItems] = useState<Set<number>>(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      return stored ? new Set(JSON.parse(stored) as number[]) : new Set()
    } catch { return new Set() }
  })

  function toggleItem(index: number) {
    setDoneItems((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      try { localStorage.setItem(storageKey, JSON.stringify([...next])) } catch {}
      return next
    })
  }

  const pct = items.length > 0 ? (doneItems.size / items.length) * 100 : 0

  return (
    <div className="block">
      <div className="block-header">
        <span className="block-num">3</span>
        <div><div className="block-eyebrow">The move · next 48h</div></div>
      </div>
      <h3 className="block-title">Three things to do tomorrow.</h3>
      <ul className="action-list">
        {items.map((item, i) => {
          const done = doneItems.has(i)
          const tag = ACTION_TAGS[i % 3]!
          return (
            <li
              key={i}
              className={`action-item${done ? ' done' : ''}`}
              onClick={() => toggleItem(i)}
            >
              <span className="action-num">
                <span>{i + 1}</span>
              </span>
              <div className="action-content">
                <span className={`action-tag ${tag.cls}`}>{tag.icon} {tag.label}</span>
                <div className="action-text">{renderAction(item)}</div>
              </div>
            </li>
          )
        })}
      </ul>
      <div className="action-progress">
        <strong>{doneItems.size} of {items.length} done</strong>
        <div className="action-progress-bar">
          <div className="action-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="action-progress-label">
          {doneItems.size === items.length && items.length > 0 ? '✓ All done' : 'Tap to mark done'}
        </span>
      </div>
    </div>
  )
}

// ---------- StandupCard ----------

type StandupFormat = 'slack' | 'email' | 'whatsapp' | 'linkedin'

function buildStandupContent(story: Story, signalNumber: number) {
  const tldr = story.headline
  const implication = story.summary.replace(/\*\*(.*?)\*\*/g, '$1').slice(0, 160)
  const actions = story.action_items ?? []
  const action0 = typeof actions[0] === 'string' ? actions[0].replace(/\*\*(.*?)\*\*/g, '$1') : 'Review the implications for your team.'
  const action1 = typeof actions[1] === 'string' ? actions[1].replace(/\*\*(.*?)\*\*/g, '$1') : 'Assess your current approach in light of this.'
  const action2 = typeof actions[2] === 'string' ? actions[2].replace(/\*\*(.*?)\*\*/g, '$1') : 'Share this signal with relevant stakeholders.'
  const articleUrl = `https://aisignal.so/signal/${signalNumber}`

  function getClipboard(format: StandupFormat): string {
    if (format === 'slack') {
      return `*🧠 AI Signal · Today*\n\n${tldr}\n\n→ *Why it matters:* ${implication}\n→ *What I'd do:* ${action0}\n\n_3 min read_ · ${articleUrl}`
    }
    if (format === 'email') {
      return `Hey —\n\nQuick share from this morning's AI Signal: ${tldr}\n\nThe implication: ${implication}\n\n${action0}\n\nFull read (3 min): ${articleUrl}\n\n— shared via AI Signal`
    }
    if (format === 'whatsapp') {
      return `*AI Signal · Today* 🧠\n\n${tldr.slice(0, 80)}.\n\n*Worth reading before your next meeting.*\n\n${articleUrl}`
    }
    // linkedin
    return `${tldr}\n\n${implication}\n\nThree things teams should do this week:\n\n→ ${action0}\n\n→ ${action1}\n\n→ ${action2}\n\nThe old defaults may now be the expensive choice.\n\nWhat's the first thing you'd change?\n\n—\nRead AI Signal — one AI story every day at 6:14 AM IST.\n\n${articleUrl}`
  }

  function getPreviewHtml(format: StandupFormat): string {
    if (format === 'slack') {
      return `<b>🧠 AI Signal · Today</b>\n\n${tldr}\n\n<span class="arrow">→</span> <b>Why it matters:</b> ${implication}\n<span class="arrow">→</span> <b>What I'd do:</b> ${action0}\n\n<span class="meta">3 min read</span> · <span class="url">${articleUrl}</span>`
    }
    if (format === 'email') {
      return `Hey —\n\nQuick share from this morning's AI Signal: ${tldr}\n\nThe implication: ${implication}\n\n${action0}\n\nFull read (3 min): <span class="url">${articleUrl}</span>\n\n<span class="meta">— shared via AI Signal</span>`
    }
    if (format === 'whatsapp') {
      return `<b>AI Signal · Today</b> 🧠\n\n${tldr.slice(0, 80)}.\n\n<b>Worth reading before your next meeting.</b>\n\n<span class="url">${articleUrl}</span>`
    }
    return `${tldr}\n\n${implication}\n\nThree things teams should do this week:\n\n<span class="arrow">→</span> ${action0}\n\n<span class="arrow">→</span> ${action1}\n\n<span class="arrow">→</span> ${action2}\n\n<i>The old defaults may now be the expensive choice.</i>\n\n<span class="url">${articleUrl}</span>`
  }

  return { getClipboard, getPreviewHtml }
}

function StandupCard({ story, signalNumber, standupMessages }: { story: Story; signalNumber: number; standupMessages?: StandupMessages | null }) {
  const [activeFormat, setActiveFormat] = useState<StandupFormat>('slack')
  const [copied, setCopied] = useState(false)
  const { getClipboard, getPreviewHtml } = buildStandupContent(story, signalNumber)

  // Use pre-formatted messages from extended_data when available
  const getClipboardFn = (fmt: StandupFormat) =>
    standupMessages?.[fmt] ?? getClipboard(fmt)
  const getPreviewFn = (fmt: StandupFormat) =>
    standupMessages?.[fmt]
      ? standupMessages[fmt]
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\n/g, '<br />')
      : getPreviewHtml(fmt)

  const FORMAT_LABELS: Record<StandupFormat, string> = {
    slack: 'Slack',
    email: 'Email',
    whatsapp: 'WhatsApp',
    linkedin: 'LinkedIn',
  }

  async function handleCopy() {
    const text = getClipboardFn(activeFormat)
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
    <div id="standup-card" className="standup-card">
      {/* Header */}
      <div className="standup-header">
        <div className="standup-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
            <rect x="9" y="3" width="6" height="3" rx="1"/><rect x="5" y="6" width="14" height="15" rx="2"/><path d="M9 12h6M9 16h4"/>
          </svg>
        </div>
        <div className="standup-header-text">
          <div className="standup-title">Bring this to your standup</div>
          <div className="standup-subtitle">06:14 IST · Quotable</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="standup-tabs-row">
        {(Object.keys(FORMAT_LABELS) as StandupFormat[]).map(fmt => (
          <button
            key={fmt}
            className={`standup-tab${activeFormat === fmt ? ' active' : ''}`}
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
        className="standup-preview"
        dangerouslySetInnerHTML={{ __html: getPreviewFn(activeFormat) }}
      />

      {/* Copy button */}
      <button
        type="button"
        onClick={handleCopy}
        className={`standup-copy-btn${copied ? ' copied' : ''}`}
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
  )
}

// ---------- StoryArticle ----------

export function StoryArticle({
  story,
  publishedAt,
  signalNumber,
  onReadPctChange,
}: StoryArticleProps) {
  const [readPct, setReadPct] = useState(0)

  // Extract V11 extended_data fields with null-safety
  const rawExt = story.extended_data as Record<string, unknown> | null
  const numbersHeadline  = typeof rawExt?.numbers_headline === 'string' ? rawExt.numbers_headline : null
  const mattersHeadline  = typeof rawExt?.matters_headline === 'string' ? rawExt.matters_headline : null
  const insightCells     = Array.isArray(rawExt?.insights_strip) ? (rawExt!.insights_strip as InsightCell[]) : null
  const cascadeData      = (rawExt?.cascade && typeof rawExt.cascade === 'object') ? (rawExt.cascade as CascadeData) : null
  const stakeholdersData = (rawExt?.stakeholders && typeof rawExt.stakeholders === 'object') ? (rawExt.stakeholders as StakeholdersData) : null
  const primaryChart     = (rawExt?.primary_chart && typeof rawExt.primary_chart === 'object') ? (rawExt.primary_chart as ComparisonChart) : null
  const decisionAidData  = (rawExt?.decision_aid && typeof rawExt.decision_aid === 'object') ? (rawExt.decision_aid as DecisionAidData) : null
  const reactions        = Array.isArray(rawExt?.reactions) ? (rawExt!.reactions as Reaction[]) : null
  const standupMessages  = (rawExt?.standup_messages && typeof rawExt.standup_messages === 'object') ? (rawExt.standup_messages as StandupMessages) : null
  const oneBreathText    = (rawExt?.one_breath && typeof (rawExt.one_breath as Record<string,unknown>)?.text === 'string') ? (rawExt.one_breath as { text: string }).text : null
  const articleRef = useRef<HTMLElement>(null)
  // High watermark — never decreases once set, locks at 100
  const highWatermark = useRef(0)
  // Engagement: user must pause ≥1s before progress commits
  const engaged = useRef(false)
  const engageTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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
      className="story-wrap"
    >
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
      <div className="story-meta">
        {/* Category chip */}
        <span className={`story-category cat-${story.category.toLowerCase()}`}>
          {story.category.toUpperCase()}
        </span>

        <span className="meta-text">{story.read_minutes} min read</span>

        <span className="story-meta-spacer" />
      </div>

      {/* ── Section 2: Headline + deck ── */}
      <h2 className="story-headline">
        {story.headline}
      </h2>

      <p className="story-deck">
        {parseBold(story.summary)}
      </p>

      {/* ── Section 3: Author row ── */}
      <div className="author-row">
        {/* Avatar with green presence dot */}
        <div className="author-avatar">
          SP
        </div>

        <div className="author-info">
          <div className="author-name">Suraj Pandita</div>
          <div className="author-handle">
            <a href="https://twitter.com/suraj132pandita" target="_blank" rel="noopener noreferrer" className="author-handle-link">@suraj132pandita</a>
            {' '}· today, 06:14 IST
          </div>
        </div>

        <ShareButtons headline={story.headline} signalNumber={signalNumber} />
      </div>

      {/* ── TL;DR strip — after author, before signal block (V11 order) ── */}
      {oneBreathText && (
        <div className="tldr-strip">
          <div className="tldr-icon">TL;DR</div>
          <div className="tldr-content">
            <div className="tldr-label">In one breath</div>
            <div className="tldr-text">{parseBold(oneBreathText)}</div>
          </div>
        </div>
      )}

      {/* ── Section 4: Signal block — shows why_it_matters para 1 (the sharp claim) ── */}
      {(() => {
        const para1 = story.why_it_matters
          ? story.why_it_matters.split(/\n\n+/).map(p => p.trim()).filter(Boolean)[0] ?? null
          : null
        if (!para1) return null
        return (
          <div className="signal-block" id="sec-signal">
            <div className="signal-eyebrow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="signal-eyebrow-icon">
                <path d="M5 3l14 9-14 9V3z"/>
              </svg>
              The Signal
            </div>
            <div
              className="signal-body"
              dangerouslySetInnerHTML={{ __html: para1.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
            />
          </div>
        )
      })()}

      {/* ── Section 5: By the Numbers ── */}
      {(() => {
        const statCards = (story.stats && story.stats.length > 0) ? story.stats : null
        if (!statCards) return null
        return (
          <div className="block" id="sec-numbers">
            <div className="block-header">
              <span className="block-num">1</span>
              <div>
                <div className="block-eyebrow">By the numbers</div>
              </div>
            </div>
            {numbersHeadline && <h3 className="block-title">{numbersHeadline}</h3>}
              <div className="stat-cards">
              {statCards.map((stat, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-card-label">{stat.label}</div>
                  <div className="stat-card-value">
                    {stat.value}
                    {stat.delta && (
                      <span className="delta-down">
                        {typeof stat.delta === 'object' && stat.delta !== null && 'text' in (stat.delta as object)
                          ? (stat.delta as { text: string }).text
                          : String(stat.delta)}
                      </span>
                    )}
                  </div>
                  <div className="stat-card-detail">{stat.detail}</div>
                </div>
              ))}
            </div>
            {primaryChart && <PrimaryChart chart={primaryChart} />}
          </div>
        )
      })()}

      {/* ── V11: Insights strip — after "By the numbers" ── */}
      {insightCells && insightCells.length > 0 && (
        <InsightsStrip cells={insightCells} />
      )}

      {/* ── Section 6: Block 2 — Why it matters ── */}
      {/* para1 is shown in Signal block above; here we render para2 → pull_quote → para3 */}
      {(() => {
        const paras = story.why_it_matters.split(/\n\n+/).map(p => p.trim()).filter(Boolean)
        const para2 = paras[1] ?? null
        const para3 = paras[2] ?? null
        const quote = story.pull_quote ?? story.editorial_take ?? null
        if (!para2 && !quote) return null
        const toHtml = (s: string) => s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        return (
          <div className="block" id="sec-context">
            <div className="block-header">
              <span className="block-num">2</span>
              <div>
                <div className="block-eyebrow">Why it matters</div>
              </div>
            </div>
            {mattersHeadline && <h3 className="block-title">{mattersHeadline}</h3>}
            <div className="context-body">
              {para2 && (
                <p dangerouslySetInnerHTML={{ __html: toHtml(para2) }} />
              )}
              {quote && (
                <EditorialQuote quote={quote} />
              )}
              {para3 && (
                <p dangerouslySetInnerHTML={{ __html: toHtml(para3) }} />
              )}
            </div>
          </div>
        )
      })()}

      {/* ── V11: Cascade timeline — after "Why it matters" ── */}
      {cascadeData && cascadeData.steps?.length > 0 && (
        <CascadeTimeline data={cascadeData} />
      )}

      {/* ── V11: Stakeholders grid — after cascade ── */}
      {stakeholdersData && stakeholdersData.cells?.length > 0 && (
        <StakeholdersGrid data={stakeholdersData} />
      )}

      {/* ── The PM read — strategic product implication, uses lens_pm ── */}
      {story.lens_pm && <PMAngle text={story.lens_pm} />}

      {/* ── Devil's Advocate — placed here so reader debates while story is fresh ── */}
      {story.counter_view && (
        <CounterView
          headline={story.counter_view_headline ?? 'Another angle.'}
          body={story.counter_view.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
        />
      )}

      {/* ── Builder / Founder / Editorial — The Build + The Bet + The Burn ── */}
      {story.editorial_take && (
        <BuilderCard
          buildQuote={story.editorial_take}
          betQuote={story.lens_builder ?? story.lens_pm ?? ''}
          burnQuote={story.lens_founder ?? story.lens_pm ?? ''}
        />
      )}

      {/* ── V11: Decision Aid — after builder card, before The Move ── */}
      {decisionAidData && decisionAidData.rows?.length > 0 && (
        <DecisionAid aid={decisionAidData} />
      )}

      {/* ── Section 8: The Move — action checklist ── */}
      {story.action_items && story.action_items.length > 0 && (
        <div id="sec-move">
          <ActionChecklist items={story.action_items.filter((item): item is string => typeof item === 'string')} signalNumber={signalNumber} />
        </div>
      )}

      {/* ── Inline chai ask — after action checklist, peak reader value ── */}
      <InlineChaiStrip />

      {/* ── Section 8b: Standup snippet ── */}
      <StandupCard story={story} signalNumber={signalNumber} standupMessages={standupMessages} />

      {/* ── V11: Reaction quotes — after counter-view, before sources ── */}
      {reactions && reactions.length > 0 && (
        <ReactionsPanel reactions={reactions} />
      )}

      {/* ── Section 11: Sources ── */}
      {story.sources && story.sources.length > 0 && (
        <div className="sources-block">
          <div className="sources-header">
            <span className="sources-label">Sources</span>
            <span className="sources-count">{story.sources.length} reference{story.sources.length !== 1 ? 's' : ''} · primary + corroborating</span>
          </div>
          <div className="sources-list">
            {story.sources.map((src, i) => {
              const domain = (() => {
                try { return new URL(src.url).hostname.replace('www.', '') }
                catch { return src.url }
              })()
              const tagCls = i === 0 ? 'primary' : i === 1 ? 'analyst' : 'community'
              const tagLabel = i === 0 ? 'Primary' : i === 1 ? 'Benchmark' : 'Community'
              const rank = String(i + 1).padStart(2, '0')
              const initial = domain.charAt(0).toUpperCase()
              return (
                <a
                  key={i}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`source-card ${i === 0 ? 'primary' : ''}`}
                >
                  <span className="source-rank">{rank}</span>
                  <span className={`source-favicon source-favicon-${Math.min(i, 2)}`}>{initial}</span>
                  <div className="source-info">
                    <div className="source-name">{domain}</div>
                    <div className="source-title">{src.label}</div>
                  </div>
                  <span className={`source-tag ${tagCls}`}>{tagLabel}</span>
                  <span className="source-arrow" aria-hidden="true">↗</span>
                </a>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Section 12: Read stamp ── */}
      <div className="read-stamp">
        You read{' '}
        <strong>{readPct}%</strong>{' '}
        of Signal #{signalNumber}.
      </div>

      {/* ── Section 13: Feedback vote ── */}
      <FeedbackVote signalNumber={signalNumber} />
    </article>
  )
}
