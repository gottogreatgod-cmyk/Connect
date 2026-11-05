import { MapPin } from 'lucide-react'
import type { ModuleDefinition } from '@/modules/types'
import { Container, SectionHeading, buttonSecondary } from '@/modules/ui/primitives'

/** buttonPrimary sized down for poster-style cards (py-2 / text-xs). */
const buttonPrimarySm =
  'inline-flex items-center justify-center gap-2 rounded-full bg-emerald-800 px-5 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2'

interface LineupEvent {
  day: string
  month: string
  title: string
  venue: string
  ctaLabel: string
}

interface EventCardsProps {
  title: string
  events: LineupEvent[]
}

interface ScheduleProps extends EventCardsProps {
  timeLabel: string
}

export function EventCards({ title, events }: EventCardsProps) {
  return (
    <section className="bg-white py-16 md:py-24">
      <Container>
        <SectionHeading title={title} />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {events.map((event) => (
            <article key={event.title} className="flex flex-col overflow-hidden rounded-3xl border bg-white">
              <div className="bg-emerald-800 p-5 text-center text-white">
                <p className="font-display text-4xl leading-none">{event.day}</p>
                <p className="mt-1.5 text-xs uppercase tracking-widest">{event.month}</p>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-semibold text-stone-900">{event.title}</h3>
                <p className="mt-2 flex items-start gap-1.5 text-sm text-stone-600">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" aria-hidden="true" />
                  {event.venue}
                </p>
                <div className="mt-auto pt-5">
                  <button type="button" className={buttonPrimarySm}>
                    {event.ctaLabel}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}

export function ScheduleTimeline({ title, events, timeLabel }: ScheduleProps) {
  const passLabel = events[0]?.ctaLabel || 'Get festival passes'

  return (
    <section className="bg-stone-50 py-16 md:py-24">
      <Container>
        <SectionHeading title={title} />
        <p className="mx-auto mt-8 max-w-2xl text-sm text-stone-600">{timeLabel}</p>
        <ol className="mx-auto mt-4 max-w-2xl">
          {events.map((event) => (
            <li key={event.title} className="grid grid-cols-[5rem_1fr] gap-6 border-b py-5 last:border-0">
              <div>
                <p className="font-display text-xl text-emerald-800">{event.day}</p>
                <p className="mt-0.5 text-xs text-stone-500">until {event.month}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-stone-900">{event.title}</h3>
                <p className="mt-1 text-sm text-stone-600">{event.venue}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex justify-center">
          <a href="#tickets" className={buttonSecondary}>
            {passLabel}
          </a>
        </div>
      </Container>
    </section>
  )
}

export const eventsModules: ModuleDefinition[] = [
  {
    id: 'event-lineup',
    name: 'Event lineup',
    section: 'events',
    tier: 'Growth',
    purpose: 'What is on, when and where — with a ticket path that never leaves the page.',
    rule: 'Dates in the visitor\u2019s format, venue named, and one ticket CTA repeated — not hidden after a click.',
    variants: [
      {
        id: 'a',
        label: 'Event cards',
        description: 'Poster-style cards with big date blocks — festival energy.',
        component: EventCards,
        defaults: {
          title: 'The 2025 lineup',
          events: [
            {
              day: '12',
              month: 'Jun',
              title: 'The Elliott Quartet — Kind of Blue at 65',
              venue: 'The Boathouse, Riverside Quarter',
              ctaLabel: 'Get tickets',
            },
            {
              day: '13',
              month: 'Jun',
              title: 'Nia Simmons Quintet',
              venue: 'St Aldhelm\u2019s Hall',
              ctaLabel: 'Get tickets',
            },
            {
              day: '14',
              month: 'Jun',
              title: 'Late Night Brass: An Ellington Revue',
              venue: 'The Printworks cellar bar',
              ctaLabel: 'Get tickets',
            },
          ],
        },
      },
      {
        id: 'b',
        label: 'Schedule timeline',
        description: 'A time-railed running order — conference clarity.',
        component: ScheduleTimeline,
        defaults: {
          title: 'The 2025 running order',
          timeLabel: 'Doors open 18:00. Under-16s come free with an adult. Sets end by 23:45.',
          events: [
            {
              day: '19:30',
              month: '22:00',
              title: 'The Elliott Quartet — Kind of Blue at 65',
              venue: 'The Boathouse, Riverside Quarter',
              ctaLabel: 'Get festival passes',
            },
            {
              day: '20:15',
              month: '23:00',
              title: 'Nia Simmons Quintet',
              venue: 'St Aldhelm\u2019s Hall',
              ctaLabel: 'Get festival passes',
            },
            {
              day: '21:00',
              month: '23:45',
              title: 'Late Night Brass: An Ellington Revue',
              venue: 'The Printworks cellar bar',
              ctaLabel: 'Get festival passes',
            },
          ],
        },
      },
    ],
  },
]
