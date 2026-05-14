/**
 * @file sign-in.tsx — Phase 0 stub for the Sign In screen.
 *
 * @remarks
 * Phase 1.7 replaces this with `SignInScreen` from `@/features/auth`.
 * URL: `/sign-in`
 */

import { PlaceholderScreen } from '@/features/ui/placeholder-screen.component'

export default function SignInPage(): React.JSX.Element {
  return (
    <PlaceholderScreen
      name="Sign In"
      links={[
        { label: '← Welcome', href: '/(auth)/welcome' },
        { label: '→ Dashboard (skip auth)', href: '/(app)' },
      ]}
    />
  )
}
