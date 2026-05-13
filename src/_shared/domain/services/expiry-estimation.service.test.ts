import { ExpiryEstimationService } from './expiry-estimation.service'

// Reference date throughout: 2025-06-15.
const REF = new Date('2025-06-15T12:00:00Z')

// ---------------------------------------------------------------------------
// estimateExpiryDate — valid inputs
// ---------------------------------------------------------------------------

describe('ExpiryEstimationService.estimateExpiryDate', () => {
  it('adds the estimated days to the reference date', () => {
    expect(ExpiryEstimationService.estimateExpiryDate(5, REF)).toBe('2025-06-20')
  })

  it('handles 1 day correctly', () => {
    expect(ExpiryEstimationService.estimateExpiryDate(1, REF)).toBe('2025-06-16')
  })

  it('handles a full week', () => {
    expect(ExpiryEstimationService.estimateExpiryDate(7, REF)).toBe('2025-06-22')
  })

  it('correctly crosses a month boundary', () => {
    expect(ExpiryEstimationService.estimateExpiryDate(20, REF)).toBe('2025-07-05')
  })

  it('correctly crosses a year boundary', () => {
    const dec31 = new Date('2025-12-31T00:00:00Z')
    expect(ExpiryEstimationService.estimateExpiryDate(1, dec31)).toBe('2026-01-01')
  })

  it('returns a YYYY-MM-DD string', () => {
    const result = ExpiryEstimationService.estimateExpiryDate(3, REF)
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('handles large day counts (e.g. 365 for a one-year estimate)', () => {
    expect(ExpiryEstimationService.estimateExpiryDate(365, REF)).toBe('2026-06-15')
  })
})

// ---------------------------------------------------------------------------
// estimateExpiryDate — invalid inputs
// ---------------------------------------------------------------------------

describe('ExpiryEstimationService.estimateExpiryDate — invalid inputs', () => {
  it('throws for zero days', () => {
    expect(() => ExpiryEstimationService.estimateExpiryDate(0, REF)).toThrow()
  })

  it('throws for negative days', () => {
    expect(() => ExpiryEstimationService.estimateExpiryDate(-3, REF)).toThrow()
  })

  it('throws for a fractional day count', () => {
    expect(() => ExpiryEstimationService.estimateExpiryDate(2.5, REF)).toThrow()
  })

  it('throws for NaN', () => {
    expect(() => ExpiryEstimationService.estimateExpiryDate(NaN, REF)).toThrow()
  })
})
