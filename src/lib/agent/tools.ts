// ─── Tool layer: small, typed, single-purpose tools the agent may call ───
import { chat, chatStream, extractUrl } from "@/lib/ai/llm"
import {
  ANALYZE_PROMPT,
  CLARIFY_PROMPT,
  EDIT_PROMPT,
  GEN_BODY_PROMPT,
  GEN_HEAD_PROMPT,
  KNOWLEDGE_PROMPT,
} from "@/lib/agent/prompts"
import type { ChatMessage } from "@/lib/ai/llm"
import type { DesignSeed } from "@/lib/gos/types"

// ── tool: site.generate — two-stage pipeline (head+CSS, then body) ───────
// Both stages STREAM: every token the model writes is forwarded through
// onProgress so the preview renders the document as it is composed.

export type BuildStage = "design" | "document"
export type BuildProgress = (stage: BuildStage, delta: string) => void

export interface GenerateResult {
  name: string
  designSeed: DesignSeed
  html: string
  stages: string[]
}

export async function siteGenerate(
  brief: string,
  history: string[],
  onProgress?: BuildProgress,
): Promise<GenerateResult> {
  const context =
    history.length > 0
      ? `\n\n## CONVERSATION CONTEXT (honor details the user already gave):\n${history.map((h) => `- ${h}`).join("\n")}`
      : ""

  // Stage 1 — art direction: design seed + head with full CSS (streamed)
  let stage1 = ""
  for await (const delta of chatStream([
    { role: "assistant", content: GEN_HEAD_PROMPT },
    {
      role: "user",
      content: `Build the head stage for this brief:${context}\n\n## BRIEF\n${brief}`,
    },
  ])) {
    stage1 += delta
    onProgress?.("design", delta)
  }

  const head = extractSection(stage1, "===HEAD===")
  let designSeed: DesignSeed = {}
  const designBlock = extractSection(stage1, "===DESIGN===")
  if (designBlock) {
    const first = designBlock.indexOf("{")
    const last = designBlock.lastIndexOf("}")
    if (first !== -1 && last > first) {
      try {
        designSeed = JSON.parse(designBlock.slice(first, last + 1)) as DesignSeed
      } catch {
        designSeed = {}
      }
    }
  }
  if (!head || !/<style/i.test(head)) {
    throw new Error("Stage 1 (design/CSS) returned an invalid head — retry the build")
  }

  // Stage 2 — the complete document using the exact classes from stage 1 (streamed)
  const css = head.match(/<style[\s\S]*?<\/style>/i)?.[0] ?? ""
  let stage2 = ""
  for await (const delta of chatStream([
    { role: "assistant", content: GEN_BODY_PROMPT },
    {
      role: "user",
      content: `## DESIGN SEED\n${JSON.stringify(designSeed)}\n\n## THE CSS YOU MUST USE (classes are already defined — reuse them exactly)\n${css}\n\n## BRIEF\n${brief}\n\nProduce the complete <body> now.`,
    },
  ])) {
    stage2 += delta
    onProgress?.("document", delta)
  }

  let body = extractSection(stage2, "===BODY===")
  if (!body) {
    // Fallback: whole output may be the body
    body = stage2.trim()
  }
  if (!/<body/i.test(body)) {
    throw new Error("Stage 2 (body) returned no document — retry the build")
  }
  body = normalizeBody(body)

  const name =
    (designSeed as { name?: string }).name?.trim() ||
    deriveName(brief)

  return {
    name,
    designSeed,
    html: `${head.trim()}\n${body.trim()}`,
    stages: ["design+css", "body"],
  }
}

// ── tool: site.edit — CSS patch + full body regeneration ─────────────────

export interface EditResult {
  name: string
  html: string
  patch: string
}

