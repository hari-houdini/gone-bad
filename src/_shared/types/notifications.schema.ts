import { z } from 'zod'

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const NotificationActionSchema = z.enum(['used', 'wasted', 'dismissed'])

export type NotificationAction = z.infer<typeof NotificationActionSchema>

// ---------------------------------------------------------------------------
// public.notification_log
// ---------------------------------------------------------------------------
// Written exclusively by the `send-notifications` Edge Function via cron.
// No Insert/Update schemas — never written directly from the client.

export const NotificationLogRowSchema = z.object({
  id: z.uuid(),
  item_id: z.uuid().nullable(),
  user_id: z.uuid().nullable(),
  /** Hard 100-char limit matching the Gemini notification prompt spec (TDD §12.2). */
  message: z.string().min(1).max(100),
  sent_at: z.iso.datetime(),
  action_taken: NotificationActionSchema.nullable(),
})

export type NotificationLogRow = z.infer<typeof NotificationLogRowSchema>

// ---------------------------------------------------------------------------
// public.daily_kitchen_cache
// ---------------------------------------------------------------------------
// Immutable per (kitchen_id, cache_date). A new day always means a new insert.
// No UpdateSchema by design.

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

export const ExpoPushPayloadSchema = z.object({
  to: z.string().min(1).max(512),
  /** Hard constant — any deviation from 'Gone Bad' is a bug. */
  title: z.literal('Gone Bad'),
  body: z.string().min(1).max(100),
  /** Hard constant — must match the Expo notification category registered in the app. */
  categoryId: z.literal('EXPIRY_ALERT'),
  data: z.object({
    item_id: z.uuid(),
    screen: z.literal('item_detail'),
  }),
})

export type ExpoPushPayload = z.infer<typeof ExpoPushPayloadSchema>
