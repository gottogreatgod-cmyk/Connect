import { NextResponse } from 'next/server'
import { getZAI } from '@/lib/sdk'
import {
  createPipelineJob,
  failJob,
  finishJob,
  getPipelineJob,
  updateStep,
  type PipelineStep,
} from '@/lib/jobs'
import { getCatalogModule, getCatalogVariant, MODULE_CATALOG } from '@/data/module-catalog'
import type { ModuleInstance, VariantId } from '@/modules/types'

export const dynamic = 'force-dynamic'

/* ----------------------------- LLM catalog ------------------------------- */

/** Compact preview of a default value for the planning prompt. */
function previewValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.length > 110 ? `${value.slice(0, 110)}…` : value
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return []
    const first = previewValue(value[0])
    return value.length > 1 ? [first] : [first]
  }
  return value
}

function buildCatalogForPrompt() {
  return MODULE_CATALOG.map((module) => ({
    id: module.id,
    name: module.name,
    section: module.section,
    purpose: module.purpose,
    variants: module.variants.map((variant) => ({
      id: variant.id,
      label: variant.label,
      description: variant.description,
      props: Object.fromEntries(
        Object.entries(variant.defaults).map(([key, value]) => [key, previewValue(value)]),
      ),
      imageProps: variant.imageProps ?? [],
    })),
  }))
}

/* ------------------------------ Plan types -------------------------------- */

interface PlannedModule {
  moduleId?: string
  variantId?: string
  props?: Record<string, unknown>
  images?: Record<string, string>
}

interface Plan {
  siteName?: string
  modules?: PlannedModule[]
}

/** Extract the first balanced JSON object from a model response. */
function extractJson(text: string): unknown {
  const cleaned = text.replace(/```json|```/g, '').trim()
  const start = cleaned.indexOf('{')
  if (start < 0) throw new Error('No JSON object found in the response.')
  let depth = 0
  let inString = false
  let escaped = false
  for (let i = start; i < cleaned.length; i++) {
    const char = cleaned[i]
    if (escaped) {
      escaped = false
      continue
    }
    if (char === '\\') {
      escaped = true
      continue
    }
    if (char === '"') inString = !inString
    if (inString) continue
    if (char === '{') depth++
    if (char === '}') {
      depth--
      if (depth === 0) {
        return JSON.parse(cleaned.slice(start, i + 1))
      }
    }
  }
  throw new Error('Unbalanced JSON in the response.')
}

/* --------------------------- Context gathering ---------------------------- */

function htmlToText(html: string, maxLength = 3500): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

/* ------------------------------ The pipeline ------------------------------ */

interface BuildBody {
  brief?: string
  url?: string
  research?: boolean
  customImagery?: boolean
  vlmDescription?: string
}

