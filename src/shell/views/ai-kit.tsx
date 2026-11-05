"use client";

/**
 * ai-kit — the AI Studio's shared plumbing.
 *
 * Every path (8 skills × 2 integration designs = 16) draws on the same
 * small toolbox: gateway-safe JSON, the streaming agent client, the job
 * poller for image/video, a sequential TTS audio player, file→base64, a
 * browser recorder, and a handful of presentational atoms that keep the
 * sixteen forms visually one family.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, BadgeCheck, Brain, Database, Loader2, Palette, PenLine, RotateCcw, Route, Send, Sparkles, Square } from "lucide-react";

/* ── gateway-safe fetch ───────────────────────────────────────────
 * The sandbox gateway answers overlong or failing requests with an HTML
 * error page (often a bare 502); res.json() then explodes with
 * "Unexpected token '<'". This wrapper detects that case precisely and
 * converts it into a friendly, retryable Error. */

const GATEWAY_CUT =
  "The network cut the request (the gateway's error page came back instead of data). This is usually transient — retrying in a moment normally works.";

export function gatewayMessage(res: Response, raw: string): string | null {
  const looksHtml = /^\s*[[{]/.test(raw) === false && /<\/?(html|body|head|center|h1|p)\b/i.test(raw);
  if (res.status === 502 || res.status === 504 || looksHtml) {
    return res.status === 504
      ? `${GATEWAY_CUT} (504 — the request ran too long for one hop.)`
      : `${GATEWAY_CUT} (${res.status === 0 ? "network" : res.status})`;
  }
  return null;
}

export async function safeJson<T = Record<string, unknown>>(res: Response): Promise<T> {
  const raw = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    const gw = gatewayMessage(res, raw);
    throw new Error(gw ?? "The response could not be read as data — please try again.");
  }
  return data as T;
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** One POST with up to 3 attempts — the gateway's 502/504s and HTML error
 *  pages are transient, so an exponential backoff (0.8s → 1.8s → 3.5s)
 *  absorbs nearly all of them without the user ever seeing an error. */
export async function postJson<T = Record<string, unknown>>(url: string, body: unknown): Promise<T> {
  const attempts = 3;
  let lastError: Error | null = null;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 502 || res.status === 504 || res.status === 429) {
        lastError = new Error(GATEWAY_CUT);
        if (i < attempts - 1) {
          await sleep(800 * Math.pow(2.2, i));
          continue;
        }
        throw lastError;
      }
      return await safeJson<T>(res);
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(GATEWAY_CUT);
      const retryable = e instanceof Error && (e.message.includes("network") || e.message.includes("gateway") || e.message.includes("cut"));
      if (i < attempts - 1 && retryable) {
        await sleep(800 * Math.pow(2.2, i));
        continue;
      }
      throw lastError;
    }
  }
  throw lastError ?? new Error(GATEWAY_CUT);
}

/* ── the streaming agent client ───────────────────────────────────
 * POST /api/ai/agent returns NDJSON: one {"type":...} object per line.
 * Each loop step arrives the moment it happens (that's the "watch the
 * code being built" view), heartbeats keep the pipe warm, and the final
 * result line resolves the promise. Transient gateway hiccups on the
 * initial hop are retried with backoff before the caller sees anything. */

export interface AgentStreamStep {
  id: string;
  label: string;
  detail: string;
  ms: number;
}

