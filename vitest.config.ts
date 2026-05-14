import { defineConfig } from 'vitest/config'
import path from 'node:path'

/**
 * Vitest configuration for the Gone Bad React Native project.
 *
 * Environment: 'node' — React Native's JS engine is not a browser;
 * @testing-library/react-native works in Node without JSDOM.
 *
 * Path aliases mirror tsconfig.json exactly so test imports resolve
 * identically to production imports.
 */
export default defineConfig({
  resolve: {
    alias: {
      // Redirect react-native to a parseable stub. The real package contains
      // Flow type annotations (`import typeof`) that esbuild cannot parse.
      // This must come BEFORE the '@' catch-all so it is matched first.
      'react-native': path.resolve(__dirname, 'src/test/mocks/react-native.ts'),
      // More-specific aliases MUST come before the catch-all '@' entry.
      '@/features': path.resolve(__dirname, 'src/features'),
      '@/shared': path.resolve(__dirname, 'src/_shared'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
      '@/constants': path.resolve(__dirname, 'src/constants'),
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'node',
    /**
     * globals: true lets test files use describe/it/expect/vi without
     * explicit imports — consistent with Jest muscle-memory.
     */
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        // Barrel re-exports and pure type files carry no logic to cover.
        'src/**/index.ts',
        'src/**/*.type.ts',
        'src/**/*.schema.ts',
        'src/**/*.port.ts',
      ],
    },
  },
})
