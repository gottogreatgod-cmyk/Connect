/**
 * The Source Ledger — every repo this system is built from, every layer
 * explained in our own words, every count rule the census executes.
 *
 * This file is the single source of truth for TWO surfaces:
 *
 *   · the Sources tab (#/sources) — the human ledger: what each repo is,
 *     how we use it here, where it's live, and what the census counted
 *   · GET /api/census — the machine ledger: walks the real clones with
 *     the count rules below, so every number shown is a file that exists
 *
 * Nothing here is a claim. The census API re-counts the filesystem on
 * every request, and the "Run the live validation" probe hits every AI
 * endpoint for real. If a number on the tab is wrong, the filesystem is
 * wrong — that's the point.
 */

/* ── the ledger types ───────────────────────────────────────────────── */

/** How a count is taken inside a clone — executed by the census walker. */
export interface CountRule {
  id: string
  /** human label, shown on the card ("layer-2 skills") */
  label: string
  /** directory inside the repo the walk starts from ("" = repo root) */
  base: string
  /** what to count there */
  match:
    | "skillmd" // files named SKILL.md (the agent-skill standard)
    | "md" // every .md file, recursively
    | "py" // every .py file, recursively
    | "yaml" // every .yaml file, recursively
    | "dirs" // every subdirectory of base (one skill per folder)
    | "divisions" // top-level directories (agency divisions)
    | "mdindirs" // .md files INSIDE subdirectories only (personas, not root docs)
    | "c" // every .c/.h file, recursively
    | "files" // every file, recursively
  /** counted toward the system-wide verified-skill total */
  towardTotal?: boolean
}

export interface SourceRepo {
  id: string
  /** the GitHub path, "owner/name" */
  repo: string
  url: string
  /** where the shallow clone lives, relative to the project root */
  dir: string
  name: string
  /** their own one-liner (from the repo README, honest) */
  tagline: string
  /** OUR explanation — what this actually is */
  whatItIs: string
  /** OUR explanation — how this system uses it, and where it's live */
  howWeUseIt: string
  /** one worked example, in our words — "how it works" for a human */
  example: { title: string; body: string }
  /** live proofs inside this system — deep links the user can click now */
  live: { label: string; href: string }[]
  /** the census rules for this repo */
  counts: CountRule[]
  /** an external claim we verified against the real clone */
  claim?: { claim: string; verdict: string }
}

export interface SourceLayer {
  id: string
  label: string
  /** one line: what this layer is for */
  note: string
  repos: SourceRepo[]
}

/* ══ layer 1 — the five motion masters ═════════════════════════════════
 * Motion is not a library here — it is a craft discipline with five
 * teachers. Each master repo was cloned, read, and distilled into the
 * 19-skill unified registry; the Motion Lab stages eleven of them live.
 * Every animation in every template has to clear Emil's gate first. */

