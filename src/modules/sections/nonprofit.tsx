import { ArrowUpRight, Heart } from 'lucide-react'
import type { ModuleDefinition } from '@/modules/types'
import { Container, buttonPrimary } from '@/modules/ui/primitives'

interface MissionPanelProps {
  title: string
  mission: string
  raised: string
  goal: string
  progressLabel: string
  donateLabel: string
  note: string
}

interface ImpactStatsProps extends MissionPanelProps {
  stats: Array<{ value: string; label: string }>
  reportLabel: string
}

function parseAmount(value: string): number | null {
  const digits = value.replace(/[^0-9.]/g, '')
  if (!digits) return null
  const parsed = Number.parseFloat(digits)
  return Number.isFinite(parsed) ? parsed : null
}

/** Width of the progress fill as a percentage, with a sensible fallback. */
function progressPercent(raised: string, goal: string): number {
  const raisedValue = parseAmount(raised)
  const goalValue = parseAmount(goal)
  if (raisedValue === null || goalValue === null || goalValue <= 0) return 60
  return Math.min(100, Math.max(0, (raisedValue / goalValue) * 100))
}

export function MissionProgressStory({
  title,
  mission,
  raised,
  goal,
  progressLabel,
  donateLabel,
  note,
}: MissionPanelProps) {
  const percent = progressPercent(raised, goal)

  return (
    <section className="bg-emerald-50 py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl leading-[1.2] text-stone-900">{title}</h2>
          <p className="mt-4 text-lg leading-[1.6] text-stone-700">{mission}</p>
          <div className="mt-10">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="font-display text-2xl text-emerald-900">{raised}</p>
              <p className="text-sm text-stone-600">{goal}</p>
            </div>
            <div
              className="mt-3 h-3 rounded-full bg-white"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(percent)}
              aria-label={progressLabel}
            >
              <div
                className="h-3 rounded-full bg-emerald-600"
                style={{ width: `${Math.round(percent * 10) / 10}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-stone-600">{progressLabel}</p>
            <button type="button" className={`${buttonPrimary} mt-8`}>
              <Heart className="h-4 w-4" aria-hidden="true" />
              {donateLabel}
            </button>
            <p className="mt-6 text-xs leading-[1.6] text-stone-500">{note}</p>
          </div>
        </div>
      </Container>
    </section>
  )
}

export function MissionImpactStats({
  title,
  mission,
  raised,
  goal,
  progressLabel,
  donateLabel,
  note,
  stats,
  reportLabel,
}: ImpactStatsProps) {
  return (
    <section className="bg-stone-900 py-16 text-white md:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl leading-[1.2] text-white md:text-4xl">{title}</h2>
        </div>
        <ul className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 text-center md:grid-cols-4">
          {stats.map((stat) => (
            <li key={stat.label}>
              <p className="font-display text-4xl text-emerald-400">{stat.value}</p>
              <p className="mt-2 text-sm text-stone-400">{stat.label}</p>
            </li>
          ))}
        </ul>
        <div className="mx-auto mt-12 max-w-2xl text-center">
          <p className="text-lg leading-[1.6] text-stone-300">{mission}</p>
          <a
            href="#report"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 underline decoration-emerald-400/40 underline-offset-4"
          >
            {reportLabel}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
        <div className="mt-12 border-t border-white/10 pt-8 text-center">
          <p className="text-sm text-stone-400">
            {raised} of {goal} · {progressLabel}
          </p>
          <button type="button" className={`${buttonPrimary} mt-5`}>
            <Heart className="h-4 w-4" aria-hidden="true" />
            {donateLabel}
          </button>
          <p className="mt-6 text-xs leading-[1.6] text-stone-500">{note}</p>
        </div>
      </Container>
    </section>
  )
}

export const nonprofitModules: ModuleDefinition[] = [
  {
    id: 'mission-panel',
    name: 'Mission panel',
    section: 'nonprofit',
    tier: 'Growth',
    purpose: 'The mission with a live sense of momentum: what is done, what is next, what your help does.',
    rule: 'Every ask ties to an outcome with a unit (\u2018one tree\u2019, \u2018one hot meal\u2019). Progress numbers must be current.',
    variants: [
      {
        id: 'a',
        label: 'Progress story',
        description: 'Mission statement with a raised-vs-goal progress bar and a donate CTA.',
        component: MissionProgressStory,
        defaults: {
          title: 'This spring: 60,000 trees for the Colne Valley',
          mission:
            'We work with farmers and schools to replant riverbanks and hedgerows across the Colne Valley — slowing floodwater, shading rivers and giving wildlife a corridor back. Every pound of this spring target pays for trees, guards and the people to plant them.',
          raised: '£48,250',
          goal: '£60,000',
          progressLabel: '80% of the spring target raised — thank you',
          donateLabel: 'Plant ten trees — £25',
          note: 'The Greenlight Trust is a registered charity in England & Wales, no. 1183647. 92p in every pound funds planting directly.',
        },
      },
      {
        id: 'b',
        label: 'Impact stats',
        description: 'A band of annual impact numbers with an annual-report link — accountability giving.',
        component: MissionImpactStats,
        defaults: {
          title: 'What we did in 2024',
          mission:
            'We replant riverbanks and hedgerows with the people who live beside them — slowing floods, shading rivers and bringing wildlife back.',
          raised: '£48,250',
          goal: '£60,000',
          progressLabel: '80% of the spring target raised',
          donateLabel: 'Plant ten trees — £25',
          note: 'The Greenlight Trust is a registered charity in England & Wales, no. 1183647. 92p in every pound funds planting directly.',
          stats: [
            { value: '128,400', label: 'trees planted since 2019' },
            { value: '61 km', label: 'riverbank restored' },
            { value: '36', label: 'schools running green clubs' },
            { value: '1,900', label: 'volunteers signed up' },
          ],
          reportLabel: 'Read the 2024 annual report',
        },
      },
    ],
  },
]
