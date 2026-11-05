import { useId, useState, type FormEvent } from 'react'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Gift,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from 'lucide-react'
import type { ModuleDefinition } from '@/modules/types'
import { Container, FormField, SectionHeading, buttonPrimary } from '@/modules/ui/primitives'

interface PrimaryCtaProps {
  title: string
  intro: string
  buttonLabel: string
  buttonHref: string
  note: string
}

export function CtaBoldBand({ title, intro, buttonLabel, buttonHref, note }: PrimaryCtaProps) {
  return (
    <section className="bg-emerald-800 py-20 text-white md:py-24">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-4xl leading-[1.15] md:text-5xl">{title}</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-[1.6] text-emerald-100/90">{intro}</p>
          <a
            href={buttonHref}
            className="mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-emerald-900 shadow-sm transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-800"
          >
            {buttonLabel}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <p className="mt-6 text-sm text-emerald-200/80">{note}</p>
        </div>
      </Container>
    </section>
  )
}

interface CtaReassuringPanelProps extends PrimaryCtaProps {
  bullets: string[]
  secondaryLabel: string
  secondaryHref: string
}

export function CtaReassuringPanel({
  title,
  intro,
  buttonLabel,
  buttonHref,
  note,
  bullets,
  secondaryLabel,
  secondaryHref,
}: CtaReassuringPanelProps) {
  return (
    <section className="bg-stone-50 py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-3xl rounded-3xl border border-stone-200 bg-white p-8 text-center md:p-12">
          <h2 className="font-display text-3xl leading-[1.2] text-stone-900 md:text-4xl">{title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-[1.6] text-stone-700">{intro}</p>
          <ul className="mx-auto mt-8 max-w-md space-y-3 text-left">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3 text-sm leading-[1.5] text-stone-700">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                {bullet}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href={buttonHref} className={buttonPrimary}>
              {buttonLabel}
            </a>
            <a
              href={secondaryHref}
              className="text-sm font-medium text-emerald-800 underline underline-offset-4 transition-colors hover:text-emerald-900"
            >
              {secondaryLabel}
            </a>
          </div>
          <p className="mt-10 flex items-start justify-center gap-2.5 border-t border-stone-100 pt-6 text-xs leading-[1.6] text-stone-500 sm:items-center">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
            {note}
          </p>
        </div>
      </Container>
    </section>
  )
}

interface ContactFormProps {
  title: string
  intro: string
  submitLabel: string
  responseNote: string
  successMessage: string
}

interface ContactValues {
  name: string
  email: string
  message: string
}

const EMPTY_CONTACT: ContactValues = { name: '', email: '', message: '' }

function useContactForm() {
  const [values, setValues] = useState<ContactValues>(EMPTY_CONTACT)
  const [submitted, setSubmitted] = useState(false)

  function update(key: keyof ContactValues) {
    return (value: string) => setValues((current) => ({ ...current, [key]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return { values, submitted, update, handleSubmit }
}

function ContactSuccessPanel({ successMessage }: { successMessage: string }) {
  return (
    <div
      role="status"
      className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center md:p-10"
    >
      <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-700" aria-hidden="true" />
      <p className="mt-4 text-sm font-medium leading-[1.6] text-emerald-900">{successMessage}</p>
    </div>
  )
}

export function ContactClassicForm({ title, intro, submitLabel, responseNote, successMessage }: ContactFormProps) {
  const uid = useId()
  const { values, submitted, update, handleSubmit } = useContactForm()

  return (
    <section className="bg-white py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-xl">
          <SectionHeading title={title} intro={intro} />
          {submitted ? (
            <div className="mt-10">
              <ContactSuccessPanel successMessage={successMessage} />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
              <FormField
                id={`${uid}-name`}
                label="Full name"
                value={values.name}
                onChange={update('name')}
                autoComplete="name"
                required
              />
              <FormField
                id={`${uid}-email`}
                label="Email address"
                type="email"
                value={values.email}
                onChange={update('email')}
                autoComplete="email"
                required
              />
              <FormField
                id={`${uid}-message`}
                label="How can we help?"
                multiline
                value={values.message}
                onChange={update('message')}
                required
              />
              <button type="submit" className={`${buttonPrimary} w-full`}>
                {submitLabel}
              </button>
              <p className="text-center text-xs text-stone-500">{responseNote}</p>
            </form>
          )}
        </div>
      </Container>
    </section>
  )
}

interface ContactSplitPanelProps extends ContactFormProps {
  phone: string
  email: string
  hours: string
  address: string
}

export function ContactSplitPanel({
  title,
  intro,
  submitLabel,
  responseNote,
  successMessage,
  phone,
  email,
  hours,
  address,
}: ContactSplitPanelProps) {
  const uid = useId()
  const { values, submitted, update, handleSubmit } = useContactForm()
  const dialable = phone.replace(/[^+\d]/g, '')

  const details = [
    { icon: Phone, label: 'Phone', value: phone, href: `tel:${dialable}` },
    { icon: Mail, label: 'Email', value: email, href: `mailto:${email}` },
    { icon: Clock, label: 'Hours', value: hours },
    { icon: MapPin, label: 'Office', value: address },
  ]

  return (
    <section className="bg-stone-50 py-16 md:py-24">
      <Container>
        <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-stone-200 bg-white lg:grid-cols-[1.15fr_1fr]">
          <div className="p-8 md:p-10">
            <h2 className="font-display text-2xl text-stone-900 md:text-3xl">{title}</h2>
            <p className="mt-3 text-sm leading-[1.6] text-stone-600">{intro}</p>
            {submitted ? (
              <div className="mt-8">
                <ContactSuccessPanel successMessage={successMessage} />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <FormField
                  id={`${uid}-name`}
                  label="Full name"
                  value={values.name}
                  onChange={update('name')}
                  autoComplete="name"
                  required
                />
                <FormField
                  id={`${uid}-email`}
                  label="Email address"
                  type="email"
                  value={values.email}
                  onChange={update('email')}
                  autoComplete="email"
                  required
                />
                <FormField
                  id={`${uid}-message`}
                  label="How can we help?"
                  multiline
                  value={values.message}
                  onChange={update('message')}
                  required
                />
                <button type="submit" className={`${buttonPrimary} w-full`}>
                  {submitLabel}
                </button>
                <p className="text-center text-xs text-stone-500">{responseNote}</p>
              </form>
            )}
          </div>
          <div className="border-t border-stone-200 bg-stone-50 p-8 md:p-10 lg:border-l lg:border-t-0">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Prefer to talk directly?
            </h3>
            <ul className="mt-7 space-y-6">
              {details.map((detail) => (
                <li key={detail.label} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-800/10 text-emerald-800">
                    <detail.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">{detail.label}</p>
                    {detail.href ? (
                      <a
                        href={detail.href}
                        className="mt-1 block text-sm font-medium text-stone-900 transition-colors hover:text-emerald-800"
                      >
                        {detail.value}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm font-medium leading-[1.5] text-stone-900">{detail.value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  )
}

interface NewsletterSignupProps {
  title: string
  placeholder: string
  buttonLabel: string
  note: string
}

function SubscribedMessage() {
  return (
    <p role="status" className="flex items-center gap-2.5 text-sm font-medium text-emerald-300">
      <Check className="h-5 w-5 shrink-0" aria-hidden="true" />
      You are on the list.
    </p>
  )
}

export function NewsletterInlineBar({ title, placeholder, buttonLabel, note }: NewsletterSignupProps) {
  const emailId = useId()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <section className="bg-stone-900 py-12 text-white md:py-14">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-12">
          <h2 className="font-display text-2xl leading-[1.25] text-white md:max-w-md md:text-3xl">{title}</h2>
          <div className="flex-1">
            {submitted ? (
              <SubscribedMessage />
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
                <label htmlFor={emailId} className="sr-only">
                  Email address
                </label>
                <input
                  id={emailId}
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={placeholder}
                  required
                  className="w-full flex-1 rounded-full border border-stone-700 bg-white px-5 py-3 text-sm text-stone-900 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="inline-flex shrink-0 items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900"
                >
                  {buttonLabel}
                </button>
              </form>
            )}
            <p className="mt-3 text-xs text-stone-400">{note}</p>
          </div>
        </div>
      </Container>
    </section>
  )
}

interface NewsletterPerksCardProps extends NewsletterSignupProps {
  perks: string[]
}

export function NewsletterPerksCard({ title, placeholder, buttonLabel, note, perks }: NewsletterPerksCardProps) {
  const emailId = useId()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <section className="bg-stone-50 py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-lg rounded-3xl border border-stone-200 bg-white p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-800/10 text-emerald-800">
            <Gift className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-5 font-display text-2xl text-stone-900">{title}</h2>
          <ul className="mt-6 space-y-3">
            {perks.map((perk) => (
              <li key={perk} className="flex gap-3 text-sm leading-[1.5] text-stone-700">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                {perk}
              </li>
            ))}
          </ul>
          {submitted ? (
            <div className="mt-8">
              <SubscribedMessage />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-3">
              <label htmlFor={emailId} className="sr-only">
                Email address
              </label>
              <input
                id={emailId}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={placeholder}
                required
                className="w-full rounded-full border border-stone-300 bg-white px-5 py-3 text-sm text-stone-900 placeholder:text-stone-500 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
              />
              <button type="submit" className={`${buttonPrimary} w-full`}>
                {buttonLabel}
              </button>
            </form>
          )}
          <p className="mt-4 text-xs text-stone-500">{note}</p>
        </div>
      </Container>
    </section>
  )
}

export const conversionModules: ModuleDefinition[] = [
  {
    id: 'primary-cta',
    name: 'Primary CTA',
    section: 'conversion',
    tier: 'Starter',
    purpose: 'The loudest moment on the page: one ask, one button, no competition.',
    rule: 'One primary action per band. Everything else is a secondary link at most.',
    variants: [
      {
        id: 'a',
        label: 'Bold band',
        description: 'A full-width colour band with a headline and a single filled button.',
        component: CtaBoldBand,
        defaults: {
          title: 'Get a clear plan for your next ninety days.',
          intro:
            'Book a complimentary strategy call. In forty-five minutes you will leave with three prioritised moves for your business — whether or not you ever hire us.',
          buttonLabel: 'Book a strategy call',
          buttonHref: '#contact',
          note: 'No obligation, no sales deck — just a senior consultant and a blank page.',
        },
      },
      {
        id: 'b',
        label: 'Reassuring panel',
        description: 'A bordered panel with benefit bullets, dual CTA and a guarantee line.',
        component: CtaReassuringPanel,
        defaults: {
          title: 'Get a clear plan for your next ninety days.',
          intro:
            'Book a complimentary strategy call. In forty-five minutes you will leave with three prioritised moves for your business — whether or not you ever hire us.',
          buttonLabel: 'Book a strategy call',
          buttonHref: '#contact',
          note: 'Every engagement is covered by our 30-day fit guarantee — if we are not the right advisors, you pay nothing beyond the discovery phase.',
          bullets: [
            'You talk to a senior consultant from the first call — never a salesperson',
            'A written summary of every recommendation within 48 hours',
            'Fixed-fee engagements with the price agreed before work begins',
          ],
          secondaryLabel: 'See how we work',
          secondaryHref: '#process',
        },
      },
    ],
  },
  {
    id: 'contact-form',
    name: 'Contact form',
    section: 'conversion',
    tier: 'Starter',
    purpose: 'The enquiry intake: name, contact and context with a clear promise of response.',
    rule: 'Ask only what you will actually use to reply. State the response time next to the button.',
    variants: [
      {
        id: 'a',
        label: 'Classic form',
        description: 'A centered, focused form with a response promise.',
        component: ContactClassicForm,
        defaults: {
          title: 'Tell us where the business is headed.',
          intro:
            'Share a few lines about your goals and where things feel stuck. A senior consultant will reply personally — never a bot and never a junior.',
          submitLabel: 'Send enquiry',
          responseNote: 'We reply within one business day, Monday to Friday.',
          successMessage:
            'Thank you — your enquiry is with our team. A senior consultant will reply personally within one business day.',
        },
      },
      {
        id: 'b',
        label: 'Split panel',
        description: 'Form on the left, direct contact details and hours on the right — for buyers who hate forms.',
        component: ContactSplitPanel,
        defaults: {
          title: 'Tell us where the business is headed.',
          intro:
            'Share a few lines about your goals and where things feel stuck. A senior consultant will reply personally — never a bot and never a junior.',
          submitLabel: 'Send enquiry',
          responseNote: 'We reply within one business day, Monday to Friday.',
          successMessage:
            'Thank you — your enquiry is with our team. A senior consultant will reply personally within one business day.',
          phone: '+1 (555) 014-8820',
          email: 'hello@brightpathadvisory.com',
          hours: 'Monday to Friday, 9:00–17:30 ET',
          address: 'Suite 4, 118 Wharf Street, Portland, ME',
        },
      },
    ],
  },
  {
    id: 'newsletter-signup',
    name: 'Newsletter sign-up',
    section: 'conversion',
    tier: 'Starter',
    purpose: 'Ongoing relationship capture for visitors not ready to buy.',
    rule: 'Sell the email with a concrete perk, and promise a frequency you can keep.',
    variants: [
      {
        id: 'a',
        label: 'Inline bar',
        description: 'A single-row email capture inside a colour band — zero friction.',
        component: NewsletterInlineBar,
        defaults: {
          title: 'The Friday Brief: five minutes of strategy, every other week.',
          placeholder: 'Work email',
          buttonLabel: 'Subscribe',
          note: 'Practical notes for owner-managed businesses. No pitches, and you can unsubscribe in one click.',
        },
      },
      {
        id: 'b',
        label: 'Perks card',
        description: 'A card that sells the newsletter with three perks before asking.',
        component: NewsletterPerksCard,
        defaults: {
          title: 'The Friday Brief',
          placeholder: 'Work email',
          buttonLabel: 'Subscribe',
          note: 'Every other Friday. No pitches, unsubscribe in one click.',
          perks: [
            'A five-minute strategy read written by a senior consultant, not a marketer',
            'Benchmark data from more than 200 advisory engagements',
            'First access to our quarterly planning workshops',
          ],
        },
      },
    ],
  },
]
