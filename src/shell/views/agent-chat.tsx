"use client";

/**
 * agent-chat — the unified agent: one conversation, every skill, and the
 * Growth OS Engine fully VISIBLE.
 *
 * This is the "just ask" door of the system. The engine on
 * POST /api/ai/agent runs the whole loop — context → planner → parallel
 * sub-agents → verification → memory → response — and this component
 * renders the evidence:
 *
 *   · the ENGINE TRACE under every reply: each loop step, its detail
 *     and its wall-clock time, staggered in — the analysis is shown,
 *     never claimed
 *   · the MEMORY notes: what the engine remembered about the client
 *   · site actions AUTO-STAGE — no clicking "stage" twice: the build
 *     lands in the shared Builder store and a LIVE PREVIEW WINDOW
 *     renders the actual site right inside the conversation
 *   · image/video/speak/search/read still run inline against the real
 *     skill routes
 *
 * The chat carries the live build context (staged template, business,
 * city, motion personality) every turn, so "now make a hero image for
 * it" works — whatever "it" is follows the conversation.
 *
 * The conversation AND every action's result live in module-level
 * stores — the same pattern as the Builder — so navigating away and
 * back never loses a word or a render: background jobs keep writing
 * into the result cache even while this view is unmounted.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Brain,
  Check,
  Database,
  Download,
  ExternalLink,
  ImageIcon,
  Monitor,
  Palette,
  PenLine,
  Play,
  Route,
  Search as SearchIcon,
  Send,
  Smartphone,
  Sparkles,
  Square,
  Video,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import { track } from "@/engine/analytics";
import { beginBuild, endBuild, noteBuild, pushStep, setBuildSite } from "@/engine/build-activity";
import { go } from "@/engine/nav";
import { findTemplate, industryOf, type TemplateDef } from "@/engine/registry";
import { voiceLabel } from "@/engine/voices";
import { NATIVE } from "@/engine/genome";
import { SiteFrame } from "../site-frame";
import { applyAgentBuild, type AgentSitePick } from "./builder";
import {
  Busy,
  BuildProgress,
  EngineThinking,
  ErrorNote,
  ErrorRetry,
  btnGhostCx,
  btnPrimaryCx,
  inputCx,
  postJson,
  pollJob,
  streamAgent,
  useSequentialAudio,
  type AgentStreamStep,
  type PollState,
} from "./ai-kit";

/* ── the action model ─────────────────────────────────────────────── */

type AgentAction =
  | ({ rid: string } & AgentSitePick)
  | { rid: string; type: "image"; prompt: string; size: string }
  | { rid: string; type: "video"; prompt: string; quality: string }
  | { rid: string; type: "speak"; text: string; voice: string }
  | { rid: string; type: "search"; query: string }
  | { rid: string; type: "read"; url: string };

/** the shape the route returns — same union, before rids are attached */
type IncomingAction =
  | AgentSitePick
  | { type: "image"; prompt: string; size: string }
  | { type: "video"; prompt: string; quality: string }
  | { type: "speak"; text: string; voice: string }
  | { type: "search"; query: string }
  | { type: "read"; url: string };

/** one step of the engine loop, as reported by the backend */
interface TraceStep {
  id: string;
  label: string;
  detail: string;
  ms: number;
}

/* ── module-level persistence — survives view switches, like the Builder ── */

const HELLO: AgentMsg = {
  role: "assistant",
  text: "I'm the Growth OS agent — one chat with every skill wired in, and the engine's whole loop shown under every reply. Ask me to build a website, generate its art, render a reel, speak the copy, search the web or read any page. What are we making?",
};

/** actions from a previous session: site actions re-stage + re-preview
 *  (they're small and idempotent); render jobs (image/video/speak/
 *  search/read) don't carry their results across reloads, so they come
 *  back as descriptive shells instead of silently re-running. */
interface PersistedAction {
  action: AgentAction;
  restored: boolean;
}

