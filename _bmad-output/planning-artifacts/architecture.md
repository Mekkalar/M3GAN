---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
workflowType: 'architecture'
project_name: 'm3-gan-feat-event-spec-renter-showcase'
user_name: 'lilies'
date: '2026-02-17'
status: 'complete'
completedAt: '2026-02-17'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
The system is defined by 24 FRs focusing on a rigid "Trust Loop". Architecturally, this demands a State Machine approach for Bookings (Pending -> Paid -> Escrow -> Active -> Returned -> Complete) rather than simple CRUD. The "Handover" phase (FR18-20) implies a need for optimistic UI updates to handle physical meetups.

**Non-Functional Requirements:**
*   **Security:** Zero-trust architecture for PII (IDs). Payment gateways must be isolated (iframe/redirect) to minimize PCI scope.
*   **Performance:** "Mobile-First" is a hard constraint. Architecture must support PWA standards (Manifest, SW, Offline Capabilities) from Day 1.
*   **Compliance:** Data architecture must support "Soft Delete" and "Hard Anonymization" to satisfy PDPA rights while keeping financial audit trails.

**Scale & Complexity:**
*   **Primary Domain:** Progressive Web App (PWA) with Fintech Logic.
*   **Complexity Level:** Medium (Due to Financial/Trust logic, not traffic volume).
*   **Estimated Components:** ~10-12 (Auth, User, Listing, Search, Booking, Payment, Chat, Notification, Admin, Image Service, Review).

### Technical Constraints & Dependencies
*   **Payment Gateway:** Must support "Auth & Capture" (Escrow) and Split Payments (Platform Fee). Dependency on providers like Stripe Connect or Omise.
*   **Identity Verification:** External dependency (OCR/KYC provider) or manual admin workflow (MVP).
*   **Mobile Browser Implementation:** No native code; must rely on Web APIs (Camera, Geolocation, Storage).

### Cross-Cutting Concerns Identified
1.  **Identity & Access Management (IAM):** "Verified" status allows/blocks actions globally.
2.  **Transaction State Management:** The single source of truth for money movement.
3.  **Media Pipeline:** Secure upload, optimization, encryption, and watermarking of user photos.
4.  **Audit Logging:** Immutable history of all financial and compliance actions.

## Starter Template Evaluation

### Primary Technology Domain
**Progressive Web App (PWA) with Fintech Integration** - Validated by PRD requirements for mobile-first access and robust security.

### Starter Options Considered
*   **Standard Next.js CLI:** Good basic flexibility but requires manual setup for Type Safety, Auth, and DB.
*   **Create T3 App:** Excellent "Safe" default. Enforces TypeScript, includes NextAuth/Prisma.
*   **Serwist:** Modern standard for Next.js PWA service workers (replacing unmaintained `next-pwa`).

### Selected Starter: T3 Stack (Custom config) + Serwist

**Rationale for Selection:**
We selected a **modified T3 Stack** to prioritize **Type Safety** (crucial for financial transactions) while maintaing PWA capabilities.
*   **Safety:** T3 ensures the "Trust Loop" data integrity from DB to UI.
*   **Mobile-First:** Tailwind CSS is pre-configured.
*   **PWA:** Serwist is added manually to handle offline capabilities.

