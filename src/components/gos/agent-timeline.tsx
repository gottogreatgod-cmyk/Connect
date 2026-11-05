"use client"

import { Check, ChevronDown, CircleAlert, Loader2 } from "lucide-react"
import { useState } from "react"
import type { AgentStep } from "@/lib/gos/types"
import { cn } from "@/lib/utils"

export function AgentTimeline({
  steps,
  live = false,
}: {
  steps: AgentStep[]
  live?: boolean
}) {
  const [open, setOpen] = useState(true)

  if (steps.length === 0) return null

  const activeCount = steps.filter((s) => s.status === "active").length

  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-border/70 bg-background/60">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-muted/40"
        aria-expanded={open}
      >
        <ChevronDown
          className={cn("h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform", !open && "-rotate-90")}
        />
        <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          {live ? "engine running" : "agent run"} · {steps.length} step{steps.length === 1 ? "" : "s"}
          {live && activeCount > 0 && ` · ${activeCount} active`}
        </span>
        {live && (
          <span className="ml-auto flex items-center gap-1">
            <span className="gos-pulse-dot h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="gos-pulse-dot h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="gos-pulse-dot h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
        )}
      </button>
      {open && (
        <ol className="border-t border-border/70 px-3 py-2">
          {steps.map((step) => (
            <li key={step.id} className="flex items-start gap-2.5 py-1.5">
              <span className="mt-0.5 shrink-0">
                {step.status === "done" ? (
                  <Check className="h-3.5 w-3.5 text-primary" />
                ) : step.status === "error" ? (
                  <CircleAlert className="h-3.5 w-3.5 text-destructive" />
                ) : (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs text-foreground/90">{step.label}</p>
                {step.detail && (
                  <p
                    className={cn(
                      "font-mono text-[11px] text-muted-foreground",
                      step.status === "active" && "text-primary/90",
                    )}
                  >
                    {step.detail}
                  </p>
                )}
              </div>
              {step.ms != null && (
                <span className="shrink-0 font-mono text-[10px] text-muted-foreground/70">
                  {(step.ms / 1000).toFixed(1)}s
                </span>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
