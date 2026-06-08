/**
 * Client Claude API minimal — sans dépendance SDK.
 * Utilise le endpoint /v1/messages directement.
 */

const ENDPOINT = 'https://api.anthropic.com/v1/messages'
const VERSION = '2023-06-01'

export interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ClaudeResponse {
  content: { type: 'text'; text: string }[]
  stop_reason: string
  usage: { input_tokens: number; output_tokens: number }
}

export async function callClaude(opts: {
  apiKey: string
  model: string
  system: string
  messages: ClaudeMessage[]
  maxTokens?: number
}): Promise<ClaudeResponse> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': opts.apiKey,
      'anthropic-version': VERSION,
    },
    body: JSON.stringify({
      model: opts.model,
      max_tokens: opts.maxTokens ?? 4096,
      system: opts.system,
      messages: opts.messages,
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Claude API HTTP ${res.status} : ${body.slice(0, 500)}`)
  }
  return (await res.json()) as ClaudeResponse
}

export function extractText(resp: ClaudeResponse): string {
  return resp.content
    .filter((c) => c.type === 'text')
    .map((c) => c.text)
    .join('\n')
    .trim()
}