**Initialization Command:**
```bash
# 1. Initialize T3 Stack
npm create t3-app@latest m3-gan -- --no-trpc --tailwind --prisma --nextAuth --appRouter

# 2. Add PWA Capabilities
npm install @serwist/next @serwist/precaching @serwist/sw
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
*   **TypeScript:** Strict mode enabled by default.

**Styling Solution:**
*   **Tailwind CSS:** Configured with PostCSS.

**Authentication:**
*   **NextAuth.js:** Ready for Credentials/Social providers (FR1).

**Database (ORM):**
*   **Prisma:** Schema-first approach for managing Users/Listings/Bookings.

**Development Experience:**
*   **T3 Env:** Environment variable validation (schema verification) prevents runtime crashes from missing API keys.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
1.  **Database & ORM:** PostgreSQL + Prisma (Required for financial integrity).
2.  **API Strategy:** Server Actions (Required for type-safe backend integration).
3.  **Authentication:** NextAuth.js (Required for secure access).
4.  **State Management:** Zustand + TanStack Query (Required for PWA offline/optimistic UI).

**Important Decisions (Shape Architecture):**
1.  **Image Handling:** Uploadthing (Simplifies S3 complexity).
2.  **Payment Integration:** Webhook-first architecture (Ensures reliable transaction states).

### Data Architecture
*   **Database:** **PostgreSQL** (via Supabase/Neon/Railway).
    *   *Rationale:* Strict ACID compliance needed for simultaneous booking/inventory updates.
    *   *Version:* PostgreSQL 16+.
*   **Image Storage:** **Uploadthing**.
    *   *Rationale:* Type-safe file uploads, easier to implement "Private Buckets" for KYC docs than raw AWS S3 SDK.

### Authentication & Security
*   **Auth Provider:** **NextAuth.js (v5 Beta / Auth.js)**.
    *   *Rationale:* Deep integration with App Router. Supports required "Credentials" (Phone/OTP) and Social providers.
*   **Payment Security:** **Webhook-Driven State Machine**.
    *   *Rationale:* Client-side success pages are untrusted. Only verified webhooks from Stripe/Omise can transition a booking from `PENDING_PAYMENT` to `ESCROW_HELD`.

### API & Communication Patterns
*   **Internal API:** **React Server Actions**.
    *   *Rationale:* Eliminates the need for a separate API layer (REST/GraphQL) for internal app logic. Tightly coupled with Next.js App Router for form handling and mutations.
*   **External API (Webhooks):** **Next.js Route Handlers** (`app/api/webhooks/route.ts`).
    *   *Rationale:* Standard endpoint for receiving payment provider callbacks.

### Frontend Architecture
*   **Client State:** **Zustand**.
    *   *Rationale:* Lightweight, atomic state management. Perfect for "Shopping Cart" or "Rental Flow" session state.
*   **Server State & Caching:** **TanStack Query (React Query)**.
    *   *Rationale:* Essential for PWA. Handles background refetching, offline caching, and optimistic updates for "Handover" actions when network is spotty.

### Infrastructure & Deployment
*   **Hosting:** **Vercel** (Recommended for T3).
    *   *Rationale:* Zero-config deployment for Next.js, Edge Functions, and Image Optimization.
*   **CI/CD:** **GitHub Actions**.
    *   *Rationale:* Standard checking for Type Safety (tsc), Linting (eslint), and formatting (prettier) before merge.

### Decision Impact Analysis
**Cross-Component Dependencies:**
*   **Auth <-> DB:** User ID from NextAuth must map 1:1 to `User` table in Prisma.
*   **Payment <-> DB:** Webhooks must fetch Booking by ID and securely update status.
*   **Images <-> Auth:** Only authenticated users can upload; KYC images must be strictly access-controlled.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
5 key areas where inconsistent implementation could jeopardize the "Trust Loop": naming, folder structure, error handling, security wrappers, and media handling.

### Naming Patterns

**Database Naming Conventions:**
*   **Models:** `PascalCase` (e.g., `User`, `RentalListing`, `Transaction`). Matches Prisma & TypeScript class standards.
*   **Fields:** `camelCase` (e.g., `firstName`, `isVerified`, `stripeCustomerId`).
    *   *Note:* Prisma maps these to `snake_case` in Postgres automatically (e.g., `first_name`). Agents must use the `camelCase` TS names.

**API Naming Conventions (Server Actions):**
*   **Format:** `verbResource` (e.g., `createListing`, `approveBooking`, `submitKYC`).
*   **Location:** `/src/server/actions/[resource].ts`.

**Code Naming Conventions:**
*   **Components:** `PascalCase.tsx` (e.g., `ListingCard.tsx`). One component per file.
*   **Hooks:** `use[Feature]` (e.g., `useBookingStatus`, `useUploadThing`).

### Structure Patterns

**Project Organization (Feature-Driven T3):**
```text
src/
├── app/               # Next.js App Router (Routes & Layouts ONLY)
├── components/        # Shared UI (Buttons, Inputs, Modals)
├── modules/           # Feature-based organization (Optional but recommended for scale)
│   ├── listing/       # Listing-specific components/hooks
│   └── booking/       # Booking-specific logic
├── server/            # Backend logic
│   ├── db.ts          # Singleton Prisma client
│   └── actions/       # Server Actions grouped by feature
│       ├── auth.ts
│       └── booking.ts
├── lib/               # Shared helpers (utils, validators, types)
└── styles/            # Global Tailwind CSS
```

### Communication & Process Patterns

**Security Wrapper Pattern (Mandatory):**
*   **Rule:** **NEVER** export a raw Server Action. All actions must be wrapped to ensure auth context.
*   **Pattern:** Use a `safeAction` client (e.g., `next-safe-action` or custom Zod wrapper).
    ```typescript
    // BAD
    export async function updateProfile(data) { ... }

    // GOOD
    export const updateProfile = authAction(schema, async ({ ctx, input }) => { ... });
    ```

**Standardized Error Handling:**
*   **Pattern:** Actions MUST return a structured `ActionResponse` object.
    ```typescript
    type ActionResponse<T> =
      | { success: true; data: T }
      | { success: false; code: 'UNAUTHORIZED' | 'VALIDATION_ERROR' | 'SERVER_ERROR'; message?: string };
    ```
    *   *Why:* Allows UI to map error codes to localized messages (e.g., `INSUFFICIENT_FUNDS` -> "ยอดเงินไม่พอ").

**Two-Phase Media Pattern (Optimistic UI):**
*   **Rule:** UI updates for media (Images) must wait for storage confirmation.
*   **Flow:**
    1.  UI shows "Uploading..." (Local State).
    2.  Uploadthing confirms S3 URL.
    3.  *Then* fire Optimistic Mutation to DB with the URL.
*   **Why:** Prevents "Ghost Records" (DB link to non-existent image) on flaky 4G networks.

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
src/
├── app/                       # Next.js App Router
│   ├── (public)/              # Marketing/Landing pages
│   ├── (app)/                 # Main App Layout (Auth Required)
│   │   ├── layout.tsx         # Shell (Bottom Nav, Providers)
│   │   ├── search/            # Browse Listings
│   │   ├── listing/[id]/      # Item Details
│   │   ├── inbox/             # Chat List
│   │   └── profile/           # User Menu
│   └── api/
│       ├── webhooks/          # Third-party callbacks
│       │   ├── stripe/
│       │   └── omise/
│       └── uploadthing/       # Media Handler
├── modules/                   # Feature Domains (Colocated Logic)
│   ├── auth/                  # Sign In, OTP, KYC Components
│   ├── inventory/             # Listings, Availability, Search
│   ├── booking/               # Request Logic, Escrow State Machine
│   ├── messaging/             # PubNub/Ably/Chat Logic
│   └── admin/                 # Dispute Portal
├── server/                    # Backend Logic
│   ├── db.ts                  # Singleton Prisma Client
│   └── actions/               # Server Actions (Public API)
│       ├── auth.ts
│       ├── listings.ts
│       └── bookings.ts
├── lib/                       # Shared Utilities
│   ├── utils.ts               # Tailwind Class Merger
│   ├── formatters.ts          # Currency/Date formatters (Thai)
│   └── validators/            # Zod Schemas
└── prisma/
    └── schema.prisma          # Database Models
```

