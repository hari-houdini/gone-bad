import { ExpiryEstimationService } from './expiry-estimation.service'

// Reference date throughout: 2025-06-15.
const REF = new Date('2025-06-15T12:00:00Z')
const svc = new ExpiryEstimationService()

// ---------------------------------------------------------------------------
// estimateExpiryDate — valid inputs
// ---------------------------------------------------------------------------

describe('ExpiryEstimationService.estimateExpiryDate', () => {
  it('adds the estimated days to the reference date', () => {
    expect(svc.estimateExpiryDate(5, REF)).toBe('2025-06-20')
  })

  it('handles 1 day correctly', () => {
    expect(svc.estimateExpiryDate(1, REF)).toBe('2025-06-16')
  })

  it('handles a full week', () => {
    expect(svc.estimateExpiryDate(7, REF)).toBe('2025-06-22')
  })

  it('correctly crosses a month boundary', () => {
    expect(svc.estimateExpiryDate(20, REF)).toBe('2025-07-05')
  })

  it('correctly crosses a year boundary', () => {
    const dec31 = new Date('2025-12-31T00:00:00Z')
    expect(svc.estimateExpiryDate(1, dec31)).toBe('2026-01-01')
  })

  it('returns a YYYY-MM-DD string', () => {
    const result = svc.estimateExpiryDate(3, REF)
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('handles large day counts (e.g. 365 for a one-year estimate)', () => {
    expect(svc.estimateExpiryDate(365, REF)).toBe('2026-06-15')
  })
})

// ---------------------------------------------------------------------------
// estimateExpiryDate — invalid inputs
// ---------------------------------------------------------------------------

describe('ExpiryEstimationService.estimateExpiryDate — invalid inputs', () => {
  it('throws for zero days', () => {
    expect(() => svc.estimateExpiryDate(0, REF)).toThrow()
  })

  it('throws for negative days', () => {
    expect(() => svc.estimateExpiryDate(-3, REF)).toThrow()
  })

  it('throws for a fractional day count', () => {
    expect(() => svc.estimateExpiryDate(2.5, REF)).toThrow()
  })

  it('throws for NaN', () => {
    expect(() => svc.estimateExpiryDate(NaN, REF)).toThrow()
  })
})
