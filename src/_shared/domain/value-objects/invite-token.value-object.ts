/**
 * @file InviteToken value object — validated 32-character URL-safe token.
 *
 * @remarks
 * The token format (`[a-zA-Z0-9_-]{32}`) is enforced by both the DB
 * `kitchen_invites.token` column and {@link HandleInviteRequestSchema}. This
 * value object is the single place that owns that regex.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Regex that every valid invite token must match. */
const TOKEN_REGEX = /^[a-zA-Z0-9_-]{32}$/

/**
 * 64-character URL-safe alphabet used by {@link InviteToken.generate}.
 * Maps one-to-one onto a random byte value `0–63` with zero modulo bias
 * because `256 % 64 === 0`.
 */
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'

// ---------------------------------------------------------------------------
// InviteToken
// ---------------------------------------------------------------------------

/**
 * Immutable value object wrapping a kitchen invite token.
 *
 * @remarks
 * Construct via {@link InviteToken.fromString} (from a DB row or URL) or
 * {@link InviteToken.generate} (for new invites).
 *
 * @example
 * ```ts
 * // From DB / deep-link param
 * const token = InviteToken.fromString(params.token)
 * router.push(token.toDeepLink())
 *
 * // Generating a new invite
 * const token = InviteToken.generate()
 * await supabase.from('kitchen_invites').insert({ token: token.value, ... })
 * ```
 */
export class InviteToken {
  private constructor(private readonly _token: string) {}

  // ---------------------------------------------------------------------------
  // Factory methods
  // ---------------------------------------------------------------------------

  /**
   * Constructs an {@link InviteToken} from an existing token string.
   *
   * @param token - A 32-character URL-safe base-64 string matching
   *   `[a-zA-Z0-9_-]{32}`.
   * @returns A validated {@link InviteToken} instance.
   * @throws {Error} When `token` does not match the expected format.
   */
  static fromString(token: string): InviteToken {
    if (!TOKEN_REGEX.test(token)) {
      throw new Error(
        `InviteToken: invalid token '${token}' — must match [a-zA-Z0-9_-]{32}`,
      )
    }
    return new InviteToken(token)
  }

  /**
   * Generates a cryptographically random {@link InviteToken}.
   *
   * @remarks
   * Uses `crypto.getRandomValues` (available in Node ≥ 15, Deno, and React
   * Native) to fill 32 random bytes and maps each byte to the URL-safe
   * `ALPHABET` with zero modulo bias.
   *
   * @returns A new random {@link InviteToken}.
   */
  static generate(): InviteToken {
    const bytes = new Uint8Array(32)
    crypto.getRandomValues(bytes)
    const token = Array.from(bytes, (b) => ALPHABET[b % 64]).join('')
    return new InviteToken(token)
  }

  // ---------------------------------------------------------------------------
  // Accessors
  // ---------------------------------------------------------------------------

  /** The underlying 32-character token string. */
  get value(): string {
    return this._token
  }

  // ---------------------------------------------------------------------------
  // Presentation
  // ---------------------------------------------------------------------------

  /**
   * Returns the Expo deep-link URL for this token.
   *
   * @remarks
   * The `gonebad://` scheme is registered in `app.json` (Phase 0.21). The path
   * mirrors the Expo Router file `app/kitchen/invite/[token].tsx`.
   *
   * @returns A deep-link string of the form `gonebad://kitchen/invite/{token}`.
   */
  toDeepLink(): string {
    return `gonebad://kitchen/invite/${this._token}`
  }

  /** Returns the underlying token string. */
  toString(): string {
    return this._token
  }
}
