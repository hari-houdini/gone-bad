/**
 * @file Typed domain errors for Gone Bad.
 *
 * @remarks
 * Design principles:
 *
 * 1. Each class uses a `readonly _tag` string-literal discriminant instead of
 *    `instanceof` checks. Tags survive serialisation, module-instance boundaries,
 *    and work with exhaustive `switch` statements.
 *
 * 2. Every class `extends Error` so stack traces, `instanceof Error`, and
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
    /** Resource type that could not be found, e.g. `'Item'`, `'Kitchen'`, `'KitchenInvite'`. */
    public readonly resource: string,
    /** Identifier or token that was looked up. */
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
    /** Action that was attempted, e.g. `'delete_kitchen'`, `'generate_invite'`. */
    public readonly action: string,
    /** Minimum role required to perform the action, e.g. `'owner'`, `'editor'`. */
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
    /** Daily scan cap that was exceeded (ADR-009: `20`). */
    public readonly limit: number,
    /** Timestamp at which the counter resets, typically midnight UTC. */
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
    /** Human-readable description of the AI failure. */
    message: string,
    /** Original Gemini or `fetch` error, preserved for logging. */
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
    /** Reason the image was rejected: `NOT_FOOD`, `OBSCENE`, `BLURRY`, or `NON_TRACKABLE`. */
    public readonly reason: ModerationReason,
  ) {
    super(`Image failed moderation: ${reason}`)
    this.name = 'ModerationError'
  }
}

// ---------------------------------------------------------------------------
// StorageError
// ---------------------------------------------------------------------------

/** Storage operations that can fail and be wrapped in a {@link StorageError}. */
export type StorageOperation = 'upload' | 'download' | 'delete' | 'signedUrl'

export class StorageError extends Error {
  readonly _tag = 'StorageError' as const

  constructor(
    /** Storage operation that failed. */
    public readonly operation: StorageOperation,
    /** Original Supabase Storage error, preserved for logging. */
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
    /** Expo push token that bounced; used to clean up the `push_tokens` table. */
    public readonly token: string,
    /** Expo receipt error string, e.g. `'DeviceNotRegistered'`. */
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
    /** Structured error code: `INVALID_TOKEN`, `EXPIRED`, `MAX_USES_REACHED`, or `ALREADY_MEMBER`. */
    public readonly code: HandleInviteErrorCode,
  ) {
    super(`Invite error: ${code}`)
    this.name = 'InviteError'
  }
}

// ---------------------------------------------------------------------------
// DomainError — discriminated union of all typed errors
// ---------------------------------------------------------------------------

/**
 * Discriminated union of every typed domain error in the application.
 *
 * @remarks
 * Narrow with `e._tag` in a `switch` statement for exhaustive handling,
 * or use the {@link isDomainError} guard to check an unknown caught value.
 */
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
 * Returns `true` when `e` is one of the application's typed domain errors.
 *
 * @remarks
 * Useful in `catch (e)` blocks where TypeScript widens the caught value to
 * `unknown`. The check is structural — it looks for `instanceof Error` plus a
 * string `_tag` property — so it works reliably across module boundaries and
 * after serialisation.
 *
 * @param e - The value to test, typically the caught unknown in a `catch` block.
 * @returns `true` if `e` is a {@link DomainError}; `false` otherwise.
 *
 * @example
 * ```ts
 * try {
 *   await someOperation()
 * } catch (e) {
 *   if (isDomainError(e)) {
 *     switch (e._tag) {
 *       case 'RateLimitError': return show429(e.resetAt)
 *       case 'PermissionError': return show403(e.action)
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
