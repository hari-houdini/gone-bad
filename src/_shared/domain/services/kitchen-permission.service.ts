/**
 * @file KitchenPermissionService — role-based action guards for kitchen operations.
 *
 * @remarks
 * Permissions are encoded in a static lookup table that maps each
 * {@link KitchenAction} to the minimum {@link KitchenRole} required. All
 * ordering logic is delegated to the {@link KitchenRole} value object.
 */

import type { KitchenRole as KitchenRoleType } from '@/shared/types'
import { PermissionError } from '@/shared/errors'
import { KitchenRole } from '../value-objects/kitchen-role.value-object'

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
// Permission table
// ---------------------------------------------------------------------------

const ACTION_REQUIREMENTS: Record<KitchenAction, KitchenRoleType> = {
  add_item: 'editor',
  edit_item: 'editor',
  delete_item: 'editor',
  generate_invite: 'editor',
  remove_member: 'owner',
  rename_kitchen: 'owner',
  delete_kitchen: 'owner',
}

// ---------------------------------------------------------------------------
// KitchenPermissionService
// ---------------------------------------------------------------------------

/**
 * Checks whether a kitchen member role is permitted to perform a given action.
 *
 * @remarks
 * Use {@link KitchenPermissionService.canPerformAction} for conditional UI
 * rendering and {@link KitchenPermissionService.assertCan} in mutation
 * callbacks where a thrown {@link PermissionError} should abort the operation.
 *
 * @example
 * ```ts
 * // Guard a button
 * const canDelete = KitchenPermissionService.canPerformAction(role, 'delete_item')
 *
 * // Guard a mutation
 * KitchenPermissionService.assertCan(role, 'rename_kitchen')
 * await supabase.from('kitchens').update({ name }).eq('id', kitchenId)
 * ```
 */
export class KitchenPermissionService {
  /**
   * Returns `true` when `role` meets the minimum requirement for `action`.
   *
   * @param role - The member's current role string.
   * @param action - The {@link KitchenAction} to test.
   * @returns `true` if the role satisfies the minimum; `false` otherwise.
   */
  static canPerformAction(role: KitchenRoleType, action: KitchenAction): boolean {
    return KitchenRole.from(role).satisfies(ACTION_REQUIREMENTS[action])
  }

  /**
   * Throws a {@link PermissionError} when `role` is insufficient for `action`.
   *
   * @param role - The member's current role string.
   * @param action - The {@link KitchenAction} to assert.
   * @throws {PermissionError} When the role does not satisfy the minimum
   *   requirement, carrying the `action` and required role as structured fields.
   */
  static assertCan(role: KitchenRoleType, action: KitchenAction): void {
    if (!KitchenPermissionService.canPerformAction(role, action)) {
      throw new PermissionError(action, ACTION_REQUIREMENTS[action])
    }
  }
}
