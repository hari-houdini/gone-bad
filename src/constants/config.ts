/**
 * @file config.ts — runtime environment configuration.
 *
 * @remarks
 * All values are read from `app.config.ts` via `expo-constants` at bundle time.
 * Set the corresponding environment variables before building (see `.env.example`).
 *
 * Values fall back to empty strings when env vars are absent so the TypeScript
 * compiler is satisfied during Phase 0. The Supabase client will fail loudly at
 * runtime with a clear network error rather than crashing the build, making the
 * missing-credentials problem immediately obvious.
 *
 * @see {@link https://docs.expo.dev/versions/latest/sdk/constants/ expo-constants}
 */

import Constants from 'expo-constants'

// `Constants.expoConfig` is the merged result of app.json + app.config.ts.
const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string>

// ---------------------------------------------------------------------------
// Supabase
// ---------------------------------------------------------------------------

/**
 * Supabase project API URL, e.g. `https://<ref>.supabase.co`.
 * Populated from the `SUPABASE_URL` environment variable via `app.config.ts`.
 */
export const SUPABASE_URL: string = extra.supabaseUrl ?? ''

/**
 * Supabase public anon key.
 * Populated from the `SUPABASE_ANON_KEY` environment variable via `app.config.ts`.
 */
export const SUPABASE_ANON_KEY: string = extra.supabaseAnonKey ?? ''
