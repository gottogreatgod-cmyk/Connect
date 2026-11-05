'use client'

/**
 * Global system modules (baseline, all tiers):
 * SkipToContent · AnnouncementBar · ThemeToggle · BackToTop ·
 * CookieConsent + ConsentGate · ErrorBoundary · Breadcrumb · LanguageSwitcher
 */

import * as React from 'react'
import { useEdition } from '@/shell/edition-provider'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Globe, Moon, Sun, ArrowUp, ShieldCheck, X, RotateCcw } from 'lucide-react'
import { LOCALE_GREETINGS, useFactory, type ConsentCategory, type Locale } from '@/factory/store'
import { ModuleTag } from './primitives'
import { cn } from '@/lib/utils'

/* ---------------------------------- SkipToContent ---------------------------------- */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
    >
      Skip to content
    </a>
  )
}

/* ---------------------------------- AnnouncementBar ---------------------------------- */
export function AnnouncementBar({
  messages,
  moduleTag = 'AnnouncementBar@1',
}: {
  messages: { icon: string; text: string }[]
  moduleTag?: string
}) {
  const [index, setIndex] = React.useState(0)
  const [dismissed, setDismissed] = React.useState(false)
  React.useEffect(() => {
    if (messages.length < 2) return
    const t = setInterval(() => setIndex((i) => (i + 1) % messages.length), 5200)
    return () => clearInterval(t)
  }, [messages.length])
  if (dismissed || messages.length === 0) return null
  const msg = messages[index]
  return (
    <div className="relative bg-primary text-primary-foreground">
      <ModuleTag ids={[moduleTag]} />
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-10 py-2 text-center text-xs font-medium @min-[640px]:text-sm">
        <span aria-hidden>{msg.icon}</span>
        <span key={index} className="animate-in fade-in slide-in-from-bottom-1 duration-500">
          {msg.text}
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss announcement"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 opacity-70 transition hover:opacity-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

/* ---------------------------------- ThemeToggle ---------------------------------- */
/* Merged into Growth OS: the module now drives the OS shell's daylight /
   evening mode (EditionProvider) instead of a private next-theme — one
   mode to rule shell, previews and module-built sites. */
export function ThemeToggle() {
  const { mode, toggleMode } = useEdition()
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle light or dark theme"
      onClick={toggleMode}
    >
      {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}

/* ---------------------------------- LanguageSwitcher (T3+) ---------------------------------- */
export function LanguageSwitcher() {
  const { locale, setLocale } = useFactory()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 px-2" aria-label="Change language">
          <Globe className="h-4 w-4" />
          <span className="text-xs font-semibold">{locale}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Preview locale</DropdownMenuLabel>
        {(['EN', 'DE', 'FR'] as Locale[]).map((l) => (
          <DropdownMenuItem key={l} onClick={() => setLocale(l)} className={cn(locale === l && 'bg-accent')}>
            {l === 'EN' ? '🇬🇧 English' : l === 'DE' ? '🇩🇪 Deutsch' : '🇫🇷 Français'}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* ---------------------------------- BackToTop (T2+) ---------------------------------- */
export function BackToTop() {
  const [visible, setVisible] = React.useState(false)
  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <button
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={cn(
        'fixed bottom-[13.5rem] right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border bg-background/90 shadow-md backdrop-blur transition-all hover:bg-accent @min-[768px]:bottom-24 @min-[768px]:right-6',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
      )}
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  )
}

/* ---------------------------------- CookieConsent + ConsentGate ---------------------------------- */
export function CookieConsent() {
  const { consent, consentDecided, setConsent } = useFactory()
  const [open, setOpen] = React.useState(false)
  const [draft, setDraft] = React.useState(consent)

  React.useEffect(() => {
    const stored = window.localStorage.getItem('gos:factory-consent')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setConsent(parsed, true)
      } catch {
        /* ignore */
      }
    }
  }, [])

  const decide = (c: Record<ConsentCategory, boolean>) => {
    window.localStorage.setItem('gos:factory-consent', JSON.stringify(c))
    setConsent(c, true)
    setOpen(false)
  }

  if (consentDecided) return null
  return (
    <>
      <div
        role="dialog"
        aria-label="Cookie consent"
        className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-xl rounded-xl border bg-background/95 p-4 shadow-xl backdrop-blur @min-[768px]:inset-x-auto @min-[768px]:left-6 @min-[768px]:bottom-6"
      >
        <ModuleTag ids={['CookieConsent@1', 'ConsentGate@1']} />
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">We respect your choice</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              This demo uses strictly necessary cookies only. Analytics &amp; marketing stay blocked by{' '}
              <span className="font-mono text-[11px]">ConsentGate</span> until you opt in — watch the event ticker to see
              blocked events.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => decide({ analytics: true, marketing: true })}>
                Accept all
              </Button>
              <Button size="sm" variant="outline" onClick={() => decide({ analytics: false, marketing: false })}>
                Reject
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setDraft(consent)
                  setOpen(true)
                }}
              >
                Manage
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="@min-[640px]:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage consent categories</DialogTitle>
            <DialogDescription>
              Purpose-specific consent. Necessary cookies are always active.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="text-sm">Strictly necessary</Label>
                <p className="text-xs text-muted-foreground">Session, security, consent state.</p>
              </div>
              <Switch checked disabled aria-readonly />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="consent-analytics" className="text-sm">
                  Analytics
                </Label>
                <p className="text-xs text-muted-foreground">Funnel events (form, booking, quote).</p>
              </div>
              <Switch
                id="consent-analytics"
                checked={draft.analytics}
                onCheckedChange={(v) => setDraft((d) => ({ ...d, analytics: v }))}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="consent-marketing" className="text-sm">
                  Marketing
                </Label>
                <p className="text-xs text-muted-foreground">Remarketing audiences, offer personalization.</p>
              </div>
              <Switch
                id="consent-marketing"
                checked={draft.marketing}
                onCheckedChange={(v) => setDraft((d) => ({ ...d, marketing: v }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => decide({ analytics: false, marketing: false })}>
              Save choices
            </Button>
            <Button size="sm" onClick={() => decide(draft)}>
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

/* ---------------------------------- ErrorBoundary ---------------------------------- */
interface ErrorBoundaryState {
  error: Error | null
}
export class TemplateErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-32 text-center">
          <ModuleTag ids={['ErrorBoundary@1']} />
          <p className="text-4xl" aria-hidden>
            🔧
          </p>
          <h2 className="text-xl font-bold">Something broke on this template</h2>
          <p className="text-sm text-muted-foreground">{this.state.error.message}</p>
          <Button onClick={() => this.setState({ error: null })} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Try again
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}

/* ---------------------------------- Breadcrumb ---------------------------------- */
export function Breadcrumb({ trail }: { trail: string[] }) {
  return (
    <nav aria-label="Breadcrumb" className="relative border-b bg-background/60 py-2.5">
      <ModuleTag ids={['Breadcrumb@1']} />
      <div className="mx-auto max-w-6xl px-4 @min-[640px]:px-6">
        <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          {trail.map((item, i) => (
            <li key={item} className="flex items-center gap-1">
              {i > 0 && <span aria-hidden>/</span>}
              {i === trail.length - 1 ? (
                <span aria-current="page" className="font-medium text-foreground">
                  {item}
                </span>
              ) : (
                <a href="#" className="transition hover:text-foreground">
                  {item}
                </a>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  )
}

/* ---------------------------------- OfflineBanner ---------------------------------- */
export function OfflineBanner() {
  const [offline, setOffline] = React.useState(false)
  React.useEffect(() => {
    const on = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  if (!offline) return null
  return (
    <div role="status" className="fixed bottom-16 left-1/2 z-[60] -translate-x-1/2 rounded-full border bg-background px-4 py-2 text-xs font-medium shadow-lg">
      You are offline — showing cached demo content.
    </div>
  )
}

/** Locale-aware tagline used by footers to make the switcher visible */
export function useLocaleGreeting() {
  const locale = useFactory((s) => s.locale)
  return LOCALE_GREETINGS[locale]
}
