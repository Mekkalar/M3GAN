---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-03-core-experience
  - step-04-emotional-response
  - workflow-complete
inputDocuments:
  - c:\Users\mekka\Downloads\m3-gan-feat-event-spec-renter-showcase\_bmad-output\planning-artifacts\prd.md
  - c:\Users\mekka\Downloads\m3-gan-feat-event-spec-renter-showcase\_bmad-output\planning-artifacts\product-brief.md
---

# UX Design Specification m3-gan-feat-event-spec-renter-showcase

**Author:** lilies
**Date:** 2026-02-17

---

## Executive Summary

### Project Vision

m3-gan is a "Trust First" C2C rental marketplace (The "Shopee for Rentals") designed to democratize access to high-quality goods. It bridges the gap between ownership and access by enabling asset owners to monetize underutilized items safely. The platform prioritizes trust features (KYC, Escrow, Verification) over feature breadth to overcome the primary barrier of fear (theft/damage/fraud) in peer-to-peer rentals.

### Target Users

1.  **Lenders (Asset Owners):** Individuals with valuable, underutilized assets (e.g., cameras, camping gear). They are risk-averse, fearing theft or damage. They need robust verification, deposit protection, and a sense of control over who rents their items.
2.  **Renters (Temporary Users):** Individuals needing high-quality items for short-term use (e.g., a specific lens for a project). They are price-conscious but fear scams. They need affordability, transparency in pricing, and a secure transaction process.
3.  **Admins:** Operational staff managing disputes, KYC approvals, and platform safety. They need efficient tools to resolve conflicts and verify identities quickly.

### Key Design Challenges

1.  **Building Trust in a Trustless Environment:** Convincing users to hand over expensive items to strangers requires a UX that screams "Safe" at every touchpoint (badges, clear escrow language, verification steps).
2.  **Complex Transaction Flows on Mobile:** The rental flow involves multiple states (Request -> Accept -> Pay -> Handover -> Return -> Release). Designing this to be intuitive and mistake-proof on a mobile screen, especially during the physical handover (offline/on-the-go), is critical.
3.  **Friction vs. Safety:** KYC and Escrow add friction. The UX must explain *why* this friction exists (for their safety) to prevent drop-off during onboarding and booking.

### Design Opportunities

1.  **"Handover Mode":** Create a distinct, high-contrast UI mode for the physical exchange moment (Pickup/Return) that guides users step-by-step through inspection and confirmation, perhaps functioning even with poor connectivity.
2.  **Visual Trust Indicators:** Use visual design (colors, icons, micro-copy) to constantly reinforce the safety of the escrow system (e.g., a "Funds Secured" lock animation).
3.  **Smart Calendar & Pricing:** Simplify the complex task of setting availability and tier pricing for lenders through intuitive, interactive calendar controls.

## Core User Experience

### Defining Experience

The core experience of m3-gan centers on the **physical handover moment** - the critical interaction where trust is proven or broken. The primary user loop is: Browse → Book → **Handover (Pickup/Return)** → Confirm Condition. The most frequent and critical action is the **"Confirm Return & Condition" flow**, where both parties verify the item's state and trigger the automated escrow release.

The defining interaction that must be absolutely effortless is the **"Handover Mode"** - a guided, foolproof mobile UI for the pickup/return moment that functions reliably even with poor connectivity (basements, parking garages, remote meetup spots).

### Platform Strategy

**Primary Platform:** Progressive Web App (PWA)
- **Mobile-First:** Touch-based interaction optimized for 375px baseline (iPhone SE)
- **Installability:** Must pass Lighthouse PWA criteria for "Add to Home Screen" on iOS/Android
- **Offline-First Architecture:** Critical flows ("My Bookings", "Confirm Condition") must work without internet connection
- **Device Capabilities:**
  - Camera access for ID upload and condition photo evidence
  - GPS (future enhancement for location-based search)
  - Push notifications for booking updates and handover reminders

**Desktop Support:** Secondary priority for Admin Portal and power lenders managing multiple listings.

### Effortless Interactions

1.  **Listing Creation:** Smart calendar + tier pricing should feel like filling out a simple form, not a complex configuration task. Auto-suggest pricing based on item category.
2.  **Trust Verification:** KYC should be framed as a security feature ("Get Verified to Unlock Rentals"), not a bureaucratic barrier. One-tap ID photo upload with instant feedback.
3.  **Handover Confirmation:** One-tap "Confirm Condition OK" button that works offline, with optimistic UI updates and background sync when connectivity returns.
4.  **Escrow Transparency:** Real-time visual indicators showing where funds are ("Held Safely", "Released to You") to eliminate anxiety.

### Critical Success Moments

