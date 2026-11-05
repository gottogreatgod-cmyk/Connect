"use client"

import { ExternalLink, Eye, Layers, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SiteMeta } from "@/lib/gos/types"
import { cn } from "@/lib/utils"

interface SitesViewProps {
  sites: SiteMeta[]
  onOpen: (id: string) => void
  onDelete: (id: string) => void
}

export function SitesView({ sites, onOpen, onDelete }: SitesViewProps) {
  return (
    <div className="gos-scroll h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <h2 className="font-display text-2xl font-semibold tracking-tight">Sites library</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Every build is versioned and kept. Open one to load it into the preview and keep
            iterating on it in chat.
          </p>
        </header>

        {sites.length === 0 ? (
          <div className="gos-grid-bg flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 py-20 text-center">
            <Layers className="h-6 w-6 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">
              No sites yet — describe one in chat and it will land here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sites.map((site) => (
              <div
                key={site.id}
                className="gos-rise group flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-black/20"
              >
                {/* seed strip — a visual fingerprint of the design seed */}
                <div className="flex h-16 items-end gap-1.5 bg-gradient-to-br from-accent/40 via-muted to-background p-3">
                  <span className="h-8 w-2 rounded-full bg-primary/80" />
                  <span className="h-5 w-2 rounded-full bg-primary/50" />
                  <span className="h-10 w-2 rounded-full bg-foreground/30" />
                  <span className="h-6 w-2 rounded-full bg-primary/30" />
                  <span className="ml-auto rounded-md bg-background/70 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    v{site.version}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-4">
                  <h3 className="font-display text-base font-semibold leading-tight">{site.name}</h3>
                  <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {site.brief || "—"}
                  </p>
                  {site.designSeed?.archetype && (
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-primary/80">
                      {site.designSeed.archetype}
                    </p>
                  )}
                  <div className="mt-auto flex items-center gap-1.5 pt-3">
                    {site.score != null && (
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold",
                          site.score >= 80 ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                        )}
                      >
                        {site.score}/100
                      </span>
                    )}
                    <span className="font-mono text-[10px] text-muted-foreground/70">
                      {new Date(site.updatedAt).toLocaleDateString()}
                    </span>
                    <div className="ml-auto flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onOpen(site.id)}
                        aria-label={`Open ${site.name}`}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => onDelete(site.id)}
                        aria-label={`Delete ${site.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function SitesEmptyHint() {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <ExternalLink className="h-3 w-3" />
    </span>
  )
}
