import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/track — persist a batch of analytics events (the Module
 * Playbook's 23-event vocabulary). GET /api/track — live aggregates for
 * the pulse readout: totals per event, recent templates, lead count.
 */

const MAX_BATCH = 64;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { events?: { name?: string; route?: string; template?: string; tier?: string; detail?: string }[] };
    const events = (body.events ?? []).filter((e) => typeof e?.name === "string" && e.name.length <= 64).slice(0, MAX_BATCH);
    if (!events.length) return NextResponse.json({ ok: true, saved: 0 });
    await db.event.createMany({
      data: events.map((e) => ({
        name: e.name!,
        route: e.route?.slice(0, 64) ?? null,
        template: e.template?.slice(0, 64) ?? null,
        tier: e.tier?.slice(0, 32) ?? null,
        detail: e.detail?.slice(0, 500) ?? null,
      })),
    });
    return NextResponse.json({ ok: true, saved: events.length });
  } catch (err) {
    console.error("track error", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET() {
  try {
    const [total, byName, recentTemplates, leads] = await Promise.all([
      db.event.count(),
      db.event.groupBy({ by: ["name"], _count: { name: true }, orderBy: { _count: { name: "desc" } }, take: 12 }),
      db.event.groupBy({ by: ["template"], _count: { template: true }, orderBy: { _count: { template: "desc" } }, take: 8 }),
      db.lead.count(),
    ]);
    return NextResponse.json({
      ok: true,
      total,
      leads,
      byName: byName.map((b) => ({ name: b.name, count: b._count.name })).filter((b) => b.name),
      recentTemplates: recentTemplates
        .map((b) => ({ template: b.template, count: b._count.template }))
        .filter((b) => b.template),
    });
  } catch (err) {
    console.error("track aggregate error", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
