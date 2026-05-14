/**
 * @file kitchen/index.ts — public barrel for the kitchen feature pod.
 *
 * @remarks
 * Centralises all public exports for kitchen management. Other pods that
 * need kitchen context (e.g. `item`, `stash`) always import from this barrel.
 *
 * ## Planned additions (Phase 2)
 *
 * ### Screens
 * - `KitchenSettingsScreen` — Phase 2.7: rename, members, invite link.
 * - `InviteScreen` — Phase 2.8: accept/reject incoming deep-link invite.
 *
 * ### State
 * - `useKitchenStore` / `type IKitchenStore` — Phase 2.3.
 * - `type KitchenContext` — Phase 2.2: `{ kitchen, role, members }`.
 *
 * ### Queries
 * - `useKitchensQuery`, `useKitchenMembersQuery` — Phase 2.4.
 * - `useCreateKitchenMutation`, `useCreateInviteMutation` — Phase 2.4.
 *
 * ### Components
 * - `KitchenMembersComponent` — Phase 2.5.
 * - `KitchenInviteComponent` — Phase 2.6.
 */

// Phase 0 — nothing to export yet.
export {}
