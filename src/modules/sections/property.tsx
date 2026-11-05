import { Bath, BedDouble, Check, Phone, Ruler } from 'lucide-react'
import type { ModuleDefinition } from '@/modules/types'
import { Container, buttonPrimary, buttonSecondary } from '@/modules/ui/primitives'

interface ListingCardProps {
  price: string
  address: string
  beds: string
  baths: string
  area: string
  description: string
  features: string[]
  imageUrl: string
  imageAlt: string
  ctaLabel: string
}

interface ListingWideProps extends ListingCardProps {
  agent: string
  agentPhone: string
}

export function ListingSpecCard({
  price,
  address,
  beds,
  baths,
  area,
  description,
  features,
  imageUrl,
  imageAlt,
  ctaLabel,
}: ListingCardProps) {
  return (
    <section className="bg-white py-16 md:py-24">
      <Container>
        <article className="mx-auto max-w-3xl overflow-hidden rounded-3xl border bg-white">
          <div className="relative">
            <img src={imageUrl} alt={imageAlt} className="aspect-[16/10] w-full object-cover" loading="lazy" />
            <p className="absolute bottom-4 left-4 rounded-lg bg-white/95 px-4 py-2 font-display text-2xl text-emerald-900">
              {price}
            </p>
          </div>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-stone-900">{address}</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              <li className="flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-700">
                <BedDouble className="h-4 w-4 text-stone-500" aria-hidden="true" />
                {beds}
              </li>
              <li className="flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-700">
                <Bath className="h-4 w-4 text-stone-500" aria-hidden="true" />
                {baths}
              </li>
              <li className="flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-700">
                <Ruler className="h-4 w-4 text-stone-500" aria-hidden="true" />
                {area}
              </li>
            </ul>
            <p className="mt-5 text-sm leading-[1.7] text-stone-600">{description}</p>
            <ul className="mt-6 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-stone-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
            <a href="#contact" className={`${buttonPrimary} mt-8`}>
              {ctaLabel}
            </a>
          </div>
        </article>
      </Container>
    </section>
  )
}

export function ListingWideDetailRow({
  price,
  address,
  beds,
  baths,
  area,
  description,
  features,
  imageUrl,
  imageAlt,
  ctaLabel,
  agent,
  agentPhone,
}: ListingWideProps) {
  return (
    <section className="bg-stone-50 py-16 md:py-24">
      <Container className="grid items-center gap-8 md:grid-cols-5 md:gap-10">
        <div className="md:col-span-3">
          <img
            src={imageUrl}
            alt={imageAlt}
            className="aspect-[16/11] w-full rounded-3xl object-cover shadow-sm"
            loading="lazy"
          />
        </div>
        <div className="md:col-span-2">
          <p className="font-display text-4xl text-emerald-900">{price}</p>
          <h2 className="mt-2 text-lg font-medium text-stone-900">{address}</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            <li className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1 text-sm text-stone-700">
              <BedDouble className="h-4 w-4 text-stone-500" aria-hidden="true" />
              {beds}
            </li>
            <li className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1 text-sm text-stone-700">
              <Bath className="h-4 w-4 text-stone-500" aria-hidden="true" />
              {baths}
            </li>
            <li className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1 text-sm text-stone-700">
              <Ruler className="h-4 w-4 text-stone-500" aria-hidden="true" />
              {area}
            </li>
          </ul>
          <p className="mt-5 text-sm leading-[1.7] text-stone-600">{description}</p>
          <p className="mt-4 text-sm text-stone-600">{features.join(' · ')}</p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <a href="#contact" className={buttonSecondary}>
              {ctaLabel}
            </a>
            <p className="flex items-center gap-2 text-sm text-stone-700">
              <Phone className="h-4 w-4 text-emerald-800" aria-hidden="true" />
              {agent} · {agentPhone}
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}

export const propertyModules: ModuleDefinition[] = [
  {
    id: 'listing-card',
    name: 'Listing card',
    section: 'property',
    tier: 'Growth',
    purpose: 'A property listing with the facts buyers filter on: price, rooms, area.',
    rule: 'Bed, bath and area use the icons buyers scan for. Price is never a range.',
    variants: [
      {
        id: 'a',
        label: 'Spec photo card',
        description: 'Photo-led card with bed/bath/area chips and a feature list.',
        component: ListingSpecCard,
        defaults: {
          price: '£465,000',
          address: '14 Beechwood Avenue, Didsbury, Manchester M20',
          beds: '3',
          baths: '2',
          area: '1,150 sq ft',
          description:
            'A bay-fronted mid-terrace two minutes from the village, with a south-facing garden, a converted loft and a kitchen extended in 2021. Chain-free and ready to move into.',
          features: [
            'South-facing garden',
            'Converted loft (2021)',
            'Five minutes to Didsbury village',
            'New boiler with 10-year warranty',
          ],
          imageUrl: 'https://picsum.photos/seed/listing-1/940/650',
          imageAlt: 'The front of a red-brick terraced house with a small walled garden',
          ctaLabel: 'Arrange a viewing',
        },
        imageProps: ['imageUrl'],
      },
      {
        id: 'b',
        label: 'Wide detail row',
        description: 'Panoramic row: image left, room detail right — brochure feel.',
        component: ListingWideDetailRow,
        defaults: {
          price: '£725,000',
          address: '7 Overdale Lane, Didsbury, Manchester M20',
          beds: '4',
          baths: '3',
          area: '2,180 sq ft',
          description:
            'A detached family house on a quiet cul-de-sac, five minutes from the village. Four double bedrooms, a double garage and a garden that catches the sun from midday.',
          features: ['South-west facing garden', 'Double garage and driveway', 'New kitchen (2024)', 'Cul-de-sac location'],
          imageUrl: 'https://picsum.photos/seed/listing-2/940/650',
          imageAlt: 'A detached house with a driveway and a mature front garden',
          ctaLabel: 'Book a viewing',
          agent: 'Priya Sharma',
          agentPhone: '0161 555 0142',
        },
        imageProps: ['imageUrl'],
      },
    ],
  },
]
