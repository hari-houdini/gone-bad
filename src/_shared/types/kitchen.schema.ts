/**
 * @file kitchen.schema.ts — Zod schemas for kitchens, kitchen_members, and kitchen_invites.
 *
 * @remarks
 * `KitchenRoleSchema` drives all permission checks via the `KitchenRole`
 * value object. `KitchenInviteInsertSchema` intentionally omits `used_count`
 * and `created_at` — these are server-managed fields.
 */

import { z } from 'zod'

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const KitchenRoleSchema = z.enum(['owner', 'editor', 'viewer'])

/**
 * Role subset valid for invite links.
 *
 * @remarks
 * `'owner'` is excluded — owners are always the kitchen creator and can never
 * be assigned via an invite.
 */
export const InviteRoleSchema = z.enum(['editor', 'viewer'])

export type KitchenRole = z.infer<typeof KitchenRoleSchema>
export type InviteRole = z.infer<typeof InviteRoleSchema>

// ---------------------------------------------------------------------------
// public.kitchens
// ---------------------------------------------------------------------------

export const KitchenRowSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(50).trim(),
  created_by: z.uuid(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
  deleted_at: z.iso.datetime().nullable(),
})

/**
 * Client-submitted insert shape.
 *
 * @remarks
 * `created_by` is intentionally omitted — always derived from the
 * authenticated JWT server-side to prevent impersonation.
 */
export const KitchenInsertSchema = z.object({
  name: z.string().min(1).max(50).trim(),
})

export const KitchenUpdateSchema = z
  .object({
    name: z.string().min(1).max(50).trim(),
  })
  .partial()

export type KitchenRow = z.infer<typeof KitchenRowSchema>
export type KitchenInsert = z.infer<typeof KitchenInsertSchema>
export type KitchenUpdate = z.infer<typeof KitchenUpdateSchema>

// ---------------------------------------------------------------------------
// public.kitchen_members
// ---------------------------------------------------------------------------

export const KitchenMemberRowSchema = z.object({
  id: z.uuid(),
  kitchen_id: z.uuid(),
  user_id: z.uuid(),
  role: KitchenRoleSchema,
  is_default: z.boolean(),
  joined_at: z.iso.datetime(),
  invited_by: z.uuid().nullable(),
})

/**
 * Insert shape used by the `handle-invite` Edge Function.
 *
 * @remarks
 * Direct client inserts are blocked by RLS. The client may only update
 * `role` and `is_default` via the update schema.
 */
export const KitchenMemberInsertSchema = z.object({
  kitchen_id: z.uuid(),
  user_id: z.uuid(),
  role: KitchenRoleSchema,
  is_default: z.boolean().default(false),
  invited_by: z.uuid().nullable().default(null),
})

export const KitchenMemberUpdateSchema = z
  .object({
    role: KitchenRoleSchema,
    is_default: z.boolean(),
  })
  .partial()

export type KitchenMemberRow = z.infer<typeof KitchenMemberRowSchema>
export type KitchenMemberInsert = z.infer<typeof KitchenMemberInsertSchema>
export type KitchenMemberUpdate = z.infer<typeof KitchenMemberUpdateSchema>

// ---------------------------------------------------------------------------
// public.kitchen_invites
// ---------------------------------------------------------------------------

export const KitchenInviteRowSchema = z.object({
  id: z.uuid(),
  kitchen_id: z.uuid(),
  /** URL-safe base-64 token, always exactly 32 characters long. */
  token: z.string().regex(/^[a-zA-Z0-9_-]{32}$/),
  created_by: z.uuid(),
  role: InviteRoleSchema,
  expires_at: z.iso.datetime(),
  /** Maximum number of redemptions; `null` means unlimited. `min(1)` because a zero-use invite is invalid. */
  max_uses: z.number().int().min(1).nullable(),
  used_count: z.number().int().min(0),
  created_at: z.iso.datetime(),
})

/**
 * Client-submitted insert shape.
 *
 * @remarks
 * `expires_at` is intentionally omitted — the server always sets it to
 * `NOW() + 7 days`. Accepting a client-supplied value would allow unbounded
 * expiry abuse.
 */
export const KitchenInviteInsertSchema = z.object({
  kitchen_id: z.uuid(),
  role: InviteRoleSchema.default('editor'),
  max_uses: z.number().int().min(1).nullable().default(null),
})

export const KitchenInviteUpdateSchema = z
  .object({
    max_uses: z.number().int().min(1).nullable(),
  })
  .partial()

export type KitchenInviteRow = z.infer<typeof KitchenInviteRowSchema>
export type KitchenInviteInsert = z.infer<typeof KitchenInviteInsertSchema>
export type KitchenInviteUpdate = z.infer<typeof KitchenInviteUpdateSchema>
