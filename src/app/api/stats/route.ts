import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { Intent } from "@/lib/gos/types"

export const dynamic = "force-dynamic"

export async function GET() {
  const [sites, runs, messages, memories, conversations, recentRuns, memoriesList, media, mediaByKind] =
    await Promise.all([
      db.site.count(),
      db.agentRun.count(),
      db.message.count(),
      db.memory.count(),
      db.conversation.count(),
      db.agentRun.findMany({
        orderBy: { createdAt: "desc" },
        take: 12,
        select: {
          id: true,
          task: true,
          intent: true,
          toolCalls: true,
          durationMs: true,
          success: true,
          createdAt: true,
        },
      }),
      db.memory.findMany({
        orderBy: { updatedAt: "desc" },
        take: 12,
        select: { id: true, scope: true, key: true, body: true, updatedAt: true },
      }),
      db.media.count(),
      db.media.groupBy({ by: ["kind"], _count: { _all: true } }),
    ])

  const [avg, toolAgg, intentGroups] = await Promise.all([
    db.site.aggregate({ _avg: { score: true } }),
    db.agentRun.aggregate({ _sum: { toolCalls: true } }),
    db.agentRun.groupBy({ by: ["intent"], _count: { _all: true } }),
  ])

  return NextResponse.json({
    sites,
    runs,
    messages,
    memories,
    conversations,
    toolCalls: toolAgg._sum.toolCalls ?? 0,
    avgScore: avg._avg.score ? Math.round(avg._avg.score) : null,
    media,
    mediaByKind: mediaByKind.map((g) => ({ kind: g.kind, count: g._count._all })),
    intents: intentGroups.map((g) => ({
      intent: g.intent as Intent,
      count: g._count._all,
    })),
    recentRuns: recentRuns.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
    memoriesList: memoriesList.map((m) => ({
      ...m,
      updatedAt: m.updatedAt.toISOString(),
    })),
  })
}
