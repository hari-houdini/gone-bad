/**
 * @file notifications.ts — push notification helpers (Phase 0 stub).
 *
 * @remarks
 * All functions in this file are no-ops. They exist so `app/_layout.tsx` can
 * import and call them without the build breaking in Phase 0, before
 * `expo-notifications` is installed and the real implementation lands.
 *
 * **Phase 7 replaces this entire file.** The function signatures here are
 * intentionally identical to what Phase 7 will implement, so no call site
 * changes are needed when the real code arrives.
 *
 * Phase 7 full implementation covers:
 * - `requestPermissions()` — shows the OS permission dialog.
 * - `registerPushToken(userId)` — upserts the Expo push token into `push_tokens`.
 * - `registerNotificationCategories()` — registers the `EXPIRY_ALERT` category
 *   with MARK_USED and MARK_WASTED quick-action buttons.
 * - `setupNotificationListeners(onResponse)` — wires the background response
 *   handler that processes quick-action taps without opening the app.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Handler called when the user interacts with a notification
 * (taps it or presses a quick-action button).
 *
 * Phase 7 will narrow this to `import('expo-notifications').NotificationResponse`.
 */
export type NotificationResponseHandler = (response: unknown) => void

// ---------------------------------------------------------------------------
// Stubs
// ---------------------------------------------------------------------------

/**
 * Requests push notification permission from the OS.
 *
 * @returns `false` in Phase 0 (stub). Phase 7 returns the real permission result.
 */
export async function requestPermissions(): Promise<boolean> {
  return false
}

/**
 * Upserts the device's Expo push token into the `push_tokens` table.
 *
 * @param _userId - The authenticated user's UUID.
 * @remarks Phase 0 no-op. Phase 7 calls `Notifications.getExpoPushTokenAsync()`
 *   and upserts the result via the Supabase client.
 */
export async function registerPushToken(_userId: string): Promise<void> {}

/**
 * Registers the `EXPIRY_ALERT` notification category with quick-action buttons.
 *
 * @remarks Phase 0 no-op. Phase 7 calls
 *   `Notifications.setNotificationCategoryAsync('EXPIRY_ALERT', [...])`.
 */
export function registerNotificationCategories(): void {}

/**
 * Attaches the background notification response listener to the app.
 *
 * @param onResponse - Optional handler invoked when the user interacts with a
 *   notification. Phase 7 uses this to dispatch `MARK_USED` / `MARK_WASTED`
 *   RPCs without requiring the app to fully open.
 * @returns A cleanup function that removes the listener; call it in a
 *   `useEffect` return to avoid memory leaks.
 *
 * @example
 * ```tsx
 * // app/_layout.tsx
 * useEffect(() => {
 *   const cleanup = setupNotificationListeners()
 *   return cleanup
 * }, [])
 * ```
 */
export function setupNotificationListeners(
  _onResponse?: NotificationResponseHandler,
): () => void {
  return () => {}
}
