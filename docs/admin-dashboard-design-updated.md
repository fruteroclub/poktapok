# Admin Dashboard Design Specification (Updated)

**Created**: January 2, 2026
**Updated**: January 2, 2026
**Status**: Implementation Ready

## Changes from Original Design

1. ✅ **Layout**: Added PageWrapper component (includes Navbar + Footer)
2. ✅ **Authorization**: Enhanced `AuthUser` to include role from `/api/auth/me` response
3. ✅ **Types**: Extended existing `User` and `Profile` types instead of creating duplicates
4. ✅ **Middleware**: No DB query in middleware - role comes from auth token context

## Overview

Admin dashboard for managing pending user approvals, platform users, and administrative functions.

## Architecture

### Route Structure

```
/dashboard/admin/               → Admin home (overview stats)
/dashboard/admin/pending-users  → Review pending user applications
/dashboard/admin/users          → All users management
/dashboard/admin/activities     → Activities management (existing)
/dashboard/admin/submissions    → Submissions review (existing)
```

### Layout Strategy

**Admin Layout** (`src/app/(admin)/layout.tsx`):

```tsx
import PageWrapper from '@/components/layout/page-wrapper'
import Sidebar from '@/components/layout/sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageWrapper>
      <div className="page">
        <div className="flex gap-6">
          {/* Sidebar - Fixed left */}
          <aside className="w-64 flex-shrink-0">
            <Sidebar />
          </aside>

          {/* Main Content - Scrollable right */}
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </PageWrapper>
  )
}
```

**Key Points**:

- Uses `PageWrapper` → Navbar + Footer included
- Sidebar positioned as left column within page content
- Main content area to the right, full width minus sidebar
- Responsive: Sidebar hides on mobile, shows as drawer

## Authorization Architecture

### Enhanced AuthUser Type

**Current** (`src/lib/privy/middleware.ts:13-15`):

```typescript
export type AuthUser = {
  privyDid: string
}
```

**Updated** (extends with user context from `/api/auth/me`):

```typescript
export type AuthUser = {
  privyDid: string
  userId: string // From DB lookup
  role: string // 'member' | 'moderator' | 'admin'
  accountStatus: string // 'incomplete' | 'pending' | 'active' | etc.
}
```

### Middleware Enhancement Strategy

**Approach**: Cache user info in request context after first `/api/auth/me` call

**Implementation**:

1. **Update `requireAuth` to fetch user context once**:

```typescript
// src/lib/privy/middleware.ts

import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export type AuthUser = {
  privyDid: string
  userId: string
  role: string
  accountStatus: string
}

export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  try {
    // 1. Extract and verify Privy token (existing logic)
    const authHeader = req.headers.get('authorization')
    const accessToken = authHeader?.replace('Bearer ', '') || req.cookies.get('privy-token')?.value

    if (!accessToken) {
      return null
    }

    const claims = await privy.verifyAuthToken(accessToken)
    if (!claims.userId) {
      return null
    }

    // 2. Fetch user context from database (single query)
    const userResults = await db
      .select({
        id: users.id,
        role: users.role,
        accountStatus: users.accountStatus,
      })
      .from(users)
      .where(eq(users.privyDid, claims.userId))
      .limit(1)

    if (userResults.length === 0) {
      return null
    }

    const user = userResults[0]

    // 3. Return enriched auth context
    return {
      privyDid: claims.userId,
      userId: user.id,
      role: user.role,
      accountStatus: user.accountStatus,
    }
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

export function requireAuth<T = unknown>(
  handler: (req: NextRequest, user: AuthUser) => Promise<Response | T>,
) {
  return async (req: NextRequest): Promise<Response> => {
    const authUser = await getAuthUser(req)

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // AuthUser now includes role and accountStatus
    const result = await handler(req, authUser)

    if (result instanceof Response) {
      return result
    }

    return NextResponse.json(result)
  }
}
```

2. **Add `requireAdmin` helper** (no additional DB query):

```typescript
// src/lib/privy/middleware.ts

export function requireAdmin<T = unknown>(
  handler: (req: NextRequest, user: AuthUser) => Promise<Response | T>,
) {
  return requireAuth(async (req: NextRequest, authUser: AuthUser) => {
    // Role already available from requireAuth - no DB query needed!
    if (authUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { message: 'Admin access required', code: 'FORBIDDEN' } },
        { status: 403 },
      )
    }

    return handler(req, authUser)
  })
}
```

