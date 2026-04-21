"use client";

import Link from "next/link";
import { useEffect } from "react";

declare global {
  interface Window {
    posthog?: { capture: (event: string, props?: Record<string, unknown>) => void };
  }
}

const BLURRED_TAKEAWAY =
  "Prioritise vendors with hybrid deployment options — the next regulatory cycle will force data residency. Act before Q3 procurement locks in.";

export default function UpgradePage() {
  useEffect(() => {
    window.posthog?.capture("upgrade_clicked", { source: "upgrade_page" });
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "#09090b" }}>
      {/* Sticky nav */}
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
          Early Access
        </span>
      </nav>

      <div
        style={{
          maxWidth: "640px",
          margin: "0 auto",
          padding: "64px 28px 48px",
          display: "flex",
          flexDirection: "column",
          gap: "0",
        }}
      >
        {/* Hero */}
        <div style={{ marginBottom: "40px" }}>
          <h1
            style={{
              fontSize: "30px",
              fontWeight: 700,
              color: "#fafafa",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              margin: "0 0 16px",
              maxWidth: "520px",
            }}
          >
            You&apos;ve seen what happened.
            <br />
            Now see what to do about it.
          </h1>
          <p
            style={{
              fontSize: "15px",
              color: "#a1a1aa",
              lineHeight: 1.6,
              margin: 0,
              maxWidth: "480px",
            }}
          >
            TAKEAWAY is the one sentence that tells you what to build, reconsider,
            or watch. Free users never see it.
          </p>
        </div>

        {/* Blurred TAKEAWAY demo */}
        <div
          style={{
            background: "#0f0f12",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "8px",
            padding: "28px 32px",
            marginBottom: "32px",
          }}
        >
          <span
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#52525b",
              marginBottom: "20px",
            }}
          >
            What you see right now
          </span>

          {/* WHAT + WHY — visible */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#52525b",
                  marginBottom: "4px",
                }}
              >
                What
              </span>
              <p style={{ fontSize: "15px", color: "#a1a1aa", lineHeight: 1.6, margin: 0 }}>
                A major cloud provider updated their AI governance framework, tightening
                restrictions on cross-border model inference for enterprise contracts.
              </p>
            </div>
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#52525b",
                  marginBottom: "4px",
                }}
              >
                Why
              </span>
              <p style={{ fontSize: "15px", color: "#a1a1aa", lineHeight: 1.6, margin: 0 }}>
                Regulatory pressure from the EU AI Act enforcement cycle is accelerating
                vendor-level policy changes. Enterprise procurement windows narrow as
                compliance requirements crystallise.
              </p>
            </div>
          </div>

          {/* TAKEAWAY — blurred */}
          <div
            style={{
              borderLeft: "2px solid rgba(245,158,11,0.4)",
              paddingLeft: "12px",
            }}
          >
            <span
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#f59e0b",
                marginBottom: "4px",
              }}
            >
              Takeaway
            </span>
            <span
              style={{
                display: "block",
                fontSize: "15px",
                color: "#f59e0b",
                lineHeight: 1.6,
                filter: "blur(4px)",
                userSelect: "none",
                WebkitUserSelect: "none",
              }}
            >
              {BLURRED_TAKEAWAY}
            </span>
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          <a
            href="mailto:suraj.pandita18@gmail.com?subject=AI%20Signal%20Early%20Access"
            style={{
              display: "inline-block",
              background: "#f59e0b",
              color: "#09090b",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 700,
              padding: "12px 24px",
              textDecoration: "none",
              letterSpacing: "-0.01em",
            }}
          >
            Request early access →
          </a>
          <Link
            href="/"
            style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "8px",
              color: "#52525b",
              fontSize: "13px",
              fontWeight: 500,
              padding: "12px 24px",
              textDecoration: "none",
            }}
          >
            ← Back to signals
          </Link>
        </div>
      </div>
    </main>
  );
}
