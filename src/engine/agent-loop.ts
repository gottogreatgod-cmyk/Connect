/**
 * The Growth OS Engine — the unified orchestration layer.
 *
 * One agent loop behind every surface (the Agent chat, the Builder's
 * "Generate my website" button, any MCP client). This module IS the
 * "internal layer that makes all the tools one tool":
 *
 *   receive task
 *     → 1 · LOAD CONTEXT   memory (DB) + build state + the skill catalogue
 *     → 2 · PLAN           the planner classifies the task and extracts
 *                          the business facts (one fast LLM call)
 *     → 3 · EXECUTE        sub-agents run IN PARALLEL where their work
 *                          is independent — the Designer picks the
 *                          template + motion while the Copywriter writes
 *                          the launch copy in the persona voice
 *     → 4 · VERIFY         every field re-checked against the REAL
 *                          registries server-side; invalid picks fall
 *                          back to the deterministic scorer, never guessed
 *     → 5 · MEMORY         business facts + decisions written back to
 *                          the AgentMemory table — the engine learns the
 *                          client as it works
 *     → 6 · RESPOND        say + validated actions + the full TRACE
 *                          (every step, with timings) so the analysis is
 *                          visible, not claimed
 *
 * Rules that make it reliable (from the blueprint, enforced here):
 *   · evidence before claims — the trace is the evidence
 *   · parallel independent calls — designer ∥ copywriter
 *   · deterministic verification — registries are ground truth, the
 *     LLM proposes and the engine disposes
 *   · never fail the user — every layer degrades to the one below it:
 *     multi-call loop → single grounded call → deterministic scorer
 */

import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";
import { TEMPLATES, findTemplate, industryOf } from "./registry";
import { PERSONALITIES } from "./motion-craft";
import { askConcierge } from "./concierge";
import { VOICES, VOICE_VALUES } from "./voices";

/* ── the contracts ─────────────────────────────────────────────────── */

/** One step of the engine loop — rendered verbatim in the UI. */
export interface TraceStep {
  id: string;
  label: string;
  detail: string;
  ms: number;
}

export interface SiteAction {
  type: "site";
  slug: string;
  why: string;
  brief: string;
  name: string;
  city: string;
  pitch: string;
  headline: string;
  tagline: string;
  cta: string;
  about: string;
  motion: string;
}
export interface ImageAction { type: "image"; prompt: string; size: string }
export interface VideoAction { type: "video"; prompt: string; quality: string }
export interface SpeakAction { type: "speak"; text: string; voice: string }
export interface SearchAction { type: "search"; query: string }
export interface ReadAction { type: "read"; url: string }
export type EngineAction = SiteAction | ImageAction | VideoAction | SpeakAction | SearchAction | ReadAction;

export interface EngineResult {
  say: string;
  actions: EngineAction[];
  trace: TraceStep[];
  /** human-readable notes about what the engine remembered */
  memory: string[];
}

export interface EngineContext {
  template?: string | null;
  business?: string;
  city?: string;
  personality?: string | null;
  brief?: string;
}

export interface EngineInput {
  messages: { role: "user" | "assistant"; content: string }[];
  context: EngineContext;
  hint?: "site" | null;
  /** STREAMING: fires the moment each loop step completes — the route
   *  forwards it over NDJSON so the client watches the loop live and the
   *  gateway never times out on a silent long-running request. */
  onStep?: (step: TraceStep) => void;
}

/* ── the grounded catalogues, compacted once ───────────────────────── */

const REGISTRY_LINES = TEMPLATES.map(
  (t) => `${t.slug} — ${t.name} · ${industryOf(t.industry).label.toLowerCase()} · ${t.kind.toLowerCase()} · ${t.city} · ${t.positioning}`,
).join("\n");

const PERSONALITY_LINES = Object.values(PERSONALITIES)
  .map((p) => `${p.id} — ${p.label}. Fits: ${p.brands}.`)
  .join("\n");

