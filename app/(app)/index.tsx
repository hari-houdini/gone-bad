/**
 * @file index.tsx — Phase 0 stub for The Fridge Door (Dashboard).
 *
 * @remarks
 * Phase 6.7 replaces this with `DashboardScreen` from `@/features/dashboard`.
 * URL: `/`
 */

import { PlaceholderScreen } from '@/features/ui/placeholder-screen.component'

export default function DashboardPage(): React.JSX.Element {
  return (
    <PlaceholderScreen
      name="The Fridge Door (Dashboard)"
      links={[
        { label: '→ The Stash', href: '/stash' },
        { label: '→ Snap It', href: '/snap' },
        { label: '→ The Bin', href: '/bin' },
        { label: '→ House Rules', href: '/rules' },
        { label: '→ Welcome (auth)', href: '/(auth)/welcome' },
      ]}
    />
  )
}
