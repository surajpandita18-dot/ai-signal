import Anthropic from '@anthropic-ai/sdk'

/**
 * Configured Anthropic SDK client.
 * Reads ANTHROPIC_API_KEY from env; throws clearly if missing so the failure
 * surfaces at call-site, not as a cryptic 401 from Anthropic.
 */
export function anthropic(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY env var is not set')
  }
  return new Anthropic({ apiKey })
}

// Re-export the class so callers can type messages, content blocks, etc.
export { Anthropic }
