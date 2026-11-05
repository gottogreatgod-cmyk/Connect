import { Fragment } from 'react'
import { BarChart3, Check, HeartHandshake, Minus, Target, Zap } from 'lucide-react'
import type { ModuleDefinition } from '@/modules/types'
import { Container, SectionHeading, buttonPrimary, buttonSecondary } from '@/modules/ui/primitives'

const BENEFIT_ICONS = [Zap, Target, BarChart3, HeartHandshake]

interface Benefit {
  title: string
  text: string
}

interface BenefitGridProps {
  eyebrow: string
  title: string
  intro: string
  benefits: Benefit[]
}

export function BenefitCardGrid({ eyebrow, title, intro, benefits }: BenefitGridProps) {
  return (
    <section className="bg-white py-16 md:py-24">
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} intro={intro} />
        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => {
            const Icon = BENEFIT_ICONS[index % BENEFIT_ICONS.length]
            return (
              <li
                key={benefit.title}
                className="rounded-2xl border border-stone-200 bg-white p-6 transition-shadow hover:shadow-md"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-800/10 text-emerald-800">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-lg text-stone-900">{benefit.title}</h3>
                <p className="mt-2.5 text-sm leading-[1.6] text-stone-600">{benefit.text}</p>
              </li>
            )
          })}
        </ul>
      </Container>
    </section>
  )
}

export function BenefitNumberedEditorial({ eyebrow, title, intro, benefits }: BenefitGridProps) {
  return (
    <section className="bg-stone-50 py-16 md:py-24">
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} intro={intro} />
        <div className="mt-16 space-y-14 md:mt-20 md:space-y-20">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className={`flex flex-col gap-4 md:items-center md:justify-between md:gap-14 ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              <p
                className={`font-display text-5xl leading-none text-emerald-800 md:w-36 md:shrink-0 md:text-6xl ${
                  index % 2 === 0 ? 'md:text-left' : 'md:text-right'
                }`}
              >
                {String(index + 1).padStart(2, '0')}
              </p>
              <div className="max-w-xl">
                <h3 className="font-display text-2xl text-stone-900">{benefit.title}</h3>
                <p className="mt-3 text-base leading-[1.7] text-stone-700">{benefit.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

interface ProcessStep {
  title: string
  text: string
}

interface HowItWorksProps {
  eyebrow: string
  title: string
  steps: ProcessStep[]
}

export function ProcessHorizontalSteps({ eyebrow, title, steps }: HowItWorksProps) {
  return (
    <section className="bg-white py-16 md:py-24">
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} />
        <div className="relative mt-16 md:mt-20">
          <div
            aria-hidden="true"
            className="absolute top-6 hidden h-px bg-stone-300 md:left-[12.5%] md:right-[12.5%] md:block"
          />
          <ol className="grid gap-10 md:grid-cols-4 md:gap-8">
            {steps.map((step, index) => (
              <li key={step.title}>
                <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-800 font-display text-lg text-white">
                  {index + 1}
                </span>
                <h3 className="mt-5 font-display text-lg text-stone-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-[1.6] text-stone-600">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  )
}

export function ProcessVerticalTimeline({ eyebrow, title, steps }: HowItWorksProps) {
  return (
    <section className="bg-stone-50 py-16 md:py-24">
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} />
        <ol className="mx-auto mt-14 max-w-2xl">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-5 md:gap-6">
              <div aria-hidden="true" className="flex flex-col items-center">
                <span className="mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 border-emerald-800 bg-white" />
                {index < steps.length - 1 && <span className="mt-1.5 w-px flex-1 bg-stone-300" />}
              </div>
              <div className={index < steps.length - 1 ? 'pb-10 md:pb-12' : 'pb-0'}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
                  Step {index + 1}
                </p>
                <h3 className="mt-2 font-display text-xl text-stone-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-[1.7] text-stone-700">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}

interface PricingPlan {
  name: string
  price: string
  period: string
  blurb: string
  features: string[]
  highlighted: boolean
}

interface PricingTableProps {
  eyebrow: string
  title: string
  plans: PricingPlan[]
}

export function PricingTierCards({ eyebrow, title, plans }: PricingTableProps) {
  return (
    <section className="bg-stone-50 py-16 md:py-24">
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`relative flex flex-col rounded-3xl border bg-white p-8 ${
                plan.highlighted ? 'border-emerald-700 shadow-xl ring-1 ring-emerald-700' : 'border-stone-200'
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-800 px-3.5 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  Recommended
                </span>
              )}
              <h3 className="font-display text-xl text-stone-900">{plan.name}</h3>
              <p className="mt-2 text-sm leading-[1.5] text-stone-600">{plan.blurb}</p>
              <p className="mt-6 font-display text-4xl text-stone-900">
                {plan.price}
                <span className="ml-1.5 text-sm font-normal text-stone-500">{plan.period}</span>
              </p>
              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm leading-[1.5] text-stone-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <a href="#contact" className={`${plan.highlighted ? buttonPrimary : buttonSecondary} mt-8`}>
                {plan.highlighted ? `Start with ${plan.name}` : `Choose ${plan.name}`}
              </a>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}

