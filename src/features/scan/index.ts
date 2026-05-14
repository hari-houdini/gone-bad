/**
 * @file scan/index.ts — public barrel for the scan feature pod.
 *
 * @remarks
 * Centralises all public exports for the image capture and item entry flow.
 * The scan pod is the primary entry point for creating items — both the
 * AI-assisted camera path (Phase 4) and the manual form path (Phase 3).
 *
 * ## Planned additions
 *
 * ### Screens (Phase 3)
 * - `CheckItScreen` — manual + AI-pre-filled item review form.
 *
 * ### Screens (Phase 4)
 * - `SnapItScreen` — camera screen with barcode + single scan.
 *
 * ### Screens (Phase 5)
 * - `HaulScreen` — continuous camera for bulk capture.
 * - `LineEmUpScreen` — batch review after bulk scan.
 *
 * ### State (Phase 4)
 * - `useScanStore` / `type IScanStore` — in-memory pending analysis store.
 *
 * ### Services (Phase 4)
 * - `ScanService` / `type IScanService` — `analysePhoto`, `scanBarcode`.
 * - `HaulService` / `type IHaulService` — Phase 5 batch processing.
 *
 * ### Components (Phase 5)
 * - `HaulItemCardComponent` — Phase 5.2: single haul result card.
 */

// Phase 0 — nothing to export yet.
export {}