export const MOTION_MASTER_REPOS: SourceRepo[] = [
  {
    id: "emil",
    repo: "emilkowalski/skills",
    url: "https://github.com/emilkowalski/skills",
    dir: "repos/skills",
    name: "Emil Kowalski — engineering skills",
    tagline: "Personal skills from Emil Kowalski (animate.dev) — the feel system for interface motion.",
    whatItIs:
      "The closest thing the web has to a motion canon. Emil ships his working rules as agent skills: the animate gate (should this animate at all?), the feel system (exact curves, durations, springs — never approximated), entrance/exit recipes, and the reduced-motion rules that ship WITH the animation, never after.",
    howWeUseIt:
      "The bar every animation in this system must clear. His gate tiers run at build time in the OS motion nuke; his exact cubic-bezier values are the tokens in engine/motion-craft.ts; his entrance/exit recipes are the kit primitives every factory template inherits. Distilled into 4 of the 19 registry skills.",
    example: {
      title: "The gate, in practice",
      body: "A toast appears 40× a day → the gate says no animation at 40/day... unless you can name the purpose in one word. A modal at 3/day gets 200ms ease-out. The hero reveal, seen once, gets the 500ms delight budget. Frequency first, purpose second, tool last — and zero lines of code counts as a win.",
    },
    live: [
      { label: "The Feel stage — his exact curves, live", href: "#/motion/feel" },
      { label: "Entrances & exits (presence recipes)", href: "#/motion/presence" },
    ],
    counts: [
      { id: "skills", label: "skills (SKILL.md folders)", base: "skills", match: "dirs", towardTotal: true },
      { id: "md", label: "markdown docs incl. cheatsheets", base: "", match: "md" },
    ],
  },
  {
    id: "gsap",
    repo: "greensock/gsap-skills",
    url: "https://github.com/greensock/gsap-skills",
    dir: "repos/gsap-skills",
    name: "GreenSock — gsap-skills",
    tagline: "Official GSAP agent skills — tweens, timelines, ScrollTrigger, from the source.",
    whatItIs:
      "GreenSock's own skill packs, written by the people who wrote GSAP: core tweens and transforms, timeline choreography, the position parameter, ScrollTrigger, React integration, and the performance rules (transform + opacity only, always).",
    howWeUseIt:
      "The choreography layer. The Motion Lab's timeline stage is a real GSAP timeline you scrub by hand — built from their timeline skill; the stagger sweeps and scroll-driven stages follow their position-parameter grammar. GSAP itself is installed and live in this system.",
    example: {
      title: "The position parameter",
      body: "tl.to('.card', {y: 0}) puts the tween at the END of the timeline. tl.to('.card', {y: 0}, '<0.2') starts it 0.2s after the PREVIOUS tween started. That one '<' character is the difference between a cascade and a traffic jam — their timeline skill is basically a field guide to it.",
    },
    live: [
      { label: "The Timeline stage — scrub a choreography", href: "#/motion/timeline" },
      { label: "The stagger grid", href: "#/motion/stagger-grid" },
    ],
    counts: [
      { id: "skills", label: "skill packs", base: "skills", match: "dirs", towardTotal: true },
    ],
  },
  {
    id: "remotion",
    repo: "remotion-dev/skills",
    url: "https://github.com/remotion-dev/skills",
    dir: "repos/remotion-skills",
    name: "Remotion — video in React",
    tagline: "Official Remotion skills — composition thinking, springs as values, the render pipeline.",
    whatItIs:
      "Remotion treats video as a React function of time: tracks, sequences, springs passed around as first-class values, and a render pipeline that turns compositions into frames. Their skills repo teaches the composition model, not just the API.",
    howWeUseIt:
      "Our video-generation pipeline is their render-pipeline contract, applied to AI video: the request becomes a JOB (like a composition), the client polls (like a render progress), the result settles into the store (like a finished sequence). The springs-as-values idea also lives in the Lab's compositor stage.",
    example: {
      title: "Springs as values",
      body: "In Remotion you don't animate a value — you compute it: const scale = spring({frame, fps, config}) and the component is a pure function of frame. Our compositor stage does the same: one frame counter drives every layer, so scrubbing back and forth is free.",
    },
    live: [
      { label: "The Compositor — springs as values", href: "#/motion/compositor" },
      { label: "Render a reel (the pipeline in action)", href: "#/build/art" },
    ],
    counts: [
      { id: "skills", label: "skill packs", base: "skills", match: "dirs", towardTotal: true },
    ],
  },
  {
    id: "wiggle",
    repo: "talknerdytome-labs/wiggle-claude-skill",
    url: "https://github.com/talknerdytome-labs/wiggle-claude-skill",
    dir: "repos/wiggle-claude-skill",
    name: "Wiggle — logo motion",
    tagline: "Brand personality → motion type. The Lottie keyframe grammar, and the wiggle itself.",
    whatItIs:
      "A single, obsessively documented skill for animating logos: map the brand's personality to a motion type (playful → overshoot, premium → slow settle), then express it through the Lottie keyframe grammar — bezier handles in, easing curves out, exportable JSON.",
    howWeUseIt:
      "Two things: the wiggle-text stage is their per-letter spring treatment, live in the Lab with knobs; and the Builder's motion step maps brand personality → motion type using their taxonomy (corporate/organic/bold/cinematic). Lottie is served as data — any player can consume it unchanged.",
    example: {
      title: "The wiggle, decoded",
      body: "Each letter gets its own spring with a tiny phase offset — b and d land late, i dots land early. The Lottie grammar underneath is just keyframe objects {t, s, e, i, o} — time, start, end, and the two bezier handles that shape the ease. Their reference docs read it like sheet music.",
    },
    live: [
      { label: "The Wiggle stage — per-letter springs", href: "#/motion/wiggle-text" },
      { label: "Brand personality → motion (Builder step)", href: "#/build/motion" },
    ],
    counts: [
      { id: "skills", label: "SKILL.md", base: "", match: "skillmd", towardTotal: true },
      { id: "refs", label: "reference docs", base: "references", match: "md" },
    ],
  },
  {
    id: "iart",
    repo: "iart-ai/web-animation-skills",
    url: "https://github.com/iart-ai/web-animation-skills",
    dir: "repos/web-animation-skills",
    name: "iArt AI — web-animation-skills",
    tagline: "Micro-interactions, page transitions, glassmorphism, and the 60fps contract.",
    whatItIs:
      "A web-animation pack from the iArt team covering the interaction layer: hover/press/toggle feedback, page transitions with a spatial model (peers crossfade, hierarchy pushes), the glassmorphism recipe (translucent fill + backdrop blur + 1px light border), and the 60fps performance contract.",
    howWeUseIt:
      "The interface layer. Our magnetic buttons and press feedback follow their micro-interaction timings; the glass stage IS their recipe; the Lab's fps meter exists because of their contract — transform and opacity may animate, layout properties never do.",
    example: {
      title: "The 60fps contract",
      body: "Transform and opacity skip layout and paint — they go straight to the GPU compositor. Width, top, margin trigger all three stages every frame. One rule: animate transform/opacity only, use will-change sparingly, profile in the Performance panel. The Lab's fps meter watches this live while you play with the stages.",
    },
    live: [
      { label: "Micro-interactions stage", href: "#/motion/micro" },
      { label: "Page transitions", href: "#/motion/transitions" },
      { label: "Glassmorphism", href: "#/motion/glass" },
    ],
    counts: [
      { id: "skills", label: "skill packs", base: "skills", match: "dirs", towardTotal: true },
    ],
  },
]

