import { Fragment, useId, useState } from 'react'
import { Menu, X } from 'lucide-react'
import type { ModuleDefinition } from '@/modules/types'
import { Container, buttonPrimary } from '@/modules/ui/primitives'

interface NavLink {
  label: string
  href: string
}

interface AnnouncementSlimTickerProps {
  message: string
}

export function AnnouncementSlimTicker({ message }: AnnouncementSlimTickerProps) {
  const [dismissed, setDismissed] = useState(false)

  return (
    <section
      aria-label="Announcement"
      className={dismissed ? 'hidden' : 'relative bg-stone-900 py-2.5 text-center text-sm text-stone-100'}
    >
      <Container>
        <p className="pr-10">{message}</p>
      </Container>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss announcement"
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded p-1 text-stone-400 transition-colors hover:bg-stone-800 hover:text-white"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </section>
  )
}

interface AnnouncementUspTrioProps {
  items: string[]
}

export function AnnouncementUspTrio({ items }: AnnouncementUspTrioProps) {
  return (
    <section aria-label="Why choose the studio" className="bg-emerald-800 py-3 text-white">
      <Container>
        <p className="flex flex-col items-center gap-1.5 text-center text-sm sm:flex-row sm:justify-center">
          {items.map((item, index) => (
            <Fragment key={item}>
              {index > 0 && (
                <span aria-hidden="true" className="hidden px-3 text-emerald-200 sm:inline">
                  &middot;
                </span>
              )}
              <span className="font-medium">{item}</span>
            </Fragment>
          ))}
        </p>
      </Container>
    </section>
  )
}

interface HeaderClassicBarProps {
  logo: string
  links: NavLink[]
  ctaLabel: string
  ctaHref: string
}

export function HeaderClassicBar({ logo, links, ctaLabel, ctaHref }: HeaderClassicBarProps) {
  const [open, setOpen] = useState(false)

  return (
    <section
      aria-label="Site header"
      className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur"
    >
      <Container className="flex h-16 items-center justify-between gap-6">
        <a href="#top" className="font-display text-lg font-semibold text-stone-900">
          {logo}
        </a>
        <nav aria-label="Primary" className="hidden md:flex">
          <ul className="flex items-center gap-7">
            {links.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="text-sm text-stone-700 transition-colors hover:text-emerald-800">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <a href={ctaHref} className={`${buttonPrimary} py-2!`}>
            {ctaLabel}
          </a>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="classic-header-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="rounded-md p-2 text-stone-800 transition-colors hover:bg-stone-100 md:hidden"
          >
            {open ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </Container>
      {open && (
        <nav id="classic-header-menu" aria-label="Mobile" className="border-t border-stone-200 bg-white md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-base text-stone-800 transition-colors hover:bg-stone-100"
              >
                {link.label}
              </a>
            ))}
          </Container>
        </nav>
      )}
    </section>
  )
}

interface HeaderCenteredStackProps {
  logo: string
  links: NavLink[]
  ctaLabel: string
  ctaHref: string
  tagline: string
}

