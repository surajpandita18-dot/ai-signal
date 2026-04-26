"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getBrowserClient } from "@/lib/supabase";

// ── Local types (mirroring personalizer.ts / writer.ts without importing agents) ─

interface ActionTemplate {
  owner: string;
  action: string;
  by: string;
}

interface CriticalStory {
  id: string;
  tier: "critical";
  headline: string;
  summary: string;
  actionTemplate: ActionTemplate;
  url: string;
  source: string;
  ctaLabel: string;
}

interface MonitorStory {
  id: string;
  tier: "monitor";
  headline: string;
  summary: string;
  url: string;
  source: string;
  ctaLabel: string;
}

interface ToolStory {
  id: string;
  tier: "tool";
  headline: string;
  summary: string;
  url: string;
  source: string;
  ctaLabel: string;
}

export interface BriefContent {
  criticalStories: CriticalStory[];
  monitorStories: MonitorStory[];
  toolOfDay?: ToolStory;
  ctaPrompt: string;
}

export interface BriefViewProps {
  slug: string;
  date: string;
  freeBrief: BriefContent;
  proBrief: BriefContent;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SignalBadge({ tier }: { tier: "critical" | "monitor" | "tool" }) {
  const map = {
    critical: { label: "🔴 CRITICAL", cls: "bg-red-500 text-white" },
    monitor: { label: "🔵 MONITOR", cls: "bg-blue-500 text-white" },
    tool: { label: "⚡ TOOL", cls: "bg-amber-500 text-gray-900" },
  };
  const { label, cls } = map[tier];
  return (
    <span
      className={`inline-block ${cls} text-[11px] font-bold px-2 py-0.5 rounded tracking-widest uppercase`}
    >
      {label}
    </span>
  );
}

function ActionBlock({ action }: { action: ActionTemplate }) {
  const blurred = action.action.includes("🔒");
  if (blurred) {
    return (
      <div className="bg-[#1A0F2E] border border-dashed border-[#7C3AED] rounded-md p-4 my-3">
        <p className="text-[#A78BFA] text-sm mb-1">
          🔒 Action template available for Pro subscribers
        </p>
        <p className="text-[#6B7280] text-sm mb-3">
          Upgrade to see: who owns this, what to do, and by when.
        </p>
        <Link
          href="/upgrade"
          className="inline-block bg-[#7C3AED] text-[#F5F0E8] text-sm font-semibold px-4 py-2 rounded-md hover:bg-[#6D28D9] transition-colors"
        >
          Upgrade to Pro →
        </Link>
      </div>
    );
  }
  return (
    <div className="bg-[#0D1A0D] border border-[#166534] rounded-md p-3 my-3">
      <p className="text-[#86EFAC] text-[11px] uppercase tracking-widest font-semibold mb-2">
        Action Required
      </p>
      <p className="text-[#D1FAE5] text-sm">
        <span className="font-medium">Owner:</span> {action.owner}
      </p>
      <p className="text-[#D1FAE5] text-sm mt-1">
        <span className="font-medium">Action:</span> {action.action}
      </p>
      <p className="text-[#D1FAE5] text-sm mt-1">
        <span className="font-medium">By:</span> {action.by}
      </p>
    </div>
  );
}

function CriticalCard({ story }: { story: CriticalStory }) {
  return (
    <div className="bg-[#110D1A] border border-[#2D1F42] rounded-xl p-5 mb-4">
      <h3 className="font-display text-[#F5F0E8] font-semibold text-lg leading-tight mb-3">
        {story.headline}
      </h3>
      {story.summary && (
        <p className="text-[#D1D5DB] text-sm leading-relaxed mb-3">
          {story.summary}
        </p>
      )}
      <ActionBlock action={story.actionTemplate} />
      <div className="flex items-center gap-3 flex-wrap mt-3 pt-3 border-t border-[#1F1235]">
        <a
          href={story.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#A78BFA] text-sm font-medium hover:text-[#C4B5FD] transition-colors"
        >
          {story.ctaLabel}
        </a>
        <span className="text-[#4B5563] text-xs">{story.source}</span>
      </div>
    </div>
  );
}

function MonitorCard({ story }: { story: MonitorStory }) {
  return (
    <div className="bg-[#0D0F1A] border border-[#1E2A42] rounded-xl p-4 mb-3">
      <h4 className="text-[#F5F0E8] font-medium text-[15px] leading-snug mb-2">
        {story.headline}
      </h4>
      <p className="text-[#9CA3AF] text-sm leading-relaxed mb-3">
        {story.summary}
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <a
          href={story.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#60A5FA] text-sm hover:text-[#93C5FD] transition-colors"
        >
          {story.ctaLabel}
        </a>
        <span className="text-[#4B5563] text-xs">{story.source}</span>
      </div>
    </div>
  );
}

function ToolCard({ story }: { story: ToolStory }) {
  return (
    <div className="bg-[#1A1407] border border-[#92400E] rounded-xl p-5 mb-4">
      <h3 className="text-[#F5F0E8] font-semibold text-lg leading-tight mb-2">
        {story.headline}
      </h3>
      <p className="text-[#D1D5DB] text-sm leading-relaxed mb-3">
        {story.summary}
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <a
          href={story.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#FCD34D] text-sm hover:text-[#FDE68A] transition-colors"
        >
          {story.ctaLabel}
        </a>
        <span className="text-[#4B5563] text-xs">{story.source}</span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function BriefView({ slug, date, freeBrief, proBrief }: BriefViewProps) {
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const supabase = getBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const meta = data.session?.user?.user_metadata as
        | { plan?: string }
        | undefined;
      setIsPro(meta?.plan === "pro");
    });
  }, []);

  const brief = isPro ? proBrief : freeBrief;
  const { criticalStories, monitorStories, toolOfDay, ctaPrompt } = brief;

  const displayDate = date.match(/^\d{4}-\d{2}-\d{2}$/)
    ? new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      })
    : date;

