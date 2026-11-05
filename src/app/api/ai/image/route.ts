import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { createJob, failJob, finishJob, getJob, jobView } from "@/lib/ai-jobs";

/**
 * The Image Generation skill — asynchronous JOB pattern.
 *
 *   POST /api/ai/image  { prompt, size }        → 202 { jobId }
 *   GET  /api/ai/image?jobId=<id>               → { status, image?, error? }
 *
 * Generation takes 30–90s — well past the ~60s gateway cut — so the
 * POST returns immediately and the render continues in-process; the
 * client polls the GET (each poll is a few milliseconds).
 */

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const SIZES = new Set(["1024x1024", "768x1344", "864x1152", "1344x768", "1152x864", "1536x768", "768x1536"]);

export async function POST(req: Request) {
  try {
    const { prompt, size } = (await req.json()) as { prompt?: string; size?: string };

    const clean = typeof prompt === "string" ? prompt.trim().slice(0, 1200) : "";
    if (!clean) {
      return NextResponse.json({ error: "Describe the image you want first." }, { status: 400 });
    }
    const picked = typeof size === "string" && SIZES.has(size) ? size : "1024x1024";

    const job = createJob("image");

    /* fire-and-forget: the render runs while the client polls */
    void (async () => {
      try {
        const zai = await ZAI.create();
        const res = await zai.images.generations.create({ prompt: clean, size: picked as "1024x1024" });
        const base64 = res.data?.[0]?.base64;
        if (!base64) throw new Error("The model returned no image.");
        finishJob(job.id, { image: `data:image/png;base64,${base64}`, size: picked });
      } catch (err) {
        console.error("[ai/image] job error:", err);
        failJob(job.id, err instanceof Error ? err.message : "Image generation failed.");
      }
    })();

    return NextResponse.json({ jobId: job.id }, { status: 202 });
  } catch (error) {
    console.error("[ai/image] error:", error);
    return NextResponse.json({ error: "Could not start the image job." }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const jobId = new URL(req.url).searchParams.get("jobId");
  if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 });
  const job = getJob(jobId);
  if (!job) return NextResponse.json({ status: "error", error: "Unknown or expired job." });
  return NextResponse.json(jobView(job));
}
