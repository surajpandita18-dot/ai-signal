// app/components/Zone2Card.tsx
// Compact card: source dot + score bar + title + Read →
// No summaries. No what/why/takeaway.
"use client";

import Link from "next/link";
import type { Signal } from "@/lib/types";

interface Props {
  signal: Signal;
}

function scoreBarColor(score: number): string {
  if (score >= 4.0) return "#7c3aed"; // purple — high impact
  if (score >= 3.0) return "#4f46e5"; // indigo — medium
  return "#52525b";                    // muted — low
}

function sourceDotColor(category: Signal["sourceCategory"]): string {
  switch (category) {
    case "official":  return "#f59e0b"; // amber — official labs
    case "research":  return "#7c3aed"; // purple — research
    case "media":     return "#4f46e5"; // indigo — media
    case "substack":  return "#d97706"; // amber-secondary — newsletters
    case "community": return "#52525b"; // muted — community
    default:          return "#52525b";
  }
}

export function Zone2Card({ signal }: Props) {
  const barColor = scoreBarColor(signal.signalScore);
  const barWidth = `${Math.min((signal.signalScore / 5) * 100, 100).toFixed(0)}%`;
  const dotColor = sourceDotColor(signal.sourceCategory);

  return (
    <Link
      href={`/article/${signal.id}`}
      style={{
        display: "block",
        background: "#0f0f12",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "6px",
        padding: "16px",
        textDecoration: "none",
        transition: "transform 150ms ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      }}
    >
      {/* Source row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: dotColor,
            flexShrink: 0,
          }}
        />
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
      </div>

      {/* Score bar — 3px, no track bg glow */}
      <div
        style={{
          height: "3px",
          background: "rgba(255,255,255,0.06)",
          borderRadius: "2px",
          marginBottom: "12px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: barWidth,
            background: barColor,
            borderRadius: "2px",
          }}
        />
      </div>

      {/* Title — 2 lines max */}
      <p
        style={{
          fontSize: "13px",
          fontWeight: 600,
          color: "#fafafa",
          lineHeight: 1.5,
          margin: "0 0 16px",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {signal.title}
      </p>

      {/* Read → */}
      <span
        style={{
          fontSize: "11px",
          color: "#7c3aed",
          fontWeight: 600,
          letterSpacing: "0.02em",
        }}
      >
        Read →
      </span>
    </Link>
  );
}
