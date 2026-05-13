/**
 * Vitest bootstrap sanity-checks.
 *
 * Confirms:
 *   1. globals (describe/it/expect) are injected without imports
 *   2. path aliases resolve correctly
 *   3. Zod v4 schemas are importable via @/shared/types
 *   4. constants barrel resolves via @/constants
 *
 * Does NOT import render.tsx here — that pulls in @testing-library/react-native
 * which depends on react-native (Flow-typed); component test infrastructure is
 * set up in Phase 1.
 */

describe('vitest bootstrap', () => {
  it('globals are available without import', () => {
    expect(1 + 1).toBe(2)
  })

  it('@/shared/types alias resolves and ItemTagSchema is defined', async () => {
    const mod = await import('@/shared/types')
    expect(mod.ItemTagSchema).toBeDefined()
    expect(mod.ItemTagSchema.options).toBeInstanceOf(Array)
  })

  it('@/constants/tags alias resolves and ITEM_TAGS is a non-empty array', async () => {
    const mod = await import('@/constants/tags')
    expect(Array.isArray(mod.ITEM_TAGS)).toBe(true)
    expect(mod.ITEM_TAGS.length).toBeGreaterThan(0)
  })

  it('@/shared/types alias resolves KitchenRoleSchema', async () => {
    const mod = await import('@/shared/types')
    expect(mod.KitchenRoleSchema).toBeDefined()
    expect(typeof mod.KitchenRoleSchema.parse).toBe('function')
  })
})
