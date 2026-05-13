import type { ItemRow } from '@/shared/types'
import { IsExpiredSpec, IsExpiringSoonSpec, IsFreshSpec } from './expiry.spec'

// Reference date used across all tests: 2025-06-15 (mid-day to rule out midnight edges).
const REF = new Date('2025-06-15T12:00:00Z')

// ---------------------------------------------------------------------------
// Test helper
// ---------------------------------------------------------------------------

function makeItem(overrides: Partial<ItemRow> = {}): ItemRow {
  return {
    id: 'item-id',
    kitchen_id: 'kitchen-id',
    name: 'Test Item',
    description: null,
    tags: [],
    quantity: 1,
    quantity_unit: null,
    quantity_remaining: null,
    purchase_date: null,
    opened_date: null,
    expiry_date: null,
    expiry_source: 'manual',
    image_url: null,
    image_thumbnail_url: null,
    image_path: null,
    barcode: null,
    ai_confidence: null,
    storage_suggestion: null,
    status: 'active',
    used_at: null,
    wasted_at: null,
    notification_days_before: null,
    added_by: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    deleted_at: null,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// IsExpiredSpec
// ---------------------------------------------------------------------------

describe('IsExpiredSpec', () => {
  const spec = new IsExpiredSpec(REF)

  it('is satisfied by an item whose expiry date has passed', () => {
    expect(spec.isSatisfiedBy(makeItem({ expiry_date: '2025-06-14' }))).toBe(true)
  })

  it('is not satisfied by an item expiring today (use-by semantics)', () => {
    expect(spec.isSatisfiedBy(makeItem({ expiry_date: '2025-06-15' }))).toBe(false)
  })

  it('is not satisfied by an item expiring in the future', () => {
    expect(spec.isSatisfiedBy(makeItem({ expiry_date: '2025-06-20' }))).toBe(false)
  })

  it('is not satisfied when expiry_date is null', () => {
    expect(spec.isSatisfiedBy(makeItem({ expiry_date: null }))).toBe(false)
  })

  it('is not satisfied when the item has been used (status is irrelevant to this spec)', () => {
    // Spec is date-based only — status does not affect the result.
    expect(spec.isSatisfiedBy(makeItem({ expiry_date: '2025-06-14', status: 'used' }))).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// IsExpiringSoonSpec
// ---------------------------------------------------------------------------

describe('IsExpiringSoonSpec', () => {
  const spec = new IsExpiringSoonSpec(3, REF)

  it('is satisfied when expiry is today (0 days)', () => {
    expect(spec.isSatisfiedBy(makeItem({ expiry_date: '2025-06-15' }))).toBe(true)
  })

  it('is satisfied when expiry is within the threshold', () => {
    expect(spec.isSatisfiedBy(makeItem({ expiry_date: '2025-06-17' }))).toBe(true)
  })

  it('is satisfied when expiry is exactly at the threshold', () => {
    expect(spec.isSatisfiedBy(makeItem({ expiry_date: '2025-06-18' }))).toBe(true)
  })

  it('is not satisfied when expiry is one day beyond the threshold', () => {
    expect(spec.isSatisfiedBy(makeItem({ expiry_date: '2025-06-19' }))).toBe(false)
  })

  it('is not satisfied for an already-expired item', () => {
    expect(spec.isSatisfiedBy(makeItem({ expiry_date: '2025-06-14' }))).toBe(false)
  })

  it('is not satisfied when expiry_date is null', () => {
    expect(spec.isSatisfiedBy(makeItem({ expiry_date: null }))).toBe(false)
  })

  it('respects a custom daysBefore of 7', () => {
    const wide = new IsExpiringSoonSpec(7, REF)
    expect(wide.isSatisfiedBy(makeItem({ expiry_date: '2025-06-22' }))).toBe(true)
    expect(wide.isSatisfiedBy(makeItem({ expiry_date: '2025-06-23' }))).toBe(false)
  })

  it('defaults daysBefore to 3', () => {
    const defaultSpec = new IsExpiringSoonSpec(undefined, REF)
    expect(defaultSpec.isSatisfiedBy(makeItem({ expiry_date: '2025-06-18' }))).toBe(true)
    expect(defaultSpec.isSatisfiedBy(makeItem({ expiry_date: '2025-06-19' }))).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// IsFreshSpec
// ---------------------------------------------------------------------------

describe('IsFreshSpec', () => {
  const spec = new IsFreshSpec(3, REF)

  it('is satisfied by an item with plenty of time remaining', () => {
    expect(spec.isSatisfiedBy(makeItem({ expiry_date: '2025-07-15' }))).toBe(true)
  })

  it('is not satisfied when expiry is within the threshold', () => {
    expect(spec.isSatisfiedBy(makeItem({ expiry_date: '2025-06-17' }))).toBe(false)
  })

  it('is not satisfied when expiry is today', () => {
    expect(spec.isSatisfiedBy(makeItem({ expiry_date: '2025-06-15' }))).toBe(false)
  })

  it('is not satisfied for an already-expired item', () => {
    expect(spec.isSatisfiedBy(makeItem({ expiry_date: '2025-06-14' }))).toBe(false)
  })

  it('is satisfied when expiry_date is null (no known expiry = fresh)', () => {
    expect(spec.isSatisfiedBy(makeItem({ expiry_date: null }))).toBe(true)
  })

  it('defaults daysBefore to 3', () => {
    const defaultSpec = new IsFreshSpec(undefined, REF)
    expect(defaultSpec.isSatisfiedBy(makeItem({ expiry_date: '2025-06-19' }))).toBe(true)
    expect(defaultSpec.isSatisfiedBy(makeItem({ expiry_date: '2025-06-18' }))).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Partition property — the three specs are mutually exclusive and exhaustive
// ---------------------------------------------------------------------------

describe('Expiry spec partition', () => {
  const expired = new IsExpiredSpec(REF)
  const soon = new IsExpiringSoonSpec(3, REF)
  const fresh = new IsFreshSpec(3, REF)

  const cases: Array<{ label: string; expiry_date: string | null }> = [
    { label: 'well past expiry', expiry_date: '2025-01-01' },
    { label: 'yesterday', expiry_date: '2025-06-14' },
    { label: 'today', expiry_date: '2025-06-15' },
    { label: 'tomorrow', expiry_date: '2025-06-16' },
    { label: 'within threshold', expiry_date: '2025-06-18' },
    { label: 'just outside threshold', expiry_date: '2025-06-19' },
    { label: 'well in the future', expiry_date: '2025-12-31' },
    { label: 'null expiry', expiry_date: null },
  ]

  cases.forEach(({ label, expiry_date }) => {
    it(`exactly one spec is satisfied for: ${label}`, () => {
      const item = makeItem({ expiry_date })
      const count = [expired, soon, fresh].filter((s) => s.isSatisfiedBy(item)).length
      expect(count).toBe(1)
    })
  })
})
