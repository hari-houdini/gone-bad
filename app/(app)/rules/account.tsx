/**
 * @file rules/account.tsx — Phase 0 stub for Account Management.
 *
 * @remarks
 * Phase 9.3 replaces this with `AccountScreen` from `@/features/settings`.
 * URL: `/rules/account`
 */

import { PlaceholderScreen } from '@/features/ui/placeholder-screen.component'

export default function AccountPage(): React.JSX.Element {
  return (
    <PlaceholderScreen
      name="Account"
      links={[
        { label: '← House Rules', href: '/rules' },
        { label: '→ Welcome (sign out)', href: '/(auth)/welcome' },
      ]}
    />
  )
}
