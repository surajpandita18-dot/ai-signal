// app/global-error.tsx
// Catches errors in the root layout itself (e.g. layout.tsx throws).
// Must include <html> and <body> since root layout is bypassed.
// Must be a client component.
"use client";

import { useEffect } from "react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[AI Signal] global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#09090b",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#52525b",
              marginBottom: "16px",
            }}
          >
            Critical error
          </p>
          <p
            style={{
              fontSize: "17px",
              fontWeight: 600,
              color: "#fafafa",
              marginBottom: "24px",
              letterSpacing: "-0.01em",
            }}
          >
            AI Signal couldn&apos;t start.
          </p>
          <button
            onClick={reset}
            style={{
              background: "none",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "6px",
              color: "#a1a1aa",
              fontSize: "13px",
              fontWeight: 600,
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
