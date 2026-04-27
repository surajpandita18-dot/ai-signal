// app/article/[id]/page.tsx
// Legacy route — redirect to brief.
import { redirect } from "next/navigation";

export default function ArticleRedirect() {
  redirect("/brief");
}
