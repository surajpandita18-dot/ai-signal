// lib/auth.ts
// Supabase Auth helpers — magic link only, no passwords, no GitHub OAuth.

import { getBrowserClient } from "./supabase";

export async function sendMagicLink(email: string): Promise<{ error: string | null }> {
  const supabase = getBrowserClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/auth/callback`,
    },
  });
  return { error: error?.message ?? null };
}

export async function signOut(): Promise<void> {
  const supabase = getBrowserClient();
  await supabase.auth.signOut();
}

export async function getSession() {
  const supabase = getBrowserClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}
