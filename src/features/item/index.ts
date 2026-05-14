/**
 * @file item/index.ts — public barrel for the item feature pod.
 *
 * @remarks
 * Centralises all public exports for item lifecycle management. The `stash`
 * and `scan` pods depend on this barrel for the detail screen and XState hook.
 *
 * ## Planned additions (Phase 3)
 *
 * ### Screens
 * - `ItemLabelScreen` — Phase 3.11: full item detail + quick actions.
 *
 * ### Components
 * - `QuantityModalComponent` — Phase 3.7: "all of it" / "some of it" sheet.
 * - `ItemDetailComponent` (as `ItemLabelComponent`) — Phase 3.10.
 *
 * ### State / machine
 * - `useItemMachine` — Phase 3.11: wraps the XState `itemMachine` actor.
 * - `itemMachine` / `type ItemMachineContext` — Phase 3.3.
 *
 * ### Queries
 * - `useItemQuery`, `useItemEventsQuery` — Phase 3.4.
 * - `useAddItemMutation`, `useMarkUsedMutation`, `useMarkWastedMutation` — Phase 3.4.
 *
 * ### Types
 * - `type ItemMachineContext` — Phase 3.2.
 * - `type ItemMachineEvent` — Phase 3.2.
 */

// Phase 0 — nothing to export yet.
export {}
