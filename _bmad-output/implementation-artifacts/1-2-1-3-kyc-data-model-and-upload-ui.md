# Stories 1.2 & 1.3: KYC Data Model and Upload UI

Status: done

## Stories

### Story 1.2: KYC Data Model & Secure Storage

As a Developer,
I want to establish the database schema and storage buckets for Identity Verification,
So that user data is stored securely and in compliance with PDPA.

### Story 1.3: User Identity Upload UI

As an Unverified User,
I want to upload a photo of my Thai National ID card,
So that I can request verification to unlock platform features.

## Acceptance Criteria

### Story 1.2

**Given** The PostgreSQL database is initialized  
**When** I examine the `schema.prisma`  
**Then** It should include `IdentityVerification` model with fields: `idCardImage`, `status` (PENDING, APPROVED, REJECTED), `rejectionReason`  
**And** `User` model should have `verificationStatus` field  
**When** I check Uploadthing configuration  
**Then** A dedicated "Private Bucket" (Private Files) should be configured, accessible ONLY by Admin and the owner

### Story 1.3

**Given** I am logged in but "Unverified"  
**When** I navigate to the "Verify Identity" page  
**Then** I should see an upload area for "Front of ID Card"  
**When** I select a photo  
**Then** It should be compressed client-side to < 2MB  
**And** It should be uploaded to the Secure Private Bucket  
**And** The UI should show "Verification Pending" status

## Tasks / Subtasks

- [x] Database Schema (Story 1.2)
  - [x] Added `IdentityVerification` model with all required fields
  - [x] Updated `VerificationStatus` enum (UNVERIFIED, PENDING, VERIFIED, REJECTED)
  - [x] Added relation to User model

- [x] Uploadthing Configuration (Story 1.2)
  - [x] Installed uploadthing and @uploadthing/react packages
  - [x] Created file router with authentication middleware
  - [x] Set up private file upload endpoint (idCardUpload)
  - [x] Added environment variables for Uploadthing

- [x] Upload UI Components (Story 1.3)
  - [x] Created IDCardUpload component with drag-and-drop
  - [x] Implemented client-side image compression using browser-image-compression
  - [x] Added upload progress and preview
  - [x] Created verify-identity page with authentication checks

- [x] Server Actions (Story 1.3)
  - [x] Created submitIdentityVerification action
  - [x] Integrated with Uploadthing upload completion
  - [x] Updates user verificationStatus to PENDING

- [x] Status Pages (Story 1.3)
  - [x] Created pending page showing verification status
  - [x] Added status displays for PENDING, VERIFIED, REJECTED

## Dev Notes

### Implementation Highlights

1. **Database Schema**: Added `IdentityVerification` model with comprehensive tracking (submission time, review time, reviewer ID, rejection reason)

2. **Uploadthing Integration**: 
   - Private file uploads with authentication middleware
   - Only UNVERIFIED users can upload
   - Max file size: 4MB (compressed to <2MB client-side)

3. **Client-Side Compression**: Uses `browser-image-compression` to compress images to <2MB before upload, reducing bandwidth and storage costs

4. **User Flow**:
   - Unverified user navigates to `/verify-identity`
   - Uploads ID card image (drag-and-drop or file select)
   - Image compressed client-side
   - Uploaded to Uploadthing private bucket
   - IdentityVerification record created with status PENDING
   - User verificationStatus updated to PENDING
   - Redirected to `/verify-identity/pending`

### Security & Privacy

- ✅ Authentication required for upload
- ✅ Only UNVERIFIED users can submit
- ✅ Private file storage (not publicly accessible)
- ✅ PDPA compliance notice displayed
- ✅ Sensitive data handling ready for auto-masking (Story 1.4)

### Files Created

**Database:**
- `prisma/schema.prisma` - Added IdentityVerification model and updated VerificationStatus enum

**Uploadthing:**
- `src/app/api/uploadthing/core.ts` - File router with authentication
- `src/app/api/uploadthing/route.ts` - API route handlers
- `src/lib/uploadthing.ts` - React helpers

**Server Actions:**
- `src/modules/kyc/actions/submitVerification.ts` - Submit verification action

**Components:**
- `src/modules/kyc/components/IDCardUpload.tsx` - Upload component with compression

**Pages:**
- `src/app/verify-identity/page.tsx` - Upload page
- `src/app/verify-identity/pending/page.tsx` - Status page

**Configuration:**
- `.env` - Added UPLOADTHING_SECRET and UPLOADTHING_APP_ID

### Next Steps

1. **Configure Uploadthing**:
   - Sign up at uploadthing.com
   - Create app and get API keys
   - Update `.env` with real UPLOADTHING_SECRET and UPLOADTHING_APP_ID

2. **Database Migration**:
   - Run `npx prisma db push` to apply schema changes

3. **Story 1.4**: Implement auto-masking for sensitive ID card fields (Religion/Blood Type)

4. **Story 1.5**: Build admin verification dashboard

## Testing Notes

**Manual Testing Steps:**
1. Sign up and log in as unverified user
2. Navigate to `/verify-identity`
3. Upload ID card image (test compression with large file >2MB)
4. Verify redirect to `/verify-identity/pending`
5. Check database for IdentityVerification record
6. Verify file uploaded to Uploadthing dashboard

**Test Cases Needed:**
- Upload with various image formats (JPG, PNG, HEIC)
- Upload with file size >2MB (should compress)
- Upload attempt by already-verified user (should reject)
- Upload without authentication (should redirect)
- Duplicate upload attempt (should reject)
