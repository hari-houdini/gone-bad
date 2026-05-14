/**
 * @file snap/line-em-up.tsx — Phase 0 stub for Line 'Em Up (haul review).
 *
 * @remarks
 * Phase 5.3 replaces this with `LineEmUpScreen` from `@/features/scan`.
 * URL: `/snap/line-em-up`
 */

import { PlaceholderScreen } from '@/features/ui/placeholder-screen.component'

export default function LineEmUpPage(): React.JSX.Element {
  return (
    <PlaceholderScreen
      name="Line 'Em Up (Haul Review)"
      links={[
        { label: '→ The Stash (after save)', href: '/stash' },
        { label: '← The Haul', href: '/snap/haul' },
      ]}
    />
  )
}
