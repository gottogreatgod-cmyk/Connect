import type { ComponentType } from 'react'


export type SectionId =
  | 'global'
  | 'hero'
  | 'value'
  | 'proof'
  | 'conversion'
  | 'commerce'
  | 'booking'
  | 'location'
  | 'content'
  | 'people'
  | 'hospitality'
  | 'property'
  | 'automotive'
  | 'education'
  | 'events'
  | 'b2b'
  | 'regulated'
  | 'nonprofit'
  | 'motion'
  | 'forms'

export type Tier = 'Starter' | 'Growth' | 'Business' | 'Flagship'

export type VariantId = 'a' | 'b'

/**
 * A single design path for a module. Every module in the studio ships with
 * exactly two variants — two unique ways to solve the same job — so the same
 * module can produce two completely different looking pages.
 */
export interface VariantDefinition {
  id: VariantId
  /** Short design-direction name, e.g. "Editorial" */
  label: string
  /** One sentence describing the visual approach of this path */
  description: string
  /* Components declare their own props, so the registry stores them type-erased. */
  component: ComponentType<any>
  /**
   * Default props. Also acts as the prop schema for the inspector and for the
   * AI copilot: every key here is editable, and values are either strings or
   * JSON-serialisable arrays/objects.
   */
  defaults: Record<string, any>
  /** Prop keys that hold image URLs — the AI can source or generate these. */
  imageProps?: string[]
}

export interface ModuleDefinition {
  id: string
  name: string
  section: SectionId
  tier: Tier
  purpose: string
  /** The production rule from the Modules Playbook, shown in the library. */
  rule?: string
  /** Exactly two design paths. */
  variants: [VariantDefinition, VariantDefinition]
}


export interface ModuleInstance {
  uid: string
  moduleId: string
  variantId: VariantId
  props: Record<string, unknown>
}
