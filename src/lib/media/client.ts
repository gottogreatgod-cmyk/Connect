// ─── Client audio helpers: mic capture → clean WAV for the ASR engine ────

/** Encode an AudioBuffer as a 16-bit PCM mono WAV ArrayBuffer. */
export function encodeWav(buffer: AudioBuffer): ArrayBuffer {
  const channels = Math.min(buffer.numberOfChannels, 1)
  const sampleRate = buffer.sampleRate
  const samples = buffer.getChannelData(0)
  const bytesPerSample = 2
  const dataSize = samples.length * channels * bytesPerSample
  const view = new DataView(new ArrayBuffer(44 + dataSize))

  const writeString = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i))
  }

  writeString(0, "RIFF")
  view.setUint32(4, 36 + dataSize, true)
  writeString(8, "WAVE")
  writeString(12, "fmt ")
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, channels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * channels * bytesPerSample, true)
  view.setUint16(32, channels * bytesPerSample, true)
  view.setUint16(34, 16, true)
  writeString(36, "data")
  view.setUint32(40, dataSize, true)

  let offset = 44
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
    offset += bytesPerSample
  }
  return view.buffer
}

/** Downmix + resample any audio blob to 16 kHz mono, encoded as WAV base64. */
export async function blobToWavBase64(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer()
  const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  const sourceCtx = new AudioCtx()
  let decoded: AudioBuffer
  try {
    decoded = await sourceCtx.decodeAudioData(arrayBuffer.slice(0))
  } finally {
    void sourceCtx.close()
  }

  const targetRate = 16000
  const length = Math.max(1, Math.ceil((decoded.length * targetRate) / decoded.sampleRate))
  const offline = new OfflineAudioContext(1, length, targetRate)
  const src = offline.createBufferSource()
  src.buffer = decoded
  src.connect(offline.destination)
  src.start()
  const rendered = await offline.startRendering()

  const wav = encodeWav(rendered)
  // ArrayBuffer → base64 in chunks (avoid call-stack limits on big files)
  const bytes = new Uint8Array(wav)
  let binary = ""
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

/** Read any File (mp3/wav/m4a…) as plain base64 (no re-encode — pass-through). */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result ?? "")
      resolve(result.slice(result.indexOf(",") + 1))
    }
    reader.onerror = () => reject(new Error("Could not read the file"))
    reader.readAsDataURL(file)
  })
}

/**
 * Best-effort audio → base64 for the ASR engine: clean 16 kHz mono WAV when
 * the browser can decode the container, otherwise a raw pass-through (the
 * server accepts common formats directly). Never throws for undecodable
 * containers — the pass-through gives the engine a second chance.
 */
export async function audioToBase64Best(blob: Blob): Promise<string> {
  try {
    return await blobToWavBase64(blob)
  } catch {
    const buffer = await blob.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    let binary = ""
    const chunk = 0x8000
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
    }
    return btoa(binary)
  }
}