async function runBuildJob(jobId: string, body: BuildBody) {
  const job = getPipelineJob(jobId)
  if (!job) return
  const brief = (body.brief ?? '').trim().slice(0, 1500)

  try {
    /* ---- Step: page reader (existing site) ---- */
    let siteContext = ''
    const readerIndex = job.steps.findIndex((step) => step.skill === 'page-reader')
    if (readerIndex >= 0 && body.url) {
      updateStep(jobId, readerIndex, { status: 'running' })
      try {
        const zai = await getZAI()
        const read = await zai.functions.invoke('page_reader', { url: body.url })
        if (read?.data?.html) {
          siteContext = `EXISTING WEBSITE CONTENT (${body.url}, title: ${read.data.title ?? ''}):\n${htmlToText(read.data.html)}`
        }
        updateStep(jobId, readerIndex, { status: 'done' })
      } catch (err) {
        updateStep(jobId, readerIndex, {
          status: 'done',
          detail: 'site unreachable — continuing without it',
        })
        console.error('[copilot] page_reader failed:', err)
      }
    }

    /* ---- Step: web search (market research) ---- */
    let researchContext = ''
    const searchIndex = job.steps.findIndex((step) => step.skill === 'search')
    if (searchIndex >= 0 && body.research) {
      updateStep(jobId, searchIndex, { status: 'running' })
      try {
        const zai = await getZAI()
        // Search engines reject long natural briefs — use the first clean sentence
        const searchQuery = brief.split(/[.—\n;]/)[0].trim().slice(0, 80)
        const results = await zai.functions.invoke('web_search', {
          query: searchQuery,
          num: 5,
        })
        if (Array.isArray(results) && results.length > 0) {
          researchContext = `MARKET RESEARCH:\n${results
            .map((r) => `- ${r.name}: ${r.snippet}`)
            .join('\n')
            .slice(0, 2500)}`
        }
        updateStep(jobId, searchIndex, { status: 'done', detail: `${results?.length ?? 0} sources` })
      } catch (err) {
        updateStep(jobId, searchIndex, { status: 'done', detail: 'skipped' })
        console.error('[copilot] web_search failed:', err)
      }
    }

    /* ---- Step: LLM planning ---- */
    const llmIndex = job.steps.findIndex((step) => step.skill === 'llm')
    if (llmIndex < 0) throw new Error('Missing LLM step.')
    updateStep(jobId, llmIndex, { status: 'running' })

    const systemPrompt = `You are the AI Copilot of a website studio. You design page compositions from modules.

You receive: a CATALOG of modules (each with exactly 2 design paths, "a" and "b", and the props each path accepts), a client BRIEF describing a business, and optional CONTEXT (existing site copy, a reference-image description, market research).

Your job: choose 8 to 12 modules that build the most effective single page for this business, then write complete, specific, business-appropriate copy for every prop of every chosen variant.

Rules:
- The first module MUST be "site-header" (optionally preceded by "announcement-bar"). The last module MUST be "site-footer".
- Pick sections that fit the business (e.g. restaurant → menu-board, location, review-carousel; salon → booking-panel, team-grid; SaaS → pricing-table, integration-cloud, faq-accordion). Always include: hero, at least one value module, at least one proof module, and at least one conversion module.
- Mix design paths deliberately (do not default everything to "a").
- For every chosen variant, fill EVERY prop key with the same type/structure as the catalog example, but with copy specific to THIS business. Arrays keep the same item count as the catalog example (±2 items). Never output placeholder text.
- For props listed in imageProps: do NOT put URLs in props. Instead add "images": { "<propKey>": "<a concrete visual photo search query, e.g. 'wood-fired pizza oven with flames, warm light'>" }.
- "siteName": a short, plausible business name (from the brief or invented to fit).

Respond with STRICT JSON only — no markdown fences, no commentary. Shape:
{ "siteName": "…", "modules": [ { "moduleId": "…", "variantId": "a" or "b", "props": { … }, "images": { "propKey": "query" } } ] }`

    const contextParts = [siteContext, researchContext]
    if (body.vlmDescription) {
      contextParts.push(`REFERENCE IMAGE DESCRIPTION:\n${body.vlmDescription.slice(0, 1200)}`)
    }
    const context = contextParts.filter(Boolean).join('\n\n')

    const userPrompt = `CATALOG:\n${JSON.stringify(buildCatalogForPrompt())}\n\nBRIEF:\n${brief}${context ? `\n\nCONTEXT:\n${context}` : ''}`

    const zai = await getZAI()
    let plan: Plan | undefined
    let lastError: unknown
    for (let attempt = 0; attempt < 2 && !plan; attempt++) {
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'assistant', content: systemPrompt },
          {
            role: 'user',
            content: attempt === 0 ? userPrompt : `${userPrompt}\n\nYour previous reply was not valid JSON (${String(lastError).slice(0, 200)}). Reply again with STRICT JSON only.`,
          },
        ],
        thinking: { type: 'disabled' },
      })
      const text = completion.choices[0]?.message?.content ?? ''
      try {
        plan = extractJson(text) as Plan
      } catch (err) {
        lastError = err
      }
    }
    if (!plan || !Array.isArray(plan.modules)) {
      throw new Error('The planner could not produce a valid page plan. Please try again.')
    }
    updateStep(jobId, llmIndex, {
      status: 'done',
      detail: `${plan.modules.length} modules planned`,
    })

    /* ---- Step: imagery (image search or image generation) ---- */
    const imageIndex = job.steps.findIndex((step) => step.skill === 'image-search' || step.skill === 'image-gen')
    const imageSteps = job.steps
      .map((step, index) => ({ step, index }))
      .filter(({ step }) => step.skill === 'image-search' || step.skill === 'image-gen')

    // Collect image jobs: [moduleIndex, propKey, query]
    const imageJobs: Array<{ moduleIndex: number; propKey: string; query: string }> = []
    const plannedForImages: PlannedModule[] = plan.modules ?? []
    plannedForImages.forEach((planned, moduleIndex) => {
      if (!planned?.images || typeof planned.images !== 'object') return
      for (const [propKey, query] of Object.entries(planned.images)) {
        if (typeof query === 'string' && query.trim() && imageJobs.length < 6) {
          imageJobs.push({ moduleIndex, propKey, query: query.trim().slice(0, 200) })
        }
      }
    })

    if (imageJobs.length > 0 && imageSteps.length > 0) {
      for (const { index } of imageSteps) updateStep(jobId, index, { status: 'running' })

      const resolved = await Promise.all(
        imageJobs.map(async ({ query, propKey }) => {
          try {
            if (body.customImagery) {
              const size = propKey === 'imageUrl' ? '1344x768' : '1024x1024'
              const response = await zai.images.generations.create({ prompt: query, size })
              const base64 = response.data[0]?.base64
              if (base64) return { propKey, url: `data:image/png;base64,${base64}` }
              return null
            }
            const response = await zai.images.search.create({
              query,
              count: 1,
              rank: false,
              gl: 'us',
            })
            const url = response.results?.[0]?.original_url
            return url ? { propKey, url } : null
          } catch (err) {
            console.error('[copilot] image sourcing failed:', err)
            return null
          }
        }),
      )

      const successes = resolved.filter(Boolean).length
      for (const { index, step } of imageSteps) {
        updateStep(jobId, index, {
          status: 'done',
          detail: `${successes}/${imageJobs.length} images`,
          label: step.label, // keep label stable
        })
      }

      // Attach resolved images back to the plan
      resolved.forEach((result, i) => {
        if (!result) return
        const { moduleIndex, propKey } = imageJobs[i]
        const planned = (plan.modules ?? [])[moduleIndex]
        if (planned) {
          planned.props = { ...(planned.props ?? {}), [propKey]: result.url }
        }
      })
    } else if (imageSteps.length > 0) {
      for (const { index } of imageSteps) {
        updateStep(jobId, index, { status: 'done', detail: 'no photos needed' })
      }
    }

    /* ---- Assembly ---- */
    const stamp = Date.now().toString(36)
    const composition: ModuleInstance[] = []
    const plannedModules: PlannedModule[] = plan.modules ?? []
    plannedModules.forEach((planned, index) => {
      const moduleId = typeof planned.moduleId === 'string' ? planned.moduleId : ''
      const variantId: VariantId = planned.variantId === 'b' ? 'b' : 'a'
      const definition = getCatalogModule(moduleId)
      const variant = getCatalogVariant(moduleId, variantId)
      if (!definition || !variant) return

      const props = structuredClone(variant.defaults)
      if (planned.props && typeof planned.props === 'object') {
        for (const [key, value] of Object.entries(planned.props)) {
          if (key in props && value !== null && value !== undefined) {
            props[key] = value
          }
        }
      }
      composition.push({
        uid: `${moduleId}-${index}-${stamp}`,
        moduleId,
        variantId,
        props,
      })
    })

    if (composition.length === 0) {
      throw new Error('The plan contained no known modules. Please try again.')
    }

    finishJob(jobId, {
      composition,
      siteName: typeof plan.siteName === 'string' && plan.siteName.trim() ? plan.siteName.trim().slice(0, 80) : 'AI-built page',
    })
  } catch (error) {
    console.error('[copilot build job]', error)
    // Mark any running step as errored
    const job = getPipelineJob(jobId)
    job?.steps.forEach((step, index) => {
      if (step.status === 'running') updateStep(jobId, index, { status: 'error' })
    })
    failJob(jobId, error instanceof Error ? error.message : 'The build failed.')
  }
}

