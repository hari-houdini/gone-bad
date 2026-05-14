/**
 * @file snap/_layout.tsx — Stack navigator for the Snap tab.
 *
 * @remarks
 * The Snap flow has five screens: the camera entry (`index`), single scan
 * (`single`), haul mode (`haul`), Check It form (`check-it`), and Line 'Em
 * Up review (`line-em-up`). A nested Stack keeps the entire capture-and-review
 * journey within the Snap tab.
 */

import { Stack } from 'expo-router'

export default function SnapLayout(): React.JSX.Element {
  return <Stack screenOptions={{ headerShown: false }} />
}
