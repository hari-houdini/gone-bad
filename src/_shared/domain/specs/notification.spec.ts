/**
 * @file Notification specification — eligibility check for push alerts.
 *
 * @remarks
 * Used by the `send-notifications` Edge Function (via `NotificationScheduleService`)
 * to filter which active items should receive a push notification on a given day.
 *
 * The spec deliberately does **not** check the `notification_log` table — that
 * idempotency guard lives in the Edge Function. The spec answers only whether an
 * item is within its configured notification window.
 */

import type { ItemRow } from '@/shared/types'
import { ExpiryDate } from '../value-objects/expiry-date.value-object'

// ---------------------------------------------------------------------------
// DueForNotificationSpec
// ---------------------------------------------------------------------------

/**
 * Satisfied when a food item should receive a push notification today.
 *
 * @remarks
 * An item is due when **all** of the following hold:
 * 1. `status === 'active'` — consumed and expired items are excluded.
 * 2. `expiry_date` is non-null — no date means no meaningful alert.
 * 3. The expiry date falls within the notification window:
 *    `0 ≤ daysUntilExpiry ≤ effectiveDaysBefore`.
 *
 * The effective threshold is `item.notification_days_before` when set,
 * otherwise the `defaultDaysBefore` passed to the constructor. This allows
 * per-item overrides without the EF needing to know about them.
 *
 * @example
 * ```ts
 * const spec = new DueForNotificationSpec(3)
 * const dueItems = allItems.filter(i => spec.isSatisfiedBy(i))
 * ```
 */
export class DueForNotificationSpec {
  /**
   * @param defaultDaysBefore - Fallback alert threshold when an item has no
   *   per-item override. Defaults to `3`.
   * @param referenceDate - Date to evaluate against; defaults to `new Date()`.
   */
  constructor(
    private readonly defaultDaysBefore: number = 3,
    private readonly referenceDate?: Date,
  ) {}

  /**
   * Returns `true` when the item should receive a push notification today.
   *
   * @param item - The {@link ItemRow} to evaluate.
   * @returns `true` if the item is active, has an expiry date, and its expiry
   *   falls within the effective notification window.
   */
  isSatisfiedBy(item: ItemRow): boolean {
    if (item.status !== 'active') return false
    if (item.expiry_date === null) return false

    const daysBefore = item.notification_days_before ?? this.defaultDaysBefore
    return ExpiryDate.fromISOString(item.expiry_date).isExpiringSoon(daysBefore, this.referenceDate)
  }
}
