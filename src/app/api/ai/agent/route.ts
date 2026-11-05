import { runEngine } from "@/engine/agent-loop";

/**
 * POST /api/ai/agent — the Growth OS Engine, STREAMED.
 *
 * The engine loop (context → planner → parallel sub-agents → deterministic
 * verification → memory → response) can run 30–90s end to end. A single
 * silent long-running request gets cut by the gateway (502) — so this
 * route STREAMS the loop over NDJSON:
 *
 *   {"type":"step","step":{id,label,detail,ms}}   ← each loop step, LIVE
 *   {"type":"ping"}                               ← heartbeat every 8s
 *   {"type":"result",say,actions,trace,memory}    ← the final payload
 *   {"type":"error",error}                        ← never a bare 500
 *
 * Bytes flow continuously, so no proxy between client and route can time
 * the request out — and the client renders the engine at work as it
 * happens (the "watch the code being built" view).
 *
 * Body:
 *   {
 *     messages: { role: "user" | "assistant", content }[],
 *     context?: { template?, business?, city?, personality?, brief? },
 *     hint?:    "site"   // the user pressed "Generate my website"
 *   }
 *
 * Compatibility: send `?stream=0` (or Accept: application/json) to get the
 * original single-shot JSON shape — used by older callers and quick tests.
 */

export const runtime = "nodejs";
export const maxDuration = 120;
export const dynamic = "force-dynamic";

const HEARTBEAT_MS = 8_000;

export async function POST(req: Request) {
  let body: {
    messages?: { role?: string; content?: string }[];
    context?: Record<string, unknown>;
    hint?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return json({ error: "Could not read the request." }, 400);
  }

  const history = (body.messages ?? [])
    .filter((m) => typeof m?.content === "string" && m.content.trim().length > 0)
    .slice(-10)
    .map((m) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: (m.content as string).slice(0, 2500),
    }));

  if (history.length === 0) {
    return json({ error: "No message provided." }, 400);
  }

  const ctx = body.context ?? {};
  const engineInput = {
    messages: history,
    context: {
      template: typeof ctx.template === "string" ? ctx.template : null,
      business: typeof ctx.business === "string" ? ctx.business : undefined,
      city: typeof ctx.city === "string" ? ctx.city : undefined,
      personality: typeof ctx.personality === "string" ? ctx.personality : null,
      brief: typeof ctx.brief === "string" ? ctx.brief : undefined,
    },
    hint: body.hint === "site" ? ("site" as const) : null,
  };

  /* compatibility mode — the original single-shot JSON */
  const wantsPlain =
    new URL(req.url).searchParams.get("stream") === "0" ||
    (req.headers.get("accept") ?? "").includes("application/json");

  if (wantsPlain) {
    try {
      const result = await runEngine(engineInput);
      return json(result);
    } catch (error) {
      console.error("[ai/agent] engine error:", error);
      return json(plainError(error), 200);
    }
  }

  /* the streaming path — NDJSON, one JSON object per line */
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const send = (obj: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`${JSON.stringify(obj)}\n`));
        } catch {
          closed = true; // client went away — keep the loop, drop the pipe
        }
      };

      /* the heartbeat — bytes every 8s even while an LLM call thinks,
         so no intermediary proxy counts the request as idle */
      const beat = setInterval(() => send({ type: "ping" }), HEARTBEAT_MS);

      try {
        const result = await runEngine({
          ...engineInput,
          onStep: (step) => send({ type: "step", step }),
        });
        send({ type: "result", ...result });
      } catch (error) {
        console.error("[ai/agent] engine error:", error);
        send({
          type: "error",
          error: error instanceof Error ? error.message : "The engine loop failed mid-run.",
        });
        send({ type: "result", ...plainError(error) });
      } finally {
        clearInterval(beat);
        closed = true;
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no", // nginx & friends: do not buffer
      Connection: "keep-alive",
    },
  });
}

function plainError(error: unknown) {
  return {
    say: "The engine hit a snag mid-loop — every layer has a fallback, but this one got through. Try again in a moment.",
    actions: [] as unknown[],
    trace: [
      {
        id: "error",
        label: "Engine loop aborted",
        detail: error instanceof Error ? error.message : "unknown error",
        ms: 0,
      },
    ],
    memory: [] as string[],
  };
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
