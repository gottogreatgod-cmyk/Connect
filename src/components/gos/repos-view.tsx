"use client"

import { Boxes, Github, Layers3, Workflow } from "lucide-react"
import { REPO_INTEGRATIONS, SYSTEM_LAYERS } from "@/lib/gos/repos"
import { cn } from "@/lib/utils"

export function ReposView() {
  return (
    <div className="gos-scroll h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-5xl space-y-10">
        {/* ── system layers ── */}
        <section aria-labelledby="layers-heading">
          <header className="mb-5">
            <div className="flex items-center gap-2">
              <Workflow className="h-5 w-5 text-primary" />
              <h2 id="layers-heading" className="font-display text-2xl font-semibold tracking-tight">
                System architecture
              </h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              The seven layers of Growth OS — every message travels down this stack and back.
            </p>
          </header>
          <ol className="relative space-y-3 border-l border-border/70 pl-6">
            {SYSTEM_LAYERS.map((layer, i) => (
              <li key={layer.id} className="gos-rise relative" style={{ animationDelay: `${i * 60}ms` }}>
                <span className="absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full border border-primary/40 bg-background font-mono text-[10px] text-primary">
                  {i + 1}
                </span>
                <div className="rounded-xl border border-border/70 bg-card p-4 transition-colors hover:border-primary/30">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="font-display text-base font-semibold">{layer.name}</h3>
                    <p className="font-mono text-[11px] text-primary/90">{layer.implemented}</p>
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{layer.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ── repo integrations ── */}
        <section aria-labelledby="repos-heading">
          <header className="mb-5">
            <div className="flex items-center gap-2">
              <Boxes className="h-5 w-5 text-primary" />
              <h2 id="repos-heading" className="font-display text-2xl font-semibold tracking-tight">
                Integrated repos
              </h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              The skill layer draws from these cloned repositories — each contributes specific
              capabilities to the loop, nothing is decorative.
            </p>
          </header>
          <div className="grid gap-4 md:grid-cols-2">
            {REPO_INTEGRATIONS.map((repo, i) => (
              <article
                key={repo.id}
                className="gos-rise group rounded-xl border border-border/70 bg-card p-4 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-black/20"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 bg-muted/50">
                      <Github className="h-4 w-4 text-muted-foreground" />
                    </span>
                    <div>
                      <h3 className="font-mono text-sm font-semibold leading-none">{repo.repo}</h3>
                      <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                        {repo.layer}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold uppercase",
                      repo.status === "active"
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {repo.status}
                  </span>
                </div>
                <p className="mt-3 text-[13px] font-medium text-foreground/90">{repo.role}</p>
                <ul className="mt-2 space-y-1">
                  {repo.contributes.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                      {c}
                    </li>
                  ))}
                </ul>
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground transition-colors hover:text-primary"
                >
                  <Layers3 className="h-3 w-3" />
                  {repo.url.replace("https://github.com/", "")}
                </a>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
