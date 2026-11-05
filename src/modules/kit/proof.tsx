'use client'

/**
 * Proof & trust modules:
 * TrustBar · ReviewCarousel · ReviewWall · GoogleReviewsEmbed · CaseStudyCard ·
 * CaseStudyIndex · CredentialWall · GuaranteePanel · ResultsStatStrip ·
 * TeamGrid · TeamCredentials · AwardStrip
 */

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Star, ShieldCheck, BadgeCheck, Award, Lock, FileCheck, HeartHandshake, Quote, Medal } from 'lucide-react'
import { ModuleTag, DemoContentBadge } from './primitives'
import { AnimatedCounter } from './motion'
import type { Review, TeamMember, CaseStudy } from '@/factory/types'
import { cn } from '@/lib/utils'

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cn('h-3.5 w-3.5', i < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30')} />
      ))}
    </span>
  )
}

/* ---------------------------------- TrustBar ---------------------------------- */
export function TrustBar({ items }: { items: { icon: string; label: string; detail: string }[] }) {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    BadgeCheck, ShieldCheck, Lock, FileCheck, Award, HeartHandshake, Medal,
  }
  return (
    <div className="relative border-y bg-muted/30">
      <ModuleTag ids={['TrustBar@2']} />
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-6 @min-[640px]:px-6 @min-[768px]:grid-cols-4">
        {items.map((item) => {
          const Icon = icons[item.icon] ?? ShieldCheck
          return (
            <div key={item.label} className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold leading-tight">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ---------------------------------- ReviewCarousel ---------------------------------- */
export function ReviewCarousel({ reviews }: { reviews: Review[] }) {
  return (
    <div className="relative">
      <ModuleTag ids={['ReviewCarousel@1']} className="top-0" />
      <Carousel opts={{ loop: true }} className="mx-auto max-w-3xl">
        <CarouselContent>
          {reviews.map((r) => (
            <CarouselItem key={r.name}>
              <Card className="border-muted">
                <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                  <Quote className="h-6 w-6 text-primary/50" />
                  <Stars rating={r.rating} />
                  <blockquote className="max-w-xl text-base leading-relaxed @min-[640px]:text-lg">&ldquo;{r.quote}&rdquo;</blockquote>
                  <div>
                    <p className="text-sm font-bold">{r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.location} · {r.service} · {r.date} · via {r.source}
                    </p>
                  </div>
                  <DemoContentBadge label="Fictional review" />
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-2 @min-[768px]:-left-14" aria-label="Previous review" />
        <CarouselNext className="-right-2 @min-[768px]:-right-14" aria-label="Next review" />
      </Carousel>
    </div>
  )
}

/* ---------------------------------- ReviewWall (T2+) ---------------------------------- */
export function ReviewWall({ reviews }: { reviews: Review[] }) {
  const groups = React.useMemo(() => {
    const map = new Map<string, Review[]>()
    reviews.forEach((r) => map.set(r.service, [...(map.get(r.service) ?? []), r]))
    return [...map.entries()]
  }, [reviews])
  return (
    <div className="relative">
      <ModuleTag ids={['ReviewWall@2']} className="top-0" />
      <Tabs defaultValue={groups[0][0]} className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          {groups.map(([service]) => (
            <TabsTrigger key={service} value={service} className="text-xs">
              {service}
            </TabsTrigger>
          ))}
        </TabsList>
        {groups.map(([service, list]) => (
          <TabsContent key={service} value={service}>
            <div className="columns-1 gap-4 @min-[640px]:columns-2 @min-[1024px]:columns-3 [&>*]:mb-4">
              {list.map((r) => (
                <Card key={r.name + r.date}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <Stars rating={r.rating} />
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{r.source}</span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed">&ldquo;{r.quote}&rdquo;</p>
                    <p className="mt-3 text-xs font-semibold">{r.name} <span className="font-normal text-muted-foreground">· {r.location} · {r.date}</span></p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      <p className="mt-4 text-center"><DemoContentBadge label="All reviews fictional" /></p>
    </div>
  )
}

/* ---------------------------------- GoogleReviewsEmbed (T1) ---------------------------------- */
export function GoogleReviewsEmbed({ rating, count, reviews }: { rating: number; count: number; reviews: Review[] }) {
  const bars = [0.78, 0.14, 0.05, 0.02, 0.01]
  return (
    <div className="grid gap-6 @min-[768px]:grid-cols-[280px_1fr]">
      <ModuleTag ids={['GoogleReviewsEmbed@1']} className="top-0" />
      <Card className="h-fit">
        <CardContent className="p-6 text-center">
          <p className="text-5xl font-black tracking-tight">{rating.toFixed(1)}</p>
          <div className="mt-2 flex justify-center"><Stars rating={Math.round(rating)} /></div>
          <p className="mt-2 text-xs text-muted-foreground">{count.toLocaleString()} Google reviews</p>
          <div className="mt-4 space-y-1.5">
            {bars.map((pct, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-3 text-[10px] text-muted-foreground">{5 - i}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4"><DemoContentBadge label="Simulated embed" /></p>
        </CardContent>
      </Card>
      <div className="grid gap-4 @min-[640px]:grid-cols-2 @min-[1280px]:grid-cols-3">
        {reviews.slice(0, 3).map((r) => (
          <Card key={r.name}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {r.name.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-bold">{r.name}</p>
                  <Stars rating={r.rating} />
                </div>
              </div>
              <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted-foreground">{r.quote}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

/* ---------------------------------- CaseStudyCard / CaseStudyIndex ---------------------------------- */
export function CaseStudyCard({ study }: { study: CaseStudy }) {
  return (
    <Card className="group h-full overflow-hidden transition hover:shadow-lg">
      <ModuleTag ids={['CaseStudyCard@3']} className="top-0" />
      <CardContent className="flex h-full flex-col p-6">
        <div className="flex items-center justify-between">
          <Badge variant="secondary">{study.location}</Badge>
          <span className="text-2xl font-black text-primary">{study.metric}</span>
        </div>
        <h3 className="mt-4 text-base font-bold">{study.title}</h3>
        <p className="mt-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Challenge</p>
        <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{study.challenge}</p>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Result</p>
        <p className="mt-0.5 text-sm leading-relaxed">{study.result}</p>
        <div className="mt-auto pt-4"><DemoContentBadge /></div>
      </CardContent>
    </Card>
  )
}

export function CaseStudyIndex({ studies }: { studies: CaseStudy[] }) {
  return (
    <div className="relative grid gap-4 @min-[768px]:grid-cols-3">
      <ModuleTag ids={['CaseStudyIndex@3']} className="top-0" />
      {studies.map((s) => (
        <CaseStudyCard key={s.title} study={s} />
      ))}
    </div>
  )
}

/* ---------------------------------- CredentialWall (T3+) ---------------------------------- */
export function CredentialWall({ credentials }: { credentials: { label: string; detail: string; kind: 'license' | 'insurance' | 'cert' | 'background' }[] }) {
  const icons = { license: FileCheck, insurance: ShieldCheck, cert: BadgeCheck, background: Lock }
  return (
    <div className="relative grid gap-3 @min-[640px]:grid-cols-2 @min-[1024px]:grid-cols-4">
      <ModuleTag ids={['CredentialWall@3']} className="top-0" />
      {credentials.map((c) => {
        const Icon = icons[c.kind]
        return (
          <div key={c.label} className="flex items-start gap-3 rounded-xl border bg-card p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-sm font-bold leading-snug">{c.label}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{c.detail}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ---------------------------------- GuaranteePanel (T3+) ---------------------------------- */
export function GuaranteePanel({ guarantees }: { guarantees: { title: string; detail: string }[] }) {
  return (
    <div className="relative rounded-2xl border-2 border-primary/25 bg-primary/5 p-6 @min-[768px]:p-8">
      <ModuleTag ids={['GuaranteePanel@3']} />
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <HeartHandshake className="h-6 w-6" />
        </span>
        <div>
          <h3 className="text-lg font-bold">Our written guarantees</h3>
          <p className="text-sm text-muted-foreground">Every promise below is part of the contract, not the marketing.</p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 @min-[640px]:grid-cols-2 @min-[1024px]:grid-cols-4">
        {guarantees.map((g) => (
          <div key={g.title} className="rounded-xl border bg-background p-4">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <p className="mt-2 text-sm font-bold">{g.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{g.detail}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------------------------------- TeamGrid (T3+) / TeamCredentials ---------------------------------- */
export function TeamGrid({ members, bookingHref = '#booking' }: { members: TeamMember[]; bookingHref?: string }) {
  return (
    <div className="relative grid gap-4 @min-[640px]:grid-cols-2 @min-[1024px]:grid-cols-4">
      <ModuleTag ids={['TeamGrid@3']} className="top-0" />
      {members.map((m) => (
        <Card key={m.name} className="text-center">
          <CardContent className="p-6">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/25 to-primary/5 text-xl font-black text-primary ring-2 ring-primary/20">
              {m.initials}
            </span>
            <p className="mt-4 text-sm font-bold">{m.name}</p>
            <p className="text-xs text-muted-foreground">{m.role}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-primary">{m.years} yrs experience</p>
            <div className="mt-3 flex flex-wrap justify-center gap-1">
              {m.certs.map((c) => (
                <Badge key={c} variant="secondary" className="text-[9px]">{c}</Badge>
              ))}
            </div>
            <Button asChild size="sm" variant="outline" className="mt-4 w-full">
              <a href={bookingHref}>Request {m.name.split(' ')[0]}</a>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function TeamCredentials({ members }: { members: TeamMember[] }) {
  return (
    <div className="relative space-y-3">
      <ModuleTag ids={['TeamCredentials@3']} className="top-0" />
      {members.map((m) => (
        <div key={m.name} className="flex flex-wrap items-center gap-4 rounded-xl border bg-card p-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-black text-primary">
            {m.initials}
          </span>
          <div className="min-w-40 flex-1">
            <p className="text-sm font-bold">{m.name} <span className="ml-1 font-normal text-muted-foreground">· {m.role}</span></p>
            <div className="mt-1 flex flex-wrap gap-1">
              {m.certs.map((c) => (
                <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{m.years} years in the field</p>
        </div>
      ))}
    </div>
  )
}

/* ---------------------------------- AwardStrip ---------------------------------- */
export function AwardStrip({ awards }: { awards: { year: string; title: string; org: string }[] }) {
  return (
    <div className="relative flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
      <ModuleTag ids={['AwardStrip@3']} className="top-0" />
      {awards.map((a) => (
        <div key={a.title} className="flex items-center gap-2 text-sm">
          <Medal className="h-5 w-5 text-primary" />
          <div>
            <span className="font-bold">{a.title}</span>
            <span className="text-muted-foreground"> · {a.org} {a.year}</span>
          </div>
        </div>
      ))}
      <DemoContentBadge />
    </div>
  )
}

/* ---------------------------------- ResultsStatStrip (with AnimatedCounter) ---------------------------------- */
export function ResultsStatStrip({ stats }: { stats: { value: number; suffix?: string; prefix?: string; label: string; decimals?: number }[] }) {
  return (
    <div className="relative">
      <ModuleTag ids={['ResultsStatStrip@3', 'AnimatedCounter@4']} className="top-0" />
      <div className="grid grid-cols-2 gap-4 rounded-2xl border bg-zinc-950 p-6 text-zinc-100 @min-[768px]:grid-cols-4 @min-[768px]:p-8">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-3xl font-black tracking-tight text-amber-400 @min-[768px]:text-4xl">
              <AnimatedCounter value={s.value} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals} />
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-zinc-400">{s.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center"><DemoContentBadge label="Fictional operating figures" /></p>
    </div>
  )
}
