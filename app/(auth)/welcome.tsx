/**
 * @file welcome.tsx — Phase 0 stub for the Welcome / onboarding screen.
 *
 * @remarks
 * Phase 1.6 replaces this with `WelcomeScreen` from `@/features/auth`.
 * URL: `/welcome`
 */

import { PlaceholderScreen } from '@/features/ui/placeholder-screen.component'

export default function WelcomePage(): React.JSX.Element {
  return (
    <PlaceholderScreen
      name="Welcome"
      links={[
        { label: '→ Sign In', href: '/(auth)/sign-in' },
        { label: '→ Dashboard (skip auth)', href: '/(app)' },
      ]}
    />
  )
}
