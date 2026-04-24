import { NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || !email.includes("@") || !email.includes(".")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const dataDir = join(process.cwd(), "data");
  const filePath = join(dataDir, "subscribers.json");

  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  const subscribers: string[] = existsSync(filePath)
    ? JSON.parse(readFileSync(filePath, "utf-8"))
    : [];

  if (!subscribers.includes(email)) {
    subscribers.push(email);
    writeFileSync(filePath, JSON.stringify(subscribers, null, 2));
  }

  return NextResponse.json({ success: true });
}
