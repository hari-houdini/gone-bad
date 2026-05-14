/**
 * @file stash/[id].tsx — Phase 0 stub for The Label (item detail).
 *
 * @remarks
 * `useLocalSearchParams` extracts `id` from the URL segment. Phase 3.11
 * replaces this with `ItemLabelScreen` from `@/features/item`.
 * URL: `/stash/:id`
 */

import { useLocalSearchParams } from 'expo-router'

import { PlaceholderScreen } from '@/features/ui/placeholder-screen.component'

export default function ItemLabelPage(): React.JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>()

  return (
    <PlaceholderScreen
      name={`The Label — ${id}`}
      links={[
        { label: '← The Stash', href: '/stash' },
      ]}
    />
  )
}
