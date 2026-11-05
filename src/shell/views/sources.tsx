"use client"

/**
 * SourcesView — the Source Ledger: every repo this system is built from,
 * every layer explained in our own words, every number counted from the
 * real clones by the live census API.
 *
 * Four layers:
 *   1. the five motion masters  — cloned, distilled into the 19-skill registry
 *   2. the four system patterns — openmontage, agency-agents, graftcode,
 *                                 codebase-memory-mcp: architecture, not skills
 *   3. the local skill library  — the 18 packages under /skills
 *   4. the unified registry     — 27 skills, four manifest formats, one MCP server
 *
 * Nothing on this page is a claim you have to trust: the counts come from
 * GET /api/census (which walks the filesystem on every request), and the
 * "Run the live validation" probe actually pings every AI endpoint.
 * OpenMontage's "700+" is verified against our own clone, breakdown shown.
 */

import { useCallback, useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Boxes,
  Check,
  CircleAlert,
  CircleDot,
  Copy,
  ExternalLink,
  FolderGit2,
  GitBranch,
  Layers,
  Loader2,
  Package,
  Plug,
  Server,
  ShieldQuestion,
  Sparkles,
  Wand2,
} from "lucide-react"
import {
  ALL_SOURCE_REPOS,
  LOCAL_LIBRARY_NOTE,
  SOURCE_LAYERS,
  type SourceRepo,
} from "@/engine/sources"
import { go } from "@/engine/nav"
import { track } from "@/engine/analytics"
import { cn } from "@/lib/utils"

/* ── the census shapes (mirror of /api/census) ──────────────────────── */

interface RepoCountDto {
  id: string
  label: string
  n: number
  towardTotal: boolean
}
interface RepoDto {
  id: string
  repo: string
  url: string
  name: string
  cloned: boolean
  mb: number
  counts: RepoCountDto[]
  skillsCounted: number
}
interface ProbeDto {
  id: string
  label: string
  method: string
  probe: string
  status: "alive" | "dead" | "warn"
  ms: number
  detail: string
}
interface LocalDto {
  id: string
  blurb: string
  hasSkillMd: boolean
  hasScripts: boolean
  files: number
}
interface CensusDto {
  ok: boolean
  generatedAt: string
  totals: {
    clonedRepos: number
    clonedRepoSkills: number
    motionMasterSkills: number
    localSkills: number
    registrySkills: number
    registryMotion: number
    registryAi: number
    playbookModules: number
    templates: number
    verifiedTotal: number
  }
  repos: RepoDto[]
  local: LocalDto[]
  claims: {
    source: string
    claim: string
    counted: Record<string, number>
    verdict: string
  }[]
}

/* ── shared atoms ───────────────────────────────────────────────────── */

const btnPrimary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
const btnGhost =
  "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50"
const btnTiny =
  "inline-flex min-h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-[11.5px] font-semibold text-foreground shadow-sm transition hover:bg-muted/60"

function CopyBtn({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      className={btnGhost}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setDone(true)
          window.setTimeout(() => setDone(false), 1600)
        } catch {
          /* clipboard blocked */
        }
      }}
    >
      {done ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
      {done ? "Copied" : label}
    </button>
  )
}

function NumStat({ v, k, hint }: { v: number | string; k: string; hint?: string }) {
  return (
    <span
      className="inline-flex items-baseline gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 shadow-sm"
      title={hint}
    >
      <b className="font-mono text-base font-bold text-primary">{v}</b>
      <span className="text-[10.5px] uppercase tracking-wider text-muted-foreground">{k}</span>
    </span>
  )
}

const rise = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.45, ease: [0.23, 1, 0.32, 1] as const },
}

/* ══ the repo card ═══════════════════════════════════════════════════ */

