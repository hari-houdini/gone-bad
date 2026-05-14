/**
 * @file settings/index.ts — public barrel for the settings feature pod.
 *
 * @remarks
 * Centralises all public exports for House Rules (Settings). The settings
 * pod is the only consumer of Phase 7 notification wiring and Phase 9
 * account management RPCs.
 *
 * ## Planned additions
 *
 * ### Screens (Phase 7)
 * - `HeadsUpScreen` — notification on/off toggle + days-before stepper.
 *
 * ### Screens (Phase 9)
 * - `SettingsScreen` — root settings screen linking to sub-sections.
 * - `AccountScreen` — auth provider badge, data export, delete account.
 *
 * ### State (Phase 7)
 * - `useSettingsStore` / `type ISettingsStore` — `notificationDaysBefore`,
 *   `locale`; persisted to expo-file-system.
 *
 * ### Hooks (Phase 9)
 * - `useSettings` — composes store + DB sync.
 */

// Phase 0 — nothing to export yet.
export {}
