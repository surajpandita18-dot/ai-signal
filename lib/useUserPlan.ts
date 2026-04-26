// lib/useUserPlan.ts
"use client";

import { useEffect, useState } from "react";
import { getBrowserClient } from "./supabase";
import type { UserPlan } from "./types";

export function useUserPlan(): UserPlan {
  const [plan, setPlan] = useState<UserPlan>("free");

  useEffect(() => {
    const supabase = getBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user?.email;
      if (!email) return;
      // Plan is stored in user_metadata by Stripe webhook
      const meta = data.session?.user?.user_metadata as { plan?: string } | undefined;
      setPlan((meta?.plan as UserPlan) ?? "free");
    });
  }, []);

  return plan;
}
