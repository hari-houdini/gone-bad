/**
 * Supabase client initialisation smoke tests.
 *
 * @remarks
 * Two modules are mocked before the client is imported:
 *
 * 1. `@/constants/config` — provides valid-but-fake credential strings.
 *    Without this, `SUPABASE_URL` is `''`, and `createClient` throws
 *    "supabaseUrl is required." before any test runs.
 *
 * 2. `@react-native-async-storage/async-storage` — the real module uses React
 *    Native native bindings unavailable in the Node.js test environment.
 *    A minimal in-memory implementation is sufficient; the tests do not
 *    exercise auth session reads or writes.
 *
 * Vitest hoists `vi.mock` calls above all imports, so both mocks are in place
 * before the `supabase` module is evaluated.
 */

vi.mock('@/constants/config', () => ({
  SUPABASE_URL: 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY: 'placeholder-anon-key',
}))

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined),
    multiGet: vi.fn().mockResolvedValue([]),
    multiSet: vi.fn().mockResolvedValue(undefined),
    multiRemove: vi.fn().mockResolvedValue(undefined),
  },
}))

import { supabase } from './supabase'

// ---------------------------------------------------------------------------
// Initialisation
// ---------------------------------------------------------------------------

describe('supabase client — initialisation', () => {
  it('is defined after module load', () => {
    expect(supabase).toBeDefined()
  })

  it('exposes a .from() query builder factory', () => {
    expect(typeof supabase.from).toBe('function')
  })

  it('exposes a .auth namespace', () => {
    expect(supabase.auth).toBeDefined()
  })

  it('exposes a .storage namespace', () => {
    expect(supabase.storage).toBeDefined()
  })

  it('exposes a .functions namespace for Edge Function invocations', () => {
    expect(supabase.functions).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// Type-level verification
// ---------------------------------------------------------------------------

describe('supabase client — typed query builder', () => {
  it('.from("items") returns a query builder without throwing', () => {
    expect(() => supabase.from('items')).not.toThrow()
  })

  it('.from("kitchens") returns a query builder without throwing', () => {
    expect(() => supabase.from('kitchens')).not.toThrow()
  })
})
