import { NextResponse } from "next/server";
import { ALL_SKILLS } from "@/engine/motion-skills";
import { ALL_SOURCE_REPOS } from "@/engine/sources";
import { POST as chatPost } from "@/app/api/ai/chat/route";
import { POST as agentPost } from "@/app/api/ai/agent/route";
import { POST as imagePost, GET as imageGet } from "@/app/api/ai/image/route";
import { POST as videoPost, GET as videoGet } from "@/app/api/ai/video/route";
import { POST as ttsPost } from "@/app/api/ai/tts/route";
import { POST as asrPost } from "@/app/api/ai/asr/route";
import { POST as vlmPost } from "@/app/api/ai/vlm/route";
import { POST as searchPost } from "@/app/api/ai/search/route";
import { POST as readerPost } from "@/app/api/ai/reader/route";
import { GET as skillsGet } from "@/app/api/skills/route";
import { GET as skillDetailGet } from "@/app/api/skills/[id]/route";
import { GET as censusGet } from "@/app/api/census/route";
import ZAI from "z-ai-web-dev-sdk";

/**
 * /api/mcp — the system as ONE MCP server. The all-in-one move:
 *
 * Today, using 27 skills in Claude means 27 installs — every skill and
 * every MCP has to be added separately. This endpoint is the answer:
 * add ONE server config and any MCP client (Claude Desktop, Claude Code,
 * Cursor, Codex, any agent speaking JSON-RPC 2.0) gets every skill as a
 * tool, always current, nothing installed:
 *
 *   · the census      — the honest, filesystem-counted skill totals
 *   · the manifest    — all 27 skills in four formats (json/tools/md/skillmd)
 *   · one skill       — full depth, principles + recipes verbatim
 *   · the 8 AI engine calls — chat, image, video, tts, asr, vlm, search, reader
 *   · the patterns    — reference→brief (openmontage), copy personas
 *                       (agency-agents), builder picks (agent)
 *
 * Transport: Streamable HTTP (JSON responses, stateless — one JSON-RPC
 * 2.0 message per POST; no session header required).
 *
 *   POST { "jsonrpc":"2.0", "id":1, "method":"initialize", "params":{} }
 *   POST { "jsonrpc":"2.0", "id":2, "method":"tools/list" }
 *   POST { "jsonrpc":"2.0", "id":3, "method":"tools/call",
 *          "params":{ "name":"census", "arguments":{} } }
 */

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const PROTOCOL_VERSION = "2025-06-18";
const SERVER_INFO = {
  name: "growth-os",
  version: "1.0.0",
  title: "Growth OS — one server, every skill",
} as const;

/* ── CORS (agents live anywhere) ───────────────────────────────────── */

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Mcp-Session-Id, Mcp-Protocol-Version",
};

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/* ── JSON-RPC plumbing ─────────────────────────────────────────────── */

interface JsonRpcRequest {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
}

function rpcOk(id: string | number | null, result: unknown): NextResponse {
  return NextResponse.json(
    { jsonrpc: "2.0", id, result },
    { headers: { ...CORS_HEADERS, "Mcp-Protocol-Version": PROTOCOL_VERSION } },
  );
}

function rpcErr(id: string | number | null, code: number, message: string): NextResponse {
  return NextResponse.json(
    { jsonrpc: "2.0", id, error: { code, message } },
    { status: 200, headers: CORS_HEADERS },
  );
}

/* ── the tool catalogue ────────────────────────────────────────────── */

interface JsonSchema {
  type: string;
  description?: string;
  enum?: string[];
  items?: JsonSchema;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  minimum?: number;
  maximum?: number;
  default?: string | number;
}

interface McpTool {
  name: string;
  description: string;
  inputSchema: JsonSchema;
}

