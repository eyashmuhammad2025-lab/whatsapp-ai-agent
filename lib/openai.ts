import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * Loads the agent system prompt using a priority chain:
 *   1. AGENT_PROMPT environment variable (fastest, no I/O — ideal for Vercel/containers)
 *   2. Provided dbPrompt argument (loaded from Supabase settings table by the caller)
 *   3. AGENT_PROMPT.md file at the project root
 *   4. Hard-coded fallback string
 *
 * Passing `dbPrompt` in from the caller keeps this function pure and avoids a circular
 * dependency between lib/openai.ts and lib/supabase-server.ts.
 */
export function resolveAgentPrompt(dbPrompt?: string | null): string {
  // Priority 1 — environment variable (set once per deployment, overrides everything)
  if (process.env.AGENT_PROMPT) {
    return process.env.AGENT_PROMPT
  }

  // Priority 2 — value fetched from Supabase settings table by the caller
  if (dbPrompt) {
    return dbPrompt
  }

  // Priority 3 — AGENT_PROMPT.md file (useful for local dev and self-hosted)
  const promptPath = path.join(process.cwd(), 'AGENT_PROMPT.md')
  try {
    return fs.readFileSync(promptPath, 'utf-8')
  } catch {
    // file not found — fall through to default
  }

  // Priority 4 — safe default
  return 'You are a helpful customer support assistant.'
}

/**
 * Calls OpenAI GPT-4 with the given user message and system prompt.
 * `systemPrompt` should be resolved by the caller using `resolveAgentPrompt()`.
 */
export async function callOpenAI(
  userMessage: string,
  systemPrompt: string
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY env var is missing')
  }

  const client = new OpenAI({ apiKey })

  const completion = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    max_tokens: 1000,
    temperature: 0.7,
  })

  const content = completion.choices[0]?.message?.content
  if (!content) {
    throw new Error('OpenAI returned empty response')
  }

  return content
}