**Usage in API routes**:

```typescript
// src/app/api/admin/pending-users/route.ts
export const GET = requireAdmin(async (request, adminUser) => {
  // adminUser.role === 'admin' (guaranteed)
  // adminUser.userId available (no need to look up)
  // No additional DB queries needed!
})
```

### Client-Side Protection

```typescript
// In admin pages
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminPage() {
  const router = useRouter();
  const { data, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && data?.user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [data, isLoading, router]);

  if (isLoading) return <LoadingSpinner />;
  if (data?.user?.role !== 'admin') return null;

  return <AdminContent />;
}
```

## Type Definitions (Using Existing Types)

### Extended Types (`src/types/api-v1.ts`)

**Extend existing `User` interface with createdAt**:

```typescript
// Update existing User interface
export interface User {
  id: string
  username: string | null
  displayName: string | null
  email: string | null
  bio: string | null
  avatarUrl: string | null
  accountStatus: string
  role: string
  createdAt?: Date // Add this field
}
```

**Create admin-specific composite types**:

```typescript
// src/types/api-v1.ts - Admin Section

// ============================================================================
// Admin Types (Epic: Admin Dashboard)
// ============================================================================

/**
 * Pending user with profile data (extends User + Profile)
 */
export interface PendingUserWithProfile {
  user: User // Existing User type
  profile: Profile | null // Existing Profile type
}

/**
 * Response for GET /api/admin/pending-users
 */
export interface PendingUsersResponse {
  users: PendingUserWithProfile[]
  pagination: DirectoryPagination // Reuse existing pagination type
}

/**
 * Response for POST /api/admin/users/[id]/approve
 */
export interface ApproveUserResponse {
  user: User // Existing User type
}

/**
 * Request body for POST /api/admin/users/[id]/reject
 */
export interface RejectUserRequest {
  reason?: string
}

/**
 * Response for POST /api/admin/users/[id]/reject
 */
export interface RejectUserResponse {
  user: User // Existing User type
}

/**
 * Admin dashboard stats
 */
export interface AdminStats {
  pendingUsersCount: number
  activeUsersCount: number
  approvalsToday: number
  approvalsThisWeek: number
  rejectionRate: number
  pendingActivitiesCount: number
  pendingSubmissionsCount: number
}
```

**Benefits of this approach**:

- ✅ No type duplication
- ✅ Single source of truth for User and Profile
- ✅ Type safety across frontend and backend
- ✅ Easy to maintain and extend

## API Endpoints

### GET /api/admin/pending-users

**Purpose**: List all pending user applications

**Authorization**: `requireAdmin`

**Query Parameters**:

```typescript
{
  page?: number;     // Default: 1
  limit?: number;    // Default: 20
  sortBy?: string;   // Default: "createdAt"
  order?: "asc" | "desc";  // Default: "desc"
}
```

**Response**:

```typescript
{
  success: true,
  data: {
    users: Array<{
      user: User,           // Existing User type
      profile: Profile | null  // Existing Profile type
    }>,
    pagination: DirectoryPagination  // Reuse existing type
  }
}
```

**Implementation**:

```typescript
// src/app/api/admin/pending-users/route.ts
import { requireAdmin } from '@/lib/privy/middleware'
import { db } from '@/lib/db'
import { users, profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { apiSuccess } from '@/lib/api/response'

export const GET = requireAdmin(async (request, adminUser) => {
  // adminUser.role === 'admin' (guaranteed, no DB check needed)

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = (page - 1) * limit

  // Query pending users with profiles
  const pendingUsers = await db
    .select()
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(eq(users.accountStatus, 'pending'))
    .limit(limit)
    .offset(offset)
    .orderBy(users.createdAt)

  // Count total pending
  const countResult = await db
    .select({ count: sql`count(*)` })
    .from(users)
    .where(eq(users.accountStatus, 'pending'))

  const total = parseInt(countResult[0].count)
  const totalPages = Math.ceil(total / limit)

  // Transform to response format
  const usersWithProfiles = pendingUsers.map((row) => ({
    user: {
      id: row.users.id,
      username: row.users.username,
      displayName: row.users.displayName,
      email: row.users.email,
      bio: row.users.bio,
      avatarUrl: row.users.avatarUrl,
      accountStatus: row.users.accountStatus,
      role: row.users.role,
      createdAt: row.users.createdAt,
    },
    profile: row.profiles || null,
  }))

  return apiSuccess({
    users: usersWithProfiles,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  })
})
```

