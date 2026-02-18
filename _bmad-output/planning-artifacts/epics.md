---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: ['c:/Users/mekka/Downloads/m3-gan-feat-event-spec-renter-showcase/_bmad-output/planning-artifacts/prd.md', 'c:/Users/mekka/Downloads/m3-gan-feat-event-spec-renter-showcase/_bmad-output/planning-artifacts/architecture.md']
---

# m3-gan-feat-event-spec-renter-showcase - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for m3-gan-feat-event-spec-renter-showcase, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Users can sign up using a phone number (OTP verification).
FR2: Users can upload a photo of their Thai National ID card for KYC purposes.
FR3: Admins can view pending KYC submissions and approve or reject them.
FR4: System must mask sensitive fields (Religion/Blood Type) on ID images automatically or via manual user crop before storage.
FR5: Users cannot list items or send booking requests without "Verified" status.
FR6: Lenders can create a listing with photos, title, description, and replacement value.
FR7: Lenders can set daily, weekly, and custom rental rates.
FR8: Lenders can set a specific "Security Deposit" amount for each item.
FR9: Lenders can block specific dates on an availability calendar.
FR10: Renters can search for items by keywords and filter by Province/District.
FR11: Renters can send a booking request for specific start/end dates.
FR12: System must calculate Total = (Rental Fee * Days) + Service Fee + Security Deposit.
FR13: Lenders can Accept or Decline pending booking requests.
FR14: Renters can pay the Total amount via Payment Gateway (PromptPay/Credit Card).
FR15: System must "Hold" the Security Deposit in a separate Escrow state, not releasing it to the Lender immediately.
FR16: Users specific to a confirmed booking can chat in-app to coordinate meetup locations.
FR17: System must warn users via chat bot if they share phone numbers/Line IDs before booking confirmation.
FR18: Renters can tap "Confirm Receipt" to start the rental timer.
FR19: Lenders can tap "Confirm Return & Condition" to release the transaction.
FR20: Lenders can upload "Pre-rental" and "Post-rental" photos with server timestamps during handover.
FR21: System automatically releases the Deposit to Renter and Rental Fee to Lender upon "Condition Confirmed" status.
FR22: Lenders can "Report Issue" instead of confirming return, which freezes the Deposit in Escrow.
FR23: Admins can review Dispute tickets and evidence (photos/chat logs).
FR24: Admins can manually override the Escrow split (e.g., deduct repair cost from Deposit and refund remainder) to resolve disputes.

### NonFunctional Requirements

NFR1: Data Encryption: AES-256 encryption for all ID card images stored at rest.
NFR2: Payment Compliance: SAQ A-EP Compliance. No processing or storage of raw credit card numbers.
NFR3: Access Control: Administrative actions require 2FA authentication or IP Whitelisting.
NFR4: PDPA (Thai Context): "Right to Erasure" must be supported via a ticket system, transaction logs retained for 10 years.
NFR5: LCP < 2.5 seconds on 4G.
NFR6: Chat Latency < 500ms.
NFR7: Availability: 99.9% uptime during waking hours (06:00 - 00:00 ICT).
NFR8: Data Recovery (RPO): Maximum data loss of 1 hour.
NFR9: PWA Installability: Must pass all Lighthouse PWA criteria.
NFR10: Offline Functionality: "My Bookings" and "Ticket/QR Code" pages must be cached via Service Worker.
NFR11: Touch Targets: All interactive elements must be at least 44x44 pixels.

### Additional Requirements

- **Starter Template:** Initialize using `npm create t3-app@latest m3-gan -- --no-trpc --tailwind --prisma --nextAuth --appRouter` then install `@serwist/next @serwist/precaching @serwist/sw`.
- **Database:** PostgreSQL via Supabase/Neon/Railway (PostgreSQL 16+).
- **Image Storage:** Uploadthing (Private Buckets for KYC).
- **Auth:** NextAuth.js v5 Beta with Credentials & Social Providers.
- **Payment:** Webhook-Driven State Machine (Stripe/Omise).
- **Internal API:** React Server Actions (wrapped in `safeAction`).
- **External API:** Next.js Route Handlers for Webhooks.
- **Client State:** Zustand.
- **Server State:** TanStack Query (React Query).
- **Naming Convention:** PascalCase models/components, camelCase fields, verbResource actions.
- **Project Structure:** Feature-driven modular structure (`src/modules/*`).
- **Security:** Security Wrapper Pattern for all Server Actions.
- **Optimistic UI:** Two-Phase Media Pattern for uploads.
- **Automated Escrow Release:** Vercel Cron Job to check for stale bookings (MVP gap fix).

