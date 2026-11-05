import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { startVideo, type VideoQuality } from "@/lib/media/sdk"

export const maxDuration = 120
export const dynamic = "force-dynamic"

/** POST { prompt, quality? } → { taskId, mediaId } — starts an async render. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const prompt = typeof body?.prompt === "string" ? body.prompt : ""
  const quality: VideoQuality = body?.quality === "quality" ? "quality" : "speed"

  if (!prompt.trim()) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 })
  }

  try {
    const task = await startVideo(prompt, quality)
    const row = await db.media.create({
      data: {
        kind: "video",
        prompt: prompt.slice(0, 500),
        ref: task.taskId,
        url: null,
        mimeType: "video/mp4",
        status: "rendering",
      },
    })
    return NextResponse.json({ taskId: task.taskId, mediaId: row.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[media/video]", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
