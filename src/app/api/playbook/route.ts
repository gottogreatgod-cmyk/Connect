import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

/**
 * GET /api/playbook — the 344-module build standard, sliced on demand.
 *
 *   ?index               sections + counts + meta (no modules)
 *   ?q=restaurant        search module metadata (name, purpose, features…)
 *   ?section=01          filter by section number
 *   ?tier=growth         filter by tier
 *   ?module=site-header  one module, with its full reference code
 *
 * The 762KB JSON is parsed once per process and cached in memory.
 */

interface RawModule {
  id: string
  name: string
  section: string
  sectionNo: string
  tier: "starter" | "growth" | "business" | "flagship"
  tierRaw: string
  file: string
  features: string[]
  purpose: string
  rule: string
  accessibility: string | null
  note: string | null
  codeKind: string | null
  codeNote: string | null
  hasCode: boolean
  code: string | null
}

interface RawSection {
  no: string
  title: string
  blurb: string
  architecture: string[]
  accessibility: string[]
  performance: string[]
  gate: string[]
  count: number
  starter: number
  growth: number
  business: number
  flagship: number
}

interface PlaybookDoc {
  meta: Record<string, unknown>
  sections: RawSection[]
  modules: RawModule[]
  total: number
  byTier: Record<string, number>
}

let cache: PlaybookDoc | null = null;

async function load(): Promise<PlaybookDoc> {
  if (cache) return cache;
  const file = path.join(process.cwd(), "data", "playbook.json");
  const raw = await readFile(file, "utf8");
  cache = JSON.parse(raw) as PlaybookDoc;
  return cache;
}

/** The list projection: metadata only, code stripped (the detail endpoint carries it). */
function summarize(m: RawModule) {
  const { code, ...rest } = m;
  return rest;
}

export async function GET(req: Request) {
  try {
    const doc = await load();
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
    const section = url.searchParams.get("section");
    const tier = url.searchParams.get("tier");
    const moduleId = url.searchParams.get("module");
    const wantsIndex = url.searchParams.get("index") !== null;

    if (moduleId) {
      const m = doc.modules.find((x) => x.id === moduleId || x.name === moduleId);
      if (!m) return NextResponse.json({ ok: false, error: "unknown module" }, { status: 404 });
      return NextResponse.json({ ok: true, module: m });
    }

    if (wantsIndex) {
      return NextResponse.json({
        ok: true,
        total: doc.total,
        byTier: doc.byTier,
        sections: doc.sections,
        meta: doc.meta,
      });
    }

    let list = doc.modules;
    if (section && section !== "all") list = list.filter((m) => m.sectionNo === section);
    if (tier && tier !== "all") list = list.filter((m) => m.tier === tier);
    if (q) {
      list = list.filter((m) =>
        `${m.name} ${m.section} ${m.tierRaw} ${m.file} ${m.purpose} ${m.rule} ${m.features.join(" ")} ${m.note ?? ""}`
          .toLowerCase()
          .includes(q),
      );
    }

    return NextResponse.json({
      ok: true,
      total: doc.total,
      byTier: doc.byTier,
      sections: doc.sections,
      meta: doc.meta,
      modules: list.map(summarize),
      query: q || undefined,
    });
  } catch (err) {
    console.error("playbook error", err);
    return NextResponse.json({ ok: false, error: "playbook unavailable" }, { status: 500 });
  }
}