### FR Coverage Map

FR1: Epic 1 - Identity & Security
FR2: Epic 1 - Identity & Security
FR3: Epic 1 - Identity & Security
FR4: Epic 1 - Identity & Security
FR5: Epic 1 - Identity & Security
FR6: Epic 2 - Inventory Management
FR7: Epic 2 - Inventory Management
FR8: Epic 2 - Inventory Management
FR9: Epic 2 - Inventory Management
FR10: Epic 3 - Discovery & Booking Request
FR11: Epic 3 - Discovery & Booking Request
FR12: Epic 3 - Discovery & Booking Request
FR13: Epic 4 - Financial Transactions
FR14: Epic 4 - Financial Transactions
FR15: Epic 4 - Financial Transactions
FR16: Epic 5 - Operations & Handover
FR17: Epic 5 - Operations & Handover
FR18: Epic 5 - Operations & Handover
FR19: Epic 5 - Operations & Handover
FR20: Epic 5 - Operations & Handover
FR21: Epic 5 - Operations & Handover
FR22: Epic 6 - Dispute Resolution
FR23: Epic 6 - Dispute Resolution
FR24: Epic 6 - Dispute Resolution

## Epic List

### Epic 1: Trust Foundation (Identity & Security)
Establish the "Verified User" baseline. No listings or bookings can happen without this.
**FRs covered:** FR1, FR2, FR3, FR4, FR5

### Epic 2: Inventory Management (Lenders)
Enable supply. Lenders can monetize assets.
**FRs covered:** FR6, FR7, FR8, FR9

### Epic 3: Discovery & Booking Request (Renters)
Enable demand. Renters can find items and initiate the loop.
**FRs covered:** FR10, FR11, FR12

### Epic 4: Financial Transactions (The "Trust Loop")
Secure the funds. Transform a "Request" into a "Commitment".
**FRs covered:** FR13, FR14, FR15

### Epic 5: Operations & Handover (The Physical Loop)
Execute the real-world exchange.
**FRs covered:** FR16, FR17, FR18, FR19, FR20, FR21

### Epic 6: Dispute Resolution (The Safety Net)
Handle exceptions and protect value.
**FRs covered:** FR22, FR23, FR24

## Epic 1: Trust Foundation (Identity & Security)

Establish the "Verified User" baseline. No listings or bookings can happen without this.

### Story 1.1: Phone Authentication & Account Creation

As a Guest,
I want to sign up using my phone number,
So that I can create a secure account without needing an email address.

**Acceptance Criteria:**

**Given** I am on the Signup page
**When** I enter a valid Thai mobile number
**Then** I should receive an SMS with a 6-digit OTP via Twilio/Provider
**And** I should be prompted to enter the OTP
**When** I enter the correct OTP
**Then** A new User record is created in the database
**And** I am logged in with "Unverified" status

### Story 1.2: KYC Data Model & Secure Storage

As a Compliance Officer,
I want to establish the database schema and storage buckets for Identity Verification,
So that user data is stored securely and in compliance with PDPA.

**Acceptance Criteria:**

**Given** The PostgreSQL database is initialized
**When** I examine the `schema.prisma`
**Then** It should include `IdentityVerification` model with fields: `idCardImage`, `status` (PENDING, APPROVED, REJECTED), `rejectionReason`
**And** `User` model should have `verificationStatus` field
**When** I check Uploadthing configuration
**Then** A dedicated "Private Bucket" (Private Files) should be configured, accessible ONLY by Admin and the owner

### Story 1.3: User Identity Upload UI

As an Unverified User,
I want to upload a photo of my Thai National ID card,
So that I can request verification to unlock platform features.

**Acceptance Criteria:**

**Given** I am logged in but "Unverified"
**When** I navigate to the "Verify Identity" page
**Then** I should see an upload area for "Front of ID Card"
**When** I select a photo
**Then** It should be compressed client-side to < 2MB
**And** It should be uploaded to the Secure Private Bucket
**And** The UI should show "Verification Pending" status

