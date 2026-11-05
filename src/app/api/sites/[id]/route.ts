import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const site = await db.site.findUnique({ where: { id } })
  if (!site) {
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }
  return NextResponse.json({
    site: {
      id: site.id,
      name: site.name,
      brief: site.brief,
      html: site.html,
      score: site.score,
      version: site.version,
      designSeed: site.designSeed ? JSON.parse(site.designSeed) : null,
      checks: site.checks ? JSON.parse(site.checks) : null,
      createdAt: site.createdAt,
      updatedAt: site.updatedAt,
    },
  })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  await db.site.delete({ where: { id } }).catch(() => undefined)
  return NextResponse.json({ ok: true })
}
