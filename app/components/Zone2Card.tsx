"use client";

import Link from "next/link";
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

function getCategoryMeta(tags: string[]): { emoji: string; color: string } {
  for (const tag of tags) {
    const key = tag.toLowerCase();
    if (CATEGORY_EMOJI[key]) {
      return { emoji: CATEGORY_EMOJI[key], color: CATEGORY_COLOR[key] ?? "#52525b" };
    }
  }
  return { emoji: "📡", color: "#52525b" };
}

interface Props {
  signal: Signal;
}

export function Zone2Card({ signal }: Props) {
  const { emoji, color } = getCategoryMeta(signal.tags ?? []);
  const barWidth = `${Math.min((signal.signalScore / 5) * 100, 100).toFixed(0)}%`;

  return (
    <Link
      href={`/article/${signal.id}`}
      style={{
        display: "flex",
        flexDirection: "column",
        background: "#111111",
        borderLeft: `3px solid ${color}`,
        borderRight: "1px solid rgba(255,255,255,0.08)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "0 8px 8px 0",
        padding: "14px 16px",
        textDecoration: "none",
        transition: "background 150ms ease",
        minHeight: "120px",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#161616"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#111111"; }}
    >
      {/* Emoji + source row */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
        <span style={{ fontSize: "12px", lineHeight: 1 }}>{emoji}</span>
        <span style={{
          fontSize: "11px",
          color: "#52525b",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 500,
        }}>
          {signal.source}
        </span>
      </div>

      {/* Score bar */}
      <div style={{
        height: "2px",
        background: "rgba(255,255,255,0.06)",
        borderRadius: "1px",
        marginBottom: "10px",
        overflow: "hidden",
      }}>
        <div style={{ height: "100%", width: barWidth, background: color, borderRadius: "1px" }} />
      </div>

      {/* Title */}
      <p style={{
        fontSize: "13px",
        fontWeight: 600,
        color: "#ffffff",
        lineHeight: 1.5,
        margin: "0 0 auto",
        paddingBottom: "12px",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}>
        {signal.title}
      </p>

      {/* Read link */}
      <span style={{
        fontSize: "11px",
        color: color,
        fontWeight: 600,
        letterSpacing: "0.02em",
        opacity: 0.8,
      }}>
        Read →
      </span>
    </Link>
  );
}
