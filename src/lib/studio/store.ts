"use client"

// ─── Global studio store ──────────────────────────────────────────────────
// Everything the Studio tools type or render lives HERE — not in component
// state — so switching tabs, views or screens never loses a draft or an
// in-flight render. Polling intervals are owned by the store, not by any
// component's lifecycle.

import { create } from "zustand"
import { findCharacter } from "@/lib/media/characters"
import type { MediaRef } from "@/lib/gos/types"

export type StudioTab = "asr" | "tts" | "image" | "video"

export const STUDIO_TABS: { id: StudioTab; label: string; blurb: string }[] = [
  { id: "asr", label: "Voice → Text", blurb: "speak or upload audio — get the exact words back" },
  { id: "tts", label: "Text → Voice", blurb: "pick a persona — gender, age, tone" },
  { id: "image", label: "Photos", blurb: "prompt to artwork, seven aspect ratios" },
  { id: "video", label: "Video", blurb: "scene to clip — async render with live progress" },
]

export const IMAGE_SIZES = [
  { id: "1024x1024", label: "Square · 1024×1024" },
  { id: "1344x768", label: "Landscape · 1344×768" },
  { id: "1440x720", label: "Wide · 1440×720" },
  { id: "1152x864", label: "Classic · 1152×864" },
  { id: "768x1344", label: "Portrait · 768×1344" },
  { id: "864x1152", label: "Tall · 864×1152" },
  { id: "720x1440", label: "Story · 720×1440" },
]

export interface MediaListItem {
  id: string
  kind: string
  prompt: string
  url: string | null
  status: string
  pending: boolean
  createdAt: string
}

// ── state shapes ────────────────────────────────────────────────────────────

interface AsrState {
  transcript: string
  busy: boolean
  error: string | null
  recording: boolean
  seconds: number
}

interface TtsState {
  text: string
  character: string
  tone: number // extra semitones, -6…+6
  speed: number
  busy: boolean
  error: string | null
  audioUrl: string | null
  audioId: string | null
  lastCharacterLabel: string | null
  lastSpeed: number | null
}

interface ImageState {
  prompt: string
  size: string
  busy: boolean
  jobId: string | null
  error: string | null
  result: MediaRef | null
}

interface VideoState {
  prompt: string
  quality: string
  busy: boolean
  taskId: string | null
  mediaId: string | null
  elapsed: number
  error: string | null
  result: MediaRef | null
}

interface StudioState {
  tab: StudioTab
  asr: AsrState
  tts: TtsState
  image: ImageState
  video: VideoState
  mediaLists: { image: MediaListItem[]; audio: MediaListItem[]; video: MediaListItem[] }
  listsLoaded: Record<string, boolean>

  // actions
  setTab: (tab: StudioTab) => void
  patchAsr: (patch: Partial<AsrState>) => void
  patchTts: (patch: Partial<TtsState>) => void
  patchImage: (patch: Partial<ImageState>) => void
  patchVideo: (patch: Partial<VideoState>) => void
  transcribe: (audioBase64: string) => Promise<string>
  generateVoice: () => Promise<void>
  generateImage: () => Promise<void>
  startVideoRender: () => Promise<void>
  cancelVideoWatch: () => void
  reloadMedia: (kind: "image" | "audio" | "video") => Promise<void>
}

// module-scoped timers — live outside React entirely
const videoPollRef: { timer: ReturnType<typeof setTimeout> | null; tick: ReturnType<typeof setInterval> | null } = {
  timer: null,
  tick: null,
}
const imagePollRef: { timer: ReturnType<typeof setTimeout> | null } = { timer: null }

/** Fetch helper that never throws on HTML error pages — always JSON or a clear error. */
async function fetchJson<T>(input: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: T & { error?: string } }> {
  const res = await fetch(input, init)
  let data: T & { error?: string }
  try {
    data = (await res.json()) as T & { error?: string }
  } catch {
    data = {
      error: `The server answered with a non-JSON response (${res.status}) — usually a transient timeout. Please retry.`,
    } as T & { error?: string }
  }
  return { ok: res.ok, status: res.status, data }
}

