"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zone1Signal } from "@/app/components/Zone1Signal";
import { Zone2Card } from "@/app/components/Zone2Card";
import { OnboardingFlow } from "@/app/components/OnboardingFlow";
import { getPersonalizedScore } from "@/lib/personalization";
import type { Signal } from "@/lib/types";

const ZONE1_COUNT = 5;
const ZONE1_MIN_SCORE = 2.8;
const ZONE1_MIN_SHOW = 3;

export default function AppPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [userTopics, setUserTopics] = useState<string[]>([]);

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
    const role = localStorage.getItem("aiSignal_role") ?? "";
    const topics: string[] = JSON.parse(localStorage.getItem("aiSignal_topics") ?? "[]");
    setUserRole(role);
    setUserTopics(topics);
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

  const hasEnrichedContent = (s: Signal) =>
    s.processed && (!!s.takeaway || !!s.takeawayGated);

  const zone1Primary = visibleSignals.filter((s) => {
    if (!hasEnrichedContent(s)) return false;
    if (s.signalScore < ZONE1_MIN_SCORE) return false;
    if (s.zone1EligibleUntil && new Date(s.zone1EligibleUntil) < new Date()) return false;
    return true;
  });

  const sortByPersonalized = (arr: Signal[]) =>
    userRole
      ? [...arr].sort((a, b) => getPersonalizedScore(b, userRole, userTopics) - getPersonalizedScore(a, userRole, userTopics))
      : arr;

  let zone1: Signal[];
  if (zone1Primary.length >= ZONE1_MIN_SHOW) {
    zone1 = sortByPersonalized(zone1Primary).slice(0, ZONE1_COUNT);
  } else {
    const primaryIds = new Set(zone1Primary.map((s) => s.id));
    const fallback = visibleSignals
      .filter((s) => hasEnrichedContent(s) && !primaryIds.has(s.id))
      .slice(0, ZONE1_MIN_SHOW - zone1Primary.length);
    zone1 = sortByPersonalized([...zone1Primary, ...fallback]).slice(0, ZONE1_COUNT);
  }

  const zone1Ids = new Set(zone1.map((s) => s.id));
  const zone2All = visibleSignals.filter((s) => !zone1Ids.has(s.id)).slice(0, 50);

  const ZONE2_CATEGORIES = ["All", "Research", "LLM", "Agents", "Infra", "Funding", "Product"];
  const [zone2Filter, setZone2Filter] = useState<string>(() => {
    if (typeof window === "undefined") return "All";
    return localStorage.getItem("aiSignal_z2filter") ?? "All";
  });

  function handleZone2Filter(cat: string) {
    setZone2Filter(cat);
    localStorage.setItem("aiSignal_z2filter", cat);
  }
  const zone2 = zone2Filter === "All"
    ? zone2All
    : zone2All.filter((s) => s.tags?.some((t) => t.toLowerCase() === zone2Filter.toLowerCase()));

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

        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <Link
            href={`/digest/${new Date().toISOString().slice(0, 10)}`}
            style={{
              fontSize: "13px",
              color: "#a1a1aa",
              textDecoration: "none",
              fontWeight: 500,
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
            }}
          >
            Saved
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 16px 80px" }}>

        {/* ── Date + Zone 1 header ─────────────────────────────── */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "16px", marginBottom: "4px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#27272a",
              }}
            >
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#f59e0b",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#52525b",
                }}
              >
                Today&apos;s Intelligence
              </span>
            </div>
            {!loading && signals.length > 0 && (
              <span style={{ fontSize: "11px", color: "#3f3f46" }}>
                {zone1.length} of {signals.length} signals
              </span>
            )}
            {userRole && (
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#7c3aed",
                  letterSpacing: "0.04em",
                  background: "rgba(124,58,237,0.1)",
                  border: "1px solid rgba(124,58,237,0.2)",
                  borderRadius: "4px",
                  padding: "2px 8px",
                }}
              >
                personalized
              </span>
            )}
          </div>
        </div>

        {/* ── Loading state ─────────────────────────────────────── */}
        {loading && (
          <div style={{ color: "#52525b", padding: "48px 0", fontSize: "13px", letterSpacing: "0.02em" }}>
            Loading…
          </div>
        )}

        {/* ── API error state ───────────────────────────────────── */}
        {!loading && fetchError && (
          <div style={{ padding: "48px 0", display: "flex", flexDirection: "column", gap: "16px" }}>
            <p style={{ fontSize: "15px", color: "#52525b", lineHeight: 1.6 }}>
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
            >
              ↺ Retry
            </button>
          </div>
        )}

        {/* ── Zone 1 empty state ────────────────────────────────── */}
        {!loading && !fetchError && zone1.length === 0 && (
          <div style={{ padding: "48px 0", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ fontSize: "24px", opacity: 0.3 }}>⏱</div>
            <p style={{ fontSize: "15px", color: "#52525b", lineHeight: 1.6, maxWidth: "400px" }}>
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

        {/* ── Zone 2: category filter pills ────────────────────── */}
        {zone2All.length > 0 && (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
            {ZONE2_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleZone2Filter(cat)}
                style={{
                  background: zone2Filter === cat ? "rgba(124,58,237,0.12)" : "transparent",
                  border: `1px solid ${zone2Filter === cat ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.06)"}`,
                  borderRadius: "4px",
                  color: zone2Filter === cat ? "#a78bfa" : "#52525b",
                  fontSize: "11px",
                  fontWeight: zone2Filter === cat ? 600 : 400,
                  padding: "4px 10px",
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                  transition: "all 150ms ease",
                }}
              >
                {cat}
              </button>
            ))}
            {zone2Filter !== "All" && (
              <span style={{ fontSize: "11px", color: "#3f3f46", alignSelf: "center", marginLeft: "4px" }}>
                {zone2.length} of {zone2All.length}
              </span>
            )}
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
          <p style={{ fontSize: "13px", color: "#3f3f46", letterSpacing: "0.02em", paddingTop: "8px" }}>
            Feed refreshing — more signals arrive through the day.
          </p>
        )}
      </main>

      <OnboardingFlow />
    </div>
  );
}
