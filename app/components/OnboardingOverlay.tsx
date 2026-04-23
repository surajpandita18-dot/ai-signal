// app/components/OnboardingOverlay.tsx
// 3-step first-visit onboarding overlay.
// Shows once per browser. Stored in aiSignal_onboardingSeen.
//
// Step 1: Zone 1 — what the signal list is
// Step 2: TAKEAWAY — what the amber pull quote means
// Step 3: Gate — how to unlock full access
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

const STORAGE_KEY = "aiSignal_onboardingSeen";

const STEPS = [
  {
    number: "01",
    headline: "3 signals, every morning.",
    body: "AI Signal scans every major source overnight and surfaces only the moves that matter — ranked by impact, not recency.",
    label: "THE FEED",
  },
  {
    number: "02",
    headline: "The TAKEAWAY is the point.",
    body: "Each signal ends with one specific builder action. Not a summary — a decision. That's the amber line.",
    label: "THE TAKEAWAY",
  },
  {
    number: "03",
    headline: "Free for the first 100 founders.",
    body: "Sign in with GitHub to unlock every takeaway. Takes 10 seconds. No credit card.",
    label: "ACCESS",
  },
];

export function OnboardingOverlay() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const { status } = useSession();

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) setVisible(true);
  }, []);

  function dismiss() {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      localStorage.setItem(STORAGE_KEY, "1");
    }, 200);
  }

  function next() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      dismiss();
    }
  }

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const isAuthenticated = status === "authenticated";

  return (
    <>
      {/* Backdrop */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Welcome to AI Signal"
        onClick={dismiss}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(9,9,11,0.85)",
          zIndex: 200,
          opacity: exiting ? 0 : 1,
          transition: "opacity 200ms ease",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          bottom: "32px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(480px, calc(100vw - 48px))",
          background: "#0f0f12",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "8px",
          padding: "28px 28px 24px",
          zIndex: 201,
          opacity: exiting ? 0 : 1,
          transition: "opacity 200ms ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Step indicator */}
        <div
          style={{
            display: "flex",
            gap: "6px",
            marginBottom: "24px",
          }}
        >
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                height: "2px",
                flex: 1,
                background:
                  i <= step
                    ? "#7c3aed"
                    : "rgba(255,255,255,0.08)",
                borderRadius: "1px",
                transition: "background 200ms ease",
              }}
            />
          ))}
        </div>

        {/* Label */}
        <span
          style={{
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#52525b",
            display: "block",
            marginBottom: "8px",
          }}
        >
          {current.label}
        </span>

        {/* Number */}
        <span
          style={{
            fontSize: "56px",
            fontWeight: 800,
            color: "rgba(124,58,237,0.12)",
            lineHeight: 1,
            letterSpacing: "-0.03em",
            fontVariantNumeric: "tabular-nums",
            display: "block",
            marginBottom: "4px",
          }}
        >
          {current.number}
        </span>

        {/* Headline */}
        <p
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#fafafa",
            lineHeight: 1.25,
            letterSpacing: "-0.01em",
            marginBottom: "12px",
          }}
        >
          {current.headline}
        </p>

        {/* Body */}
        <p
          style={{
            fontSize: "14px",
            color: "#71717a",
            lineHeight: 1.65,
            marginBottom: "24px",
          }}
        >
          {current.body}
        </p>

        {/* TAKEAWAY demo — step 2 only */}
        {step === 1 && (
          <div
            style={{
              borderLeft: "2px solid rgba(245,158,11,0.4)",
              paddingLeft: "12px",
              marginBottom: "24px",
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
                fontSize: "14px",
                color: "#f59e0b",
                lineHeight: 1.5,
                display: "block",
                fontStyle: "italic",
              }}
            >
              "Add a voice interface to your product this week — latency just dropped below perception threshold."
            </span>
          </div>
        )}

        {/* Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          {/* Skip / back */}
          <button
            onClick={dismiss}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "13px",
              color: "#52525b",
              padding: "0",
              fontFamily: "inherit",
              fontWeight: 500,
            }}
          >
            Skip
          </button>

          {/* Next / CTA */}
          {isLast && !isAuthenticated ? (
            <Link
              href="/api/auth/signin"
              onClick={dismiss}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#f59e0b",
                color: "#09090b",
                borderRadius: "6px",
                padding: "10px 20px",
                fontSize: "13px",
                fontWeight: 700,
                textDecoration: "none",
                letterSpacing: "0.01em",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              Sign in with GitHub
            </Link>
          ) : (
            <button
              onClick={next}
              style={{
                background: isLast ? "#7c3aed" : "rgba(255,255,255,0.06)",
                border: isLast
                  ? "none"
                  : "1px solid rgba(255,255,255,0.1)",
                borderRadius: "6px",
                color: "#fafafa",
                fontSize: "13px",
                fontWeight: 600,
                padding: "10px 20px",
                cursor: "pointer",
                fontFamily: "inherit",
                letterSpacing: "0.01em",
                transition: "background 150ms ease",
              }}
            >
              {isLast ? "Got it →" : "Next →"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
