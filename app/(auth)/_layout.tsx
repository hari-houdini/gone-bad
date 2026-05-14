/**
 * @file (auth)/_layout.tsx — Stack navigator for the authentication flow.
 *
 * @remarks
 * `headerShown: false` on the Stack means each screen controls its own header
 * (or omits it entirely). Phase 1.6 adds a custom back button to sign-in.tsx.
 */

import { Stack } from 'expo-router'

export default function AuthLayout(): React.JSX.Element {
  return <Stack screenOptions={{ headerShown: false }} />
}
