// app/components/Zone1Signal.tsx
// Editorial row: rank number + title + TAKEAWAY (server-gated — null if not paid)
// Save ♡ (logs signal_saved) + Dismiss ✕ (logs signal_dismissed)
//
// TAKEAWAY gate is server-side: the API never sends takeaway to free/unauthed users.
// No client-side blur. When takeaway is null but signal is processed, a solid
// upgrade surface is shown instead.
"use client";

import { useState } from "react";
import Link from "next/link";
import type { Signal } from "@/lib/types";
import { trackSignalSaved, trackSignalDismissed, trackUpgradeClicked } from "@/lib/analytics";

interface Props {
  signal: Signal;
  rank: number;
  onDismiss: (id: string) => void;
}

export function Zone1Signal({ signal, rank, onDismiss }: Props) {
  const [saved, setSaved] = useState(() => {
    if (typeof window === "undefined") return false;
    const saves: string[] = JSON.parse(localStorage.getItem("aiSignal_saves") ?? "[]");
    return saves.includes(signal.id);
  });

  function handleSave(e: React.MouseEvent) {
    e.preventDefault();
    const saves: string[] = JSON.parse(localStorage.getItem("aiSignal_saves") ?? "[]");
    if (saved) {
      localStorage.setItem("aiSignal_saves", JSON.stringify(saves.filter((id) => id !== signal.id)));
      setSaved(false);
    } else {
      localStorage.setItem("aiSignal_saves", JSON.stringify([...saves, signal.id]));
      setSaved(true);
      trackSignalSaved(signal.id);
    }
  }

  function handleDismiss(e: React.MouseEvent) {
    e.preventDefault();
    trackSignalDismissed(signal.id);
    onDismiss(signal.id);
  }

  const rankStr = String(rank).padStart(2, "0");
  // takeaway is populated when paid (server sends it) or null when stripped/skipped
  const hasLLM = signal.processed && !!signal.takeaway;
  // takeawayGated=true means server withheld a real takeaway (free/unauthed user)
  // This is distinct from takeaway=null because LLM returned SKIP (no gate shown)
  const isGated = !!signal.takeawayGated;
  // Signal #1 gets amber-primary, #2-3 get amber-secondary
  const amberColor = rank === 1 ? "#f59e0b" : "#d97706";

  return (
    <div
      style={{
        display: "flex",
        gap: "24px",
        padding: "24px 16px",
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
      {/* Rank — 48px, dim editorial purple */}
      <span
        style={{
          fontSize: "48px",
          fontWeight: 800,
          color: "rgba(124,58,237,0.15)",
          lineHeight: 1,
          minWidth: "48px",
          fontVariantNumeric: "tabular-nums",
          flexShrink: 0,
          letterSpacing: "-0.02em",
          marginTop: "-4px",
        }}
      >
        {rankStr}
      </span>

      {/* Content */}
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
            {signal.source}
          </span>
          <span style={{ color: "#27272a" }}>·</span>
          <span style={{ fontSize: "11px", color: "#52525b" }}>
            {new Date(signal.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>

        {/* Title */}
        <Link
          href={`/article/${signal.id}`}
          style={{
            display: "block",
            fontSize: "20px",
            fontWeight: 600,
            color: "#fafafa",
            lineHeight: 1.3,
            textDecoration: "none",
            marginBottom: "16px",
          }}
        >
          {signal.title}
        </Link>

        {/* TAKEAWAY — visible only when server sent it (paid users) */}
        {hasLLM && (
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
                color: amberColor,
                marginBottom: "4px",
              }}
            >
              Takeaway
            </span>
            <span
              style={{
                fontSize: "15px",
                color: amberColor,
                lineHeight: 1.6,
                display: "block",
              }}
            >
              {signal.takeaway}
            </span>
          </div>
        )}

        {/* TAKEAWAY gate — solid surface, no blur (server stripped takeaway) */}
        {isGated && (
          <div
            style={{
              borderLeft: "2px solid rgba(245,158,11,0.2)",
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
                color: "#52525b",
                marginBottom: "6px",
              }}
            >
              Takeaway
            </span>
            <button
              onClick={() => trackUpgradeClicked("zone1_gate")}
              style={{
                background: "rgba(245,158,11,0.06)",
                border: "1px solid rgba(245,158,11,0.2)",
                borderRadius: "6px",
                color: "#d97706",
                fontSize: "12px",
                fontWeight: 600,
                padding: "6px 14px",
                cursor: "pointer",
                letterSpacing: "0.02em",
              }}
            >
              Unlock takeaway →
            </button>
          </div>
        )}

        {/* No LLM yet — show tags as fallback */}
        {!hasLLM && signal.tags.length > 0 && (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {signal.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: "11px",
                  padding: "2px 8px",
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
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px", flexShrink: 0, paddingTop: "4px" }}>
        <button
          onClick={handleSave}
          aria-label={saved ? "Unsave signal" : "Save signal"}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: saved ? "#7c3aed" : "#52525b",
            fontSize: "16px",
            padding: "4px",
            lineHeight: 1,
            transition: "color 150ms ease",
          }}
        >
          {saved ? "♥" : "♡"}
        </button>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss signal"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#52525b",
            fontSize: "14px",
            padding: "4px",
            lineHeight: 1,
            transition: "color 150ms ease",
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