const IMAGE_SIZES = ["1024x1024", "768x1344", "864x1152", "1344x768", "1152x864", "1536x768", "768x1536"];
const VOICE_LIST = VOICES.map((v) => `${v.value} (${v.character})`).join("; ");
const TEMPLATE_SLUGS = new Set(TEMPLATES.map((t) => t.slug));

/* the copywriter personas — the agency-agents specialist pattern */
const PERSONAS: { id: string; label: string; style: string }[] = [
  { id: "warm", label: "Warm & local", style: "Write in a warm, neighbourly, human voice — plain words, short sentences, like a local business owner talking to a regular." },
  { id: "premium", label: "Premium & minimal", style: "Write in a restrained, premium voice — few words, no exclamation marks, confidence through specificity, never hype." },
  { id: "bold", label: "Bold & playful", style: "Write in a bold, playful, energetic voice — direct address, a little cheeky, but never cringe." },
];

const str = (v: unknown, max: number, fallback = ""): string =>
  typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : fallback;

/* ── step 1 · context (memory) ─────────────────────────────────────── */

interface MemoryBlock {
  lines: string[];
  facts: { scope: string; key: string; body: string }[];
  notes: string[];
}

async function loadMemory(): Promise<MemoryBlock> {
  try {
    const rows = await db.agentMemory.findMany({
      orderBy: { updatedAt: "desc" },
      take: 32,
    });
    return {
      lines: rows.map((r) => `${r.scope}:${r.key} = ${r.body}`),
      facts: rows.map((r) => ({ scope: r.scope, key: r.key, body: r.body })),
      notes: [],
    };
  } catch {
    /* DB unavailable — the engine still works, just amnesic */
    return { lines: [], facts: [], notes: [] };
  }
}

async function writeMemory(writes: { scope: string; key: string; body: string }[]): Promise<string[]> {
  const notes: string[] = [];
  for (const w of writes) {
    if (!w.body) continue;
    try {
      await db.agentMemory.upsert({
        where: { scope_key: { scope: w.scope, key: w.key } },
        create: w,
        update: { body: w.body },
      });
      notes.push(`${w.scope}:${w.key} → ${w.body}`);
    } catch (err) {
      console.error("[engine/memory] write failed:", err instanceof Error ? err.message : err);
      /* memory is best-effort, never fatal */
    }
  }
  return notes;
}

/* ── defensive JSON extraction ─────────────────────────────────────── */

function parseJson(raw: string): Record<string, unknown> | null {
  let text = raw.trim();
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function complete(zai: Awaited<ReturnType<typeof ZAI.create>>, system: string, user: string): Promise<string> {
  /* one quiet retry on 429s — the parallel round fires three calls and
     the API occasionally throttles; a short backoff absorbs it without
     the user ever knowing */
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const completion = await zai.chat.completions.create({
        messages: [
          { role: "assistant", content: system },
          { role: "user", content: user },
        ],
        thinking: { type: "disabled" },
      });
      return completion.choices[0]?.message?.content?.trim() ?? "";
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const throttled = /429|too many requests|rate limit/i.test(msg);
      if (throttled && attempt < 2) {
        await new Promise((r) => setTimeout(r, 1200 * (attempt + 1) ** 2));
        continue;
      }
      throw err;
    }
  }
  return "";
}

/* ── step 2 · the planner ──────────────────────────────────────────── */

interface Plan {
  task: "question" | "build" | "multi";
  wants: ("site" | "image" | "video" | "speak" | "search" | "read")[];
  business: string;
  city: string;
  persona: string;
  /** for question tasks: the answer itself */
  answer?: string;
  /** payloads for the non-site wants, written by the planner in one pass */
  image?: { prompt: string; size: string };
  video?: { prompt: string; quality: string };
  speak?: { text: string; voice: string };
  search?: { query: string };
  read?: { url: string };
}

