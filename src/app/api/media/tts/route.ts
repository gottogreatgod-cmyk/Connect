import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { findCharacter, speak, type VoiceId } from "@/lib/media/sdk"

export const maxDuration = 120
export const dynamic = "force-dynamic"

const VALID_VOICES = new Set(["tongtong", "chuichui", "xiaochen", "jam", "kazi", "douji", "luodo"])

/**
 * POST { text, character?, voice?, speed?, tone?, save? }
 * → audio/wav binary (X-Media-Id header when saved).
 * `character` picks a gender × age persona (base voice + pitch shift);
 * `voice` is the raw engine voice (legacy/advanced); `tone` adds extra
 * semitones on top of the character's shift (-6…+6).
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const text = typeof body?.text === "string" ? body.text : ""
  const speed = typeof body?.speed === "number" && Number.isFinite(body.speed) ? body.speed : 1.0
  const tone = typeof body?.tone === "number" && Number.isFinite(body.tone) ? body.tone : 0
  const save = body?.save !== false

  let voice: VoiceId
  let semitones = 0
  if (typeof body?.character === "string" && body.character) {
    const character = findCharacter(body.character)
    voice = character.base
    semitones = character.shift + Math.min(6, Math.max(-6, tone))
  } else if (VALID_VOICES.has(body?.voice)) {
    voice = body.voice as VoiceId
    semitones = Math.min(11, Math.max(-11, tone))
  } else {
    voice = "tongtong"
    semitones = Math.min(6, Math.max(-6, tone))
  }

  if (!text.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 })
  }

  try {
    const { buffer, mimeType } = await speak(text, voice, speed, semitones)

    let mediaId: string | null = null
    if (save) {
      const row = await db.media.create({
        data: {
          kind: "audio",
          prompt: text.slice(0, 500),
          data: buffer.toString("base64"),
          mimeType,
        },
      })
      mediaId = row.id
    }

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Length": String(buffer.length),
        "Cache-Control": "no-cache",
        ...(mediaId ? { "X-Media-Id": mediaId } : {}),
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[media/tts]", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
