// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Zone1Signal } from "@/app/components/Zone1Signal";
import { Zone2Card } from "@/app/components/Zone2Card";
import { OnboardingOverlay } from "@/app/components/OnboardingOverlay";
import { LandingPage } from "@/app/components/LandingPage";
import { useUserPlan } from "@/lib/useUserPlan";
import type { Signal } from "@/lib/types";

const ZONE1_COUNT = 5;
const ZONE1_MIN_SCORE = 2.8;
const ZONE1_MIN_SHOW = 3;

export default function Home() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  useUserPlan(); // retained for future paid tier
  const { status: authStatus } = useSession();

  function loadSignals() {
    setLoading(true);
    setFetchError(false);
    fetch("/api/news")
      .then((r) => {
        if (!r.ok) throw new Error("non-ok");
        return r.json();
      })
      .then((data: Signal[]) => {
        setSignals(data);
        setLoading(false);
      })
      .catch(() => {
        setFetchError(true);
        setLoading(false);
      });
  }

  useEffect(() => {
    const d: string[] = JSON.parse(localStorage.getItem("aiSignal_dismissed") ?? "[]");
    setDismissed(new Set(d));
    loadSignals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Unauthenticated: show landing page instead of dashboard
  if (authStatus === "unauthenticated") {
    return <LandingPage />;
  }

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

        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexShrink: 1, minWidth: 0 }}>
          <Link
            href={`/digest/${new Date().toISOString().slice(0, 10)}`}
            style={{
              fontSize: "13px",
              color: "#a1a1aa",
              textDecoration: "none",
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            Brief
          </Link>
          <Link
            href="/saved"
            style={{
              fontSize: "13px",
              color: "#a1a1aa",
              textDecoration: "none",
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            Saved
          </Link>
          <Link
            href="/upgrade"
            style={{
              fontSize: "12px",
              color: "#52525b",
              textDecoration: "none",
              fontWeight: 500,
              whiteSpace: "nowrap",
              letterSpacing: "0.02em",
            }}
          >
            Join waitlist
          </Link>
        </div>
      </header>

      <main
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "32px 16px 80px",
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

        {/* ── API error state ───────────────────────────────────── */}
        {!loading && fetchError && (
          <div
            style={{
              padding: "48px 0",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <p
              style={{
                fontSize: "15px",
                color: "#52525b",
                lineHeight: 1.6,
              }}
            >
              Having trouble loading signals. Check your connection and try again.
            </p>
            <button
              onClick={loadSignals}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "none",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "6px",
                color: "#a1a1aa",
                fontSize: "13px",
                fontWeight: 600,
                padding: "8px 16px",
                cursor: "pointer",
                alignSelf: "flex-start",
                transition: "border-color 150ms ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.25)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
              }}
            >
              ↺ Retry
            </button>
          </div>
        )}

        {/* ── Zone 1 empty state (signals processing) ───────────── */}
        {!loading && !fetchError && zone1.length === 0 && (
          <div
            style={{
              padding: "48px 0",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div style={{ fontSize: "24px", opacity: 0.3 }}>⏱</div>
            <p
              style={{
                fontSize: "15px",
                color: "#52525b",
                lineHeight: 1.6,
                maxWidth: "400px",
              }}
            >
              Signals processing — the pipeline runs each morning. Browse below while we finish.
            </p>
          </div>
        )}

        {/* ── Zone 1: editorial list ────────────────────────────── */}
        <section>
          {zone1.map((signal, i) => (
            <Zone1Signal
              key={signal.id}
              signal={signal}
              rank={i + 1}
              onDismiss={handleDismiss}
            />
          ))}
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

        {/* ── Zone 2 empty state ───────────────────────────────── */}
        {!loading && !fetchError && zone2.length === 0 && signals.length > 0 && (
          <p
            style={{
              fontSize: "13px",
              color: "#3f3f46",
              letterSpacing: "0.02em",
              paddingTop: "8px",
            }}
          >
            Feed refreshing — more signals arrive through the day.
          </p>
        )}
      </main>

      <OnboardingOverlay />
    </div>
  );
}
