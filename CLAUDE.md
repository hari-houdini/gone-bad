# Gone Bad — Design Patterns: In-Depth Analysis

This document is the authoritative reference for all coding conventions in the
Gone Bad project. Every pattern here emerged from an explicit decision; none is
arbitrary. Read the **Why** sections before changing anything — the reasons
matter as much as the rules.

---

## Table of Contents

1. [Project Structure & Mental Model](#1-project-structure--mental-model)
2. [File Naming Conventions](#2-file-naming-conventions)
3. [TypeScript Conventions](#3-typescript-conventions)
4. [C# Interface Naming Convention](#4-c-interface-naming-convention)
5. [JSDoc Documentation Standard](#5-jsdoc-documentation-standard)
6. [Zod Schema-First Design](#6-zod-schema-first-design)
7. [Domain-Driven Design Layer](#7-domain-driven-design-layer)
8. [Typed Domain Errors](#8-typed-domain-errors)
9. [Pod Barrel Pattern](#9-pod-barrel-pattern)
10. [TanStack Query Patterns](#10-tanstack-query-patterns)
11. [Supabase Patterns](#11-supabase-patterns)
12. [Expo Router Patterns](#12-expo-router-patterns)
13. [React Native Component Patterns](#13-react-native-component-patterns)
14. [Testing Patterns](#14-testing-patterns)
15. [Vitest Configuration Contract](#15-vitest-configuration-contract)
16. [State Management Patterns](#16-state-management-patterns)
17. [Edge Function Patterns](#17-edge-function-patterns)
18. [Phase-Driven Development](#18-phase-driven-development)
19. [Comments Philosophy](#19-comments-philosophy)
20. [Anti-Patterns: Never Do These](#20-anti-patterns-never-do-these)

---

## 1. Project Structure & Mental Model

```
gone-bad/
├── app/                        # Expo Router file-based routing (thin shells only)
│   ├── _layout.tsx             # Root: providers + notification listener
│   ├── (app)/                  # Authenticated tab navigator
│   │   ├── _layout.tsx         # 5-tab Tabs navigator
│   │   ├── index.tsx           # Dashboard tab
│   │   ├── stash/              # Each multi-screen tab has _layout.tsx + screens
│   │   ├── snap/
│   │   ├── bin/
│   │   └── rules/
│   ├── (auth)/                 # Auth flow (URL-transparent group)
│   └── kitchen/invite/[token]  # Invite deep-link modal
│
├── src/
│   ├── _shared/                # Cross-pod shared code (no feature dependencies)
│   │   ├── types/              # Zod schemas + inferred types (13 tables, 6 EF contracts)
│   │   ├── errors/             # Typed domain errors
│   │   └── domain/             # DDD layer: value-objects, specs, services, factories
│   │
│   ├── features/               # Feature pods (vertical slices)
│   │   ├── auth/
│   │   ├── kitchen/
│   │   ├── item/
│   │   ├── stash/
│   │   ├── scan/
│   │   ├── dashboard/
│   │   ├── bin/
│   │   ├── settings/
│   │   └── ui/                 # Shared RN components (no feature dep cycle)
│   │
│   ├── lib/                    # Singleton infrastructure (Supabase, QueryClient, notifications)
│   ├── constants/              # Pure constants (config, tags, tokens, theme)
│   └── test/                   # Vitest setup, mocks, utilities
│
└── supabase/
    ├── migrations/             # Incremental SQL migrations
    ├── functions/              # Deno Edge Functions
    └── seed/                   # RAG seed data + embedding script
```

### The Three-Layer Rule

Code flows in ONE direction only:

```
app/          →  features/  →  _shared/
(thin shells)    (pods)         (domain + types)
```

- `app/` screens import from `@/features/<pod>` barrels, never from internal pod paths.
- Feature pods import from `@/_shared/` and `@/lib/`, never from other pods except `@/features/ui`.
- `_shared/` has zero feature dependencies. If a file in `_shared/` needs to import from a feature pod, the abstraction boundary is wrong — move the code.

---

## 2. File Naming Conventions

Every source file has a **semantic suffix** that declares its role. Never use generic names like `utils.ts` or `helpers.ts`.

| Suffix | Role | Example |
|--------|------|---------|
| `.schema.ts` | Zod schemas + inferred types | `item.schema.ts` |
| `.type.ts` | Feature-local TypeScript types (no Zod) | `item.type.ts` |
| `.error.ts` | Domain error classes | `domain.error.ts` |
| `.value-object.ts` | DDD value object implementation | `expiry-date.value-object.ts` |
| `.value-object.interface.ts` | Colocated value object interface | `expiry-date.value-object.interface.ts` |
| `.spec.ts` | DDD specification implementation | `expiry.spec.ts` |
| `.spec.interface.ts` | Colocated specification interface | `expiry.spec.interface.ts` |
| `.service.ts` | Domain service implementation | `item-lifecycle.service.ts` |
| `.service.interface.ts` | Colocated service interface | `item-lifecycle.service.interface.ts` |
| `.factory.ts` | Domain factory implementation | `item.factory.ts` |
| `.factory.interface.ts` | Colocated factory interface | `item.factory.interface.ts` |
| `.query.ts` | TanStack Query hooks | `item.query.ts` |
| `.store.ts` | Zustand store | `auth.store.ts` |
| `.hook.ts` | Custom React hook | `auth.hook.ts` |
| `.screen.tsx` | Full-page screen component | `check-it.screen.tsx` |
| `.component.tsx` | Reusable UI component | `stash-item-card.component.tsx` |
| `.mock.ts` | Test mock (lives in `src/test/mocks/`) | `react-native.mock.ts` |
| `.test.ts` | Unit test file (colocated) | `expiry-date.value-object.test.ts` |
| `.test.tsx` | Component test file (colocated) | `auth.screen.test.tsx` |

**Casing rules:**
- All file names: `kebab-case`
- Class names: `PascalCase`
- Interface names: `IPascalCase` (C# convention — see §4)
- Constants: `SCREAMING_SNAKE_CASE` for module-level primitives; `camelCase` for objects
- Zod schemas: `PascalCaseSchema` (e.g. `ItemRowSchema`)
- Inferred types: `PascalCase` (e.g. `type ItemRow = z.infer<typeof ItemRowSchema>`)

---

## 3. TypeScript Conventions

### 3.1 `as const` on Every Constant Object

```typescript
// CORRECT — literal types inferred; SpacingToken = 'xs' | 'sm' | 'md' | ...
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const
export type SpacingToken = keyof typeof spacing

// WRONG — type becomes { xs: number; sm: number; ... }
export const spacing = { xs: 4, sm: 8, md: 16 }
```

### 3.2 Discriminated Unions via `_tag`

All domain error classes and result union types use a `readonly _tag` string-literal discriminant. **Never use `instanceof` checks** — tags survive serialisation, module-instance boundaries, and dynamic `require()`.

```typescript
// CORRECT — tag-based discrimination
function handle(err: DomainError) {
  switch (err._tag) {
    case 'NotFoundError':   return `${err.resource} not found`
    case 'PermissionError': return `needs role ${err.requiredRole}`
    case 'RateLimitError':  return `retry after ${err.resetAt}`
  }
}

// WRONG — instanceof breaks across module boundaries
if (err instanceof NotFoundError) { ... }
```

### 3.3 Zod-Inferred Types Only — No Manual Duplication

Types must be derived from Zod schemas, never written by hand in parallel. Duplicate type definitions create silent drift.

```typescript
// CORRECT — single source of truth
export const ItemRowSchema = z.object({ id: z.uuid(), name: z.string(), ... })
export type ItemRow = z.infer<typeof ItemRowSchema>

// WRONG — manual copy that will drift
export type ItemRow = { id: string; name: string; ... }
```

### 3.4 `Insert: never` for Server-Managed Tables

Tables written exclusively by Edge Functions or RPCs get `Insert: never` in `database.types.ts`. The TypeScript compiler then rejects any accidental direct client write at compile time — defence-in-depth alongside RLS.

```typescript
scan_rate_limits: {
  Row: ScanRateLimitRow
  Insert: never   // written by increment_scan_count() RPC only
  Update: never
}
```

### 3.5 Strict `null` Handling

Never use `!` non-null assertions in production code. Use optional chaining (`?.`), nullish coalescing (`??`), or explicit guards. The only permitted use of `!` is in Vitest test files asserting a value that a preceding assertion has confirmed.

### 3.6 Type Imports

Prefer `import type` for anything only needed at compile time. This prevents accidental runtime imports of type-only modules.

```typescript
import type { ItemRow, ItemInsert } from '@/shared/types'
import { supabase } from '@/lib/supabase'
```

### 3.7 No `any`

`any` is permanently banned. Use `unknown` for values whose type is genuinely unknown, then narrow with a type guard or Zod parse. The only exception is the `href as Href` cast in Phase 0 stub screens where expo-router's typed-routes cache is not yet generated.

---

## 4. C# Interface Naming Convention

**Every domain class has a colocated `IClassName` interface file.** This is a first-class architectural rule, not optional style.

### 4.1 File Pairing Rule

```
expiry-date.value-object.ts           ← class ExpiryDate implements IExpiryDate
expiry-date.value-object.interface.ts ← interface IExpiryDate
```

The interface file lives in the **same directory** as its implementation. Never put interfaces in a separate `interfaces/` directory.

### 4.2 What Goes in the Interface

The interface describes the **instance API only** — properties and methods that consumers call.

Static factory methods (`fromISOString`, `create`, `fromGeminiResponse`) are construction concerns and stay on the class, not the interface.

```typescript
// interface file — instance shape only
export interface IExpiryDate {
  readonly isoString: string
  daysUntilExpiry(referenceDate?: Date): number
  isExpired(referenceDate?: Date): boolean
  isExpiringSoon(daysBefore?: number, referenceDate?: Date): boolean
  equals(other: IExpiryDate): boolean
  toString(): string
}

// implementation file
export class ExpiryDate implements IExpiryDate {
  private constructor(private readonly _value: string) {}
  static fromISOString(value: string): ExpiryDate { ... }  // factory — not on interface
  daysUntilExpiry(referenceDate = new Date()): number { ... }
  // ...
}
```

### 4.3 Services Must Use Instance Methods

Services are classes with instance methods, not modules with static methods. This makes them injectable and mockable via the interface.

```typescript
// CORRECT
export class ItemLifecycleService implements IItemLifecycleService {
  markUsed(item: ItemRow, action: QuantityAction, now?: Date): LifecycleResult { ... }
  markWasted(item: ItemRow, action: QuantityAction, now?: Date): LifecycleResult { ... }
}
const svc = new ItemLifecycleService()
svc.markUsed(item, action)

// WRONG — static methods cannot be injected
export class ItemLifecycleService {
  static markUsed(item: ItemRow, action: QuantityAction): LifecycleResult { ... }
}
```

### 4.4 Types Owned by the Interface File

Types that are part of the service/factory contract (not the implementation) live in the interface file and are re-exported from the implementation file.

```typescript
// item-lifecycle.service.interface.ts
export interface LifecycleResult {      ← owned by the contract
  itemUpdate: ItemUpdate
  eventInsert: ItemEventInsert
}
export interface IItemLifecycleService { ... }

// item-lifecycle.service.ts
export type { LifecycleResult } from './item-lifecycle.service.interface'  ← re-export
export class ItemLifecycleService implements IItemLifecycleService { ... }
```

### 4.5 Barrel Re-Export Rule for Interface Pairs

When a barrel (`index.ts`) exports a class, it must also export the interface:

```typescript
// features/item/index.ts
export { ItemLifecycleService } from './item-lifecycle.service'
export type { IItemLifecycleService, LifecycleResult } from './item-lifecycle.service.interface'
```

---

## 5. JSDoc Documentation Standard

### 5.1 File-Level `@file` Tag — Required on Every Source File

Every `.ts` and `.tsx` file begins with a `@file` JSDoc block. The `@remarks` section explains design decisions, constraints, or non-obvious behaviour. Phase annotations say which phase replaces or extends this file.

```typescript
/**
 * @file notifications.ts — push notification helpers (Phase 0 stub).
 *
 * @remarks
 * All functions in this file are no-ops. They exist so `app/_layout.tsx` can
 * import and call them without the build breaking in Phase 0.
 *
 * **Phase 7 replaces this entire file.** The function signatures here are
 * intentionally identical to what Phase 7 will implement.
 */
```

### 5.2 Section Separators

Logical sections within a file are separated by a banner comment:

```typescript
// ---------------------------------------------------------------------------
// Value Objects
// ---------------------------------------------------------------------------
```

Use exactly 75 dashes (`-`). Never vary the length.

### 5.3 Class and Interface JSDoc

Classes and interfaces get a JSDoc comment explaining the concept, not the implementation. The comment answers "what is this?" and "why does it exist?", not "how does it work?".

```typescript
/**
 * Immutable value object representing a food item's expiry date.
 *
 * @remarks
 * Construct via {@link ExpiryDate.fromISOString} rather than `new ExpiryDate()`.
 * Use-by semantics: an item expiring today (`daysUntilExpiry() === 0`) is NOT
 * considered expired — it is still safe to use on that calendar day.
 */
export class ExpiryDate implements IExpiryDate { ... }
```

### 5.4 Method JSDoc

Every public method gets:
- One-sentence summary (what it returns or does)
- `@param` for each non-obvious parameter
- `@returns` when the return type isn't self-explanatory
- `@throws` when the method throws documented errors
- `@example` for factory methods or complex signatures
- `@remarks` for business rules, invariants, or caveats

```typescript
/**
 * Constructs an {@link ExpiryDate} from an ISO 8601 calendar date string.
 *
 * @param value - A date string in `YYYY-MM-DD` format.
 * @returns A new {@link ExpiryDate} instance.
 * @throws {Error} When `value` is not a valid `YYYY-MM-DD` string.
 *
 * @example
 * ```ts
 * const expiry = ExpiryDate.fromISOString('2025-12-31')
 * ```
 */
static fromISOString(value: string): ExpiryDate { ... }
```

### 5.5 Property JSDoc

Single-line `/** ... */` for properties. Use `@remarks` when a constraint needs explaining.

```typescript
/** The underlying `YYYY-MM-DD` string. */
readonly isoString: string

/**
 * Free-text unit string, e.g. `'g'`, `'ml'`, `'kg'`, `'slices'`.
 *
 * @remarks Nullable because barcode-scanned items may not have a known unit.
 */
quantity_unit: z.string().max(20).nullable()
```

### 5.6 `@see` Cross-References

Use `{@link ClassName}` for intra-project references and `{@link https://...}` for external docs.

```typescript
/**
 * @see {@link https://tanstack.com/query/v5/docs/react/plugins/persistQueryClient}
 * @see {@link asyncStoragePersister}
 */
```

---

## 6. Zod Schema-First Design

### 6.1 Schema File Structure

Each schema file (`*.schema.ts`) follows a strict top-to-bottom order:
1. Enum schemas → inferred enum types
2. Row schemas (SELECT shape)
3. Insert schemas (INSERT argument shape — security-sensitive fields omitted)
4. Update schemas (UPDATE argument shape — `partial()` of Insert)
5. Inferred type exports

```typescript
// CORRECT order
export const ItemStatusSchema = z.enum(['active', 'used', 'wasted', 'expired'])
export type ItemStatus = z.infer<typeof ItemStatusSchema>

export const ItemRowSchema = z.object({ ... })
export type ItemRow = z.infer<typeof ItemRowSchema>

export const ItemInsertSchema = ItemRowSchema.omit({
  id: true, created_at: true, updated_at: true,
  image_url: true,           // set by process-image EF only
  image_thumbnail_url: true,
}).partial({ ai_confidence: true, ... })
export type ItemInsert = z.infer<typeof ItemInsertSchema>

export const ItemUpdateSchema = ItemInsertSchema.partial()
export type ItemUpdate = z.infer<typeof ItemUpdateSchema>
```

### 6.2 Security-Sensitive Omissions

Insert schemas deliberately omit fields that must only be written by server-side code. Documenting these omissions inline is mandatory — future engineers must know why the field is absent.

```typescript
export const ItemInsertSchema = ItemRowSchema.omit({
  // Server-managed — never accept from client:
  image_url: true,          // written by process-image EF after resize
  image_thumbnail_url: true,
  ai_confidence: true,      // set by analyse-image EF, not user input
  status: true,             // derived from lifecycle events
})
```

### 6.3 Edge Function Contracts

Each Edge Function has a `*.schema.ts` file that defines its request and response schemas. These schemas are shared between the Deno EF and the React Native client — no type drift possible.

```typescript
// edge-functions.schema.ts (shared between client and EF)
export const AnalyseImageRequestSchema = z.object({ ... })
export type AnalyseImageRequest = z.infer<typeof AnalyseImageRequestSchema>

export const AnalyseImageResponseSchema = z.discriminatedUnion('pass', [ ... ])
export type AnalyseImageResponse = z.infer<typeof AnalyseImageResponseSchema>
```

---

## 7. Domain-Driven Design Layer

The `src/_shared/domain/` directory contains four DDD building blocks, each with strict rules.

### 7.1 Value Objects

A value object represents a domain concept whose identity is defined by its value, not an ID.

**Rules:**
- Private constructor. Construction only via static factory methods.
- Immutable — `readonly` on all fields.
- No Supabase imports. No React imports. Pure TypeScript.
- Equality is value-based, checked via an `equals()` method.
- Factory methods validate input and throw `Error` (not domain errors) on invalid data.

```typescript
export class Quantity implements IQuantity {
  private constructor(
    private readonly _amount: number,
    private readonly _unit: string | null,
  ) {}

  static create(amount: number, unit?: string | null): Quantity {
    if (amount < 0) throw new Error(`Quantity amount must be ≥ 0, got ${amount}`)
    return new Quantity(amount, unit ?? null)
  }

  subtract(used: number): Quantity {
    return Quantity.create(Math.max(0, this._amount - used), this._unit)
  }

  isFullyConsumedBy(used: number): boolean {
    return used >= this._amount
  }
}
```

### 7.2 Specifications

A specification encapsulates a single, named business rule as a boolean predicate.

**Rules:**
- Implements `ISpecification<T>` — the `isSatisfiedBy(candidate: T): boolean` contract.
- The class name IS the business rule name (`IsExpiredSpec`, `DueForNotificationSpec`).
- One rule per class. Never combine rules inside a spec — compose them at the call site.
- No I/O. No async. No Supabase.

```typescript
export class IsExpiredSpec implements IIsExpiredSpec {
  constructor(private readonly referenceDate: Date = new Date()) {}

  isSatisfiedBy(item: ItemRow): boolean {
    if (!item.expiry_date) return false
    return ExpiryDate.fromISOString(item.expiry_date).isExpired(this.referenceDate)
  }
}
```

### 7.3 Domain Services

A domain service orchestrates business logic that doesn't naturally belong to a single value object.

**Rules:**
- Instance methods only (no static methods — see §4.3).
- Implements `IXxxService` interface from the colocated `.service.interface.ts`.
- Types that are part of the service contract (inputs/outputs) live in the interface file.
- No Supabase. No React. No async unless I/O is genuinely required.
- `now?: Date` parameter on time-sensitive methods for deterministic testing.

```typescript
export class ItemLifecycleService implements IItemLifecycleService {
  markUsed(item: ItemRow, action: QuantityAction, now = new Date()): LifecycleResult {
    const remaining = (item.quantity_remaining ?? item.quantity) - action.amount
    const isFullyConsumed = remaining <= 0
    return {
      itemUpdate: {
        status: isFullyConsumed ? 'used' : 'active',
        quantity_remaining: isFullyConsumed ? 0 : remaining,
        used_at: isFullyConsumed ? now.toISOString() : null,
      },
      eventInsert: {
        item_id: item.id,
        kitchen_id: item.kitchen_id,
        event_type: 'used',
        quantity_used: action.amount,
        unit: action.unit ?? item.quantity_unit,
        note: action.note ?? null,
        created_at: now.toISOString(),
      },
    }
  }
}
```

### 7.4 Factories

A factory encapsulates the construction of domain aggregates from external input sources.

**Rules:**
- Implements `IXxxFactory` interface.
- Instance methods (see §4.3).
- Each `from*` method corresponds to one input source: `fromManualEntry`, `fromGeminiResponse`, `fromBarcodeResponse`.
- The factory owns the mapping between external data shapes and domain insert types.
- Stubs for phases that haven't landed yet return a `TODO` placeholder that throws at runtime with a clear message.

```typescript
export class ItemFactory implements IItemFactory {
  fromManualEntry(form: CheckItForm, kitchenId: string): ItemInsert {
    return {
      kitchen_id: kitchenId,
      name: form.name.trim(),
      tags: form.tags,
      quantity: form.quantity,
      quantity_unit: form.quantityUnit ?? null,
      expiry_date: form.expiryDate ?? null,
      expiry_source: 'manual',
      status: 'active',
      // ... remaining fields
    }
  }

  fromGeminiResponse(_response: GeminiAnalyseSuccess, _kitchenId: string): ItemInsert {
    throw new Error('ItemFactory.fromGeminiResponse — not implemented until Phase 4.8')
  }
}
```

### 7.5 Domain Barrel

`src/_shared/domain/index.ts` re-exports everything from all four DDD layers. Consumer code always imports from this barrel, never from deep paths.

```typescript
// CORRECT
import { ExpiryDate, ItemLifecycleService } from '@/shared/domain'

// WRONG
import { ExpiryDate } from '@/shared/domain/value-objects/expiry-date.value-object'
```

---

## 8. Typed Domain Errors

### 8.1 Structure

Every domain error:
1. `extends Error` — stack traces work; `instanceof Error` works; Sentry works.
2. Has `readonly _tag = 'XxxError' as const` — used for discrimination, not `instanceof`.
3. Sets `this.name = 'XxxError'` — correct name in stack traces.
4. Exposes domain-specific fields as `public readonly` constructor params.
5. Constructs a human-readable `message` string from those fields.

```typescript
export class PermissionError extends Error {
  readonly _tag = 'PermissionError' as const

  constructor(
    public readonly action: string,
    public readonly requiredRole: string,
  ) {
    super(`Permission denied: '${action}' requires role '${requiredRole}'`)
    this.name = 'PermissionError'
  }
}
```

### 8.2 Throwing vs Returning

- **Services and value objects throw** domain errors when a pre-condition is violated (not user error, programmer error or invariant violation).
- **Query mutations and Edge Functions return** domain errors (or wrap them in Result types) so the UI layer can display them.
- **Never swallow errors silently** — either throw, return, or log explicitly.

### 8.3 Error Union Type

For functions that can produce multiple domain errors, define a union:

```typescript
export type DomainError =
  | NotFoundError
  | PermissionError
  | RateLimitError
  | AIError
  | ModerationError
  | StorageError
  | PushDeliveryError
  | InviteError
```

---

## 9. Pod Barrel Pattern

### 9.1 The Rule

Every feature pod (`src/features/<pod>/`) has an `index.ts` that is its only public interface. Code outside the pod imports from the barrel path (`@/features/auth`), never from internal paths (`@/features/auth/auth.store`).

### 9.2 Empty Barrels

Phase 0 pods that have nothing implemented yet export `export {}` — an explicit empty ES module. Never omit the export statement (TypeScript treats bare files as scripts, not modules).

### 9.3 Interface Pairs in Barrels

When exporting a class, export its interface in the same statement block:

```typescript
export { AuthStore } from './auth.store'
export type { IAuthStore } from './auth.store.interface'
export type { AuthSession } from './auth.type'
```

### 9.4 Barrel Annotations

Each barrel documents its planned exports with phase-keyed annotations. This turns the barrel into a living roadmap.

```typescript
/**
 * ## Planned additions (Phase 1)
 * - `WelcomeScreen` — Phase 1.6: anonymous + OAuth entry.
 * - `useAuth` — Phase 1.5: hook wrapping the auth Zustand store.
 * - `type AuthSession` — Phase 1.3
 */
export {}
```

---

## 10. TanStack Query Patterns

### 10.1 Query Client Configuration

- `gcTime: 24h` — cache survives the day; app feels instant on reconnect.
- `staleTime: 5min` — no refetch on navigation within 5 minutes.
- `retry: 2` — covers transient mobile network blips.
- `refetchOnWindowFocus: false` — React Native has no window focus event.
- Mutations get `retry: 1` only — idempotent mutations only.

### 10.2 Query Key Convention

Query keys are tuples that go from broad to narrow:

```typescript
const queryKeys = {
  stash: (kitchenId: string) => ['stash', kitchenId] as const,
  item: (itemId: string) => ['item', itemId] as const,
  itemEvents: (itemId: string) => ['item', itemId, 'events'] as const,
}
```

Never use string keys alone — tuple keys allow targeted invalidation.

### 10.3 Optimistic Updates

Every mutation that modifies a list must:
1. `onMutate` — snapshot the current cache, apply the optimistic update.
2. `onError` — roll back to the snapshot.
3. `onSettled` — invalidate the query to sync the final server state.

```typescript
useMutation({
  mutationFn: (item: ItemInsert) => supabase.from('items').insert(item),
  onMutate: async (newItem) => {
    await queryClient.cancelQueries({ queryKey: queryKeys.stash(kitchenId) })
    const previous = queryClient.getQueryData(queryKeys.stash(kitchenId))
    queryClient.setQueryData(queryKeys.stash(kitchenId), (old) => [...(old ?? []), optimisticItem])
    return { previous }
  },
  onError: (_err, _vars, context) => {
    queryClient.setQueryData(queryKeys.stash(kitchenId), context?.previous)
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.stash(kitchenId) })
  },
})
```

### 10.4 Persistence

`PersistQueryClientProvider` wraps the entire app in the root layout. The persister key is `'GONE_BAD_QUERY_CACHE'`. AsyncStorage v2.x is the storage backend (v3.x is TurboModules-only and incompatible with Expo Go).

---

## 11. Supabase Patterns

### 11.1 Single Singleton Client

Import `supabase` from `@/lib/supabase`. Never call `createClient` directly elsewhere. Duplicate clients create independent connection pools and break session synchronisation.

### 11.2 Auth Configuration

```typescript
{
  storage: AsyncStorage,
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: false,  // RN uses deep links, not URL bar
}
```

### 11.3 Database Type Safety

`supabase.from('items')` returns a fully typed builder because `createClient` is generic over `Database`. The hand-crafted `Database` type in `src/lib/database.types.ts` matches the Supabase CLI output format exactly — it is a drop-in replacement when CLI generation becomes available after Phase R migrations run.

### 11.4 RPC Calls

Server-side operations (marking items used/wasted, incrementing scan counts) go through RPCs, not direct inserts. The rationale: RPCs are `SECURITY DEFINER`, can be atomic across multiple tables, and enforce invariants at the database level.

```typescript
await supabase.rpc('mark_item_used', {
  item_id: itemId,
  quantity: action.amount,
  unit: action.unit,
  note: action.note ?? null,
})
```

### 11.5 Realtime Subscriptions

Realtime subscriptions are set up inside `useEffect` in the query hook, not in components. The subscription calls `queryClient.invalidateQueries()` on change events. Always return a cleanup function that calls `.unsubscribe()`.

---

## 12. Expo Router Patterns

### 12.1 Route Group Rules

- `(app)` — authenticated shell; Tab navigator; URL-transparent
- `(auth)` — sign-in flow; Stack navigator; URL-transparent
- Route groups are `unstable_settings.anchor`-aware: `anchor: '(app)'` makes the tab navigator the default entry

### 12.2 _layout.tsx Required for Multi-Screen Tabs

Every tab directory that contains more than one screen (or any screen at all) needs a `_layout.tsx` with a Stack navigator. **Without it, Expo Router registers the route as `dir/index` instead of `dir`**, causing the Tabs navigator to warn and the tab not to render.

```
(app)/stash/_layout.tsx  ← required; makes route "stash" not "stash/index"
(app)/stash/index.tsx
(app)/stash/[id].tsx
```

Even single-screen tab directories need `_layout.tsx`:

```
(app)/bin/_layout.tsx    ← required even though only index.tsx exists
(app)/bin/index.tsx
```

### 12.3 Typed Routes

`typedRoutes: true` is enabled. The route type cache lives in `.expo/types/router.d.ts` and is regenerated by `expo start`. When writing `href` values in `Link` components or `router.push()` calls, always use a path that exists in the current route type union. The cache is updated automatically on every dev-server start.

`PlaceholderLink.href` in Phase 0 stub screens uses `Href` from expo-router. Because the cache is regenerated by the dev server, never manually edit `.expo/types/router.d.ts` except when the dev server has not been run yet (initial scaffold replacement case).

### 12.4 Screen File Convention

Route files in `app/` are thin shells. They contain:
- A default-export page component
- A `useLocalSearchParams` call if the route has dynamic segments
- One import of the real screen from `@/features/<pod>`

Route files never contain business logic, queries, or hooks beyond navigation.

```typescript
// app/(app)/stash/[id].tsx — CORRECT (thin shell)
export default function ItemLabelPage(): React.JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>()
  return <ItemLabelScreen itemId={id} />
}

// WRONG — query logic in the route file
export default function ItemLabelPage() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data } = useItemQuery(id)   ← belongs in the screen component
  return <ItemLabel item={data} />
}
```

---

## 13. React Native Component Patterns

### 13.1 No Inline Style Objects in JSX

Always define styles in a `StyleSheet.create()` call at the bottom of the file. Inline style objects create a new object on every render.

```typescript
// CORRECT
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700' },
})
<View style={styles.container}>

// WRONG
<View style={{ flex: 1, padding: 16 }}>
```

### 13.2 Design Tokens

All spacing, font sizes, border radii, and colours come from `src/constants/tokens.ts`. Never hardcode pixel values in component files.

```typescript
import { spacing, fontSizes, colors, borderRadius } from '@/constants/tokens'

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,            // 16
    borderRadius: borderRadius.lg,  // 12
    backgroundColor: colors.surface,
  },
  title: { fontSize: fontSizes.lg }, // 17
})
```

### 13.3 Component File Structure

```typescript
// 1. @file JSDoc
// 2. Imports (external → internal → types)
// 3. Section separator: Types
// 4. Interface (props type)
// 5. Section separator: Component
// 6. export function Component(): React.JSX.Element
// 7. Section separator: Styles
// 8. const styles = StyleSheet.create({ ... })
```

### 13.4 Return Type Annotation

All component functions have an explicit `React.JSX.Element` return type. Never omit it.

```typescript
export function StashItemCard({ item }: StashItemCardProps): React.JSX.Element {
```

### 13.5 Platform-Specific Files

For behaviour that differs across platforms, use the `.ios.ts` / `.android.ts` / `.web.ts` extension convention rather than `Platform.select()` inside a single file. `Platform.select()` is acceptable for minor styling differences only.

---

## 14. Testing Patterns

### 14.1 TDD Rule: Implementation + Tests in the Same Chunk

Implementation file and test file are committed together. A chunk is never "done" with implementation only. No implementation merges without its test.

### 14.2 Test File Location

Tests are colocated with their source file in the same directory:

```
expiry-date.value-object.ts
expiry-date.value-object.test.ts   ← same directory
```

### 14.3 vi.mock Hoisting

Vitest hoists `vi.mock()` calls above all imports. This means mocks must be declared at the top of the test file — before any `import` statement that depends on them. Never call `vi.mock()` inside a `beforeEach` or a `describe` block when the mock needs to be in place for module initialisation.

```typescript
// CORRECT — hoisted above the import
vi.mock('@/constants/config', () => ({
  SUPABASE_URL: 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY: 'placeholder-anon-key',
}))

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined),
    multiGet: vi.fn().mockResolvedValue([]),
    multiSet: vi.fn().mockResolvedValue(undefined),
    multiRemove: vi.fn().mockResolvedValue(undefined),
  },
}))

import { supabase } from './supabase'   ← import AFTER mock declarations
```

### 14.4 Module-Level Service Singletons in Tests

Domain service tests create one instance at module level and reuse it across all tests. Services are stateless, so this is safe and avoids constructor noise in every test.

```typescript
// CORRECT — module-level singleton
const svc = new ItemLifecycleService()
const factory = new ItemFactory()

describe('ItemLifecycleService', () => {
  it('marks item as used when full quantity consumed', () => {
    const result = svc.markUsed(mockItem, { amount: 500, unit: 'g' })
    expect(result.itemUpdate.status).toBe('used')
  })
})

// WRONG — new instance in every test
it('marks item as used', () => {
  const svc = new ItemLifecycleService()  ← unnecessary noise
```

### 14.5 `describe` / `it` Structure

```typescript
describe('<ClassName>', () => {
  describe('<methodName>', () => {
    describe('<scenario>', () => {
      it('<observable behaviour>', () => { ... })
    })
  })
})
```

Test names read as a sentence: `ItemLifecycleService > markUsed > when full quantity consumed > sets status to 'used'`.

### 14.6 No `beforeEach` Setup for Pure Tests

Value object and service tests are pure functions with no side effects. If a test requires setup, the setup data belongs in the `it` block or in a test-local constant, not in `beforeEach`. `beforeEach` is reserved for component tests that require DOM/render teardown.

### 14.7 Deterministic Time

All time-sensitive tests pass an explicit `now` date rather than relying on `Date.now()`. This is why service methods accept `now?: Date`.

```typescript
const fixedNow = new Date('2025-06-01T00:00:00Z')
const result = svc.markUsed(item, action, fixedNow)
expect(result.eventInsert.created_at).toBe('2025-06-01T00:00:00.000Z')
```

---

## 15. Vitest Configuration Contract

### 15.1 react-native Alias

`react-native/index.js` contains Flow type annotations (`import typeof`) that esbuild cannot parse. The `resolve.alias` in `vitest.config.ts` redirects every `react-native` import to `src/test/mocks/react-native.mock.ts`. This alias must always be the **first entry** in the alias map.

```typescript
resolve: {
  alias: {
    'react-native': path.resolve(__dirname, 'src/test/mocks/react-native.mock.ts'),
    '@/features': path.resolve(__dirname, 'src/features'),
    // ...
  },
},
```

Never remove or reorder this alias. If new React Native APIs are needed in tests, add them to the mock file rather than removing the alias.

### 15.2 Alias Order Invariant

More-specific aliases must appear before less-specific ones. The `@` catch-all must be last.

```typescript
'@/features': ...,   // more specific → first
'@/shared': ...,
'@/lib': ...,
'@/constants': ...,
'@': ...,            // catch-all → last
```

### 15.3 Path Aliases in tsconfig and vitest Must Match

The aliases in `tsconfig.json` `paths` and `vitest.config.ts` `resolve.alias` must be identical. A mismatch means production TypeScript compiles but tests fail to resolve modules.

| tsconfig path | vitest alias |
|---|---|
| `@/features/*` | `@/features` → `src/features` |
| `@/shared/*` | `@/shared` → `src/_shared` |
| `@/lib/*` | `@/lib` → `src/lib` |
| `@/constants/*` | `@/constants` → `src/constants` |
| `@/*` | `@` → `.` (project root) |

### 15.4 v8 Coverage

The `coverage.include: ['src/**/*.{ts,tsx}']` pattern means v8 lists all src files in the coverage report even if not loaded by tests. Any src file that imports from `react-native` or other native-only packages will be handled by the mock alias and will not cause parse errors.

---

## 16. State Management Patterns

### 16.1 Zustand for Client State

Server state (DB data) → TanStack Query. Client state (UI, session, in-flight data) → Zustand.

### 16.2 Store File Pairing

Each store has an implementation file and a colocated interface file:

```
auth.store.ts              ← class AuthStore implements IAuthStore
auth.store.interface.ts    ← interface IAuthStore
```

### 16.3 Store in Hook

Components never import the store directly. They use the colocated hook:

```typescript
// auth.hook.ts
export function useAuth(): IAuthStore {
  return useAuthStore()
}

// In a component
const { session, signInAnonymously } = useAuth()
```

### 16.4 Persistence

Non-sensitive preferences (notification days, locale) → expo-file-system via Zustand persist middleware.
Sensitive data (session JWT) → expo-secure-store.
Query cache → AsyncStorage via TanStack persister.
Never store sensitive data in AsyncStorage.

### 16.5 Scan Store (In-Memory Only)

The scan store (`scan.store.ts`) holds ephemeral in-flight analysis results. It is deliberately not persisted. When the user leaves the scan flow without completing it, the store clears automatically.

---

## 17. Edge Function Patterns

### 17.1 Shared Setup File

All EFs import from `supabase/functions/_shared/setup.ts`:

```typescript
import { corsHeaders, errorResponse, successResponse } from '../_shared/setup'
```

Never define CORS headers inline in a handler.

### 17.2 Schema / Service / Handler Split

Every EF has three files:

| File | Responsibility |
|------|---------------|
| `*.schema.ts` | Zod request/response schemas (shared with client) |
| `*.service.ts` | Business logic; pure functions; testable without Deno runtime |
| `*.handler.ts` | Middleware pipeline: authenticate → validate → call service → format response |

### 17.3 Middleware Order

Every handler follows the same pipeline:
1. Handle CORS preflight (`OPTIONS`)
2. Authenticate via JWT (`Authorization: Bearer <token>`)
3. Validate request body against the request schema
4. Call the service
5. Return `successResponse` or `errorResponse`

### 17.4 Service Testability

Services are designed to run in Vitest (bun) as well as Deno. They take explicit dependencies (Supabase client, fetch function) as parameters rather than accessing globals, making them mockable in tests.

---

## 18. Phase-Driven Development

### 18.1 Stub-First Philosophy

Code that will be replaced by a later phase is written as an explicit no-op stub, not omitted. The stub has the correct signature so call sites don't change when the real implementation lands.

```typescript
// Phase 0 stub — real implementation in Phase 7
export async function requestPermissions(): Promise<boolean> {
  return false
}
```

### 18.2 Phase Annotations in JSDoc

Every stub file and future-phase export must have a phase annotation in its `@file` or `@remarks` JSDoc:

```typescript
/**
 * @remarks
 * **Phase 7 replaces this entire file.** The function signatures here are
 * intentionally identical to what Phase 7 will implement.
 */
```

### 18.3 One Chunk = One Commit

Each chunk from the development plan (`Chunk X.N`) maps to exactly one git commit. Never batch multiple chunks into one commit. Never split a chunk across multiple commits.

### 18.4 Zero-Error Gate

Before every commit:
```bash
bun tsc --noEmit    # zero TypeScript errors
bun vitest run      # all tests pass
```

A red test suite or TypeScript errors are always a blocked commit, without exception.

### 18.5 Migration-First for Each Phase

Database migrations run before any application code that depends on the new schema. Never write a query hook before the table it queries has a migration.

---

## 19. Comments Philosophy

### 19.1 No Comments on Obvious Code

Comments explain **WHY**, not **WHAT**. Well-named identifiers already document the what.

```typescript
// WRONG — states the obvious
// Check if expired
if (item.expiry_date && new Date(item.expiry_date) < now) { ... }

// CORRECT — the name is the documentation
if (new IsExpiredSpec().isSatisfiedBy(item)) { ... }
```

### 19.2 When a Comment Is Required

Write an inline comment when:
- A hidden constraint drives the implementation (`// A round-trip check catches overflow dates that Date silently accepts`)
- A subtle invariant would surprise a reader (`// Use-by semantics: today is NOT expired — still safe to use`)
- A workaround for a specific upstream bug
- Business rules with non-obvious numeric values (`// ADR-009: 20 scans/day; barcode scans are exempt`)

### 19.3 No Task References in Code

Never reference issue numbers, PR numbers, or developer names in code comments. These rot as the codebase evolves and belong in git commit messages and PR descriptions, not source files.

```typescript
// WRONG
// Added for issue #123
// TODO: remove this hack from the March sprint

// CORRECT (if needed at all)
// Intentionally discards time-of-day: expiry is a calendar concept, not a moment.
```

### 19.4 No Summary Comments at End of Functions

Never add a comment at the end of a function summarising what it did. If a function is so complex it needs a closing annotation, split it into smaller functions.

---

## 20. Anti-Patterns: Never Do These

### 20.1 Direct Imports from Internal Pod Paths

```typescript
// WRONG — bypasses the pod's public interface
import { AuthStore } from '@/features/auth/auth.store'

// CORRECT
import { useAuth } from '@/features/auth'
```

### 20.2 Supabase in Domain Code

```typescript
// WRONG — domain services must be pure
export class ItemLifecycleService {
  async markUsed(itemId: string, action: QuantityAction): Promise<void> {
    await supabase.from('items').update(...)  ← absolutely not
  }
}

// CORRECT — pure function returning patches; caller does the I/O
markUsed(item: ItemRow, action: QuantityAction): LifecycleResult {
  return { itemUpdate: {...}, eventInsert: {...} }
}
```

### 20.3 `any` Type

```typescript
// WRONG
const result: any = await supabase.from('items').select()

// CORRECT — the typed client returns the right type automatically
const { data, error } = await supabase.from('items').select()
// data is ItemRow[] | null — fully typed
```

### 20.4 Static Methods on Services

```typescript
// WRONG — not injectable, not mockable
class KitchenPermissionService {
  static canPerformAction(role: KitchenRole, action: KitchenAction): boolean { ... }
}

// CORRECT — instance method, implements interface
class KitchenPermissionService implements IKitchenPermissionService {
  canPerformAction(role: KitchenRole, action: KitchenAction): boolean { ... }
}
```

### 20.5 Business Logic in Route Files

`app/` files are thin shells. Business logic, queries, stores, and hooks belong in `src/features/`.

### 20.6 Manual Type Duplication

```typescript
// WRONG — will drift from the schema
type ItemRow = { id: string; name: string; status: string }

// CORRECT — derived, cannot drift
type ItemRow = z.infer<typeof ItemRowSchema>
```

### 20.7 `instanceof` for Domain Error Checks

```typescript
// WRONG — breaks across module boundaries
if (err instanceof NotFoundError) { ... }

// CORRECT — tag-based discrimination
if (err._tag === 'NotFoundError') { ... }
```

### 20.8 Hardcoded Pixel Values in Styles

```typescript
// WRONG
const styles = StyleSheet.create({ card: { padding: 16, borderRadius: 12 } })

// CORRECT
const styles = StyleSheet.create({
  card: { padding: spacing.md, borderRadius: borderRadius.lg }
})
```

### 20.9 react-native Imported Without the Alias

When adding new src files that import from `react-native`, no special action is needed — the `vitest.config.ts` alias handles it globally. Never add per-file `vi.mock('react-native', ...)` to individual test files; the alias is already in place.

### 20.10 Multiple QueryClient Instances

```typescript
// WRONG — creates a second independent cache
const client = new QueryClient()

// CORRECT — always use the singleton from @/lib/query-client
import { queryClient } from '@/lib/query-client'
```

---

*This document reflects the state of the project as of Phase 0 completion (Chunks 0.1–0.22). Update the relevant section when architectural decisions change in later phases. Add a git commit message that references the section updated.*
