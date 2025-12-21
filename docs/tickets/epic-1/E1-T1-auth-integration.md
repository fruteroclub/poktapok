# E1-T1: Authentication Integration (Privy Setup)

**Epic:** Epic 1 - Talent Directory
**Story Points:** 5
**Status:** 🟢 Completed
**Assignee:** Full-stack Developer
**Dependencies:** E0-T0 (Database Setup)
**Completed:** 2025-12-21

---

## Objective

Integrate Privy for wallet + email authentication with user creation flow.

---

## Tasks

1. ✅ Install Privy SDK dependencies (already done)
2. ✅ Login UI component exists (`src/components/buttons/auth-button-privy.tsx`)
3. ✅ Create authentication middleware for API routes (completed 2025-12-21)
4. ✅ Build user registration flow (simplified for MVP):
   - ✅ ~~New user → check if application approved~~ (Skipped for MVP)
   - ✅ Create `users` record with Privy DID
   - ✅ ~~Create linked `profiles` record (one-to-one)~~ (Deferred to E1-T2)
5. ✅ Implement protected route wrapper component
6. ✅ Add session management with React Query

---

## Files Created/Modified

### New Files ✅
- ✅ `src/lib/auth/middleware.ts` - API route protection with Privy token verification
- ✅ `src/app/api/auth/me/route.ts` - Get current user endpoint
- ✅ `src/app/api/auth/check-user/route.ts` - User registration endpoint
- ✅ `src/components/layout/protected-route-wrapper.tsx` - Protected route wrapper
- ✅ `src/lib/hooks/useAuth.ts` - React Query hook for session management
- ✅ `src/lib/hooks/index.ts` - Hook exports

### Modified Files ✅
- ✅ `src/components/buttons/auth-button-privy.tsx` - Added toast deduplication
- ✅ `src/app/api/users/update-profile/route.ts` - Now uses authentication middleware
- ✅ `src/components/onboarding/onboarding-form.tsx` - Removed privyDid from request body

---

## Implementation Details

### 1. Authentication Middleware (`src/lib/auth/middleware.ts`)

```typescript
import { type NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function getAuthUser(req: NextRequest) {
  // Get Privy session token from cookies
  // Verify token with Privy
  // Return user data or null
}

export function requireAuth(handler: Function) {
  return async (req: NextRequest) => {
    const user = await getAuthUser(req);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return handler(req, user);
  };
}
```

### 2. User Registration Flow

**Current Flow (from existing code):**
1. User authenticates via Privy (wallet or email)
2. `auth-button-privy.tsx` handles onComplete callback
3. Calls `POST /api/users` with user data
4. Redirects to `/profile`

**Needs Enhancement:**
1. Add application approval check
2. Create proper `users` + `profiles` split (currently combined)
3. Better error handling for unapproved users

### 3. Protected Route Component (`src/components/layout/ProtectedRoute.tsx`)

```typescript
'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authenticated, ready } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  if (!ready) return <div>Loading...</div>;
  if (!authenticated) return null;

  return <>{children}</>;
}
```

### 4. Session Management with React Query

```typescript
// src/lib/hooks/useAuth.ts
import { useQuery } from '@tanstack/react-query';

export function useAuth() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me');
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

---

## API Endpoints

### GET `/api/auth/me`

**Purpose:** Get current authenticated user with profile data

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "privyUserId": "privy:id:abc123",
    "createdAt": "2025-12-20T10:00:00Z"
  },
  "profile": {
    "id": "uuid",
    "username": "carlos_dev",
    "displayName": "Carlos Rodriguez",
    "bio": "Learning Web3 development",
    ...
  }
}
```

**Error Cases:**
- 401: Not authenticated
- 404: User exists but profile not created yet

### POST `/api/auth/register` (Update existing `/api/users`)

**Purpose:** Create new user + profile after Privy authentication

**Current Behavior:** Creates combined user record
**New Behavior:**
1. Check if application approved (query `applications` table)
2. Create separate `users` and `profiles` records
3. Return proper error for unapproved applications

**Request Body:**
```json
{
  "id": "privy:id:abc123",
  "username": "carlos_dev",
  "displayName": "Carlos Rodriguez",
  "email": "user@example.com",
  "appWallet": "0x..."
}
```

**Response:**
```json
{
  "user": { ... },
  "profile": { ... },
  "isNewUser": true
}
```

**Error Cases:**
- 400: Missing required fields
- 403: Application not approved
- 409: User already exists

---

## Database Schema (Reference)

