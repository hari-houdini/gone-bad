/**
 * @file Expiry specification objects for the Dashboard urgency grid.
 *
 * @remarks
 * The three specs partition every item into exactly one urgency bucket:
 * - {@link IsExpiredSpec} — expiry date has passed.
 * - {@link IsExpiringSoonSpec} — not expired but within the alert window.
 * - {@link IsFreshSpec} — outside the alert window (or no expiry date).
 *
 * Items with a `null` expiry date satisfy only {@link IsFreshSpec} — the
 * other two return `false` because no determination can be made.
 *
 * All classes accept an optional `referenceDate` constructor argument so
 * tests remain deterministic without patching `Date.now()`.
 */

import type { ItemRow } from '@/shared/types'
import { ExpiryDate } from '../value-objects/expiry-date.value-object'

// ---------------------------------------------------------------------------
// IsExpiredSpec
// ---------------------------------------------------------------------------

/**
 * Satisfied when an item's expiry date has passed relative to `referenceDate`.
 *
 * @remarks
 * Returns `false` for items with a `null` expiry date — absence of a date
 * is not the same as being expired.
 *
 * @example
 * ```ts
 * const spec = new IsExpiredSpec()
 * const expired = items.filter(i => spec.isSatisfiedBy(i))
 * ```
 */
export class IsExpiredSpec {
  /**
   * @param referenceDate - Date to evaluate against; defaults to `new Date()`.
   */
  constructor(private readonly referenceDate?: Date) {}

  /**
   * Returns `true` when the item's expiry date is in the past.
   *
   * @param item - The {@link ItemRow} to evaluate.
   * @returns `true` if the item is past its expiry date; `false` when
   *   `expiry_date` is `null` or the date has not yet passed.
   */
  isSatisfiedBy(item: ItemRow): boolean {
    if (item.expiry_date === null) return false
    return ExpiryDate.fromISOString(item.expiry_date).isExpired(this.referenceDate)
  }
}

// ---------------------------------------------------------------------------
// IsExpiringSoonSpec
// ---------------------------------------------------------------------------

/**
 * Satisfied when an item is not yet expired but within `daysBefore` calendar
 * days of its expiry date.
 *
 * @remarks
 * Returns `false` for items with a `null` expiry date and for items that
 * are already expired. Use together with {@link IsFreshSpec} and
 * {@link IsExpiredSpec} to partition items into urgency buckets.
 *
 * @example
 * ```ts
 * const spec = new IsExpiringSoonSpec(7)
 * const urgent = items.filter(i => spec.isSatisfiedBy(i))
 * ```
 */
export class IsExpiringSoonSpec {
  /**
   * @param daysBefore - Alert threshold in calendar days (inclusive). Defaults to `3`.
   * @param referenceDate - Date to evaluate against; defaults to `new Date()`.
   */
  constructor(
    private readonly daysBefore: number = 3,
    private readonly referenceDate?: Date,
  ) {}

  /**
   * Returns `true` when the item's expiry is within the configured threshold.
   *
   * @param item - The {@link ItemRow} to evaluate.
   * @returns `true` if `0 ≤ daysUntilExpiry ≤ daysBefore`; `false` when
   *   `expiry_date` is `null` or the item is already expired.
   */
  isSatisfiedBy(item: ItemRow): boolean {
    if (item.expiry_date === null) return false
    return ExpiryDate.fromISOString(item.expiry_date).isExpiringSoon(
      this.daysBefore,
      this.referenceDate,
    )
  }
}

// ---------------------------------------------------------------------------
// IsFreshSpec
// ---------------------------------------------------------------------------

/**
 * Satisfied when an item is neither expired nor expiring soon.
 *
 * @remarks
 * Items with a `null` expiry date always satisfy this spec — no known expiry
 * date means the item is treated as indefinitely fresh.
 *
 * Pass the same `daysBefore` value to all three expiry specs to ensure the
 * buckets are mutually exclusive and collectively exhaustive.
 *
 * @example
 * ```ts
 * const spec = new IsFreshSpec(3)
 * const safe = items.filter(i => spec.isSatisfiedBy(i))
 * ```
 */
export class IsFreshSpec {
  /**
   * @param daysBefore - Must match the threshold used by {@link IsExpiringSoonSpec}
   *   so the two specs together form a clean partition. Defaults to `3`.
   * @param referenceDate - Date to evaluate against; defaults to `new Date()`.
   */
  constructor(
    private readonly daysBefore: number = 3,
    private readonly referenceDate?: Date,
  ) {}

  /**
   * Returns `true` when the item is outside all urgency thresholds.
   *
   * @param item - The {@link ItemRow} to evaluate.
   * @returns `true` if the item has no expiry date, or its expiry is more than
   *   `daysBefore` days away.
   */
  isSatisfiedBy(item: ItemRow): boolean {
    if (item.expiry_date === null) return true
    const expiry = ExpiryDate.fromISOString(item.expiry_date)
    return !expiry.isExpired(this.referenceDate) && !expiry.isExpiringSoon(this.daysBefore, this.referenceDate)
  }
}
