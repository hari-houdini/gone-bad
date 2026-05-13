import type { ItemRow, QuantityAction } from '@/shared/types'
import { ItemLifecycleService } from './item-lifecycle.service'

const NOW = new Date('2025-06-15T10:00:00Z')

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeItem(overrides: Partial<ItemRow> = {}): ItemRow {
  return {
    id: 'item-abc',
    kitchen_id: 'kitchen-xyz',
    name: 'Whole Milk',
    description: null,
    tags: ['Dairy'],
    quantity: 4,
    quantity_unit: 'pints',
    quantity_remaining: null,
    purchase_date: null,
    opened_date: null,
    expiry_date: '2025-06-20',
    expiry_source: 'image',
    image_url: null,
    image_thumbnail_url: null,
    image_path: null,
    barcode: null,
    ai_confidence: 0.95,
    storage_suggestion: null,
    status: 'active',
    used_at: null,
    wasted_at: null,
    notification_days_before: null,
    added_by: null,
    created_at: '2025-06-10T00:00:00Z',
    updated_at: '2025-06-10T00:00:00Z',
    deleted_at: null,
    ...overrides,
  }
}

function allOf(eventType: 'used' | 'wasted'): QuantityAction {
  return { event_type: eventType, quantity_mode: 'all' }
}

function partialOf(eventType: 'used' | 'wasted', qty: number, unit?: string): QuantityAction {
  return { event_type: eventType, quantity_mode: 'partial', quantity: qty, quantity_unit: unit }
}

// ---------------------------------------------------------------------------
// markUsed — "all of it"
// ---------------------------------------------------------------------------

describe('ItemLifecycleService.markUsed — all', () => {
  const item = makeItem()
  const result = ItemLifecycleService.markUsed(item, allOf('used'), NOW)

  it('sets status to used', () => {
    expect(result.itemUpdate.status).toBe('used')
  })

  it('sets quantity_remaining to 0', () => {
    expect(result.itemUpdate.quantity_remaining).toBe(0)
  })

  it('sets used_at to the provided timestamp', () => {
    expect(result.itemUpdate.used_at).toBe(NOW.toISOString())
  })

  it('does not set wasted_at', () => {
    expect(result.itemUpdate.wasted_at).toBeUndefined()
  })

  it('creates an event with the full quantity', () => {
    expect(result.eventInsert.item_id).toBe('item-abc')
    expect(result.eventInsert.event_type).toBe('used')
    expect(result.eventInsert.quantity).toBe(4) // item.quantity
    expect(result.eventInsert.quantity_unit).toBe('pints')
    expect(result.eventInsert.note).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// markUsed — partial (item stays active)
// ---------------------------------------------------------------------------

describe('ItemLifecycleService.markUsed — partial, item stays active', () => {
  const item = makeItem()
  const result = ItemLifecycleService.markUsed(item, partialOf('used', 1), NOW)

  it('does not change status', () => {
    expect(result.itemUpdate.status).toBeUndefined()
  })

  it('reduces quantity_remaining', () => {
    expect(result.itemUpdate.quantity_remaining).toBe(3) // 4 - 1
  })

  it('does not set used_at', () => {
    expect(result.itemUpdate.used_at).toBeUndefined()
  })

  it('creates an event with the consumed amount', () => {
    expect(result.eventInsert.quantity).toBe(1)
    expect(result.eventInsert.event_type).toBe('used')
  })
})

// ---------------------------------------------------------------------------
// markUsed — partial that exactly consumes the remainder → terminal
// ---------------------------------------------------------------------------

describe('ItemLifecycleService.markUsed — partial that fully consumes', () => {
  const item = makeItem({ quantity_remaining: 2 })
  const result = ItemLifecycleService.markUsed(item, partialOf('used', 2), NOW)

  it('transitions to used status', () => {
    expect(result.itemUpdate.status).toBe('used')
  })

  it('sets quantity_remaining to 0', () => {
    expect(result.itemUpdate.quantity_remaining).toBe(0)
  })

  it('sets used_at', () => {
    expect(result.itemUpdate.used_at).toBe(NOW.toISOString())
  })
})

// ---------------------------------------------------------------------------
// markUsed — respects tracked quantity_remaining
// ---------------------------------------------------------------------------

describe('ItemLifecycleService.markUsed — with tracked quantity_remaining', () => {
  const item = makeItem({ quantity: 4, quantity_remaining: 2 })
  const result = ItemLifecycleService.markUsed(item, allOf('used'), NOW)

  it('consumes only the remaining quantity, not the original quantity', () => {
    expect(result.eventInsert.quantity).toBe(2)
  })

  it('sets quantity_remaining to 0', () => {
    expect(result.itemUpdate.quantity_remaining).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// markWasted — "all of it"
// ---------------------------------------------------------------------------

describe('ItemLifecycleService.markWasted — all', () => {
  const item = makeItem()
  const result = ItemLifecycleService.markWasted(item, allOf('wasted'), NOW)

  it('sets status to wasted', () => {
    expect(result.itemUpdate.status).toBe('wasted')
  })

  it('sets wasted_at', () => {
    expect(result.itemUpdate.wasted_at).toBe(NOW.toISOString())
  })

  it('does not set used_at', () => {
    expect(result.itemUpdate.used_at).toBeUndefined()
  })

  it('creates a wasted event', () => {
    expect(result.eventInsert.event_type).toBe('wasted')
    expect(result.eventInsert.quantity).toBe(4)
  })
})

// ---------------------------------------------------------------------------
// markWasted — partial (item stays active)
// ---------------------------------------------------------------------------

describe('ItemLifecycleService.markWasted — partial', () => {
  const item = makeItem()
  const result = ItemLifecycleService.markWasted(item, partialOf('wasted', 1, 'pint'), NOW)

  it('does not change status', () => {
    expect(result.itemUpdate.status).toBeUndefined()
  })

  it('reduces quantity_remaining', () => {
    expect(result.itemUpdate.quantity_remaining).toBe(3)
  })

  it('preserves the action quantity_unit on the event', () => {
    expect(result.eventInsert.quantity_unit).toBe('pint')
  })
})

// ---------------------------------------------------------------------------
// Note field
// ---------------------------------------------------------------------------

describe('ItemLifecycleService — note field', () => {
  it('passes the note through to the event insert', () => {
    const item = makeItem()
    const action: QuantityAction = {
      event_type: 'used',
      quantity_mode: 'all',
      note: 'Used in pasta sauce',
    }
    const result = ItemLifecycleService.markUsed(item, action, NOW)
    expect(result.eventInsert.note).toBe('Used in pasta sauce')
  })

  it('sets note to null when omitted', () => {
    const result = ItemLifecycleService.markUsed(makeItem(), allOf('used'), NOW)
    expect(result.eventInsert.note).toBeNull()
  })
})
