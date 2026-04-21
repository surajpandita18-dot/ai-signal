"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "aiSignal_tooltipSeen";

export function FirstVisitTooltip() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        localStorage.setItem(STORAGE_KEY, "1");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      role="tooltip"
      style={{
        position: "fixed",
        bottom: "2rem",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#0f0f12",
        border: "1px solid rgba(139,92,246,0.35)",
        borderRadius: "8px",
        padding: "12px 20px",
        color: "#a78bfa",
        fontSize: "13px",
        fontWeight: 500,
        letterSpacing: "0.01em",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        zIndex: 1000,
        maxWidth: "360px",
        textAlign: "center",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
      onClick={() => {
        setVisible(false);
        localStorage.setItem(STORAGE_KEY, "1");
      }}
    >
      3 signals. Every morning. Everything else is noise.
      <span
        style={{
          display: "block",
          fontSize: "11px",
          color: "#52525b",
          marginTop: "4px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontWeight: 500,
        }}
      >
        click to dismiss
      </span>
    </div>
  );
}
