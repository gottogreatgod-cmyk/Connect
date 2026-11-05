'use client'

import * as React from 'react'
import { Plus, Search } from 'lucide-react'
import { MODULES } from '@/modules/registry'
import { SECTIONS } from '@/modules/sections'
import type { ModuleDefinition, SectionId, Tier, VariantId } from '@/modules/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const TIER_STYLES: Record<Tier, string> = {
  Starter: 'bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-200',
  Growth: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
  Business: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300',
  Flagship: 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-300',
}

interface ModuleLibraryProps {
  onAdd: (moduleId: string, variantId: VariantId) => void
}

export function ModuleLibrary({ onAdd }: ModuleLibraryProps) {
  const [query, setQuery] = React.useState('')
  const [section, setSection] = React.useState<SectionId | 'all'>('all')

  const groups = React.useMemo(() => {
    const needle = query.trim().toLowerCase()
    return SECTIONS.filter((meta) => section === 'all' || meta.id === section).map((meta) => ({
      ...meta,
      modules: MODULES.filter(
        (module) =>
          module.section === meta.id &&
          (needle === '' ||
            module.name.toLowerCase().includes(needle) ||
            module.purpose.toLowerCase().includes(needle)),
      ),
    }))
  }, [query, section])

  const matchCount = groups.reduce((total, group) => total + group.modules.length, 0)

  return (
    <aside
      aria-label="Module library"
      className="flex flex-col rounded-xl border bg-card"
    >
      <div className="space-y-3 border-b p-4">
        <div>
          <h2 className="text-sm font-semibold">Module library</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {MODULES.length} live modules · every module has 2 design paths
          </p>
        </div>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <label htmlFor="module-search" className="sr-only">
            Search modules
          </label>
          <Input
            id="module-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or purpose"
            className="h-9 pl-8 text-xs"
          />
        </div>
        <Select value={section} onValueChange={(v) => setSection(v as SectionId | 'all')}>
          <SelectTrigger className="h-9 text-xs" aria-label="Filter by section">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sections</SelectItem>
            {SECTIONS.map((meta) => (
              <SelectItem key={meta.id} value={meta.id}>
                {meta.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-[11px] text-muted-foreground" aria-live="polite">
          {matchCount} {matchCount === 1 ? 'module' : 'modules'} shown
        </p>
      </div>

      <div className="max-h-[60vh] overflow-y-auto p-4 lg:max-h-none lg:flex-1">
        {matchCount === 0 && (
          <p className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
            No modules match that search. Try a different word.
          </p>
        )}
        <div className="space-y-6">
          {groups
            .filter((group) => group.modules.length > 0)
            .map((group) => (
              <section key={group.id} aria-labelledby={`library-${group.id}`}>
                <h3
                  id={`library-${group.id}`}
                  className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                >
                  {group.title}
                </h3>
                <ul className="mt-2.5 space-y-2.5">
                  {group.modules.map((module) => (
                    <li key={module.id}>
                      <ModuleCard module={module} onAdd={onAdd} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
        </div>
      </div>
    </aside>
  )
}

function ModuleCard({ module, onAdd }: { module: ModuleDefinition; onAdd: (moduleId: string, variantId: VariantId) => void }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3 transition-colors hover:border-emerald-500/40 hover:bg-background">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold">{module.name}</p>
          <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{module.purpose}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${TIER_STYLES[module.tier]}`}
        >
          {module.tier}
        </span>
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-1.5">
        {module.variants.map((variant) => (
          <Button
            key={variant.id}
            type="button"
            size="sm"
            variant="outline"
            className="h-auto flex-col items-start gap-0 px-2.5 py-1.5 text-left"
            onClick={() => onAdd(module.id, variant.id)}
            aria-label={`Add ${module.name} — path ${variant.id.toUpperCase()}: ${variant.label}`}
          >
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Path {variant.id.toUpperCase()}
            </span>
            <span className="w-full truncate text-[11px] font-medium">{variant.label}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