export function HeaderCenteredStack({ logo, links, ctaLabel, ctaHref, tagline }: HeaderCenteredStackProps) {
  return (
    <section aria-label="Site header" className="border-b border-stone-200 bg-white">
      <Container className="relative py-8 text-center md:py-10">
        <a href="#top" className="font-display text-3xl font-semibold text-stone-900 md:text-4xl">
          {logo}
        </a>
        <p className="mt-3 text-xs font-medium uppercase tracking-[0.22em] text-stone-500">{tagline}</p>
        <a
          href={ctaHref}
          className="mt-5 inline-flex text-sm font-medium text-emerald-800 underline underline-offset-4 transition-colors hover:text-emerald-900 md:hidden"
        >
          {ctaLabel}
        </a>
        <a
          href={ctaHref}
          className="absolute right-0 top-1/2 hidden -translate-y-1/2 text-sm font-medium text-emerald-800 underline underline-offset-4 transition-colors hover:text-emerald-900 md:inline-flex"
        >
          {ctaLabel}
        </a>
      </Container>
      <nav aria-label="Primary" className="border-t border-stone-200/70">
        <Container>
          <ul className="hidden justify-center md:flex">
            {links.map((link, index) => (
              <li key={link.label} className={index > 0 ? 'border-l border-stone-200' : undefined}>
                <a
                  href={link.href}
                  className="block px-7 py-3.5 text-xs font-medium uppercase tracking-[0.14em] text-stone-700 transition-colors hover:text-emerald-800"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <ul className="flex flex-col divide-y divide-stone-100 py-2 md:hidden">
            {links.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="block px-3 py-3 text-center text-sm text-stone-800">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </nav>
    </section>
  )
}

interface FooterColumn {
  title: string
  links: NavLink[]
}

interface FooterClassicColumnsProps {
  brand: string
  blurb: string
  columns: FooterColumn[]
  legal: string
}

export function FooterClassicColumns({ brand, blurb, columns, legal }: FooterClassicColumnsProps) {
  return (
    <section aria-label="Site footer" className="bg-stone-900 text-stone-300">
      <Container className="grid gap-10 py-14 md:grid-cols-2 md:py-16 lg:grid-cols-[1.6fr_repeat(3,1fr)]">
        <div>
          <p className="font-display text-xl font-semibold text-white">{brand}</p>
          <p className="mt-4 max-w-xs text-sm leading-[1.6] text-stone-400">{blurb}</p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{column.title}</h3>
            <ul className="mt-5 space-y-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-stone-300 transition-colors hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <Container className="border-t border-stone-800 py-6">
        <p className="text-xs text-stone-500">{legal}</p>
      </Container>
    </section>
  )
}

interface FooterBrandStatementProps {
  brand: string
  statement: string
  emailPlaceholder: string
  buttonLabel: string
  links: NavLink[]
  legal: string
}

export function FooterBrandStatement({
  brand,
  statement,
  emailPlaceholder,
  buttonLabel,
  links,
  legal,
}: FooterBrandStatementProps) {
  const emailId = useId()

  return (
    <section aria-label="Site footer" className="bg-stone-900 text-white">
      <Container className="py-16 text-center md:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">{brand}</p>
        <h2 className="mx-auto mt-6 max-w-3xl font-display text-4xl leading-[1.12] md:text-5xl">{statement}</h2>
        <form
          onSubmit={(event) => event.preventDefault()}
          className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
        >
          <label htmlFor={emailId} className="sr-only">
            Email address
          </label>
          <input
            id={emailId}
            type="email"
            placeholder={emailPlaceholder}
            className="w-full flex-1 rounded-full border border-stone-700 bg-stone-800 px-5 py-3 text-sm text-white placeholder:text-stone-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
          <button
            type="submit"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900"
          >
            {buttonLabel}
          </button>
        </form>
        <ul className="mt-14 flex flex-wrap justify-center gap-x-8 gap-y-3 border-t border-stone-800 pt-8">
          {links.map((link) => (
            <li key={link.label}>
              <a href={link.href} className="text-sm text-stone-400 transition-colors hover:text-white">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-xs text-stone-500">{legal}</p>
      </Container>
    </section>
  )
}

const headerLinks: NavLink[] = [
  { label: 'Work', href: '#work' },
  { label: 'Studio', href: '#studio' },
  { label: 'Services', href: '#services' },
  { label: 'Journal', href: '#journal' },
  { label: 'Contact', href: '#contact' },
]

export const announcementModules: ModuleDefinition[] = [
  {
    id: 'announcement-bar',
    name: 'Announcement bar',
    section: 'global',
    tier: 'Starter',
    purpose: 'A thin strip above the header for promotions, alerts or service messages.',
    rule: 'One message, one line. If it can be dismissed, the dismissal must persist.',
    variants: [
      {
        id: 'a',
        label: 'Slim ticker',
        description: 'Single-line centered message with a dismiss control.',
        component: AnnouncementSlimTicker,
        defaults: {
          message: 'Now booking spring projects — two studio slots remain for May.',
        },
      },
      {
        id: 'b',
        label: 'USP trio',
        description: 'Three short value props separated by dots — a benefits strip instead of a promo.',
        component: AnnouncementUspTrio,
        defaults: {
          items: ['Free 30-minute consultations', 'Fixed-price quotes', 'Two-week brand sprints'],
        },
      },
    ],
  },
  {
    id: 'site-header',
    name: 'Site header',
    section: 'global',
    tier: 'Starter',
    purpose: 'The persistent wayfinding shell: identity, routes, utilities and the single primary action.',
    rule: 'One row, one job per cluster. Below the nav breakpoint collapse into a simple stacked menu instead of letting items wrap.',
    variants: [
      {
        id: 'a',
        label: 'Classic bar',
        description: 'Logo left, nav links center, one filled CTA right — the familiar workhorse.',
        component: HeaderClassicBar,
        defaults: {
          logo: 'Northwind Studio',
          links: headerLinks,
          ctaLabel: 'Start a project',
          ctaHref: '#contact',
        },
      },
      {
        id: 'b',
        label: 'Centered stack',
        description: 'Centered logo with the nav row beneath — editorial, fashion-brand framing.',
        component: HeaderCenteredStack,
        defaults: {
          logo: 'Northwind Studio',
          links: headerLinks,
          ctaLabel: 'Start a project',
          ctaHref: '#contact',
          tagline: 'Brand and web design · Portland, Maine',
        },
      },
    ],
  },
  {
    id: 'site-footer',
    name: 'Site footer',
    section: 'global',
    tier: 'Starter',
    purpose: 'Closing shell: navigation recap, contact, legal and the last soft conversion.',
    rule: 'Same single source of navigation as the header — the footer must never introduce a second nav config.',
    variants: [
      {
        id: 'a',
        label: 'Classic columns',
        description: 'Brand blurb plus three link columns and a legal line.',
        component: FooterClassicColumns,
        defaults: {
          brand: 'Northwind Studio',
          blurb: 'A five-person studio designing calm, confident brands and websites for founders who sweat the details.',
          columns: [
            {
              title: 'Studio',
              links: [
                { label: 'About', href: '#about' },
                { label: 'Process', href: '#process' },
                { label: 'Journal', href: '#journal' },
              ],
            },
            {
              title: 'Services',
              links: [
                { label: 'Brand identity', href: '#brand' },
                { label: 'Web design', href: '#web' },
                { label: 'Art direction', href: '#art-direction' },
              ],
            },
            {
              title: 'Connect',
              links: [
                { label: 'Email the studio', href: 'mailto:hello@northwind.studio' },
                { label: 'Instagram', href: '#instagram' },
                { label: 'LinkedIn', href: '#linkedin' },
              ],
            },
          ],
          legal: '© 2026 Northwind Studio. All rights reserved.',
        },
      },
      {
        id: 'b',
        label: 'Brand statement',
        description: 'Oversized brand wordmark and newsletter capture instead of link columns.',
        component: FooterBrandStatement,
        defaults: {
          brand: 'Northwind Studio',
          statement: 'We make brands and websites worth keeping.',
          emailPlaceholder: 'Your email address',
          buttonLabel: 'Join the studio letter',
          links: [
            { label: 'Work', href: '#work' },
            { label: 'Studio', href: '#studio' },
            { label: 'Journal', href: '#journal' },
            { label: 'Privacy', href: '#privacy' },
          ],
          legal: '© 2026 Northwind Studio. All rights reserved.',
        },
      },
    ],
  },
]
