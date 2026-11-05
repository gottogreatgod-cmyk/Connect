'use client'

import * as React from 'react'
import {
  Check,
  ChevronDown,
  Globe,
  ImageIcon,
  Loader2,
  Mic,
  MicOff,
  Search,
  Sparkles,
  TriangleAlert,
  Upload,
  Wand2,
  X,
} from 'lucide-react'
import { useBuilder } from '@/components/studio/builder-context'
import type { ModuleInstance } from '@/modules/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

type StepStatus = 'pending' | 'running' | 'done' | 'error'

interface PipelineStep {
  skill: string
  label: string
  status: StepStatus
  detail?: string
}

interface CopilotJobResponse {
  status: 'pending' | 'done' | 'error'
  steps: PipelineStep[]
  composition?: ModuleInstance[]
  siteName?: string
  error?: string
}

const SKILL_BADGES: Record<string, string> = {
  llm: 'LLM',
  search: 'Web Search',
  'page-reader': 'Page Reader',
  vlm: 'Vision',
  asr: 'Speech',
  tts: 'TTS',
  'image-gen': 'Image Gen',
  'image-search': 'Image Search',
  video: 'Video',
}

const EXAMPLE_BRIEFS = [
  'A cozy neighborhood pizza restaurant with wood-fired ovens, takeout and a family feel',
  'A modern dental clinic that wants nervous patients to feel calm and book online',
  'An independent bookshop with events, a loyalty club and a strong local community',
  'A B2B logistics SaaS that needs to look enterprise-grade with integrations and pricing',
]

/** Parse JSON safely, converting HTML/proxy error pages into friendly errors. */
async function safeJson<T>(res: Response): Promise<T> {
  const raw = await res.text()
  try {
    return JSON.parse(raw) as T
  } catch {
    throw new Error(`Unexpected server response (HTTP ${res.status}). Please try again.`)
  }
}

