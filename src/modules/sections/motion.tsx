import { useId, useState, type KeyboardEvent } from 'react'
import type { ModuleDefinition } from '@/modules/types'
import { Container, SectionHeading } from '@/modules/ui/primitives'

interface Tab {
  label: string
  heading: string
  text: string
  imageUrl: string
  imageAlt: string
}

interface TabShowcaseProps {
  eyebrow: string
  title: string
  tabs: Tab[]
}

const DARK_EYEBROW = 'text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300'

export function MotionTabShowcase({ eyebrow, title, tabs }: TabShowcaseProps) {
  const [active, setActive] = useState(0)
  const [panelVisible, setPanelVisible] = useState(true)
  const baseId = useId()

  const current = tabs[active]

  /**
   * Swapping the tab remounts the panel (key change) at opacity 0; the next
   * animation frame flips it to opacity 1, so the CSS transition plays once.
   * With reduced motion the transition class is dropped and the swap is instant.
   */
  function select(index: number) {
    if (index === active) return
    setActive(index)
    setPanelVisible(false)
    requestAnimationFrame(() => setPanelVisible(true))
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const step = event.key === 'ArrowRight' ? 1 : -1
    select((active + step + tabs.length) % tabs.length)
  }

  return (
    <section className="bg-stone-950 py-20 text-stone-100 md:py-28">
      <Container>
        <p className={DARK_EYEBROW}>{eyebrow}</p>
        <h2 className="mt-4 max-w-3xl font-display text-3xl leading-[1.15] text-white md:text-4xl">{title}</h2>

        <div role="tablist" aria-label="How a project runs" className="mt-10 flex flex-wrap gap-x-8 gap-y-2 border-b border-stone-800">
          {tabs.map((tab, index) => {
            const isActive = index === active
            return (
              <button
                key={tab.label}
                id={`${baseId}-tab-${index}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`${baseId}-panel`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => select(index)}
                onKeyDown={handleKeyDown}
                className={`-mb-px border-b-2 pb-4 pt-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950 ${
                  isActive ? 'border-emerald-400 text-white' : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <div id={`${baseId}-panel`} role="tabpanel" aria-labelledby={`${baseId}-tab-${active}`} className="mt-10">
          <div
            key={active}
            className={`grid items-center gap-10 transition-opacity duration-300 md:grid-cols-2 md:gap-14 motion-reduce:transition-none ${
              panelVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div>
              <h3 className="font-display text-3xl leading-[1.15] text-white">{current.heading}</h3>
              <p className="mt-5 max-w-lg text-base leading-[1.6] text-stone-300">{current.text}</p>
            </div>
            <img
              src={current.imageUrl}
              alt={current.imageAlt}
              loading="lazy"
              className="aspect-[4/3] w-full rounded-3xl border border-white/10 object-cover"
            />
          </div>
        </div>
      </Container>
    </section>
  )
}

interface HoverRevealsProps {
  eyebrow: string
  title: string
  tabs: Tab[]
}

export function MotionHoverReveals({ eyebrow, title, tabs }: HoverRevealsProps) {
  return (
    <section className="bg-white py-16 md:py-24">
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} />
        <ul className="mt-14 grid gap-6 md:grid-cols-3">
          {tabs.map((tab) => (
            <li key={tab.label} className="group relative overflow-hidden rounded-2xl bg-stone-200">
              <img
                src={tab.imageUrl}
                alt={tab.imageAlt}
                loading="lazy"
                className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-transparent p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">{tab.label}</p>
                <h3 className="mt-2 font-display text-2xl leading-snug text-white line-clamp-2">{tab.heading}</h3>
                <p className="mt-2 text-sm leading-[1.5] text-stone-300 line-clamp-3">{tab.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}

const ATELIER_NORD_TABS: Tab[] = [
  {
    label: 'Research',
    heading: 'Every decision starts with evidence.',
    text: 'Weeks one and two are spent in the field: stakeholder interviews, an analytics teardown and competitive sweeps. We leave with a written set of problems worth solving — and the ones we agreed to ignore.',
    imageUrl: 'https://picsum.photos/seed/atelier-nord-1/940/650',
    imageAlt: "A designer's desk covered in research notes and printed screenshots",
  },
  {
    label: 'Design',
    heading: 'Interfaces that feel inevitable.',
    text: 'We design in short loops — one direction at a time, tested with real users each Friday. By handover day nothing in the system is there by accident.',
    imageUrl: 'https://picsum.photos/seed/atelier-nord-2/940/650',
    imageAlt: 'A wall of pinned interface designs being reviewed by two people',
  },
  {
    label: 'Motion',
    heading: 'Movement with a reason.',
    text: 'Animation explains hierarchy, never decorates it. Panels cross-fade on request, transitions stay under 300 milliseconds, and every effect respects reduced-motion settings.',
    imageUrl: 'https://picsum.photos/seed/atelier-nord-3/940/650',
    imageAlt: 'A product designer adjusting motion timing curves on a large monitor',
  },
]

export const motionModules: ModuleDefinition[] = [
  {
    id: 'interactive-tabs',
    name: 'Interactive tabs',
    section: 'motion',
    tier: 'Flagship',
    purpose: 'An interactive product tour: tabs that swap story panels with motion polish.',
    rule: 'Motion is meaning: panels cross-fade only when the visitor asks. Respect prefers-reduced-motion by disabling transitions.',
    variants: [
      {
        id: 'a',
        label: 'Tabbed showcase',
        description: 'Tab buttons switch a story panel with a smooth cross-fade.',
        component: MotionTabShowcase,
        defaults: {
          eyebrow: 'Inside the studio',
          title: 'How an Atelier Nord project runs',
          tabs: ATELIER_NORD_TABS,
        },
        imageProps: ['tabs[].imageUrl'],
      },
      {
        id: 'b',
        label: 'Hover reveals',
        description: 'A grid of image cards that lift and reveal detail on hover — tactile and playful.',
        component: MotionHoverReveals,
        defaults: {
          eyebrow: 'Inside the studio',
          title: 'Three phases, one continuous conversation',
          tabs: ATELIER_NORD_TABS,
        },
        imageProps: ['tabs[].imageUrl'],
      },
    ],
  },
]
