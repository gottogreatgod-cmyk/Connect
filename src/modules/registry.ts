import type { ModuleDefinition, ModuleInstance, SectionId, Tier, VariantId } from '@/modules/types'
import { announcementModules } from '@/modules/sections/global'
import { heroModules } from '@/modules/sections/hero'
import { valueModules } from '@/modules/sections/value'
import { proofModules } from '@/modules/sections/proof'
import { conversionModules } from '@/modules/sections/conversion'
import { commerceModules } from '@/modules/sections/commerce'
import { bookingModules } from '@/modules/sections/booking'
import { locationModules } from '@/modules/sections/location'
import { contentModules } from '@/modules/sections/content'
import { peopleModules } from '@/modules/sections/people'
import { hospitalityModules } from '@/modules/sections/hospitality'
import { propertyModules } from '@/modules/sections/property'
import { automotiveModules } from '@/modules/sections/automotive'
import { educationModules } from '@/modules/sections/education'
import { eventsModules } from '@/modules/sections/events'
import { b2bModules } from '@/modules/sections/b2b'
import { regulatedModules } from '@/modules/sections/regulated'
import { nonprofitModules } from '@/modules/sections/nonprofit'
import { motionModules } from '@/modules/sections/motion'
import { formsModules } from '@/modules/sections/forms'

export const MODULES: ModuleDefinition[] = [
  ...announcementModules,
  ...heroModules,
  ...valueModules,
  ...proofModules,
  ...conversionModules,
  ...commerceModules,
  ...bookingModules,
  ...locationModules,
  ...contentModules,
  ...peopleModules,
  ...hospitalityModules,
  ...propertyModules,
  ...automotiveModules,
  ...educationModules,
  ...eventsModules,
  ...b2bModules,
  ...regulatedModules,
  ...nonprofitModules,
  ...motionModules,
  ...formsModules,
]

const modulesById = new Map<string, ModuleDefinition>()
for (const definition of MODULES) {
  if (modulesById.has(definition.id)) {
    throw new Error(`Duplicate module id: ${definition.id}`)
  }
  modulesById.set(definition.id, definition)
}

export function getModule(id: string): ModuleDefinition | undefined {
  return modulesById.get(id)
}

export function getVariant(moduleId: string, variantId: VariantId) {
  const definition = getModule(moduleId)
  if (!definition) return undefined
  return definition.variants.find((variant) => variant.id === variantId) ?? definition.variants[0]
}

export function createInstance(uid: string, moduleId: string, variantId: VariantId = 'a'): ModuleInstance | null {
  const variant = getVariant(moduleId, variantId)
  if (!variant) return null
  return { uid, moduleId, variantId, props: structuredClone(variant.defaults) }
}

export function modulesBySection(section: SectionId): ModuleDefinition[] {
  return MODULES.filter((definition) => definition.section === section)
}

export type { Tier }
