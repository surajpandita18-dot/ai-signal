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
  const [signals, setSignals] = useState<Signal[]>([]);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((data: Signal[]) => {
        if (!Array.isArray(data)) return;
        const sorted = [...data].sort((a, b) => b.signalScore - a.signalScore);
        setSignals(sorted.filter((s) => s.takeaway || s.what).slice(0, 2));
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
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
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      color: "#ffffff",
      fontFamily: "Inter, system-ui, sans-serif",
    }}>

      {/* Navbar */}
      <nav style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 32px",
        height: "52px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        position: "sticky",
        top: 0,
        background: "#0a0a0a",
        zIndex: 100,
      }}>
        <span style={{ fontWeight: 800, fontSize: "14px", letterSpacing: "0.06em", color: "#ffffff" }}>
          ● AI SIGNAL
        </span>
        <button
          onClick={() => router.push("/app")}
          style={{
            background: "none", border: "none",
            fontSize: "13px", color: "#52525b",
            cursor: "pointer", padding: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#a1a1aa"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#52525b"; }}
        >
          Browse →
        </button>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "72px 24px 56px" }}>

        {/* Badge */}
        <div style={{
          fontSize: "11px", fontWeight: 700,
          letterSpacing: "0.12em", textTransform: "uppercase",
          color: "#52525b", marginBottom: "28px",
        }}>
          Daily · Free
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: "clamp(32px, 6vw, 52px)",
          fontWeight: 800, lineHeight: 1.1,
          letterSpacing: "-0.025em",
          color: "#ffffff", marginBottom: "20px",
        }}>
          AI changed overnight.
          <br />
          <span style={{ color: "#a1a1aa", fontWeight: 700 }}>Here&apos;s what to build.</span>
        </h1>

        {/* Subheading */}
        <p style={{
          fontSize: "17px", color: "#71717a",
          lineHeight: 1.65, maxWidth: "500px", marginBottom: "40px",
        }}>
          Every morning: the AI moves that matter for builders —
          with the specific takeaway for what to do next.
        </p>

        {/* Email form */}
        {status === "done" ? (
          <div style={{
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: "8px", padding: "16px 20px",
            fontSize: "15px", color: "#f59e0b", fontWeight: 600,
            marginBottom: "16px",
          }}>
            You&apos;re in — taking you to today&apos;s signals…
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px", maxWidth: "480px", marginBottom: "16px" }}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              style={{
                flex: 1, padding: "14px 18px",
                background: "#111111",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px", color: "#ffffff",
                fontSize: "15px", outline: "none", minWidth: 0,
                transition: "border-color 150ms ease",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
            />
            <button
              type="submit"
              disabled={status === "loading"}
              style={{
                padding: "14px 24px",
                background: "#ffffff", color: "#000000",
                border: "none", borderRadius: "8px",
                fontSize: "14px", fontWeight: 700,
                cursor: status === "loading" ? "not-allowed" : "pointer",
                whiteSpace: "nowrap", flexShrink: 0,
                opacity: status === "loading" ? 0.6 : 1,
                letterSpacing: "-0.01em",
              }}
            >
              {status === "loading" ? "…" : "Subscribe →"}
            </button>
          </form>
        )}

        {/* Secondary CTA */}
        <p style={{ fontSize: "13px", color: "#3f3f46" }}>
          No spam. Unsubscribe anytime.{" "}
          <button
            onClick={() => router.push("/app")}
            style={{
              background: "none", border: "none",
              color: "#52525b", fontSize: "13px", cursor: "pointer",
              padding: 0, textDecoration: "underline",
              textDecorationColor: "rgba(255,255,255,0.12)",
            }}
          >
            Browse without email →
          </button>
        </p>
      </div>

      {/* Divider + signals preview */}
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "0 24px 96px" }}>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "40px" }}>

          <div style={{
            fontSize: "11px", fontWeight: 700,
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: "#3f3f46", marginBottom: "32px",
          }}>
            Today&apos;s Top Signals
          </div>

          {signals.map((signal, i) => {
            const emoji = getEmoji(signal.tags ?? []);
            return (
              <div key={signal.id} style={{
                paddingBottom: i < signals.length - 1 ? "28px" : "0",
                marginBottom: i < signals.length - 1 ? "28px" : "0",
                borderBottom: i < signals.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}>
                <div style={{
                  fontSize: "11px", fontWeight: 700,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "#52525b", marginBottom: "8px",
                }}>
                  {signal.source}
                </div>
                <h3 style={{
                  fontSize: "17px", fontWeight: 800,
                  color: "#ffffff", lineHeight: 1.3,
                  letterSpacing: "-0.015em", marginBottom: "10px",
                }}>
                  {emoji} {signal.title}
                </h3>
                {signal.what && (
                  <p style={{ fontSize: "14px", color: "#a1a1aa", lineHeight: 1.7, marginBottom: "10px" }}>
                    <strong style={{ color: "#ffffff", fontWeight: 600 }}>The Signal: </strong>
                    {signal.what}
                  </p>
                )}
                {signal.takeaway && (
                  <div style={{
                    borderLeft: "2px solid rgba(245,158,11,0.5)",
                    paddingLeft: "12px", marginTop: "10px",
                  }}>
                    <p style={{ fontSize: "13px", color: "#f59e0b", lineHeight: 1.6, margin: 0 }}>
                      {signal.takeaway}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
