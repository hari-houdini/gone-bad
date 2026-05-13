# Gone Bad — Full Application Development Plan (Granular)

## Decisions Log

| Decision | Choice |
|---|---|
| Chunk size | 1 commit / ~1 hour (single file or tightly related pair) |
| Tests | TDD-style — implementation + tests in the **same** chunk |
| Supabase | Start fresh (`supabase init`); Docker Desktop ✅ installed |
| Migrations | Incremental — tables first, RLS added per-phase |
| Design | Code-first; placeholder styles throughout |
| Stub screens | Named placeholder with navigation links |
| Credentials | Gated `PREREQ` chunk before the phase that needs them |
| Team | Solo; simple branching |
| Build target | Dev Build local (requires Xcode/Android Studio — see 0.PREREQ) |
| Phase order | **RAG pipeline built before all other features** |
| RAG seeding | 20–50 hand-crafted SQL entries first; embeddings added when API key ready |
| RAG API key | Build code with placeholders; add real key when ready |
| MVP scope | Phases 0–7 (all features including bulk scan + notifications) |

---

## Already Completed ✅

These files exist on disk from the previous session:

```
src/_shared/types/           — all 7 Zod v4 schema files + index.ts (13 tables, 6 EF contracts)
src/constants/tags.ts        — 14 food category tags
tsconfig.json                — path aliases (@/shared/*, @/features/*, @/lib/*, @/constants/*)
src/_shared/errors/domain.error.ts + index.ts   — 8 typed errors
src/_shared/ports/*.port.ts + index.ts          — 7 port interfaces
src/_shared/domain/value-objects/*.ts           — 5 value objects (ExpiryDate, Quantity, ItemTags, KitchenRole, InviteToken)
src/_shared/domain/specs/expiry.spec.ts         — IsExpired, IsExpiringSoon, IsFresh
src/_shared/domain/specs/notification.spec.ts   — DueForNotification
All directories created (src/features/*, src/_shared/*, supabase/*, e2e/*, .github/*)
Runtime + dev deps installed (zod, zustand, xstate, @tanstack/react-query, supabase-js, vitest, etc.)
```

**What these files are still missing:** tests. TDD rule means tests must be written for each file in its chunk.

---

## Phase Order

```
Phase 0  → Foundation completion (vitest, tests for existing files, services, factory, lib, routing, pods)
Phase R  → RAG Pipeline (Supabase init, vectors schema, rag-query EF, seed data)
Phase 1  → Authentication (anon, OAuth, kitchen auto-create)
Phase 2  → Kitchen Management (CRUD, members, handle-invite EF)
Phase 3  → Items Manual Entry (The Stash, The Label, XState machine)
Phase 4  → Image Upload Pipeline (Snap It, analyse-image EF, process-image EF, Check It)
Phase 5  → The Haul — Bulk Scanning (multi-photo, Line 'Em Up, Effect Stream)
Phase 6  → Dashboard (The Fridge Door, generate-fun-fact EF)
Phase 7  → Push Notifications (Heads Up, send-notifications EF, Quick Actions)
Phase 8  → The Bin & Waste History
Phase 9  → Settings & Account Management (House Rules, GDPR)
Phase 10 → Polish, Tests & CI/CD
```

---

## Chunk Format

Each chunk entry follows this structure:
```
### Chunk X.N — <title>
Files: <file(s) created or modified>
Test:  <test file> | N/A
Why:   <what this enables / why this order>
```

---

## Phase 0 — Foundation (Remaining Work)

### Chunk 0.PREREQ — Dev build tooling check
```
Files: N/A — manual step
Test:  N/A
Why:   expo run:ios / expo run:android require Xcode + Android Studio.
       Verify: `xcode-select -p` and `adb version`.
       If missing: install Xcode from App Store; install Android Studio from developer.android.com.
       Do NOT proceed to Phase 1 without at least one build target working.
```

### Chunk 0.1 — Vitest config + test utilities
```
Files: vitest.config.ts
       src/test-utils/render.tsx     ← custom render with QueryClient + no-op Zustand providers
Test:  N/A (config file)
Why:   Every subsequent TDD chunk needs this. Must be first.
```

### Chunk 0.2 — Tests: domain.error.ts
```
Files: src/_shared/errors/domain.error.test.ts
Test:  domain.error.test.ts
Why:   Validates each error class has correct _tag, message, and fields.
       Covers: NotFoundError, PermissionError, RateLimitError, AIError,
               ModerationError, StorageError, PushDeliveryError, InviteError.
```

### Chunk 0.3 — Tests: ExpiryDate value object
```
Files: src/_shared/domain/value-objects/expiry-date.value-object.test.ts
Test:  expiry-date.value-object.test.ts
Why:   isExpired, daysUntilExpiry, isExpiringSoon — business-critical date logic.
```

### Chunk 0.4 — Tests: Quantity value object
```
Files: src/_shared/domain/value-objects/quantity.value-object.test.ts
Test:  quantity.value-object.test.ts
Why:   subtract(), isFullyConsumedBy() — used by item lifecycle partial-use logic.
```

### Chunk 0.5 — Tests: ItemTags value object
```
Files: src/_shared/domain/value-objects/item-tags.value-object.test.ts
Test:  item-tags.value-object.test.ts
Why:   add(), remove(), de-duplication, equals().
```

### Chunk 0.6 — Tests: KitchenRole value object
```
Files: src/_shared/domain/value-objects/kitchen-role.value-object.test.ts
Test:  kitchen-role.value-object.test.ts
Why:   satisfies(), canWrite, canAdministrate — drives all permission guards.
```

### Chunk 0.7 — Tests: InviteToken value object
```
Files: src/_shared/domain/value-objects/invite-token.value-object.test.ts
Test:  invite-token.value-object.test.ts
Why:   fromString() validation, toDeepLink() format.
```

### Chunk 0.8 — Tests: Expiry specs
```
Files: src/_shared/domain/specs/expiry.spec.test.ts
Test:  expiry.spec.test.ts
Why:   IsExpiredSpec, IsExpiringSoonSpec, IsFreshSpec — used by Dashboard urgency grid.
```

### Chunk 0.9 — Tests: Notification spec
```
Files: src/_shared/domain/specs/notification.spec.test.ts
Test:  notification.spec.test.ts
Why:   DueForNotificationSpec — core business rule for send-notifications EF.
```

### Chunk 0.10 — ItemLifecycleService + tests
```
Files: src/_shared/domain/services/item-lifecycle.service.ts
       src/_shared/domain/services/item-lifecycle.service.test.ts
Test:  item-lifecycle.service.test.ts
Why:   Orchestrates markUsed/markWasted transitions; used by item.query.ts mutations.
       Input: ItemRow + QuantityAction → Output: { itemUpdate: ItemUpdate, eventInsert: ItemEventInsert }
       Does NOT call Supabase — pure domain logic.
```

### Chunk 0.11 — KitchenPermissionService + tests
```
Files: src/_shared/domain/services/kitchen-permission.service.ts
       src/_shared/domain/services/kitchen-permission.service.test.ts
Test:  kitchen-permission.service.test.ts
Why:   canPerformAction(role, action) → boolean | throws PermissionError.
       Actions: 'add_item', 'edit_item', 'delete_item', 'generate_invite',
                'remove_member', 'rename_kitchen', 'delete_kitchen'.
```

### Chunk 0.12 — ScanQuotaService + tests
```
Files: src/_shared/domain/services/scan-quota.service.ts
       src/_shared/domain/services/scan-quota.service.test.ts
Test:  scan-quota.service.test.ts
Why:   isQuotaExceeded(scanCount), remainingScans(scanCount) → used by analyse-image EF + client.
       ADR-009: 20 scans/day; barcode scans exempt.
```

### Chunk 0.13 — ExpiryEstimationService + tests
```
Files: src/_shared/domain/services/expiry-estimation.service.ts
       src/_shared/domain/services/expiry-estimation.service.test.ts
Test:  expiry-estimation.service.test.ts
Why:   estimateExpiryDate(itemName, estimatedDays) → ISO date string.
       Used by ItemFactory.fromGeminiResponse() when AI gives days-until rather than a date.
```

