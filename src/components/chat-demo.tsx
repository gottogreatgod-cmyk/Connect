'use client'

import * as React from 'react'
import { Bot, Loader2, RotateCcw, Send, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

const GREETING: Message = {
  role: 'assistant',
  content:
    "Hi! I'm a live AI assistant running on a real model via the LLM Skill. Ask me anything — for example, how you could use AI Skills on your own website.",
}

const SUGGESTIONS = [
  'What are AI Skills and how do I use them?',
  'Write a haiku about coding with AI',
  'Give me 3 ideas for an AI-powered app',
]

/** Parse JSON safely, converting HTML/proxy error pages into friendly errors. */
async function safeJson<T>(res: Response): Promise<T> {
  const raw = await res.text()
  try {
    return JSON.parse(raw) as T
  } catch {
    throw new Error(
      `The server returned an unexpected response (HTTP ${res.status}). Please try again.`
    )
  }
}

export function ChatDemo() {
  const [messages, setMessages] = React.useState<Message[]>([GREETING])
  const [input, setInput] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const viewportRef = React.useRef<HTMLDivElement>(null)

  const scrollToBottom = React.useCallback(() => {
    const viewport = viewportRef.current
    if (viewport) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' })
    }
  }, [])

  React.useEffect(() => {
    scrollToBottom()
  }, [messages, loading, scrollToBottom])

  async function send(text?: string) {
    const content = (text ?? input).trim()
    if (!content || loading) return

    const history: Message[] = [...messages, { role: 'user', content }]
    setMessages(history)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history
            .filter((m) => m !== GREETING)
            .slice(-12)
            .map(({ role, content: c }) => ({ role, content: c })),
        }),
      })
      const data = await safeJson<{ content?: string; error?: string }>(res)
      if (!res.ok || !data.content) {
        throw new Error(data.error || 'The assistant could not respond.')
      }
      setMessages([...history, { role: 'assistant', content: data.content }])
    } catch (err) {
      setMessages([
        ...history,
        {
          role: 'assistant',
          content: `Sorry, something went wrong: ${
            err instanceof Error ? err.message : 'unknown error'
          }. Please try again.`,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    if (loading) return
    setMessages([GREETING])
    setInput('')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <Badge
          variant="secondary"
          className="gap-1.5 border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          LLM Skill · live
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          onClick={reset}
          aria-label="Reset conversation"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Reset
        </Button>
      </div>

      <ScrollArea className="h-80 rounded-lg border bg-muted/30">
        <div className="flex flex-col gap-3 p-4" role="log" aria-live="polite">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex items-start gap-2.5 ${
                m.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  m.role === 'user'
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                    : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                }`}
                aria-hidden="true"
              >
                {m.role === 'user' ? (
                  <User className="h-3.5 w-3.5" />
                ) : (
                  <Bot className="h-3.5 w-3.5" />
                )}
              </div>
              <div
                className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'rounded-tr-sm bg-primary text-primary-foreground'
                    : 'rounded-tl-sm border bg-card'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Bot className="h-3.5 w-3.5" aria-hidden="true" />
              </div>
              <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border bg-card px-3.5 py-2.5 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Thinking…
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {messages.length === 1 && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              disabled={loading}
              className="rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-emerald-500/40 hover:text-foreground disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          void send()
        }}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the AI assistant…"
          aria-label="Message"
          maxLength={500}
          disabled={loading}
        />
        <Button type="submit" size="icon" disabled={loading || !input.trim()} aria-label="Send message">
          <Send className="h-4 w-4" aria-hidden="true" />
        </Button>
      </form>
    </div>
  )
}
