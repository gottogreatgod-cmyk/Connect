'use client'

import * as React from 'react'
import { ImageIcon, Loader2, PencilLine, RotateCcw, Sparkles, Split, X } from 'lucide-react'
import { useBuilder } from '@/components/studio/builder-context'
import { getModule, getVariant } from '@/modules/registry'
import { SECTION_MAP } from '@/modules/sections'
import type { VariantId } from '@/modules/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

/** Parse JSON safely, converting HTML/proxy error pages into friendly errors. */
async function safeJson<T>(res: Response): Promise<T> {
  const raw = await res.text()
  try {
    return JSON.parse(raw) as T
  } catch {
    throw new Error(`Unexpected server response (HTTP ${res.status}). Please try again.`)
  }
}

export function Inspector() {
  const { instances, selectedUid, select, edit } = useBuilder()
  const selected = instances.find((instance) => instance.uid === selectedUid) ?? null
  const definition = selected ? getModule(selected.moduleId) : undefined
  const variant = selected ? getVariant(selected.moduleId, selected.variantId) : undefined
  const sectionMeta = definition ? SECTION_MAP.get(definition.section) : undefined

  if (!selected || !definition || !variant) {
    return (
      <aside
        aria-label="Inspector"
        className="flex min-h-48 flex-col items-center justify-center rounded-xl border bg-card p-6 text-center"
      >
        <PencilLine className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
        <h2 className="mt-3 text-sm font-semibold">Inspector</h2>
        <p className="mt-1.5 max-w-[16rem] text-xs text-muted-foreground">
          Select a module on the canvas to switch its design path, edit its content, or let the AI
          rewrite the copy.
        </p>
      </aside>
    )
  }

  return (
    <aside aria-label="Inspector" className="flex flex-col rounded-xl border bg-card">
      <div className="flex items-start justify-between gap-2 border-b p-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-sm font-semibold">{definition.name}</h2>
            <Badge variant="secondary" className="shrink-0 text-[10px]">
              {definition.tier}
            </Badge>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {sectionMeta?.title ?? definition.section}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={() => select(null)}
          aria-label="Close inspector"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="max-h-[70vh] space-y-5 overflow-y-auto p-4 lg:max-h-none">
        <div>
          <h3 className="flex items-center gap-1.5 text-xs font-semibold">
            <Split className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
            Design path
          </h3>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Two unique ways to build the same module. Switching keeps your content.
          </p>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            {definition.variants.map((v) => {
              const active = v.id === selected.variantId
              return (
                <button
                  key={v.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => edit({ type: 'setVariant', uid: selected.uid, variantId: v.id as VariantId })}
                  className={`rounded-lg border p-2.5 text-left transition-colors ${
                    active
                      ? 'border-emerald-600 bg-emerald-500/10'
                      : 'hover:border-emerald-500/40'
                  }`}
                >
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wide ${
                      active ? 'text-emerald-600' : 'text-muted-foreground'
                    }`}
                  >
                    Path {v.id.toUpperCase()}
                  </span>
                  <span className="mt-0.5 block text-xs font-medium">{v.label}</span>
                  <span className="mt-1 block text-[11px] leading-snug text-muted-foreground">
                    {v.description}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold">Content</h3>
            <div className="flex gap-1">
              <AiRewriteButton />
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-2 text-[11px] text-muted-foreground"
                onClick={() => edit({ type: 'resetProps', uid: selected.uid })}
                aria-label="Reset content to defaults"
              >
                <RotateCcw className="h-3 w-3" aria-hidden="true" />
                Reset
              </Button>
            </div>
          </div>
          <div className="mt-2.5 space-y-3">
            {Object.entries(selected.props).map(([key, value]) => (
              <PropField
                key={key}
                instanceUid={selected.uid}
                propKey={key}
                value={value}
                imageEditable={variant.imageProps?.includes(key) ?? false}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}

function PropField({
  instanceUid,
  propKey,
  value,
  imageEditable,
}: {
  instanceUid: string
  propKey: string
  value: unknown
  imageEditable: boolean
}) {
  const { edit } = useBuilder()
  const isComplex = typeof value !== 'string'

  if (isComplex) {
    return (
      <ComplexField
        instanceUid={instanceUid}
        propKey={propKey}
        value={value}
      />
    )
  }

  const text = String(value)
  const long = text.length > 80 || text.includes('\n')
  const isImage = imageEditable || (propKey.toLowerCase().includes('image') && /^https?:|^data:/.test(text))

  return (
    <div>
      <label htmlFor={`prop-${instanceUid}-${propKey}`} className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
        {isImage && <ImageIcon className="h-3 w-3" aria-hidden="true" />}
        {propKey}
      </label>
      {long ? (
        <Textarea
          id={`prop-${instanceUid}-${propKey}`}
          value={text}
          rows={3}
          className="mt-1 min-h-8 text-xs"
          onChange={(event) => edit({ type: 'update', uid: instanceUid, key: propKey, value: event.target.value })}
        />
      ) : (
        <Input
          id={`prop-${instanceUid}-${propKey}`}
          value={text}
          className="mt-1 h-8 text-xs"
          onChange={(event) => edit({ type: 'update', uid: instanceUid, key: propKey, value: event.target.value })}
        />
      )}
    </div>
  )
}

function ComplexField({
  instanceUid,
  propKey,
  value,
}: {
  instanceUid: string
  propKey: string
  value: unknown
}) {
  const { edit } = useBuilder()
  const [draft, setDraft] = React.useState(() => JSON.stringify(value, null, 2))
  const [error, setError] = React.useState<string | null>(null)

  // Keep the draft in sync when the underlying value changes externally
  React.useEffect(() => {
    setDraft(JSON.stringify(value, null, 2))
    setError(null)
  }, [instanceUid, propKey])

  function commit() {
    try {
      const parsed = JSON.parse(draft) as unknown
      setError(null)
      edit({ type: 'update', uid: instanceUid, key: propKey, value: parsed })
    } catch {
      setError('Invalid JSON — check quotes and brackets.')
    }
  }

  return (
    <div>
      <label htmlFor={`prop-${instanceUid}-${propKey}`} className="text-[11px] font-medium text-muted-foreground">
        {propKey} <span className="text-muted-foreground/60">(JSON)</span>
      </label>
      <Textarea
        id={`prop-${instanceUid}-${propKey}`}
        value={draft}
        rows={Math.min(10, Math.max(3, draft.split('\n').length))}
        className={`mt-1 font-mono text-[11px] ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        aria-invalid={error ? true : undefined}
      />
      {error && (
        <p role="alert" className="mt-1 text-[11px] font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

function AiRewriteButton() {
  const { instances, selectedUid, edit } = useBuilder()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const selected = instances.find((instance) => instance.uid === selectedUid)

  async function rewrite() {
    if (!selected || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'rewrite', instance: selected }),
      })
      const data = await safeJson<{ props?: Record<string, unknown>; error?: string }>(res)
      if (!res.ok || !data.props) throw new Error(data.error || 'Rewrite failed.')
      edit({ type: 'updateProps', uid: selected.uid, props: data.props })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end">
      <Button
        variant="outline"
        size="sm"
        className="h-7 gap-1 border-emerald-600/40 px-2 text-[11px] text-emerald-700 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-emerald-400"
        onClick={() => void rewrite()}
        disabled={loading || !selected}
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
        ) : (
          <Sparkles className="h-3 w-3" aria-hidden="true" />
        )}
        Improve copy
      </Button>
      {error && <p className="mt-1 max-w-40 text-right text-[10px] text-destructive">{error}</p>}
    </div>
  )
}
