"use client";

/**
 * ai-paths — the sixteen integration designs.
 *
 * Eight skills, two paths each. The two paths of one skill are NOT
 * variants of one form — they are different PRODUCT IDEAS that happen
 * to share an engine: e.g. the Chat skill is both a grounded librarian
 * (conversational recommender) and a copy forge (structured generator);
 * the Image skill is both a hero-art forge (seeded from the loaded
 * template) and a standalone logo lab. Each path shows the wire it
 * rides (route + what it seeds from) so the integration stays legible.
 */

import { useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Copy,
  Download,
  Eye,
  FileAudio,
  Globe,
  Image as ImageIcon,
  Mic,
  Play,
  Send,
  Square,
  Upload,
  Volume2,
} from "lucide-react";
import { TEMPLATES, industryOf, type TemplateDef } from "@/engine/registry";
import { track } from "@/engine/analytics";
import { go } from "@/engine/nav";
import {
  Busy,
  btnGhostCx,
  btnPrimaryCx,
  ErrorNote,
  Field,
  fileToBase64,
  inputCx,
  postJson,
  pollJob,
  useRecorder,
  useSequentialAudio,
  Wire,
  type PollState,
} from "./ai-kit";

/* helpers shared by the paths */

function useTemplateOptions() {
  return useMemo(
    () => TEMPLATES.map((t) => ({ value: t.slug, label: `${t.name} — ${industryOf(t.industry).label}` })),
    [],
  );
}

function templateDigest(t: TemplateDef): string {
  return [
    `Name: ${t.name}`,
    `Business: ${t.kind}, ${t.city}`,
    `Positioning: ${t.positioning}`,
    `Conversion goal: ${t.conversion}`,
    `Signature details: ${t.signature.join("; ")}`,
  ].join("\n");
}

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={btnGhostCx}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          window.setTimeout(() => setDone(false), 1600);
        } catch {
          /* clipboard blocked — ignore */
        }
      }}
    >
      <Copy className="size-3.5" aria-hidden />
      {done ? "Copied" : "Copy"}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════
   1 · CHAT — A · Librarian Concierge
   ══════════════════════════════════════════════════════════════════ */

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

const LIBRARIAN_CHIPS = [
  "Which template fits a new bakery?",
  "What does the Business tier add?",
  "How do genome switches work?",
  "Show me templates with booking flows",
];

export function ChatLibrarianPath() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      content:
        "I am the Growth OS librarian — grounded on the 23 finished templates, the tier ladder, the genome, the editions and the 344-module playbook. Describe the business you are building for and I will pick from the real registry.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next: ChatMsg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);
    track("ai_skill_used", "chat/librarian");
    try {
      const data = await postJson<{ reply?: string }>("/api/concierge", {
        template: "growthos",
        messages: next.slice(-8),
      });
      if (!data.reply) throw new Error("The librarian is briefly unavailable.");
      setMessages((m) => [...m, { role: "assistant", content: data.reply! }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The librarian is briefly unavailable.");
    } finally {
      setLoading(false);
      window.setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 50);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div ref={scrollRef} className="min-h-56 flex-1 space-y-3 overflow-y-auto rounded-xl border border-border bg-muted/20 p-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "ml-auto max-w-[85%] rounded-xl rounded-br-sm bg-primary px-3.5 py-2.5 text-sm leading-relaxed text-primary-foreground shadow-sm"
                : "mr-auto max-w-[90%] whitespace-pre-wrap rounded-xl rounded-bl-sm border border-border bg-card px-3.5 py-2.5 text-sm leading-relaxed shadow-sm"
            }
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="mr-auto flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-muted-foreground">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" aria-hidden /> the librarian is paging the registry…
          </div>
        )}
      </div>
      {error && <ErrorNote>{error}</ErrorNote>}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-1.5">
          {LIBRARIAN_CHIPS.map((c) => (
            <button key={c} type="button" className={`${btnGhostCx} h-8 px-3 text-xs`} onClick={() => void send(c)}>
              {c}
            </button>
          ))}
        </div>
      )}
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <input
          className={inputCx}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe the business — e.g. “a sushi bar with two sittings a night”"
          aria-label="Message the librarian"
        />
        <button type="submit" className={btnPrimaryCx} disabled={loading || !input.trim()} aria-label="Send message">
          <Send className="size-4" aria-hidden />
        </button>
      </form>
      <Wire route="POST /api/concierge · growthos persona" note="the same grounded system prompt the shell's concierge panel uses — one engine, two doors" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   1 · CHAT — B · Copy Forge
   ══════════════════════════════════════════════════════════════════ */

const TONES = ["warm & neighbourly", "confident & premium", "plain & honest", "playful & bright"] as const;

