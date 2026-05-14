/**
 * @file snap/index.tsx — Phase 0 stub for the Snap entry screen.
 *
 * @remarks
 * Phase 4.9 replaces this with `SnapItScreen` from `@/features/scan`.
 * URL: `/snap`
 */

import { PlaceholderScreen } from '@/features/ui/placeholder-screen.component'

export default function SnapPage(): React.JSX.Element {
  return (
    <PlaceholderScreen
      name="Snap It"
      links={[
        { label: '→ Single Scan', href: '/snap/single' },
        { label: '→ The Haul (bulk)', href: '/snap/haul' },
        { label: '→ Check It (manual)', href: '/snap/check-it' },
      ]}
    />
  )
}
