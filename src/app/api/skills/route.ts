import { NextResponse } from "next/server";
import { ALL_SKILLS, SKILL_SOURCES, type UnifiedSkill } from "@/engine/motion-skills";

/**
 * GET /api/skills — the universal Skills Manifest API.
 *
 * One registry, four formats, any agent (Claude, GPT, LangChain, n8n, a
 * local model — no SDK, no dialect, no lock-in):
 *
 *   ?format=json   (default) — light summaries of every skill: metadata,
 *                  hasPrinciples/recipeCount flags, the source registry,
 *                  counts. Principles and recipes live on the detail route.
 *   ?format=tools  — OpenAI-style function/tool manifest. The 8 AI engine
 *                  skills carry real JSON schemas for this system's REST
 *                  endpoints; the 20 motion skills carry target/context
 *                  params and point at GET /api/skills/<id> for depth.
 *   ?format=md     — a markdown document for pasting into any agent's
 *                  system prompt, grouped by source, recipes verbatim.
 *   ?format=skillmd — the "author once, render many" export: a JSON bundle
 *                  of portable SKILL.md files (YAML frontmatter + body),
 *                  one per skill, in the layout every agent-skill system
 *                  understands (Claude skills, .agents/skills, ClawHub).
 *
 * Filters (apply to every format):
 *   &kind=motion|ai     &category=<category>     &source=<source url substring>
 *
 * Read-only and CORS-open by design — agents live anywhere.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FORMATS = ["json", "tools", "md", "skillmd"] as const;

/* ── CORS + cache headers ─────────────────────────────────────────── */

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const BASE_HEADERS: Record<string, string> = { ...CORS_HEADERS, "Cache-Control": "no-store" };

function json(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status, headers: BASE_HEADERS });
}

function markdown(doc: string): NextResponse {
  return new NextResponse(doc, {
    status: 200,
    headers: { ...BASE_HEADERS, "Content-Type": "text/markdown; charset=utf-8" },
  });
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/* ── the tools format — OpenAI-style function manifest ────────────── */

interface JsonSchema {
  type: string;
  description?: string;
  enum?: string[];
  items?: JsonSchema;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  anyOf?: { required: string[] }[];
  minimum?: number;
  maximum?: number;
  default?: string | number;
}

interface ToolEntry {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: JsonSchema;
  };
}

/** Realistic request schemas for this system's live AI endpoints. */
const AI_TOOL_PARAMETERS: Record<string, JsonSchema> = {
  "ai.chat": {
    type: "object",
    properties: {
      messages: {
        type: "array",
        description: "Conversation history, oldest first; the last message is the one to answer.",
        items: {
          type: "object",
          properties: {
            role: { type: "string", enum: ["user", "assistant"], description: "The speaker." },
            content: { type: "string", description: "The message text." },
          },
          required: ["role", "content"],
        },
      },
      system: { type: "string", description: "Optional system prompt, prepended as context." },
    },
    required: ["messages"],
  },
  "ai.image": {
    type: "object",
    properties: {
      prompt: { type: "string", description: "What to render — subject, style, mood (up to 1200 chars)." },
      size: {
        type: "string",
        enum: ["1024x1024", "768x1344", "864x1152", "1344x768", "1152x864", "1536x768", "768x1536"],
        description: "Output dimensions.",
        default: "1024x1024",
      },
    },
    required: ["prompt"],
  },
  "ai.tts": {
    type: "object",
    properties: {
      text: { type: "string", description: "The text to speak (long input is split at sentence bounds)." },
      voice: {
        type: "string",
        enum: ["tongtong", "xiaochen", "mohe", "xiaoyuan", "ych-eric", "ych-elsie", "ych-molly"],
        description: "The voice to speak with.",
        default: "tongtong",
      },
      speed: { type: "number", minimum: 0.5, maximum: 2, description: "Speech rate.", default: 1 },
    },
    required: ["text"],
  },
  "ai.asr": {
    type: "object",
    properties: {
      audioBase64: { type: "string", description: "Base64-encoded audio (data-URL prefix optional)." },
    },
    required: ["audioBase64"],
  },
  "ai.vlm": {
    type: "object",
    properties: {
      imageBase64: { type: "string", description: "Base64-encoded image (data-URL prefix optional)." },
      imageUrl: { type: "string", description: "Public URL of the image." },
      prompt: { type: "string", description: "What to ask about the image; defaults to a full description." },
    },
    required: ["prompt"],
    anyOf: [{ required: ["imageBase64"] }, { required: ["imageUrl"] }],
  },
  "ai.video": {
    type: "object",
    properties: {
      prompt: { type: "string", description: "The shot to render — subject, camera, motion (up to 1200 chars)." },
      size: { type: "string", description: "Optional output size / aspect-ratio hint." },
    },
    required: ["prompt"],
  },
  "ai.search": {
    type: "object",
    properties: {
      query: { type: "string", description: "What to search the live web for (up to 300 chars)." },
      count: { type: "number", description: "Results to return, 3–12.", default: 8 },
    },
    required: ["query"],
  },
  "ai.reader": {
    type: "object",
    properties: {
      url: { type: "string", description: "The page URL to read." },
    },
    required: ["url"],
  },
};

