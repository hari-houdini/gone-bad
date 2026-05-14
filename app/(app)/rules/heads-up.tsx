/**
 * @file rules/heads-up.tsx — Phase 0 stub for Heads Up (notification preferences).
 *
 * @remarks
 * Phase 7.6 replaces this with `HeadsUpScreen` from `@/features/settings`.
 * URL: `/rules/heads-up`
 */

import { PlaceholderScreen } from '@/features/ui/placeholder-screen.component'

export default function HeadsUpPage(): React.JSX.Element {
  return (
    <PlaceholderScreen
      name="Heads Up (Notifications)"
      links={[
        { label: '← House Rules', href: '/rules' },
      ]}
    />
  )
}
