/**
 * @file _layout.tsx — root layout: providers, navigation shell, notification listener.
 *
 * @remarks
 * Three responsibilities:
 *
 * 1. **Providers** — wraps the entire app in `PersistQueryClientProvider` so
 *    every screen can call `useQuery` / `useMutation`, and `ThemeProvider` so
 *    system dark-mode is respected everywhere.
 *
 * 2. **Navigation shell** — declares the top-level Stack with three named
 *    segments:
 *    - `(auth)` — sign-in / welcome flow (no header)
 *    - `(app)` — authenticated tab navigator (no header; tabs provide their own)
 *    - `kitchen/invite/[token]` — invite deep-link, shown as a modal sheet
 *
 * 3. **Notification listener** — mounts once via `useEffect`; the cleanup
 *    function returned by `setupNotificationListeners` is called on unmount to
 *    prevent memory leaks. Phase 0: no-op stub. Phase 7: dispatches quick
 *    actions without opening the app.
 *
 * `unstable_settings.anchor` tells expo-router which segment to use as the
 * initial route when no deep-link URL is present. `(app)` makes the tab
 * navigator the default entry point; Phase 1.8 will add an auth guard that
 * redirects unauthenticated users to `(auth)/welcome` before anything renders.
 */

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import 'react-native-reanimated'

import { useColorScheme } from '@/hooks/use-color-scheme'
import { asyncStoragePersister, queryClient } from '@/lib/query-client'
import { setupNotificationListeners } from '@/lib/notifications'

// ---------------------------------------------------------------------------
// Routing anchor
// ---------------------------------------------------------------------------

/**
 * Start in the authenticated app segment; Phase 1.8 adds the auth guard that
 * redirects to `(auth)/welcome` when no session exists.
 */
export const unstable_settings = {
  anchor: '(app)',
}

// ---------------------------------------------------------------------------
// Root layout
// ---------------------------------------------------------------------------

export default function RootLayout(): React.JSX.Element {
  const colorScheme = useColorScheme()

  // Mount the background notification response listener once.
  // Phase 0: no-op. Phase 7: handles MARK_USED / MARK_WASTED quick actions.
  useEffect(() => {
    const cleanup = setupNotificationListeners()
    return cleanup
  }, [])

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          {/* Authenticated main app — tabs provide their own headers */}
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
          {/* Sign-in / welcome flow */}
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          {/* Invite deep-link arrives as a modal over whatever screen is active */}
          <Stack.Screen
            name="kitchen/invite/[token]"
            options={{ presentation: 'modal', title: 'Kitchen Invite' }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </PersistQueryClientProvider>
  )
}
