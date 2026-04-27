// app/api/brief-preview/route.ts
// Returns the top 3 critical stories from the latest brief for the landing page preview.
// Public — no auth required.

import { supabaseAdmin } from "@/lib/supabase-admin";

export interface PreviewStory {
  id: string;
  headline: string;
  summary: string;
  source: string;
  tier: "critical" | "monitor";
}

export async function GET(): Promise<Response> {
  if (!supabaseAdmin) {
    return Response.json({ data: [], error: "not configured" });
  }

  const { data, error } = await supabaseAdmin
    .from("briefs")
    .select("pro_content")
    .order("date", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return Response.json({ data: [], error: error?.message ?? "no brief" });
  }

  type BriefStory = {
    id: string;
    headline: string;
    summary: string;
    source: string;
    tier: "critical" | "monitor";
  };
  type ProContent = {
    criticalStories: BriefStory[];
    monitorStories: BriefStory[];
  };

  const content = data.pro_content as unknown as ProContent;

  const stories: PreviewStory[] = [
    ...(content.criticalStories ?? []).slice(0, 3).map((s) => ({
      id: s.id,
      headline: s.headline,
      summary: s.summary,
      source: s.source,
      tier: "critical" as const,
    })),
    ...(content.monitorStories ?? []).slice(0, Math.max(0, 3 - (content.criticalStories?.length ?? 0))).map((s) => ({
      id: s.id,
      headline: s.headline,
      summary: s.summary,
      source: s.source,
      tier: "monitor" as const,
    })),
  ].slice(0, 3);

  return Response.json({ data: stories, error: null });
}