/* ------------------------------ Rewrite mode ------------------------------ */

async function rewriteProps(instance: ModuleInstance): Promise<Record<string, unknown>> {
  const definition = getCatalogModule(instance.moduleId)
  const variant = getCatalogVariant(instance.moduleId, instance.variantId)
  if (!definition || !variant) throw new Error('Unknown module.')

  const zai = await getZAI()
  const systemPrompt = `You improve the copy of one website module. You receive the module name, its design path, and its current props as JSON.

Return STRICT JSON only — no markdown, no commentary — shaped exactly: { "props": { … } }

Rules:
- Keep EXACTLY the same prop keys and the same value types as the input.
- Arrays keep the same item count (±2). Objects keep their field structure.
- Rewrite every string with sharper, more specific, more persuasive copy in the same language as the input. Keep prices, URLs, phone numbers and factual claims intact.
- Image alt texts stay honest descriptions of the image.`

  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'assistant', content: systemPrompt },
      { role: 'user', content: JSON.stringify({ moduleName: definition.name, designPath: variant.label, props: instance.props }) },
    ],
    thinking: { type: 'disabled' },
  })
  const text = completion.choices[0]?.message?.content ?? ''
  const parsed = extractJson(text) as { props?: Record<string, unknown> }
  if (!parsed?.props || typeof parsed.props !== 'object') {
    throw new Error('The rewrite response was not valid.')
  }
  // Only keep known keys
  const clean: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(parsed.props)) {
    if (key in variant.defaults && value !== null && value !== undefined) {
      clean[key] = value
    }
  }
  return clean
}

