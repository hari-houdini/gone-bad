/**
 * @file IItemTags — contract for the ItemTags value object.
 */

import type { ItemTag } from '@/shared/types'

// ---------------------------------------------------------------------------
// IItemTags
// ---------------------------------------------------------------------------

/**
 * Describes the instance API of an immutable food-category tag set.
 *
 * @remarks
 * Tags are treated as a set: equality is order-independent. Mutation methods
 * (`add`, `remove`) return new instances.
 */
export interface IItemTags {
  /** A readonly snapshot of the current tag array in insertion order. */
  readonly values: ReadonlyArray<ItemTag>
  /** Number of distinct tags. */
  readonly size: number

  /**
   * Returns a new tag set with `tag` added; idempotent if already present.
   *
   * @param tag - The tag to add.
   */
  add(tag: ItemTag): IItemTags

  /**
   * Returns a new tag set with `tag` removed; no-op if absent.
   *
   * @param tag - The tag to remove.
   */
  remove(tag: ItemTag): IItemTags

  /**
   * Returns `true` when the given tag is present.
   *
   * @param tag - The tag to check.
   */
  has(tag: ItemTag): boolean

  /**
   * Returns `true` when both sets contain exactly the same tags (order-independent).
   *
   * @param other - Another tag set to compare.
   */
  equals(other: IItemTags): boolean

  /** Returns a mutable copy of the underlying tag array. */
  toArray(): ItemTag[]
}
