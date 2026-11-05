import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

/**
 * POST /api/ai/reader — the Page Reader skill.
 *
 * Body: { url, mode? } →
 *   mode: "extract" (default) { title, url, text, chars }
 *   mode: "audit"             { title, url, text, audit }  — the page
 *                             content is chained through the LLM for a
 *                             structured strengths/gaps audit.
 *
 * The reader function returns full HTML; the route strips it to
 * readable text server-side so the client never parses markup.
 */

export const runtime = "nodejs";
export const maxDuration = 60;

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/(p|div|section|article|li|h[1-6]|tr|br)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();
}

export async function POST(req: Request) {
  try {
    const { url, mode } = (await req.json()) as { url?: string; mode?: string };

    const clean = typeof url === "string" ? url.trim() : "";
    if (!clean) {
      return NextResponse.json({ error: "Enter a URL to read." }, { status: 400 });
    }
    const withProto = /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
    let parsed: URL;
    try {
      parsed = new URL(withProto);
    } catch {
      return NextResponse.json({ error: "That does not look like a valid URL." }, { status: 400 });
    }

    const zai = await ZAI.create();
    const page = await zai.functions.invoke("page_reader", { url: parsed.toString() });

    const title = page?.data?.title ?? parsed.hostname;
    const text = htmlToText(page?.data?.html ?? "").slice(0, 20000);

    if (!text) {
      return NextResponse.json(
        { error: "The page returned no readable content (it may be scripted or paywalled)." },
        { status: 200 },
      );
    }

    if (mode === "audit") {
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: "assistant",
            content:
              "You are a conversion-focused website auditor. You receive the readable text of one web page. Reply with four short sections, each 1-3 bullets, plain text only, no markdown headers: WHAT THEY SELL, WHAT WORKS, WHAT'S MISSING, QUICK WINS. Be specific and cite their actual words where useful. Keep it under 220 words total.",
          },
          { role: "user", content: `URL: ${parsed.toString()}\n\nPAGE TEXT:\n${text.slice(0, 9000)}` },
        ],
        thinking: { type: "disabled" },
      });
      const audit = completion.choices?.[0]?.message?.content?.trim() ?? "";
      return NextResponse.json({ title, url: parsed.toString(), text: text.slice(0, 6000), audit });
    }

    return NextResponse.json({ title, url: parsed.toString(), text, chars: text.length });
  } catch (error) {
    console.error("[ai/reader] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "The reader service is briefly unavailable." },
      { status: 200 },
    );
  }
}
