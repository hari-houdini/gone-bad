/**
 * Public API for shared Zod schemas + inferred TypeScript types.
 *
 * Explicit named re-exports only — no `export * from` — so the public surface
 * is auditable and tree-shaking is reliable.
 *
 * Dependency order (no circular deps):
 *   user.schema  →  (no local deps)
 *   notifications.schema  →  (no local deps)
 *   kitchen.schema  →  (no local deps)
 *   item.schema  →  (no local deps)
 *   ai.schema  →  item.schema
 *   edge-functions.schema  →  ai.schema, kitchen.schema
 */

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export {
  AuthProviderSchema,
  PlatformSchema,
} from './user.schema'

export {
  KitchenRoleSchema,
  InviteRoleSchema,
} from './kitchen.schema'

export {
  ItemTagSchema,
  ExpirySourceSchema,
  ItemStatusSchema,
  ItemEventTypeSchema,
} from './item.schema'

export {
  NotificationActionSchema,
} from './notifications.schema'

export {
  ModerationReasonSchema,
  RagSourceSchema,
} from './ai.schema'

export {
  HandleInviteErrorCodeSchema,
} from './edge-functions.schema'

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export {
  UserRowSchema,
  UserInsertSchema,
  UserUpdateSchema,
  UserSettingsRowSchema,
  UserSettingsInsertSchema,
  UserSettingsUpdateSchema,
  PushTokenRowSchema,
  PushTokenInsertSchema,
  PushTokenUpdateSchema,
  ScanRateLimitRowSchema,
} from './user.schema'

export type {
  AuthProvider,
  Platform,
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
} from './user.schema'

// ---------------------------------------------------------------------------
// Kitchen
// ---------------------------------------------------------------------------

export {
  KitchenRowSchema,
  KitchenInsertSchema,
  KitchenUpdateSchema,
  KitchenMemberRowSchema,
  KitchenMemberInsertSchema,
  KitchenMemberUpdateSchema,
  KitchenInviteRowSchema,
  KitchenInviteInsertSchema,
  KitchenInviteUpdateSchema,
} from './kitchen.schema'

export type {
  KitchenRole,
  InviteRole,
  KitchenRow,
  KitchenInsert,
  KitchenUpdate,
  KitchenMemberRow,
  KitchenMemberInsert,
  KitchenMemberUpdate,
  KitchenInviteRow,
  KitchenInviteInsert,
  KitchenInviteUpdate,
} from './kitchen.schema'

// ---------------------------------------------------------------------------
// Item
// ---------------------------------------------------------------------------

export {
  ItemRowSchema,
  ItemInsertSchema,
  ItemUpdateSchema,
  ItemEventRowSchema,
  ItemEventInsertSchema,
  CheckItFormSchema,
  QuantityActionSchema,
} from './item.schema'

export type {
  ItemTag,
  ExpirySource,
  ItemStatus,
  ItemEventType,
  ItemRow,
  ItemInsert,
  ItemUpdate,
  ItemEventRow,
  ItemEventInsert,
  CheckItForm,
  QuantityAction,
} from './item.schema'

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export {
  NotificationLogRowSchema,
  DailyKitchenCacheRowSchema,
  DailyKitchenCacheInsertSchema,
  ExpoPushPayloadSchema,
} from './notifications.schema'

export type {
  NotificationAction,
  NotificationLogRow,
  DailyKitchenCacheRow,
  DailyKitchenCacheInsert,
  ExpoPushPayload,
} from './notifications.schema'

// ---------------------------------------------------------------------------
// AI / RAG
// ---------------------------------------------------------------------------

export {
  GeminiAnalyseFailSchema,
  GeminiAnalyseSuccessSchema,
  GeminiAnalyseResponseSchema,
  RagMetadataSchema,
  RagDocumentRowSchema,
  RagDocumentInsertSchema,
} from './ai.schema'

export type {
  ModerationReason,
  GeminiAnalyseFail,
  GeminiAnalyseSuccess,
  GeminiAnalyseResponse,
  RagSource,
  RagMetadata,
  RagDocumentRow,
  RagDocumentInsert,
} from './ai.schema'

// ---------------------------------------------------------------------------
// Edge Functions
// ---------------------------------------------------------------------------

export {
  AnalyseImageRequestSchema,
  AnalyseImageResponseSchema,
  AnalyseImageRateLimitResponseSchema,
  GenerateFunFactRequestSchema,
  GenerateFunFactResponseSchema,
  HandleInviteRequestSchema,
  HandleInviteSuccessResponseSchema,
  HandleInviteFailureResponseSchema,
  HandleInviteResponseSchema,
  SendNotificationsResponseSchema,
  ProcessImageResponseSchema,
  RagQueryRequestSchema,
  RagQueryResponseSchema,
} from './edge-functions.schema'

export type {
  AnalyseImageRequest,
  AnalyseImageRateLimitResponse,
  GenerateFunFactRequest,
  GenerateFunFactResponse,
  HandleInviteRequest,
  HandleInviteErrorCode,
  HandleInviteSuccessResponse,
  HandleInviteFailureResponse,
  HandleInviteResponse,
  SendNotificationsResponse,
  ProcessImageResponse,
  RagQueryRequest,
  RagQueryResponse,
} from './edge-functions.schema'
