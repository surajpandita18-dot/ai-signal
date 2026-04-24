"use client";
// Replaces OnboardingOverlay. 4-screen first-visit flow collecting role + topics.
// Stored: aiSignal_onboarded, aiSignal_role, aiSignal_topics, aiSignal_onboardingSeen

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { Role } from "@/lib/personalization";
import { ROLE_LABELS, TOPIC_OPTIONS } from "@/lib/personalization";

const STORAGE_KEY = "aiSignal_onboardingSeen";

const ROLE_EMOJIS: Record<Role, string> = {
  builder: "🏗️",
  researcher: "🔭",
  cto: "💼",
  pm: "📦",
  investor: "💰",
  student: "🎓",
};

export function OnboardingFlow() {
  const { status } = useSession();
  const [step, setStep] = useState(0); // 0 = hidden
  const [role, setRole] = useState<Role | null>(null);
  const [topics, setTopics] = useState<string[]>([]);

  useEffect(() => {
    if (status === "authenticated") {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) setStep(1);
    }
  }, [status]);

  function handleRoleSelect(r: Role) {
    setRole(r);
    setStep(3);
  }

  function toggleTopic(id: string) {
    setTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  function finish() {
    localStorage.setItem(STORAGE_KEY, "true");
    localStorage.setItem("aiSignal_onboarded", "true");
    if (role) localStorage.setItem("aiSignal_role", role);
    if (topics.length > 0) localStorage.setItem("aiSignal_topics", JSON.stringify(topics));
    setStep(0);
  }

  if (step === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(9,9,11,0.88)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "#0f0f12",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "12px",
          padding: "40px 36px",
          maxWidth: "480px",
          width: "100%",
        }}
      >
        {/* Step 1 — Welcome */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#7c3aed",
                  marginBottom: "16px",
                }}
              >
                Quick setup · 2 questions
              </div>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#fafafa",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  margin: 0,
                }}
              >
                AI Signal learns what matters to you.
              </h2>
            </div>
            <p style={{ fontSize: "15px", color: "#a1a1aa", lineHeight: 1.6, margin: 0 }}>
              Answer 2 quick questions so Zone 1 surfaces signals that are actually relevant to your work.
            </p>
            <button
              onClick={() => setStep(2)}
              style={{
                background: "#f59e0b",
                color: "#09090b",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: 700,
                padding: "12px 24px",
                cursor: "pointer",
                alignSelf: "flex-start",
                transition: "background 150ms ease",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#d97706"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f59e0b"; }}
            >
              Get started →
            </button>
            <button
              onClick={finish}
              style={{
                background: "none",
                border: "none",
                color: "#3f3f46",
                fontSize: "12px",
                cursor: "pointer",
                padding: 0,
                textDecoration: "underline",
                alignSelf: "flex-start",
              }}
            >
              Skip for now
            </button>
          </div>
        )}

        {/* Step 2 — Role selection */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#52525b", marginBottom: "12px" }}>
                1 of 2
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#fafafa", letterSpacing: "-0.01em", margin: 0 }}>
                What best describes you?
              </h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {(Object.entries(ROLE_LABELS) as [Role, string][]).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => handleRoleSelect(id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "border-color 150ms ease, background 150ms ease",
                    color: "#fafafa",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.borderColor = "rgba(124,58,237,0.4)";
                    el.style.background = "rgba(124,58,237,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.borderColor = "rgba(255,255,255,0.06)";
                    el.style.background = "rgba(255,255,255,0.03)";
                  }}
                >
                  <span style={{ fontSize: "18px", lineHeight: 1 }}>{ROLE_EMOJIS[id]}</span>
                  <span style={{ fontSize: "14px", fontWeight: 500 }}>{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Topic selection */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#52525b", marginBottom: "12px" }}>
                2 of 2
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#fafafa", letterSpacing: "-0.01em", margin: "0 0 4px" }}>
                What are you most interested in?
              </h2>
              <p style={{ fontSize: "13px", color: "#52525b", margin: 0 }}>Select all that apply</p>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
              }}
            >
              {TOPIC_OPTIONS.map(({ id, label }) => {
                const selected = topics.includes(id);
                return (
                  <button
                    key={id}
                    onClick={() => toggleTopic(id)}
                    style={{
                      background: selected ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${selected ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.06)"}`,
                      borderRadius: "8px",
                      padding: "10px 12px",
                      cursor: "pointer",
                      textAlign: "left",
                      color: selected ? "#f59e0b" : "#a1a1aa",
                      fontSize: "13px",
                      fontWeight: selected ? 600 : 400,
                      transition: "border-color 150ms ease, color 150ms ease, background 150ms ease",
                      lineHeight: 1.3,
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setStep(4)}
              style={{
                background: "#f59e0b",
                color: "#09090b",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: 700,
                padding: "12px 24px",
                cursor: "pointer",
                alignSelf: "flex-start",
                transition: "background 150ms ease",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#d97706"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f59e0b"; }}
            >
              {topics.length > 0 ? "Done →" : "Skip →"}
            </button>
          </div>
        )}

        {/* Step 4 — Done */}
        {step === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
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
            <div>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#fafafa",
                  letterSpacing: "-0.01em",
                  margin: "0 0 8px",
                }}
              >
                Your feed is ready.
              </h2>
              <p style={{ fontSize: "15px", color: "#a1a1aa", lineHeight: 1.6, margin: 0 }}>
                3 signals every morning, curated for{" "}
                <span style={{ color: "#fafafa", fontWeight: 600 }}>
                  {role ? ROLE_LABELS[role] : "you"}
                </span>
                .
              </p>
            </div>
            <button
              onClick={finish}
              style={{
                background: "#f59e0b",
                color: "#09090b",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: 700,
                padding: "12px 24px",
                cursor: "pointer",
                alignSelf: "flex-start",
                transition: "background 150ms ease",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#d97706"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f59e0b"; }}
            >
              See today&apos;s signals →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
