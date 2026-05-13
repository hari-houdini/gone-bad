# Gone Bad — Technical Design Document

**Version:** 1.0.0-draft  
**Status:** Draft  
**Date:** 10 May 2026  
**Authors:** Vavvaal, Claude (Anthropic)  
**Classification:** Internal — Technical

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)  
2. [Glossary](#2-glossary)  
3. [Product Overview](#3-product-overview)  
4. [Architecture Overview](#4-architecture-overview)  
5. [Technology Stack](#5-technology-stack)  
6. [Frontend Architecture](#6-frontend-architecture)  
7. [Backend Architecture](#7-backend-architecture)  
8. [Database Schema](#8-database-schema)  
9. [AI & RAG Pipeline](#9-ai--rag-pipeline)  
10. [Image Processing Pipeline](#10-image-processing-pipeline)  
11. [Feature Specifications](#11-feature-specifications)  
12. [Notification System](#12-notification-system)  
13. [Security Architecture](#13-security-architecture)  
14. [Privacy & Legal Compliance](#14-privacy--legal-compliance)  
15. [Cost Model](#15-cost-model)  
16. [Non-Functional Requirements](#16-non-functional-requirements)  
17. [Testing Strategy](#17-testing-strategy)  
18. [CI/CD & Deployment](#18-cicd--deployment)  
19. [Future Scope — v2](#19-future-scope--v2)  
20. [Risk Register](#20-risk-register)

---

## 1\. Executive Summary

**Gone Bad** is a cross-platform mobile application (iOS \+ Android) built with Expo that helps individuals and households track food and ingredient expiry dates. It is AI-powered using Google Gemini 2.0 Flash for vision-based food recognition, a RAG knowledge system for intelligent suggestions and expiry estimation, and a playful, brutally funny personality inspired by Not Boring Software's design ethos.

The application is designed to be zero-cost throughout development and early operation, with a clear cost-escalation plan as usage grows. It targets the UK, EU, US, and Indian markets from day one and is built to comply with GDPR, UK GDPR, India's DPDP Act 2023, and US privacy requirements (CCPA, COPPA).

**Core Differentiators:**

- AI-powered image analysis with barcode scanning as a zero-quota fallback  
- Funny, brutal, item-specific push notifications generated via RAG  
- Multi-user shared Kitchens with role-based access control  
- Quantity-level waste and usage tracking  
- Legally compliant across four major jurisdictions from v1  
- Zero-cost architecture with a clear path to paid scaling

---

## 2\. Glossary

These are the canonical names used throughout this document and in all user-facing copy. Generic equivalents must not appear in the UI.

| Canonical Name | Generic Equivalent | Description |
| :---- | :---- | :---- |
| **Gone Bad** | — | The application |
| **The Fridge Door** | Dashboard | Comprehensive overview screen |
| **The Kitchen** | Pantry / Shared space | A pantry-space shared by one or more users |
| **The Stash** | List view | All active tracked items in a Kitchen |
| **The Label** | Detail view | Single item detail screen |
| **Snap It** | Single upload | Single-photo upload flow |
| **The Haul** | Bulk upload | Multi-photo upload flow |
| **Check It** | Single review | Review screen after Snap It |
| **Line 'Em Up** | Bulk review | Review screen after The Haul |
| **The Bin** | Waste log | Permanent log of wasted items |
| **Finished** | Used items | 14-day view of consumed items |
| **House Rules** | Settings | Application settings screen |
| **Heads Up** | Notification settings | Notification configuration sub-screen |
| **Fun Fact** | Daily quote | RAG-generated daily item fact on The Fridge Door |
| **Gone Waste** | Discarded | Item or quantity thrown away without use |
| **Used** | Consumed | Item or quantity consumed |
| **Quick Action** | Notification button | iOS/Android notification action button |

---

## 3\. Product Overview

### 3.1 App Identity

- **Name:** Gone Bad  
- **Tagline:** Your fridge's brutally honest bestie.  
- **Tone:** Aggressively playful. Brutally honest. Never offensive. A mate who roasts your food choices with love.  
- **Design Inspiration:** Not Boring Software — game-feel, physics/spring animation, haptics, bold clarity, no menu bloat.

### 3.2 Target Users

- Individuals managing household food stock  
- Shared households (flatmates, families)  
- Anyone who has ever thrown out milk and felt personally betrayed

### 3.3 Target Markets (v1)

United Kingdom, European Union, United States, India

### 3.4 Platforms

iOS 16+ and Android 13+ — distributed via App Store and Google Play. Expo SDK 52, Expo Router v4.

### 3.5 Key Constraints

- **Zero-cost architecture** throughout v1; clear escalation plan defined  
- **No PII collection** beyond what is strictly necessary for service delivery  
- **No guest mode** — all users authenticate (anonymous auth is the minimum)  
- **Multi-device support** — one account, many devices  
- **Multi-Kitchen support** — one user, many Kitchens, one default

---

## 4\. Architecture Overview

┌─────────────────────────────────────────────────────────────────┐

│                          CLIENT LAYER                           │

│       Expo (React Native) \+ Expo Router v4 (iOS \+ Android)      │

│     Zustand (local state) \+ TanStack Query (server state)       │

└───────────────┬──────────────────────────┬──────────────────────┘

                │ REST / Realtime           │ Push tokens

                ▼                           ▼

┌───────────────────────────┐   ┌────────────────────────┐

│      SUPABASE BACKEND     │   │   EXPO PUSH SERVICE    │

│                           │   │   (free, Expo-managed) │

│  ┌───────────────────┐    │   └────────────────────────┘

│  │   PostgreSQL 15   │    │

│  │   \+ pgvector      │    │

│  │   \+ pg\_cron       │    │

│  │   \+ pg\_net        │    │

│  └────────┬──────────┘    │

│           │               │

│  ┌────────▼──────────┐    │

│  │  Supabase Auth    │    │

│  │  (Anon \+ OAuth)   │    │

│  └───────────────────┘    │

│                           │

│  ┌───────────────────┐    │

│  │ Supabase Storage  │    │

│  │ (Images — WebP)   │    │

│  └───────────────────┘    │

│                           │

│  ┌───────────────────┐    │

│  │  Edge Functions   │    │

│  │  (Deno runtime)   │    │

│  └───────────────────┘    │

└───────────────┬────────────┘

                │ HTTPS

                ▼

┌─────────────────────────────────────────────────────────────────┐

│                      AI & EXTERNAL LAYER                        │

│                                                                 │

│  Google Gemini 2.0 Flash       Open Food Facts API              │

│  Vision \+ Moderation \+         Barcode lookup (CC0, free)       │

│  RAG generation \+                                               │

│  Embedding (text-embedding-004) USDA FoodData Central           │

│                                RAG seeding (public API, free)   │

│                                                                 │

│                                NHS / EFSA food safety data      │

│                                RAG seeding (open licence)       │

└─────────────────────────────────────────────────────────────────┘

### 4.1 Architectural Decision Records (ADRs)

| \# | Decision | Rationale |
| :---- | :---- | :---- |
| ADR-001 | Supabase as sole backend | Postgres \+ pgvector \+ Storage \+ Auth \+ Edge Functions \+ Realtime on one free-tier platform. Eliminates multi-service orchestration complexity. |
| ADR-002 | Gemini 2.0 Flash as AI provider | 1,500 free requests/day with vision capability. Anthropic API has no free tier. Provider abstraction layer allows future swap. |
| ADR-003 | Expo Router v4 (file-based routing) | Industry standard for Expo SDK 52+. Superior deep-link handling for invite URLs and notification deep-links vs React Navigation. |
| ADR-004 | Anonymous auth as default | Zero-friction onboarding. No PII collected unless user opts into OAuth. GDPR-safe — anonymous UUIDs with no linkable personal data. |
| ADR-005 | pgvector for RAG | Avoids a separate vector DB (Pinecone, Weaviate). Co-located with application data. Free on Supabase. Sufficient for \< 1M vectors. |
| ADR-006 | Single Gemini call per image | Combines moderation \+ extraction in one prompt. Preserves free-tier quota. One failure mode, not two. |
| ADR-007 | Server-sent notifications via pg\_cron \+ pg\_net | Enables notifications even when the app is closed. Free on Supabase. 200–500ms Edge Function cold-start latency is acceptable for daily reminders. |
| ADR-008 | Expo Push Notifications | Free. Abstracts APNs (Apple) and FCM (Google). No third-party service required. |
| ADR-009 | Per-user scan rate limit (20/day) | Protects Gemini free-tier quota. 75 daily active users × 20 scans \= 1,500 scans/day, matching the free tier ceiling exactly. |

---

## 5\. Technology Stack

### 5.1 Client

| Layer | Technology | Version | Purpose |
| :---- | :---- | :---- | :---- |
| Framework | Expo | SDK 52 | Cross-platform React Native wrapper |
| Routing | Expo Router | v4 | File-based routing, deep links |
| Language | TypeScript | 5.x | Type safety throughout |
| State (local) | Zustand | 5.x | UI state, Kitchen context, upload session |
| State (server) | TanStack Query | v5 | Server cache, sync, optimistic updates |
| Camera | expo-camera | latest | Photo capture \+ built-in barcode scanning |
| Image display | expo-image | latest | Optimised rendering, disc/memory caching |
| Image manipulation | expo-image-manipulator | latest | On-device resize before upload |
| Notifications | expo-notifications | latest | Push token registration, local fallback, quick actions |
| Haptics | expo-haptics | latest | Game-feel micro-interactions |
| Secure storage | expo-secure-store | latest | Session token, auth state |
| Forms | react-hook-form \+ zod | latest | Validated field handling |
| Animation | react-native-reanimated | 3.x | Physics/spring animations |
| List rendering | @shopify/flash-list | latest | High-performance list (replaces FlatList) |
| Supabase client | @supabase/supabase-js | v2 | All backend communication |

### 5.2 Backend

| Layer | Technology | Purpose |
| :---- | :---- | :---- |
| Database | Supabase Postgres 15 | Primary data store |
| Vector store | pgvector (extension) | RAG document embeddings |
| Scheduler | pg\_cron (extension) | Daily notification and retention jobs |
| HTTP from DB | pg\_net (extension) | Trigger Edge Functions from cron jobs |
| Auth | Supabase Auth | Anonymous \+ Google \+ Apple OAuth |
| Storage | Supabase Storage | Item images (WebP optimised) |
| Edge Functions | Supabase Edge Functions (Deno) | AI calls, image processing, push dispatch |
| Realtime | Supabase Realtime | Cross-device Kitchen sync |

### 5.3 External Services

| Service | Purpose | Cost |
| :---- | :---- | :---- |
| Google Gemini 2.0 Flash | Vision analysis, moderation, RAG generation | Free (1,500 req/day) |
| Google text-embedding-004 | RAG document embedding | Free (1M tokens/day) |
| Open Food Facts API | Barcode lookup | Free (CC0) |
| USDA FoodData Central | RAG seeding data | Free (public API) |
| NHS / EFSA data | RAG seeding data | Free (open licences) |
| Expo Push Service | Notification delivery to APNs \+ FCM | Free |
| EAS Build | App compilation \+ OTA updates | Free (30 builds/month) |
| GitHub Actions | CI/CD pipeline | Free (2,000 min/month) |

---

## 6\. Frontend Architecture

### 6.1 File Structure

gone-bad/

├── app/                               \# Expo Router pages

│   ├── \_layout.tsx                    \# Root layout — auth gate, providers

│   ├── (auth)/

│   │   ├── \_layout.tsx

│   │   ├── welcome.tsx                \# Onboarding

│   │   └── sign-in.tsx                \# Auth options screen

│   ├── (app)/

│   │   ├── \_layout.tsx                \# Bottom tab navigator

│   │   ├── index.tsx                  \# The Fridge Door

│   │   ├── stash/

│   │   │   ├── index.tsx              \# The Stash

│   │   │   └── \[id\].tsx               \# The Label

│   │   ├── snap/

│   │   │   ├── index.tsx              \# Mode selector (Snap It / The Haul)

│   │   │   ├── single.tsx             \# Snap It camera

│   │   │   ├── haul.tsx               \# The Haul camera

│   │   │   ├── check-it.tsx           \# Check It (single review)

│   │   │   └── line-em-up.tsx         \# Line 'Em Up (bulk review)

│   │   ├── bin/

│   │   │   └── index.tsx              \# The Bin

│   │   └── rules/

│   │       ├── index.tsx              \# House Rules

│   │       ├── heads-up.tsx           \# Heads Up (notification settings)

│   │       ├── kitchen.tsx            \# Kitchen management

│   │       └── account.tsx            \# Account & data privacy

│   └── kitchen/

│       └── invite/\[token\].tsx         \# Invite deep-link handler (outside tab shell)

├── src/

│   ├── components/

│   │   ├── ui/                        \# Primitives: Button, Card, Badge, Sheet, etc.

│   │   ├── item/                      \# ItemCard, QuantityModal, ExpiryBadge, etc.

│   │   ├── camera/                    \# CameraView, BarcodeOverlay, HaulStrip

│   │   └── dashboard/                 \# FunFactCard, UrgencyGrid, CategoryChart, etc.

│   ├── hooks/

│   │   ├── useKitchen.ts

│   │   ├── useUploadSession.ts

│   │   ├── useNotifications.ts

│   │   └── useRateLimit.ts

│   ├── stores/

│   │   ├── authStore.ts               \# Session, user ID, auth provider

│   │   ├── kitchenStore.ts            \# Active Kitchen, role, members

│   │   ├── uploadStore.ts             \# In-progress upload batch state

│   │   └── settingsStore.ts           \# House Rules values (persisted)

│   ├── queries/

│   │   ├── items.ts                   \# All item-related TanStack Query definitions

│   │   ├── kitchen.ts

│   │   ├── dashboard.ts

│   │   └── funFact.ts

│   ├── lib/

│   │   ├── supabase.ts                \# Supabase client instance

│   │   ├── ai.ts                      \# AI provider abstraction (swappable)

│   │   └── notifications.ts           \# Expo push token management

│   ├── types/

│   │   ├── item.ts                    \# Zod schemas \+ inferred TS types

│   │   ├── kitchen.ts

│   │   └── user.ts

│   ├── constants/

│   │   ├── tags.ts                    \# Taxonomy tag definitions

│   │   └── config.ts                  \# App-wide constants, rate limits

│   └── utils/

│       ├── expiry.ts                  \# Expiry date calculations, bucket logic

│       ├── quantity.ts                \# Unit parsing, quantity math

│       └── image.ts                   \# On-device image resize helpers

├── supabase/

│   ├── migrations/                    \# Numbered SQL migrations

│   ├── functions/

│   │   ├── analyse-image/             \# Gemini vision \+ moderation

│   │   ├── process-image/             \# Sharp image compression \+ thumbnail

│   │   ├── generate-fun-fact/         \# Daily RAG fun fact per Kitchen

│   │   ├── send-notifications/        \# Cron-triggered push dispatch

│   │   ├── rag-query/                 \# pgvector similarity search

│   │   └── handle-invite/             \# Invite token validation \+ Kitchen join

│   └── seed/

│       └── rag-seed.ts                \# One-time RAG data ingestion script

├── .github/

│   └── workflows/

│       ├── ci.yml

│       ├── eas-preview.yml

│       └── eas-production.yml

└── eas.json

### 6.2 State Management Strategy

┌──────────────────────────────────────────────────────────────┐

│                      ZUSTAND STORES                          │

│                                                              │

│  authStore      — session, user ID, anonymous flag           │

│  kitchenStore   — active Kitchen ID, role, member list       │

│  uploadStore    — in-progress upload batch (temp file paths, │

│                   AI results, flagged items, edit state)     │

│  settingsStore  — House Rules values (persisted to disk)     │

└────────────────────────────┬─────────────────────────────────┘

                             │ triggers/invalidates

                             ▼

┌──────────────────────────────────────────────────────────────┐

│                     TANSTACK QUERY                           │

│                                                              │

│  itemsQuery        — paginated Stash (active items)          │

│  itemDetailQuery   — single item by ID                       │

│  binQuery          — The Bin (wasted items)                  │

│  finishedQuery     — Finished tab (used, 14-day window)      │

│  fridgeDoorQuery   — dashboard aggregates                    │

│  funFactQuery      — daily cached fun fact                   │

│  kitchenQuery      — members, role, invite links             │

└──────────────────────────────────────────────────────────────┘

**Persistence strategy:**

- `settingsStore`: Zustand `persist` middleware → `expo-file-system` (non-sensitive)  
- `authStore`: Zustand `persist` middleware → `expo-secure-store` (hardware-backed)  
- `uploadStore`: in-memory only — never persisted to disk

### 6.3 Navigation Structure

Five bottom tabs. Camera is a FAB-style central button opening a bottom sheet.

┌──────────────────────────────────────────────────────┐

│                                                      │

│  \[ Fridge Door \] \[ Stash \] \[ 📷 \] \[ Bin \] \[ Rules \] │

│                             ↑                        │

│                    FAB — opens sheet:                │

│                    "Snap It" | "The Haul"            │

└──────────────────────────────────────────────────────┘

**Deep link scheme:** `gonebad://`

- `gonebad://kitchen/invite/{token}` — Kitchen invite  
- `gonebad://item/{id}` — Notification tap → The Label

### 6.4 Design Tokens (Placeholder — v1)

Theming is bare-bones in v1. Full visual identity (custom font, skin system, 3D elements) is deferred to v2. Placeholder structure only — all values are swappable.

// src/constants/tokens.ts

export const tokens \= {

  colors: {

    urgent:     '\#FF3B30',  // Expired / critical

    warning:    '\#FF9500',  // Expiring soon (≤3 days)

    safe:       '\#34C759',  // Fresh

    primary:    '\#0A84FF',  // Actions

    surface:    '\#1C1C1E',  // Card background

    background: '\#000000',  // Screen background

    text:       '\#FFFFFF',

    textMuted:  '\#8E8E93',

  },

  radius: { sm: 8, md: 12, lg: 20, xl: 28 },

  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },

} as const;

---

## 7\. Backend Architecture

### 7.1 Supabase Project Configuration

Supabase Project: gone-bad

├── Database

│   ├── Extensions: pgvector, pg\_cron, pg\_net, uuid-ossp

│   ├── Schemas: public (application data), vectors (RAG embeddings)

│   └── RLS: enforced on every table

├── Auth

│   ├── Anonymous sign-in: enabled

│   ├── Google OAuth: enabled (sub claim only; no email stored)

│   └── Apple OAuth: enabled (sub claim only; no email stored)

├── Storage

│   └── Bucket: item-images (private; authenticated access only)

└── Edge Functions

    ├── analyse-image        (client-invoked)

    ├── process-image        (Storage trigger)

    ├── generate-fun-fact    (client-invoked \+ cron)

    ├── send-notifications   (cron-invoked via pg\_net)

    ├── rag-query            (internal, called by other functions)

    └── handle-invite        (client-invoked via deep link)

### 7.2 Edge Function Responsibilities

| Function | Trigger | Responsibilities |
| :---- | :---- | :---- |
| `analyse-image` | Client HTTP POST | Rate limit check; Gemini vision call (moderation \+ field extraction); RAG context fetch for storage suggestion and expiry estimation; return structured JSON |
| `process-image` | Supabase Storage webhook (on upload) | Download original; Sharp: compress to WebP (quality 75, max 800px); generate 200×200 thumbnail; update item record with optimised URLs; delete original |
| `generate-fun-fact` | Client HTTP GET or pg\_cron | RAG query for random unexpired item; Gemini generation of funny fact; cache in `daily_kitchen_cache`; return to client |
| `send-notifications` | pg\_cron daily at 08:00 UTC (via pg\_net) | Query items expiring on `today + notification_days_before`; for each: fetch Kitchen members \+ push tokens, generate message via Gemini \+ RAG, dispatch via Expo Push API, log in `notification_log` |
| `rag-query` | Internal | pgvector cosine similarity search; return top-k document chunks as context string |
| `handle-invite` | Client HTTP GET | Validate invite token (existence, expiry, max\_uses); add user to Kitchen with specified role; increment used\_count |

### 7.3 Realtime Subscriptions

The client subscribes to Supabase Realtime channels for live cross-device Kitchen updates:

- Channel `kitchen:{kitchen_id}:items` — INSERT, UPDATE, DELETE on `items`  
- Channel `kitchen:{kitchen_id}:members` — INSERT, DELETE on `kitchen_members`

TanStack Query cache is invalidated on Realtime events to trigger re-renders.

---

## 8\. Database Schema

### 8.1 Entity Relationship Overview

users ──────────── kitchen\_members ──── kitchens ──── kitchen\_invites

  │                      │                  │

  ├── push\_tokens         └── items ─────────┤

  │                             │            │

  ├── user\_settings         item\_events      │

  │                                         │

  ├── notification\_log            daily\_kitchen\_cache

  │

  └── scan\_rate\_limits

vectors.rag\_documents  (separate schema — no FK relationships)

### 8.2 Table Definitions

\-- ─────────────────────────────────────────

\-- EXTENSIONS

\-- ─────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE EXTENSION IF NOT EXISTS "vector";

CREATE EXTENSION IF NOT EXISTS "pg\_cron";

CREATE EXTENSION IF NOT EXISTS "pg\_net";

\-- ─────────────────────────────────────────

\-- USERS

\-- No PII stored. auth\_sub is an opaque OAuth

\-- subject claim — not an email or name.

\-- ─────────────────────────────────────────

CREATE TABLE public.users (

  id            UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),

  auth\_uid      UUID UNIQUE NOT NULL,        \-- Supabase Auth UID

  auth\_provider TEXT NOT NULL

                  CHECK (auth\_provider IN ('anon', 'google', 'apple')),

  auth\_sub      TEXT UNIQUE,                 \-- OAuth sub (null for anon users)

  locale        TEXT,                        \-- e.g. 'en-GB', 'hi-IN'

  created\_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated\_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  deleted\_at    TIMESTAMPTZ                  \-- Soft delete; hard-delete cron runs after 30 days

);

\-- ─────────────────────────────────────────

\-- KITCHENS

\-- ─────────────────────────────────────────

CREATE TABLE public.kitchens (

  id          UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),

  name        TEXT NOT NULL,

  created\_by  UUID NOT NULL REFERENCES public.users(id),

  created\_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated\_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  deleted\_at  TIMESTAMPTZ

);

\-- ─────────────────────────────────────────

\-- KITCHEN MEMBERS

\-- ─────────────────────────────────────────

CREATE TABLE public.kitchen\_members (

  id           UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),

  kitchen\_id   UUID NOT NULL REFERENCES public.kitchens(id) ON DELETE CASCADE,

  user\_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  role         TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),

  is\_default   BOOLEAN NOT NULL DEFAULT FALSE,

  joined\_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  invited\_by   UUID REFERENCES public.users(id),

  UNIQUE (kitchen\_id, user\_id)

);

\-- Enforce: each user has at most one default Kitchen

CREATE UNIQUE INDEX kitchen\_members\_one\_default\_per\_user

  ON public.kitchen\_members (user\_id)

  WHERE is\_default \= TRUE;

\-- ─────────────────────────────────────────

\-- KITCHEN INVITES (shareable links)

\-- ─────────────────────────────────────────

CREATE TABLE public.kitchen\_invites (

  id           UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),

  kitchen\_id   UUID NOT NULL REFERENCES public.kitchens(id) ON DELETE CASCADE,

  token        TEXT UNIQUE NOT NULL,          \-- 32-char URL-safe random token

  created\_by   UUID NOT NULL REFERENCES public.users(id),

  role         TEXT NOT NULL DEFAULT 'editor'

                 CHECK (role IN ('editor', 'viewer')),

  expires\_at   TIMESTAMPTZ NOT NULL,          \-- Maximum 7 days from creation

  max\_uses     INT,                           \-- NULL \= unlimited uses

  used\_count   INT NOT NULL DEFAULT 0,

  created\_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()

);

\-- ─────────────────────────────────────────

\-- ITEMS

\-- ─────────────────────────────────────────

CREATE TABLE public.items (

  id                   UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),

  kitchen\_id           UUID NOT NULL REFERENCES public.kitchens(id) ON DELETE CASCADE,

  \-- Core fields

  name                 TEXT NOT NULL,

  description          TEXT,

  tags                 TEXT\[\] NOT NULL DEFAULT '{}',

  \-- Quantity

  quantity             NUMERIC NOT NULL DEFAULT 1,

  quantity\_unit        TEXT,                  \-- 'g', 'ml', 'kg', 'units', etc.

  quantity\_remaining   NUMERIC,               \-- NULL \= intact; updated by item\_events

  \-- Dates

  purchase\_date        DATE,

  opened\_date          DATE,                  \-- Optional; affects post-open expiry logic

  expiry\_date          DATE,

  expiry\_source        TEXT NOT NULL DEFAULT 'ai\_estimated'

                         CHECK (expiry\_source IN ('image', 'ai\_estimated', 'manual')),

  \-- Images

  image\_url            TEXT,                  \-- Supabase Storage signed URL (WebP)

  image\_thumbnail\_url  TEXT,                  \-- 200×200 thumbnail

  image\_path           TEXT,                  \-- Storage path; used for deletion

  \-- Barcode

  barcode              TEXT,

  \-- AI output

  ai\_confidence        NUMERIC CHECK (ai\_confidence BETWEEN 0 AND 1),

  storage\_suggestion   TEXT,                  \-- RAG-generated storage advice

  \-- Status lifecycle

  status               TEXT NOT NULL DEFAULT 'active'

                         CHECK (status IN ('active', 'used', 'wasted', 'expired')),

  used\_at              TIMESTAMPTZ,

  wasted\_at            TIMESTAMPTZ,

  \-- Notification override (NULL \= inherit global default from user\_settings)

  notification\_days\_before INT,

  \-- Audit

  added\_by             UUID REFERENCES public.users(id),

  created\_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated\_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  deleted\_at           TIMESTAMPTZ           \-- Soft delete; Storage images hard-deleted immediately

);

\-- ─────────────────────────────────────────

\-- ITEM EVENTS

\-- Tracks every use/waste action with quantity.

\-- Enables partial quantity tracking.

\-- ─────────────────────────────────────────

CREATE TABLE public.item\_events (

  id            UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),

  item\_id       UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,

  user\_id       UUID REFERENCES public.users(id) ON DELETE SET NULL,

  event\_type    TEXT NOT NULL CHECK (event\_type IN ('used', 'wasted')),

  quantity      NUMERIC NOT NULL,

  quantity\_unit TEXT,

  note          TEXT,

  created\_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()

);

\-- ─────────────────────────────────────────

\-- PUSH TOKENS

\-- ─────────────────────────────────────────

CREATE TABLE public.push\_tokens (

  id          UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),

  user\_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  token       TEXT NOT NULL,                 \-- Expo push token

  platform    TEXT NOT NULL CHECK (platform IN ('ios', 'android')),

  device\_id   TEXT,                          \-- Opaque device identifier for deduplication

  created\_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated\_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user\_id, device\_id)

);

\-- ─────────────────────────────────────────

\-- NOTIFICATION LOG

\-- ─────────────────────────────────────────

CREATE TABLE public.notification\_log (

  id            UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),

  item\_id       UUID REFERENCES public.items(id) ON DELETE SET NULL,

  user\_id       UUID REFERENCES public.users(id) ON DELETE SET NULL,

  message       TEXT NOT NULL,

  sent\_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  action\_taken  TEXT CHECK (action\_taken IN ('used', 'wasted', 'dismissed'))

);

\-- ─────────────────────────────────────────

\-- DAILY KITCHEN CACHE

\-- Fun fact cached per Kitchen per day.

\-- ─────────────────────────────────────────

CREATE TABLE public.daily\_kitchen\_cache (

  id               UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),

  kitchen\_id       UUID NOT NULL REFERENCES public.kitchens(id) ON DELETE CASCADE,

  cache\_date       DATE NOT NULL,

  fun\_fact         TEXT NOT NULL,

  fun\_fact\_source  TEXT,                     \-- Item name the fact is about

  fun\_fact\_item\_id UUID REFERENCES public.items(id) ON DELETE SET NULL,

  created\_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (kitchen\_id, cache\_date)

);

\-- ─────────────────────────────────────────

\-- USER SETTINGS

\-- ─────────────────────────────────────────

CREATE TABLE public.user\_settings (

  user\_id                  UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,

  notification\_days\_before INT NOT NULL DEFAULT 1,

  default\_kitchen\_id       UUID REFERENCES public.kitchens(id) ON DELETE SET NULL,

  locale                   TEXT,

  updated\_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()

);

\-- ─────────────────────────────────────────

\-- SCAN RATE LIMITS

\-- Enforces 20 AI scans/day per user.

\-- ─────────────────────────────────────────

CREATE TABLE public.scan\_rate\_limits (

  user\_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  scan\_date  DATE NOT NULL DEFAULT CURRENT\_DATE,

  scan\_count INT NOT NULL DEFAULT 0,

  PRIMARY KEY (user\_id, scan\_date)

);

\-- ─────────────────────────────────────────

\-- RAG DOCUMENTS (separate schema)

\-- Isolated from application data.

\-- ─────────────────────────────────────────

CREATE SCHEMA IF NOT EXISTS vectors;

CREATE TABLE vectors.rag\_documents (

  id          UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),

  source      TEXT NOT NULL                  \-- 'usda', 'open\_food\_facts', 'nhs', 'efsa'

                CHECK (source IN ('usda', 'open\_food\_facts', 'nhs', 'efsa')),

  source\_url  TEXT,

  content     TEXT NOT NULL,                 \-- Chunked document text

  embedding   vector(768),                   \-- Google text-embedding-004 output dimension

  metadata    JSONB NOT NULL DEFAULT '{}',   \-- { food\_name, category, tags, country, ... }

  created\_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated\_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()

);

CREATE INDEX rag\_documents\_embedding\_idx

  ON vectors.rag\_documents

  USING ivfflat (embedding vector\_cosine\_ops)

  WITH (lists \= 100);

### 8.3 Key Indexes

\-- Stash list — active items sorted by urgency

CREATE INDEX items\_stash\_view

  ON public.items (kitchen\_id, expiry\_date ASC)

  WHERE status \= 'active' AND deleted\_at IS NULL;

\-- Notification cron — find items expiring on target date

CREATE INDEX items\_expiry\_notification

  ON public.items (expiry\_date, status)

  WHERE status \= 'active' AND deleted\_at IS NULL;

\-- Finished tab — recently used items

CREATE INDEX items\_finished\_view

  ON public.items (kitchen\_id, used\_at DESC)

  WHERE status \= 'used' AND deleted\_at IS NULL;

\-- The Bin — wasted items

CREATE INDEX items\_bin\_view

  ON public.items (kitchen\_id, wasted\_at DESC)

  WHERE status \= 'wasted' AND deleted\_at IS NULL;

\-- Dashboard aggregate queries

CREATE INDEX items\_kitchen\_status

  ON public.items (kitchen\_id, status)

  WHERE deleted\_at IS NULL;

\-- Event history per item

CREATE INDEX item\_events\_item\_id ON public.item\_events (item\_id);

\-- Push token dispatch

CREATE INDEX push\_tokens\_user\_id ON public.push\_tokens (user\_id);

### 8.4 Row Level Security (RLS)

RLS is enabled on all public tables. Every policy resolves Kitchen membership by joining `kitchen_members` against the current authenticated user.

\-- Items: readable and writable only by Kitchen members with appropriate roles

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

CREATE POLICY items\_select ON public.items

  FOR SELECT USING (

    kitchen\_id IN (

      SELECT km.kitchen\_id FROM public.kitchen\_members km

      INNER JOIN public.users u ON u.id \= km.user\_id

      WHERE u.auth\_uid \= auth.uid()

    )

  );

CREATE POLICY items\_insert ON public.items

  FOR INSERT WITH CHECK (

    kitchen\_id IN (

      SELECT km.kitchen\_id FROM public.kitchen\_members km

      INNER JOIN public.users u ON u.id \= km.user\_id

      WHERE u.auth\_uid \= auth.uid()

        AND km.role IN ('owner', 'editor')

    )

  );

CREATE POLICY items\_update ON public.items

  FOR UPDATE USING (

    kitchen\_id IN (

      SELECT km.kitchen\_id FROM public.kitchen\_members km

      INNER JOIN public.users u ON u.id \= km.user\_id

      WHERE u.auth\_uid \= auth.uid()

        AND km.role IN ('owner', 'editor')

    )

  );

CREATE POLICY items\_delete ON public.items

  FOR DELETE USING (

    kitchen\_id IN (

      SELECT km.kitchen\_id FROM public.kitchen\_members km

      INNER JOIN public.users u ON u.id \= km.user\_id

      WHERE u.auth\_uid \= auth.uid()

        AND km.role IN ('owner', 'editor')

    )

  );

\-- The same membership-based pattern applies to:

\-- kitchens, kitchen\_members, item\_events, daily\_kitchen\_cache,

\-- notification\_log, user\_settings, scan\_rate\_limits

\-- (policies not repeated here for brevity)

### 8.5 Data Retention Jobs (pg\_cron)

\-- Mark active items as expired once expiry\_date passes (02:00 UTC)

SELECT cron.schedule('mark-items-expired', '0 2 \* \* \*', $$

  UPDATE public.items

  SET status \= 'expired', updated\_at \= NOW()

  WHERE status \= 'active'

    AND expiry\_date \< CURRENT\_DATE

    AND deleted\_at IS NULL;

$$);

\-- Soft-delete used items after 14 days (removes from Finished view)

SELECT cron.schedule('archive-finished-items', '0 2 \* \* \*', $$

  UPDATE public.items

  SET deleted\_at \= NOW(), updated\_at \= NOW()

  WHERE status \= 'used'

    AND used\_at \< NOW() \- INTERVAL '14 days'

    AND deleted\_at IS NULL;

$$);

\-- Hard-delete expired items after 90 days

SELECT cron.schedule('hard-delete-expired-items', '0 3 \* \* \*', $$

  DELETE FROM public.items

  WHERE status \= 'expired'

    AND updated\_at \< NOW() \- INTERVAL '90 days';

$$);

\-- Hard-delete soft-deleted user accounts after 30 days (GDPR Art. 17\)

SELECT cron.schedule('hard-delete-users', '0 3 \* \* \*', $$

  DELETE FROM public.users

  WHERE deleted\_at IS NOT NULL

    AND deleted\_at \< NOW() \- INTERVAL '30 days';

$$);

\-- Purge scan rate limit records older than 7 days

SELECT cron.schedule('purge-scan-limits', '0 4 \* \* \*', $$

  DELETE FROM public.scan\_rate\_limits

  WHERE scan\_date \< CURRENT\_DATE \- INTERVAL '7 days';

$$);

\-- Trigger send-notifications Edge Function at 08:00 UTC

SELECT cron.schedule('trigger-notifications', '0 8 \* \* \*', $$

  SELECT net.http\_post(

    url     := current\_setting('app.edge\_function\_base\_url') || '/send-notifications',

    headers := jsonb\_build\_object(

      'Authorization', 'Bearer ' || current\_setting('app.service\_role\_key'),

      'Content-Type',  'application/json'

    ),

    body    := '{}'::jsonb

  );

$$);

### 8.6 Atomic Scan Rate Limit Function

CREATE OR REPLACE FUNCTION public.increment\_scan\_count(p\_user\_id UUID)

RETURNS TABLE (scan\_count INT) AS $$

  INSERT INTO public.scan\_rate\_limits (user\_id, scan\_date, scan\_count)

  VALUES (p\_user\_id, CURRENT\_DATE, 1\)

  ON CONFLICT (user\_id, scan\_date)

  DO UPDATE SET scan\_count \= scan\_rate\_limits.scan\_count \+ 1

  RETURNING scan\_rate\_limits.scan\_count;

$$ LANGUAGE sql;

---

## 9\. AI & RAG Pipeline

### 9.1 Image Analysis — Single-Call Architecture

A single Gemini API call per image handles both moderation and field extraction, preserving free-tier quota.

Client: image captured / barcode not detected

        │

        ▼

Edge Function: analyse-image

        │

        ├─► 1\. Check scan rate limit (max 20/day per user)

        │       └── If exceeded: HTTP 429 \+ funny message

        │

        ├─► 2\. Fetch RAG context for food-type estimation

        │       (broad query: "storage and shelf life information")

        │

        ├─► 3\. Gemini 2.0 Flash — vision call

        │       System prompt: moderation gate \+ structured extraction

        │

        ├─► 4a. Moderation fail → return { pass: false, reason, suggestion }

        │

        └─► 4b. Extraction success → return structured JSON to client

**Gemini Prompt — `analyse-image`:**

You are the AI engine for "Gone Bad", a brutally honest food expiry tracker.

STEP 1 — MODERATION GATE:

Inspect the image. Return { "pass": false, "reason": "\<code\>" } if any of these apply:

\- NOT\_FOOD: The subject is not a food item or food ingredient

\- OBSCENE: The image contains adult, violent, or otherwise inappropriate content

\- BLURRY: The image is too blurry or dark to identify the subject with confidence ≥ 0.6

\- NON\_TRACKABLE: The item by nature has no expiry relevance (medicine, cosmetics, cleaning products)

STEP 2 — EXTRACTION (only if STEP 1 passes):

Extract the fields below as a single JSON object. Never fabricate.

Return null for any field that cannot be reliably determined.

Only return expiry\_date if it is clearly printed and legible in the image.

{

  "pass": true,

  "confidence": \<0.0–1.0\>,

  "name": "\<human-readable food name\>",

  "description": "\<1–2 sentence description\>",

  "tags": \["\<taxonomy tags — see list below\>"\],

  "expiry\_date": "\<YYYY-MM-DD or null\>",

  "expiry\_date\_visible\_in\_image": \<true|false\>,

  "estimated\_expiry\_days": \<null if visible, else integer days from today\>,

  "quantity\_unit": "\<g|ml|kg|l|units|etc.\>",

  "storage\_suggestion": "\<one punchy storage tip\>",

  "moderation\_flags": \[\]

}

Allowed tag taxonomy: Dairy, Produce, Meat, Seafood, Bakery, Pantry, Frozen, Condiments,

Beverages, Snacks, Leftovers, Herbs & Spices, Deli, Plant-Based

RAG KNOWLEDGE CONTEXT:

{rag\_context}

Today's date: {today}

Respond with valid JSON only. No prose, no markdown fences.

### 9.2 Moderation Outcomes & User Messages

| Reason Code | User-Facing Message (tone: brutal/playful) | App Action |
| :---- | :---- | :---- |
| `NOT_FOOD` | "That's a {detected\_thing}, not a snack. Try something that actually expires." | Return to camera |
| `BLURRY` | "We're good, but not miracle-workers. Sharpen it up or type it in yourself." | Offer re-shoot or manual entry |
| `OBSCENE` | "Really? In a food tracker? No." | Return to camera |
| `NON_TRACKABLE` | "That {type} doesn't go off. Or if it does, that's a different app entirely." | Return to camera |
| Low confidence (\< 0.6) | "We're squinting at this one. Re-shoot or fill in the deets yourself." | Offer re-shoot or manual entry |

### 9.3 RAG System

#### Data Sources

| Source | Content | Licence | Re-seed Frequency |
| :---- | :---- | :---- | :---- |
| USDA FoodData Central | Food names, categories, nutritional context | Public domain | Annual |
| Open Food Facts | Packaged goods, shelf life | CC0 | Quarterly |
| NHS Eat Well / Food Safety | UK storage guidance | Open Government Licence v3 | Annual |
| EFSA (EU Food Safety Authority) | EU food safety publications | Free for non-commercial use | Annual |

#### Chunking Strategy

Source document

    → Split by food item / category section

    → Target chunk size: \~512 tokens

    → Overlap: 64 tokens

    → Metadata per chunk: { source, food\_name, category, tags\[\], country }

#### Embedding

- **Model:** `text-embedding-004` (Google — free tier: 1M tokens/day)  
- **Dimensions:** 768  
- **Similarity metric:** Cosine distance (pgvector)  
- **Index type:** IVFFlat, lists \= 100 (optimised for \< 500K vectors)

#### RAG Query Flow

// rag-query Edge Function (internal)

async function ragQuery(query: string, topK \= 5): Promise\<string\> {

  const embedding \= await embedText(query);          // text-embedding-004

  const chunks    \= await pgvectorSearch(embedding, topK);

  return chunks.map(c \=\> c.content).join('\\n\\n');    // Context string for Gemini

}

#### RAG Use Cases

| Use Case | Query Input | Context Used For |
| :---- | :---- | :---- |
| Expiry estimation | `"{name} shelf life storage"` | Gemini prompt for estimated\_expiry\_days |
| Storage suggestion | `"{name} how to store preserve"` | storage\_suggestion field |
| Fun Fact (daily) | `"{random_unexpired_item_name} interesting fact"` | The Fridge Door Fun Fact |
| Notification message | `"{name} expiry reminder food"` | Funny, brutal push notification body |

### 9.4 Barcode Scanning

Barcode scanning uses `expo-camera`'s built-in detector — no additional dependency or API quota consumed.

Barcode detected in camera frame

        │

        ▼

Edge Function: analyse-image (barcode path)

        │

        ▼

GET https://world.openfoodfacts.org/api/v2/product/{barcode}.json

        │

        ├─► Product found → map to item schema → pre-fill Check It

        │   (no Gemini call → does not consume scan quota)

        │

        └─► Product not found → "Not in our database. Fill it in yourself."

            → open Check It with empty form

Open Food Facts field mapping:

| Open Food Facts field | Item field |
| :---- | :---- |
| `product_name` | `name` |
| `categories_tags` | `tags` |
| `quantity` | `quantity` \+ `quantity_unit` |
| `expiration_date` | `expiry_date` (source: `image` if printed, else `manual`) |
| `image_front_url` | `image_url` (downloaded \+ re-uploaded to Storage) |

### 9.5 Scan Rate Limiting

Enforced server-side in `analyse-image`. Barcode lookups do not count.

const DAILY\_SCAN\_LIMIT \= 20;

// In analyse-image Edge Function

const { scan\_count } \= await supabase

  .rpc('increment\_scan\_count', { p\_user\_id: userId })

  .single();

if (scan\_count \> DAILY\_SCAN\_LIMIT) {

  return Response.json({

    error: 'RATE\_LIMIT',

    message: \`${DAILY\_SCAN\_LIMIT} scans a day. You've hit the wall. Come back tomorrow.\`,

  }, { status: 429 });

}

---

## 10\. Image Processing Pipeline

### 10.1 On-Device Pre-Upload Processing

Camera capture (full resolution)

        │

        ▼

expo-image-manipulator:

  resize to max 1024px (longest edge, preserving aspect ratio)

  compress to JPEG (quality: 0.8)

        │

        ▼

Store in expo-file-system cacheDirectory as temp file

(path tracked in uploadStore — never written to permanent storage)

        │

        ▼

\[User confirms in Check It or Line 'Em Up\]

        │

        ├─► Upload to Supabase Storage (path: {kitchen\_id}/{item\_id}/original.jpg)

        │

        └─► Clear temp file from cacheDirectory

**Temp file lifecycle:** All unconfirmed images live in `cacheDirectory`. If the user cancels (backs out of Check It / Line 'Em Up, or removes an item from a batch), `uploadStore` triggers `FileSystem.deleteAsync()` for the abandoned temp files.

### 10.2 Server-Side Optimisation (process-image Edge Function)

Triggered by Supabase Storage upload webhook.

Storage upload event: {kitchen\_id}/{item\_id}/original.jpg

        │

        ▼

process-image Edge Function

        │

        ├─► Download original from Storage

        │

        ├─► Sharp: convert → WebP, quality 75, max 800px longest edge

        │   → Upload as {kitchen\_id}/{item\_id}/optimised.webp

        │

        ├─► Sharp: crop to 200×200 (cover), WebP quality 70

        │   → Upload as {kitchen\_id}/{item\_id}/thumb.webp

        │

        ├─► Generate signed URLs (1-year expiry) for both

        │

        ├─► UPDATE items SET image\_url \= ..., image\_thumbnail\_url \= ...

        │

        └─► DELETE original from Storage (storage cost reduction)

### 10.3 Image Access & Security

- All Storage objects in `item-images` are private — no public access  
- Client accesses images via Supabase signed URLs (1-year expiry)  
- Storage RLS policies: users may only access objects under their Kitchen's path prefix  
- On item soft-delete: `image_path` used to immediately hard-delete both Storage objects  
- Cross-device access: signed URLs stored in the database are accessible from any authenticated device in the Kitchen

---

## 11\. Feature Specifications

### 11.1 Authentication & Identity

#### Anonymous Authentication (Default)

- Supabase Anonymous auth generates a UUID (no email, no name)  
- `users` record created on first sign-in with `auth_provider = 'anon'`  
- Session token persisted in `expo-secure-store` (hardware-backed on iOS \+ Android)  
- Can be upgraded to Google/Apple at any time without data loss

#### OAuth Sign-In (Google / Apple)

- Flow: `expo-auth-session` \+ Supabase OAuth PKCE flow  
- Only the JWT `sub` claim is extracted and stored in `users.auth_sub`  
- No email, name, or profile picture stored  
- Apple Sign-In: "Hide My Email" relay respected — email never touches the database  
- On upgrade from anonymous: existing `users.id` is retained; `auth_uid` \+ `auth_sub` updated

#### Account Deletion

1. User initiates in House Rules → Account  
2. Immediate: all images in Storage hard-deleted via batch delete  
3. Immediate: `users.deleted_at = NOW()` (soft delete)  
4. Immediate: all push tokens for user deleted  
5. `pg_cron` hard-deletes the user record \+ all cascaded data after 30 days  
6. Confirmation message: *"Gone. Like that yoghurt you forgot about."*

---

### 11.2 Kitchen Management

#### Create Kitchen

- First Kitchen auto-created on sign-in (name: "My Kitchen")  
- Creator is assigned `role = 'owner'`, `is_default = true`  
- Additional Kitchens created via House Rules → My Kitchen → "New Kitchen"

#### Role Permissions

| Action | Owner | Editor | Viewer |
| :---- | :---- | :---- | :---- |
| View items | ✅ | ✅ | ✅ |
| Add items | ✅ | ✅ | ❌ |
| Edit items | ✅ | ✅ | ❌ |
| Delete items | ✅ | ✅ | ❌ |
| Mark used / wasted | ✅ | ✅ | ❌ |
| Generate invite link | ✅ | ✅ | ❌ |
| Remove members | ✅ | ❌ | ❌ |
| Rename Kitchen | ✅ | ❌ | ❌ |
| Delete Kitchen | ✅ | ❌ | ❌ |

#### Invite Flow

1. Owner or Editor generates link in Kitchen settings  
2. `kitchen_invites` record created: token (32-char random), role, expires in 7 days  
3. Shareable link: `gonebad://kitchen/invite/{token}`  
4. Recipient opens link → `handle-invite` Edge Function validates:  
   - Token exists and is not expired  
   - `used_count < max_uses` (or `max_uses IS NULL`)  
   - Recipient is not already a member  
5. Valid: user added to `kitchen_members`, `used_count` incremented  
6. If recipient is not signed in: redirect to sign-in, then deep-link re-handled on return

#### Owner Account Deletion — Kitchen Transfer Logic

Owner deletes account

        │

        ▼

For each Kitchen owned by this user:

        │

        ├─► Find earliest-joined member with role \= 'editor'

        │   └── Promote to 'owner'

        │

        └─► No editor exists?

            └── Kitchen is deleted (cascade removes all items and members)

**Soft limit:** Max 5 Kitchens per user, max 10 members per Kitchen. Can be raised without schema changes.

---

### 11.3 Snap It (Single Upload Flow)

\[Snap It Camera Screen\]

        │

        ├─► Barcode detected in frame?

        │   ├── Yes → pause capture → Open Food Facts lookup

        │   │         └── Check It (pre-filled, barcode source)

        │   │

        │   └── No → user taps shutter

        │

        ▼

On-device resize \+ JPEG

        │

        ▼

analyse-image Edge Function

        │

        ├─► Rate limit hit → friendly 429 screen

        │

        ├─► Moderation fail → reason screen

        │   Actions: \[ Re-shoot \] \[ Enter Manually \]

        │

        └─► Success → Check It

---

### 11.4 Check It (Single Review Screen)

Displays all AI-extracted fields. All fields are editable before confirming.

| Field | Input Type | Notes |
| :---- | :---- | :---- |
| Name | Text input | Required |
| Image | Thumbnail \+ "Re-shoot" | Re-shoot wipes all AI fields; re-analysis runs |
| Expiry Date | Date picker | Source badge: "From image" / "AI estimate" / "Manual" |
| Opened On | Date picker | Optional |
| Purchase Date | Date picker | Optional |
| Quantity | Numeric \+ unit selector | Default: 1 unit |
| Tags | Chip selector | AI-suggested; user can add/remove |
| Description | Text area |  |
| Storage Suggestion | Text (editable) | RAG-generated |
| Notify Me | Days-before stepper | Defaults to global setting in user\_settings |

Actions: **"Add to Kitchen"** → item created | **"Ditch it"** → temp file cleared, return to camera

---

### 11.5 The Haul (Bulk Upload Flow)

\[The Haul Camera Screen\]

  Continuous shooting mode.

  Bottom strip shows captured photo thumbnails.

        │

        ▼

  User taps "Done"

        │

        ▼

  Rate limit pre-check:

  "You've got {n} scans left today.

   Your batch has {m}. Trim it or come back tomorrow."

  (shown only if batch \> remaining quota)

        │

        ▼

  Parallel processing (max 5 concurrent Gemini calls):

  \- On-device resize per image

  \- analyse-image per image

        │

        ▼

  Line 'Em Up

---

### 11.6 Line 'Em Up (Bulk Review Screen)

A scrollable list of all batch items. Each card shows thumbnail, AI-extracted name, expiry date, and a status badge.

**Status badges:**

- ✅ **Ready** — passed moderation, confidence ≥ 0.6  
- ⚠️ **Check It** — passed moderation, confidence 0.5–0.59 (low but not failed)  
- ❌ **Flagged** — moderation failure or confidence \< 0.5

**Flagged item options:** Re-shoot | Enter Manually | Remove from Batch

**Flagged item behaviour:** Flagged items remain in Line 'Em Up. They block only themselves — not the rest of the batch. The "Add to Kitchen" button adds all non-flagged, non-removed items. Flagged items stay until the user resolves or removes them.

**Individual editing:** Tap any item card to expand an inline edit form (same fields as Check It).

**Bulk Add:** "Add {n} to Kitchen" (shows count of non-flagged items).

---

### 11.7 The Fridge Door (Dashboard)

┌─────────────────────────────────────────────┐

│ 🎉 Fun Fact (daily, RAG-generated)          │

│ "Did you know cheddar's flavour deepens     │

│  with age? Unlike your excuses."            │

└─────────────────────────────────────────────┘

┌──────────┬──────────┬─────────────────────────┐

│  Expired │ Expiring │ Fresh                   │

│   🔴 3   │  🟡 5   │  🟢 12                  │

└──────────┴──────────┴─────────────────────────┘

┌─────────────────────────────────────────────┐

│ Urgency Grid                                │

│ Item cards, colour-coded R/A/G,             │

│ sorted by expiry date ascending             │

└─────────────────────────────────────────────┘

┌───────────────────┬─────────────────────────┐

│ Category Chart    │ Waste This Month        │

│ (donut chart)     │ {n} items gone bad      │

└───────────────────┴─────────────────────────┘

┌─────────────────────────────────────────────┐

│ ✅ Finished / Buy Again (14-day view)        │

│ Horizontal scroll of used item cards        │

└─────────────────────────────────────────────┘

**Expiry buckets:**

- 🔴 Expired: `expiry_date < TODAY`  
- 🟡 Expiring: `expiry_date BETWEEN TODAY AND TODAY + 3`  
- 🟢 Fresh: `expiry_date > TODAY + 3`

**Fun Fact logic:** On first Fridge Door load of the day, client calls `generate-fun-fact` Edge Function. Function checks `daily_kitchen_cache` for `cache_date = TODAY`. If hit: return cached. If miss: RAG query on a randomly selected unexpired item, Gemini generation, cache, return. Refreshes at midnight.

---

### 11.8 The Stash (List View)

Paginated, sortable, filterable list of all active items in the active Kitchen.

**Default sort:** `expiry_date ASC` (most urgent first)

**Filter chips:** All | Expiring (≤3 days) | Expired | By Category | By Tag

**Swipe actions:**

- Swipe left → ✅ "Used it" (green) | 🗑️ "Gone Waste" (red)  
- Both open the Quantity Modal before committing

**Quantity Modal:**

How much of it?

  \[Item Name\]

  Remaining: 800g of 1,000g

  ┌───────────────┬──────────────┐

  │  All of it    │  Some of it  │

  └───────────────┴──────────────┘

  \[if "Some of it"\] → numeric input \+ unit

  \[Confirm\]

---

### 11.9 The Label (Item Detail View)

Full item info. Edit mode via top-right icon. Fields as per Check It.

**Expiry indicator:**

- Fresh: "12 days left — you're fine."  
- Warning: "2 days left. Tick. Tick."  
- Expired: "Expired 3 days ago. 💀"

**Action buttons:** "✅ Used it" | "🗑️ Gone Waste" → Quantity Modal

**Event history:** Timeline of all `item_events` (partial uses and waste entries, with quantities and timestamps).

---

### 11.10 Mark as Used / Gone Waste

Available from three surfaces: The Stash (swipe), The Label (buttons), push notification (Quick Actions).

**Full use:**

- `items.status = 'used'`, `items.used_at = NOW()`  
- `item_events` created: `{ event_type: 'used', quantity: items.quantity }`  
- Item disappears from The Stash immediately (optimistic update)  
- Item appears in Finished (Fridge Door) for 14 days  
- `pg_cron` soft-deletes after 14 days

**Partial use:**

- `item_events` created: `{ event_type: 'used', quantity: <entered> }`  
- `items.quantity_remaining -= <entered>`  
- If `quantity_remaining ≤ 0`: treat as full use (status → 'used')  
- Item stays in The Stash with updated quantity display

**Full waste:**

- `items.status = 'wasted'`, `items.wasted_at = NOW()`  
- `item_events` created: `{ event_type: 'wasted', quantity: items.quantity }`  
- Item disappears from The Stash, appears in The Bin permanently

**Partial waste:**

- `item_events` created: `{ event_type: 'wasted', quantity: <entered> }`  
- `items.quantity_remaining -= <entered>`  
- Partial waste entry logged in The Bin (per-event, not per-item)  
- Item stays in The Stash

---

### 11.11 The Bin (Waste Log)

Permanent chronological log of all waste events. Does not auto-delete.

**Displays:** Item name, thumbnail, wasted quantity \+ unit, date wasted, Kitchen member who logged it (display name if available via OAuth; else "A housemate").

**Dashboard metric (on Fridge Door):** "Wasted this month: {n} events / \~{x}g" (where unit data is available for aggregation).

---

### 11.12 House Rules (Settings)

#### My Kitchen section

- Active Kitchen selector (user's list of Kitchens)  
- Members list with role badges  
- "Generate invite link" (copies to clipboard \+ share sheet)  
- "Leave this Kitchen" (with confirmation)  
- "Create new Kitchen"

#### Heads Up section

- "Remind me X days before expiry" — stepper (default: 1\)  
- Note: "Individual items can override this timing"

#### Account section

- Auth status display  
- "Connect Google / Apple" (upgrade from anonymous)  
- "Export my data" → triggers GDPR data export (JSON download)  
- "Delete my account" → confirmation → deletion flow

#### About section

- App version  
- Privacy Policy (external link)  
- Terms of Use (external link)  
- Open Source Licences

---

## 12\. Notification System

### 12.1 Architecture

pg\_cron: 08:00 UTC daily

        │

        ▼ HTTP POST via pg\_net

Edge Function: send-notifications

        │

        ▼

Query: SELECT items WHERE

  status \= 'active'

  AND expiry\_date \= CURRENT\_DATE

        \+ COALESCE(items.notification\_days\_before,

            user\_settings.notification\_days\_before, 1\)

  AND deleted\_at IS NULL

        │

        ▼

For each item:

  ├─► Get all Kitchen members \+ their push tokens

  ├─► RAG query: "{item\_name} expiry reminder"

  ├─► Gemini: generate brutal funny message (≤100 chars)

  ├─► Expo Push API: send to each token

  ├─► On 410 response: delete stale push token

  └─► Log in notification\_log

### 12.2 Notification Message Generation

**Gemini prompt for `send-notifications`:**

You are the brutally funny voice for "Gone Bad", a food expiry tracker.

Write ONE push notification for this food item. Hard rules:

\- Maximum 100 characters

\- Brutal and funny; never offensive or mean-spirited

\- Reference the specific food item by name

\- The item expires in {days\_remaining} day(s)

\- Use the food knowledge context below if relevant

Food item: {item\_name}

Food knowledge: {rag\_context}

Tone examples (match this energy):

"Your brie is entering its villain era. Use it or lose it."

"That basil has 1 day left. It's basically compost with hope."

"Your milk called. It's writing its will."

"3-day-old leftovers. You're brave. We're concerned."

Return only the notification message. No quotes, no JSON, nothing else.

### 12.3 iOS / Android Notification Quick Actions

**Category registered on app start (`EXPIRY_ALERT`):**

await Notifications.setNotificationCategoryAsync('EXPIRY\_ALERT', \[

  {

    identifier: 'MARK\_USED',

    buttonTitle: '✅ Used it',

    options: { opensAppToForeground: false },

  },

  {

    identifier: 'MARK\_WASTED',

    buttonTitle: '🗑️ Gone Waste',

    options: { opensAppToForeground: false },

  },

\]);

**Notification payload:**

{

  "to": "{expo\_push\_token}",

  "title": "Gone Bad",

  "body": "{generated\_message}",

  "categoryId": "EXPIRY\_ALERT",

  "data": {

    "item\_id": "{uuid}",

    "screen": "item\_detail"

  }

}

**Background notification response handler:**

Quick Actions fire `Notifications.addNotificationResponseReceivedListener` in background. Handler calls `supabase.rpc('mark_item_event', { item_id, event_type })` without opening the app. `notification_log.action_taken` updated accordingly.

### 12.4 Notification Deep-Link

Tapping the notification body (not a Quick Action) opens the app to The Label:

gonebad://item/{item\_id}

→ Expo Router: app/(app)/stash/\[id\].tsx

---

## 13\. Security Architecture

### 13.1 Authentication Security

- All Supabase API calls require a valid JWT  
- Anon key is public but all RLS policies restrict its scope  
- Service role key is never shipped in the client build — only in Edge Functions via Supabase Vault  
- OAuth uses PKCE flow (no implicit grant)  
- Sessions stored in `expo-secure-store` (Keychain on iOS, Keystore on Android)  
- Silent refresh handled by Supabase client; no manual token management needed

### 13.2 API Security

- RLS enforced on every table — no table is accessible without a valid session  
- Edge Functions validate the user JWT, not the service role key, for user-scoped actions  
- Service role key only flows via pg\_cron → pg\_net → Edge Function internal calls (never client)  
- Gemini API key stored in Supabase Vault; never transmitted to client  
- CORS: Edge Functions restricted to `gonebad://` app origin \+ `localhost:8081` (dev)

### 13.3 Image Security

- `item-images` Storage bucket is private — no public URL access possible  
- Signed URLs issued per-request with 1-year expiry; re-signed if expired  
- Storage RLS policies enforce path-level access by Kitchen ID  
- Images hard-deleted from Storage on item deletion (Storage trigger or immediate Edge Function call)  
- No image data flows through Gemini API in plaintext — images sent as base64 data URIs via HTTPS to Google's servers

### 13.4 Content Security

- Gemini's built-in safety filters reject overtly harmful content before our moderation prompt runs  
- Our explicit moderation gate (STEP 1 in the prompt) catches food-specific invalidity (blurry, non-food, etc.)  
- Open Food Facts queries made server-side (Edge Function), not from the client — prevents unauthenticated client calls and data leakage

### 13.5 Data Security

- All data in transit: TLS 1.3 (Supabase default)  
- All data at rest: AES-256 (Supabase default)  
- No PII in any log output — no email or name to log since none is stored  
- Push tokens stored per-user but not linkable to a real-world identity  
- Invite tokens: cryptographically random 32-char URL-safe strings, expire in 7 days, single-use configurable

---

## 14\. Privacy & Legal Compliance

### 14.1 Data Inventory

| Data | Stored | Linkable to Person | Basis |
| :---- | :---- | :---- | :---- |
| Anonymous UUID | Yes | No | Service delivery |
| OAuth sub claim | Yes (if OAuth used) | No (opaque string) | Account continuity |
| Expo push token | Yes | No (rotatable, not linked to identity) | Notification delivery |
| Food item data | Yes | No | Core service |
| Images (WebP, optimised) | Yes | Potentially (food context) | Core service |
| Locale preference | Yes | No | Localisation |
| Scan count (per day) | Yes | Pseudonymous | Rate limiting |
| Item events | Yes | Pseudonymous | Waste tracking |
| Notification log | Yes | Pseudonymous | Delivery confirmation |
| IP addresses | Not stored in DB | — | Supabase infra logs only |
| Email / Name | Never | — | Not collected |

### 14.2 GDPR / UK GDPR

**Lawful basis:** Contract performance — processing is necessary to provide the food tracking service the user has signed up for. No consent banner required for core functionality. No marketing emails.

**Data Subject Rights:**

| Right | Implementation |
| :---- | :---- |
| Right of access (Art. 15\) | "Export my data" in House Rules → JSON download via Edge Function |
| Right to erasure (Art. 17\) | "Delete my account" → images hard-deleted immediately; user record hard-deleted after 30 days by pg\_cron |
| Right to rectification (Art. 16\) | All user-entered data editable in-app |
| Right to portability (Art. 20\) | JSON export (same as access) |
| Right to restrict processing (Art. 18\) | Account deletion covers this in v1 |
| Right to object (Art. 21\) | No direct marketing processing occurs |

**International data transfers:** Supabase is hosted on AWS (US region). This constitutes an international transfer under UK GDPR and EU GDPR Chapter V. Mitigation: execute Standard Contractual Clauses (SCCs) with Supabase before launch. Reference: `https://supabase.com/legal/dpa`. Alternative: select an EU region Supabase project to avoid the transfer entirely (available on Supabase Pro).

**Records of Processing Activities (RoPA):** Required under Art. 30\. Must be maintained as a separate internal document. To be produced before launch.

**Privacy policy must include:**

- Categories of data collected  
- Lawful basis for each processing activity  
- Retention periods  
- International transfer mechanism (SCCs or adequacy decision)  
- All data subject rights and how to exercise them  
- Contact details for data requests (email address required)  
- Right to lodge a complaint with ICO (UK) or relevant DPA (EU)

### 14.3 India — DPDP Act 2023

The Digital Personal Data Protection Act 2023 applies to processing of personal data of persons in India.

| Requirement | Implementation |
| :---- | :---- |
| Explicit consent | In-app consent notice displayed on first launch for Indian locale users, before any data is processed |
| Purpose limitation | Processing stated as: food expiry tracking only |
| Children's data | App restricted to 18+ (ToS \+ store listing age rating). DPDP requires parental consent for minors — restriction avoids this complexity in v1 |
| Grievance Officer | Appoint a named contact for India-specific data grievances. Publish contact in privacy policy and Play Store listing |
| Data Fiduciary obligations | Annual internal review of compliance posture |
| Cross-border transfers | Currently permitted to countries on the approved list (list pending government notification). Monitor MEITY updates; architecture supports migrating to a regional Supabase project |
| Notice | Data Principal notice provided at point of collection (first launch) |

### 14.4 US Compliance

**CCPA (California Consumer Privacy Act):**

| Right | Implementation |
| :---- | :---- |
| Right to know | Privacy policy \+ in-app JSON export |
| Right to delete | In-app account deletion |
| Right to opt-out of sale | No data sold — state explicitly in privacy policy |
| Right to non-discrimination | No service tiering based on privacy choices |

**COPPA:** App rated 17+ on App Store and 18+ on Google Play. Terms of Service explicitly restrict use to individuals aged 18 and over. No features designed to attract children under 13\.

### 14.5 App Store & Play Store Compliance

**Apple App Store — Privacy Nutrition Label:**

Given zero-PII architecture, the label should reflect:

- Data Not Linked to You: Device ID (if crash reporting added), Usage Data (if analytics added)  
- Data Not Collected: achievable if no crash reporter or analytics SDK is added in v1

Confirm label accuracy against actual SDK list before submission.

**Google Play — Data Safety Section:**

- Images: collected, stored, not shared with third parties, encrypted in transit  
- App activity: usage data (if analytics added)  
- No "Personal info" category required (no email/name collected)

**Both stores:** Privacy policy URL must be a publicly accessible web page — not just an in-app link. App must display the privacy policy before account creation.

---

## 15\. Cost Model

### 15.1 Zero-Cost Baseline (Supabase Free Tier)

| Resource | Free Tier Limit | Estimated Usage at 75 DAU |
| :---- | :---- | :---- |
| Supabase DB storage | 500 MB | \~50 MB (1,000 items × \~50KB) |
| Supabase Storage | 1 GB | \~0.5 GB (500 images × \~1MB WebP) |
| Supabase Edge Functions | 500,000 invocations/month | \~50,000/month |
| Supabase Auth | 50,000 MAU | Comfortable |
| Supabase Realtime | 200 concurrent connections | Comfortable |
| Gemini 2.0 Flash (vision) | 1,500 requests/day | 75 DAU × 20 scans \= 1,500 ✅ |
| EAS Build | 30 builds/month | Comfortable for 1–2 developers |
| GitHub Actions | 2,000 minutes/month | \~500 min/month estimated |
| Expo Push | Free | Free |

### 15.2 Per-User Limits

| Limit | Value | Enforcement |
| :---- | :---- | :---- |
| AI scans/day | 20 | Server-side in `analyse-image` Edge Function |
| Images per Haul batch | 20 (also capped by daily scan remaining quota) | Client-side \+ server-side pre-check |
| Kitchens per user | 5 | Application-level check |
| Members per Kitchen | 10 | Application-level check |

### 15.3 Cost Escalation Triggers

| Trigger | Action | Estimated Cost |
| :---- | :---- | :---- |
| Supabase DB \> 400 MB | Upgrade to Supabase Pro | $25/month (8 GB DB, 100 GB Storage) |
| Supabase Storage \> 800 MB | Included in Pro upgrade above | — |
| Gemini requests \> 1,500/day | Enable Gemini Pay-as-you-go | \~$0.075/1K image requests |
| Supabase MAU \> 40,000 | Pro includes 100,000 MAU | Covered by Pro |
| EAS builds \> 30/month | EAS Production plan | $99/month |

### 15.4 Cost Projections

| Daily Active Users | Estimated Monthly Cost |
| :---- | :---- |
| \< 75 DAU (\~500 MAU) | **$0** |
| \~150 DAU (\~1,000 MAU) | **\~$25** (Supabase Pro) |
| \~1,500 DAU (\~10,000 MAU) | **\~$50–75** (Supabase Pro \+ Gemini usage) |
| \~7,500 DAU (\~50,000 MAU) | **\~$200–300** (Supabase Pro \+ Gemini \+ EAS) |

---

## 16\. Non-Functional Requirements

| ID | Requirement | Target | Notes |
| :---- | :---- | :---- | :---- |
| NFR-001 | Image analysis end-to-end latency | \< 3s (p95) | Gemini 2.0 Flash is fast; includes Edge Function cold start (\~200ms) |
| NFR-002 | App cold start (first meaningful paint) | \< 2s | Expo Hermes engine; lazy route loading |
| NFR-003 | Stash list scroll frame rate | 60fps | Use `@shopify/flash-list` (not FlatList) |
| NFR-004 | Offline data readability | ✅ Required | TanStack Query disk cache; last-fetched data visible offline |
| NFR-005 | Offline writes | ❌ Out of scope v1 | Optimistic updates only; requires network to commit |
| NFR-006 | Push notification delivery rate | \> 95% within 5 min | Expo Push SLA; stale token cleanup on 410 response |
| NFR-007 | GDPR data export generation | \< 30s | Edge Function JSON assembly |
| NFR-008 | Image upload success rate | \> 99% | 3-attempt retry with exponential backoff |
| NFR-009 | Accessibility (WCAG 2.1 AA) | Required | Screen reader labels, min 4.5:1 contrast, dynamic font sizes |
| NFR-010 | App download size | \< 50 MB | No bundled RAG data; optimised assets |
| NFR-011 | Notification delivery latency | \< 5 min from 08:00 UTC | pg\_cron → pg\_net → Edge Function → Expo Push |

---

## 17\. Testing Strategy

### 17.1 Test Types and Coverage Targets

| Type | Tool | Coverage Target | Scope |
| :---- | :---- | :---- | :---- |
| Unit | Vitest | 80% | Pure functions, Zustand stores, Zod schemas, utility functions |
| Component | React Native Testing Library | 70% | All reusable UI components, form validation flows |
| Integration | Vitest \+ Supabase CLI (local) | 60% | Edge Functions, RPC functions, RLS policy correctness |
| E2E | Maestro | All key user flows | Happy paths \+ defined error paths |
| AI pipeline | Vitest \+ mocked Gemini responses | Snapshot | Response parsing, field mapping, moderation outcome routing |

### 17.2 Critical Test Cases

**Authentication:**

- Anonymous sign-in creates a `users` record with no PII fields populated  
- OAuth upgrade preserves existing Kitchen memberships and item history  
- Account deletion: images removed from Storage immediately; user record persists for 30 days then purges  
- RLS: a newly signed-in user cannot read another user's Kitchen items

**Image Analysis (Gemini mocked):**

- Valid food image → all expected fields extracted and mapped to item schema  
- Blurry image → `BLURRY` moderation code returned, user-facing message correct  
- Non-food image → `NOT_FOOD` code, user returned to camera  
- Null expiry date in response → AI estimation path triggered correctly  
- Visible expiry date in response → `expiry_source = 'image'`  
- 21st scan in a day → 429 response; scan count not incremented beyond 20

**Barcode scanning:**

- Valid barcode → Open Food Facts fields mapped to item schema correctly  
- Unknown barcode → empty Check It form opened; no Gemini call; scan count unchanged  
- Barcode scan does not increment `scan_rate_limits.scan_count`

**Kitchen permissions (RLS):**

- Viewer cannot INSERT to `items` (Postgres policy test against local Supabase)  
- Editor cannot DELETE a Kitchen record  
- Non-member cannot SELECT from a Kitchen's items

**Notification system:**

- `send-notifications` dispatches to correct users only (Kitchen members with push tokens)  
- Notification message references the correct item name  
- Quick Action "Used it" → `item_events` record created, `items.status` updated  
- Stale token (410) → `push_tokens` record deleted from DB  
- No notification sent for items with `status != 'active'`

**Data retention (pg\_cron behaviour):**

- Used items disappear from Stash query after 14 days (soft-delete applied)  
- Items with `expiry_date < TODAY` have `status = 'expired'` after cron runs  
- Deleted user record → cascade removes kitchen\_members, push\_tokens, scan\_rate\_limits  
- Images deleted from Storage on item soft-delete (verified via Storage API mock)

### 17.3 Maestro E2E Flows

\# Snap It → Check It → Add to Kitchen (happy path)

appId: com.gonebad.app

\---

\- launchApp

\- tapOn: "📷"

\- tapOn: "Snap It"

\- tapOn:

    id: "shutter-button"

\- assertVisible: "Check It"

\- assertVisible:

    id: "field-name"

\- tapOn: "Add to Kitchen"

\- assertVisible: "The Stash"

**Mandatory E2E flows:**

1. Onboarding → first Kitchen auto-created  
2. Snap It → Check It → Add to Kitchen (successful scan)  
3. Snap It → blurry image → moderation failure → re-shoot  
4. The Haul → 5 photos → Line 'Em Up → 1 flagged → bulk add 4  
5. The Stash swipe left → Quantity Modal → full use → item moves to Finished  
6. The Stash swipe left → Quantity Modal → partial use → item stays with updated quantity  
7. Push notification Quick Action "Used it" → item updated without app foreground  
8. Kitchen invite link → new member sees Kitchen items  
9. Account deletion → images removed from Storage; user cannot sign in again

### 17.4 CI Gate Requirements

All PRs to `develop` and `main` must pass:

- `tsc --noEmit` (zero TypeScript errors)  
- ESLint (zero warnings in CI)  
- Prettier (format check)  
- Vitest unit \+ component tests (no coverage regression)  
- Vitest integration tests against local Supabase  
- Maestro E2E on iOS Simulator (GitHub Actions macOS runner)

---

## 18\. CI/CD & Deployment

### 18.1 Branch Strategy

main ────────────── Production (App Store \+ Play Store releases)

  │

  └── develop ────── Staging (EAS preview builds, internal TestFlight/Play testing)

        │

        └── feature/{name} ── Development (Expo Go \+ local Supabase)

All merges to `develop` and `main` require PR review \+ CI gate passing.

### 18.2 GitHub Actions Pipelines

**`ci.yml`** — triggered on every PR to `develop` and `main`:

jobs:

  ci:

    steps:

      \- Checkout

      \- Install Node deps (pnpm)

      \- TypeScript type check

      \- ESLint \+ Prettier

      \- Vitest unit \+ component tests

      \- Start local Supabase (supabase start)

      \- Apply migrations

      \- Vitest integration tests

      \- Maestro E2E (iOS Simulator, macOS runner)

**`eas-preview.yml`** — triggered on merge to `develop`:

jobs:

  preview:

    steps:

      \- Checkout

      \- EAS Build (preview profile) → internal distribution

      \- EAS Update (OTA) → preview channel

**`eas-production.yml`** — triggered on version tag push to `main`:

jobs:

  production:

    steps:

      \- Checkout

      \- EAS Build (production profile) → iOS \+ Android

      \- EAS Submit → App Store (TestFlight first) \+ Google Play (internal track first)

**`seed-rag.yml`** — manual trigger only (via GitHub Actions `workflow_dispatch`):

jobs:

  seed:

    steps:

      \- Checkout

      \- Install deps

      \- Run supabase/seed/rag-seed.ts (fetches, chunks, embeds, upserts to pgvector)

### 18.3 EAS Configuration

{

  "build": {

    "development": {

      "developmentClient": true,

      "distribution": "internal",

      "env": { "APP\_ENV": "development" }

    },

    "preview": {

      "distribution": "internal",

      "env": { "APP\_ENV": "staging" }

    },

    "production": {

      "autoIncrement": true,

      "env": { "APP\_ENV": "production" }

    }

  },

  "submit": {

    "production": {

      "ios": {

        "appleId": "PLACEHOLDER",

        "ascAppId": "PLACEHOLDER"

      },

      "android": {

        "serviceAccountKeyPath": "./secrets/play-store-key.json",

        "track": "internal"

      }

    }

  }

}

### 18.4 Supabase Migration Strategy

- All schema changes as versioned files: `supabase/migrations/YYYYMMDDHHMMSS_description.sql`  
- `supabase db push` applied to staging automatically in CI  
- Production migration requires manual approval via `supabase db push --db-url <prod>` with a separate promotion step  
- Never modify production schema outside of migration files  
- Migration files are immutable once merged to `main`

### 18.5 Secrets Management

| Secret | Storage Location | Accessed By |
| :---- | :---- | :---- |
| `SUPABASE_URL` | EAS Secrets \+ GitHub Actions | Client build, CI |
| `SUPABASE_ANON_KEY` | EAS Secrets \+ GitHub Actions | Client (safe — RLS scoped) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Vault | Edge Functions only (never client) |
| `GEMINI_API_KEY` | Supabase Vault | Edge Functions only |
| `EXPO_ACCESS_TOKEN` | GitHub Actions Secret | EAS CLI |
| `APP_STORE_API_KEY` | GitHub Actions Secret | EAS Submit |
| `PLAY_STORE_SERVICE_ACCOUNT` | GitHub Actions Secret | EAS Submit |

---

## 19\. Future Scope — v2

These items are explicitly out of scope for v1. Noted here for architectural awareness — no v1 decisions should foreclose these options.

| Feature | Notes |
| :---- | :---- |
| Shopping list | Auto-populated from near-expiry items and The Bin entries |
| Recipe suggestions | RAG-powered: "You have 3 things expiring — here's what to make" |
| Offline-first writes | Full CRDT-style conflict resolution; requires significant architecture work |
| Custom fields | User-defined per-Kitchen metadata fields |
| Home screen widget | iOS WidgetKit \+ Android Glance — show most urgent items |
| Full visual theme system | Not Boring-style skins, 3D elements, custom typography |
| Web companion | Next.js \+ Supabase — same database, separate UI |
| Voice input | "Add a litre of milk, expires Friday" |
| Household analytics | Monthly waste reduction reports, trends over time |
| Barcode label printing | QR/label generation for fresh produce without packaging |

---

## 20\. Risk Register

| \# | Risk | Likelihood | Impact | Mitigation |
| :---- | :---- | :---- | :---- | :---- |
| R-001 | Gemini free tier quota exhausted | Medium | High | Per-user rate limit (20/day) enforced server-side; barcode scans use zero quota; daily quota monitoring via Supabase Edge Function logs |
| R-002 | Supabase free tier storage exceeded | Low | Medium | WebP optimisation reduces images to \~300–500KB; 90-day item retention; Supabase dashboard monitoring |
| R-003 | pg\_cron \+ pg\_net fails silently for notification dispatch | Low | High | GitHub Actions cron as fallback trigger (calls same Edge Function via HTTP); monitor `notification_log` for missed days |
| R-004 | India DPDP data localisation requirements expand to food/image data | Medium | Medium | Monitor MEITY publications; architecture supports migrating to an India-region Supabase project (AWS ap-south-1) |
| R-005 | App Store / Play Store rejection for privacy label inaccuracy | Low | High | Pre-submission checklist against actual SDK list; no email/name stored simplifies label significantly |
| R-006 | Gemini safety filters miss obscene content | Low | High | Two-layer defence: Gemini built-in safety \+ explicit `OBSCENE` moderation gate in our prompt |
| R-007 | Kitchen orphaned on Owner account deletion | Low | Medium | Transfer-to-next-Editor logic in `handle-account-deletion` Edge Function; covered by test case |
| R-008 | RAG knowledge base becomes stale | Low | Low | Annual re-seed via `seed-rag.yml` manual workflow; food safety guidance changes slowly |
| R-009 | Expo push token rotation causes silent notification failures | Medium | Low | On 410 from Expo Push: delete token from `push_tokens`; re-register on next app foreground |
| R-010 | UK GDPR / EU GDPR challenge on international transfer (Supabase on AWS US) | Medium | High | Execute SCCs with Supabase before launch; alternatively select EU region Supabase project on Pro plan |
| R-011 | Open Food Facts API reliability | Low | Low | Barcode scanning is enhancement, not core. Failure falls back to manual entry gracefully |
| R-012 | EAS Build free tier (30/month) exceeded during active development | Medium | Low | Batch build triggers; use EAS Update (OTA) for JS-only changes to avoid full rebuilds |

---

*Gone Bad — Technical Design Document v1.0.0-draft*  
*Date: 10 May 2026*  
*Next review: before first EAS production build*

---

**Note on theming:** The visual identity (colour palette, typography, animation system, skin support) is intentionally deferred to v2. All placeholder token values in Section 6.4 are to be replaced with the final design system before v2 development begins. The component structure is designed to make this a single-file swap.  