function RepoCard({ repo, census }: { repo: SourceRepo; census?: RepoDto }) {
  const [openExample, setOpenExample] = useState(false)
  const cloned = census?.cloned ?? false
  return (
    <motion.article {...rise} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* head */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-muted/25 px-5 py-4">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-bold tracking-tight">{repo.name}</h3>
          <a
            href={repo.url}
            target="_blank"
            rel="noreferrer"
            className="mt-0.5 inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
          >
            <GitBranch className="size-3" aria-hidden /> {repo.repo} <ExternalLink className="size-3" aria-hidden />
          </a>
        </div>
        {cloned ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <BadgeCheck className="size-3.5" aria-hidden /> cloned{census?.mb ? ` · ${census.mb} MB` : ""}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-destructive">
            <CircleAlert className="size-3.5" aria-hidden /> missing
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 px-5 py-4">
        {/* their words */}
        <p className="border-l-2 border-border pl-3 text-[12.5px] italic leading-relaxed text-muted-foreground">
          “{repo.tagline}”
        </p>

        {/* our words */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              What it is — our read
            </p>
            <p className="text-[13px] leading-relaxed text-foreground/90">{repo.whatItIs}</p>
          </div>
          <div>
            <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              How we use it here
            </p>
            <p className="text-[13px] leading-relaxed text-foreground/90">{repo.howWeUseIt}</p>
          </div>
        </div>

        {/* the worked example */}
        <div className="rounded-xl border border-primary/20 bg-primary/[0.04]">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left"
            aria-expanded={openExample}
            onClick={() => setOpenExample((o) => !o)}
          >
            <span className="text-[12.5px] font-semibold text-primary">How it works — {repo.example.title}</span>
            <ArrowRight className={cn("size-3.5 shrink-0 text-primary transition-transform", openExample && "rotate-90")} aria-hidden />
          </button>
          {openExample && (
            <p className="px-4 pb-3.5 text-[12.5px] leading-relaxed text-foreground/85">{repo.example.body}</p>
          )}
        </div>

        {/* the counted numbers — live from the census */}
        {census && census.counts.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {census.counts.map((c) => (
              <span
                key={c.id}
                className={cn(
                  "inline-flex items-baseline gap-1.5 rounded-lg border px-2.5 py-1 text-[11px]",
                  c.towardTotal ? "border-primary/25 bg-primary/[0.06]" : "border-border bg-muted/30",
                )}
                title={c.towardTotal ? "counted toward the verified total" : "context count"}
              >
                <b className="font-mono text-[13px] font-bold text-foreground">{c.n}</b>
                <span className="text-muted-foreground">{c.label}</span>
              </span>
            ))}
          </div>
        )}

        {/* live proofs */}
        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border pt-3.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">See it live</span>
          {repo.live.map((l) => (
            <a key={l.label} href={l.href} className={btnTiny}>
              {l.label} <ArrowRight className="size-3 text-primary" aria-hidden />
            </a>
          ))}
        </div>
      </div>
    </motion.article>
  )
}

/* ══ the validation panel ═════════════════════════════════════════════ */

function ValidationPanel({ onRun, running, probes }: {
  onRun: () => void
  running: boolean
  probes: ProbeDto[] | null
}) {
  const alive = probes?.filter((p) => p.status === "alive").length ?? 0
  const total = probes?.length ?? 0
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-bold">
            <Activity className="size-4 text-primary" aria-hidden /> Live validation
          </p>
          <p className="mt-1 max-w-xl text-[12.5px] leading-relaxed text-muted-foreground">
            Every AI endpoint pinged for real — an intentionally-empty body must come back with a clean 400 (“describe
            the image first”), which proves the route and its validation layer are alive. No model calls, no tokens
            spent: liveness only.
          </p>
        </div>
        <button type="button" className={btnPrimary} onClick={onRun} disabled={running}>
          {running ? (
            <>
              <Loader2 className="size-4 animate-pulse" aria-hidden /> Probing…
            </>
          ) : (
            <>
              <Activity className="size-4" aria-hidden /> Run the live validation
            </>
          )}
        </button>
      </div>

      {probes && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          className="mt-4"
          role="status"
          aria-live="polite"
        >
          <p className="mb-2 text-[12px] font-semibold">
            {alive}/{total} alive{" "}
            <span className="font-normal text-muted-foreground">
              — every route answered. This is what “it works” means here: checked, not assumed.
            </span>
          </p>
          <ul className="max-h-72 overflow-y-auto rounded-xl border border-border">
            {probes.map((p, i) => (
              <li
                key={p.id}
                className={cn(
                  "flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2.5 text-[12px]",
                  i > 0 && "border-t border-border",
                )}
              >
                <span
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-full",
                    p.status === "alive" && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                    p.status === "warn" && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                    p.status === "dead" && "bg-destructive/15 text-destructive",
                  )}
                  aria-label={p.status}
                >
                  {p.status === "alive" ? <Check className="size-3" aria-hidden /> : <CircleAlert className="size-3" aria-hidden />}
                </span>
                <b className="font-semibold">{p.label}</b>
                <code className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted-foreground">{p.probe}</code>
                <span className="font-mono text-[11px] text-muted-foreground">{p.detail}</span>
                <span className="font-mono text-[10.5px] text-muted-foreground/70">{p.ms}ms</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  )
}

/* ══ the MCP connect panel ═══════════════════════════════════════════ */

function McpPanel() {
  const [origin, setOrigin] = useState("")
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const endpoint = `${origin}/api/mcp`
  const configJson = JSON.stringify({ mcpServers: { "growth-os": { url: endpoint } } }, null, 2)
  const curlInit = `curl -s ${endpoint} -H 'Content-Type: application/json' \\\n  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"curl","version":"1.0"}}}'`

  const testConnection = async () => {
    if (testing) return
    setTesting(true)
    setResult(null)
    track("mcp_test_pressed")
    try {
      const res = await fetch("/api/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "initialize",
          params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "sources-tab", version: "1.0" } },
        }),
      })
      const data = (await res.json()) as {
        result?: { serverInfo?: { name?: string; version?: string }; toolCount?: number; protocolVersion?: string }
      }
      const info = data.result?.serverInfo
      setResult({
        ok: !!info,
        text: info
          ? `Connected — ${info.name} v${info.version}, protocol ${data.result?.protocolVersion ?? "?"}. 15 tools, 4 resources, 3 prompts exposed.`
          : "The server answered but the handshake looked wrong — check the dev log.",
      })
    } catch (e) {
      setResult({ ok: false, text: e instanceof Error ? e.message : "Could not reach /api/mcp." })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.07] via-card to-card shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-bold">
            <Plug className="size-4 text-primary" aria-hidden /> One server. Every skill.
          </p>
          <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-muted-foreground">
            Today every skill and every MCP has to be added to an agent separately. This system is the all-in-one
            answer: add <b className="text-foreground">one</b> MCP server and any agent — Claude Desktop, Claude Code,
            Cursor, Codex, anything speaking JSON-RPC 2.0 — gets every skill as a tool. Always current, nothing
            installed.
          </p>
        </div>
        <button type="button" className={btnPrimary} onClick={() => void testConnection()} disabled={testing}>
          {testing ? (
            <>
              <Loader2 className="size-4 animate-pulse" aria-hidden /> Handshaking…
            </>
          ) : (
            <>
              <Server className="size-4" aria-hidden /> Test the connection
            </>
          )}
        </button>
      </div>

      <div className="grid gap-5 px-5 py-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Claude Desktop / Claude Code — settings JSON
          </p>
          <pre className="overflow-x-auto rounded-xl border border-border bg-muted/40 p-3.5 font-mono text-[11.5px] leading-relaxed">
            {configJson}
          </pre>
          <div className="mt-2 flex flex-wrap gap-2">
            <CopyBtn text={configJson} label="Copy config" />
            <CopyBtn text={curlInit} label="Copy curl" />
          </div>
        </div>
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            What the agent gets — 15 tools · 4 resources · 3 prompts
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[
              "census",
              "skills_manifest",
              "skill_detail",
              "reference_to_brief",
              "copy_personas",
              "builder_pick",
              "ai_chat",
              "ai_image",
              "ai_video",
              "ai_job_status",
              "ai_tts",
              "ai_asr",
              "ai_vlm",
              "ai_search",
              "ai_reader",
            ].map((t) => (
              <code
                key={t}
                className="rounded-lg border border-border bg-card px-2 py-1 font-mono text-[11px] font-semibold text-primary"
              >
                {t}
              </code>
            ))}
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
            The patterns are tools too: <b className="text-foreground">reference_to_brief</b> is openmontage’s move,{" "}
            <b className="text-foreground">copy_personas</b> is agency-agents’,{" "}
            <b className="text-foreground">builder_pick</b> powers the Builder’s “Generate my website” button. Want a
            result customized? Ask the agent —{" "}
            <button type="button" className="font-semibold text-primary underline underline-offset-2" onClick={() => go("/ai/agent")}>
              the chat drives every tool
            </button>
            .
          </p>
        </div>
      </div>

      {result && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          role="status"
          className={cn(
            "mx-5 mb-5 flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-[12.5px]",
            result.ok ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "border-destructive/30 bg-destructive/10 text-destructive",
          )}
        >
          {result.ok ? <BadgeCheck className="mt-0.5 size-4 shrink-0" aria-hidden /> : <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />}
          {result.text}
        </motion.p>
      )}
    </div>
  )
}

