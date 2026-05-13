/**
 * @file ItemTags value object — an ordered, deduplicated set of food category tags.
 *
 * @remarks
 * Tags are compared as sets: two {@link ItemTags} instances are equal when they
 * contain the same tags regardless of insertion order.
 */

import type { ItemTag } from '@/shared/types'

// ---------------------------------------------------------------------------
// ItemTags
// ---------------------------------------------------------------------------

/**
 * Immutable value object representing the set of category tags on a food item.
 *
 * @remarks
 * Construct via {@link ItemTags.from} or {@link ItemTags.empty}. Duplicate
 * values are silently deduplicated on construction.
 *
 * Mutation methods (`add`, `remove`) return new instances — the original is
 * never modified.
 */
export class ItemTags {
  private readonly _tags: ReadonlyArray<ItemTag>

  private constructor(tags: ItemTag[]) {
    this._tags = [...new Set(tags)]
  }

  // ---------------------------------------------------------------------------
  // Factory methods
  // ---------------------------------------------------------------------------

  /**
   * Constructs an {@link ItemTags} instance from an array of tag strings,
   * silently deduplicating any repeated values.
   *
   * @param tags - Array of {@link ItemTag} values; duplicates are removed.
   * @returns A new {@link ItemTags} instance.
   */
  static from(tags: ItemTag[]): ItemTags {
    return new ItemTags(tags)
  }

  /**
   * Constructs an empty {@link ItemTags} instance with no tags.
   *
   * @returns A new {@link ItemTags} with zero tags.
   */
  static empty(): ItemTags {
    return new ItemTags([])
  }

  // ---------------------------------------------------------------------------
  // Accessors
  // ---------------------------------------------------------------------------

  /** A readonly snapshot of the current tag array in insertion order. */
  get values(): ReadonlyArray<ItemTag> {
    return this._tags
  }

  /** Number of distinct tags. */
  get size(): number {
    return this._tags.length
  }

  // ---------------------------------------------------------------------------
  // Business logic
  // ---------------------------------------------------------------------------

  /**
   * Returns a new {@link ItemTags} with `tag` added. If the tag is already
   * present the returned instance is logically equal to this one.
   *
   * @param tag - The {@link ItemTag} to add.
   * @returns A new {@link ItemTags} containing the additional tag.
   */
  add(tag: ItemTag): ItemTags {
    if (this._tags.includes(tag)) {
      return new ItemTags([...this._tags])
    }
    return new ItemTags([...this._tags, tag])
  }

  /**
   * Returns a new {@link ItemTags} with `tag` removed. If the tag is not
   * present the returned instance is logically equal to this one (no-op).
   *
   * @param tag - The {@link ItemTag} to remove.
   * @returns A new {@link ItemTags} without the specified tag.
   */
  remove(tag: ItemTag): ItemTags {
    return new ItemTags(this._tags.filter((t) => t !== tag) as ItemTag[])
  }

  /**
   * Returns `true` when the given tag is in this set.
   *
   * @param tag - The {@link ItemTag} to check.
   * @returns `true` if the tag is present.
   */
  has(tag: ItemTag): boolean {
    return this._tags.includes(tag)
  }

  /**
   * Returns `true` when both instances contain exactly the same tags,
   * regardless of insertion order.
   *
   * @param other - Another {@link ItemTags} to compare.
   * @returns `true` if the two sets are identical.
   */
  equals(other: ItemTags): boolean {
    if (this._tags.length !== other._tags.length) return false
    const sorted = [...this._tags].sort()
    const otherSorted = [...other._tags].sort()
    return sorted.every((tag, i) => tag === otherSorted[i])
  }

  /** Returns a mutable copy of the underlying tag array. */
  toArray(): ItemTag[] {
    return [...this._tags]
  }
}
