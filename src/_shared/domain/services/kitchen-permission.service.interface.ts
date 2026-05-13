/**
 * @file IKitchenPermissionService — contract for kitchen role-based action guards.
 */

import type { KitchenRole as KitchenRoleType } from '@/shared/types'

// ---------------------------------------------------------------------------
// KitchenAction
// ---------------------------------------------------------------------------

/**
 * All operations that require a permission check before execution.
 *
 * @remarks
 * - Write actions (`add_item`, `edit_item`, `delete_item`, `generate_invite`)
 *   require at least `'editor'`.
 * - Administrative actions (`remove_member`, `rename_kitchen`, `delete_kitchen`)
 *   require `'owner'`.
 */
export type KitchenAction =
  | 'add_item'
  | 'edit_item'
  | 'delete_item'
  | 'generate_invite'
  | 'remove_member'
  | 'rename_kitchen'
  | 'delete_kitchen'

// ---------------------------------------------------------------------------
// IKitchenPermissionService
// ---------------------------------------------------------------------------

/**
 * Contract for role-based kitchen action permission checks.
 *
 * @remarks
 * Use {@link IKitchenPermissionService.canPerformAction} for conditional UI
 * rendering and {@link IKitchenPermissionService.assertCan} in mutation
 * callbacks where a thrown error should abort the operation.
 */
export interface IKitchenPermissionService {
  /**
   * Returns `true` when `role` meets the minimum requirement for `action`.
   *
   * @param role - The member's current role string.
   * @param action - The {@link KitchenAction} to test.
   */
  canPerformAction(role: KitchenRoleType, action: KitchenAction): boolean

  /**
   * Throws a `PermissionError` when `role` is insufficient for `action`.
   *
   * @param role - The member's current role string.
   * @param action - The {@link KitchenAction} to assert.
   * @throws {PermissionError} When the role does not satisfy the minimum requirement.
   */
  assertCan(role: KitchenRoleType, action: KitchenAction): void
}
