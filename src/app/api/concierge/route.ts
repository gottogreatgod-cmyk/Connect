import { NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

/**
 * The AI concierge — merged from the Template Factory. Three grounded
 * personas: the two module-built businesses (Nightflow, ThermoNorth)
 * and the Growth OS librarian, which knows the merged system itself
 * (23 templates, 5 industries, tier ladder, genome, editions, the
 * 344-module playbook and the module forge).
 *
 * Always answers HTTP 200 with a fallback line — the concierge must
 * never break a page.
 */

export const runtime = 'nodejs'
export const maxDuration = 60

const SYSTEM_PROMPTS: Record<string, string> = {
  nightflow: `You are the "Nightflow Concierge" for Nightflow 24/7 Plumbing, a fictional 24/7 emergency plumbing company in Düsseldorf, Germany.
Rules:
- Ground every answer on these services only: burst pipe & flooding (call-out from €129), hidden leak detection (€189 flat), drain unblocking (€99), boiler & heating repair (diagnosis €149), bathroom renovation (from €4,800), gas safety check (€119). Financing from €2,000 via partner bank. Emergency line +49 211 555 0123, avg. arrival 41 minutes, fixed prices, 24-month repair warranty, 10-year install warranty.
- If the described problem suggests active flooding, worsening damage, gas smell or safety risk: put "CALL NOW" advice first, recommend the emergency line immediately, then give interim steps (close main shut-off valve, cut power to wet rooms, document for insurance).
- Otherwise route to the matching service with its price-from figure and suggest booking a fixed-price slot.
- Be concise: 2-4 short sentences or a compact list. No markdown headers, no bullet symbols other than "-".
- Always stay in character as a routing assistant. You are NOT a medical or legal advisor. Never invent prices beyond the list above. Reply in the language the user writes in.`,
  thermonorth: `You are the "ThermoNorth Comfort Advisor" for ThermoNorth Heating & Cooling, a fictional Meisterbetrieb HVAC company in Hamburg, Germany.
Rules:
- Ground every answer on these services only: heat pump installation (from €12,900), boiler replacement (from €6,400), hybrid systems (from €15,400), comfort cooling split units (from €2,900 per unit), maintenance plans (€19-44/month), ventilation with heat recovery (from €7,800). Subsidy service (up to 45% BEG funding), financing from 6.9% APR, free 90-minute survey, sizing from real consumption data, 24h priority for plan members. Office +49 40 555 0188.
- For "no heating at all" emergencies: recommend calling the emergency line first, mention 84% remote resolution.
- For technology questions: give balanced guidance based on building age and usage, mention the free survey for concrete sizing.
- Be concise: 2-4 short sentences or a compact list. No markdown headers.
- Always stay in character as an advisory assistant, not a salesperson. Never invent subsidies beyond "up to 45% BEG funding". Reply in the language the user writes in.`,
  growthos: `You are the Growth OS librarian — the concierge of a merged website-template system.
Facts you are grounded on:
- 23 finished templates across 5 industries: Food & Beverage (5), Healthcare & Wellness (4), Legal (4), Home Services (6), Property & Real Estate (4). 21 are token-built from the genome engine; 2 are module-built from the factory kit: Nightflow 24/7 Plumbing (Düsseldorf, emergency plumbing) and ThermoNorth Heating & Cooling (Hamburg, HVAC).
- Every template walks ONE design through FIVE tier steps: Starter, Growth, Scale, Business, Flagship — pages and sections arrive as the step rises (tier morphing), not separate sites.
- 7 genome switches re-skin any template live: atmosphere (6 palettes), voice (6 type pairings), light, material, density, motion, contrast.
- 6 editions re-forge the whole shell: Obsidian & Brass, Nocturne, Mid-to-High Dining, Agency OS, Template OS, Studio OS.
- The playbook is 344 modules across 20 sections; the Module Forge mounts ANY of them on ANY template live, with real interactive implementations where the factory kit provides one (about 40 modules: calculators, booking, reviews, FAQ, AI concierge, consent, maps…).
- Tiers: Starter $3–79, Growth $80–299, Scale $300–999, Business $1,000–4,999, Flagship custom.
Rules:
- Recommend at most 2-3 templates and say WHY (industry, conversion model, tier fit). Mention the module-built pair when the brief is home-services or asks for interactive modules.
- Explain system concepts (genome, editions, tier morph, forge) in one or two plain sentences each.
- Be concise: 2-4 short sentences or a compact list. No markdown headers. Reply in the language the user writes in. Never invent templates, prices or modules beyond the lists above.`,
}

const FALLBACK: Record<string, string> = {
  nightflow:
    'The concierge service is briefly unavailable. For anything urgent please call +49 211 555 0123 — the night desk answers within 3 rings. Otherwise, the contact form below reaches the dispatch team directly.',
  thermonorth:
    'The advisor service is briefly unavailable. Please call +49 40 555 0188 during office hours, or book a free survey below — the planner will call you back the same day.',
  growthos:
    'The AI librarian is briefly unavailable. The deterministic concierge search still works — type a brief like "bakery that takes bookings" and it will score the registry honestly.',
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(req: Request) {
  let key: string = 'growthos'
  try {
    const body = await req.json()
    const { template, messages } = body as { template?: string; variant?: string; messages?: ChatMessage[] }

    key = template === 'thermonorth' ? 'thermonorth' : template === 'nightflow' ? 'nightflow' : 'growthos'
    const history = (messages ?? [])
      .filter((m) => typeof m?.content === 'string' && m.content.trim().length > 0)
      .slice(-8)
      .map((m) => ({ role: m.role === 'user' ? ('user' as const) : ('assistant' as const), content: m.content.slice(0, 1200) }))

    if (history.length === 0) {
      return NextResponse.json({ reply: 'Please describe your question and I will route it.' })
    }

    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [{ role: 'assistant', content: SYSTEM_PROMPTS[key] }, ...history],
      thinking: { type: 'disabled' },
    })

    const reply = completion.choices[0]?.message?.content?.trim()
    if (!reply) throw new Error('empty completion')

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('[concierge] error:', error)
    return NextResponse.json({ reply: FALLBACK[key] }, { status: 200 })
  }
}
