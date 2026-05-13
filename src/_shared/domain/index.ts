/**
 * @file Shared domain barrel — single import point for all domain-layer exports.
 *
 * @remarks
 * Organised by dependency order: value objects → specifications → services →
 * factory. Import classes for runtime use and interfaces for type-level use.
 *
 * @example
 * ```ts
 * import { ExpiryDate, IsExpiringSoonSpec, ItemLifecycleService } from '@/shared/domain'
 * import type { IExpiryDate, LifecycleResult } from '@/shared/domain'
 * ```
 */

// ─────────────────────────────────────────────────────────────────────────────
// Value Objects
// ─────────────────────────────────────────────────────────────────────────────

export { ExpiryDate } from './value-objects/expiry-date.value-object'
export type { IExpiryDate } from './value-objects/expiry-date.value-object.interface'

export { Quantity } from './value-objects/quantity.value-object'
export type { IQuantity } from './value-objects/quantity.value-object.interface'

export { ItemTags } from './value-objects/item-tags.value-object'
export type { IItemTags } from './value-objects/item-tags.value-object.interface'

export { KitchenRole } from './value-objects/kitchen-role.value-object'
export type { IKitchenRole } from './value-objects/kitchen-role.value-object.interface'

export { InviteToken } from './value-objects/invite-token.value-object'
export type { IInviteToken } from './value-objects/invite-token.value-object.interface'

// ─────────────────────────────────────────────────────────────────────────────
// Specifications
// ─────────────────────────────────────────────────────────────────────────────

/** Generic base contract — use `ISpecification<T>` to type-hint any spec. */
export type { ISpecification } from './specs/specification.interface'

export { IsExpiredSpec, IsExpiringSoonSpec, IsFreshSpec } from './specs/expiry.spec'
export type {
  IIsExpiredSpec,
  IIsExpiringSoonSpec,
  IIsFreshSpec,
} from './specs/expiry.spec.interface'

export { DueForNotificationSpec } from './specs/notification.spec'
export type { IDueForNotificationSpec } from './specs/notification.spec.interface'

// ─────────────────────────────────────────────────────────────────────────────
// Services
// ─────────────────────────────────────────────────────────────────────────────

export { ItemLifecycleService } from './services/item-lifecycle.service'
/** The `LifecycleResult` type is owned by the interface file; re-exported here for convenience. */
export type { LifecycleResult } from './services/item-lifecycle.service'
export type { IItemLifecycleService } from './services/item-lifecycle.service.interface'

export { KitchenPermissionService } from './services/kitchen-permission.service'
/** `KitchenAction` is owned by the interface file; re-exported here for convenience. */
export type { KitchenAction } from './services/kitchen-permission.service'
export type { IKitchenPermissionService } from './services/kitchen-permission.service.interface'

export { ScanQuotaService, DAILY_SCAN_LIMIT } from './services/scan-quota.service'
export type { IScanQuotaService } from './services/scan-quota.service.interface'

export { ExpiryEstimationService } from './services/expiry-estimation.service'
export type { IExpiryEstimationService } from './services/expiry-estimation.service.interface'

export { NotificationScheduleService } from './services/notification-schedule.service'
export type { INotificationScheduleService } from './services/notification-schedule.service.interface'

// ─────────────────────────────────────────────────────────────────────────────
// Factory
// ─────────────────────────────────────────────────────────────────────────────

export { ItemFactory } from './factories/item.factory'
export type { IItemFactory } from './factories/item.factory.interface'
