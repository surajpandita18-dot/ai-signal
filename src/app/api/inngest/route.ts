import { serve } from 'inngest/next'
import { inngest } from '@/inngest/client'
import { generateDailySignal } from '@/inngest/generate-signal'

// maxDuration: each Inngest step invocation runs as a separate Vercel call.
// Each step in the pipeline (scout ~6s, write ~32s, cascade ~25s, publish ~2s)
// fits comfortably within 60s. This is the Hobby-plan ceiling.
export const maxDuration = 60

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateDailySignal],
})
