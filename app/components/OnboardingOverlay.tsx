// app/components/OnboardingOverlay.tsx
// 3-step first-visit onboarding overlay. Shows once per browser.
"use client";

import { useEffect, useState } from "react";

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
    headline: "Free forever. No credit card.",
    body: "Enter your email to unlock every takeaway and get the daily brief delivered at 6 AM IST.",
    label: "ACCESS",
  },
];

export function OnboardingOverlay() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

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

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Welcome to AI Signal"
        onClick={dismiss}
        className="fixed inset-0 bg-[rgba(9,9,11,0.85)] z-[200] transition-opacity duration-200"
        style={{ opacity: exiting ? 0 : 1 }}
      />

      <div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[min(480px,calc(100vw-48px))] bg-[#0f0f12] border border-white/[0.08] rounded-lg px-7 pt-7 pb-6 z-[201] transition-opacity duration-200"
        style={{ opacity: exiting ? 0 : 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-1.5 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="h-0.5 flex-1 rounded-sm transition-colors duration-200"
              style={{ background: i <= step ? "#7c3aed" : "rgba(255,255,255,0.08)" }}
            />
          ))}
        </div>

        <span className="block text-[11px] font-medium tracking-[0.08em] uppercase text-[#52525b] mb-2">
          {current.label}
        </span>

        <span className="block text-[56px] font-extrabold text-[rgba(124,58,237,0.12)] leading-none tracking-[-0.03em] tabular-nums mb-1">
          {current.number}
        </span>

        <p className="text-[20px] font-bold text-[#fafafa] leading-snug tracking-[-0.01em] mb-3">
          {current.headline}
        </p>

        <p className="text-[14px] text-[#71717a] leading-relaxed mb-6">
          {current.body}
        </p>

        {step === 1 && (
          <div className="border-l-2 border-[rgba(245,158,11,0.4)] pl-3 mb-6">
            <span className="block text-[11px] font-medium uppercase tracking-[0.08em] text-[#f59e0b] mb-1">
              Takeaway
            </span>
            <span className="block text-[14px] text-[#f59e0b] leading-relaxed italic">
              &ldquo;Add a voice interface to your product this week — latency just dropped below perception threshold.&rdquo;
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={dismiss}
            className="bg-transparent border-none cursor-pointer text-[13px] text-[#52525b] font-medium p-0"
          >
            Skip
          </button>

          <button
            onClick={next}
            className="rounded-md text-[13px] font-semibold px-5 py-2.5 cursor-pointer transition-colors duration-150"
            style={{
              background: isLast ? "#7c3aed" : "rgba(255,255,255,0.06)",
              border: isLast ? "none" : "1px solid rgba(255,255,255,0.1)",
              color: "#fafafa",
            }}
          >
            {isLast ? "Got it →" : "Next →"}
          </button>
        </div>
      </div>
    </>
  );
}
