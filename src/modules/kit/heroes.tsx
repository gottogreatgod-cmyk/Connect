'use client'

/**
 * Hero & attention modules:
 * HeroUrgent · HeroLocal · HeroCampaign · HeroCinematic · HeroVideo
 */

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Phone, ShieldCheck, Clock, MapPin, ChevronDown, Play, Pause, Star, BadgePercent, CalendarClock } from 'lucide-react'
import { ModuleTag, DemoContentBadge } from './primitives'
import { MagneticWrap } from './advanced-motion'
import { useFactory } from '@/factory/store'
import { cn } from '@/lib/utils'

/* ---------------------------------- HeroUrgent ---------------------------------- */
export function HeroUrgent({
  brand,
  headline,
  subhead,
  phone,
  responseTime,
  openNow,
  trustPoints,
  primaryCta,
  secondaryCta,
}: {
  brand: string
  headline: string
  subhead: string
  phone: { display: string; href: string }
  responseTime: string
  openNow: React.ReactNode
  trustPoints: string[]
  primaryCta: { label: string; href: string }
  secondaryCta: { label: string; href: string }
}) {
  const track = useFactory((s) => s.track)
  return (
    <section id="top" className="relative overflow-hidden bg-zinc-950 text-zinc-100">
      <ModuleTag ids={['HeroUrgent@1']} />
      {/* Ambient night backdrop */}
      <div aria-hidden className="absolute inset-0">
        <div className="factory-drift absolute -left-1/4 top-0 h-[130%] w-[70%] rounded-full bg-amber-500/10 blur-3xl" />
        <div className="factory-flow absolute inset-x-0 bottom-0 h-24 opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_20%,rgba(9,9,11,0.9)_70%)]" />
      </div>
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 @min-[640px]:px-6 @min-[768px]:py-24 @min-[1024px]:grid-cols-[1.15fr_0.85fr] @min-[1024px]:items-center">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
            </span>
            Dispatchers online now — {responseTime}
          </div>
          <h1 className="text-4xl font-black leading-[1.05] tracking-tight @min-[640px]:text-5xl @min-[768px]:text-6xl">
            {headline}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-300 @min-[640px]:text-lg">{subhead}</p>
          <div className="mt-8 flex flex-col gap-3 @min-[640px]:flex-row @min-[640px]:items-center">
            <Button
              asChild
              size="lg"
              className="factory-pulse-ring h-14 gap-2 bg-amber-500 px-8 text-base font-bold text-zinc-950 hover:bg-amber-400"
              onClick={() => track('call_clicked', 'hero')}
            >
              <a href={phone.href}>
                <Phone className="h-5 w-5" /> {phone.display}
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-14 border-zinc-700 bg-zinc-900/60 px-6 text-base text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50"
            >
              <a href={secondaryCta.href}>{secondaryCta.label}</a>
            </Button>
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-400">
            {trustPoints.map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-400" /> {t}
              </span>
            ))}
          </div>
        </div>

        <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Live dispatch status</p>
              <p className="mt-1 text-sm font-semibold text-zinc-100">{brand} · Night desk</p>
            </div>
            {openNow}
          </div>
          <ul className="mt-4 space-y-3 text-sm">
            {[
              { icon: Clock, label: 'Avg. arrival (last 30 nights)', value: responseTime },
              { icon: Phone, label: 'Emergency line', value: phone.display },
              { icon: MapPin, label: 'Coverage', value: 'Düsseldorf · Rhein-Ruhr · 25 km radius' },
            ].map((row) => (
              <li key={row.label} className="flex items-center justify-between gap-3 rounded-lg bg-zinc-950/60 px-3 py-2.5">
                <span className="flex items-center gap-2 text-zinc-400">
                  <row.icon className="h-4 w-4 text-amber-400" /> {row.label}
                </span>
                <span className="font-semibold text-zinc-100">{row.value}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between rounded-lg border border-dashed border-zinc-800 px-3 py-2">
            <span className="text-xs text-zinc-500">Ratings shown are fictional</span>
            <DemoContentBadge />
          </div>
        </div>
      </div>
      <a
        href="#services"
        aria-label="Scroll to services"
        className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 animate-bounce text-zinc-600 @min-[768px]:block"
      >
        <ChevronDown className="h-5 w-5" />
      </a>
    </section>
  )
}

/* ---------------------------------- OpenNowBadge ---------------------------------- */
export function OpenNowBadge({
  hours = { open: 0, close: 24 },
  timezone = 'Europe/Berlin',
}: {
  hours?: { open: number; close: number }
  timezone?: string
}) {
  const [state, setState] = React.useState<{ open: boolean; time: string } | null>(null)
  React.useEffect(() => {
    const compute = () => {
      const now = new Date()
      const hour = Number(
        new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hour12: false, timeZone: timezone }).format(now),
      )
      const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: timezone }).format(now)
      setState({ open: hour >= hours.open && hour < hours.close, time })
    }
    compute()
    const t = setInterval(compute, 30_000)
    return () => clearInterval(t)
  }, [hours.open, hours.close, timezone])
  return (
    <span
      role="status"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
        state?.open ? 'bg-emerald-500/15 text-emerald-500' : 'bg-red-500/15 text-red-500',
      )}
    >
      <span className={cn('h-2 w-2 rounded-full', state?.open ? 'bg-emerald-500' : 'bg-red-500')} />
      {state ? (state.open ? 'Open now' : 'Closed') : '…'}
      {state && <span className="font-normal opacity-70">· {state.time}</span>}
    </span>
  )
}