export function PricingComparisonRows({ eyebrow, title, plans }: PricingTableProps) {
  const featureUnion = Array.from(new Set(plans.flatMap((plan) => plan.features)))
  const lastRow = featureUnion.length - 1

  return (
    <section className="bg-white py-16 md:py-24">
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} />
        <div className="mt-14 overflow-x-auto">
          <div
            className="grid min-w-[44rem] overflow-hidden rounded-2xl border border-stone-200 bg-white"
            style={{ gridTemplateColumns: `minmax(11rem, 1.5fr) repeat(${plans.length}, minmax(0, 1fr))` }}
          >
            <div className="border-b border-stone-200 px-5 py-5">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Features</span>
            </div>
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`border-b border-stone-200 px-4 py-5 text-center ${plan.highlighted ? 'bg-emerald-50' : ''}`}
              >
                <p className="font-display text-lg text-stone-900">
                  {plan.name}
                  {plan.highlighted && (
                    <span className="ml-2 rounded-full bg-emerald-800 px-2 py-0.5 align-middle text-[0.6rem] font-sans font-semibold uppercase tracking-wide text-white">
                      Recommended
                    </span>
                  )}
                </p>
                <p className="mt-1.5 text-sm text-stone-700">
                  <span className="font-semibold">{plan.price}</span>{' '}
                  <span className="text-xs text-stone-500">{plan.period}</span>
                </p>
              </div>
            ))}
            {featureUnion.map((feature, rowIndex) => {
              const zebra = rowIndex % 2 === 1 ? 'bg-stone-50' : ''
              const rowBorder = rowIndex === lastRow ? '' : 'border-b border-stone-100'
              return (
                <Fragment key={feature}>
                  <div className={`px-5 py-4 text-sm text-stone-700 ${zebra} ${rowBorder}`}>{feature}</div>
                  {plans.map((plan) => (
                    <div
                      key={`${feature}-${plan.name}`}
                      className={`flex items-center justify-center py-4 ${plan.highlighted ? 'bg-emerald-50' : zebra} ${rowBorder}`}
                    >
                      {plan.features.includes(feature) ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                          <span className="sr-only">Included</span>
                        </>
                      ) : (
                        <>
                          <Minus className="h-4 w-4 text-stone-300" aria-hidden="true" />
                          <span className="sr-only">Not included</span>
                        </>
                      )}
                    </div>
                  ))}
                </Fragment>
              )
            })}
          </div>
        </div>
      </Container>
    </section>
  )
}

const benefits: Benefit[] = [
  {
    title: 'Find the message that converts',
    text: 'We test positioning with real buyers before a cent of media is spent, so every campaign launches with words that already work.',
  },
  {
    title: 'Target the buyers who matter',
    text: 'Intent signals and clean attribution show you which channels bring customers — not just clicks — and where budget is quietly wasted.',
  },
  {
    title: 'See the numbers the board asks about',
    text: 'One dashboard ties every campaign to pipeline and revenue, reported in plain language on the first working day of each month.',
  },
  {
    title: 'Extend your team, not your headcount',
    text: 'Senior strategists, creatives and analysts plug in as your marketing department — no juniors learning on your budget.',
  },
]

const processSteps: ProcessStep[] = [
  {
    title: 'Audit the engine',
    text: 'Two weeks inside your analytics, funnel and customer interviews to find where revenue leaks today.',
  },
  {
    title: 'Agree the plan',
    text: 'A prioritised ninety-day roadmap with channel mix, budget and targets — signed off before any work starts.',
  },
  {
    title: 'Build and launch',
    text: 'Creative, landing pages and campaigns ship in weekly sprints, reviewed with you every Thursday.',
  },
  {
    title: 'Compound the wins',
    text: 'We double down on what converts and cut what does not, so month three costs less and sells more than month one.',
  },
]

