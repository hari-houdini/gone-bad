import { z } from 'zod'

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const AuthProviderSchema = z.enum(['anon', 'google', 'apple'])
export const PlatformSchema = z.enum(['ios', 'android'])

export type AuthProvider = z.infer<typeof AuthProviderSchema>
export type Platform = z.infer<typeof PlatformSchema>

// ---------------------------------------------------------------------------
// Locale regex  (BCP-47 subset: 'en', 'en-US', 'zh-Hant', etc.)
// ---------------------------------------------------------------------------

const localeRegex = /^[a-z]{2,3}(-[A-Z]{2,3})?$/

// ---------------------------------------------------------------------------
// public.users
// ---------------------------------------------------------------------------

export const UserRowSchema = z.object({
  id: z.uuid(),
  auth_uid: z.uuid(),
  auth_provider: AuthProviderSchema,
  auth_sub: z.string().nullable(),
  locale: z.string().regex(localeRegex).nullable(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
  deleted_at: z.iso.datetime().nullable(),
})

/** Client insert — id / created_at / updated_at are DB-generated. */
export const UserInsertSchema = z.object({
  auth_uid: z.uuid(),
  auth_provider: AuthProviderSchema,
  auth_sub: z.string().nullable().default(null),
  locale: z.string().regex(localeRegex).nullable().default(null),
})

/** Only locale is client-updatable. */
export const UserUpdateSchema = z
  .object({
    locale: z.string().regex(localeRegex).nullable(),
  })
  .partial()

export type UserRow = z.infer<typeof UserRowSchema>
export type UserInsert = z.infer<typeof UserInsertSchema>
export type UserUpdate = z.infer<typeof UserUpdateSchema>

// ---------------------------------------------------------------------------
// public.user_settings
// ---------------------------------------------------------------------------

export const UserSettingsRowSchema = z.object({
  user_id: z.uuid(),
  notification_days_before: z.number().int().min(1).max(30),
  default_kitchen_id: z.uuid().nullable(),
  locale: z.string().regex(localeRegex).nullable(),
  updated_at: z.iso.datetime(),
})

export const UserSettingsInsertSchema = z.object({
  user_id: z.uuid(),
  /** Range 1–30 matches the UI stepper. */
  notification_days_before: z.number().int().min(1).max(30).default(1),
  default_kitchen_id: z.uuid().nullable().default(null),
  locale: z.string().regex(localeRegex).nullable().default(null),
})

export const UserSettingsUpdateSchema = z
  .object({
    notification_days_before: z.number().int().min(1).max(30),
    default_kitchen_id: z.uuid().nullable(),
    locale: z.string().regex(localeRegex).nullable(),
  })
  .partial()

export type UserSettingsRow = z.infer<typeof UserSettingsRowSchema>
export type UserSettingsInsert = z.infer<typeof UserSettingsInsertSchema>
export type UserSettingsUpdate = z.infer<typeof UserSettingsUpdateSchema>

// ---------------------------------------------------------------------------
// public.push_tokens
// ---------------------------------------------------------------------------

export const PushTokenRowSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  /** Expo push token: ~40 chars; FCM token: up to ~200 chars. 512 is a safe ceiling. */
  token: z.string().min(1).max(512),
  platform: PlatformSchema,
  device_id: z.string().nullable(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
})

export const PushTokenInsertSchema = z.object({
  user_id: z.uuid(),
  token: z.string().min(1).max(512),
  platform: PlatformSchema,
  device_id: z.string().nullable().default(null),
})

export const PushTokenUpdateSchema = z
  .object({
    token: z.string().min(1).max(512),
  })
  .partial()

export type PushTokenRow = z.infer<typeof PushTokenRowSchema>
export type PushTokenInsert = z.infer<typeof PushTokenInsertSchema>
export type PushTokenUpdate = z.infer<typeof PushTokenUpdateSchema>

// ---------------------------------------------------------------------------
// public.scan_rate_limits
// ---------------------------------------------------------------------------
// Server-only — written via increment_scan_count() RPC. No Insert/Update schemas.

export const ScanRateLimitRowSchema = z.object({
  user_id: z.uuid(),
  scan_date: z.iso.date(),
  /** ADR-009: 20 scans / user / day. */
  scan_count: z.number().int().min(0).max(20),
})

export type ScanRateLimitRow = z.infer<typeof ScanRateLimitRowSchema>
