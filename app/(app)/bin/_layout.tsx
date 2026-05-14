/**
 * @file bin/_layout.tsx — Stack navigator for The Bin tab.
 *
 * @remarks
 * Required even though The Bin has only one screen (index) in Phase 0.
 * Without a `_layout.tsx`, expo-router registers the route as `bin/index`
 * instead of `bin`, which causes the Tabs navigator to warn:
 * "No route named 'bin' exists in nested children".
 *
 * Phase 8 will add no additional screens to this tab — the layout stays.
 */

import { Stack } from 'expo-router'

export default function BinLayout(): React.JSX.Element {
  return <Stack screenOptions={{ headerShown: false }} />
}
