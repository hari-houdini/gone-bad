# Gone Bad — Architecture & Code Standards PRD

**Version:** 1.0.0  
**Status:** Active  
**Date:** 13 May 2026  
**Governs:** All code in `/src`, `/supabase/functions`, and `/app`

---

## Table of Contents

1. [Decisions Log](#1-decisions-log)
2. [Architecture Overview](#2-architecture-overview)
3. [Repository Topology](#3-repository-topology)
4. [Pod (Modular) Structure](#4-pod-modular-structure)
5. [File Naming Convention](#5-file-naming-convention)
6. [Type Vocabulary](#6-type-vocabulary)
7. [Import Rules & Dependency Direction](#7-import-rules--dependency-direction)
8. [Colocation Rules](#8-colocation-rules)
9. [Test Conventions](#9-test-conventions)
10. [Design Pattern Implementation Reference](#10-design-pattern-implementation-reference)
11. [Anti-Patterns](#11-anti-patterns)

---

## 1. Decisions Log

All decisions in this section were explicitly confirmed and are non-negotiable unless a new ADR is created.

| ID | Decision | Rationale |
|---|---|---|
| AD-001 | Hexagonal Architecture (Ports & Adapters) | Swap any external dependency (AI provider, database, push service) without touching domain logic. Effect Layers are the native implementation mechanism. |
| AD-002 | Effect for Edge Functions + shared domain layer only | No Effect runtime on the React Native client. `src/_shared/domain/` contains pure TypeScript business logic importable by both client and Deno. |
| AD-003 | Tactical DDD — Value Objects + Domain Services | `ExpiryDate`, `Quantity`, `KitchenRole`, `InviteToken`, `ItemTags` as Value Objects. `ItemLifecycleService`, `KitchenPermissionService`, `ScanQuotaService`, `ExpiryEstimationService`, `NotificationScheduleService` as Domain Services. No Aggregates, no Domain Events in v1. |
| AD-004 | XState v5 for item lifecycle only | States: `active \| used \| wasted \| expired`. Zustand manages UI state (auth, kitchen, upload, settings). XState manages domain transition rules. They coexist — XState does not replace Zustand. |
| AD-005 | Offline seams in v1 | `CommandQueue` interface in `src/_shared/ports/`. Today's implementation is synchronous and requires network. v2 replaces the implementation with a persistent offline queue. TanStack Query persistence (`AsyncStorage`) enables offline reads. |
| AD-006 | Lightweight CQRS by convention | Commands (state-mutating functions) and Queries (read-only functions) are separated by naming and file structure. No formal command bus. `item_events` is an append-only audit log, not an event store. |
| AD-007 | Pod (Modular) file structure | All code is colocated by feature. High cohesion within pods. `src/features/<pod>/` for frontend. `supabase/functions/<function>/` for backend. |
| AD-008 | `app/` thin shells only | Expo Router files in `app/` are 3–5 line entry points that import and render screen components from `src/features/`. No logic in `app/`. |
| AD-009 | Unified naming convention across frontend + backend | `<domain>.<subtype?>.<type>.<extension>` applies in `src/features/`, `src/_shared/`, and `supabase/functions/`. |
| AD-010 | `src/_shared/` for cross-pod domain code | Value Objects, Domain Services, port interfaces, Zod schemas, typed errors, and factories live in `src/_shared/`. Underscore prefix signals infrastructure/shared, not a feature. |
| AD-011 | Lean type vocabulary (19 types) | See Section 6. No `.context`, `.config`, `.mock`, `.middleware`, `.guard`, `.mapper` suffixes. |
| AD-012 | `.spec` = Specification Pattern; `.test` = Vitest test | These are distinct. Never use `.spec.ts` for a Vitest test file. |

---

## 2. Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          REACT NATIVE CLIENT                              │
│                                                                           │
│  app/ (Expo Router thin shells)                                           │
│    ↓ renders                                                              │
│  src/features/<pod>/ (screens, components, hooks, stores, queries)       │
│    ↓ imports domain types and pure logic from                            │
│  src/_shared/domain/ (Value Objects, Domain Services — pure TypeScript)  │
│    ↓ imports type contracts from                                         │
│  src/_shared/types/ (Zod schemas, inferred TypeScript types)             │
│    ↓ calls backend via                                                   │
│  src/lib/supabase.ts (Supabase JS client, TanStack Query, Realtime)      │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │ HTTPS / Realtime
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE EDGE FUNCTIONS                           │
│                                                                           │
│  supabase/functions/<fn>/<fn>.handler.ts  ← entry point                 │
│    → middleware pipeline (auth → validate → rate-limit)                  │
│    → <fn>.service.ts  ← Effect orchestration                            │
│    → src/_shared/domain/ (same domain layer as client)                   │
│    → supabase/functions/_shared/adapters/ (Supabase, Gemini, Expo Push)  │
│    → supabase/functions/_shared/layers/ (Effect Layer compositions)      │
└──────────────────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Location | Allowed dependencies | Forbidden |
|---|---|---|---|
| Routing | `app/` | `src/features/` only | Everything else |
| Feature pods | `src/features/<pod>/` | `src/_shared/`, `src/lib/`, sibling pods via their `index.ts` | `app/`, `supabase/` |
| Shared domain | `src/_shared/domain/` | `src/_shared/types/`, `src/_shared/errors/`, `src/_shared/ports/` | Everything with runtime (Supabase, Gemini, Expo, React) |
| Shared types | `src/_shared/types/` | `zod` only | Everything else |
| Shared ports | `src/_shared/ports/` | TypeScript interfaces only | Concrete implementations |
| Client lib | `src/lib/` | `src/_shared/`, `@supabase/supabase-js`, `@tanstack/react-query` | `src/features/` |
| EF handler | `supabase/functions/<fn>/` | `supabase/functions/_shared/`, `src/_shared/` | `src/features/`, `src/lib/` |
| EF adapters | `supabase/functions/_shared/adapters/` | `src/_shared/ports/`, external SDKs | `src/features/` |

---

## 3. Repository Topology

```
gone-bad/
│
├── app/                                    # Expo Router — thin shells ONLY (AD-008)
│   ├── _layout.tsx
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx                     → renders <WelcomeScreen />
│   │   └── sign-in.tsx                     → renders <SignInScreen />
│   ├── (app)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx                       → renders <DashboardScreen />
│   │   ├── stash/
│   │   │   ├── index.tsx                   → renders <StashScreen />
│   │   │   └── [id].tsx                    → renders <ItemLabelScreen />
│   │   ├── snap/
│   │   │   ├── index.tsx                   → renders <ScanModeScreen />
│   │   │   ├── single.tsx                  → renders <SnapItScreen />
│   │   │   ├── haul.tsx                    → renders <HaulScreen />
│   │   │   ├── check-it.tsx                → renders <CheckItScreen />
│   │   │   └── line-em-up.tsx              → renders <LineEmUpScreen />
│   │   ├── bin/
│   │   │   └── index.tsx                   → renders <BinScreen />
│   │   └── rules/
│   │       ├── index.tsx                   → renders <SettingsScreen />
│   │       ├── heads-up.tsx                → renders <HeadsUpScreen />
│   │       ├── kitchen.tsx                 → renders <KitchenSettingsScreen />
│   │       └── account.tsx                 → renders <AccountScreen />
│   └── kitchen/
│       └── invite/
│           └── [token].tsx                 → renders <InviteScreen />
│
├── src/
│   ├── features/                           # Feature pods (AD-007)
│   │   ├── auth/
│   │   ├── kitchen/
│   │   ├── item/
│   │   ├── stash/
│   │   ├── scan/
│   │   ├── dashboard/
│   │   ├── bin/
│   │   └── settings/
│   │
│   ├── _shared/                            # Shared domain + contracts (AD-010)
│   │   ├── domain/
│   │   │   ├── value-objects/
│   │   │   ├── services/
│   │   │   ├── factories/
│   │   │   └── specs/
│   │   ├── ports/
│   │   ├── errors/
│   │   └── types/
│   │
│   ├── lib/                                # Client infrastructure (non-domain)
│   │   ├── supabase.ts
│   │   ├── query-client.ts
│   │   └── notifications.ts
│   │
│   └── constants/
│       ├── tags.ts
│       ├── config.ts
│       └── tokens.ts
│
├── supabase/
│   ├── functions/
│   │   ├── _shared/                        # Shared EF infrastructure
│   │   │   ├── adapters/
│   │   │   ├── middleware/
│   │   │   ├── layers/
│   │   │   └── setup.ts
│   │   ├── analyse-image/
│   │   ├── process-image/
│   │   ├── generate-fun-fact/
│   │   ├── send-notifications/
│   │   ├── rag-query/
│   │   └── handle-invite/
│   ├── migrations/
│   └── seed/
│
├── e2e/                                    # Maestro E2E tests (app-level, not colocated)
│   └── flows/
│
└── .github/workflows/
```

---

## 4. Pod (Modular) Structure

### Definition

A **pod** is a self-contained directory that groups all code for a single feature domain. A pod owns its screens, components, hooks, stores, queries, schemas, types, utilities, and tests.

### Pod Inventory

| Pod | Location | Owns | Screens it backs |
|---|---|---|---|
| `auth` | `src/features/auth/` | Auth flows, session, account deletion | `welcome`, `sign-in`, `account` |
| `kitchen` | `src/features/kitchen/` | Kitchen CRUD, members, invites, roles | `kitchen` (in rules), `invite/[token]` |
| `item` | `src/features/item/` | Item domain, XState machine, The Label | `stash/[id]` |
| `stash` | `src/features/stash/` | The Stash list view, filters, swipe actions | `stash/index` |
| `scan` | `src/features/scan/` | Camera, upload pipeline, AI calls, barcode, Check It, Line 'Em Up | `snap/*` |
| `dashboard` | `src/features/dashboard/` | The Fridge Door, fun fact, urgency grid, stats | `(app)/index` |
| `bin` | `src/features/bin/` | The Bin waste log view | `bin/index` |
| `settings` | `src/features/settings/` | House Rules, Heads Up (notification prefs) | `rules/index`, `rules/heads-up` |

### Pod Internal Structure

Each pod contains only the files it needs. There is no required file list — only what exists should be present.

**Typical frontend pod:**
```
src/features/kitchen/
  kitchen.screen.tsx              ← main screen component (stateful container)
  kitchen-settings.screen.tsx     ← secondary screen (if pod backs multiple routes)
  kitchen-members.component.tsx   ← reusable presenter component
  kitchen-invite.component.tsx    ← reusable presenter component
  kitchen.hook.ts                 ← all custom hooks for this pod
  kitchen.store.ts                ← Zustand store slice
  kitchen.query.ts                ← all TanStack Query definitions (useQuery + useMutation)
  kitchen.schema.ts               ← Zod schemas specific to this pod's UI
  kitchen.type.ts                 ← TypeScript types not needing runtime validation
  kitchen.hook.test.ts
  kitchen.query.test.ts
  kitchen.component.test.ts
  index.ts                        ← public API barrel (exports only what other pods need)
```

**Typical Edge Function pod:**
```
supabase/functions/analyse-image/
  analyse-image.handler.ts        ← Deno entry point, HTTP handler, Effect composition
  analyse-image.service.ts        ← business orchestration, calls domain + adapters
  analyse-image.schema.ts         ← Effect Schema for request/response validation
  analyse-image.handler.test.ts   ← integration tests
```

### Public API Barrel (`index.ts`)

Every pod exposes a public API via `index.ts`. Other pods and layers import ONLY from this barrel, never from internal pod files.

```typescript
// src/features/item/index.ts  — public API
export { ItemLabelScreen } from './item-label.screen'
export { ItemCard } from './item-card.component'
export { ExpiryBadge } from './item-badge.component'
export { QuantityModal } from './quantity-modal.component'
export { useItemActor } from './item.hook'
// Internal files (item.machine.ts, item.query.ts, etc.) are NOT re-exported
// unless another pod genuinely needs them
```

---

## 5. File Naming Convention

### Format

```
<domain>.<subtype?>.<type>.<extension>
```

### Rules

1. **`domain`** — kebab-case noun describing the subject. Can be compound: `kitchen-members`, `item-card`, `expiry-date`, `analyse-image`. Always matches the primary concept, not the pod name (e.g., inside `kitchen/` pod, a component for invite links is `kitchen-invite.component.tsx`, not `invite.component.tsx`).

2. **`subtype`** — optional. Used in two cases:
   - **Test files**: identifies what is being tested. `kitchen.hook.test.ts` tests `kitchen.hook.ts`. `kitchen.members.component.test.ts` tests the members component.
   - **Disambiguation**: when a pod has multiple files of the same `type`, a subtype clarifies. Example: `kitchen.members.query.ts` and `kitchen.invite.query.ts` instead of two unqualified `kitchen.query.ts` files. Prefer compound domains (`kitchen-members.query.ts`) over subtypes for source files.

3. **`type`** — exactly one value from the Type Vocabulary (Section 6). No invented types.

4. **`extension`**:
   - `.tsx` — files that contain JSX (`.screen`, `.component`, and test files that render JSX)
   - `.ts` — everything else

5. **kebab-case only** — no camelCase or PascalCase in file names.

6. **Test files** — `.test` is always the final segment before the extension: `<source-filename>.test.<ext>`.

7. **No `index` as a domain** — `index.ts` is reserved exclusively for public API barrels. Content files must have a real domain name.

### Examples

```
# Screens (stateful, colocated in feature pod)
dashboard.screen.tsx
item-label.screen.tsx
check-it.screen.tsx
line-em-up.screen.tsx
heads-up.screen.tsx
kitchen-invite.screen.tsx

# Components (pure presenters)
item-card.component.tsx
item-badge.component.tsx
kitchen-members.component.tsx
fun-fact-card.component.tsx
quantity-modal.component.tsx
barcode-overlay.component.tsx
haul-strip.component.tsx

# Hooks
auth.hook.ts
kitchen.hook.ts
item.hook.ts
scan.hook.ts
dashboard.hook.ts

# Zustand stores
auth.store.ts
kitchen.store.ts
scan.store.ts
settings.store.ts

# TanStack Query definitions
item.query.ts
kitchen.query.ts
dashboard.query.ts
stash.query.ts

# XState machines
item.machine.ts

# Zod schemas (pod-specific UI validation)
scan.schema.ts
settings.schema.ts
stash.schema.ts

# Shared type schemas (in src/_shared/types/)
item.schema.ts
kitchen.schema.ts
user.schema.ts
ai.schema.ts
edge-functions.schema.ts
notifications.schema.ts

# TypeScript types (no runtime validation needed)
item.type.ts
kitchen.type.ts
scan.type.ts

# Utilities
scan.util.ts
item.util.ts

# Constants
tags.constant.ts
config.constant.ts

# Edge Function files
analyse-image.handler.ts
analyse-image.service.ts
analyse-image.schema.ts
generate-fun-fact.handler.ts
send-notifications.service.ts

# Domain layer (in src/_shared/)
expiry-date.value-object.ts
quantity.value-object.ts
item-tags.value-object.ts
kitchen-role.value-object.ts
invite-token.value-object.ts
item-lifecycle.service.ts
kitchen-permission.service.ts
scan-quota.service.ts
expiry-estimation.service.ts
notification-schedule.service.ts
item.factory.ts
expiry.spec.ts
notification.spec.ts

# Ports (interfaces)
item.port.ts
kitchen.port.ts
ai.port.ts
push.port.ts
storage.port.ts
rag.port.ts
command-queue.port.ts

# Adapters
supabase-item.adapter.ts
supabase-kitchen.adapter.ts
gemini-ai.adapter.ts
expo-push.adapter.ts
supabase-storage.adapter.ts

# Errors
domain.error.ts

# Tests (mirror source filename + .test)
expiry-date.value-object.test.ts
item-lifecycle.service.test.ts
item.factory.test.ts
kitchen.hook.test.ts
item.machine.test.ts
item-card.component.test.tsx      ← .tsx because it renders JSX in tests
analyse-image.handler.test.ts
kitchen.query.test.ts
```

---

## 6. Type Vocabulary

The complete and exhaustive list of allowed `.<type>` values. No other types may be invented without updating this PRD.

### Frontend Types (`.tsx` unless noted)

| Type | Extension | Definition |
|---|---|---|
| `.screen` | `.tsx` | Full-screen stateful container component backed by an Expo Router route. Lives in a feature pod. Reads from TanStack Query + Zustand, triggers mutations. |
| `.component` | `.tsx` | Reusable presenter component. No Supabase calls, no Zustand reads. Takes only props. |
| `.hook` | `.ts` | Custom React hook. Encapsulates side effects, subscriptions, mutations. May read Zustand and TanStack Query. |
| `.store` | `.ts` | Zustand store slice definition. Exported as a hook (`useAuthStore`). |
| `.query` | `.ts` | TanStack Query definitions: `useQuery`, `useInfiniteQuery`, `useMutation` wrappers for one domain. Handles optimistic updates. |
| `.machine` | `.ts` | XState v5 state machine definition. Scoped to item lifecycle only (v1). |

### Shared Types (`.ts`)

| Type | Extension | Definition |
|---|---|---|
| `.schema` | `.ts` | Zod v4 schema definitions + inferred TypeScript types. Used for DB rows, insert/update shapes, form validation, and Edge Function I/O contracts. |
| `.type` | `.ts` | TypeScript types and interfaces that do not need runtime validation. Structural types, union types, mapped types. |
| `.util` | `.ts` | Pure functions with no side effects and no React or infrastructure dependencies. Testable in isolation. |
| `.constant` | `.ts` | `export const` values: static lists, magic numbers, configuration values. No functions. |

### Backend Types (`.ts`)

| Type | Extension | Definition |
|---|---|---|
| `.handler` | `.ts` | Deno Edge Function entry point. Handles HTTP request parsing, calls middleware pipeline, runs the Effect program, returns HTTP response. |
| `.service` | `.ts` | Business orchestration logic. Coordinates domain objects, calls ports (repositories, AI, push). May be used in both Edge Functions and domain layer. |
| `.adapter` | `.ts` | Concrete hexagonal adapter. Implements a port interface using a real external technology (Supabase, Gemini, Expo Push). Lives in `supabase/functions/_shared/adapters/`. |
| `.port` | `.ts` | Hexagonal port definition. TypeScript interface only — no implementation code. Lives in `src/_shared/ports/`. |
| `.error` | `.ts` | Typed error classes for Effect's error channel. Each error has a `_tag` discriminant for exhaustive matching. |

### Domain Types (`.ts`)

| Type | Extension | Definition |
|---|---|---|
| `.value-object` | `.ts` | Tactical DDD Value Object. Immutable. Defined by value not identity. Encapsulates business rules about a concept (e.g. `ExpiryDate.isExpiringSoon()`). |
| `.factory` | `.ts` | Creates domain objects from multiple possible input shapes. Centralises mapping logic (e.g. `ItemFactory.fromGeminiResponse()`, `ItemFactory.fromBarcodeResponse()`, `ItemFactory.fromManualEntry()`). |
| `.spec` | `.ts` | Specification Pattern predicate. Encapsulates a business rule as a composable boolean (`IsExpiredSpec`, `DueForNotificationSpec`). NOT a Vitest test file. |

### Test Type (`.ts` or `.tsx`)

| Type | Extension | Definition |
|---|---|---|
| `.test` | `.ts` / `.tsx` | Vitest unit, component, or integration test. Always the final segment before the file extension. Use `.tsx` if the test renders JSX directly. |

---

## 7. Import Rules & Dependency Direction

### The Rule

Dependencies flow in ONE direction. Inner layers know nothing about outer layers.

```
app/
  ↓ imports from
src/features/<pod>/
  ↓ imports from
src/_shared/          (domain, ports, types, errors)
src/lib/              (supabase.ts, query-client.ts)
  ↓ imports from
(external packages only: zod, @supabase/supabase-js, etc.)

supabase/functions/<fn>/
  ↓ imports from
supabase/functions/_shared/   (adapters, middleware, layers)
src/_shared/                  (domain, ports, types, errors)
  ↓ imports from
(external Deno packages: effect, deno std, etc.)
```

### Forbidden Imports

| From | Cannot import | Reason |
|---|---|---|
| `src/_shared/domain/` | Any React, Supabase, Gemini, Expo module | Domain must be pure TypeScript |
| `src/_shared/ports/` | Concrete adapters | Ports are interfaces only |
| `app/` | Anything except `src/features/` | app/ files must be thin shells |
| `src/features/A/` | `src/features/B/some-internal-file.ts` | Use B's `index.ts` public API |
| `supabase/functions/<fn>/` | `src/features/` | Edge Functions don't know about the UI |
| `src/lib/supabase.ts` | `src/features/` | Library cannot depend on features |

### Cross-Pod Imports

When pod A needs something from pod B, it imports from pod B's `index.ts`:

```typescript
// ✅ Correct
import { ItemCard } from '@/features/item'

// ❌ Wrong — bypasses pod's public API
import { ItemCard } from '@/features/item/item-card.component'
```

### Path Aliases (tsconfig.json)

```json
{
  "paths": {
    "@/features/*": ["src/features/*"],
    "@/shared/*":   ["src/_shared/*"],
    "@/lib/*":      ["src/lib/*"],
    "@/constants/*":["src/constants/*"]
  }
}
```

---

## 8. Colocation Rules

### What lives in a pod

| Artefact | Lives in |
|---|---|
| Screen for a feature | `src/features/<pod>/` |
| Component used only by one pod | `src/features/<pod>/` |
| Component used by 2+ pods | `src/features/<pod>/index.ts` exports it; other pods import via barrel. If it truly belongs to no pod, consider `src/features/ui/` primitive pod. |
| Hook used only by one pod | `src/features/<pod>/` |
| Zustand store | `src/features/<pod>/` — one store slice per pod (auth, kitchen, scan, settings) |
| TanStack Query definitions | `src/features/<pod>/` |
| Zod schema for a pod's own forms | `src/features/<pod>/` |
| Zod schema used across pods or by Edge Functions | `src/_shared/types/` |
| TypeScript types for a pod | `src/features/<pod>/` |
| Business rule (e.g. "depleted quantity = mark used") | `src/_shared/domain/services/` |
| Value Object | `src/_shared/domain/value-objects/` |
| Factory | `src/_shared/domain/factories/` |
| Specification | `src/_shared/domain/specs/` |
| Port interface | `src/_shared/ports/` |
| Adapter implementation | `supabase/functions/_shared/adapters/` |
| Effect Layer composition | `supabase/functions/_shared/layers/` |
| Effect middleware | `supabase/functions/_shared/middleware/` |
| E2E tests (Maestro) | `e2e/flows/` — NOT colocated (app-level flows) |
| Unit/component/integration tests | Colocated in same pod as subject |

### Expo Router thin shells

Every file in `app/` follows this template:

```typescript
// app/(app)/stash/index.tsx
import { StashScreen } from '@/features/stash'
export default StashScreen
```

No imports from `src/lib/`, no Zustand, no TanStack Query in `app/` files. If a screen needs props from the route (e.g. `[id]`), pass only the route param:

```typescript
// app/(app)/stash/[id].tsx
import { ItemLabelScreen } from '@/features/item'
import { useLocalSearchParams } from 'expo-router'

export default function ItemRoute() {
  const { id } = useLocalSearchParams<{ id: string }>()
  return <ItemLabelScreen itemId={id} />
}
```

---

## 9. Test Conventions

### File location

Tests are colocated with the source file they test. A test file mirrors its source filename with `.test` inserted before the extension.

```
src/features/kitchen/kitchen.hook.ts
src/features/kitchen/kitchen.hook.test.ts     ← same directory

src/_shared/domain/value-objects/expiry-date.value-object.ts
src/_shared/domain/value-objects/expiry-date.value-object.test.ts

supabase/functions/analyse-image/analyse-image.handler.ts
supabase/functions/analyse-image/analyse-image.handler.test.ts
```

### Test tooling

| Test type | Tool | Location |
|---|---|---|
| Unit (pure functions, Value Objects, domain services) | Vitest | Colocated |
| Component (React Native components) | React Native Testing Library + Vitest | Colocated, `.test.tsx` |
| Integration (Edge Functions, RLS, RPC) | Vitest + Supabase CLI (local) | Colocated in Edge Function pod |
| E2E | Maestro | `e2e/flows/*.yaml` |
| AI pipeline (mocked Gemini responses) | Vitest + in-memory AI adapter | Colocated in `analyse-image/` |

### Test naming

Test files use `.test.ts` (or `.test.tsx` if JSX is rendered inside the test). Never `.spec.ts` — that suffix belongs to the Specification Pattern (Section 6).

### Coverage targets (from TDD)

| Type | Target |
|---|---|
| Unit | 80% |
| Component | 70% |
| Integration | 60% |
| E2E | All key user flows (9 defined in TDD §17.3) |

### In-memory adapters for tests

The hexagonal port interfaces in `src/_shared/ports/` have corresponding in-memory test implementations. These live in `src/_shared/ports/<name>.port.test-impl.ts` and are used in unit tests to avoid real DB/AI calls.

---

## 10. Design Pattern Implementation Reference

Quick lookup: where each confirmed pattern lives in the file structure.

| Pattern | Location | Key files |
|---|---|---|
| Hexagonal ports | `src/_shared/ports/` | `item.port.ts`, `ai.port.ts`, `push.port.ts`, etc. |
| Hexagonal adapters | `supabase/functions/_shared/adapters/` | `supabase-item.adapter.ts`, `gemini-ai.adapter.ts`, etc. |
| Effect Layers (DI) | `supabase/functions/_shared/layers/` | `supabase.layer.ts`, `ai.layer.ts` |
| Typed errors | `src/_shared/errors/domain.error.ts` | `NotFoundError`, `PermissionError`, `RateLimitError`, `AIError`, `ModerationError`, `StorageError`, `PushDeliveryError`, `InviteError` |
| Value Objects | `src/_shared/domain/value-objects/` | `expiry-date.value-object.ts`, `quantity.value-object.ts`, `kitchen-role.value-object.ts`, `invite-token.value-object.ts`, `item-tags.value-object.ts` |
| Domain Services | `src/_shared/domain/services/` | `item-lifecycle.service.ts`, `kitchen-permission.service.ts`, `scan-quota.service.ts`, `expiry-estimation.service.ts`, `notification-schedule.service.ts` |
| Factory Pattern | `src/_shared/domain/factories/item.factory.ts` | `fromGeminiResponse()`, `fromBarcodeResponse()`, `fromManualEntry()` |
| Specification Pattern | `src/_shared/domain/specs/` | `expiry.spec.ts` (IsExpired, IsExpiringSoon, IsFresh), `notification.spec.ts` (DueForNotification) |
| XState item machine | `src/features/item/item.machine.ts` | States: active, used, wasted, expired |
| Strategy (AI provider) | Port: `src/_shared/ports/ai.port.ts` / Adapter: `supabase/functions/_shared/adapters/gemini-ai.adapter.ts` | Swap adapter to change AI provider |
| Repository Pattern | Port in `src/_shared/ports/`, Adapter in `supabase/functions/_shared/adapters/` | One per entity |
| Middleware pipeline | `supabase/functions/_shared/middleware/` | `auth.middleware.ts`, `validation.middleware.ts`, `rate-limit.middleware.ts` |
| Effect Stream | Inside `supabase/functions/analyse-image/analyse-image.service.ts` | Haul 5-concurrent processing |
| Effect Scope/Resource | `src/features/scan/scan.hook.ts` | Temp file lifecycle |
| Template Method (notifications) | `supabase/functions/send-notifications/send-notifications.service.ts` | Notification pipeline |
| Guard Pattern | `src/_shared/domain/services/kitchen-permission.service.ts` + Supabase RLS | Two-layer defence |
| Optimistic updates | `src/features/item/item.query.ts`, `src/features/stash/stash.query.ts` | onMutate + onError + onSettled |
| CommandQueue seam | `src/_shared/ports/command-queue.port.ts` | Synchronous today; offline queue in v2 |
| TanStack Query persistence | `src/lib/query-client.ts` | AsyncStorage persister for offline reads |
| Observer / Realtime | `src/features/kitchen/kitchen.hook.ts` (useKitchenRealtime) | Channel subscribe + invalidate on event |
| Singleton (Supabase client) | `src/lib/supabase.ts` | One instance only |
| Facade (client API layer) | `src/lib/supabase.ts` | Auth injection, error normalisation |
| Compound Components | `src/features/item/quantity-modal.component.tsx` | Root + ModeSelector + Input + Confirm |
| Container / Presenter | Screen files (containers) vs. `*.component.tsx` files (presenters) | Screens read state; components take props |
| Infinite scroll | `src/features/stash/stash.query.ts`, `src/features/bin/bin.query.ts` | useInfiniteQuery |
| Retry (exponential backoff) | `supabase/functions/_shared/adapters/gemini-ai.adapter.ts` | Effect Schedule |
| CQRS (by convention) | Command functions in `*.service.ts`, Query functions in `*.query.ts` | Naming discipline |
| Unit of Work | `supabase/migrations/` RPC functions | `mark_item_used`, `mark_item_wasted`, `join_kitchen_via_invite` |
| Caching Proxy (RAG) | `supabase/functions/rag-query/rag-query.service.ts` | In-process Map cache, 1-hour TTL |

---

## 11. Anti-Patterns

The following are explicitly prohibited. A code review must reject any PR that introduces them.

### Structural anti-patterns

| Anti-pattern | Why | Correct approach |
|---|---|---|
| Logic in `app/` route files | `app/` must be thin shells. Logic here breaks pod colocation and creates a hidden second location for feature code. | Move all logic to `src/features/<pod>/`. Route file is max 5 lines. |
| Direct import of pod internals from another pod | `import { ItemCard } from '@/features/item/item-card.component'` | Use the pod's barrel: `import { ItemCard } from '@/features/item'` |
| Supabase client in a component file | Violates Container/Presenter split. Components become untestable. | Move to a hook, then use the hook in the screen. |
| Zustand store in a `.component.tsx` file | Same as above. | Read Zustand in the parent screen or hook, pass as props. |
| Runtime code in `.port.ts` files | Ports are contracts (interfaces), not implementations. | Move any implementation to an `.adapter.ts` file. |
| Business rules in a `.query.ts` file | TanStack Query is transport plumbing. Business rules belong in domain services. | Call `ItemLifecycleService` from the mutation function; don't inline the logic in `useMutation`. |
| Business rules in a `.handler.ts` file | The handler is an HTTP adapter. It should only parse, call the service, and respond. | Move orchestration to `<fn>.service.ts`. |
| New Zustand store outside `src/features/` | Stores are scoped to a pod. | Add to the relevant pod's `.store.ts`. |
| Inventing a new `.<type>` not in the vocabulary | Breaks naming consistency. | Pick the closest existing type or open a PR to update this PRD first. |
| `.spec.ts` for a Vitest test file | `.spec` means Specification Pattern. | Use `.test.ts` for all Vitest tests. |
| `index.ts` used for implementation code | `index.ts` is a barrel only. | Give the file a real domain name. |

### Architectural anti-patterns

| Anti-pattern | Why | Correct approach |
|---|---|---|
| Importing Supabase JS client in `src/_shared/domain/` | Domain layer must be pure TypeScript with no infrastructure deps. | Domain layer calls port interfaces. Adapters (in `_shared/adapters/`) call the Supabase client. |
| Importing React in a `.value-object.ts` | Value Objects are shared between React Native and Deno. React imports break Deno compatibility. | Zero runtime dependencies in `src/_shared/domain/`. |
| Calling the Gemini API directly in a handler | Bypasses the `AIService` port. Makes the AI provider impossible to swap. | Call `AIService` (the port). The `GeminiAIAdapter` calls the Gemini SDK. |
| Writing to `items` table directly from the client | Bypasses Edge Function auth, rate limiting, and domain logic. | All writes go through Edge Functions or Supabase RPC with RLS. |
| Catching Effect errors in a `try/catch` | Destroys the typed error channel. | Use Effect's `Effect.catchTag`, `Effect.catchAll`, or `Effect.match`. |
| Storing secret keys in client code | Fatal security issue. | All secrets (Gemini key, service role key) stay in Supabase Vault. Client only has the anon key. |
| Full Event Sourcing on `item_events` | Adds complexity with no v1 benefit. `item_events` is an audit log, not the source of truth. | `items.status` is current state. `item_events` is the audit trail. Keep both. |
| XState for auth or upload state | XState is scoped to item lifecycle only. Auth and upload state belong in Zustand. | Use the designated store (`authStore`, `uploadStore`) for non-item state. |

---

*Gone Bad — Architecture & Code Standards PRD v1.0.0*  
*Date: 13 May 2026*  
*Next review: before first feature branch is opened*