  return (
    <div className="min-h-screen bg-[#0A0812] text-[#F5F0E8]">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">

        {/* Header */}
        <div className="text-center mb-10 pb-8 border-b border-[#1F1235]">
          <Link href="/" className="text-2xl font-bold tracking-tight font-display hover:opacity-80 transition-opacity">
            AI Signal
          </Link>
          <p className="mt-2 text-[#6B7280] text-sm">{displayDate}</p>
          <p className="mt-1 text-[#6B7280] text-xs">For CTOs building AI-first products</p>
          {isPro && (
            <span className="inline-block mt-3 text-[11px] font-semibold bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/40 px-3 py-1 rounded-full uppercase tracking-widest">
              Pro
            </span>
          )}
        </div>

        {/* CRITICAL section */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <SignalBadge tier="critical" />
            <span className="text-[#6B7280] text-sm">
              {criticalStories.length}{" "}
              {criticalStories.length === 1 ? "story" : "stories"} requiring
              immediate attention
            </span>
          </div>
          {criticalStories.length > 0 ? (
            criticalStories.map((s) => <CriticalCard key={s.id} story={s} />)
          ) : (
            <p className="text-[#6B7280] text-sm">No critical stories today.</p>
          )}
        </section>

        {/* MONITOR section */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <SignalBadge tier="monitor" />
            <span className="text-[#6B7280] text-sm">
              {monitorStories.length} signal
              {monitorStories.length === 1 ? "" : "s"} to track
            </span>
          </div>
          {monitorStories.length > 0 ? (
            monitorStories.map((s) => <MonitorCard key={s.id} story={s} />)
          ) : (
            <p className="text-[#6B7280] text-sm">No monitor signals today.</p>
          )}
        </section>

        {/* Tool of Day */}
        {toolOfDay && (
          <section className="mb-10">
            <div className="mb-4">
              <SignalBadge tier="tool" />
            </div>
            <ToolCard story={toolOfDay} />
          </section>
        )}

        {/* CTA Prompt */}
        <div className="bg-[#100B1F] border-l-4 border-[#7C3AED] px-5 py-4 rounded-r-xl mb-10">
          <p className="text-[#7C3AED] text-[11px] uppercase tracking-widest font-semibold mb-2">
            CTO Prompt of the Day
          </p>
          <p className="text-[#F5F0E8] text-[15px] leading-relaxed">
            &ldquo;{ctaPrompt}&rdquo;
          </p>
        </div>

        {/* Upgrade CTA — only for free users */}
        {!isPro && (
          <div className="bg-[#100B1F] border border-[#2D1F42] rounded-2xl p-7 text-center mb-10">
            <h3 className="text-[#F5F0E8] font-semibold text-lg mb-2">
              Unlock the full brief
            </h3>
            <p className="text-[#9CA3AF] text-sm mb-6">
              Pro subscribers get full action templates, all Monitor signals, and
              Slack delivery.
            </p>
            <Link
              href="/upgrade"
              className="inline-block bg-[#7C3AED] text-[#F5F0E8] font-semibold px-7 py-3 rounded-lg hover:bg-[#6D28D9] transition-colors text-[15px]"
            >
              Upgrade to Pro →
            </Link>
          </div>
        )}

        {/* Archive nav */}
        <div className="text-center pt-6 border-t border-[#1F1235]">
          <span className="text-[#4B5563] text-sm">
            <Link href="/brief" className="text-[#7C3AED] hover:underline">
              Latest brief
            </Link>
            {" · "}
            <Link href="/" className="text-[#6B7280] hover:text-[#9CA3AF]">
              aisignal.io
            </Link>
          </span>
        </div>

      </div>
    </div>
  );
}