const TOOLS: McpTool[] = [
  {
    name: "census",
    description:
      "The honest skill census: every cloned repo re-counted from the filesystem (openmontage's layers, agency-agents personas, the five motion masters), the local skill library, the 27-skill unified registry, and OpenMontage's '700+' claim verified against the real clone. Set validate:true to also live-probe every AI endpoint.",
    inputSchema: {
      type: "object",
      properties: {
        validate: { type: "boolean", description: "Also ping every AI endpoint (empty-body liveness probe, no model calls).", default: false },
      },
    },
  },
  {
    name: "skills_manifest",
    description:
      "The universal skill manifest — 27 skills (19 motion from five master sources + 8 live AI engine skills) in four formats: json (metadata), tools (OpenAI function schemas), md (system-prompt markdown), skillmd (portable SKILL.md files with YAML frontmatter — the graftcode 'author once, render many' export).",
    inputSchema: {
      type: "object",
      properties: {
        format: { type: "string", enum: ["json", "tools", "md", "skillmd"], description: "Render format.", default: "json" },
        kind: { type: "string", enum: ["motion", "ai"], description: "Filter by kind." },
        category: { type: "string", description: "Filter by category (foundation, feel, choreography, brand, interface, video, ai-engine)." },
        source: { type: "string", description: "Filter by source URL substring (e.g. emilkowalski)." },
      },
    },
  },
  {
    name: "skill_detail",
    description:
      "One skill from the registry at full depth — principles and runnable recipes verbatim, the source credited, related skills listed. Use this when applying a motion skill: fetch the guide, then execute its recipes.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: `Skill id, e.g. emil.gate, gsap.timeline, remotion.pipeline, wiggle.grammar, iart.glass, ai.image. Valid ids: ${ALL_SKILLS.map((s) => s.id).join(", ")}` },
        format: { type: "string", enum: ["json", "md", "tools"], description: "Detail format.", default: "json" },
      },
      required: ["id"],
    },
  },
  {
    name: "reference_to_brief",
    description:
      "The openmontage pattern: paste any website URL — the Page Reader extracts its readable content, the chat model distills it into a one-line business brief ('a <what they do> in <city> that <conversion goal>'). The entry point of the staged generation pipeline.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "The reference site URL." },
      },
      required: ["url"],
    },
  },
  {
    name: "copy_personas",
    description:
      "The agency-agents pattern: three named copywriter voices — warm (neighbourly, human, plain words), premium (restrained, few words, never hype), bold (energetic, direct, a little cheeky). One business, three voices: launch copy (headline, tagline, CTA, about) written by the persona you pick.",
    inputSchema: {
      type: "object",
      properties: {
        business: { type: "string", description: "The business name." },
        city: { type: "string", description: "Where it operates." },
        pitch: { type: "string", description: "Optional one-line differentiator." },
        persona: { type: "string", enum: ["warm", "premium", "bold"], description: "The copywriter voice.", default: "warm" },
      },
      required: ["business"],
    },
  },
  {
    name: "builder_pick",
    description:
      "The Growth OS Engine: give it a business brief ('a neighbourhood bakery that takes pre-orders') and the full agent loop runs — memory load → planner classifies the task → the Designer and Copywriter sub-agents run IN PARALLEL (template pick from the 23-template registry ∥ launch copy in the persona voice) → deterministic verification against the real registries → memory write. Returns a validated site staging action PLUS the engine trace (every step, with timings) and the memory notes. This is the same engine behind the Builder's 'Generate my website' button and the Agent chat.",
    inputSchema: {
      type: "object",
      properties: {
        brief: { type: "string", description: "One sentence: what the business does and what the website should get people to do." },
        business: { type: "string", description: "Optional business name for context." },
        city: { type: "string", description: "Optional city for context." },
      },
      required: ["brief"],
    },
  },
  {
    name: "ai_chat",
    description: "The chat engine: conversation and generation over text — reasoning, rewriting, structured output. 1–3s.",
    inputSchema: {
      type: "object",
      properties: {
        messages: {
          type: "array",
          description: "Conversation history, oldest first.",
          items: {
            type: "object",
            properties: {
              role: { type: "string", enum: ["user", "assistant"] },
              content: { type: "string" },
            },
            required: ["role", "content"],
          },
        },
        system: { type: "string", description: "Optional system prompt." },
      },
      required: ["messages"],
    },
  },
  {
    name: "ai_image",
    description:
      "Image generation (JOB): photographic art from prompts — heroes, marks, textures. Returns a jobId; poll it with ai_job_status (30–90s typical).",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "What to render — subject, style, mood." },
        size: { type: "string", enum: ["1024x1024", "768x1344", "864x1152", "1344x768", "1152x864", "1536x768", "768x1536"], description: "Output dimensions.", default: "1024x1024" },
      },
      required: ["prompt"],
    },
  },
  {
    name: "ai_video",
    description:
      "Video generation (JOB): cinematic reels and social teasers from prompts. Returns a jobId; poll it with ai_job_status (minutes — the remotion.pipeline contract).",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "The shot to render — subject, camera, motion." },
        quality: { type: "string", enum: ["speed", "quality"], description: "Render priority.", default: "quality" },
      },
      required: ["prompt"],
    },
  },
  {
    name: "ai_job_status",
    description: "Poll an image or video job started by ai_image / ai_video. Returns status (pending/done/error) and the result when done.",
    inputSchema: {
      type: "object",
      properties: {
        kind: { type: "string", enum: ["image", "video"] },
        jobId: { type: "string" },
      },
      required: ["kind", "jobId"],
    },
  },
  {
    name: "ai_tts",
    description: "Text to speech: natural spoken audio as data-URL WAV parts (play in order). 7 voices.",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "The text to speak (split at sentence bounds automatically)." },
        voice: { type: "string", enum: ["tongtong", "chuichui", "xiaochen", "jam", "kazi", "douji", "luodo"], description: "The voice.", default: "tongtong" },
        speed: { type: "number", minimum: 0.5, maximum: 2, description: "Speech rate.", default: 1 },
        maxChars: { type: "number", description: "Cap on returned audio data-URL characters (the full audio stays retrievable at /api/ai/tts).", default: 60000 },
      },
      required: ["text"],
    },
  },
  {
    name: "ai_asr",
    description: "Speech recognition: base64 audio in (data-URL prefix optional), transcript out.",
    inputSchema: {
      type: "object",
      properties: {
        audioBase64: { type: "string", description: "Base64-encoded audio." },
      },
      required: ["audioBase64"],
    },
  },
  {
    name: "ai_vlm",
    description: "Vision: the model that reads images — critique, metadata, extraction. Pass a public URL or base64.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "What to ask about the image." },
        imageUrl: { type: "string", description: "Public URL of the image." },
        imageBase64: { type: "string", description: "Base64-encoded image (data-URL prefix optional)." },
      },
      required: ["prompt"],
    },
  },
  {
    name: "ai_search",
    description: "Live web search — ranked results. Engine 'image' returns real web images (OSS-hosted URLs).",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "What to search for." },
        num: { type: "number", minimum: 3, maximum: 12, description: "Results to return.", default: 8 },
        engine: { type: "string", enum: ["web", "image"], description: "Web pages or images.", default: "web" },
      },
      required: ["query"],
    },
  },
  {
    name: "ai_reader",
    description: "Page reader: any URL in, clean readable text out (mode 'audit' adds a conversion-focused LLM audit).",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "The page URL to read." },
        mode: { type: "string", enum: ["extract", "audit"], description: "Extract text, or also audit it.", default: "extract" },
      },
      required: ["url"],
    },
  },
]

