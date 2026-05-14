/**
 * @file stash/index.ts — public barrel for the stash feature pod.
 *
 * @remarks
 * Centralises all public exports for The Stash (active item list).
 * The `stash` pod depends on `item` for the detail screen and on `scan`
 * for the Add Item flow entry point.
 *
 * ## Planned additions (Phase 3)
 *
 * ### Screens
 * - `StashScreen` — Phase 3.9: filtered FlatList of active items + FAB.
 *
 * ### Components
 * - `StashItemCardComponent` — Phase 3.8: urgency badge + swipe actions.
 *
 * ### Queries
 * - `useStashQuery` — Phase 3.5: active items with Realtime subscription.
 */

// Phase 0 — nothing to export yet.
export {}