const pricingPlans: PricingPlan[] = [
  {
    name: 'Launch',
    price: '$2,400',
    period: 'per month',
    blurb: 'For early teams finding their first repeatable channel.',
    features: [
      'Named strategist as your point of contact',
      'One paid channel managed end to end',
      'Landing page design and build',
      'Monthly performance report in plain language',
    ],
    highlighted: false,
  },
  {
    name: 'Growth',
    price: '$4,800',
    period: 'per month',
    blurb: 'For proven products ready to scale across channels.',
    features: [
      'Named strategist as your point of contact',
      'One paid channel managed end to end',
      'Up to three paid channels managed',
      'Landing page design and build',
      'Creative testing programme every month',
      'Monthly performance report in plain language',
      'Bi-weekly strategy working sessions',
    ],
    highlighted: true,
  },
  {
    name: 'Partner',
    price: '$9,500',
    period: 'per month',
    blurb: 'An embedded marketing team for scale-ups in aggressive growth.',
    features: [
      'Named strategist as your point of contact',
      'One paid channel managed end to end',
      'Up to three paid channels managed',
      'Unlimited channels and markets',
      'Landing page design and build',
      'Creative testing programme every month',
      'Bi-weekly strategy working sessions',
      'Weekly leadership reporting',
      'Annual strategy offsite facilitated',
    ],
    highlighted: false,
  },
]

export const valueModules: ModuleDefinition[] = [
  {
    id: 'benefit-grid',
    name: 'Benefit grid',
    section: 'value',
    tier: 'Starter',
    purpose: 'Three to six benefits in a scannable grid — the workhorse explanation block.',
    rule: 'Benefits are outcomes, not features. Each card earns its border with a verb-led title.',
    variants: [
      {
        id: 'a',
        label: 'Card grid',
        description: 'Bordered cards with icon, title and supporting text in a responsive grid.',
        component: BenefitCardGrid,
        defaults: {
          eyebrow: 'Why Fieldmark',
          title: 'Marketing that compounds instead of evaporating.',
          intro: 'We build the engine once — positioning, channels, creative — then tune it every month against numbers you can trust.',
          benefits,
        },
      },
      {
        id: 'b',
        label: 'Numbered editorial',
        description: 'Borderless numbered rows with alternating alignment — magazine pacing.',
        component: BenefitNumberedEditorial,
        defaults: {
          eyebrow: 'Why Fieldmark',
          title: 'Marketing that compounds instead of evaporating.',
          intro: 'We build the engine once — positioning, channels, creative — then tune it every month against numbers you can trust.',
          benefits,
        },
      },
    ],
  },
  {
    id: 'how-it-works',
    name: 'How it works',
    section: 'value',
    tier: 'Starter',
    purpose: 'The process in three or four steps so visitors know what happens next.',
    rule: 'Steps must be sequential and reassuring — never more than four, always ending in an outcome.',
    variants: [
      {
        id: 'a',
        label: 'Horizontal steps',
        description: 'Steps in a row joined by a connecting line — process at a glance.',
        component: ProcessHorizontalSteps,
        defaults: {
          eyebrow: 'How we work',
          title: 'From audit to a running engine in ninety days.',
          steps: processSteps,
        },
      },
      {
        id: 'b',
        label: 'Vertical timeline',
        description: 'A left rail with markers and room for detail — consultative feel.',
        component: ProcessVerticalTimeline,
        defaults: {
          eyebrow: 'How we work',
          title: 'From audit to a running engine in ninety days.',
          steps: processSteps,
        },
      },
    ],
  },
  {
    id: 'pricing-table',
    name: 'Pricing table',
    section: 'value',
    tier: 'Growth',
    purpose: 'Plans and prices side by side with one recommended path.',
    rule: 'Exactly one plan is highlighted. Prices include the period; every feature line is a complete phrase.',
    variants: [
      {
        id: 'a',
        label: 'Tier cards',
        description: 'Three plan cards with the recommended one elevated and highlighted.',
        component: PricingTierCards,
        defaults: {
          eyebrow: 'Pricing',
          title: 'Retainers sized to your stage.',
          plans: pricingPlans,
        },
      },
      {
        id: 'b',
        label: 'Comparison rows',
        description: 'A feature-matrix: features as rows, plans as columns — for considered B2B buying.',
        component: PricingComparisonRows,
        defaults: {
          eyebrow: 'Pricing',
          title: 'Retainers sized to your stage.',
          plans: pricingPlans,
        },
      },
    ],
  },
]
