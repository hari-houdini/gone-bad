/**
 * @file tokens.ts — design token primitives for the Gone Bad UI.
 *
 * @remarks
 * These are placeholder values for Phase 0–9. Final values will be locked in
 * Phase 10. All screens should import from this file rather than hard-coding
 * magic numbers so the Phase 10 colour/spacing pass is a single-file change.
 *
 * All objects use `as const` so TypeScript infers the narrowest literal types,
 * making typos (`spacing.lrg`) a compile error rather than a runtime surprise.
 *
 * @example
 * ```ts
 * import { spacing, colors, fontSizes } from '@/constants/tokens'
 *
 * const styles = StyleSheet.create({
 *   card: { padding: spacing.md, borderRadius: borderRadius.lg },
 *   title: { fontSize: fontSizes.lg, color: colors.textPrimary },
 * })
 * ```
 */

// ---------------------------------------------------------------------------
// Spacing — 4-point base grid
// ---------------------------------------------------------------------------

/**
 * Spacing scale derived from a 4-point base grid.
 *
 * | Token | Value | Use |
 * |-------|-------|-----|
 * | `xs`  | 4     | Icon padding, tight gaps |
 * | `sm`  | 8     | Inner component padding |
 * | `md`  | 16    | Standard card padding |
 * | `lg`  | 24    | Section spacing |
 * | `xl`  | 32    | Screen-edge padding |
 * | `xxl` | 48    | Hero / display spacing |
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const

// ---------------------------------------------------------------------------
// Font Sizes
// ---------------------------------------------------------------------------

/**
 * Typographic scale in points (matches iOS Dynamic Type approximate sizes).
 *
 * | Token     | Value |
 * |-----------|-------|
 * | `xs`      | 11    |
 * | `sm`      | 13    |
 * | `md`      | 15    |
 * | `lg`      | 17    |
 * | `xl`      | 20    |
 * | `xxl`     | 24    |
 * | `display` | 32    |
 */
export const fontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  display: 32,
} as const

// ---------------------------------------------------------------------------
// Border Radius
// ---------------------------------------------------------------------------

/**
 * Corner-radius scale.
 *
 * | Token  | Value | Use |
 * |--------|-------|-----|
 * | `sm`   | 4     | Tags, chips |
 * | `md`   | 8     | Buttons, inputs |
 * | `lg`   | 12    | Cards |
 * | `xl`   | 16    | Bottom sheets, modals |
 * | `pill` | 999   | Badge pills, fully rounded buttons |
 */
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
} as const

// ---------------------------------------------------------------------------
// Colours
// ---------------------------------------------------------------------------

/**
 * Semantic colour tokens for the light-mode UI.
 *
 * @remarks
 * The three urgency colours (`expired`, `expiringSoon`, `fresh`) mirror the
 * three expiry specification classes ({@link IsExpiredSpec},
 * {@link IsExpiringSoonSpec}, {@link IsFreshSpec}) — keeping the domain
 * language and the visual language in sync.
 *
 * Dark-mode overrides live in {@link darkColors}.
 */
export const colors = {
  // Brand
  /** Primary brand teal-green. */
  brand: '#2D9B6F',
  /** Darker brand shade for pressed states. */
  brandDark: '#1A6B4A',

  // Urgency — maps to expiry spec outcomes
  /** Item's expiry date has passed. */
  expired: '#D94F4F',
  /** Item is within its notification alert window. */
  expiringSoon: '#E8852A',
  /** Item is safe — outside all urgency thresholds. */
  fresh: '#2D9B6F',

  // Neutrals
  /** Primary text. */
  textPrimary: '#11181C',
  /** Secondary / supporting text. */
  textSecondary: '#687076',
  /** Screen background. */
  background: '#FFFFFF',
  /** Elevated surface (cards, sheets). */
  surface: '#F8F9FA',
  /** Divider and input border. */
  border: '#E6EAED',

  // Interactive
  /** Tappable links and interactive elements (matches Expo default tint). */
  interactive: '#0a7ea4',
} as const

/**
 * Dark-mode counterparts of {@link colors}.
 *
 * Only tokens that differ in dark mode are listed here. Urgency and brand
 * colours remain the same across both schemes.
 */
export const darkColors = {
  textPrimary: '#ECEDEE',
  textSecondary: '#9BA1A6',
  background: '#151718',
  surface: '#1E2122',
  border: '#2D3134',
} as const

// ---------------------------------------------------------------------------
// Re-export types for convenience
// ---------------------------------------------------------------------------

/** Literal union of all spacing token keys. */
export type SpacingToken = keyof typeof spacing

/** Literal union of all font-size token keys. */
export type FontSizeToken = keyof typeof fontSizes

/** Literal union of all border-radius token keys. */
export type BorderRadiusToken = keyof typeof borderRadius
