// ─── Voice characters: gender × age personas for the voice engine ────────
// Client-safe (no SDK imports). The server combines the base voice with a
// semitone pitch shift (resample trick) to hit the target persona.
//
// Measured median F0 of the raw engine voices:
//   xiaochen ≈ 120 Hz (only male) · kazi ≈ 233 · tongtong ≈ 247
//   chuichui ≈ 250 · jam ≈ 255 · douji ≈ 286 · luodo ≈ 293

export interface VoiceCharacter {
  id: string
  label: string
  gender: "female" | "male"
  age: "child" | "teen" | "adult" | "mature"
  /** raw engine voice used as the base */
  base: string
  /** semitones added on top of the base voice */
  shift: number
  hint: string
}

export const VOICE_CHARACTERS: VoiceCharacter[] = [
  { id: "girl_child", label: "Girl · kid", gender: "female", age: "child", base: "chuichui", shift: 2, hint: "playful little girl" },
  { id: "boy_child", label: "Boy · kid", gender: "male", age: "child", base: "xiaochen", shift: 12, hint: "energetic little boy" },
  { id: "girl_teen", label: "Girl · teen", gender: "female", age: "teen", base: "tongtong", shift: 2, hint: "bright teenage girl" },
  { id: "boy_teen", label: "Boy · teen", gender: "male", age: "teen", base: "xiaochen", shift: 7, hint: "young teenage boy" },
  { id: "woman_warm", label: "Woman · warm", gender: "female", age: "adult", base: "tongtong", shift: 0, hint: "friendly young woman" },
  { id: "man_calm", label: "Man · narrator", gender: "male", age: "adult", base: "xiaochen", shift: 2, hint: "calm male narrator" },
  { id: "woman_mature", label: "Woman · mature", gender: "female", age: "mature", base: "kazi", shift: 0, hint: "clear, composed woman" },
  { id: "gentleman", label: "Gentleman · deep", gender: "male", age: "mature", base: "xiaochen", shift: -3, hint: "deep, wise gentleman" },
]

export const AGE_LABEL: Record<VoiceCharacter["age"], string> = {
  child: "child",
  teen: "teen",
  adult: "adult",
  mature: "mature",
}

export function findCharacter(id: string): VoiceCharacter {
  return VOICE_CHARACTERS.find((c) => c.id === id) ?? VOICE_CHARACTERS[4]
}
