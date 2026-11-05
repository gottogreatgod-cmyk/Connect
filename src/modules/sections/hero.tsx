import { ArrowRight } from 'lucide-react'
import type { ModuleDefinition } from '@/modules/types'
import { Container, buttonPrimary, buttonSecondary, eyebrowClass } from '@/modules/ui/primitives'

interface HeroEditorialProps {
  eyebrow: string
  headline: string
  subhead: string
  primaryLabel: string
  primaryHref: string
  secondaryLabel: string
  secondaryHref: string
  trustLine: string
}

export function HeroEditorial({
  eyebrow,
  headline,
  subhead,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  trustLine,
}: HeroEditorialProps) {
  return (
    <section id="top" className="bg-stone-50 py-24 md:py-32">
      <Container>
        <div className="max-w-3xl">
          <p className={eyebrowClass}>{eyebrow}</p>
          <h1 className="mt-5 font-display text-5xl leading-[1.1] text-stone-900 md:text-6xl">{headline}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-[1.5] text-stone-700">{subhead}</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a href={primaryHref} className={buttonPrimary}>
              {primaryLabel}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href={secondaryHref} className={buttonSecondary}>
              {secondaryLabel}
            </a>
          </div>
          <p className="mt-10 border-t border-stone-200 pt-6 text-sm text-stone-600">{trustLine}</p>
        </div>
      </Container>
    </section>
  )
}

interface HeroSplitProps {
  eyebrow: string
  headline: string
  subhead: string
  primaryLabel: string
  primaryHref: string
  imageUrl: string
  imageAlt: string
}

export function HeroSplit({ eyebrow, headline, subhead, primaryLabel, primaryHref, imageUrl, imageAlt }: HeroSplitProps) {
  return (
    <section className="bg-white py-20 md:py-28">
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className={eyebrowClass}>{eyebrow}</p>
          <h1 className="mt-5 font-display text-4xl leading-[1.15] text-stone-900 md:text-5xl">{headline}</h1>
          <p className="mt-6 text-lg leading-[1.5] text-stone-700">{subhead}</p>
          <a href={primaryHref} className={`${buttonPrimary} mt-10`}>
            {primaryLabel}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
        <div className="relative">
          <img
            src={imageUrl}
            alt={imageAlt}
            className="aspect-[4/5] w-full rounded-3xl object-cover shadow-xl"
            loading="eager"
          />
        </div>
      </Container>
    </section>
  )
}

export const heroModules: ModuleDefinition[] = [
  {
    id: 'hero',
    name: 'Hero',
    section: 'hero',
    tier: 'Starter',
    purpose: 'The opening statement: who you are, what you offer and one clear next step.',
    rule: 'One h1 per page. The hero states the value proposition in one sentence — never a generic welcome.',
    variants: [
      {
        id: 'a',
        label: 'Editorial',
        description: 'Large typographic opening with two calls to action and a trust line. No imagery needed.',
        component: HeroEditorial,
        defaults: {
          eyebrow: 'Design and build studio',
          headline: 'Websites that earn trust before the first click.',
          subhead:
            'We design and build clear, fast sites for small businesses, so your visitors understand what you offer within seconds.',
          primaryLabel: 'Start a project',
          primaryHref: '#contact',
          secondaryLabel: 'See our process',
          secondaryHref: '#process',
          trustLine: 'Trusted by 120+ local businesses across four cities.',
        },
      },
      {
        id: 'b',
        label: 'Split',
        description: 'Text on the left and a feature photograph on the right, for product or service pages.',
        component: HeroSplit,
        defaults: {
          eyebrow: 'Interior design',
          headline: 'Rooms that feel calm, considered and entirely yours.',
          subhead:
            'Our designers shape spaces around how you live, with warm materials, honest budgets and a clear plan from day one.',
          primaryLabel: 'Book a design call',
          primaryHref: '#contact',
          imageUrl: 'https://images.pexels.com/photos/8485649/pexels-photo-8485649.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
          imageAlt: 'A minimal dining room with a white table, stools and warm wooden floors',
        },
        imageProps: ['imageUrl'],
      },
    ],
  },
]