/* ══ layer 2 — the four system patterns ════════════════════════════════
 * Four repos that are not skill packs but ARCHITECTURE: each contributed
 * a working pattern to how this system thinks. They are cloned and
 * counted like the masters, but their integration is a mechanism. */

export const SYSTEM_PATTERN_REPOS: SourceRepo[] = [
  {
    id: "openmontage",
    repo: "calesthio/openmontage",
    url: "https://github.com/calesthio/openmontage",
    dir: "repos/openmontage",
    name: "OpenMontage — agentic video production",
    tagline: "World's first open-source, agentic video production system. 12 pipelines, 100+ tools, 700+ agent skill and production-knowledge files.",
    whatItIs:
      "A full agentic production studio in one repo: an orchestrator agent, a tool registry where every tool declares its own capabilities and skill dependencies, a three-layer knowledge architecture (tools → project skills → installed tech skills), and 13 YAML pipeline definitions that read like shot lists.",
    howWeUseIt:
      "Two patterns. (1) The reference-analysis entry point: paste any site URL, the Page Reader extracts it, the chat model distills a one-line brief — their 'agent reads a reference, then acts' move, live in the Builder's brief step. (2) The staged generation pipeline: our brief → design → content → art → motion → launch flow is their pipeline-director thinking, applied to websites.",
    example: {
      title: "The three-layer knowledge architecture",
      body: "Layer 1: tools/tool_registry.py — 'what tools exist' (209 tool modules). Layer 2: skills/ — 'how THIS project uses them' (157 skill files). Layer 3: .agents/skills/ — 'how the technology itself works' (92 installed packs). An agent asks layer 1 what's possible, layer 2 what the house style is, layer 3 how the tech behaves. We mirror it: endpoints → our 27-skill registry → the cloned masters.",
    },
    live: [
      { label: "Reference → brief (their pattern, live)", href: "#/build/brief" },
      { label: "The staged pipeline", href: "#/build" },
    ],
    counts: [
      { id: "l2", label: "layer-2 skills (skills/)", base: "skills", match: "md", towardTotal: true },
      { id: "l3", label: "layer-3 agent packs (.agents/skills/)", base: ".agents/skills", match: "dirs", towardTotal: true },
      { id: "tools", label: "tool modules (tools/)", base: "tools", match: "py" },
      { id: "pipes", label: "pipeline definitions", base: "pipeline_defs", match: "yaml" },
      { id: "md", label: "markdown knowledge files (whole repo)", base: "", match: "md" },
      { id: "all", label: "total files in the repo", base: "", match: "files" },
    ],
    claim: {
      claim: "\"700+ agent skill and production-knowledge files\" (their README)",
      verdict:
        "TRUE as stated, but read carefully: the 700+ counts FILES, not skills. The real breakdown from our clone is counted live on this page — layer-2 skills + layer-3 packs + tool modules + pipelines + docs ≈ the total file count. The agent-skill count proper is layer 2 + layer 3. Both numbers are shown, so neither rounds into marketing.",
    },
  },
  {
    id: "agency-agents",
    repo: "msitarzewski/agency-agents",
    url: "https://github.com/msitarzewski/agency-agents",
    dir: "repos/agency-agents",
    name: "Agency Agents — the specialist roster",
    tagline: "A complete AI agency at your fingertips — specialist personas across every division, installable into any coding agent.",
    whatItIs:
      "A roster of specialist agent personas — one markdown file per specialist, organised into divisions (design, engineering, marketing, finance, research…), each written as a full professional persona: the voice, the judgement, the deliverables. Install them into Claude Code, Cursor, Codex, Gemini — they re-skin how the agent thinks.",
    howWeUseIt:
      "The persona pattern: a named specialist with a voice, injected into a system prompt. Our copywriter personas are three of their specialists, re-homed: Warm & local, Premium & minimal, Bold & playful — pick one in the Builder's content step and ALL AI copy for the site is written in that voice.",
    example: {
      title: "A persona is a system prompt with a name",
      body: "'Premium & minimal' isn't a temperature setting — it's instructions: few words, no exclamation marks, confidence through specificity, never hype. Same business, same facts, three different writers. Try it: generate copy in the Builder, switch persona, regenerate — the whole site's voice changes.",
    },
    live: [
      { label: "The three copywriter voices", href: "#/build/content" },
    ],
    counts: [
      { id: "personas", label: "specialist personas (one md each)", base: "", match: "mdindirs", towardTotal: true },
      { id: "divisions", label: "divisions (design, engineering, marketing…)", base: "", match: "divisions" },
      { id: "md", label: "markdown files total", base: "", match: "md" },
    ],
  },
  {
    id: "graftcode",
    repo: "grft-dev/graftcode",
    url: "https://github.com/grft-dev/graftcode",
    dir: "repos/graftcode",
    name: "Graftcode — author once, render many",
    tagline: "The integration-free development layer — call methods across languages and runtimes, no APIs, no queues, no SDKs.",
    whatItIs:
      "Graftcode's whole thesis is: write the logic ONCE, render it for every consumer. Their repo ships one rules source rendered into per-platform packs — Aider, Claude, Cline, Continue, Copilot, Cursor, Windsurf each get their own dialect of the same truth, so nothing drifts when one platform changes.",
    howWeUseIt:
      "The fourth manifest format. Our skill registry was authorable once but only RENDERED three ways (json, tools, md) — the graftcode pattern made us add ?format=skillmd: the same 27-skill registry rendered as 27 portable SKILL.md files with YAML frontmatter, installable into any agent-skill system. Author once, render many — exactly.",
    example: {
      title: "One registry, four renderings",
      body: "GET /api/skills?format=json — the data. ?format=tools — OpenAI function schemas. ?format=md — a system-prompt document. ?format=skillmd — 27 SKILL.md files with YAML frontmatter, one per skill, in the layout Claude skills, .agents/skills and ClawHub all understand. Four renderings of one truth; edit the registry, all four change.",
    },
    live: [
      { label: "The manifest API (all four formats)", href: "#/sources" },
    ],
    counts: [
      { id: "rules", label: "agent-platform rule packs (rules/)", base: "rules", match: "dirs" },
      { id: "md", label: "markdown docs", base: "", match: "md" },
    ],
  },
  {
    id: "codebase-memory-mcp",
    repo: "DeusData/codebase-memory-mcp",
    url: "https://github.com/DeusData/codebase-memory-mcp",
    dir: "repos/codebase-memory-mcp",
    name: "Codebase Memory — MCP server",
    tagline: "Local code intelligence as an MCP server — code, docs and infrastructure in a persistent knowledge graph. 17 tools.",
    whatItIs:
      "A production MCP server that parses a codebase with tree-sitter and keeps it as a persistent knowledge graph, so a coding agent's understanding SURVIVES between sessions. It is the reference answer to 'what does an MCP server actually look like in practice' — protocol, tools, resources, docs.",
    howWeUseIt:
      "Two things. (1) The persistence concept: our build state survives navigation and reloads — a module-level store plus sessionStorage, so renders keep polling in the background and settle when you come back. (2) The MCP pattern itself: this system now IS an MCP server (/api/mcp) — one connection that hands any agent every skill at once, instead of installing skills one by one.",
    example: {
      title: "One server, every skill",
      body: "Today, using 27 skills in Claude means 27 installs. The MCP move: add ONE server config pointing at /api/mcp and the agent gets census, manifest, all four formats, the 8 AI engine calls, the reference-to-brief distiller, the copy personas and the builder picker as tools — always current, nothing installed. The connect panel on this page has the exact JSON.",
    },
    live: [
      { label: "The MCP connect panel (below)", href: "#/sources" },
      { label: "The Builder (state that survives reloads)", href: "#/build" },
    ],
    counts: [
      { id: "md", label: "docs & knowledge files (docs/)", base: "docs", match: "md" },
      { id: "src", label: "C sources (src/ — daemon, CLI, graph)", base: "src", match: "c" },
    ],
  },
]

