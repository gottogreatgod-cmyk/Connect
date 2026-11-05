import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const conversations = await db.conversation.findMany({
    orderBy: { updatedAt: "desc" },
    take: 30,
    select: { id: true, title: true, createdAt: true, updatedAt: true },
  })
  return NextResponse.json({ conversations })
}

export async function POST() {
  const conversation = await db.conversation.create({ data: {} })
  return NextResponse.json({ conversation })
}
