import { Link2, Plug } from 'lucide-react'
import type { ModuleDefinition } from '@/modules/types'
import { Container, SectionHeading, buttonPrimary } from '@/modules/ui/primitives'

interface IntegrationGroup {
  category: string
  tools: string[]
}

interface IntegrationGridProps {
  title: string
  intro: string
  groups: IntegrationGroup[]
}

interface ConnectedPillsProps extends IntegrationGridProps {
  connectLabel: string
}

export function IntegrationGrid({ title, intro, groups }: IntegrationGridProps) {
  const total = groups.reduce((sum, group) => sum + group.tools.length, 0)

  return (
    <section className="bg-stone-50 py-16 md:py-24">
      <Container>
        <SectionHeading title={title} intro={intro} />
        <div className="mt-12 space-y-8">
          {groups.map((group) => (
            <div key={group.category}>
              <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">{group.category}</p>
              <ul className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                {group.tools.map((tool) => (
                  <li
                    key={tool}
                    className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm font-medium text-stone-700"
                  >
                    <Plug className="h-4 w-4 shrink-0 text-stone-400" aria-hidden="true" />
                    {tool}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-stone-600">
          <strong className="font-semibold text-stone-900">{total}</strong> integrations and counting
        </p>
      </Container>
    </section>
  )
}

export function ConnectedPills({ title, intro, groups, connectLabel }: ConnectedPillsProps) {
  return (
    <section className="bg-white py-16 md:py-24">
      <Container>
        <SectionHeading title={title} intro={intro} />
        <div className="mt-12 space-y-10">
          {groups.map((group) => (
            <div key={group.category} className="flex flex-wrap items-center gap-x-3 gap-y-2.5">
              <h3 className="text-base font-semibold text-stone-900">{group.category}</h3>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-900">
                {group.tools.length}
              </span>
              <ul className="flex flex-wrap gap-2">
                {group.tools.map((tool) => (
                  <li key={tool} className="rounded-full border bg-white px-3.5 py-1.5 text-sm text-stone-700">
                    {tool}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <a href="#connect" className={buttonPrimary}>
            <Link2 className="h-4 w-4" aria-hidden="true" />
            {connectLabel}
          </a>
        </div>
      </Container>
    </section>
  )
}

const GROUPS: IntegrationGroup[] = [
  {
    category: 'Data warehouses',
    tools: ['Snowflake', 'BigQuery', 'Redshift', 'Databricks'],
  },
  {
    category: 'Product & billing',
    tools: ['Stripe', 'Salesforce', 'HubSpot', 'Chargebee'],
  },
  {
    category: 'Analytics & events',
    tools: ['Segment', 'Amplitude', 'Mixpanel', 'PostHog'],
  },
]

export const b2bModules: ModuleDefinition[] = [
  {
    id: 'integration-cloud',
    name: 'Integration cloud',
    section: 'b2b',
    tier: 'Business',
    purpose: 'The ecosystem proof: every tool you connect with, organised and countable.',
    rule: 'Real integration names only — a fake logo erodes more trust than a missing one.',
    variants: [
      {
        id: 'a',
        label: 'Integration grid',
        description: 'A categorised grid of integration tiles with an ecosystem count.',
        component: IntegrationGrid,
        defaults: {
          title: 'Every tool you rely on, already connected',
          intro:
            'Metricly ships with native connectors for the stack you already run — no CSV uploads, no middleware, no professional services bill.',
          groups: GROUPS,
        },
      },
      {
        id: 'b',
        label: 'Connected pills',
        description: 'Grouped pill clusters with counts and a connect CTA — workflow feel.',
        component: ConnectedPills,
        defaults: {
          title: 'Every tool you rely on, already connected',
          intro:
            'Connect a source in two clicks and Metricly starts modelling it within the hour. Disconnect any time — your data stays yours.',
          groups: GROUPS,
          connectLabel: 'Connect a data source',
        },
      },
    ],
  },
]
