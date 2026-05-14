/**
 * @file auth/index.ts — public barrel for the auth feature pod.
 *
 * @remarks
 * Centralises all public exports for authentication. `app/` screens and
 * other pods always import from `@/features/auth`, never from internal paths.
 *
 * ## Planned additions (Phase 1)
 *
 * ### Screens
 * - `WelcomeScreen` — Phase 1.6: anonymous + OAuth entry.
 * - `SignInScreen` — Phase 1.7: Google + Apple OAuth buttons.
 *
 * ### State
 * - `useAuth` — Phase 1.5: hook wrapping the auth Zustand store.
 * - `type AuthSession` — Phase 1.3: `{ userId, authUid, isAnonymous, ... }`.
 * - `type IAuthStore` — Phase 1.4: interface for `auth.store.ts`.
 *
 * ### Services (Phase 9)
 * - `AuthService` — `deleteAccount`, `exportUserData`, `upgradeFromAnon`.
 * - `type IAuthService`
 */

// Phase 0 — nothing to export yet.
export {}
