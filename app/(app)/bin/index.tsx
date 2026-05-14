/**
 * @file bin/index.tsx — Phase 0 stub for The Bin (waste history).
 *
 * @remarks
 * Phase 8.3 replaces this with `BinScreen` from `@/features/bin`.
 * URL: `/bin`
 */

import { PlaceholderScreen } from '@/features/ui/placeholder-screen.component'

export default function BinPage(): React.JSX.Element {
  return (
    <PlaceholderScreen
      name="The Bin (Waste History)"
      links={[
        { label: '← Dashboard', href: '/' },
      ]}
    />
  )
}
