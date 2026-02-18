---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
inputDocuments: ['c:/Users/mekka/Downloads/m3-gan-feat-event-spec-renter-showcase/_bmad-output/planning-artifacts/product-brief.md']
workflowType: 'prd'
classification:
  projectType: 'web_app'
  domain: 'fintech_marketplace'
  complexity: 'high'
  projectContext: 'greenfield'
---

# Product Requirements Document - m3-gan-feat-event-spec-renter-showcase

**Author:** lilies
**Date:** 2026-02-17

## Executive Summary
m3-gan is a Consumer-to-Consumer (C2C) rental platform designed to democratize access to high-quality goods while enabling asset owners to monetize their underutilized possessions. Positioned as the "Shopee for Rentals," it bridges the gap between ownership and access with a focus on ease of use, trust, and security. The platform solves the problem of idle assets for owners and the high cost of purchasing for temporary needs for renters.

## Success Criteria

### User Success
*   **Trust & Retention (The "Aha!" Moment):** A lister posts a **second item** after their first rental experience. This indicates they trust the platform's safety measures and see value in the recurring income.
*   **Safety Perception:** Users complete the KYC process without drop-off, viewing it as a necessary safety feature rather than a barrier.

### Business Success
*   **Viability Milestone:** Achieve **100 completed transactions** within the first 6 months of launch.
*   **Market Validation:** Prove that the escrow and deposit system works seamlessly for these 100 transactions with zero unresolved fraud incidents.

### Technical Success
*   **Reliability:** Zero critical failures in the Escrow/Payment processing flow.
*   **Scalability:** Architecture supports the initial 100 transactions and can scale to 1,000 without major refactoring.
*   **Security:** Secure storage of KYC data and PII compliance.

### Measurable Outcomes
*   **Lister Retention Rate:** >20% of first-time listers post a second item within 30 days.
*   **Transaction Volume:** 100 successfully completed rentals (end-to-end) by Month 6.
*   **Dispute Rate:** <5% of bookings require manual admin intervention for deposit disputes.



## User Journeys

### 1. Sarah's First Listing (The Lender)
**Persona:** Sarah, a freelance photographer with a stash of lenses she rarely uses.
**Goal:** Earn passive income safely.
**Narrative:** Sarah downloads m3-gan, skeptical about lending her expensive gear. She signs up and sees the "Verified ID" badge requirement. She snaps a photo of her ID and gets verified in minutes. She posts her 85mm lens, setting a daily rate and a robust security deposit. The "Smart Calendar" lets her block out dates she needs it herself. When her listing goes live with a "Protected by Escrow" badge, she feels a sense of relief and excitement for her first booking.
**Key Requirements:** ID Verification (KYC), Simple Listing Flow, Availability Calendar, Deposit Configuration, Trust Badges.

### 2. Mike's Urgent Need (The Renter)
**Persona:** Mike, a film student needing a specific lens for a weekend shoot.
**Goal:** Rent high-quality gear quickly and affordably.
**Narrative:** Mike finds a lens on a generic marketplace but fears getting scammed. He switches to m3-gan and finds Sarah's listing nearby. He sees her "Verified" status and high response rate. He selects his dates, seeing the total cost including the refundable deposit. He pays via the secure gateway, knowing his money is held in escrow. He messages Sarah via in-app chat to arrange the meetup.
**Key Requirements:** Search/Filter, Verified User Display, Transparent Pricing (Fee + Deposit), Secure Payment Gateway, In-App Chat.

### 3. The Handover & Happy Return (End-to-End Success)
**Actors:** Sarah (Lender) & Mike (Renter)
**Scenario:** The shoot is done, and it's time to return the lens.
**Narrative:** Mike meets Sarah at the agreed spot. He hands over the lens. Sarah inspects it right there, checking for scratches. She opens the m3-gan app and taps "Confirm Return & Condition OK".
*   **System Action:** The app instantly processes the transaction.
*   **Result:** Mike gets a notification: "Deposit Released". Sarah gets a notification: "Rental Fee Payout Initiated". Both are prompted to leave a star rating and review. They part ways, both happy with the seamless, trust-less transaction.
**Key Requirements:** Mobile-first Transaction Dashboard, "Confirm Condition" Action Button, Automated Escrow Release Logic, Payout System, Double-blind Review System.