interface AgentMsg {
  role: "user" | "assistant";
  text: string;
  actions?: AgentAction[];
  /** actions that came back from sessionStorage — site actions re-stage,
   *  render jobs show a "ran earlier" shell */
  restoredActions?: PersistedAction[];
  trace?: TraceStep[];
  memory?: string[];
}

/* sessionStorage persistence — the CONVERSATION survives reloads, the
 * same contract the Builder's build state already has. Messages, traces
 * and memory notes persist verbatim; site actions persist fully (they
 * re-stage on restore); render jobs persist as descriptors only. */
const CHAT_KEY = "gos:agent-chat";

function persistMessages(msgs: AgentMsg[]) {
  if (typeof window === "undefined" || typeof sessionStorage === "undefined") return;
  try {
    const light = msgs.map((m) => ({
      role: m.role,
      text: m.text.slice(0, 4000),
      /* site actions re-stage on restore (small, idempotent); render
         jobs come back as descriptors — never silently re-run */
      actions: m.actions?.filter((a) => a.type === "site"),
      restoredActions: m.actions
        ?.filter((a) => a.type !== "site")
        .map((a) => ({ action: a, restored: true })),
      trace: m.trace?.slice(0, 10),
      memory: m.memory?.slice(0, 8),
    }));
    sessionStorage.setItem(CHAT_KEY, JSON.stringify(light));
  } catch {
    /* quota or storage blocked — the in-memory conversation still works */
  }
}

function loadPersisted(): AgentMsg[] {
  if (typeof window === "undefined" || typeof sessionStorage === "undefined") return [HELLO];
  try {
    const raw = sessionStorage.getItem(CHAT_KEY);
    if (!raw) return [HELLO];
    const parsed = JSON.parse(raw) as AgentMsg[];
    if (!Array.isArray(parsed) || parsed.length === 0) return [HELLO];
    return parsed;
  } catch {
    return [HELLO];
  }
}

let savedMessages: AgentMsg[] = loadPersisted();

type Phase = "running" | "done" | "error";

interface ActionResult {
  phase: Phase;
  stage?: string;
  elapsed?: number;
  image?: string;
  video?: string;
  parts?: string[];
  hits?: { url: string; name: string; snippet: string }[];
  text?: string;
  title?: string;
  error?: string;
}

/** results by action rid — background jobs write here even while the
 *  chat is unmounted, so nothing is ever lost to navigation */
const RESULTS = new Map<string, ActionResult>();
/** the currently-mounted writer target per rid — remounts re-register,
 *  so a still-running job updates whichever view is on screen */
const LIVE = new Map<string, (r: ActionResult) => void>();
/** dev StrictMode runs effects twice — actions must launch exactly once */
const EXECUTED = new Set<string>();
/** site actions auto-staged exactly once per rid */
const STAGED = new Set<string>();

const rid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `r-${Date.now()}-${Math.random()}`;

/* ══ the engine trace — the analysis, made visible ═══════════════════ */

const TRACE_ICONS: Record<string, LucideIcon> = {
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

function EngineTrace({ trace, memory }: { trace?: TraceStep[]; memory?: string[] }) {
  const [open, setOpen] = useState(true);
  if (!trace?.length && !memory?.length) return null;
  const total = trace?.reduce((a, t) => a + t.ms, 0) ?? 0;
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <button
        type="button"
        className="flex w-full items-center gap-2.5 border-b border-border bg-muted/30 px-3.5 py-2.5 text-left"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Route className="size-3.5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-semibold leading-tight">Engine trace — the loop that produced this reply</p>
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
            {trace?.length ?? 0} steps · ~{(total / 1000).toFixed(1)}s of engine work · context → plan → sub-agents → verify → memory
          </p>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{open ? "hide" : "show"}</span>
      </button>
      {open && (
        <ol className="space-y-0 px-3.5 py-3">
          {trace?.map((t, i) => {
            const Icon = TRACE_ICONS[t.id] ?? Route;
            return (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.14, 1.2), duration: 0.25 }}
                className="relative flex items-start gap-2.5 pb-3 last:pb-0"
              >
                {i < (trace.length ?? 0) - 1 && <span className="absolute left-[13px] top-7 h-[calc(100%-16px)] w-px bg-border" aria-hidden />}
                <span className="z-10 grid size-7 shrink-0 place-items-center rounded-full border border-border bg-background text-primary">
                  <Icon className="size-3.5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="flex flex-wrap items-baseline gap-x-2 text-[12.5px] font-medium leading-snug">
                    {t.label}
                    <span className="font-mono text-[10px] text-muted-foreground">{t.ms}ms</span>
                  </p>
                  <p className="mt-0.5 break-words text-[11.5px] leading-snug text-muted-foreground">{t.detail}</p>
                </div>
              </motion.li>
            );
          })}
          {memory && memory.length > 0 && (
            <li className="mt-1 flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
              <Brain className="size-3.5 text-primary" aria-hidden />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">remembered:</span>
              {memory.map((m) => (
                <span key={m} className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary">
                  {m}
                </span>
              ))}
            </li>
          )}
        </ol>
      )}
    </div>
  );
}

