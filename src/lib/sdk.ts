import ZAI from 'z-ai-web-dev-sdk'

type ZAIInstance = Awaited<ReturnType<typeof ZAI.create>>

/**
 * Server-side SDK singleton. The z-ai-web-dev-sdk must only ever be imported
 * in backend code — this helper exists so every API route shares one instance.
 */
const globalForZAI = globalThis as unknown as {
  zai: ZAIInstance | undefined
}

export async function getZAI(): Promise<ZAIInstance> {
  if (!globalForZAI.zai) {
    globalForZAI.zai = await ZAI.create()
  }
  return globalForZAI.zai
}