/* ---------------------------------- HeroLocal ---------------------------------- */
export function HeroLocal({
  eyebrow,
  headline,
  subhead,
  phone,
  location,
  hoursNote,
  primaryCta,
  secondaryCta,
  openNow,
  stats,
}: {
  eyebrow: string
  headline: React.ReactNode
  subhead: string
  phone: { display: string; href: string }
  location: string
  hoursNote: string
  primaryCta: { label: string; href: string }
  secondaryCta: { label: string; href: string }
  openNow?: React.ReactNode
  stats: { value: string; label: string }[]
}) {
  return (
    <section id="top" className="relative overflow-hidden">
      <ModuleTag ids={['HeroLocal@1']} />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
      <div className="relative mx-auto max-w-6xl px-4 py-16 @min-[640px]:px-6 @min-[768px]:py-24">
        <div className="grid items-center gap-10 @min-[1024px]:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
            <h1 className="text-4xl font-black tracking-tight @min-[640px]:text-5xl @min-[768px]:text-[3.4rem] @min-[768px]:leading-[1.05]">{headline}</h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground @min-[640px]:text-lg">{subhead}</p>
            <div className="mt-8 flex flex-col gap-3 @min-[640px]:flex-row">
              <MagneticWrap radius={90} strength={0.3} max={9} className="inline-flex">
                <Button asChild size="lg" className="h-13 px-7 text-base" onClick={() => useFactory.getState().track('cta_clicked', primaryCta.label)}>
                  <a href={primaryCta.href}>{primaryCta.label}</a>
                </Button>
              </MagneticWrap>
              <Button asChild size="lg" variant="outline" className="h-13 px-6 text-base">
                <a href={secondaryCta.href}>{secondaryCta.label}</a>
              </Button>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {openNow}
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" /> {location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" /> {hoursNote}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={cn(
                  'rounded-xl border bg-card p-4 text-center shadow-sm',
                  i === 1 && '@min-[768px]:-translate-y-3',
                )}
              >
                <p className="text-2xl font-black tracking-tight text-primary @min-[640px]:text-3xl">{s.value}</p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------- HeroCampaign (T2+) ---------------------------------- */
export function HeroCampaign({
  offer,
  deadline,
  eligibility,
  cta,
}: {
  offer: { title: string; detail: string }
  deadline: string
  eligibility: string
  cta: { label: string; href: string }
}) {
  return (
    <section className="relative overflow-hidden border-y bg-zinc-950 text-zinc-100">
      <ModuleTag ids={['HeroCampaign@2']} />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-primary/25 via-primary/10 to-transparent" />
      <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-5 px-4 py-10 @min-[640px]:px-6 @min-[768px]:flex-row @min-[768px]:items-center @min-[768px]:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <BadgePercent className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Seasonal campaign</p>
            <h2 className="mt-1 text-xl font-bold @min-[640px]:text-2xl">{offer.title}</h2>
            <p className="mt-1 max-w-xl text-sm text-zinc-300">{offer.detail}</p>
            <p className="mt-2 text-xs text-zinc-500">Eligibility: {eligibility}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-center">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              <CalendarClock className="h-3.5 w-3.5" /> Ends in
            </p>
            <p className="mt-1 font-mono text-lg font-bold text-primary">{deadline}</p>
          </div>
          <Button asChild size="lg" className="h-12 px-6 font-semibold">
            <a href={cta.href}>{cta.label}</a>
          </Button>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------- HeroCinematic (T4) ---------------------------------- */
export function HeroCinematic({ title, caption }: { title: string; caption: string }) {
  const [playerOpen, setPlayerOpen] = React.useState(false)
  const track = useFactory((s) => s.track)
  return (
    <section className="relative overflow-hidden bg-zinc-950 text-zinc-100">
      <ModuleTag ids={['HeroCinematic@4']} />
      {/* Layered cinematic backdrop (poster-fallback demo, no real media) */}
      <div aria-hidden className="relative h-[420px] @min-[768px]:h-[520px]">
        <div className="factory-drift absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(245,158,11,0.28),transparent_55%)]" />
        <div className="factory-drift absolute inset-0 bg-[radial-gradient(ellipse_at_75%_80%,rgba(120,113,108,0.35),transparent_50%)] [animation-delay:-6s]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(9,9,11,0.95),transparent_60%)]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <button
            onClick={() => {
              setPlayerOpen(true)
              track('media_opened', 'brand film')
            }}
            className="group flex h-20 w-20 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/15 backdrop-blur transition hover:scale-105 hover:bg-amber-500/25"
            aria-label="Play brand film"
          >
            <Play className="h-8 w-8 fill-amber-400 text-amber-400" />
          </button>
          <h2 className="mt-6 text-3xl font-black tracking-tight @min-[640px]:text-4xl">{title}</h2>
          <p className="mt-2 max-w-md text-sm text-zinc-400">{caption}</p>
        </div>
        <span className="absolute bottom-5 left-1/2 -translate-x-1/2 animate-bounce text-zinc-600" aria-hidden>
          <ChevronDown className="h-5 w-5" />
        </span>
      </div>

      <Dialog open={playerOpen} onOpenChange={setPlayerOpen}>
        <DialogContent className="@min-[640px]:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nightflow — brand film</DialogTitle>
            <DialogDescription>
              Poster-fallback demo player: captions available, pause control, reduced-motion static frame.
            </DialogDescription>
          </DialogHeader>
          <CinematicPlayer />
        </DialogContent>
      </Dialog>
    </section>
  )
}

function CinematicPlayer() {
  const [playing, setPlaying] = React.useState(true)
  const [captions, setCaptions] = React.useState(true)
  return (
    <div className="space-y-3">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-zinc-950">
        <div className={cn('absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.35),transparent_60%)]', playing && 'factory-drift')} />
        <div className={cn('absolute inset-0 bg-[radial-gradient(ellipse_at_80%_30%,rgba(63,63,70,0.5),transparent_55%)]', playing && 'factory-drift [animation-delay:-5s]')} />
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/60 text-xs uppercase tracking-widest text-zinc-400">
            Static poster frame
          </div>
        )}
        {captions && playing && (
          <p className="absolute bottom-3 left-1/2 w-max max-w-[90%] -translate-x-1/2 rounded bg-black/70 px-3 py-1.5 text-center text-xs text-zinc-100">
            [Night, 2:14 AM — a dispatcher answers before the second ring.]
          </p>
        )}
      </div>
      <div className="flex items-center justify-between">
        <Button size="sm" variant="outline" onClick={() => setPlaying((p) => !p)} className="gap-2">
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {playing ? 'Pause' : 'Play'}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setCaptions((c) => !c)} className="text-xs">
          CC {captions ? 'on' : 'off'}
        </Button>
      </div>
    </div>
  )
}

/* ---------------------------------- HeroVideo (T4) ---------------------------------- */
export function HeroVideo({ title, caption }: { title: string; caption: string }) {
  const [playing, setPlaying] = React.useState(true)
  const [captions, setCaptions] = React.useState(false)
  return (
    <div className="overflow-hidden rounded-2xl border bg-zinc-950 text-zinc-100 shadow-xl">
      <ModuleTag ids={['HeroVideo@4']} />
      <div className="relative aspect-video">
        <div aria-hidden className={cn('absolute inset-0', playing && 'factory-drift')}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(234,88,12,0.4),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_70%,rgba(250,204,21,0.25),transparent_50%)]" />
        </div>
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/50 text-xs uppercase tracking-widest text-zinc-400">
            Poster fallback
          </div>
        )}
        {captions && (
          <p className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded bg-black/70 px-3 py-1 text-center text-xs">
            [Seasonal tune-up sequence — combustion analysis, coil clean, airflow check.]
          </p>
        )}
        <div className="absolute right-3 top-3 flex gap-2">
          <button
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause background loop' : 'Play background loop'}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 backdrop-blur transition hover:bg-black/70"
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setCaptions((c) => !c)}
            aria-pressed={captions}
            className="flex h-9 items-center justify-center rounded-full bg-black/50 px-3 text-xs font-bold backdrop-blur transition hover:bg-black/70"
          >
            CC
          </button>
        </div>
        <div className="absolute bottom-3 left-4 right-4">
          <p className="text-sm font-bold">{title}</p>
          <p className="text-xs text-zinc-400">{caption}</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 bg-black/40 px-4 py-2 text-[10px] text-zinc-500">
          <Star className="h-3 w-3 text-amber-400" /> Muted loop · autoplay disabled under reduced-motion
        </div>
      </div>
    </div>
  )
}
