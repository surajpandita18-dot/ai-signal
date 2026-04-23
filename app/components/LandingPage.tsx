// app/components/LandingPage.tsx
// Shown to unauthenticated users in place of the dashboard.
// Live signal demo: fetches /api/news, picks highest signalScore signal,
// shows rank 01 editorial row with WHAT/WHY visible + TAKEAWAY gate.
// Primary CTA: GitHub OAuth sign-in.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Signal } from "@/lib/types";

export function LandingPage() {
  const [demoSignal, setDemoSignal] = useState<Signal | null>(null);

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((data: Signal[]) => {
        if (!Array.isArray(data) || data.length === 0) return;
        // Pick highest signalScore with real content (what/why/title)
        const sorted = [...data].sort((a, b) => b.signalScore - a.signalScore);
        const top = sorted.find((s) => s.title) ?? sorted[0];
        setDemoSignal(top);
      })
      .catch(() => {/* silent — demo section just stays hidden */});
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#09090b", color: "#fafafa" }}>

      {/* ── Navbar ─────────────────────────────────────────────── */}
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
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
        </div>

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
      </header>

      <main
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "72px 24px 80px",
        }}
      >
        {/* ── Hero copy ──────────────────────────────────────────── */}
        <div style={{ marginBottom: "56px" }}>
          <div
            style={{
              display: "inline-block",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#7c3aed",
              marginBottom: "20px",
            }}
          >
            Early Access · Free for first 100 founders
          </div>

          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 42px)",
              fontWeight: 700,
              lineHeight: 1.15,
              color: "#fafafa",
              letterSpacing: "-0.02em",
              marginBottom: "20px",
            }}
          >
            AI changed overnight.
            <br />
            <span style={{ color: "#a1a1aa" }}>Here&apos;s what to build.</span>
          </h1>

          <p
            style={{
              fontSize: "17px",
              color: "#71717a",
              lineHeight: 1.6,
              maxWidth: "520px",
              marginBottom: "32px",
            }}
          >
            AI Signal scans every major AI source every morning and surfaces the 3 moves
            that matter — with the specific takeaway for what to do next.
          </p>

          {/* Primary CTA */}
          <Link
            href="/api/auth/signin"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#f59e0b",
              color: "#09090b",
              borderRadius: "6px",
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: 700,
              textDecoration: "none",
              letterSpacing: "0.01em",
              transition: "background 150ms ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "#d97706";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "#f59e0b";
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
            Sign in with GitHub — free for first 100 founders
          </Link>
        </div>

        {/* ── Live signal demo ───────────────────────────────────── */}
        {demoSignal && (
          <div>
            <div style={{ marginBottom: "16px" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#52525b",
                }}
              >
                Today&apos;s top signal — live
              </span>
            </div>

            {/* Signal row (Zone 1 style) */}
            <div
              style={{
                display: "flex",
                gap: "24px",
                padding: "24px 16px",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "6px",
                background: "#0f0f12",
                alignItems: "flex-start",
                marginBottom: "32px",
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
                01
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
                    {demoSignal.source}
                  </span>
                  <span style={{ color: "#27272a" }}>·</span>
                  <span style={{ fontSize: "11px", color: "#52525b" }}>
                    {new Date(demoSignal.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                {/* Title */}
                <p
                  style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#fafafa",
                    lineHeight: 1.3,
                    marginBottom: "16px",
                  }}
                >
                  {demoSignal.title}
                </p>

                {/* WHAT / WHY — visible in demo */}
                {demoSignal.what && (
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
                      {demoSignal.what}
                    </span>
                  </div>
                )}

                {demoSignal.why && (
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
                      {demoSignal.why}
                    </span>
                  </div>
                )}

                {/* TAKEAWAY gate — solid amber surface (no blur, server strips takeaway) */}
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
                      color: "#52525b",
                      marginBottom: "6px",
                    }}
                  >
                    Takeaway
                  </span>
                  <Link
                    href="/api/auth/signin"
                    style={{
                      display: "inline-block",
                      background: "rgba(245,158,11,0.08)",
                      border: "1px solid rgba(245,158,11,0.3)",
                      borderRadius: "6px",
                      color: "#f59e0b",
                      fontSize: "12px",
                      fontWeight: 600,
                      padding: "6px 14px",
                      textDecoration: "none",
                      letterSpacing: "0.02em",
                    }}
                  >
                    Sign in to unlock →
                  </Link>
                </div>
              </div>
            </div>

            {/* Secondary CTA */}
            <div style={{ textAlign: "center" }}>
              <Link
                href="/api/auth/signin"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#f59e0b",
                  color: "#09090b",
                  borderRadius: "6px",
                  padding: "12px 28px",
                  fontSize: "14px",
                  fontWeight: 700,
                  textDecoration: "none",
                  letterSpacing: "0.01em",
                  transition: "background 150ms ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "#d97706";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "#f59e0b";
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
                Get free access — takes 10 seconds
              </Link>
              <p
                style={{
                  fontSize: "12px",
                  color: "#52525b",
                  marginTop: "12px",
                }}
              >
                GitHub OAuth · No credit card · Cancel anytime
              </p>
            </div>
          </div>
        )}

        {/* ── Social proof strip ─────────────────────────────────── */}
        <div
          style={{
            marginTop: "64px",
            paddingTop: "40px",
            borderTop: "1px solid rgba(255,255,255,0.04)",
            display: "flex",
            gap: "40px",
            flexWrap: "wrap",
            rowGap: "24px",
          }}
        >
          {[
            { stat: "Daily", label: "Fresh signals every morning" },
            { stat: "3 min", label: "Time to read a full brief" },
            { stat: "100%", label: "Builder-focused takeaways" },
          ].map(({ stat, label }) => (
            <div key={stat}>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#fafafa",
                  letterSpacing: "-0.01em",
                  marginBottom: "4px",
                }}
              >
                {stat}
              </div>
              <div style={{ fontSize: "13px", color: "#52525b" }}>{label}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
