// app/saved/page.tsx
// Your saved signals library.
// Uses aiSignal_saves localStorage key (matches dashboard save/unsave in Zone1Signal).
// Fetches live signals from /api/news for titles + metadata.
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import type { Signal } from "@/lib/types";

interface SaveEntry {
  id: string;
  savedAt: string; // ISO date string
}

function parseSaves(): SaveEntry[] {
  // Support both legacy (string[]) and new ({ id, savedAt }[]) formats
  try {
    const raw = localStorage.getItem("aiSignal_saves");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    if (parsed.length === 0) return [];
    // Detect legacy format (array of strings)
    if (typeof parsed[0] === "string") {
      return (parsed as string[]).map((id) => ({ id, savedAt: new Date(0).toISOString() }));
    }
    return parsed as SaveEntry[];
  } catch {
    return [];
  }
}

function removeSave(id: string) {
  const saves = parseSaves().filter((e) => e.id !== id);
  localStorage.setItem("aiSignal_saves", JSON.stringify(saves));
}

export default function SavedPage() {
  const [saves, setSaves] = useState<SaveEntry[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const entries = parseSaves();
    setSaves(entries);

    if (entries.length === 0) {
      setLoading(false);
      return;
    }

    // Fetch live signals for metadata (title, source, score, etc.)
    fetch("/api/news")
      .then((r) => r.json())
      .then((data: Signal[]) => {
        setSignals(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleUnsave(id: string) {
    removeSave(id);
    setSaves((prev) => prev.filter((e) => e.id !== id));
  }

  const query = search.trim().toLowerCase();

  const savedSignals = useMemo(() => {
    // Build a map of signals by id for fast lookup
    const signalMap = new Map(signals.map((s) => [s.id, s]));

    // Sort saves newest-first, then join with signal data
    const sorted = [...saves].sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    );

    return sorted
      .map((entry) => ({ entry, signal: signalMap.get(entry.id) }))
      .filter(({ signal }) => {
        if (!signal) return false;
        if (query === "") return true;
        return (
          signal.title.toLowerCase().includes(query) ||
          signal.source.toLowerCase().includes(query) ||
          signal.tags.some((t) => t.toLowerCase().includes(query))
        );
      });
  }, [saves, signals, query]);

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
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
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
          <span style={{ color: "#27272a", fontSize: "13px" }}>/</span>
          <span style={{ fontSize: "13px", color: "#52525b", fontWeight: 500 }}>
            Saved
          </span>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search saved…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: "#0f0f12",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "6px",
            color: "#a1a1aa",
            fontSize: "13px",
            padding: "6px 12px",
            width: "180px",
            fontFamily: "inherit",
            outline: "none",
          }}
        />
      </header>

      <main
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "40px 24px 80px",
        }}
      >
        {/* ── Page header ─────────────────────────────────────────── */}
        <div style={{ marginBottom: "32px" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#52525b",
            }}
          >
            Signal Library
          </span>
          {!loading && saves.length > 0 && (
            <p
              style={{
                fontSize: "13px",
                color: "#3f3f46",
                marginTop: "4px",
              }}
            >
              {savedSignals.length} saved signal{savedSignals.length !== 1 ? "s" : ""}
              {query ? ` matching "${search.trim()}"` : ""}
            </p>
          )}
        </div>

        {/* ── Loading ─────────────────────────────────────────────── */}
        {loading && (
          <p style={{ fontSize: "13px", color: "#52525b", letterSpacing: "0.02em" }}>
            Loading…
          </p>
        )}

        {/* ── Empty: nothing saved ──────────────────────────────────*/}
        {!loading && saves.length === 0 && (
          <div
            style={{
              padding: "64px 0",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <span style={{ fontSize: "28px", opacity: 0.25 }}>🔖</span>
            <p
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "#fafafa",
                margin: 0,
              }}
            >
              Your signal library is empty
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "#52525b",
                margin: 0,
                lineHeight: 1.6,
                maxWidth: "360px",
              }}
            >
              Save signals from the dashboard by clicking ♡ — they appear here.
            </p>
            <Link
              href="/"
              style={{
                display: "inline-block",
                marginTop: "8px",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "6px",
                color: "#a1a1aa",
                fontSize: "13px",
                fontWeight: 600,
                padding: "8px 16px",
                textDecoration: "none",
              }}
            >
              Browse today&apos;s signals →
            </Link>
          </div>
        )}

        {/* ── Empty: search no results ──────────────────────────── */}
        {!loading && saves.length > 0 && savedSignals.length === 0 && (
          <div style={{ padding: "40px 0" }}>
            <p style={{ fontSize: "15px", color: "#52525b", margin: 0 }}>
              No saved signals match &ldquo;{search.trim()}&rdquo;
            </p>
          </div>
        )}

        {/* ── Signal list ──────────────────────────────────────────── */}
        <section>
          {savedSignals.map(({ entry, signal }) => {
            if (!signal) return null;
            const savedDate = new Date(entry.savedAt);
            const isLegacySave = entry.savedAt === new Date(0).toISOString();
            const amberColor = "#d97706";
            const hasLLM = signal.processed && !!signal.takeaway;
            const isGated = !!signal.takeawayGated;

            return (
              <div
                key={signal.id}
                style={{
                  display: "flex",
                  gap: "16px",
                  padding: "20px 16px",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  alignItems: "flex-start",
                  transition: "background 150ms ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#141418";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Source + save date badge */}
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                      marginBottom: "8px",
                      flexWrap: "wrap",
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
                      {signal.source}
                    </span>
                    <span style={{ color: "#27272a" }}>·</span>
                    <span style={{ fontSize: "11px", color: "#52525b" }}>
                      {new Date(signal.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {/* Save date badge */}
                    {!isLegacySave && (
                      <>
                        <span style={{ color: "#27272a" }}>·</span>
                        <span
                          style={{
                            fontSize: "10px",
                            color: "#3f3f46",
                            background: "#1a1a20",
                            borderRadius: "4px",
                            padding: "2px 6px",
                            fontWeight: 500,
                          }}
                        >
                          saved{" "}
                          {savedDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Title */}
                  <Link
                    href={`/article/${signal.id}`}
                    style={{
                      display: "block",
                      fontSize: "17px",
                      fontWeight: 600,
                      color: "#fafafa",
                      lineHeight: 1.3,
                      textDecoration: "none",
                      marginBottom: "12px",
                    }}
                  >
                    {signal.title}
                  </Link>

                  {/* Tags */}
                  {signal.tags.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                        flexWrap: "wrap",
                        marginBottom: "12px",
                      }}
                    >
                      {signal.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            fontSize: "10px",
                            padding: "2px 7px",
                            background: "#1a1a20",
                            borderRadius: "4px",
                            color: "#52525b",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            fontWeight: 500,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* TAKEAWAY — visible when paid */}
                  {hasLLM && (
                    <div
                      style={{
                        borderLeft: "2px solid rgba(245,158,11,0.4)",
                        paddingLeft: "12px",
                      }}
                    >
                      <span
                        style={{
                          display: "block",
                          fontSize: "11px",
                          fontWeight: 500,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: amberColor,
                          marginBottom: "4px",
                        }}
                      >
                        Takeaway
                      </span>
                      <span
                        style={{
                          fontSize: "14px",
                          color: amberColor,
                          lineHeight: 1.6,
                          display: "block",
                        }}
                      >
                        {signal.takeaway}
                      </span>
                    </div>
                  )}

                  {/* TAKEAWAY gate */}
                  {isGated && (
                    <div
                      style={{
                        borderLeft: "2px solid rgba(245,158,11,0.2)",
                        paddingLeft: "12px",
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
                        href="/upgrade"
                        style={{
                          display: "inline-block",
                          background: "rgba(245,158,11,0.06)",
                          border: "1px solid rgba(245,158,11,0.2)",
                          borderRadius: "6px",
                          color: "#d97706",
                          fontSize: "12px",
                          fontWeight: 600,
                          padding: "6px 14px",
                          textDecoration: "none",
                          letterSpacing: "0.02em",
                        }}
                      >
                        Unlock takeaway →
                      </Link>
                    </div>
                  )}
                </div>

                {/* Unsave button */}
                <button
                  onClick={() => handleUnsave(signal.id)}
                  aria-label="Remove from saved"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#7c3aed",
                    fontSize: "16px",
                    padding: "4px",
                    lineHeight: 1,
                    flexShrink: 0,
                    paddingTop: "8px",
                    transition: "color 150ms ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = "#a78bfa";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = "#7c3aed";
                  }}
                >
                  ♥
                </button>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}
