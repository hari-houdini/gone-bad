/**
 * @file ai.schema.ts — Zod schemas for Gemini AI responses and RAG document records.
 *
 * @remarks
 * `GeminiAnalyseResponseSchema` is a discriminated union on `pass` — the EF
 * returns either a full analysis or a moderation rejection. The client
 * discriminates on `response.pass` before reading any other fields.
 */

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

/** Gemini response shape when the image fails moderation. Discriminant: `pass: false`. */
export const GeminiAnalyseFailSchema = z.object({
  pass: z.literal(false),
  reason: ModerationReasonSchema,
})

/**
 * Gemini response shape when the image passes moderation. Discriminant: `pass: true`.
 *
 * @remarks
 * A `superRefine` invariant enforces the relationship between `expiry_date` and
 * `expiry_date_visible_in_image`:
 * - When `expiry_date_visible_in_image` is `true`, `expiry_date` must be non-null.
 * - When `expiry_date_visible_in_image` is `false`, `expiry_date` must be `null`.
 *
 * Violations indicate a Gemini prompt regression and surface as parse errors.
 */
export const GeminiAnalyseSuccessSchema = z
  .object({
    pass: z.literal(true),
    confidence: z.number().min(0).max(1),
    name: z.string().min(1).max(100),
    description: z.string().max(500).nullable(),
    tags: z.array(ItemTagSchema),
    expiry_date: z.iso.date().nullable(),
    /** `true` when the expiry date was physically printed on the packaging visible in the image. */
    expiry_date_visible_in_image: z.boolean(),
    /** Days until expiry as estimated by the model; `null` when a printed date was found. */
    estimated_expiry_days: z.number().int().min(0).nullable(),
    quantity_unit: z.string().max(20).nullable(),
    storage_suggestion: z.string().max(300).nullable(),
    moderation_flags: z.array(z.string()),
  })
  .superRefine((data, ctx) => {
    // Enforce the expiry_date ↔ expiry_date_visible_in_image invariant.
    // Violations indicate a Gemini prompt regression; surfacing them as parse
    // errors makes regressions visible immediately.
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

/**
 * Top-level discriminated union parsed from every Gemini `analyse-image` response.
 *
 * @remarks
 * Discriminant field: `pass`. Use `GeminiAnalyseSuccessSchema` and
 * `GeminiAnalyseFailSchema` directly when narrowing is needed.
 */
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

/**
 * Flexible JSONB metadata stored alongside each RAG document.
 *
 * @remarks
 * The known keys are typed but the schema uses `.catchall(z.unknown())` so
 * new keys can be added to the database without requiring a schema change.
 */
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
  /** `768`-dimensional float vector produced by Google's `text-embedding-004` model. */
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
