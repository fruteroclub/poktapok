# Admin Dashboard Design Specification

**Created**: January 2, 2026
**Status**: Implementation Ready

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

- Uses Next.js route groups: `(admin)` → pages in `src/app/(admin)/dashboard/admin/`
- Fixed left sidebar (Sidebar component)
- Scrollable main content area
- No navbar (admin pages are full-screen with sidebar)

## User Approval Workflow

### Current Flow

1. **User signs up** → `accountStatus: "incomplete"`
2. **User completes onboarding** → `accountStatus: "pending"`
3. **Admin reviews** → `accountStatus: "active"` or "rejected"

### Database Schema (users table)

```typescript
accountStatus: 'incomplete' | 'pending' | 'active' | 'suspended' | 'banned'
role: 'member' | 'moderator' | 'admin'
```

**Key Fields for Review:**

- `email`, `username`, `displayName`, `bio`, `avatarUrl`
- `createdAt`, `updatedAt`
- `accountStatus`, `role`
- Profile data (via `profiles` table join)

## API Endpoints

### GET /api/admin/pending-users

**Purpose**: List all pending user applications

**Query Parameters**:

- `page` (default: 1)
- `limit` (default: 20)
- `sortBy` (default: "createdAt")
- `order` (default: "desc")

**Response**:

```typescript
{
  success: true,
  data: {
    users: Array<{
      id: string
      email: string
      username: string
      displayName: string
      bio: string | null
      avatarUrl: string | null
      accountStatus: "pending"
      createdAt: Date
      updatedAt: Date
      profile: {
        city: string | null
        country: string | null
        github: string | null
        twitter: string | null
        linkedin: string | null
        learningTracks: string[]
      } | null
    }>
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}
```

### POST /api/admin/users/[id]/approve

**Purpose**: Approve a pending user

**Body**: None (idempotent)

**Response**:

```typescript
{
  success: true,
  data: {
    user: User
  },
  message: "User approved successfully"
}
```

**Side Effects**:

- Updates `accountStatus` from "pending" → "active"
- Sets `updatedAt` timestamp

### POST /api/admin/users/[id]/reject

**Purpose**: Reject a pending user

**Body**:

```typescript
{
  reason?: string  // Optional rejection reason
}
```

**Response**:

```typescript
{
  success: true,
  data: {
    user: User
  },
  message: "User rejected"
}
```

**Side Effects**:

- Updates `accountStatus` from "pending" → "banned"
- Stores rejection reason in `metadata.rejectionReason`
- Sets `updatedAt` timestamp

## UI Components

### Pending Users Page

**Layout**:

```
┌─────────────┬────────────────────────────────────────┐
│             │  Admin Dashboard > Pending Users       │
│             ├────────────────────────────────────────┤
│  Sidebar    │  Stats Cards                           │
│             │  ┌──────┬──────┬──────┐                │
│  - Home     │  │ 12   │  5   │  3   │                │
│  - Pending  │  │Pndng │Active│Today │                │
│  - Users    │  └──────┴──────┴──────┘                │
│  - Projects │                                         │
│  - Quests   │  Filters: [All▼] [Sort▼] [Search]     │
│             │                                         │
│             │  User Cards (Grid/List)                │
│             │  ┌────────────────────────────────┐    │
│             │  │ @username  [Approve] [Reject]  │    │
│             │  │ Display Name | Bio text...     │    │
│             │  │ 📍 City, Country | 🕐 2d ago   │    │
│             │  └────────────────────────────────┘    │
│             │  ...                                    │
└─────────────┴────────────────────────────────────────┘
```

**Components**:

1. **StatsCards**
   - Pending count
   - Total active users
   - Approvals today/this week
   - Rejection rate

2. **PendingUserCard**
   - User avatar + basic info
   - Bio preview
   - Location + signup time
   - Approve/Reject buttons
   - Click to expand for full details

3. **UserReviewDialog**
   - Full user information
   - Profile details
   - Social links
   - Learning tracks
   - Approve/Reject actions with confirmation
   - Rejection reason textarea

4. **Filters & Search**
   - Search by username/email
   - Filter by signup date range
   - Sort by: newest, oldest, username

### Admin Home Page

**Layout**:

```
┌─────────────┬────────────────────────────────────────┐
│             │  Admin Dashboard                        │
│  Sidebar    ├────────────────────────────────────────┤
│             │  Overview Stats                         │
│             │  ┌──────┬──────┬──────┬──────┐         │
│             │  │ 12   │ 145  │ 23   │ 8    │         │
│             │  │Pndng │Users │Activ │Submis│         │
│             │  └──────┴──────┴──────┴──────┘         │
│             │                                         │
│             │  Quick Actions                          │
│             │  ┌──────────────────────────────┐      │
│             │  │ → Review Pending Users       │      │
│             │  │ → Review Submissions         │      │
│             │  │ → Create Activity            │      │
│             │  └──────────────────────────────┘      │
│             │                                         │
│             │  Recent Activity Feed                   │
│             │  ...                                    │
└─────────────┴────────────────────────────────────────┘
```

## Authorization

### Role-Based Access Control

**Admin Check** (middleware):

