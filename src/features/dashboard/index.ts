/**
 * @file dashboard/index.ts — public barrel for the dashboard feature pod.
 *
 * @remarks
 * Centralises all public exports for The Fridge Door (Dashboard).
 * The dashboard is a read-only aggregation layer — it depends on `item`
 * and `kitchen` data but never writes to them directly.
 *
 * ## Planned additions (Phase 6)
 *
 * ### Screens
 * - `DashboardScreen` — Phase 6.7: urgency grid + fun fact + waste stats.
 *
 * ### Components
 * - `UrgencyGridComponent` — Phase 6.5: today / this week / ok buckets.
 * - `FunFactCardComponent` — Phase 6.6: daily AI-generated food fact.
 * - `WasteStatsComponent` — Phase 6.6: used / wasted / saved summary.
 *
 * ### Hooks
 * - `useDashboard` — Phase 6.7: composes `useDashboardItemsQuery`,
 *   `useFunFactQuery`, `useWasteStatsQuery`.
 *
 * ### Queries
 * - `useDashboardItemsQuery` — items grouped by urgency.
 * - `useFunFactQuery` — daily fun fact; stale until end-of-day.
 * - `useWasteStatsQuery` — current-month waste metrics.
 */

// Phase 0 — nothing to export yet.
export {}
