import { Quantity } from './quantity.value-object'

// ---------------------------------------------------------------------------
// Constructor
// ---------------------------------------------------------------------------

describe('Quantity constructor', () => {
  it('constructs with a positive value and unit', () => {
    const q = new Quantity(2.5, 'kg')
    expect(q.value).toBe(2.5)
    expect(q.unit).toBe('kg')
  })

  it('constructs with zero value', () => {
    const q = new Quantity(0, 'ml')
    expect(q.value).toBe(0)
  })

  it('defaults unit to null when omitted', () => {
    const q = new Quantity(3)
    expect(q.unit).toBeNull()
  })

  it('throws for a negative value', () => {
    expect(() => new Quantity(-1, 'g')).toThrow()
  })

  it('throws for NaN', () => {
    expect(() => new Quantity(NaN)).toThrow()
  })

  it('throws for Infinity', () => {
    expect(() => new Quantity(Infinity)).toThrow()
  })
})

// ---------------------------------------------------------------------------
// subtract
// ---------------------------------------------------------------------------

describe('subtract', () => {
  it('returns a new Quantity with the amount removed', () => {
    const q = new Quantity(10, 'slices')
    const result = q.subtract(3)
    expect(result.value).toBe(7)
    expect(result.unit).toBe('slices')
  })

  it('does not mutate the original', () => {
    const q = new Quantity(10)
    q.subtract(3)
    expect(q.value).toBe(10)
  })

  it('clamps to 0 when amount exceeds value', () => {
    const q = new Quantity(2)
    expect(q.subtract(5).value).toBe(0)
  })

  it('clamps to 0 for exact consumption', () => {
    const q = new Quantity(4)
    expect(q.subtract(4).value).toBe(0)
  })

  it('preserves the unit on the returned Quantity', () => {
    const q = new Quantity(500, 'g')
    expect(q.subtract(100).unit).toBe('g')
  })

  it('throws when amount is zero', () => {
    const q = new Quantity(5)
    expect(() => q.subtract(0)).toThrow()
  })

  it('throws when amount is negative', () => {
    const q = new Quantity(5)
    expect(() => q.subtract(-2)).toThrow()
  })

  it('throws when amount is NaN', () => {
    const q = new Quantity(5)
    expect(() => q.subtract(NaN)).toThrow()
  })
})

// ---------------------------------------------------------------------------
// isFullyConsumedBy
// ---------------------------------------------------------------------------

describe('isFullyConsumedBy', () => {
  it('returns true when amount equals value', () => {
    const q = new Quantity(4)
    expect(q.isFullyConsumedBy(4)).toBe(true)
  })

  it('returns true when amount exceeds value', () => {
    const q = new Quantity(4)
    expect(q.isFullyConsumedBy(10)).toBe(true)
  })

  it('returns false when amount is less than value', () => {
    const q = new Quantity(4)
    expect(q.isFullyConsumedBy(3)).toBe(false)
  })

  it('returns false when amount is 0', () => {
    const q = new Quantity(4)
    expect(q.isFullyConsumedBy(0)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// equals
// ---------------------------------------------------------------------------

describe('equals', () => {
  it('returns true for equal value and unit', () => {
    const a = new Quantity(5, 'kg')
    const b = new Quantity(5, 'kg')
    expect(a.equals(b)).toBe(true)
  })

  it('returns false for different values', () => {
    const a = new Quantity(5, 'kg')
    const b = new Quantity(6, 'kg')
    expect(a.equals(b)).toBe(false)
  })

  it('returns false for different units', () => {
    const a = new Quantity(5, 'kg')
    const b = new Quantity(5, 'g')
    expect(a.equals(b)).toBe(false)
  })

  it('returns false when one has a unit and the other does not', () => {
    const a = new Quantity(5, 'kg')
    const b = new Quantity(5, null)
    expect(a.equals(b)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// toString
// ---------------------------------------------------------------------------

describe('toString', () => {
  it('includes the unit when present', () => {
    expect(new Quantity(2.5, 'kg').toString()).toBe('2.5 kg')
  })

  it('omits the unit when null', () => {
    expect(new Quantity(3).toString()).toBe('3')
  })
})