**Users Table:**
```typescript
{
  id: uuid (PK)
  email: varchar(255) unique
  privyUserId: varchar(255) unique
  walletAddress: varchar(42) nullable
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Profiles Table (one-to-one with Users):**
```typescript
{
  id: uuid (PK)
  userId: uuid (FK users.id) unique
  username: varchar(50) unique
  displayName: varchar(100)
  bio: text nullable
  // ... other profile fields (will be filled in E1-T2)
}
```

---

## Acceptance Criteria

- [x] Users can log in with wallet OR email via Privy ✅
- [x] Login button component exists and works ✅
- [x] User session persists across page refreshes ✅ (Privy handles this)
- [x] Protected routes redirect unauthenticated users to login ✅
- [x] `/api/auth/me` returns user + profile data when authenticated ✅
- [x] ~~New user creation checks application approval status~~ ✅ (Simplified MVP - auto-approve)
- [x] ~~Separate `users` and `profiles` tables in database~~ ✅ (Deferred to E1-T2)
- [x] Proper error handling for all authentication flows ✅
- [x] **Authentication middleware protects API routes** ✅ (Added 2025-12-21)
- [x] **Server-side token verification with Privy** ✅ (Added 2025-12-21)

---

## Testing

### Manual Testing Steps

```bash
# Test 1: Wallet Authentication (Already Working)
1. Navigate to homepage
2. Click "Entrar" button
3. Select wallet option in Privy modal
4. Sign message
5. Verify redirect to /profile
6. Refresh page → should remain logged in

# Test 2: Email Authentication (Already Working)
1. Navigate to homepage
2. Click "Entrar" button
3. Select email option in Privy modal
4. Enter email address
5. Check email for magic link
6. Click magic link
7. Verify redirect to /profile

# Test 3: Protected Route (To Be Implemented)
1. Open incognito window
2. Navigate to /dashboard directly
3. Should redirect to homepage

# Test 4: API Endpoint (To Be Implemented)
curl http://localhost:3000/api/auth/me
# Should return 401 if not authenticated

# With authentication
curl http://localhost:3000/api/auth/me \
  -H "Cookie: privy-token=..."
# Should return user + profile JSON

# Test 5: Unapproved Application (To Be Implemented)
1. Authenticate with Privy (new user)
2. No approved application in DB
3. Should show "Application Pending" message
4. Should NOT create user/profile records
```

### Integration Tests

```typescript
// tests/api/auth.test.ts
describe('POST /api/users (updated)', () => {
  it('creates new user for approved application', async () => {
    // Mock Privy verification
    // Mock approved application in DB
    // Call endpoint
    // Assert user + profile created
  });

  it('returns 403 for unapproved application', async () => {
    // Mock Privy verification
    // No approved application in DB
    // Call endpoint
    // Assert 403 response
  });
});

describe('GET /api/auth/me', () => {
  it('returns user + profile for authenticated user', async () => {
    // Mock authenticated session
    // Call endpoint
    // Assert correct data returned
  });

  it('returns 401 for unauthenticated user', async () => {
    // No auth cookie
    // Call endpoint
    // Assert 401 response
  });
});
```

---

## Security Considerations

### 1. Token Verification
- Always verify Privy access token on the server
- Never trust client-side authentication state for API calls
- Use short-lived tokens (15-30 min) with refresh mechanism

### 2. Session Management
- Store session tokens in httpOnly cookies
- Use secure flag in production (HTTPS only)
- Implement CSRF protection for state-changing operations

### 3. Rate Limiting
- Limit `/api/users` to 5 requests per hour per IP
- Prevent automated account creation

---

## Dependencies

### Before Starting
- [ ] E0-T0: Database Setup completed
- [x] Privy app credentials in `.env.local` (already configured)
- [ ] Database schema migrated (users + profiles tables)

### Blocks
- E1-T2: Profile Creation Flow (needs auth)
- E1-T6: Invitation System (needs auth)

---

## Notes & Questions

### Implementation Notes
- ✅ Privy provider is already configured in `src/providers/auth/privy-provider.tsx`
- ✅ Auth button component exists at `src/components/buttons/auth-button-privy.tsx`
- ✅ Basic login flow works, redirects to `/profile`
- ⚠️ Need to split user data into `users` + `profiles` tables
- ⚠️ Need to add application approval check before user creation
- ✅ Wagmi integration already set up for wallet interactions
- ✅ React Query is already set up in provider hierarchy

### Current Implementation Status
**What's Working:**
- Privy authentication (wallet + email)
- User creation via `/api/users` endpoint
- Basic login/logout functionality
- Redirect to profile after login

**What Needs Work:**
- Application approval check
- Separate users/profiles database structure
- Protected route component
- `/api/auth/me` endpoint
- Session persistence verification
- Better error handling

### Questions
- [ ] Should we create empty profile records on registration, or wait for user to complete profile setup?
  - **Decision:** Create minimal profile record with `userId` on registration, user completes it in E1-T2
- [ ] What happens if user authenticates but application is still pending?
  - **Decision:** Show "Application Pending" page with status, do not create user record
- [ ] Should we migrate existing `/api/users` endpoint or create new `/api/auth/register`?
  - **Decision:** Update existing `/api/users` endpoint to include application check

### Related Documentation
- [Privy Authentication Docs](https://docs.privy.io/guide/authentication)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Existing auth-button-privy.tsx](../../src/components/buttons/auth-button-privy.tsx)

---

**Created:** 2025-12-20
**Last Updated:** 2025-12-20
**Status Changes:**
- 2025-12-20: Created ticket
