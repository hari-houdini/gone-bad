/**
 * @file ui/index.ts — public barrel for the shared UI feature pod.
 *
 * @remarks
 * The `ui` pod contains React Native components that are shared across
 * multiple feature pods. Nothing in this barrel has a feature-specific
 * dependency — it exists one level above the other pods in the dependency
 * graph so any pod can import from it without creating a cycle.
 *
 * ## Current exports (Phase 0)
 * - {@link PlaceholderScreen} — Phase 0 stub screen with navigation links.
 * - {@link PlaceholderScreenProps} — props for the stub screen.
 * - {@link PlaceholderLink} — single navigation link shape used by the stub.
 *
 * ## Planned additions
 * - Phase 1: shared `ErrorBanner`, `LoadingOverlay` components.
 * - Phase 3+: `QuantityInput`, `TagChip`, urgency-aware `ExpiryBadge`.
 * - Phase 10: finalised design-system components replacing all stubs.
 */

export {
  PlaceholderScreen,
  type PlaceholderScreenProps,
  type PlaceholderLink,
} from './placeholder-screen.component'
