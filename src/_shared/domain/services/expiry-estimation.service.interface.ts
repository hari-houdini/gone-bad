/**
 * @file IExpiryEstimationService — contract for deriving expiry dates from AI day estimates.
 */

// ---------------------------------------------------------------------------
// IExpiryEstimationService
// ---------------------------------------------------------------------------

/**
 * Contract for converting an AI-estimated day count into an ISO expiry date string.
 *
 * @remarks
 * Used by `ItemFactory.fromGeminiResponse()` when the AI provides
 * `estimated_expiry_days` instead of a printed expiry date visible in the image.
 */
export interface IExpiryEstimationService {
  /**
   * Returns a `YYYY-MM-DD` ISO date string that is `estimatedDays` calendar days
   * after `referenceDate` (defaults to today).
   *
   * @param estimatedDays - Positive integer from the AI model's response.
   * @param referenceDate - The base date; defaults to `new Date()`.
   * @throws {Error} When `estimatedDays` is not a positive integer.
   */
  estimateExpiryDate(estimatedDays: number, referenceDate?: Date): string
}