/** the animated engine-loop indicator now lives in ai-kit — shared with
 *  the Builder's Generate flow (same loop, same stages, one engine) */

/* ══ the action runners — each launches once, results cached forever ══ */

function ActionShell({
  icon: Icon,
  title,
  note,
  children,
}: {
  icon: typeof ImageIcon;
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-start gap-2.5 border-b border-border bg-muted/30 px-3.5 py-2.5">
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-3.5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-[12.5px] font-semibold leading-tight">{title}</p>
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">{note}</p>
        </div>
      </div>
      <div className="p-3.5">{children}</div>
    </div>
  );
}

/** run-once launcher with cached results: writes to RESULTS always and
 *  to whichever component instance is currently mounted for the rid —
 *  so a render started before navigation keeps updating the view that
 *  remounts after it. Returns a retry() that clears the cache and
 *  re-runs the job — no dead ends in the runner cards. */
function useLaunched(ridv: string, run: (write: (r: ActionResult) => void) => Promise<void>): { state: ActionResult; retry: () => void } {
  const [state, setState] = useState<ActionResult>(() => RESULTS.get(ridv) ?? { phase: "running" });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    /* this instance is now the live writer target for the rid */
    LIVE.set(ridv, setState);
    if (!EXECUTED.has(ridv)) {
      EXECUTED.add(ridv);
      void run((r) => {
        RESULTS.set(ridv, r);
        LIVE.get(ridv)?.(r);
      });
    } else {
      /* remount of a running/finished action — push the latest cached
         value through the subscription path (async, never a sync
         setState in the effect body); identical refs bail out in React,
         and later updates flow through LIVE as the job keeps writing */
      const cached = RESULTS.get(ridv);
      if (cached) queueMicrotask(() => LIVE.get(ridv)?.(cached));
    }
    return () => {
      if (LIVE.get(ridv) === setState) LIVE.delete(ridv);
    };
  }, [ridv, run, nonce]);

  const retry = useCallback(() => {
    EXECUTED.delete(ridv);
    RESULTS.delete(ridv);
    setState({ phase: "running" });
    setNonce((n) => n + 1);
  }, [ridv]);

  return { state, retry };
}

/* ── the live preview window — any system-built site, right in the chat ── */

