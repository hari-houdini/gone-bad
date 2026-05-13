/**
 * @file IItemLifecycleService — contract for item consumption lifecycle transitions.
 */

import type { ItemRow, ItemUpdate, ItemEventInsert, QuantityAction } from '@/shared/types'

// ---------------------------------------------------------------------------
// LifecycleResult
// ---------------------------------------------------------------------------

/**
 * Return value of every {@link IItemLifecycleService} method.
 *
 * @remarks
 * Both records must be persisted atomically — apply `itemUpdate` and insert
 * `eventInsert` in the same Supabase RPC call to avoid partial state.
 */
export interface LifecycleResult {
  /** Fields to patch on the `items` row. */
  itemUpdate: ItemUpdate
  /** New row to append to the `item_events` audit log. */
  eventInsert: ItemEventInsert
}

// ---------------------------------------------------------------------------
// IItemLifecycleService
// ---------------------------------------------------------------------------

/**
 * Contract for computing DB patches on `markUsed` and `markWasted` transitions.
 *
 * @remarks
 * Implementations must be free of Supabase imports — pure domain logic only.
 * The caller is responsible for persisting the returned patches atomically.
 */
export interface IItemLifecycleService {
  /**
   * Computes the patches to apply when a user marks an item as used.
   *
   * @param item - Current snapshot of the item row from the DB.
   * @param action - Validated quantity action from the Quantity Modal.
   * @param now - Optional timestamp override for deterministic tests.
   * @returns The item update and event insert to persist atomically.
   */
  markUsed(item: ItemRow, action: QuantityAction, now?: Date): LifecycleResult

  /**
   * Computes the patches to apply when a user marks an item as wasted.
   *
   * @param item - Current snapshot of the item row from the DB.
   * @param action - Validated quantity action from the Quantity Modal.
   * @param now - Optional timestamp override for deterministic tests.
   * @returns The item update and event insert to persist atomically.
   */
  markWasted(item: ItemRow, action: QuantityAction, now?: Date): LifecycleResult
}