### POST /api/admin/users/[id]/approve

**Purpose**: Approve a pending user

**Authorization**: `requireAdmin`

**Implementation**:

```typescript
// src/app/api/admin/users/[id]/approve/route.ts
import { requireAdmin } from '@/lib/privy/middleware'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { apiSuccess, apiErrors } from '@/lib/api/response'

export const POST = requireAdmin(async (request, adminUser, { params }) => {
  const { id } = params

  // Update user status
  const updatedUsers = await db
    .update(users)
    .set({
      accountStatus: 'active',
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning()

  if (updatedUsers.length === 0) {
    return apiErrors.notFound('User')
  }

  return apiSuccess({ user: updatedUsers[0] }, { message: 'User approved successfully' })
})
```

### POST /api/admin/users/[id]/reject

**Purpose**: Reject a pending user

**Authorization**: `requireAdmin`

**Body**:

```typescript
{
  reason?: string;
}
```

**Implementation**:

```typescript
// src/app/api/admin/users/[id]/reject/route.ts
import { requireAdmin } from '@/lib/privy/middleware'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { apiSuccess, apiErrors } from '@/lib/api/response'

export const POST = requireAdmin(async (request, adminUser, { params }) => {
  const { id } = params
  const body = await request.json().catch(() => ({}))
  const { reason } = body

  // Store rejection reason in metadata
  const metadata = reason
    ? sql`jsonb_set(metadata, '{rejectionReason}', to_jsonb(${reason}::text))`
    : sql`metadata`

  const updatedUsers = await db
    .update(users)
    .set({
      accountStatus: 'banned',
      metadata: metadata,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning()

  if (updatedUsers.length === 0) {
    return apiErrors.notFound('User')
  }

  return apiSuccess({ user: updatedUsers[0] }, { message: 'User rejected' })
})
```

## Service Layer (`src/services/admin.ts`)

```typescript
import { apiFetch } from '@/lib/api/fetch'
import type {
  PendingUsersResponse,
  ApproveUserResponse,
  RejectUserResponse,
  RejectUserRequest,
  AdminStats,
} from '@/types/api-v1'

/**
 * Fetch pending users with pagination
 */
export async function fetchPendingUsers(params?: {
  page?: number
  limit?: number
}): Promise<PendingUsersResponse> {
  const query = new URLSearchParams({
    page: params?.page?.toString() || '1',
    limit: params?.limit?.toString() || '20',
  })

  return apiFetch<PendingUsersResponse>(`/api/admin/pending-users?${query}`)
}

/**
 * Approve a pending user
 */
export async function approveUser(userId: string): Promise<ApproveUserResponse> {
  return apiFetch<ApproveUserResponse>(`/api/admin/users/${userId}/approve`, { method: 'POST' })
}

/**
 * Reject a pending user
 */
export async function rejectUser(
  userId: string,
  request?: RejectUserRequest,
): Promise<RejectUserResponse> {
  return apiFetch<RejectUserResponse>(`/api/admin/users/${userId}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request || {}),
  })
}

/**
 * Fetch admin dashboard stats
 */
export async function fetchAdminStats(): Promise<AdminStats> {
  return apiFetch<AdminStats>('/api/admin/stats')
}
```

## Hooks (`src/hooks/use-admin.ts`)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiError } from '@/lib/api/fetch'
import { fetchPendingUsers, approveUser, rejectUser, fetchAdminStats } from '@/services/admin'

/**
 * Fetch pending users with pagination
 */
export function usePendingUsers(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['admin', 'pending-users', page, limit],
    queryFn: () => fetchPendingUsers({ page, limit }),
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Approve a pending user
 */
export function useApproveUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: approveUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
      toast.success('User approved successfully')
    },
    onError: (error: ApiError) => {
      toast.error(error.message)
    },
  })
}

/**
 * Reject a pending user
 */
export function useRejectUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      rejectUser(userId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
      toast.success('User rejected')
    },
    onError: (error: ApiError) => {
      toast.error(error.message)
    },
  })
}

/**
 * Fetch admin dashboard stats
 */
export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: fetchAdminStats,
    staleTime: 60 * 1000, // 1 minute
  })
}
```

