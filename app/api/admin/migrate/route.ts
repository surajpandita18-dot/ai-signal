// app/api/admin/migrate/route.ts
// ONE-TIME migration runner. Call once, then delete this file.
// Applies supabase/migrations/002_add_email_html.sql via the Management API.
// Requires SUPABASE_ACCESS_TOKEN env var (get from supabase.com/dashboard/account/tokens).

import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(): Promise<Response> {
  if (!supabaseAdmin) {
    return Response.json({ error: "supabaseAdmin not configured" }, { status: 500 });
  }

  // Use a Supabase Postgres function to run the DDL if it exists,
  // otherwise fall back to checking if the column already exists.
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1]?.split(".")[0];

  if (!accessToken || !projectRef) {
    return Response.json(
      {
        error:
          "SUPABASE_ACCESS_TOKEN not set. " +
          "Get a personal access token from supabase.com/dashboard/account/tokens, " +
          "add it to .env.local, restart the server, and POST to this endpoint again. " +
          "Alternatively, run this SQL directly in the Supabase SQL editor: " +
          "ALTER TABLE briefs ADD COLUMN IF NOT EXISTS email_html text;",
      },
      { status: 400 }
    );
  }

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: "ALTER TABLE briefs ADD COLUMN IF NOT EXISTS email_html text;",
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    return Response.json({ error: `Management API error: ${err}` }, { status: 500 });
  }

  return Response.json({ ok: true, message: "email_html column added to briefs table" });
}
