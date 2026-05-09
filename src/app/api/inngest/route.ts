import { serve } from 'inngest/next'
import { inngest } from '@/inngest/client'
import { generateDailySignal } from '@/inngest/generate-signal'

// maxDuration: write step now ~90-120s due to larger extended_data prompt.
// 300s = Pro plan ceiling. Hobby plan caps at 60s regardless.
export const maxDuration = 300

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateDailySignal],
})
