/**
 * @file IKitchenRole — contract for the KitchenRole value object.
 */

import type { KitchenRole as KitchenRoleType } from '@/shared/types'

// ---------------------------------------------------------------------------
// IKitchenRole
// ---------------------------------------------------------------------------

/**
 * Describes the instance API of a kitchen member role value object.
 *
 * @remarks
 * Role hierarchy: `owner > editor > viewer`. All permission helpers are
 * derived from this ordering via {@link IKitchenRole.satisfies}.
 */
export interface IKitchenRole {
  /** The underlying role string. */
  readonly value: KitchenRoleType

  /** `true` when the role can create or modify items and invites (`'editor'` or `'owner'`). */
  readonly canWrite: boolean

  /** `true` when the role can perform destructive kitchen-level operations (`'owner'` only). */
  readonly canAdministrate: boolean

  /**
   * Returns `true` when this role has at least the privileges of `minimum`.
   *
   * @param minimum - The lowest acceptable role.
   */
  satisfies(minimum: KitchenRoleType): boolean

  /**
   * Returns `true` when both roles have the same string value.
   *
   * @param other - Another kitchen role to compare.
   */
  equals(other: IKitchenRole): boolean

  /** Returns the underlying role string. */
  toString(): string
}
