/**
 * @file snap/single.tsx — Phase 0 stub for single-item scan mode.
 *
 * @remarks
 * Phase 4.9 integrates this into `SnapItScreen` (same camera component,
 * different flow selector). URL: `/snap/single`
 */

import { PlaceholderScreen } from '@/features/ui/placeholder-screen.component'

export default function SnapSinglePage(): React.JSX.Element {
  return (
    <PlaceholderScreen
      name="Snap It — Single Scan"
      links={[
        { label: '→ Check It', href: '/snap/check-it' },
        { label: '← Snap', href: '/snap' },
      ]}
    />
  )
}
