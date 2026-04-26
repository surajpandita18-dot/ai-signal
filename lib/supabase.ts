// lib/supabase.ts
// Typed Supabase client — browser + server variants for App Router.

import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side (browser) — use in client components and hooks.
export function getBrowserClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Server-side admin client — use in API routes that need to bypass RLS.
// Never expose SUPABASE_SERVICE_ROLE_KEY to the client.
export const supabaseAdmin = (() => {
  if (!supabaseUrl || !supabaseServiceRoleKey) return null;
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });
})();

// Subscriber helpers

export async function upsertSubscriber(email: string): Promise<void> {
  if (!supabaseAdmin) return;
  await supabaseAdmin
    .from("subscribers")
    .upsert({ email }, { onConflict: "email" });
}

export async function getSubscriberTier(
  email: string
): Promise<"free" | "pro"> {
  if (!supabaseAdmin) return "free";
  const { data } = await supabaseAdmin
    .from("subscribers")
    .select("tier")
    .eq("email", email)
    .single();
  return (data?.tier as "free" | "pro") ?? "free";
}
