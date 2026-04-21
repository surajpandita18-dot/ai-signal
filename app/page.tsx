// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Zone1Signal } from "@/app/components/Zone1Signal";
import { Zone2Card } from "@/app/components/Zone2Card";
import { FirstVisitTooltip } from "@/app/components/FirstVisitTooltip";
import { useUserPlan } from "@/lib/useUserPlan";
import { trackUpgradeClicked } from "@/lib/analytics";
import type { Signal } from "@/lib/types";

const ZONE1_COUNT = 5;       // Total Zone 1 slots
const ZONE1_FREE_COUNT = 3;  // Free users see unblurred cards for first 3
const ZONE1_MIN_SCORE = 2.8; // Lowered from 3.5 — calibrated to real score distribution
const ZONE1_MIN_SHOW = 3;    // Always show at least this many when processed signals exist

export default function Home() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const plan = useUserPlan();
  const isPaid = plan === "paid";
  const { status: authStatus } = useSession();
  const isAuthenticated = authStatus === "authenticated";

  useEffect(() => {
    const d: string[] = JSON.parse(localStorage.getItem("aiSignal_dismissed") ?? "[]");
    setDismissed(new Set(d));

    fetch("/api/news")
      .then((r) => r.json())
      .then((data: Signal[]) => {
        setSignals(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleDismiss(id: string) {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem("aiSignal_dismissed", JSON.stringify([...next]));
      return next;
    });
  }

  const visibleSignals = signals.filter((s) => !dismissed.has(s.id));

  // Zone 1: signals that have real LLM takeaway content (either present or server-gated).
  // LLM-SKIP'd signals (processed=true, takeaway=null, takeawayGated absent) go to Zone 2.
  const hasEnrichedContent = (s: Signal) =>
    s.processed && (!!s.takeaway || !!s.takeawayGated);

  const zone1Primary = visibleSignals.filter((s) => {
    if (!hasEnrichedContent(s)) return false;
    if (s.signalScore < ZONE1_MIN_SCORE) return false;
    if (s.zone1EligibleUntil && new Date(s.zone1EligibleUntil) < new Date()) return false;
    return true;
  });

  // Fallback: if fewer than ZONE1_MIN_SHOW have enriched content + qualify by score,
  // top up with any enriched signal regardless of threshold (pipeline ran, use what we have)
  let zone1: Signal[];
  if (zone1Primary.length >= ZONE1_MIN_SHOW) {
    zone1 = zone1Primary.slice(0, ZONE1_COUNT);
  } else {
    const primaryIds = new Set(zone1Primary.map((s) => s.id));
    const fallback = visibleSignals
      .filter((s) => hasEnrichedContent(s) && !primaryIds.has(s.id))
      .slice(0, ZONE1_MIN_SHOW - zone1Primary.length);
    zone1 = [...zone1Primary, ...fallback].slice(0, ZONE1_COUNT);
  }

  const zone1Ids = new Set(zone1.map((s) => s.id));
  const zone2 = visibleSignals.filter((s) => !zone1Ids.has(s.id)).slice(0, 50);

  return (
    <div style={{ minHeight: "100vh", background: "#09090b", color: "#fafafa" }}>

      {/* ── Navbar ──────────────────────────────────────────────── */}
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

        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <Link
            href="/saved"
            style={{
              fontSize: "13px",
              color: "#a1a1aa",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Saved
          </Link>
          {!isPaid && (
            <button
              onClick={() => trackUpgradeClicked("nav")}
              style={{
                background: "none",
                border: "1px solid rgba(139,92,246,0.35)",
                color: "#a78bfa",
                borderRadius: "6px",
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: "0.02em",
                transition: "border-color 150ms ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(139,92,246,0.7)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(139,92,246,0.35)";
              }}
            >
              Upgrade for full access
            </button>
          )}
        </div>
      </header>

      <main
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "40px 24px 80px",
        }}
      >

        {/* ── Zone 1 header ────────────────────────────────────── */}
        <div style={{ marginBottom: "8px" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#52525b",
            }}
          >
            Today&apos;s Signals
          </span>
        </div>

        {/* ── Loading state ─────────────────────────────────────── */}
        {loading && (
          <div
            style={{
              color: "#52525b",
              padding: "48px 0",
              fontSize: "13px",
              letterSpacing: "0.02em",
            }}
          >
            Loading…
          </div>
        )}

        {/* ── Empty state ───────────────────────────────────────── */}
        {!loading && zone1.length === 0 && (
          <div
            style={{
              color: "#52525b",
              padding: "48px 0",
              fontSize: "15px",
              lineHeight: 1.6,
            }}
          >
            No high-impact signals today. Check back tomorrow or browse the archive below.
          </div>
        )}

        {/* ── Zone 1: editorial list ────────────────────────────── */}
        <section>
          {zone1.map((signal, i) => {
            const rank = i + 1;

            // Unauthenticated: signal #1 renders normally (title + source, no TAKEAWAY
            // since server strips it). Signals #2+ show a single auth gate row.
            if (authStatus === "unauthenticated" && rank > 1) {
              if (rank === 2) {
                // Render auth gate once, spanning remaining slots
                return (
                  <div
                    key="auth-gate"
                    style={{
                      display: "flex",
                      gap: "24px",
                      padding: "32px 16px",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "48px",
                        fontWeight: 800,
                        color: "rgba(124,58,237,0.06)",
                        lineHeight: 1,
                        minWidth: "48px",
                        flexShrink: 0,
                        letterSpacing: "-0.02em",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      02
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#52525b",
                          marginBottom: "14px",
                          lineHeight: 1.5,
                        }}
                      >
                        Sign in to see today&apos;s signals — takes 10 seconds.
                      </p>
                      <Link
                        href="/api/auth/signin"
                        style={{
                          display: "inline-block",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "6px",
                          color: "#fafafa",
                          fontSize: "13px",
                          fontWeight: 600,
                          padding: "8px 18px",
                          textDecoration: "none",
                          letterSpacing: "0.01em",
                        }}
                      >
                        Sign in with GitHub →
                      </Link>
                    </div>
                  </div>
                );
              }
              // rank 3+ are hidden behind the single auth gate above
              return null;
            }

            // Authenticated but not paid: signals beyond ZONE1_FREE_COUNT show upgrade gate
            const isPaidGate = !isPaid && rank > ZONE1_FREE_COUNT;
            if (isPaidGate) {
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
                  <span
                    style={{
                      fontSize: "48px",
                      fontWeight: 800,
                      color: "rgba(124,58,237,0.06)",
                      lineHeight: 1,
                      minWidth: "48px",
                      flexShrink: 0,
                      letterSpacing: "-0.02em",
                      marginTop: "-4px",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {String(rank).padStart(2, "0")}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "20px",
                        fontWeight: 600,
                        color: "#3f3f46",
                        marginBottom: "16px",
                        lineHeight: 1.3,
                      }}
                    >
                      {signal.title}
                    </p>
                    <button
                      onClick={() => trackUpgradeClicked("zone1_gate")}
                      style={{
                        background: "none",
                        border: "1px solid rgba(139,92,246,0.35)",
                        color: "#a78bfa",
                        borderRadius: "6px",
                        padding: "6px 14px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        letterSpacing: "0.02em",
                      }}
                    >
                      Unlock with Pro →
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <Zone1Signal
                key={signal.id}
                signal={signal}
                rank={rank}
                onDismiss={handleDismiss}
              />
            );
          })}
        </section>

        {/* ── Zone 1→2 divider ──────────────────────────────────── */}
        {zone2.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              margin: "48px 0 32px",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.04)" }} />
            <span
              style={{
                fontSize: "11px",
                color: "#52525b",
                whiteSpace: "nowrap",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              More signals · {zone2.length} today
            </span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.04)" }} />
          </div>
        )}

        {/* ── Zone 2: compact grid ─────────────────────────────── */}
        {zone2.length > 0 && (
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "16px",
            }}
          >
            {zone2.map((signal) => (
              <Zone2Card key={signal.id} signal={signal} />
            ))}
          </section>
        )}
      </main>

      <FirstVisitTooltip />
    </div>
  );
}
