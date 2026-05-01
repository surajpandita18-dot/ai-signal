// LOCAL DEV WORKFLOW:
// Terminal 1: npm run dev
// Terminal 2: npx inngest-cli@latest dev
// Inngest dev server auto-discovers events at http://localhost:3002/api/inngest
// Dashboard: http://localhost:8288

import { Inngest } from 'inngest'

export const inngest = new Inngest({ id: 'ai-signal' })

// Payload sent by the thin cron trigger — consumed by generateDailySignal
export interface DailyTriggerData {
  issueId: string
  issueNumber: number
}
