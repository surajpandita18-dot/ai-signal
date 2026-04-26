// app/components/OnboardingFlow.tsx
// 4-screen first-visit flow collecting role + topics.
// Stored: aiSignal_onboarded, aiSignal_role, aiSignal_topics, aiSignal_onboardingSeen
"use client";

import { useEffect, useState } from "react";
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
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<Role | null>(null);
  const [topics, setTopics] = useState<string[]>([]);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) setStep(1);
  }, []);

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
    if (topics.length > 0)
      localStorage.setItem("aiSignal_topics", JSON.stringify(topics));
    setStep(0);
  }

  if (step === 0) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(9,9,11,0.88)] backdrop-blur-xl z-[200] flex items-center justify-center p-6">
      <div className="bg-[#0f0f12] border border-white/[0.08] rounded-xl px-9 py-10 max-w-[480px] w-full">

        {step === 1 && (
          <div className="flex flex-col gap-6">
            <div>
              <div className="text-[11px] font-medium tracking-[0.1em] uppercase text-[#7c3aed] mb-4">
                Quick setup · 2 questions
              </div>
              <h2 className="text-[24px] font-bold text-[#fafafa] leading-snug tracking-[-0.02em] m-0">
                AI Signal learns what matters to you.
              </h2>
            </div>
            <p className="text-[15px] text-[#a1a1aa] leading-relaxed m-0">
              Answer 2 quick questions so the feed surfaces signals actually relevant to your work.
            </p>
            <button
              onClick={() => setStep(2)}
              className="bg-[#f59e0b] text-[#09090b] border-none rounded-md text-[14px] font-bold px-6 py-3 cursor-pointer self-start hover:bg-[#d97706] transition-colors"
            >
              Get started →
            </button>
            <button
              onClick={finish}
              className="bg-transparent border-none text-[#3f3f46] text-[12px] cursor-pointer p-0 underline self-start"
            >
              Skip for now
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div>
              <div className="text-[11px] font-medium tracking-[0.1em] uppercase text-[#52525b] mb-3">
                1 of 2
              </div>
              <h2 className="text-[20px] font-bold text-[#fafafa] tracking-[-0.01em] m-0">
                What best describes you?
              </h2>
            </div>
            <div className="flex flex-col gap-2">
              {(Object.entries(ROLE_LABELS) as [Role, string][]).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => handleRoleSelect(id)}
                  className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 cursor-pointer text-left text-[#fafafa] hover:border-[rgba(124,58,237,0.4)] hover:bg-[rgba(124,58,237,0.06)] transition-all"
                >
                  <span className="text-[18px] leading-none">{ROLE_EMOJIS[id]}</span>
                  <span className="text-[14px] font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div>
              <div className="text-[11px] font-medium tracking-[0.1em] uppercase text-[#52525b] mb-3">
                2 of 2
              </div>
              <h2 className="text-[20px] font-bold text-[#fafafa] tracking-[-0.01em] m-0 mb-1">
                What are you most interested in?
              </h2>
              <p className="text-[13px] text-[#52525b] m-0">Select all that apply</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {TOPIC_OPTIONS.map(({ id, label }) => {
                const selected = topics.includes(id);
                return (
                  <button
                    key={id}
                    onClick={() => toggleTopic(id)}
                    className="rounded-lg px-3 py-2.5 cursor-pointer text-left text-[13px] leading-snug transition-all"
                    style={{
                      background: selected ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${selected ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.06)"}`,
                      color: selected ? "#f59e0b" : "#a1a1aa",
                      fontWeight: selected ? 600 : 400,
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setStep(4)}
              className="bg-[#f59e0b] text-[#09090b] border-none rounded-md text-[14px] font-bold px-6 py-3 cursor-pointer self-start hover:bg-[#d97706] transition-colors"
            >
              {topics.length > 0 ? "Done →" : "Skip →"}
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-6">
            <div className="w-10 h-10 rounded-full bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)] flex items-center justify-center text-[18px]">
              ✓
            </div>
            <div>
              <h2 className="text-[22px] font-bold text-[#fafafa] tracking-[-0.01em] m-0 mb-2">
                Your feed is ready.
              </h2>
              <p className="text-[15px] text-[#a1a1aa] leading-relaxed m-0">
                3 signals every morning, curated for{" "}
                <span className="text-[#fafafa] font-semibold">
                  {role ? ROLE_LABELS[role] : "you"}
                </span>
                .
              </p>
            </div>
            <button
              onClick={finish}
              className="bg-[#f59e0b] text-[#09090b] border-none rounded-md text-[14px] font-bold px-6 py-3 cursor-pointer self-start hover:bg-[#d97706] transition-colors"
            >
              See today&apos;s signals →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
