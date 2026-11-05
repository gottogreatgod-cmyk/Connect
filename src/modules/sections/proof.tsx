import { useState } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import type { ModuleDefinition } from '@/modules/types'
import { Container, SectionHeading } from '@/modules/ui/primitives'

interface TrustItem {
  value: string
  label: string
}

interface TrustBarProps {
  items: TrustItem[]
}

export function TrustStatStrip({ items }: TrustBarProps) {
  return (
    <section aria-label="Track record" className="bg-stone-900 py-12 text-white md:py-16">
      <Container>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-10 text-center md:grid-cols-4">
          {items.map((item) => (
            <div key={item.label}>
              <dt className="font-display text-3xl text-emerald-300 md:text-4xl">{item.value}</dt>
              <dd className="mt-2 text-sm text-stone-400">{item.label}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  )
}

export function TrustClientStrip({ items }: TrustBarProps) {
  return (
    <section aria-label="Selected clients" className="border-y border-stone-200 bg-white py-10 md:py-12">
      <Container>
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 text-center md:grid-cols-4">
          {items.map((item) => (
            <div key={item.value}>
              <p className="font-display text-xl text-stone-400">{item.value}</p>
              <p className="mt-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-stone-500">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

interface Review {
  quote: string
  name: string
  role: string
  rating: number
}

interface ReviewCarouselProps {
  eyebrow: string
  title: string
  reviews: Review[]
}

function Stars({ rating, starClass }: { rating: number; starClass: string }) {
  return (
    <span className="inline-flex gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, star) => (
        <Star
          key={star}
          className={`${starClass} ${star < rating ? 'fill-emerald-500 text-emerald-500' : 'text-stone-300'}`}
          aria-hidden="true"
        />
      ))}
    </span>
  )
}

export function ReviewQuoteCarousel({ eyebrow, title, reviews }: ReviewCarouselProps) {
  const [index, setIndex] = useState(0)
  const count = reviews.length
  const current = reviews[index % count]

  const step = (delta: number) => setIndex((value) => (value + delta + count) % count)

  return (
    <section className="bg-stone-50 py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading eyebrow={eyebrow} title={title} />
          <div aria-live="polite" className="mt-12">
            <Stars rating={current.rating} starClass="h-4 w-4" />
            <blockquote className="mt-8 font-display text-2xl leading-[1.35] text-stone-900 md:text-3xl">
              &ldquo;{current.quote}&rdquo;
            </blockquote>
            <p className="mt-8 text-sm text-stone-600">
              <span className="font-semibold text-stone-900">{current.name}</span> · {current.role}
            </p>
          </div>
          <div className="mt-10 flex items-center justify-center gap-5">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous review"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 text-stone-700 transition-colors hover:border-stone-500 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <div className="flex gap-2.5">
              {reviews.map((review, dotIndex) => (
                <button
                  key={review.name}
                  type="button"
                  onClick={() => setIndex(dotIndex)}
                  aria-label={`Show review ${dotIndex + 1} of ${count}`}
                  aria-current={dotIndex === index ? 'true' : undefined}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    dotIndex === index ? 'bg-emerald-700' : 'bg-stone-300 hover:bg-stone-400'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next review"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 text-stone-700 transition-colors hover:border-stone-500 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </Container>
    </section>
  )
}

export function ReviewPraiseWall({ eyebrow, title, reviews }: ReviewCarouselProps) {
  return (
    <section className="bg-white py-16 md:py-24">
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} />
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, index) => (
            <figure
              key={review.name}
              className={`flex flex-col rounded-2xl border border-stone-200 p-6 ${index % 3 === 1 ? 'lg:mt-10' : ''}`}
            >
              <Stars rating={review.rating} starClass="h-3.5 w-3.5" />
              <blockquote className="mt-4 flex-1 text-sm leading-[1.7] text-stone-700">
                &ldquo;{review.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 border-t border-stone-100 pt-4">
                <span className="text-sm font-semibold text-stone-900">{review.name}</span>
                <span className="mt-0.5 block text-xs text-stone-500">{review.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  )
}

const statItems: TrustItem[] = [
  { value: '12+', label: 'Years in the trade' },
  { value: '480', label: 'Renovations completed' },
  { value: '96%', label: 'Clients who refer us' },
  { value: '5.0', label: 'Average rating, 214 reviews' },
]

const clientItems: TrustItem[] = [
  { value: 'The Harrow Inn', label: 'Hospitality' },
  { value: 'Maple Street Lofts', label: 'Residential' },
  { value: 'Cedar & Sage', label: 'Retail' },
  { value: 'Bramble Hall', label: 'Heritage' },
]

const carouselReviews: Review[] = [
  {
    quote:
      'They turned our dark 1990s kitchen into the room the whole family gathers in — and finished four days early.',
    name: 'Margaret Ellison',
    role: 'Kitchen renovation · Waverley',
    rating: 5,
  },
  {
    quote:
      'The quote never moved, the site was hoovered every Friday, and the bathroom now feels like a boutique hotel.',
    name: 'Daniel Okafor',
    role: 'Bathroom renovation · Larch Hill',
    rating: 5,
  },
  {
    quote:
      'The window order slipped a week, but they told us the day it happened and the finished loft was worth the wait.',
    name: 'Priya Raman',
    role: 'Loft conversion · Fenwick',
    rating: 4,
  },
]

const wallReviews: Review[] = [
  ...carouselReviews,
  {
    quote:
      'Our 1908 terrace has its original cornice back, plus modern insulation — and heating bills down by a third.',
    name: 'Alice Whitfield',
    role: 'Period restoration · Southgate',
    rating: 5,
  },
  {
    quote: 'They matched the reclaimed floorboards so well you cannot find the seam.',
    name: 'Gordon Fry',
    role: 'Living room · Ashcombe',
    rating: 5,
  },
  {
    quote: 'Two ensuites, one tidy crew, and the final invoice matched the quote to the penny.',
    name: 'Nadia Brooks',
    role: 'Ensuite renovations · Harrowden',
    rating: 5,
  },
]

export const proofModules: ModuleDefinition[] = [
  {
    id: 'trust-bar',
    name: 'Trust bar',
    section: 'proof',
    tier: 'Starter',
    purpose: 'Instant credibility: numbers or recognizable names in one thin strip.',
    rule: 'No fake logos and no vanity metrics — every number needs a label a customer actually cares about.',
    variants: [
      {
        id: 'a',
        label: 'Stat strip',
        description: 'Four big numbers with labels — quantified outcomes.',
        component: TrustStatStrip,
        defaults: {
          items: statItems,
        },
      },
      {
        id: 'b',
        label: 'Client strip',
        description: 'A calm row of client names — recognition by reputation.',
        component: TrustClientStrip,
        defaults: {
          items: clientItems,
        },
      },
    ],
  },
  {
    id: 'review-carousel',
    name: 'Review carousel',
    section: 'proof',
    tier: 'Growth',
    purpose: 'Customer voices carrying the persuasion, one focused quote at a time.',
    rule: 'Real-sounding specifics beat superlatives. Every quote names a person and an outcome.',
    variants: [
      {
        id: 'a',
        label: 'Quote carousel',
        description: 'One large quote at a time with prev/next controls and dots.',
        component: ReviewQuoteCarousel,
        defaults: {
          eyebrow: 'Client stories',
          title: 'Homes we have brought back to life.',
          reviews: carouselReviews,
        },
      },
      {
        id: 'b',
        label: 'Praise wall',
        description: 'Six short quotes in a masonry-feel grid — volume of love.',
        component: ReviewPraiseWall,
        defaults: {
          eyebrow: 'Client stories',
          title: 'Homes we have brought back to life.',
          reviews: wallReviews,
        },
      },
    ],
  },
]
