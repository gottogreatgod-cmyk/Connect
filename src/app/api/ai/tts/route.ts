import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

/**
 * POST /api/ai/tts — the Text-to-Speech skill, synchronous.
 *
 * Body: { text, voice?, speed? } → binary audio/wav.
 *
 * The TTS API caps input at 1024 characters; longer text is split at
 * sentence boundaries and the chunks are rendered sequentially, then
 * returned as one JSON manifest of data-URLs (the client plays them in
 * order) — WAV buffers can't be naively concatenated.
 */

export const runtime = "nodejs";
export const maxDuration = 60;

const VOICES = new Set(["tongtong", "chuichui", "xiaochen", "jam", "kazi", "douji", "luodo"]);

/** Split at sentence boundaries, hard-splitting pathological input. */
function splitText(text: string, max = 950): string[] {
  const sentences = text.match(/[^.!?\n]+[.!?]*\s*/g) ?? [text];
  const chunks: string[] = [];
  let current = "";
  for (const s of sentences) {
    if ((current + s).length <= max) {
      current += s;
    } else {
      if (current.trim()) chunks.push(current.trim());
      if (s.length <= max) {
        current = s;
      } else {
        /* hard split an oversized sentence */
        for (let i = 0; i < s.length; i += max) {
          chunks.push(s.slice(i, i + max).trim());
        }
        current = "";
      }
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter(Boolean).slice(0, 6); // sane ceiling per request
}

export async function POST(req: Request) {
  try {
    const { text, voice, speed } = (await req.json()) as {
      text?: string;
      voice?: string;
      speed?: number;
    };

    const clean = typeof text === "string" ? text.replace(/\s+/g, " ").trim() : "";
    if (!clean) {
      return NextResponse.json({ error: "Enter the text to speak first." }, { status: 400 });
    }

    const pickedVoice = typeof voice === "string" && VOICES.has(voice) ? voice : "tongtong";
    const pickedSpeed =
      typeof speed === "number" && Number.isFinite(speed)
        ? Math.min(2, Math.max(0.5, Math.round(speed * 10) / 10))
        : 1.0;

    const chunks = splitText(clean);
    const zai = await ZAI.create();

    const parts: string[] = [];
    for (const chunk of chunks) {
      const response = await zai.audio.tts.create({
        input: chunk,
        voice: pickedVoice,
        speed: pickedSpeed,
        response_format: "wav",
        stream: false,
      });
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(new Uint8Array(arrayBuffer));
      if (buffer.length === 0) throw new Error("empty audio chunk");
      parts.push(`data:audio/wav;base64,${buffer.toString("base64")}`);
    }

    if (!parts.length) throw new Error("no audio generated");

    return NextResponse.json({
      parts,
      voice: pickedVoice,
      speed: pickedSpeed,
      chunks: parts.length,
      chars: clean.length,
    });
  } catch (error) {
    console.error("[ai/tts] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Speech synthesis failed." },
      { status: 200 },
    );
  }
}