### Chunk 0.14 — NotificationScheduleService + tests
```
Files: src/_shared/domain/services/notification-schedule.service.ts
       src/_shared/domain/services/notification-schedule.service.test.ts
Test:  notification-schedule.service.test.ts
Why:   getItemsDueForNotification(items[], defaultDaysBefore) → ItemRow[].
       Uses DueForNotificationSpec; used by send-notifications EF.
```

### Chunk 0.15 — ItemFactory (fromManualEntry only) + tests
```
Files: src/_shared/domain/factories/item.factory.ts
       src/_shared/domain/factories/item.factory.test.ts
Test:  item.factory.test.ts
Why:   fromManualEntry(form: CheckItForm, kitchenId): ItemInsert — needed for Phase 3.
       fromGeminiResponse() and fromBarcodeResponse() are stubs; implemented in Phase 4.
```

### Chunk 0.16 — Shared domain barrel
```
Files: src/_shared/domain/index.ts
Test:  N/A (barrel only)
Why:   Exports all value objects, services, specs, factory under a single import.
```

### Chunk 0.17 — Config + design tokens constants
```
Files: src/constants/config.ts    ← SUPABASE_URL, SUPABASE_ANON_KEY via expo-constants
       src/constants/tokens.ts    ← spacing (4/8/16/24/32/48), fontSizes, borderRadius, colors
Test:  N/A (constants only)
Why:   Config needed for src/lib/supabase.ts; tokens needed for all screens.
```

### Chunk 0.18 — Supabase client lib + tests
```
Files: src/lib/supabase.ts     ← createClient() singleton + typed DB helper (no auth yet)
       src/lib/supabase.test.ts
Test:  supabase.test.ts
Why:   All queries + mutations depend on this. Test: verify client initialises without throwing.
```

### Chunk 0.19 — TanStack Query client
```
Files: src/lib/query-client.ts    ← QueryClient + AsyncStorage persistence config
Test:  N/A (configuration only)
Why:   Needed before any useQuery/useMutation hooks are written.
```

### Chunk 0.20 — Notifications lib stub
```
Files: src/lib/notifications.ts    ← stub: registerToken() and setupListeners() as no-ops
Test:  N/A (stub, full tests in Phase 7)
Why:   app/_layout.tsx imports this; needs to exist so the app compiles.
```

### Chunk 0.21 — App routing skeleton + named placeholder screens
```
Files: app/_layout.tsx                       ← RootLayout with QueryClientProvider + placeholder auth guard
       app/(auth)/_layout.tsx
       app/(auth)/welcome.tsx                ← renders <WelcomePlaceholder />
       app/(auth)/sign-in.tsx                ← renders <SignInPlaceholder />
       app/(app)/_layout.tsx                 ← 5-tab navigator (placeholder tab icons)
       app/(app)/index.tsx                   ← renders <DashboardPlaceholder />
       app/(app)/stash/index.tsx
       app/(app)/stash/[id].tsx
       app/(app)/snap/index.tsx
       app/(app)/snap/single.tsx
       app/(app)/snap/haul.tsx
       app/(app)/snap/check-it.tsx
       app/(app)/snap/line-em-up.tsx
       app/(app)/bin/index.tsx
       app/(app)/rules/index.tsx
       app/(app)/rules/heads-up.tsx
       app/(app)/rules/kitchen.tsx
       app/(app)/rules/account.tsx
       app/kitchen/invite/[token].tsx

       src/features/ui/placeholder-screen.component.tsx
         ← shared component: takes `name` + list of { label, href } links
         ← renders screen name in bold + tappable nav links to all other stubs
Test:  N/A (stub screens, visual verification only)
Why:   App must boot and navigate between all screens before real UI is built.
       Named placeholder with nav means you can tap through the whole app skeleton immediately.
```

### Chunk 0.22 — Pod scaffold (8 barrel files)
```
Files: src/features/auth/index.ts
       src/features/kitchen/index.ts
       src/features/item/index.ts
       src/features/stash/index.ts
       src/features/scan/index.ts
       src/features/dashboard/index.ts
       src/features/bin/index.ts
       src/features/settings/index.ts
       src/features/ui/index.ts         ← exports PlaceholderScreen
Test:  N/A (barrel exports only)
Why:   app/ thin shells import from these barrels; must exist before app/ is written.
```

### Phase 0 Verification
```
bun tsc --noEmit              → zero errors
bun vitest run                → all value object + service tests pass
expo start (or expo run:ios)  → app boots, all 19 placeholder screens reachable via taps
```

---

## Phase R — RAG Pipeline

**Why first:** Purely backend, no UI required. Output (rag-query EF) is called by analyse-image (Phase 4), generate-fun-fact (Phase 6), and send-notifications (Phase 7). Building it now proves the Supabase + Deno stack works before adding auth/UI complexity.

### Chunk R.PREREQ — Supabase CLI setup
```
Files: N/A — manual steps
Test:  N/A
Steps:
  1. brew install supabase/tap/supabase   (or download binary)
  2. supabase --version                   (confirm ≥ 1.200)
  3. docker ps                            (confirm Docker is running)
  4. cd /path/to/gone-bad && supabase init
     → creates supabase/config.toml, supabase/.gitignore
Why:  All subsequent migration + EF work requires local Supabase running.
```

### Chunk R.1 — supabase/config.toml
```
Files: supabase/config.toml      ← generated by supabase init; customise:
                                   - project_id = "gone-bad"
                                   - port = 54321
                                   - db.port = 54322
                                   - enable pgvector extension
       supabase/.gitignore
Test:  N/A
Why:   Required before any migrations can run.
```

### Chunk R.2 — Migration: vectors schema + rag_documents table
```
Files: supabase/migrations/0001_vectors_and_rag.sql
       Contents:
         CREATE EXTENSION IF NOT EXISTS vector;
         CREATE SCHEMA IF NOT EXISTS vectors;
         CREATE TABLE vectors.rag_documents (
           id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
           source TEXT NOT NULL CHECK (source IN ('usda','open_food_facts','nhs','efsa')),
           source_url TEXT,
           content TEXT NOT NULL,
           embedding vector(768),
           metadata JSONB NOT NULL DEFAULT '{}',
           created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
           updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
         );
         CREATE INDEX ON vectors.rag_documents
           USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
Test:  N/A (SQL migration; verify via supabase db diff)
Why:   Foundation for all RAG queries. Must exist before rag-query EF can be tested.
```

### Chunk R.3 — Migration: all public schema tables (bare — no RLS yet)
```
Files: supabase/migrations/0002_public_tables.sql
       Creates all 11 public tables:
         users, user_settings, kitchens, kitchen_members, kitchen_invites,
         items, item_events, push_tokens, notification_log,
         daily_kitchen_cache, scan_rate_limits
       NO RLS policies (added per-phase starting Phase 1)
       NO pg_cron jobs (added per-phase)
       NO triggers (added per-phase)
Test:  N/A (verify via `supabase db diff` → no pending changes)
Why:   All tables needed before seed data can be inserted.
```

### Chunk R.4 — Start local Supabase + verify
```
Files: N/A — CLI commands
Test:  N/A
Steps:
  supabase start
  → confirm Studio at http://localhost:54323
  → confirm DB at postgresql://postgres:postgres@localhost:54322/postgres
  → confirm vectors.rag_documents table exists in Studio
Why:   Proof that migrations applied cleanly before writing EF code.
```

### Chunk R.5 — Edge Function shared setup
```
Files: supabase/functions/_shared/setup.ts
       ← corsHeaders, errorResponse(status, message), successResponse(data)
       ← standardised CORS + response formatting used by all 6 EFs
Test:  N/A (utility only, tested indirectly by EF tests)
Why:   Every EF handler imports this. Write once before writing any handler.
```

