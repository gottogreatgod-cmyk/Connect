'use client'

/**
 * Location & local SEO modules:
 * GoogleMapEmbed · HoursTable · ServiceAreaMap · PostcodeChecker · NeighborhoodPages
 */

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MapPin, Navigation, Clock, CheckCircle2, XCircle, ArrowRight, Loader2 } from 'lucide-react'
import { ModuleTag } from './primitives'
import { useFactory } from '@/factory/store'
import type { Neighborhood } from '@/factory/types'
import { cn } from '@/lib/utils'

/* ---------------------------------- GoogleMapEmbed (stylised) ---------------------------------- */
export function GoogleMapEmbed({ address, city, label }: { address: string; city: string; label: string }) {
  const [loaded, setLoaded] = React.useState(false)
  React.useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 700)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="relative overflow-hidden rounded-2xl border shadow-md">
      <ModuleTag ids={['GoogleMapEmbed@1']} />
      {/* map grid backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.556_0_0/12%)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.556_0_0/12%)_1px,transparent_1px)] bg-[size:36px_36px]"
      />
      <div aria-hidden className="absolute left-[12%] top-[38%] h-3 w-2/3 -rotate-6 rounded-full bg-muted" />
      <div aria-hidden className="absolute left-[28%] top-0 h-full w-2.5 rotate-12 bg-muted/70" />
      <div aria-hidden className="absolute bottom-0 left-[10%] top-[62%] w-[55%] bg-emerald-500/10" />
      {!loaded ? (
        <div className="relative flex h-72 items-center justify-center text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading map…
        </div>
      ) : (
        <div className="relative h-72">
          {/* pin */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-primary/20">
              <MapPin className="h-5 w-5" />
            </span>
            <span className="mx-auto mt-1 block h-2 w-2 rotate-45 bg-primary/40" />
          </div>
          <div className="absolute inset-x-4 bottom-4 flex flex-col gap-3 rounded-xl border bg-background/95 p-4 backdrop-blur @min-[640px]:flex-row @min-[640px]:items-center @min-[640px]:justify-between">
            <div>
              <p className="text-sm font-bold">{label}</p>
              <p className="text-xs text-muted-foreground">{address}, {city}</p>
            </div>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => useFactory.getState().track('directions_clicked', 'map-embed')}
            >
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, ${city}`)}`} target="_blank" rel="noreferrer">
                <Navigation className="h-3.5 w-3.5" /> Get directions
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------------------------------- HoursTable ---------------------------------- */
export function HoursTable({ hours, holidayNote }: { hours: { day: string; open: string; close: string }[]; holidayNote?: string }) {
  const today = new Intl.DateTimeFormat('en-GB', { weekday: 'long', timeZone: 'Europe/Berlin' }).format(new Date())
  return (
    <Card>
      <ModuleTag ids={['HoursTable@1']} className="top-0" />
      <CardContent className="p-6">
        <h3 className="flex items-center gap-2 text-base font-bold">
          <Clock className="h-4 w-4 text-primary" /> Opening hours
        </h3>
        <table className="mt-4 w-full text-sm">
          <tbody>
            {hours.map((row) => {
              const isToday = row.day === today
              return (
                <tr key={row.day} className={cn('border-b border-border/60 last:border-0', isToday && 'font-semibold text-primary')}>
                  <td className="py-2">
                    {row.day}
                    {isToday && <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase">Today</span>}
                  </td>
                  <td className="py-2 text-right font-mono text-xs">
                    {row.open} – {row.close}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {holidayNote && (
          <p className="mt-3 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground"> Holiday: {holidayNote}</p>
        )}
      </CardContent>
    </Card>
  )
}

/* ---------------------------------- ServiceAreaMap ---------------------------------- */
export function ServiceAreaMap({ zone, neighborhoods }: { zone: string; neighborhoods: Neighborhood[] }) {
  return (
    <div className="relative grid gap-6 @min-[768px]:grid-cols-[1fr_320px]">
      <ModuleTag ids={['ServiceAreaMap@2']} className="top-0" />
      <div className="relative h-72 overflow-hidden rounded-2xl border bg-muted/20 @min-[768px]:h-96">
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.556_0_0/10%)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.556_0_0/10%)_1px,transparent_1px)] bg-[size:40px_40px]"
        />
        <svg viewBox="0 0 400 320" className="absolute inset-0 h-full w-full">
          <polygon
            points="200,28 330,96 348,208 268,292 128,286 58,196 84,86"
            fill="oklch(0.82 0.16 80 / 14%)"
            stroke="oklch(0.82 0.16 80 / 70%)"
            strokeWidth="2.5"
            strokeDasharray="8 5"
          />
          <circle cx="200" cy="158" r="10" fill="oklch(0.82 0.16 80)" />
          <text x="200" y="140" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor" className="fill-foreground">
            HQ {zone}
          </text>
          {neighborhoods.map((n, i) => {
            const pts = [
              [252, 96], [296, 170], [232, 236], [140, 224], [116, 140],
            ]
            const [x, y] = pts[i % pts.length]
            return (
              <g key={n.name}>
                <circle cx={x} cy={y} r="6" fill="currentColor" className="fill-muted-foreground" />
                <text x={x} y={y - 10} textAnchor="middle" fontSize="10" fill="currentColor" className="fill-muted-foreground">
                  {n.name}
                </text>
              </g>
            )
          })}
        </svg>
        <span className="absolute bottom-3 left-3 rounded-full bg-background/90 px-3 py-1 text-xs font-medium shadow-sm">
          25 km response radius · dashed = coverage zone
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {neighborhoods.map((n) => (
          <div key={n.name} className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
            <div>
              <p className="text-sm font-bold">{n.name}</p>
              <p className="text-xs text-muted-foreground">{n.jobs} jobs last quarter</p>
            </div>
            <Badge variant="secondary">~{n.etaMinutes} min</Badge>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------------------------------- PostcodeChecker ---------------------------------- */
export function PostcodeChecker({ validPrefixes }: { validPrefixes: string[] }) {
  const [postcode, setPostcode] = React.useState('')
  const [result, setResult] = React.useState<'idle' | 'checking' | 'yes' | 'no'>('idle')
  const check = () => {
    setResult('checking')
    useFactory.getState().track('search_used', `postcode:${postcode}`)
    setTimeout(() => {
      setResult(validPrefixes.some((p) => postcode.startsWith(p)) ? 'yes' : 'no')
    }, 700)
  }
  return (
    <Card className="border-dashed">
      <ModuleTag ids={['PostcodeChecker@2']} className="top-0" />
      <CardContent className="p-6">
        <h3 className="text-base font-bold">Check your postcode</h3>
        <p className="mt-1 text-sm text-muted-foreground">Instant eligibility for 24/7 dispatch and fixed-price call-outs.</p>
        <div className="mt-4 flex flex-col gap-2 @min-[640px]:flex-row">
          <Input
            inputMode="numeric"
            placeholder="e.g. 40210"
            maxLength={6}
            value={postcode}
            onChange={(e) => {
              setPostcode(e.target.value.replace(/[^\d]/g, ''))
              setResult('idle')
            }}
            onKeyDown={(e) => e.key === 'Enter' && postcode.length >= 4 && check()}
            aria-label="Postcode"
          />
          <Button disabled={postcode.length < 4} onClick={check}>Check</Button>
        </div>
        {result === 'checking' && (
          <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Checking coverage…
          </p>
        )}
        {result === 'yes' && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            <span>
              <strong>Good news — you are inside the zone.</strong> Emergency teams can reach you in under 45 minutes.{' '}
              <a href="#call" className="font-semibold text-primary underline">Call the 24/7 line</a> or{' '}
              <a href="#quote" className="font-semibold text-primary underline">request a quote</a>.
            </span>
          </div>
        )}
        {result === 'no' && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <span>
              Outside the current dispatch radius. We can still help with planned projects —{' '}
              <a href="#contact" className="font-semibold text-primary underline">ask about partner coverage</a>.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* ---------------------------------- NeighborhoodPages (T3+) ---------------------------------- */
export function NeighborhoodPages({ neighborhoods }: { neighborhoods: Neighborhood[] }) {
  return (
    <div className="relative">
      <ModuleTag ids={['NeighborhoodPages@3']} className="top-0" />
      <div className="grid gap-3 @min-[640px]:grid-cols-2 @min-[1024px]:grid-cols-3">
        {neighborhoods.map((n) => (
          <a
            key={n.name}
            href="#top"
            className="group flex items-center justify-between rounded-xl border bg-card p-4 transition hover:border-primary/50 hover:bg-primary/5"
          >
            <div>
              <p className="flex items-center gap-2 text-sm font-bold">
                <MapPin className="h-3.5 w-3.5 text-primary" /> Plumbing in {n.name}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Local crew · ~{n.etaMinutes} min response · {n.jobs} jobs last quarter
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
          </a>
        ))}
      </div>
    </div>
  )
}
