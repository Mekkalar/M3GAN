---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments: ['d:/m3-gan/docs/requirment/Requirment.txt']
date: 2026-02-17
author: Admin
---

# Product Brief: m3-gan

## Executive Summary

m3-gan is a Consumer-to-Consumer (C2C) rental platform designed to democratize access to high-quality goods while enabling asset owners to monetize their underutilized possessions. Positioned as the "Shopee for Rentals," it bridges the gap between ownership and access with a focus on ease of use, trust, and security. The platform solves the problem of idle assets for owners and the high cost of purchasing for temporary needs for renters.

---

## Core Vision

### Problem Statement

People possess valuable items that sit idle most of the time (underutilization), while others have temporary needs for these items but are forced to buy them at full price or lack access to affordable rental options. Trust and safety concerns (damage, theft, fraud) currently hinder peer-to-peer rentals.

### Problem Impact

*   **For Owners:** Lost potential income, storage burden, depreciation of assets without return.
*   **For Renters:** High expenses for short-term needs, overconsumption, clutter.

### Why Existing Solutions Fall Short

Existing marketplaces focus on selling, not renting. Dedicated rental shops are fragmented, expensive, and limited in inventory. Informal P2P rental (social media) lacks security, escrow payments, and identity verification, leading to high fraud risk.

### Proposed Solution

A dedicated C2C rental ecosystem that provides:
1.  **Smart Listing:** Availability calendars, tier pricing.
2.  **Trust Infrastructure:** Mandatory KYC, Escrow payments, Deposit management.
3.  **Seamless Transaction:** Integrated chat, booking tracking, and reputation system.

### Key Differentiators

*   **Rental-Centric Features:** Unlike typical e-commerce, we offer calendar-based booking and deposit handling.
*   **Safety First:** Integrated KYC and Escrow ensures items and money are safe before exchange.
*   **Tier Pricing:** Automatic discounts for longer rentals to encourage transactions.

---

## Target Users

### Primary Users

#### 1. The Lender (Asset Owner)
*   **Context:** Improving efficiency of owned assets. Likely has cameras, camping gear, formal wear, or tools.
*   **Pain Point:** "I have a generic GoPro used once a year. I want to make money from it but I'm afraid it will be stolen."
*   **Goal:** Safe, passive income with verified borrowers.

#### 2. The Renter (Temporary User)
*   **Context:** Needs an item for a specific event or project.
*   **Pain Point:** "I need a high-end lens for a 3-day shoot. Buying it costs 50,000 THB. I want to rent it cheaply and safely."
*   **Goal:** Access to quality items at a fraction of the retail price.

### User Journey (Example: Renter)
1.  **Discovery:** Searches for "Camera lens rental" and finds m3-gan nearby items.
2.  **Verification:** Completes KYC (ID Card) to transparently build trust.
3.  **Booking:** Checks availability on calendar > Selects 3 days (Tier Price Applied) > Pays Deposit + Rental Fee (User -> Escrow).
4.  **Usage:** Picks up item/Receives delivery > Confirms receipt > Uses item.
5.  **Return:** Returns item > Lender confirms condition > Escrow releases deposit to Renter and Fee to Lender.
6.  **Review:** Both parties rate each other.

---

## Success Metrics

### User Success
*   **Utilization Rate:** % of listed items that get rented at least once/month.
*   **Fulfillment Rate:** Booking requests accepted and successfully completed.
*   **Safety Score:** 0% fraud or theft incidents; 100% deposit return dispute resolution.

### Business Objectives
*   **GMV (Gross Merchandise Value):** Total rental value processed.
*   **Take Rate:** Revenue from transaction fees.
*   **Trust Building:** Number of verified users (KYC completed).

### Key Performance Indicators (KPIs)
*   **Conversion:** Visitor to Booking Ratio.
*   **Retention:** % of Renters who become Lenders (and vice versa).
*   **Dispute Rate:** % of bookings requiring admin intervention.

---

## MVP Scope

### Core Features (Phase 1)
1.  **User Authentication & KYC:** Register, Upload ID Card, verification status badges.
2.  **Smart Listing System:**
    *   Create listing with photos, description.
    *   **Availability Calendar:** Block dates.
    *   **Rental Tier Pricing:** Set daily, 3-day, weekly rates.
    *   **Deposit Setting:** Set security deposit amount.
3.  **Booking & Payment:**
    *   **Escrow System:** Payment gateway integration (mock/stripe) holding funds.
    *   Booking Request/Accept/Reject flow.
4.  **Communication:**
    *   Direct Chat between Lender/Renter.
    *   Smart Templates (FAQ quick replies).
5.  **Order Management:**
    *   Status Tracking (Pending, To Ship, In Use, Returning, Completed).
    *   Return Reminder logic.
6.  **Review System:** Star rating and text review after completion.

### Out of Scope for MVP (Phase 2+)
*   **Map View (Nearby Renting):** Complex geospatial search deferred.
*   **Subscription Models:** Monthly passes for frequent renters.
*   **AI Price Suggestion:** Requires data accumulation first.
*   **Integrated Logistics Tracking:** Manual status updates for MVP.

### MVP Success Criteria
*   Functional end-to-end rental flow (List -> Rent -> Return -> Pay).
*   Secure handling of deposits (Escrow logic works).
*   Usable on Mobile Web (Responsive Design).

### Future Vision
Become the "Airbnb for Everything" - a community-driven economy where access triumphs over ownership, reducing waste and maximizing resource efficiency.