export function ChatCopyForgePath({ tpl }: { tpl: TemplateDef }) {
  const options = useTemplateOptions();
  const [slug, setSlug] = useState(tpl.slug);
  const [tone, setTone] = useState<(typeof TONES)[number]>("warm & neighbourly");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copy, setCopy] = useState<string | null>(null);

  const forge = async () => {
    const target = TEMPLATES.find((t) => t.slug === slug) ?? tpl;
    setLoading(true);
    setError(null);
    setCopy(null);
    track("ai_skill_used", "chat/copy-forge");
    try {
      const data = await postJson<{ reply?: string }>("/api/ai/chat", {
        system:
          `You are a conversion copywriter for small-business websites. You receive one template's registry digest and a tone. Write, as plain text with short section labels on their own lines: HERO HEADLINE (max 8 words), HERO SUBHEAD (max 24 words), PRIMARY CTA (max 4 words), THREE VALUE BULLETS (max 10 words each, each tied to the business), META DESCRIPTION (max 150 chars). No markdown symbols, no quotes around lines.\n\nTEMPLATE DIGEST:\n${templateDigest(target)}\n\nTONE: ${tone}${notes ? `\nEXTRA NOTES: ${notes.slice(0, 400)}` : ""}`,
        messages: [{ role: "user", content: `Write the launch copy for ${target.name}.` }],
      });
      if (!data.reply) throw new Error("The forge returned nothing — try again.");
      setCopy(data.reply);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The copy forge failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Template">
          <select className={inputCx} value={slug} onChange={(e) => setSlug(e.target.value)} aria-label="Template to write for">
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tone">
          <select className={inputCx} value={tone} onChange={(e) => setTone(e.target.value as (typeof TONES)[number])} aria-label="Copy tone">
            {TONES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Extra notes" hint="optional">
        <input
          className={inputCx}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. mention the 41-minute arrival promise"
          aria-label="Extra copy notes"
        />
      </Field>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btnPrimaryCx} onClick={() => void forge()} disabled={loading}>
          {loading ? "Forging…" : "Forge the copy"}
        </button>
        {copy && <CopyButton text={copy} />}
      </div>
      {loading && <Busy label="Writing against the template's real registry digest…" />}
      {error && <ErrorNote>{error}</ErrorNote>}
      {copy && (
        <pre className="min-h-0 flex-1 whitespace-pre-wrap break-words rounded-xl border border-border bg-card p-4 font-mono text-[12.5px] leading-relaxed text-foreground">
          {copy}
        </pre>
      )}
      <Wire route="POST /api/ai/chat" note="system prompt is seeded live from the registry digest of the chosen template" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   2 · IMAGE — A · Hero Art Forge
   ══════════════════════════════════════════════════════════════════ */

const IMAGE_SIZES: { value: string; label: string }[] = [
  { value: "1344x768", label: "Landscape hero 1344×768" },
  { value: "1536x768", label: "Cinema hero 1536×768" },
  { value: "1024x1024", label: "Square 1024×1024" },
  { value: "768x1344", label: "Portrait 768×1344" },
];

export function ImageHeroPath({ tpl }: { tpl: TemplateDef }) {
  const [prompt, setPrompt] = useState(
    `${tpl.positioning.split("—")[0].trim()}, ${tpl.city}, hero website background, soft natural light, photographic, no text`,
  );
  const [size, setSize] = useState("1344x768");
  const [state, setState] = useState<PollState>({ status: "idle", elapsed: 0 });
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!prompt.trim()) return;
    setState({ status: "running", elapsed: 0 });
    setError(null);
    track("ai_skill_used", "image/hero-forge");
    try {
      const { jobId } = await postJson<{ jobId: string }>("/api/ai/image", { prompt, size });
      await pollJob("image", jobId, setState);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start the render.");
      setState({ status: "error", elapsed: 0 });
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <Field label="Art direction" hint={`seeded from ${tpl.name}`}>
        <textarea
          className={`${inputCx} min-h-20 resize-y`}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          aria-label="Image prompt"
        />
      </Field>
      <Field label="Format">
        <select className={inputCx} value={size} onChange={(e) => setSize(e.target.value)} aria-label="Image size">
          {IMAGE_SIZES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </Field>
      <button type="button" className={btnPrimaryCx} onClick={() => void run()} disabled={state.status === "running"}>
        {state.status === "running" ? `Rendering… ${Math.round(state.elapsed / 1000)}s` : "Forge hero art"}
      </button>
      {state.status === "running" && <Busy label="Generation runs as a background job (usually 30–90 seconds) — this page stays responsive." />}
      {error && <ErrorNote>{error}</ErrorNote>}
      {state.status === "error" && !error && <ErrorNote>{state.error}</ErrorNote>}
      {state.status === "done" && state.result?.image && (
        <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-border bg-muted/30 p-3">
          <img src={state.result.image} alt={`AI-generated hero art for ${tpl.name}`} className="mx-auto max-h-[26rem] w-auto rounded-lg shadow-lg" />
          <a href={state.result.image} download={`${tpl.slug}-hero.png`} className={`${btnGhostCx} mt-3`}>
            <Download className="size-3.5" aria-hidden /> Download PNG
          </a>
        </div>
      )}
      <Wire route="POST /api/ai/image → 202 + poll" note="the prompt input pre-loads from the staged template's positioning line" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   2 · IMAGE — B · Logo & Texture Lab
   ══════════════════════════════════════════════════════════════════ */

const LOGO_KINDS = ["minimal monogram", "wordmark", "emblem badge", "abstract mark", "texture pattern"] as const;

export function ImageLogoPath({ tpl }: { tpl: TemplateDef }) {
  const [name, setName] = useState(tpl.name);
  const [kind, setKind] = useState<(typeof LOGO_KINDS)[number]>("minimal monogram");
  const [vibe, setVibe] = useState(`premium, ${tpl.kind.toLowerCase()} business, flat vector, centered on plain background, no text effects`);
  const [state, setState] = useState<PollState>({ status: "idle", elapsed: 0 });
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    const prompt = `${kind} for a business called "${name.trim() || "the business"}", ${vibe}`;
    setState({ status: "running", elapsed: 0 });
    setError(null);
    track("ai_skill_used", "image/logo-lab");
    try {
      const { jobId } = await postJson<{ jobId: string }>("/api/ai/image", { prompt, size: "1024x1024" });
      await pollJob("image", jobId, setState);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start the render.");
      setState({ status: "error", elapsed: 0 });
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Brand name">
          <input className={inputCx} value={name} onChange={(e) => setName(e.target.value)} aria-label="Brand name" />
        </Field>
        <Field label="Concept">
          <select className={inputCx} value={kind} onChange={(e) => setKind(e.target.value as (typeof LOGO_KINDS)[number])} aria-label="Logo concept">
            {LOGO_KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Art direction">
        <textarea className={`${inputCx} min-h-20 resize-y`} value={vibe} onChange={(e) => setVibe(e.target.value)} aria-label="Logo art direction" />
      </Field>
      <button type="button" className={btnPrimaryCx} onClick={() => void run()} disabled={state.status === "running" || !name.trim()}>
        {state.status === "running" ? `Rendering… ${Math.round(state.elapsed / 1000)}s` : "Design the mark"}
      </button>
      {state.status === "running" && <Busy label="Square 1024×1024 concepts render as a background job (30–90 seconds)." />}
      {error && <ErrorNote>{error}</ErrorNote>}
      {state.status === "error" && !error && <ErrorNote>{state.error}</ErrorNote>}
      {state.status === "done" && state.result?.image && (
        <div className="flex min-h-0 flex-1 items-start justify-center overflow-auto rounded-xl border border-border bg-muted/30 p-3">
          <img src={state.result.image} alt={`AI-generated ${kind} for ${name}`} className="max-h-[24rem] w-auto rounded-lg shadow-lg" />
        </div>
      )}
      <Wire route="POST /api/ai/image → 202 + poll" note="a different product shape on the same engine — brand marks, not page art" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   3 · TTS — A · Site Voiceover
   ══════════════════════════════════════════════════════════════════ */

const VOICES: { value: string; label: string }[] = [
  { value: "tongtong", label: "Tongtong — young woman · warm & friendly" },
  { value: "chuichui", label: "Chuichui — young girl · playful & bright" },
  { value: "xiaochen", label: "Xiaochen — woman · composed & professional" },
  { value: "jam", label: "Jam — mature man · British gentleman" },
  { value: "kazi", label: "Kazi — man · clear announcer" },
  { value: "douji", label: "Douji — natural · easygoing narrator" },
  { value: "luodo", label: "Luodo — man · expressive storyteller" },
];

export function TtsVoiceoverPath({ tpl }: { tpl: TemplateDef }) {
  const [text, setText] = useState(
    `Welcome to ${tpl.name}. ${tpl.positioning} Book today — the whole thing takes less than a minute.`,
  );
  const [voice, setVoice] = useState("tongtong");
  const [speed, setSpeed] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parts, setParts] = useState<string[]>([]);
  const audio = useSequentialAudio();

  const speak = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setParts([]);
    audio.stop();
    track("ai_skill_used", "tts/voiceover");
    try {
      const data = await postJson<{ parts?: string[]; chunks?: number }>("/api/ai/tts", { text, voice, speed });
      if (!data.parts?.length) throw new Error("No audio came back.");
      setParts(data.parts);
      audio.play(data.parts);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Speech synthesis failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <Field label="Script" hint="long text is auto-split at 950 chars" >
        <textarea className={`${inputCx} min-h-28 resize-y`} value={text} onChange={(e) => setText(e.target.value)} aria-label="Text to speak" />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Voice">
          <select className={inputCx} value={voice} onChange={(e) => setVoice(e.target.value)} aria-label="Voice">
            {VOICES.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Speed" hint={`${speed.toFixed(1)}×`}>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.1}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="mt-2 w-full accent-primary"
            aria-label="Speech speed"
          />
        </Field>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btnPrimaryCx} onClick={() => void speak()} disabled={loading || !text.trim()}>
          <Volume2 className="size-4" aria-hidden /> {loading ? "Synthesising…" : "Speak it"}
        </button>
        {parts.length > 0 && !audio.playing && (
          <button type="button" className={btnGhostCx} onClick={() => audio.play(parts)}>
            <Play className="size-3.5" aria-hidden /> Replay
          </button>
        )}
        {audio.playing && (
          <button type="button" className={btnGhostCx} onClick={audio.stop}>
            <Square className="size-3.5" aria-hidden /> Stop ({audio.part}/{audio.total})
          </button>
        )}
      </div>
      {audio.playing && <Busy label={`Playing part ${audio.part} of ${audio.total}…`} />}
      {loading && <Busy label="Rendering WAV audio server-side (24 kHz)…" />}
      {error && <ErrorNote>{error}</ErrorNote>}
      <Wire route="POST /api/ai/tts" note="the script box pre-loads the staged template's own positioning copy" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   3 · TTS — B · IVR & Greeting Composer
   ══════════════════════════════════════════════════════════════════ */

const IVR_KINDS = ["restaurant", "clinic", "plumber / trades", "law firm", "property agent"] as const;

export function TtsIvrPath({ tpl }: { tpl: TemplateDef }) {
  const [business, setBusiness] = useState(tpl.name);
  const [kind, setKind] = useState<(typeof IVR_KINDS)[number]>("restaurant");
  const [voice, setVoice] = useState("xiaochen");
  const [script, setScript] = useState<string | null>(null);
  const [parts, setParts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audio = useSequentialAudio();

  const compose = async () => {
    setLoading(true);
    setError(null);
    setScript(null);
    setParts([]);
    audio.stop();
    track("ai_skill_used", "tts/ivr");
    try {
      const data = await postJson<{ reply?: string }>("/api/ai/chat", {
        system: `You write phone system (IVR) greeting scripts. For a ${kind} called "${business}", write a 4-6 line script: warm greeting, one sentence of what the business does, menu of exactly 3 numbered options, closing line asking the caller to choose. Plain text only, no stage directions, under 110 words.`,
        messages: [{ role: "user", content: `Write the IVR greeting for ${business}.` }],
      });
      if (!data.reply) throw new Error("No script came back.");
      setScript(data.reply);
      const speech = await postJson<{ parts?: string[] }>("/api/ai/tts", { text: data.reply, voice, speed: 0.95 });
      if (!speech.parts?.length) throw new Error("Audio synthesis failed.");
      setParts(speech.parts);
      audio.play(speech.parts);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The composer failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Business">
          <input className={inputCx} value={business} onChange={(e) => setBusiness(e.target.value)} aria-label="Business name" />
        </Field>
        <Field label="Kind">
          <select className={inputCx} value={kind} onChange={(e) => setKind(e.target.value as (typeof IVR_KINDS)[number])} aria-label="Business kind">
            {IVR_KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Voice">
        <select className={inputCx} value={voice} onChange={(e) => setVoice(e.target.value)} aria-label="IVR voice">
          {VOICES.map((v) => (
            <option key={v.value} value={v.value}>
              {v.label}
            </option>
          ))}
        </select>
      </Field>
      <button type="button" className={btnPrimaryCx} onClick={() => void compose()} disabled={loading || !business.trim()}>
        {loading ? "Composing…" : "Compose & speak the greeting"}
      </button>
      {loading && <Busy label="Two-step path: the LLM writes the script, then TTS speaks it — chained server-side." />}
      {error && <ErrorNote>{error}</ErrorNote>}
      {script && (
        <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-border bg-card p-4 text-sm leading-relaxed">{script}</pre>
      )}
      {parts.length > 0 && !audio.playing && (
        <button type="button" className={btnGhostCx} onClick={() => audio.play(parts)}>
          <Play className="size-3.5" aria-hidden /> Replay greeting
        </button>
      )}
      {audio.playing && (
        <button type="button" className={btnGhostCx} onClick={audio.stop}>
          <Square className="size-3.5" aria-hidden /> Stop ({audio.part}/{audio.total})
        </button>
      )}
      <Wire route="/api/ai/chat → /api/ai/tts" note="an LLM→TTS chain: one skill pair composing a real telephony artefact" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   4 · ASR — A · Voice Brief
   ══════════════════════════════════════════════════════════════════ */

export function AsrVoiceBriefPath() {
  const rec = useRecorder();
  const [busy, setBusy] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const finish = async () => {
    const blob = await rec.stop();
    if (!blob) {
      setError("Nothing was recorded — hold on a second longer before stopping.");
      return;
    }
    setBusy(true);
    setError(null);
    track("ai_skill_used", "asr/voice-brief");
    try {
      const data = await postJson<{ text?: string }>("/api/ai/asr", {
        audio_base64: await blobToBase64(blob),
      });
      if (!data.text) throw new Error(data ? "No speech detected in that clip." : "Transcription failed.");
      setTranscript(data.text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transcription failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/20 p-4">
        <button
          type="button"
          className={rec.recording ? btnGhostCx : btnPrimaryCx}
          onClick={() => (rec.recording ? void finish() : void rec.start())}
          aria-pressed={rec.recording}
        >
          {rec.recording ? (
            <>
              <Square className="size-4" aria-hidden /> Stop & transcribe ({rec.seconds}s)
            </>
          ) : (
            <>
              <Mic className="size-4" aria-hidden /> Record your brief
            </>
          )}
        </button>
        {rec.recording && (
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="size-2 animate-pulse rounded-full bg-destructive" aria-hidden /> listening…
          </span>
        )}
        <p className="text-xs text-muted-foreground">Say something like: “I need a bakery site that shows what&apos;s in the oven and takes calls.”</p>
      </div>
      {rec.error && <ErrorNote>{rec.error}</ErrorNote>}
      {busy && <Busy label="Transcribing your recording…" />}
      {error && <ErrorNote>{error}</ErrorNote>}
      {transcript && (
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <p className="whitespace-pre-wrap break-words rounded-xl border border-border bg-card p-4 text-sm leading-relaxed">{transcript}</p>
          <button type="button" className={btnGhostCx} onClick={() => go("/ai/chat")}>
            Take it to the librarian <ArrowRight className="size-3.5" aria-hidden />
          </button>
        </div>
      )}
      <Wire route="POST /api/ai/asr" note="in-browser MediaRecorder → base64 → transcript; the brief then feeds the chat skill" />
    </div>
  );
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the recording."));
    reader.onload = () => {
      const s = String(reader.result ?? "");
      resolve(s.slice(s.indexOf(",") + 1));
    };
    reader.readAsDataURL(blob);
  });
}

/* ══════════════════════════════════════════════════════════════════
   4 · ASR — B · File Transcribe
   ══════════════════════════════════════════════════════════════════ */

export function AsrFileTranscribePath() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const transcribe = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    setTranscript(null);
    track("ai_skill_used", "asr/file-transcribe");
    try {
      const { base64 } = await fileToBase64(file);
      const data = await postJson<{ text?: string }>("/api/ai/asr", { audio_base64: base64 });
      if (!data.text) throw new Error("No speech detected in that file.");
      setTranscript(data.text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transcription failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <button
        type="button"
        className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 p-8 text-sm text-muted-foreground transition hover:border-primary/50 hover:bg-primary/5"
        onClick={() => inputRef.current?.click()}
      >
        <FileAudio className="size-6 text-primary" aria-hidden />
        {file ? (
          <span className="font-medium text-foreground">
            {file.name} · {(file.size / 1024).toFixed(0)} KB
          </span>
        ) : (
          <span>Choose an audio file — WAV, MP3, M4A, WebM…</span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        className="sr-only"
        aria-label="Audio file to transcribe"
        onChange={(e) => {
          setFile(e.target.files?.[0] ?? null);
          setTranscript(null);
          setError(null);
        }}
      />
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btnPrimaryCx} onClick={() => void transcribe()} disabled={!file || busy}>
          <Upload className="size-4" aria-hidden /> {busy ? "Transcribing…" : "Transcribe the file"}
        </button>
        {transcript && <CopyButton text={transcript} />}
      </div>
      {busy && <Busy label="Uploading and transcribing (the file stays in this browser until you press the button)…" />}
      {error && <ErrorNote>{error}</ErrorNote>}
      {transcript && (
        <p className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-border bg-card p-4 text-sm leading-relaxed">
          {transcript}
        </p>
      )}
      <Wire route="POST /api/ai/asr" note="upload path on the same engine — meeting notes, voicemails, podcasts" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   5 · VLM — A · Screenshot Critique
   ══════════════════════════════════════════════════════════════════ */

function ImageDrop({
  file,
  onPick,
  previewUrl,
}: {
  file: File | null;
  onPick: (f: File | null) => void;
  previewUrl: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        type="button"
        className="flex min-h-32 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground transition hover:border-primary/50 hover:bg-primary/5"
        onClick={() => inputRef.current?.click()}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Selected preview" className="max-h-40 w-auto rounded-lg shadow" />
        ) : (
          <>
            <Eye className="size-6 text-primary" aria-hidden />
            <span>{file ? file.name : "Drop in a screenshot or photo — PNG, JPG, WebP"}</span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label="Choose an image"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
      />
    </>
  );
}

export function VlmCritiquePath() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [focus, setFocus] = useState("conversion flow and visual hierarchy");
  const [busy, setBusy] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pick = (f: File | null) => {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
    setReply(null);
    setError(null);
  };

  const critique = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    setReply(null);
    track("ai_skill_used", "vlm/critique");
    try {
      const { base64, mime } = await fileToBase64(file);
      const data = await postJson<{ reply?: string }>("/api/ai/vlm", {
        image_base64: base64,
        mime,
        prompt: `You are a senior web designer reviewing a screenshot. Assess: ${focus}. Structure the reply as four short sections on their own lines, labelled WHAT I SEE, WHAT WORKS, WHAT HURTS, FIX FIRST (each 1-3 sentences, concrete, no fluff). Under 200 words total.`,
      });
      if (!data.reply) throw new Error("The critique came back empty.");
      setReply(data.reply);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The vision service failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <ImageDrop file={file} onPick={pick} previewUrl={preview} />
      <Field label="Review focus">
        <select className={inputCx} value={focus} onChange={(e) => setFocus(e.target.value)} aria-label="Review focus">
          <option>conversion flow and visual hierarchy</option>
          <option>accessibility: contrast, type sizes, touch targets</option>
          <option>brand consistency and typography</option>
          <option>mobile layout problems</option>
        </select>
      </Field>
      <button type="button" className={btnPrimaryCx} onClick={() => void critique()} disabled={!file || busy}>
        <Eye className="size-4" aria-hidden /> {busy ? "Reviewing…" : "Critique the design"}
      </button>
      {busy && <Busy label="The vision model (glm-4.6v) is reading your screenshot…" />}
      {error && <ErrorNote>{error}</ErrorNote>}
      {reply && (
        <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-border bg-card p-4 text-sm leading-relaxed">{reply}</pre>
      )}
      <Wire route="POST /api/ai/vlm · glm-4.6v" note="same engine as alt-text — different lens: a design review, not metadata" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   5 · VLM — B · Alt-text Engine
   ══════════════════════════════════════════════════════════════════ */

export function VlmAltTextPath() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pick = (f: File | null) => {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
    setReply(null);
    setError(null);
  };

  const generate = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    setReply(null);
    track("ai_skill_used", "vlm/alt-text");
    try {
      const { base64, mime } = await fileToBase64(file);
      const data = await postJson<{ reply?: string }>("/api/ai/vlm", {
        image_base64: base64,
        mime,
        prompt:
          "You are an accessibility metadata engine. Reply with exactly five labelled lines, plain text, no markdown: ALT (max 125 chars, describe function and content for a screen reader), CAPTION (one short human sentence), TAGS (6 comma-separated lowercase keywords), COLORS (3 dominant colours as names), OCR (any text visible in the image, or 'none').",
      });
      if (!data.reply) throw new Error("The engine returned nothing.");
      setReply(data.reply);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The vision service failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <ImageDrop file={file} onPick={pick} previewUrl={preview} />
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btnPrimaryCx} onClick={() => void generate()} disabled={!file || busy}>
          <ImageIcon className="size-4" aria-hidden /> {busy ? "Reading…" : "Generate metadata"}
        </button>
        {reply && <CopyButton text={reply} />}
      </div>
      {busy && <Busy label="Extracting alt text, caption, tags, colours and OCR…" />}
      {error && <ErrorNote>{error}</ErrorNote>}
      {reply && (
        <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-border bg-card p-4 font-mono text-[12.5px] leading-relaxed">{reply}</pre>
      )}
      <Wire route="POST /api/ai/vlm · glm-4.6v" note="the SEO/accessibility product shape — structured metadata, not prose" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   6 · VIDEO — A · Hero Motion Reel
   ══════════════════════════════════════════════════════════════════ */

export function VideoHeroPath({ tpl }: { tpl: TemplateDef }) {
  const [prompt, setPrompt] = useState(
    `Slow cinematic establishing shot for ${tpl.name} — ${tpl.kind.toLowerCase()} in ${tpl.city}, gentle camera drift, warm practical light, shallow depth of field, no text`,
  );
  const [quality, setQuality] = useState<"speed" | "quality">("speed");
  const [state, setState] = useState<PollState>({ status: "idle", elapsed: 0 });
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!prompt.trim()) return;
    setState({ status: "running", elapsed: 0, stage: "queued" });
    setError(null);
    track("ai_skill_used", "video/hero-reel");
    try {
      const { jobId } = await postJson<{ jobId: string }>("/api/ai/video", { prompt, quality, with_audio: true });
      await pollJob("video", jobId, setState);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start the render.");
      setState({ status: "error", elapsed: 0 });
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <Field label="Motion direction" hint={`seeded from ${tpl.name}`}>
        <textarea className={`${inputCx} min-h-20 resize-y`} value={prompt} onChange={(e) => setPrompt(e.target.value)} aria-label="Video prompt" />
      </Field>
      <Field label="Render">
        <div className="flex gap-2">
          {(["speed", "quality"] as const).map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setQuality(q)}
              aria-pressed={quality === q}
              className={`${quality === q ? "border-primary/60 bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"} h-9 flex-1 rounded-lg border text-sm font-medium transition`}
            >
              {q === "speed" ? "Speed — faster draft" : "Quality — slower, richer"}
            </button>
          ))}
        </div>
      </Field>
      <button type="button" className={btnPrimaryCx} onClick={() => void run()} disabled={state.status === "running"}>
        {state.status === "running" ? `Rendering… ${Math.round(state.elapsed / 1000)}s` : "Render the hero reel"}
      </button>
      {state.status === "running" && (
        <Busy label={`Background job (${state.stage ?? "queued"}) — video renders take 2–8 minutes. The page stays live; results wait for you.`} />
      )}
      {error && <ErrorNote>{error}</ErrorNote>}
      {state.status === "error" && !error && <ErrorNote>{state.error}</ErrorNote>}
      {state.status === "done" && state.result?.video && (
        <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-border bg-muted/30 p-3">
          <video src={state.result.video} controls playsInline className="mx-auto max-h-[26rem] w-auto rounded-lg shadow-lg" aria-label={`AI-generated hero video for ${tpl.name}`} />
          <a href={state.result.video} download={`${tpl.slug}-hero.mp4`} className={`${btnGhostCx} mt-3`}>
            <Download className="size-3.5" aria-hidden /> Download MP4
          </a>
        </div>
      )}
      <Wire route="POST /api/ai/video → 202 + poll" note="nested task polling — the SDK's own async task, wrapped in the route's job" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   6 · VIDEO — B · Social Teaser
   ══════════════════════════════════════════════════════════════════ */

const TEASER_KINDS = ["restaurant", "salon", "gym", "bakery", "clinic"] as const;

export function VideoTeaserPath({ tpl }: { tpl: TemplateDef }) {
  const [business, setBusiness] = useState(tpl.name);
  const [kind, setKind] = useState<(typeof TEASER_KINDS)[number]>("restaurant");
  const [hook, setHook] = useState("come see what everyone's talking about");
  const [state, setState] = useState<PollState>({ status: "idle", elapsed: 0 });
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    const prompt = `Vertical social-media teaser for a ${kind} called "${business.trim() || kind}", hook line: "${hook}". Fast cuts, punchy energy, bold close-up details, dynamic lighting, ends on an empty frame for a caption, no text overlays.`;
    setState({ status: "running", elapsed: 0, stage: "queued" });
    setError(null);
    track("ai_skill_used", "video/social-teaser");
    try {
      const { jobId } = await postJson<{ jobId: string }>("/api/ai/video", { prompt, quality: "speed", with_audio: true });
      await pollJob("video", jobId, setState);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start the render.");
      setState({ status: "error", elapsed: 0 });
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Business">
          <input className={inputCx} value={business} onChange={(e) => setBusiness(e.target.value)} aria-label="Business name" />
        </Field>
        <Field label="Vibe">
          <select className={inputCx} value={kind} onChange={(e) => setKind(e.target.value as (typeof TEASER_KINDS)[number])} aria-label="Teaser kind">
            {TEASER_KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Hook line">
        <input className={inputCx} value={hook} onChange={(e) => setHook(e.target.value)} aria-label="Hook line" />
      </Field>
      <button type="button" className={btnPrimaryCx} onClick={() => void run()} disabled={state.status === "running"}>
        {state.status === "running" ? `Rendering… ${Math.round(state.elapsed / 1000)}s` : "Cut the teaser"}
      </button>
      {state.status === "running" && <Busy label="Speed-mode render as a background job (2–6 minutes) — keep browsing, the result waits." />}
      {error && <ErrorNote>{error}</ErrorNote>}
      {state.status === "error" && !error && <ErrorNote>{state.error}</ErrorNote>}
      {state.status === "done" && state.result?.video && (
        <div className="flex min-h-0 flex-1 items-start justify-center overflow-auto rounded-xl border border-border bg-muted/30 p-3">
          <video src={state.result.video} controls playsInline className="max-h-[24rem] w-auto rounded-lg shadow-lg" aria-label={`AI-generated teaser for ${business}`} />
        </div>
      )}
      <Wire route="POST /api/ai/video → 202 + poll" note="a marketing product shape — vertical teasers, not page heroes, on the same engine" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   7 · SEARCH — A · Competitor Scan
   ══════════════════════════════════════════════════════════════════ */

export function SearchScanPath({ tpl }: { tpl: TemplateDef }) {
  const [query, setQuery] = useState(`${tpl.kind.toLowerCase()} ${tpl.city.split(",").slice(-1)[0].trim()}`);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{ url: string; name: string; snippet: string; host_name: string }[] | null>(null);

  const scan = async () => {
    if (!query.trim()) return;
    setBusy(true);
    setError(null);
    setResults(null);
    track("ai_skill_used", "search/scan");
    try {
      const data = await postJson<{ results?: { url: string; name: string; snippet: string; host_name: string }[] }>(
        "/api/ai/search",
        { query, num: 8 },
      );
      if (!data.results?.length) throw new Error("Nothing came back for that query.");
      setResults(data.results);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The search service failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <Field label="Scan query" hint={`seeded from ${tpl.name}`}>
        <input
          className={inputCx}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. wood-fire grill Bronx"
          aria-label="Search query"
        />
      </Field>
      <button type="button" className={btnPrimaryCx} onClick={() => void scan()} disabled={busy || !query.trim()}>
        <Globe className="size-4" aria-hidden /> {busy ? "Scanning…" : "Scan the market"}
      </button>
      {busy && <Busy label="Live web search — real results, ranked." />}
      {error && <ErrorNote>{error}</ErrorNote>}
      {results && (
        <ol className="min-h-0 flex-1 space-y-2 overflow-y-auto">
          {results.map((r, i) => (
            <li key={r.url + i} className="rounded-xl border border-border bg-card p-3">
              <a href={r.url} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
                {r.name || r.url}
              </a>
              <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-wide text-muted-foreground">{r.host_name}</p>
              {r.snippet && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.snippet}</p>}
            </li>
          ))}
        </ol>
      )}
      <Wire route="POST /api/ai/search · web engine" note="real web results via the SDK's web_search function" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   7 · SEARCH — B · Visual Research
   ══════════════════════════════════════════════════════════════════ */

export function SearchVisualPath({ tpl }: { tpl: TemplateDef }) {
  const [query, setQuery] = useState(`${tpl.kind.toLowerCase()} interior photography`);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<{ url: string; name: string }[] | null>(null);

  const find = async () => {
    if (!query.trim()) return;
    setBusy(true);
    setError(null);
    setImages(null);
    track("ai_skill_used", "search/visual");
    try {
      const data = await postJson<{ results?: { url: string; name: string }[] }>("/api/ai/search", {
        query,
        num: 9,
        engine: "image",
      });
      if (!data.results?.length) throw new Error("No images came back for that query.");
      setImages(data.results);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The image search failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <Field label="Mood query">
        <input className={inputCx} value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Image search query" />
      </Field>
      <button type="button" className={btnPrimaryCx} onClick={() => void find()} disabled={busy || !query.trim()}>
        <ImageIcon className="size-4" aria-hidden /> {busy ? "Searching…" : "Pull reference images"}
      </button>
      {busy && <Busy label="Real images from the live web — the same engine as the scan, different lens." />}
      {error && <ErrorNote>{error}</ErrorNote>}
      {images && (
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
          {images.map((img, i) => (
            <a
              key={img.url + i}
              href={img.url}
              target="_blank"
              rel="noreferrer"
              className="group relative block overflow-hidden rounded-lg border border-border bg-muted/40"
              title={img.name}
            >
                  <img src={img.url} alt={img.name || "search result"} loading="lazy" className="aspect-square w-full object-cover transition group-hover:scale-105" />
            </a>
          ))}
        </div>
      )}
      <Wire route="POST /api/ai/search · image engine" note="the SDK's image search — moodboards and references, not links" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   8 · READER — A · Inspiration Extractor
   ══════════════════════════════════════════════════════════════════ */

export function ReaderExtractPath() {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<{ title: string; url: string; text: string; chars: number } | null>(null);

  const read = async () => {
    if (!url.trim()) return;
    setBusy(true);
    setError(null);
    setPage(null);
    track("ai_skill_used", "reader/extract");
    try {
      const data = await postJson<{ title?: string; url?: string; text?: string; chars?: number }>("/api/ai/reader", {
        url,
        mode: "extract",
      });
      if (!data.text) throw new Error("That page returned no readable content.");
      setPage({ title: data.title ?? url, url: data.url ?? url, text: data.text!, chars: data.chars ?? data.text.length });
    } catch (e) {
      setError(e instanceof Error ? e.message : "The reader failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <Field label="Page URL">
        <input
          className={inputCx}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://any-website.com/page"
          aria-label="URL to read"
        />
      </Field>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btnPrimaryCx} onClick={() => void read()} disabled={busy || !url.trim()}>
          <BookOpen className="size-4" aria-hidden /> {busy ? "Reading…" : "Read the page"}
        </button>
        {page && <CopyButton text={`${page.title}\n${page.url}\n\n${page.text}`} />}
      </div>
      {busy && <Busy label="Fetching and stripping the page to readable text, server-side…" />}
      {error && <ErrorNote>{error}</ErrorNote>}
      {page && (
        <article className="min-h-0 flex-1 overflow-auto rounded-xl border border-border bg-card p-4">
          <h3 className="text-base font-semibold text-foreground">{page.title}</h3>
          <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-wide text-muted-foreground">{page.url} · {page.chars.toLocaleString()} chars</p>
          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/90">{page.text.slice(0, 5000)}{page.chars > 5000 ? "…" : ""}</p>
        </article>
      )}
      <Wire route="POST /api/ai/reader · extract" note="HTML stripped to text server-side — the client never parses markup" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   8 · READER — B · Page Audit
   ══════════════════════════════════════════════════════════════════ */

export function ReaderAuditPath() {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audit, setAudit] = useState<{ title: string; audit: string } | null>(null);

  const auditPage = async () => {
    if (!url.trim()) return;
    setBusy(true);
    setError(null);
    setAudit(null);
    track("ai_skill_used", "reader/audit");
    try {
      const data = await postJson<{ title?: string; audit?: string }>("/api/ai/reader", { url, mode: "audit" });
      if (!data.audit) throw new Error("The audit came back empty.");
      setAudit({ title: data.title ?? url, audit: data.audit });
    } catch (e) {
      setError(e instanceof Error ? e.message : "The audit failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <Field label="Competitor URL">
        <input
          className={inputCx}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://competitor-site.com"
          aria-label="URL to audit"
        />
      </Field>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btnPrimaryCx} onClick={() => void auditPage()} disabled={busy || !url.trim()}>
          <ArrowRight className="size-4" aria-hidden /> {busy ? "Auditing…" : "Audit the page"}
        </button>
        {audit && <CopyButton text={audit.audit} />}
      </div>
      {busy && <Busy label="Reader → LLM chain: the page is read, then audited for conversion gaps…" />}
      {error && <ErrorNote>{error}</ErrorNote>}
      {audit && (
        <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-border bg-card p-4">
          <h3 className="text-base font-semibold text-foreground">{audit.title}</h3>
          <pre className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed">{audit.audit}</pre>
        </div>
      )}
      <Wire route="POST /api/ai/reader · audit" note="a reader→LLM chain — two skills composed into one artefact" />
    </div>
  );
}
