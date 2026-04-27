// app/saved/page.tsx
// Legacy route — redirect to brief.
import { redirect } from "next/navigation";

export default function SavedRedirect() {
  redirect("/brief");
}
