'use client'

import { ArrowDown, ArrowUp, LayoutTemplate, Pencil, Split, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { useBuilder } from '@/components/studio/builder-context'
import { getModule, getVariant } from '@/modules/registry'

export function PageCanvas() {
  const { instances, selectedUid, select, edit } = useBuilder()

  if (instances.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl border border-dashed bg-card/50 p-10 text-center">
        <LayoutTemplate className="h-9 w-9 text-muted-foreground" aria-hidden="true" />
        <h2 className="mt-4 text-lg font-semibold">Your page is empty</h2>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          Add modules from the library, or let the AI Copilot build the whole page from a brief.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {instances.map((instance, index) => {
        const definition = getModule(instance.moduleId)
        const variant = getVariant(instance.moduleId, instance.variantId)
        if (!definition || !variant) return null
        const Component = variant.component
        const selected = instance.uid === selectedUid

        return (
          <article
            key={instance.uid}
            aria-label={definition.name}
            onClick={() => select(instance.uid)}
            className={`overflow-hidden rounded-xl bg-white transition-shadow ${
              selected
                ? 'ring-2 ring-emerald-600 ring-offset-4 ring-offset-background dark:ring-offset-background'
                : 'ring-1 ring-border hover:ring-muted-foreground/40'
            }`}
          >
            <header className="flex items-center justify-between gap-2 border-b border-stone-200 bg-stone-900 px-3 py-1.5 text-white">
              <p className="flex min-w-0 items-center gap-2 text-[11px] font-medium">
                <span className="text-stone-500">{String(index + 1).padStart(2, '0')}</span>
                <span className="truncate">{definition.name}</span>
                <span className="hidden shrink-0 items-center gap-1 rounded-full bg-emerald-900/80 px-2 py-0.5 text-[10px] text-emerald-200 sm:inline-flex">
                  <Split className="h-2.5 w-2.5" aria-hidden="true" />
                  Path {variant.id.toUpperCase()} · {variant.label}
                </span>
              </p>
              <div className="flex shrink-0 items-center gap-0.5">
                <CanvasIconButton
                  label={`Move ${definition.name} up`}
                  disabled={index === 0}
                  onClick={() => edit({ type: 'move', uid: instance.uid, direction: -1 })}
                >
                  <ArrowUp className="h-3 w-3" aria-hidden="true" />
                </CanvasIconButton>
                <CanvasIconButton
                  label={`Move ${definition.name} down`}
                  disabled={index === instances.length - 1}
                  onClick={() => edit({ type: 'move', uid: instance.uid, direction: 1 })}
                >
                  <ArrowDown className="h-3 w-3" aria-hidden="true" />
                </CanvasIconButton>
                <CanvasIconButton label={`Edit ${definition.name}`} onClick={() => select(instance.uid)}>
                  <Pencil className="h-3 w-3" aria-hidden="true" />
                </CanvasIconButton>
                <CanvasIconButton
                  label={`Remove ${definition.name}`}
                  tone="danger"
                  onClick={() => edit({ type: 'remove', uid: instance.uid })}
                >
                  <Trash2 className="h-3 w-3" aria-hidden="true" />
                </CanvasIconButton>
              </div>
            </header>
            {/* The module renders as a light "website preview" — isolate it from dark mode */}
            <div className="bg-white text-stone-900 [color-scheme:light]">
              <Component {...instance.props} />
            </div>
          </article>
        )
      })}
    </div>
  )
}

interface CanvasIconButtonProps {
  label: string
  onClick: () => void
  children: ReactNode
  disabled?: boolean
  tone?: 'default' | 'danger'
}

function CanvasIconButton({ label, onClick, children, disabled = false, tone = 'default' }: CanvasIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
      className={`rounded-md p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-40 ${
        tone === 'danger'
          ? 'text-rose-300 hover:bg-rose-900 hover:text-white'
          : 'text-stone-300 hover:bg-stone-700 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}
