"use client";

import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ActionTemplate {
  owner: string;
  action: string;
  by: string;
}

interface CriticalStory {
  id: string;
  tier: "critical";
  headline: string;
  summary: string;
  actionTemplate: ActionTemplate;
  url: string;
  source: string;
  ctaLabel: string;
}

interface MonitorStory {
  id: string;
  tier: "monitor";
  headline: string;
  summary: string;
  url: string;
  source: string;
  ctaLabel: string;
}

interface ToolStory {
  id: string;
  tier: "tool";
  headline: string;
  summary: string;
  url: string;
  source: string;
  ctaLabel: string;
}

export interface BriefContent {
  criticalStories: CriticalStory[];
  monitorStories: MonitorStory[];
  toolOfDay?: ToolStory;
  ctaPrompt: string;
}

export interface BriefViewProps {
  slug: string;
  date: string;
  freeBrief: BriefContent;
  proBrief: BriefContent;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtLong(date: string) {
  if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) return date;
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

function fmtShort(date: string) {
  if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) return date;
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionBanner({ label }: { label: string }) {
  return (
    <div style={{
      background: "#111111",
      padding: "11px 24px",
      textAlign: "center",
    }}>
      <span style={{
        fontSize: "11px", fontWeight: 800, letterSpacing: "0.18em",
        textTransform: "uppercase", color: "#ffffff",
      }}>
        {label}
      </span>
    </div>
  );
}

function CriticalCard({ story, rank }: { story: CriticalStory; rank: number }) {
  const hasAction = story.actionTemplate?.action && !story.actionTemplate.action.includes("🔒");

  return (
    <div style={{
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      padding: "22px 24px",
      margin: "16px 0",
    }}>
      {/* Source label */}
      <p style={{
        fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em",
        textTransform: "uppercase", color: "#9ca3af", margin: "0 0 10px",
      }}>
        {story.source}
      </p>

      {/* Headline */}
      <h2 style={{
        fontSize: "19px", fontWeight: 800, color: "#111111",
        lineHeight: 1.3, letterSpacing: "-0.02em", margin: "0 0 14px",
        fontFamily: "var(--font-fraunces, serif)",
      }}>
        🔴 {story.headline}
      </h2>

      {/* The Signal */}
      <p style={{ fontSize: "15px", color: "#374151", lineHeight: 1.7, margin: "0 0 14px" }}>
        <strong style={{ color: "#111111" }}>The Signal: </strong>
        {story.summary}
      </p>

      {/* Action template */}
      {hasAction && (
        <div style={{
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: "6px",
          padding: "14px 16px",
          margin: "0 0 16px",
        }}>
          <p style={{
            fontSize: "11px", fontWeight: 800, letterSpacing: "0.14em",
            textTransform: "uppercase", color: "#15803d", margin: "0 0 10px",
          }}>
            What to do
          </p>
          <ul style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: "5px" }}>
            <li style={{ fontSize: "14px", color: "#1f2937", lineHeight: 1.55 }}>
              <strong>Owner:</strong> {story.actionTemplate.owner}
            </li>
            <li style={{ fontSize: "14px", color: "#1f2937", lineHeight: 1.55 }}>
              <strong>Action:</strong> {story.actionTemplate.action}
            </li>
            <li style={{ fontSize: "14px", color: "#1f2937", lineHeight: 1.55 }}>
              <strong>By:</strong> {story.actionTemplate.by}
            </li>
          </ul>
        </div>
      )}

      {/* Read more */}
      <a
        href={story.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontSize: "14px", fontWeight: 600, color: "#2563eb",
          textDecoration: "none",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "underline"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "none"; }}
      >
        {story.ctaLabel || "Read more"} →
      </a>
    </div>
  );
}

