import { ItemFactory } from './item.factory'
import { ItemInsertSchema } from '@/shared/types'
import type { CheckItForm, GeminiAnalyseSuccess } from '@/shared/types'

const KITCHEN_ID = 'a1b2c3d4-e5f6-4789-abcd-ef0123456789'
const factory = new ItemFactory()

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeForm(overrides: Partial<CheckItForm> = {}): CheckItForm {
  return {
    name: 'Greek Yogurt',
    tags: ['Dairy'],
    quantity: 2,
    expiry_source: 'manual',
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// fromManualEntry — required fields
// ---------------------------------------------------------------------------

describe('ItemFactory.fromManualEntry — required fields', () => {
  const form = makeForm()
  const insert = factory.fromManualEntry(form, KITCHEN_ID)

  it('sets kitchen_id', () => {
    expect(insert.kitchen_id).toBe(KITCHEN_ID)
  })

  it('sets name from the form', () => {
    expect(insert.name).toBe('Greek Yogurt')
  })

  it('sets quantity from the form', () => {
    expect(insert.quantity).toBe(2)
  })

  it('sets tags from the form', () => {
    expect(insert.tags).toEqual(['Dairy'])
  })

  it('sets expiry_source from the form', () => {
    expect(insert.expiry_source).toBe('manual')
  })
})

// ---------------------------------------------------------------------------
// fromManualEntry — optional fields default to null
// ---------------------------------------------------------------------------

describe('ItemFactory.fromManualEntry — optional fields', () => {
  const insert = factory.fromManualEntry(makeForm(), KITCHEN_ID)

  it('defaults description to null', () => {
    expect(insert.description).toBeNull()
  })

  it('defaults quantity_unit to null', () => {
    expect(insert.quantity_unit).toBeNull()
  })

  it('defaults purchase_date to null', () => {
    expect(insert.purchase_date).toBeNull()
  })

  it('defaults opened_date to null', () => {
    expect(insert.opened_date).toBeNull()
  })

  it('defaults expiry_date to null', () => {
    expect(insert.expiry_date).toBeNull()
  })

  it('defaults storage_suggestion to null', () => {
    expect(insert.storage_suggestion).toBeNull()
  })

  it('defaults notification_days_before to null', () => {
    expect(insert.notification_days_before).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// fromManualEntry — scan pipeline fields always null
// ---------------------------------------------------------------------------

describe('ItemFactory.fromManualEntry — scan pipeline fields', () => {
  const insert = factory.fromManualEntry(makeForm(), KITCHEN_ID)

  it('sets image_path to null', () => {
    expect(insert.image_path).toBeNull()
  })

  it('sets barcode to null', () => {
    expect(insert.barcode).toBeNull()
  })

  it('sets ai_confidence to null', () => {
    expect(insert.ai_confidence).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// fromManualEntry — populated optional fields pass through correctly
// ---------------------------------------------------------------------------

describe('ItemFactory.fromManualEntry — populated optional fields', () => {
  const form = makeForm({
    description: 'Full-fat plain yogurt',
    quantity_unit: 'pots',
    expiry_date: '2025-06-25',
    purchase_date: '2025-06-10',
    opened_date: '2025-06-12',
    storage_suggestion: 'Keep refrigerated below 5°C',
    notification_days_before: 5,
  })
  const insert = factory.fromManualEntry(form, KITCHEN_ID)

  it('passes description through', () => {
    expect(insert.description).toBe('Full-fat plain yogurt')
  })

  it('passes expiry_date through', () => {
    expect(insert.expiry_date).toBe('2025-06-25')
  })

  it('passes quantity_unit through', () => {
    expect(insert.quantity_unit).toBe('pots')
  })

  it('passes notification_days_before through', () => {
    expect(insert.notification_days_before).toBe(5)
  })
})

// ---------------------------------------------------------------------------
// fromManualEntry — output satisfies ItemInsertSchema
// ---------------------------------------------------------------------------

describe('ItemFactory.fromManualEntry — schema validation', () => {
  it('produces an object that passes ItemInsertSchema.parse', () => {
    const form = makeForm({
      expiry_date: '2025-12-31',
      quantity_unit: 'g',
    })
    const insert = factory.fromManualEntry(form, KITCHEN_ID)
    expect(() => ItemInsertSchema.parse(insert)).not.toThrow()
  })
})

// ---------------------------------------------------------------------------
// Stubs — fromGeminiResponse and fromBarcodeResponse
// ---------------------------------------------------------------------------

describe('ItemFactory stubs', () => {
  it('fromGeminiResponse throws with a Phase 4 message', () => {
    expect(() =>
      factory.fromGeminiResponse({} as GeminiAnalyseSuccess, KITCHEN_ID),
    ).toThrow(/Phase 4/)
  })

  it('fromBarcodeResponse throws with a Phase 4 message', () => {
    expect(() => factory.fromBarcodeResponse({}, KITCHEN_ID)).toThrow(/Phase 4/)
  })
})