### Story 1.4: Auto-Masking & PII Protection

As a Compliance Officer,
I want sensitive fields (Religion/Blood Type) on ID cards to be masked,
So that we adhere to Thai PDPA data minimization principles.

**Acceptance Criteria:**

**Given** A user is uploading an ID card image
**When** The image is processed (Client or Server)
**Then** A black bar/blur should be applied to the bottom section of the card (standard location for Religion/Blood Type)
**And** The original unmasked image should NOT be stored permanently
**And** The masked version is saved for Admin review

### Story 1.5: Admin Verification Dashboard

As an Admin,
I want to view a queue of pending identity verifications,
So that I can approve valid users or reject invalid ones.

**Acceptance Criteria:**

**Given** I am logged in as Admin
**When** I navigate to the "KYC Queue"
**Then** I should see a list of users with `status: PENDING`
**When** I click a user
**Then** I can view their uploaded ID image
**When** I click "Approve"
**Then** The User's `verificationStatus` updates to `VERIFIED`
**When** I click "Reject"
**Then** I must select a reason (e.g., "Blurry", "Expired")
**And** The user receives a notification to retry

## Epic 2: Inventory Management (Lenders)

Enable supply. Lenders can monetize assets.

### Story 2.1: Listing Creation Wizard

As a Verified Lender,
I want to create a listing with photos and details,
So that renters can see my item.

**Acceptance Criteria:**

**Given** I am a Verified User
**When** I navigate to "List an Item"
**Then** I should be guided through a multi-step form:
1.  **Details:** Title, Description, Category, Brand
2.  **Photos:** Upload up to 10 images (Public bucket)
3.  **Location:** Select Province and District
**When** I submit the form
**Then** A new `RentalListing` record is created with `status: DRAFT` (until published)

### Story 2.2: Dynamic Pricing Engine

As a Lender,
I want to set daily and weekly rental rates,
So that I can offer discounts for longer rentals.

**Acceptance Criteria:**

**Given** I am editing a listing's pricing
**When** I enter a "Daily Rate" (e.g., 500 THB)
**And** I enter a "Weekly First Day Rate" (e.g., 3000 THB)
**Then** The system should store these in the pricing model
**And** The UI should show the calculated "Average Daily Price" for a 7-day rental
**When** A renter selects dates
**Then** The total should be calculated using the most favorable rate

### Story 2.3: Security Deposit Configuration

As a Lender,
I want to set a replacement value and a security deposit amount,
So that I feel protected against loss or damage.

**Acceptance Criteria:**

**Given** I am editing a listing
**When** I enter the "Replacement Value" (e.g., 50,000 THB)
**And** I enter the "Security Deposit" (e.g., 10,000 THB)
**Then** The system should validate that Deposit <= Replacement Value
**And** The Deposit amount should be clearly displayed to potential renters
**And** This value will be used for the Escrow Hold during bookings

### Story 2.4: Availability Calendar

As a Lender,
I want to block specific dates when I need the item myself,
So that I don't receive booking requests for those days.

**Acceptance Criteria:**

**Given** I am viewing my "Manage Listings" dashboard
**When** I click "Calendar" for an item
**Then** I can select a date range (e.g., Dec 25-31)
**When** I mark it as "Unavailable"
**Then** These dates should be visually blocked on the public listing page
**And** Renters should be unable to select them for a booking

## Epic 3: Discovery & Booking Request (Renters)

Enable demand. Renters can find items and initiate the loop.

### Story 3.1: Listing Search & Filters

As a Renter,
I want to search for items by keyword and filter by location,
So that I can find gear near me easily.

**Acceptance Criteria:**

**Given** I am on the Search page
**When** I enter a keyword (e.g., "Sony A7")
**Then** Results should match on Listing Title or Description
**When** I select a "Province: Bangkok" and "District: Sukhumvit"
**Then** Results should filter to show only items in that location
**And** If no items match, "No items found" empty state is shown

### Story 3.2: Listing Detail Page

As a Renter,
I want to view full details of a listing,
So that I can decide if it meets my needs.

**Acceptance Criteria:**

