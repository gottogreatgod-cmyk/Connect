// ─── Orchestrator: the agent loop of Growth OS ───────────────────────────
// receive → load context → classify → plan → tool → verify → remember → respond
// Every transition is streamed out so the interface can show the engine working.
import { db } from "@/lib/db"
import { chat, extractJson } from "@/lib/ai/llm"
import type { ChatMessage as LlmMessage } from "@/lib/ai/llm"
import {
  knowledgeAnswer,
  siteAnalyze,
  siteEdit,
  siteGenerate,
  clarifyReply,
  type BuildProgress,
  type BuildStage,
} from "@/lib/agent/tools"
import { CLASSIFIER_PROMPT } from "@/lib/agent/prompts"
import { verifyHtml } from "@/lib/agent/verify"
import { awaitVideo, generateImage, speak, startVideo } from "@/lib/media/sdk"
import {
  layerForStep,
  type AgentResponse,
  type AgentStep,
  type DesignSeed,
  type Intent,
  type LayerId,
  type MediaRef,
  type SiteMeta,
  type StreamEvent,
} from "@/lib/gos/types"

interface Classification {
  intent: Intent
  confidence: number
  reasoning: string
  memory?: { key: string; body: string }
  clarify?: string[]
  medium?: "image" | "video" | "speech"
  media_prompt?: string
}

interface RunInput {
  message: string
  conversationId?: string
  siteId?: string
}

type Emit = (event: StreamEvent) => void

const uid = () => Math.random().toString(36).slice(2, 9)

function safeParse<T>(s: string, fallback: T): T {
  try {
    return JSON.parse(s) as T
  } catch {
    return fallback
  }
}

/** Reveal text progressively — the response phase of the loop, streamed. */
async function streamReply(reply: string, emit: Emit): Promise<void> {
  emit({ type: "reply_start" })
  const words = reply.split(/(\s+)/) // keep whitespace tokens
  const chunkTarget = Math.max(2, Math.ceil(words.length / 60)) // ≤ ~60 deltas
  let buf: string[] = []
  const flush = async () => {
    if (buf.length) {
      emit({ type: "reply_delta", delta: buf.join("") })
      buf = []
      await new Promise((r) => setTimeout(r, 30))
    }
  }
  for (let i = 0; i < words.length; i++) {
    buf.push(words[i])
    if (buf.length >= chunkTarget) await flush()
  }
  await flush()
}