export async function streamAgent<T = Record<string, unknown>>(
  onEvent: (event: { type: "step" | "ping" | "result" | "error"; step?: AgentStreamStep; error?: string; result?: T }) => void,
  payload: unknown,
  url = "/api/ai/agent",
): Promise<T> {
  const attempts = 3;
  let lastError: Error | null = null;

  for (let i = 0; i < attempts; i++) {
    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/x-ndjson" },
        body: JSON.stringify(payload),
      });
    } catch {
      lastError = new Error(GATEWAY_CUT);
      if (i < attempts - 1) {
        onEvent({ type: "error", error: "connection hiccup — retrying…" });
        await sleep(800 * Math.pow(2.2, i));
        continue;
      }
      throw lastError;
    }

    if (res.status === 502 || res.status === 504 || res.status === 429) {
      lastError = new Error(GATEWAY_CUT);
      if (i < attempts - 1) {
        onEvent({ type: "error", error: `gateway ${res.status} — retrying (attempt ${i + 2} of 3)…` });
        await sleep(800 * Math.pow(2.2, i));
        continue;
      }
      throw lastError;
    }

    if (!res.body) {
      /* a proxy refused streaming — fall back to the plain JSON shape */
      const data = await safeJson<T>(res);
      onEvent({ type: "result", result: data });
      return data;
    }

    /* read the NDJSON stream line by line */
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let finalResult: T | null = null;

    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const evt = JSON.parse(trimmed) as { type: string; step?: AgentStreamStep; error?: string } & Record<string, unknown>;
            if (evt.type === "result") {
              finalResult = evt as unknown as T;
              onEvent({ type: "result", result: finalResult });
            } else if (evt.type === "step" && evt.step) {
              onEvent({ type: "step", step: evt.step });
            } else if (evt.type === "error") {
              onEvent({ type: "error", error: evt.error ?? "the engine hit an error" });
            } else if (evt.type === "ping") {
              onEvent({ type: "ping" });
            }
          } catch {
            /* a torn line — the next chunk completes it */
          }
        }
      }
    } catch {
      /* the stream tore mid-flight (navigation, network blip) */
      if (finalResult) return finalResult;
      lastError = new Error("The stream was interrupted — retry, the engine keeps nothing half-built.");
      if (i < attempts - 1) {
        await sleep(800 * Math.pow(2.2, i));
        continue;
      }
      throw lastError;
    }

    if (finalResult) return finalResult;
    /* stream ended without a result line — one more attempt */
    lastError = new Error(GATEWAY_CUT);
    if (i < attempts - 1) {
      await sleep(800 * Math.pow(2.2, i));
      continue;
    }
    throw lastError;
  }
  throw lastError ?? new Error(GATEWAY_CUT);
}

/* ── the job poller — image (30–90s) and video (minutes) ────────── */

export interface PollState {
  status: "idle" | "running" | "done" | "error";
  stage?: string;
  result?: { image?: string; video?: string; size?: string };
  error?: string;
  elapsed: number;
}

export interface JobView {
  jobId: string;
  status: "pending" | "done" | "error";
  stage?: string;
  result?: { image?: string; video?: string; size?: string };
  error?: string;
  elapsedMs: number;
}

export function pollJob(
  kind: "image" | "video",
  jobId: string,
  onUpdate: (s: PollState) => void,
  signal?: { cancelled: boolean },
): Promise<void> {
  const started = Date.now();
  const budget = kind === "video" ? 11 * 60 * 1000 : 200 * 1000;
  const interval = kind === "video" ? 4000 : 2500;

  return new Promise((resolve) => {
    let misses = 0;
    const tick = async () => {
      if (signal?.cancelled) {
        onUpdate({ status: "error", error: "Cancelled.", elapsed: Date.now() - started });
        resolve();
        return;
      }
      if (Date.now() - started > budget) {
        onUpdate({ status: "error", error: "This render is taking unusually long — please try again.", elapsed: Date.now() - started });
        resolve();
        return;
      }
      try {
        const res = await fetch(`/api/ai/${kind}?jobId=${encodeURIComponent(jobId)}`, { cache: "no-store" });
        const job = await safeJson<JobView>(res);
        misses = 0;
        if (job.status === "done") {
          onUpdate({ status: "done", stage: job.stage, result: job.result, elapsed: Date.now() - started });
          resolve();
          return;
        }
        if (job.status === "error") {
          onUpdate({ status: "error", error: job.error ?? "The render failed.", elapsed: Date.now() - started });
          resolve();
          return;
        }
        onUpdate({ status: "running", stage: job.stage, elapsed: Date.now() - started });
      } catch {
        misses += 1;
        if (misses >= 6) {
          onUpdate({ status: "error", error: "Lost contact with the render job — please try again.", elapsed: Date.now() - started });
          resolve();
          return;
        }
        onUpdate({ status: "running", stage: "reconnecting", elapsed: Date.now() - started });
      }
      window.setTimeout(tick, interval);
    };
    void tick();
  });
}

/* ── file → base64 (VLM + ASR uploads) ──────────────────────────── */

export function fileToBase64(file: File): Promise<{ base64: string; mime: string; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.onload = () => {
      const dataUrl = String(reader.result ?? "");
      const comma = dataUrl.indexOf(",");
      resolve({
        dataUrl,
        base64: comma === -1 ? dataUrl : dataUrl.slice(comma + 1),
        mime: file.type || "application/octet-stream",
      });
    };
    reader.readAsDataURL(file);
  });
}

/* ── sequential TTS playback ─────────────────────────────────────── */

