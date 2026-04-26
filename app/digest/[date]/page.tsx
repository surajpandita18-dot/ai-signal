// app/digest/[date]/page.tsx
// Shareable daily brief — server component.
// URL: /digest/2026-04-24
// Shows Zone 1 editorial list for the given date.
// TAKEAWAY is gated server-side (same rule as /api/news).

import type { Metadata } from "next";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import Link from "next/link";
import type { Signal } from "@/lib/types";

// ── Data loading (mirrors api/news route.ts) ─────────────────────────────────

function loadAllSignals(): Signal[] {
  const rawPath = join(process.cwd(), "lib", "realNews.json");
  const processedPath = join(process.cwd(), "lib", "processedSignals.json");

  if (!existsSync(rawPath)) return [];

  const raw: Signal[] = JSON.parse(readFileSync(rawPath, "utf-8"));

  if (existsSync(processedPath)) {
    const processed: Signal[] = JSON.parse(readFileSync(processedPath, "utf-8"));
    const processedMap = new Map(processed.map((s) => [s.id, s]));
    return raw.map((signal) => {
      const p = processedMap.get(signal.id);
      if (!p) return signal;
      return {
        ...signal,
        what: p.what,
        why: p.why,
        takeaway: p.takeaway,
        processed: p.processed,
        processedAt: p.processedAt,
        zone1EligibleUntil: p.zone1EligibleUntil,
        developingStory: p.developingStory,
      };
    });
  }

  return raw;
}

// ── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ date: string }>;
}): Promise<Metadata> {
  const { date } = await params;
  const label = formatDate(date);
  return {
    title: `AI Signal Brief — ${label}`,
    description: `The top AI signals and builder takeaways for ${label}. Curated daily from every major source.`,
    openGraph: {
      title: `AI Signal Brief — ${label}`,
      description: `Top AI moves and builder takeaways for ${label}.`,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: `AI Signal Brief — ${label}`,
      description: `Top AI moves and builder takeaways for ${label}.`,
    },
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  // Accept YYYY-MM-DD → "April 24, 2026"
  const d = new Date(dateStr + "T12:00:00Z");
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return dateStr === today;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DigestPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;

  // Auth gating deferred — validate retention first (PRD: monetization phase 2)
  const isPaid = false;
  const isAuthed = false;

  // Load + filter signals for this date
  const allSignals = loadAllSignals();
  const dateSignals = allSignals
    .filter((s) => s.date.startsWith(date))
    .sort((a, b) => b.signalScore - a.signalScore);

  // Zone 1: signals that have been processed (have LLM content)
  const zone1 = dateSignals
    .filter((s) => s.processed)
    .slice(0, 5);

  // Apply server-side TAKEAWAY gate
  const gated = isPaid
    ? zone1
    : zone1.map((s) => ({
        ...s,
        takeaway: null as string | null,
        ...(s.takeaway ? { takeawayGated: true } : {}),
      }));

  const label = formatDate(date);
  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div style={{ minHeight: "100vh", background: "#09090b", color: "#fafafa" }}>

      {/* ── Navbar ───────────────────────────────────────────────── */}
      <header
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "0 24px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          background: "#09090b",
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#7c3aed",
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontWeight: 700,
                fontSize: "13px",
                letterSpacing: "0.08em",
                color: "#fafafa",
                textTransform: "uppercase",
              }}
            >
              AI Signal
            </span>
          </Link>
          <span style={{ color: "#27272a", fontSize: "13px" }}>/</span>
          <span
            style={{
              fontSize: "13px",
              color: "#52525b",
              fontWeight: 500,
            }}
          >
            {isToday(date) ? "Today's Brief" : label}
          </span>
        </div>

        {!isAuthed && (
          <Link
            href="/api/auth/signin"
            style={{
              fontSize: "13px",
              color: "#a1a1aa",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Sign in
          </Link>
        )}
      </header>

      <main
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "40px 24px 80px",
        }}
      >
        {/* ── Header ───────────────────────────────────────────────── */}
        <div style={{ marginBottom: "40px" }}>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#52525b",
              marginBottom: "8px",
            }}
          >
            Daily Brief
          </p>
          <h1
            style={{
              fontSize: "30px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#fafafa",
              lineHeight: 1.2,
              marginBottom: "8px",
            }}
          >
            {label}
          </h1>
          {gated.length > 0 && (
            <p style={{ fontSize: "13px", color: "#52525b" }}>
              {gated.length} signal{gated.length !== 1 ? "s" : ""} · AI Signal
            </p>
          )}
        </div>

        {/* ── No signals ───────────────────────────────────────────── */}
        {gated.length === 0 && (
          <div
            style={{
              padding: "48px 0",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <p style={{ fontSize: "15px", color: "#52525b", lineHeight: 1.6 }}>
              No signals recorded for this date.
            </p>
            <Link
              href="/"
              style={{
                display: "inline-block",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "6px",
                color: "#a1a1aa",
                fontSize: "13px",
                fontWeight: 600,
                padding: "8px 16px",
                textDecoration: "none",
              }}
            >
              Today&apos;s signals →
            </Link>
          </div>
        )}

        {/* ── Zone 1 editorial list ─────────────────────────────── */}
        <section>
          {gated.map((signal, i) => {
            const rank = i + 1;
            const rankStr = String(rank).padStart(2, "0");
            const amberColor = rank === 1 ? "#f59e0b" : "#d97706";
            const hasLLM = signal.processed && !!signal.takeaway;
            const isGated = !!(signal as Signal & { takeawayGated?: boolean }).takeawayGated;

            return (
              <div
                key={signal.id}
                style={{
                  display: "flex",
                  gap: "24px",
                  padding: "24px 16px",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  alignItems: "flex-start",
                }}
              >
                {/* Rank */}
                <span
                  style={{
                    fontSize: "48px",
                    fontWeight: 800,
                    color: "rgba(124,58,237,0.15)",
                    lineHeight: 1,
                    minWidth: "48px",
                    flexShrink: 0,
                    letterSpacing: "-0.02em",
                    marginTop: "-4px",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {rankStr}
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Source + date */}
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#52525b",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        fontWeight: 500,
                      }}
                    >
                      {signal.source}
                    </span>
                    <span style={{ color: "#27272a" }}>·</span>
                    <span style={{ fontSize: "11px", color: "#52525b" }}>
                      {new Date(signal.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        timeZone: "UTC",
                      })}
                    </span>
                  </div>

                  {/* Title */}
                  <Link
                    href={`/article/${signal.id}`}
                    style={{
                      display: "block",
                      fontSize: "20px",
                      fontWeight: 600,
                      color: "#fafafa",
                      lineHeight: 1.3,
                      textDecoration: "none",
                      marginBottom: "16px",
                    }}
                  >
                    {signal.title}
                  </Link>

                  {/* WHAT */}
                  {signal.what && (
                    <div style={{ marginBottom: "8px" }}>
                      <span
                        style={{
                          display: "block",
                          fontSize: "11px",
                          fontWeight: 500,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: "#52525b",
                          marginBottom: "4px",
                        }}
                      >
                        What
                      </span>
                      <span
                        style={{
                          fontSize: "14px",
                          color: "#a1a1aa",
                          lineHeight: 1.6,
                          display: "block",
                        }}
                      >
                        {signal.what}
                      </span>
                    </div>
                  )}

                  {/* WHY */}
                  {signal.why && (
                    <div style={{ marginBottom: "16px" }}>
                      <span
                        style={{
                          display: "block",
                          fontSize: "11px",
                          fontWeight: 500,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: "#52525b",
                          marginBottom: "4px",
                        }}
                      >
                        Why it matters
                      </span>
                      <span
                        style={{
                          fontSize: "14px",
                          color: "#a1a1aa",
                          lineHeight: 1.6,
                          display: "block",
                        }}
                      >
                        {signal.why}
                      </span>
                    </div>
                  )}

                  {/* TAKEAWAY — paid users */}
                  {hasLLM && (
                    <div
                      style={{
                        borderLeft: "2px solid rgba(245,158,11,0.4)",
                        paddingLeft: "12px",
                        marginTop: "8px",
                      }}
                    >
                      <span
                        style={{
                          display: "block",
                          fontSize: "11px",
                          fontWeight: 500,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: amberColor,
                          marginBottom: "4px",
                        }}
                      >
                        Takeaway
                      </span>
                      <span
                        style={{
                          fontSize: "15px",
                          color: amberColor,
                          lineHeight: 1.6,
                          display: "block",
                        }}
                      >
                        {signal.takeaway}
                      </span>
                    </div>
                  )}

                  {/* TAKEAWAY gate — free/unauthed */}
                  {isGated && (
                    <div
                      style={{
                        borderLeft: "2px solid rgba(245,158,11,0.2)",
                        paddingLeft: "12px",
                        marginTop: "8px",
                      }}
                    >
                      <span
                        style={{
                          display: "block",
                          fontSize: "11px",
                          fontWeight: 500,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: "#52525b",
                          marginBottom: "6px",
                        }}
                      >
                        Takeaway
                      </span>
                      <Link
                        href={isAuthed ? "/upgrade" : "/api/auth/signin"}
                        style={{
                          display: "inline-block",
                          background: "rgba(245,158,11,0.06)",
                          border: "1px solid rgba(245,158,11,0.2)",
                          borderRadius: "6px",
                          color: "#d97706",
                          fontSize: "12px",
                          fontWeight: 600,
                          padding: "6px 14px",
                          textDecoration: "none",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {isAuthed ? "Unlock takeaway →" : "Sign in to unlock →"}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {/* ── Footer nav ───────────────────────────────────────────── */}
        {gated.length > 0 && (
          <div
            style={{
              marginTop: "48px",
              paddingTop: "32px",
              borderTop: "1px solid rgba(255,255,255,0.04)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <Link
              href="/"
              style={{
                fontSize: "13px",
                color: "#52525b",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              ← Back to dashboard
            </Link>
            <Link
              href={`/digest/${todayStr}`}
              style={{
                fontSize: "13px",
                color: "#a1a1aa",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Today&apos;s brief →
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
