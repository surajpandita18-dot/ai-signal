import { NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

export async function POST(req: Request): Promise<Response> {
  const body = await req.json().catch(() => ({}));
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || !email.includes("@") || !email.includes(".")) {
    return NextResponse.json({ data: null, error: "Invalid email" }, { status: 400 });
  }

  // Write to Supabase if configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceKey) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/subscribers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": serviceKey,
          "Authorization": `Bearer ${serviceKey}`,
          "Prefer": "resolution=ignore-duplicates",
        },
        body: JSON.stringify({ email, tier: "free" }),
      });
      if (!res.ok && res.status !== 409) {
        const err = await res.text();
        return NextResponse.json({ data: null, error: err }, { status: 500 });
      }
      return NextResponse.json({ data: { subscribed: true }, error: null });
    } catch {
      // Fall through to file-based fallback
    }
  }

  // Local dev fallback — write to data/subscribers.json
  const dataDir = join(process.cwd(), "data");
  const filePath = join(dataDir, "subscribers.json");

  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

  const subscribers: string[] = existsSync(filePath)
    ? JSON.parse(readFileSync(filePath, "utf-8"))
    : [];

  if (!subscribers.includes(email)) {
    subscribers.push(email);
    writeFileSync(filePath, JSON.stringify(subscribers, null, 2));
  }

  return NextResponse.json({ data: { subscribed: true }, error: null });
}