function plannerSystem(memoryLines: string[], ctx: EngineContext, hint: string | null): string {
  const contextBlock = [
    ctx.template ? `Staged template: ${ctx.template}` : "No template staged yet.",
    ctx.business ? `Business name: ${ctx.business}` : "",
    ctx.city ? `City: ${ctx.city}` : "",
    ctx.personality ? `Motion personality chosen: ${ctx.personality}` : "",
    ctx.brief ? `Current brief: ${ctx.brief}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return `You are the PLANNER of the Growth OS engine — the routing brain of a website-building platform. You classify tasks and extract facts. You are warm, direct and brief.

YOU ALWAYS REPLY WITH A SINGLE RAW JSON OBJECT — no markdown fences, no text outside it:
{"task":"question|build|multi","wants":[...],"business":"","city":"","persona":"warm|premium|bold","answer":"",...}

DECIDE:
- Pure question/advice (no deliverable wanted) → {"task":"question","wants":[],"answer":"<the full answer, grounded on the memory and context, max 130 words>"}
- A website is wanted (build/make/design a site, landing page…) → include "site" in wants.
- Also wanted in the same breath: "image" (generate art), "video" (render a reel), "speak" (text to speech), "search" (live web search), "read" (extract a url).
- Include EVERY want in one reply — the engine runs them all.

WHEN "site" IS IN WANTS, ALSO SET:
- business: the client's business name if they gave one, else invent a fitting, honest one
- city: their city if known, else a fitting city
- persona: the copywriter voice that fits — ${PERSONAS.map((p) => `${p.id} (${p.label})`).join(", ")}

WHEN OTHER WANTS ARE INCLUDED, ALSO WRITE THEIR PAYLOADS:
- image: {"image":{"prompt":"<photographic art direction, subject + place + light + mood, add 'no text' for backgrounds>","size":"1344x768|1024x1024|864x1152|1152x864|1536x768"}}
- video: {"video":{"prompt":"<cinematic direction, 'no text overlays'>","quality":"speed|quality"}}
- speak: {"speak":{"text":"<the script>","voice":"<pick by AGE + GENDER + character that fits the script — e.g. a gentleman script gets jam, a playful kid bit gets chuichui>"}} — the voice ids and who they are: ${VOICE_LIST}
- search: {"search":{"query":"<a focused query>"}}
- read: {"read":{"url":"<the url>"}}

RULES:
- If the user is vague, pick sensible defaults and note them inside "answer" (one line) — never interrogate.
- ${hint === "site" ? 'The user PRESSED "Generate my website" — wants MUST include "site".' : "Never add wants the user did not ask for."}
- The answer field is only used for question tasks; for build/multi leave it as a one-line note of what you chose.

WHAT THE ENGINE ALREADY KNOWS (memory + live build context):
${contextBlock || "(a fresh session — nothing staged yet)"}
${memoryLines.length ? `\nMEMORY (facts learned about this client — USE these, they are current):\n${memoryLines.join("\n")}` : ""}`;
}

/* ── step 3a · the Designer sub-agent ──────────────────────────────── */

function designerSystem(): string {
  return `You are the DESIGNER sub-agent of the Growth OS engine. You pick the ONE template that best fits a brief, and the motion personality that fits the brand.

YOU ALWAYS REPLY WITH A SINGLE RAW JSON OBJECT — no fences, no prose:
{"slug":"<one slug from the registry>","motion":"<corporate|organic|bold|cinematic>","why":"<one line: why this template>","pitch":"<one-line differentiator for THIS business>"}

THE REAL TEMPLATE REGISTRY (pick ONLY from these slugs):
${REGISTRY_LINES}

MOTION PERSONALITIES (pick the one that fits the brand):
${PERSONALITY_LINES}

HOW TO PICK — in priority order:
1. The client's CONVERSION GOAL first (bookings? orders? quotes? visits? listings? portal?) — match it to the template's conversion verb.
2. The business KIND second — the daily-rhythm of the business should feel familiar (a florist with daily stock and walk-ins is closer to a café's "today's bake + hours" than to a fine-dining tasting menu).
3. The template's demo industry LAST — the design gets re-skinned and the demo copy is replaced by the client's own, so a food template can carry a florist perfectly if the conversion goal matches.

CONVERSION FAMILIES — start here, then refine by kind:
- books appointments, classes or sessions (clinic, studio, salon, gym, coach, therapist, tutor) → the booking-first templates (clinics, studios, practices)
- sells daily stock to walk-ins (bakery, café, florist, juice bar) → the "today's board + hours" templates
- quotes and jobs (trades, repairs, contractors) → the phone-ringing trades templates
- takes reservations (restaurant, venue, experience) → the reservations templates
- lists inventory (property, vehicles, portfolios) → the listings templates

RULES:
- The slug MUST come from the registry above — never invent one.
- The pitch is about the CLIENT's business, concrete and honest, no hype words like "unlock" or "elevate".`;
}

/* ── step 3b · the Copywriter sub-agent ────────────────────────────── */

function copySystem(personaId: string, memoryLines: string[]): string {
  const persona = PERSONAS.find((p) => p.id === personaId) ?? PERSONAS[0];
  return `You are the COPYWRITER sub-agent of the Growth OS engine — the "${persona.label}" specialist. ${persona.style}

YOU ALWAYS REPLY WITH A SINGLE RAW JSON OBJECT — no fences, no prose:
{"headline":"<max 8 words>","tagline":"<one sentence>","cta":"<max 4 words, a button label>","about":"<2 sentences>","brief":"<one-line business brief, the shape: 'a <what they do> in <city> that <conversion goal>'>"}

RULES:
- Write for the CLIENT's business (the user tells you what it is) — never a demo brand.
- Concrete and honest: real things, real hours, real neighbourhoods. No "unlock", no "elevate", no exclamation storms.
${memoryLines.length ? `- MEMORY about this client (already learned — stay consistent with it):\n${memoryLines.join("\n")}` : ""}`;
}

/* ── step 4 · deterministic verification ───────────────────────────── */

function verifySite(raw: Record<string, unknown>, planner: Plan): SiteAction | null {
  const slug = str(raw.slug, 64).toLowerCase();
  if (!TEMPLATE_SLUGS.has(slug)) return null; // never stage an invented template
  const motion = str(raw.motion, 24).toLowerCase();
  const t = findTemplate(slug)!;
  return {
    type: "site",
    slug,
    why: str(raw.why, 200) || `Picked ${t.name} for your brief.`,
    brief: str(raw.brief, 300),
    name: str(raw.name, 60) || planner.business,
    city: str(raw.city, 60) || planner.city || t.city,
    pitch: str(raw.pitch, 160),
    headline: str(raw.headline, 90),
    tagline: str(raw.tagline, 200),
    cta: str(raw.cta, 40),
    about: str(raw.about, 400),
    motion: motion in PERSONALITIES ? motion : "organic",
  };
}

function verifyImage(raw: unknown): ImageAction | null {
  if (!raw || typeof raw !== "object") return null;
  const a = raw as Record<string, unknown>;
  const prompt = str(a.prompt, 900);
  if (!prompt) return null;
  const size = str(a.size, 12);
  return { type: "image", prompt, size: IMAGE_SIZES.includes(size) ? size : "1344x768" };
}

function verifyVideo(raw: unknown): VideoAction | null {
  if (!raw || typeof raw !== "object") return null;
  const a = raw as Record<string, unknown>;
  const prompt = str(a.prompt, 1100);
  if (!prompt) return null;
  return { type: "video", prompt, quality: a.quality === "quality" ? "quality" : "speed" };
}

function verifySpeak(raw: unknown): SpeakAction | null {
  if (!raw || typeof raw !== "object") return null;
  const a = raw as Record<string, unknown>;
  const text = str(a.text, 900);
  if (!text) return null;
  const voice = str(a.voice, 16).toLowerCase();
  return { type: "speak", text, voice: VOICE_VALUES.includes(voice) ? voice : "tongtong" };
}

function verifySearch(raw: unknown): SearchAction | null {
  if (!raw || typeof raw !== "object") return null;
  const query = str((raw as Record<string, unknown>).query, 300);
  return query ? { type: "search", query } : null;
}

function verifyRead(raw: unknown): ReadAction | null {
  if (!raw || typeof raw !== "object") return null;
  let url = str((raw as Record<string, unknown>).url, 500);
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  return { type: "read", url };
}

/** The deterministic fallback router — when the Designer hallucinates,
 *  the local scorer picks instead. No LLM, just evidence. */
function deterministicPick(brief: string, planner: Plan): SiteAction | null {
  const answer = askConcierge(brief || planner.business || "local business", 1);
  const top = answer.items[0];
  if (!top) return null;
  const t = findTemplate(top.slug);
  if (!t) return null;
  return {
    type: "site",
    slug: top.slug,
    why: `${top.why} (deterministic fallback — the designer's pick failed verification)`,
    brief: `${planner.business || t.kind} in ${planner.city || t.city}`,
    name: planner.business,
    city: planner.city || t.city,
    pitch: "",
    headline: "",
    tagline: "",
    cta: "",
    about: "",
    motion: planner.persona === "premium" ? "corporate" : planner.persona === "bold" ? "bold" : "organic",
  };
}

/* ── the loop ──────────────────────────────────────────────────────── */

export async function runEngine(input: EngineInput): Promise<EngineResult> {
  const trace: TraceStep[] = [];
  const emit = (step: TraceStep) => {
    trace.push(step);
    try {
      input.onStep?.(step);
    } catch {
      /* a broken stream pipe never kills the loop */
    }
  };
  const mark = (id: string, label: string, detail: string, since: number) => {
    emit({ id, label, detail, ms: Date.now() - since });
  };

  /* 1 · LOAD CONTEXT — memory + build state */
  let t0 = Date.now();
  const memory = await loadMemory();
  mark(
    "context",
    "Context loaded",
    memory.lines.length
      ? `${memory.lines.length} memories in scope · build context: ${input.context.template ? input.context.template : "fresh"}`
      : `no memories yet (fresh client) · build context: ${input.context.template ? input.context.template : "fresh"}`,
    t0,
  );

  const zai = await ZAI.create();
  const lastUser = [...input.messages].reverse().find((m) => m.role === "user");
  const userTurn = lastUser?.content ?? "";

  /* 2 · PLAN — one fast call classifies + extracts facts */
  t0 = Date.now();
  let planner: Plan | null = null;
  try {
    const raw = await complete(
      zai,
      plannerSystem(memory.lines, input.context, input.hint ?? null),
      input.messages.map((m) => `${m.role === "user" ? "USER" : "AGENT"}: ${m.content}`).slice(-8).join("\n"),
    );
    const parsed = parseJson(raw);
    if (parsed) {
      planner = {
        task: (["question", "build", "multi"] as const).includes(parsed.task as never) ? (parsed.task as Plan["task"]) : "question",
        wants: Array.isArray(parsed.wants)
          ? (parsed.wants.filter((w) => ["site", "image", "video", "speak", "search", "read"].includes(w as string)) as Plan["wants"])
          : [],
        business: str(parsed.business, 60),
        city: str(parsed.city, 60),
        persona: PERSONAS.some((p) => p.id === parsed.persona) ? String(parsed.persona) : "warm",
        answer: str(parsed.answer, 1200),
        image: parsed.image as Plan["image"],
        video: parsed.video as Plan["video"],
        speak: parsed.speak as Plan["speak"],
        search: parsed.search as Plan["search"],
        read: parsed.read as Plan["read"],
      };
    }
  } catch {
    planner = null;
  }

  if (input.hint === "site" && planner && !planner.wants.includes("site")) {
    planner.wants.push("site"); // the Generate button is unmissable
  }

  if (!planner) {
    /* total planner failure — degrade to the single-shot legacy behaviour
       (one grounded call, still verified, still traced) */
    mark("plan", "Planner", "fast classification unavailable — falling back to single-shot mode", t0);
    t0 = Date.now();
    try {
      const raw = await complete(
        zai,
        `${plannerSystem(memory.lines, input.context, input.hint ?? null)}\n\nRespond with the FULL action JSON instead: for builds, merge the planner and designer roles into {"task":"build","business":"","city":"","persona":"","slug":"","motion":"","why":"","pitch":"","headline":"","tagline":"","cta":"","about":"","brief":""}.`,
        userTurn,
      );
      const parsed = parseJson(raw);
      if (parsed) {
        const plan: Plan = {
          task: "build",
          wants: TEMPLATE_SLUGS.has(String(parsed.slug ?? "")) ? ["site"] : [],
          business: str(parsed.business, 60),
          city: str(parsed.city, 60),
          persona: PERSONAS.some((p) => p.id === parsed.persona) ? String(parsed.persona) : "warm",
          answer: str(parsed.answer, 1200),
        };
        const site = verifySite(parsed, plan);
        if (site) {
          mark("plan", "Planner", "classified: build · fallback single-shot mode", t0);
          return await finish(plan, site, str(parsed.answer, 1200) || null, trace, input, undefined, input.onStep);
        }
      }
    } catch {
      /* falls through to the honest error */
    }
    return {
      say: "I could not shape that into an action — could you rephrase in one sentence?",
      actions: [],
      trace,
      memory: [],
    };
  }

  const wantsSite = planner.wants.includes("site");
  const otherWants = planner.wants.filter((w) => w !== "site");
  mark(
    "plan",
    wantsSite ? "Planner — classified: BUILD" : otherWants.length ? "Planner — classified: MULTI-DELIVERABLE" : "Planner — classified: QUESTION",
    wantsSite
      ? `wants: ${planner.wants.join(", ")} · business: ${planner.business || "(inventing one)"} · persona: ${planner.persona}`
      : otherWants.length
        ? `wants: ${otherWants.join(", ")}`
        : "a question — answering from memory + context",
    t0,
  );

  /* 3 · EXECUTE — question path: answer directly (already planned) */
  if (!wantsSite && otherWants.length === 0) {
    t0 = Date.now();
    const say = planner.answer || "Ask me to build a site, generate art, render a reel, speak, search or read — I'll do it right here.";
    mark("answer", "Answer composed", `${say.length} chars, grounded on ${memory.lines.length} memories`, t0);
    /* memory: remember expressed preferences in questions */
    const writes = extractMemory(planner, null);
    t0 = Date.now();
    const notes = await writeMemory(writes);
    mark("memory", notes.length ? "Memory written" : "Memory", notes.length ? notes.join(" · ") : "nothing new worth remembering", t0);
    return { say, actions: [], trace, memory: notes };
  }

  /* 3 · EXECUTE — build path: Designer ∥ Copywriter in parallel */
  let site: SiteAction | null = null;
  if (wantsSite) {
    t0 = Date.now();
    const designerP = (async () => {
      const raw = await complete(zai, designerSystem(), userTurn);
      return parseJson(raw) ?? {};
    })().catch(() => ({}) as Record<string, unknown>);

    const copyP = (async () => {
      const raw = await complete(zai, copySystem(planner!.persona, memory.lines), userTurn);
      return parseJson(raw) ?? {};
    })().catch(() => ({}) as Record<string, unknown>);

    const [designerOut, copyOut] = await Promise.all([designerP, copyP]);
    const parallelMs = Date.now() - t0;
    const parallelNote = `parallel round: ${(parallelMs / 1000).toFixed(1)}s wall-clock`;

    site = verifySite({ ...designerOut, ...copyOut, name: planner.business, city: planner.city }, planner);

    /* both sub-agents ran concurrently — each reports the same honest
       wall-clock duration of the parallel round */
    mark(
      "designer",
      "Designer — template picked (parallel)",
      `${site ? `${site.slug} · motion: ${site.motion} · ${String(designerOut.why ?? "").slice(0, 80)}` : "designer pick failed verification — deterministic scorer will take over"} · ${parallelNote}`,
      t0,
    );
    mark(
      "copywriter",
      "Copywriter — launch copy written (parallel)",
      `${copyOut.headline ? `“${String(copyOut.headline).slice(0, 70)}” · persona: ${planner.persona}` : "copywriter returned nothing — copy will be seeded by the Builder"} · ${parallelNote}`,
      t0,
    );

    /* 4 · VERIFY — deterministic, registry-grounded */
    t0 = Date.now();
    if (!site) {
      site = deterministicPick(userTurn, planner);
      mark(
        "verify",
        site ? "Verified — via deterministic fallback" : "Verification failed",
        site ? `designer pick rejected → local scorer picked ${site.slug} on evidence` : "no template could be grounded — refusing to invent one",
        t0,
      );
      if (!site && input.hint === "site") {
        return {
          say: "The agent could not pick a starting point — try describing the business in one sentence.",
          actions: [],
          trace,
          memory: [],
        };
      }
    } else {
      mark("verify", "Verified — registry checks passed", `slug "${site.slug}" exists · motion "${site.motion}" valid · copy lengths capped`, t0);
    }
  }

  /* other deliverables from the planner's own payloads */
  const actions: EngineAction[] = [];
  if (site) actions.push(site);
  const img = verifyImage(planner.image);
  if (planner.wants.includes("image") && img) actions.push(img);
  const vid = verifyVideo(planner.video);
  if (planner.wants.includes("video") && vid) actions.push(vid);
  const spk = verifySpeak(planner.speak);
  if (planner.wants.includes("speak") && spk) actions.push(spk);
  const srch = verifySearch(planner.search);
  if (planner.wants.includes("search") && srch) actions.push(srch);
  const rd = verifyRead(planner.read);
  if (planner.wants.includes("read") && rd) actions.push(rd);

  return await finish(planner, site, planner.answer || null, trace, input, actions, input.onStep);
}

/* ── steps 5+6 · memory + compose ──────────────────────────────────── */

function extractMemory(planner: Plan, site: SiteAction | null): { scope: string; key: string; body: string }[] {
  const writes: { scope: string; key: string; body: string }[] = [];
  if (planner.business) writes.push({ scope: "business", key: "name", body: planner.business });
  if (planner.city) writes.push({ scope: "business", key: "city", body: planner.city });
  if (planner.persona) writes.push({ scope: "preference", key: "persona", body: planner.persona });
  if (site) {
    writes.push({ scope: "decision", key: "template", body: `${site.slug} — ${site.why.slice(0, 140)}` });
    writes.push({ scope: "decision", key: "motion", body: site.motion });
  }
  return writes;
}

async function finish(
  planner: Plan,
  site: SiteAction | null,
  plannedSay: string | null,
  trace: TraceStep[],
  input: EngineInput,
  actions?: EngineAction[],
  emit?: (step: TraceStep) => void,
): Promise<EngineResult> {
  let out: EngineAction[] = actions ?? (site ? [site] : []);

  /* push + stream in one move — never duplicated */
  const push = (step: TraceStep) => {
    trace.push(step);
    try {
      emit?.(step);
    } catch {
      /* streaming is best-effort */
    }
  };

  /* 5 · MEMORY — write what was learned */
  let t0 = Date.now();
  const notes = await writeMemory(extractMemory(planner, site));
  push({
    id: "memory",
    label: notes.length ? "Memory written" : "Memory",
    detail: notes.length ? notes.join(" · ") : "nothing new worth remembering",
    ms: Date.now() - t0,
  });

  /* 6 · RESPOND */
  t0 = Date.now();
  let say: string;
  if (site) {
    const t = findTemplate(site.slug);
    say =
      (plannedSay && planner.task === "multi" && plannedSay.length > 4 ? `${plannedSay} ` : "") +
      `Done — ${t?.name ?? site.slug} is staged for ${site.name || "your business"}${site.city ? ` in ${site.city}` : ""}, launch copy written in the ${planner.persona} voice, motion: ${site.motion}. The live preview is below — it's already in the Builder, ready to shape.`;
  } else if (out.length) {
    say = `On it — ${out.length} deliverable${out.length > 1 ? "s" : ""} running below.`;
  } else {
    say = plannedSay || "Ask me to build a site, generate art, render a reel, speak, search or read — I'll do it right here.";
  }
  push({
    id: "respond",
    label: "Response composed",
    detail: `${say.length} chars · ${out.length} action${out.length === 1 ? "" : "s"} dispatched`,
    ms: Date.now() - t0,
  });

  /* the Generate button MUST yield a site action */
  if (input.hint === "site" && !out.some((a) => a.type === "site")) out = [];

  return { say, actions: out.slice(0, 4), trace, memory: notes };
}
