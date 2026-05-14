/**
 * @file snap/check-it.tsx — Phase 0 stub for the Check It review form.
 *
 * @remarks
 * Phase 3.6 replaces this with `CheckItScreen` from `@/features/scan`.
 * Reached from both single scan (post-AI analysis) and manual entry.
 * URL: `/snap/check-it`
 */

import { PlaceholderScreen } from '@/features/ui/placeholder-screen.component'

export default function CheckItPage(): React.JSX.Element {
  return (
    <PlaceholderScreen
      name="Check It (Review Form)"
      links={[
        { label: '→ The Stash (after save)', href: '/stash' },
        { label: '← Snap It', href: '/snap' },
      ]}
    />
  )
}
