"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getBrowserClient } from "@/lib/supabase";

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

// ── Design helpers ────────────────────────────────────────────────────────────

function SectionRule({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "0 0 28px" }}>
      <span style={{
        fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em",
        textTransform: "uppercase", color, whiteSpace: "nowrap",
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
    </div>
  );
}

function SourceChip({ source }: { source: string }) {
  return (
    <span style={{
      fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em",
      textTransform: "uppercase", color: "rgba(245,240,232,0.4)",
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "4px", padding: "2px 7px",
    }}>
      {source}
    </span>
  );
}

function ActionBlock({ action, isPro }: { action: ActionTemplate; isPro: boolean }) {
  const blurred = action.action.includes("🔒") || !isPro;
  if (blurred) {
    return (
      <div style={{
        margin: "14px 0 10px",
        background: "rgba(124,58,237,0.06)",
        border: "1px dashed rgba(124,58,237,0.3)",
        borderRadius: "8px",
        padding: "14px 16px",
      }}>
        <p style={{ fontSize: "12px", color: "#A78BFA", fontWeight: 600, marginBottom: "4px" }}>
          🔒 Action template — Pro only
        </p>
        <p style={{ fontSize: "12px", color: "rgba(245,240,232,0.35)", marginBottom: "12px", lineHeight: 1.5 }}>
          Who owns this, what to do, and by when — unlocked for Pro subscribers.
        </p>
        <Link href="/upgrade" style={{
          display: "inline-block", background: "#7C3AED", color: "#F5F0E8",
          fontSize: "12px", fontWeight: 700, padding: "7px 14px", borderRadius: "6px",
          textDecoration: "none",
        }}>
          Upgrade to Pro →
        </Link>
      </div>
    );
  }
  return (
    <div style={{
      margin: "14px 0 10px",
      borderLeft: "2px solid #22C55E",
      paddingLeft: "14px",
    }}>
      <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#22C55E", marginBottom: "8px" }}>
        Action Required
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <p style={{ fontSize: "13px", color: "rgba(245,240,232,0.7)", lineHeight: 1.5 }}>
          <span style={{ color: "rgba(245,240,232,0.45)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Owner · </span>
          {action.owner}
        </p>
        <p style={{ fontSize: "13px", color: "rgba(245,240,232,0.85)", lineHeight: 1.6 }}>
          <span style={{ color: "rgba(245,240,232,0.45)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Action · </span>
          {action.action}
        </p>
        <p style={{ fontSize: "13px", color: "rgba(245,240,232,0.7)", lineHeight: 1.5 }}>
          <span style={{ color: "rgba(245,240,232,0.45)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>By · </span>
          {action.by}
        </p>
      </div>
    </div>
  );
}

function CriticalRow({ story, rank, isPro }: { story: CriticalStory; rank: number; isPro: boolean }) {
  return (
    <div style={{ display: "flex", gap: "20px", paddingBottom: "28px", marginBottom: "28px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      {/* Rank */}
      <span style={{
        fontSize: "28px", fontWeight: 800, color: "rgba(239,68,68,0.15)",
        lineHeight: 1, minWidth: "32px", flexShrink: 0, fontVariantNumeric: "tabular-nums",
        letterSpacing: "-0.03em", marginTop: "2px",
        fontFamily: "var(--font-jetbrains, monospace)",
      }}>
        {String(rank).padStart(2, "0")}
      </span>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Source + tier chip */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
          <SourceChip source={story.source} />
          <span style={{
            fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "#EF4444",
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "4px", padding: "2px 7px",
          }}>
            Critical
          </span>
        </div>

        {/* Headline */}
        <h3 style={{
          fontSize: "18px", fontWeight: 700, color: "#F5F0E8",
          lineHeight: 1.35, letterSpacing: "-0.015em", margin: "0 0 10px",
          fontFamily: "var(--font-fraunces, serif)",
        }}>
          {story.headline}
        </h3>

        {/* Summary */}
        <p style={{ fontSize: "14px", color: "rgba(245,240,232,0.6)", lineHeight: 1.7, margin: "0 0 4px" }}>
          {story.summary}
        </p>

        {/* Action template */}
        <ActionBlock action={story.actionTemplate} isPro={isPro} />

        {/* Read more */}
        <a
          href={story.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: "13px", color: "#A78BFA", fontWeight: 500, textDecoration: "none" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#C4B5FD"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#A78BFA"; }}
        >
          {story.ctaLabel || "Read more →"}
        </a>
      </div>
    </div>
  );
}

function MonitorRow({ story, rank }: { story: MonitorStory; rank: number }) {
  return (
    <div style={{ display: "flex", gap: "20px", paddingBottom: "20px", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      {/* Rank */}
      <span style={{
        fontSize: "22px", fontWeight: 800, color: "rgba(59,130,246,0.15)",
        lineHeight: 1, minWidth: "32px", flexShrink: 0, fontVariantNumeric: "tabular-nums",
        letterSpacing: "-0.03em", marginTop: "2px",
        fontFamily: "var(--font-jetbrains, monospace)",
      }}>
        {String(rank).padStart(2, "0")}
      </span>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
          <SourceChip source={story.source} />
          <span style={{
            fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "#3B82F6",
            background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)",
            borderRadius: "4px", padding: "2px 7px",
          }}>
            Monitor
          </span>
        </div>

        <h4 style={{
          fontSize: "15px", fontWeight: 600, color: "rgba(245,240,232,0.9)",
          lineHeight: 1.45, letterSpacing: "-0.01em", margin: "0 0 7px",
        }}>
          {story.headline}
        </h4>

        <p style={{ fontSize: "13px", color: "rgba(245,240,232,0.5)", lineHeight: 1.65, margin: "0 0 8px" }}>
          {story.summary}
        </p>

        <a
          href={story.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: "12px", color: "#60A5FA", fontWeight: 500, textDecoration: "none" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#93C5FD"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#60A5FA"; }}
        >
          {story.ctaLabel || "Read more →"}
        </a>
      </div>
    </div>
  );
}

function ToolRow({ story }: { story: ToolStory }) {
  return (
    <div style={{ padding: "20px", background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.12)", borderRadius: "10px", marginBottom: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
        <SourceChip source={story.source} />
        <span style={{
          fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em",
          textTransform: "uppercase", color: "#F59E0B",
          background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: "4px", padding: "2px 7px",
        }}>
          Tool of the Day
        </span>
      </div>
      <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#F5F0E8", lineHeight: 1.4, margin: "0 0 8px" }}>
        {story.headline}
      </h4>
      <p style={{ fontSize: "13px", color: "rgba(245,240,232,0.55)", lineHeight: 1.65, margin: "0 0 10px" }}>
        {story.summary}
      </p>
      <a
        href={story.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: "12px", color: "#F59E0B", fontWeight: 500, textDecoration: "none" }}
      >
        {story.ctaLabel || "Try it →"}
      </a>
    </div>
  );
}

// ── Main BriefView ────────────────────────────────────────────────────────────

export function BriefView({ slug, date, freeBrief, proBrief }: BriefViewProps) {
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const supabase = getBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const meta = data.session?.user?.user_metadata as { plan?: string } | undefined;
      setIsPro(meta?.plan === "pro");
    });
  }, []);

  const brief = isPro ? proBrief : freeBrief;
  const { criticalStories, monitorStories, toolOfDay, ctaPrompt } = brief;

  const displayDate = date.match(/^\d{4}-\d{2}-\d{2}$/)
    ? new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
        weekday: "short", day: "numeric", month: "long", year: "numeric",
        timeZone: "Asia/Kolkata",
      })
    : date;

  const totalCount = criticalStories.length + monitorStories.length;

  return (
    <div style={{ minHeight: "100vh", background: "#0A0812", color: "#F5F0E8" }}>

      {/* ── Sticky navbar ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(10,8,18,0.92)", backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        height: "52px", display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 24px",
      }}>
        <Link href="/" style={{
          fontSize: "14px", fontWeight: 800, letterSpacing: "0.04em",
          textTransform: "uppercase", color: "#F5F0E8", textDecoration: "none",
        }}>
          AI Signal
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "12px", color: "rgba(245,240,232,0.4)", fontWeight: 500 }}>
            {displayDate}
          </span>
          <Link href="/brief" style={{
            fontSize: "12px", color: "rgba(245,240,232,0.55)", fontWeight: 500,
            textDecoration: "none", padding: "5px 10px",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px",
          }}>
            Latest
          </Link>
          {isPro && (
            <span style={{
              fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "#A78BFA",
              background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)",
              borderRadius: "20px", padding: "3px 10px",
            }}>
              Pro
            </span>
          )}
          {!isPro && (
            <Link href="/upgrade" style={{
              fontSize: "12px", fontWeight: 700, color: "#F5F0E8",
              background: "#7C3AED", borderRadius: "6px", padding: "5px 12px",
              textDecoration: "none",
            }}>
              Upgrade
            </Link>
          )}
        </div>
      </header>

      {/* ── Content ── */}
      <main style={{ maxWidth: "680px", margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Score header — Rundown style */}
        <div style={{ marginBottom: "36px" }}>
          <p style={{
            fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "rgba(245,240,232,0.3)", marginBottom: "10px",
          }}>
            {displayDate}
          </p>
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap" }}>
            <span style={{
              fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em",
              textTransform: "uppercase", color: "#EF4444",
            }}>
              {criticalStories.length} Critical
            </span>
            <span style={{ color: "rgba(255,255,255,0.12)", fontSize: "13px" }}>·</span>
            <span style={{
              fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em",
              textTransform: "uppercase", color: "#3B82F6",
            }}>
              {monitorStories.length} Monitor
            </span>
            {toolOfDay && (
              <>
                <span style={{ color: "rgba(255,255,255,0.12)", fontSize: "13px" }}>·</span>
                <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#F59E0B" }}>
                  1 Tool
                </span>
              </>
            )}
          </div>
          <h1 style={{
            fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 700, letterSpacing: "-0.025em",
            color: "#F5F0E8", lineHeight: 1.2, margin: "12px 0 0",
            fontFamily: "var(--font-fraunces, serif)",
          }}>
            {totalCount > 0
              ? `${totalCount} signals that matter today`
              : "Today's AI Signal Brief"}
          </h1>
        </div>

        {/* ── CRITICAL section ── */}
        {criticalStories.length > 0 && (
          <section style={{ marginBottom: "16px" }}>
            <SectionRule label="🔴 Critical — Act today" color="#EF4444" />
            {criticalStories.map((story, i) => (
              <CriticalRow key={story.id} story={story} rank={i + 1} isPro={isPro} />
            ))}
          </section>
        )}

        {/* ── MONITOR section ── */}
        {monitorStories.length > 0 && (
          <section style={{ marginBottom: "16px" }}>
            <SectionRule label="🔵 Monitor — Watch this week" color="#3B82F6" />
            {monitorStories.map((story, i) => (
              <MonitorRow key={story.id} story={story} rank={criticalStories.length + i + 1} />
            ))}
          </section>
        )}

        {/* ── Tool of Day ── */}
        {toolOfDay && (
          <section style={{ marginBottom: "32px" }}>
            <SectionRule label="⚡ Tool of the Day" color="#F59E0B" />
            <ToolRow story={toolOfDay} />
          </section>
        )}

        {/* ── CTO Prompt ── */}
        {ctaPrompt && (
          <div style={{
            borderLeft: "3px solid #7C3AED",
            paddingLeft: "18px", margin: "36px 0",
          }}>
            <p style={{
              fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "#7C3AED", marginBottom: "8px",
            }}>
              CTO Prompt of the Day
            </p>
            <p style={{ fontSize: "15px", color: "rgba(245,240,232,0.75)", lineHeight: 1.7, fontStyle: "italic" }}>
              &ldquo;{ctaPrompt}&rdquo;
            </p>
          </div>
        )}

        {/* ── Upgrade CTA (free users only) ── */}
        {!isPro && (
          <div style={{
            background: "rgba(124,58,237,0.06)",
            border: "1px solid rgba(124,58,237,0.2)",
            borderRadius: "12px", padding: "28px 24px",
            margin: "36px 0", textAlign: "center",
          }}>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#A78BFA", marginBottom: "10px" }}>
              Unlock the full brief
            </p>
            <p style={{ fontSize: "20px", fontWeight: 700, color: "#F5F0E8", letterSpacing: "-0.02em", margin: "0 0 8px", fontFamily: "var(--font-fraunces, serif)" }}>
              Every action template. Every signal.
            </p>
            <p style={{ fontSize: "14px", color: "rgba(245,240,232,0.5)", lineHeight: 1.6, marginBottom: "20px" }}>
              Pro gives you the full action template on every Critical story — owner, action, and deadline. Plus all Monitor signals and Slack delivery.
            </p>
            <Link href="/upgrade" style={{
              display: "inline-block", background: "#7C3AED", color: "#F5F0E8",
              fontSize: "14px", fontWeight: 700, padding: "12px 28px",
              borderRadius: "8px", textDecoration: "none", letterSpacing: "0.01em",
            }}>
              Upgrade to Pro →
            </Link>
          </div>
        )}

        {/* ── Archive footer ── */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: "24px", marginTop: "40px",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px",
        }}>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <Link href="/brief" style={{ fontSize: "13px", color: "#7C3AED", textDecoration: "none", fontWeight: 500 }}>
              Latest brief
            </Link>
            <span style={{ color: "rgba(255,255,255,0.12)" }}>·</span>
            <Link href="/" style={{ fontSize: "13px", color: "rgba(245,240,232,0.35)", textDecoration: "none" }}>
              Home
            </Link>
          </div>
          <p style={{ fontSize: "12px", color: "rgba(245,240,232,0.2)" }}>
            AI Signal · {date}
          </p>
        </div>

      </main>
    </div>
  );
}
