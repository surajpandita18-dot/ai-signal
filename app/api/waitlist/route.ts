import { appendFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }
    const dir = join(process.cwd(), "data");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const file = join(dir, "waitlist.txt");
    appendFileSync(file, `${new Date().toISOString()} ${email.trim()}\n`);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: true }); // silent — client already shows success
  }
}
