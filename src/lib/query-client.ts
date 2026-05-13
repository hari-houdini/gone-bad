/**
 * @file query-client.ts — TanStack Query v5 client and AsyncStorage persister.
 *
 * @remarks
 * Two exports are provided and consumed together in the root layout:
 *
 * ```tsx
 * // app/_layout.tsx  (Phase 0.21)
 * import { queryClient, asyncStoragePersister } from '@/lib/query-client'
 *
 * <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: asyncStoragePersister }}>
 *   <Slot />
 * </PersistQueryClientProvider>
 * ```
 *
 * Default options rationale:
 * - `gcTime: 24h` — keep unused query data in memory (and on disk) for a full
 *   day so the app feels instant on reopen without an internet connection.
 * - `staleTime: 5min` — don't refetch if the user navigates back within 5
 *   minutes; refetch silently in the background after that threshold.
 * - `retry: 2` — retry twice on network failures before surfacing an error to
 *   the user; covers transient mobile network blips without being aggressive.
 *
 * Persister options rationale:
 * - `key: 'GONE_BAD_QUERY_CACHE'` — explicit key avoids collisions if other
 *   libraries use AsyncStorage.
 * - `throttleTime: 1_000` — write the serialised cache at most once per second;
 *   prevents a burst of AsyncStorage writes during rapid navigation or typing.
 *
 * @see {@link https://tanstack.com/query/v5/docs/react/plugins/persistQueryClient} persistQueryClient docs
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { QueryClient } from '@tanstack/react-query'

// ---------------------------------------------------------------------------
// QueryClient
// ---------------------------------------------------------------------------

/**
 * The application's single TanStack Query client.
 *
 * @remarks
 * Pass this to `PersistQueryClientProvider` in the root layout.
 * Do not instantiate a second `QueryClient` — duplicate clients break
 * cache sharing between routes.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /** Keep unused data in cache for 24 hours. */
      gcTime: 1000 * 60 * 60 * 24,
      /** Data is fresh for 5 minutes; refetch silently after that. */
      staleTime: 1000 * 60 * 5,
      /** Retry twice on network failure before surfacing an error. */
      retry: 2,
      /** Show stale data while refetching in the background. */
      refetchOnWindowFocus: false,
    },
    mutations: {
      /** Single retry for mutations — idempotent mutations only. */
      retry: 1,
    },
  },
})

// ---------------------------------------------------------------------------
// AsyncStorage persister
// ---------------------------------------------------------------------------

/**
 * Persister that serialises the TanStack Query cache to AsyncStorage.
 *
 * @remarks
 * Pass to `PersistQueryClientProvider`'s `persistOptions.persister` prop in
 * the root layout. The cache is restored from storage on the next cold start,
 * making the app feel instant even before network responses arrive.
 */
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'GONE_BAD_QUERY_CACHE',
  /** Maximum AsyncStorage writes per second — avoids rapid-navigation churn. */
  throttleTime: 1000,
})
