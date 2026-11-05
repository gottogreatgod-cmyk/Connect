'use client'

import * as React from 'react'
import {
  Clapperboard,
  Eye,
  Globe,
  Image as ImageIcon,
  Loader2,
  Mic,
  Play,
  Search,
  Send,
  Sparkles,
  Volume2,
} from 'lucide-react'
import { ChatDemo } from '@/components/chat-demo'
import { ImageDemo } from '@/components/image-demo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

/** Parse JSON safely, converting HTML/proxy error pages into friendly errors. */
async function safeJson<T>(res: Response): Promise<T> {
  const raw = await res.text()
  try {
    return JSON.parse(raw) as T
  } catch {
    throw new Error(`Unexpected server response (HTTP ${res.status}). Please try again.`)
  }
}

function DemoShell({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col rounded-xl border bg-card p-5" aria-label={title}>
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="text-[11px] text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-1 flex-col">{children}</div>
    </section>
  )
}

function ErrorNote({ error }: { error: string }) {
  return (
    <p role="alert" className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
      {error}
    </p>
  )
}

/* ------------------------------ Image Search ----------------------------- */

function ImageSearchDemo() {
  const [query, setQuery] = React.useState('cozy independent bookshop interior')
  const [images, setImages] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function search() {
    if (!query.trim() || loading) return
    setLoading(true)
    setError(null)
    try {
      // Job pattern: start the search, then poll (image re-hosting can be slow)
      const res = await fetch('/api/image-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      })
      const data = await safeJson<{ jobId?: string; error?: string }>(res)
      if (!res.ok || !data.jobId) throw new Error(data.error || 'Search failed.')

      const startedAt = Date.now()
      for (;;) {
        await new Promise((resolve) => setTimeout(resolve, 2500))
        let job: { status: string; images?: string[]; error?: string }
        try {
          const pollRes = await fetch(`/api/image-search?jobId=${encodeURIComponent(data.jobId)}`, {
            cache: 'no-store',
          })
          job = await safeJson<{ status: string; images?: string[]; error?: string }>(pollRes)
        } catch {
          continue
        }
        if (job.status === 'done' && job.images) {
          if (job.images.length === 0) throw new Error('No photos found — try a different query.')
          setImages(job.images)
          return
        }
        if (job.status === 'error') throw new Error(job.error || 'Search failed.')
        if (Date.now() - startedAt > 150_000) throw new Error('The search is taking too long.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          void search()
        }}
      >
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search the real web for photos…"
          aria-label="Image search query"
          className="h-9 text-xs"
        />
        <Button type="submit" size="sm" disabled={loading || !query.trim()} className="gap-1.5">
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          Find
        </Button>
      </form>
      {error && <ErrorNote error={error} />}
      {loading && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="aspect-square animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      )}
      {!loading && images.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {images.map((url) => (
            <img
              key={url}
              src={url}
              alt={`Web result for ${query}`}
              className="aspect-square w-full rounded-lg object-cover"
              loading="lazy"
            />
          ))}
        </div>
      )}
    </>
  )
}

/* ------------------------------- Web Search ------------------------------ */

type WebResult = { name: string; url: string; snippet: string; host_name: string }

function WebSearchDemo() {
  const [query, setQuery] = React.useState('small business website design trends 2025')
  const [results, setResults] = React.useState<WebResult[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function search() {
    if (!query.trim() || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/web-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      })
      const data = await safeJson<{ results?: WebResult[]; error?: string }>(res)
      if (!res.ok || !data.results) throw new Error(data.error || 'Search failed.')
      setResults(data.results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          void search()
        }}
      >
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ask the live web…"
          aria-label="Web search query"
          className="h-9 text-xs"
        />
        <Button type="submit" size="sm" disabled={loading || !query.trim()} className="gap-1.5">
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Globe className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          Search
        </Button>
      </form>
      {error && <ErrorNote error={error} />}
      {results.length > 0 && (
        <ul className="mt-3 max-h-64 space-y-2.5 overflow-y-auto pr-1">
          {results.map((result) => (
            <li key={result.url} className="rounded-lg border bg-muted/30 p-2.5">
              <p className="text-xs font-semibold leading-snug">{result.name}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{result.snippet}</p>
              <p className="mt-1 text-[10px] text-emerald-700 dark:text-emerald-400">{result.host_name}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

/* ---------------------------------- TTS ---------------------------------- */

function TtsDemo() {
  const [text, setText] = React.useState('Welcome to the AI Website Studio. Every skill you see here runs live, from one backend SDK.')
  const [url, setUrl] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function speak() {
    if (!text.trim() || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.slice(0, 1000), voice: 'jam' }),
      })
      if (!res.ok) throw new Error('Speech synthesis failed.')
      const blob = await res.blob()
      setUrl((old) => {
        if (old) URL.revokeObjectURL(old)
        return URL.createObjectURL(blob)
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={3}
        maxLength={1000}
        aria-label="Text to speak"
        className="text-xs"
      />
      <Button size="sm" className="mt-2 gap-1.5" onClick={() => void speak()} disabled={loading || !text.trim()}>
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        Speak
      </Button>
      {error && <ErrorNote error={error} />}
      {url && (
        <audio controls src={url} className="mt-3 w-full" aria-label="Generated speech">
          Your browser does not support audio playback.
        </audio>
      )}
    </>
  )
}

/* ---------------------------------- ASR ---------------------------------- */

function AsrDemo() {
  const [recording, setRecording] = React.useState(false)
  const [transcribing, setTranscribing] = React.useState(false)
  const [transcript, setTranscript] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const recorderRef = React.useRef<MediaRecorder | null>(null)
  const chunksRef = React.useRef<Blob[]>([])

  async function toggle() {
    if (recording) {
      recorderRef.current?.stop()
      return
    }
    setError(null)
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
        setTranscribing(true)
        try {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => {
              const result = String(reader.result ?? '')
              resolve(result.includes(',') ? result.split(',')[1] : result)
            }
            reader.onerror = () => reject(new Error('Could not read the recording.'))
            reader.readAsDataURL(blob)
          })
          const res = await fetch('/api/asr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audioBase64: base64 }),
          })
          const data = await safeJson<{ text?: string; error?: string }>(res)
          if (!res.ok || !data.text) throw new Error(data.error || 'Transcription failed.')
          setTranscript(data.text)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'unknown error')
        } finally {
          setTranscribing(false)
        }
      }
      recorder.start()
      recorderRef.current = recorder
      setRecording(true)
    } catch {
      setError('Microphone permission was denied.')
    }
  }

  return (
    <>
      <Button
        size="sm"
        variant={recording ? 'destructive' : 'default'}
        className="gap-1.5"
        onClick={() => void toggle()}
        aria-pressed={recording}
      >
        {transcribing ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <Mic className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        {recording ? 'Stop and transcribe' : transcribing ? 'Transcribing…' : 'Record your voice'}
      </Button>
      {recording && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
          <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" aria-hidden="true" />
          Listening…
        </p>
      )}
      {error && <ErrorNote error={error} />}
      {transcript && (
        <p className="mt-3 rounded-lg border bg-muted/30 p-3 text-xs leading-relaxed">{transcript}</p>
      )}
    </>
  )
}

/* ---------------------------------- VLM ---------------------------------- */

function VlmDemo() {
  const [description, setDescription] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setLoading(true)
    setError(null)
    setDescription('')
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const result = String(reader.result ?? '')
          resolve(result.includes(',') ? result.split(',')[1] : result)
        }
        reader.onerror = () => reject(new Error('Could not read the image.'))
        reader.readAsDataURL(file)
      })
      const res = await fetch('/api/vlm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      })
      const data = await safeJson<{ description?: string; error?: string }>(res)
      if (!res.ok || !data.description) throw new Error(data.error || 'Analysis failed.')
      setDescription(data.description)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-6 text-center transition-colors hover:border-emerald-500/40">
        {preview ? (
          <img src={preview} alt="Uploaded image preview" className="max-h-32 rounded-lg object-contain" />
        ) : (
          <Eye className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        )}
        <span className="text-xs text-muted-foreground">
          {loading ? 'Analyzing with the vision model…' : 'Upload any image — get an AI description'}
        </span>
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => void handleUpload(event)}
          disabled={loading}
          aria-label="Upload image for analysis"
        />
      </label>
      {error && <ErrorNote error={error} />}
      {description && (
        <p className="mt-3 rounded-lg border bg-muted/30 p-3 text-xs leading-relaxed">{description}</p>
      )}
    </>
  )
}