### Architectural Boundaries

**Module Boundaries:**
*   **Rule:** Modules should *not* directly import from other modules' internal components.
*   **Communication:** Cross-module interaction happens via **Server Actions** (for data) or **URL Routes** (for navigation).
    *   *Example:* `Booking` module calls `listing.getById()` (Server Action), not `<ListingCard />`.

**API Boundaries:**
*   **Internal:** Server Actions (`src/server/actions/*`) are the ONLY way the Frontend mutates data.
*   **External:** Webhooks (`src/app/api/webhooks/*`) are the ONLY way Payment Providers update Transaction status.

**Data Boundaries:**
*   **Prisma:** The *only* place SQL is generated. No raw SQL queries in components.
*   **Uploadthing:** The *only* path for file storage. No direct S3 SDK calls from components.

### Requirements to Structure Mapping

**Features:**
*   **Identity (FR1-5):** `src/modules/auth` + `src/server/actions/auth.ts`.
*   **Inventory (FR6-10):** `src/modules/inventory` + `src/server/actions/listings.ts`.
*   **Booking (FR11-15):** `src/modules/booking` + `src/server/actions/bookings.ts`.
*   **Chat (FR16-17):** `src/modules/messaging`.
*   **Operations/Admin (FR21-24):** `src/modules/admin`.

