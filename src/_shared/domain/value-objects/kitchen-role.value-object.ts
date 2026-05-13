/**
 * @file KitchenRole value object — role hierarchy with permission helpers.
 *
 * @remarks
 * Roles follow a linear hierarchy: `owner > editor > viewer`.
 * All permission checks are derived from this single ordering.
 */

import type { KitchenRole as KitchenRoleType } from '@/shared/types'
import type { IKitchenRole } from './kitchen-role.value-object.interface'

// ---------------------------------------------------------------------------
// Role rank table
// ---------------------------------------------------------------------------

const ROLE_RANK: Record<KitchenRoleType, number> = {
  owner: 2,
  editor: 1,
  viewer: 0,
}

// ---------------------------------------------------------------------------
// KitchenRole
// ---------------------------------------------------------------------------

/**
 * Immutable value object wrapping a kitchen member's role.
 *
 * @remarks
 * Construct via {@link KitchenRole.from}. Permission checks are derived from a
 * numeric rank table so they remain correct if the role hierarchy ever gains an
 * intermediate level.
 *
 * @example
 * ```ts
 * const role = KitchenRole.from('editor')
 * if (!role.canWrite) throw new PermissionError('add_item', 'editor')
 * ```
 */
export class KitchenRole implements IKitchenRole {
  private constructor(private readonly _role: KitchenRoleType) {}

  // ---------------------------------------------------------------------------
  // Factory
  // ---------------------------------------------------------------------------

  /**
   * Constructs a {@link KitchenRole} from a raw role string.
   *
   * @param role - One of `'owner'`, `'editor'`, or `'viewer'`.
   * @returns A new {@link KitchenRole} instance.
   */
  static from(role: KitchenRoleType): KitchenRole {
    return new KitchenRole(role)
  }

  // ---------------------------------------------------------------------------
  // Accessors
  // ---------------------------------------------------------------------------

  /** The underlying role string. */
  get value(): KitchenRoleType {
    return this._role
  }

  // ---------------------------------------------------------------------------
  // Permission helpers
  // ---------------------------------------------------------------------------

  /**
   * Returns `true` when the role can create or modify items and invites
   * (`'editor'` or `'owner'`).
   */
  get canWrite(): boolean {
    return this.satisfies('editor')
  }

  /**
   * Returns `true` when the role can perform destructive kitchen-level
   * operations such as renaming, deleting, or removing members (`'owner'` only).
   */
  get canAdministrate(): boolean {
    return this.satisfies('owner')
  }

  /**
   * Returns `true` when this role has at least the privileges of `minimum`.
   *
   * @remarks
   * Uses numeric rank comparison, so `satisfies('viewer')` is always `true` and
   * `satisfies('owner')` is `true` only for owners.
   *
   * @param minimum - The lowest acceptable role.
   * @returns `true` if `this.rank ≥ rank(minimum)`.
   */
  satisfies(minimum: KitchenRoleType): boolean {
    return ROLE_RANK[this._role] >= ROLE_RANK[minimum]
  }

  /**
   * Returns `true` when both roles have the same string value.
   *
   * @param other - Another {@link KitchenRole} to compare.
   * @returns `true` if the role strings are identical.
   */
  equals(other: KitchenRole): boolean {
    return this._role === other._role
  }

  /** Returns the underlying role string. */
  toString(): string {
    return this._role
  }
}
