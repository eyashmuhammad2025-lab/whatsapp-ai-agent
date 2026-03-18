import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

let agentPromptCache: string | null = null

export function loadAgentPrompt(): string {
  if (agentPromptCache) return agentPromptCache

  const promptPath = path.join(process.cwd(), 'AGENT_PROMPT.md')
  try {
    agentPromptCache = fs.readFileSync(promptPath, 'utf-8')
    return agentPromptCache
  } catch (error) {
    console.error('[openai] Failed to load AGENT_PROMPT.md:', error)
    return 'You are a helpful customer support assistant.'
  }
}

export async function callOpenAI(userMessage: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY env var is missing')
  }

  const client = new OpenAI({ apiKey })
  const systemPrompt = loadAgentPrompt()

  const completion = await client.chat.completions.create({
    model: 'gpt-4-0613',
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