/* -------------------------------- Handlers -------------------------------- */

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BuildBody & {
      mode?: 'build' | 'rewrite'
      instance?: ModuleInstance
    }

    if (body.mode === 'rewrite') {
      if (!body.instance?.moduleId) {
        return NextResponse.json({ error: 'An instance is required.' }, { status: 400 })
      }
      const props = await rewriteProps(body.instance)
      return NextResponse.json({ props })
    }

    // Build mode — start an async job
    const brief = (body.brief ?? '').trim()
    if (!brief) {
      return NextResponse.json({ error: 'A brief is required.' }, { status: 400 })
    }
    if (body.url && !/^https?:\/\//i.test(body.url)) {
      return NextResponse.json({ error: 'The URL must start with http:// or https://' }, { status: 400 })
    }

    const steps: PipelineStep[] = []
    if (body.url) {
      steps.push({ skill: 'page-reader', label: 'Reading your existing site', status: 'pending' })
    }
    if (body.research) {
      steps.push({ skill: 'search', label: 'Researching your market', status: 'pending' })
    }
    steps.push({ skill: 'llm', label: 'Planning your page', status: 'pending' })
    steps.push({
      skill: body.customImagery ? 'image-gen' : 'image-search',
      label: body.customImagery ? 'Generating custom imagery' : 'Sourcing real photos',
      status: 'pending',
    })

    const jobId = createPipelineJob(steps)
    void runBuildJob(jobId, { ...body, brief })

    return NextResponse.json({ jobId }, { status: 202 })
  } catch (error) {
    console.error('[api/copilot POST]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not start the build.' },
      { status: 500 },
    )
  }
}

export async function GET(request: Request) {
  const jobId = new URL(request.url).searchParams.get('jobId')
  if (!jobId) {
    return NextResponse.json({ error: 'A jobId is required.' }, { status: 400 })
  }
  const job = getPipelineJob(jobId)
  if (!job) {
    return NextResponse.json(
      { status: 'error', error: 'Job not found — it may have expired. Please build again.' },
      { status: 404 },
    )
  }
  const result = job.result as { composition?: ModuleInstance[]; siteName?: string } | undefined
  return NextResponse.json({
    status: job.status,
    steps: job.steps,
    composition: job.status === 'done' ? result?.composition ?? null : null,
    siteName: job.status === 'done' ? result?.siteName ?? null : null,
    error: job.error ?? null,
  })
}
