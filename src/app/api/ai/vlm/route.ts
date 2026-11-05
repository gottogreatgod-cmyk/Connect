import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

/**
 * POST /api/ai/vlm — the Vision skill (VLM), synchronous.
 *
 * Body: { image_base64, mime?, prompt? } → { reply }
 *
 * The vision model (glm-4.6v) reads a base64 data-URL and answers the
 * prompt about it — critique, alt text, extraction, comparison.
 */

export const runtime = "nodejs";
export const maxDuration = 60;

const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/bmp"]);

export async function POST(req: Request) {
  try {
    const { image_base64, mime, prompt } = (await req.json()) as {
      image_base64?: string;
      mime?: string;
      prompt?: string;
    };

    const clean = typeof image_base64 === "string" ? image_base64.replace(/^data:[^,]+,/, "").trim() : "";
    if (!clean || clean.length < 64) {
      return NextResponse.json({ error: "No usable image was received." }, { status: 400 });
    }
    /* ~12MB base64 ceiling */
    if (clean.length > 12 * 1024 * 1024) {
      return NextResponse.json({ error: "Image too large (keep it under ~8MB)." }, { status: 400 });
    }

    const pickedMime = typeof mime === "string" && ALLOWED_MIME.has(mime) ? mime : "image/png";
    const question =
      typeof prompt === "string" && prompt.trim().length > 0
        ? prompt.trim().slice(0, 2000)
        : "Describe this image in detail.";

    const zai = await ZAI.create();
    const response = await zai.chat.completions.createVision({
      model: "glm-4.6v",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: question },
            { type: "image_url", image_url: { url: `data:${pickedMime};base64,${clean}` } },
          ],
        },
      ],
      thinking: { type: "disabled" },
    });

    const reply = response.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error("empty vision response");
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[ai/vlm] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "The vision service is briefly unavailable." },
      { status: 200 },
    );
  }
}