**Given** I click on a search result
**Then** I should see the Listing Detail page
**And** It should display: Photo Carousel, Title, Description, Daily/Weekly Rates, Security Deposit
**And** It should show a "Meet the Owner" section with the Lender's name and Verified badge
**And** The page should have SEO meta tags (Title, Description) for social sharing

### Story 3.3: Booking Cost Calculator

As a Renter,
I want to see the total price for my dates before I request,
So that I know exactly how much I need to pay and deposit.

**Acceptance Criteria:**

**Given** I am on a Listing page
**When** I select a Start Date and End Date
**Then** The system should calculate the "Total" dynamically:
1.  Rental Fee = (Rate * Days)
2.  Service Fee (Platform % of Rental Fee)
3.  Security Deposit (Fixed Amount)
**And** It should prevent me from selecting "Unavailable" dates from the calendar

### Story 3.4: Booking Request Flow

As a Renter,
I want to send a formal booking request to the lender,
So that I can reserve the item for my dates.

**Acceptance Criteria:**

**Given** I have selected valid dates and see the Total
**When** I click "Request to Book"
**Then** **System must check my `verificationStatus`**
**And** **IF** I am NOT verified, I must be redirected to `/verify-identity` with a toast "Please verify ID to book"
**And** **IF** I am verified, a new `Booking` is created with status `PENDING_APPROVAL`
**And** The Lender receives a notification (Email/In-App)
**And** NO payment is taken at this stage

## Epic 4: Financial Transactions (The "Trust Loop")

Secure the funds. Transform a "Request" into a "Commitment".

### Story 4.1: Lender Booking Management

As a Lender,
I want to accept or decline pending booking requests,
So that I control who uses my gear.

**Acceptance Criteria:**

**Given** I have a `PENDING_APPROVAL` booking
**When** I click "Accept"
**Then** The booking status updates to `AWAITING_PAYMENT`
**And** **System must trigger a notification (Email/In-App) to the Renter:** 'Your request is accepted! Please complete payment within 24 hours to confirm.' along with a link to the Checkout page
**When** I click "Decline"
**Then** The booking status updates to `DECLINED` and the Renter is notified

### Story 4.2: Payment Gateway Integration (Checkout)

As a Renter,
I want to pay the Total Amount (Fee + Deposit) securely,
So that I can confirm my booking.

**Acceptance Criteria:**

**Given** My booking is `AWAITING_PAYMENT`
**When** I click "Pay Now"
**Then** I am redirected to the Stripe/Omise hosted checkout page
**And** The checkout session includes metadata: `bookingId`, `userId`
**When** I complete payment successfully
**Then** I am redirected back to `/booking/[id]/success`
**And** I see a "Payment Processing" state (waiting for webhook)

### Story 4.3: Escrow & Split Logic

As a Platform Admin,
I want the system to split the payment into Platform Fee and Escrow Hold,
So that we earn revenue while protecting the deposit.

**Acceptance Criteria:**

**Given** A successful payment charge
**Then** The Payment Gateway must split the funds:
1.  **Platform Fee** -> Transferred to Admin Account
2.  **Rental Fee + Deposit** -> Held in Platform Escrow (Not paid to Lender yet)
**And** The transaction record in DB should reflect `status: HELD`

### Story 4.4: Webhook Handler State Machine

As a Finance Manager,
I want the system to handle asynchronous payment webhooks,
So that our database status matches the actual money movement.

**Acceptance Criteria:**

**Given** A `checkout.session.completed` webhook is received
**When** The signature is validated
**Then** The system finds the associated `Booking`
**And** Updates status from `AWAITING_PAYMENT` to `ESCROW_HELD` (Confirmed)
**And** Sends a "Booking Confirmed" notification to both parties
**And** The webhook returns `200 OK` to the provider

## Epic 5: Operations & Handover (The Physical Loop)

Execute the real-world exchange.

### Story 5.1: Secure In-App Chat

As a Renter or Lender,
I want to chat regarding a listing or booking,
So that we can coordinate details without sharing personal contacts prematurely.

**Acceptance Criteria:**

**Given** I am on a Listing or Booking page
**When** I click "Chat with Owner/Renter"
**Then** A real-time chat session is opened
**When** I send a message containing a phone number or Line ID pattern
**And** The booking status is NOT yet `CONFIRMED`
**Then** The system should mask the sensitive info or warn me (Anti-circumvention)

