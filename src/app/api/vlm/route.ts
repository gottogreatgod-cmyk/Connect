import { NextResponse } from 'next/server'
import { getZAI } from '@/lib/sdk'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { imageBase64?: string }
    const imageBase64 =
      typeof body.imageBase64 === 'string' ? body.imageBase64.replace(/^data:[^,]+,/, '') : ''

    if (!imageBase64) {
      return NextResponse.json({ error: 'An imageBase64 value is required.' }, { status: 400 })
    }
    if (imageBase64.length > 8_000_000) {
      return NextResponse.json({ error: 'The image is too large (max ~6MB).' }, { status: 413 })
    }

    const zai = await getZAI()
    const response = await zai.chat.completions.createVision({
      model: 'glm-4.5v',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Describe this image for a website design brief in 2-4 sentences: the subject, the visual style (colors, mood, composition), and what kind of website or brand it would fit. Plain text only.',
            },
            {
              type: 'image_url',
              image_url: { url: `data:image/png;base64,${imageBase64}` },
            },
          ],
        },
      ],
      thinking: { type: 'disabled' },
    })

    const description = response.choices[0]?.message?.content

    if (!description || description.trim().length === 0) {
      return NextResponse.json({ error: 'The vision model returned no description.' }, { status: 502 })
    }

    return NextResponse.json({ description: description.trim() })
  } catch (error) {
    console.error('[api/vlm]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Image analysis failed.' },
      { status: 500 },
    )
  }
}