### Chunk R.6 — rag-query schema file
```
Files: supabase/functions/rag-query/rag-query.schema.ts
       ← re-exports RagQueryRequestSchema, RagQueryResponseSchema
          from src/_shared/types/edge-functions.schema.ts
          (Deno can import TS files from the repo root via relative path)
Test:  N/A (re-export only)
Why:   Separates schema import from business logic in the service file.
```

### Chunk R.7 — rag-query service + tests
```
Files: supabase/functions/rag-query/rag-query.service.ts
       supabase/functions/rag-query/rag-query.handler.test.ts (tests service in isolation)
Test:  rag-query.handler.test.ts
Logic:
  queryRag(supabaseClient, query, topK):
    1. Generate embedding for `query` via Google text-embedding-004
       (uses GOOGLE_API_KEY from Deno.env — placeholder until key is set)
    2. SELECT id, content, source FROM vectors.rag_documents
       ORDER BY embedding <=> queryEmbedding LIMIT topK
    3. Concatenate content into context string
    4. Return { context, chunks }
Test covers:
  - Returns correct shape when DB has data
  - topK defaults to 5
  - Gracefully returns empty context when no rows exist
Why:  Pure service logic; test with mock Supabase client (no real DB needed).
```

### Chunk R.8 — rag-query handler
```
Files: supabase/functions/rag-query/rag-query.handler.ts
       ← middleware pipeline: authenticate → validate (RagQueryRequestSchema) → call service
       ← returns 200 { context, chunks } | 400 | 401 | 500
Test:  (covered by rag-query.handler.test.ts from R.7)
Why:   Internal EF — called by analyse-image, generate-fun-fact, send-notifications.
       No rate-limit step (internal only, not directly callable by clients).
```

### Chunk R.9 — Hand-crafted RAG seed data
```
Files: supabase/seed/rag-seed.sql
       ← INSERT INTO vectors.rag_documents (source, source_url, content, metadata)
       ← 50 rows across 4 sources covering:
            dairy (milk, cheese, yogurt, butter)
            produce (lettuce, tomatoes, berries, avocado)
            meat (chicken, beef, pork, fish)
            pantry (rice, bread, eggs, canned goods)
            condiments, herbs, frozen goods
       ← embedding column is NULL at this stage
       ← metadata JSON: { food_name, category, tags[], country }
Test:  N/A (SQL; verify row count via Studio)
Why:   Proves seed pipeline works without needing API key.
       Rows with NULL embeddings still let us test table structure and EF parsing.
```

### Chunk R.10 — Embedding seeder script (runs when API key is ready)
```
Files: supabase/seed/embed-seed.ts  (Deno script)
       ← reads all rag_documents WHERE embedding IS NULL
       ← calls Google text-embedding-004 API with each content string
       ← UPDATEs embedding column
       ← batch size: 10 rows at a time (API rate limit)
       ← Usage: GOOGLE_API_KEY=xxx deno run --allow-net --allow-env embed-seed.ts
Test:  N/A (script; tested manually when key is available)
Why:   RAG similarity search requires real embeddings.
       Kept separate so seeding + embedding are decoupled.
Note:  GOOGLE_API_KEY is a placeholder env var — add real key in Chunk 4.PREREQ.
```

### Chunk R.11 — Verify rag-query end-to-end
```
Files: N/A — manual verification
Test:  curl test:
  supabase functions serve rag-query
  curl -X POST http://localhost:54321/functions/v1/rag-query \
    -H "Authorization: Bearer <anon_key>" \
    -H "Content-Type: application/json" \
    -d '{"query": "how long does milk last in the fridge", "top_k": 3}'
Expected: { context: "...", chunks: [...] }
(context will be empty until embeddings are populated in R.10)
Why:  Confirms Supabase local + Deno Edge Runtime + DB query pipeline works.
```

### Phase R Verification
```
supabase db diff              → no pending changes
supabase functions serve rag-query → starts without error
curl test from R.11           → returns 200 with correct shape
supabase studio               → 50 rows in vectors.rag_documents
bun tsc --noEmit              → zero errors (shared types used by EF are valid)
```

---

## Phase 1 — Authentication

### Chunk 1.PREREQ — Google OAuth + Apple Sign-In setup
```
Files: N/A — manual steps
Test:  N/A
Steps:
  Google:
    1. Google Cloud Console → New project → Enable "Google Sign-In"
    2. OAuth 2.0 Client ID → iOS bundle ID: com.yourname.gonebad
    3. Download GoogleService-Info.plist (for native Google Sign-In)
    4. Add GOOGLE_CLIENT_ID to Supabase Dashboard → Auth → Providers → Google

  Apple:
    1. Apple Developer → Identifiers → App ID → enable "Sign In with Apple"
    2. Bundle ID must match app.json (com.yourname.gonebad)
    3. Enable in Supabase Dashboard → Auth → Providers → Apple

  Supabase local:
    4. Add to supabase/config.toml [auth] section:
         external.google.enabled = true
         external.apple.enabled = true

  Expo:
    5. bun add expo-auth-session expo-apple-authentication @invertase/react-native-google-signin

Why:  auth.store.ts signInWithGoogle/Apple calls will throw without these.
      Can be done in parallel while writing auth code.
```

### Chunk 1.1 — Migration: auth trigger + user_settings default + kitchen auto-create
```
Files: supabase/migrations/0003_auth_triggers.sql
       ← Function: handle_new_user() — inserts into public.users on auth.users insert
       ← Function: create_default_kitchen() — inserts kitchens + kitchen_members on users insert
       ← Function: create_default_user_settings() — inserts user_settings on users insert
       ← Triggers wired to the above functions
Test:  N/A (SQL)
Why:  Anonymous sign-in creates auth.users row → trigger cascades to public.users → kitchen → settings.
```

### Chunk 1.2 — Migration: RLS for users + user_settings (Phase 1 RLS)
```
Files: supabase/migrations/0004_rls_users.sql
       ← ALTER TABLE users ENABLE ROW LEVEL SECURITY;
       ← Policy: users can SELECT/UPDATE their own row (auth.uid() = auth_uid)
       ← ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
       ← Policy: users can SELECT/UPDATE their own row (user_id = public.get_user_id())
       ← Helper function: public.get_user_id() → maps auth.uid() to users.id
Test:  N/A (SQL)
Why:  Without RLS, any user can read/write any other user's data.
```

### Chunk 1.3 — auth.type.ts
```
Files: src/features/auth/auth.type.ts
       ← AuthSession type: { userId, authUid, isAnonymous, authProvider, accessToken }
       ← AuthProvider type (re-export from @/shared/types)
Test:  N/A (type declarations only)
Why:  auth.store.ts + auth.hook.ts both depend on these types.
```

### Chunk 1.4 — auth.store.ts + tests
```
Files: src/features/auth/auth.store.ts
       src/features/auth/auth.store.test.ts
Test:  auth.store.test.ts
State: { session: AuthSession | null, status: 'loading'|'authenticated'|'unauthenticated' }
Actions:
  signInAnonymously()     → supabase.auth.signInAnonymously()
  signInWithGoogle()      → PKCE flow via expo-auth-session (calls real SDK)
  signInWithApple()       → expo-apple-authentication + supabase
  signOut()               → supabase.auth.signOut() + clear store
  upgradeFromAnon()       → supabase.auth.linkIdentity()
  restoreSession()        → supabase.auth.getSession() on app start
Persistence: expo-secure-store (not AsyncStorage — hardware-backed)
Tests:
  - Initial state is { session: null, status: 'loading' }
  - signInAnonymously sets isAnonymous = true
  - signOut resets to unauthenticated
  - (OAuth flows mocked; real device testing in Phase 1 verification)
```

### Chunk 1.5 — auth.hook.ts + tests
```
Files: src/features/auth/auth.hook.ts       ← useAuth(): reads authStore, exposes actions
       src/features/auth/auth.hook.test.ts
Test:  auth.hook.test.ts
Why:  Components call useAuth(); they never import authStore directly.
      Tests: hook returns correct values from store; signOut calls store action.
```