/* ── internal route calls (same behavior as the REST API, zero drift) ─ */

function makeReq(base: string, path: string, body?: unknown): Request {
  return new Request(`${base}${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function callRoute(res: Response): Promise<Record<string, unknown>> {
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return { error: `Route returned ${res.status} with no JSON body.` };
  }
}

/* ── tool implementations ──────────────────────────────────────────── */

async function toolCensus(base: string, args: Record<string, unknown>): Promise<unknown> {
  const validate = args.validate === true ? "?validate=1" : "";
  const res = await censusGet(makeReq(base, `/api/census${validate}`));
  return callRoute(res);
}

async function toolManifest(base: string, args: Record<string, unknown>): Promise<unknown> {
  const q = new URLSearchParams();
  const format = typeof args.format === "string" ? args.format : "json";
  q.set("format", format);
  if (typeof args.kind === "string") q.set("kind", args.kind);
  if (typeof args.category === "string") q.set("category", args.category);
  if (typeof args.source === "string") q.set("source", args.source);
  const res = await skillsGet(makeReq(base, `/api/skills?${q.toString()}`));
  /* md comes back as text, the rest as JSON */
  if (format === "md") {
    const text = await res.text();
    return { ok: true, format: "md", document: text.length > 24000 ? `${text.slice(0, 24000)}\n… (truncated — fetch /api/skills?format=md directly for the full document)` : text };
  }
  return callRoute(res);
}

async function toolSkillDetail(base: string, args: Record<string, unknown>): Promise<unknown> {
  const id = typeof args.id === "string" ? args.id : "";
  const format = typeof args.format === "string" ? args.format : "json";
  const res = await skillDetailGet(makeReq(base, `/api/skills/${encodeURIComponent(id)}?format=${format}`), {
    params: Promise.resolve({ id }),
  });
  if (format === "md") {
    const text = await res.text();
    return { ok: res.ok, document: text };
  }
  return callRoute(res);
}

/** the openmontage pattern — reader extracts, chat distills */
async function toolReferenceToBrief(base: string, args: Record<string, unknown>): Promise<unknown> {
  const url = typeof args.url === "string" ? args.url.trim() : "";
  if (!url) return { error: "url required" };
  const readRes = await readerPost(makeReq(base, "/api/ai/reader", { url }));
  const read = await callRoute(readRes);
  if (read.error) return read;
  const text = String(read.text ?? "").slice(0, 5000);
  if (!text) return { error: "That page returned no readable content." };
  const chatRes = await chatPost(
    makeReq(base, "/api/ai/chat", {
      system:
        "You turn a website's readable text into a one-line business brief for a website builder. " +
        "Reply with EXACTLY one line, max 20 words, in the shape: 'a <what they do> in <city if known> that <conversion goal>'. " +
        "No quotes, no preamble, no explanation — just the line.",
      messages: [{ role: "user", content: `Website: ${read.title ?? url}\n\nPAGE TEXT:\n${text}` }],
    }),
  );
  const chat = await callRoute(chatRes);
  return { url: read.url, title: read.title, brief: (chat.reply ?? "").replace(/^["']|["']$/g, "").trim(), raw_error: chat.error };
}

/** the agency-agents pattern — three named voices */
const PERSONA_STYLES: Record<string, string> = {
  warm: "Write in a warm, neighbourly, human voice — plain words, short sentences, like a local business owner talking to a regular.",
  premium: "Write in a restrained, premium voice — few words, no exclamation marks, confidence through specificity, never hype.",
  bold: "Write in a bold, playful, energetic voice — direct address, a little cheeky, but never cringe.",
}

async function toolCopyPersonas(base: string, args: Record<string, unknown>): Promise<unknown> {
  const business = typeof args.business === "string" ? args.business.trim().slice(0, 80) : "";
  if (!business) return { error: "business required" };
  const city = typeof args.city === "string" ? args.city.trim().slice(0, 60) : "";
  const pitch = typeof args.pitch === "string" ? args.pitch.trim().slice(0, 160) : "";
  const personaId = typeof args.persona === "string" && args.persona in PERSONA_STYLES ? args.persona : "warm";
  const style = PERSONA_STYLES[personaId];
  const res = await chatPost(
    makeReq(base, "/api/ai/chat", {
      system:
        `You write launch copy for small-business websites. ${style}\n` +
        `The client's business: name "${business}", city ${city || "unspecified"}${pitch ? `, pitch: ${pitch}` : ""}.\n` +
        `Keep it concrete and honest, no hype words like "unlock" or "elevate".\n` +
        `Answer with EXACTLY four lines, each starting with the label, nothing else:\n` +
        `HEADLINE: <max 8 words>\nTAGLINE: <one sentence>\nCTA: <max 4 words, a button label>\nABOUT: <2 sentences>`,
      messages: [{ role: "user", content: `Write the launch copy for ${business}${city ? ` in ${city}` : ""}.` }],
    }),
  );
  const out = await callRoute(res);
  return { persona: personaId, voice: style, copy: out.reply ?? null, error: out.error };
}

