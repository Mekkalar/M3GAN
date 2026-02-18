# m3-gan Development Setup

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
```bash
npx prisma db push
```

### 3. Run Development Server
```bash
npm run dev
```

The app will run at `http://localhost:3000`

## Development Mode (Mock SMS)

The app automatically detects placeholder Twilio credentials and runs in **mock mode**.

When you request an OTP during signup, the code will be **logged to the terminal** instead of sending a real SMS:

```
============================================================
📱 MOCK SMS (Development Mode)
============================================================
To: +66812345678
Message: Your m3-gan verification code is: 123456. Valid for 5 minutes.
============================================================
```

Just copy the OTP from the terminal and paste it into the signup form!

## Testing the Full Flow

### 1. Sign Up as Regular User
1. Navigate to `http://localhost:3000/signup`
2. Enter a Thai phone number (e.g., `+66812345678`)
3. Click "Send OTP"
4. **Check the terminal** for the OTP code
5. Enter the OTP and complete signup

### 2. Upload ID Card
1. After signup, navigate to `/verify-identity`
2. Upload an ID card image (any image will work for testing)
3. Image will be compressed to <2MB automatically
4. You'll be redirected to `/verify-identity/pending`

### 3. Make Your Account an Admin
```bash
curl -X POST http://localhost:3000/api/admin/make-admin \
  -H "Content-Type: application/json" \
  -d '{"phone": "+66812345678"}'
```

Or use PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/admin/make-admin" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"phone": "+66812345678"}'
```

### 4. Review KYC as Admin
1. Log out and log back in (to refresh session with admin role)
2. Navigate to `/admin/kyc`
3. You'll see the pending verification
4. Click "Approve" or "Reject"

### 5. Verify Status Update
1. Log in as the original user
2. Navigate to `/verify-identity/pending`
3. You should see "Verification Approved!" or rejection message

## Environment Variables

The `.env` file is already configured with placeholder values for development:

```env
# Database (already configured with Supabase)
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="placeholder-secret-replace-with-real-value"
NEXTAUTH_URL="http://localhost:3000"

# Twilio (MOCK MODE - OTP logged to console)
TWILIO_ACCOUNT_SID="PLACEHOLDER_ACCOUNT_SID"
TWILIO_AUTH_TOKEN="PLACEHOLDER_AUTH_TOKEN"
TWILIO_PHONE_NUMBER="+1234567890"

# Uploadthing (needs real credentials)
UPLOADTHING_SECRET="placeholder-uploadthing-secret"
UPLOADTHING_APP_ID="placeholder-uploadthing-app-id"
```

## Setting Up Real Services (Optional)

### Uploadthing (for ID card uploads)
1. Sign up at https://uploadthing.com
2. Create a new app
3. Copy your API keys
4. Update `.env`:
   ```env
   UPLOADTHING_SECRET="your-secret-here"
   UPLOADTHING_APP_ID="your-app-id-here"
   ```

### Twilio (for real SMS)
1. Sign up at https://www.twilio.com
2. Get a phone number
3. Copy your Account SID and Auth Token
4. Update `.env`:
   ```env
   TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   TWILIO_AUTH_TOKEN="your-auth-token"
   TWILIO_PHONE_NUMBER="+1234567890"
   ```

## Implemented Features

### ✅ Story 1.1: Phone Authentication
- Phone number signup with OTP
- SMS via Twilio (or mock in dev)
- Rate limiting (3 requests per 10 min)
- Attempt limiting (5 attempts per OTP)
- NextAuth.js integration

### ✅ Stories 1.2 & 1.3: KYC Upload
- IdentityVerification database model
- Uploadthing file storage
- Client-side image compression (<2MB)
- Drag-and-drop upload UI
- PDPA privacy notice

### ✅ Story 1.5: Admin Dashboard
- Admin role system
- KYC verification queue
- Approve/reject functionality
- Rejection reason tracking
- Audit trail

## Database Schema

Key models:
- `User` - Phone, role (USER/ADMIN), verificationStatus
- `OtpCode` - Hashed OTP codes with expiry and attempt tracking
- `IdentityVerification` - ID card uploads with review status
- `RateLimitTracker` - Rate limiting for OTP requests

## Testing

```bash
# Run unit tests
npm test

# Run E2E tests (requires dev server running)
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

## Troubleshooting

**Issue: "accountSid must start with AC"**
- This is expected with placeholder credentials
- The app now runs in mock mode automatically
- OTP codes are logged to the terminal

**Issue: Upload fails**
- You need real Uploadthing credentials
- Sign up at uploadthing.com and update `.env`

**Issue: Can't access admin dashboard**
- Make sure you've made your account an admin using the API endpoint
- Log out and log back in to refresh your session
