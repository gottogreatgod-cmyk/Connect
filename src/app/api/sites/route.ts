import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const sites = await db.site.findMany({
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: {
      id: true,
      name: true,
      brief: true,
      score: true,
      version: true,
      designSeed: true,
      createdAt: true,
      updatedAt: true,
    },
  })
  return NextResponse.json({
    sites: sites.map((s) => ({
      id: s.id,
      name: s.name,
      brief: s.brief,
      score: s.score,
      version: s.version,
      designSeed: s.designSeed ? JSON.parse(s.designSeed) : null,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    })),
  })
}