export function useSequentialAudio() {
  const [playing, setPlaying] = useState(false);
  const [part, setPart] = useState(0);
  const [total, setTotal] = useState(0);
  const ref = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (ref.current) {
      ref.current.pause();
      ref.current.src = "";
      ref.current = null;
    }
    setPlaying(false);
    setPart(0);
  }, []);

  const play = useCallback(
    (parts: string[]) => {
      stop();
      if (!parts.length) return;
      setTotal(parts.length);
      setPlaying(true);
      let idx = 0;
      const next = () => {
        if (idx >= parts.length) {
          setPlaying(false);
          setPart(0);
          return;
        }
        setPart(idx + 1);
        const audio = new Audio(parts[idx]);
        ref.current = audio;
        audio.onended = () => {
          idx += 1;
          next();
        };
        audio.onerror = () => {
          setPlaying(false);
          setPart(0);
        };
        void audio.play().catch(() => {
          setPlaying(false);
          setPart(0);
        });
      };
      next();
    },
    [stop],
  );

  useEffect(() => () => stop(), [stop]);

  return { playing, part, total, play, stop };
}

/* ── browser recorder (ASR path A) ───────────────────────────────── */

export interface RecorderState {
  recording: boolean;
  seconds: number;
  error: string | null;
  start: () => Promise<void>;
  stop: () => Promise<Blob | null>;
}

export function useRecorder(): RecorderState {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const start = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.start();
      recRef.current = rec;
      setRecording(true);
      setSeconds(0);
      timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setError("Microphone access was denied — check the browser permission, or use the upload path instead.");
    }
  }, []);

  const stop = useCallback(() => {
    const rec = recRef.current;
    if (!rec) return Promise.resolve(null);
    return new Promise<Blob | null>((resolve) => {
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        recRef.current = null;
        setRecording(false);
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
        resolve(blob.size > 0 ? blob : null);
      };
      rec.stop();
    });
  }, []);

  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (timerRef.current) window.clearInterval(timerRef.current);
    },
    [],
  );

  return { recording, seconds, error, start, stop };
}

/* ── presentational atoms ────────────────────────────────────────── */

export function Busy({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" aria-hidden />
      {label}
    </div>
  );
}

/* ── the Growth OS Engine's live loop indicator ────────────────────
 * Shown while the engine runs (planner → parallel sub-agents →
 * verification → memory). The stages cycle so the analysis is VISIBLE
 * while it happens, not claimed after the fact. Shared by the Agent
 * chat and the Builder's "Generate my website" flow. */

export const ENGINE_STAGES = [
  "loading context — memory + build state",
  "planning — classifying the task",
  "sub-agents — designer ∥ copywriter, in parallel",
  "verifying — registry checks, ground truth",
  "writing memory — learning your business",
  "composing the response",
];

