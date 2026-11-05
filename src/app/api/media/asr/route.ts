import { NextRequest, NextResponse } from "next/server"
import { transcribe } from "@/lib/media/sdk"

export const maxDuration = 120
export const dynamic = "force-dynamic"

/** POST { audioBase64 } → { text } — speech → text. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const audioBase64 = typeof body?.audioBase64 === "string" ? body.audioBase64 : ""
  if (!audioBase64) {
    return NextResponse.json({ error: "audioBase64 is required" }, { status: 400 })
  }
  try {
    const text = await transcribe(audioBase64)
    return NextResponse.json({ text })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[media/asr]", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
