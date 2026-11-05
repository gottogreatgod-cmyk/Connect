import { NextResponse } from 'next/server'
import { getZAI } from '@/lib/sdk'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { audioBase64?: string }
    const audioBase64 =
      typeof body.audioBase64 === 'string' ? body.audioBase64.replace(/^data:[^,]+,/, '') : ''

    if (!audioBase64) {
      return NextResponse.json({ error: 'An audioBase64 value is required.' }, { status: 400 })
    }
    if (audioBase64.length > 15_000_000) {
      return NextResponse.json({ error: 'The recording is too large (max ~10MB).' }, { status: 413 })
    }

    const zai = await getZAI()
    const response = await zai.audio.asr.create({ file_base64: audioBase64 })
    const text = response?.text

    if (typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'No speech was detected in the recording.' },
        { status: 422 },
      )
    }

    return NextResponse.json({ text })
  } catch (error) {
    console.error('[api/asr]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Transcription failed.' },
      { status: 500 },
    )
  }
}
