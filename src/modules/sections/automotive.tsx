import { Fuel, Gauge } from 'lucide-react'
import type { ModuleDefinition } from '@/modules/types'
import { Container, SectionHeading } from '@/modules/ui/primitives'

interface VehicleHeroProps {
  name: string
  tagline: string
  price: string
  mileage: string
  imageUrl: string
  imageAlt: string
  specs: Array<{ label: string; value: string }>
}

interface VehicleStockProps {
  title: string
  vehicles: Array<{
    name: string
    year: string
    mileage: string
    fuel: string
    price: string
    imageUrl: string
    imageAlt: string
  }>
}

export function VehicleSpecHero({ name, tagline, price, mileage, imageUrl, imageAlt, specs }: VehicleHeroProps) {
  return (
    <section className="bg-stone-950 py-16 text-white md:py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <img src={imageUrl} alt={imageAlt} className="aspect-[4/3] w-full rounded-3xl object-cover" loading="lazy" />
        </div>
        <div>
          <h2 className="font-display text-4xl leading-[1.1] text-white">{name}</h2>
          <p className="mt-3 text-lg text-stone-400">{tagline}</p>
          <div className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <p className="font-display text-3xl text-emerald-400">{price}</p>
            <p className="flex items-center gap-2 text-sm text-stone-400">
              <Gauge className="h-4 w-4" aria-hidden="true" />
              {mileage}
            </p>
          </div>
          <dl className="mt-8 grid grid-cols-2 gap-4">
            {specs.map((spec) => (
              <div key={spec.label} className="rounded-2xl bg-white/5 p-4">
                <dt className="text-xs uppercase tracking-wider text-stone-400">{spec.label}</dt>
                <dd className="mt-1.5 text-sm font-semibold text-white">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  )
}

export function VehicleStockCards({ title, vehicles }: VehicleStockProps) {
  return (
    <section className="bg-stone-50 py-16 md:py-24">
      <Container>
        <SectionHeading title={title} />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {vehicles.map((vehicle) => (
            <article key={vehicle.name} className="flex flex-col overflow-hidden rounded-2xl border bg-white">
              <img
                src={vehicle.imageUrl}
                alt={vehicle.imageAlt}
                className="aspect-[16/10] w-full object-cover"
                loading="lazy"
              />
              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">{vehicle.year}</p>
                <h3 className="mt-1.5 text-lg font-semibold text-stone-900">{vehicle.name}</h3>
                <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-stone-600">
                  <span className="flex items-center gap-1.5">
                    <Gauge className="h-4 w-4 text-stone-400" aria-hidden="true" />
                    {vehicle.mileage}
                  </span>
                  <span aria-hidden="true" className="text-stone-300">
                    ·
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Fuel className="h-4 w-4 text-stone-400" aria-hidden="true" />
                    {vehicle.fuel}
                  </span>
                </p>
                <div className="mt-auto flex items-center justify-between gap-3 border-t border-stone-100 pt-5">
                  <p className="font-display text-xl text-stone-900">{vehicle.price}</p>
                  <a
                    href="#enquiry"
                    className="text-sm font-medium text-emerald-800 underline decoration-emerald-300 underline-offset-4"
                  >
                    Enquire
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}

export const automotiveModules: ModuleDefinition[] = [
  {
    id: 'vehicle-showcase',
    name: 'Vehicle showcase',
    section: 'automotive',
    tier: 'Business',
    purpose: 'A vehicle presented the way buyers evaluate it: hero shot plus hard specs.',
    rule: 'Specs must be comparable units (kW or hp — pick one site-wide). Mileage honest and visible.',
    variants: [
      {
        id: 'a',
        label: 'Spec hero',
        description: 'One vehicle, one screen: hero image and a technical spec grid.',
        component: VehicleSpecHero,
        defaults: {
          name: 'BMW 530e xDrive Saloon',
          tagline: 'One owner from new, full BMW service history, balance of warranty.',
          price: '£38,950',
          mileage: '24,500 km',
          imageUrl: 'https://picsum.photos/seed/vehicle-1/940/650',
          imageAlt: 'A grey BMW 5 Series saloon parked outside a dealership',
          specs: [
            { label: 'Engine', value: '2.0 L 4-cyl petrol, plug-in hybrid' },
            { label: 'Power', value: '215 kW' },
            { label: '0–100 km/h', value: '6.1 s' },
            { label: 'Fuel', value: 'Hybrid · 2.4 L/100 km' },
          ],
        },
        imageProps: ['imageUrl'],
      },
      {
        id: 'b',
        label: 'Stock cards',
        description: 'An inventory grid of vehicles with year, mileage and price — stocklist scanning.',
        component: VehicleStockCards,
        defaults: {
          title: 'In stock this week',
          vehicles: [
            {
              name: 'BMW 530e xDrive Saloon',
              year: '2022',
              mileage: '24,500 km',
              fuel: 'Hybrid',
              price: '£38,950',
              imageUrl: 'https://picsum.photos/seed/vehicle-2/940/650',
              imageAlt: 'A grey BMW 5 Series saloon on a showroom forecourt',
            },
            {
              name: 'Volvo XC60 Recharge',
              year: '2021',
              mileage: '41,200 km',
              fuel: 'Hybrid',
              price: '£36,400',
              imageUrl: 'https://picsum.photos/seed/vehicle-3/940/650',
              imageAlt: 'A black Volvo XC60 parked beside a dealership',
            },
            {
              name: 'Porsche Macan',
              year: '2020',
              mileage: '58,900 km',
              fuel: 'Petrol',
              price: '£42,750',
              imageUrl: 'https://picsum.photos/seed/vehicle-4/940/650',
              imageAlt: 'A dark blue Porsche Macan in a lit showroom',
            },
          ],
        },
      },
    ],
  },
]