### Chunk 1.6 — WelcomeScreen + tests
```
Files: src/features/auth/auth.screen.tsx    ← WelcomeScreen
       src/features/auth/auth.screen.test.ts
Test:  auth.screen.test.ts
UI:   "Gone Bad" title
      "Continue as guest" button → signInAnonymously()
      "Sign in with Google" button (disabled until 1.PREREQ done)
      "Sign in with Apple" button (disabled until 1.PREREQ done)
Tests:
  - Renders "Continue as guest" button
  - Pressing it calls signInAnonymously
  - Shows loading state while signing in
```

### Chunk 1.7 — SignInScreen + tests
```
Files: src/features/auth/sign-in.screen.tsx
       src/features/auth/sign-in.screen.test.ts
Test:  sign-in.screen.test.ts
UI:   Google + Apple sign-in buttons; error banner on failure; back button
Tests: renders both OAuth buttons; shows error message on failure
```

### Chunk 1.8 — Auth route guard + pod barrel update
```
Files: app/_layout.tsx               ← update: redirect (auth)↔(app) based on session status
       src/features/auth/index.ts    ← export { WelcomeScreen, SignInScreen, useAuth }
Test:  N/A (navigation guard — verified manually)
Why:  App must redirect to (auth) when no session, (app) when session exists.
```

### Phase 1 Verification
```
expo run:ios (or android)
→ App launches → anonymous session → users row in DB → kitchens row auto-created
→ Kill + reopen → session restored
bun vitest run src/features/auth/  → all tests pass
supabase db diff                   → no pending migrations
```

---

## Phase 2 — Kitchen Management

### Chunk 2.PREREQ — (none — no new credentials needed)

### Chunk 2.1 — Migration: RLS for kitchens + kitchen_members + kitchen_invites
```
Files: supabase/migrations/0005_rls_kitchens.sql
       ← RLS policies for kitchens (members can read; owners can update/delete)
       ← RLS policies for kitchen_members (members can read; owners can manage)
       ← RLS policies for kitchen_invites (editors/owners can create; anyone with token can read)
Test:  N/A (SQL)
```

### Chunk 2.2 — kitchen.type.ts
```
Files: src/features/kitchen/kitchen.type.ts
       ← KitchenContext: { kitchen: KitchenRow; role: KitchenRole; members: KitchenMemberRow[] }
Test:  N/A
```

### Chunk 2.3 — kitchen.store.ts + tests
```
Files: src/features/kitchen/kitchen.store.ts
       src/features/kitchen/kitchen.store.test.ts
Test:  kitchen.store.test.ts
State: { activeKitchenId: string | null, role: KitchenRole | null, kitchens: KitchenRow[] }
Actions: setActiveKitchen(id), clearKitchen()
Tests: setActiveKitchen updates state; clearKitchen resets
```

### Chunk 2.4 — kitchen.query.ts + tests
```
Files: src/features/kitchen/kitchen.query.ts
       src/features/kitchen/kitchen.query.test.ts
Test:  kitchen.query.test.ts
Queries:
  useKitchensQuery()                ← SELECT kitchens for current user
  useKitchenMembersQuery(kitchenId) ← SELECT kitchen_members for kitchen
Mutations (all with onMutate/onError/onSettled optimistic pattern):
  useCreateKitchenMutation()        ← INSERT kitchens
  useUpdateKitchenMutation()        ← UPDATE kitchens SET name
  useCreateInviteMutation()         ← INSERT kitchen_invites
  useRemoveMemberMutation()         ← DELETE kitchen_members (owner only)
Tests: mocked Supabase client; verify optimistic cache updates on mutations
```

### Chunk 2.5 — KitchenMembersComponent + tests
```
Files: src/features/kitchen/kitchen-members.component.tsx
       src/features/kitchen/kitchen.component.test.ts
Test:  kitchen.component.test.ts
UI:   Flat list of members; avatar + name + role badge; "Remove" button (owner only)
Tests: renders member list; remove button only visible when role = owner
```

### Chunk 2.6 — KitchenInviteComponent + tests
```
Files: src/features/kitchen/kitchen-invite.component.tsx
       (tests in kitchen.component.test.ts)
UI:   "Generate link" button → calls useCreateInviteMutation → shows deep-link URL
      Copy-to-clipboard button; role selector (editor/viewer); max uses input
Tests: render + generate link + copy interaction
```

### Chunk 2.7 — KitchenSettingsScreen + tests
```
Files: src/features/kitchen/kitchen-settings.screen.tsx
       src/features/kitchen/kitchen.screen.test.ts
Test:  kitchen.screen.test.ts
UI:   Kitchen name (editable inline); MembersComponent; InviteComponent; Leave/Delete (owner)
Tests: name edit calls mutation; leave button shown for non-owners
```

### Chunk 2.8 — InviteScreen + tests
```
Files: src/features/kitchen/invite.screen.tsx
       src/features/kitchen/invite.screen.test.ts
Test:  invite.screen.test.ts
UI:   "You've been invited to {kitchen_name} as {role}" + Accept/Reject buttons
      If unauthenticated → redirect to sign-in with return URL
Tests: renders invitation details; accept calls handle-invite EF
```

### Chunk 2.9 — handle-invite Edge Function: schema + service + tests
```
Files: supabase/functions/handle-invite/handle-invite.schema.ts
       supabase/functions/handle-invite/handle-invite.service.ts
       supabase/functions/handle-invite/handle-invite.handler.test.ts
Test:  handle-invite.handler.test.ts
Service logic:
  1. Find invite by token → NotFoundError if missing
  2. Check expires_at > NOW() → InviteError('EXPIRED')
  3. Check used_count < max_uses (if set) → InviteError('MAX_USES_REACHED')
  4. Check user not already a member → InviteError('ALREADY_MEMBER')
  5. INSERT kitchen_members; INCREMENT used_count
  6. Return { success: true, kitchen_id, kitchen_name, role }
Tests cover all 4 error cases + happy path
```

### Chunk 2.10 — handle-invite Edge Function: handler + pod barrel
```
Files: supabase/functions/handle-invite/handle-invite.handler.ts
       ← authenticate → validate (HandleInviteRequestSchema) → service
       src/features/kitchen/index.ts   ← update barrel exports
Test:  (covered by 2.9 tests)
```

### Phase 2 Verification
```
Create kitchen → rename → appears updated (optimistic)
Generate invite → accept on second device/simulator → member added
Viewer cannot save an item (RLS rejects 403)
bun vitest run src/features/kitchen/   → all tests pass
supabase functions serve handle-invite → curl with valid token returns 200
```

---

## Phase 3 — Items (Manual Entry)

### Chunk 3.1 — Migration: RLS for items + item_events + RPCs
```
Files: supabase/migrations/0006_rls_items.sql
       ← RLS: items (kitchen members read; editors/owners write)
       ← RLS: item_events (same as items)
       ← RPC: mark_item_used(item_id, quantity, unit, note)
       ← RPC: mark_item_wasted(item_id, quantity, unit, note)
          Both RPCs are SECURITY DEFINER (bypass RLS for the transaction)
Test:  N/A (SQL)
```

### Chunk 3.2 — item.type.ts
```
Files: src/features/item/item.type.ts
       ← ItemMachineContext: { item: ItemRow, quantityRemaining: number }
       ← ItemMachineEvent union type
Test:  N/A
```

### Chunk 3.3 — item.machine.ts + tests
```
Files: src/features/item/item.machine.ts
       src/features/item/item.machine.test.ts
Test:  item.machine.test.ts
States: active | used | wasted | expired
Events: MARK_USED(quantity, unit, note) | MARK_WASTED(quantity, unit, note) | EXPIRE
Guards:
  isFullQuantity: usedQty >= quantityRemaining → transition to terminal state
  isPartial: usedQty < quantityRemaining → stay 'active', update quantityRemaining
Actions:
  callMarkUsedRpc / callMarkWastedRpc (async actor)
Tests:
  - active + MARK_USED(all) → 'used'
  - active + MARK_USED(partial) → stays 'active', quantityRemaining updated
  - active + EXPIRE → 'expired'
  - used/wasted/expired → MARK_USED → no transition (terminal states)
```

