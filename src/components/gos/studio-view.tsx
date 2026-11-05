"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  AudioLines,
  Check,
  Clapperboard,
  Copy,
  Download,
  ImageIcon,
  Loader2,
  Mic,
  RotateCw,
  Sparkles,
  Square,
  Upload,
  Users,
  Video,
  Volume2,
  Wand2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { audioToBase64Best, fileToBase64 } from "@/lib/media/client"
import { findCharacter, VOICE_CHARACTERS, type VoiceCharacter } from "@/lib/media/characters"
import { MediaBlock } from "@/components/gos/media-block"
import { IMAGE_SIZES, STUDIO_TABS, useStudio, type MediaListItem, type StudioTab } from "@/lib/studio/store"
import type { MediaRef } from "@/lib/gos/types"
import { cn } from "@/lib/utils"

// ── module-scoped recorder: a live recording survives tab/view switches ────
const recorderBox = {
  rec: null as MediaRecorder | null,
  chunks: [] as Blob[],
  timer: null as ReturnType<typeof setInterval> | null,
}

function stopRecorderTracks() {
  recorderBox.rec?.stream.getTracks().forEach((t) => t.stop())
  recorderBox.rec = null
  recorderBox.chunks = []
  if (recorderBox.timer) clearInterval(recorderBox.timer)
  recorderBox.timer = null
}

export { type StudioTab }

interface StudioViewProps {
  onSendToChat?: (text: string) => void
}

export function StudioView({ onSendToChat }: StudioViewProps) {
  const tab = useStudio((s) => s.tab)
  const setTab = useStudio((s) => s.setTab)

  return (
    <div className="gos-scroll h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:py-8">
        {/* header */}
        <div className="gos-rise flex items-center gap-2.5">
          <span className="gos-glow flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
            <Wand2 className="h-4.5 w-4.5 text-primary" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">AI Media Studio</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Four generators, one tool layer — drafts and renders keep running while you switch tabs or screens.
            </p>
          </div>
        </div>

        {/* tab bar */}
        <div role="tablist" aria-label="Media studio tools" className="gos-rise mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {STUDIO_TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex flex-col gap-1.5 rounded-xl border p-3 text-left transition-all",
                tab === t.id
                  ? "gos-glow border-primary/50 bg-accent/60 shadow-md"
                  : "border-border/70 bg-card/40 hover:border-primary/30 hover:bg-accent/30",
              )}
            >
              <span className={cn("flex items-center gap-1.5", tab === t.id ? "text-primary" : "text-muted-foreground")}>
                {t.id === "asr" && <AudioLines className="h-4 w-4" />}
                {t.id === "tts" && <Volume2 className="h-4 w-4" />}
                {t.id === "image" && <ImageIcon className="h-4 w-4" />}
                {t.id === "video" && <Clapperboard className="h-4 w-4" />}
                <span className="font-display text-[13px] font-semibold text-foreground">{t.label}</span>
              </span>
              <span className="font-mono text-[10px] leading-snug text-muted-foreground">{t.blurb}</span>
            </button>
          ))}
        </div>

        {/* active tool — every tool reads its state from the global store */}
        <div className="gos-rise mt-5">
          {tab === "asr" && <AsrTool onSendToChat={onSendToChat} />}
          {tab === "tts" && <TtsTool />}
          {tab === "image" && <ImageTool />}
          {tab === "video" && <VideoTool />}
        </div>
      </div>
    </div>
  )
}

// ─── shared pieces ─────────────────────────────────────────────────────────

function ToolHeader({ icon, title, note }: { icon: React.ReactNode; title: string; note: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
        {icon}
      </span>
      <div>
        <h3 className="font-display text-sm font-semibold">{title}</h3>
        <p className="font-mono text-[10px] text-muted-foreground">{note}</p>
      </div>
    </div>
  )
}

function ErrorCard({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="gos-rise mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-destructive">Generation failed</p>
        <p className="mt-0.5 break-words font-mono text-[11px] leading-relaxed text-destructive/80">{message}</p>
      </div>
      {onRetry && (
        <Button size="sm" variant="outline" className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10" onClick={onRetry}>
          <RotateCw className="h-3.5 w-3.5" />
          Retry
        </Button>
      )}
    </div>
  )
}