**Cross-Cutting:**
*   **Security/KYC:** Encapsulated in `src/modules/auth/components/KYCUpload.tsx`.
*   **Escrow Logic:** Centralized in `src/server/actions/bookings.ts` (State Machine).

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
*   **Technology Stack:** T3 (Next.js/Prisma/Tailwind) ensures type safety across the full stack, which is critical for the "Trust Loop". Serwist integrates seamlessly for PWA capabilities.
*   **Pattern Alignment:** The "Security Wrapper" pattern for Server Actions directly supports the strict "Zero-Trust" requirement for financial operations.
*   **Structure:** Feature-based modules align with the domain model, preventing "spaghetti code" as the app scales.

### Requirements Coverage Validation ✅

**Feature Coverage:**
*   **Identity (FR1-5):** Fully covered by `src/modules/auth` and Uploadthing's private bucket support.
*   **Inventory (FR6-10):** Covered by `src/modules/inventory` and Prisma schema.
*   **Booking/Escrow (FR11-15):** Covered by `src/modules/booking` State Machine and Stripe Webhooks.
*   **Operations (FR16-24):** Supported by `src/modules/admin` and Optimistic UI patterns for Handover.

**Non-Functional Requirements:**
*   **security:** Zero-trust Server Actions, 2FA for Admin (via NextAuth middleware).
*   **Performance:** Mobile-first PWA architecture (Serwist) ensures <2.5s LCP.
*   **Compliance:** Data architecture supports soft-deletes for PDPA audit trails.

### Gap Analysis Results

**Minor Gaps (Non-Blocking):**
*   **Automated Escrow Release:** The requirement to auto-release funds if a lender is unresponsive is not explicitly handled by a queue system.
    *   *Resolution:* For MVP, implement a Vercel Cron Job calling a secured Server Action to check for "stale" bookings.

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified

**✅ Architectural Decisions**
- [x] Critical decisions documented (Stack, DB, Auth)
- [x] Technology stack fully specified (T3 + Serwist)
- [x] Integration patterns defined (Webhooks, Actions)

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified (Wrappers, Responses)

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High. The T3 stack is a proven solution for this scale, and the specific PWA/Security patterns address the unique "Trust" risks of the project.

### Implementation Handoff

**AI Agent Guidelines:**
- **Strictly** follow the "Security Wrapper" pattern for ALL Server Actions.
- **Do not** deviate from the Feature-Module structure (`src/modules/*`).
- **Use** the `ActionResponse` type for all backend returns.

**First Implementation Priority:**
Initialize the project repository using the T3 CLI command documented in "Starter Template Evaluation".