function MonitorRow({ story, rank }: { story: MonitorStory; rank: number }) {
  return (
    <div style={{
      padding: "16px 0",
      borderBottom: "1px solid #f3f4f6",
      display: "flex", gap: "14px", alignItems: "flex-start",
    }}>
      <span style={{
        fontSize: "12px", fontWeight: 700, color: "#d1d5db",
        fontFamily: "var(--font-jetbrains, monospace)",
        minWidth: "24px", flexShrink: 0, paddingTop: "2px",
        letterSpacing: "0.04em",
      }}>
        {String(rank).padStart(2, "0")}
      </span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9ca3af", margin: "0 0 6px" }}>
          {story.source}
        </p>
        <h4 style={{
          fontSize: "15px", fontWeight: 700, color: "#111111",
          lineHeight: 1.4, margin: "0 0 6px", letterSpacing: "-0.01em",
        }}>
          🔵 {story.headline}
        </h4>
        <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: 1.65, margin: "0 0 8px" }}>
          {story.summary}
        </p>
        <a
          href={story.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: "13px", fontWeight: 600, color: "#2563eb", textDecoration: "none" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "underline"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "none"; }}
        >
          {story.ctaLabel || "Read more"} →
        </a>
      </div>
    </div>
  );
}

// ── Main BriefView ────────────────────────────────────────────────────────────