### Chunk 3.4 — item.query.ts + tests
```
Files: src/features/item/item.query.ts
       src/features/item/item.query.test.ts
Test:  item.query.test.ts
Queries:
  useItemQuery(itemId)
  useItemEventsQuery(itemId)
Mutations (all optimistic):
  useAddItemMutation()         ← INSERT via ItemFactory.fromManualEntry()
  useUpdateItemMutation()      ← UPDATE item fields
  useMarkUsedMutation()        ← calls mark_item_used RPC
  useMarkWastedMutation()      ← calls mark_item_wasted RPC
  useSoftDeleteItemMutation()  ← soft-delete
Tests: optimistic update applied on mutate; rolled back on error; invalidated on settled
```

### Chunk 3.5 — stash.query.ts + Realtime subscription + tests
```
Files: src/features/stash/stash.query.ts
       src/features/stash/stash.query.test.ts
Test:  stash.query.test.ts
Query: useStashQuery(kitchenId)
  ← SELECT items WHERE kitchen_id = ? AND status = 'active' ORDER BY expiry_date ASC
  ← Supabase Realtime subscription: INSERT/UPDATE/DELETE → invalidate query cache
Tests: initial fetch returns data; Realtime event triggers cache invalidation
```

### Chunk 3.6 — CheckItScreen (manual-only mode) + tests
```
Files: src/features/scan/check-it.screen.tsx
       src/features/scan/check-it.screen.test.ts
Test:  check-it.screen.test.ts
UI:   react-hook-form + CheckItFormSchema
      Fields: name, tags (chip selector from ITEM_TAGS), expiry date, quantity, unit,
              purchase date, opened date, storage suggestion, notification override
      Submit → useAddItemMutation() → navigate to Stash
Tests:
  - Empty name shows validation error
  - Expiry before purchase shows cross-field error
  - Submit with valid data calls addItem mutation
Note: Image/barcode fields are stubbed (added in Phase 4)
```

### Chunk 3.7 — QuantityModalComponent + tests
```
Files: src/features/item/quantity-modal.component.tsx
       src/features/item/item.component.test.ts
Test:  item.component.test.ts
UI:   "All of it" button → MARK_USED(fullQuantity) or MARK_WASTED
      "Some of it" → shows quantity input → validates > 0 → submits partial
      Event type selector: Used / Wasted
      Note input (optional, max 300 chars)
Tests: all-of-it submits full quantity; partial requires > 0 input; note is optional
```

### Chunk 3.8 — StashItemCardComponent + tests
```
Files: src/features/stash/stash-item-card.component.tsx
       src/features/stash/stash.component.test.ts
Test:  stash.component.test.ts
UI:   Item name + tags + expiry badge (urgency colour: red/amber/green)
      Swipe left → quick actions (Mark Used / Mark Wasted)
      Tap → navigate to The Label
Tests: renders expiry badge with correct colour; swipe reveals actions
```

### Chunk 3.9 — StashScreen + tests
```
Files: src/features/stash/stash.screen.tsx
       src/features/stash/stash.screen.test.ts
Test:  stash.screen.test.ts
UI:   FlatList of StashItemCards; empty state; "Add item" FAB → Check It
      Filter chips: All / Expiring today / This week / By tag
Tests: renders list; empty state shows CTA; filter chips update displayed items
```

### Chunk 3.10 — ItemDetailComponent + tests
```
Files: src/features/item/item-label.component.tsx
       (tests in item.component.test.ts)
UI:   Full-width image (placeholder if none); name; tags; expiry badge + date
      Quantity remaining; purchase/opened dates; storage suggestion; AI confidence badge
      Edit button → opens Check It in edit mode
Tests: renders all fields; confidence badge shown only when ai_confidence > 0
```

### Chunk 3.11 — ItemLabelScreen + pod barrel updates
```
Files: src/features/item/item-label.screen.tsx
       src/features/item/item.hook.ts     ← useItemMachine(itemId) wraps XState actor
       src/features/item/item.hook.test.ts
       src/features/item/index.ts         ← update barrel
       src/features/stash/index.ts        ← update barrel
       src/features/scan/index.ts         ← export CheckItScreen
Test:  item.hook.test.ts
UI:   ItemDetailComponent + QuantityModal (opened via "Mark Used/Wasted" button)
      Back button; edit mode toggle
```

### Phase 3 Verification
```
Add item manually in Check It → appears in The Stash → tap → The Label
Swipe → Mark used (all) → disappears from Stash
Partial use → quantity updated, item remains
Partial waste → item stays, waste recorded
Two simulators → add item → appears on both (Realtime)
bun vitest run src/features/item/ src/features/stash/ src/features/scan/  → all pass
```

---

## Phase 4 — Image Upload Pipeline

### Chunk 4.PREREQ — Google AI Studio API key
```
Files: N/A — manual steps + env var setup
Test:  N/A
Steps:
  1. Go to https://aistudio.google.com/app/apikey
  2. Create API key (free tier: 1,500 requests/day)
  3. Add to local Supabase secrets:
       supabase secrets set GOOGLE_API_KEY=<your_key>
  4. Run embed-seed.ts from Phase R.10:
       GOOGLE_API_KEY=<your_key> deno run --allow-net --allow-env supabase/seed/embed-seed.ts
     This populates the 768-dim embeddings in rag_documents.
  5. Verify: rag-query now returns meaningful context for food queries
Why:  analyse-image EF and all RAG calls require this. Cannot test AI features without it.
```

### Chunk 4.1 — Migration: Supabase Storage bucket + scan_rate_limits RLS
```
Files: supabase/migrations/0007_storage_and_scan.sql
       ← Create Storage bucket 'items' (public: false)
       ← Storage policy: authenticated users can upload to items/temp/{user_id}/*
       ← Storage policy: authenticated users can read items in their kitchens
       ← RLS for scan_rate_limits (users can only see their own)
       ← RPC: increment_scan_count(p_user_id, p_date) — atomic upsert
Test:  N/A (SQL)
```

### Chunk 4.2 — Supabase Storage adapter + tests (shared EF adapter)
```
Files: supabase/functions/_shared/adapters/storage.adapter.ts
       ← implements IStoragePort
       ← upload(), signedUrl(), remove(), download() wrapping @supabase/storage-js
Test:  N/A (tested via EF integration tests in 4.6)
Why:  process-image EF needs this to download, resize, re-upload.
```

### Chunk 4.3 — Gemini adapter + tests (shared EF adapter)
```
Files: supabase/functions/_shared/adapters/gemini.adapter.ts
       ← implements IAiPort
       ← analyseImage(): calls Gemini Vision API; parses via GeminiAnalyseResponseSchema
       ← generateFunFact(): calls Gemini text generation
       ← generateNotificationMessage(): calls Gemini; enforces ≤100 chars
Test:  supabase/functions/_shared/adapters/gemini.adapter.test.ts
Tests: mock fetch; verify GeminiAnalyseResponseSchema.parse called; invariant check for vision
```

### Chunk 4.4 — analyse-image EF: schema + service + tests
```
Files: supabase/functions/analyse-image/analyse-image.schema.ts
       supabase/functions/analyse-image/analyse-image.service.ts
       supabase/functions/analyse-image/analyse-image.service.test.ts
Test:  analyse-image.service.test.ts
Service logic:
  1. ScanQuotaService.isQuotaExceeded(today_count) → 429 if over
  2. Call rag-query EF with item name hint (from barcode if provided)
  3. Call GeminiAdapter.analyseImage({ imageBase64, ragContext, barcode })
  4. Parse response via GeminiAnalyseResponseSchema
  5. If pass=false → return { pass: false, reason }
  6. If pass=true → increment_scan_count() RPC; return full response
Tests:
  - Rate limit check triggers 429
  - Moderation fail returns { pass: false, reason }
  - Success returns full GeminiAnalyseSuccess shape
  - Barcode path skips quota increment
```

