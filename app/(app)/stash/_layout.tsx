/**
 * @file stash/_layout.tsx — Stack navigator for The Stash tab.
 *
 * @remarks
 * Stash has two screens: the list (`index`) and the item detail (`[id]`).
 * A nested Stack here keeps the back-navigation within the Stash tab rather
 * than popping to the tab root via the root Stack.
 */

import { Stack } from 'expo-router'

export default function StashLayout(): React.JSX.Element {
  return <Stack screenOptions={{ headerShown: false }} />
}