export function EngineThinking() {
  const [stage, setStage] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const a = window.setInterval(() => setStage((s) => (s + 1) % ENGINE_STAGES.length), 1300);
    const b = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => {
      window.clearInterval(a);
      window.clearInterval(b);
    };
  }, []);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-muted-foreground shadow-sm">
        <Sparkles className="size-3.5 animate-pulse text-primary" aria-hidden />
        <span className="tabular-nums">{ENGINE_STAGES[stage]}…</span>
        <span className="ml-auto font-mono text-[10px] tabular-nums text-muted-foreground/70">{elapsed}s</span>
      </div>
      <div className="flex items-center gap-1.5 pl-2" aria-hidden>
        {ENGINE_STAGES.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${i === stage ? "w-6 bg-primary" : i < stage ? "w-3 bg-primary/50" : "w-3 bg-border"}`}
          />
        ))}
      </div>
    </div>
  );
}

export function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive" role="alert">
      <AlertTriangle className="mt-0.5 size-4 flex-none" aria-hidden />
      <span className="min-w-0 break-words">{children}</span>
    </div>
  );
}

/** An error note WITH a retry button — no dead ends anywhere in the OS. */
export function ErrorRetry({ children, onRetry, busy }: { children: React.ReactNode; onRetry: () => void; busy?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive" role="alert">
      <AlertTriangle className="size-4 flex-none" aria-hidden />
      <span className="min-w-0 flex-1 break-words">{children}</span>
      <button
        type="button"
        onClick={onRetry}
        disabled={busy}
        className="inline-flex h-8 flex-none items-center gap-1.5 rounded-md border border-destructive/50 bg-card px-3 text-xs font-semibold text-destructive transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <RotateCcw className="size-3.5" aria-hidden />}
        Retry
      </button>
    </div>
  );
}

/* ── the live build log — the engine at work, in a browser window ──
 * While the agent loop streams its steps, this panel shows the build
 * HAPPENING: a mini browser chrome ("your site is being built"), each
 * loop step landing live with its wall-clock time, a progress bar and
 * a running timer. Shared by the Agent chat and the Builder's Generate
 * flow — one engine, one visual grammar. */

const STEP_ICONS: Record<string, typeof Sparkles> = {
  context: Database,
  plan: Route,
  designer: Palette,
  copywriter: PenLine,
  verify: BadgeCheck,
  memory: Brain,
  respond: Send,
  answer: PenLine,
  error: Square,
};

/** rough step weights for the progress bar — the loop's honest shape */
const STEP_WEIGHT: Record<string, number> = { context: 10, plan: 25, designer: 45, copywriter: 60, verify: 75, memory: 88, respond: 100, answer: 100 };

export function BuildProgress({
  steps,
  error,
  siteName,
  notice,
}: {
  steps: AgentStreamStep[];
  error?: string | null;
  siteName?: string | null;
  notice?: string | null;
}) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(t);
  }, []);

  const done = steps.length
    ? Math.max(...steps.map((s) => STEP_WEIGHT[s.id] ?? Math.round(((steps.indexOf(s) + 1) / Math.max(steps.length, 4)) * 100)))
    : 4;
  const pct = error ? 100 : Math.min(done, 96);
  const domain = (siteName ?? "your-site").toLowerCase().replace(/[^a-z0-9]+/g, "") || "your-site";

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* the mini browser chrome — the build target */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-3.5 py-2.5">
        <span className="size-2.5 rounded-full bg-red-400/70" aria-hidden />
        <span className="size-2.5 rounded-full bg-amber-400/70" aria-hidden />
        <span className="size-2.5 rounded-full bg-green-500/70" aria-hidden />
        <span className="ml-1.5 min-w-0 flex-1 truncate font-mono text-[11px] text-muted-foreground">
          {error ? `${domain}.com — build interrupted` : `${domain}.com — building live…`}
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] tabular-nums text-muted-foreground">
          {error ? null : <Loader2 className="size-3 animate-spin" aria-hidden />}
          {elapsed}s
        </span>
      </div>

      {/* the progress rail */}
      <div className="h-1 w-full bg-border" aria-hidden>
        <div
          className={`h-full transition-all duration-700 ease-out ${error ? "bg-destructive" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* the steps, landing live */}
      <div className="max-h-56 space-y-0 overflow-y-auto px-3.5 py-3">
        {steps.length === 0 && !error && (
          <p className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
            <Sparkles className="size-3.5 animate-pulse text-primary" aria-hidden />
            waking the engine — loading context and memory…
          </p>
        )}
        {steps.map((s, i) => {
          const Icon = STEP_ICONS[s.id] ?? Route;
          return (
            <motionStep key={`${s.id}-${i}`} index={i}>
              <span className="z-10 grid size-7 shrink-0 place-items-center rounded-full border border-border bg-background text-primary">
                <Icon className="size-3.5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="flex flex-wrap items-baseline gap-x-2 text-[12.5px] font-medium leading-snug">
                  {s.label}
                  <span className="font-mono text-[10px] text-muted-foreground">{s.ms}ms</span>
                </p>
                <p className="mt-0.5 break-words text-[11.5px] leading-snug text-muted-foreground">{s.detail}</p>
              </div>
            </motionStep>
          );
        })}
        {notice && !error && (
          <p className="flex items-start gap-2 border-t border-border pt-2.5 text-[11.5px] leading-snug text-muted-foreground">
            <Loader2 className="mt-0.5 size-3.5 flex-none animate-spin text-primary" aria-hidden />
            {notice}
          </p>
        )}
        {error && (
          <p className="flex items-start gap-2 text-[12.5px] font-medium text-destructive">
            <AlertTriangle className="mt-0.5 size-3.5 flex-none" aria-hidden />
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

/** a step row — the connector line runs between rows */
function motionStep({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex items-start gap-2.5 pb-3 last:pb-0">
      <span className="absolute left-[13px] top-7 h-[calc(100%-10px)] w-px bg-border" aria-hidden />
      {children}
    </div>
  );
}

/**
 * A labelled form block.
 *
 * NOTE: deliberately NOT a <label> wrapper. Browsers forward clicks on a
 * label to its first labelable descendant — so a toggle button inside a
 * label fires its onClick TWICE (the user's click + the forwarded one),
 * which nets out to "the selection never changes". The render-speed
 * toggle shipped with exactly that bug. Every control inside a Field
 * already carries its own aria-label, so association is preserved.
 */
export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        {hint ? <span className="text-[11px] text-muted-foreground/80">{hint}</span> : null}
      </span>
      {children}
    </div>
  );
}

export const inputCx =
  "w-full min-w-0 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/25 placeholder:text-muted-foreground/60";

export const btnPrimaryCx =
  "inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

export const btnGhostCx =
  "inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3.5 text-sm font-medium text-foreground transition hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50";

export function Wire({ route, note }: { route: string; note: string }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border pt-3 font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground/70">
      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-primary">{route}</span>
      <span className="normal-case tracking-normal">{note}</span>
    </p>
  );
}
