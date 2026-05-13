/**
 * @file IExpiryDate — contract for the ExpiryDate value object.
 */

// ---------------------------------------------------------------------------
// IExpiryDate
// ---------------------------------------------------------------------------

/**
 * Describes the instance API of an immutable expiry-date value object.
 *
 * @remarks
 * Static factory methods (`fromISOString`, `today`) are construction concerns
 * and are not part of this interface.
 */
export interface IExpiryDate {
  /** The underlying `YYYY-MM-DD` string. */
  readonly isoString: string

  /**
   * Returns the number of whole calendar days from `referenceDate` until this
   * expiry date. Negative values indicate the item has already expired.
   *
   * @param referenceDate - The date to measure from; defaults to `new Date()`.
   */
  daysUntilExpiry(referenceDate?: Date): number

  /**
   * Returns `true` when the expiry date is in the past
   * (`daysUntilExpiry() < 0`).
   *
   * @param referenceDate - The date to evaluate against; defaults to `new Date()`.
   */
  isExpired(referenceDate?: Date): boolean

  /**
   * Returns `true` when the item is not yet expired but within `daysBefore`
   * calendar days of expiry.
   *
   * @param daysBefore - Alert threshold in days (inclusive). Defaults to `3`.
   * @param referenceDate - The date to evaluate against; defaults to `new Date()`.
   */
  isExpiringSoon(daysBefore?: number, referenceDate?: Date): boolean

  /**
   * Returns `true` when both dates represent the same calendar day.
   *
   * @param other - Another expiry date to compare.
   */
  equals(other: IExpiryDate): boolean

  /** Returns the underlying `YYYY-MM-DD` string. */
  toString(): string
}
