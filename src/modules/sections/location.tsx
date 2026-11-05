import { CalendarCheck, MapPin, Navigation, Train } from 'lucide-react'
import type { ModuleDefinition } from '@/modules/types'
import { Container, MapPlaceholder, buttonPrimary, buttonSecondary, eyebrowClass } from '@/modules/ui/primitives'

interface OpeningHour {
  day: string
  time: string
}

/**
 * JS gives Sunday=0..Saturday=6; our hours arrays run Monday-first, so shift
 * by one to find the row that represents today.
 */
function mondayFirstTodayIndex(): number {
  return (new Date().getDay() + 6) % 7
}

function directionsHrefFor(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

interface LocationMapCardProps {
  title: string
  address: string
  note: string
  directionsLabel: string
}

export function LocationMapCard({ title, address, note, directionsLabel }: LocationMapCardProps) {
  return (
    <section className="bg-white py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          <div className="h-56 border-b border-stone-200 p-4">
            <MapPlaceholder label={`Map: ${address}`} />
          </div>
          <div className="p-6 md:p-8">
            <h2 className="font-display text-3xl leading-[1.2] text-stone-900">{title}</h2>
            <address className="mt-5 flex items-start gap-3 not-italic">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-emerald-800" aria-hidden="true" />
              <span className="text-base leading-[1.6] text-stone-700">{address}</span>
            </address>
            <p className="mt-4 text-sm leading-[1.6] text-stone-600">{note}</p>
            <a
              href={directionsHrefFor(address)}
              target="_blank"
              rel="noreferrer"
              className={`${buttonSecondary} mt-8`}
            >
              <Navigation className="h-4 w-4" aria-hidden="true" />
              {directionsLabel}
            </a>
          </div>
        </div>
      </Container>
    </section>
  )
}

interface LocationHoursCardProps {
  title: string
  address: string
  note: string
  directionsLabel: string
  hours: OpeningHour[]
  transport: string
}

export function LocationHoursCard({ title, address, note, directionsLabel, hours, transport }: LocationHoursCardProps) {
  return (
    <section className="bg-stone-50 py-16 md:py-24">
      <Container>
        <h2 className="font-display text-3xl leading-[1.2] text-stone-900 md:text-4xl">{title}</h2>
        <div className="mt-10 grid gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <h3 className={eyebrowClass}>Opening hours</h3>
            <ul className="mt-5">
              {hours.map((entry) => (
                <li
                  key={entry.day}
                  className="flex items-baseline justify-between border-b border-dashed border-stone-300 py-3 text-sm last:border-b-0"
                >
                  <span className="text-stone-700">{entry.day}</span>
                  <span className="font-medium tabular-nums text-stone-900">{entry.time}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className={eyebrowClass}>Finding us</h3>
            <address className="mt-5 flex items-start gap-3 not-italic">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-emerald-800" aria-hidden="true" />
              <span className="text-base leading-[1.6] text-stone-700">{address}</span>
            </address>
            <p className="mt-4 flex items-start gap-3 text-sm leading-[1.6] text-stone-700">
              <Train className="mt-0.5 h-4 w-4 shrink-0 text-emerald-800" aria-hidden="true" />
              <span>{transport}</span>
            </p>
            <p className="mt-4 text-sm leading-[1.6] text-stone-600">{note}</p>
            <a
              href={directionsHrefFor(address)}
              target="_blank"
              rel="noreferrer"
              className={`${buttonPrimary} mt-8`}
            >
              <Navigation className="h-4 w-4" aria-hidden="true" />
              {directionsLabel}
            </a>
          </div>
        </div>
      </Container>
    </section>
  )
}

interface HoursWeekTableProps {
  title: string
  hours: OpeningHour[]
}

export function HoursWeekTable({ title, hours }: HoursWeekTableProps) {
  const todayIndex = mondayFirstTodayIndex()

  return (
    <section className="bg-stone-50 py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-md">
          <h2 className="text-center font-display text-3xl leading-[1.2] text-stone-900">{title}</h2>
          <ul className="mt-8 space-y-1.5 text-sm">
            {hours.map((entry, index) => {
              const isToday = index === todayIndex
              return (
                <li
                  key={entry.day}
                  aria-current={isToday ? 'date' : undefined}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 ${
                    isToday ? 'bg-emerald-50 font-medium text-emerald-900' : 'text-stone-700'
                  }`}
                >
                  <span>{entry.day}</span>
                  <span className="flex items-center gap-2 tabular-nums">
                    {entry.time}
                    {isToday && (
                      <span className="rounded-full bg-emerald-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                        Today
                      </span>
                    )}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      </Container>
    </section>
  )
}

interface HoursTodayCardProps {
  title: string
  hours: OpeningHour[]
  openLabel: string
}

export function HoursTodayCard({ title, hours, openLabel }: HoursTodayCardProps) {
  const todayIndex = mondayFirstTodayIndex()

  return (
    <section className="bg-white py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-md">
          <h2 className="text-center font-display text-3xl leading-[1.2] text-stone-900">{title}</h2>
          <div className="mt-8 flex items-center gap-5 rounded-2xl bg-emerald-50 p-6">
            <CalendarCheck className="h-9 w-9 shrink-0 text-emerald-800" aria-hidden="true" />
            <p className="font-display text-2xl leading-snug text-emerald-950">{openLabel}</p>
          </div>
          <ul className="mt-6 space-y-3 text-sm">
            {hours.map((entry, index) => {
              const isToday = index === todayIndex
              return (
                <li
                  key={entry.day}
                  aria-current={isToday ? 'date' : undefined}
                  className={`flex items-center justify-between ${isToday ? 'font-semibold text-emerald-900' : 'text-stone-700'}`}
                >
                  <span className="flex items-center gap-2">
                    {entry.day}
                    {isToday && (
                      <span className="rounded-full bg-emerald-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                        Today
                      </span>
                    )}
                  </span>
                  <span className="tabular-nums">{entry.time}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </Container>
    </section>
  )
}

const FLOUR_ROOM_HOURS: OpeningHour[] = [
  { day: 'Monday', time: '07:00 – 16:00' },
  { day: 'Tuesday', time: '07:00 – 16:00' },
  { day: 'Wednesday', time: '07:00 – 16:00' },
  { day: 'Thursday', time: '07:00 – 16:00' },
  { day: 'Friday', time: '07:00 – 17:00' },
  { day: 'Saturday', time: '08:00 – 17:00' },
  { day: 'Sunday', time: '09:00 – 14:00' },
]

export const locationModules: ModuleDefinition[] = [
  {
    id: 'location-card',
    name: 'Location card',
    section: 'location',
    tier: 'Starter',
    purpose: 'Where you are and how to reach you, in the format locals actually use.',
    rule: 'Address exactly as maps would print it. One primary action: directions.',
    variants: [
      {
        id: 'a',
        label: 'Map card',
        description: 'A map block with address and directions action.',
        component: LocationMapCard,
        defaults: {
          title: 'The Flour Room',
          address: '14 Ellsworth Street, Kingsdown, Bristol BS6 5TR',
          note: 'We bake twice a day — the second batch leaves the oven around four. Look for the green awning opposite the church.',
          directionsLabel: 'Get directions',
        },
      },
      {
        id: 'b',
        label: 'Hours & directions',
        description: 'Opening hours and getting-there detail in a two-column split.',
        component: LocationHoursCard,
        defaults: {
          title: 'Find the bakery',
          address: '14 Ellsworth Street, Kingsdown, Bristol BS6 5TR',
          note: 'The queue moves fast and the sourdough usually sells out by noon on Saturdays.',
          directionsLabel: 'Get directions',
          hours: FLOUR_ROOM_HOURS,
          transport:
            'Lawrence Hill station is a seven-minute walk, and the 5 and 25 buses stop directly outside the door.',
        },
      },
    ],
  },
  {
    id: 'hours-table',
    name: 'Hours table',
    section: 'location',
    tier: 'Starter',
    purpose: 'Plain opening hours — the most-looked-up fact on a local site.',
    rule: 'Highlight today if you can compute it; never let special hours drift from the main table.',
    variants: [
      {
        id: 'a',
        label: 'Week table',
        description: 'A calm seven-row table with a today marker.',
        component: HoursWeekTable,
        defaults: {
          title: 'Opening hours',
          hours: FLOUR_ROOM_HOURS,
        },
      },
      {
        id: 'b',
        label: 'Today hero',
        description: 'A big today status card above the compact week list.',
        component: HoursTodayCard,
        defaults: {
          title: 'Opening hours',
          hours: FLOUR_ROOM_HOURS,
          openLabel: 'Open today · 07:00 – 16:00',
        },
      },
    ],
  },
]
