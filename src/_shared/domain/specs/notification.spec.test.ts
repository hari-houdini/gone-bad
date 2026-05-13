import type { ItemRow } from '@/shared/types'
import { DueForNotificationSpec } from './notification.spec'

// Reference date: 2025-06-15 (mid-day UTC to rule out midnight edge cases).
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
// DueForNotificationSpec
// ---------------------------------------------------------------------------

describe('DueForNotificationSpec', () => {
  const spec = new DueForNotificationSpec(3, REF)

  // ---- Happy path ----

  it('is satisfied when the item is active and expiry is today', () => {
    expect(spec.isSatisfiedBy(makeItem({ expiry_date: '2025-06-15' }))).toBe(true)
  })

  it('is satisfied when expiry is within the default 3-day window', () => {
    expect(spec.isSatisfiedBy(makeItem({ expiry_date: '2025-06-17' }))).toBe(true)
  })

  it('is satisfied when expiry is exactly at the threshold boundary', () => {
    expect(spec.isSatisfiedBy(makeItem({ expiry_date: '2025-06-18' }))).toBe(true)
  })

  // ---- Expiry date out of window ----

  it('is not satisfied when expiry is one day beyond the threshold', () => {
    expect(spec.isSatisfiedBy(makeItem({ expiry_date: '2025-06-19' }))).toBe(false)
  })

  it('is not satisfied when expiry is well in the future', () => {
    expect(spec.isSatisfiedBy(makeItem({ expiry_date: '2025-12-31' }))).toBe(false)
  })

  it('is not satisfied when the item is already expired', () => {
    expect(spec.isSatisfiedBy(makeItem({ expiry_date: '2025-06-14' }))).toBe(false)
  })

  // ---- Null expiry ----

  it('is not satisfied when expiry_date is null', () => {
    expect(spec.isSatisfiedBy(makeItem({ expiry_date: null }))).toBe(false)
  })

  // ---- Status gate ----

  it('is not satisfied when status is used', () => {
    expect(spec.isSatisfiedBy(makeItem({ expiry_date: '2025-06-17', status: 'used' }))).toBe(false)
  })

  it('is not satisfied when status is wasted', () => {
    expect(spec.isSatisfiedBy(makeItem({ expiry_date: '2025-06-17', status: 'wasted' }))).toBe(false)
  })

  it('is not satisfied when status is expired', () => {
    expect(spec.isSatisfiedBy(makeItem({ expiry_date: '2025-06-17', status: 'expired' }))).toBe(false)
  })

  // ---- Per-item notification_days_before override ----

  it('uses the per-item override when set', () => {
    const item = makeItem({ expiry_date: '2025-06-22', notification_days_before: 7 })
    // 7 days away — outside default window of 3, but within per-item override of 7.
    expect(spec.isSatisfiedBy(item)).toBe(true)
  })

  it('per-item override of 1 day restricts the window', () => {
    const item = makeItem({ expiry_date: '2025-06-17', notification_days_before: 1 })
    // 2 days away — within default window of 3, but outside per-item override of 1.
    expect(spec.isSatisfiedBy(item)).toBe(false)
  })

  it('per-item override of 1 day still triggers on that day', () => {
    const item = makeItem({ expiry_date: '2025-06-16', notification_days_before: 1 })
    // 1 day away — exactly at per-item override boundary.
    expect(spec.isSatisfiedBy(item)).toBe(true)
  })

  // ---- Default threshold ----

  it('defaults to 3 days when no defaultDaysBefore is provided', () => {
    const defaultSpec = new DueForNotificationSpec(undefined, REF)
    expect(defaultSpec.isSatisfiedBy(makeItem({ expiry_date: '2025-06-18' }))).toBe(true)
    expect(defaultSpec.isSatisfiedBy(makeItem({ expiry_date: '2025-06-19' }))).toBe(false)
  })
})
