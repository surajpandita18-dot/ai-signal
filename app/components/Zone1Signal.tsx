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
  return hit ? hit.toUpperCase() : "";
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
      {/* Card wrapper — Rundown-style bordered card per signal */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          padding: "20px",
          background: "#111111",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "8px",
          alignItems: "flex-start",
          transition: "background 150ms ease, border-color 150ms ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "#161616";
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "#111111";
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
        }}
      >
        {/* Rank */}
        <span style={{
          fontSize: "40px",
          fontWeight: 800,
          color: "rgba(124,58,237,0.12)",
          lineHeight: 1,
          minWidth: "40px",
          fontVariantNumeric: "tabular-nums",
          flexShrink: 0,
          letterSpacing: "-0.02em",
          marginTop: "2px",
        }}>
          {rankStr}
        </span>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Source row */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "10px", flexWrap: "wrap" }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: dotColor, flexShrink: 0, display: "inline-block" }} />
            <span style={{ fontSize: "11px", color: "#3f3f46", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
              {signal.source}
            </span>
            <span style={{ color: "#27272a", fontSize: "11px" }}>·</span>
            <span style={{ fontSize: "11px", color: "#3f3f46" }}>
              {new Date(signal.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
            {categoryLabel && (
              <span style={{
                fontSize: "10px",
                fontWeight: 700,
                padding: "1px 6px",
                borderRadius: "3px",
                background: `${categoryColor}15`,
                color: categoryColor,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}>
                {categoryLabel}
              </span>
            )}
          </div>

          {/* Title */}
          <Link
            href={`/article/${signal.id}`}
            style={{
              display: "block",
              fontSize: "18px",
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.35,
              textDecoration: "none",
              marginBottom: "14px",
              letterSpacing: "-0.015em",
            }}
          >
            {emoji} {signal.title}
          </Link>

          {/* WHAT — inline bold prefix, Rundown style */}
          {signal.processed && signal.what && (
            <p style={{ fontSize: "14px", color: "#a1a1aa", lineHeight: 1.7, marginBottom: "10px" }}>
              <strong style={{ color: "#ffffff", fontWeight: 600 }}>The Signal: </strong>
              {signal.what}
            </p>
          )}

          {/* WHY — inline bold prefix, Rundown style */}
          {signal.processed && signal.why && (
            <p style={{ fontSize: "14px", color: "#a1a1aa", lineHeight: 1.7, marginBottom: "14px" }}>
              <strong style={{ color: "#ffffff", fontWeight: 600 }}>Why it matters: </strong>
              {signal.why}
            </p>
          )}

          {/* TAKEAWAY — our differentiator, keep as-is */}
          {hasLLM && (
            <div style={{
              borderLeft: "2px solid rgba(245,158,11,0.5)",
              paddingLeft: "14px",
              marginTop: "4px",
            }}>
              <p style={{ fontSize: "14px", color: amberColor, lineHeight: 1.65, margin: 0 }}>
                <strong style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginRight: "8px" }}>
                  Takeaway
                </strong>
                {signal.takeaway}
              </p>
            </div>
          )}

          {/* Fallback tags */}
          {!hasLLM && signal.tags.length > 0 && (
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {signal.tags.map((tag) => (
                <span key={tag} style={{
                  fontSize: "10px",
                  padding: "2px 7px",
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
        <div style={{ display: "flex", gap: "6px", flexShrink: 0, paddingTop: "2px" }}>
          <button
            onClick={(e) => { e.preventDefault(); setShowShare(true); }}
            aria-label="Share"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#3f3f46", fontSize: "14px", padding: "4px", lineHeight: 1, transition: "color 150ms ease" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#a1a1aa"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#3f3f46"; }}
          >↗</button>
          <button
            onClick={handleSave}
            aria-label={saved ? "Unsave" : "Save"}
            style={{ background: "none", border: "none", cursor: "pointer", color: saved ? "#7c3aed" : "#3f3f46", fontSize: "15px", padding: "4px", lineHeight: 1, transition: "color 150ms ease" }}
          >
            {saved ? "♥" : "♡"}
          </button>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#3f3f46", fontSize: "13px", padding: "4px", lineHeight: 1, transition: "color 150ms ease" }}
          >✕</button>
        </div>
      </div>
      {showShare && <ShareModal signal={signal} zone="zone1" onClose={() => setShowShare(false)} />}
    </>
  );
}
