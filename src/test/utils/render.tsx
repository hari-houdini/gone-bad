/**
 * @file Custom test render and re-exported testing utilities.
 *
 * @remarks
 * Wraps the component under test with the full provider tree required at
 * runtime. Currently provides:
 * - `QueryClientProvider` — isolated per-test `QueryClient` (no cache bleed).
 *
 * Later phases add Zustand store resets here as each store is introduced; each
 * store exposes a `.setState` that can be called in `beforeEach`.
 *
 * @example
 * ```ts
 * import { render, screen, createTestQueryClient } from '@/test/utils/render'
 * ```
 */
import React from 'react'
import { render, type RenderOptions } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// ---------------------------------------------------------------------------
// QueryClient factory
// ---------------------------------------------------------------------------

/**
 * Returns a fresh `QueryClient` configured for unit tests.
 *
 * @remarks
 * - `retry: false` — errors surface immediately without retrying.
 * - `gcTime: Infinity` — cache entries survive the entire assertion phase.
 * - `staleTime: Infinity` — queries never re-fetch unexpectedly during tests.
 *
 * @returns A pre-configured {@link QueryClient} suitable for test renders.
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

/**
 * Internal provider tree injected around every component under test.
 *
 * @param props.children - The component subtree to wrap.
 * @param props.queryClient - The `QueryClient` instance for this test run.
 */
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
  /**
   * Pre-configured `QueryClient` to inject.
   *
   * @remarks
   * Pass an instance created by {@link createTestQueryClient} when you need to
   * inspect or pre-seed the query cache after rendering.
   */
  queryClient?: QueryClient
}

/**
 * Renders `ui` inside the application's full provider tree.
 *
 * @param ui - The React element to render.
 * @param options - Optional render configuration; accepts all standard RNTL
 *   options plus a `queryClient` override.
 * @returns The standard RNTL render result.
 */
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
// Re-exports — import everything from here, not from RNTL directly
// ---------------------------------------------------------------------------

export * from '@testing-library/react-native'
export { customRender as render }
