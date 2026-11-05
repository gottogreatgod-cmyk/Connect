'use client'

/**
 * Conversion modules:
 * FormField + InlineValidation · SuccessState · ContactForm · CallNowPanel ·
 * QuoteRequestForm · CallbackRequest · BookingCalendar · MembershipSignup · NewsletterSignup
 */

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { Phone, CheckCircle2, CalendarCheck, Clock, Send, Loader2, Mail, Sparkles } from 'lucide-react'
import { ModuleTag, DemoContentBadge } from './primitives'
import { useFactory } from '@/factory/store'
import { cn } from '@/lib/utils'

/* ---------------------------------- FormField + InlineValidation ---------------------------------- */
interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  error?: string
  requiredMark?: boolean
}
export function FormField({ label, hint, error, requiredMark, id, className, ...props }: FieldProps) {
  const generatedId = React.useId()
  const fieldId = id ?? generatedId
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={fieldId} className="text-sm font-medium">
        {label} {requiredMark && <span aria-hidden className="text-destructive">*</span>}
      </Label>
      <Input
        id={fieldId}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-err` : hint ? `${fieldId}-hint` : undefined}
        className={cn(error && 'border-destructive focus-visible:ring-destructive/40')}
        {...props}
      />
      {hint && !error && (
        <p id={`${fieldId}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${fieldId}-err`} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

/* ---------------------------------- SuccessState ---------------------------------- */
export function SuccessState({
  title,
  reference,
  nextSteps,
  onReset,
}: {
  title: string
  reference: string
  nextSteps: string[]
  onReset: () => void
}) {
  return (
    <div className="relative rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
      <ModuleTag ids={['SuccessState@1']} />
      <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
      <h3 className="mt-3 text-lg font-bold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Reference <span className="font-mono font-bold text-foreground">{reference}</span> — demo only, nothing was sent.
      </p>
      <ul className="mx-auto mt-4 max-w-sm space-y-1.5 text-left text-sm text-muted-foreground">
        {nextSteps.map((s, i) => (
          <li key={i} className="flex gap-2">
            <span className="font-mono text-xs text-emerald-500">{i + 1}.</span> {s}
          </li>
        ))}
      </ul>
      <Button variant="outline" size="sm" className="mt-5" onClick={onReset}>
        Submit another
      </Button>
    </div>
  )
}

function useInlineValidation() {
  const [values, setValues] = React.useState<Record<string, string>>({})
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [blurCount, setBlurCount] = React.useState(0)
  const set = (field: string, v: string) => {
    setValues((s) => ({ ...s, [field]: v }))
    if (blurCount > 0) setErrors((e) => ({ ...e, [field]: validators[field] ? validators[field](v) : '' }))
  }
  const blur = (field: string) => {
    setBlurCount((c) => c + 1)
    setErrors((e) => ({ ...e, [field]: validators[field] ? validators[field](values[field] ?? '') : '' }))
  }
  const validators: Record<string, (v: string) => string> = {
    name: (v) => (v.trim().length < 2 ? 'Please enter your full name' : ''),
    email: (v) => (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Enter a valid email address' : ''),
    phone: (v) => (v && !/^[+\d][\d\s-]{6,}$/.test(v) ? 'Enter a valid phone number' : ''),
    message: (v) => (v.trim().length < 10 ? 'A few more details help us route this correctly (min. 10 characters)' : ''),
  }
  const validateAll = () => {
    const next: Record<string, string> = {}
    Object.keys(validators).forEach((k) => {
      const err = validators[k](values[k] ?? '')
      if (err) next[k] = err
    })
    setErrors(next)
    return Object.keys(next).length === 0
  }
  return { values, set, errors, blur, validateAll, setValues }
}

/* ---------------------------------- ContactForm ---------------------------------- */
export function ContactForm({ subjects }: { subjects: string[] }) {
  const { values, set, errors, blur, validateAll, setValues } = useInlineValidation()
  const [subject, setSubject] = React.useState(subjects[0])
  const [consent, setConsent] = React.useState(false)
  const [sending, setSending] = React.useState(false)
  const [done, setDone] = React.useState<string | null>(null)
  const track = useFactory((s) => s.track)

  const started = React.useRef(false)
  const onStart = () => {
    if (!started.current) {
      started.current = true
      track('form_started', 'contact')
    }
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateAll() || !consent) return
    setSending(true)
    setTimeout(() => {
      setSending(false)
      const ref = `NF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
      setDone(ref)
      track('form_submitted', `contact:${subject}`)
    }, 900)
  }

  return (
    <Card>
      <ModuleTag ids={['ContactForm@1', 'FormField@1', 'InlineValidation@1']} className="top-0" />
      <CardContent className="p-6">
        {done ? (
          <SuccessState
            title="Message received"
            reference={done}
            nextSteps={['A dispatcher confirms within 15 minutes', 'The right specialist gets your details', 'You receive a fixed-price window by SMS']}
            onReset={() => {
              setDone(null)
              started.current = false
              setValues({})
            }}
          />
        ) : (
          <form onSubmit={submit} noValidate onFocus={onStart}>
            <div className="grid gap-4 @min-[640px]:grid-cols-2">
              <FormField
                label="Full name"
                requiredMark
                value={values.name ?? ''}
                onChange={(e) => set('name', e.target.value)}
                onBlur={() => blur('name')}
                error={errors.name}
                autoComplete="name"
              />
              <FormField
                label="Phone"
                hint="For urgent dispatch we call, not email"
                value={values.phone ?? ''}
                onChange={(e) => set('phone', e.target.value)}
                onBlur={() => blur('phone')}
                error={errors.phone}
                autoComplete="tel"
              />
              <FormField
                label="Email"
                requiredMark
                className="@min-[640px]:col-span-2"
                value={values.email ?? ''}
                onChange={(e) => set('email', e.target.value)}
                onBlur={() => blur('email')}
                error={errors.email}
                autoComplete="email"
              />
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Subject</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger aria-label="Subject"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 @min-[640px]:col-span-2">
                <Label htmlFor="cf-msg" className="text-sm font-medium">
                  What is happening? <span aria-hidden className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="cf-msg"
                  rows={4}
                  value={values.message ?? ''}
                  onChange={(e) => set('message', e.target.value)}
                  onBlur={() => blur('message')}
                  aria-invalid={!!errors.message}
                  className={cn(errors.message && 'border-destructive')}
                  placeholder="e.g. Water is coming through the kitchen ceiling since 11 pm…"
                />
                {errors.message && (
                  <p role="alert" className="text-xs font-medium text-destructive">{errors.message}</p>
                )}
              </div>
            </div>
            <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-muted-foreground">
              <Checkbox checked={consent} onCheckedChange={(v) => setConsent(Boolean(v))} className="mt-0.5" id="cf-consent" />
              <span>
                I agree that my details are used to process this request. Purpose-specific consent, revocable anytime.
              </span>
            </label>
            <Button type="submit" disabled={sending || !consent} className="mt-5 w-full gap-2 @min-[640px]:w-auto">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {sending ? 'Sending…' : 'Send request'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

/* ---------------------------------- CallNowPanel ---------------------------------- */
export function CallNowPanel({
  phone,
  hours,
  emergencyNote,
}: {
  phone: { display: string; href: string }
  hours: string
  emergencyNote: string
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-zinc-950 p-6 text-zinc-100 @min-[768px]:p-8">
      <ModuleTag ids={['CallNowPanel@1']} />
      <div aria-hidden className="factory-flow absolute inset-x-0 bottom-0 h-16 opacity-30" />
      <div className="relative">
        <Badge className="mb-3 bg-amber-500 text-zinc-950 hover:bg-amber-400">Emergency line</Badge>
        <p className="text-sm text-zinc-400">{hours}</p>
        <a
          href={phone.href}
          onClick={() => useFactory.getState().track('call_clicked', 'call-panel')}
          className="mt-2 block text-3xl font-black tracking-tight text-amber-400 transition hover:text-amber-300 @min-[640px]:text-4xl"
        >
          {phone.display}
        </a>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-400">{emergencyNote}</p>
      </div>
    </div>
  )
}

/* ---------------------------------- QuoteRequestForm ---------------------------------- */
export function QuoteRequestForm({ serviceOptions }: { serviceOptions: string[] }) {
  const [step, setStep] = React.useState(0)
  const [service, setService] = React.useState(serviceOptions[0])
  const [timeline, setTimeline] = React.useState('This week')
  const [description, setDescription] = React.useState('')
  const [contact, setContact] = React.useState({ name: '', email: '' })
  const [done, setDone] = React.useState<string | null>(null)
  const track = useFactory((s) => s.track)
  React.useEffect(() => {
    if (step === 0) track('quote_started', 'quote-request')
  }, [step])

  if (done) {
    return (
      <SuccessState
        title="Quote request in review"
        reference={done}
        nextSteps={['Survey slot proposals arrive by email', 'Fixed-price quote within 24 h of the survey', 'No obligation — quotes stay valid 30 days']}
        onReset={() => setDone(null)}
      />
    )
  }

  return (
    <Card>
      <ModuleTag ids={['QuoteRequestForm@2', 'FormProgress@2']} className="top-0" />
      <CardContent className="p-6">
        <div className="mb-6 flex items-center gap-2">
          {['Scope', 'Timing', 'Contact'].map((label, i) => (
            <React.Fragment key={label}>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                    i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {i + 1}
                </span>
                <span className={cn('text-xs font-semibold', i === step ? 'text-foreground' : 'text-muted-foreground')}>{label}</span>
              </div>
              {i < 2 && <div className={cn('h-px flex-1', i < step ? 'bg-primary' : 'bg-border')} />}
            </React.Fragment>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">What needs doing?</Label>
              <Select value={service} onValueChange={setService}>
                <SelectTrigger aria-label="Service"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {serviceOptions.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="qr-desc" className="text-sm font-medium">Describe the job (photos welcome on site)</Label>
              <Textarea id="qr-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Access situation, floor, existing installation…" />
            </div>
            <Button onClick={() => setStep(1)}>Continue <Send className="ml-1 h-3.5 w-3.5" /></Button>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Timeline</Label>
              <Select value={timeline} onValueChange={setTimeline}>
                <SelectTrigger aria-label="Timeline"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Emergency (today)', 'This week', 'Within 4 weeks', 'Planning phase'].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
              <Button onClick={() => setStep(2)}>Continue</Button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid gap-4 @min-[640px]:grid-cols-2">
              <FormField label="Name" requiredMark value={contact.name} onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))} />
              <FormField label="Email" requiredMark type="email" value={contact.email} onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button
                disabled={!contact.name || !contact.email.includes('@')}
                onClick={() => {
                  const ref = `QR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
                  setDone(ref)
                  track('quote_completed', `quote-request:${service}`)
                }}
              >
                Request quote
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* ---------------------------------- CallbackRequest (T3+) ---------------------------------- */
export function CallbackRequest() {
  const [phone, setPhone] = React.useState('')
  const [slot, setSlot] = React.useState('As soon as possible')
  const [done, setDone] = React.useState(false)
  return (
    <Card className="border-dashed">
      <ModuleTag ids={['CallbackRequest@3']} />
      <CardContent className="flex flex-col gap-4 p-6 @min-[640px]:flex-row @min-[640px]:items-end">
        {done ? (
          <p className="flex items-center gap-2 text-sm font-medium text-emerald-600">
            <CheckCircle2 className="h-4 w-4" /> Callback locked for &ldquo;{slot}&rdquo; — dispatcher rings from +49 211 555 0123.
          </p>
        ) : (
          <>
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="cb-phone" className="text-sm font-medium">Prefer we call you?</Label>
              <Input id="cb-phone" placeholder="+49 …" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="flex-1 space-y-1.5">
              <Label className="text-sm font-medium">When</Label>
              <Select value={slot} onValueChange={setSlot}>
                <SelectTrigger aria-label="Callback time"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['As soon as possible', 'This evening', 'Tomorrow morning'].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button disabled={phone.length < 6} onClick={() => setDone(true)}>Request callback</Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

/* ---------------------------------- BookingCalendar (T2+) ---------------------------------- */
export function BookingCalendar({
  serviceOptions,
  slots,
  confirmTitle,
  confirmSteps,
}: {
  serviceOptions: string[]
  slots: string[]
  confirmTitle: string
  confirmSteps: string[]
}) {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [slot, setSlot] = React.useState<string | null>(null)
  const [service, setService] = React.useState(serviceOptions[0])
  const [done, setDone] = React.useState<string | null>(null)
  const track = useFactory((s) => s.track)

  React.useEffect(() => {
    track('booking_started', 'calendar')
  }, [])

  if (done) {
    return (
      <SuccessState
        title={confirmTitle}
        reference={done}
        nextSteps={confirmSteps}
        onReset={() => setDone(null)}
      />
    )
  }

  return (
    <Card>
      <ModuleTag ids={['BookingCalendar@3', 'SuccessState@1']} className="top-0" />
      <CardContent className="grid gap-6 p-6 @min-[768px]:grid-cols-[300px_1fr]">
        <div>
          <Label className="mb-2 block text-sm font-medium">Pick a date</Label>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={{ before: new Date() }}
            className="rounded-lg border p-3"
          />
        </div>
        <div className="flex flex-col">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Service</Label>
            <Select value={service} onValueChange={setService}>
              <SelectTrigger aria-label="Service"><SelectValue /></SelectTrigger>
              <SelectContent>
                {serviceOptions.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="mt-5 flex items-center gap-2 text-sm font-semibold">
            <Clock className="h-4 w-4 text-primary" /> Available slots —{' '}
            {date ? date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : 'pick a date'}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {slots.map((s) => (
              <button
                key={s}
                onClick={() => setSlot(s)}
                aria-pressed={slot === s}
                className={cn(
                  'min-h-[44px] rounded-lg border px-4 py-2 font-mono text-sm transition',
                  slot === s ? 'border-primary bg-primary text-primary-foreground font-bold' : 'hover:border-primary/50',
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <Button
            size="lg"
            className="mt-auto w-full gap-2 pt-0"
            disabled={!slot}
            onClick={() => {
              const ref = `BK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
              setDone(ref)
              track('booking_completed', `${service} @ ${slot}`)
            }}
          >
            <CalendarCheck className="h-4 w-4" /> Confirm {slot ? `"${slot}"` : 'a slot'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/* ---------------------------------- MembershipSignup (T3+) ---------------------------------- */
export function MembershipSignup({
  plans,
  ctaLabel = 'Join now',
}: {
  plans: { name: string; priceMonthly: number; perks: string[]; popular?: boolean }[]
  ctaLabel?: string
}) {
  const [annual, setAnnual] = React.useState(false)
  const [joined, setJoined] = React.useState<string | null>(null)
  return (
    <div className="relative">
      <ModuleTag ids={['MembershipSignup@3']} className="top-0" />
      <div className="mb-6 flex justify-center">
        <div className="inline-flex rounded-full border p-1 text-sm">
          {[{ k: false, l: 'Monthly' }, { k: true, l: 'Annual · save 15%' }].map((o) => (
            <button
              key={o.l}
              onClick={() => setAnnual(o.k)}
              className={cn('rounded-full px-4 py-1.5 font-medium transition', annual === o.k ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>
      {joined ? (
        <SuccessState
          title={`Welcome to the ${joined}`}
          reference={`MB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`}
          nextSteps={['Confirmation sent (demo)', 'First benefit activates immediately', 'Cancel anytime from the member portal']}
          onReset={() => setJoined(null)}
        />
      ) : (
        <div className="grid gap-4 @min-[768px]:grid-cols-3">
          {plans.map((p) => {
            const price = annual ? Math.round(p.priceMonthly * 0.85) : p.priceMonthly
            return (
              <Card key={p.name} className={cn('relative', p.popular && 'border-primary shadow-lg')}>
                {p.popular && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 gap-1">
                    <Sparkles className="h-3 w-3" /> Most popular
                  </Badge>
                )}
                <CardContent className="p-6">
                  <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{p.name}</p>
                  <p className="mt-2 text-3xl font-black">
                    €{price}
                    <span className="text-sm font-medium text-muted-foreground">/mo{annual && ' billed annually'}</span>
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    {p.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {perk}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-6 w-full"
                    variant={p.popular ? 'default' : 'outline'}
                    onClick={() => {
                      setJoined(p.name)
                      useFactory.getState().track('form_submitted', `membership:${p.name}`)
                    }}
                  >
                    {ctaLabel}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ---------------------------------- NewsletterSignup (T2+) ---------------------------------- */
export function NewsletterSignup({ promise, frequency }: { promise: string; frequency: string }) {
  const [email, setEmail] = React.useState('')
  const [done, setDone] = React.useState(false)
  return (
    <div className="relative overflow-hidden rounded-2xl bg-zinc-950 p-6 text-zinc-100 @min-[768px]:p-10">
      <ModuleTag ids={['NewsletterSignup@2']} />
      <div aria-hidden className="factory-drift absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative grid items-center gap-6 @min-[768px]:grid-cols-2">
        <div>
          <Mail className="h-6 w-6 text-primary" />
          <h3 className="mt-3 text-xl font-bold @min-[640px]:text-2xl">{promise}</h3>
          <p className="mt-2 text-sm text-zinc-400">{frequency} · unsubscribe in one click · no sharing, ever.</p>
        </div>
        {done ? (
          <p className="flex items-center gap-2 text-sm font-medium text-emerald-400">
            <CheckCircle2 className="h-5 w-5" /> Subscribed (demo). First issue lands next Tuesday.
          </p>
        ) : (
          <form
            className="flex flex-col gap-2 @min-[640px]:flex-row"
            onSubmit={(e) => {
              e.preventDefault()
              if (email.includes('@')) {
                setDone(true)
                useFactory.getState().track('form_submitted', 'newsletter')
              }
            }}
          >
            <Input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email for newsletter"
              className="h-12 border-zinc-700 bg-zinc-900 text-zinc-100 placeholder:text-zinc-600"
            />
            <Button type="submit" className="h-12 px-6">Subscribe</Button>
          </form>
        )}
      </div>
    </div>
  )
}