### Chunk 4.5 — analyse-image EF: handler
```
Files: supabase/functions/analyse-image/analyse-image.handler.ts
       ← authenticate → validate (AnalyseImageRequestSchema) → rate-limit → service
Test:  (covered by 4.4 tests)
```

### Chunk 4.6 — process-image EF: service + handler + tests
```
Files: supabase/functions/process-image/process-image.service.ts
       supabase/functions/process-image/process-image.handler.ts
       supabase/functions/process-image/process-image.handler.test.ts
Test:  process-image.handler.test.ts
Service:
  1. Download original from Storage (download())
  2. Resize to max 800px wide, WebP quality 75 (via Deno Sharp / ImageMagick WASM)
  3. Generate 200×200 thumbnail
  4. Upload both to Storage (items/{kitchen_id}/{item_id}.webp, .thumb.webp)
  5. UPDATE items SET image_url, image_thumbnail_url
  6. DELETE original temp file
Tests: mock Storage adapter; verify resize called; verify item URLs updated
```

### Chunk 4.7 — scan.service.ts + tests (client-side orchestration)
```
Files: src/features/scan/scan.service.ts
       src/features/scan/scan.service.test.ts
Test:  scan.service.test.ts
Logic:
  analysePhoto(photo: PhotoFile, kitchenId):
    1. Resize to max 1024px JPEG quality 0.8 via expo-image-manipulator
    2. Upload to Storage items/temp/{userId}/{uuid}.jpg
    3. POST to analyse-image EF with { image: base64, kitchen_id }
    4. Return GeminiAnalyseResponse (pass/fail union)
  scanBarcode(barcode, kitchenId):
    1. GET https://world.openfoodfacts.org/api/v0/product/{barcode}.json
    2. Parse → ItemFactory.fromBarcodeResponse()
    3. Return ItemInsert (no quota consumed)
Tests: mock supabase upload + EF call; verify resize called; barcode path tested
```

### Chunk 4.8 — ItemFactory: fromGeminiResponse + fromBarcodeResponse + tests
```
Files: src/_shared/domain/factories/item.factory.ts   ← update
       src/_shared/domain/factories/item.factory.test.ts  ← update
Test:  item.factory.test.ts
Add:
  fromGeminiResponse(response: GeminiAnalyseSuccess, kitchenId): ItemInsert
    ← Uses ExpiryEstimationService when expiry_date_visible_in_image = false
  fromBarcodeResponse(product: OpenFoodFactsProduct, kitchenId): ItemInsert
Tests: both factory methods produce valid ItemInsert shapes; expiry estimation applied correctly
```

### Chunk 4.9 — SnapItScreen + tests
```
Files: src/features/scan/snap-it.screen.tsx
       src/features/scan/snap-it.screen.test.ts
Test:  snap-it.screen.test.ts
UI:   expo-camera CameraView; shutter button; flash toggle; flip camera
      Barcode scanning (expo-camera built-in detector)
      On capture → scan.service.analysePhoto() → navigate to Check It
      On barcode → scan.service.scanBarcode() → navigate to Check It
      Loading overlay during EF call; moderation error sheet on fail
Tests: shutter press calls analysePhoto; barcode detected calls scanBarcode; loading shown
```

### Chunk 4.10 — Check It screen update (add AI pre-fill) + scan.store.ts
```
Files: src/features/scan/scan.store.ts
       ← in-memory only: pendingAnalysis: GeminiAnalyseResponse | null
          currentBarcode: string | null
       src/features/scan/check-it.screen.tsx  ← update: read from scan.store → pre-fill form
Test:  check-it.screen.test.ts update
Why:  After AI analysis, Check It form is pre-filled. User reviews/edits → submits.
      Clears scan.store on submit or cancel.
```

### Phase 4 Verification
```
Photograph milk → Check It pre-filled with "Whole Milk", tags: [Dairy], expiry from image
Edit name → save → item in Stash with thumbnail (process-image ran)
Photograph newspaper → moderation sheet shows "NOT_FOOD"
Scan barcode → Check It pre-filled from Open Food Facts (no AI quota used)
Scan 20 items → 21st shows quota error
bun vitest run src/features/scan/ src/_shared/domain/  → all pass
supabase functions serve analyse-image process-image   → curl tests pass
```

---

## Phase 5 — The Haul (Bulk Scanning)

### Chunk 5.1 — haul.service.ts + tests (Effect Stream, max 5 concurrent)
```
Files: src/features/scan/haul.service.ts
       src/features/scan/haul.service.test.ts
Test:  haul.service.test.ts
Logic: processBatch(photos: PhotoFile[], kitchenId, remainingQuota):
  1. Pre-check: if photos.length > remainingQuota → warn, trim to remainingQuota
  2. Process up to 5 concurrently (Promise.allSettled with concurrency limiter)
     Note: Effect Stream used in the analyse-image EF side;
           client side uses a simple semaphore pattern (no Effect on RN client)
  3. Return results: { ready, checkIt, flagged } grouped by confidence
Tests: 5-concurrent limit enforced; quota pre-check trims batch; failed items flagged
```

### Chunk 5.2 — HaulItemCardComponent + tests
```
Files: src/features/scan/haul-item-card.component.tsx
       (tests in haul.service.test.ts → component tests in 5.3)
UI:   Thumbnail + AI name + expiry; status badge (Ready/Check It/Flagged)
      Inline edit form (expand on tap) for Check It items
      "Re-shoot" and "Enter Manually" buttons for Flagged items
```

### Chunk 5.3 — LineEmUpScreen + tests
```
Files: src/features/scan/line-em-up.screen.tsx
       src/features/scan/line-em-up.screen.test.ts
Test:  line-em-up.screen.test.ts
UI:   ScrollView of HaulItemCards; "Add {n} to Kitchen" button (n = ready + edited)
      Flagged items not included in n; editing in-line updates count
Tests: correct count shown; flagged excluded; Add button calls addItem for each non-flagged
```

### Chunk 5.4 — HaulScreen + scan.store update + barrel
```
Files: src/features/scan/haul.screen.tsx
       src/features/scan/scan.store.ts     ← update: add batch[], progress state
       src/features/scan/haul.screen.test.ts
       src/features/scan/index.ts          ← export HaulScreen, LineEmUpScreen
Test:  haul.screen.test.ts
UI:   expo-camera in continuous mode; bottom strip of thumbnails
      "Done" button → rate limit pre-check → haul.service.processBatch() → Line 'Em Up
Tests: Done button triggers batch; rate limit warning shown when quota tight
```

### Phase 5 Verification
```
Photograph 5 items in The Haul → Line 'Em Up shows correct status badges
"Add 4 to Kitchen" (1 flagged) → 4 in Stash
Inline edit → check-it fields → badge updates to Ready
Rate limit: 3 remaining, batch of 5 → warning + trimmed to 3
bun vitest run src/features/scan/   → all pass
```

---

## Phase 6 — Dashboard (The Fridge Door)

### Chunk 6.1 — generate-fun-fact EF: schema + service + tests
```
Files: supabase/functions/generate-fun-fact/generate-fun-fact.schema.ts
       supabase/functions/generate-fun-fact/generate-fun-fact.service.ts
       supabase/functions/generate-fun-fact/generate-fun-fact.service.test.ts
Test:  generate-fun-fact.service.test.ts
Service:
  1. Check daily_kitchen_cache for (kitchen_id, TODAY) → return cached if exists
  2. SELECT random unexpired item from kitchen
  3. Call rag-query EF for item context
  4. GeminiAdapter.generateFunFact({ itemName, ragContext })
  5. INSERT into daily_kitchen_cache
  6. Return { fun_fact, item_name, item_id, cached: false }
Tests: cache hit returns immediately; no Gemini call; cache miss calls Gemini + saves
```

### Chunk 6.2 — generate-fun-fact EF: handler
```
Files: supabase/functions/generate-fun-fact/generate-fun-fact.handler.ts
       ← authenticate → validate (GenerateFunFactRequestSchema) → service
Test:  (covered by 6.1)
```

