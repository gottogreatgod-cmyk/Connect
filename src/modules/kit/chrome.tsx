'use client'

/**
 * Site chrome modules: SiteHeader · MegaMenu · MobileNav · SiteFooter · StickyActionBar
 */

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Phone, Menu, ChevronDown, MessageCircle, Calendar, FileText, MapPin, Clock } from 'lucide-react'
import { ModuleTag } from './primitives'
import { ThemeToggle, LanguageSwitcher, useLocaleGreeting } from './system'
import { useFactory } from '@/factory/store'
import { kitTier } from '@/factory/ladder'
import { useSite } from '@/sites/kit/site-kit'
import { cn } from '@/lib/utils'

export interface NavGroup {
  label: string
  items: { label: string; href: string; hint?: string }[]
}

/* ---------------------------------- SiteHeader (with MegaMenu) ---------------------------------- */
export function SiteHeader({
  brand,
  nav,
  cta,
  phone,
}: {
  brand: { name: string; mark: string; sub: string }
  nav: NavGroup[]
  cta: { label: string; href: string }
  phone: { display: string; href: string }
}) {
  /* tier comes from the OS tier-morph ladder (SiteContext) — the five
     OS steps fold onto the factory's four rungs. */
  const tier = kitTier(useSite().tierStep)
  return (
    <header className="sticky top-14 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <ModuleTag ids={['SiteHeader@1', ...(tier >= 2 ? ['MegaMenu@2'] : [])]} />
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 @min-[640px]:px-6">
        {/* Mobile nav trigger */}
        <div className="@min-[768px]:hidden">
          <MobileNav brand={brand} nav={nav} cta={cta} phone={phone} />
        </div>

        <a href="#top" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-black text-primary-foreground shadow-sm">
            {brand.mark}
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold tracking-tight">{brand.name}</span>
            <span className="block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{brand.sub}</span>
          </span>
        </a>

        <nav aria-label="Primary" className="ml-6 hidden items-center gap-1 @min-[768px]:flex">
          {nav.map((group) => (
            <DropdownMenu key={group.label}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
                  {group.label}
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              {tier >= 3 ? (
                /* MegaMenu pattern: columned links + featured callout */
                <DropdownMenuContent align="start" className="w-[420px] p-3">
                  <DropdownMenuGroup className="grid grid-cols-2 gap-1">
                    {group.items.map((item) => (
                      <DropdownMenuItem key={item.label} asChild>
                        <a href={item.href} className="flex flex-col items-start gap-0.5 rounded-md p-2.5">
                          <span className="text-sm font-medium">{item.label}</span>
                          {item.hint && <span className="text-xs text-muted-foreground">{item.hint}</span>}
                        </a>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <a
                    href={cta.href}
                    className="flex items-center justify-between rounded-lg border border-dashed p-3 transition-colors hover:bg-accent"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">Featured</p>
                      <p className="text-sm font-medium">{cta.label}</p>
                    </div>
                    <span aria-hidden className="text-primary">
                      →
                    </span>
                  </a>
                </DropdownMenuContent>
              ) : (
                <DropdownMenuContent align="start">
                  {group.items.map((item) => (
                    <DropdownMenuItem key={item.label} asChild>
                      <a href={item.href}>{item.label}</a>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              )}
            </DropdownMenu>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <a
            href={phone.href}
            onClick={() => useFactory.getState().track('call_clicked', 'header')}
            className="hidden items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition hover:bg-accent @min-[1024px]:flex"
          >
            <Phone className="h-4 w-4 text-primary" />
            {phone.display}
          </a>
          {tier >= 3 && <LanguageSwitcher />}
          <ThemeToggle />
          <Button asChild size="sm" className="ml-1 hidden @min-[640px]:inline-flex" onClick={() => useFactory.getState().track('cta_clicked', cta.label)}>
            <a href={cta.href}>{cta.label}</a>
          </Button>
        </div>
      </div>
    </header>
  )
}

/* ---------------------------------- MobileNav ---------------------------------- */
export function MobileNav({
  brand,
  nav,
  cta,
  phone,
}: {
  brand: { name: string; mark: string; sub: string }
  nav: NavGroup[]
  cta: { label: string; href: string }
  phone: { display: string; href: string }
}) {
  const [open, setOpen] = React.useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 overflow-y-auto factory-scroll">
        <ModuleTag ids={['MobileNav@1']} />
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-left">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-black text-primary-foreground">
              {brand.mark}
            </span>
            {brand.name}
          </SheetTitle>
        </SheetHeader>
        <Accordion type="multiple" className="px-2">
          {nav.map((group) => (
            <AccordionItem key={group.label} value={group.label}>
              <AccordionTrigger className="text-sm font-medium">{group.label}</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-1">
                  {group.items.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="block rounded-md px-2 py-1.5 text-sm text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-4 space-y-2 px-4 pb-6">
          <Button asChild className="w-full">
            <a href={cta.href} onClick={() => setOpen(false)}>
              {cta.label}
            </a>
          </Button>
          <Button asChild variant="outline" className="w-full gap-2">
            <a href={phone.href}>
              <Phone className="h-4 w-4" /> {phone.display}
            </a>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

/* ---------------------------------- SiteFooter ---------------------------------- */
export function SiteFooter({
  brand,
  nav,
  nap,
  certifications,
}: {
  brand: { name: string; mark: string }
  nav: NavGroup[]
  nap: { address: string[]; phone: string; email: string }
  certifications: string[]
}) {
  const greeting = useLocaleGreeting()
  return (
    <footer className="border-t bg-zinc-950 text-zinc-300 mt-auto">
      <ModuleTag ids={['SiteFooter@1']} />
      <div className="mx-auto max-w-6xl px-4 py-12 @min-[640px]:px-6">
        <div className="grid gap-10 @min-[768px]:grid-cols-[1.2fr_1fr_1fr_1.1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-black text-primary-foreground">
                {brand.mark}
              </span>
              <span className="text-sm font-bold text-zinc-50">{brand.name}</span>
            </div>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-zinc-400">{greeting}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {certifications.map((c) => (
                <span key={c} className="rounded-full border border-zinc-800 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                  {c}
                </span>
              ))}
            </div>
          </div>
          {nav.map((group) => (
            <nav key={group.label} aria-label={`Footer — ${group.label}`}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{group.label}</h3>
              <ul className="mt-3 space-y-2">
                {group.items.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="text-sm text-zinc-400 transition hover:text-zinc-100">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Contact (NAP)</h3>
            <address className="mt-3 space-y-2 text-sm not-italic text-zinc-400">
              {nap.address.map((line) => (
                <p key={line} className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" /> {line}
                </p>
              ))}
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-primary" />
                <a href={`tel:${nap.phone.replace(/\s/g, '')}`} className="transition hover:text-zinc-100">
                  {nap.phone}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-primary" /> 24/7 emergency line
              </p>
            </address>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-zinc-900 pt-6 text-xs text-zinc-500 @min-[640px]:flex-row @min-[640px]:items-center">
          <p>
            © {new Date().getFullYear()} {brand.name}. Fictional template — composed by the Template Factory.
          </p>
          <div className="flex gap-4">
            <a href="#top" className="transition hover:text-zinc-300">Privacy</a>
            <a href="#top" className="transition hover:text-zinc-300">Terms</a>
            <a href="#top" className="transition hover:text-zinc-300">Imprint</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ---------------------------------- StickyActionBar ---------------------------------- */
export interface StickyAction {
  id: string
  label: string
  icon: React.ReactNode
  href?: string
  onClick?: () => void
  variant?: 'default' | 'outline' | 'ghost'
}

export function StickyActionBar({ actions, moduleTag = 'StickyActionBar@1' }: { actions: StickyAction[]; moduleTag?: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur @min-[768px]:hidden">
      <ModuleTag ids={[moduleTag]} className="top-0 -translate-y-full" />
      <div className="grid grid-cols-4 gap-1 p-2">
        {actions.map((a) =>
          a.href ? (
            <a
              key={a.id}
              href={a.href}
              onClick={a.onClick}
              className={cn(
                'flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1.5 text-[10px] font-semibold transition',
                a.variant === 'outline' ? 'border' : a.variant === 'ghost' ? 'text-muted-foreground' : 'bg-primary text-primary-foreground',
              )}
            >
              {a.icon}
              {a.label}
            </a>
          ) : (
            <button
              key={a.id}
              onClick={a.onClick}
              className={cn(
                'flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1.5 text-[10px] font-semibold transition',
                a.variant === 'outline' ? 'border' : a.variant === 'ghost' ? 'text-muted-foreground' : 'bg-primary text-primary-foreground',
              )}
            >
              {a.icon}
              {a.label}
            </button>
          ),
        )}
      </div>
    </div>
  )
}

/** Shared icon helpers for sticky actions */
export const StickyIcons = {
  call: <Phone className="h-4 w-4" />,
  book: <Calendar className="h-4 w-4" />,
  quote: <FileText className="h-4 w-4" />,
  chat: <MessageCircle className="h-4 w-4" />,
}
