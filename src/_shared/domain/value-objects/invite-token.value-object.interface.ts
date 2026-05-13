/**
 * @file IInviteToken — contract for the InviteToken value object.
 */

// ---------------------------------------------------------------------------
// IInviteToken
// ---------------------------------------------------------------------------

/**
 * Describes the instance API of an invite token value object.
 *
 * @remarks
 * Static factory methods (`fromString`, `generate`) are construction concerns
 * and are not part of this interface.
 */
export interface IInviteToken {
  /** The underlying 32-character URL-safe token string. */
  readonly value: string

  /**
   * Returns the Expo deep-link URL for this token.
   *
   * @returns A string of the form `gonebad://kitchen/invite/{token}`.
   */
  toDeepLink(): string

  /** Returns the underlying token string. */
  toString(): string
}
