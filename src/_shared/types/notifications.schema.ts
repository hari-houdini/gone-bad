/**
 * @file notifications.schema.ts — Zod schemas for push_tokens, notification_log, and Expo push payloads.
 *
 * @remarks
 * `ExpoPushPayloadSchema` is the canonical shape sent to the Expo push gateway.
 * `NotificationLogInsert` intentionally omits `id` and `sent_at` — both are
 * server-managed defaults.
 */

import { z } from 'zod'

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const NotificationActionSchema = z.enum(['used', 'wasted', 'dismissed'])

export type NotificationAction = z.infer<typeof NotificationActionSchema>

// ---------------------------------------------------------------------------
// public.notification_log
// ---------------------------------------------------------------------------

/**
 * Row shape for the notification audit log.
 *
 * @remarks
 * Written exclusively by the `send-notifications` Edge Function via `pg_cron`.
 * No `InsertSchema` or `UpdateSchema` are defined; the client only reads this
 * table.
 */
export const NotificationLogRowSchema = z.object({
  id: z.uuid(),
  item_id: z.uuid().nullable(),
  user_id: z.uuid().nullable(),
  /** Notification body text. Hard `100`-character ceiling matches the Gemini prompt spec (TDD §12.2). */
  message: z.string().min(1).max(100),
  sent_at: z.iso.datetime(),
  action_taken: NotificationActionSchema.nullable(),
})

export type NotificationLogRow = z.infer<typeof NotificationLogRowSchema>

// ---------------------------------------------------------------------------
// public.daily_kitchen_cache
// ---------------------------------------------------------------------------

/**
 * Row shape for the per-kitchen daily fun-fact cache.
 *
 * @remarks
 * Immutable per `(kitchen_id, cache_date)` — each new calendar day inserts a
 * fresh row. No `UpdateSchema` by design; stale cache entries are never
 * modified.
 */
export const DailyKitchenCacheRowSchema = z.object({
  id: z.uuid(),
  kitchen_id: z.uuid(),
  cache_date: z.iso.date(),
  fun_fact: z.string().min(1).max(500),
  fun_fact_source: z.string().max(100).nullable(),
  fun_fact_item_id: z.uuid().nullable(),
  created_at: z.iso.datetime(),
})

export const DailyKitchenCacheInsertSchema = z.object({
  kitchen_id: z.uuid(),
  cache_date: z.iso.date(),
  fun_fact: z.string().min(1).max(500),
  fun_fact_source: z.string().max(100).nullable().default(null),
  fun_fact_item_id: z.uuid().nullable().default(null),
})

export type DailyKitchenCacheRow = z.infer<typeof DailyKitchenCacheRowSchema>
export type DailyKitchenCacheInsert = z.infer<typeof DailyKitchenCacheInsertSchema>

// ---------------------------------------------------------------------------
// Expo push payload  (sent by `send-notifications` to Expo's push service)
// ---------------------------------------------------------------------------

/**
 * Payload shape sent to Expo's push notification service.
 *
 * @remarks
 * Both `title` and `categoryId` are literals — any deviation indicates a
 * configuration bug. `categoryId` must match the category registered in the
 * Expo notifications plugin configuration.
 */
export const ExpoPushPayloadSchema = z.object({
  to: z.string().min(1).max(512),
  /** Always `'Gone Bad'`; any other value is a configuration bug. */
  title: z.literal('Gone Bad'),
  body: z.string().min(1).max(100),
  /** Always `'EXPIRY_ALERT'`; must match the registered Expo notification category. */
  categoryId: z.literal('EXPIRY_ALERT'),
  data: z.object({
    item_id: z.uuid(),
    screen: z.literal('item_detail'),
  }),
})

export type ExpoPushPayload = z.infer<typeof ExpoPushPayloadSchema>
