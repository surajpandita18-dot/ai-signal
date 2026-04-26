// app/brief/page.tsx
// Latest brief — server component. Fetches most recent brief from Supabase.
// Free version shown by default; BriefView upgrades to pro if auth session confirms Pro tier.

import type { Metadata } from "next";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { BriefView } from "./BriefView";
import type { BriefContent } from "./BriefView";

export const revalidate = 300; // re-fetch every 5 min at most

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "AI Signal — Latest Brief",
    description:
      "Daily AI intelligence for CTOs. Critical signals, scored and filtered through a CTO decision lens.",
  };
}

export default async function BriefPage() {
  if (!supabaseAdmin) {
    return <NoBrief message="Supabase not configured." />;
  }

  const { data, error } = await supabaseAdmin
    .from("briefs")
    .select("slug, date, free_content, pro_content")
    .order("date", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return <NoBrief message="No brief available yet. Check back on a weekday morning." />;
  }

  return (
    <BriefView
      slug={data.slug}
      date={data.date}
      freeBrief={data.free_content as unknown as BriefContent}
      proBrief={data.pro_content as unknown as BriefContent}
    />
  );
}

function NoBrief({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#0A0812] text-[#F5F0E8] flex flex-col items-center justify-center px-4">
      <Link href="/" className="text-2xl font-bold mb-6 hover:opacity-80 transition-opacity">
        AI Signal
      </Link>
      <p className="text-[#6B7280] text-base text-center max-w-sm">{message}</p>
      <Link href="/" className="mt-8 text-[#7C3AED] hover:underline text-sm">
        ← Back to home
      </Link>
    </div>
  );
}
