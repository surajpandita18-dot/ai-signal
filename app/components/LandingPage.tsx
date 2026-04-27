"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Signal } from "@/lib/types";

const CATEGORY_EMOJI: Record<string, string> = {
  llm: "🧠", models: "🧠", research: "🔬", infra: "⚡",
  infrastructure: "⚡", funding: "💰", product: "🚀",
  agents: "🤖", "open source": "📦", policy: "🛡️",
};

const TIER_BADGE: Record<string, { label: string; cls: string }> = {
  high:   { label: "CRITICAL", cls: "bg-red-500/10 text-red-400 border border-red-500/20" },
  medium: { label: "MONITOR",  cls: "bg-blue-500/10 text-blue-400 border border-blue-500/20" },
  low:    { label: "FYI",      cls: "bg-amber-500/10 text-amber-400 border border-amber-500/20" },
};

function getEmoji(tags: string[]): string {
  return tags?.map((t) => CATEGORY_EMOJI[t.toLowerCase()]).find(Boolean) ?? "📡";
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
      .then((res: { data: Signal[]; error: null } | Signal[]) => {
        const data = Array.isArray(res) ? res : (res as { data: Signal[] }).data;
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
    setTimeout(() => router.push("/brief"), 1400);
  }

  return (
    <div className="min-h-screen bg-[#0A0812] text-[#F5F0E8]">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-[#0A0812]/95 backdrop-blur-sm border-b border-white/[0.06] h-14 flex items-center justify-between px-6 md:px-8">
        <span className="font-bold text-[15px] tracking-[0.03em] text-[#F5F0E8]">
          AI Signal
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/brief")}
            className="text-[13px] font-medium text-[rgba(232,226,217,0.55)] border border-white/10 rounded-md px-3.5 py-1.5 hover:text-[#F5F0E8] hover:border-white/20 transition-colors"
          >
            Browse
          </button>
          <button
            onClick={() => document.getElementById("email-input")?.focus()}
            className="text-[13px] font-bold bg-[#7C3AED] text-[#F5F0E8] rounded-md px-3.5 py-1.5 hover:bg-[#6d28d9] transition-colors"
          >
            Subscribe free
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-[680px] mx-auto px-6 pt-20 pb-16">

        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[rgba(232,226,217,0.45)] mb-6">
          Daily Intelligence · Free Forever
        </p>

        <h1 className="text-[clamp(34px,6vw,54px)] font-display font-bold leading-[1.07] tracking-[-0.03em] text-[#F5F0E8] mb-5">
          AI changed overnight.
          <br />
          <span className="text-[rgba(232,226,217,0.35)]">Here&apos;s what to build.</span>
        </h1>

        <p className="text-[18px] text-[rgba(232,226,217,0.6)] leading-[1.65] max-w-[500px] mb-10">
          Every morning: the 3 AI moves that matter for startup CTOs — scored by infra impact, with a specific action template on what to do next.
        </p>

        {/* Email CTA */}
        {status === "done" ? (
          <div className="bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-lg px-5 py-4 text-[15px] text-[#22C55E] font-semibold max-w-[480px] mb-4">
            You&apos;re in — opening today&apos;s signals…
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 max-w-[480px] mb-3"
          >
            <input
              id="email-input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="flex-1 min-w-0 px-4 py-3.5 bg-white/[0.05] border border-white/10 rounded-md text-[#F5F0E8] text-[15px] placeholder:text-[rgba(232,226,217,0.3)] focus:outline-none focus:border-[#7C3AED] transition-colors"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-5 py-3.5 bg-[#7C3AED] hover:bg-[#6d28d9] disabled:opacity-50 text-[#F5F0E8] border-none rounded-md text-[14px] font-bold cursor-pointer whitespace-nowrap shrink-0 transition-colors"
            >
              {status === "loading" ? "…" : "Get the brief →"}
            </button>
          </form>
        )}

        <p className="text-[13px] text-[rgba(232,226,217,0.35)]">
          No spam. Unsubscribe anytime.{" "}
          <button
            onClick={() => router.push("/brief")}
            className="text-[rgba(232,226,217,0.45)] underline underline-offset-2 decoration-white/20 hover:text-[rgba(232,226,217,0.7)] transition-colors bg-transparent border-none cursor-pointer p-0 text-[13px]"
          >
            Browse without email →
          </button>
        </p>
      </section>

      {/* ── Stats row ── */}
      <section className="max-w-[680px] mx-auto px-6 pb-12">
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {[
            ["1,200+", "CTOs subscribed"],
            ["4 min", "daily read time"],
            ["5:30 AM IST", "delivered daily"],
            ["Free forever", "no credit card"],
          ].map(([stat, label]) => (
            <div key={label} className="flex items-baseline gap-1.5">
              <span className="font-mono text-[13px] font-bold text-[#7C3AED]">{stat}</span>
              <span className="text-[12px] text-[rgba(232,226,217,0.4)]">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Trust logos ── */}
      <section className="max-w-[680px] mx-auto px-6 pb-14">
        <p className="text-[11px] uppercase tracking-[0.1em] text-[rgba(232,226,217,0.3)] mb-3">
          Read by teams at
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 items-center">
          {["Anthropic", "Y Combinator", "AWS Startups", "Sequoia Scout", "HuggingFace"].map((name) => (
            <span key={name} className="text-[13px] font-medium text-[rgba(232,226,217,0.4)]">
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* ── Brief preview ── */}
      {signals.length > 0 && (
        <section className="max-w-[680px] mx-auto px-6 pb-24">

          {/* Section header */}
          <div className="bg-white/[0.04] border border-white/[0.06] px-5 py-2.5 mb-0">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[rgba(232,226,217,0.55)]">
              Today&apos;s Brief — Preview
            </span>
          </div>

          {/* Signal rows */}
          <div className="border border-t-0 border-white/[0.06]">
            {signals.map((signal, idx) => {
              const tags = signal.tags ?? [];
              const emoji = getEmoji(tags);
              const catLabel = getCatLabel(tags);
              const badge = TIER_BADGE[signal.impactLevel] ?? TIER_BADGE.low;

              return (
                <div
                  key={signal.id}
                  className={`px-6 py-7 ${idx < signals.length - 1 ? "border-b border-white/[0.06]" : ""}`}
                >
                  {/* Category + badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[rgba(232,226,217,0.4)]">
                      {catLabel}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded-sm ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-[19px] font-semibold text-[#F5F0E8] leading-snug tracking-[-0.015em] mb-4">
                    {emoji} {signal.title}
                  </h3>

                  {/* What */}
                  {signal.what && (
                    <p className="text-[14px] text-[rgba(232,226,217,0.6)] leading-relaxed mb-3">
                      <span className="text-[rgba(232,226,217,0.35)] text-[11px] font-bold uppercase tracking-widest mr-2">
                        The Signal:
                      </span>
                      {signal.what}
                    </p>
                  )}

                  {/* Takeaway — amber left border */}
                  {signal.takeaway && (
                    <div className="border-l-2 border-[rgba(245,158,11,0.4)] pl-3.5 mt-4">
                      <span className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#f59e0b] mb-1">
                        Takeaway
                      </span>
                      <span className="block text-[14px] text-[#f59e0b] leading-relaxed font-medium">
                        {signal.takeaway}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer CTA */}
          <div className="pt-5 text-center">
            <button
              onClick={() => router.push("/brief")}
              className="text-[14px] text-[rgba(232,226,217,0.45)] hover:text-[rgba(232,226,217,0.7)] transition-colors bg-transparent border-none cursor-pointer underline underline-offset-2 decoration-white/20"
            >
              View all signals →
            </button>
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] py-8 px-6">
        <div className="max-w-[680px] mx-auto flex items-center justify-between flex-wrap gap-4">
          <span className="text-[13px] font-bold text-[rgba(232,226,217,0.35)] tracking-[0.03em]">
            AI Signal
          </span>
          <p className="text-[12px] text-[rgba(232,226,217,0.25)]">
            AI Signal · Bengaluru / Global
          </p>
        </div>
      </footer>
    </div>
  );
}
