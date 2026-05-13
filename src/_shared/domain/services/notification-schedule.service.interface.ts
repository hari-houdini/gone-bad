/**
 * @file INotificationScheduleService — contract for filtering items due for push notifications.
 */

import type { ItemRow } from '@/shared/types'

// ---------------------------------------------------------------------------
// INotificationScheduleService
// ---------------------------------------------------------------------------

/**
 * Contract for filtering a list of items to those that should receive a push
 * notification on the evaluation date.
 *
 * @remarks
 * Eligibility rules (active status, non-null expiry, notification window) are
 * delegated to `DueForNotificationSpec`. This service is the entry point used
 * by the `send-notifications` Edge Function.
 */
export interface INotificationScheduleService {
  /**
   * Returns the subset of `items` that should receive a push notification today.
   *
   * @param items - Full list of item rows to evaluate.
   * @param defaultDaysBefore - Fallback threshold when an item has no per-item
   *   override. Defaults to `3`.
   * @param referenceDate - Date to evaluate against; defaults to `new Date()`.
   */
  getItemsDueForNotification(
    items: ItemRow[],
    defaultDaysBefore?: number,
    referenceDate?: Date,
  ): ItemRow[]
}