### Story 5.2: "My Rentals" Dashboard

As a User,
I want to see my active bookings and the next action I need to take,
So that I don't miss a step in the process.

**Acceptance Criteria:**

**Given** I am on the "My Bookings" page
**Then** I should see a list of Renting and Lending items
**And** Each item should have a primary "Action Button" based on state:
*   `AWAITING_PAYMENT` -> "Pay Now"
*   `ESCROW_HELD` (Lender) -> "Upload Pre-Rental Photos"
*   `ESCROW_HELD` (Renter) -> "Confirm Receipt"
*   `ACTIVE` (Lender) -> "Confirm Return"

### Story 5.3: Handover: Confirm Receipt

As a Renter,
I want to confirm I have received the item,
So that the rental period can officially start.

**Acceptance Criteria:**

**Given** I am at the meetup location with the Lender
**When** I tap "Confirm Receipt"
**Then** **System must check if Lender has uploaded Pre-Rental photos**
**And** **IF** photos are missing, Show error: "Lender must upload condition photos first"
**And** **IF** photos exist, Update status to `ACTIVE`
**And** Start the rental timer

### Story 5.4: Return Flow & Evidence Upload

As a Lender,
I want to upload post-rental photos and confirm the return,
So that the transaction can be closed.

**Acceptance Criteria:**

**Given** The item has been returned
**When** I tap "Confirm Return & Condition"
**Then** I MUST upload at least 1 "Post-Rental" photo (timestamped)
**And** The system updates status to `COMPLETED`
**And** Triggers the payout process

### Story 5.5: Automated Payout (Happy Path)

As a Finance Manager,
I want the system to automatically release the escrowed funds when a return is confirmed,
So that users get paid/refunded without manual admin work.

**Acceptance Criteria:**

**Given** A booking status updates to `COMPLETED`
**Then** The Escrow Hold is released:
1.  **Rental Fee** -> Transferred to Lender's Connected Account
2.  **Security Deposit** -> Refunded to Renter's Card
**And** Users receive a "Transaction Complete" notification

## Epic 6: Dispute Resolution (The Safety Net)

Handle exceptions and protect value.

### Story 6.1: Report Issue Flow

As a Lender,
I want to report an issue instead of confirming a return,
So that the security deposit is not automatically released to the renter.

**Acceptance Criteria:**

**Given** The rental period has ended
**And** I am on the "Confirm Return" screen
**When** I tap "Report Issue"
**Then** The Booking status updates to `DISPUTE_OPEN`
**And** The Escrow Hold is **FROZEN** (No auto-release)
**And** I am prompted to select an issue type (e.g., "Late Return", "Damage", "Improper Item")

### Story 6.2: Dispute Evidence Collection

As a Lender or Renter,
I want to upload evidence to the dispute ticket,
So that the admin can see my side of the story.

**Acceptance Criteria:**

**Given** A dispute is open
**When** I navigate to the Booking details
**Then** I should see a "Dispute Evidence" section
**When** I upload photos or add a text description
**Then** The counterparty should be able to see it (Shared Evidence Bucket)
**And** The Admin should be notified of new evidence

### Story 6.3: Admin Dispute Portal

As an Admin,
I want to allow review dispute tickets and evidence,
So that I can make a fair decision.

**Acceptance Criteria:**

**Given** I am in the Admin Dashboard
**When** I view "Active Disputes"
**Then** I can see the full Booking Timeline (Receipt -> Return -> Dispute)
**And** I can view "Pre-Rental" and "Post-Rental" photos side-by-side for comparison
**And** I can view the chat logs between the parties

### Story 6.4: Escrow Override Actions

As an Admin,
I want to manually override the escrow split,
So that I can resolve the dispute and release funds appropriately.

**Acceptance Criteria:**

**Given** I have reviewed a dispute
**When** I make a decision
**Then** I can choose one of 3 actions:
1.  **Full Refund to Renter:** (False alarm) - Deposit returned.
2.  **Partial Payout:** (Damage) - Specify amount X to Lender from Deposit, remainder to Renter.
3.  **Full Seizure:** (Total Loss) - 100% of Deposit to Lender.
**And** The system executes the transfer immediately
**And** The Booking status updates to `RESOLVED`
