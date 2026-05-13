/**
 * @file database.types.ts — hand-crafted Supabase `Database` generic type.
 *
 * @remarks
 * The Supabase CLI (`supabase gen types`) generates this file automatically
 * once a live database exists. Until Phase R migrations run, this hand-crafted
 * version is derived directly from the Zod schemas in `@/shared/types`, keeping
 * a single source of truth for every field shape.
 *
 * When the CLI-generated version becomes available, replace this file entirely —
 * do not attempt to reconcile the two.
 *
 * Structure mirrors the Supabase-generated format exactly so that swapping is
 * a drop-in replacement:
 * ```
 * Database
 *   └── [schema]               "public" | "vectors"
 *         ├── Tables
 *         │     └── [table]
 *         │           ├── Row     — SELECT result shape
 *         │           ├── Insert  — .insert() argument shape
 *         │           └── Update  — .update() argument shape
 *         ├── Views              (empty in Phase 0)
 *         ├── Functions          (populated per-phase as RPCs are added)
 *         └── Enums
 * ```
 *
 * `Insert: never` on server-managed tables means the TypeScript compiler
 * rejects any accidental direct client write at compile time.
 */

import type {
  // User
  UserRow,
  UserInsert,
  UserUpdate,
  UserSettingsRow,
  UserSettingsInsert,
  UserSettingsUpdate,
  PushTokenRow,
  PushTokenInsert,
  PushTokenUpdate,
  ScanRateLimitRow,
  AuthProvider,
  Platform,
  // Kitchen
  KitchenRow,
  KitchenInsert,
  KitchenUpdate,
  KitchenMemberRow,
  KitchenMemberInsert,
  KitchenMemberUpdate,
  KitchenInviteRow,
  KitchenInviteInsert,
  KitchenInviteUpdate,
  KitchenRole,
  InviteRole,
  // Item
  ItemRow,
  ItemInsert,
  ItemUpdate,
  ItemEventRow,
  ItemEventInsert,
  ItemTag,
  ExpirySource,
  ItemStatus,
  ItemEventType,
  // Notifications
  NotificationLogRow,
  DailyKitchenCacheRow,
  DailyKitchenCacheInsert,
  NotificationAction,
  // RAG
  RagDocumentRow,
  RagDocumentInsert,
  RagSource,
} from '@/shared/types'

// ---------------------------------------------------------------------------
// Database
// ---------------------------------------------------------------------------

/**
 * Full typed database definition passed to `createClient<Database>`.
 *
 * @remarks
 * Two schemas are represented: `public` (all application tables) and `vectors`
 * (the pgvector RAG document store). Phase R migrations will bring both live.
 */
export type Database = {
  public: {
    Tables: {
      // ── Users ──────────────────────────────────────────────────────────
      users: {
        Row: UserRow
        Insert: UserInsert
        Update: UserUpdate
      }
      user_settings: {
        Row: UserSettingsRow
        Insert: UserSettingsInsert
        Update: UserSettingsUpdate
      }
      push_tokens: {
        Row: PushTokenRow
        Insert: PushTokenInsert
        Update: PushTokenUpdate
      }
      /**
       * Written exclusively by the `increment_scan_count()` RPC.
       * Direct client inserts are blocked by RLS and statically rejected here.
       */
      scan_rate_limits: {
        Row: ScanRateLimitRow
        Insert: never
        Update: never
      }
      // ── Kitchens ────────────────────────────────────────────────────────
      kitchens: {
        Row: KitchenRow
        Insert: KitchenInsert
        Update: KitchenUpdate
      }
      kitchen_members: {
        Row: KitchenMemberRow
        Insert: KitchenMemberInsert
        Update: KitchenMemberUpdate
      }
      kitchen_invites: {
        Row: KitchenInviteRow
        Insert: KitchenInviteInsert
        Update: KitchenInviteUpdate
      }
      // ── Items ───────────────────────────────────────────────────────────
      items: {
        Row: ItemRow
        Insert: ItemInsert
        Update: ItemUpdate
      }
      /**
       * Append-only audit log. No `Update` is ever valid; `Insert` is
       * permitted here but in practice goes through the `mark_item_used` /
       * `mark_item_wasted` RPCs (see `Functions` below).
       */
      item_events: {
        Row: ItemEventRow
        Insert: ItemEventInsert
        Update: never
      }
      // ── Notifications ────────────────────────────────────────────────────
      /**
       * Written exclusively by the `send-notifications` Edge Function.
       * Direct client inserts are blocked by RLS and statically rejected here.
       */
      notification_log: {
        Row: NotificationLogRow
        Insert: never
        Update: never
      }
      /**
       * Written exclusively by the `generate-fun-fact` Edge Function.
       * Immutable per `(kitchen_id, cache_date)`.
       */
      daily_kitchen_cache: {
        Row: DailyKitchenCacheRow
        Insert: DailyKitchenCacheInsert
        Update: never
      }
    }
    Views: Record<never, never>
    /**
     * Supabase RPCs added per-phase. Populated by the Supabase CLI once
     * migrations run in Phase R.
     *
     * @example Phases 3+ will add:
     * ```
     * mark_item_used:   { Args: { item_id: string, quantity: number, ... }; Returns: void }
     * mark_item_wasted: { Args: { item_id: string, quantity: number, ... }; Returns: void }
     * ```
     */
    Functions: Record<never, never>
    Enums: {
      auth_provider: AuthProvider
      platform: Platform
      kitchen_role: KitchenRole
      invite_role: InviteRole
      item_tag: ItemTag
      expiry_source: ExpirySource
      item_status: ItemStatus
      item_event_type: ItemEventType
      notification_action: NotificationAction
    }
    CompositeTypes: Record<never, never>
  }
  vectors: {
    Tables: {
      rag_documents: {
        Row: RagDocumentRow
        Insert: RagDocumentInsert
        Update: never
      }
    }
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: {
      rag_source: RagSource
    }
    CompositeTypes: Record<never, never>
  }
}
