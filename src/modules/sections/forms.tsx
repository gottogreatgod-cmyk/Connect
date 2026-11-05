import { useState } from 'react'
import type { FormEvent } from 'react'
import { Check, CheckCircle2 } from 'lucide-react'
import type { ModuleDefinition } from '@/modules/types'
import { Container, FormField, buttonPrimary } from '@/modules/ui/primitives'

/** buttonPrimary / buttonSecondary sized down for the stepper footer (py-2). */
const buttonPrimarySm =
  'inline-flex items-center justify-center gap-2 rounded-full bg-emerald-800 px-6 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2'
const buttonSecondarySm =
  'inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-6 py-2 text-sm font-medium text-stone-900 transition-colors hover:border-stone-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2'

interface QuoteStep {
  title: string
  fields: string[]
}

interface QuoteFormProps {
  title: string
  intro: string
  steps: QuoteStep[]
  submitLabel: string
  successMessage: string
}

/** Stable field id from the field label, so input state survives moving between steps. */
function fieldId(label: string): string {
  return `quote-${label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')}`
}

export function QuoteStepper({ title, intro, steps, submitLabel, successMessage }: QuoteFormProps) {
  const [current, setCurrent] = useState(0)
  const [values, setValues] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const step = steps[current]
  const isLast = current === steps.length - 1
  const stepComplete = step.fields.every((field) => (values[field] ?? '').trim() !== '')

  const setValue = (field: string, value: string) => setValues((previous) => ({ ...previous, [field]: value }))

  return (
    <section className="bg-stone-50 py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl leading-[1.2] text-stone-900 md:text-4xl">{title}</h2>
          <p className="mt-3 text-base leading-[1.5] text-stone-700">{intro}</p>
        </div>
        <div className="mx-auto mt-10 max-w-2xl rounded-3xl border bg-white p-8">
          {submitted ? (
            <div className="py-4 text-center" role="status">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-700" aria-hidden="true" />
              <p className="mt-4 text-lg font-medium text-stone-900">{successMessage}</p>
            </div>
          ) : (
            <>
              <ol
                className="grid"
                style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
              >
                {steps.map((railStep, index) => {
                  const done = index < current
                  const active = index === current
                  const circleClass = done
                    ? 'bg-emerald-700 text-white'
                    : active
                      ? 'bg-white text-emerald-800 ring-2 ring-emerald-700'
                      : 'bg-stone-200 text-stone-500'
                  return (
                    <li key={railStep.title} className="flex flex-col items-center gap-2.5">
                      <div className="flex w-full items-center">
                        <span
                          aria-hidden="true"
                          className={`h-0.5 flex-1 ${
                            index === 0 ? 'bg-transparent' : index <= current ? 'bg-emerald-600' : 'bg-stone-200'
                          }`}
                        />
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${circleClass}`}
                        >
                          {done ? (
                            <Check className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            index + 1
                          )}
                        </span>
                        <span
                          aria-hidden="true"
                          className={`h-0.5 flex-1 ${
                            index === steps.length - 1
                              ? 'bg-transparent'
                              : index < current
                                ? 'bg-emerald-600'
                                : 'bg-stone-200'
                          }`}
                        />
                      </div>
                      <span
                        className={`px-1 text-center text-xs ${
                          active ? 'font-semibold text-stone-900' : 'text-stone-500'
                        }`}
                      >
                        {railStep.title}
                      </span>
                    </li>
                  )
                })}
              </ol>
              <p className="mt-8 text-center text-xs text-stone-500">
                Step {current + 1} of {steps.length}
              </p>
              <div className="mt-6 space-y-5">
                {step.fields.map((field) => (
                  <FormField
                    key={field}
                    id={fieldId(field)}
                    label={field}
                    value={values[field] ?? ''}
                    onChange={(value) => setValue(field, value)}
                    required
                  />
                ))}
              </div>
              <div className="mt-8 flex items-center justify-between gap-3 border-t border-stone-200 pt-6">
                <button
                  type="button"
                  disabled={current === 0}
                  onClick={() => setCurrent((value) => Math.max(0, value - 1))}
                  className={`${buttonSecondarySm} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!stepComplete}
                  onClick={() => (isLast ? setSubmitted(true) : setCurrent((value) => value + 1))}
                  className={`${buttonPrimarySm} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {isLast ? submitLabel : 'Next'}
                </button>
              </div>
            </>
          )}
        </div>
      </Container>
    </section>
  )
}

export function QuoteOnePage({ title, intro, steps, submitLabel, successMessage }: QuoteFormProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [consent, setConsent] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const allFields = steps.flatMap((step) => step.fields)
  const canSubmit = consent && allFields.every((field) => (values[field] ?? '').trim() !== '')

  const setValue = (field: string, value: string) => setValues((previous) => ({ ...previous, [field]: value }))

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (canSubmit) setSubmitted(true)
  }

  return (
    <section className="bg-white py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-2xl">
          {submitted ? (
            <div className="rounded-3xl border bg-stone-50 p-10 text-center" role="status">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-700" aria-hidden="true" />
              <p className="mt-4 text-lg font-medium text-stone-900">{successMessage}</p>
            </div>
          ) : (
            <>
              <h2 className="font-display text-3xl leading-[1.2] text-stone-900 md:text-4xl">{title}</h2>
              <p className="mt-3 text-base leading-[1.5] text-stone-700">{intro}</p>
              <form className="mt-10" onSubmit={handleSubmit}>
                {steps.map((step) => (
                  <fieldset
                    key={step.title}
                    className="border-b border-stone-200 py-8 first:pt-0 last:border-0 last:pb-0"
                  >
                    <legend className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
                      {step.title}
                    </legend>
                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                      {step.fields.map((field) => (
                        <FormField
                          key={field}
                          id={fieldId(field)}
                          label={field}
                          value={values[field] ?? ''}
                          onChange={(value) => setValue(field, value)}
                          required
                        />
                      ))}
                    </div>
                  </fieldset>
                ))}
                <label className="mt-2 flex items-start gap-3 text-sm leading-[1.5] text-stone-700">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(event) => setConsent(event.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-emerald-700"
                  />
                  <span>I agree to be contacted about my quote</span>
                </label>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={`${buttonPrimary} mt-8 w-full disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {submitLabel}
                </button>
              </form>
            </>
          )}
        </div>
      </Container>
    </section>
  )
}

const STEPS: QuoteStep[] = [
  {
    title: 'About you',
    fields: ['Full name', 'Email address'],
  },
  {
    title: 'Your property',
    fields: ['Property type', 'Estimated value', 'Year built'],
  },
  {
    title: 'Your cover',
    fields: ['Preferred start date', 'Anything we should know?'],
  },
]

export const formsModules: ModuleDefinition[] = [
  {
    id: 'multi-step-form',
    name: 'Multi-step form',
    section: 'forms',
    tier: 'Growth',
    purpose: 'Complex intake without overwhelm: one screen at a time with visible progress.',
    rule: 'Validate each step before advancing, let the visitor go back without losing input, and show what step X of Y they are on.',
    variants: [
      {
        id: 'a',
        label: 'Stepper',
        description: 'Three guided steps with a progress rail and back/next controls.',
        component: QuoteStepper,
        defaults: {
          title: 'Get a quote in three steps',
          intro: 'Three short steps and about two minutes. A named broker reviews every quote by hand before it reaches you.',
          steps: STEPS,
          submitLabel: 'Get my quote',
          successMessage: 'Thank you — your request is in. A broker will review your details and call you within one working day.',
        },
      },
      {
        id: 'b',
        label: 'One-page form',
        description: 'Every field visible with clear sections and an explicit consent step.',
        component: QuoteOnePage,
        defaults: {
          title: 'One form, every detail',
          intro: 'Your details, your property and your cover, all in one place. It takes about two minutes.',
          steps: STEPS,
          submitLabel: 'Get my quote',
          successMessage: 'Thank you — your request is in. A broker will review your details and call you within one working day.',
        },
      },
    ],
  },
]