1.  **First Verification ("I'm Safe Here"):** User completes KYC, sees "Verified" badge appear on their profile → feels protected and legitimate.
2.  **First Booking Accepted ("This is Real"):** Renter pays, sees "Funds Secured in Escrow" with lock icon → trusts the platform won't let them get scammed.
3.  **Successful Return ("It Actually Works!"):** Both parties tap "Confirm Condition OK" → instant deposit release notification → "This platform delivers on its promise."
4.  **First Dispute Resolved ("They Have My Back"):** Admin reviews evidence, makes fair split → user sees platform actively protects them.

### Experience Principles

1.  **Trust Through Transparency:** Every financial state (Authorized, Held, Released) must be visually clear. No hidden fees, no ambiguous language.
2.  **Offline-First for Critical Moments:** Handover actions must never fail due to connectivity. Design for the worst-case scenario (basement parking garage).
3.  **Friction with Purpose:** KYC and Escrow add steps, but the UX must explain *why* ("This keeps your ฿50,000 camera safe") to convert friction into reassurance.
4.  **Mobile-First, Always:** Every interaction must be designed for one-handed mobile use during physical handovers, not adapted from desktop.

## Desired Emotional Response

### Primary Emotional Goals

**"Safe and Protected"** - The overarching emotional goal is for users to feel that their expensive items and money are secure throughout the rental process. Users should never feel anxious about getting scammed, losing their valuables, or being taken advantage of. This feeling of safety is what differentiates m3-gan from informal P2P rentals on social media.

**Secondary Emotional Goals:**
- **Empowered:** Users should feel in control of the transaction, not at the mercy of the other party
- **Confident:** Clear processes and visual feedback should eliminate confusion and doubt
- **Validated:** Successful transactions should reinforce that the platform works as promised

### Emotional Journey Mapping

1.  **First Discovery:** "This looks legitimate" (Trust, not skepticism) - Professional design, clear value proposition, visible security features
2.  **During KYC:** "This protects me" (Reassured, not annoyed by friction) - Framing verification as a safety feature, not a barrier
3.  **Booking Accepted:** "My money is safe" (Confident, not anxious) - Clear escrow language, visual lock icons, transparent fee breakdown
4.  **Handover Moment:** "I'm in control" (Empowered, not confused) - Step-by-step guidance, offline functionality, clear next actions
5.  **Successful Return:** "It actually worked!" (Delighted, validated) - Instant deposit release, positive reinforcement, sense of accomplishment
6.  **Returning User:** "I trust this system" (Loyal, confident) - Familiarity with the process, proven track record, community belonging

### Micro-Emotions

**Critical Emotional States to Cultivate:**

- **Trust vs. Skepticism:** Every touchpoint must build trust through verified badges, escrow transparency, timestamped evidence photos, and clear communication
- **Confidence vs. Confusion:** The handover flow must be crystal clear with no ambiguity about next steps or current status
- **Accomplishment vs. Frustration:** Successful deposit release should feel like a win, not just a transaction completion
- **Belonging vs. Isolation:** Verified users should feel part of a trusted community, not alone in a risky transaction

**Emotions to Actively Avoid:**

- Anxiety about fund safety or item security
- Confusion about transaction status or next steps
- Frustration with unclear processes or technical failures
- Isolation or feeling unsupported during disputes

### Design Implications

**Emotion → UX Design Connections:**

1.  **Safe → Visual Trust Indicators:**
    - Lock icons for escrow states
    - "Funds Secured" badges with green checkmarks
    - Verified user badges prominently displayed
    - Server-timestamped evidence photos with metadata

2.  **Empowered → Clear Status Tracking:**
    - Real-time progress indicators showing booking states
    - Visual timeline of rental journey
    - Clear CTAs for each stage ("Confirm Condition", "Report Issue")
    - Transparent fee breakdowns before payment

3.  **Confident → Offline-First Handover:**
    - "Confirm Condition" works without internet connection
    - Optimistic UI updates with background sync
    - No anxiety about connectivity failures during critical moments
    - Clear offline mode indicators

4.  **Delighted → Instant Positive Feedback:**
    - Deposit release notification appears immediately after confirmation
    - Celebratory micro-animations for successful transactions
    - Positive reinforcement messages ("You're building trust!")
    - Star rating prompts to share success

### Emotional Design Principles

1.  **Trust Through Transparency:** Every financial state (Authorized, Held, Released) must be visually clear with no hidden fees or ambiguous language. Users should always know where their money is.

2.  **Reassurance Over Friction:** When adding necessary friction (KYC, Escrow), frame it as protection: "This keeps your ฿50,000 camera safe" rather than "Complete verification to continue."

3.  **Confidence Through Clarity:** Eliminate all ambiguity in critical flows. Use clear language, visual indicators, and step-by-step guidance to prevent confusion.

4.  **Delight in Success:** Celebrate successful transactions with positive feedback, not just transactional confirmations. Make users feel accomplished and validated.

<!-- UX design content will be appended sequentially through collaborative workflow steps -->