### 4. The Dispute (Edge Case)
**Scenario:** A lens comes back scratched.
**Narrative:** Upon return, Sarah notices a deep scratch on the glass. She taps "Report Issue" instead of "Confirm OK". She uploads a photo of the damage directly in the app. The system freezes the deposit in escrow and opens a "Dispute Ticket". Mike gets a notification to explain his side. The funds stay safe until an Admin steps in.
**Key Requirements:** Dispute Reporting Logic, Photo Upload Evidence, Deposit Freeze Mechanism, Dispute Status Tracking.

### 5. The Admin (Operational)
**Persona:** Alex, m3-gan support staff.
**Narrative:** Alex logs into the Admin Portal and sees Sarah's dispute ticket. He reviews the "Before" photos from the listing and the "After" photos Sarah just uploaded. He checks the chat history. He determines the damage is new and approves a partial deduction from the deposit to cover repairs. He clicks "Resolve", sending the repair cost to Sarah and the remainder back to Mike.
**Key Requirements:** Admin Dashboard, Ticket Management System, Evidence Viewer, Manual Escrow Override/Partial Refund Capability.

### Journey Requirements Summary
*   **Identity:** Robust KYC integration is the gatekeeper for all journeys.
*   **Financial:** Split-payment logic (Fee vs. Deposit) and Escrow-hold capability are central to the "Happy Return" and "Dispute" flows.
*   **Operational:** The specific "Confirm Condition" button is a critical UI element that triggers the financial logic.
*   **Support:** An Admin portal with financial override powers is mandatory for MVP to handle disputes.

## Domain-Specific Requirements

### Compliance & Regulatory
*   **Thai PDPA (Personal Data Protection Act):**
    *   **Strict Consent:** Explicit consent checkboxes for collecting and processing ID card data.
    *   **Data Minimization:** Auto-masking or manual masking of sensitive fields (Religion, Blood Type) on ID images.
*   **Identity Verification (Thai Market):**
    *   **Laser Code Validation:** Validation of the Laser Code on the back of Thai National ID cards to detect forgeries.
*   **Financial Compliance:**
    *   **Escrow Handling:** Compliance with local financial regulations regarding holding user funds (likely via licensed payment gateway).

### Technical Constraints
*   **Evidence Integrity (Disputes):**
    *   **Timestamped Evidence:** "Pre-rental" and "Post-rental" condition photos must be uploaded to the server with immutable server-side timestamps.
    *   **Metadata:** EXIF data preservation where possible, but server time is the source of truth.
*   **Security:**
    *   **Encryption:** ID card images and PII encrypted at rest (AES-256) and in transit (TLS 1.2+).
    *   **Audit Trails:** Immutable logs for all financial actions (Deposit Authorized, Captured, Released).

### Integration Requirements
*   **Payment Gateway:**
    *   **Split Payments:** Automatic routing of funds: Platform Fee -> m3-gan, Rental Fee -> Lender.
    *   **Auth & Capture:** Ability to "Authorize" (hold) a deposit amount without immediate capture, then "Release" or "Capture" based on return condition.
*   **SMS/OTP:** Mandatory phone number verification for user accounts.

### Risk Mitigations
*   **Minor Damage (Scratches/Dents):**
    *   **Mitigation:** Mandatory "Condition Checklist" UI that both parties must approve/sign-off in-app at the moment of handover.
*   **Platform Circumvention:**
    *   **Mitigation:** Intelligent chat filters to warn/block sharing of personal contact info (Phone/Line ID) before a booking is confirmed.
*   **Item Theft:**
    *   **Mitigation:** High deposit value settings + Verified ID + Laser Code check.

## Web App Specific Requirements

### Project-Type Overview
m3-gan will be a **Progressive Web App (PWA)** built with **Next.js** and **Tailwind CSS**. It must be "Mobile-First" in design and performance, as the majority of users (Renters and Lenders on the go) will access it via mobile browsers (Chrome/Safari) or installed to their home screen.