export async function siteEdit(
  currentHtml: string,
  instruction: string,
  currentName: string,
  onProgress?: BuildProgress,
): Promise<EditResult> {
  let raw = ""
  for await (const delta of chatStream([
    { role: "assistant", content: EDIT_PROMPT },
    {
      role: "user",
      content: `## CURRENT SITE NAME\n${currentName}\n\n## CHANGE REQUEST\n${instruction}\n\n## CURRENT DOCUMENT\n${currentHtml}`,
    },
  ])) {
    raw += delta
    onProgress?.("document", delta)
  }

  const name = extractSection(raw, "===NAME===")?.trim() || currentName
  let patch = cleanPatch(extractSection(raw, "===PATCH===") ?? "")
  let body = extractSection(raw, "===BODY===")

  if (!body || !/<body/i.test(body)) {
    throw new Error("The edit returned no body — retry the change")
  }
  body = normalizeBody(body)

  // Keep the original head; append the patch stylesheet just before </head>
  const head = currentHtml.slice(0, currentHtml.toLowerCase().indexOf("<body"))
  let html = `${head.trim()}\n${body.trim()}`
  if (patch && !/^(\s*|\/\*.*\*\/\s*)$/.test(patch)) {
    const patchStyle = `\n<style>\n/* v-next overrides */\n${patch}\n</style>`
    html = html.replace(/<\/head>/i, `${patchStyle}\n</head>`)
  }
  // If renamed, keep the document title in sync
  if (name !== currentName) {
    const safeName = name.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeName}</title>`)
  }

  return { name, html, patch }
}

// ── tool: site.analyze ───────────────────────────────────────────────────

export interface AnalyzeResult {
  analysis: string
  fetched: boolean
  url: string | null
}

export async function siteAnalyze(query: string): Promise<AnalyzeResult> {
  const url = extractUrl(query)
  let pageText = ""
  let fetched = false

  if (url) {
    try {
      const res = await fetch(url, {
        headers: { "user-agent": "Mozilla/5.0 (compatible; GrowthOS/1.0)" },
        signal: AbortSignal.timeout(10000),
      })
      if (res.ok) {
        const body = await res.text()
        pageText = body
          .replace(/<script[\s\S]*?<\/script>/gi, " ")
          .replace(/<style[\s\S]*?<\/style>/gi, " ")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 6000)
        fetched = pageText.length > 100
      }
    } catch {
      fetched = false
    }
  }

  const reference = fetched
    ? `URL: ${url}\n\nFETCHED PAGE TEXT:\n${pageText}`
    : url
      ? `URL: ${url} (could not fetch — analyze from the URL itself and general knowledge of the domain, and say the fetch failed)`
      : `USER-DESCRIBED REFERENCE:\n${query}`

  const analysis = await chat([
    { role: "assistant", content: ANALYZE_PROMPT },
    { role: "user", content: `Analyze this reference:\n\n${reference}` },
  ])

  return { analysis, fetched, url }
}

// ── tool: knowledge.answer ───────────────────────────────────────────────

export async function knowledgeAnswer(
  question: string,
  history: ChatMessage[],
  memories: string[],
): Promise<string> {
  const historyBlock =
    history.length > 0
      ? `\n## RECENT CONVERSATION\n${history
          .map((h) => `${h.role === "user" ? "User" : "Assistant"}: ${h.content.slice(0, 300)}`)
          .join("\n")}`
      : ""
  const memoryBlock =
    memories.length > 0
      ? `\n## KNOWN FACTS ABOUT THIS USER (memory)\n${memories.map((m) => `- ${m}`).join("\n")}`
      : ""

  return chat([
    { role: "assistant", content: KNOWLEDGE_PROMPT },
    {
      role: "user",
      content: `${memoryBlock}${historyBlock}\n## QUESTION\n${question}`,
    },
  ])
}

// ── tool: clarify (structured questions) ─────────────────────────────────

export async function clarifyReply(questions: string[]): Promise<string> {
  const list =
    questions.length > 0
      ? questions.join("\n")
      : "What is this for?\nWhose voice should it have?\nAnything you refuse to compromise on?"
  return chat([
    { role: "assistant", content: CLARIFY_PROMPT },
    { role: "user", content: `User request to clarify around:\n${list}` },
  ])
}

// ── helpers ──────────────────────────────────────────────────────────────

/** Extract the content after a ===MARKER=== (up to the next marker or EOF). */
function extractSection(raw: string, marker: string): string | null {
  const idx = raw.indexOf(marker)
  if (idx === -1) return null
  const rest = raw.slice(idx + marker.length)
  // Stop at the next === marker if present
  const next = rest.indexOf("===")
  return (next === -1 ? rest : rest.slice(0, next)).trim()
}

/** Normalize a body fragment: start at <body, end at </body></html>, no strays. */
function normalizeBody(body: string): string {
  let b = body
  const bIdx = b.toLowerCase().indexOf("<body")
  if (bIdx > 0) b = b.slice(bIdx)
  // Drop any stray </html> that appears before </body>
  const closeBody = b.toLowerCase().lastIndexOf("</body>")
  const strayHtml = b.toLowerCase().indexOf("</html>")
  if (closeBody !== -1 && strayHtml !== -1 && strayHtml < closeBody) {
    b = b.slice(0, strayHtml) + b.slice(strayHtml + 7)
  }
  if (!/<\/body>/i.test(b)) b += "\n</body>"
  if (!/<\/html>/i.test(b)) b += "\n</html>"
  return b.trim()
}

/** Strip echoed format-spec comments out of a CSS patch. */
function cleanPatch(patch: string): string {
  return patch
    .replace(/\/\*[\s\S]*?\*\//g, (c) =>
      /OVERRIDES ONLY|Write EMPTY|re-declaring|FORMAT/i.test(c) ? "" : c,
    )
    .trim()
}

function deriveName(brief: string): string {
  const cleaned = brief
    .replace(/^(build|make|create|design)\s+(me\s+)?(a|an|the)?\s*/i, "")
    .replace(/\s+(website|site|landing page|web ?site)\s*(for|about|of)?\s*/i, " ")
    .trim()
  const words = cleaned.split(/\s+/).slice(0, 5).join(" ")
  const name = words || "New site"
  return name.charAt(0).toUpperCase() + name.slice(1)
}
