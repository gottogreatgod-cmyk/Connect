// ─── Media layer: typed wrappers over the z-ai SDK media endpoints ───────
// speech → text (ASR) · text → speech (TTS) · image generation · video generation
// Backend only — never import from client components.
import ZAI from "z-ai-web-dev-sdk"
import { VOICE_CHARACTERS, findCharacter, type VoiceCharacter } from "@/lib/media/characters"

export { VOICE_CHARACTERS, findCharacter }
export type { VoiceCharacter }

const g = globalThis as unknown as { __zaiMediaInstance: Awaited<ReturnType<typeof ZAI.create>> | undefined }

export async function getClient() {
  if (!g.__zaiMediaInstance) {
    g.__zaiMediaInstance = await ZAI.create()
  }
  return g.__zaiMediaInstance
}

// ── ASR: speech → text ─────────────────────────────────────────────────────

export async function transcribe(audioBase64: string): Promise<string> {
  const client = await getClient()
  const response = await client.audio.asr.create({ file_base64: audioBase64 })
  const text = (response as { text?: string })?.text
  if (!text || text.trim().length === 0) {
    throw new Error("Transcription came back empty — try again with clearer audio")
  }
  return text.trim()
}

// ── TTS: text → speech ─────────────────────────────────────────────────────
//
// Personas (gender × age) live in characters.ts — shared with the client.
// A persona = base voice + semitone pitch shift implemented via resampling:
// synthesize at speed pace/r, then resample by r — the duration returns to
// the requested pace while the pitch moves by r. The SDK speed window
// (0.5–2.0) caps the shift at ±12 semitones — plenty for age ranges.

export const TTS_VOICES = [
  { id: "tongtong", label: "Warm & friendly" },
  { id: "chuichui", label: "Lively & playful" },
  { id: "xiaochen", label: "Calm & professional" },
  { id: "jam", label: "British gentleman" },
  { id: "kazi", label: "Clear & standard" },
  { id: "douji", label: "Natural & fluent" },
  { id: "luodo", label: "Expressive" },
] as const

export type VoiceId = (typeof TTS_VOICES)[number]["id"]

// ── minimal WAV decode/encode + resampler (16-bit PCM mono) ────────────────

interface Pcm {
  sampleRate: number
  samples: Float32Array
}

function decodeWavPcm(buf: Buffer): Pcm {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
  if (buf.length < 44 || buf.toString("ascii", 0, 4) !== "RIFF") {
    throw new Error("Unexpected audio format from the voice engine")
  }
  let offset = 12
  let sampleRate = 24000
  let bits = 16
  while (offset < buf.length - 8) {
    const id = buf.toString("ascii", offset, offset + 4)
    const size = view.getUint32(offset + 4, true)
    if (id === "fmt ") {
      sampleRate = view.getUint32(offset + 12, true)
      bits = view.getUint16(offset + 22, true)
    } else if (id === "data") {
      if (bits !== 16) throw new Error("Voice engine returned non-16-bit audio")
      const start = offset + 8
      const count = Math.floor(size / 2)
      const samples = new Float32Array(count)
      for (let i = 0; i < count; i++) samples[i] = view.getInt16(start + i * 2, true) / 32768
      return { sampleRate, samples }
    }
    offset += 8 + size + (size % 2)
  }
  throw new Error("Voice engine returned audio without a data chunk")
}

function encodeWavPcm(pcm: Pcm): Buffer {
  const { sampleRate, samples } = pcm
  const dataSize = samples.length * 2
  const buf = Buffer.alloc(44 + dataSize)
  buf.write("RIFF", 0, "ascii")
  buf.writeUInt32LE(36 + dataSize, 4)
  buf.write("WAVE", 8, "ascii")
  buf.write("fmt ", 12, "ascii")
  buf.writeUInt32LE(16, 16)
  buf.writeUInt16LE(1, 20) // PCM
  buf.writeUInt16LE(1, 22) // mono
  buf.writeUInt32LE(sampleRate, 24)
  buf.writeUInt32LE(sampleRate * 2, 28)
  buf.writeUInt16LE(2, 32)
  buf.writeUInt16LE(16, 34)
  buf.write("data", 36, "ascii")
  buf.writeUInt32LE(dataSize, 40)
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    buf.writeInt16LE(Math.round(s < 0 ? s * 0x8000 : s * 0x7fff), 44 + i * 2)
  }
  return buf
}

/** Shift pitch by `semitones` while keeping the duration unchanged. */
function shiftPitch(pcm: Pcm, semitones: number): Pcm {
  if (Math.abs(semitones) < 0.01) return pcm
  const r = Math.pow(2, semitones / 12)
  const outLength = Math.max(1, Math.floor(pcm.samples.length / r))
  const out = new Float32Array(outLength)
  const src = pcm.samples
  const decimating = r > 1.05
  for (let i = 0; i < outLength; i++) {
    const pos = i * r
    const i0 = Math.floor(pos)
    const frac = pos - i0
    const a = src[i0] ?? 0
    const b = src[i0 + 1] ?? a
    let v = a + (b - a) * frac
    if (decimating) {
      // crude anti-alias: average with the next neighbour when shrinking
      const c = src[i0 + 2] ?? b
      v = (v + (b + (c - b) * frac)) / 2
    }
    out[i] = v
  }
  return { sampleRate: pcm.sampleRate, samples: out }
}