export async function runAgent(input: RunInput, emit: Emit = () => {}): Promise<AgentResponse> {
  const t0 = Date.now()
  const steps: AgentStep[] = []
  let activeLayer: LayerId | null = null

  const setLayer = (layer: LayerId | null) => {
    if (activeLayer !== layer) {
      activeLayer = layer
      emit({ type: "layer", layer })
    }
  }

  const step = (label: string, detail?: string): string => {
    const id = uid()
    const s: AgentStep = { id, label, detail, status: "active", layer: layerForStep(label) }
    steps.push(s)
    setLayer(s.layer ?? null)
    emit({ type: "step", step: s })
    return id
  }
  const patch = (id: string, status: AgentStep["status"], detail?: string) => {
    const s = steps.find((x) => x.id === id)
    if (!s) return
    s.status = status
    s.ms = Date.now() - t0
    if (detail !== undefined) s.detail = detail
    emit({ type: "step", step: { ...s } })
  }
  const done = (id: string, detail?: string) => patch(id, "done", detail)
  const fail = (id: string, detail: string) => patch(id, "error", detail)

  // ── ensure conversation ────────────────────────────────────────────────
  let conversation = input.conversationId
    ? await db.conversation.findUnique({ where: { id: input.conversationId } })
    : null
  if (!conversation) {
    conversation = await db.conversation.create({
      data: { title: input.message.slice(0, 60) },
    })
  }
  const conversationId = conversation.id
  emit({ type: "run_start", conversationId })

  await db.message.create({
    data: { conversationId, role: "user", content: input.message },
  })

  // ── context engine: history + site + memory ───────────────────────────
  const ctxId = step("Load context", "history · site state · memory")
  const [history, site, memories] = await Promise.all([
    db.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: 12,
    }),
    input.siteId
      ? db.site.findUnique({ where: { id: input.siteId } })
      : db.site.findFirst({ where: { conversationId }, orderBy: { updatedAt: "desc" } }),
    db.memory.findMany({ orderBy: { updatedAt: "desc" }, take: 20 }),
  ])
  done(
    ctxId,
    `${history.length} messages · ${site ? `site "${site.name}" v${site.version}` : "no site yet"} · ${memories.length} memories`,
  )

  const historyText = history.slice(-8).map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content.slice(0, 240)}`)
  const memoryLines = memories.map((m) => `${m.scope}:${m.key} — ${m.body}`)

  // ── classify ───────────────────────────────────────────────────────────
  const clsId = step("Classify intent", "routing through the agent loop")
  let cls: Classification = { intent: "question", confidence: 0.5, reasoning: "fallback" }
  try {
    const raw = await chat([
      { role: "assistant", content: CLASSIFIER_PROMPT },
      {
        role: "user",
        content: `CURRENT SITE: ${site ? `"${site.name}" (v${site.version}) exists — edits are possible` : "none"}\n\nCONVERSATION:\n${historyText.join("\n") || "(new)"}\n\nMESSAGE TO CLASSIFY:\n${input.message}`,
      },
    ])
    const parsed = extractJson<Classification>(raw)
    if (parsed?.intent) cls = parsed
  } catch {
    // keep fallback intent
  }
  done(clsId, `${cls.intent} (${Math.round((cls.confidence ?? 0.5) * 100)}%) — ${cls.reasoning ?? ""}`.trim())
  emit({
    type: "intent",
    intent: cls.intent,
    confidence: cls.confidence ?? 0.5,
    reasoning: cls.reasoning ?? "",
  })

  let reply = ""
  let verification: AgentResponse["verification"] | undefined
  let siteMeta: (SiteMeta & { html?: string }) | undefined
  let clarify: string[] | undefined
  const mediaRefs: MediaRef[] = []

  const toolCount = () => steps.filter((s) => s.label.startsWith("tool:")).length

  try {
    // ── route to tool ──────────────────────────────────────────────────
    switch (cls.intent) {
      case "new_site":
      case "edit_site": {
        const isEdit = cls.intent === "edit_site" && !!site
        const toolId = step(
          isEdit ? "tool: site.edit" : "tool: site.generate",
          isEdit ? "applying change · CSS patch + body" : "stage 1: art direction + full CSS",
        )

        // ── live build streaming → the preview renders code as it's written ──
        const initialPhase: BuildStage = isEdit ? "document" : "design"
        let buildPhase: BuildStage = initialPhase
        let buildChars = 0
        let batch = ""
        let batchTimer: ReturnType<typeof setTimeout> | null = null
        let lastDetail = 0
        const flushBatch = () => {
          if (batch) {
            emit({ type: "build_delta", phase: buildPhase, delta: batch })
            batch = ""
          }
          batchTimer = null
        }
        const onProgress: BuildProgress = (stage, delta) => {
          if (stage !== buildPhase) {
            flushBatch()
            buildPhase = stage
            emit({
              type: "build_phase",
              phase: stage,
              label:
                stage === "design"
                  ? "Art direction — writing the design system"
                  : "Composing the document — sections stream in live",
            })
          }
          batch += delta
          buildChars += delta.length
          const now = Date.now()
          if (now - lastDetail > 1100) {
            lastDetail = now
            patch(
              toolId,
              "active",
              `${buildPhase === "design" ? "writing CSS" : "writing the document"} — ${(buildChars / 1024).toFixed(1)}KB`,
            )
          }
          if (!batchTimer) batchTimer = setTimeout(flushBatch, 200)
        }
        emit({
          type: "build_phase",
          phase: initialPhase,
          label: isEdit
            ? "Applying the change — document streams in live"
            : "Art direction — writing the design system",
        })

        let genName: string
        let genHtml: string
        let genSeed: DesignSeed
        try {
          if (isEdit && site) {
            const edit = await siteEdit(site.html, input.message, site.name, onProgress)
            genName = edit.name
            genHtml = edit.html
            genSeed = site.designSeed ? safeParse<DesignSeed>(site.designSeed, {}) : {}
          } else {
            const gen = await siteGenerate(input.message, historyText.slice(0, -1), onProgress)
            genName = gen.name
            genHtml = gen.html
            genSeed = gen.designSeed
          }
        } finally {
          if (batchTimer) clearTimeout(batchTimer)
          flushBatch()
        }
        emit({ type: "build_phase", phase: "complete", label: "Document complete — verifying" })

        // ── verify ────────────────────────────────────────────────────
        const verId = step("Verify build", "structural + richness checks")
        verification = verifyHtml(genHtml)
        done(verId, `score ${verification.score}/100`)
        emit({ type: "verification", verification })

        // ── persist ───────────────────────────────────────────────────
        const saveId = step("Persist site", "versioned snapshot")
        let saved
        if (isEdit && site) {
          saved = await db.site.update({
            where: { id: site.id },
            data: {
              name: genName,
              html: genHtml,
              designSeed: JSON.stringify(genSeed),
              score: verification.score,
              checks: JSON.stringify(verification.checks),
              version: { increment: 1 },
            },
          })
        } else {
          saved = await db.site.create({
            data: {
              name: genName || "Untitled site",
              brief: input.message.slice(0, 200),
              html: genHtml,
              designSeed: JSON.stringify(genSeed),
              score: verification.score,
              checks: JSON.stringify(verification.checks),
              conversationId,
            },
          })
        }
        siteMeta = {
          id: saved.id,
          name: saved.name,
          brief: saved.brief,
          score: saved.score,
          version: saved.version,
          designSeed: genSeed,
          createdAt: saved.createdAt.toISOString(),
          updatedAt: saved.updatedAt.toISOString(),
          html: genHtml,
        }
        emit({ type: "site", site: siteMeta })
        done(saveId, `"${saved.name}" v${saved.version} stored`)
        done(
          toolId,
          isEdit
            ? `"${saved.name}" updated to v${saved.version}`
            : `"${saved.name}" v${saved.version} · ${(genHtml.length / 1024).toFixed(0)}KB · 2 stages`,
        )

        const seedBits = [
          genSeed.palette && `palette: ${genSeed.palette}`,
          genSeed.typography && `type: ${genSeed.typography}`,
          genSeed.archetype && `archetype: ${genSeed.archetype}`,
          genSeed.motion && `motion: ${genSeed.motion}`,
          genSeed.voice && `voice: ${genSeed.voice}`,
        ].filter(Boolean)

        reply = isEdit
          ? `Done — **${saved.name}** updated to **v${saved.version}**. ${verification.score >= 80 ? "All structural checks passed" : `Verification score: ${verification.score}/100`}. The preview is live; ask for any further change.`
          : `Built **${saved.name}** — it's rendering in the preview panel now.\n\n${seedBits.length ? `**Design seed** — ${seedBits.join(" · ")}\n\n` : ""}Verification: **${verification.score}/100** (${verification.checks.filter((c) => c.pass).length}/${verification.checks.length} checks). Ask me to change anything — colors, copy, sections, layout — and I'll regenerate it.`

        // memory: remember the build
        const memId = step("Write memory", "project state")
        await db.memory.upsert({
          where: { scope_key: { scope: "project", key: `site:${saved.id}` } },
          create: {
            scope: "project",
            key: `site:${saved.id}`,
            body: `${saved.name} — ${genSeed.archetype ?? "custom"} archetype, v${saved.version}`,
          },
          update: {
            body: `${saved.name} — ${genSeed.archetype ?? "custom"} archetype, v${saved.version}`,
          },
        })
        done(memId, `project:site:${saved.id}`)
        break
      }

      case "media": {
        const medium = cls.medium ?? "image"
        const mediaPrompt = (cls.media_prompt ?? "").trim() || input.message

        if (medium === "image") {
          const toolId = step("tool: media.image", "composing the image")
          const { base64, mimeType } = await generateImage(mediaPrompt, "1024x1024")
          const row = await db.media.create({
            data: {
              kind: "image",
              prompt: mediaPrompt.slice(0, 500),
              data: base64,
              mimeType,
              conversationId,
            },
          })
          const ref: MediaRef = { id: row.id, kind: "image", prompt: mediaPrompt }
          mediaRefs.push(ref)
          emit({ type: "media", media: ref })
          done(toolId, "image rendered · stored")
          reply = `Here's the image — **${mediaPrompt.slice(0, 120)}**.\n\nIt's stored in the media library (Studio → Photos). Want a variation, a different aspect ratio, or should this become part of a site?`
        } else if (medium === "speech") {
          const toolId = step("tool: media.speak", "synthesizing the voice track")
          const text = mediaPrompt.slice(0, 1024)
          const { buffer, mimeType } = await speak(text, "tongtong", 1.0)
          const row = await db.media.create({
            data: {
              kind: "audio",
              prompt: text.slice(0, 500),
              data: buffer.toString("base64"),
              mimeType,
              conversationId,
            },
          })
          const ref: MediaRef = { id: row.id, kind: "audio", prompt: text }
          mediaRefs.push(ref)
          emit({ type: "media", media: ref })
          done(toolId, `${(buffer.length / 1024).toFixed(0)}KB voice track`)
          reply = `Spoken — the audio track is playable below and saved in Studio → Text → Voice. Want a different voice or pace? Say the word.`
        } else {
          // video — async render, streamed with live progress
          const toolId = step("tool: media.video", "starting the render task")
          const task = await startVideo(mediaPrompt, "speed", true)
          const row = await db.media.create({
            data: {
              kind: "video",
              prompt: mediaPrompt.slice(0, 500),
              ref: task.taskId,
              mimeType: "video/mp4",
              status: "rendering",
              conversationId,
            },
          })
          const result = await awaitVideo(task.taskId, {
            timeoutMs: 230_000,
            intervalMs: 5_000,
            onTick: (ms) => patch(toolId, "active", `rendering — ${(ms / 1000).toFixed(0)}s elapsed`),
          })

          if (result.status === "SUCCESS" && result.url) {
            await db.media.update({
              where: { id: row.id },
              data: { url: result.url, status: "done" },
            })
            const ref: MediaRef = { id: row.id, kind: "video", prompt: mediaPrompt, url: result.url }
            mediaRefs.push(ref)
            emit({ type: "media", media: ref })
            done(toolId, "render complete · playing below")
            reply = `Render finished — the clip is playing below and saved in Studio → Video. Ask for another take, a different scene, or let me turn this into a site.`
          } else if (result.status === "PROCESSING") {
            const ref: MediaRef = { id: row.id, kind: "video", prompt: mediaPrompt, pending: true }
            mediaRefs.push(ref)
            emit({ type: "media", media: ref })
            done(toolId, `still rendering — tracked in Studio`)
            reply = `The render is taking longer than this run could wait — it's still going in the background.\n\nOpen **Studio → Video** and it will appear the moment the render farm finishes. The task is tracked, nothing is lost.`
          } else {
            await db.media.update({ where: { id: row.id }, data: { status: "failed" } })
            fail(toolId, "render farm reported a failure")
            reply = `The video render failed on the farm's side. Try again — often a slightly simpler scene description goes through.`
          }
        }
        break
      }

      case "analyze": {
        const toolId = step("tool: site.analyze", "fetching + reading reference")
        const result = await siteAnalyze(input.message)
        done(
          toolId,
          result.fetched ? `fetched ${result.url}` : result.url ? `fetch failed — inferred` : "from description",
        )
        reply = result.analysis
        break
      }

      case "clarify": {
        const toolId = step("tool: clarify", "asking structured questions")
        clarify = (cls.clarify ?? []).slice(0, 3)
        reply = await clarifyReply(clarify)
        done(toolId, `${clarify.length} questions`)
        break
      }

      case "remember": {
        const toolId = step("tool: memory.write", "storing durable fact")
        const key = cls.memory?.key || input.message.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 40)
        const body = cls.memory?.body || input.message
        await db.memory.upsert({
          where: { scope_key: { scope: "user", key } },
          create: { scope: "user", key, body },
          update: { body },
        })
        done(toolId, `user:${key}`)
        reply = `Remembered: **${body}**\n\nI'll recall this into every future run — builds, analysis, and answers.`
        break
      }

      case "question":
      default: {
        const toolId = step("tool: knowledge.answer", "system knowledge + context")
        reply = await knowledgeAnswer(input.message, history.slice(0, -1) as LlmMessage[], memoryLines)
        done(toolId, "answered with system context")
        break
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    fail(steps[steps.length - 1]?.id ?? steps[0].id, msg)
    reply = `I hit an error while working on that: ${msg}\n\nPlease try again — the loop is resilient, a retry usually clears it.`
  }

  // ── respond + persist ──────────────────────────────────────────────────
  const repId = step("Compose reply", "streaming to the interface")
  await streamReply(reply, emit)
  done(repId, `${reply.length} chars`)

  const meta = {
    intent: cls.intent,
    steps,
    siteId: siteMeta?.id,
    verification,
    media: mediaRefs.length > 0 ? mediaRefs : undefined,
  }
  const assistantMessage = await db.message.create({
    data: { conversationId, role: "assistant", content: reply, meta: JSON.stringify(meta) },
  })

  await db.agentRun.create({
    data: {
      conversationId,
      task: input.message.slice(0, 200),
      intent: cls.intent,
      steps: JSON.stringify(steps),
      toolCalls: toolCount(),
      durationMs: Date.now() - t0,
      success: !steps.some((s) => s.status === "error"),
    },
  })

  setLayer(null)

  const response: AgentResponse = {
    conversationId,
    messageId: assistantMessage.id,
    reply,
    intent: cls.intent,
    steps,
    site: siteMeta,
    verification,
    clarify,
    media: mediaRefs.length > 0 ? mediaRefs : undefined,
  }
  emit({ type: "done", response })
  return response
}