export function CopilotPanel() {
  const { replaceAll } = useBuilder()
  const [open, setOpen] = React.useState(true)
  const [brief, setBrief] = React.useState('')
  const [url, setUrl] = React.useState('')
  const [research, setResearch] = React.useState(true)
  const [customImagery, setCustomImagery] = React.useState(false)
  const [imageContext, setImageContext] = React.useState<{ dataUrl: string; description: string } | null>(null)
  const [vlmLoading, setVlmLoading] = React.useState(false)
  const [recording, setRecording] = React.useState(false)
  const [asrLoading, setAsrLoading] = React.useState(false)
  const [steps, setSteps] = React.useState<PipelineStep[]>([])
  const [building, setBuilding] = React.useState(false)
  const [result, setResult] = React.useState<{ ok: boolean; message: string } | null>(null)

  // --- Voice brief (ASR) ---
  const recorderRef = React.useRef<MediaRecorder | null>(null)
  const chunksRef = React.useRef<Blob[]>([])

  async function toggleRecording() {
    if (recording) {
      recorderRef.current?.stop()
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop())
        setRecording(false)
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        if (blob.size === 0) return
        setAsrLoading(true)
        try {
          const base64 = await blobToBase64(blob)
          const res = await fetch('/api/asr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audioBase64: base64 }),
          })
          const data = await safeJson<{ text?: string; error?: string }>(res)
          if (!res.ok || !data.text) throw new Error(data.error || 'Transcription failed.')
          setBrief((current) => (current ? `${current} ${data.text}`.trim() : data.text!.trim()))
        } catch (err) {
          setResult({ ok: false, message: `Voice input failed: ${err instanceof Error ? err.message : 'unknown'}` })
        } finally {
          setAsrLoading(false)
        }
      }
      recorder.start()
      recorderRef.current = recorder
      setRecording(true)
    } catch {
      setResult({ ok: false, message: 'Microphone permission was denied.' })
    }
  }

  // --- Reference image (VLM) ---
  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const dataUrl = await fileToDataUrl(file)
    setImageContext({ dataUrl, description: '' })
    setVlmLoading(true)
    try {
      const base64 = dataUrl.split(',')[1] ?? ''
      const res = await fetch('/api/vlm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      })
      const data = await safeJson<{ description?: string; error?: string }>(res)
      if (!res.ok || !data.description) throw new Error(data.error || 'Analysis failed.')
      setImageContext({ dataUrl, description: data.description })
    } catch (err) {
      setImageContext(null)
      setResult({ ok: false, message: `Image analysis failed: ${err instanceof Error ? err.message : 'unknown'}` })
    } finally {
      setVlmLoading(false)
    }
  }

  // --- The build pipeline (job pattern) ---
  async function build() {
    if (!brief.trim() || building) return
    setBuilding(true)
    setResult(null)
    setSteps([])
    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'build',
          brief: brief.trim(),
          url: url.trim() || undefined,
          research,
          customImagery,
          vlmDescription: imageContext?.description || undefined,
        }),
      })
      const data = await safeJson<{ jobId?: string; error?: string }>(res)
      if (!res.ok || !data.jobId) throw new Error(data.error || 'Could not start the build.')

      // Poll the job with short requests (immune to gateway timeouts)
      const startedAt = Date.now()
      for (;;) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        let job: CopilotJobResponse
        try {
          const pollRes = await fetch(`/api/copilot?jobId=${encodeURIComponent(data.jobId)}`, {
            cache: 'no-store',
          })
          job = await safeJson<CopilotJobResponse>(pollRes)
          setSteps(job.steps ?? [])
        } catch {
          continue // transient hiccup, keep polling
        }
        if (job.status === 'done' && job.composition) {
          replaceAll(job.composition, job.siteName)
          setResult({
            ok: true,
            message: `Built a ${job.composition.length}-module page. Refine it in the inspector.`,
          })
          return
        }
        if (job.status === 'error') {
          throw new Error(job.error || 'The build failed.')
        }
        if (Date.now() - startedAt > 300_000) {
          throw new Error('The build is taking unusually long. Please try again.')
        }
      }
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : 'unknown error' })
    } finally {
      setBuilding(false)
    }
  }

  return (
    <section
      aria-label="AI Copilot"
      className="rounded-xl border bg-card shadow-sm"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <Wand2 className="h-4.5 w-4.5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">AI Copilot</span>
            <Badge
              variant="secondary"
              className="gap-1 border border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-700 dark:text-emerald-300"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              8 skills, one brief
            </Badge>
          </span>
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            Describe a business — the copilot plans, writes and sources the whole page.
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="space-y-4 border-t p-4">
          <div>
            <label htmlFor="copilot-brief" className="text-xs font-medium">
              What should this website be?
            </label>
            <div className="relative mt-1.5">
              <Textarea
                id="copilot-brief"
                value={brief}
                onChange={(event) => setBrief(event.target.value)}
                placeholder="e.g. A family-run bakery in Leeds — sourdough, wedding cakes, baking classes on Saturdays…"
                rows={3}
                maxLength={1200}
                disabled={building}
              />
              <button
                type="button"
                onClick={() => void toggleRecording()}
                aria-label={recording ? 'Stop recording and transcribe' : 'Record a voice brief'}
                aria-pressed={recording}
                title={recording ? 'Stop recording' : 'Speak your brief'}
                className={`absolute bottom-2 right-2 rounded-full p-2 transition-colors ${
                  recording
                    ? 'bg-destructive text-white hover:bg-destructive/90'
                    : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
                }`}
              >
                {asrLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : recording ? (
                  <MicOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Mic className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {recording && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive">
                <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" aria-hidden="true" />
                Listening… tap the mic again to stop.
              </p>
            )}
          </div>

          {brief.trim() === '' && !building && (
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLE_BRIEFS.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setBrief(example)}
                  className="rounded-full border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-emerald-500/40 hover:text-foreground"
                >
                  {example.length > 52 ? `${example.slice(0, 52)}…` : example}
                </button>
              ))}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="copilot-url" className="flex items-center gap-1.5 text-xs font-medium">
                <Globe className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                Existing site (optional)
              </label>
              <Input
                id="copilot-url"
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://old-site.com"
                className="mt-1.5 h-9 text-xs"
                disabled={building}
              />
              <p className="mt-1 text-[10px] text-muted-foreground">
                Page Reader extracts the current copy as context.
              </p>
            </div>
            <div>
              <span className="flex items-center gap-1.5 text-xs font-medium">
                <ImageIcon className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                Reference image (optional)
              </span>
              <label
                htmlFor="copilot-image"
                className="mt-1.5 flex h-9 cursor-pointer items-center gap-2 rounded-md border px-3 text-xs text-muted-foreground transition-colors hover:border-emerald-500/40"
              >
                {vlmLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {imageContext ? 'Image analyzed by Vision' : 'Upload for style analysis'}
                <input
                  id="copilot-image"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => void handleImageUpload(event)}
                  disabled={building || vlmLoading}
                />
              </label>
              {imageContext && (
                <div className="mt-1.5 flex items-start gap-2 rounded-md border bg-muted/30 p-2">
                  <img
                    src={imageContext.dataUrl}
                    alt="Reference upload"
                    className="h-10 w-10 shrink-0 rounded object-cover"
                  />
                  <p className="line-clamp-3 flex-1 text-[10px] leading-snug text-muted-foreground">
                    {vlmLoading ? 'Analyzing…' : imageContext.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => setImageContext(null)}
                    aria-label="Remove reference image"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-6">
            <label className="flex items-center gap-2 text-xs">
              <Switch checked={research} onCheckedChange={setResearch} disabled={building} aria-label="Web research toggle" />
              <span className="flex items-center gap-1">
                <Search className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                Research the market (Web Search)
              </span>
            </label>
            <label className="flex items-center gap-2 text-xs">
              <Switch
                checked={customImagery}
                onCheckedChange={setCustomImagery}
                disabled={building}
                aria-label="AI-generated imagery toggle"
              />
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                Generate custom imagery (slower)
              </span>
            </label>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              className="gap-2 sm:w-auto"
              onClick={() => void build()}
              disabled={building || !brief.trim()}
            >
              {building ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Wand2 className="h-4 w-4" aria-hidden="true" />
              )}
              {building ? 'Building your page…' : 'Build my page'}
            </Button>
            <p className="text-[11px] text-muted-foreground">
              Typically 30–90 seconds — every skill reports progress below.
            </p>
          </div>

          {(steps.length > 0 || building) && (
            <ol className="space-y-1.5 rounded-lg border bg-muted/30 p-3" aria-live="polite">
              {steps.map((step, index) => (
                <li key={index} className="flex items-center gap-2.5 text-xs">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                    {step.status === 'done' ? (
                      <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                    ) : step.status === 'running' ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" aria-hidden="true" />
                    ) : step.status === 'error' ? (
                      <X className="h-4 w-4 text-destructive" aria-hidden="true" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" aria-hidden="true" />
                    )}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      step.status === 'pending'
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {SKILL_BADGES[step.skill] ?? step.skill}
                  </span>
                  <span className={step.status === 'pending' ? 'text-muted-foreground/60' : ''}>
                    {step.label}
                    {step.detail && (
                      <span className="ml-1 text-muted-foreground">· {step.detail}</span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          )}

          {result && (
            <p
              role="status"
              className={`flex items-start gap-2 rounded-md border px-3 py-2 text-xs ${
                result.ok
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                  : 'border-destructive/30 bg-destructive/10 text-destructive'
              }`}
            >
              {result.ok ? (
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              ) : (
                <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              )}
              {result.message}
            </p>
          )}
        </div>
      )}
    </section>
  )
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = String(reader.result ?? '')
      resolve(result.includes(',') ? result.split(',')[1] : result)
    }
    reader.onerror = () => reject(new Error('Could not read the recording.'))
    reader.readAsDataURL(blob)
  })
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('Could not read the image.'))
    reader.readAsDataURL(file)
  })
}
