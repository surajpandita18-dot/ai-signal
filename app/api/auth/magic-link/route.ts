// app/api/auth/magic-link/route.ts
// Sends a Supabase magic link email for sign-in.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request): Promise<Response> {
  const body = await req.json().catch(() => ({}));
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || !email.includes("@") || !email.includes(".")) {
    return NextResponse.json({ data: null, error: "Invalid email" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { data: null, error: "Supabase not configured" },
      { status: 503 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/api/auth/callback?next=/app`,
    },
  });

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data: { sent: true }, error: null });
}
