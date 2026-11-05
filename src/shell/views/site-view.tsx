"use client"

/**
 * SiteView — one template, whole-width, finished, addressed by the
 * system path: #/site/<slug>/<page>?published=1
 *
 *   1. sticky bar — exit pill, template id, page tabs (page = the path)
 *   2. the whole-width LIVE site — the genome applies in real time
 *   3. the consoles row (finish-gated): genome · manifest · blueprint
 *
 * "Published" (?published=1) hides every console and shows the plate
 * alone — the client-presentation mode.
 */
import { useMemo, useState } from "react"
import { Activity, ArrowLeft, BookOpen, Check, ClipboardCheck, ExternalLink, Lock, Maximize2, RotateCcw, Sliders, X } from "lucide-react"
import { NATIVE, SWITCHES, type Genome, type SwitchId } from "@/engine/genome"
import { TEMPLATES, findTemplate, industryOf, pagesAt, type TemplateDef } from "@/engine/registry"
import { resolve } from "@/engine/resolve"
import { countOverrides } from "@/engine/finish"
import { blueprintOf } from "@/engine/blueprint"
import { go, goKeepingParams, href, setParam } from "@/engine/nav"
import { track } from "@/engine/analytics"
import { useFactory } from "@/factory/store"
import { useFx } from "../fx"
import { useGos } from "../gos-context"
import { SiteFrame } from "../site-frame"
import { TypeTools } from "../type-tools"
import { RandomizerTools } from "../randomizer"

type ConsoleTab = "genome" | "manifest" | "events" | "blueprint"

