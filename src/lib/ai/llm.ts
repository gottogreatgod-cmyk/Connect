// ─── LLM client (z-ai-web-dev-sdk, backend only) ────────────────────────
import ZAI from "z-ai-web-dev-sdk"

type ChatMessage = { role: "user" | "assistant"; content: string }

const g = globalThis as unknown as { __zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | undefined }

export async function getClient() {
  if (!g.__zaiInstance) {
    g.__zaiInstance = await ZAI.create()
  }
  return g.__zaiInstance
}

export interface ChatOptions {
  retries?: number
  timeoutMs?: number
}

export async function chat(messages: ChatMessage[], opts: ChatOptions = {}): Promise<string> {
  const retries = opts.retries ?? 2
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const client = await getClient()
      const completion = await client.chat.completions.create({
        messages,
        thinking: { type: "disabled" },
      })
      const content = completion.choices?.[0]?.message?.content
      if (!content || content.trim().length === 0) {
        throw new Error("Empty response from model")
      }
      return content
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 800 * (attempt + 1)))
      }
    }
  }
  throw lastError ?? new Error("LLM call failed")
}

/**
 * Streaming chat — yields content deltas the moment the model writes them.
 * Used by the site builder so the preview can render code as it is written,
 * and so long generations never look (or time out like) a stuck request.
 *
 * - Falls back to one full-text yield if the API answers non-streamed.
 * - Retries ONLY while zero content has arrived — a mid-stream failure is
 *   surfaced to the caller instead of silently restarting the output.
 */
export async function* chatStream(
  messages: ChatMessage[],
  opts: ChatOptions = {},
): AsyncGenerator<string> {
  const retries = opts.retries ?? 1
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    let received = 0
    try {
      const client = await getClient()
      const res = (await client.chat.completions.create({
        messages,
        thinking: { type: "disabled" },
        stream: true,
      })) as unknown

      // Non-streamed fallback: the SDK answered with a complete JSON object
      if (res == null || typeof (res as { getReader?: unknown }).getReader !== "function") {
        const completion = res as {
          choices?: { message?: { content?: string }; text?: string }[]
        } | null
        const content =
          completion?.choices?.[0]?.message?.content ?? completion?.choices?.[0]?.text ?? ""
        if (!content.trim()) throw new Error("Empty response from model")
        yield content
        return
      }

      const reader = (res as ReadableStream<Uint8Array>).getReader()
      const decoder = new TextDecoder()
      let buf = ""
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split("\n")
        buf = lines.pop() ?? ""
        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith("data:")) continue
          const payload = trimmed.slice(5).trim()
          if (!payload || payload === "[DONE]") continue
          try {
            const frame = JSON.parse(payload) as {
              choices?: {
                delta?: { content?: string }
                message?: { content?: string }
                text?: string
              }[]
            }
            const delta =
              frame.choices?.[0]?.delta?.content ??
              frame.choices?.[0]?.message?.content ??
              frame.choices?.[0]?.text ??
              ""
            if (delta) {
              received += delta.length
              yield delta
            }
          } catch {
            /* skip malformed frame */
          }
        }
      }
      if (received === 0) throw new Error("The model stream closed before any content arrived")
      return
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      // never restart output that already flowed to the caller
      if (received > 0 || attempt >= retries) throw lastError
      await new Promise((r) => setTimeout(r, 800 * (attempt + 1)))
    }
  }
  throw lastError ?? new Error("LLM stream failed")
}

/**
 * Extract a JSON object from model output.
 * Handles markdown fences, leading prose, and trailing commentary.
 */
export function extractJson<T>(text: string): T | null {
  if (!text) return null
  // Strip code fences
  let t = text.replace(/```(?:json)?/gi, "```").split("```").join("\n")
  const first = t.indexOf("{")
  if (first === -1) return null
  // Find matching closing brace from the end
  const last = t.lastIndexOf("}")
  if (last <= first) return null
  t = t.slice(first, last + 1)
  try {
    return JSON.parse(t) as T
  } catch {
    // One rescue pass: remove trailing commas
    try {
      return JSON.parse(t.replace(/,\s*([}\]])/g, "$1")) as T
    } catch {
      return null
    }
  }
}

/** Pull the first URL out of a piece of text. */
export function extractUrl(text: string): string | null {
  const m = text.match(/https?:\/\/[^\s<>"')\]]+/i)
  return m ? m[0] : null
}
