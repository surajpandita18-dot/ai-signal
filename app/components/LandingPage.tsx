"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Signal } from "@/lib/types";

const CATEGORY_EMOJI: Record<string, string> = {
  llm: "🧠", models: "🧠", research: "🔬", infra: "⚡",
  infrastructure: "⚡", funding: "💰", product: "🚀",
  agents: "🤖", "open source": "📦", policy: "🛡️",
};

function getEmoji(tags: string[]): string {
  return tags?.map((t) => CATEGORY_EMOJI[t.toLowerCase()]).find(Boolean) ?? "📡";
}

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
        setDemoSignal(sorted.find((s) => s.takeaway) ?? sorted[0]);
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
    } catch { /* silent — still redirect */ }
    setDone(true);
    setTimeout(() => router.push("/app"), 1400);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#ffffff" }}>

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <header style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "0 24px",
        height: "52px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        background: "#0a0a0a",
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#7c3aed", display: "inline-block" }} />
          <span style={{ fontWeight: 800, fontSize: "13px", letterSpacing: "0.1em", color: "#ffffff", textTransform: "uppercase" }}>
            AI Signal
          </span>
        </div>
        <button
          onClick={() => router.push("/app")}
          style={{
            background: "none",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "5px",
            color: "#a1a1aa",
            fontSize: "12px",
            fontWeight: 500,
            padding: "6px 14px",
            cursor: "pointer",
            transition: "color 150ms ease, border-color 150ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#ffffff";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#a1a1aa";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
          }}
        >
          Browse →
        </button>
      </header>

      <main style={{ maxWidth: "680px", margin: "0 auto", padding: "64px 24px 96px" }}>

        {/* ── Edition badge ──────────────────────────────────────── */}
        <div style={{ marginBottom: "24px" }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#f59e0b",
          }}>
            <span style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#f59e0b",
              display: "inline-block",
              animation: "pulse 2s infinite",
            }} />
            Daily Brief · Free
          </span>
        </div>

        {/* ── Hero ──────────────────────────────────────────────── */}
        <h1 style={{
          fontSize: "clamp(32px, 6vw, 52px)",
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          color: "#ffffff",
          marginBottom: "20px",
        }}>
          AI changed overnight.
          <br />
          <span style={{ color: "#52525b" }}>Here&apos;s what to build.</span>
        </h1>

        <p style={{
          fontSize: "16px",
          color: "#71717a",
          lineHeight: 1.65,
          maxWidth: "480px",
          marginBottom: "36px",
        }}>
          Every morning: the 3 AI moves that matter for builders —
          with the specific takeaway for what to do next. No noise.
        </p>

        {/* ── Email capture ─────────────────────────────────────── */}
        <div style={{ marginBottom: "12px" }}>
          {done ? (
            <div style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: "8px",
              padding: "16px 20px",
              fontSize: "15px",
              color: "#f59e0b",
              fontWeight: 600,
            }}>
              You&apos;re in — taking you to today&apos;s signals…
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px", maxWidth: "460px" }}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                style={{
                  flex: 1,
                  background: "#111111",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "6px",
                  color: "#ffffff",
                  fontSize: "15px",
                  padding: "13px 16px",
                  outline: "none",
                  minWidth: 0,
                  transition: "border-color 150ms ease",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
              />
              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: "#f59e0b",
                  border: "none",
                  borderRadius: "6px",
                  color: "#0a0a0a",
                  fontSize: "14px",
                  fontWeight: 800,
                  padding: "13px 22px",
                  cursor: submitting ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  opacity: submitting ? 0.7 : 1,
                  letterSpacing: "-0.01em",
                }}
              >
                {submitting ? "…" : "Get daily signals →"}
              </button>
            </form>
          )}
        </div>

        <p style={{ fontSize: "12px", color: "#3f3f46", marginBottom: "48px" }}>
          No spam. Unsubscribe anytime.{" "}
          <button
            onClick={() => router.push("/app")}
            style={{ background: "none", border: "none", color: "#52525b", fontSize: "12px", cursor: "pointer", padding: 0, textDecoration: "underline", textDecorationColor: "#3f3f46" }}
          >
            Browse without email →
          </button>
        </p>

        {/* ── Live signal preview ────────────────────────────────── */}
        {demoSignal && (
          <div>
            {/* Section label */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <span style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#f59e0b",
                display: "inline-block",
                flexShrink: 0,
              }} />
              <span style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#52525b",
              }}>
                Today&apos;s top signal — live
              </span>
            </div>

            {/* Signal card */}
            <div style={{
              background: "#111111",
              border: "1px solid rgba(255,255,255,0.08)",
              borderLeft: "3px solid rgba(124,58,237,0.6)",
              borderRadius: "0 8px 8px 0",
              padding: "20px 20px 20px 20px",
            }}>
              {/* Source row */}
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "11px", color: "#52525b", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500 }}>
                  {demoSignal.source}
                </span>
                <span style={{ color: "#27272a" }}>·</span>
                <span style={{ fontSize: "11px", color: "#52525b" }}>
                  {new Date(demoSignal.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>

              {/* Title with emoji */}
              <p style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1.35,
                letterSpacing: "-0.01em",
                marginBottom: "14px",
              }}>
                {getEmoji(demoSignal.tags ?? [])} {demoSignal.title}
              </p>

              {/* WHAT */}
              {demoSignal.what && (
                <div style={{ marginBottom: "10px" }}>
                  <span style={{ display: "block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#71717a", marginBottom: "4px" }}>
                    What
                  </span>
                  <span style={{ fontSize: "14px", color: "#a1a1aa", lineHeight: 1.65, display: "block" }}>
                    {demoSignal.what}
                  </span>
                </div>
              )}

              {/* WHY */}
              {demoSignal.why && (
                <div style={{ marginBottom: "14px" }}>
                  <span style={{ display: "block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#71717a", marginBottom: "4px" }}>
                    Why it matters
                  </span>
                  <span style={{ fontSize: "14px", color: "#a1a1aa", lineHeight: 1.65, display: "block" }}>
                    {demoSignal.why}
                  </span>
                </div>
              )}

              {/* TAKEAWAY */}
              {demoSignal.takeaway && (
                <div style={{ borderLeft: "2px solid rgba(245,158,11,0.5)", paddingLeft: "14px" }}>
                  <span style={{ display: "block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#f59e0b", marginBottom: "4px" }}>
                    Takeaway
                  </span>
                  <span style={{ display: "block", fontSize: "14px", color: "#f59e0b", lineHeight: 1.6 }}>
                    {demoSignal.takeaway}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Stats strip ───────────────────────────────────────── */}
        <div style={{
          marginTop: "56px",
          paddingTop: "36px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          gap: "48px",
          flexWrap: "wrap",
          rowGap: "20px",
        }}>
          {[
            { stat: "Daily", label: "Fresh signals every morning" },
            { stat: "3 min", label: "To read the full brief" },
            { stat: "24+", label: "Curated AI sources" },
          ].map(({ stat, label }) => (
            <div key={stat}>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", marginBottom: "3px" }}>
                {stat}
              </div>
              <div style={{ fontSize: "12px", color: "#52525b" }}>{label}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
