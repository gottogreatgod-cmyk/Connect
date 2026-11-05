import { createInstance, getModule, getVariant } from '@/modules/registry'
import type { ModuleInstance, VariantId } from '@/modules/types'

export type { ModuleInstance }

export type CompositionAction =
  | { type: 'add'; uid: string; moduleId: string; variantId: VariantId }
  | { type: 'remove'; uid: string }
  | { type: 'move'; uid: string; direction: -1 | 1 }
  | { type: 'update'; uid: string; key: string; value: unknown }
  | { type: 'updateProps'; uid: string; props: Record<string, unknown> }
  | { type: 'setVariant'; uid: string; variantId: VariantId }
  | { type: 'resetProps'; uid: string }
  | { type: 'replace'; modules: ModuleInstance[] }
  | { type: 'clear' }

export const STARTER_MODULE_IDS: Array<[string, VariantId]> = [
  ['announcement-bar', 'a'],
  ['site-header', 'a'],
  ['hero', 'a'],
  ['trust-bar', 'b'],
  ['benefit-grid', 'a'],
  ['how-it-works', 'a'],
  ['review-carousel', 'a'],
  ['faq-accordion', 'a'],
  ['contact-form', 'b'],
  ['site-footer', 'a'],
]

export function createStarterComposition(): ModuleInstance[] {
  return STARTER_MODULE_IDS.flatMap(([moduleId, variantId], index) => {
    const instance = createInstance(`starter-${index}`, moduleId, variantId)
    return instance ? [instance] : []
  })
}

export function compositionReducer(state: ModuleInstance[], action: CompositionAction): ModuleInstance[] {
  switch (action.type) {
    case 'add': {
      const instance = createInstance(action.uid, action.moduleId, action.variantId)
      return instance ? [...state, instance] : state
    }
    case 'remove':
      return state.filter((instance) => instance.uid !== action.uid)
    case 'move': {
      const index = state.findIndex((instance) => instance.uid === action.uid)
      const target = index + action.direction
      if (index < 0 || target < 0 || target >= state.length) return state
      const next = [...state]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    }
    case 'update':
      return state.map((instance) =>
        instance.uid === action.uid
          ? { ...instance, props: { ...instance.props, [action.key]: action.value } }
          : instance,
      )
    case 'updateProps':
      return state.map((instance) =>
        instance.uid === action.uid ? { ...instance, props: { ...instance.props, ...action.props } } : instance,
      )
    case 'setVariant':
      return state.map((instance) => {
        if (instance.uid !== action.uid) return instance
        const variant = getVariant(instance.moduleId, action.variantId)
        if (!variant) return instance
        // Keep values for keys that exist in the new variant, fill the rest from defaults.
        const merged: Record<string, unknown> = { ...structuredClone(variant.defaults) }
        for (const [key, value] of Object.entries(instance.props)) {
          if (key in merged && typeof value === typeof merged[key]) {
            merged[key] = value
          }
        }
        return { ...instance, variantId: variant.id, props: merged }
      })
    case 'resetProps':
      return state.map((instance) => {
        if (instance.uid !== action.uid) return instance
        const variant = getVariant(instance.moduleId, instance.variantId)
        return variant ? { ...instance, props: structuredClone(variant.defaults) } : instance
      })
    case 'replace':
      return action.modules
    case 'clear':
      return []
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Parse persisted instances, dropping anything the registry no longer knows. */
export function parseSavedModules(raw: unknown): ModuleInstance[] {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((entry): ModuleInstance[] => {
    if (!isRecord(entry) || typeof entry.uid !== 'string' || typeof entry.moduleId !== 'string') return []
    const variantId: VariantId = entry.variantId === 'b' ? 'b' : 'a'
    const variant = getVariant(entry.moduleId, variantId)
    if (!variant) return []
    const props = isRecord(entry.props) ? entry.props : {}
    return [
      {
        uid: entry.uid,
        moduleId: entry.moduleId,
        variantId,
        props: { ...structuredClone(variant.defaults), ...props },
      },
    ]
  })
}

export function pageText(instances: ModuleInstance[]): string {
  return instances
    .map((instance) => {
      const definition = getModule(instance.moduleId)
      const variant = getVariant(instance.moduleId, instance.variantId)
      if (!definition || !variant) return ''
      const strings = Object.values(instance.props)
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .filter((value): value is string => typeof value === 'string' && !/^https?:\/\//.test(value))
      return `${definition.name} (${variant.label}): ${strings.join('. ')}`
    })
    .filter(Boolean)
    .join('\n\n')
}
