'use client'

/**
 * AI & chat modules: AiConcierge (LLM-backed) · LiveChatLauncher · WhatsAppButton
 */

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Bot, Send, Loader2, MessageCircle, Phone, X } from 'lucide-react'
import { ModuleTag } from './primitives'
import { useFactory } from '@/factory/store'
import { cn } from '@/lib/utils'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_PROMPTS: Record<string, string[]> = {
  nightflow: ['Water is dripping from the ceiling', 'How fast can you get here?', 'What does a call-out cost?'],
  thermonorth: ['Which heat pump fits a 140 m² home?', 'How often does my system need service?', 'Are there subsidies right now?'],
  growthos: ['Which template fits a new bakery?', 'What does the Business tier add?', 'How do genome switches work?'],
}

/** brand prop → the route's system-prompt key */
function promptKey(brand: string): 'nightflow' | 'thermonorth' | 'growthos' {
  const b = brand.toLowerCase()
  if (b.includes('thermo')) return 'thermonorth'
  if (b.includes('night')) return 'nightflow'
  return 'growthos'
}

export function AiConcierge({
  brand,
  variant = 'ai',
  position = 'primary',
}: {
  brand: string
  variant?: 'ai' | 'live'
  position?: 'primary' | 'secondary'
}) {
  const [open, setOpen] = React.useState(false)
  /* merged: the brand prop picks the grounding prompt — the store no
     longer holds a template field (the OS registry owns selection). */
  const template = promptKey(brand)
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        variant === 'ai'
          ? `Hi, I am the ${brand} assistant. Describe your problem and I will route you to the right service. For medical, legal or safety-critical cases always call the hotline.`
          : `Hi, this is Jess from the ${brand} night desk. A human is typing — how can I help?`,
    },
  ])
  const [input, setInput] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    const next: ChatMessage[] = [...messages, { role: 'user', content: trimmed }]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template, variant, messages: next.slice(-8) }),
      })
      const data = await res.json()
      setMessages((m) => [...m, { role: 'assistant', content: data.reply ?? 'Sorry — the connection dropped. Please call the hotline for anything urgent.' }])
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: 'I could not reach the assistant service. For anything urgent, please call +49 211 555 0123 — a human answers 24/7.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          onClick={() => useFactory.getState().track('cta_clicked', variant === 'ai' ? 'ai-concierge' : 'live-chat')}
          aria-label={variant === 'ai' ? 'Open AI concierge chat' : 'Open live chat'}
          className={cn(
            'fixed z-40 flex h-12 items-center gap-2 rounded-full px-4 text-sm font-bold shadow-xl transition hover:scale-105',
            position === 'primary'
              ? 'bottom-20 right-4 @min-[768px]:bottom-6 @min-[768px]:right-6'
              : 'bottom-36 right-4 @min-[768px]:bottom-6 @min-[768px]:right-[8.75rem]',
            variant === 'ai'
              ? 'bg-zinc-950 text-amber-400 ring-1 ring-amber-500/40 hover:bg-zinc-900'
              : 'bg-primary text-primary-foreground hover:opacity-90',
          )}
        >
          {variant === 'ai' ? <Bot className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
          <span className="hidden @min-[640px]:inline">{variant === 'ai' ? 'AI Concierge' : 'Live chat'}</span>
        </button>
      </SheetTrigger>
      <SheetContent className="flex w-[420px] max-w-[92vw] flex-col gap-0 p-0 @min-[640px]:max-w-[92vw]">
        <ModuleTag ids={variant === 'ai' ? ['AiConcierge@4'] : ['LiveChatLauncher@4']} />
        <SheetHeader className="border-b p-4">
          <SheetTitle className="flex items-center gap-2 text-base">
            {variant === 'ai' ? <Bot className="h-4.5 w-4.5 text-primary" /> : <MessageCircle className="h-4.5 w-4.5 text-primary" />}
            {variant === 'ai' ? `${brand} Concierge` : `${brand} live chat`}
            <Badge variant="secondary" className="ml-auto text-[9px]">{variant === 'ai' ? 'AI · disclaimed' : 'Human · demo'}</Badge>
          </SheetTitle>
          <SheetDescription className="text-xs">
            {variant === 'ai'
              ? 'Grounded on this template’s services only. Not a contract, not a diagnosis — for emergencies call the hotline.'
              : 'Simulated agent for demo purposes — responses are scripted.'}
          </SheetDescription>
        </SheetHeader>

        <div ref={scrollRef} className="factory-scroll flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                'max-w-[85%] whitespace-pre-wrap rounded-xl px-3.5 py-2.5 text-sm leading-relaxed',
                m.role === 'user' ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted',
              )}
            >
              {m.content}
            </div>
          ))}
          {loading && (
            <div className="flex w-fit items-center gap-2 rounded-xl bg-muted px-3.5 py-2.5 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> {variant === 'ai' ? 'Thinking…' : 'Jess is typing…'}
            </div>
          )}
        </div>

        <div className="border-t p-3">
          {messages.length <= 1 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {(QUICK_PROMPTS[template] ?? []).map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="rounded-full border px-3 py-1.5 text-xs transition hover:border-primary/50 hover:bg-primary/5"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={variant === 'ai' ? 'Describe the problem…' : 'Type a message…'}
              aria-label="Chat message"
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()} aria-label="Send message">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}

/* ---------------------------------- WhatsAppButton (T2+) ---------------------------------- */
export function WhatsAppButton({ label = 'WhatsApp' }: { label?: string }) {
  return (
    <a
      href="https://wa.me/492115550123?text=Hi%20Nightflow%2C%20I%20have%20a%20plumbing%20question."
      target="_blank"
      rel="noreferrer"
      onClick={() => useFactory.getState().track('cta_clicked', 'whatsapp')}
      className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-white shadow-md transition hover:bg-emerald-600"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.4 14.1c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.5-2.6-1.1-4.3-3.8-4.4-4-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2 .2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.4.6c-.1.2-.3.3-.1.6.1.3.6 1.1 1.4 1.8 1 .9 1.8 1.1 2 1.2.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.9.9c.2.1.4.2.4.3.1.1.1.6-.1 1Z" />
      </svg>
      {label}
    </a>
  )
}

/* ---------------------------------- LiveChatLauncher inline button (used in hero areas) ---------------------------------- */
export function LiveChatInlineButton({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  return (
    <span onClick={() => setOpen(true)} className="contents">
      {children}
      {open && (
        <span className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <span
            className="w-full max-w-sm rounded-2xl border bg-background p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Live chat unavailable"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                <p className="font-bold">Chat is offline — we answer calls 24/7</p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close"><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              For emergencies the phone line is always faster. Everything else: leave a message in the contact form.
            </p>
            <div className="mt-4 flex gap-2">
              <Button asChild size="sm"><a href="tel:+492115550123">Call now</a></Button>
              <Button asChild size="sm" variant="outline"><a href="#contact">Leave a message</a></Button>
            </div>
          </span>
        </span>
      )}
    </span>
  )
}
