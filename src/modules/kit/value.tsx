'use client'

/**
 * Value & explanation modules:
 * ServiceCardGrid · ProcessTimeline · ComparisonTable · CostCalculator ·
 * QuoteCalculator · FinancingCalculator · Configurator · PersonalizedRecommendations
 */

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Check, ArrowRight, Wrench, Flame, Droplets, Thermometer, Wind, Snowflake, Sparkles, Gauge, Filter } from 'lucide-react'
import { ModuleTag } from './primitives'
import { useFactory } from '@/factory/store'
import type { ServiceItem } from '@/factory/types'
import { cn } from '@/lib/utils'

/* ---------------------------------- ServiceCardGrid ---------------------------------- */
export function ServiceCardGrid({
  services,
  ctaLabel = 'Get a fixed quote',
  ctaHref = '#quote',
}: {
  services: ServiceItem[]
  ctaLabel?: string
  ctaHref?: string
}) {
  const track = useFactory((s) => s.track)
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    Droplets, Flame, Wrench, Thermometer, Wind, Snowflake, Sparkles, Gauge,
  }
  return (
    <div className="grid gap-4 @min-[640px]:grid-cols-2 @min-[1024px]:grid-cols-3">
      {services.map((s) => {
        const Icon = icons[s.icon] ?? Wrench
        return (
          <Card key={s.id} className={cn('group relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg', s.urgent && 'border-amber-500/50')}>
            <ModuleTag ids={s.id === services[0].id ? ['ServiceCardGrid@1'] : []} />
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:scale-105">
                  <Icon className="h-5 w-5" />
                </span>
                {s.urgent && <Badge className="bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 dark:text-amber-400">24/7</Badge>}
              </div>
              <h3 className="mt-4 text-base font-bold">{s.name}</h3>
              <p className="mt-1.5 min-h-10 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <p className="text-sm">
                  <span className="text-muted-foreground">from</span>{' '}
                  <span className="text-lg font-black text-primary">€{s.priceFrom}</span>{' '}
                  <span className="text-xs text-muted-foreground">{s.unit}</span>
                </p>
                <Button
                  asChild
                  size="sm"
                  variant="ghost"
                  className="gap-1 text-primary"
                  onClick={() => track('cta_clicked', `service:${s.id}`)}
                >
                  <a href={ctaHref}>
                    {ctaLabel.split(' ')[0]} <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

/* ---------------------------------- ProcessTimeline ---------------------------------- */
export function ProcessTimeline({ steps }: { steps: { title: string; detail: string; duration: string }[] }) {
  return (
    <ol className="relative mx-auto max-w-3xl space-y-8 before:absolute before:left-5 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-border @min-[768px]:before:left-6">
      {steps.map((step, i) => (
        <li key={step.title} className="relative flex gap-5 pl-0">
          <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background text-sm font-black text-primary @min-[768px]:h-12 @min-[768px]:w-12">
            {i + 1}
          </span>
          <div className="pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold">{step.title}</h3>
              <Badge variant="secondary" className="text-[10px]">{step.duration}</Badge>
            </div>
            <p className="mt-1 max-w-lg text-sm leading-relaxed text-muted-foreground">{step.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

/* ---------------------------------- ComparisonTable ---------------------------------- */
export function ComparisonTable({
  columns,
  rows,
}: {
  columns: { name: string; popular?: boolean; note?: string }[]
  rows: { label: string; values: (string | boolean)[] }[]
}) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Specification</th>
            {columns.map((c) => (
              <th key={c.name} className={cn('px-4 py-3 text-center font-bold', c.popular && 'bg-primary/10 text-primary')}>
                <span className="block">{c.name}</span>
                {c.popular && <span className="text-[10px] font-semibold uppercase tracking-wider">Most chosen</span>}
                {!c.popular && c.note && <span className="text-[10px] font-normal text-muted-foreground">{c.note}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.label} className={cn(i % 2 === 1 && 'bg-muted/20')}>
              <td className="px-4 py-3 font-medium">{row.label}</td>
              {row.values.map((v, j) => (
                <td key={j} className={cn('px-4 py-3 text-center', columns[j]?.popular && 'bg-primary/5')}>
                  {typeof v === 'boolean' ? (
                    v ? (
                      <Check className="mx-auto h-4 w-4 text-emerald-500" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )
                  ) : (
                    <span className="font-medium">{v}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ---------------------------------- CostCalculator ---------------------------------- */
export function CostCalculator({
  title,
  fields,
  calc,
  ctaLabel,
  ctaHref,
  moduleTag = 'CostCalculator@2',
}: {
  title: string
  fields: 'hvac-sizing'
  calc: (inputs: { size: number; type: string; efficiency: string }) => { min: number; max: number; note: string }
  ctaLabel: string
  ctaHref: string
  moduleTag?: string
}) {
  const [size, setSize] = React.useState(140)
  const [type, setType] = React.useState('heat-pump')
  const [efficiency, setEfficiency] = React.useState('standard')
  const result = calc({ size, type, efficiency })
  const track = useFactory((s) => s.track)
  return (
    <Card className="overflow-hidden">
      <ModuleTag ids={[moduleTag]} />
      <CardContent className="grid gap-8 p-6 @min-[768px]:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <h3 className="text-lg font-bold">{title}</h3>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label htmlFor="cc-size">Living area</Label>
              <span className="font-mono text-sm font-bold text-primary">{size} m²</span>
            </div>
            <Slider id="cc-size" min={60} max={320} step={10} value={[size]} onValueChange={([v]) => setSize(v)} />
          </div>
          <div className="grid gap-4 @min-[640px]:grid-cols-2">
            <div className="space-y-2">
              <Label>System type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger aria-label="System type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="heat-pump">Heat pump</SelectItem>
                  <SelectItem value="gas-condensing">Gas condensing</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Efficiency class</Label>
              <Select value={efficiency} onValueChange={setEfficiency}>
                <SelectTrigger aria-label="Efficiency class"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="premium">Premium (+8%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li>· Estimate includes standard installation &amp; commissioning</li>
            <li>· Assumptions: ceiling height 2.5 m, insulated building (post-1990)</li>
            <li>· Final quote after on-site survey — no obligation</li>
          </ul>
        </div>
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-dashed bg-muted/30 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estimated investment</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-primary">
              €{result.min.toLocaleString('en-IE')}
              <span className="mx-1 text-lg text-muted-foreground">–</span>
              €{result.max.toLocaleString('en-IE')}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{result.note}</p>
          </div>
          <Button asChild onClick={() => track('quote_completed', 'cost-calculator')}>
            <a href={ctaHref}>{ctaLabel}</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/* ---------------------------------- QuoteCalculator (lighter) ---------------------------------- */
export function QuoteCalculator({
  title,
  description,
  calc,
}: {
  title: string
  description: string
  calc: (sqft: number) => { min: number; max: number }
}) {
  const [sqft, setSqft] = React.useState(120)
  const [email, setEmail] = React.useState('')
  const [sent, setSent] = React.useState(false)
  const r = calc(sqft)
  return (
    <Card>
      <ModuleTag ids={['QuoteCalculator@3']} />
      <CardContent className="p-6">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        <div className="mt-5 grid items-end gap-4 @min-[640px]:grid-cols-[1fr_1fr_auto]">
          <div className="space-y-2">
            <Label htmlFor="qc-area">Area (m²)</Label>
            <Input id="qc-area" type="number" min={40} max={400} value={sqft} onChange={(e) => setSqft(Number(e.target.value) || 0)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qc-email">Email for the estimate</Label>
            <Input id="qc-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button
            disabled={!email.includes('@')}
            onClick={() => {
              useFactory.getState().track('quote_completed', 'quote-calculator')
              setSent(true)
            }}
          >
            Calculate
          </Button>
        </div>
        <div className="mt-5 rounded-xl border border-dashed bg-muted/30 p-4">
          {sent ? (
            <p className="text-sm">
              Estimate sent to <span className="font-semibold">{email}</span> — projected budget{' '}
              <span className="font-black text-primary">€{r.min.toLocaleString()}–€{r.max.toLocaleString()}</span> (demo, no email actually sent).
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Instant budget range: <span className="font-bold text-foreground">€{r.min.toLocaleString()}–€{r.max.toLocaleString()}</span> · updated live as you type
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/* ---------------------------------- FinancingCalculator ---------------------------------- */
export function FinancingCalculator({ maxAmount = 30000, defaultAmount = 12000, apr = 6.9 }: { maxAmount?: number; defaultAmount?: number; apr?: number }) {
  const [amount, setAmount] = React.useState(defaultAmount)
  const [term, setTerm] = React.useState(60)
  const monthly = (amount * (apr / 1200)) / (1 - Math.pow(1 + apr / 1200, -term))
  return (
    <Card>
      <ModuleTag ids={['FinancingCalculator@3']} />
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">Finance from €{Math.round(monthly)}/month</h3>
            <p className="mt-1 text-sm text-muted-foreground">Partner bank financing · {apr}% APR · 0% down payment options</p>
          </div>
          <Badge variant="secondary">Soft check, no credit impact</Badge>
        </div>
        <div className="mt-6 grid gap-6 @min-[768px]:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label htmlFor="fc-amount">Project amount</Label>
              <span className="font-mono text-sm font-bold text-primary">€{amount.toLocaleString()}</span>
            </div>
            <Slider id="fc-amount" min={2000} max={maxAmount} step={500} value={[amount]} onValueChange={([v]) => setAmount(v)} />
          </div>
          <div className="space-y-2">
            <Label>Term</Label>
            <Tabs value={String(term)} onValueChange={(v) => setTerm(Number(v))}>
              <TabsList className="grid w-full grid-cols-4">
                {[24, 48, 60, 84].map((t) => (
                  <TabsTrigger key={t} value={String(t)}>{t} mo</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3 rounded-xl bg-muted/40 p-4 text-center text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Monthly</p>
            <p className="text-lg font-black text-primary">€{monthly.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total interest</p>
            <p className="text-lg font-black">€{Math.round(monthly * term - amount).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total cost</p>
            <p className="text-lg font-black">€{Math.round(monthly * term).toLocaleString()}</p>
          </div>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
          Representative example, not an offer of credit. Subject to approval. Fictional demo figures.
        </p>
      </CardContent>
    </Card>
  )
}

/* ---------------------------------- Configurator (T4) ---------------------------------- */
export function Configurator({
  title,
  steps,
  basePrice,
}: {
  title: string
  steps: { id: string; label: string; options: { id: string; label: string; price: number; hint?: string }[] }[]
  basePrice: number
}) {
  const [choice, setChoice] = React.useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    steps.forEach((s) => (init[s.id] = s.options[0].id))
    return init
  })
  const selected = steps.flatMap((s) => s.options.find((o) => o.id === choice[s.id]) ?? [])
  const total = basePrice + selected.reduce((sum, o) => sum + o.price, 0)
  return (
    <Card className="overflow-hidden">
      <ModuleTag ids={['Configurator@4']} />
      <CardContent className="grid gap-8 p-6 @min-[1024px]:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <h3 className="text-lg font-bold">{title}</h3>
          {steps.map((step) => (
            <div key={step.id}>
              <Label className="mb-2 block text-sm font-semibold">{step.label}</Label>
              <div className="flex flex-wrap gap-2">
                {step.options.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => {
                      setChoice((c) => ({ ...c, [step.id]: o.id }))
                      useFactory.getState().track('cta_clicked', `configurator:${o.id}`)
                    }}
                    aria-pressed={choice[step.id] === o.id}
                    className={cn(
                      'rounded-xl border px-4 py-2.5 text-left text-sm transition',
                      choice[step.id] === o.id
                        ? 'border-primary bg-primary/10 font-semibold shadow-sm'
                        : 'bg-background hover:border-primary/40',
                    )}
                  >
                    <span className="block">{o.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {o.price === 0 ? 'included' : `+€${o.price.toLocaleString()}`}
                      {o.hint ? ` · ${o.hint}` : ''}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col justify-between gap-4 self-start rounded-xl border bg-zinc-950 p-5 text-zinc-100 @min-[1024px]:sticky @min-[1024px]:top-32">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Your configuration</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {selected.map((o) => (
                <li key={o.id} className="flex justify-between gap-2">
                  <span className="text-zinc-400">{o.label}</span>
                  <span className="font-medium">{o.price === 0 ? '€0' : `€${o.price.toLocaleString()}`}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t border-zinc-800 pt-4">
            <p className="flex items-baseline justify-between text-sm text-zinc-400">
              <span>Total estimate</span>
              <span className="text-2xl font-black text-primary">€{total.toLocaleString()}</span>
            </p>
            <Button asChild className="mt-4 w-full">
              <a href="#booking">Book survey with this config</a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ---------------------------------- PersonalizedRecommendations (T4) ---------------------------------- */
export function PersonalizedRecommendations({
  recommendations,
}: {
  recommendations: { season: string; items: { title: string; reason: string; price: string }[] }[]
}) {
  const [season, setSeason] = React.useState(recommendations[0].season)
  const active = recommendations.find((r) => r.season === season) ?? recommendations[0]
  return (
    <Card>
      <ModuleTag ids={['PersonalizedRecommendations@4']} />
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">Recommended for your home</h3>
            <p className="text-sm text-muted-foreground">Season-aware service recalls based on your system profile.</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Tabs value={season} onValueChange={(v) => { setSeason(v); useFactory.getState().track('recommendation_clicked', v) }}>
              <TabsList>
                {recommendations.map((r) => (
                  <TabsTrigger key={r.season} value={r.season}>{r.season}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
        <div className="mt-5 grid gap-3 @min-[640px]:grid-cols-3">
          {active.items.map((item) => (
            <button
              key={item.title}
              onClick={() => useFactory.getState().track('recommendation_clicked', item.title)}
              className="group rounded-xl border p-4 text-left transition hover:border-primary/50 hover:bg-primary/5"
            >
              <p className="text-sm font-bold">{item.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.reason}</p>
              <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary">
                {item.price} <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
              </p>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