const GENERIC_PARAMETERS: JsonSchema = { type: "object", properties: {} };

function toolEntry(skill: UnifiedSkill): ToolEntry {
  if (skill.kind === "ai") {
    const endpoint = skill.endpoint ?? "/api/ai";
    const mode = skill.mode ?? "sync";
    let description = `${skill.blurb} Calls this system's endpoint ${endpoint} (${mode} mode).`;
    if (mode === "job") {
      description += ` Returns 202 { jobId } — poll GET ${endpoint}?jobId=<id> until the job is done.`;
    }
    return {
      type: "function",
      function: {
        name: skill.id.replace(/\./g, "_"),
        description,
        parameters: AI_TOOL_PARAMETERS[skill.id] ?? GENERIC_PARAMETERS,
      },
    };
  }

  return {
    type: "function",
    function: {
      name: `motion_${skill.id.replace(/\./g, "_")}`,
      description: `${skill.blurb} Fetch the full guide: GET /api/skills/${skill.id} — then apply its principles to the target.`,
      parameters: {
        type: "object",
        properties: {
          target: { type: "string", description: "The element/component/scene being animated" },
          context: { type: "string", description: "Constraints: frequency of use, purpose, brand personality" },
        },
        required: ["target"],
      },
    },
  };
}

/* ── the json format — light summaries ────────────────────────────── */

function summarize(skill: UnifiedSkill) {
  return {
    id: skill.id,
    kind: skill.kind,
    name: skill.name,
    source: skill.source,
    category: skill.category,
    blurb: skill.blurb,
    endpoint: skill.endpoint ?? null,
    mode: skill.mode ?? null,
    demo: skill.demo ?? null,
    runtime: skill.runtime,
    hasPrinciples: (skill.principles?.length ?? 0) > 0,
    recipeCount: skill.recipes?.length ?? 0,
  };
}

/* ── the md format — agent-system-prompt markdown ─────────────────── */

const FENCE = "```";

function listMarkdown(list: UnifiedSkill[], filters: string[]): string {
  const motion = list.filter((s) => s.kind === "motion");
  const ai = list.filter((s) => s.kind === "ai");
  const lines: string[] = [];

  lines.push(`# Skills Manifest — ${list.length} skills`);
  lines.push("");
  lines.push(
    "This system's full skill registry — motion/design craft distilled from five master animation sources, plus live AI engine skills served by its own REST endpoints. Written for any agent to consume: Claude, GPT, LangChain, n8n, or a local model. No SDK, no dialect, no lock-in."
  );
  lines.push("");
  lines.push(`This view: ${motion.length} motion skills, ${ai.length} AI engine skills.`);
  lines.push("");
  lines.push("Machine formats:");
  lines.push("");
  lines.push("- `GET /api/skills?format=json` — the registry as light summaries");
  lines.push("- `GET /api/skills?format=tools` — OpenAI-style function/tool manifest");
  lines.push("- `GET /api/skills?format=skillmd` — portable SKILL.md files, one per skill");
  lines.push("- `GET /api/skills/<id>?format=json` — one skill at full depth (principles + recipes)");
  lines.push("- `GET /api/skills/<id>?format=md` — one skill as a plain markdown brief");
  if (filters.length > 0) {
    lines.push("");
    lines.push(`Filters applied: ${filters.join(" · ")}`);
  }
  lines.push("");

  if (list.length === 0) {
    lines.push("_No skills matched the filters._");
    lines.push("");
  }

  for (const source of SKILL_SOURCES) {
    const group = motion.filter((s) => s.source.url === source.url);
    if (group.length === 0) continue;

    lines.push(`## ${source.label}`);
    lines.push("");
    lines.push(`> ${source.note}`);
    lines.push(`> Source: ${source.url}`);
    lines.push("");

    for (const skill of group) {
      lines.push(`### ${skill.name}`);
      lines.push("");
      lines.push(skill.blurb);
      lines.push("");
      lines.push(`- runtime: ${skill.runtime}`);
      for (const principle of skill.principles ?? []) lines.push(`- ${principle}`);
      lines.push("");
      for (const recipe of skill.recipes ?? []) {
        lines.push(`**${recipe.title}**`);
        lines.push("");
        lines.push(`${FENCE}${recipe.lang}`);
        lines.push(recipe.code);
        lines.push(FENCE);
        lines.push("");
      }
      if (skill.demo) {
        lines.push(`demo: ${skill.demo} — interactive at #/motion`);
        lines.push("");
      }
    }
  }

  if (ai.length > 0) {
    lines.push("## The 8 AI engine skills");
    lines.push("");
    lines.push(
      "Live capabilities served by this system's own REST endpoints — any agent calls them directly, no SDK and no model key. Full JSON schemas for every one: `GET /api/skills?format=tools`."
    );
    lines.push("");
    for (const skill of ai) {
      lines.push(
        `- **${skill.name}** — ${skill.blurb} \`${skill.endpoint ?? ""}\` (${skill.mode ?? "sync"} mode)`
      );
    }
    lines.push("");
  }

  return lines.join("\n");
}

