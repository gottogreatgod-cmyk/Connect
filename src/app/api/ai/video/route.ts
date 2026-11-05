import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { createJob, failJob, finishJob, getJob, jobView, setStage } from "@/lib/ai-jobs";

/**
 * The Video Generation skill — asynchronous JOB pattern with a NESTED
 * server-side poll.
 *
 *   POST /api/ai/video  { prompt, quality?, with_audio?, duration? }
 *                       → 202 { jobId }
 *   GET  /api/ai/video?jobId=<id>
 *                       → { status, video? , error? }
 *
 * The SDK itself is asynchronous: video.generations.create returns a
 * task id immediately, and zai.async.result.query(taskId) reports
 * PROCESSING → SUCCESS/FAIL. Video renders take minutes, so the route
 * job wraps BOTH calls: create → poll the task every 6s (server-side)
 * → resolve with the video URL. The client only ever talks to the
 * route's own GET.
 */

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const TASK_TIMEOUT_MS = 9 * 60 * 1000; // 9 minutes of task polling
const POLL_INTERVAL_MS = 6000;

export async function POST(req: Request) {
  try {
    const { prompt, quality, with_audio, duration } = (await req.json()) as {
      prompt?: string;
      quality?: string;
      with_audio?: boolean;
      duration?: number;
    };

    const clean = typeof prompt === "string" ? prompt.trim().slice(0, 1200) : "";
    if (!clean) {
      return NextResponse.json({ error: "Describe the video you want first." }, { status: 400 });
    }

    const job = createJob("video");

    void (async () => {
      try {
        const zai = await ZAI.create();
        setStage(job.id, "queued");

        const created = await zai.video.generations.create({
          prompt: clean,
          quality: quality === "quality" ? "quality" : "speed",
          with_audio: with_audio !== false,
          watermark_enabled: false,
          ...(typeof duration === "number" && duration > 0 ? { duration: Math.min(10, Math.round(duration)) } : {}),
        });

        const taskId = created?.id;
        if (!taskId) throw new Error("The video service returned no task id.");
        setStage(job.id, "rendering");

        const started = Date.now();
        for (;;) {
          if (Date.now() - started > TASK_TIMEOUT_MS) {
            throw new Error("The render is taking unusually long — try a shorter prompt.");
          }
          await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
          const state = await zai.async.result.query(taskId);
          const status = state?.task_status;
          if (status === "SUCCESS") {
            const url =
              state.video_url ??
              state.url ??
              state.video ??
              state.video_result?.[0]?.url ??
              null;
            if (!url) throw new Error("The render finished but returned no video URL.");
            finishJob(job.id, { video: url });
            return;
          }
          if (status === "FAIL") {
            throw new Error("The video render failed — try rephrasing the prompt.");
          }
          /* PROCESSING — keep polling */
        }
      } catch (err) {
        console.error("[ai/video] job error:", err);
        failJob(job.id, err instanceof Error ? err.message : "Video generation failed.");
      }
    })();

    return NextResponse.json({ jobId: job.id }, { status: 202 });
  } catch (error) {
    console.error("[ai/video] error:", error);
    return NextResponse.json({ error: "Could not start the video job." }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const jobId = new URL(req.url).searchParams.get("jobId");
  if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 });
  const job = getJob(jobId);
  if (!job) return NextResponse.json({ status: "error", error: "Unknown or expired job." });
  return NextResponse.json(jobView(job));
}