### Technical Architecture Considerations
*   **Tech Stack:**
    *   **Framework:** Next.js (React) for robust SSR and PWA support.
    *   **Styling:** Tailwind CSS for mobile-first responsive design.
    *   **Image Optimization:** `next/image` for automatic optimization to meet <2s LCP targets.

### Browser & Device Support
*   **Mobile-First Targets:**
    *   **iOS:** Safari (Last 2 major versions).
    *   **Android:** Chrome (Last 2 major versions).
*   **Desktop:** Chrome, Edge, Safari, Firefox (Latest versions) for Admin Portal and specialized lender management.
*   **Responsive Breakpoints:**
    *   **Mobile:** 375px (iPhone SE/Mini baseline).
    *   **Tablet:** 768px (iPad Portrait).
    *   **Desktop:** 1024px+ (Laptop/Admin).

### SEO & Performance Strategy
*   **Server-Side Rendering (SSR):** Next.js SSR must be used for all public listing pages (`/listing/[id]`) and category pages to ensure indexability by Google.
*   **Performance Metrics:**
    *   **Core Web Vitals:** LCP < 2.5s, FID < 100ms, CLS < 0.1.
    *   **Offline Mode:** Service Workers to cache "My Bookings" and "Chat" for low-connectivity environments (PWA requirement).
*   **Social Sharing:** Dynamic OpenGraph (OG) meta tags for every listing to ensure rich previews on LINE, Facebook, and Twitter.

### Accessibility
*   **Compliance:** WCAG 2.1 Level AA.
    *   **Color Contrast:** Minimum 4.5:1 for normal text.
    *   **Touch Targets:** Minimum 44x44px for all interactive elements (buttons, links) to support mobile usage.
    *   **Semantic HTML:** Proper use of `<button>`, `<a>`, and ARIA labels where necessary.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy
**MVP Approach:** The **"Trust MVP"**. We prioritize features that build trust (KYC, Escrow, Reviews) over feature breadth (Maps, Logistics). If users feel safe, they will list and rent.
**Resource Requirements:** Lean team focusing on core flow reliability. Front-end (Next.js), Back-end (API/DB), and Manual Ops/Admin for initial dispute handling.

### MVP Feature Set (Phase 1 - Launch)
**Core User Journeys Supported:**
*   Lender Listing & Verification
*   Renter Search & Booking
*   Handover & Condition Confirmation
*   Dispute Reporting & Resolution

**Must-Have Capabilities:**
*   **Identity:** ID Upload & Admin Verification Panel.
*   **Discovery:** List View Search with District/Province filters (No Map).
*   **Transaction:** Booking Request > Escrow Hold > Release.
*   **Communication:** In-App Chat for logistics coordination.
*   **Ops:** "Confirm Condition" UI for Handover; Admin Dispute Dashboard.

### Post-MVP Features

**Phase 2: Growth & Friction Reduction (Months 4-6)**
*   **Map View:** Visual search once listing density is sufficient to avoid "empty map" syndrome.
*   **Saved Cards:** One-tap payments for repeat renters.
*   **Social Logins:** Faster signup via Google/Line.
*   **Automated Payouts:** Weekly batch payouts to reduce manual ops.

**Phase 3: Scale & Ecosystem (Months 7+)**
*   **Insurance Integration:** Optional damage protection for high-value items.
*   **Delivery API:** Integrated logistics (GrabExpress/Lalamove) for convenience.
*   **Video Listings:** Richer item previews.

### Risk Mitigation Strategy
**Technical Risks:**
*   **Real-time Handover:** Reliance on mobile connectivity at swap locations.
    *   **Mitigation:** Optimistic UI updates and Offline-first architecture (PWA) for the "Confirm Condition" action.

**Market Risks:**
*   **Platform Circumvention (Off-Platform Deals):**
    *   **Mitigation:** Clear communication of value prop: **"No Platform = No Deposit Protection"**. If users deal off-platform, they lose the safety net of the escrow and dispute resolution.

**Resource Risks:**
*   **Ops Overload:** Manual dispute resolution scaling poorly.
    *   **Mitigation:** Strict "Evidence" requirements in the app to filter out frivolous disputes before they reach Admins.

