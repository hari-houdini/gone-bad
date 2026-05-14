/**
 * @file (app)/_layout.tsx — 5-tab navigator for the authenticated app shell.
 *
 * @remarks
 * Tab order mirrors the user journey:
 *   1. Home (The Fridge Door) — dashboard urgency grid + fun fact
 *   2. Stash (The Stash) — list of all active items
 *   3. Snap (Snap It / The Haul) — camera entry point, centre-tab primary action
 *   4. Bin (The Bin) — waste history
 *   5. Rules (House Rules) — kitchen settings, notifications, account
 *
 * Icon names are SF Symbols (iOS) with Material Icons fallbacks via the
 * `IconSymbol` platform-split component. The `HapticTab` wrapper adds a
 * subtle haptic tap on iOS — it's a direct pass-through on Android/web.
 *
 * `href` on each `Tabs.Screen` is omitted intentionally: expo-router resolves
 * `name="index"` to `/(app)/` and the directory names to their index files.
 *
 * Phase 1.8 adds an auth guard above this layout that redirects to
 * `/(auth)/welcome` when no Supabase session exists.
 */

import { Tabs } from 'expo-router'

import { HapticTab } from '@/components/haptic-tab'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'

export default function AppTabLayout(): React.JSX.Element {
  const colorScheme = useColorScheme()
  const tint = Colors[colorScheme ?? 'light'].tint

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      {/* 1 — The Fridge Door (Dashboard) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="house.fill" color={color} />,
        }}
      />

      {/* 2 — The Stash */}
      <Tabs.Screen
        name="stash"
        options={{
          title: 'Stash',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="basket.fill" color={color} />,
        }}
      />

      {/* 3 — Snap It / The Haul — primary action, visually centred */}
      <Tabs.Screen
        name="snap"
        options={{
          title: 'Snap',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="camera.fill" color={color} />,
        }}
      />

      {/* 4 — The Bin */}
      <Tabs.Screen
        name="bin"
        options={{
          title: 'Bin',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="trash.fill" color={color} />,
        }}
      />

      {/* 5 — House Rules (Settings) */}
      <Tabs.Screen
        name="rules"
        options={{
          title: 'Rules',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="gearshape.fill" color={color} />,
        }}
      />
    </Tabs>
  )
}
