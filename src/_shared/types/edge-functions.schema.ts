import { z } from 'zod'

import { GeminiAnalyseResponseSchema } from './ai.schema'
import { InviteRoleSchema } from './kitchen.schema'
import { RagSourceSchema } from './ai.schema'

// ---------------------------------------------------------------------------
// analyse-image
// ---------------------------------------------------------------------------

/** Request body for the `analyse-image` Edge Function. */
export const AnalyseImageRequestSchema = z.object({
  /** Base64-encoded JPEG; the Edge Function decodes this before sending to Gemini. */
  image: z.string().min(1),
  kitchen_id: z.uuid(),
  barcode: z.string().max(50).optional(),
})

/** HTTP 200 — re-uses the Gemini discriminated union (pass: true | false). */
export { GeminiAnalyseResponseSchema as AnalyseImageResponseSchema }

/** HTTP 429 — returned when the user hits the 20 scans/day limit (ADR-009). */
export const AnalyseImageRateLimitResponseSchema = z.object({
  error: z.literal('RATE_LIMIT'),
  message: z.string(),
})

export type AnalyseImageRequest = z.infer<typeof AnalyseImageRequestSchema>
export type AnalyseImageRateLimitResponse = z.infer<typeof AnalyseImageRateLimitResponseSchema>

// ---------------------------------------------------------------------------
// generate-fun-fact
// ---------------------------------------------------------------------------

/** Request body for the `generate-fun-fact` Edge Function. */
export const GenerateFunFactRequestSchema = z.object({
  kitchen_id: z.uuid(),
})

/** Response body from the `generate-fun-fact` Edge Function. */
export const GenerateFunFactResponseSchema = z.object({
  fun_fact: z.string().min(1).max(500),
  /** Name of the item the fun fact is about; `null` when the fact is generic. */
  item_name: z.string().nullable(),
  item_id: z.uuid().nullable(),
  /** `true` when the response was served from the `daily_kitchen_cache` table. */
  cached: z.boolean(),
})

export type GenerateFunFactRequest = z.infer<typeof GenerateFunFactRequestSchema>
export type GenerateFunFactResponse = z.infer<typeof GenerateFunFactResponseSchema>

// ---------------------------------------------------------------------------
// handle-invite
// ---------------------------------------------------------------------------

/** Request body for the `handle-invite` Edge Function. */
export const HandleInviteRequestSchema = z.object({
  token: z.string().regex(/^[a-zA-Z0-9_-]{32}$/),
})

export const HandleInviteErrorCodeSchema = z.enum([
  'INVALID_TOKEN',
  'EXPIRED',
  'MAX_USES_REACHED',
  'ALREADY_MEMBER',
])

/** Success response from `handle-invite`. Discriminant: `success: true`. */
export const HandleInviteSuccessResponseSchema = z.object({
  success: z.literal(true),
  kitchen_id: z.uuid(),
  kitchen_name: z.string().min(1).max(50),
  role: InviteRoleSchema,
})

/** Failure response from `handle-invite`. Discriminant: `success: false`. */
export const HandleInviteFailureResponseSchema = z.object({
  success: z.literal(false),
  error: HandleInviteErrorCodeSchema,
})

/**
 * Top-level discriminated union for the `handle-invite` Edge Function response.
 *
 * @remarks
 * Discriminant field: `success`.
 */
export const HandleInviteResponseSchema = z.discriminatedUnion('success', [
  HandleInviteSuccessResponseSchema,
  HandleInviteFailureResponseSchema,
])

export type HandleInviteRequest = z.infer<typeof HandleInviteRequestSchema>
export type HandleInviteErrorCode = z.infer<typeof HandleInviteErrorCodeSchema>
export type HandleInviteSuccessResponse = z.infer<typeof HandleInviteSuccessResponseSchema>
export type HandleInviteFailureResponse = z.infer<typeof HandleInviteFailureResponseSchema>
export type HandleInviteResponse = z.infer<typeof HandleInviteResponseSchema>

// ---------------------------------------------------------------------------
// send-notifications  (cron-invoked — no request body)
// ---------------------------------------------------------------------------

/**
 * Response body from the `send-notifications` Edge Function.
 *
 * @remarks
 * This function is invoked by `pg_cron` and has no request body.
 */
export const SendNotificationsResponseSchema = z.object({
  notifications_sent: z.number().int().min(0),
  errors: z.array(
    z.object({
      item_id: z.uuid(),
      error: z.string(),
    }),
  ),
})

export type SendNotificationsResponse = z.infer<typeof SendNotificationsResponseSchema>

// ---------------------------------------------------------------------------
// process-image  (Supabase Storage webhook trigger — no request body)
// ---------------------------------------------------------------------------

/**
 * Response body from the `process-image` Edge Function.
 *
 * @remarks
 * This function is triggered by a Supabase Storage webhook and has no request
 * body. It returns the final CDN URLs after resizing and re-uploading.
 */
export const ProcessImageResponseSchema = z.object({
  item_id: z.uuid(),
  image_url: z.url(),
  image_thumbnail_url: z.url(),
})

export type ProcessImageResponse = z.infer<typeof ProcessImageResponseSchema>

// ---------------------------------------------------------------------------
// rag-query  (internal — called by other Edge Functions, not the client)
// ---------------------------------------------------------------------------

/** Request body for the `rag-query` Edge Function. */
export const RagQueryRequestSchema = z.object({
  query: z.string().min(1).max(500),
  top_k: z.number().int().min(1).max(20).default(5),
})

/** Response body from the `rag-query` Edge Function. */
export const RagQueryResponseSchema = z.object({
  /** Concatenated context string passed directly into the Gemini prompt. */
  context: z.string(),
  chunks: z.array(
    z.object({
      id: z.uuid(),
      content: z.string(),
      source: RagSourceSchema,
    }),
  ),
})

export type RagQueryRequest = z.infer<typeof RagQueryRequestSchema>
export type RagQueryResponse = z.infer<typeof RagQueryResponseSchema>
