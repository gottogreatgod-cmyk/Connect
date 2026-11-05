'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * ModuleTag — retired inspection aid. The composed templates are clean
 * product surfaces now: no factory tags render on any site design. The
 * component is kept as a no-op so every kit module keeps its mount point.
 */
export function ModuleTag(_props: { ids: string[]; className?: string }) {
  return null
}

/**
 * Section — consistent section shell (eyebrow / title / description / CTA)
 * shared by every composed template.
 */
export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
  containerClassName,
  tone = 'default',
}: {
  id?: string
  eyebrow?: string
  title?: string
  description?: string
  children?: React.ReactNode
  className?: string
  containerClassName?: string
  tone?: 'default' | 'muted' | 'dark'
}) {
  return (
    <section
      id={id}
      className={cn(
        'relative scroll-mt-28 py-14 @min-[768px]:py-20',
        tone === 'muted' && 'bg-muted/40',
        tone === 'dark' && 'bg-zinc-950 text-zinc-100',
        className,
      )}
    >
      <div className={cn('mx-auto w-full max-w-6xl px-4 @min-[640px]:px-6', containerClassName)}>
        {(eyebrow || title || description) && (
          <header className={cn('mb-8 max-w-2xl @min-[768px]:mb-12', !description && 'mb-8')}>
            {eyebrow && (
              <p
                className={cn(
                  'mb-2 text-xs font-semibold uppercase tracking-[0.18em]',
                  tone === 'dark' ? 'text-amber-400' : 'text-primary',
                )}
              >
                {eyebrow}
              </p>
            )}
            {title && (
              <h2
                className={cn(
                  'text-2xl font-bold tracking-tight @min-[640px]:text-3xl @min-[768px]:text-4xl',
                  tone === 'dark' ? 'text-zinc-50' : 'text-foreground',
                )}
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                className={cn(
                  'mt-3 text-sm leading-relaxed @min-[640px]:text-base',
                  tone === 'dark' ? 'text-zinc-400' : 'text-muted-foreground',
                )}
              >
                {description}
              </p>
            )}
          </header>
        )}
        {children}
      </div>
    </section>
  )
}

/** DemoContentBadge — mandatory marker for all fictional proof. */
export function DemoContentBadge({ label = 'Demo content' }: { label?: string }) {
  return (
    <span
      title="All figures and quotes on this template are fictional demo content"
      className="inline-flex items-center gap-1 rounded-full border border-dashed border-muted-foreground/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3l9 16H3z" />
        <path d="M12 10v4M12 17h.01" />
      </svg>
      {label}
    </span>
  )
}
