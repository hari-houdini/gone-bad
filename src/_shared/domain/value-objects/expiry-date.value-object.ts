/**
 * @file ExpiryDate value object — immutable wrapper around an ISO calendar date.
 *
 * @remarks
 * All date comparisons use UTC midnight to eliminate DST-caused off-by-one
 * errors. Time-of-day is intentionally discarded; expiry is a calendar concept.
 */

import type { IExpiryDate } from './expiry-date.value-object.interface'

// ---------------------------------------------------------------------------
// ExpiryDate
// ---------------------------------------------------------------------------

/**
 * Immutable value object representing a food item's expiry date.
 *
 * @remarks
 * Construct via {@link ExpiryDate.fromISOString} rather than `new ExpiryDate()`
 * to enforce the `YYYY-MM-DD` format invariant.
 *
 * Use-by semantics: an item expiring today (`daysUntilExpiry() === 0`) is
 * **not** considered expired — it is still safe to use on that calendar day.
 */
export class ExpiryDate implements IExpiryDate {
  private constructor(private readonly _value: string) {}

  // ---------------------------------------------------------------------------
  // Factory methods
  // ---------------------------------------------------------------------------

  /**
   * Constructs an {@link ExpiryDate} from an ISO 8601 calendar date string.
   *
   * @param value - A date string in `YYYY-MM-DD` format.
   * @returns A new {@link ExpiryDate} instance.
   * @throws {Error} When `value` is not a valid `YYYY-MM-DD` string.
   *
   * @example
   * ```ts
   * const expiry = ExpiryDate.fromISOString('2025-12-31')
   * ```
   */
  static fromISOString(value: string): ExpiryDate {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new Error(`ExpiryDate: invalid ISO date string '${value}' — expected YYYY-MM-DD`)
    }
    const d = new Date(value + 'T00:00:00Z')
    const [y, m, day] = value.split('-').map(Number)
    // A round-trip check catches overflow dates (e.g. Feb 30 → Mar 2) that
    // the Date constructor silently accepts by rolling over the month.
    if (
      isNaN(d.getTime()) ||
      d.getUTCFullYear() !== y ||
      d.getUTCMonth() + 1 !== m ||
      d.getUTCDate() !== day
    ) {
      throw new Error(`ExpiryDate: '${value}' is not a real calendar date`)
    }
    return new ExpiryDate(value)
  }

  /**
   * Constructs an {@link ExpiryDate} representing today's calendar date.
   *
   * @param referenceDate - Optional override; defaults to `new Date()`.
   * @returns An {@link ExpiryDate} for the current calendar day.
   */
  static today(referenceDate?: Date): ExpiryDate {
    const d = referenceDate ?? new Date()
    const iso = d.toISOString().slice(0, 10)
    return new ExpiryDate(iso)
  }

  // ---------------------------------------------------------------------------
  // Accessors
  // ---------------------------------------------------------------------------

  /** The underlying `YYYY-MM-DD` string. */
  get isoString(): string {
    return this._value
  }

  // ---------------------------------------------------------------------------
  // Business logic
  // ---------------------------------------------------------------------------

  /**
   * Returns the number of whole calendar days from `referenceDate` until this
   * expiry date. Negative values indicate the item has already expired.
   *
   * @param referenceDate - The date to measure from; defaults to `new Date()`.
   * @returns Days remaining (negative when past expiry).
   */
  daysUntilExpiry(referenceDate?: Date): number {
    const ref = referenceDate ?? new Date()
    const refUTC = Date.UTC(ref.getFullYear(), ref.getMonth(), ref.getDate())
    const [year, month, day] = this._value.split('-').map(Number)
    const expiryUTC = Date.UTC(year, month - 1, day)
    return Math.round((expiryUTC - refUTC) / (1000 * 60 * 60 * 24))
  }

  /**
   * Returns `true` when the expiry date has passed, i.e. `daysUntilExpiry() < 0`.
   *
   * @remarks
   * An item expiring today (`daysUntilExpiry() === 0`) is **not** expired —
   * use-by convention treats the expiry day itself as the last valid day.
   *
   * @param referenceDate - The date to evaluate against; defaults to `new Date()`.
   * @returns `true` if the item is past its expiry date.
   */
  isExpired(referenceDate?: Date): boolean {
    return this.daysUntilExpiry(referenceDate) < 0
  }

  /**
   * Returns `true` when the item is not yet expired but within `daysBefore`
   * calendar days of its expiry date.
   *
   * @param daysBefore - Alert threshold in days (inclusive). Defaults to `3`.
   * @param referenceDate - The date to evaluate against; defaults to `new Date()`.
   * @returns `true` if `0 ≤ daysUntilExpiry ≤ daysBefore`.
   */
  isExpiringSoon(daysBefore = 3, referenceDate?: Date): boolean {
    const days = this.daysUntilExpiry(referenceDate)
    return days >= 0 && days <= daysBefore
  }

  /**
   * Returns `true` when both expiry dates represent the same calendar day.
   *
   * @param other - Another {@link ExpiryDate} to compare.
   * @returns `true` if the ISO strings are identical.
   */
  equals(other: ExpiryDate): boolean {
    return this._value === other._value
  }

  /** Returns the underlying `YYYY-MM-DD` string. */
  toString(): string {
    return this._value
  }
}
