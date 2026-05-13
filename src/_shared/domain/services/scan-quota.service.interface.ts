/**
 * @file IScanQuotaService — contract for daily AI scan quota checks.
 */

// ---------------------------------------------------------------------------
// IScanQuotaService
// ---------------------------------------------------------------------------

/**
 * Contract for evaluating a user's daily AI scan quota.
 *
 * @remarks
 * Barcode scans bypass this quota entirely — the exemption is enforced at the
 * call site, not by implementations of this interface.
 */
export interface IScanQuotaService {
  /**
   * Returns `true` when the user has consumed their daily scan allowance.
   *
   * @param scanCount - Number of AI scans performed today for this user.
   */
  isQuotaExceeded(scanCount: number): boolean

  /**
   * Returns how many AI scans remain for today, clamped to a minimum of `0`.
   *
   * @param scanCount - Number of AI scans performed today for this user.
   */
  remainingScans(scanCount: number): number
}
