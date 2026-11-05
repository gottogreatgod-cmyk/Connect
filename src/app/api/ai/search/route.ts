import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

/**
 * POST /api/ai/search — the Web Search skill, synchronous.
 *
 * Body: { query, num? } → { results: SearchFunctionResultItem[] }
 *
 * Two engines share this route:
 *   engine: "web"   (default) — zai.functions.invoke("web_search")
 *   engine: "image"           — zai.images.search.create (real web images)
 */

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { query, num, engine } = (await req.json()) as {
      query?: string;
      num?: number;
      engine?: string;
    };

    const clean = typeof query === "string" ? query.trim().slice(0, 300) : "";
    if (!clean) {
      return NextResponse.json({ error: "Enter something to search for." }, { status: 400 });
    }
    const count = typeof num === "number" ? Math.min(12, Math.max(3, Math.round(num))) : 8;

    const zai = await ZAI.create();

    if (engine === "image") {
      const res = await zai.images.search.create({ query: clean, count });
      if (!res?.success || !Array.isArray(res.results)) {
        return NextResponse.json({ error: res?.error ?? "The image search returned nothing." }, { status: 200 });
      }
      return NextResponse.json({
        engine: "image",
        results: res.results.slice(0, count).map((r) => ({
          url: r.original_url,
          name: r.caption ?? r.source ?? "image result",
          snippet: r.caption ?? "",
          host_name: r.source ?? "",
          width: r.original_width ?? null,
          height: r.original_height ?? null,
        })),
      });
    }

    const results = await zai.functions.invoke("web_search", { query: clean, num: count });
    return NextResponse.json({
      engine: "web",
      results: (results ?? []).slice(0, count),
    });
  } catch (error) {
    console.error("[ai/search] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "The search service is briefly unavailable." },
      { status: 200 },
    );
  }
}
