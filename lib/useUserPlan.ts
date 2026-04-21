// lib/useUserPlan.ts
"use client";

import { useSession } from "next-auth/react";
import type { UserPlan } from "./types";

export function useUserPlan(): UserPlan {
  const { data: session } = useSession();
  // Type assertion — session.user.plan added in auth.ts callback
  const plan = (session?.user as { plan?: string } | undefined)?.plan;
  return (plan as UserPlan) ?? "free";
}
