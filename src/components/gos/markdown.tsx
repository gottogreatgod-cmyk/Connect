"use client"

import React from "react"

// ─── Minimal safe markdown renderer (no dangerouslySetInnerHTML) ─────────

function inline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  // Split by **bold**, `code`, [link](url)
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index))
    const token = m[0]
    const key = `${keyPrefix}-${i++}`
    if (token.startsWith("**")) {
      nodes.push(
        <strong key={key} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>,
      )
    } else if (token.startsWith("`")) {
      nodes.push(
        <code
          key={key}
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-primary"
        >
          {token.slice(1, -1)}
        </code>,
      )
    } else {
      const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/)
      if (linkMatch) {
        nodes.push(
          <a
            key={key}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:opacity-80"
          >
            {linkMatch[1]}
          </a>,
        )
      }
    }
    last = m.index + token.length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

export function Markdown({ content }: { content: string }) {
  const lines = content.split("\n")
  const blocks: React.ReactNode[] = []
  let list: string[] = []
  let listOrdered = false

  const flushList = (key: string) => {
    if (list.length === 0) return
    const items = list.map((item, i) => (
      <li key={`${key}-li-${i}`} className="ml-1">
        {inline(item, `${key}-li-${i}`)}
      </li>
    ))
    blocks.push(
      listOrdered ? (
        <ol key={key} className="list-decimal space-y-1 pl-5 text-muted-foreground">
          {items}
        </ol>
      ) : (
        <ul key={key} className="list-disc space-y-1 pl-5 text-muted-foreground">
          {items}
        </ul>
      ),
    )
    list = []
  }

  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    if (/^###\s+/.test(trimmed)) {
      flushList(`l${idx}`)
      blocks.push(
        <h3 key={idx} className="mt-3 font-display text-sm font-semibold tracking-wide text-foreground uppercase">
          {inline(trimmed.replace(/^###\s+/, ""), `h${idx}`)}
        </h3>,
      )
    } else if (/^##\s+/.test(trimmed)) {
      flushList(`l${idx}`)
      blocks.push(
        <h2 key={idx} className="mt-3 font-display text-base font-semibold text-foreground">
          {inline(trimmed.replace(/^##\s+/, ""), `h${idx}`)}
        </h2>,
      )
    } else if (/^[-*]\s+/.test(trimmed)) {
      if (listOrdered) flushList(`l${idx}`)
      listOrdered = false
      list.push(trimmed.replace(/^[-*]\s+/, ""))
    } else if (/^\d+\.\s+/.test(trimmed)) {
      if (!listOrdered) flushList(`l${idx}`)
      listOrdered = true
      list.push(trimmed.replace(/^\d+\.\s+/, ""))
    } else if (trimmed === "") {
      flushList(`l${idx}`)
    } else {
      flushList(`l${idx}`)
      blocks.push(
        <p key={idx} className="leading-relaxed">
          {inline(trimmed, `p${idx}`)}
        </p>,
      )
    }
  })
  flushList("last")

  return <div className="space-y-2 text-[15px] text-foreground/90">{blocks}</div>
}
