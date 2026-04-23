// app/not-found.tsx
// 404 page — decisive, minimal. CLAUDE.md design tokens.
import Link from "next/link";

export default function NotFound() {
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
      <span
        style={{
          fontSize: "96px",
          fontWeight: 800,
          color: "rgba(124,58,237,0.08)",
          letterSpacing: "-0.04em",
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          display: "block",
          marginBottom: "24px",
        }}
      >
        404
      </span>

      <p
        style={{
          fontSize: "17px",
          fontWeight: 600,
          color: "#fafafa",
          marginBottom: "8px",
          letterSpacing: "-0.01em",
        }}
      >
        This signal doesn&apos;t exist.
      </p>

      <p
        style={{
          fontSize: "15px",
          color: "#52525b",
          marginBottom: "32px",
          lineHeight: 1.6,
        }}
      >
        But today&apos;s do.
      </p>

      <Link
        href="/"
        style={{
          display: "inline-block",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "6px",
          color: "#a1a1aa",
          fontSize: "13px",
          fontWeight: 600,
          padding: "10px 20px",
          textDecoration: "none",
          letterSpacing: "0.01em",
        }}
      >
        Today&apos;s signals →
      </Link>
    </div>
  );
}