export async function speak(
  text: string,
  voice: VoiceId = "tongtong",
  speed = 1.0,
  semitones = 0,
): Promise<{ buffer: Buffer; mimeType: string }> {
  const trimmed = text.trim()
  if (!trimmed) throw new Error("Nothing to speak — the text is empty")
  if (trimmed.length > 1024) {
    throw new Error(`Text is ${trimmed.length} characters — the voice engine accepts at most 1024`)
  }
  const pace = Math.min(2, Math.max(0.5, speed))
  // total shift capped so the compensation speed stays inside 0.5–2.0
  let shift = Math.min(11.5, Math.max(-11.5, semitones))
  let r = Math.pow(2, shift / 12)
  // keep speed/r inside the SDK window so the final pace is exact:
  // r ∈ [pace/2, 2·pace] ∩ [0.5, 2]
  const rMin = Math.max(0.5, pace / 2)
  const rMax = Math.min(2, pace * 2)
  if (r < rMin) r = rMin
  if (r > rMax) r = rMax
  shift = 12 * Math.log2(r)
  const synthSpeed = pace / r // duration compensation: resampling by r restores pace
  const client = await getClient()
  const response = await client.audio.tts.create({
    input: trimmed,
    voice,
    speed: synthSpeed,
    response_format: "wav",
    stream: false,
  })
  const arrayBuffer = await (response as Response).arrayBuffer()
  let buffer = Buffer.from(new Uint8Array(arrayBuffer))
  if (buffer.length < 100) {
    throw new Error("Voice synthesis returned an empty track — retry")
  }
  if (Math.abs(shift) >= 0.01) {
    try {
      const pcm = decodeWavPcm(buffer)
      const shifted = shiftPitch(pcm, shift)
      buffer = encodeWavPcm(shifted)
    } catch {
      // pitch shift is cosmetic — if the buffer surprises us, return it as-is
    }
  }
  return { buffer, mimeType: "audio/wav" }
}

// ── Image generation ───────────────────────────────────────────────────────

export const IMAGE_SIZES = [
  { id: "1024x1024", label: "Square · 1024×1024" },
  { id: "1344x768", label: "Landscape · 1344×768" },
  { id: "1440x720", label: "Wide · 1440×720" },
  { id: "1152x864", label: "Classic · 1152×864" },
  { id: "768x1344", label: "Portrait · 768×1344" },
  { id: "864x1152", label: "Tall · 864×1152" },
  { id: "720x1440", label: "Story · 720×1440" },
] as const

export type ImageSize = (typeof IMAGE_SIZES)[number]["id"]

export async function generateImage(
  prompt: string,
  size: ImageSize = "1024x1024",
): Promise<{ base64: string; mimeType: string }> {
  const trimmed = prompt.trim()
  if (!trimmed) throw new Error("Describe the image first — the prompt is empty")
  const client = await getClient()
  const response = await client.images.generations.create({ prompt: trimmed, size })
  const base64 = response.data?.[0]?.base64
  if (!base64) throw new Error("Image generation returned nothing — retry")
  // sniff the real format — the farm returns JPEG or PNG depending on model
  const mimeType = base64.startsWith("iVBOR") ? "image/png" : base64.startsWith("/9j/") ? "image/jpeg" : "image/png"
  return { base64, mimeType }
}

// ── Video generation (async task + poll) ───────────────────────────────────

export type VideoQuality = "speed" | "quality"

export interface VideoTask {
  taskId: string
  status: "PROCESSING" | "SUCCESS" | "FAIL"
}

export async function startVideo(
  prompt: string,
  quality: VideoQuality = "speed",
  withAudio = true,
): Promise<VideoTask> {
  const trimmed = prompt.trim()
  if (!trimmed) throw new Error("Describe the scene first — the prompt is empty")
  const client = await getClient()
  const response = await client.video.generations.create({
    prompt: trimmed,
    quality,
    with_audio: withAudio,
    watermark_enabled: false,
  })
  if (!response?.id) throw new Error("The render farm did not accept the task — retry")
  return { taskId: response.id, status: response.task_status ?? "PROCESSING" }
}

export interface VideoPollResult {
  status: "PROCESSING" | "SUCCESS" | "FAIL"
  url: string | null
}

export async function pollVideo(taskId: string): Promise<VideoPollResult> {
  const client = await getClient()
  const response = await client.async.result.query(taskId)
  const status = (response?.task_status ?? "PROCESSING") as VideoPollResult["status"]
  const url =
    response?.video_result?.[0]?.url ??
    response?.video_url ??
    response?.url ??
    response?.video ??
    null
  if (status === "SUCCESS" && !url) {
    return { status: "FAIL", url: null }
  }
  return { status, url }
}

/** Poll a render task until it finishes or the budget runs out. */
export async function awaitVideo(
  taskId: string,
  opts: { timeoutMs?: number; intervalMs?: number; onTick?: (elapsedMs: number) => void } = {},
): Promise<VideoPollResult> {
  const timeoutMs = opts.timeoutMs ?? 240_000
  const intervalMs = opts.intervalMs ?? 5_000
  const t0 = Date.now()
  for (;;) {
    const result = await pollVideo(taskId)
    if (result.status !== "PROCESSING") return result
    const elapsed = Date.now() - t0
    if (elapsed >= timeoutMs) return { status: "PROCESSING", url: null }
    opts.onTick?.(elapsed)
    await new Promise((r) => setTimeout(r, intervalMs))
  }
}
