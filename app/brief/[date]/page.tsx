// app/brief/[date]/page.tsx
// Archive brief for a specific date slug (e.g. /brief/2026-04-26).
// Free users: last 7 days only. Pro users: unlimited archive.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { BriefView } from "../BriefView";
import type { BriefContent } from "../BriefView";

export const revalidate = 3600; // archive pages are static-ish

type Props = {
  params: Promise<{ date: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  return {
    title: `AI Signal — ${date}`,
    description: `AI Signal daily brief for CTOs — ${date}. Critical AI signals scored and filtered.`,
  };
}

export default async function BriefArchivePage({ params }: Props) {
  const { date } = await params;

  // Validate slug format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    notFound();
  }

  if (!supabaseAdmin) {
    return <ArchiveError message="Supabase not configured." date={date} />;
  }

  const { data, error } = await supabaseAdmin
    .from("briefs")
    .select("slug, date, free_content, pro_content")
    .eq("slug", date)
    .single();

  if (error || !data) {
    return <ArchiveError message={`No brief found for ${date}.`} date={date} />;
  }

  // 7-day cutoff for unauthenticated / free access.
  // BriefView handles the auth check client-side; pass both versions.
  // The 7-day gate is enforced visually in BriefView when isPro is false.
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 7);
  const briefDate = new Date(date + "T00:00:00");
  const isOlderThan7Days = briefDate < cutoffDate;

  return (
    <BriefView
      slug={data.slug}
      date={data.date}
      freeBrief={
        isOlderThan7Days
          ? GATED_FREE_BRIEF
          : (data.free_content as unknown as BriefContent)
      }
      proBrief={data.pro_content as unknown as BriefContent}
    />
  );
}

// Placeholder brief shown to free users for articles older than 7 days
const GATED_FREE_BRIEF: BriefContent = {
  criticalStories: [],
  monitorStories: [],
  ctaPrompt:
    "Upgrade to Pro to access the full archive — every brief, every action template, unlimited history.",
};

function ArchiveError({ message, date }: { message: string; date: string }) {
  return (
    <div className="min-h-screen bg-[#0A0812] text-[#F5F0E8] flex flex-col items-center justify-center px-4">
      <Link href="/" className="text-2xl font-bold mb-6 hover:opacity-80 transition-opacity">
        AI Signal
      </Link>
      <p className="text-[#6B7280] text-base text-center max-w-sm">{message}</p>
      <div className="flex gap-4 mt-8">
        <Link href="/brief" className="text-[#7C3AED] hover:underline text-sm">
          Latest brief →
        </Link>
        <span className="text-[#4B5563]">·</span>
        <Link href="/" className="text-[#6B7280] hover:text-[#9CA3AF] text-sm">
          Home
        </Link>
      </div>
      <p className="text-[#4B5563] text-xs mt-4">Requested: {date}</p>
    </div>
  );
}