### Chunk 6.3 — Migration: RLS for daily_kitchen_cache + notification_log
```
Files: supabase/migrations/0008_rls_notifications.sql
       ← RLS: daily_kitchen_cache (kitchen members can read; no direct client write)
       ← RLS: notification_log (users can read their own; no client write)
Test:  N/A
```

### Chunk 6.4 — dashboard.query.ts + tests
```
Files: src/features/dashboard/dashboard.query.ts
       src/features/dashboard/dashboard.query.test.ts
Test:  dashboard.query.test.ts
Queries:
  useDashboardItemsQuery(kitchenId) ← items grouped by urgency (today/thisWeek/ok)
  useFunFactQuery(kitchenId)        ← GET generate-fun-fact EF; staleTime: end-of-day
  useWasteStatsQuery(kitchenId)     ← COUNT item_events by type for current month
Tests: urgency grouping correct; fun fact cached until midnight
```

### Chunk 6.5 — UrgencyGridComponent + tests
```
Files: src/features/dashboard/urgency-grid.component.tsx
       src/features/dashboard/dashboard.component.test.ts
Test:  dashboard.component.test.ts
UI:   3 sections: "Today" (red) / "This Week" (amber) / "All Good" (green)
      Each section: count badge + horizontal scroll of item chips (tap → The Label)
Tests: items sorted into correct urgency buckets; tapping chip navigates
```

### Chunk 6.6 — FunFactCardComponent + WasteStatsComponent + tests
```
Files: src/features/dashboard/fun-fact-card.component.tsx
       src/features/dashboard/waste-stats.component.tsx
       (tests in dashboard.component.test.ts)
FunFact: fun fact text + item name badge + "🎲 New fact" button (clears cache, re-fetches)
Stats: "Used: X | Wasted: Y | Saved: Z%" for current month
Tests: fun fact displays; item badge links to The Label; stats render correctly
```

### Chunk 6.7 — DashboardScreen + barrel update
```
Files: src/features/dashboard/dashboard.screen.tsx
       src/features/dashboard/dashboard.hook.ts   ← useDashboard() — composes queries
       src/features/dashboard/dashboard.hook.test.ts
       src/features/dashboard/index.ts
Test:  dashboard.hook.test.ts
UI:   UrgencyGrid + FunFactCard + WasteStats in a ScrollView
      Pull-to-refresh; empty state (no items yet → "Start by scanning something")
```

### Phase 6 Verification
```
Dashboard loads with urgency grid + fun fact
Add items with different expiry dates → correct urgency buckets
Second load same day → fun fact cached (no new Gemini call)
Next day → new fun fact
bun vitest run src/features/dashboard/  → all pass
supabase functions serve generate-fun-fact rag-query  → integration curl passes
```

---

## Phase 7 — Push Notifications (Heads Up)

### Chunk 7.PREREQ — Expo push notification setup
```
Files: N/A — manual steps
Test:  N/A
Steps:
  1. bun add expo-notifications  (already installed from Phase 0A)
  2. EAS account: npx eas login
  3. iOS: npx eas credentials → generate push certificate (requires Apple Developer account)
     (or use Expo-managed credentials: easiest path for solo dev)
  4. Android: Firebase project → download google-services.json → add to app root
  5. Add to app.json:
       "plugins": [["expo-notifications", { "icon": "./assets/images/notification-icon.png" }]]
  6. Rebuild dev client: expo run:ios / expo run:android
Why:  expo-notifications requires native code changes → dev client rebuild needed.
```

### Chunk 7.1 — Migration: RLS for push_tokens + pg_cron notification job
```
Files: supabase/migrations/0009_push_tokens_and_cron.sql
       ← RLS: push_tokens (users manage their own tokens only)
       ← pg_cron: SELECT cron.schedule('send-daily-notifications', '0 8 * * *',
            $$ SELECT net.http_post(...) TO send-notifications EF $$)
       ← pg_cron: SELECT cron.schedule('mark-items-expired', '0 2 * * *',
            $$ UPDATE items SET status='expired' WHERE expiry_date < CURRENT_DATE AND status='active' $$)
Test:  N/A
```

### Chunk 7.2 — src/lib/notifications.ts (full implementation) + tests
```
Files: src/lib/notifications.ts     ← replace stub from Phase 0.20
       src/lib/notifications.test.ts
Test:  notifications.test.ts
Functions:
  requestPermissions() → boolean
  registerPushToken(userId) → upsert push_tokens
  registerNotificationCategories() → register 'EXPIRY_ALERT' category with MARK_USED/MARK_WASTED
  setupNotificationListeners(onResponse) → background response handler
Tests: mock Expo Notifications module; verify token upserted; categories registered
```

### Chunk 7.3 — send-notifications EF: Expo Push adapter + tests
```
Files: supabase/functions/_shared/adapters/expo-push.adapter.ts
       supabase/functions/_shared/adapters/expo-push.adapter.test.ts
Test:  expo-push.adapter.test.ts
Logic: send(payloads) → POST https://exp.host/--/api/v2/push/send
       Parse receipt: on 410 DeviceNotRegistered → return failed token for cleanup
Tests: mock fetch; 410 response returns failed token; batch limit respected
```

### Chunk 7.4 — send-notifications EF: service + tests
```
Files: supabase/functions/send-notifications/send-notifications.service.ts
       supabase/functions/send-notifications/send-notifications.service.test.ts
Test:  send-notifications.service.test.ts
Service:
  1. NotificationScheduleService.getItemsDueForNotification()
  2. For each item: fetch kitchen members + push tokens
  3. RAG query for item context
  4. GeminiAdapter.generateNotificationMessage() → ≤100 chars
  5. Build ExpoPushPayload per token; validate via ExpoPushPayloadSchema
  6. ExpoPushAdapter.send(payloads)
  7. On failed tokens: DELETE push_tokens
  8. INSERT notification_log for all sent
  9. Return { notifications_sent, errors }
Tests: due items found; messages generated; failed tokens cleaned up; log inserted
```

### Chunk 7.5 — send-notifications EF: handler
```
Files: supabase/functions/send-notifications/send-notifications.handler.ts
       ← no request body (cron-triggered); authenticate via service_role key
       ← calls service; returns SendNotificationsResponseSchema
Test:  (covered by 7.4)
```

### Chunk 7.6 — settings.store.ts + HeadsUpScreen + tests
```
Files: src/features/settings/settings.store.ts
       ← notificationDaysBefore: number (1–30); locale: string | null
       ← persisted to expo-file-system (non-sensitive)
       src/features/settings/heads-up.screen.tsx
       src/features/settings/heads-up.screen.test.ts
Test:  heads-up.screen.test.ts
UI:   Notifications on/off toggle; days-before stepper (1–30)
      On toggle on → requestPermissions() → register token
      Stepper updates user_settings in DB + settingsStore
Tests: toggle calls permissions request; stepper range enforced; saves to DB
```

### Chunk 7.7 — Notification background handlers + app/_layout.tsx update
```
Files: app/_layout.tsx   ← update: add notification listener in useEffect
Test:  N/A (requires device testing)
Logic:
  Notifications.addNotificationResponseReceivedListener(response => {
    const { actionIdentifier, notification } = response
    const { item_id } = notification.request.content.data
    if (actionIdentifier === 'MARK_USED') → call mark_item_used RPC (no navigation)
    if (actionIdentifier === 'MARK_WASTED') → call mark_item_wasted RPC
    else → router.push(`/stash/${item_id}`)
  })
```

### Chunk 7.8 — ItemLabelScreen: per-item notification override + barrel updates
```
Files: src/features/item/item-label.screen.tsx   ← update: add notification days stepper
       src/features/settings/index.ts
       src/lib/index.ts   ← export supabase, queryClient, notifications
Test:  (covered by item.component.test.ts update)
```

### Phase 7 Verification
```
Install on real device → grant notifications → push_tokens row in DB
Manually invoke send-notifications via curl → notification arrives on device
Quick Action "Used it" → item marked without opening app
Heads Up: change to 3 days → notification sent 3 days before expiry
Failed token 410 → token deleted from DB
bun vitest run src/features/settings/ src/lib/  → all pass
```

