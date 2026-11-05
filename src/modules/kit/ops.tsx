'use client'

/**
 * Booking & operations modules:
 * EmergencyTriage · JobDispatchTeaser · ProjectStatusPortal · ClientDashboardTeaser
 */

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, ArrowRight, CheckCircle2, Wrench, MessageSquare, FileText, Euro, CalendarClock } from 'lucide-react'
import { ModuleTag } from './primitives'
import { useFactory } from '@/factory/store'
import { cn } from '@/lib/utils'

/* ---------------------------------- EmergencyTriage ---------------------------------- */
const TRIAGE_FLOW = [
  {
    q: 'What is happening right now?',
    options: ['Water is flowing / flooding', 'Water is dripping or a leak is visible', 'No water / blocked drain', 'Heating or gas concern'],
  },
  {
    q: 'Is the situation getting worse as you watch?',
    options: ['Yes — actively worsening', 'Stable for now', 'Not sure'],
  },
  {
    q: 'Can you access the main shut-off valve?',
    options: ['Yes, already closed', 'Yes, but have not closed it', 'No / do not know'],
  },
]

export function EmergencyTriage() {
  const [step, setStep] = React.useState(0)
  const [answers, setAnswers] = React.useState<string[]>([])
  const track = useFactory((s) => s.track)

  const urgent = answers[0]?.startsWith('Water is flowing') || answers[1] === 'Yes — actively worsening'

  const pick = (option: string) => {
    setAnswers((a) => [...a, option])
    setStep((s) => s + 1)
    if (step === TRIAGE_FLOW.length - 1) {
      track('form_submitted', `triage:${answers[0]}`)
    }
  }

  const reset = () => {
    setStep(0)
    setAnswers([])
  }

  return (
    <Card className="overflow-hidden border-amber-500/40">
      <ModuleTag ids={['EmergencyTriage@2']} className="top-0" />
      <CardContent className="p-6 @min-[768px]:p-8">
        {step < TRIAGE_FLOW.length ? (
          <>
            <div className="flex items-center justify-between">
              <Badge className="gap-1 bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 dark:text-amber-400">
                <AlertTriangle className="h-3 w-3" /> 60-second triage
              </Badge>
              <span className="text-xs font-medium text-muted-foreground">Step {step + 1} of {TRIAGE_FLOW.length}</span>
            </div>
            <div className="mt-3">
              <Progress value={((step + 1) / TRIAGE_FLOW.length) * 100} className="h-1.5" />
            </div>
            <h3 className="mt-5 text-lg font-bold @min-[640px]:text-xl">{TRIAGE_FLOW[step].q}</h3>
            <div className="mt-4 grid gap-2 @min-[640px]:grid-cols-2">
              {TRIAGE_FLOW[step].options.map((o) => (
                <button
                  key={o}
                  onClick={() => pick(o)}
                  className="min-h-[48px] rounded-xl border bg-card px-4 py-3 text-left text-sm font-medium transition hover:border-primary hover:bg-primary/5"
                >
                  {o}
                </button>
              ))}
            </div>
            {step > 0 && (
              <Button variant="ghost" size="sm" onClick={() => { setStep((s) => s - 1); setAnswers((a) => a.slice(0, -1)) }} className="mt-3">
                Back
              </Button>
            )}
          </>
        ) : (
          <div className="text-center">
            {urgent ? (
              <>
                <p className="text-4xl" aria-hidden>🚨</p>
                <h3 className="mt-3 text-xl font-black text-amber-500">This needs a dispatcher now</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  Based on your answers (&ldquo;{answers[0]}&rdquo;, &ldquo;{answers[1]}&rdquo;) we route this straight to the night desk.
                  If safe, close the main shut-off valve while you wait.
                </p>
                <div className="mt-5 flex flex-col justify-center gap-2 @min-[640px]:flex-row">
                  <Button asChild size="lg" className="bg-amber-500 text-zinc-950 hover:bg-amber-400">
                    <a href="tel:+492115550123">Call emergency line</a>
                  </Button>
                  <Button variant="outline" onClick={reset}>Retake triage</Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-4xl" aria-hidden>🧘</p>
                <h3 className="mt-3 text-xl font-bold">Stable situation — book a standard slot</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  Nothing indicates active damage escalation. A next-day visit with a fixed-price quote is the cheaper route.
                </p>
                <div className="mt-5 flex flex-col justify-center gap-2 @min-[640px]:flex-row">
                  <Button asChild size="lg">
                    <a href="#booking">Book a slot</a>
                  </Button>
                  <Button variant="outline" onClick={reset}>Retake triage</Button>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* ---------------------------------- JobDispatchTeaser (T3+) ---------------------------------- */
export function JobDispatchTeaser() {
  const [eta, setEta] = React.useState(26)
  const stages = ['Dispatched', 'En route', 'On site']
  const [stage, setStage] = React.useState(1)
  React.useEffect(() => {
    const t = setInterval(() => setEta((e) => (e > 1 ? e - 1 : 26)), 2600)
    const s = setInterval(() => setStage((x) => (x + 1) % 3), 5200)
    return () => {
      clearInterval(t)
      clearInterval(s)
    }
  }, [])
  return (
    <Card className="overflow-hidden">
      <ModuleTag ids={['JobDispatchTeaser@3']} className="top-0" />
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Wrench className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold">Marco K. · Master plumber</p>
              <p className="text-xs text-muted-foreground">Van 07 · assigned to your job #8841</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live ETA</p>
            <p className="font-mono text-2xl font-black text-primary">{eta} min</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {stages.map((s, i) => (
            <div key={s} className="text-center">
              <div
                className={cn(
                  'mx-auto flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors',
                  i <= stage ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground',
                )}
              >
                {i < stage ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <p className={cn('mt-1.5 text-xs font-medium', i <= stage ? 'text-foreground' : 'text-muted-foreground')}>{s}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-lg bg-muted/50 px-3 py-2 text-center text-xs text-muted-foreground">
          Simulated telemetry — in production this streams from the dispatch system.
        </p>
      </CardContent>
    </Card>
  )
}

/* ---------------------------------- ProjectStatusPortal (T4) ---------------------------------- */
export function ProjectStatusPortal() {
  const messages = [
    { from: 'office', text: 'Parts confirmed with supplier, delivery tomorrow 9 am.', time: 'Mon 16:42' },
    { from: 'you', text: 'Perfect. Access via the back yard is open.', time: 'Mon 17:03' },
    { from: 'office', text: 'Noted — Marco will text 15 min before arrival.', time: 'Mon 17:20' },
  ]
  return (
    <Card>
      <ModuleTag ids={['ProjectStatusPortal@4']} className="top-0" />
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">Job #8841 — Bathroom stack replacement</h3>
            <p className="text-sm text-muted-foreground">Approved budget €4,850 · scheduled 2 working days</p>
          </div>
          <Badge className="bg-primary">Phase 2 of 4 — Rough-in</Badge>
        </div>
        <div className="mt-5">
          <Progress value={45} className="h-2" />
          <div className="mt-2 flex justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Survey</span><span className="text-primary">Rough-in</span><span>Install</span><span>Sign-off</span>
          </div>
        </div>
        <Tabs defaultValue="timeline" className="mt-6">
          <TabsList>
            <TabsTrigger value="timeline" className="gap-1.5"><CalendarClock className="h-3.5 w-3.5" /> Milestones</TabsTrigger>
            <TabsTrigger value="messages" className="gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> Messages</TabsTrigger>
            <TabsTrigger value="docs" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> Documents</TabsTrigger>
          </TabsList>
          <TabsContent value="timeline" className="mt-4 space-y-2 text-sm">
            {[
              { d: 'Mon 08:00', t: 'Demo & removal completed', done: true },
              { d: 'Tue 09:00', t: 'Supply parts delivery', done: false },
              { d: 'Wed 08:30', t: 'Press-fit rough-in inspection', done: false },
              { d: 'Fri 14:00', t: 'Final walk-through & sign-off', done: false },
            ].map((m) => (
              <div key={m.t} className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
                {m.done ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <span className="h-4 w-4 rounded-full border-2 border-muted-foreground/40" />}
                <span className="font-mono text-xs text-muted-foreground">{m.d}</span>
                <span className={cn(m.done && 'text-muted-foreground line-through')}>{m.t}</span>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="messages" className="mt-4 space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={cn('max-w-[85%] rounded-xl px-4 py-2.5 text-sm', m.from === 'office' ? 'bg-muted' : 'ml-auto bg-primary text-primary-foreground')}>
                <p>{m.text}</p>
                <p className="mt-1 text-[10px] opacity-70">{m.time}</p>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="docs" className="mt-4 space-y-2 text-sm">
            {['Fixed-price quote (signed).pdf', 'Warranty certificate — 10 years.pdf', 'Photo log — rough-in (14 photos).zip'].map((d) => (
              <div key={d} className="flex items-center justify-between rounded-lg border px-3 py-2.5">
                <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> {d}</span>
                <Button variant="ghost" size="sm">Download</Button>
              </div>
            ))}
          </TabsContent>
        </Tabs>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground"><Euro className="h-3 w-3" /> Payments and approvals happen inside the client portal — no paper trail to lose.</p>
      </CardContent>
    </Card>
  )
}

/* ---------------------------------- ClientDashboardTeaser (T4) ---------------------------------- */
export function ClientDashboardTeaser({ brand }: { brand: string }) {
  return (
    <Card className="overflow-hidden">
      <ModuleTag ids={['ClientDashboard@4']} className="top-0" />
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-bold">{brand} portal — everything in one login</h3>
          <Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Demo preview</Badge>
        </div>
        <div className="mt-5 grid gap-3 @min-[640px]:grid-cols-2 @min-[1024px]:grid-cols-4">
          {[
            { icon: CalendarClock, title: 'Next appointment', value: 'Tue 09:00 · Tune-up', note: 'Technician: L. Öztürk' },
            { icon: Euro, title: 'Open invoice', value: '€189.00', note: 'Due in 12 days' },
            { icon: Wrench, title: 'System health', value: 'Good', note: 'Last check 41 days ago' },
            { icon: MessageSquare, title: 'Messages', value: '2 new', note: 'Recall reminder sent' },
          ].map((tile) => (
            <div key={tile.title} className="rounded-xl border bg-card p-4">
              <tile.icon className="h-4.5 w-4.5 text-primary" />
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{tile.title}</p>
              <p className="mt-0.5 text-lg font-black">{tile.value}</p>
              <p className="text-xs text-muted-foreground">{tile.note}</p>
            </div>
          ))}
        </div>
        <Button variant="outline" className="mt-5 gap-2" onClick={() => useFactory.getState().track('portal_login', 'demo')}>
          Open portal demo <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