function useMediaList(kind: "image" | "audio" | "video") {
  const items = useStudio((s) => s.mediaLists[kind])
  const loaded = useStudio((s) => s.listsLoaded[kind])
  const reload = useStudio((s) => s.reloadMedia)
  useEffect(() => {
    if (!loaded) void reload(kind)
  }, [loaded, kind, reload])
  return items
}

function RecentStrip({ label, items }: { label: string; items: MediaListItem[] }) {
  if (items.length === 0) return null
  return (
    <section aria-label={label} className="mt-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80">{label}</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {items.slice(0, 4).map((m) => (
          <MediaBlock key={m.id} media={{ id: m.id, kind: m.kind as MediaRef["kind"], prompt: m.prompt, url: m.url, pending: m.pending }} compact />
        ))}
      </div>
    </section>
  )
}

// ─── Voice → Text (ASR) ────────────────────────────────────────────────────

function AsrTool({ onSendToChat }: { onSendToChat?: (text: string) => void }) {
  const { toast } = useToast()
  const asr = useStudio((s) => s.asr)
  const patchAsr = useStudio((s) => s.patchAsr)
  const transcribe = useStudio((s) => s.transcribe)
  const [copied, setCopied] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const startRecording = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      const message = "This environment blocks the microphone — upload an audio file instead."
      patchAsr({ error: message })
      toast({ title: "Microphone unavailable", description: message, variant: "destructive" })
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec = new MediaRecorder(stream)
      recorderBox.chunks = []
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) recorderBox.chunks.push(e.data)
      }
      rec.start()
      recorderBox.rec = rec
      patchAsr({ recording: true, seconds: 0, error: null, transcript: "" })
      recorderBox.timer = setInterval(() => {
        useStudio.setState((s) => ({ asr: { ...s.asr, seconds: s.asr.seconds + 1 } }))
      }, 1000)
    } catch {
      const message = "Mic permission was denied — upload an audio file instead (wav · mp3 · m4a)."
      patchAsr({ error: message })
      toast({ title: "Microphone unavailable", description: message, variant: "destructive" })
    }
  }, [patchAsr, toast])

  const stopAndTranscribe = useCallback(async () => {
    const rec = recorderBox.rec
    if (!rec) return
    rec.stop()
    stopRecorderTracks()
    patchAsr({ recording: false })
    const duration = useStudio.getState().asr.seconds
    const blob = new Blob(recorderBox.chunks, { type: rec.mimeType || "audio/webm" })
    if (blob.size < 2000 || duration < 1) {
      const message = "That clip was too short — hold the recording for at least a second."
      patchAsr({ error: message })
      return
    }
    try {
      const base64 = await audioToBase64Best(blob)
      await transcribe(base64)
    } catch (err) {
      toast({
        title: "Transcription failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      })
    }
  }, [patchAsr, transcribe, toast])

  // stop the tracks when leaving the whole app (not when switching tabs)
  useEffect(() => {
    const onUnload = () => stopRecorderTracks()
    window.addEventListener("beforeunload", onUnload)
    return () => window.removeEventListener("beforeunload", onUnload)
  }, [])

  const onFile = async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
    patchAsr({ busy: true, error: null, transcript: "" })
    try {
      const base64 = /^(wav|mp3|m4a|flac|ogg)$/.test(ext) ? await fileToBase64(file) : await audioToBase64Best(file)
      await transcribe(base64)
    } catch (err) {
      toast({ title: "Could not read that file", description: err instanceof Error ? err.message : String(err), variant: "destructive" })
      patchAsr({ busy: false })
    }
  }

  return (
    <div className="rounded-xl border border-border/70 bg-card/40 p-4">
      <ToolHeader icon={<AudioLines className="h-4 w-4" />} title="Voice → Text" note="speak or upload — your draft stays even if you switch tabs" />

      <div className="flex flex-col items-center gap-4 py-4">
        <button
          onClick={asr.recording ? stopAndTranscribe : startRecording}
          disabled={asr.busy}
          aria-label={asr.recording ? "Stop recording" : "Start recording"}
          className={cn(
            "relative flex h-20 w-20 items-center justify-center rounded-full border transition-all",
            asr.recording
              ? "border-primary/60 bg-primary/20 gos-glow"
              : "border-primary/30 bg-primary/10 hover:bg-primary/20",
            asr.busy && "opacity-60",
          )}
        >
          {asr.busy ? (
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          ) : asr.recording ? (
            <Square className="h-6 w-6 text-primary" />
          ) : (
            <Mic className="h-7 w-7 text-primary" />
          )}
          {asr.recording && <span className="gos-pulse-dot absolute inset-0 rounded-full border-2 border-primary/50" />}
        </button>
        <div className="text-center">
          <p className="font-mono text-sm tabular-nums text-primary">
            {asr.recording
              ? `recording · ${Math.floor(asr.seconds / 60)}:${String(asr.seconds % 60).padStart(2, "0")}`
              : asr.busy
                ? "transcribing…"
                : "tap to speak"}
          </p>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">
            or upload a file — wav · mp3 · m4a · flac · ogg
          </p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void onFile(f)
            e.target.value = ""
          }}
        />
        <Button variant="outline" size="sm" className="gap-2" onClick={() => fileRef.current?.click()} disabled={asr.recording || asr.busy}>
          <Upload className="h-3.5 w-3.5" />
          Upload audio
        </Button>
      </div>

      {asr.error && <ErrorCard message={asr.error} />}

      {asr.transcript && (
        <div className="gos-rise rounded-xl border border-primary/25 bg-accent/30 p-4">
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{asr.transcript}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                void navigator.clipboard.writeText(asr.transcript)
                setCopied(true)
                setTimeout(() => setCopied(false), 1500)
              }}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            {onSendToChat && (
              <Button size="sm" className="gap-1.5" onClick={() => onSendToChat(asr.transcript)}>
                <Sparkles className="h-3.5 w-3.5" />
                Run through the agent loop
              </Button>
            )}
            <span className="ml-auto self-center font-mono text-[10px] text-muted-foreground">
              {asr.transcript.split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Text → Voice (TTS) — persona picker: gender × age ─────────────────────

const AGE_GROUPS: { key: VoiceCharacter["age"]; label: string }[] = [
  { key: "child", label: "Kids" },
  { key: "teen", label: "Teens" },
  { key: "adult", label: "Adults" },
  { key: "mature", label: "Mature" },
]

function TtsTool() {
  const tts = useStudio((s) => s.tts)
  const patchTts = useStudio((s) => s.patchTts)
  const generateVoice = useStudio((s) => s.generateVoice)
  const items = useMediaList("audio")
  const over = tts.text.length > 1024
  const character = findCharacter(tts.character)

  return (
    <div className="rounded-xl border border-border/70 bg-card/40 p-4">
      <ToolHeader icon={<Volume2 className="h-4 w-4" />} title="Text → Voice" note="pick a persona — gender × age, fine-tune tone · 1024 chars per track" />

      <Textarea
        value={tts.text}
        onChange={(e) => patchTts({ text: e.target.value })}
        placeholder="Type anything — a greeting, a narration, a line for your site's hero…"
        rows={4}
        className="resize-none text-[14px] leading-relaxed"
      />
      <div className={cn("mt-1 text-right font-mono text-[10px]", over ? "text-destructive" : "text-muted-foreground")}>
        {tts.text.length}/1024
      </div>

      {/* persona grid */}
      <div className="mt-4 space-y-3">
        <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <Users className="h-3 w-3" />
          voice persona — gender &amp; age
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {AGE_GROUPS.map((group) => (
            <div key={group.key} className="space-y-1.5">
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/70">{group.label}</p>
              {VOICE_CHARACTERS.filter((c) => c.age === group.key).map((c) => (
                <button
                  key={c.id}
                  onClick={() => patchTts({ character: c.id })}
                  aria-pressed={tts.character === c.id}
                  className={cn(
                    "w-full rounded-lg border px-2.5 py-2 text-left transition-all",
                    tts.character === c.id
                      ? "gos-glow border-primary/50 bg-accent/70"
                      : "border-border/70 bg-card/40 hover:border-primary/30 hover:bg-accent/30",
                  )}
                >
                  <span className="flex items-center justify-between gap-1">
                    <span className={cn("font-display text-[12px] font-semibold", tts.character === c.id ? "text-primary" : "text-foreground")}>
                      {c.label}
                    </span>
                    <span
                      className={cn(
                        "rounded px-1 font-mono text-[9px] font-bold",
                        c.gender === "female" ? "bg-primary/15 text-primary" : "bg-foreground/10 text-foreground/70",
                      )}
                      title={c.gender}
                    >
                      {c.gender === "female" ? "♀" : "♂"}
                    </span>
                  </span>
                  <span className="mt-0.5 block truncate font-mono text-[9px] text-muted-foreground">{c.hint}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
        <p className="font-mono text-[9px] leading-relaxed text-muted-foreground/70">
          personas are pitch-tuned from measured voices ({character.base}
          {character.shift !== 0 ? `, ${character.shift > 0 ? "+" : ""}${character.shift} st` : ", natural pitch"}) — the tone slider below
          shifts the pitch further
        </p>
      </div>

      {/* fine-tune */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="tts-tone" className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            tone · {tts.tone === 0 ? "natural" : `${tts.tone > 0 ? "+" : ""}${tts.tone} st ${tts.tone > 0 ? "brighter" : "deeper"}`}
          </label>
          <input
            id="tts-tone"
            type="range"
            min={-6}
            max={6}
            step={1}
            value={tts.tone}
            onChange={(e) => patchTts({ tone: Number(e.target.value) })}
            className="mt-2.5 w-full accent-primary"
          />
          <div className="flex justify-between font-mono text-[9px] text-muted-foreground/70">
            <span>deeper · older</span>
            <span>brighter · younger</span>
          </div>
        </div>
        <div>
          <label htmlFor="tts-speed" className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            pace · {tts.speed.toFixed(1)}×
          </label>
          <input
            id="tts-speed"
            type="range"
            min={0.5}
            max={2}
            step={0.1}
            value={tts.speed}
            onChange={(e) => patchTts({ speed: Number(e.target.value) })}
            className="mt-2.5 w-full accent-primary"
          />
          <div className="flex justify-between font-mono text-[9px] text-muted-foreground/70">
            <span>slow</span>
            <span>fast</span>
          </div>
        </div>
      </div>

      <Button onClick={() => void generateVoice()} disabled={!tts.text.trim() || over || tts.busy} className="mt-4 w-full gap-2">
        {tts.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
        {tts.busy ? "Synthesizing…" : `Generate voice · ${character.label}`}
      </Button>

      {tts.error && <ErrorCard message={tts.error} onRetry={() => void generateVoice()} />}

      {tts.audioUrl && (
        <div className="gos-rise mt-4 rounded-xl border border-primary/25 bg-accent/30 p-3.5">
          <div className="mb-2 flex items-center gap-1.5">
            <Volume2 className="h-3.5 w-3.5 text-primary" />
            <span className="truncate font-mono text-[10px] text-muted-foreground">
              {tts.lastCharacterLabel} · {tts.lastSpeed?.toFixed(1)}×
            </span>
            <a
              href={tts.audioUrl}
              download={`growth-os-voice-${tts.audioId ?? "track"}.wav`}
              className="ml-auto flex items-center gap-1 rounded-md border border-border/70 px-2 py-1 font-mono text-[10px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Download className="h-3 w-3" />
              wav
            </a>
          </div>
          <audio src={tts.audioUrl} controls autoPlay className="w-full" />
        </div>
      )}

      <RecentStrip label="recent voice tracks" items={items} />
    </div>
  )
}

// ─── Photos (image generation) ─────────────────────────────────────────────

function ImageTool() {
  const image = useStudio((s) => s.image)
  const patchImage = useStudio((s) => s.patchImage)
  const generateImage = useStudio((s) => s.generateImage)
  const items = useMediaList("image")

  return (
    <div className="rounded-xl border border-border/70 bg-card/40 p-4">
      <ToolHeader icon={<ImageIcon className="h-4 w-4" />} title="Photos" note="async render — keep browsing, the result lands here" />

      <Textarea
        value={image.prompt}
        onChange={(e) => patchImage({ prompt: e.target.value })}
        placeholder="A misty pine forest at dawn, soft light, editorial photography style, high quality"
        rows={3}
        className="resize-none text-[14px] leading-relaxed"
      />

      <div className="mt-3">
        <label htmlFor="img-size" className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          aspect ratio
        </label>
        <Select value={image.size} onValueChange={(v) => patchImage({ size: v })}>
          <SelectTrigger id="img-size" className="w-full sm:w-72">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {IMAGE_SIZES.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={() => void generateImage()} disabled={!image.prompt.trim() || image.busy} className="mt-4 w-full gap-2">
        {image.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
        {image.busy ? "Rendering…" : "Generate image"}
      </Button>

      {image.busy && (
        <div className="gos-rise mt-4 flex items-center justify-center gap-2 rounded-xl border border-dashed border-primary/30 bg-accent/20 py-12">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="font-mono text-xs text-muted-foreground">composing pixels — safe to switch tabs, this keeps running…</span>
        </div>
      )}

      {image.error && <ErrorCard message={image.error} onRetry={() => void generateImage()} />}

      {image.result && (
        <div className="gos-rise mt-4">
          <MediaBlock media={image.result} />
        </div>
      )}

      <RecentStrip label="recent images" items={items} />
    </div>
  )
}

// ─── Video generation ──────────────────────────────────────────────────────

function VideoTool() {
  const video = useStudio((s) => s.video)
  const patchVideo = useStudio((s) => s.patchVideo)
  const startVideoRender = useStudio((s) => s.startVideoRender)
  const items = useMediaList("video")
  const rendering = !!video.taskId

  return (
    <div className="rounded-xl border border-border/70 bg-card/40 p-4">
      <ToolHeader icon={<Clapperboard className="h-4 w-4" />} title="Video" note="async render farm · live progress · mp4 with audio" />

      <Textarea
        value={video.prompt}
        onChange={(e) => patchVideo({ prompt: e.target.value })}
        placeholder="A slow dolly shot through a sunlit ceramic studio, dust in the air, warm tones"
        rows={3}
        className="resize-none text-[14px] leading-relaxed"
      />

      <div className="mt-3">
        <label htmlFor="vid-quality" className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          render mode
        </label>
        <Select value={video.quality} onValueChange={(v) => patchVideo({ quality: v })}>
          <SelectTrigger id="vid-quality" className="w-full sm:w-72">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="speed">Speed — faster draft</SelectItem>
            <SelectItem value="quality">Quality — slower, finer detail</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={() => void startVideoRender()} disabled={!video.prompt.trim() || video.busy || rendering} className="mt-4 w-full gap-2">
        {video.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
        {video.busy ? "Submitting…" : rendering ? "Rendering…" : "Start render"}
      </Button>

      {rendering && (
        <div className="gos-rise mt-4 flex items-center gap-3 rounded-xl border border-primary/25 bg-accent/30 px-4 py-4">
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">Rendering “{video.prompt}”</p>
            <p className="font-mono text-[10px] text-muted-foreground">
              {Math.floor(video.elapsed / 60)}:{String(video.elapsed % 60).padStart(2, "0")} elapsed · clips usually land in 1–3 minutes · keeps
              running while you switch tabs
            </p>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span key={i} className="gos-pulse-dot h-1.5 w-1.5 rounded-full bg-primary" />
            ))}
          </div>
        </div>
      )}

      {video.error && <ErrorCard message={video.error} onRetry={() => void startVideoRender()} />}

      {video.result && (
        <div className="gos-rise mt-4">
          <MediaBlock media={video.result} />
        </div>
      )}

      <RecentStrip label="recent renders" items={items} />
    </div>
  )
}