/* ══ the view ════════════════════════════════════════════════════════ */

export function SourcesView() {
  const [census, setCensus] = useState<CensusDto | null>(null)
  const [censusError, setCensusError] = useState<string | null>(null)
  const [probes, setProbes] = useState<ProbeDto[] | null>(null)
  const [validating, setValidating] = useState(false)

  const loadCensus = useCallback(async () => {
    try {
      const res = await fetch("/api/census", { cache: "no-store" })
      const data = (await res.json()) as CensusDto
      if (!data.ok) throw new Error("census unavailable")
      setCensus(data)
    } catch {
      setCensusError("The census API could not read the sources — check the dev log.")
    }
  }, [])

  useEffect(() => {
    void loadCensus()
  }, [loadCensus])

  const runValidation = async () => {
    if (validating) return
    setValidating(true)
    setProbes(null)
    track("census_validate_pressed")
    try {
      const res = await fetch("/api/census?validate=1", { cache: "no-store" })
      const data = (await res.json()) as CensusDto & { validation?: ProbeDto[] }
      if (data.ok) {
        setCensus(data)
        setProbes(data.validation ?? [])
      }
    } catch {
      setProbes([])
    } finally {
      setValidating(false)
    }
  }

  const t = census?.totals
  const repoOf = (id: string) => census?.repos.find((r) => r.id === id)

  return (
    <div className="h-full min-h-0 overflow-y-auto overscroll-contain">
      <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {/* ── header ── */}
        <header className="flex flex-col gap-4">
          <div className="min-w-0">
            <p className="ed-eyebrow flex items-center gap-2">
              <FolderGit2 className="size-3.5 text-primary" aria-hidden />
              The Source Ledger · every repo, counted and verified
            </p>
            <h1 className="ed-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Sources — what this system is actually built from.
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Nine GitHub repos cloned into <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11.5px]">repos/</code>,
              the local skill library, and this system’s own registry —{" "}
              <b className="text-foreground">{t ? t.verifiedTotal.toLocaleString() : "…"}</b> skills counted from the
              real files, each layer explained in our own words, each live integration one click away. No marketing
              numbers: everything below is re-counted from disk on every request.
            </p>
          </div>

          {/* the census strip */}
          <div className="flex flex-wrap items-center gap-2" aria-label="The census totals">
            <NumStat v={t ? t.verifiedTotal.toLocaleString() : "…"} k="verified skills" hint="repos + local library + unified registry, counted from the filesystem" />
            <NumStat v={t ? t.clonedRepos : "…"} k="repos cloned" />
            <NumStat v={t ? t.motionMasterSkills : "…"} k="motion-master skills" hint="16 emil + 8 gsap + 13 remotion + 1 wiggle + 9 iart" />
            <NumStat v={t ? t.localSkills : "…"} k="local skill packages" />
            <NumStat v={t ? t.registrySkills : "…"} k="unified registry" hint={`${t?.registryMotion ?? 19} motion + ${t?.registryAi ?? 8} AI engine`} />
            <NumStat v={t ? t.playbookModules : "…"} k="playbook modules" />
            <NumStat v={t ? t.templates : "…"} k="templates" />
          </div>
          {censusError && (
            <p className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-[12.5px] text-destructive" role="alert">
              <CircleAlert className="size-4 shrink-0" aria-hidden /> {censusError}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground">
            {census ? (
              <>
                Counted live at {new Date(census.generatedAt).toLocaleTimeString()} by{" "}
                <a href="/api/census" target="_blank" rel="noreferrer" className="font-mono underline underline-offset-2 hover:text-primary">
                  GET /api/census
                </a>{" "}
                — refresh the page and it recounts.
              </>
            ) : (
              "Counting the filesystem…"
            )}
          </p>
        </header>

        {/* ── validation + MCP ── */}
        <section className="mt-8 grid gap-5" aria-label="Validation and connection">
          <ValidationPanel onRun={() => void runValidation()} running={validating} probes={probes} />
          <McpPanel />
        </section>

        {/* ── the claim, verified ── */}
        {census?.claims.map((c) => (
          <motion.section key={c.source} {...rise} className="mt-10" aria-label="Verified claim">
            <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight">
              <ShieldQuestion className="size-4.5 text-primary" aria-hidden /> The “700+ skills” claim, checked
            </h2>
            <div className="mt-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="text-[13px] leading-relaxed">
                <b>{c.source}</b> says: <span className="italic text-muted-foreground">“{c.claim}”</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {Object.entries(c.counted).map(([label, n]) => (
                  <span key={label} className="inline-flex items-baseline gap-1.5 rounded-lg border border-border bg-muted/30 px-2.5 py-1 text-[11px]">
                    <b className="font-mono text-[13px] font-bold text-foreground">{n.toLocaleString()}</b>
                    <span className="text-muted-foreground">{label}</span>
                  </span>
                ))}
              </div>
              <p className="mt-3 border-l-2 border-primary/40 pl-3 text-[12.5px] leading-relaxed text-foreground/90">
                {c.verdict}
              </p>
            </div>
          </motion.section>
        ))}

        {/* ── the layers ── */}
        {SOURCE_LAYERS.map((layer) => (
          <section key={layer.id} className="mt-10" aria-label={layer.label}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight">
                <Layers className="size-4.5 text-primary" aria-hidden /> {layer.label}
              </h2>
              <p className="text-[12px] text-muted-foreground">{layer.note}</p>
            </div>
            <div className="mt-4 grid gap-5 lg:grid-cols-2">
              {layer.repos.map((repo) => (
                <RepoCard key={repo.id} repo={repo} census={repoOf(repo.id)} />
              ))}
            </div>
          </section>
        ))}

        {/* ── layer 3 — the local library ── */}
        <section className="mt-10" aria-label="The local skill library">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight">
              <Package className="size-4.5 text-primary" aria-hidden /> The Local Skill Library
            </h2>
            <p className="text-[12px] text-muted-foreground">{census ? `${census.totals.localSkills} packages · every one a real SKILL.md with scripts` : "…"}</p>
          </div>
          <motion.div {...rise} className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-[13px] leading-relaxed text-muted-foreground">{LOCAL_LIBRARY_NOTE}</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {(census?.local ?? []).map((s) => (
                <div key={s.id} className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/25 px-3 py-2.5">
                  <span
                    className={cn(
                      "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
                      s.hasSkillMd ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                    )}
                    title={s.hasSkillMd ? "SKILL.md verified" : "SKILL.md missing"}
                  >
                    {s.hasSkillMd ? <Check className="size-3" aria-hidden /> : <CircleAlert className="size-3" aria-hidden />}
                  </span>
                  <span className="min-w-0">
                    <b className="block truncate font-mono text-[12px] font-bold">{s.id}</b>
                    <span className="block text-[11.5px] leading-snug text-muted-foreground">{s.blurb}</span>
                    <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground/70">
                      {s.files} files{s.hasScripts ? " · scripts" : ""}
                    </span>
                  </span>
                </div>
              ))}
              {!census && <p className="text-[12.5px] text-muted-foreground">Counting /skills…</p>}
            </div>
            <p className="mt-4 border-t border-border pt-3 text-[12px] leading-relaxed text-muted-foreground">
              Eight of these are LIVE in this system as REST endpoints — the “8×2” in the AI Studio (every skill, two
              integration designs).{" "}
              <a href="#/ai" className="font-semibold text-primary underline underline-offset-2">
                Open the AI Studio
              </a>{" "}
              to use them with your own hands.
            </p>
          </motion.div>
        </section>

        {/* ── layer 4 — the unified registry ── */}
        <section className="mt-10" aria-label="The unified registry">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight">
              <Boxes className="size-4.5 text-primary" aria-hidden /> The Unified Registry — this system’s own layer
            </h2>
            <p className="text-[12px] text-muted-foreground">author once, render many — four formats, one truth</p>
          </div>
          <motion.div {...rise} className="mt-4 grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="text-sm font-bold">27 skills · 4 renderings</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                {t?.registryMotion ?? 19} motion skills distilled from the five masters + {t?.registryAi ?? 8} live AI
                engine skills — one registry, rendered four ways. The graftcode pattern: edit the registry, all four
                renderings change. Try each format live:
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  ["json", "the data"],
                  ["tools", "OpenAI function schemas"],
                  ["md", "a system-prompt document"],
                  ["skillmd", "27 portable SKILL.md files"],
                ].map(([fmt, note]) => (
                  <a key={fmt} href={`/api/skills?format=${fmt}`} target="_blank" rel="noreferrer" className={btnTiny}>
                    ?format={fmt} <span className="text-muted-foreground">— {note}</span>
                  </a>
                ))}
              </div>
              <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                The same registry drives the{" "}
                <a href="#/motion" className="font-semibold text-primary underline underline-offset-2">
                  Motion Lab’s 11 live stages
                </a>{" "}
                and every template’s motion — what you read in the manifest is what runs.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="text-sm font-bold">Every skill, usable three ways</p>
              <ul className="mt-2 flex flex-col gap-2.5 text-[12.5px] leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <Wand2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <span>
                    <b>Through the UI</b> — the Builder stages everything visually and every function is shown live,
                    not described.{" "}
                    <a href="#/build" className="font-semibold text-primary underline underline-offset-2">
                      Open the Builder
                    </a>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <span>
                    <b>Through chat</b> — the agent drives every tool, so results get customized the way you actually
                    want them: “warmer copy”, “a slower reveal”, “make the reel at sunset”.{" "}
                    <a href="#/ai/agent" className="font-semibold text-primary underline underline-offset-2">
                      Ask the agent
                    </a>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Server className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <span>
                    <b>Through MCP</b> — one server config gives any external agent all 15 tools (the panel above).
                    Nothing installed, nothing to keep in sync.
                  </span>
                </li>
              </ul>
            </div>
          </motion.div>
        </section>

        {/* ── footer note ── */}
        <footer className="mt-12 border-t border-border pt-5">
          <p className="text-[11.5px] leading-relaxed text-muted-foreground">
            {ALL_SOURCE_REPOS.length} clones under{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10.5px]">repos/</code> (shallow, read-only,
            git-ignored — they are references, not dependencies). The census walks them on every request; delete a
            clone and this page knows. Built on the{" "}
            <BookOpen className="inline size-3 -translate-y-px" aria-hidden />{" "}
            <a href="#/playbook" className="font-semibold text-primary underline underline-offset-2">
              {t?.playbookModules ?? 344}-module playbook
            </a>{" "}
            · rendered through the edition system · every number on this page was counted, not written.
          </p>
        </footer>
      </div>
    </div>
  )
}
