/**
 * @file supabase.ts — typed Supabase client singleton.
 *
 * @remarks
 * A single `SupabaseClient<Database>` instance is created at module load and
 * re-used everywhere. Calling `createClient` more than once creates independent
 * connection pools and breaks session synchronisation, so always import from
 * this file rather than calling `createClient` directly.
 *
 * Auth configuration notes:
 * - `storage: AsyncStorage` — stores the session JWT in hardware-backed
 *   key-value storage so sessions survive app restarts without re-login.
 * - `autoRefreshToken: true` — silently renews the JWT before expiry; users
 *   are never interrupted by a mid-session 401.
 * - `detectSessionInUrl: false` — React Native has no browser URL bar. Auth
 *   redirects arrive as deep links via the `gonebad://` custom scheme and are
 *   handled by `expo-auth-session`, not by URL parsing inside this client.
 *
 * @see {@link https://supabase.com/docs/reference/javascript/initializing} createClient docs
 * @see {@link https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native} Expo + Supabase guide
 */

import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/constants/config'
import type { Database } from './database.types'

// ---------------------------------------------------------------------------
// Singleton client
// ---------------------------------------------------------------------------

/**
 * The application's single typed Supabase client.
 *
 * @remarks
 * Generic over {@link Database} so every `.from('table')` call is fully typed:
 * - `.from('items').select()` returns `ItemRow[]`
 * - `.from('items').insert(payload)` expects `ItemInsert`
 * - `.from('scan_rate_limits').insert(...)` is a compile error (`Insert: never`)
 *
 * The client is created with empty-string credentials when `SUPABASE_URL` or
 * `SUPABASE_ANON_KEY` are absent (Phase 0 without a real project). Any API
 * call will fail with a network error in that state, making the missing
 * credential obvious at runtime.
 */
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