## Functional Requirements

### 1. Identity & Compliance (The Gatekeepers)
*   **FR1:** Users can sign up using a phone number (OTP verification).
*   **FR2:** Users can upload a photo of their Thai National ID card for KYC purposes.
*   **FR3:** Admins can view pending KYC submissions and approve or reject them.
*   **FR4:** System must mask sensitive fields (Religion/Blood Type) on ID images automatically or via manual user crop before storage.
*   **FR5:** Users cannot list items or send booking requests without "Verified" status.

### 2. Inventory & Licensing
*   **FR6:** Lenders can create a listing with photos, title, description, and replacement value.
*   **FR7:** Lenders can set daily, weekly, and custom rental rates.
*   **FR8:** Lenders can set a specific "Security Deposit" amount for each item.
*   **FR9:** Lenders can block specific dates on an availability calendar.
*   **FR10:** Renters can search for items by keywords and filter by Province/District.

### 3. Booking & Transaction (The Core Loop)
*   **FR11:** Renters can send a booking request for specific start/end dates.
*   **FR12:** System must calculate Total = (Rental Fee * Days) + Service Fee + Security Deposit.
*   **FR13:** Lenders can Accept or Decline pending booking requests.
*   **FR14:** Renters can pay the Total amount via Payment Gateway (PromptPay/Credit Card).
*   **FR15:** System must "Hold" the Security Deposit in a separate Escrow state, not releasing it to the Lender immediately.

### 4. Handover & Operations (The Physical Loop)
*   **FR16:** Users specific to a confirmed booking can chat in-app to coordinate meetup locations.
*   **FR17:** System must warn users via chat bot if they share phone numbers/Line IDs before booking confirmation.
*   **FR18:** Renters can tap "Confirm Receipt" to start the rental timer.
*   **FR19:** Lenders can tap "Confirm Return & Condition" to release the transaction.
*   **FR20:** Lenders can upload "Pre-rental" and "Post-rental" photos with server timestamps during handover.

### 5. Financial & Disputes (The Safety Net)
*   **FR21:** System automatically releases the Deposit to Renter and Rental Fee to Lender upon "Condition Confirmed" status.
*   **FR22:** Lenders can "Report Issue" instead of confirming return, which freezes the Deposit in Escrow.
*   **FR23:** Admins can review Dispute tickets and evidence (photos/chat logs).
*   **FR24:** Admins can manually override the Escrow split (e.g., deduct repair cost from Deposit and refund remainder) to resolve disputes.

## Non-Functional Requirements

### Security & Compliance
*   **Data Encryption:** AES-256 encryption for all ID card images stored at rest.
*   **Payment Compliance:** SAQ A-EP Compliance. No processing or storage of raw credit card numbers on our servers; all inputs must use the Payment Gateway's iframe/SDK.
*   **Access Control:** Administrative actions (e.g., KYC Approval, Escrow Release) require 2FA authentication or IP Whitelisting.
*   **PDPA (Thai Context):** "Right to Erasure" must be supported via a ticket system, but transaction logs and financial data must be retained for 10 years for auditing purposes (legal override).

### Performance
*   **LCP (Largest Contentful Paint):** Listing pages must load and render main content in **< 2.5 seconds** on a standard 4G network connection.
*   **Chat Latency:** Messages must be sent and received with **< 500ms** latency to ensure fluid conversation.

### Reliability
*   **Availability:** 99.9% uptime during waking hours (06:00 - 00:00 ICT).
*   **Data Recovery (RPO):** Maximum data loss of 1 hour in case of catastrophic failure (Hourly database backups).

### Mobile Capability (PWA)
*   **Installability:** Must pass all Lighthouse PWA criteria (Manifest, Service Worker, HTTPS) to trigger the "Add to Home Screen" prompt on Android and iOS.
*   **Offline Functionality:** "My Bookings" and "Ticket/QR Code" pages must be cached via Service Worker and viewable without an internet connection (e.g., in basements).
*   **Touch Targets:** All interactive elements must be at least 44x44 pixels to prevent usability errors on mobile screens.
