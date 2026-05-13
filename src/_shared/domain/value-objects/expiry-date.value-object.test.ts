import { ExpiryDate } from './expiry-date.value-object'

const REF = new Date('2025-06-15T12:00:00Z') // mid-day to rule out midnight edge cases

// ---------------------------------------------------------------------------
// ExpiryDate.fromISOString
// ---------------------------------------------------------------------------

describe('ExpiryDate.fromISOString', () => {
  it('constructs from a valid YYYY-MM-DD string', () => {
    const d = ExpiryDate.fromISOString('2025-12-31')
    expect(d.isoString).toBe('2025-12-31')
  })

  it('throws when the string is not YYYY-MM-DD format', () => {
    expect(() => ExpiryDate.fromISOString('31-12-2025')).toThrow()
    expect(() => ExpiryDate.fromISOString('2025/12/31')).toThrow()
    expect(() => ExpiryDate.fromISOString('2025-12-31T00:00:00Z')).toThrow()
    expect(() => ExpiryDate.fromISOString('')).toThrow()
  })

  it('throws for an impossible calendar date', () => {
    expect(() => ExpiryDate.fromISOString('2025-02-30')).toThrow()
  })
})

// ---------------------------------------------------------------------------
// ExpiryDate.today
// ---------------------------------------------------------------------------

describe('ExpiryDate.today', () => {
  it('returns the reference date as an ISO string', () => {
    const today = ExpiryDate.today(REF)
    expect(today.isoString).toBe('2025-06-15')
  })
})

// ---------------------------------------------------------------------------
// daysUntilExpiry
// ---------------------------------------------------------------------------

describe('daysUntilExpiry', () => {
  it('returns a positive number for a future date', () => {
    const d = ExpiryDate.fromISOString('2025-06-18')
    expect(d.daysUntilExpiry(REF)).toBe(3)
  })

  it('returns 0 when expiry is today', () => {
    const d = ExpiryDate.fromISOString('2025-06-15')
    expect(d.daysUntilExpiry(REF)).toBe(0)
  })

  it('returns a negative number for a past date', () => {
    const d = ExpiryDate.fromISOString('2025-06-12')
    expect(d.daysUntilExpiry(REF)).toBe(-3)
  })

  it('correctly counts across a month boundary', () => {
    const d = ExpiryDate.fromISOString('2025-07-01')
    expect(d.daysUntilExpiry(REF)).toBe(16)
  })

  it('correctly counts across a year boundary', () => {
    const d = ExpiryDate.fromISOString('2026-01-01')
    const ref = new Date('2025-12-31T00:00:00Z')
    expect(d.daysUntilExpiry(ref)).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// isExpired
// ---------------------------------------------------------------------------

describe('isExpired', () => {
  it('returns false when expiry is in the future', () => {
    const d = ExpiryDate.fromISOString('2025-06-20')
    expect(d.isExpired(REF)).toBe(false)
  })

  it('returns false when expiry is today (use-by semantics)', () => {
    const d = ExpiryDate.fromISOString('2025-06-15')
    expect(d.isExpired(REF)).toBe(false)
  })

  it('returns true when expiry was yesterday', () => {
    const d = ExpiryDate.fromISOString('2025-06-14')
    expect(d.isExpired(REF)).toBe(true)
  })

  it('returns true for a date well in the past', () => {
    const d = ExpiryDate.fromISOString('2024-01-01')
    expect(d.isExpired(REF)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// isExpiringSoon
// ---------------------------------------------------------------------------

describe('isExpiringSoon', () => {
  it('returns true when expiry is today (0 days)', () => {
    const d = ExpiryDate.fromISOString('2025-06-15')
    expect(d.isExpiringSoon(3, REF)).toBe(true)
  })

  it('returns true when expiry is within the threshold', () => {
    const d = ExpiryDate.fromISOString('2025-06-17') // 2 days away
    expect(d.isExpiringSoon(3, REF)).toBe(true)
  })

  it('returns true when expiry is exactly at the threshold', () => {
    const d = ExpiryDate.fromISOString('2025-06-18') // exactly 3 days
    expect(d.isExpiringSoon(3, REF)).toBe(true)
  })

  it('returns false when expiry is one day beyond the threshold', () => {
    const d = ExpiryDate.fromISOString('2025-06-19') // 4 days away
    expect(d.isExpiringSoon(3, REF)).toBe(false)
  })

  it('returns false for an already-expired item', () => {
    const d = ExpiryDate.fromISOString('2025-06-14')
    expect(d.isExpiringSoon(3, REF)).toBe(false)
  })

  it('defaults daysBefore to 3 when not provided', () => {
    const ref = new Date('2025-06-15T00:00:00Z')
    const within = ExpiryDate.fromISOString('2025-06-17')
    const outside = ExpiryDate.fromISOString('2025-06-20')
    expect(within.isExpiringSoon(undefined, ref)).toBe(true)
    expect(outside.isExpiringSoon(undefined, ref)).toBe(false)
  })

  it('respects a custom daysBefore of 7', () => {
    const d = ExpiryDate.fromISOString('2025-06-22') // 7 days away
    expect(d.isExpiringSoon(7, REF)).toBe(true)
    expect(d.isExpiringSoon(6, REF)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// equals
// ---------------------------------------------------------------------------

describe('equals', () => {
  it('returns true for two dates with the same ISO string', () => {
    const a = ExpiryDate.fromISOString('2025-06-20')
    const b = ExpiryDate.fromISOString('2025-06-20')
    expect(a.equals(b)).toBe(true)
  })

  it('returns false for different dates', () => {
    const a = ExpiryDate.fromISOString('2025-06-20')
    const b = ExpiryDate.fromISOString('2025-06-21')
    expect(a.equals(b)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// toString
// ---------------------------------------------------------------------------

describe('toString', () => {
  it('returns the underlying ISO string', () => {
    const d = ExpiryDate.fromISOString('2025-09-01')
    expect(d.toString()).toBe('2025-09-01')
  })
})
