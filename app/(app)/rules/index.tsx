/**
 * @file rules/index.tsx — Phase 0 stub for House Rules (Settings root).
 *
 * @remarks
 * Phase 9.4 replaces this with `SettingsScreen` from `@/features/settings`.
 * URL: `/rules`
 */

import { PlaceholderScreen } from '@/features/ui/placeholder-screen.component'

export default function RulesPage(): React.JSX.Element {
  return (
    <PlaceholderScreen
      name="House Rules (Settings)"
      links={[
        { label: '→ Heads Up (notifications)', href: '/rules/heads-up' },
        { label: '→ Kitchen Settings', href: '/rules/kitchen' },
        { label: '→ Account', href: '/rules/account' },
      ]}
    />
  )
}
