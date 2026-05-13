/**
 * Public API for domain errors.
 *
 * Named re-exports only — no `export * from` — so the public surface is
 * auditable and tree-shaking is reliable.
 */
export {
  NotFoundError,
  PermissionError,
  RateLimitError,
  AIError,
  ModerationError,
  StorageError,
  PushDeliveryError,
  InviteError,
  isDomainError,
} from './domain.error'

export type {
  DomainError,
  StorageOperation,
} from './domain.error'
