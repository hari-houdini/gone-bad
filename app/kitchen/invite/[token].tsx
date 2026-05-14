/**
 * @file kitchen/invite/[token].tsx — Phase 0 stub for the kitchen invite modal.
 *
 * @remarks
 * This screen is presented as a modal over whatever tab is active. The `token`
 * param is the invite token from the deep-link URL (`gonebad://kitchen/invite/:token`).
 *
 * Phase 2.8 replaces this with `InviteScreen` from `@/features/kitchen`,
 * which calls the `handle-invite` Edge Function to accept or reject.
 * URL: `/kitchen/invite/:token`
 */

import { useLocalSearchParams } from 'expo-router'

import { PlaceholderScreen } from '@/features/ui/placeholder-screen.component'

export default function InvitePage(): React.JSX.Element {
  const { token } = useLocalSearchParams<{ token: string }>()

  return (
    <PlaceholderScreen
      name={`Kitchen Invite — ${token}`}
      links={[
        { label: '← Dashboard', href: '/' },
      ]}
    />
  )
}
