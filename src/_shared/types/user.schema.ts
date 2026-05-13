import { z } from 'zod'

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const AuthProviderSchema = z.enum(['anon', 'google', 'apple'])
export const PlatformSchema = z.enum(['ios', 'android'])

export type AuthProvider = z.infer<typeof AuthProviderSchema>
export type Platform = z.infer<typeof PlatformSchema>

// ---------------------------------------------------------------------------
// Locale regex
// ---------------------------------------------------------------------------

/**
 * BCP-47 subset accepting language codes of the form `'en'`, `'en-US'`,
 * `'zh-Hant'`, etc. Region subtags are optional.
 */
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

/**
 * Client-submitted insert shape.
 *
 * @remarks
 * `id`, `created_at`, and `updated_at` are intentionally omitted — generated
 * by the database on insert.
 */
export const UserInsertSchema = z.object({
  auth_uid: z.uuid(),
  auth_provider: AuthProviderSchema,
  auth_sub: z.string().nullable().default(null),
  locale: z.string().regex(localeRegex).nullable().default(null),
})

/**
 * Client-updatable fields.
 *
 * @remarks
 * Only `locale` may be updated by the client; all other user fields are
 * either DB-managed or set by auth triggers.
 */
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
  /** Advance warning window in days; range `1–30` matches the Heads Up screen stepper. */
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
  /**
   * Push token string. Expo tokens are ~40 characters; FCM tokens can be up to
   * ~200 characters. `512` is a safe upper bound for both.
   */
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

/**
 * Row shape for the scan rate-limit ledger.
 *
 * @remarks
 * Written exclusively by the `increment_scan_count()` RPC.
 * No `InsertSchema` or `UpdateSchema` are defined; direct client writes are
 * blocked by RLS.
 */
export const ScanRateLimitRowSchema = z.object({
  user_id: z.uuid(),
  scan_date: z.iso.date(),
  /** Daily scan count for this user. ADR-009 cap: `20` scans per user per day. */
  scan_count: z.number().int().min(0).max(20),
})

export type ScanRateLimitRow = z.infer<typeof ScanRateLimitRowSchema>