```typescript
// src/lib/privy/middleware.ts
export const requireAdmin = (handler) =>
  requireAuth(async (request, authUser) => {
    // Get user from DB
    const user = await db.select().from(users).where(eq(users.privyDid, authUser.privyDid)).limit(1)

    // Check if admin
    if (!user[0] || user[0].role !== 'admin') {
      return apiErrors.unauthorized('Admin access required')
    }

    return handler(request, user[0])
  })
```

**Usage**:

```typescript
// In API routes
export const GET = requireAdmin(async (request, adminUser) => {
  // adminUser has role: 'admin'
})
```

### Client-Side Route Protection

```typescript
// In admin pages
const { data } = useAuth()
if (data?.user?.role !== 'admin') {
  router.push('/dashboard')
}
```

## Sidebar Configuration

**Update Sidebar** (`src/components/layout/sidebar.tsx`):

```typescript
const MENU_ITEMS: MenuItemType[] = [
  // Regular user items
  { displayText: 'dashboard', href: '/dashboard', isMobileOnly: false },
  { displayText: 'profile', href: '/profile', isMobileOnly: false },

  // Admin items (conditional rendering)
  { displayText: 'admin', href: '/dashboard/admin', isMobileOnly: false, adminOnly: true },
  { displayText: 'pending users', href: '/dashboard/admin/pending-users', isMobileOnly: false, adminOnly: true },
  { displayText: 'users', href: '/dashboard/admin/users', isMobileOnly: false, adminOnly: true },
  { displayText: 'activities', href: '/dashboard/admin/activities', isMobileOnly: false, adminOnly: true },
  { displayText: 'submissions', href: '/dashboard/admin/submissions', isMobileOnly: false, adminOnly: true },
];

// Render logic
{MENU_ITEMS.filter(item =>
  !item.adminOnly || authData?.user?.role === 'admin'
).map(...)}
```

## Type Definitions

### API Types (`src/types/api-v1.ts`)

```typescript
// Pending Users Response
export interface PendingUser {
  id: string
  email: string
  username: string
  displayName: string
  bio: string | null
  avatarUrl: string | null
  accountStatus: 'pending'
  createdAt: string
  updatedAt: string
  profile: {
    city: string | null
    country: string | null
    githubUrl: string | null
    twitterUrl: string | null
    linkedinUrl: string | null
    learningTracks: string[]
  } | null
}

export interface PendingUsersResponse {
  users: PendingUser[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Admin Actions
export interface ApproveUserResponse {
  user: User
}

export interface RejectUserRequest {
  reason?: string
}

export interface RejectUserResponse {
  user: User
}
```

### Service Layer (`src/services/admin.ts`)

```typescript
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

export async function approveUser(userId: string): Promise<ApproveUserResponse> {
  return apiFetch<ApproveUserResponse>(`/api/admin/users/${userId}/approve`, { method: 'POST' })
}

export async function rejectUser(userId: string, reason?: string): Promise<RejectUserResponse> {
  return apiFetch<RejectUserResponse>(`/api/admin/users/${userId}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  })
}
```

### Hooks (`src/hooks/use-admin.ts`)

```typescript
export function usePendingUsers(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['admin', 'pending-users', page, limit],
    queryFn: () => fetchPendingUsers({ page, limit }),
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useApproveUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: approveUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-users'] })
      toast.success('User approved successfully')
    },
    onError: (error: ApiError) => {
      toast.error(error.message)
    },
  })
}

export function useRejectUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      rejectUser(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-users'] })
      toast.success('User rejected')
    },
    onError: (error: ApiError) => {
      toast.error(error.message)
    },
  })
}
```

## Implementation Checklist

### Phase 1: Core Infrastructure

- [ ] Create admin layout with sidebar
- [ ] Add `requireAdmin` middleware
- [ ] Update Sidebar component with admin items
- [ ] Create admin route protection utility

### Phase 2: API Endpoints

- [ ] `GET /api/admin/pending-users`
- [ ] `POST /api/admin/users/[id]/approve`
- [ ] `POST /api/admin/users/[id]/reject`

### Phase 3: Type Safety

- [ ] Add types to `src/types/api-v1.ts`
- [ ] Create services in `src/services/admin.ts`
- [ ] Create hooks in `src/hooks/use-admin.ts`

### Phase 4: UI Components

- [ ] Admin home page
- [ ] Pending users page
- [ ] User card component
- [ ] Review dialog component
- [ ] Stats cards component

### Phase 5: Testing & Polish

- [ ] Test approval flow
- [ ] Test rejection flow
- [ ] Test pagination
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add empty states

## Security Considerations

1. **Authorization**: All admin routes require `role: 'admin'`
2. **Input Validation**: Validate user IDs (UUID format)
3. **Rate Limiting**: Consider rate limiting admin actions
4. **Audit Trail**: Log all admin actions to database
5. **Idempotency**: Approve/reject actions are idempotent (safe to retry)

## Future Enhancements

- Bulk approve/reject actions
- Email notifications on approval/rejection
- Admin activity audit log
- User search with advanced filters
- Export pending users to CSV
- Integration with `applications` table for motivation text
- Rejection reason templates
- User analytics dashboard

---

**Ready for Implementation**: This specification provides complete design for admin dashboard MVP.
