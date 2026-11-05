"use client"

import { useCallback, useEffect, useState } from "react"
import { Clapperboard, ImageIcon, Loader2, Volume2 } from "lucide-react"
import type { MediaRef } from "@/lib/gos/types"
import { cn } from "@/lib/utils"

/**
 * Renders one generated media asset. Images and audio stream straight from
 * /api/media/:id?raw=1; pending videos poll until the render completes.
 * Parents key this component by media.id, so a new asset remounts it.
 */
export function MediaBlock({ media, compact }: { media: MediaRef; compact?: boolean }) {
  const [overrideUrl, setOverrideUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const url = overrideUrl ?? media.url ?? null
  const [polling, setPolling] = useState(media.kind === "video" && !url)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/media/${media.id}`)
      if (!res.ok) return
      const data = (await res.json()) as { url: string | null; status: string }
      if (data.url) {
        setOverrideUrl(data.url)
        setPolling(false)
      } else if (data.status === "failed") {
        setFailed(true)
        setPolling(false)
      }
    } catch {
      /* keep polling */
    }
  }, [media.id])

  useEffect(() => {
    if (!polling) return
    const kickoff = setTimeout(refresh, 100)
    const interval = setInterval(refresh, 8000)
    return () => {
      clearTimeout(kickoff)
      clearInterval(interval)
    }
  }, [polling, refresh])

  // ── video ───────────────────────────────────────────────────────────────
  if (media.kind === "video") {
    if (!url) {
      if (failed) {
        return (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-xs text-destructive">
            The render failed on the farm&apos;s side — try a simpler scene.
          </div>
        )
      }
      return (
        <div className="flex items-center gap-2.5 rounded-lg border border-primary/25 bg-accent/40 px-3.5 py-3">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">Rendering “{media.prompt || "your clip"}”…</p>
            <p className="font-mono text-[10px] text-muted-foreground">
              the render farm is working — this updates itself
            </p>
          </div>
        </div>
      )
    }
    return (
      <figure className="overflow-hidden rounded-xl border border-border/70 bg-card">
        <video
          src={url}
          controls
          playsInline
          className={cn("w-full bg-black", compact ? "max-h-64" : "max-h-[420px]", "object-contain")}
        />
        <figcaption className="flex items-center gap-1.5 border-t border-border/60 px-3 py-2">
          <Clapperboard className="h-3 w-3 shrink-0 text-primary/70" />
          <span className="truncate font-mono text-[10px] text-muted-foreground">{media.prompt}</span>
        </figcaption>
      </figure>
    )
  }

  // ── audio ───────────────────────────────────────────────────────────────
  if (media.kind === "audio") {
    return (
      <figure className="rounded-xl border border-border/70 bg-card p-3">
        <div className="mb-2 flex items-center gap-1.5">
          <Volume2 className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="truncate font-mono text-[10px] text-muted-foreground">{media.prompt}</span>
        </div>
        <audio src={`/api/media/${media.id}?raw=1`} controls preload="metadata" className="w-full" />
      </figure>
    )
  }

  // ── image ───────────────────────────────────────────────────────────────
  return (
    <figure className="overflow-hidden rounded-xl border border-border/70 bg-card">
      <img
        src={`/api/media/${media.id}?raw=1`}
        alt={media.prompt || "Generated image"}
        className={cn("w-full object-cover", compact ? "max-h-64" : "max-h-[420px]")}
      />
      <figcaption className="flex items-center gap-1.5 border-t border-border/60 px-3 py-2">
        <ImageIcon className="h-3 w-3 shrink-0 text-primary/70" />
        <span className="truncate font-mono text-[10px] text-muted-foreground">{media.prompt}</span>
      </figcaption>
    </figure>
  )
}
