/**
 * @file ExpiryEstimationService — derives an expiry date from an AI-estimated day count.
 *
 * @remarks
 * Used by `ItemFactory.fromGeminiResponse()` when Gemini provides
 * `estimated_expiry_days` instead of a printed expiry date.
 *
 * All arithmetic is UTC-based to avoid DST off-by-one errors on date-only
 * calculations, matching the convention established in {@link ExpiryDate}.
 */

// ---------------------------------------------------------------------------
// ExpiryEstimationService
// ---------------------------------------------------------------------------

/**
 * Converts an AI-estimated day count into an ISO `YYYY-MM-DD` date string.
 *
 * @example
 * ```ts
 * // Gemini says "use within 5 days"
 * const expiry = ExpiryEstimationService.estimateExpiryDate(5)
 * // → '2025-06-20' (if today is 2025-06-15)
 * ```
 */
export class ExpiryEstimationService {
  /**
   * Returns a `YYYY-MM-DD` ISO date string that is `estimatedDays` calendar days
   * after `referenceDate` (defaults to today).
   *
   * @param estimatedDays - Positive integer from the AI model's response.
   * @param referenceDate - The base date; defaults to `new Date()`.
   * @returns An ISO date string in `YYYY-MM-DD` format.
   * @throws {Error} When `estimatedDays` is not a positive integer — indicates
   *   a Gemini prompt regression.
   */
  static estimateExpiryDate(estimatedDays: number, referenceDate?: Date): string {
    if (!Number.isInteger(estimatedDays) || estimatedDays <= 0) {
      throw new Error(
        `ExpiryEstimationService: estimatedDays must be a positive integer, got ${estimatedDays}`,
      )
    }

    const ref = referenceDate ?? new Date()
    // Construct a UTC midnight date from the reference to strip the time component.
    const utcMidnight = Date.UTC(ref.getFullYear(), ref.getMonth(), ref.getDate())
    const result = new Date(utcMidnight)
    result.setUTCDate(result.getUTCDate() + estimatedDays)
    return result.toISOString().slice(0, 10)
  }
}