function SitePreviewWindow({
  tpl,
  business,
  copy,
}: {
  tpl: TemplateDef;
  business?: string;
  copy?: { headline?: string; tagline?: string; cta?: string };
}) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* the mini browser chrome */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-3.5 py-2.5">
        <span className="size-2.5 rounded-full bg-red-400/70" aria-hidden />
        <span className="size-2.5 rounded-full bg-amber-400/70" aria-hidden />
        <span className="size-2.5 rounded-full bg-green-500/70" aria-hidden />
        <span className="ml-1.5 min-w-0 flex-1 truncate font-mono text-[11px] text-muted-foreground">
          {(business || tpl.name).toLowerCase().replace(/[^a-z0-9]+/g, "")}.com — live preview, built by the engine
        </span>
        <div className="flex items-center gap-1" role="radiogroup" aria-label="Preview size">
          {([["desktop", Monitor], ["mobile", Smartphone]] as const).map(([id, Icon]) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={device === id}
              aria-label={id}
              onClick={() => setDevice(id)}
              className={`grid size-7 place-items-center rounded-md border transition-colors ${
                device === id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted/60"
              }`}
            >
              <Icon className="size-3.5" aria-hidden />
            </button>
          ))}
        </div>
      </div>

      {/* the client's launch copy — written by the copywriter sub-agent,
          applied in the Builder's content step; shown here so the user sees
          THEIR business on the design, not just the demo brand */}
      {copy && (copy.headline || copy.tagline) && (
        <div className="border-b border-border bg-primary/5 px-3.5 py-2.5">
          <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[13px] leading-snug">
            <span className="rounded bg-primary/15 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-primary">
              your launch copy
            </span>
            {copy.headline && <span className="font-semibold">{copy.headline}</span>}
            {copy.cta ? (
              <span className="rounded-md border border-primary/40 px-2 py-0.5 text-[11px] font-semibold text-primary">{copy.cta}</span>
            ) : null}
          </p>
          {copy.tagline && <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">{copy.tagline}</p>}
          <p className="mt-1.5 text-[10.5px] leading-snug text-muted-foreground/80">
            The design below ships with its demo content — this copy of yours is applied on top in the Builder&apos;s content step.
          </p>
        </div>
      )}

      {/* the real site — the same renderer as the Builder and the full page view */}
      <div className="max-h-[26rem] overflow-y-auto">
        <SiteFrame
          tpl={tpl}
          genome={NATIVE}
          page="home"
          width={device === "mobile" ? 390 : "100%"}
          style={{ margin: "0 auto" }}
          remountKey={`${tpl.slug}-${device}`}
        />
      </div>
    </div>
  );
}

function SiteRunner({ action }: { action: AgentSitePick & { rid: string } }) {
  const [applied, setApplied] = useState(() => STAGED.has(action.rid));
  const tpl: TemplateDef | null = useMemo(() => findTemplate(action.slug) ?? null, [action.slug]);

  /* AUTO-STAGE: the engine's site action lands in the shared Builder
     store the moment it arrives — no "stage it" click between the
     answer and the preview. Run once per rid, ever. The setState is
     deferred through a microtask so no cascading render fires inside
     the effect body (same pattern as useLaunched below). */
  useEffect(() => {
    if (!STAGED.has(action.rid)) {
      STAGED.add(action.rid);
      applyAgentBuild(action);
      track("agent_site_autostaged", action.slug);
      queueMicrotask(() => setApplied(true));
    }
  }, [action]);

  if (!tpl) return <ErrorNote>That template is not in the library.</ErrorNote>;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-primary/25 bg-primary/5 px-3.5 py-3">
        <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-primary">
          <Check className="size-4" aria-hidden /> {applied ? "Staged automatically — it's in the Builder." : "Staging…"}
        </span>
        <span className="min-w-0 flex-1 truncate text-[11.5px] text-muted-foreground">
          {industryOf(tpl.industry).label} · {tpl.kind} · {action.city || tpl.city}
          {action.motion ? ` · motion: ${action.motion}` : ""}
        </span>
        <button type="button" className={btnGhostCx} onClick={() => go("/build/design")}>
          Open in Builder <ArrowRight className="size-3.5" aria-hidden />
        </button>
      </div>

      {(action.headline || action.tagline) && (
        <p className="sr-only">Launch copy: {action.headline} — {action.tagline}</p>
      )}

      {/* THE preview window — the system's build, live, immediately */}
      <SitePreviewWindow
        tpl={tpl}
        business={action.name}
        copy={{ headline: action.headline, tagline: action.tagline, cta: action.cta }}
      />
    </div>
  );
}

