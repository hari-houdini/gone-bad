/**
 * @file app.config.ts — dynamic Expo configuration.
 *
 * @remarks
 * Extends the static `app.json` manifest with values that depend on the
 * runtime environment. The `expo.extra` block populated here is what
 * `expo-constants` makes available as `Constants.expoConfig.extra` inside
 * the app bundle.
 *
 * Required environment variables (see `.env.example`):
 * - `SUPABASE_URL`       — project API URL from the Supabase dashboard.
 * - `SUPABASE_ANON_KEY`  — public anon key from the Supabase dashboard.
 */

import type { ConfigContext, ExpoConfig } from 'expo/config'

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'gone-bad',
  slug: config.slug ?? 'gone-bad',
  extra: {
    supabaseUrl: process.env.SUPABASE_URL ?? '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? '',
  },
})
