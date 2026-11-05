import type { ChangeEvent, ReactNode } from 'react'
import { useId } from 'react'

export const buttonPrimary =
  'inline-flex items-center justify-center gap-2 rounded-full bg-emerald-800 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2'

export const buttonSecondary =
  'inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-stone-900 transition-colors hover:border-stone-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2'

export const eyebrowClass = 'text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800'

export const headingClass = 'font-display text-3xl leading-[1.2] text-stone-900 md:text-4xl'

export const bodyClass = 'text-base leading-[1.5] text-stone-700'

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-5 lg:px-10 ${className}`}>{children}</div>
}

export function SectionHeading({ eyebrow, title, intro }: { eyebrow?: string; title: string; intro?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow && <p className={eyebrowClass}>{eyebrow}</p>}
      <h2 className={`${headingClass} mt-3`}>{title}</h2>
      {intro && <p className={`${bodyClass} mt-4`}>{intro}</p>}
    </div>
  )
}

const fieldClass =
  'mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-500 transition-colors focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/30'

interface FormFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  autoComplete?: string
  multiline?: boolean
  required?: boolean
  hint?: string
  error?: string
}

export function FormField({
  id,
  label,
  value,
  onChange,
  type = 'text',
  autoComplete,
  multiline = false,
  required = false,
  hint,
  error,
}: FormFieldProps) {
  const reactId = useId()
  const hintId = `${reactId}-hint`
  const errorId = `${reactId}-error`
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined

  const shared = {
    id,
    name: id,
    value,
    required,
    autoComplete,
    className: fieldClass,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value),
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-stone-800">
        {label}
        {required && (
          <span aria-hidden="true" className="text-rose-700">
            {' '}
            *
          </span>
        )}
      </label>
      {multiline ? <textarea rows={4} {...shared} /> : <input type={type} {...shared} />}
      {hint && (
        <p id={hintId} className="mt-1.5 text-xs text-stone-600">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-xs font-medium text-rose-700">
          {error}
        </p>
      )}
    </div>
  )
}

/** Placeholder block used wherever a live map or feed would appear. */
export function MapPlaceholder({ label = 'Interactive map placeholder' }: { label?: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="flex h-full min-h-40 w-full items-center justify-center rounded-xl border border-stone-200 bg-[linear-gradient(135deg,#f5f5f4_25%,#e7e5e4_25%,#e7e5e4_50%,#f5f5f4_50%,#f5f5f4_75%,#e7e5e4_75%)] bg-[length:16px_16px] text-xs font-medium text-stone-500"
    >
      {label}
    </div>
  )
}
