/**
 * The factory ladder bridge — maps the OS's FIVE tier-morph steps
 * (Starter / Growth / Scale / Business / Flagship) onto the factory
 * kit's FOUR ladder rungs, and derives what each rung adds so the
 * stage ladder reads honestly for module-built templates.
 *
 *   low → T1 Starter        everything base
 *   mid, scale → T2 Growth  + calculators, maps, blog, reviews wall
 *   high → T3 Business      + booking, financing, team, cases, i18n
 *   premium → T4 Flagship   + AI concierge, portal, cinematic, 3D
 */

import type { TierId } from '@/engine/tiers'
import { nightflow } from './nightflow'
import { thermonorth } from './thermonorth'
import type { Tier, TierLadder } from './types'

export type KitTier = Tier

export function kitTier(step: TierId): KitTier {
  if (step === 'low') return 1
  if (step === 'mid' || step === 'scale') return 2
  if (step === 'high') return 3
  return 4
}

export const KIT_LADDERS: Record<string, TierLadder[]> = {
  nightflow: nightflow.tierLadder,
  thermonorth: thermonorth.tierLadder,
}

/** Cumulative module names active at a factory tier. */
export function kitModulesAt(slug: string, tier: KitTier): string[] {
  return KIT_LADDERS[slug]?.filter((l) => l.tier <= tier).flatMap((l) => l.modules) ?? []
}

/** What a tier-morph step ADDS on a module-built template — module names. */
export function kitStepAdds(slug: string, step: TierId): string[] {
  const tier = kitTier(step)
  const rung = KIT_LADDERS[slug]?.find((l) => l.tier === tier)
  if (!rung) return []
  /* Growth covers two OS steps — only surface the additions once, at mid */
  if (tier === 2 && step === 'scale') return []
  const summary = rung.modules.slice(0, 4)
  const rest = rung.modules.length > 4 ? ` +${rung.modules.length - 4}` : ''
  return [`${summary.join(', ')}${rest}`]
}

export const KIT_LABELS: Record<KitTier, string> = {
  1: 'Starter',
  2: 'Growth',
  3: 'Business',
  4: 'Flagship',
}
