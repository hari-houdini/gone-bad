/**
 * @file bin/index.ts — public barrel for the bin feature pod.
 *
 * @remarks
 * Centralises all public exports for The Bin (waste history).
 * The bin pod is read-only — it queries `item_events` but never mutates.
 *
 * ## Planned additions (Phase 8)
 *
 * ### Screens
 * - `BinScreen` — Phase 8.3: infinite-scroll waste history grouped by date.
 *
 * ### Components
 * - `BinEntryComponent` — Phase 8.2: single waste event row.
 *
 * ### Queries
 * - `useBinQuery` — Phase 8.1: `useInfiniteQuery` over `item_events` JOIN
 *   `items`, ordered by date descending, page size 20.
 */

// Phase 0 — nothing to export yet.
export {}