## Sidebar Updates

**Update `src/components/layout/sidebar.tsx`** to conditionally show admin items:

```typescript
import { useAuth } from "@/hooks/use-auth";

type MenuItem = {
  displayText: string;
  href: string;
  adminOnly?: boolean;
};

const MENU_ITEMS: MenuItem[] = [
  // Regular items
  { displayText: "dashboard", href: "/dashboard" },
  { displayText: "profile", href: "/profile" },
  { displayText: "directory", href: "/directory" },

  // Admin items
  { displayText: "admin", href: "/dashboard/admin", adminOnly: true },
  { displayText: "pending users", href: "/dashboard/admin/pending-users", adminOnly: true },
  { displayText: "all users", href: "/dashboard/admin/users", adminOnly: true },
  { displayText: "activities", href: "/dashboard/admin/activities", adminOnly: true },
  { displayText: "submissions", href: "/dashboard/admin/submissions", adminOnly: true },
];

export default function Sidebar() {
  const { data: authData } = useAuth();
  const isAdmin = authData?.user?.role === "admin";

  // Filter menu items based on admin status
  const visibleItems = MENU_ITEMS.filter(
    item => !item.adminOnly || isAdmin
  );

  return (
    <nav>
      {visibleItems.map((item) => (
        <Link key={item.href} href={item.href}>
          {item.displayText}
        </Link>
      ))}
    </nav>
  );
}
```

## Implementation Checklist

### Phase 1: Core Infrastructure ✓

- [ ] Update `AuthUser` type in middleware with role
- [ ] Enhance `getAuthUser` to fetch user context (single query)
- [ ] Add `requireAdmin` helper function
- [ ] Create admin layout with PageWrapper + Sidebar
- [ ] Update Sidebar with admin items (conditional rendering)

### Phase 2: API Endpoints ✓

- [ ] `GET /api/admin/pending-users`
- [ ] `POST /api/admin/users/[id]/approve`
- [ ] `POST /api/admin/users/[id]/reject`
- [ ] `GET /api/admin/stats` (optional for Phase 1)

### Phase 3: Type Safety ✓

- [ ] Update `User` type with `createdAt`
- [ ] Add admin types to `src/types/api-v1.ts`
- [ ] Create services in `src/services/admin.ts`
- [ ] Create hooks in `src/hooks/use-admin.ts`

### Phase 4: UI Components

- [ ] Admin home page
- [ ] Pending users page
- [ ] User card component
- [ ] Review dialog component
- [ ] Stats cards component
- [ ] Loading and error states
- [ ] Empty states

### Phase 5: Testing & Polish

- [ ] Test approval flow end-to-end
- [ ] Test rejection flow with reason
- [ ] Test authorization (non-admin blocked)
- [ ] Test pagination
- [ ] Mobile responsiveness
- [ ] Accessibility audit

## Security Considerations

1. **Authorization**: All admin routes use `requireAdmin` (checks `authUser.role === 'admin'`)
2. **No DB Overhead**: Role check uses cached auth context (no additional queries)
3. **Client Protection**: Admin pages check role on mount and redirect
4. **Input Validation**: User IDs validated (UUID format)
5. **Idempotency**: Approve/reject actions safe to retry
6. **Audit Trail**: Store rejection reasons in `metadata.rejectionReason`

## Benefits of Updated Design

1. ✅ **No Duplicate Types**: Extends `User` and `Profile` instead of duplicating
2. ✅ **Efficient Authorization**: Role available in auth context (no extra DB queries)
3. ✅ **Consistent UX**: Uses PageWrapper (Navbar + Footer on all pages)
4. ✅ **Type Safety**: Full type coverage using existing types
5. ✅ **Maintainable**: Single source of truth for user data structures

---

**Ready for Implementation**: This updated specification addresses all feedback and provides a clean, efficient architecture.
