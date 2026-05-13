import type { ItemRow } from '@/shared/types'
import { NotificationScheduleService } from './notification-schedule.service'

const REF = new Date('2025-06-15T12:00:00Z')

// ---------------------------------------------------------------------------
// Test helper
// ---------------------------------------------------------------------------

let idCounter = 0
function makeItem(overrides: Partial<ItemRow> = {}): ItemRow {
  return {
    id: `item-${++idCounter}`,
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
// getItemsDueForNotification
// ---------------------------------------------------------------------------

describe('NotificationScheduleService.getItemsDueForNotification', () => {
  it('returns an empty array when the input is empty', () => {
    expect(NotificationScheduleService.getItemsDueForNotification([], 3, REF)).toEqual([])
  })

  it('returns only items within the notification window', () => {
    const items = [
      makeItem({ expiry_date: '2025-06-17' }), // 2 days away — within default 3
      makeItem({ expiry_date: '2025-06-20' }), // 5 days away — outside default 3
    ]
    const due = NotificationScheduleService.getItemsDueForNotification(items, 3, REF)
    expect(due).toHaveLength(1)
    expect(due[0].expiry_date).toBe('2025-06-17')
  })

  it('excludes items with null expiry_date', () => {
    const items = [makeItem({ expiry_date: null })]
    expect(NotificationScheduleService.getItemsDueForNotification(items, 3, REF)).toHaveLength(0)
  })

  it('excludes non-active items', () => {
    const items = [
      makeItem({ expiry_date: '2025-06-16', status: 'used' }),
      makeItem({ expiry_date: '2025-06-16', status: 'wasted' }),
      makeItem({ expiry_date: '2025-06-16', status: 'expired' }),
    ]
    expect(NotificationScheduleService.getItemsDueForNotification(items, 3, REF)).toHaveLength(0)
  })

  it('respects a wider defaultDaysBefore', () => {
    const items = [
      makeItem({ expiry_date: '2025-06-22' }), // 7 days away
    ]
    const due3 = NotificationScheduleService.getItemsDueForNotification(items, 3, REF)
    const due7 = NotificationScheduleService.getItemsDueForNotification(items, 7, REF)
    expect(due3).toHaveLength(0)
    expect(due7).toHaveLength(1)
  })

  it('honours the per-item notification_days_before override', () => {
    const items = [
      makeItem({ expiry_date: '2025-06-22', notification_days_before: 7 }), // 7 days — within per-item override
    ]
    // Default is 3 but per-item says 7.
    const due = NotificationScheduleService.getItemsDueForNotification(items, 3, REF)
    expect(due).toHaveLength(1)
  })

  it('includes expiry-today items', () => {
    const items = [makeItem({ expiry_date: '2025-06-15' })]
    expect(NotificationScheduleService.getItemsDueForNotification(items, 3, REF)).toHaveLength(1)
  })

  it('excludes already-expired items', () => {
    const items = [makeItem({ expiry_date: '2025-06-14' })]
    expect(NotificationScheduleService.getItemsDueForNotification(items, 3, REF)).toHaveLength(0)
  })

  it('returns all due items when multiple qualify', () => {
    const items = [
      makeItem({ expiry_date: '2025-06-15' }), // today
      makeItem({ expiry_date: '2025-06-16' }), // 1 day
      makeItem({ expiry_date: '2025-06-18' }), // 3 days (boundary)
      makeItem({ expiry_date: '2025-06-19' }), // 4 days — outside
    ]
    const due = NotificationScheduleService.getItemsDueForNotification(items, 3, REF)
    expect(due).toHaveLength(3)
  })
})
