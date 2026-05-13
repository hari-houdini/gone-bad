/**
 * @file NotificationScheduleService — filters items due for push notifications.
 *
 * @remarks
 * This service is the entry point used by the `send-notifications` Edge Function.
 * It delegates eligibility logic to {@link DueForNotificationSpec}, which
 * handles per-item day overrides and the `status === 'active'` guard.
 */

import type { ItemRow } from '@/shared/types'
import { DueForNotificationSpec } from '../specs/notification.spec'

// ---------------------------------------------------------------------------
// NotificationScheduleService
// ---------------------------------------------------------------------------

/**
 * Filters a list of items to those that should receive a push notification today.
 *
 * @remarks
 * Eligibility rules are owned by {@link DueForNotificationSpec}:
 * - Item must be `'active'`.
 * - Item must have a non-null `expiry_date`.
 * - Expiry must fall within the notification window
 *   (`item.notification_days_before ?? defaultDaysBefore`).
 *
 * @example
 * ```ts
 * const dueItems = NotificationScheduleService.getItemsDueForNotification(
 *   allKitchenItems,
 *   userSettings.notification_days_before ?? 3,
 * )
 * ```
 */
export class NotificationScheduleService {
  /**
   * Returns the subset of `items` that should receive a push notification today.
   *
   * @param items - Full list of item rows to evaluate (typically all active items
   *   for a kitchen).
   * @param defaultDaysBefore - Fallback threshold when an item has no per-item
   *   override. Defaults to `3`.
   * @param referenceDate - Date to evaluate against; defaults to `new Date()`.
   * @returns Items satisfying {@link DueForNotificationSpec}.
   */
  static getItemsDueForNotification(
    items: ItemRow[],
    defaultDaysBefore = 3,
    referenceDate?: Date,
  ): ItemRow[] {
    const spec = new DueForNotificationSpec(defaultDaysBefore, referenceDate)
    return items.filter((item) => spec.isSatisfiedBy(item))
  }
}
