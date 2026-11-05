import { NextResponse } from "next/server";
import { ALL_SKILLS, findSkill, type UnifiedSkill } from "@/engine/motion-skills";

/**
 * GET /api/skills/<id> — one skill from the universal registry, at full
 * depth, in any of the three manifest formats:
 *
 *   ?format=json  (default) — the complete skill: principles and recipes
 *                 verbatim, the source credited, plus the ids of related
 *                 skills that share the same source
 *   ?format=md    — an agent-neutral markdown brief: name, source credit,
 *                 blurb, Principles, Recipes, Runtime. Plain markdown, no
 *                 YAML frontmatter, no dialect — any agent reads it.
 *   ?format=tools — the single OpenAI-style tool entry for this skill
 *
 * Unknown id → 404 { ok: false, error: "Unknown skill id" }
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FORMATS = ["json", "tools", "md"] as const;

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

/* ── the tools format — same entry shape as the list manifest ─────── */

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

/* ── the md format — agent-neutral markdown brief ─────────────────── */

const FENCE = "```";

function skillMarkdown(skill: UnifiedSkill): string {
  const lines: string[] = [];

  lines.push(`# ${skill.name}`);
  lines.push("");
  lines.push(`Source: ${skill.source.label} — ${skill.source.url}`);
  lines.push("");
  lines.push(skill.blurb);
  lines.push("");

  if (skill.kind === "ai") {
    lines.push("## Endpoint");
    lines.push("");
    lines.push(`\`POST ${skill.endpoint ?? "/api/ai"}\` (${skill.mode ?? "sync"} mode)`);
    lines.push("");
  } else {
    if ((skill.principles?.length ?? 0) > 0) {
      lines.push("## Principles");
      lines.push("");
      for (const principle of skill.principles ?? []) lines.push(`- ${principle}`);
      lines.push("");
    }
    if ((skill.recipes?.length ?? 0) > 0) {
      lines.push("## Recipes");
      lines.push("");
      for (const recipe of skill.recipes ?? []) {
        lines.push(`**${recipe.title}**`);
        lines.push("");
        lines.push(`${FENCE}${recipe.lang}`);
        lines.push(recipe.code);
        lines.push(FENCE);
        lines.push("");
      }
    }
  }

  lines.push("## Runtime");
  lines.push("");
  lines.push(skill.runtime);
  lines.push("");

  if (skill.demo) {
    lines.push(`Demo: ${skill.demo} — interactive at #/motion`);
    lines.push("");
  }

  return lines.join("\n");
}

/* ── the handler ──────────────────────────────────────────────────── */

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await ctx.params;
    const skill = findSkill(id);

    if (!skill) {
      console.error("[skills] unknown skill id:", id);
      return json({ ok: false, error: "Unknown skill id" }, 404);
    }

    const url = new URL(req.url);
    const format = (url.searchParams.get("format") ?? "json").trim().toLowerCase();

    if (!(FORMATS as readonly string[]).includes(format)) {
      return json({ ok: false, error: `Unknown format "${format}" — use one of: json, tools, md` }, 400);
    }

    if (format === "tools") {
      return json({ ok: true, tools: [toolEntry(skill)] });
    }
    if (format === "md") {
      return markdown(skillMarkdown(skill));
    }

    const related = ALL_SKILLS.filter((s) => s.id !== skill.id && s.source.url === skill.source.url).map(
      (s) => s.id
    );

    return json({
      ok: true,
      skill: {
        ...skill,
        credit: `${skill.source.label} (${skill.source.url})`,
        related,
      },
    });
  } catch {
    return json({ ok: false, error: "The skill detail service is briefly unavailable." }, 500);
  }
}