/** the builder's Generate button, headless */
async function toolBuilderPick(base: string, args: Record<string, unknown>): Promise<unknown> {
  const brief = typeof args.brief === "string" ? args.brief.trim().slice(0, 800) : "";
  if (!brief) return { error: "brief required" };
  const context: Record<string, string> = {};
  if (typeof args.business === "string") context.business = args.business.slice(0, 80);
  if (typeof args.city === "string") context.city = args.city.slice(0, 60);
  const res = await agentPost(
    /* ?stream=0 — the engine's single-shot JSON shape; the NDJSON stream
       is for browser clients that render the loop live */
    makeReq(base, "/api/ai/agent?stream=0", {
      messages: [{ role: "user", content: brief }],
      context,
      hint: "site",
    }),
  );
  return callRoute(res);
}

async function toolTts(base: string, args: Record<string, unknown>): Promise<unknown> {
  const text = typeof args.text === "string" ? args.text : "";
  const maxChars = typeof args.maxChars === "number" ? Math.max(1000, Math.min(400000, args.maxChars)) : 60000;
  const res = await ttsPost(
    makeReq(base, "/api/ai/tts", {
      text,
      voice: typeof args.voice === "string" ? args.voice : undefined,
      speed: typeof args.speed === "number" ? args.speed : undefined,
    }),
  );
  const out = await callRoute(res);
  if (Array.isArray(out.parts)) {
    let total = 0;
    const parts = (out.parts as string[]).map((p) => {
      total += p.length;
      if (total <= maxChars) return p;
      return null;
    });
    const kept = parts.filter((p): p is string => p !== null);
    const truncated = kept.length < (out.parts as string[]).length;
    return {
      voice: out.voice,
      speed: out.speed,
      chunks: out.chunks,
      chars: out.chars,
      parts: kept,
      note: truncated
        ? `audio data truncated at ${maxChars} chars — call POST /api/ai/tts directly with the same text for the full parts`
        : "play the parts in order",
    };
  }
  return out;
}

