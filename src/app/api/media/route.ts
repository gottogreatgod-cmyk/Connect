import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

/** GET ?kind=image|audio|video&take=8 → recent generated media. */
export async function GET(req: NextRequest) {
  const kind = req.nextUrl.searchParams.get("kind")
  const take = Math.min(24, Math.max(1, Number(req.nextUrl.searchParams.get("take") ?? 8)))

  const media = await db.media.findMany({
    where: kind ? { kind } : undefined,
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      kind: true,
      prompt: true,
      mimeType: true,
      url: true,
      status: true,
      createdAt: true,
    },
  })

  return NextResponse.json({
    media: media.map((m) => ({
      id: m.id,
      kind: m.kind,
      prompt: m.prompt,
      mimeType: m.mimeType,
      url: m.url,
      status: m.status,
      pending: m.status === "rendering",
      createdAt: m.createdAt.toISOString(),
    })),
  })
}
