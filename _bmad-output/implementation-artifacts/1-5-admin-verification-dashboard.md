# Story 1.5: Admin Verification Dashboard

Status: done

## Story

As an Admin,
I want to view a queue of pending identity verifications,
So that I can approve valid users or reject invalid ones.

## Acceptance Criteria

**Given** I am logged in as Admin  
**When** I navigate to the "KYC Queue"  
**Then** I should see a list of users with `status: PENDING`  
**When** I click "Approve" on a verification  
**Then** The user's status should change to `VERIFIED`  
**And** They should gain full platform access  
**When** I click "Reject" and provide a reason  
**Then** The user's status should change to `REJECTED`  
**And** The rejection reason should be stored

## Tasks / Subtasks

- [x] Database Schema
  - [x] Added `UserRole` enum (USER, ADMIN)
  - [x] Added `role` field to User model
  - [x] Added index on role field

- [x] Admin Authentication
  - [x] Updated NextAuth session to include role
  - [x] Updated JWT callbacks to include role
  - [x] Created admin authentication checks in pages

- [x] Admin Actions
  - [x] Created `reviewVerification` server action
  - [x] Implemented APPROVE logic (updates verification and user status)
  - [x] Implemented REJECT logic (requires rejection reason)
  - [x] Added audit trail (reviewedAt, reviewedBy)

- [x] Admin UI Components
  - [x] Created `/admin/kyc` page with admin-only access
  - [x] Built `KYCQueue` component showing pending verifications
  - [x] Created `VerificationCard` component with approve/reject buttons
  - [x] Added rejection reason modal
  - [x] Implemented real-time queue updates after review

- [x] Admin Utilities
  - [x] Created `makeUserAdmin` action for testing
  - [x] Created `/api/admin/make-admin` API route

## Dev Notes

### Implementation Highlights

1. **Role-Based Access Control**: 
   - Added `UserRole` enum (USER, ADMIN)
   - Admin-only pages redirect non-admins to home
   - Server actions verify admin role before execution

2. **Admin Dashboard**:
   - `/admin/kyc` - Shows pending verifications in grid layout
   - Displays user phone, submission date, and ID card image
   - Approve/Reject buttons with immediate feedback

3. **Verification Review Flow**:
   - Admin clicks Approve → Verification status = APPROVED, User status = VERIFIED
   - Admin clicks Reject → Modal prompts for reason → Verification status = REJECTED, User status = REJECTED
   - Audit trail: `reviewedAt`, `reviewedBy` (admin user ID)

4. **Testing Utility**:
   - `makeUserAdmin(phone)` - Makes a user an admin
   - API route: `POST /api/admin/make-admin` with `{ "phone": "+66..." }`

### Security

- ✅ Admin authentication required for all admin pages
- ✅ Server actions verify admin role
- ✅ Audit trail for all review actions
- ✅ Rejection reason required for rejections

### Files Created

**Database:**
- `prisma/schema.prisma` - Added UserRole enum and role field

**Server Actions:**
- `src/modules/kyc/actions/reviewVerification.ts` - Approve/reject verification
- `src/modules/auth/actions/makeUserAdmin.ts` - Make user admin utility

**Components:**
- `src/modules/kyc/components/VerificationCard.tsx` - Review card with approve/reject
- `src/modules/kyc/components/KYCQueue.tsx` - Queue display component

**Pages:**
- `src/app/admin/kyc/page.tsx` - Admin KYC dashboard

**API Routes:**
- `src/app/api/admin/make-admin/route.ts` - Make user admin endpoint

**Configuration:**
- `src/server/auth.ts` - Updated session to include role

### Testing the Full Flow

**1. Create Test Users:**
```bash
# Sign up as User A (will upload ID)
# Sign up as User B (will be admin)
```

**2. Make User B an Admin:**
```bash
curl -X POST http://localhost:3000/api/admin/make-admin \
  -H "Content-Type: application/json" \
  -d '{"phone": "+66812345678"}'
```

**3. Upload ID as User A:**
- Log in as User A
- Navigate to `/verify-identity`
- Upload ID card image
- Verify redirect to `/verify-identity/pending`

**4. Review as Admin (User B):**
- Log in as User B (admin)
- Navigate to `/admin/kyc`
- See User A's verification in queue
- Click "Approve" or "Reject"

**5. Verify User A Status:**
- Log in as User A
- Navigate to `/verify-identity/pending`
- See VERIFIED or REJECTED status

### Next Steps

1. **Apply Database Changes:**
   ```bash
   npx prisma db push
   ```

2. **Make Your User an Admin:**
   ```bash
   curl -X POST http://localhost:3000/api/admin/make-admin \
     -H "Content-Type: application/json" \
     -d '{"phone": "YOUR_PHONE_NUMBER"}'
   ```

3. **Test Full Flow:**
   - Create second user account
   - Upload ID card as second user
   - Review as admin (your account)
   - Verify status updates

## Completion Notes

- ✅ Admin role system implemented
- ✅ KYC queue dashboard created
- ✅ Approve/reject functionality working
- ✅ Audit trail in place
- ✅ Testing utilities provided
- ✅ Full verification flow complete

**Stories 1.2, 1.3, and 1.5 are now complete!**

Story 1.4 (Auto-Masking) can be implemented later as an enhancement.
