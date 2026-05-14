/**
 * @file snap/haul.tsx — Phase 0 stub for The Haul (bulk scan mode).
 *
 * @remarks
 * Phase 5.4 replaces this with `HaulScreen` from `@/features/scan`.
 * URL: `/snap/haul`
 */

import { PlaceholderScreen } from '@/features/ui/placeholder-screen.component'

export default function HaulPage(): React.JSX.Element {
  return (
    <PlaceholderScreen
      name="The Haul (Bulk Scan)"
      links={[
        { label: '→ Line \'Em Up', href: '/snap/line-em-up' },
        { label: '← Snap', href: '/snap' },
      ]}
    />
  )
}