export function SiteView({ slug, page, published }: { slug: string | null; page: string | null; published: boolean }) {
  const tpl = useMemo(() => findTemplate(slug) ?? TEMPLATES[0], [slug])
  const { caps } = useFx()
  const gos = useGos()
  const [console_, setConsole_] = useState<ConsoleTab | null>(caps.consoles > 0 ? "genome" : null)
  const [notice, setNotice] = useState<string | null>(null)
  const [pbLinks, setPbLinks] = useState<Record<string, { id: string; section: string; tier: string }> | null>(null)
  const blueprint = useMemo(() => blueprintOf(tpl.slug), [tpl.slug])

  /* genome comes from the shared provider so the library and this view
     stay in sync; the override budget is the finish tier's honest cap.
     siteGenome layers the edition preset UNDER the user's switches. */
  const genome = gos.siteGenome
  const userGenome = gos.genome
  const changed = SWITCHES.filter((s) => userGenome[s.id] !== "native").length
  const allowed = caps.genomeOverrides
  const visiblePages = useMemo(() => pagesAt(tpl, gos.tierStep), [tpl, gos.tierStep])

  const pick = (id: SwitchId, value: string) => {
    const next = { ...userGenome, [id]: value }
    const over = countOverrides(next)
    if (over > allowed) {
      setNotice(`The ${caps.consoles > 1 ? "Spectacle" : "current"} finish allows ${allowed} override${allowed === 1 ? "" : "s"} — you are at ${over}. Move up a finish, or reset one.`)
      return
    }
    setNotice(null)
    gos.setGenome(next)
  }

  /* fetch the playbook index once for module links */
  useMemo(() => {
    if (pbLinks) return
    void fetch("/api/playbook")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.modules) return
        const map: Record<string, { id: string; section: string; tier: string }> = {}
        for (const m of data.modules) map[m.name] = { id: m.id, section: m.section, tier: m.tier }
        setPbLinks(map)
      })
      .catch(() => {})
  }, [])

  const openModule = (id: string) => {
    go(`/playbook/${id}`)
  }

  /* the page lives in the path (#/site/<slug>/<page>) — in-site nav and
     the tab bar both walk the path, so the back button walks pages */
  const gotoPage = (p: string) => {
    goKeepingParams(`/site/${tpl.slug}/${p}`)
  }

  /* the morph step can filter out the current page — fall back to home */
  const safePage = visiblePages.some((p) => p.id === page) ? page : "home"

  return (
    <div className="siteview">
      {/* 1 · sticky bar */}
      <div className="sv-bar">
        <button
          type="button"
          className="sv-exit"
          onClick={() => {
            gos.select(tpl.slug)
            go(`/library/${tpl.slug}`)
          }}
        >
          <ArrowLeft size={14} aria-hidden /> Exit to library
        </button>
        <div className="sv-pages" role="tablist" aria-label="Pages">
          {visiblePages.map((p) => (
            <button key={p.id} role="tab" aria-selected={safePage === p.id} className={safePage === p.id ? "on" : ""} onClick={() => gotoPage(p.id)}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="sv-title">
          <b>{tpl.name}</b>
          <span>
            <code className="mr-1.5 rounded bg-muted px-1 py-px font-mono text-[10px] text-primary">#/site/{tpl.slug}{page && page !== "home" ? `/${page}` : ""}</code>
            {industryOf(tpl.industry).label}
          </span>
        </div>
        {/* type tools — editable text + A−/A+ right here on the plate */}
        <TypeTools />
        {/* the genome randomizer — deal / cruise on the plate too */}
        <RandomizerTools />
        <button
          type="button"
          className="sv-exit"
          onClick={() => {
            setParam("published", published ? null : true)
            track("media_opened", { slug: tpl.slug, published: !published })
          }}
          title={published ? "Show the consoles" : "Published view — consoles hidden"}
        >
          {published ? <Sliders size={14} aria-hidden /> : <Maximize2 size={14} aria-hidden />}
          {published ? "Inspect" : "Published"}
        </button>
        <a
          className="sv-exit"
          href={href(`/site/${tpl.slug}${page && page !== "home" ? `/${page}` : ""}?published=1`)}
          title="Published link — #/site/…?published=1"
        >
          <ExternalLink size={14} aria-hidden />
          <span className="sr-only">Published link</span>
        </a>
      </div>

      {/* 2 · the whole-width live site — morph step, type tools, edit mode all live */}
      <div className="sv-site-wrap">
        <SiteFrame
          tpl={tpl}
          genome={genome}
          page={safePage}
          onPage={gotoPage}
          tier={gos.tierStep}
          fontScale={gos.fontScale}
          editMode={gos.editMode}
          remountKey={gos.editResetKey}
          width="100%"
          height="auto"
        />
      </div>

      {/* 3 · the consoles row — finish-gated honestly */}
      {!published && (
        <div className="sv-consoles">
          {caps.consoles > 0 ? (
            <>
              <button type="button" className={`sv-exit ${console_ === "genome" ? "on" : ""}`} onClick={() => setConsole_(console_ === "genome" ? null : "genome")} aria-pressed={console_ === "genome"}>
                <Sliders size={14} aria-hidden /> Genome console
              </button>
              {caps.consoles > 1 ? (
                <button type="button" className={`sv-exit ${console_ === "manifest" ? "on" : ""}`} onClick={() => setConsole_(console_ === "manifest" ? null : "manifest")} aria-pressed={console_ === "manifest"}>
                  <BookOpen size={14} aria-hidden /> Manifest
                </button>
              ) : (
                <span className="sv-exit" style={{ opacity: 0.55 }} title="The manifest console arrives with the Spectacle finish">
                  <Lock size={13} aria-hidden /> Manifest · Spectacle
                </span>
              )}
              {/* merged productions carry a commissioning blueprint */}
              {blueprint ? (
                <button type="button" className={`sv-exit ${console_ === "blueprint" ? "on" : ""}`} onClick={() => setConsole_(console_ === "blueprint" ? null : "blueprint")} aria-pressed={console_ === "blueprint"} title="The commissioning blueprint — personas, journeys, SEO, QA, budget">
                  <ClipboardCheck size={14} aria-hidden /> Blueprint
                </button>
              ) : (
                <span className="sv-exit" style={{ opacity: 0.55 }} title="Blueprints ship with merged productions — Ember &amp; Oak (fb-002) carries the first">
                  <ClipboardCheck size={13} aria-hidden /> Blueprint · fb-002
                </span>
              )}
              {/* module-built templates carry their own consent-gated event stream */}
              {tpl.kit && (
                <button type="button" className={`sv-exit ${console_ === "events" ? "on" : ""}`} onClick={() => setConsole_(console_ === "events" ? null : "events")} aria-pressed={console_ === "events"}>
                  <Activity size={14} aria-hidden /> Events
                </button>
              )}
              <span className="sv-budget mono">
                {changed}/{allowed} overrides · {["Studio", "Signature", "Showcase", "Spectacle", "Private"][Math.min(4, caps.consoles === 2 ? 3 : caps.consoles === 1 ? 2 : 0)]} finish
              </span>
            </>
          ) : (
            <span className="sv-exit" style={{ opacity: 0.55 }}>
              <Lock size={13} aria-hidden /> Consoles arrive with the Showcase finish — the library inspector is always open
            </span>
          )}
        </div>
      )}

      {!published && console_ === "genome" && (
        <section className="mx-auto w-full max-w-5xl px-4 pb-10" aria-label="Genome console">
          <div className="ed-card of-float-panel p-5">
            <header className="flex items-center justify-between gap-3">
              <div>
                <p className="ed-eyebrow">Floating console 01 · genome</p>
                <h2 className="ed-display text-xl">Seven switches, live on the plate above.</h2>
              </div>
              <button type="button" className="gos-icon-btn sm" onClick={() => setConsole_(null)} aria-label="Close console">
                <X size={15} />
              </button>
            </header>
            {notice && (
              <p className="mt-3 rounded-lg border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
                <Lock size={11} className="mr-1 inline" aria-hidden /> {notice}
              </p>
            )}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {SWITCHES.map((s) => {
                const cur = genome[s.id]
                return (
                  <fieldset key={s.id} className="rounded-lg border border-border p-3">
                    <legend className="px-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {s.no} {s.label}
                    </legend>
                    <p className="mb-2 text-[11px] leading-snug text-muted-foreground">{s.line}</p>
                    <div className="flex flex-wrap gap-1">
                      {s.options.map((o) => {
                        const locked = o.id !== "native" && countOverrides({ ...genome, [s.id]: o.id }) > allowed
                        return (
                          <button
                            key={o.id}
                            type="button"
                            title={locked ? "Over the override budget for this finish" : o.hint}
                            aria-pressed={cur === o.id}
                            disabled={locked}
                            onClick={() => pick(s.id, o.id)}
                            className={`rounded-full border px-2 py-0.5 text-[11px] transition-colors ${
                              cur === o.id
                                ? "border-primary bg-primary text-primary-foreground"
                                : locked
                                  ? "border-border text-muted-foreground/50"
                                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                            }`}
                          >
                            {o.label}
                          </button>
                        )
                      })}
                    </div>
                  </fieldset>
                )
              })}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  gos.setGenome(NATIVE)
                  setNotice(null)
                }}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
              >
                Reset to as-drawn DNA
              </button>
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                Everything re-renders the plate above live
              </span>
            </div>
          </div>
        </section>
      )}

      {!published && console_ === "manifest" && (
        <section className="mx-auto w-full max-w-5xl px-4 pb-10" aria-label="Manifest explorer">
          <div className="ed-card of-float-panel p-5">
            <header className="flex items-center justify-between gap-3">
              <div>
                <p className="ed-eyebrow">Floating console 02 · manifest</p>
                <h2 className="ed-display text-xl">
                  What&apos;s inside {tpl.name} — {tpl.modules.length} modules, each honest.
                </h2>
              </div>
              <button type="button" className="gos-icon-btn sm" onClick={() => setConsole_(null)} aria-label="Close console">
                <X size={15} />
              </button>
            </header>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{tpl.positioning}</p>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {tpl.modules.map((m) => {
                const entry = pbLinks?.[m]
                return (
                  <li key={m}>
                    {entry ? (
                      <button
                        type="button"
                        onClick={() => openModule(entry.id)}
                        className="rounded-md border border-primary/40 px-2 py-1 font-mono text-[11px] text-primary hover:bg-primary/10"
                        title={`${entry.section} · ${entry.tier} tier — opens in the playbook`}
                      >
                        {m} ↗
                      </button>
                    ) : (
                      <span className="rounded-md border border-border bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground">{m}</span>
                    )}
                  </li>
                )
              })}
            </ul>
            {pbLinks && (
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                {tpl.modules.filter((m) => pbLinks[m]).length} of {tpl.modules.length} map to the 344-module playbook · depth {caps.manifestDepth} of 5
              </p>
            )}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-4">
                <p className="ed-eyebrow mb-2">Pages ({visiblePages.length})</p>
                <ol className="flex flex-col gap-1.5">
                  {visiblePages.map((p, i) => (
                    <li key={p.id}>
                      <button type="button" onClick={() => gotoPage(p.id)} className="flex w-full items-center gap-3 rounded px-2 py-1 text-left text-sm hover:bg-muted">
                        <span className="font-mono text-[10px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                        {p.label}
                        {safePage === p.id && <Check size={12} className="text-primary" aria-hidden />}
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="ed-eyebrow mb-2">Why it can&apos;t be cloned</p>
                <ul className="flex flex-col gap-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
                  {tpl.signature.map((s) => (
                    <li key={s} className="flex gap-2">
                      <span aria-hidden className="mt-1.5 inline-block size-1 shrink-0 rotate-45 bg-primary" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* more consoles — events (kit templates) · blueprint (merged productions) */}
      {!published && console_ === "events" && tpl.kit && <EventStreamConsole />}

      {!published && console_ === "blueprint" && blueprint && <BlueprintConsole tpl={tpl} blueprint={blueprint} />}

      <p className="sr-only">{tpl.name} — full-bleed preview. Genome changes apply live.</p>
    </div>
  )
}

/* ── the blueprint console — the commissioning definition of a merged
   production, ported from the Bolt-Ember project's template-definition.
   The registry says what a template IS; the blueprint says what it was
   COMMISSIONED to do — and both stay honest side by side. */
function BlueprintConsole({ tpl, blueprint }: { tpl: TemplateDef; blueprint: NonNullable<ReturnType<typeof blueprintOf>> }) {
  const bp = blueprint
  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-10" aria-label="Blueprint console">
      <div className="ed-card of-float-panel p-5">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="ed-eyebrow">Floating console 04 · blueprint · {bp.id}</p>
            <h2 className="ed-display text-xl">
              The commission behind {tpl.name}.
            </h2>
            <p className="mt-1.5 font-mono text-[11px] leading-relaxed text-muted-foreground">{bp.source}</p>
          </div>
        </header>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{bp.positioning}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="rounded-md border border-primary/40 bg-primary/10 px-2 py-1 font-mono text-[11px] text-primary">primary · {bp.primaryConversion}</span>
          {bp.secondaryConversions.map((c) => (
            <span key={c} className="rounded-md border border-border bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground">secondary · {c}</span>
          ))}
          <span className="rounded-md border border-border bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground">{bp.businessType}</span>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <p className="ed-eyebrow mb-2.5">Buyer personas — who it must win</p>
            <ul className="flex flex-col gap-2 text-[12.5px] leading-relaxed text-muted-foreground">
              {bp.personas.map((p) => (
                <li key={p} className="flex gap-2">
                  <span aria-hidden className="mt-1.5 inline-block size-1 shrink-0 rotate-45 bg-primary" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="ed-eyebrow mb-2.5">Customer journeys — what it must complete</p>
            <ol className="flex flex-col gap-2 text-[12.5px] leading-relaxed text-muted-foreground">
              {bp.journeys.map((j, i) => (
                <li key={j} className="flex gap-2.5">
                  <span className="font-mono text-[10px] text-primary">{String(i + 1).padStart(2, "0")}</span>
                  {j}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <p className="ed-eyebrow mb-2.5">SEO patterns</p>
            <p className="rounded bg-muted px-2.5 py-1.5 font-mono text-[11px] leading-relaxed text-foreground">{bp.seo.title}</p>
            <p className="mt-1.5 rounded bg-muted px-2.5 py-1.5 font-mono text-[11px] leading-relaxed text-muted-foreground">{bp.seo.description}</p>
            <ul className="mt-2.5 flex flex-wrap gap-1">
              {bp.seo.structuredData.map((d) => (
                <li key={d} className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{d}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="ed-eyebrow mb-2.5">Performance budget — mobile, honest</p>
            <dl className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded bg-muted/60 px-2 py-2.5">
                <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">LCP</dt>
                <dd className="mt-1 font-mono text-base font-semibold text-primary">{bp.performanceBudget.lcp}s</dd>
              </div>
              <div className="rounded bg-muted/60 px-2 py-2.5">
                <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">CLS</dt>
                <dd className="mt-1 font-mono text-base font-semibold text-primary">{bp.performanceBudget.cls}</dd>
              </div>
              <div className="rounded bg-muted/60 px-2 py-2.5">
                <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">INP</dt>
                <dd className="mt-1 font-mono text-base font-semibold text-primary">{bp.performanceBudget.inp}ms</dd>
              </div>
            </dl>
            <p className="ed-eyebrow mb-2 mt-4">Integrations</p>
            <ul className="flex flex-wrap gap-1">
              {bp.integrations.map((it) => (
                <li key={it} className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{it}</li>
              ))}
            </ul>
            <p className="ed-eyebrow mb-2 mt-4">Content fields ({bp.contentFields.length})</p>
            <p className="font-mono text-[10.5px] leading-relaxed text-muted-foreground">{bp.contentFields.join(" · ")}</p>
          </div>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <p className="ed-eyebrow mb-2.5">Accessibility contract</p>
            <ul className="flex flex-col gap-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
              {bp.accessibility.map((a) => (
                <li key={a} className="flex gap-2">
                  <Check size={12} className="mt-1 shrink-0 text-primary" aria-hidden />
                  {a}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="ed-eyebrow mb-2.5">QA checklist — {bp.qaChecklist.length} gates</p>
            <ul className="flex max-h-56 flex-col gap-1.5 overflow-y-auto pr-1 text-[12.5px] leading-relaxed text-muted-foreground">
              {bp.qaChecklist.map((q) => (
                <li key={q} className="flex gap-2">
                  <Check size={12} className="mt-1 shrink-0 text-primary" aria-hidden />
                  {q}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── the event stream console — the factory kit's ConsentGate, live. ──
   Ported from the Template Factory toolbar: analytics-class events stay
   blocked (and are visibly rewritten to consent_blocked) until the
   visitor grants consent in the site's own cookie banner. Unblocked
   events also flow into the OS pulse (/api/track). */
function EventStreamConsole() {
  const { events, consent, consentDecided, setConsent } = useFactory()

  const reset = () => {
    try {
      window.localStorage.removeItem("gos:factory-consent")
    } catch {
      /* ignore */
    }
    setConsent({ analytics: false, marketing: false }, false)
    track("cta_clicked", { factory: "consent-reset" })
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-10" aria-label="Event stream console">
      <div className="ed-card of-float-panel p-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="ed-eyebrow">Floating console 03 · events</p>
            <h2 className="ed-display text-xl">
              Consent-gated analytics — {consent.analytics ? "flowing" : "blocked"}.
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] ${
                consent.analytics ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              }`}
            >
              analytics {consent.analytics ? "granted" : "withheld"}
            </span>
            <button type="button" className="gos-btn-ghost" onClick={reset} title="Reset the consent decision — the banner returns">
              <RotateCcw size={13} aria-hidden /> Reset consent
            </button>
          </div>
        </header>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The module-built site fires the playbook&apos;s event vocabulary as you use it — every form start, call
          click, postcode check. Analytics-class events stay blocked by <b>ConsentGate</b> until the site&apos;s own
          cookie banner grants consent; unblocked events flow into the OS pulse. Interact with the site above, then
          watch this stream.
        </p>
        <ul className="of-list-scroll mt-4 max-h-72 space-y-1.5 overflow-y-auto pr-1" aria-live="polite">
          {events.length === 0 && (
            <li className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
              No events yet — scroll the site, open a form or the concierge, switch the preview locale.
            </li>
          )}
          {events.map((e) => (
            <li
              key={e.id}
              className={`flex flex-wrap items-baseline gap-x-3 gap-y-0.5 rounded-lg border px-3 py-1.5 font-mono text-[11.5px] ${
                e.name === "consent_blocked" ? "border-destructive/40 bg-destructive/5 text-destructive" : "border-border text-muted-foreground"
              }`}
            >
              <span className="text-foreground">{e.name}</span>
              {e.detail && <span className="min-w-0 flex-1 truncate">{e.detail}</span>}
              <time className="ml-auto shrink-0 opacity-60">{new Date(e.at).toLocaleTimeString()}</time>
            </li>
          ))}
        </ul>
        {!consentDecided && (
          <p className="mt-3 rounded-lg border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
            The consent banner is waiting in the site above — accept or decline it there, then compare this stream.
          </p>
        )}
      </div>
    </section>
  )
}