function ImageRunner({ action }: { action: { rid: string; prompt: string; size: string } }) {
  const { state, retry } = useLaunched(action.rid, async (write) => {
    write({ phase: "running", stage: "queued" });
    try {
      const { jobId } = await postJson<{ jobId: string }>("/api/ai/image", { prompt: action.prompt, size: action.size });
      await pollJob("image", jobId, (s: PollState) =>
        write(
          s.status === "done"
            ? { phase: "done", image: s.result?.image }
            : s.status === "error"
              ? { phase: "error", error: s.error ?? "The image render failed." }
              : { phase: "running", stage: s.stage, elapsed: s.elapsed },
        ),
      );
    } catch (e) {
      write({ phase: "error", error: e instanceof Error ? e.message : "The image render failed." });
    }
  });

  return (
    <ActionShell icon={ImageIcon} title="Image generation" note={action.prompt}>
      {state.phase === "running" && <Busy label={`Rendering as a background job — usually 30–90 seconds (${Math.round((state.elapsed ?? 0) / 1000)}s so far).`} />}
      {state.phase === "error" && <ErrorRetry onRetry={retry}>{state.error}</ErrorRetry>}
      {state.phase === "done" && state.image && (
        <div>
          <img src={state.image} alt="AI-generated art from the agent" className="max-h-72 w-full rounded-lg object-contain shadow" />
          <a href={state.image} download="agent-image.png" className={`${btnGhostCx} mt-3`}>
            <Download className="size-3.5" aria-hidden /> Download
          </a>
        </div>
      )}
    </ActionShell>
  );
}

function VideoRunner({ action }: { action: { rid: string; prompt: string; quality: string } }) {
  const { state, retry } = useLaunched(action.rid, async (write) => {
    write({ phase: "running", stage: "queued" });
    try {
      const { jobId } = await postJson<{ jobId: string }>("/api/ai/video", { prompt: action.prompt, quality: action.quality });
      await pollJob("video", jobId, (s: PollState) =>
        write(
          s.status === "done"
            ? { phase: "done", video: s.result?.video }
            : s.status === "error"
              ? { phase: "error", error: s.error ?? "The video render failed." }
              : { phase: "running", stage: s.stage, elapsed: s.elapsed },
        ),
      );
    } catch (e) {
      write({ phase: "error", error: e instanceof Error ? e.message : "The video render failed." });
    }
  });

  return (
    <ActionShell icon={Video} title="Video render" note={action.prompt}>
      {state.phase === "running" && (
        <Busy label={`Background render (${state.stage ?? "queued"}) — video takes 2–8 minutes. Keep chatting; it lands here. ${Math.round((state.elapsed ?? 0) / 1000)}s so far.`} />
      )}
      {state.phase === "error" && <ErrorRetry onRetry={retry}>{state.error}</ErrorRetry>}
      {state.phase === "done" && state.video && (
        <div>
          <video src={state.video} controls playsInline className="max-h-72 w-full rounded-lg shadow" aria-label="AI-generated video from the agent" />
          <a href={state.video} target="_blank" rel="noreferrer" className={`${btnGhostCx} mt-3`}>
            <ExternalLink className="size-3.5" aria-hidden /> Open video
          </a>
        </div>
      )}
    </ActionShell>
  );
}

function SpeakRunner({ action }: { action: { rid: string; text: string; voice: string } }) {
  const { state, retry } = useLaunched(action.rid, async (write) => {
    write({ phase: "running" });
    try {
      const res = await postJson<{ parts?: string[]; error?: string }>("/api/ai/tts", {
        text: action.text,
        voice: action.voice,
        speed: 1,
      });
      if (res.parts?.length) write({ phase: "done", parts: res.parts });
      else write({ phase: "error", error: res.error ?? "No audio came back." });
    } catch (e) {
      write({ phase: "error", error: e instanceof Error ? e.message : "Speech synthesis failed." });
    }
  });
  const player = useSequentialAudio();

  return (
    <ActionShell icon={Volume2} title={`Spoken audio · ${voiceLabel(action.voice)}`} note={action.text}>
      {state.phase === "running" && <Busy label="Synthesizing the voice — a few seconds…" />}
      {state.phase === "error" && <ErrorRetry onRetry={retry}>{state.error}</ErrorRetry>}
      {state.phase === "done" && state.parts && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={btnPrimaryCx}
            onClick={() => (player.playing ? player.stop() : player.play(state.parts!))}
          >
            {player.playing ? (
              <>
                <Square className="size-3.5" aria-hidden /> Stop ({player.part}/{player.total})
              </>
            ) : (
              <>
                <Play className="size-3.5" aria-hidden /> Play
              </>
            )}
          </button>
          <a href={state.parts[0]} download="agent-voice.wav" className={btnGhostCx}>
            <Download className="size-3.5" aria-hidden /> Download
          </a>
        </div>
      )}
    </ActionShell>
  );
}

