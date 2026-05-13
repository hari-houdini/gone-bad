import { z } from 'zod'

import { ItemTagSchema } from './item.schema'

// ---------------------------------------------------------------------------
// Gemini analyse-image response  (discriminated union on `pass`)
// ---------------------------------------------------------------------------

export const ModerationReasonSchema = z.enum([
  'NOT_FOOD',
  'OBSCENE',
  'BLURRY',
  'NON_TRACKABLE',
])

export type ModerationReason = z.infer<typeof ModerationReasonSchema>

export const GeminiAnalyseFailSchema = z.object({
  pass: z.literal(false),
  reason: ModerationReasonSchema,
})

export const GeminiAnalyseSuccessSchema = z
  .object({
    pass: z.literal(true),
    confidence: z.number().min(0).max(1),
    name: z.string().min(1).max(100),
    description: z.string().max(500).nullable(),
    tags: z.array(ItemTagSchema),
    expiry_date: z.iso.date().nullable(),
    /** true when the date was physically visible/printed on the packaging in the image. */
    expiry_date_visible_in_image: z.boolean(),
    /** Days estimated by the model when no printed date was found; null when a date was found. */
    estimated_expiry_days: z.number().int().min(0).nullable(),
    quantity_unit: z.string().max(20).nullable(),
    storage_suggestion: z.string().max(300).nullable(),
    moderation_flags: z.array(z.string()),
  })
  .superRefine((data, ctx) => {
    // Invariant: if a date was visible in the image it must be present;
    // if no date was visible it must be null.
    // Violations indicate a Gemini prompt regression and should be surfaced immediately.
    if (data.expiry_date_visible_in_image && data.expiry_date === null) {
      ctx.addIssue({
        code: 'custom',
        path: ['expiry_date'],
        message:
          'expiry_date must be non-null when expiry_date_visible_in_image is true — Gemini prompt regression?',
      })
    }
    if (!data.expiry_date_visible_in_image && data.expiry_date !== null) {
      ctx.addIssue({
        code: 'custom',
        path: ['expiry_date'],
        message:
          'expiry_date must be null when expiry_date_visible_in_image is false — Gemini prompt regression?',
      })
    }
  })

/** Top-level union parsed from every Gemini `analyse-image` response. */
export const GeminiAnalyseResponseSchema = z.discriminatedUnion('pass', [
  GeminiAnalyseSuccessSchema,
  GeminiAnalyseFailSchema,
])

export type GeminiAnalyseFail = z.infer<typeof GeminiAnalyseFailSchema>
export type GeminiAnalyseSuccess = z.infer<typeof GeminiAnalyseSuccessSchema>
export type GeminiAnalyseResponse = z.infer<typeof GeminiAnalyseResponseSchema>

// ---------------------------------------------------------------------------
// vectors.rag_documents
// ---------------------------------------------------------------------------

export const RagSourceSchema = z.enum(['usda', 'open_food_facts', 'nhs', 'efsa'])

export type RagSource = z.infer<typeof RagSourceSchema>

/** Flexible JSONB metadata — open-ended so new keys can be added without a schema bump. */
export const RagMetadataSchema = z
  .object({
    food_name: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    country: z.string().optional(),
  })
  .catchall(z.unknown())

export type RagMetadata = z.infer<typeof RagMetadataSchema>

export const RagDocumentRowSchema = z.object({
  id: z.uuid(),
  source: RagSourceSchema,
  source_url: z.url().nullable(),
  content: z.string().min(1),
  /** text-embedding-004 produces 768-dimensional vectors. */
  embedding: z.array(z.number()).length(768).nullable(),
  metadata: RagMetadataSchema,
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
})

export const RagDocumentInsertSchema = z.object({
  source: RagSourceSchema,
  source_url: z.url().nullable().default(null),
  content: z.string().min(1),
  embedding: z.array(z.number()).length(768).nullable().default(null),
  metadata: RagMetadataSchema.default({}),
})

export type RagDocumentRow = z.infer<typeof RagDocumentRowSchema>
export type RagDocumentInsert = z.infer<typeof RagDocumentInsertSchema>
