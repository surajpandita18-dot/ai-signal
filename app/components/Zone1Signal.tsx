"use client";

import { useState } from "react";
import Link from "next/link";
import type { Signal } from "@/lib/types";
import { trackSignalSaved, trackSignalDismissed } from "@/lib/analytics";
import { ShareModal } from "@/app/components/ShareModal";

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
  return tags.map((t) => CATEGORY_EMOJI[t.toLowerCase()]).find(Boolean) ?? "📡";
}

function getCategoryLabel(tags: string[]): string {
  const hit = tags.find((t) => CATEGORY_EMOJI[t.toLowerCase()]);
  return hit ? hit.charAt(0).toUpperCase() + hit.slice(1).toLowerCase() : "";
}

function getCategoryColor(tags: string[]): string {
  return tags.map((t) => CATEGORY_COLOR[t.toLowerCase()]).find(Boolean) ?? "#52525b";
}

function sourceDotColor(cat: Signal["sourceCategory"]): string {
  switch (cat) {
    case "official":  return "#f59e0b";
    case "research":  return "#7c3aed";
    case "media":     return "#4f46e5";
    case "substack":  return "#d97706";
    case "community": return "#52525b";
    default:          return "#52525b";
  }
}

interface Props {
  signal: Signal;
  rank: number;
  onDismiss: (id: string) => void;
}

export function Zone1Signal({ signal, rank, onDismiss }: Props) {
  type SaveEntry = { id: string; savedAt: string };

  function parseSaveEntries(): SaveEntry[] {
    try {
      const raw = localStorage.getItem("aiSignal_saves");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) return [];
      if (typeof parsed[0] === "string") {
        return (parsed as string[]).map((id) => ({ id, savedAt: new Date(0).toISOString() }));
      }
      return parsed as SaveEntry[];
    } catch { return []; }
  }

  const [showShare, setShowShare] = useState(false);
  const [saved, setSaved] = useState(() => {
    if (typeof window === "undefined") return false;
    return parseSaveEntries().some((e) => e.id === signal.id);
  });

  function handleSave(e: React.MouseEvent) {
    e.preventDefault();
    const entries = parseSaveEntries();
    if (saved) {
      localStorage.setItem("aiSignal_saves", JSON.stringify(entries.filter((e) => e.id !== signal.id)));
      setSaved(false);
    } else {
      localStorage.setItem("aiSignal_saves", JSON.stringify([...entries, { id: signal.id, savedAt: new Date().toISOString() }]));
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
  const hasLLM = signal.processed && !!signal.takeaway;
  const amberColor = rank === 1 ? "#f59e0b" : "#d97706";
  const emoji = getEmoji(signal.tags ?? []);
  const categoryLabel = getCategoryLabel(signal.tags ?? []);
  const categoryColor = getCategoryColor(signal.tags ?? []);
  const dotColor = sourceDotColor(signal.sourceCategory);

  return (
    <>
      <div
        style={{
          display: "flex",
          gap: "20px",
          padding: "24px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          alignItems: "flex-start",
          transition: "background 150ms ease",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#111111"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
      >
        {/* Rank */}
        <span
          style={{
            fontSize: "44px",
            fontWeight: 800,
            color: "rgba(124,58,237,0.12)",
            lineHeight: 1,
            minWidth: "44px",
            fontVariantNumeric: "tabular-nums",
            flexShrink: 0,
            letterSpacing: "-0.02em",
            marginTop: "-2px",
          }}
        >
          {rankStr}
        </span>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Source row — dot + source + date + category pill */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "10px", flexWrap: "wrap" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: dotColor, flexShrink: 0, display: "inline-block" }} />
            <span style={{ fontSize: "11px", color: "#52525b", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500 }}>
              {signal.source}
            </span>
            <span style={{ color: "#27272a" }}>·</span>
            <span style={{ fontSize: "11px", color: "#52525b" }}>
              {new Date(signal.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
            {categoryLabel && (
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  padding: "1px 7px",
                  borderRadius: "3px",
                  background: `${categoryColor}18`,
                  color: categoryColor,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {categoryLabel}
              </span>
            )}
          </div>

          {/* Title — emoji prefix, Rundown style */}
          <Link
            href={`/article/${signal.id}`}
            style={{
              display: "block",
              fontSize: "19px",
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.35,
              textDecoration: "none",
              marginBottom: "14px",
              letterSpacing: "-0.01em",
            }}
          >
            {emoji} {signal.title}
          </Link>

          {/* WHAT */}
          {signal.processed && signal.what && (
            <div style={{ marginBottom: "10px" }}>
              <span style={{
                display: "inline-block",
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#71717a",
                marginBottom: "5px",
              }}>
                What
              </span>
              <span style={{ fontSize: "14px", color: "#a1a1aa", lineHeight: 1.65, display: "block" }}>
                {signal.what}
              </span>
            </div>
          )}

          {/* WHY */}
          {signal.processed && signal.why && (
            <div style={{ marginBottom: "14px" }}>
              <span style={{
                display: "inline-block",
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#71717a",
                marginBottom: "5px",
              }}>
                Why it matters
              </span>
              <span style={{ fontSize: "14px", color: "#a1a1aa", lineHeight: 1.65, display: "block" }}>
                {signal.why}
              </span>
            </div>
          )}

          {/* TAKEAWAY — the screenshottable moment */}
          {hasLLM && (
            <div style={{ borderLeft: "2px solid rgba(245,158,11,0.5)", paddingLeft: "14px", marginTop: "4px" }}>
              <span style={{
                display: "block",
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: amberColor,
                marginBottom: "5px",
              }}>
                Takeaway
              </span>
              <span style={{ fontSize: "15px", color: amberColor, lineHeight: 1.6, display: "block" }}>
                {signal.takeaway}
              </span>
            </div>
          )}

          {/* Fallback tags */}
          {!hasLLM && signal.tags.length > 0 && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {signal.tags.map((tag) => (
                <span key={tag} style={{
                  fontSize: "11px",
                  padding: "2px 8px",
                  background: "#1a1a1a",
                  borderRadius: "3px",
                  color: "#52525b",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontWeight: 500,
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "8px", flexShrink: 0, paddingTop: "4px" }}>
          <button
            onClick={(e) => { e.preventDefault(); setShowShare(true); }}
            aria-label="Share signal"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#52525b", fontSize: "14px", padding: "4px", lineHeight: 1, transition: "color 150ms ease" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#a1a1aa"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#52525b"; }}
          >
            ↗
          </button>
          <button
            onClick={handleSave}
            aria-label={saved ? "Unsave signal" : "Save signal"}
            style={{ background: "none", border: "none", cursor: "pointer", color: saved ? "#7c3aed" : "#52525b", fontSize: "16px", padding: "4px", lineHeight: 1, transition: "color 150ms ease" }}
          >
            {saved ? "♥" : "♡"}
          </button>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss signal"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#52525b", fontSize: "14px", padding: "4px", lineHeight: 1, transition: "color 150ms ease" }}
          >
            ✕
          </button>
        </div>
      </div>
      {showShare && <ShareModal signal={signal} zone="zone1" onClose={() => setShowShare(false)} />}
    </>
  );
}
