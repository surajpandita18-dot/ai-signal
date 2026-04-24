// lib/personalization.ts
// Role + topic based signal scoring. Rules-based for MVP; ML later.
import type { Signal } from "@/lib/types";

export type Role = "builder" | "researcher" | "cto" | "pm" | "investor" | "student";

export const ROLE_LABELS: Record<Role, string> = {
  builder: "Builder / Indie Hacker",
  researcher: "Researcher / Scientist",
  cto: "CTO / Technical Lead",
  pm: "Product Manager",
  investor: "Investor / VC",
  student: "Student / Learning",
};

// Tag/category multipliers per role
const ROLE_WEIGHTS: Record<string, Record<string, number>> = {
  builder: {
    Product: 1.5,
    OpenSource: 1.8,
    Infra: 1.3,
    Research: 0.7,
    Funding: 0.8,
    Agents: 1.6,
    LLM: 1.4,
  },
  researcher: {
    Research: 2.0,
    LLM: 1.8,
    Agents: 1.4,
    Product: 0.6,
    Funding: 0.5,
    Infra: 0.9,
  },
  cto: {
    Infra: 1.8,
    Security: 1.5,
    Product: 1.3,
    Funding: 1.2,
    LLM: 1.5,
    Agents: 1.4,
    Research: 0.8,
  },
  pm: {
    Product: 2.0,
    Funding: 1.5,
    Research: 0.8,
    Agents: 1.3,
    LLM: 1.2,
    Infra: 0.7,
  },
  investor: {
    Funding: 2.0,
    Product: 1.5,
    Research: 1.2,
    LLM: 1.3,
    Agents: 1.2,
    Infra: 0.9,
  },
  student: {
    Research: 1.5,
    LLM: 1.6,
    Agents: 1.5,
    OpenSource: 1.4,
    Funding: 0.6,
  },
};

export const TOPIC_OPTIONS = [
  { id: "LLMs", label: "LLMs & Foundation Models" },
  { id: "Agents", label: "AI Agents & Automation" },
  { id: "Infra", label: "Infrastructure & MLOps" },
  { id: "Funding", label: "Funding & Market Moves" },
  { id: "Research", label: "Research & Papers" },
  { id: "OpenSource", label: "Open Source Releases" },
  { id: "DevTools", label: "Developer Tools & SDKs" },
  { id: "Enterprise", label: "Enterprise AI" },
];

export function getPersonalizedScore(signal: Signal, role: string, topics: string[]): number {
  let multiplier = 1.0;
  const roleWeights = ROLE_WEIGHTS[role] ?? {};

  // Apply role-based weight on each tag
  if (signal.tags) {
    for (const tag of signal.tags) {
      if (roleWeights[tag]) multiplier = Math.max(multiplier, roleWeights[tag]);
    }
  }

  // Boost if signal tags overlap with selected topics
  if (topics.length > 0 && signal.tags) {
    const topicMatch = topics.some((t) =>
      signal.tags.some((st) => st.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(st.toLowerCase()))
    );
    if (topicMatch) multiplier *= 1.4;
  }

  return signal.signalScore * multiplier;
}