function SearchRunner({ action }: { action: { rid: string; query: string } }) {
  const { state, retry } = useLaunched(action.rid, async (write) => {
    write({ phase: "running" });
    try {
      const res = await postJson<{ results?: { url: string; name: string; snippet: string; host_name: string }[] }>("/api/ai/search", {
        query: action.query,
        num: 5,
      });
      if (!res.results?.length) write({ phase: "error", error: "Nothing came back for that query." });
      else write({ phase: "done", hits: res.results });
    } catch (e) {
      write({ phase: "error", error: e instanceof Error ? e.message : "The search failed." });
    }
  });

  return (
    <ActionShell icon={SearchIcon} title="Web search" note={action.query}>
      {state.phase === "running" && <Busy label="Searching the live web…" />}
      {state.phase === "error" && <ErrorRetry onRetry={retry}>{state.error}</ErrorRetry>}
      {state.phase === "done" && state.hits && (
        <ol className="max-h-64 space-y-2.5 overflow-y-auto pr-1">
          {state.hits.map((r) => (
            <li key={r.url} className="min-w-0 text-[12.5px] leading-snug">
              <a href={r.url} target="_blank" rel="noreferrer" className="font-semibold text-primary hover:underline">
                {r.name || r.url}
              </a>
              <p className="text-muted-foreground">{r.snippet?.slice(0, 140)}</p>
            </li>
          ))}
        </ol>
      )}
    </ActionShell>
  );
}

function ReadRunner({ action }: { action: { rid: string; url: string } }) {
  const { state, retry } = useLaunched(action.rid, async (write) => {
    write({ phase: "running" });
    try {
      const res = await postJson<{ text?: string; title?: string; error?: string }>("/api/ai/reader", { url: action.url });
      if (!res.text) write({ phase: "error", error: res.error ?? "That page returned no readable content." });
      else write({ phase: "done", text: res.text.slice(0, 2400), title: res.title ?? action.url });
    } catch (e) {
      write({ phase: "error", error: e instanceof Error ? e.message : "The reader failed." });
    }
  });

  return (
    <ActionShell icon={BookOpen} title={`Page read — ${state.title || action.url}`} note={action.url}>
      {state.phase === "running" && <Busy label="Extracting the page's clean text…" />}
      {state.phase === "error" && <ErrorRetry onRetry={retry}>{state.error}</ErrorRetry>}
      {state.phase === "done" && state.text && (
        <div className="max-h-56 overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-border bg-muted/20 p-3 text-[12px] leading-relaxed text-muted-foreground">
          {state.text}
        </div>
      )}
    </ActionShell>
  );
}

function ActionRunner({ action }: { action: AgentAction }) {
  switch (action.type) {
    case "site":
      return <SiteRunner action={action} />;
    case "image":
      return <ImageRunner action={action} />;
    case "video":
      return <VideoRunner action={action} />;
    case "speak":
      return <SpeakRunner action={action} />;
    case "search":
      return <SearchRunner action={action} />;
    case "read":
      return <ReadRunner action={action} />;
    default:
      return null;
  }
}

/** a render job from an earlier session — its result didn't survive the
 *  reload (images are megabytes of base64), so we show what ran instead
 *  of silently firing the job again. */
const RESTORED_ICONS: Record<string, typeof ImageIcon> = {
  image: ImageIcon,
  video: Video,
  speak: Volume2,
  search: SearchIcon,
  read: BookOpen,
};

