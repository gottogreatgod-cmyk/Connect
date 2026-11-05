'use client'

import * as React from 'react'
import { BookOpen, Check, Plus, Search, Split } from 'lucide-react'
import { PLAYBOOK_CATALOG, PLAYBOOK_STATS, type PlaybookEntry } from '@/data/playbook-catalog'
import { useBuilder } from '@/components/studio/builder-context'
import { SECTIONS, SECTION_MAP } from '@/modules/sections'
import type { SectionId, Tier, VariantId } from '@/modules/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/**
 * Playbook entries that are implemented as live studio modules. Values are
 * [moduleId, variantId] — the variant the playbook design maps onto, when the
 * correspondence is specific.
 */
const LIVE_MODULE_MAP: Record<string, [string, VariantId?]> = {
  SiteHeader: ['site-header'],
  AnnouncementBar: ['announcement-bar'],
  SiteFooter: ['site-footer'],
  HeroEditorial: ['hero', 'a'],
  HeroSplit: ['hero', 'b'],
  BenefitGrid: ['benefit-grid'],
  HowItWorks: ['how-it-works'],
  ProcessTimeline: ['how-it-works', 'b'],
  PricingTable: ['pricing-table'],
  ComparisonTable: ['pricing-table', 'b'],
  TrustBar: ['trust-bar'],
  LogoCloud: ['trust-bar', 'b'],
  ResultsStatStrip: ['trust-bar', 'a'],
  ReviewCarousel: ['review-carousel'],
  ReviewWall: ['review-carousel', 'b'],
  ContactForm: ['contact-form'],
  NewsletterSignup: ['newsletter-signup'],
  ProductGrid: ['product-grid'],
  ProductCard: ['product-grid', 'a'],
  BookingCalendar: ['booking-panel', 'a'],
  AppointmentRequest: ['booking-panel', 'b'],
  MultiStepIntake: ['multi-step-form', 'a'],
  FormField: ['multi-step-form'],
  LocationCard: ['location-card'],
  HoursTable: ['hours-table'],
  FAQAccordion: ['faq-accordion'],
  TeamGrid: ['team-grid'],
  MenuBoard: ['menu-board'],
  ListingCard: ['listing-card'],
  VehicleGrid: ['vehicle-showcase', 'b'],
  VehicleDetail: ['vehicle-showcase', 'a'],
  CourseCard: ['course-list', 'a'],
  EventCard: ['event-lineup', 'a'],
  IntegrationGrid: ['integration-cloud', 'a'],
  IntegrationDirectory: ['integration-cloud'],
  ComplianceCenter: ['compliance-panel'],
  DisclosurePanel: ['compliance-panel', 'a'],
  MissionHero: ['mission-panel', 'a'],
  ImpactMetrics: ['mission-panel', 'b'],
  TabbedShowcase: ['interactive-tabs', 'a'],
  TiltCard: ['interactive-tabs', 'b'],
}

const TIER_STYLES: Record<Tier, string> = {
  Starter: 'bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-200',
  Growth: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
  Business: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300',
  Flagship: 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-300',
}

const PAGE_SIZE = 48