/* ── resources ─────────────────────────────────────────────────────── */

const RESOURCES = [
  {
    uri: "census://latest",
    name: "The skill census (live)",
    description: "Every source re-counted from the filesystem, claims verified, totals honest.",
    mimeType: "application/json",
  },
  {
    uri: "skills://registry",
    name: "The unified skill registry",
    description: "27 skills — 19 motion from five masters + 8 live AI engine skills.",
    mimeType: "application/json",
  },
  {
    uri: "sources://ledger",
    name: "The source ledger",
    description: "Every repo this system is built from — what it is, how we use it, the count rules.",
    mimeType: "application/json",
  },
  {
    uri: "skills://manifest.md",
    name: "The manifest as markdown",
    description: "The whole registry as an agent system-prompt document.",
    mimeType: "text/markdown",
  },
]

async function readResource(base: string, uri: string): Promise<{ uri: string; mimeType: string; text: string } | { error: string }> {
  if (uri === "census://latest") {
    const res = await censusGet(makeReq(base, "/api/census"));
    return { uri, mimeType: "application/json", text: JSON.stringify(await callRoute(res)) };
  }
  if (uri === "skills://registry") {
    const res = await skillsGet(makeReq(base, "/api/skills?format=json"));
    return { uri, mimeType: "application/json", text: JSON.stringify(await callRoute(res)) };
  }
  if (uri === "sources://ledger") {
    return { uri, mimeType: "application/json", text: JSON.stringify({ repos: ALL_SOURCE_REPOS.map((r) => ({ repo: r.repo, url: r.url, dir: r.dir, whatItIs: r.whatItIs, howWeUseIt: r.howWeUseIt, counts: r.counts })) }) };
  }
  if (uri === "skills://manifest.md") {
    const res = await skillsGet(makeReq(base, "/api/skills?format=md"));
    return { uri, mimeType: "text/markdown", text: await res.text() };
  }
  return { error: `Unknown resource: ${uri}` };
}

