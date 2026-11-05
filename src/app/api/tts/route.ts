import { NextResponse } from 'next/server'
import { getZAI } from '@/lib/sdk'

export const dynamic = 'force-dynamic'

const VOICES = ['tongtong', 'chuichui', 'xiaochen', 'jam', 'kazi', 'douji', 'luodo'] as const
const MAX_TEXT_LENGTH = 1000

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { text?: string; voice?: string; speed?: number }

    const text = typeof body.text === 'string' ? body.text.trim() : ''
    if (!text) {
      return NextResponse.json({ error: 'Text is required.' }, { status: 400 })
    }
    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Text must be under ${MAX_TEXT_LENGTH} characters per request.` },
        { status: 400 },
      )
    }

    const voice = (VOICES as readonly string[]).includes(body.voice ?? '')
      ? (body.voice as (typeof VOICES)[number])
      : 'jam'
    const speed = typeof body.speed === 'number' && body.speed >= 0.5 && body.speed <= 2 ? body.speed : 1

    const zai = await getZAI()
    const response = await zai.audio.tts.create({
      input: text,
      voice,
      speed,
      response_format: 'wav',
      stream: false,
    })

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(new Uint8Array(arrayBuffer))

    if (buffer.length === 0) {
      return NextResponse.json({ error: 'Speech synthesis returned no audio.' }, { status: 502 })
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('[api/tts]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Speech synthesis failed.' },
      { status: 500 },
    )
  }
}