---

## Phase 8 — The Bin & Waste History

### Chunk 8.1 — bin.query.ts + tests
```
Files: src/features/bin/bin.query.ts
       src/features/bin/bin.query.test.ts
Test:  bin.query.test.ts
Query: useBinQuery(kitchenId)
  ← useInfiniteQuery on item_events JOIN items
  ← WHERE event_type = 'wasted' AND kitchen_id = ?
  ← ORDER BY item_events.created_at DESC; pageSize: 20
Tests: first page loads; second page fetched on getNextPage; join produces correct shape
```

### Chunk 8.2 — BinEntryComponent + tests
```
Files: src/features/bin/bin-entry.component.tsx
       src/features/bin/bin.component.test.ts
Test:  bin.component.test.ts
UI:   Item name + quantity wasted + date + optional note
      Grouped by date header (Today / Yesterday / {date})
Tests: renders correct fields; date grouping correct
```

### Chunk 8.3 — BinScreen + barrel
```
Files: src/features/bin/bin.screen.tsx
       src/features/bin/bin.screen.test.ts
       src/features/bin/index.ts
Test:  bin.screen.test.ts
UI:   useBinQuery() → FlatList of BinEntryComponents; empty state; infinite scroll
Tests: empty state shown when no waste; scroll loads next page
```

### Phase 8 Verification
```
Mark 3 items wasted → appear in The Bin grouped by date
Partial waste event appears as its own entry
Scroll past 20 items → page 2 loads
bun vitest run src/features/bin/  → all pass
```

---

## Phase 9 — Settings & Account Management

### Chunk 9.PREREQ — EAS account + Apple Developer account (for deletion + export)
```
Files: N/A — manual step
Steps:
  1. npx eas login  (if not done in 7.PREREQ)
  2. Apple Developer account → already needed for Phase 1 OAuth
  3. GDPR data export doesn't need extra credentials (just expo-sharing)
```

### Chunk 9.1 — Migration: account deletion RPCs + pg_cron cleanup
```
Files: supabase/migrations/0010_account_deletion.sql
       ← RPC: delete_account(user_id)
            - DELETE Storage objects for user
            - UPDATE users SET deleted_at = NOW()
            - DELETE push_tokens WHERE user_id
       ← pg_cron: daily at 03:00 UTC:
            UPDATE users SET deleted_at = NULL ... (hard-delete where deleted_at < NOW() - 30 days)
            CASCADE: all items, events, memberships hard-deleted automatically
Test:  N/A (SQL)
```

### Chunk 9.2 — auth.service.ts + tests
```
Files: src/features/auth/auth.service.ts
       src/features/auth/auth.service.test.ts
Test:  auth.service.test.ts
Functions:
  deleteAccount(userId):
    1. supabase.rpc('delete_account')
    2. authStore.signOut()
  exportUserData(userId) → JSON blob of items + events + memberships
  upgradeFromAnon(provider) → supabase.auth.linkIdentity()
Tests: deleteAccount calls RPC + signOut; exportData returns correct JSON shape
```

### Chunk 9.3 — AccountScreen + tests
```
Files: src/features/settings/account.screen.tsx
       src/features/settings/account.screen.test.ts
Test:  account.screen.test.ts
UI:   Auth provider badge ("Guest" / "Google" / "Apple")
      Upgrade section (for anon users): Connect Google / Connect Apple
      "Export my data" → generates JSON → expo-sharing sheet
      "Delete account" → 3-second confirmation countdown → deleteAccount()
Tests: delete requires confirmation; export triggers share sheet; upgrade for anon only
```

### Chunk 9.4 — SettingsScreen + barrel updates
```
Files: src/features/settings/settings.screen.tsx
       src/features/settings/settings.hook.ts
       src/features/settings/settings.screen.test.ts
       src/features/settings/index.ts
Test:  settings.screen.test.ts
UI:   Sections: Kitchen → kitchen settings; Heads Up → notification prefs
      Account → AccountScreen; About (version, privacy policy link)
Tests: tapping Kitchen navigates to kitchen settings; sections render
```

### Phase 9 Verification
```
Delete account → images gone from Storage → soft-deleted → welcome screen shown
OAuth upgrade: guest → Connect Google → same kitchen retained
Data export: share sheet opens with JSON
Settings screen: all 4 sections present and navigable
bun vitest run src/features/settings/ src/features/auth/  → all pass
```

---

## Phase 10 — Polish, Tests & CI/CD

### Chunk 10.1 — Design tokens finalisation
```
Files: src/constants/tokens.ts   ← update with final colour palette + spacing
Test:  N/A (visual verification)
Note: Coordinate with design direction. Single-file swap — no component changes.
```

### Chunk 10.2 — Coverage audit + missing unit tests
```
Files: All *.test.ts files needing coverage bump
Test:  bun vitest run --coverage → target ≥80% unit, ≥70% component
```

### Chunk 10.3 — E2E Maestro: flows 1–3 (auth, manual add, single scan)
```
Files: e2e/flows/auth-anon-to-oauth.yaml
       e2e/flows/add-item-manual.yaml
       e2e/flows/scan-single.yaml
Test:  npx maestro test e2e/flows/
```

### Chunk 10.4 — E2E Maestro: flows 4–6 (haul, mark used, mark wasted)
```
Files: e2e/flows/scan-haul.yaml
       e2e/flows/mark-used.yaml
       e2e/flows/mark-wasted.yaml
```

### Chunk 10.5 — E2E Maestro: flows 7–9 (invite, notification, delete)
```
Files: e2e/flows/invite-kitchen.yaml
       e2e/flows/notification-quickaction.yaml
       e2e/flows/account-delete.yaml
```

### Chunk 10.6 — CI: test + lint + tsc pipeline
```
Files: .github/workflows/ci.yml
       ← trigger: pull_request to main
       ← steps: bun install, tsc --noEmit, vitest --coverage, supabase db lint
```

### Chunk 10.7 — CI: EAS preview build
```
Files: .github/workflows/ci.yml   ← update: add EAS build step
       eas.json                   ← preview profile: internal distribution
       ← trigger: push to main
```

### Chunk 10.8 — RAG re-seed GitHub Action
```
Files: .github/workflows/seed-rag.yml
       ← trigger: manual workflow_dispatch
       ← runs embed-seed.ts with GOOGLE_API_KEY secret
       ← also runs supabase db push migrations to production
```

### Phase 10 Verification
```
bun vitest run --coverage → unit ≥80%, component ≥70%
All 9 Maestro flows pass on iOS simulator + Android emulator
EAS Build succeeds
bun tsc --noEmit → zero errors
eslint → zero warnings
```

---

## Intra-Chunk Rules

1. **File order within a chunk:** types/schemas → domain → ports → adapters → queries/stores → screens/components → tests → barrel
2. **Every commit = one chunk**
3. **TDD:** implementation file + test file in the same commit. If a file has no meaningful tests (barrel, config, SQL), note "N/A" and do not create an empty test file.
4. **Failing tests = blocked commit.** Never commit with a red test suite.
5. **`bun tsc --noEmit` must pass before each commit.** Never leave TypeScript errors.

---

## Total Chunk Count

| Phase | Chunks |
|---|---|
| 0 (Foundation) | 22 (incl. PREREQ) |
| R (RAG Pipeline) | 12 (incl. PREREQ) |
| 1 (Auth) | 9 (incl. PREREQ) |
| 2 (Kitchen) | 10 |
| 3 (Items) | 11 |
| 4 (Image pipeline) | 11 (incl. PREREQ) |
| 5 (The Haul) | 4 |
| 6 (Dashboard) | 7 |
| 7 (Notifications) | 8 (incl. PREREQ) |
| 8 (The Bin) | 3 |
| 9 (Settings) | 4 (incl. PREREQ) |
| 10 (Polish) | 8 |
| **Total** | **~109 chunks** |

At 1 hour/chunk → approximately 109 hours of focused work (~14 full working days).
