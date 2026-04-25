"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Signal } from "@/lib/types";

const CATEGORY_EMOJI: Record<string, string> = {
  llm: "🧠", models: "🧠", research: "🔬", infra: "⚡",
  infrastructure: "⚡", funding: "💰", product: "🚀",
  agents: "🤖", "open source": "📦", policy: "🛡️",
};

const CATEGORY_COLOR: Record<string, string> = {
  llm: "#7c3aed", models: "#7c3aed", research: "#2563eb", infra: "#059669",
  infrastructure: "#059669", funding: "#d97706", product: "#dc2626",
  agents: "#7c3aed", "open source": "#0891b2", policy: "#6b7280",
};

function getEmoji(tags: string[]): string {
  return tags?.map((t) => CATEGORY_EMOJI[t.toLowerCase()]).find(Boolean) ?? "📡";
}

function getCatColor(tags: string[]): string {
  return tags?.map((t) => CATEGORY_COLOR[t.toLowerCase()]).find(Boolean) ?? "#6b7280";
}

function getCatLabel(tags: string[]): string {
  const hit = tags?.find((t) => CATEGORY_EMOJI[t.toLowerCase()]);
  return hit ? hit.toUpperCase() : "AI";
}

export function LandingPage() {
  const router = useRouter();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((data: Signal[]) => {
        if (!Array.isArray(data) || data.length === 0) return;
        const sorted = [...data].sort((a, b) => b.signalScore - a.signalScore);
        setSignals(sorted.filter((s) => s.takeaway).slice(0, 3));
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
    } catch { /* silent */ }
    setDone(true);
    setTimeout(() => router.push("/app"), 1400);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", color: "#111111", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Nav */}
      <header style={{
        borderBottom: "1px solid #e5e7eb",
        padding: "0 24px",
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        background: "#ffffff",
        zIndex: 100,
      }}>
        <span style={{ fontWeight: 900, fontSize: "15px", letterSpacing: "-0.01em", color: "#111111" }}>
          AI Signal
        </span>
        <button
          onClick={() => router.push("/app")}
          style={{
            background: "none",
            border: "none",
            color: "#6b7280",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            padding: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#111111"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#6b7280"; }}
        >
          Browse →
        </button>
      </header>

      <main style={{ maxWidth: "640px", margin: "0 auto", padding: "64px 24px 96px" }}>

        {/* Category tag */}
        <div style={{ marginBottom: "20px" }}>
          <span style={{
            display: "inline-block",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#9ca3af",
          }}>
            Daily · Free
          </span>
        </div>

        {/* Hero */}
        <h1 style={{
          fontSize: "clamp(32px, 6vw, 52px)",
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          color: "#111111",
          marginBottom: "16px",
        }}>
          AI changed overnight.
          <br />
          <span style={{ color: "#9ca3af" }}>Here&apos;s what to build.</span>
        </h1>

        <p style={{
          fontSize: "17px",
          color: "#6b7280",
          lineHeight: 1.65,
          maxWidth: "480px",
          marginBottom: "36px",
        }}>
          Every morning: the AI moves that matter for builders — with the specific takeaway for what to do next.
        </p>

        {/* Email capture */}
        <div style={{ marginBottom: "12px" }}>
          {done ? (
            <div style={{
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: "8px",
              padding: "16px 20px",
              fontSize: "15px",
              color: "#d97706",
              fontWeight: 600,
            }}>
              You&apos;re in — taking you to today&apos;s signals…
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px", maxWidth: "480px" }}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                style={{
                  flex: 1,
                  background: "#ffffff",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  color: "#111111",
                  fontSize: "15px",
                  padding: "13px 16px",
                  outline: "none",
                  minWidth: 0,
                  transition: "border-color 150ms ease",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#111111"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#d1d5db"; }}
              />
              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: "#111111",
                  border: "none",
                  borderRadius: "6px",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 700,
                  padding: "13px 22px",
                  cursor: submitting ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  opacity: submitting ? 0.6 : 1,
                  letterSpacing: "-0.01em",
                }}
              >
                {submitting ? "…" : "Subscribe →"}
              </button>
            </form>
          )}
        </div>

        <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "56px" }}>
          No spam. Unsubscribe anytime.{" "}
          <button
            onClick={() => router.push("/app")}
            style={{ background: "none", border: "none", color: "#6b7280", fontSize: "12px", cursor: "pointer", padding: 0, textDecoration: "underline", textDecorationColor: "#d1d5db" }}
          >
            Browse without email →
          </button>
        </p>

        {/* Divider */}
        <div style={{ height: "1px", background: "#e5e7eb", marginBottom: "40px" }} />

        {/* Newsletter preview */}
        {signals.length > 0 && (
          <div>
            {/* Section header — Rundown style */}
            <p style={{
              fontSize: "11px", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.12em",
              color: "#9ca3af", marginBottom: "28px",
            }}>
              Today&apos;s top signals
            </p>

            {signals.map((signal, idx) => {
              const emoji = getEmoji(signal.tags ?? []);
              const catColor = getCatColor(signal.tags ?? []);
              const catLabel = getCatLabel(signal.tags ?? []);

              return (
                <div key={signal.id} style={{
                  paddingTop: idx === 0 ? "0" : "28px",
                  marginTop: idx === 0 ? "0" : "28px",
                  borderTop: idx === 0 ? "none" : "1px solid #f3f4f6",
                }}>
                  {/* Category */}
                  <p style={{
                    fontSize: "11px", fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: "0.1em",
                    color: catColor, margin: "0 0 8px",
                  }}>
                    {catLabel}
                  </p>

                  {/* Title */}
                  <p style={{
                    fontSize: "18px", fontWeight: 700,
                    color: "#111111", lineHeight: 1.3,
                    letterSpacing: "-0.015em", margin: "0 0 12px",
                  }}>
                    {emoji} {signal.title}
                  </p>

                  {/* The Signal inline */}
                  {signal.what && (
                    <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: 1.7, margin: "0 0 8px" }}>
                      <strong style={{ color: "#374151" }}>The Signal: </strong>
                      {signal.what}
                    </p>
                  )}

                  {/* Takeaway */}
                  {signal.takeaway && (
                    <p style={{ fontSize: "13px", color: "#d97706", lineHeight: 1.6, margin: "0 0 4px", fontWeight: 600 }}>
                      ↳ {signal.takeaway}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Stats strip */}
        <div style={{
          marginTop: "56px",
          paddingTop: "36px",
          borderTop: "1px solid #e5e7eb",
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
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#111111", letterSpacing: "-0.02em", marginBottom: "3px" }}>
                {stat}
              </div>
              <div style={{ fontSize: "12px", color: "#9ca3af" }}>{label}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
