# The Source Ledger + Census + MCP Server

## What was built

The system is now **one unified, all-in-one skill server** with a full audit trail:

### 1. The Sources tab (`#/sources`) — `src/shell/views/sources.tsx`
The new tab the user asked for: **every GitHub repo the system uses, listed, explained and counted**, so nothing is missed. Four layers:
- **The Five Motion Masters** — emilkowalski/skills, greensock/gsap-skills, remotion-dev/skills, wiggle-claude-skill, iart-ai/web-animation-skills
- **The Four System Patterns** — calesthio/openmontage, msitarzewski/agency-agents, grft-dev/graftcode, DeusData/codebase-memory-mcp
- **The Local Skill Library** — the 18 packages under `/skills`
- **The Unified Registry** — 27 skills, 4 manifest formats, the MCP server

Every repo card carries: their tagline (quoted), **our explanation** of what it is, **our explanation** of how we use it here, a worked "how it works" example (expandable), live count chips from the census, cloned/missing badge, and "See it live" deep links.

### 2. The census — `src/engine/sources.ts` + `GET /api/census`
Nothing is a hardcoded claim:
- All 9 repos are **shallow-cloned into `repos/`** (244MB, git-ignored, ESLint-ignored, dev-server watch-ignored via `next.config.ts` watchOptions)
- The census **recounts the filesystem on every request** per count rule (SKILL.md files, skill dirs, personas-in-dirs, .py modules, .yaml pipelines, total files, MB)
- `?validate=1` **live-probes all 12 endpoints** (8 AI routes + skills + MCP + census + playbook) — empty-body 400 = alive; no model calls, no tokens
- **OpenMontage's "700+" claim verified against the clone**: 157 layer-2 skills + 92 layer-3 packs + 209 tool modules + 13 pipelines + 1,101 markdown knowledge files = the claim counts FILES; agent-skill files proper = 249. Breakdown shown live on the tab.
- Honest totals: **667 verified skills** (622 counted in clones + 18 local + 27 registry)

### 3. The MCP server — `POST/GET /api/mcp`
The all-in-one move (codebase-memory-mcp pattern): one server config in Claude Desktop / Claude Code / Cursor gives any agent **every skill as a tool**:
- **15 tools**: census, skills_manifest, skill_detail, reference_to_brief (openmontage pattern), copy_personas (agency-agents pattern: warm/premium/bold), builder_pick (the Builder's Generate button), ai_chat, ai_image, ai_video, ai_job_status, ai_tts, ai_asr, ai_vlm, ai_search, ai_reader
- **4 resources** (census://latest, skills://registry, sources://ledger, skills://manifest.md) and **3 prompts** (copy_in_voice, reference_brief, motion_audit)
- JSON-RPC 2.0, Streamable HTTP, stateless; internal tool calls import the REST route handlers directly → zero behavior drift
- The Sources tab has the connect panel: config JSON + copy buttons + live "Test the connection" handshake

## Verified end-to-end (agent-browser)
- Sources tab renders census live; validation run → **12/12 alive**; MCP handshake → Connected
- builder_pick via MCP → real LLM → molo-bakehouse site action with copy
- ai_image via MCP → jobId → ai_job_status → done with image
- ?format=skillmd via MCP → 27 portable SKILL.md files (graftcode "author once, render many")
- Mobile 390px: no horizontal overflow; desktop 1440: clean; topbar 1280: labels collapse per existing design
- `bun run lint` clean; dev.log clean

## Key files
- `src/engine/sources.ts` — the ledger (single source of truth for tab + census)
- `src/app/api/census/route.ts` — the counter + validator
- `src/app/api/mcp/route.ts` — the MCP server
- `src/shell/views/sources.tsx` — the tab
- `repos/` — the 9 clones (references, not dependencies)
- Wiring: nav.ts (view id + SYSTEM_MAP), growth-os.tsx, topbar.tsx, command-palette.tsx, home.tsx
- eslint.config.mjs + next.config.ts — ignore repos/ (watch + lint)
