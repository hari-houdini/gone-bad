/**
 * @file ItemLifecycleService — pure domain logic for item consumption transitions.
 *
 * @remarks
 * This service is intentionally free of Supabase imports. It takes a snapshot
 * of the current item and the user's action, and returns the exact DB patches to
 * apply. The caller (React Query mutation) is responsible for persisting them.
 *
 * Output shape:
 * - `itemUpdate` — passed to `UPDATE items SET ...`
 * - `eventInsert` — passed to `INSERT INTO item_events ...`
 */

import type { ItemRow, ItemUpdate, ItemEventInsert, QuantityAction } from '@/shared/types'
import { Quantity } from '../value-objects/quantity.value-object'
import type {
  IItemLifecycleService,
  LifecycleResult,
} from './item-lifecycle.service.interface'

export type { LifecycleResult } from './item-lifecycle.service.interface'

// ---------------------------------------------------------------------------
// ItemLifecycleService
// ---------------------------------------------------------------------------

/**
 * Computes the DB patches for `markUsed` and `markWasted` item transitions.
 *
 * @remarks
 * Both methods follow the same logic:
 * 1. Resolve the effective remaining quantity
 *    (`quantity_remaining` if tracked, otherwise `quantity`).
 * 2. Determine the consumed amount
 *    (`all` → full remainder; `partial` → `action.quantity`).
 * 3. Decide the next state via {@link Quantity.isFullyConsumedBy}:
 *    - Fully consumed → terminal status (`'used'` or `'wasted'`) + timestamp.
 *    - Partially consumed → status stays `'active'`, `quantity_remaining` reduced.
 * 4. Build and return `{ itemUpdate, eventInsert }` — **no Supabase calls**.
 */
export class ItemLifecycleService implements IItemLifecycleService {
  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Computes the patches to apply when a user marks an item as used.
   *
   * @param item - Current snapshot of the item row from the DB.
   * @param action - Validated quantity action from the Quantity Modal.
   * @param now - Optional timestamp override for deterministic tests.
   * @returns The item update and event insert to persist atomically.
   */
  markUsed(item: ItemRow, action: QuantityAction, now?: Date): LifecycleResult {
    return ItemLifecycleService._apply(item, action, 'used', now)
  }

  /**
   * Computes the patches to apply when a user marks an item as wasted.
   *
   * @param item - Current snapshot of the item row from the DB.
   * @param action - Validated quantity action from the Quantity Modal.
   * @param now - Optional timestamp override for deterministic tests.
   * @returns The item update and event insert to persist atomically.
   */
  markWasted(item: ItemRow, action: QuantityAction, now?: Date): LifecycleResult {
    return ItemLifecycleService._apply(item, action, 'wasted', now)
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private static _apply(
    item: ItemRow,
    action: QuantityAction,
    eventType: 'used' | 'wasted',
    now?: Date,
  ): LifecycleResult {
    const effectiveRemaining = item.quantity_remaining ?? item.quantity
    const consumed =
      action.quantity_mode === 'all' ? effectiveRemaining : (action.quantity ?? effectiveRemaining)

    const remaining = new Quantity(effectiveRemaining, item.quantity_unit)
    const isFullyConsumed = remaining.isFullyConsumedBy(consumed)
    const newRemaining = remaining.subtract(consumed).value

    const timestamp = (now ?? new Date()).toISOString()

    const itemUpdate: ItemUpdate = {
      quantity_remaining: newRemaining,
      ...(isFullyConsumed && {
        status: eventType,
        used_at: eventType === 'used' ? timestamp : undefined,
        wasted_at: eventType === 'wasted' ? timestamp : undefined,
      }),
    }

    const eventInsert: ItemEventInsert = {
      item_id: item.id,
      event_type: eventType,
      quantity: consumed,
      quantity_unit: action.quantity_unit ?? item.quantity_unit ?? null,
      note: action.note ?? null,
    }

    return { itemUpdate, eventInsert }
  }
}