/* ------------------------------ Video (async) ---------------------------- */

function VideoDemo() {
  const [prompt, setPrompt] = React.useState('A slow flyover of a modern eco city with green rooftops, cinematic')
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState<'idle' | 'running' | 'error'>('idle')
  const [elapsed, setElapsed] = React.useState(0)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (status !== 'running') return
    const started = Date.now()
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000)
    return () => clearInterval(timer)
  }, [status])

  async function generate() {
    if (!prompt.trim() || status === 'running') return
    setStatus('running')
    setElapsed(0)
    setError(null)
    setVideoUrl(null)
    try {
      const res = await fetch('/api/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      })
      const data = await safeJson<{ jobId?: string; error?: string }>(res)
      if (!res.ok || !data.jobId) throw new Error(data.error || 'Could not start generation.')
      const startedAt = Date.now()
      for (;;) {
        await new Promise((resolve) => setTimeout(resolve, 5000))
        let job: { status: string; videoUrl?: string; error?: string }
        try {
          const pollRes = await fetch(`/api/video?jobId=${encodeURIComponent(data.jobId)}`, {
            cache: 'no-store',
          })
          job = await safeJson<{ status: string; videoUrl?: string; error?: string }>(pollRes)
        } catch {
          continue
        }
        if (job.status === 'done' && job.videoUrl) {
          setVideoUrl(job.videoUrl)
          setStatus('idle')
          return
        }
        if (job.status === 'error') throw new Error(job.error || 'Generation failed.')
        if (Date.now() - startedAt > 420_000) throw new Error('Timed out. Please try again.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'unknown error')
      setStatus('error')
    }
  }

  return (
    <>
      <Textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        rows={2}
        aria-label="Video prompt"
        className="text-xs"
      />
      <Button size="sm" className="mt-2 gap-1.5" onClick={() => void generate()} disabled={status === 'running' || !prompt.trim()}>
        {status === 'running' ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            Rendering… {elapsed}s
          </>
        ) : (
          <>
            <Play className="h-3.5 w-3.5" aria-hidden="true" />
            Generate video
          </>
        )}
      </Button>
      <p className="mt-1.5 text-[10px] text-muted-foreground">
        Video generation is a background task — usually 2–4 minutes.
      </p>
      {error && <ErrorNote error={error} />}
      {videoUrl && (
        <video controls src={videoUrl} className="mt-3 w-full rounded-lg" aria-label="Generated video">
          Your browser does not support video playback.
        </video>
      )}
    </>
  )
}

/* --------------------------------- View ---------------------------------- */

const SKILLS = [
  {
    id: 'chat',
    icon: Sparkles,
    title: 'AI Chat (LLM)',
    description: 'Multi-turn conversation with a real model',
  },
  {
    id: 'image-gen',
    icon: ImageIcon,
    title: 'Image Generation',
    description: 'Create images from text prompts',
  },
  {
    id: 'image-search',
    icon: Search,
    title: 'Image Search',
    description: 'Find real web photos for any subject',
  },
  {
    id: 'web-search',
    icon: Globe,
    title: 'Web Search',
    description: 'Live information from across the web',
  },
  {
    id: 'tts',
    icon: Volume2,
    title: 'Text to Speech',
    description: 'Natural spoken audio from text',
  },
  {
    id: 'asr',
    icon: Mic,
    title: 'Speech Recognition',
    description: 'Speak — the AI transcribes it',
  },
  {
    id: 'vlm',
    icon: Eye,
    title: 'Vision (VLM)',
    description: 'Understand and describe images',
  },
  {
    id: 'video',
    icon: Clapperboard,
    title: 'Video Generation',
    description: 'AI-generated video from a prompt',
  },
] as const

export function SkillsView() {
  return (
    <div className="space-y-5">
      <section className="rounded-xl border bg-card p-5">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <Send className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold">The AI Superpowers, Live</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Every skill below runs on real models through one backend SDK — the same skills the AI
              Copilot orchestrates together when it builds your pages in the Studio.
            </p>
          </div>
          <Badge
            variant="secondary"
            className="gap-1.5 border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            8 skills · all live
          </Badge>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <DemoShell icon={SKILLS[0].icon} title={SKILLS[0].title} description={SKILLS[0].description}>
          <ChatDemo />
        </DemoShell>
        <DemoShell icon={SKILLS[1].icon} title={SKILLS[1].title} description={SKILLS[1].description}>
          <ImageDemo />
        </DemoShell>
        <DemoShell icon={SKILLS[2].icon} title={SKILLS[2].title} description={SKILLS[2].description}>
          <ImageSearchDemo />
        </DemoShell>
        <DemoShell icon={SKILLS[3].icon} title={SKILLS[3].title} description={SKILLS[3].description}>
          <WebSearchDemo />
        </DemoShell>
        <DemoShell icon={SKILLS[4].icon} title={SKILLS[4].title} description={SKILLS[4].description}>
          <TtsDemo />
        </DemoShell>
        <DemoShell icon={SKILLS[5].icon} title={SKILLS[5].title} description={SKILLS[5].description}>
          <AsrDemo />
        </DemoShell>
        <DemoShell icon={SKILLS[6].icon} title={SKILLS[6].title} description={SKILLS[6].description}>
          <VlmDemo />
        </DemoShell>
        <DemoShell icon={SKILLS[7].icon} title={SKILLS[7].title} description={SKILLS[7].description}>
          <VideoDemo />
        </DemoShell>
      </div>
    </div>
  )
}
