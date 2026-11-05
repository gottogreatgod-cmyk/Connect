'use client'

/**
 * Content & SEO modules: FAQAccordion · BlogIndex · StructuredDataBlock
 */

import * as React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ArrowRight, Search, FileText, Clock } from 'lucide-react'
import { ModuleTag } from './primitives'
import { useFactory } from '@/factory/store'
import { cn } from '@/lib/utils'
import type { FaqItem, BlogPost } from '@/factory/types'

/* ---------------------------------- FAQAccordion ---------------------------------- */
export function FAQAccordion({ faqs }: { faqs: FaqItem[] }) {
  const [query, setQuery] = React.useState('')
  const track = useFactory((s) => s.track)
  const groups = React.useMemo(() => {
    const filtered = faqs.filter(
      (f) => f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase()),
    )
    const map = new Map<string, FaqItem[]>()
    filtered.forEach((f) => map.set(f.group, [...(map.get(f.group) ?? []), f]))
    return [...map.entries()]
  }, [faqs, query])

  return (
    <div className="relative mx-auto max-w-3xl">
      <ModuleTag ids={['FAQAccordion@1']} className="top-0" />
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            track('search_used', `faq:${e.target.value}`)
          }}
          placeholder="Search questions…"
          aria-label="Search FAQs"
          className="pl-9"
        />
      </div>
      {groups.map(([group, items]) => (
        <div key={group} className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">{group}</p>
          <Accordion type="single" collapsible>
            {items.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger className="text-left text-sm font-semibold @min-[640px]:text-base">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ))}
      {groups.length === 0 && (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          No match — <a href="#contact" className="font-semibold text-primary underline">ask us directly</a>, we answer within the hour.
        </p>
      )}
    </div>
  )
}

/* ---------------------------------- BlogIndex (T2+) ---------------------------------- */
export function BlogIndex({ posts }: { posts: BlogPost[] }) {
  const [category, setCategory] = React.useState('All')
  const categories = ['All', ...new Set(posts.map((p) => p.category))]
  const filtered = category === 'All' ? posts : posts.filter((p) => p.category === category)
  return (
    <div className="relative">
      <ModuleTag ids={['BlogIndex@2']} className="top-0" />
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => {
              setCategory(c)
              useFactory.getState().track('filter_used', `blog:${c}`)
            }}
            aria-pressed={category === c}
            className={cn(
              'rounded-full border px-4 py-1.5 text-xs font-semibold transition',
              category === c ? 'border-primary bg-primary text-primary-foreground' : 'hover:border-primary/50',
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid gap-4 @min-[768px]:grid-cols-3">
        {filtered.map((post, i) => (
          <a
            key={post.title}
            href="#top"
            className="group flex flex-col rounded-2xl border bg-card p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div
              className={cn(
                'mb-4 h-28 rounded-xl',
                i % 3 === 0 && 'bg-gradient-to-br from-primary/25 to-primary/5',
                i % 3 === 1 && 'bg-gradient-to-br from-muted to-primary/10',
                i % 3 === 2 && 'bg-gradient-to-tr from-primary/15 via-muted/50 to-primary/5',
              )}
            />
            <Badge variant="secondary" className="w-fit text-[10px]">{post.category}</Badge>
            <h3 className="mt-3 text-base font-bold leading-snug">{post.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" /> {post.readMinutes} min · {post.date}
            </p>
            <span className="mt-3 flex items-center gap-1 text-xs font-bold text-primary">
              Read guide <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
            </span>
          </a>
        ))}
      </div>
      <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <FileText className="h-3.5 w-3.5" /> Article template includes TOC, author box and related posts.
      </p>
    </div>
  )
}

/* ---------------------------------- StructuredDataBlock ---------------------------------- */
export function StructuredDataBlock({ schema }: { schema: Record<string, unknown> }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  )
}