function RestoredShell({ action }: { action: AgentAction }) {
  const Icon = RESTORED_ICONS[action.type] ?? ImageIcon;
  const note =
    action.type === "image" || action.type === "video"
      ? "prompt"
      : action.type === "speak"
        ? "script"
        : action.type === "search"
          ? "query"
          : "url";
  const detail =
    action.type === "image" || action.type === "video"
      ? action.prompt
      : action.type === "speak"
        ? action.text
        : action.type === "search"
          ? action.query
          : action.type === "read"
            ? action.url
            : "";
  return (
    <ActionShell icon={Icon} title={`${action.type} — ran in an earlier session`} note={`${note}: ${detail}`}>
      <p className="text-[12px] leading-relaxed text-muted-foreground">
        Render results don&apos;t survive a reload — ask again and it re-runs in seconds. The engine&apos;s memory of your
        business is untouched.
      </p>
    </ActionShell>
  );
}

/* ══ the chat itself — module-level messages survive navigation ═════ */

const CHIPS = [
  "Build me a website for a neighbourhood bakery",
  "Build a site for my dog grooming salon, then generate the hero image",
  "What should a plumbing site's homepage say?",
  "Generate a hero image for a Copenhagen restaurant",
];

/** the draft survives tab switches — module scope, like the messages */
let savedDraft = "";

