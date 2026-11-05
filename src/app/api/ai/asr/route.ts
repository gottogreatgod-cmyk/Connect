import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

/**
 * POST /api/ai/asr — the Speech Recognition skill, synchronous.
 *
 * Body: { audio_base64 } → { text }
 *
 * The client records with MediaRecorder or uploads a file, converts to
 * base64, and the route passes it straight to the ASR service.
 */

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { audio_base64 } = (await req.json()) as { audio_base64?: string };

    const clean = typeof audio_base64 === "string" ? audio_base64.replace(/^data:[^,]+,/, "").trim() : "";
    if (!clean || clean.length < 64) {
      return NextResponse.json({ error: "No usable audio was received." }, { status: 400 });
    }
    /* ~40MB base64 ceiling — keeps the request honest */
    if (clean.length > 40 * 1024 * 1024) {
      return NextResponse.json({ error: "Audio file too large (keep it under 30MB)." }, { status: 400 });
    }

    const zai = await ZAI.create();
    const response = await zai.audio.asr.create({ file_base64: clean });
    const text = typeof response?.text === "string" ? response.text.trim() : "";

    if (!text) {
      return NextResponse.json(
        { error: "No speech detected — try a clearer or slightly longer recording." },
        { status: 200 },
      );
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error("[ai/asr] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Transcription failed." },
      { status: 200 },
    );
  }
}
