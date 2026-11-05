import { CheckCircle2, FileText, ShieldCheck } from 'lucide-react'
import type { ModuleDefinition } from '@/modules/types'
import { Container } from '@/modules/ui/primitives'

interface ComplianceLink {
  label: string
  ref?: string
}

interface DisclosureCardProps {
  title: string
  regulator: string
  registration: string
  disclosure: string
  links: ComplianceLink[]
  note: string
}

interface TrustChecklistProps extends DisclosureCardProps {
  checklistNote: string
}

export function DisclosureCard({
  title,
  regulator,
  registration,
  disclosure,
  links,
  note,
}: DisclosureCardProps) {
  return (
    <section className="bg-stone-50 py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-3xl rounded-3xl border bg-white p-8">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 shrink-0 text-emerald-700" aria-hidden="true" />
            <h2 className="font-display text-2xl text-stone-900">{title}</h2>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
            <span className="rounded-lg bg-stone-900 px-3 py-1.5 text-sm font-medium text-white">{regulator}</span>
            <span className="text-sm text-stone-600">{registration}</span>
          </div>
          <p className="mt-6 text-sm leading-relaxed text-stone-700">{disclosure}</p>
          <ul className="mt-8 space-y-3">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href="#documents"
                  className="flex items-center gap-2.5 text-sm text-emerald-800 underline decoration-emerald-300 underline-offset-4"
                >
                  <FileText className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-8 border-t border-stone-200 pt-4 text-xs leading-[1.6] text-stone-500">{note}</p>
        </div>
      </Container>
    </section>
  )
}

export function TrustChecklist({
  title,
  regulator,
  registration,
  disclosure,
  links,
  note,
  checklistNote,
}: TrustChecklistProps) {
  return (
    <section className="bg-white py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-3xl leading-[1.2] text-stone-900">{title}</h2>
          <p className="mt-3 text-sm leading-[1.6] text-stone-600">{checklistNote}</p>
          <ul className="mt-8 space-y-3">
            {links.map((item) => (
              <li key={item.label} className="flex items-center justify-between gap-4 rounded-xl border p-4">
                <span className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
                  <span className="text-sm font-medium text-stone-900">{item.label}</span>
                </span>
                {item.ref && (
                  <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600">
                    {item.ref}
                  </span>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-10 border-t border-stone-200 pt-6">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <span className="rounded-lg bg-stone-900 px-3 py-1.5 text-sm font-medium text-white">{regulator}</span>
              <span className="text-sm text-stone-600">{registration}</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-stone-600">{disclosure}</p>
            <p className="mt-6 text-xs leading-[1.6] text-stone-500">{note}</p>
          </div>
        </div>
      </Container>
    </section>
  )
}

export const regulatedModules: ModuleDefinition[] = [
  {
    id: 'compliance-panel',
    name: 'Compliance panel',
    section: 'regulated',
    tier: 'Business',
    purpose: 'Regulatory posture made legible: who regulates you, what protects the client, where the documents live.',
    rule: 'Regulator names verbatim. Plain-language disclosure next to the badge, never below the fold.',
    variants: [
      {
        id: 'a',
        label: 'Disclosure card',
        description: 'Regulator badges, a plain-language disclosure paragraph and document links.',
        component: DisclosureCard,
        defaults: {
          title: 'Regulated advice, in plain English',
          regulator: 'Financial Conduct Authority',
          registration: 'Firm reference number 214532',
          disclosure:
            'Meridian Wealth Partners Ltd is authorised and regulated by the Financial Conduct Authority. Advice on investments and pensions is regulated; general guidance on saving is not. The value of investments can go down as well as up, and you may get back less than you invested. Past performance is not a reliable indicator of future results.',
          links: [
            { label: 'FCA register entry' },
            { label: 'Privacy notice' },
            { label: 'Complaints procedure' },
          ],
          note: 'The first meeting is free and carries no obligation. We charge fixed fees agreed in writing before any work begins — never commission from product providers.',
        },
      },
      {
        id: 'b',
        label: 'Trust checklist',
        description: 'A compliance checklist with certificate references — audit-ready.',
        component: TrustChecklist,
        defaults: {
          title: 'Our compliance record',
          regulator: 'Financial Conduct Authority',
          registration: 'Firm reference number 214532',
          disclosure:
            'Meridian Wealth Partners Ltd is authorised and regulated by the Financial Conduct Authority. The value of investments can go down as well as up.',
          links: [
            { label: 'FCA register entry', ref: 'FRN 214532' },
            { label: 'Client money safeguarding', ref: 'CASS 7B' },
            { label: 'Annual compliance review', ref: 'Cert 4821-AX' },
          ],
          note: 'Full policy documents are available on request. Complaints can be escalated directly to the Financial Ombudsman Service at any time.',
          checklistNote: 'Every item below was last verified in May 2025 by our compliance officer and is reviewed annually.',
        },
      },
    ],
  },
]
