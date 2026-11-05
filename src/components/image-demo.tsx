'use client'

import * as React from 'react'
import {
  Download,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  TriangleAlert,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'

const SIZES = [
  { value: '1024x1024', label: 'Square · 1024×1024' },
  { value: '1344x768', label: 'Landscape · 1344×768' },
  { value: '768x1344', label: 'Portrait · 768×1344' },
]

const EXAMPLES = [
  'A serene mountain lake at golden hour, oil painting style, dramatic clouds',
  'Isometric illustration of a futuristic AI data center, pastel colors',
  'Cute robot mascot holding a paintbrush, 3D render, soft studio lighting',
]

const POLL_INTERVAL_MS = 2500
const JOB_TIMEOUT_MS = 180_000
const MAX_CONSECUTIVE_POLL_FAILURES = 5

/** Parse JSON safely, converting HTML/proxy error pages into friendly errors. */
async function safeJson<T>(res: Response): Promise<T> {
  const raw = await res.text()
  try {
    return JSON.parse(raw) as T
  } catch {
    throw new Error(
      `The server returned an unexpected response (HTTP ${res.status}). Please try again.`
    )
  }
}

export function ImageDemo() {
  const [prompt, setPrompt] = React.useState('')
  const [size, setSize] = React.useState('1024x1024')
  const [image, setImage] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [elapsed, setElapsed] = React.useState(0)

  // Elapsed-seconds ticker while generating
  React.useEffect(() => {
    if (!loading) return
    const started = Date.now()
    setElapsed(0)
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - started) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [loading])

  async function generate(text?: string) {
    const finalPrompt = (text ?? prompt).trim()
    if (!finalPrompt || loading) return

    if (text) setPrompt(text)
    setLoading(true)
    setError(null)

    const startedAt = Date.now()

    try {
      // 1. Start the generation job (returns immediately with a jobId)
      const startRes = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: finalPrompt, size }),
      })
      const startData = await safeJson<{ jobId?: string; error?: string }>(
        startRes
      )
      if (!startRes.ok || !startData.jobId) {
        throw new Error(startData.error || 'Could not start image generation.')
      }

      // 2. Poll the job status with short requests (immune to proxy timeouts)
      const jobId = startData.jobId
      let pollFailures = 0

      while (Date.now() - startedAt < JOB_TIMEOUT_MS) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))

        let pollData: {
          status: string
          image?: string
          error?: string
        }
        try {
          const pollRes = await fetch(
            `/api/image?jobId=${encodeURIComponent(jobId)}`,
            { cache: 'no-store' }
          )
          pollData = await safeJson<{
            status: string
            image?: string
            error?: string
          }>(pollRes)
          pollFailures = 0
        } catch {
          // Transient network hiccup — tolerate a few in a row
          pollFailures += 1
          if (pollFailures >= MAX_CONSECUTIVE_POLL_FAILURES) {
            throw new Error(
              'Lost connection to the server while generating. Please try again.'
            )
          }
          continue
        }

        if (pollData.status === 'done' && pollData.image) {
          setImage(pollData.image)
          return
        }
        if (pollData.status === 'error') {
          throw new Error(pollData.error || 'Image generation failed.')
        }
        // status === 'pending' → keep polling
      }

      throw new Error(
        'Image generation is taking unusually long. Please try again.'
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <Badge
          variant="secondary"
          className="gap-1.5 border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Image Generation Skill · live
        </Badge>
        {image && !loading && (
          <a
            href={image}
            download="ai-generated.png"
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Download generated image"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download
          </a>
        )}
      </div>

      <div className="flex min-h-80 items-center justify-center overflow-hidden rounded-lg border bg-muted/30">
        {loading ? (
          <div className="flex w-full flex-col items-center gap-3 p-8">
            <Skeleton
              className={
                size === '768x1344'
                  ? 'h-72 w-40'
                  : size === '1344x768'
                    ? 'h-40 w-72'
                    : 'h-56 w-56'
              }
            />
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Painting your image… {elapsed}s
            </p>
            <p className="text-xs text-muted-foreground/70">
              Images usually take 30–90 seconds
            </p>
          </div>
        ) : image ? (
          <img
            src={image}
            alt={`AI-generated image for prompt: ${prompt}`}
            className="max-h-96 w-auto max-w-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 p-8 text-center text-muted-foreground">
            <ImageIcon className="h-10 w-10 opacity-40" aria-hidden="true" />
            <p className="max-w-xs text-sm">
              Describe an image below and hit Generate — a real AI model will
              paint it for you.
            </p>
          </div>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => void generate(e)}
            disabled={loading}
            className="max-w-full truncate rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-emerald-500/40 hover:text-foreground disabled:opacity-50"
          >
            {e.length > 42 ? `${e.slice(0, 42)}…` : e}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to create…"
          aria-label="Image prompt"
          rows={2}
          maxLength={600}
          disabled={loading}
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={size} onValueChange={setSize} disabled={loading}>
            <SelectTrigger className="w-full sm:w-56" aria-label="Image size">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SIZES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="gap-2 sm:flex-1"
            onClick={() => void generate()}
            disabled={loading || !prompt.trim()}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            )}
            {loading ? 'Generating…' : 'Generate'}
          </Button>
        </div>
      </div>
    </div>
  )
}
