"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Signal } from "@/lib/types";

export function LandingPage() {
  const router = useRouter();
  const [demoSignal, setDemoSignal] = useState<Signal | null>(null);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((data: Signal[]) => {
        if (!Array.isArray(data) || data.length === 0) return;
        const sorted = [...data].sort((a, b) => b.signalScore - a.signalScore);
        const top = sorted.find((s) => s.title) ?? sorted[0];
        setDemoSignal(top);
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || submitting) return;
    setSubmitting(true);
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
    } catch {
      // silent — still redirect on network failure
    }
    setDone(true);
    setTimeout(() => router.push("/app"), 1400);
  }

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
      </header>

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "72px 24px 80px" }}>

        {/* ── Hero ──────────────────────────────────────────────── */}
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
            Early Access · Free
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

          {/* Email capture */}
          <div style={{ maxWidth: "400px" }}>
            {done ? (
              <div
                style={{
                  background: "rgba(245,158,11,0.08)",
                  border: "1px solid rgba(245,158,11,0.2)",
                  borderRadius: "8px",
                  padding: "14px 20px",
                  fontSize: "14px",
                  color: "#f59e0b",
                  fontWeight: 500,
                }}
              >
                You&apos;re in! Taking you to your signals…
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px" }}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  style={{
                    flex: 1,
                    background: "#0f0f12",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "6px",
                    color: "#fafafa",
                    fontSize: "14px",
                    padding: "12px 14px",
                    outline: "none",
                    minWidth: 0,
                    transition: "border-color 150ms ease",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: "#f59e0b",
                    border: "none",
                    borderRadius: "6px",
                    color: "#09090b",
                    fontSize: "13px",
                    fontWeight: 700,
                    padding: "12px 20px",
                    cursor: submitting ? "not-allowed" : "pointer",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    opacity: submitting ? 0.7 : 1,
                    transition: "opacity 150ms ease",
                  }}
                >
                  {submitting ? "…" : "Get daily signals →"}
                </button>
              </form>
            )}
            <p style={{ fontSize: "12px", color: "#3f3f46", marginTop: "10px" }}>
              No spam. Unsubscribe anytime.
            </p>
          </div>
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
                <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
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
                    {new Date(demoSignal.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
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
                    <span style={{ fontSize: "14px", color: "#a1a1aa", lineHeight: 1.6, display: "block" }}>
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
                    <span style={{ fontSize: "14px", color: "#a1a1aa", lineHeight: 1.6, display: "block" }}>
                      {demoSignal.why}
                    </span>
                  </div>
                )}

                {demoSignal.takeaway && (
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
                        color: "#f59e0b",
                        marginBottom: "4px",
                      }}
                    >
                      Takeaway
                    </span>
                    <span style={{ display: "block", fontSize: "14px", color: "#f59e0b", lineHeight: 1.6 }}>
                      {demoSignal.takeaway}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Secondary CTA */}
            <div style={{ textAlign: "center" }}>
              <button
                onClick={() => router.push("/app")}
                style={{
                  display: "inline-block",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#a1a1aa",
                  borderRadius: "6px",
                  padding: "10px 24px",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                  textDecoration: "none",
                  transition: "border-color 150ms ease, color 150ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                  e.currentTarget.style.color = "#fafafa";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.color = "#a1a1aa";
                }}
              >
                Browse all signals →
              </button>
            </div>
          </div>
        )}

        {/* ── Stats strip ───────────────────────────────────────── */}
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