export function PlaybookView() {
  const { addModule } = useBuilder()
  const [query, setQuery] = React.useState('')
  const [section, setSection] = React.useState<SectionId | 'all'>('all')
  const [tier, setTier] = React.useState<Tier | 'all'>('all')
  const [liveOnly, setLiveOnly] = React.useState(false)
  const [visible, setVisible] = React.useState(PAGE_SIZE)

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase()
    return PLAYBOOK_CATALOG.filter((entry) => {
      if (section !== 'all' && entry.sectionId !== section) return false
      if (tier !== 'all' && entry.tier !== tier) return false
      if (liveOnly && !(entry.name in LIVE_MODULE_MAP)) return false
      if (needle === '') return true
      return (
        entry.name.toLowerCase().includes(needle) ||
        entry.purpose.toLowerCase().includes(needle) ||
        entry.features.toLowerCase().includes(needle)
      )
    })
  }, [query, section, tier, liveOnly])

  const shown = filtered.slice(0, visible)

  return (
    <div className="space-y-5">
      <section className="rounded-xl border bg-card p-5" aria-labelledby="playbook-heading">
        <div className="flex flex-wrap items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 id="playbook-heading" className="text-lg font-semibold">
              The Modules Playbook
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              The full build standard behind the studio: every module with its conversion purpose,
              its production rule, and the two design paths it can take. Entries marked{' '}
              <span className="font-medium text-emerald-700 dark:text-emerald-400">Live</span> are
              implemented in the Studio — add either path straight to your page.
            </p>
          </div>
          <dl className="grid grid-cols-5 gap-2 text-center">
            {[
              { value: PLAYBOOK_STATS.modules, label: 'modules' },
              { value: PLAYBOOK_STATS.sections, label: 'sections' },
              { value: PLAYBOOK_STATS.starter, label: 'starter' },
              { value: PLAYBOOK_STATS.growth, label: 'growth' },
              { value: PLAYBOOK_STATS.flagship, label: 'flagship' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg border bg-muted/30 px-2.5 py-1.5">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                  {stat.value}
                </dd>
                <dd className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
        <div className="min-w-44 flex-1">
          <label htmlFor="playbook-search" className="text-xs font-medium">
            Search
          </label>
          <div className="relative mt-1.5">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="playbook-search"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setVisible(PAGE_SIZE)
              }}
              placeholder="Search 344 modules…"
              className="h-9 pl-8 text-xs"
            />
          </div>
        </div>
        <div className="w-44">
          <label htmlFor="playbook-section" className="text-xs font-medium">
            Section
          </label>
          <Select
            value={section}
            onValueChange={(v) => {
              setSection(v as SectionId | 'all')
              setVisible(PAGE_SIZE)
            }}
          >
            <SelectTrigger id="playbook-section" className="mt-1.5 h-9 text-xs">
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
        </div>
        <div className="w-36">
          <label htmlFor="playbook-tier" className="text-xs font-medium">
            Tier
          </label>
          <Select
            value={tier}
            onValueChange={(v) => {
              setTier(v as Tier | 'all')
              setVisible(PAGE_SIZE)
            }}
          >
            <SelectTrigger id="playbook-tier" className="mt-1.5 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tiers</SelectItem>
              <SelectItem value="Starter">Starter</SelectItem>
              <SelectItem value="Growth">Growth</SelectItem>
              <SelectItem value="Business">Business</SelectItem>
              <SelectItem value="Flagship">Flagship</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <label className="flex items-center gap-2 pb-2 text-xs">
          <Switch
            checked={liveOnly}
            onCheckedChange={(v) => {
              setLiveOnly(v)
              setVisible(PAGE_SIZE)
            }}
            aria-label="Show only live modules"
          />
          Live in studio only
        </label>
        <p className="pb-2 text-xs text-muted-foreground" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          No playbook entries match those filters.
        </p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {shown.map((entry) => (
              <PlaybookCard key={entry.id} entry={entry} onAdd={addModule} />
            ))}
          </div>
          {visible < filtered.length && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                Show more ({filtered.length - visible} remaining)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function PlaybookCard({
  entry,
  onAdd,
}: {
  entry: PlaybookEntry
  onAdd: (moduleId: string, variantId?: VariantId) => void
}) {
  const sectionMeta = SECTION_MAP.get(entry.sectionId)
  const live = LIVE_MODULE_MAP[entry.name]

  return (
    <article className="flex flex-col rounded-xl border bg-card p-4" aria-label={entry.name}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="truncate font-mono text-sm font-semibold">{entry.name}</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{sectionMeta?.title}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${TIER_STYLES[entry.tier]}`}>
            {entry.tier}
          </span>
          {live && (
            <Badge
              variant="secondary"
              className="gap-1 border border-emerald-500/30 bg-emerald-500/10 px-1.5 text-[10px] text-emerald-700 dark:text-emerald-300"
            >
              <Check className="h-2.5 w-2.5" aria-hidden="true" />
              Live
            </Badge>
          )}
        </div>
      </div>

      <p className="mt-2.5 text-xs leading-snug text-muted-foreground">{entry.purpose}</p>
      {entry.rule && (
        <p className="mt-2 border-l-2 border-emerald-500/40 pl-2.5 text-[11px] italic leading-snug text-muted-foreground">
          {entry.rule}
        </p>
      )}

      <div className="mt-3 space-y-1.5 rounded-lg bg-muted/40 p-2.5">
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          <Split className="h-3 w-3" aria-hidden="true" />
          Two design paths
        </p>
        {sectionMeta?.paths.map((path, index) => (
          <p key={path.label} className="text-[11px] leading-snug">
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              Path {index === 0 ? 'A' : 'B'} · {path.label}:
            </span>{' '}
            <span className="text-muted-foreground">{path.description}</span>
          </p>
        ))}
      </div>

      {live && (
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 text-[11px]"
            onClick={() => onAdd(live[0], live[1] ?? 'a')}
          >
            <Plus className="h-3 w-3" aria-hidden="true" />
            Add path {live[1] === 'b' ? 'B' : 'A'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 text-[11px]"
            onClick={() => onAdd(live[0], live[1] === 'b' ? 'a' : 'b')}
          >
            <Plus className="h-3 w-3" aria-hidden="true" />
            Add other path
          </Button>
        </div>
      )}
    </article>
  )
}
