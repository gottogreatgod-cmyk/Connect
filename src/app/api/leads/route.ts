import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/leads — the forge's closing section and the concierge CTA.
 * GET /api/leads — the honest count ("N briefs on file") for the UI.
 */

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name?: string;
      email?: string;
      business?: string;
      industry?: string;
      budget?: string;
      brief?: string;
      source?: string;
    };
    const name = (body.name ?? "").trim();
    const email = (body.email ?? "").trim();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return NextResponse.json({ ok: false, error: "A name and a complete email are required." }, { status: 400 });
    }
    await db.lead.create({
      data: {
        name: name.slice(0, 120),
        email: email.slice(0, 160),
        business: body.business?.slice(0, 120) ?? null,
        industry: body.industry?.slice(0, 64) ?? null,
        budget: body.budget?.slice(0, 32) ?? null,
        brief: body.brief?.slice(0, 2000) ?? null,
        source: (body.source ?? "forge").slice(0, 32),
      },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("leads error", err);
    return NextResponse.json({ ok: false, error: "Could not file the brief." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const count = await db.lead.count();
    return NextResponse.json({ ok: true, count });
  } catch {
    return NextResponse.json({ ok: true, count: 0 });
  }
}
