"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowUp, Bot, Loader2, MessageSquarePlus, Mic, RotateCw, Sparkles, Square, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AgentTimeline } from "@/components/gos/agent-timeline"
import { Markdown } from "@/components/gos/markdown"
import { MediaBlock } from "@/components/gos/media-block"
import { audioToBase64Best } from "@/lib/media/client"
import { useToast } from "@/hooks/use-toast"
import type { AgentStep, ChatMessage, Intent, MediaRef } from "@/lib/gos/types"
import { cn } from "@/lib/utils"

const EXAMPLES = [
  "Build a website for a specialty coffee roastery in Lisbon — warm, editorial, with a subscription CTA",
  "Generate an image of a misty pine forest at dawn",
  "Analyze https://stripe.com and tell me what we can steal",
  "Remember: my business is a ceramic studio in Kraków and my brand color is copper",
]

interface ChatPanelProps {
  messages: ChatMessage[]
  pending: boolean
  liveSteps: AgentStep[]
  liveIntent: Intent | null
  streamingReply: string
  liveMedia: MediaRef[]
  onSend: (text: string) => void
  onNewChat: () => void
  onRetry?: () => void
}

export function ChatPanel({
  messages,
  pending,
  liveSteps,
  liveIntent,
  streamingReply,
  liveMedia,
  onSend,
  onNewChat,
  onRetry,
}: ChatPanelProps) {
  const { toast } = useToast()
  const [input, setInput] = useState("")
  const [recording, setRecording] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [messages.length, pending, liveSteps.length, streamingReply, liveMedia.length])

  const submit = () => {
    const text = input.trim()
    if (!text || pending) return
    setInput("")
    onSend(text)
  }

  // ── voice input: record → transcribe → composer ──────────────────────
  const toggleMic = useCallback(async () => {
    if (transcribing || pending) return
    if (recording) {
      const recorder = recorderRef.current
      if (!recorder) return
      recorder.stop()
      recorder.stream.getTracks().forEach((t) => t.stop())
      setRecording(false)
      setTranscribing(true)
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" })
      try {
        if (blob.size < 2000) throw new Error("The recording was too short — hold the mic a bit longer")
        const audioBase64 = await audioToBase64Best(blob)
        const res = await fetch("/api/media/asr", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ audioBase64 }),
        })
        const data = await res.json().catch(() => ({ error: "Transcription failed — the server returned an unexpected response" }))
        if (!res.ok) throw new Error(data.error ?? "Transcription failed")
        setInput((prev) => (prev ? `${prev} ${data.text}` : data.text))
      } catch (err) {
        toast({
          title: "Voice → text failed",
          description: err instanceof Error ? err.message : String(err),
          variant: "destructive",
        })
      } finally {
        setTranscribing(false)
      }
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.start()
      recorderRef.current = recorder
      setRecording(true)
    } catch {
      toast({
        title: "Microphone unavailable",
        description: "This environment blocks the mic — type your message or use Studio → Voice → Text with a file.",
        variant: "destructive",
      })
    }
  }, [recording, transcribing, pending, toast])

  useEffect(
    () => () => {
      recorderRef.current?.stream.getTracks().forEach((t) => t.stop())
    },
    [],
  )

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* header */}
      <div className="flex items-center justify-between gap-2 border-b border-border/70 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <MessageSquarePlus className="h-4 w-4 text-primary" />
          <h2 className="font-display text-sm font-semibold tracking-wide">Chat &amp; Build</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onNewChat}
          className="h-7 gap-1.5 px-2 text-xs text-muted-foreground"
        >
          <MessageSquarePlus className="h-3.5 w-3.5" />
          New chat
        </Button>
      </div>

      {/* messages */}
      <div ref={scrollRef} className="gos-scroll min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && !pending ? (
          <div className="gos-rise mx-auto flex h-full max-w-xl flex-col items-center justify-center gap-5 py-8 text-center">
            <div className="gos-grid-bg flex h-14 w-14 items-center justify-center rounded-2xl border border-border/70">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold">Talk to the machine</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Describe a website and watch it build in the preview. Ask anything about the
                system. Paste a URL to analyze it. Say <span className="text-foreground">remember…</span> to
                teach it durable facts.
              </p>
            </div>
            <div className="grid w-full gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => onSend(ex)}
                  className="group rounded-lg border border-border/70 bg-card/60 px-3.5 py-2.5 text-left text-[13px] leading-snug text-muted-foreground transition-all hover:border-primary/40 hover:bg-accent/30 hover:text-foreground"
                >
                  <span className="mr-1.5 text-primary/70 group-hover:text-primary">→</span>
                  {ex}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-5">
            {messages.map((m) => (
              <div key={m.id} className="gos-rise">
                {m.role === "user" ? (
                  <div className="flex justify-end gap-2.5">
                    <div className="max-w-[85%] rounded-xl rounded-br-sm border border-primary/25 bg-accent/40 px-3.5 py-2.5 text-[14px] leading-relaxed text-foreground">
                      {m.content}
                    </div>
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-card">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                    </span>
                  </div>
                ) : (
                  <div className="flex gap-2.5">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-accent/50">
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    </span>
                    <div className="min-w-0 flex-1">
                      {m.meta?.intent && (
                        <span className="mb-1.5 inline-block rounded-md border border-primary/25 bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
                          {m.meta.intent.replace("_", " ")}
                        </span>
                      )}
                      <Markdown content={m.content} />
                      {m.id.startsWith("err-") && onRetry && (
                        <div className="mt-2.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5"
                            onClick={onRetry}
                            disabled={pending}
                          >
                            <RotateCw className="h-3.5 w-3.5" />
                            Retry last message
                          </Button>
                        </div>
                      )}
                      {m.meta?.media && m.meta.media.length > 0 && (
                        <div className="mt-3 space-y-3">
                          {m.meta.media.map((media) => (
                            <MediaBlock key={media.id} media={media} compact />
                          ))}
                        </div>
                      )}
                      {m.meta?.steps && <AgentTimeline steps={m.meta.steps} />}
                      {m.meta?.verification && (
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <span
                            className={cn(
                              "rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold",
                              (m.meta.verification.score ?? 0) >= 80
                                ? "bg-primary/15 text-primary"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            {m.meta.verification.score}/100 verified
                          </span>
                          {m.meta.verification.checks
                            .filter((c) => !c.pass)
                            .map((c) => (
                              <span
                                key={c.id}
                                className="rounded-md bg-destructive/10 px-2 py-0.5 font-mono text-[10px] text-destructive"
                              >
                                ✗ {c.label}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* live run — the engine streaming in real time */}
            {pending && (
              <div className="flex gap-2.5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-accent/50">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </span>
                <div className="min-w-0 flex-1">
                  {liveIntent && (
                    <span className="mb-1.5 inline-block rounded-md border border-primary/25 bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
                      {liveIntent.replace("_", " ")}
                    </span>
                  )}
                  {liveSteps.length > 0 ? (
                    <AgentTimeline steps={liveSteps} live />
                  ) : (
                    <div className="space-y-2">
                      <div className="gos-shimmer h-3.5 w-3/4 rounded" />
                      <div className="gos-shimmer h-3.5 w-1/2 rounded" />
                    </div>
                  )}
                  {streamingReply && (
                    <div className="mt-3">
                      <Markdown content={streamingReply} />
                      <span className="gos-pulse-dot ml-0.5 inline-block h-3.5 w-1.5 rounded-sm bg-primary align-middle" />
                    </div>
                  )}
                  {liveMedia.length > 0 && (
                    <div className="mt-3 space-y-3">
                      {liveMedia.map((media) => (
                        <MediaBlock key={media.id} media={media} compact />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* composer */}
      <div className="border-t border-border/70 p-3">
        <div className="mx-auto max-w-2xl">
          <div className="relative rounded-xl border border-border bg-card transition-colors focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/30">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  submit()
                }
              }}
              placeholder="Describe a website, ask about the system, generate media, paste a URL…"
              rows={2}
              disabled={pending}
              className="max-h-40 min-h-[52px] resize-none border-0 bg-transparent px-3.5 py-3 pl-12 pr-12 text-[14px] leading-relaxed placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={toggleMic}
              disabled={pending}
              aria-label={recording ? "Stop recording and transcribe" : "Record voice message"}
              title={recording ? "Stop — transcribe" : "Voice → text"}
              className={cn(
                "absolute bottom-3 left-2.5 flex h-8 w-8 items-center justify-center rounded-lg border transition-all",
                recording
                  ? "gos-glow border-primary/60 bg-primary/20 text-primary"
                  : transcribing
                    ? "border-primary/30 bg-accent/50 text-primary"
                    : "border-transparent text-muted-foreground hover:border-border/70 hover:bg-muted/60 hover:text-foreground",
                pending && "opacity-50",
              )}
            >
              {transcribing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : recording ? (
                <Square className="h-3.5 w-3.5" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </button>
            {recording && (
              <span className="gos-pulse-dot absolute bottom-4.5 left-12 h-2 w-2 rounded-full bg-primary" aria-hidden />
            )}
            <Button
              size="icon"
              onClick={submit}
              disabled={!input.trim() || pending}
              aria-label="Send message"
              className="absolute bottom-2.5 right-2.5 h-8 w-8 rounded-lg"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-1.5 px-1 text-center font-mono text-[10px] text-muted-foreground/60">
            {recording
              ? "listening… tap the square to transcribe"
              : transcribing
                ? "transcribing your voice…"
                : pending
                  ? "agent loop running — every step streams live"
                  : "enter to send · mic for voice · shift+enter for a new line"}
          </p>
        </div>
      </div>
    </div>
  )
}
