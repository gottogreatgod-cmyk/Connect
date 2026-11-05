import type { ModuleDefinition } from '@/modules/types'
import { Container, SectionHeading, eyebrowClass } from '@/modules/ui/primitives'

interface TeamMember {
  name: string
  role: string
  bio: string
  imageUrl: string
  imageAlt: string
}

interface TeamPortraitsProps {
  eyebrow: string
  title: string
  members: TeamMember[]
}

export function TeamPortraits({ eyebrow, title, members }: TeamPortraitsProps) {
  return (
    <section className="bg-stone-50 py-16 md:py-24">
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} />
        <ul className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((member) => (
            <li key={member.name}>
              <img
                src={member.imageUrl}
                alt={member.imageAlt}
                loading="lazy"
                className="aspect-[4/5] w-full rounded-2xl bg-stone-200 object-cover"
              />
              <h3 className="mt-5 text-lg font-semibold text-stone-900">{member.name}</h3>
              <p className={`mt-1.5 ${eyebrowClass}`}>{member.role}</p>
              <p className="mt-3 text-sm leading-[1.6] text-stone-600">{member.bio}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}

interface TeamRosterProps {
  eyebrow: string
  title: string
  members: TeamMember[]
}

export function TeamRoster({ eyebrow, title, members }: TeamRosterProps) {
  return (
    <section className="bg-white py-16 md:py-24">
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} />
        <ul className="mt-14">
          {members.map((member) => (
            <li key={member.name} className="border-t border-stone-200 py-6">
              <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between md:gap-8">
                <h3 className="font-display text-2xl text-stone-900">{member.name}</h3>
                <p className="shrink-0 text-sm font-medium text-emerald-800">{member.role}</p>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-[1.6] text-stone-600">{member.bio}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}

const CALDER_VOSS_PARTNERS: TeamMember[] = [
  {
    name: 'Eleanor Calder',
    role: 'Managing partner · Commercial litigation',
    bio: 'Eleanor founded the firm in 2009 after nine years in the City. She leads our dispute work for owner-managed businesses and is recommended in Legal 500 for the region.',
    imageUrl: 'https://picsum.photos/seed/cv-team-1/480/560',
    imageAlt: 'Studio portrait of Eleanor Calder against a plain warm grey backdrop',
  },
  {
    name: 'Marcus Voss',
    role: 'Partner · Employment law',
    bio: 'Marcus advises employers and senior executives on contracts, exits and tribunal claims, and is a trained workplace mediator.',
    imageUrl: 'https://picsum.photos/seed/cv-team-2/480/560',
    imageAlt: 'Studio portrait of Marcus Voss in a navy suit, arms relaxed',
  },
  {
    name: 'Priya Raman',
    role: 'Senior associate · Commercial property',
    bio: 'Priya handles leases, acquisitions and landlord disputes for retail and hospitality clients across the region.',
    imageUrl: 'https://picsum.photos/seed/cv-team-3/480/560',
    imageAlt: 'Studio portrait of Priya Raman smiling, hands folded',
  },
  {
    name: 'Daniel Okafor',
    role: 'Associate · Wills and probate',
    bio: 'Daniel guides families through estates and probate with a focus on plain language and fixed, agreed costs.',
    imageUrl: 'https://picsum.photos/seed/cv-team-4/480/560',
    imageAlt: 'Studio portrait of Daniel Okafor seated on a stool by a window',
  },
  {
    name: 'Sofia Lindqvist',
    role: 'Consultant · Family mediation',
    bio: 'Sofia mediates separations and co-parenting arrangements, keeping families out of court wherever possible.',
    imageUrl: 'https://picsum.photos/seed/cv-team-5/480/560',
    imageAlt: 'Studio portrait of Sofia Lindqvist in a light linen blazer',
  },
]

export const peopleModules: ModuleDefinition[] = [
  {
    id: 'team-grid',
    name: 'Team grid',
    section: 'people',
    tier: 'Growth',
    purpose: 'The humans behind the business, with the credentials that matter to buyers.',
    rule: 'Photos consistent in tone (same crop, same background). Credentials next to names, not buried in bios.',
    variants: [
      {
        id: 'a',
        label: 'Portrait cards',
        description: 'Photo-forward cards with name, role and a short bio.',
        component: TeamPortraits,
        defaults: {
          eyebrow: 'The team',
          title: 'The advisers you will actually work with',
          members: CALDER_VOSS_PARTNERS.slice(0, 4),
        },
        imageProps: ['members[].imageUrl'],
      },
      {
        id: 'b',
        label: 'Editorial roster',
        description: 'A text-led list with rules and bios — senior, credentials-first.',
        component: TeamRoster,
        defaults: {
          eyebrow: 'The team',
          title: 'The advisers you will actually work with',
          members: CALDER_VOSS_PARTNERS,
        },
        imageProps: ['members[].imageUrl'],
      },
    ],
  },
]
