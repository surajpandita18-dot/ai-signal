// lib/inngest.ts
// Inngest client — import this everywhere you need to send events or define functions.

import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "ai-signal",
  ...(process.env.INNGEST_EVENT_KEY
    ? { eventKey: process.env.INNGEST_EVENT_KEY }
    : {}),
});
