import { NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

const MAX_MESSAGES = 20
const MAX_CONTENT_LENGTH = 4000

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { messages?: ChatMessage[] }
    const messages = Array.isArray(body.messages) ? body.messages : []

    if (messages.length === 0) {
      return NextResponse.json(
        { error: 'At least one message is required.' },
        { status: 400 }
      )
    }

    // Keep only valid messages, trimmed to the most recent ones
    const history = messages
      .filter(
        (m) =>
          m &&
          (m.role === 'user' || m.role === 'assistant') &&
          typeof m.content === 'string' &&
          m.content.trim().length > 0
      )
      .slice(-MAX_MESSAGES)
      .map((m) => ({
        role: m.role,
        content: m.content.slice(0, MAX_CONTENT_LENGTH),
      }))

    if (history.length === 0) {
      return NextResponse.json(
        { error: 'No valid messages provided.' },
        { status: 400 }
      )
    }

    const zai = await ZAI.create()

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content:
            'You are a friendly, concise AI assistant embedded in a live demo of the AI Skills Playground website. You help visitors understand how they can add AI capabilities (Skills) like chat, image generation, speech, vision, and web search to their own websites using a simple backend SDK. Keep answers clear and under 250 words unless the user asks for more. Use Markdown-free plain text.',
        },
        ...history,
      ],
      thinking: { type: 'disabled' },
    })

    const content = completion.choices[0]?.message?.content

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'The model returned an empty response. Please try again.' },
        { status: 502 }
      )
    }

    return NextResponse.json({ content })
  } catch (error) {
    console.error('[api/chat] Error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get a response from the AI.',
      },
      { status: 500 }
    )
  }
}