export function AgentChatPath({
  tpl,
  build,
}: {
  tpl: TemplateDef | null;
  build: { slug: string | null; business: string; city: string; personality: string | null; brief: string };
}) {
  const [messages, setMessagesState] = useState<AgentMsg[]>(() => savedMessages);
  const [input, setInput] = useState(() => savedDraft);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** the live engine steps — streamed in as they happen */
  const [liveSteps, setLiveSteps] = useState<AgentStreamStep[]>([]);
  /** transient stream notices ("gateway 502 — retrying…") */
  const [streamNote, setStreamNote] = useState<string | null>(null);
  /** the last failed send — the Retry button re-runs exactly it */
  const [lastFailed, setLastFailed] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const setMessages = (next: AgentMsg[]) => {
    savedMessages = next;
    persistMessages(next);
    setMessagesState(next);
  };

  const setDraft = (v: string) => {
    savedDraft = v;
    setInput(v);
  };

  /* the live context rides every turn — this is what makes follow-ups
     like "now make a hero image for it" just work */
  const context = useMemo(
    () => ({
      template: build.slug ?? tpl?.slug ?? null,
      business: build.business,
      city: build.city,
      personality: build.personality,
      brief: build.brief,
    }),
    [build.slug, build.business, build.city, build.personality, build.brief, tpl?.slug],
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking, liveSteps]);

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || thinking) return;
    setDraft("");
    setError(null);
    setLastFailed(null);
    setLiveSteps([]);
    setStreamNote(null);
    /* the global heartbeat starts too — the Preview Dock (and any view)
       can show this build happening, live */
    beginBuild(text);
    const history: AgentMsg[] = [...savedMessages, { role: "user", text }];
    setMessages(history);
    setThinking(true);
    track("agent_chat_used");
    try {
      /* STREAMED: each engine step lands the moment it happens — the
         build log in the preview panel is live, and the connection
         never sits silent long enough for a gateway to cut it. */
      const res = await streamAgent<{
        say?: string;
        actions?: IncomingAction[];
        trace?: TraceStep[];
        memory?: string[];
        error?: string;
      }>(
        (evt) => {
          if (evt.type === "step" && evt.step) {
            setStreamNote(null);
            setLiveSteps((s) => [...s, evt.step!]);
            pushStep(evt.step);
          } else if (evt.type === "error") {
            setStreamNote(evt.error ?? null);
            noteBuild(evt.error ?? null);
          }
        },
        {
          messages: history.slice(-8).map((m) => ({ role: m.role, content: m.text })),
          context,
        },
      );
      if (res.error) throw new Error(res.error);
      const actions = (res.actions ?? []).map((a) => ({ ...a, rid: rid() }) as AgentAction);
      /* the run succeeded — if it staged a site, the dock previews it
         (site actions carry a `slug`; the render actions carry a `type`) */
      const siteAction = actions.find((a) => "slug" in a) as { slug: string; name?: string } | undefined;
      if (siteAction?.slug) setBuildSite(siteAction.slug, siteAction.name ?? siteAction.slug);
      endBuild({ ok: true });
      setMessages([
        ...history,
        {
          role: "assistant",
          text: res.say ?? "Done.",
          actions,
          trace: Array.isArray(res.trace) ? res.trace.slice(0, 10) : undefined,
          memory: Array.isArray(res.memory) ? res.memory : undefined,
        },
      ]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "The agent is briefly unavailable.";
      endBuild({ ok: false, error: msg });
      setLastFailed(text);
      setError(msg);
    } finally {
      setThinking(false);
      setStreamNote(null);
    }
  };

  return (
    <div className="flex min-h-[34rem] flex-1 flex-col gap-3">
      <div ref={scrollRef} className="min-h-64 flex-1 space-y-4 overflow-y-auto rounded-xl border border-border bg-muted/20 p-4">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "ml-auto max-w-[85%]" : "mr-auto max-w-[92%] space-y-2.5"}>
            <div
              className={
                m.role === "user"
                  ? "rounded-xl rounded-br-sm bg-primary px-3.5 py-2.5 text-sm leading-relaxed text-primary-foreground shadow-sm"
                  : "whitespace-pre-wrap rounded-xl rounded-bl-sm border border-border bg-card px-3.5 py-2.5 text-sm leading-relaxed shadow-sm"
              }
            >
              {m.text}
            </div>
            {m.actions?.map((a) => (
              <ActionRunner key={a.rid} action={a} />
            ))}
            {m.restoredActions?.map((r, i) => (
              <RestoredShell key={`restored-${i}`} action={r.action} />
            ))}
            {(m.trace?.length || m.memory?.length) && <EngineTrace trace={m.trace} memory={m.memory} />}
          </div>
        ))}
        {thinking && (
          <div className="mr-auto w-[92%] space-y-2">
            {/* THE live build log — each engine step lands as it happens,
                in a browser-chrome panel: the code is being BUILT, visibly */}
            <BuildProgress
              steps={liveSteps}
              siteName={build.business || "your-site"}
              notice={streamNote ?? (liveSteps.length >= 2 ? "sub-agents are writing your copy and picking the design — this is the longest step" : null)}
            />
            {liveSteps.length === 0 && !streamNote && <EngineThinking />}
          </div>
        )}
      </div>
      {error && lastFailed && (
        <ErrorRetry busy={thinking} onRetry={() => void send(lastFailed)}>
          {error}
        </ErrorRetry>
      )}
      {error && !lastFailed && <ErrorNote>{error}</ErrorNote>}
      <div className="flex flex-wrap items-center gap-2">
        {messages.length <= 1 ? (
          CHIPS.map((c) => (
            <button key={c} type="button" className={`${btnGhostCx} h-8 px-3 text-xs`} onClick={() => void send(c)}>
              {c}
            </button>
          ))
        ) : (
          <button
            type="button"
            className={`${btnGhostCx} h-8 px-3 text-xs`}
            onClick={() => {
              setMessages([HELLO])
              setError(null)
            }}
          >
            <Square className="size-3" aria-hidden /> New chat
          </button>
        )}
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <input
          className={inputCx}
          value={input}
          onChange={(e) => setDraft(e.target.value)}
          placeholder='Ask for anything — "build a site for my bakery, then make the hero image"'
          aria-label="Message the agent"
        />
        <button type="submit" className={btnPrimaryCx} disabled={thinking || !input.trim()} aria-label="Send message">
          <Send className="size-4" aria-hidden />
        </button>
      </form>
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
        <Sparkles className="size-3.5" aria-hidden />
        one engine, every skill — streamed live: planner → parallel sub-agents → verification → memory · site builds auto-stage with a live preview · the conversation and your draft survive navigation
      </p>
    </div>
  );
}
