/**
 * @file ScanQuotaService — daily AI scan rate-limit checks.
 *
 * @remarks
 * ADR-009: users are limited to 20 AI image scans per calendar day.
 * Barcode scans bypass this quota entirely — the exemption is enforced at the
 * call site, not here.
 *
 * This service is consumed by both the `analyse-image` Edge Function (server)
 * and the React Native client (pre-flight UX warning).
 */

// ---------------------------------------------------------------------------
// Constant
// ---------------------------------------------------------------------------

/** Daily AI scan cap (ADR-009). */
export const DAILY_SCAN_LIMIT = 20

// ---------------------------------------------------------------------------
// ScanQuotaService
// ---------------------------------------------------------------------------

/**
 * Stateless helpers for evaluating a user's daily AI scan quota.
 *
 * @example
 * ```ts
 * if (ScanQuotaService.isQuotaExceeded(todayCount)) {
 *   throw new RateLimitError(DAILY_SCAN_LIMIT, resetAt)
 * }
 * ```
 */
export class ScanQuotaService {
  /**
   * Returns `true` when the user has consumed their daily scan allowance.
   *
   * @param scanCount - Number of AI scans performed today for this user.
   * @returns `true` if `scanCount ≥ DAILY_SCAN_LIMIT`.
   */
  static isQuotaExceeded(scanCount: number): boolean {
    return scanCount >= DAILY_SCAN_LIMIT
  }

  /**
   * Returns how many AI scans remain for today, clamped to a minimum of `0`.
   *
   * @param scanCount - Number of AI scans performed today for this user.
   * @returns `max(0, DAILY_SCAN_LIMIT - scanCount)`.
   */
  static remainingScans(scanCount: number): number {
    return Math.max(0, DAILY_SCAN_LIMIT - scanCount)
  }
}
