// app/error.tsx
// Route-level error boundary — catches rendering errors in page segments.
// Must be a client component ("use client").
"use client";

import { useEffect } from "react";
import Link from "next/link";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: Props) {
  useEffect(() => {
    // Log to console for local debugging; wire to Sentry etc. in production
    console.error("[AI Signal] route error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#09090b",
        color: "#fafafa",
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
        Something went wrong
      </p>

      <p
        style={{
          fontSize: "17px",
          fontWeight: 600,
          color: "#fafafa",
          marginBottom: "8px",
          letterSpacing: "-0.01em",
        }}
      >
        Couldn&apos;t load this page.
      </p>

      <p
        style={{
          fontSize: "13px",
          color: "#52525b",
          marginBottom: "32px",
          lineHeight: 1.6,
          maxWidth: "360px",
        }}
      >
        {error.digest ? `Error ${error.digest}` : "An unexpected error occurred."}
      </p>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
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
            letterSpacing: "0.01em",
          }}
        >
          Try again
        </button>
        <Link
          href="/"
          style={{
            display: "inline-block",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "6px",
            color: "#52525b",
            fontSize: "13px",
            fontWeight: 600,
            padding: "10px 20px",
            textDecoration: "none",
            letterSpacing: "0.01em",
          }}
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