export const useStudio = create<StudioState>((set, get) => ({
  tab: "asr",
  asr: { transcript: "", busy: false, error: null, recording: false, seconds: 0 },
  tts: {
    text: "",
    character: "woman_warm",
    tone: 0,
    speed: 1,
    busy: false,
    error: null,
    audioUrl: null,
    audioId: null,
    lastCharacterLabel: null,
    lastSpeed: null,
  },
  image: { prompt: "", size: "1024x1024", busy: false, jobId: null, error: null, result: null },
  video: { prompt: "", quality: "speed", busy: false, taskId: null, mediaId: null, elapsed: 0, error: null, result: null },
  mediaLists: { image: [], audio: [], video: [] },
  listsLoaded: {},

  setTab: (tab) => set({ tab }),

  patchAsr: (patch) => set((s) => ({ asr: { ...s.asr, ...patch } })),
  patchTts: (patch) => set((s) => ({ tts: { ...s.tts, ...patch } })),
  patchImage: (patch) => set((s) => ({ image: { ...s.image, ...patch } })),
  patchVideo: (patch) => set((s) => ({ video: { ...s.video, ...patch } })),

  transcribe: async (audioBase64) => {
    set((s) => ({ asr: { ...s.asr, busy: true, error: null } }))
    try {
      const { ok, data } = await fetchJson<{ text?: string }>("/api/media/asr", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ audioBase64 }),
      })
      if (!ok || !data.text) throw new Error(data.error ?? "Transcription failed — try again")
      set((s) => ({ asr: { ...s.asr, busy: false, transcript: data.text ?? "" } }))
      return data.text
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      set((s) => ({ asr: { ...s.asr, busy: false, error: message } }))
      throw new Error(message)
    }
  },

  generateVoice: async () => {
    const { tts } = get()
    if (!tts.text.trim() || tts.text.length > 1024 || tts.busy) return
    const character = findCharacter(tts.character)
    set((s) => ({
      tts: { ...s.tts, busy: true, error: null, audioUrl: null, audioId: null, lastCharacterLabel: null },
    }))
    try {
      const res = await fetch("/api/media/tts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          text: tts.text,
          character: tts.character,
          tone: tts.tone,
          speed: tts.speed,
        }),
      })
      if (!res.ok) {
        let message = `Synthesis failed (${res.status})`
        try {
          const data = (await res.json()) as { error?: string }
          message = data.error ?? message
        } catch {
          /* HTML error page — keep the generic message */
        }
        throw new Error(message)
      }
      const blob = await res.blob()
      const audioUrl = URL.createObjectURL(blob)
      const audioId = res.headers.get("X-Media-Id")
      // revoke the previous object URL to avoid leaks
      const prev = get().tts.audioUrl
      if (prev) URL.revokeObjectURL(prev)
      set((s) => ({
        tts: {
          ...s.tts,
          busy: false,
          audioUrl,
          audioId,
          lastCharacterLabel: character.label,
          lastSpeed: s.tts.speed,
        },
      }))
      void get().reloadMedia("audio")
    } catch (err) {
      set((s) => ({ tts: { ...s.tts, busy: false, error: err instanceof Error ? err.message : String(err) } }))
    }
  },

  generateImage: async () => {
    const { image } = get()
    if (!image.prompt.trim() || image.busy) return
    set((s) => ({
      image: { ...s.image, busy: true, error: null, jobId: null, result: null },
    }))
    try {
      const { ok, data } = await fetchJson<{ jobId?: string }>("/api/media/image", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: image.prompt, size: image.size }),
      })
      if (!ok || !data.jobId) throw new Error(data.error ?? "Could not start the generation")
      const jobId = data.jobId
      set((s) => ({ image: { ...s.image, jobId } }))

      // poll until the job resolves — the timer belongs to the store,
      // so it keeps running no matter which tab/view is on screen
      const poll = async () => {
        try {
          const { data: job } = await fetchJson<{ status?: string; mediaUrl?: string | null; id?: string | null; error?: string | null }>(
            `/api/media/image?jobId=${encodeURIComponent(jobId)}`,
          )
          if (job.status === "done" && job.id) {
            set((s) => ({
              image: { ...s.image, busy: false, jobId: null, result: { id: job.id!, kind: "image", prompt: s.image.prompt } },
            }))
            void get().reloadMedia("image")
            return
          }
          if (job.status === "failed") {
            set((s) => ({ image: { ...s.image, busy: false, jobId: null, error: job.error ?? "Generation failed — retry" } }))
            return
          }
        } catch {
          /* transient poll failure — keep waiting */
        }
        imagePollRef.timer = setTimeout(poll, 2500)
      }
      imagePollRef.timer = setTimeout(poll, 1500)
    } catch (err) {
      set((s) => ({ image: { ...s.image, busy: false, jobId: null, error: err instanceof Error ? err.message : String(err) } }))
    }
  },

  startVideoRender: async () => {
    const { video } = get()
    if (!video.prompt.trim() || video.busy || video.taskId) return
    set((s) => ({ video: { ...s.video, busy: true, error: null, result: null, elapsed: 0 } }))
    try {
      const { ok, data } = await fetchJson<{ taskId?: string; mediaId?: string }>("/api/media/video", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: video.prompt, quality: video.quality }),
      })
      if (!ok || !data.taskId || !data.mediaId) throw new Error(data.error ?? "Could not start the render")
      const { taskId, mediaId } = data
      set((s) => ({ video: { ...s.video, busy: false, taskId, mediaId } }))

      const startedAt = Date.now()
      videoPollRef.tick = setInterval(() => {
        set((s) => (s.video.taskId === taskId ? { video: { ...s.video, elapsed: Math.floor((Date.now() - startedAt) / 1000) } } : {}))
      }, 1000)

      const poll = async () => {
        if (get().video.taskId !== taskId) return // superseded or cancelled
        try {
          const { data: status } = await fetchJson<{ status?: string; url?: string | null }>(
            `/api/media/video/status?taskId=${encodeURIComponent(taskId)}`,
          )
          if (status.status === "SUCCESS" && status.url) {
            get().cancelVideoWatch()
            set((s) => ({
              video: { ...s.video, taskId: null, result: { id: s.video.mediaId ?? taskId, kind: "video", prompt: s.video.prompt, url: status.url! } },
            }))
            void get().reloadMedia("video")
            return
          }
          if (status.status === "FAIL") {
            get().cancelVideoWatch()
            set((s) => ({
              video: { ...s.video, taskId: null, error: "The render farm reported a failure — try a simpler scene, or retry." },
            }))
            return
          }
        } catch {
          /* keep polling */
        }
        videoPollRef.timer = setTimeout(poll, 5000)
      }
      videoPollRef.timer = setTimeout(poll, 5000)
    } catch (err) {
      set((s) => ({ video: { ...s.video, busy: false, error: err instanceof Error ? err.message : String(err) } }))
    }
  },

  cancelVideoWatch: () => {
    if (videoPollRef.timer) clearTimeout(videoPollRef.timer)
    if (videoPollRef.tick) clearInterval(videoPollRef.tick)
    videoPollRef.timer = null
    videoPollRef.tick = null
  },

  reloadMedia: async (kind) => {
    try {
      const res = await fetch(`/api/media?kind=${kind}&take=6`)
      if (!res.ok) return
      const data = (await res.json()) as { media: MediaListItem[] }
      set((s) => ({ mediaLists: { ...s.mediaLists, [kind]: data.media }, listsLoaded: { ...s.listsLoaded, [kind]: true } }))
    } catch {
      /* non-fatal */
    }
  },
}))
