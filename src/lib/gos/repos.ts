// ─── Integration registry: cloned GitHub repos the system draws from ─────

export interface RepoIntegration {
  id: string
  repo: string
  url: string
  role: string
  contributes: string[]
  layer: string
  status: "active" | "knowledge"
}

export const REPO_INTEGRATIONS: RepoIntegration[] = [
  {
    id: "openmontage",
    repo: "openmontage",
    url: "https://github.com/openmontage/openmontage",
    role: "Reference analysis engine + staged generation pipeline",
    contributes: [
      "Analyze a reference site and distill its design language into a brief",
      "Stage generation: structure → style → motion → copy",
    ],
    layer: "Context Engine",
    status: "active",
  },
  {
    id: "agency-agents",
    repo: "agency-agents",
    url: "https://github.com/agency-agents/agency-agents",
    role: "Three copywriting personas for generated sites",
    contributes: [
      "Warm & local — neighborhood businesses, human tone",
      "Premium & minimal — studios, high-end brands",
      "Bold & playful — products that want personality",
    ],
    layer: "Skills",
    status: "active",
  },
  {
    id: "graftcode",
    repo: "graftcode",
    url: "https://github.com/graftcode/graftcode",
    role: "Author once, render many — portable skill format",
    contributes: ["SKILL.md portable manifest", "?format=skillmd export"],
    layer: "Skills",
    status: "knowledge",
  },
  {
    id: "codebase-memory-mcp",
    repo: "codebase-memory-mcp",
    url: "https://github.com/codebase-memory-mcp/codebase-memory-mcp",
    role: "Persistent memory across sessions",
    contributes: ["Build state survives reloads", "Project memory index"],
    layer: "Memory",
    status: "active",
  },
  {
    id: "emilkowalski-skills",
    repo: "emilkowalski/skills",
    url: "https://github.com/emilkowalski/skills",
    role: "Animation quality bar",
    contributes: [
      "Animate gate — nothing moves without purpose",
      "Easing & duration tables, entrance/exit recipes",
      "prefers-reduced-motion gating",
    ],
    layer: "Skills",
    status: "active",
  },
  {
    id: "gsap-skills",
    repo: "greensock/gsap-skills",
    url: "https://github.com/greensock/gsap-skills",
    role: "Timeline orchestration patterns",
    contributes: [
      "Timeline choreography with position parameter",
      "Stagger sweeps, scroll-driven timelines",
    ],
    layer: "Skills",
    status: "active",
  },
  {
    id: "remotion-skills",
    repo: "remotion-dev/skills",
    url: "https://github.com/remotion-dev/skills",
    role: "Composition thinking",
    contributes: ["Tracks & springs as values", "Render pipeline mindset"],
    layer: "Skills",
    status: "knowledge",
  },
  {
    id: "wiggle-skill",
    repo: "wiggle-claude-skill",
    url: "https://github.com/wiggle-claude-skill/wiggle-claude-skill",
    role: "Brand personality → motion mapping",
    contributes: ["Lottie keyframe syntax", "Motion that encodes brand voice"],
    layer: "Skills",
    status: "knowledge",
  },
  {
    id: "web-animation-skills",
    repo: "iart-ai/web-animation-skills",
    url: "https://github.com/iart-ai/web-animation-skills",
    role: "Micro-interactions & page transitions",
    contributes: ["Glassmorphism recipes", "60fps performance contract"],
    layer: "Skills",
    status: "active",
  },
]

// ─── System architecture (mirrors the Growth OS blueprint) ───────────────

export interface LayerInfo {
  id: string
  name: string
  implemented: string
  detail: string
}

export const SYSTEM_LAYERS: LayerInfo[] = [
  {
    id: "interfaces",
    name: "Interfaces",
    implemented: "Chat workspace + live preview + sites library",
    detail:
      "One page, three surfaces: talk to the agent, watch what it builds, revisit everything it ever built.",
  },
  {
    id: "orchestrator",
    name: "Orchestrator",
    implemented: "Agent loop: classify → plan → tools → verify → remember",
    detail:
      "Every message is classified (question / new site / edit / analyze / clarify), routed to the right tool, then verified before the agent may claim success.",
  },
  {
    id: "context",
    name: "Context Engine",
    implemented: "Conversation history + site state + memory index",
    detail:
      "The agent sees the running context of the build — current site, design seed, past decisions — never answers in a vacuum.",
  },
  {
    id: "tools",
    name: "Tool layer (MCP-style)",
    implemented: "site.generate · site.edit · site.analyze · knowledge.answer · memory.write",
    detail:
      "Small, single-purpose, typed tools. The LLM never free-forms its way around them.",
  },
  {
    id: "sandbox",
    name: "Preview sandbox",
    implemented: "Sandboxed iframe render, device widths, version history",
    detail:
      "Generated sites render in an isolated sandbox instantly. Every save bumps a version you can always reopen.",
  },
  {
    id: "verification",
    name: "Verification",
    implemented: "10-point structural check + 0–100 score",
    detail:
      "DOCTYPE, title, meta, responsive viewport, real sections, no placeholder copy, motion, fonts, size. The agent may only say done when checks pass.",
  },
  {
    id: "memory",
    name: "Memory",
    implemented: "Scoped key/value store (user · project · business)",
    detail:
      "Tell the agent to remember facts about you or your business — they are recalled into every future run.",
  },
]
