"use client";

/**
 * AiStudioView — the AI Intelligence layer: every skill in the system,
 * organised the way a person thinks.
 *
 * One unified agent + four guided families:
 *
 *   agent    the all-in-one chat — build sites, generate art, render
 *            video, speak, search and read, all from one conversation
 *   chat     Chat & Content — the grounded librarian + the copy forge
 *   art      Art & Motion — image, video, and the door to the Motion Lab
 *   voice    Voice Studio — text to speech, greetings, spoken briefs,
 *            transcription: every voice function under one tab
 *   research Vision & Research — see images, search the web, read pages
 *
 * Every family opens with a short "how to use this" guide, because the
 * point of the studio is that ANYONE can drive it — and the agent tab
 * can do everything the families do, for people who'd rather just ask.
 *
 * Deep-linkable (#/ai/<family>), seeded from the staged template where
 * it makes sense, and rendered through the edition tokens so the whole
 * studio re-forges with the shell.
 */

import { useMemo, type CSSProperties, type ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  Eye,
  FileText,
  Image as ImageIcon,
  Library as LibraryIcon,
  Lightbulb,
  MessageSquare,
  Search,
  Sparkles,
  Volume2,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import { AI_SKILLS, go, href, type AiSkillId } from "@/engine/nav";
import { useGos } from "../gos-context";
import { useEdition } from "../edition-provider";
import { industryOf, type TemplateDef } from "@/engine/registry";
import { useBuilder } from "./builder";
import { AgentChatPath } from "./agent-chat";
import { PreviewDock } from "../preview-dock";
import {
  AsrFileTranscribePath,
  AsrVoiceBriefPath,
  ChatCopyForgePath,
  ChatLibrarianPath,
  ImageHeroPath,
  ImageLogoPath,
  ReaderAuditPath,
  ReaderExtractPath,
  SearchScanPath,
  SearchVisualPath,
  TtsIvrPath,
  TtsVoiceoverPath,
  VideoHeroPath,
  VideoTeaserPath,
  VlmAltTextPath,
  VlmCritiquePath,
} from "./ai-paths";

/* ── the family registry ─────────────────────────────────────────── */

interface PathDef {
  id: string;
  name: string;
  note: string;
}

interface FamilyDef {
  id: AiSkillId;
  name: string;
  engine: string;
  mode: "unified" | "sync" | "job";
  icon: LucideIcon;
  blurb: string;
  guide: { steps: string[]; note?: string; link?: { href: string; label: string } };
  paths: PathDef[];
}

const FAMILIES: FamilyDef[] = [
  {
    id: "agent",
    name: "Agent Chat",
    engine: "unified · every skill",
    mode: "unified",
    icon: Sparkles,
    blurb: "One conversation with everything wired in — ask for a website, its art, a reel, a voiceover or live research and it happens right here.",
    guide: {
      steps: [
        "Ask for anything — “build a site for my bakery, then make the hero image and speak the headline”.",
        "The agent picks from the real 23-template registry and writes fresh launch copy for your business.",
        "Images and video render as background jobs — keep chatting, results land in the conversation.",
        "Staged builds open straight into the Website Builder with everything pre-filled.",
      ],
      note: "This is the all-in-one door: everything the other families do, from one chat.",
    },
    paths: [{ id: "agent", name: "The unified agent", note: "site staging · image · video · speech · search · reading — one conversation" }],
  },
  {
    id: "chat",
    name: "Chat & Content",
    engine: "LLM · zai.chat",
    mode: "sync",
    icon: MessageSquare,
    blurb: "The reasoning surface — a grounded librarian that answers from the real registry, and a copy forge that writes launch copy.",
    guide: {
      steps: [
        "Ask the librarian to recommend — it answers only from the real 23-template registry, citing why.",
        "Forge launch copy for any template: headline, subhead, CTA, value bullets, meta description.",
        "Take the copy further: the Voice family speaks it, the Art family illustrates it.",
      ],
      note: "Or ask the Agent — it writes copy while it stages the whole site in one go.",
    },
    paths: [
      { id: "librarian", name: "Librarian Concierge", note: "a grounded recommender that answers from the real registry — no invented templates" },
      { id: "copy", name: "Copy Forge", note: "a structured generator: launch copy for any template, seeded from its registry digest" },
    ],
  },
  {
    id: "art",
    name: "Art & Motion",
    engine: "zai.images + zai.video",
    mode: "job",
    icon: Wand2,
    blurb: "Every visual generation — hero art, brand marks, editorial stills, cinematic reels, social teasers — plus the motion system that moves them.",
    guide: {
      steps: [
        "Start with the hero — wide 1344×768, its prompt seeded from your build.",
        "Marks render square 1024×1024; stills landscape — pick the format per card.",
        "Reels and teasers render for minutes as background jobs; keep browsing, they land here.",
        "Then give the site its movement: pick a motion personality in the Builder, and feel all 19 master skills live in the Motion Lab.",
      ],
      note: "Motion is a brand decision, not decoration — feel it before you commit.",
      link: { href: "/motion", label: "Open the Motion Lab — 19 skills, felt live" },
    },
    paths: [
      { id: "hero", name: "Hero Art Forge", note: "page art seeded from the staged template's positioning and city" },
      { id: "logo", name: "Logo & Texture Lab", note: "brand marks, monograms and patterns — a different product on the same engine" },
      { id: "reel", name: "Hero Motion Reel", note: "a cinematic page background, seeded from the staged template" },
      { id: "teaser", name: "Social Teaser", note: "punchy vertical marketing clips — the same engine as a campaign tool" },
    ],
  },
  {
    id: "voice",
    name: "Voice Studio",
    engine: "zai.audio · tts + asr",
    mode: "sync",
    icon: Volume2,
    blurb: "Every voice function under one tab — speak any text aloud, compose phone greetings, dictate briefs, transcribe recordings.",
    guide: {
      steps: [
        "Type or paste a script and pick one of seven voices — long scripts split automatically.",
        "Let the IVR path write the greeting for you: an LLM→speech chain in one press.",
        "Speak your brief into the microphone — the transcript feeds the build directly.",
        "Upload any recording (meeting, voicemail, podcast) for a clean transcript.",
      ],
      note: "Seven voices, natural pacing — the same engine the Builder uses for site voiceovers.",
    },
    paths: [
      { id: "voiceover", name: "Site Voiceover", note: "speak any copy aloud; long scripts auto-split at sentence boundaries" },
      { id: "ivr", name: "IVR & Greeting Composer", note: "an LLM→TTS chain that writes and speaks a phone greeting in one press" },
      { id: "brief", name: "Voice Brief", note: "speak your brief in-browser; the transcript then feeds the librarian chat" },
      { id: "file", name: "File Transcribe", note: "upload path on the same engine — meetings, voicemails, podcasts" },
    ],
  },
  {
    id: "research",
    name: "Vision & Research",
    engine: "glm-4.6v · search · reader",
    mode: "sync",
    icon: Search,
    blurb: "The platform's eyes — critique screenshots, extract metadata, scan competitors with live web results and read any page.",
    guide: {
      steps: [
        "Drop a screenshot: get a design critique, or structured alt-text and accessibility metadata.",
        "Scan a market with live web results; collect real photo references for moodboards.",
        "Read any URL to clean text, then audit what that page sells — and what it misses.",
      ],
      note: "Research feeds everything: paste a competitor into the Builder's brief and it re-ranks the picks.",
    },
    paths: [
      { id: "critique", name: "Screenshot Critique", note: "a design review of any screenshot: hierarchy, accessibility, fixes" },
      { id: "alt", name: "Alt-text Engine", note: "structured accessibility metadata: alt text, caption, tags, colours, OCR" },
      { id: "scan", name: "Competitor Scan", note: "ranked web results for a market — seeded from the staged template" },
      { id: "visual", name: "Visual Research", note: "the image-search engine on the same route — moodboards of real photos" },
      { id: "extract", name: "Inspiration Extractor", note: "read any page server-side; the client never parses markup" },
      { id: "audit", name: "Page Audit", note: "a reader→LLM chain: what a competitor's page sells, and what it misses" },
    ],
  },
];

/* ── per-family path rendering ───────────────────────────────────── */

function renderPath(family: AiSkillId, pathId: string, tpl: TemplateDef): ReactNode {
  if (family === "agent") return null; // handled full-width by the view
  switch (`${family}/${pathId}`) {
    case "chat/librarian":
      return <ChatLibrarianPath key="chat-librarian" />;
    case "chat/copy":
      return <ChatCopyForgePath key="chat-copy" tpl={tpl} />;
    case "art/hero":
      return <ImageHeroPath key="image-hero" tpl={tpl} />;
    case "art/logo":
      return <ImageLogoPath key="image-logo" tpl={tpl} />;
    case "art/reel":
      return <VideoHeroPath key="video-reel" tpl={tpl} />;
    case "art/teaser":
      return <VideoTeaserPath key="video-teaser" tpl={tpl} />;
    case "voice/voiceover":
      return <TtsVoiceoverPath key="tts-voice" tpl={tpl} />;
    case "voice/ivr":
      return <TtsIvrPath key="tts-ivr" tpl={tpl} />;
    case "voice/brief":
      return <AsrVoiceBriefPath key="asr-brief" />;
    case "voice/file":
      return <AsrFileTranscribePath key="asr-file" />;
    case "research/critique":
      return <VlmCritiquePath key="vlm-critique" />;
    case "research/alt":
      return <VlmAltTextPath key="vlm-alt" />;
    case "research/scan":
      return <SearchScanPath key="search-scan" tpl={tpl} />;
    case "research/visual":
      return <SearchVisualPath key="search-visual" tpl={tpl} />;
    case "research/extract":
      return <ReaderExtractPath key="reader-extract" />;
    case "research/audit":
      return <ReaderAuditPath key="reader-audit" />;
    default:
      return null;
  }
}

/* ── the view ────────────────────────────────────────────────────── */

export function AiStudioView({ skill }: { skill: string | null }) {
  const gos = useGos();
  const { edition } = useEdition();
  const tpl = gos.tpl;
  const build = useBuilder();

  const active: AiSkillId = (AI_SKILLS as readonly string[]).includes(skill ?? "") ? (skill as AiSkillId) : "agent";
  const def = FAMILIES.find((f) => f.id === active) ?? FAMILIES[0];

  /* keep the edition's display voice in scope on this root (see HomeView) */
  const fontVars = {
    "--ed-font-display": edition.fonts.display,
    "--ed-font-body": edition.fonts.body,
  } as CSSProperties;

  /* one gradient headline, driven by the edition palette */
  const gradientText: CSSProperties = {
    backgroundImage: "linear-gradient(100deg, var(--primary) 0%, var(--accent) 55%, var(--primary) 100%)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  };

  const buildContext = useMemo(
    () => ({
      slug: build.tplSlug,
      business: build.name,
      city: build.city,
      personality: build.personality,
      brief: build.brief,
    }),
    [build.tplSlug, build.name, build.city, build.personality, build.brief],
  );

  return (
    <div className="h-full min-h-0 overflow-y-auto overscroll-contain" style={fontVars}>
      <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        {/* ── header ── */}
        <header className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="ed-eyebrow flex items-center gap-2">
                <Sparkles className="size-3.5 text-primary" aria-hidden />
                The AI Intelligence layer · one agent, every skill, one system
              </p>
              <h1 className="ed-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl" style={gradientText}>
                AI Studio — every superpower, live.
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                One unified agent plus four guided families — chat, art &amp; motion, voice, research.{" "}
                <span className="font-medium text-foreground">Ask the agent for anything</span>, or open a family and
                we&apos;ll walk you through each skill step by step.
              </p>
            </div>
            <div className="flex flex-none items-center gap-2">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 shadow-sm">
                <LibraryIcon className="size-4 text-primary" aria-hidden />
                <div className="min-w-0 text-xs leading-tight">
                  <p className="font-mono uppercase tracking-wider text-muted-foreground">seeding from</p>
                  <p className="truncate font-semibold text-foreground">{tpl.name}</p>
                  <p className="truncate text-muted-foreground">{industryOf(tpl.industry).label}</p>
                </div>
                <button
                  type="button"
                  onClick={() => go(`/library/${tpl.slug}`)}
                  className="ml-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium transition hover:bg-muted/60"
                >
                  Stage
                </button>
              </div>
            </div>
          </div>

          {/* the family rail */}
          <nav aria-label="AI skill families" className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 lg:grid-rows-1">
            {FAMILIES.map((f) => {
              const Icon = f.icon;
              const on = f.id === active;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => go(`/ai/${f.id}`)}
                  aria-current={on ? "page" : undefined}
                  className={`group flex min-w-0 flex-col gap-1.5 rounded-xl border p-3 text-left transition ${
                    on
                      ? "border-primary/60 bg-primary/10 shadow-sm"
                      : "border-border bg-card hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  <span
                    className={`flex size-8 items-center justify-center rounded-lg ${
                      on ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                    }`}
                  >
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="truncate text-[12.5px] font-semibold leading-tight text-foreground">{f.name}</span>
                  <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                    <span className={`size-1.5 rounded-full ${on ? "bg-primary" : "bg-muted-foreground/40"}`} aria-hidden />
                    {f.mode}
                    {f.id === "agent" ? " · all skills" : ` · ${f.paths.length} paths`}
                  </span>
                </button>
              );
            })}
          </nav>
        </header>

        {/* ── the workspace: paths on the left, the preview zone on the right ── */}
        <div className="mt-6 flex min-h-0 flex-1 flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(330px,420px)] lg:items-start">
          <main className="flex min-h-0 flex-col gap-4" aria-live="polite">
          {/* family summary */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-border bg-card px-4 py-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <def.icon className="size-4.5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold leading-tight text-foreground">
                {def.name}
                <span className="ml-2 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {def.engine}
                </span>
              </h2>
              <p className="mt-0.5 text-[13px] text-muted-foreground">{def.blurb}</p>
            </div>
          </div>

          {/* the how-to guide — every family teaches its own use */}
          <div className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-3.5">
            <p className="flex items-center gap-2 text-[13px] font-semibold">
              <Lightbulb className="size-4 shrink-0 text-primary" aria-hidden />
              How to use {def.name.toLowerCase()}
            </p>
            <ol className="mt-2.5 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
              {def.guide.steps.map((s, i) => (
                <li key={i} className="flex min-w-0 items-start gap-2 text-[12.5px] leading-snug text-muted-foreground">
                  <span className="mt-px grid size-4.5 shrink-0 place-items-center rounded-full bg-primary/15 text-[10px] font-bold text-primary" aria-hidden>
                    {i + 1}
                  </span>
                  <span className="min-w-0">{s}</span>
                </li>
              ))}
            </ol>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-primary/20 pt-2.5">
              {def.guide.note ? <p className="text-[12px] text-muted-foreground">{def.guide.note}</p> : null}
              {def.guide.link ? (
                <a href={href(def.guide.link.href)} className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-primary hover:underline">
                  {def.guide.link.label} <ArrowRight className="size-3.5" aria-hidden />
                </a>
              ) : null}
              {def.id !== "agent" ? (
                <button
                  type="button"
                  onClick={() => go("/ai/agent")}
                  className="ml-auto inline-flex items-center gap-1 text-[12.5px] font-semibold text-primary hover:underline"
                >
                  Or just ask the Agent <ArrowRight className="size-3.5" aria-hidden />
                </button>
              ) : null}
            </div>
          </div>

          {/* the paths — the agent renders full-width, families as cards */}
          {def.id === "agent" ? (
            <section className="flex min-h-0 flex-col rounded-2xl border border-border bg-background/60 p-4 sm:p-5" aria-labelledby="path-agent">
              <div className="mb-3 flex items-start gap-3">
                <span className="flex size-7 flex-none items-center justify-center rounded-full bg-primary font-mono text-[11px] font-bold text-primary-foreground" aria-hidden>
                  ★
                </span>
                <div className="min-w-0">
                  <h3 id="path-agent" className="text-sm font-semibold leading-tight text-foreground">
                    {def.paths[0].name}
                  </h3>
                  <p className="mt-0.5 text-[12.5px] leading-snug text-muted-foreground">{def.paths[0].note}</p>
                </div>
              </div>
              <div className="flex min-h-0 flex-1 flex-col">
                <AgentChatPath tpl={tpl} build={buildContext} />
              </div>
            </section>
          ) : (
            <div className="grid min-h-0 gap-4 lg:grid-cols-2">
              {def.paths.map((p, idx) => (
                <section
                  key={p.id}
                  className="flex min-h-0 flex-col rounded-2xl border border-border bg-background/60 p-4 sm:p-5"
                  aria-labelledby={`path-${p.id}`}
                >
                  <div className="mb-3 flex items-start gap-3">
                    <span
                      className={`flex size-7 flex-none items-center justify-center rounded-full font-mono text-[11px] font-bold ${
                        idx === 0 ? "bg-primary text-primary-foreground" : "border border-primary/50 text-primary"
                      }`}
                      aria-hidden
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <div className="min-w-0">
                      <h3 id={`path-${p.id}`} className="text-sm font-semibold leading-tight text-foreground">
                        {p.name}
                      </h3>
                      <p className="mt-0.5 text-[12.5px] leading-snug text-muted-foreground">{p.note}</p>
                    </div>
                  </div>
                  <div className="flex min-h-0 flex-1 flex-col">{renderPath(def.id, p.id, tpl)}</div>
                </section>
              ))}
            </div>
          )}
          </main>

          {/* THE preview zone — always present, always honest: the build
              log streams here live while the engine runs, and the staged
              site renders here the moment it exists (and stays). */}
          <div className="min-h-[22rem] lg:sticky lg:top-2 lg:max-h-[calc(100dvh-8.5rem)]">
            <PreviewDock />
          </div>
        </div>

        {/* ── the wiring map ── */}
        <footer className="mt-8 rounded-2xl border border-border bg-card p-4 sm:p-5">
          <p className="ed-eyebrow flex items-center gap-2">
            <FileText className="size-3.5 text-primary" aria-hidden />
            the wiring — one agent, four families, every route real
          </p>
          <div className="mt-3 grid gap-2 font-mono text-[11px] leading-relaxed text-muted-foreground sm:grid-cols-2">
            {FAMILIES.map((f) => (
              <p key={f.id} className="flex min-w-0 flex-wrap items-center gap-2">
                <span className={`size-1.5 flex-none rounded-full ${f.id === active ? "bg-primary" : "bg-muted-foreground/30"}`} aria-hidden />
                <span className="text-foreground/80">{f.name}</span>
                <span aria-hidden>·</span>
                <span className="text-foreground/70">{f.paths.map((p) => p.name).join(" · ")}</span>
                <span className="ml-auto flex-none text-muted-foreground/70">{f.mode === "job" ? "202 + poll" : f.mode}</span>
              </p>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
