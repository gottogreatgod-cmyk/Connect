import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

/**
 * GET /api/media/:id
 *  ?raw=1  → binary payload (image/audio) or redirect to the video url
 *  default → JSON metadata
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const media = await db.media.findUnique({ where: { id } }).catch(() => null)
  if (!media) {
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }

  if (req.nextUrl.searchParams.get("raw") === "1") {
    if (media.kind === "video") {
      if (!media.url) {
        return NextResponse.json({ error: "still rendering" }, { status: 425 })
      }
      return NextResponse.redirect(media.url, 302)
    }
    if (!media.data) {
      return NextResponse.json({ error: "no payload" }, { status: 404 })
    }
    const buffer = Buffer.from(media.data, "base64")
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": media.mimeType,
        "Content-Length": String(buffer.length),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  }

  return NextResponse.json({
    id: media.id,
    kind: media.kind,
    prompt: media.prompt,
    mimeType: media.mimeType,
    url: media.url,
    status: media.status,
    pending: media.status === "rendering",
    conversationId: media.conversationId,
    createdAt: media.createdAt.toISOString(),
  })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    await db.media.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }
}
