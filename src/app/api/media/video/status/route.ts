import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { pollVideo } from "@/lib/media/sdk"

export const maxDuration = 60
export const dynamic = "force-dynamic"

/**
 * GET ?taskId=… → { status, url, mediaId }
 * Completes the persisted Media row the first time the task reports SUCCESS.
 */
export async function GET(req: NextRequest) {
  const taskId = req.nextUrl.searchParams.get("taskId")
  if (!taskId) {
    return NextResponse.json({ error: "taskId is required" }, { status: 400 })
  }

  try {
    const result = await pollVideo(taskId)
    let mediaId: string | null = null

    if (result.status === "SUCCESS" && result.url) {
      const existing = await db.media.findUnique({ where: { ref: taskId } })
      if (existing) {
        mediaId = existing.id
        if (existing.status !== "done" || existing.url !== result.url) {
          await db.media.update({
            where: { id: existing.id },
            data: { url: result.url, status: "done" },
          })
        }
      } else {
        const row = await db.media.create({
          data: {
            kind: "video",
            prompt: "",
            ref: taskId,
            url: result.url,
            mimeType: "video/mp4",
            status: "done",
          },
        })
        mediaId = row.id
      }
    } else {
      const existing = await db.media.findUnique({ where: { ref: taskId } })
      mediaId = existing?.id ?? null
      if (result.status === "FAIL" && existing) {
        await db.media.update({ where: { id: existing.id }, data: { status: "failed" } })
      }
    }

    return NextResponse.json({ status: result.status, url: result.url, mediaId })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[media/video/status]", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
