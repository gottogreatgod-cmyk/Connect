import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

/**
 * POST /api/ai/chat — the LLM skill, synchronous.
 *
 * Body: { system?: string, messages: { role, content }[] }
 * Returns { reply } — always HTTP 200 shape on success; the gateway
 * kills nothing here because thinking stays disabled (1–3s).
 */

export const runtime = "nodejs";
export const maxDuration = 60;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { system, messages } = body as { system?: string; messages?: ChatMessage[] };

    const history = (messages ?? [])
      .filter((m) => typeof m?.content === "string" && m.content.trim().length > 0)
      .slice(-10)
      .map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("assistant" as const),
        content: m.content.slice(0, 2000),
      }));

    if (history.length === 0) {
      return NextResponse.json({ error: "No message provided." }, { status: 400 });
    }

    const zai = await ZAI.create();
    const seed =
      typeof system === "string" && system.trim().length > 0
        ? [{ role: "assistant" as const, content: system.slice(0, 4000) }]
        : [];

    const completion = await zai.chat.completions.create({
      messages: [...seed, ...history],
      thinking: { type: "disabled" },
    });

    const reply = completion.choices[0]?.message?.content?.trim();
    if (!reply) throw new Error("empty completion");
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[ai/chat] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "The chat service is briefly unavailable." },
      { status: 200 },
    );
  }
}
