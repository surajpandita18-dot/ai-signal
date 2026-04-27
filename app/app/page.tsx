// app/app/page.tsx
// Redirect legacy /app route to /brief — the current canonical post-login page.
import { redirect } from "next/navigation";

export default function AppPage() {
  redirect("/brief");
}