export function BriefView({ slug, date, freeBrief, proBrief }: BriefViewProps) {
  // Everything is free — always show full content
  const brief = proBrief ?? freeBrief;
  const { criticalStories = [], monitorStories = [], toolOfDay, ctaPrompt } = brief;
  const allHeadlines = [
    ...criticalStories.map((s) => s.headline),
    ...monitorStories.map((s) => s.headline),
    ...(toolOfDay ? [toolOfDay.headline] : []),
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>

      {/* ── Dark sticky navbar ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "#0f0f0f",
        borderBottom: "1px solid #222",
        height: "50px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
      }}>
        <Link href="/" style={{
          fontSize: "13px", fontWeight: 800, letterSpacing: "0.06em",
          textTransform: "uppercase", color: "#ffffff", textDecoration: "none",
        }}>
          AI Signal
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <span style={{ fontSize: "12px", color: "#6b7280" }}>
            {fmtShort(date)}
          </span>
          <Link href="/brief" style={{
            fontSize: "12px", fontWeight: 600, color: "#9ca3af", textDecoration: "none",
          }}>
            Latest
          </Link>
          <Link href="/" style={{
            fontSize: "12px", fontWeight: 700, color: "#ffffff",
            background: "#7C3AED", borderRadius: "6px",
            padding: "5px 14px", textDecoration: "none",
          }}>
            Subscribe free
          </Link>
        </div>
      </header>

      {/* ── Newsletter container ── */}
      <main style={{ maxWidth: "660px", margin: "28px auto 60px", background: "#ffffff", borderRadius: "2px" }}>

        {/* ── Masthead banner ── */}
        <div style={{
          background: "#0f0f0f",
          padding: "28px 24px 24px",
          textAlign: "center",
        }}>
          <p style={{
            fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em",
            textTransform: "uppercase", color: "#6b7280", marginBottom: "8px",
          }}>
            {fmtLong(date)}
          </p>
          <h1 style={{
            fontSize: "28px", fontWeight: 800, color: "#ffffff",
            letterSpacing: "-0.025em", lineHeight: 1.15, margin: "0 0 6px",
            fontFamily: "var(--font-fraunces, serif)",
          }}>
            AI Signal
          </h1>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: 0, letterSpacing: "0.02em" }}>
            Daily intelligence for startup CTOs
          </p>
        </div>

        {/* ── Greeting box ── */}
        <div style={{
          margin: "20px 20px 0",
          border: "1px solid #e5e7eb",
          borderRadius: "6px",
          padding: "18px 20px",
        }}>
          <p style={{ fontSize: "15px", color: "#1f2937", lineHeight: 1.7, margin: "0 0 12px" }}>
            <strong>Good morning, CTOs.</strong> Here&apos;s today&apos;s briefing — {criticalStories.length} critical signals requiring action, {monitorStories.length} to track this week{toolOfDay ? ", and one tool worth your attention" : ""}.
          </p>
          <p style={{ fontSize: "15px", color: "#4b5563", lineHeight: 1.7, margin: 0 }}>
            Each story is scored on infra impact, speed-to-action, and competitive relevance — filtered through a CTO lens so you can move fast.
          </p>
        </div>

        {/* ── TOC box ── */}
        {allHeadlines.length > 0 && (
          <div style={{
            margin: "16px 20px 0",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            padding: "16px 20px",
          }}>
            <p style={{ fontSize: "13px", fontWeight: 700, color: "#374151", margin: "0 0 10px" }}>
              In today&apos;s AI Signal:
            </p>
            <ul style={{ margin: 0, padding: "0 0 0 18px", display: "flex", flexDirection: "column", gap: "6px" }}>
              {allHeadlines.map((h, i) => (
                <li key={i} style={{ fontSize: "13px", color: "#4b5563", lineHeight: 1.5 }}>
                  {h}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ height: "20px" }} />

        {/* ── CRITICAL section ── */}
        {criticalStories.length > 0 && (
          <>
            <SectionBanner label="🔴 Critical Signals — Act Today" />
            <div style={{ padding: "4px 20px 8px" }}>
              {criticalStories.map((story, i) => (
                <CriticalCard key={story.id} story={story} rank={i + 1} />
              ))}
            </div>
          </>
        )}

        {/* ── MONITOR section ── */}
        {monitorStories.length > 0 && (
          <>
            <SectionBanner label="🔵 Monitor — Watch This Week" />
            <div style={{ padding: "8px 20px 16px" }}>
              {monitorStories.map((story, i) => (
                <MonitorRow key={story.id} story={story} rank={criticalStories.length + i + 1} />
              ))}
            </div>
          </>
        )}

        {/* ── Tool of Day ── */}
        {toolOfDay && (
          <>
            <SectionBanner label="⚡ Tool of the Day" />
            <div style={{ padding: "16px 20px 20px" }}>
              <div style={{
                border: "1px solid #fde68a",
                background: "#fffbeb",
                borderRadius: "8px",
                padding: "18px 20px",
              }}>
                <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#92400e", margin: "0 0 8px" }}>
                  {toolOfDay.source}
                </p>
                <h4 style={{ fontSize: "17px", fontWeight: 700, color: "#111111", lineHeight: 1.35, margin: "0 0 8px" }}>
                  ⚡ {toolOfDay.headline}
                </h4>
                <p style={{ fontSize: "14px", color: "#374151", lineHeight: 1.7, margin: "0 0 12px" }}>
                  {toolOfDay.summary}
                </p>
                <a
                  href={toolOfDay.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "14px", fontWeight: 600, color: "#d97706", textDecoration: "none" }}
                >
                  {toolOfDay.ctaLabel || "Try it"} →
                </a>
              </div>
            </div>
          </>
        )}

        {/* ── CTO Prompt ── */}
        {ctaPrompt && (
          <>
            <SectionBanner label="💭 Team Discussion Prompt" />
            <div style={{ padding: "20px" }}>
              <div style={{
                borderLeft: "4px solid #7C3AED",
                paddingLeft: "16px",
              }}>
                <p style={{
                  fontSize: "16px", color: "#1f2937", lineHeight: 1.75,
                  fontStyle: "italic", margin: 0,
                }}>
                  &ldquo;{ctaPrompt}&rdquo;
                </p>
              </div>
            </div>
          </>
        )}

        {/* ── Footer ── */}
        <div style={{
          background: "#f9fafb",
          borderTop: "1px solid #e5e7eb",
          padding: "20px 24px",
          textAlign: "center",
        }}>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 10px" }}>
            <Link href="/brief" style={{ color: "#7C3AED", textDecoration: "none", fontWeight: 600 }}>Latest brief</Link>
            {" · "}
            <Link href="/" style={{ color: "#9ca3af", textDecoration: "none" }}>Subscribe</Link>
            {" · "}
            <span style={{ color: "#9ca3af" }}>AI Signal · {slug}</span>
          </p>
          <p style={{ fontSize: "11px", color: "#d1d5db", margin: 0 }}>
            Delivered 5:30 AM IST · Mon – Fri
          </p>
        </div>

      </main>
    </div>
  );
}
