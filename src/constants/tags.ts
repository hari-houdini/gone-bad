import { ItemTagSchema } from '@/shared/types'

/**
 * Ordered list of all 14 canonical item tags.
 *
 * Derived from `ItemTagSchema.options` — this is the single source of truth.
 * Never maintain a separate copy; update the schema and this updates automatically.
 */
export const ITEM_TAGS = ItemTagSchema.options satisfies readonly string[]

export type ItemTagOption = (typeof ITEM_TAGS)[number]