/* ── prompts ───────────────────────────────────────────────────────── */

const PROMPTS = [
  {
    name: "copy_in_voice",
    description: "Launch copy for a business in one of the three copywriter voices (agency-agents pattern).",
    arguments: [
      { name: "business", description: "The business name", required: true },
      { name: "city", description: "Where it operates", required: false },
      { name: "persona", description: "warm | premium | bold", required: false },
    ],
  },
  {
    name: "reference_brief",
    description: "Distill any website into a one-line business brief (openmontage pattern).",
    arguments: [{ name: "url", description: "The reference site", required: true }],
  },
  {
    name: "motion_audit",
    description: "Audit a component's motion against the 19-skill registry (the Emil gate first).",
    arguments: [{ name: "component", description: "The component or interaction to audit", required: true }],
  },
]

function renderPrompt(name: string, args: Record<string, string>): { description: string; messages: { role: string; content: { type: string; text: string } }[] } | { error: string } {
  if (name === "copy_in_voice") {
    const persona = args.persona && args.persona in PERSONA_STYLES ? args.persona : "warm";
    return {
      description: `Launch copy in the ${persona} voice`,
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text:
              `Write launch copy for "${args.business ?? "the business"}"${args.city ? ` in ${args.city}` : ""} in this voice: ${PERSONA_STYLES[persona]}\n` +
              `Reply with exactly four labelled lines: HEADLINE (max 8 words), TAGLINE (one sentence), CTA (max 4 words), ABOUT (2 sentences). Concrete and honest — no hype words.`,
          },
        },
      ],
    };
  }
  if (name === "reference_brief") {
    return {
      description: "Reference site → one-line brief",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text:
              `Read ${args.url ?? "<url>"} with the ai_reader tool, then distill it into EXACTLY one line, max 20 words, in the shape: 'a <what they do> in <city if known> that <conversion goal>'. No quotes, no explanation.`,
          },
        },
      ],
    };
  }
  if (name === "motion_audit") {
    return {
      description: "Motion audit against the registry",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text:
              `Audit the motion of: ${args.component ?? "<component>"}.\n` +
              `First fetch the guides with skills_manifest or skill_detail (emil.gate, emil.feel, emil.recipes, emil.a11y-motion are the bar). Then answer: (1) does it pass the animate gate — frequency, purpose named in one word? (2) are the curves and durations from the feel system? (3) does it enter from scale 0? (4) exit the way it entered? (5) stagger 30–80ms? (6) reduced-motion guard? (7) 60fps contract — transform/opacity only? End with a verdict: SHIP, FIX (list), or KILL.`,
          },
        },
      ],
    };
  }
  return { error: `Unknown prompt: ${name}` };
}

/* ── tools/call dispatch ───────────────────────────────────────────── */

function toolText(payload: unknown, isError = false) {
  const text = typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);
  return { content: [{ type: "text", text }], isError }
}

