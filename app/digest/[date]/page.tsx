// app/digest/[date]/page.tsx
// Legacy route — redirect to the new brief archive.
import { redirect } from "next/navigation";

type Props = { params: Promise<{ date: string }> };

export default async function DigestRedirect({ params }: Props) {
  const { date } = await params;
  redirect(`/brief/${date}`);
}
