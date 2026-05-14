/**
 * @file rules/_layout.tsx — Stack navigator for the House Rules (Settings) tab.
 *
 * @remarks
 * Rules has four screens: the settings root (`index`), notifications prefs
 * (`heads-up`), kitchen settings (`kitchen`), and account management
 * (`account`). The nested Stack keeps navigation within the Rules tab.
 */

import { Stack } from 'expo-router'

export default function RulesLayout(): React.JSX.Element {
  return <Stack screenOptions={{ headerShown: false }} />
}