async function callTool(base: string, name: string, args: Record<string, unknown>): Promise<{ content: { type: string; text: string }[]; isError?: boolean }> {
  try {
    switch (name) {
      case "census":
        return toolText(await toolCensus(base, args));
      case "skills_manifest":
        return toolText(await toolManifest(base, args));
      case "skill_detail":
        return toolText(await toolSkillDetail(base, args));
      case "reference_to_brief":
        return toolText(await toolReferenceToBrief(base, args));
      case "copy_personas":
        return toolText(await toolCopyPersonas(base, args));
      case "builder_pick":
        return toolText(await toolBuilderPick(base, args));
      case "ai_chat": {
        const res = await chatPost(makeReq(base, "/api/ai/chat", args));
        return toolText(await callRoute(res));
      }
      case "ai_image": {
        const res = await imagePost(makeReq(base, "/api/ai/image", args));
        const out = await callRoute(res);
        if (out.jobId) {
          return toolText({ ...out, note: "job started — poll with ai_job_status { kind: 'image', jobId } until status is done; result.image is a data URL." });
        }
        return toolText(out, !!out.error);
      }
      case "ai_video": {
        const res = await videoPost(makeReq(base, "/api/ai/video", args));
        const out = await callRoute(res);
        if (out.jobId) {
          return toolText({ ...out, note: "job started — poll with ai_job_status { kind: 'video', jobId } until status is done (minutes); result.video is a URL." });
        }
        return toolText(out, !!out.error);
      }
      case "ai_job_status": {
        const kind = args.kind === "video" ? "video" : "image";
        const jobId = typeof args.jobId === "string" ? args.jobId : "";
        const get = kind === "video" ? videoGet : imageGet;
        const res = await get(makeReq(base, `/api/ai/${kind}?jobId=${encodeURIComponent(jobId)}`));
        return toolText(await callRoute(res));
      }
      case "ai_tts":
        return toolText(await toolTts(base, args));
      case "ai_asr": {
        const res = await asrPost(makeReq(base, "/api/ai/asr", args));
        return toolText(await callRoute(res));
      }
      case "ai_vlm": {
        const res = await vlmPost(makeReq(base, "/api/ai/vlm", args));
        return toolText(await callRoute(res));
      }
      case "ai_search": {
        const res = await searchPost(makeReq(base, "/api/ai/search", args));
        return toolText(await callRoute(res));
      }
      case "ai_reader": {
        const res = await readerPost(makeReq(base, "/api/ai/reader", args));
        return toolText(await callRoute(res));
      }
      default:
        return toolText({ error: `Unknown tool: ${name}` }, true);
    }
  } catch (e) {
    return toolText({ error: e instanceof Error ? e.message : "The tool call failed." }, true);
  }
}

/* ── GET — the descriptor (also the census probe target) ───────────── */

export async function GET(req: Request): Promise<NextResponse> {
  const origin = new URL(req.url).origin;
  return NextResponse.json(
    {
      ok: true,
      server: { ...SERVER_INFO, endpoint: `${origin}/api/mcp`, transport: "streamable-http (JSON responses, stateless)" },
      protocolVersion: PROTOCOL_VERSION,
      capabilities: { tools: { listChanged: false }, resources: { subscribe: false, listChanged: false }, prompts: { listChanged: false } },
      toolCount: TOOLS.length,
      tools: TOOLS.map((t) => t.name),
      resources: RESOURCES.map((r) => r.uri),
      prompts: PROMPTS.map((p) => p.name),
      connect: {
        claudeDesktop: {
          mcpServers: {
            "growth-os": {
              url: `${origin}/api/mcp`,
            },
          },
        },
        curl: `curl -s ${origin}/api/mcp -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"${PROTOCOL_VERSION}","capabilities":{},"clientInfo":{"name":"curl","version":"1.0"}}}'`,
      },
      note: "One server, every skill: the census, the 27-skill manifest in four formats, the 8 AI engine calls, and the system patterns — as 16 tools, 4 resources, 3 prompts. POST JSON-RPC 2.0 messages.",
    },
    { headers: { ...CORS_HEADERS, "Cache-Control": "no-store" } },
  );
}

