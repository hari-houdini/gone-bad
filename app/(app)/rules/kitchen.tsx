/**
 * @file rules/kitchen.tsx — Phase 0 stub for Kitchen Settings.
 *
 * @remarks
 * Phase 2.7 replaces this with `KitchenSettingsScreen` from `@/features/kitchen`.
 * URL: `/rules/kitchen`
 */

import { PlaceholderScreen } from '@/features/ui/placeholder-screen.component'

export default function KitchenSettingsPage(): React.JSX.Element {
  return (
    <PlaceholderScreen
      name="Kitchen Settings"
      links={[
        { label: '← House Rules', href: '/rules' },
      ]}
    />
  )
}
