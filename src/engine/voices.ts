/**
 * The TTS voice catalogue — one source of truth for every surface that
 * picks a voice (the AI Studio's Voice family, the Builder's voiceover
 * card, and the engine's planner, which picks voices for speak actions).
 *
 * Descriptors are age + gender + character, because that's what people
 * actually choose by: "a gentleman" must never come back as a little
 * girl's voice. The engine's planner receives the same descriptors, so
 * its picks match what the labels promise.
 */

export interface VoiceDef {
  value: string;
  label: string;
  /** one-line character note for the planner prompt */
  character: string;
}

export const VOICES: VoiceDef[] = [
  { value: "tongtong", label: "Tongtong — young woman · warm & friendly", character: "a warm, friendly young woman — good for welcoming, everyday copy" },
  { value: "chuichui", label: "Chuichui — young girl · playful & bright", character: "a playful, bright young girl — good for fun, childlike, cute copy" },
  { value: "xiaochen", label: "Xiaochen — woman · composed & professional", character: "a composed, professional woman — good for business, clinic, finance copy" },
  { value: "jam", label: "Jam — mature man · British gentleman", character: "a mature British gentleman — good for premium, legal, hospitality, refined copy" },
  { value: "kazi", label: "Kazi — man · clear announcer", character: "a clear male announcer — good for instructions, news, facts" },
  { value: "douji", label: "Douji — natural · easygoing narrator", character: "a natural, easygoing narrator — good for stories and long reads" },
  { value: "luodo", label: "Luodo — man · expressive storyteller", character: "an expressive male storyteller — good for dramatic, cinematic copy" },
];

export const VOICE_VALUES = VOICES.map((v) => v.value);

export function voiceLabel(value: string): string {
  return VOICES.find((v) => v.value === value)?.label ?? value;
}
