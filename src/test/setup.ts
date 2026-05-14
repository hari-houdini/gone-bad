/**
 * @file setup.ts — global Vitest setup, runs before every test file.
 *
 * @remarks
 * Global test setup — runs after the Vitest framework is installed,
 * before any test file executes.
 *
 * Phase 0 note:
 *   All Phase 0 tests are pure TypeScript domain logic (value objects,
 *   specs, services).  They have zero React Native imports, so no RN
 *   mocking is needed here yet.
 *
 * Phase 1 addition:
 *   When component tests land, add:
 *     - react-native module mocks  (Flow-typed files can't be parsed by esbuild)
 *     - @testing-library/jest-native/extend-expect for toBeVisible etc.
 *   That work belongs in the component test setup chunk of Phase 1.
 */
