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
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((data: Signal[]) => {
        if (!Array.isArray(data)) return;
        const sorted = [...data].sort((a, b) => b.signalScore - a.signalScore);
        setSignals(sorted.filter((s) => s.what || s.takeaway).slice(0, 3));
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status !== "idle") return;
    setStatus("loading");
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
    } catch { /* silent */ }
    setStatus("done");
    setTimeout(() => router.push("/app"), 1400);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Dark navbar — exactly Rundown */}
      <nav style={{
        background: "#111111",
        height: "56px",
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <span style={{ fontWeight: 800, fontSize: "15px", color: "#ffffff", letterSpacing: "0.04em" }}>
          AI Signal
        </span>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            onClick={() => router.push("/app")}
            style={{
              background: "none", border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "5px", color: "#d1d5db",
              fontSize: "13px", fontWeight: 500,
              padding: "6px 14px", cursor: "pointer",
            }}
          >
            Browse →
          </button>
          <button
            onClick={() => { document.getElementById("email-input")?.focus(); }}
            style={{
              background: "#ffffff", border: "none",
              borderRadius: "5px", color: "#111111",
              fontSize: "13px", fontWeight: 700,
              padding: "6px 14px", cursor: "pointer",
            }}
          >
            Subscribe
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "72px 24px 0" }}>

        {/* Tag */}
        <p style={{
          fontSize: "12px", fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.1em",
          color: "#9ca3af", marginBottom: "20px",
        }}>
          Daily · Free · For Builders
        </p>

        {/* Headline */}
        <h1 style={{
          fontSize: "clamp(32px, 6vw, 52px)",
          fontWeight: 800, lineHeight: 1.1,
          letterSpacing: "-0.025em",
          color: "#111111", marginBottom: "16px",
        }}>
          AI changed overnight.
          <br />
          <span style={{ color: "#9ca3af" }}>Here&apos;s what to build.</span>
        </h1>

        <p style={{
          fontSize: "17px", color: "#6b7280",
          lineHeight: 1.65, maxWidth: "500px", marginBottom: "36px",
        }}>
          Every morning: the AI moves that matter for builders — with the specific takeaway for what to do next.
        </p>

        {/* Email form */}
        {status === "done" ? (
          <div style={{
            background: "#f0fdf4", border: "1px solid #bbf7d0",
            borderRadius: "8px", padding: "16px 20px",
            fontSize: "15px", color: "#166534", fontWeight: 600,
            marginBottom: "16px",
          }}>
            You&apos;re in — opening today&apos;s signals…
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px", maxWidth: "480px", marginBottom: "14px" }}>
            <input
              id="email-input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              style={{
                flex: 1, padding: "13px 16px",
                background: "#ffffff",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                color: "#111111", fontSize: "15px",
                outline: "none", minWidth: 0,
                transition: "border-color 150ms ease",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#111111"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#d1d5db"; }}
            />
            <button
              type="submit"
              disabled={status === "loading"}
              style={{
                padding: "13px 22px",
                background: "#111111", color: "#ffffff",
                border: "none", borderRadius: "6px",
                fontSize: "14px", fontWeight: 700,
                cursor: status === "loading" ? "not-allowed" : "pointer",
                whiteSpace: "nowrap", flexShrink: 0,
                opacity: status === "loading" ? 0.6 : 1,
              }}
            >
              {status === "loading" ? "…" : "Subscribe →"}
            </button>
          </form>
        )}

        <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "56px" }}>
          No spam. Unsubscribe anytime.{" "}
          <button
            onClick={() => router.push("/app")}
            style={{
              background: "none", border: "none",
              color: "#6b7280", fontSize: "12px",
              cursor: "pointer", padding: 0,
              textDecoration: "underline", textDecorationColor: "#d1d5db",
            }}
          >
            Browse without email →
          </button>
        </p>
      </div>

      {/* Newsletter preview — exactly Rundown newsletter style */}
      {signals.length > 0 && (
        <div style={{ maxWidth: "680px", margin: "0 auto", padding: "0 24px 96px" }}>

          {/* Section divider — like Rundown's "LATEST DEVELOPMENTS" bar */}
          <div style={{
            background: "#111111",
            padding: "10px 20px",
            marginBottom: "0",
          }}>
            <span style={{
              fontSize: "12px", fontWeight: 800,
              textTransform: "uppercase", letterSpacing: "0.14em",
              color: "#ffffff",
            }}>
              Today&apos;s Signals
            </span>
          </div>

          {/* Signals — newsletter content style */}
          <div style={{ border: "1px solid #e5e7eb", borderTop: "none" }}>
            {signals.map((signal, idx) => {
              const emoji = getEmoji(signal.tags ?? []);
              const catColor = getCatColor(signal.tags ?? []);
              const catLabel = getCatLabel(signal.tags ?? []);

              return (
                <div key={signal.id} style={{
                  padding: "24px 24px",
                  borderBottom: idx < signals.length - 1 ? "1px solid #e5e7eb" : "none",
                }}>
                  {/* Category label — Rundown uppercase company/topic label */}
                  <p style={{
                    fontSize: "11px", fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: "0.1em",
                    color: catColor, margin: "0 0 8px",
                  }}>
                    {catLabel}
                  </p>

                  {/* Title */}
                  <h3 style={{
                    fontSize: "18px", fontWeight: 700,
                    color: "#111111", lineHeight: 1.3,
                    letterSpacing: "-0.01em", margin: "0 0 12px",
                  }}>
                    {emoji} {signal.title}
                  </h3>

                  {/* The Rundown: inline label */}
                  {signal.what && (
                    <p style={{ fontSize: "15px", color: "#374151", lineHeight: 1.75, margin: "0 0 10px" }}>
                      <strong style={{ color: "#111111" }}>The Signal: </strong>
                      {signal.what}
                    </p>
                  )}

                  {/* Takeaway */}
                  {signal.takeaway && (
                    <div style={{
                      background: "#fffbeb",
                      borderLeft: "3px solid #f59e0b",
                      padding: "10px 14px",
                      marginTop: "12px",
                      borderRadius: "0 4px 4px 0",
                    }}>
                      <p style={{ fontSize: "13px", color: "#92400e", lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                        <strong style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#d97706", marginRight: "6px" }}>
                          Takeaway
                        </strong>
                        {signal.takeaway}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
