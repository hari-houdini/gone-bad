/**
 * @file stash/index.tsx — Phase 0 stub for The Stash (item list).
 *
 * @remarks
 * Phase 3.9 replaces this with `StashScreen` from `@/features/stash`.
 * URL: `/stash`
 */

import { PlaceholderScreen } from '@/features/ui/placeholder-screen.component'

export default function StashPage(): React.JSX.Element {
  return (
    <PlaceholderScreen
      name="The Stash"
      links={[
        { label: '→ Item Label (example)', href: '/stash/example-id' },
        { label: '→ Snap It', href: '/snap' },
        { label: '← Dashboard', href: '/' },
      ]}
    />
  )
}
