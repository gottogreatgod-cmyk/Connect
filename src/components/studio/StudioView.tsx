'use client'

import * as React from 'react'
import {
  Check,
  ChevronDown,
  FileText,
  Loader2,
  Save,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useBuilder } from '@/components/studio/builder-context'
import { CopilotPanel } from '@/components/studio/CopilotPanel'
import { Inspector } from '@/components/studio/Inspector'
import { ModuleLibrary } from '@/components/studio/ModuleLibrary'
import { PageCanvas } from '@/components/studio/PageCanvas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function splitIntoChunks(text: string, maxLength = 900): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text]
  const chunks: string[] = []
  let current = ''
  for (const sentence of sentences) {
    if ((current + sentence).length <= maxLength) {
      current += sentence
    } else {
      if (current.trim()) chunks.push(current.trim())
      current = sentence.length > maxLength ? sentence.slice(0, maxLength) : sentence
    }
  }
  if (current.trim()) chunks.push(current.trim())
  return chunks
}

function SpeakButton() {
  const { getPageText } = useBuilder()
  const [playing, setPlaying] = React.useState(false)
  const stopRef = React.useRef(false)

  async function speak() {
    if (playing) {
      stopRef.current = true
      return
    }
    const text = getPageText().slice(0, 4000)
    if (!text.trim()) return
    stopRef.current = false
    setPlaying(true)
    try {
      const chunks = splitIntoChunks(text)
      for (const chunk of chunks) {
        if (stopRef.current) break
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: chunk, voice: 'jam' }),
        })
        if (!res.ok) break
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        await new Promise<void>((resolve) => {
          const audio = new Audio(url)
          audio.onended = () => {
            URL.revokeObjectURL(url)
            resolve()
          }
          audio.onerror = () => {
            URL.revokeObjectURL(url)
            resolve()
          }
          void audio.play()
        })
      }
    } finally {
      setPlaying(false)
      stopRef.current = false
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5"
      onClick={() => void speak()}
      aria-label={playing ? 'Stop reading the page aloud' : 'Hear this page read aloud'}
    >
      {playing ? (
        <>
          <VolumeX className="h-3.5 w-3.5" aria-hidden="true" />
          Stop
        </>
      ) : (
        <>
          <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
          Hear page
        </>
      )}
    </Button>
  )
}

export function StudioView() {
  const {
    instances,
    pageName,
    setPageName,
    save,
    saveStatus,
    savedPageId,
    pages,
    loadingPages,
    loadPage,
    deletePage,
    resetToStarter,
    addModule,
    edit,
  } = useBuilder()

  const statusText = {
    idle: savedPageId ? 'Save to keep your latest changes' : 'This page has not been saved yet',
    saving: 'Saving…',
    saved: 'All changes saved',
    error: 'Could not save. Please try again.',
  }[saveStatus]

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5 rounded-xl border bg-card p-3">
        <div className="flex min-w-48 flex-1 items-center gap-2 sm:max-w-xs">
          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <label htmlFor="page-name" className="sr-only">
            Page name
          </label>
          <Input
            id="page-name"
            value={pageName}
            onChange={(event) => setPageName(event.target.value)}
            className="h-9 text-sm"
            placeholder="Page name"
            maxLength={80}
          />
        </div>

        <p
          className="order-last w-full text-xs text-muted-foreground sm:order-none sm:w-auto"
          role="status"
          aria-live="polite"
        >
          {saveStatus === 'saved' && (
            <Check className="mr-1 inline h-3 w-3 text-emerald-600" aria-hidden="true" />
          )}
          {statusText}
        </p>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <SpeakButton />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                {loadingPages ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                My pages
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Saved pages</DropdownMenuLabel>
              {pages.length === 0 && (
                <p className="px-2 py-1.5 text-xs text-muted-foreground">
                  Nothing saved yet — build a page and save it.
                </p>
              )}
              {pages.map((page) => (
                <DropdownMenuItem
                  key={page.id}
                  className="flex cursor-pointer items-center justify-between gap-2"
                  onSelect={() => void loadPage(page.id)}
                >
                  <span className="min-w-0 flex-1 truncate text-xs">
                    {page.name}
                    {page.id === savedPageId && (
                      <Check className="ml-1 inline h-3 w-3 text-emerald-600" aria-hidden="true" />
                    )}
                  </span>
                  <button
                    type="button"
                    aria-label={`Delete ${page.name}`}
                    className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    onClick={(event) => {
                      event.preventDefault()
                      void deletePage(page.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3" aria-hidden="true" />
                  </button>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-xs" onSelect={() => resetToStarter()}>
                New starter page
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => void save()}
            disabled={saveStatus === 'saving' || instances.length === 0}
          >
            {saveStatus === 'saving' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            Save page
          </Button>
        </div>
      </div>

      <CopilotPanel />

      {/* 3-pane builder */}
      <div className="grid gap-5 lg:grid-cols-[17rem_minmax(0,1fr)_19rem]">
        <div className="order-2 lg:order-1 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-hidden">
          <ModuleLibrary onAdd={addModule} />
        </div>
        <main className="order-1 min-w-0 lg:order-2" aria-label="Page canvas">
          <PageCanvas />
        </main>
        <div className="order-3 lg:sticky lg:top-20 lg:self-start">
          <Inspector />
        </div>
      </div>

      {/* Screen-reader / small-screen helper: clear all */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs text-muted-foreground"
          onClick={() => {
            if (instances.length === 0) return
            if (window.confirm('Remove every module from this page?')) {
              edit({ type: 'clear' })
            }
          }}
          disabled={instances.length === 0}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Clear page
        </Button>
      </div>
    </div>
  )
}
