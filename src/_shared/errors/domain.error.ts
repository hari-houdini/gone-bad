/**
 * Typed domain errors for Gone Bad.
 *
 * Design principles
 * -----------------
 * 1. Each class uses a `readonly _tag` string-literal discriminant instead of
 *    `instanceof` checks.  Tags survive serialisation, module-instance
 *    boundaries, and work with exhaustive `switch` statements.
 *
 * 2. Every class extends `Error` so stack traces, `instanceof Error`, and
 *    third-party tooling (Sentry, etc.) all work out of the box.
 *
 * 3. Domain-specific fields carry exactly the information a handler needs to
 *    log, display, or recover — nothing more, nothing less.
 *
 * 4. `ModerationError` and `InviteError` reuse the Zod enum types defined in
 *    the shared schema layer — no duplicated string constants.
 */

import type { HandleInviteErrorCode, ModerationReason } from '@/shared/types'

// ---------------------------------------------------------------------------
// NotFoundError
// ---------------------------------------------------------------------------

export class NotFoundError extends Error {
  readonly _tag = 'NotFoundError' as const

  constructor(
    /** e.g. "Item", "Kitchen", "KitchenInvite" */
    public readonly resource: string,
    /** The id (or token) that was looked up */
    public readonly id: string,
  ) {
    super(`${resource} not found: ${id}`)
    this.name = 'NotFoundError'
  }
}

// ---------------------------------------------------------------------------
// PermissionError
// ---------------------------------------------------------------------------

export class PermissionError extends Error {
  readonly _tag = 'PermissionError' as const

  constructor(
    /** e.g. "delete_kitchen", "generate_invite" */
    public readonly action: string,
    /** e.g. "owner", "editor" */
    public readonly requiredRole: string,
  ) {
    super(`Permission denied: '${action}' requires role '${requiredRole}'`)
    this.name = 'PermissionError'
  }
}

// ---------------------------------------------------------------------------
// RateLimitError
// ---------------------------------------------------------------------------

export class RateLimitError extends Error {
  readonly _tag = 'RateLimitError' as const

  constructor(
    /** The daily scan limit (ADR-009: 20) */
    public readonly limit: number,
    /** When the counter resets (typically midnight UTC) */
    public readonly resetAt: Date,
  ) {
    super(`Rate limit of ${limit} scans/day exceeded. Resets at ${resetAt.toISOString()}`)
    this.name = 'RateLimitError'
  }
}

// ---------------------------------------------------------------------------
// AIError
// ---------------------------------------------------------------------------

export class AIError extends Error {
  readonly _tag = 'AIError' as const

  constructor(
    message: string,
    /** Preserve the original Gemini / fetch error for logging */
    public readonly originalError?: unknown,
  ) {
    super(message)
    this.name = 'AIError'
    if (originalError != null) {
      this.cause = originalError
    }
  }
}

// ---------------------------------------------------------------------------
// ModerationError
// ---------------------------------------------------------------------------

export class ModerationError extends Error {
  readonly _tag = 'ModerationError' as const

  constructor(
    /** One of: NOT_FOOD | OBSCENE | BLURRY | NON_TRACKABLE */
    public readonly reason: ModerationReason,
  ) {
    super(`Image failed moderation: ${reason}`)
    this.name = 'ModerationError'
  }
}

// ---------------------------------------------------------------------------
// StorageError
// ---------------------------------------------------------------------------

export type StorageOperation = 'upload' | 'download' | 'delete' | 'signedUrl'

export class StorageError extends Error {
  readonly _tag = 'StorageError' as const

  constructor(
    public readonly operation: StorageOperation,
    /** Preserve the original Supabase Storage / S3 error */
    public readonly originalError?: unknown,
  ) {
    super(`Storage operation '${operation}' failed`)
    this.name = 'StorageError'
    if (originalError != null) {
      this.cause = originalError
    }
  }
}

// ---------------------------------------------------------------------------
// PushDeliveryError
// ---------------------------------------------------------------------------

export class PushDeliveryError extends Error {
  readonly _tag = 'PushDeliveryError' as const

  constructor(
    /** Expo push token that bounced — used to clean up push_tokens table */
    public readonly token: string,
    /** Expo receipt error message (e.g. "DeviceNotRegistered") */
    public readonly reason: string,
  ) {
    super(`Push notification delivery failed for token '${token}': ${reason}`)
    this.name = 'PushDeliveryError'
  }
}

// ---------------------------------------------------------------------------
// InviteError
// ---------------------------------------------------------------------------

export class InviteError extends Error {
  readonly _tag = 'InviteError' as const

  constructor(
    /** One of: INVALID_TOKEN | EXPIRED | MAX_USES_REACHED | ALREADY_MEMBER */
    public readonly code: HandleInviteErrorCode,
  ) {
    super(`Invite error: ${code}`)
    this.name = 'InviteError'
  }
}

// ---------------------------------------------------------------------------
// DomainError — discriminated union of all typed errors
// ---------------------------------------------------------------------------

export type DomainError =
  | NotFoundError
  | PermissionError
  | RateLimitError
  | AIError
  | ModerationError
  | StorageError
  | PushDeliveryError
  | InviteError

/**
 * Type-guard: is `e` one of our typed domain errors?
 *
 * Useful in `catch (e)` blocks where TypeScript types `e` as `unknown`.
 *
 * @example
 * ```ts
 * try { ... }
 * catch (e) {
 *   if (isDomainError(e)) {
 *     switch (e._tag) {
 *       case 'RateLimitError': return show429(e.resetAt)
 *       case 'PermissionError': return show403(e.action)
 *       // ...
 *     }
 *   }
 * }
 * ```
 */
export function isDomainError(e: unknown): e is DomainError {
  return (
    e instanceof Error &&
    '_tag' in e &&
    typeof (e as Record<string, unknown>)._tag === 'string'
  )
}
