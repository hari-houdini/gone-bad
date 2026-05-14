/**
 * @file tags.ts — ordered list of all 14 canonical food category tags.
 *
 * @remarks
 * Derived from `ItemTagSchema.options` — this is the single source of truth.
 * Updating the enum in `item.schema.ts` automatically updates this list.
 */

import { ItemTagSchema } from '@/shared/types'

/**
 * Ordered list of all 14 canonical item tags.
 *
 * Derived from `ItemTagSchema.options` — this is the single source of truth.
 * Never maintain a separate copy; update the schema and this updates automatically.
 */
export const ITEM_TAGS = ItemTagSchema.options satisfies readonly string[]

/** Union type of all valid item tag strings, derived from {@link ITEM_TAGS}. */
export type ItemTagOption = (typeof ITEM_TAGS)[number]
