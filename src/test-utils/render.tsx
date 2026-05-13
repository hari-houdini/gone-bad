/**
 * Custom test render.
 *
 * Wraps the component under test with all providers it needs at runtime:
 *   - QueryClientProvider  — isolated per-test QueryClient (no cache bleed)
 *
 * Later phases add Zustand store resets here as stores are introduced
 * (each store exposes a `.setState` that can be called in beforeEach).
 *
 * Usage:
 *   import { render, screen, createTestQueryClient } from '@/test-utils/render'
 */
import React from 'react'
import { render, type RenderOptions } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// ---------------------------------------------------------------------------
// QueryClient factory
// ---------------------------------------------------------------------------

/**
 * Returns a QueryClient configured for unit tests:
 * - No retries on failure (errors surface immediately)
 * - Infinite gcTime so cache entries survive the assertion phase
 * - Infinite staleTime so queries don't re-fetch unexpectedly
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
        staleTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

// ---------------------------------------------------------------------------
// Provider tree
// ---------------------------------------------------------------------------

function Providers({
  children,
  queryClient,
}: {
  children: React.ReactNode
  queryClient: QueryClient
}) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

// ---------------------------------------------------------------------------
// Custom render
// ---------------------------------------------------------------------------

export interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Pass a pre-configured QueryClient to inspect cache state after rendering. */
  queryClient?: QueryClient
}

function customRender(
  ui: React.ReactElement,
  options: CustomRenderOptions = {},
) {
  const { queryClient = createTestQueryClient(), ...renderOptions } = options

  return render(ui, {
    wrapper: ({ children }) => (
      <Providers queryClient={queryClient}>{children}</Providers>
    ),
    ...renderOptions,
  })
}

// ---------------------------------------------------------------------------
// Re-exports — test files import everything from here, not from RNTL directly
// ---------------------------------------------------------------------------

export * from '@testing-library/react-native'
export { customRender as render }
