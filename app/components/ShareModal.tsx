"use client";
import { useState } from "react";
import type { Signal } from "@/lib/types";
import { trackSignalShared } from "@/lib/analytics";

interface Props {
  signal: Signal;
  zone: "zone1" | "zone2" | "article";
  onClose: () => void;
}

export function ShareModal({ signal, zone, onClose }: Props) {
  const [thoughts, setThoughts] = useState("");
  const [mode, setMode] = useState<"quick" | "article">("quick");

  const quickText = [
    `AI Signal: ${signal.title}`,
    signal.what ? `\nWhat happened: ${signal.what}` : "",
    signal.why ? `\nWhy it matters: ${signal.why}` : "",
    thoughts ? `\nMy take: ${thoughts}` : (signal.takeaway ? `\nTakeaway: ${signal.takeaway}` : ""),
    `\n\nvia AI Signal — ai-signal-eta.vercel.app`,
  ].join("").trim();

  const articleText = [
    thoughts ? `${thoughts}\n\n` : "",
    `${signal.title}\n\n`,
    signal.what ?? "",
    signal.why ? `\n\n${signal.why}` : "",
    signal.takeaway ? `\n\nBuilder takeaway: ${signal.takeaway}` : "",
    `\n\nSource: ${signal.source}`,
    `\nShared via AI Signal`,
  ].join("").trim();

  const shareText = mode === "quick" ? quickText : articleText;
  const tweetText = shareText.slice(0, 240) + (shareText.length > 240 ? "…" : "");

  function shareLinkedIn() {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(signal.link)}&summary=${encodeURIComponent(shareText.slice(0, 700))}`;
    window.open(url, "_blank", "noopener");
    trackSignalShared(signal.id, "linkedin", zone);
    onClose();
  }

  function shareTwitter() {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(signal.link)}`;
    window.open(url, "_blank", "noopener");
    trackSignalShared(signal.id, "twitter", zone);
    onClose();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(9,9,11,0.8)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "#0f0f12",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "12px",
          padding: "32px",
          maxWidth: "520px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#fafafa", letterSpacing: "0.02em" }}>
            Share this signal
          </span>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#52525b", cursor: "pointer", fontSize: "18px", lineHeight: 1, padding: "4px" }}
          >
            ✕
          </button>
        </div>

        {/* Signal preview */}
        <div
          style={{
            background: "#1a1a20",
            borderRadius: "8px",
            padding: "16px",
            borderLeft: "2px solid rgba(124,58,237,0.4)",
          }}
        >
          <p style={{ fontSize: "13px", fontWeight: 600, color: "#fafafa", margin: "0 0 4px", lineHeight: 1.3 }}>
            {signal.title}
          </p>
          <span style={{ fontSize: "11px", color: "#52525b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {signal.source}
          </span>
        </div>

        {/* Mode toggle */}
        <div style={{ display: "flex", gap: "8px" }}>
          {(["quick", "article"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                background: mode === m ? "rgba(124,58,237,0.1)" : "transparent",
                border: `1px solid ${mode === m ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: "6px",
                color: mode === m ? "#a78bfa" : "#52525b",
                fontSize: "12px",
                fontWeight: mode === m ? 600 : 400,
                padding: "6px 14px",
                cursor: "pointer",
                transition: "border-color 150ms ease, color 150ms ease, background 150ms ease",
                textTransform: "capitalize",
              }}
            >
              {m === "quick" ? "Quick share" : "Write article"}
            </button>
          ))}
        </div>

        {/* Your thoughts */}
        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "#52525b", marginBottom: "8px" }}>
            Your thoughts (optional)
          </label>
          <textarea
            value={thoughts}
            onChange={(e) => setThoughts(e.target.value)}
            placeholder="Add your perspective..."
            rows={3}
            style={{
              width: "100%",
              background: "#09090b",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "6px",
              color: "#fafafa",
              fontSize: "14px",
              padding: "10px 12px",
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
              lineHeight: 1.5,
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
          />
        </div>

        {/* Share buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={shareLinkedIn}
            style={{
              flex: 1,
              background: "#0a66c2",
              border: "none",
              borderRadius: "6px",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 600,
              padding: "11px 16px",
              cursor: "pointer",
              transition: "opacity 150ms ease",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.85"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
          >
            Share on LinkedIn
          </button>
          <button
            onClick={shareTwitter}
            style={{
              flex: 1,
              background: "#09090b",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "6px",
              color: "#fafafa",
              fontSize: "13px",
              fontWeight: 600,
              padding: "11px 16px",
              cursor: "pointer",
              transition: "border-color 150ms ease",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.3)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.12)"; }}
          >
            Share on 𝕏
          </button>
        </div>
      </div>
    </div>
  );
}
