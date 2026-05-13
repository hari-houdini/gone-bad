import { z } from 'zod'

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const KitchenRoleSchema = z.enum(['owner', 'editor', 'viewer'])
/** Owners cannot be invited — they are always the creator. */
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
 * `created_by` is intentionally omitted — always derived from the JWT
 * server-side. Never accept it from the client.
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

/** Used by the `handle-invite` Edge Function; client only updates role / is_default. */
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
  /** URL-safe base-64 token, always exactly 32 characters. */
  token: z.string().regex(/^[a-zA-Z0-9_-]{32}$/),
  created_by: z.uuid(),
  role: InviteRoleSchema,
  expires_at: z.iso.datetime(),
  /** null means unlimited uses; min(1) because a 0-use invite is nonsense. */
  max_uses: z.number().int().min(1).nullable(),
  used_count: z.number().int().min(0),
  created_at: z.iso.datetime(),
})

/**
 * `expires_at` is intentionally omitted — always set to NOW()+7days server-side.
 * Accepting it from the client would allow 100-year expiry abuse.
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
