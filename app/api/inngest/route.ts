// app/api/inngest/route.ts
// Inngest event handler — all agent functions are registered here.
// Inngest calls this endpoint to execute pipeline steps.

import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";

import { dailyPipeline } from "@/agents/orchestrator";

const functions: Parameters<typeof serve>[0]["functions"] = [dailyPipeline];

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});
