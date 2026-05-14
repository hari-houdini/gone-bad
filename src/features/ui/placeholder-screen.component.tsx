/**
 * @file placeholder-screen.component.tsx — generic stub screen for Phase 0 routing skeleton.
 *
 * @remarks
 * Every route in the app skeleton renders this component with a `name` and an
 * optional list of `links`. The links let you tap through the entire app graph
 * during Phase 0, before any real UI is built. Phase 1+ replaces each route's
 * `PlaceholderScreen` call with the real screen component.
 *
 * Design decisions:
 * - Uses only React Native core primitives — no design-system dependency in Phase 0.
 * - `href` is typed as `Href` from expo-router so TypeScript validates all routes at
 *   the call site when `typedRoutes: true` is active.
 * - `ScrollView` prevents content from being clipped on small devices.
 */

import { Link, type Href } from 'expo-router'
import React from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * A single navigation link rendered below the screen name.
 */
export interface PlaceholderLink {
  /** Display label for the link. */
  label: string
  /** Expo-router `Href` — must be a route that exists in the app. */
  href: Href
}

/**
 * Props for {@link PlaceholderScreen}.
 */
export interface PlaceholderScreenProps {
  /** Human-readable name shown as the page heading. */
  name: string
  /**
   * Navigation links rendered as tappable rows below the heading.
   * Omit or pass an empty array when there are no onward destinations.
   */
  links?: PlaceholderLink[]
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * A named placeholder screen with optional navigation links.
 *
 * @remarks
 * Renders the screen `name` in bold and a list of tappable `links` so the
 * entire Phase 0 routing skeleton is explorable without any real UI.
 *
 * @example
 * ```tsx
 * // app/(app)/index.tsx
 * export default function DashboardScreen() {
 *   return (
 *     <PlaceholderScreen
 *       name="The Fridge Door (Dashboard)"
 *       links={[
 *         { label: "→ The Stash", href: "/stash" },
 *         { label: "→ Snap It", href: "/snap" },
 *       ]}
 *     />
 *   )
 * }
 * ```
 */
export function PlaceholderScreen({ name, links = [] }: PlaceholderScreenProps): React.JSX.Element {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{name}</Text>
      <Text style={styles.subtitle}>Phase 0 placeholder</Text>
      {links.length > 0 && (
        <View style={styles.linkList}>
          {links.map(({ label, href }) => (
            <Link key={label} href={href} style={styles.link}>
              {label}
            </Link>
          ))}
        </View>
      )}
    </ScrollView>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#687076',
    marginBottom: 16,
  },
  linkList: {
    width: '100%',
    gap: 12,
  },
  link: {
    fontSize: 15,
    color: '#0a7ea4',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E6EAED',
    borderRadius: 8,
    overflow: 'hidden',
  },
})