/* ── the skillmd format — portable SKILL.md bundle ───────────── */

function skillMdFile(skill: UnifiedSkill): { path: string; name: string; description: string; content: string } {
  const slug = skill.id.replace(/[^a-z0-9]+/gi, "-").toLowerCase()
  const description = `${skill.blurb} (from ${skill.source.label})`
  const lines: string[] = []
  lines.push("---")
  lines.push(`name: ${skill.name}`)
  lines.push(`description: ${description.replace(/"/g, "'")}`)
  if (skill.source.url) lines.push(`source: ${skill.source.url}`)
  lines.push("---")
  lines.push("")
  lines.push(`# ${skill.name}`)
  lines.push("")
  lines.push(skill.blurb)
  lines.push("")
  if (skill.endpoint) {
    lines.push("## Endpoint")
    lines.push("")
    lines.push(`\`${skill.endpoint}\` — ${skill.mode ?? "sync"} mode.`)
    lines.push("")
  }
  if (skill.principles?.length) {
    lines.push("## Principles")
    lines.push("")
    for (const p of skill.principles) lines.push(`- ${p}`)
    lines.push("")
  }
  if (skill.recipes?.length) {
    lines.push("## Recipes")
    lines.push("")
    for (const r of skill.recipes) {
      lines.push(`### ${r.title}`)
      lines.push("")
      lines.push(`${FENCE}${r.lang}`)
      lines.push(r.code)
      lines.push(FENCE)
      lines.push("")
    }
  }
  lines.push("## Runtime in this system")
  lines.push("")
  lines.push(skill.runtime)
  lines.push("")
  return { path: `${slug}/SKILL.md`, name: skill.name, description, content: lines.join("\n") }
}

export async function GET(req: Request): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const format = (url.searchParams.get("format") ?? "json").trim().toLowerCase();
    const kind = url.searchParams.get("kind")?.trim().toLowerCase() ?? null;
    const category = url.searchParams.get("category")?.trim().toLowerCase() ?? null;
    const source = url.searchParams.get("source")?.trim().toLowerCase() ?? null;

    if (!(FORMATS as readonly string[]).includes(format)) {
      return json({ ok: false, error: `Unknown format "${format}" — use one of: json, tools, md, skillmd` }, 400);
    }
    if (kind && kind !== "motion" && kind !== "ai") {
      return json({ ok: false, error: `Unknown kind "${kind}" — use motion or ai` }, 400);
    }

    let list = ALL_SKILLS;
    if (kind) list = list.filter((s) => s.kind === kind);
    if (category) list = list.filter((s) => s.category === category);
    if (source) list = list.filter((s) => s.source.url.toLowerCase().includes(source));

    if (format === "tools") {
      return json({ ok: true, tools: list.map(toolEntry) });
    }
    if (format === "skillmd") {
      return json({
        ok: true,
        format: "skillmd",
        note: "One SKILL.md per skill, the portable layout every agent-skill system understands (Claude skills, .agents/skills, ClawHub). Save each file at its path.",
        count: list.length,
        files: list.map(skillMdFile),
      });
    }
    if (format === "md") {
      const filters: string[] = [];
      if (kind) filters.push(`kind=${kind}`);
      if (category) filters.push(`category=${category}`);
      if (source) filters.push(`source=${source}`);
      return markdown(listMarkdown(list, filters));
    }

    return json({
      ok: true,
      count: list.length,
      formats: FORMATS,
      kinds: {
        motion: list.filter((s) => s.kind === "motion").length,
        ai: list.filter((s) => s.kind === "ai").length,
      },
      sources: SKILL_SOURCES,
      skills: list.map(summarize),
    });
  } catch {
    return json({ ok: false, error: "The skills manifest is briefly unavailable." }, 500);
  }
}
