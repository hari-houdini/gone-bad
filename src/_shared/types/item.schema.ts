import { z } from 'zod'

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

/** 14 canonical food categories. Single source of truth — also used by Gemini
 *  response validation and the Check It chip selector (via `src/constants/tags.ts`). */
export const ItemTagSchema = z.enum([
  'Dairy',
  'Produce',
  'Meat',
  'Seafood',
  'Bakery',
  'Pantry',
  'Frozen',
  'Condiments',
  'Beverages',
  'Snacks',
  'Leftovers',
  'Herbs & Spices',
  'Deli',
  'Plant-Based',
])

export const ExpirySourceSchema = z.enum(['image', 'ai_estimated', 'manual'])
export const ItemStatusSchema = z.enum(['active', 'used', 'wasted', 'expired'])
export const ItemEventTypeSchema = z.enum(['used', 'wasted'])

export type ItemTag = z.infer<typeof ItemTagSchema>
export type ExpirySource = z.infer<typeof ExpirySourceSchema>
export type ItemStatus = z.infer<typeof ItemStatusSchema>
export type ItemEventType = z.infer<typeof ItemEventTypeSchema>

// ---------------------------------------------------------------------------
// public.items
// ---------------------------------------------------------------------------

export const ItemRowSchema = z.object({
  id: z.uuid(),
  kitchen_id: z.uuid(),
  name: z.string().min(1).max(100).trim(),
  description: z.string().max(500).nullable(),
  tags: z.array(ItemTagSchema),
  quantity: z.number().min(0),
  /** Free-text unit: 'g', 'ml', 'kg', 'slices', etc. */
  quantity_unit: z.string().max(20).nullable(),
  quantity_remaining: z.number().min(0).nullable(),
  purchase_date: z.iso.date().nullable(),
  opened_date: z.iso.date().nullable(),
  expiry_date: z.iso.date().nullable(),
  expiry_source: ExpirySourceSchema,
  image_url: z.url().nullable(),
  image_thumbnail_url: z.url().nullable(),
  image_path: z.string().nullable(),
  barcode: z.string().max(50).nullable(),
  ai_confidence: z.number().min(0).max(1).nullable(),
  storage_suggestion: z.string().max(300).nullable(),
  status: ItemStatusSchema,
  used_at: z.iso.datetime().nullable(),
  wasted_at: z.iso.datetime().nullable(),
  notification_days_before: z.number().int().min(1).max(30).nullable(),
  added_by: z.uuid().nullable(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
  deleted_at: z.iso.datetime().nullable(),
})

/**
 * Security omissions:
 * - `image_url` / `image_thumbnail_url` — populated by `process-image` Edge Function only
 * - `added_by` — always derived from the JWT server-side
 * - `status`, `used_at`, `wasted_at` — set by lifecycle RPCs, not direct insert
 */
export const ItemInsertSchema = z.object({
  kitchen_id: z.uuid(),
  name: z.string().min(1).max(100).trim(),
  description: z.string().max(500).nullable().default(null),
  tags: z.array(ItemTagSchema).default([]),
  quantity: z.number().min(0).default(1),
  quantity_unit: z.string().max(20).nullable().default(null),
  purchase_date: z.iso.date().nullable().default(null),
  opened_date: z.iso.date().nullable().default(null),
  expiry_date: z.iso.date().nullable().default(null),
  expiry_source: ExpirySourceSchema.default('ai_estimated'),
  image_path: z.string().nullable().default(null),
  barcode: z.string().max(50).nullable().default(null),
  ai_confidence: z.number().min(0).max(1).nullable().default(null),
  storage_suggestion: z.string().max(300).nullable().default(null),
  notification_days_before: z.number().int().min(1).max(30).nullable().default(null),
})

export const ItemUpdateSchema = z
  .object({
    name: z.string().min(1).max(100).trim(),
    description: z.string().max(500).nullable(),
    tags: z.array(ItemTagSchema),
    quantity: z.number().min(0),
    quantity_unit: z.string().max(20).nullable(),
    quantity_remaining: z.number().min(0).nullable(),
    purchase_date: z.iso.date().nullable(),
    opened_date: z.iso.date().nullable(),
    expiry_date: z.iso.date().nullable(),
    expiry_source: ExpirySourceSchema,
    storage_suggestion: z.string().max(300).nullable(),
    notification_days_before: z.number().int().min(1).max(30).nullable(),
    status: ItemStatusSchema,
    used_at: z.iso.datetime().nullable(),
    wasted_at: z.iso.datetime().nullable(),
  })
  .partial()

export type ItemRow = z.infer<typeof ItemRowSchema>
export type ItemInsert = z.infer<typeof ItemInsertSchema>
export type ItemUpdate = z.infer<typeof ItemUpdateSchema>

// ---------------------------------------------------------------------------
// public.item_events  (append-only audit log — no UpdateSchema)
// ---------------------------------------------------------------------------

export const ItemEventRowSchema = z.object({
  id: z.uuid(),
  item_id: z.uuid(),
  user_id: z.uuid().nullable(),
  event_type: ItemEventTypeSchema,
  /** gt(0): zero-quantity events are meaningless and indicate a bug. */
  quantity: z.number().gt(0),
  quantity_unit: z.string().max(20).nullable(),
  note: z.string().max(300).nullable(),
  created_at: z.iso.datetime(),
})

/** `user_id` is omitted — always derived from the JWT server-side. */
export const ItemEventInsertSchema = z.object({
  item_id: z.uuid(),
  event_type: ItemEventTypeSchema,
  quantity: z.number().gt(0),
  quantity_unit: z.string().max(20).nullable().default(null),
  note: z.string().max(300).nullable().default(null),
})

export type ItemEventRow = z.infer<typeof ItemEventRowSchema>
export type ItemEventInsert = z.infer<typeof ItemEventInsertSchema>

// ---------------------------------------------------------------------------
// Form schemas  (client-side validation — not persisted directly)
// ---------------------------------------------------------------------------

/**
 * Check It screen & The Label edit mode.
 * Image and barcode are managed by `uploadStore`, not this form.
 */
export const CheckItFormSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100).trim(),
    description: z.string().max(500).optional(),
    tags: z.array(ItemTagSchema).default([]),
    expiry_date: z.iso.date().optional(),
    expiry_source: ExpirySourceSchema.default('manual'),
    opened_date: z.iso.date().optional(),
    purchase_date: z.iso.date().optional(),
    quantity: z.number({ message: 'Quantity must be a number' }).gt(0),
    quantity_unit: z.string().max(20).optional(),
    storage_suggestion: z.string().max(300).optional(),
    notification_days_before: z.number().int().min(1).max(30).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.expiry_date && data.purchase_date && data.expiry_date < data.purchase_date) {
      ctx.addIssue({
        code: 'custom',
        path: ['expiry_date'],
        message: 'Expiry date cannot be before the purchase date',
      })
    }
    if (data.expiry_date && data.opened_date && data.expiry_date < data.opened_date) {
      ctx.addIssue({
        code: 'custom',
        path: ['expiry_date'],
        message: 'Expiry date cannot be before the opened date',
      })
    }
  })

export type CheckItForm = z.infer<typeof CheckItFormSchema>

/** Quantity Modal — "All of it" / "Some of it" */
export const QuantityActionSchema = z
  .object({
    event_type: ItemEventTypeSchema,
    quantity_mode: z.enum(['all', 'partial']),
    quantity: z.number().gt(0).optional(),
    quantity_unit: z.string().max(20).optional(),
    note: z.string().max(300).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.quantity_mode === 'partial' && data.quantity === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['quantity'],
        message: 'Quantity is required when logging a partial amount',
      })
    }
  })

export type QuantityAction = z.infer<typeof QuantityActionSchema>
