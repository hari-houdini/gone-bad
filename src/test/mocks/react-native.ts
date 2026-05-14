/**
 * @file react-native.ts — Vitest module alias for react-native.
 *
 * @remarks
 * `react-native/index.js` contains Flow type annotations (`import typeof`)
 * that are invalid TypeScript/JavaScript. Vitest's esbuild transformer fails
 * to parse them, producing an "Unexpected typeof" SyntaxError.
 *
 * The `resolve.alias` in `vitest.config.ts` redirects every `react-native`
 * import to this file, so esbuild never touches the real package.
 *
 * Coverage scope:
 * - Phase 0–R: only `Platform.select` (used in `src/constants/theme.ts`)
 *   and core view primitives (used in `src/features/ui/`) are needed.
 * - Phase 1+: add missing exports as component tests land; keep the list
 *   minimal — only what tests actually use.
 *
 * Do NOT expand this file blindly. Each export here should be justified by
 * a test that would otherwise fail without it.
 */

// ---------------------------------------------------------------------------
// Platform
// ---------------------------------------------------------------------------

export const Platform = {
  OS: 'ios' as 'ios' | 'android' | 'web' | 'windows' | 'macos',
  /**
   * Returns the value for the current platform key, falling back to `default`.
   */
  select: <T>(spec: Partial<Record<'ios' | 'android' | 'web' | 'windows' | 'macos' | 'default', T>>): T | undefined =>
    spec['ios'] ?? spec['default'],
  isPad: false,
  isTV: false,
  isTesting: true,
  Version: 0,
}

// ---------------------------------------------------------------------------
// StyleSheet
// ---------------------------------------------------------------------------

export const StyleSheet = {
  /** Returns the styles object unmodified — no native flattening needed in tests. */
  create: <T extends Record<string, unknown>>(styles: T): T => styles,
  flatten: <T>(style: T): T => style,
  hairlineWidth: 0.5,
  absoluteFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 } as const,
  absoluteFillObject: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 } as const,
}

// ---------------------------------------------------------------------------
// Core view primitives (used by placeholder-screen and future components)
// ---------------------------------------------------------------------------

/** Stub string component names — @testing-library/react-native resolves them. */
export const View = 'View'
export const Text = 'Text'
export const ScrollView = 'ScrollView'
export const TouchableOpacity = 'TouchableOpacity'
export const TouchableHighlight = 'TouchableHighlight'
export const Pressable = 'Pressable'
export const TextInput = 'TextInput'
export const Image = 'Image'
export const FlatList = 'FlatList'
export const SectionList = 'SectionList'
export const ActivityIndicator = 'ActivityIndicator'
export const Modal = 'Modal'
export const SafeAreaView = 'SafeAreaView'

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

export const Dimensions = {
  get: (_dim: 'window' | 'screen') => ({ width: 390, height: 844, scale: 3, fontScale: 1 }),
  addEventListener: () => ({ remove: () => {} }),
}

export const Keyboard = {
  dismiss: () => {},
  addListener: () => ({ remove: () => {} }),
}

export const Alert = {
  alert: () => {},
}

export const Linking = {
  openURL: () => Promise.resolve(),
  getInitialURL: () => Promise.resolve(null),
  addEventListener: () => ({ remove: () => {} }),
}

export const AppState = {
  currentState: 'active' as const,
  addEventListener: () => ({ remove: () => {} }),
}

export const Vibration = {
  vibrate: () => {},
  cancel: () => {},
}

// ---------------------------------------------------------------------------
// Animated (minimal — full stub added when animation tests land)
// ---------------------------------------------------------------------------

export const Animated = {
  Value: class {
    constructor(_v: number) {}
    setValue(_v: number) {}
    addListener(_cb: (v: { value: number }) => void) { return '' }
    removeListener(_id: string) {}
  },
  View: 'Animated.View',
  Text: 'Animated.Text',
  timing: (_v: unknown, _c: unknown) => ({ start: (_cb?: () => void) => _cb?.() }),
  spring: (_v: unknown, _c: unknown) => ({ start: (_cb?: () => void) => _cb?.() }),
  parallel: (_a: unknown[]) => ({ start: (_cb?: () => void) => _cb?.() }),
  sequence: (_a: unknown[]) => ({ start: (_cb?: () => void) => _cb?.() }),
  createAnimatedComponent: <T>(c: T) => c,
}