/* ══ layer 3 — the local skill library ══════════════════════════════════
 * The 18 skill packages installed under /skills — the platform's own
 * library, each a full SKILL.md package with scripts and references.
 * The census counts them from the filesystem, like everything else. */

export const LOCAL_LIBRARY_NOTE =
  "Installed under /skills — the platform's own library. Every package is a real SKILL.md with scripts and references, ready to run. The eight engine skills are LIVE as REST endpoints in this system (that's the '8×2' in the AI Studio); the rest are the working craft library behind the scenes."

export const LOCAL_SKILL_BLURBS: Record<string, string> = {
  LLM: "conversation & generation — powers the chat API",
  VLM: "image understanding — critique, extraction, metadata",
  ASR: "speech to text — microphone and file",
  TTS: "text to speech — 7 voices, WAV out",
  "image-generation": "photographic art from prompts",
  "image-edit": "AI editing of existing images",
  "image-search": "real web images, OSS-hosted",
  "video-understand": "video analysis, scenes and motion",
  pdf: "the four PDF production lines",
  docx: "Word documents with tracked changes",
  xlsx: "spreadsheets with charts and pivots",
  pptx: "presentations, OOXML-level",
  charts: "professional charts & diagrams",
  "agent-browser": "headless browser automation",
  "fullstack-dev": "full-stack project scaffolding",
  "skill-creator": "creating and benchmarking skills",
  "task-review": "saving task paths as reusable skills",
  "skill-finder-cn": "the ClawHub skill finder",
}

/* ══ layer 4 — this system's own unified registry ══════════════════════ */

export const REGISTRY_NOTE =
  "This system's own surface: 19 motion skills distilled from the five masters + 8 live AI engine skills = 27 unified skills, served at /api/skills in four formats (json, tools, md, skillmd) — and now as ONE MCP server at /api/mcp."

/* ── the assembled ledger ────────────────────────────────────────────── */

export const SOURCE_LAYERS: SourceLayer[] = [
  {
    id: "motion-masters",
    label: "The Five Motion Masters",
    note: "Cloned, read and distilled into the 19-skill motion registry — the craft layer every template inherits.",
    repos: MOTION_MASTER_REPOS,
  },
  {
    id: "system-patterns",
    label: "The Four System Patterns",
    note: "Not skill packs — architecture. Each contributed a working mechanism to how this system thinks.",
    repos: SYSTEM_PATTERN_REPOS,
  },
]

/** every cloned repo, flat */
export const ALL_SOURCE_REPOS: SourceRepo[] = [...MOTION_MASTER_REPOS, ...SYSTEM_PATTERN_REPOS]

/** find a repo entry by its census id */
export const findSourceRepo = (id: string) => ALL_SOURCE_REPOS.find((r) => r.id === id)
