"use client";

import Link from "next/link";
import { useState } from "react";

declare global {
  interface Window {
    posthog?: { capture?: (event: string, props?: Record<string, unknown>) => void };
  }
}

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
    } catch {
      // silent — store locally as fallback
    }
    window.posthog?.capture?.("waitlist_signup", { email: email.trim() });
    setSubmitted(true);
    setSubmitting(false);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#09090b" }}>
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(9,9,11,0.94)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          height: "60px",
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <Link
          href="/"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "8px",
            color: "#52525b",
            fontSize: "11px",
            fontWeight: 500,
            padding: "7px 13px",
            textDecoration: "none",
          }}
        >
          ← Back to signals
        </Link>
        <span
          style={{
            fontSize: "11px",
            letterSpacing: "0.08em",
            color: "#52525b",
            fontWeight: 500,
            textTransform: "uppercase",
          }}
        >
          Pro · Coming soon
        </span>
      </nav>

      <div
        style={{
          maxWidth: "560px",
          margin: "0 auto",
          padding: "72px 28px 48px",
          display: "flex",
          flexDirection: "column",
          gap: "0",
        }}
      >
        {submitted ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
              }}
            >
              ✓
            </div>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: "#fafafa",
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              You&apos;re on the list.
            </h1>
            <p style={{ fontSize: "15px", color: "#a1a1aa", lineHeight: 1.6, margin: 0 }}>
              We&apos;ll reach out when Pro launches. Until then, everything is free.
            </p>
            <Link
              href="/"
              style={{
                display: "inline-block",
                background: "#f59e0b",
                color: "#09090b",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 700,
                padding: "10px 20px",
                textDecoration: "none",
                marginTop: "8px",
                alignSelf: "flex-start",
              }}
            >
              Back to signals →
            </Link>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: "40px" }}>
              <div
                style={{
                  display: "inline-block",
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#7c3aed",
                  marginBottom: "16px",
                }}
              >
                Beta · Free for everyone right now
              </div>
              <h1
                style={{
                  fontSize: "28px",
                  fontWeight: 700,
                  color: "#fafafa",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  margin: "0 0 16px",
                }}
              >
                AI Signal is free during beta.
              </h1>
              <p
                style={{
                  fontSize: "15px",
                  color: "#a1a1aa",
                  lineHeight: 1.6,
                  margin: 0,
                  maxWidth: "440px",
                }}
              >
                All signals — including TAKEAWAY — are free right now. Join the waitlist
                to be first in line when Pro features launch.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  background: "#0f0f12",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "6px",
                  color: "#fafafa",
                  fontSize: "14px",
                  padding: "12px 16px",
                  outline: "none",
                  width: "100%",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(245,158,11,0.4)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                }}
              />
              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: "#f59e0b",
                  color: "#09090b",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 700,
                  padding: "12px 24px",
                  border: "none",
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.7 : 1,
                  transition: "opacity 150ms ease",
                  alignSelf: "flex-start",
                }}
              >
                {submitting ? "Joining…" : "Join waitlist →"}
              </button>
            </form>

            <p style={{ fontSize: "12px", color: "#3f3f46", marginTop: "16px" }}>
              No spam. One email when Pro launches.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