/* ── POST — the JSON-RPC 2.0 endpoint ──────────────────────────────── */

export async function POST(req: Request): Promise<NextResponse> {
  const base = new URL(req.url).origin;
  let body: JsonRpcRequest | JsonRpcRequest[];
  try {
    body = (await req.json()) as JsonRpcRequest | JsonRpcRequest[];
  } catch {
    return rpcErr(null, -32700, "Parse error — the body must be a single JSON-RPC 2.0 message or a batch array.");
  }

  const handleOne = async (msg: JsonRpcRequest): Promise<NextResponse | null> => {
    /* notifications (no id) get no response — MCP spec */
    if (msg.id === undefined || msg.id === null) {
      if (msg.method === "notifications/initialized" || msg.method?.startsWith("notifications/")) return null;
      return null;
    }
    switch (msg.method) {
      case "initialize":
        return rpcOk(msg.id, {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: {
            tools: { listChanged: false },
            resources: { subscribe: false, listChanged: false },
            prompts: { listChanged: false },
          },
          serverInfo: { ...SERVER_INFO },
          instructions:
            "Growth OS — one server, every skill. Start with the census tool for the honest totals, skills_manifest for the registry (skillmd format gives portable SKILL.md files), skill_detail to apply a motion skill, and the ai_* tools for live generation. builder_pick stages a full website from a one-line brief.",
        });
      case "ping":
        return rpcOk(msg.id, {});
      case "tools/list":
        return rpcOk(msg.id, { tools: TOOLS });
      case "tools/call": {
        const params = msg.params ?? {};
        const name = typeof params.name === "string" ? params.name : "";
        const args = (params.arguments && typeof params.arguments === "object" ? params.arguments : {}) as Record<string, unknown>;
        if (!name) return rpcErr(msg.id, -32602, "Missing tool name.");
        const result = await callTool(base, name, args);
        return rpcOk(msg.id, result);
      }
      case "resources/list":
        return rpcOk(msg.id, { resources: RESOURCES });
      case "resources/read": {
        const uri = typeof (msg.params ?? {}).uri === "string" ? (msg.params as { uri: string }).uri : "";
        const read = await readResource(base, uri);
        if ("error" in read) return rpcErr(msg.id, -32002, read.error);
        return rpcOk(msg.id, { contents: [read] });
      }
      case "prompts/list":
        return rpcOk(msg.id, { prompts: PROMPTS });
      case "prompts/get": {
        const params = msg.params ?? {};
        const name = typeof params.name === "string" ? params.name : "";
        const rawArgs = (params.arguments && typeof params.arguments === "object" ? params.arguments : {}) as Record<string, unknown>;
        const args: Record<string, string> = {};
        for (const [k, v] of Object.entries(rawArgs)) if (typeof v === "string") args[k] = v;
        const rendered = renderPrompt(name, args);
        if ("error" in rendered) return rpcErr(msg.id, -32002, rendered.error);
        return rpcOk(msg.id, rendered);
      }
      default:
        return rpcErr(msg.id, -32601, `Method not found: ${msg.method ?? "(none)"}`);
    }
  }

  if (Array.isArray(body)) {
    /* batch — answer the requests, skip the notifications */
    const results: unknown[] = [];
    for (const msg of body.slice(0, 32)) {
      const r = await handleOne(msg);
      if (r) results.push(await r.json());
    }
    return NextResponse.json(results, { headers: CORS_HEADERS });
  }

  const single = await handleOne(body);
  if (single) return single;
  /* a pure notification → 202, no body */
  return new NextResponse(null, { status: 202, headers: CORS_HEADERS });
}
