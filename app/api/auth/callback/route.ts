// app/api/auth/callback/route.ts
// Supabase Auth magic link callback handler.
// Supabase redirects here after email verification.

import { NextResponse } from "next/server";

export async function GET(req: Request): Promise<Response> {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/brief";

  if (code) {
    // Exchange code for session — handled client-side by Supabase JS SDK
    // on the destination page via detectSessionInUrl / onAuthStateChange.
    return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/`);
}
