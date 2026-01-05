# Users Management System - Design Specification

**Version**: 1.0
**Date**: 2026-01-02
**Status**: Design Phase

## 1. Overview

A comprehensive admin interface for managing all platform users, including role assignments, account status changes, and user analytics.

## 2. System Architecture

### 2.1 Component Structure

```
/admin/users
├── page.tsx                     # Main users list with filters
├── [id]/
│   └── page.tsx                # User detail page with full profile
└── components/
    ├── users-table.tsx         # Data table with pagination
    ├── user-filters.tsx        # Search and filter controls
    ├── role-badge.tsx          # Role display component
    ├── user-actions-menu.tsx   # Dropdown actions menu
    └── user-stats-card.tsx     # Stats summary component
```

### 2.2 Data Flow

```
User Action → React Query Mutation → API Route → Database Query → Response
                                                        ↓
                                                  Audit Log (optional)
```

## 3. API Endpoints

### 3.1 List Users

**Endpoint**: `GET /api/admin/users`

**Query Parameters**:
```typescript
{
  search?: string          // Username, email, displayName
  role?: 'member' | 'moderator' | 'admin' | 'all'
  accountStatus?: 'active' | 'pending' | 'suspended' | 'banned' | 'all'
  sortBy?: 'createdAt' | 'username' | 'totalEarnings' | 'submissionsCount'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number          // Default: 24
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    users: Array<{
      id: string
      username: string | null
      displayName: string | null
      email: string | null
      avatarUrl: string | null
      role: 'member' | 'moderator' | 'admin'
      accountStatus: 'active' | 'pending' | 'suspended' | 'banned'
      createdAt: string

      // Aggregated stats
      stats: {
        totalEarnings: string       // Total PULPA earned
        submissionsCount: number    // Total submissions
        approvedCount: number       // Approved submissions
        activitiesCompleted: number // Unique activities completed
      }

      // Profile data
      profile: {
        city: string | null
        country: string | null
        learningTracks: string[]
      } | null
    }>

    pagination: {
      total: number
      page: number
      limit: number
      hasMore: boolean
    }
  }
}
```

### 3.2 Get User Details

**Endpoint**: `GET /api/admin/users/[id]`

**Response**:
```typescript
{
  success: true,
  data: {
    user: {
      // Basic info (same as list)
      id: string
      username: string | null
      displayName: string | null
      email: string | null
      avatarUrl: string | null
      appWallet: string | null
      role: 'member' | 'moderator' | 'admin'
      accountStatus: 'active' | 'pending' | 'suspended' | 'banned'
      primaryAuthMethod: string
      createdAt: string
      updatedAt: string

      // Full profile
      profile: {
        bio: string | null
        city: string | null
        country: string | null
        countryCode: string | null
        timezone: string | null
        learningTracks: string[]
        githubUrl: string | null
        linkedinUrl: string | null
        twitterUrl: string | null
        telegramUrl: string | null
        websiteUrl: string | null
      } | null

      // Detailed stats
      stats: {
        totalEarnings: string
        submissionsCount: number
        approvedCount: number
        rejectedCount: number
        pendingCount: number
        activitiesCompleted: number
      }

      // Recent submissions (last 5)
      recentSubmissions: Array<{
        id: string
        activityId: string
        activityTitle: string
        status: string
        submittedAt: string
        rewardPulpaAmount: string | null
      }>
    }
  }
}
```

### 3.3 Update User Role

**Endpoint**: `PATCH /api/admin/users/[id]/role`

**Request Body**:
```typescript
{
  role: 'member' | 'moderator' | 'admin'
  reason?: string  // Audit trail
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    userId: string
    oldRole: string
    newRole: string
    updatedAt: string
  }
}
```

**Authorization**: Admin only

**Validation**:
- Cannot demote yourself
- Cannot promote to admin if you're only a moderator
- Requires valid role enum value

### 3.4 Update User Status

**Endpoint**: `PATCH /api/admin/users/[id]/status`

**Request Body**:
```typescript
{
  accountStatus: 'active' | 'suspended' | 'banned'
  reason?: string  // Required for suspension/ban
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    userId: string
    oldStatus: string
    newStatus: string
    reason: string | null
    updatedAt: string
  }
}
```

**Authorization**: Admin only (moderators can suspend, not ban)

**Validation**:
- Reason required for suspension/ban
- Cannot suspend/ban yourself
- Cannot suspend/ban other admins

### 3.5 Bulk Actions (Future Enhancement)

**Endpoint**: `POST /api/admin/users/bulk`

**Request Body**:
```typescript
{
  action: 'suspend' | 'activate' | 'changeRole'
  userIds: string[]
  payload: {
    role?: string
    accountStatus?: string
    reason?: string
  }
}
```

## 4. Database Queries

### 4.1 List Users Query

```typescript
// File: src/lib/db/queries/users.ts

export async function listUsers(filters: {
  search?: string
  role?: string
  accountStatus?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}) {
  const query = db
    .select({
      // User fields
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      email: users.email,
      avatarUrl: users.avatarUrl,
      role: users.role,
      accountStatus: users.accountStatus,
      createdAt: users.createdAt,

      // Profile fields
      profileId: profiles.id,
      city: profiles.city,
      country: profiles.country,
      learningTracks: profiles.learningTracks,

      // Aggregated stats
      totalEarnings: sql<string>`
        COALESCE(
          SUM(CASE
            WHEN ${activitySubmissions.status} = 'approved'
            THEN ${activitySubmissions.rewardPulpaAmount}::numeric
            ELSE 0
          END), 0
        )::text
      `,
      submissionsCount: sql<number>`COUNT(DISTINCT ${activitySubmissions.id})`,
      approvedCount: sql<number>`
        COUNT(DISTINCT CASE
          WHEN ${activitySubmissions.status} = 'approved'
          THEN ${activitySubmissions.id}
        END)
      `,
      activitiesCompleted: sql<number>`
        COUNT(DISTINCT CASE
          WHEN ${activitySubmissions.status} = 'approved'
          THEN ${activitySubmissions.activityId}
        END)
      `,
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .leftJoin(activitySubmissions, eq(users.id, activitySubmissions.userId))
    .where(
      and(
        isNull(users.deletedAt),
        // Search filter
        search ? or(
          ilike(users.username, `%${search}%`),
          ilike(users.email, `%${search}%`),
          ilike(users.displayName, `%${search}%`)
        ) : undefined,
        // Role filter
        role && role !== 'all' ? eq(users.role, role) : undefined,
        // Status filter
        accountStatus && accountStatus !== 'all'
          ? eq(users.accountStatus, accountStatus)
          : undefined
      )
    )
    .groupBy(users.id, profiles.id)
    .orderBy(/* sortBy logic */)
    .limit(limit)
    .offset((page - 1) * limit)

  return { users: await query, total, page, limit, hasMore }
}
```

### 4.2 Get User Details Query

```typescript
export async function getUserDetails(userId: string) {
  // Main user + profile data
  const userData = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      profile: true
    }
  })

  // Aggregated stats
  const stats = await db
    .select({
      totalEarnings: sql<string>`...`,
      submissionsCount: count(activitySubmissions.id),
      approvedCount: sql<number>`...`,
      rejectedCount: sql<number>`...`,
      pendingCount: sql<number>`...`,
      activitiesCompleted: sql<number>`...`,
    })
    .from(activitySubmissions)
    .where(eq(activitySubmissions.userId, userId))

  // Recent submissions
  const recentSubmissions = await db.query.activitySubmissions.findMany({
    where: eq(activitySubmissions.userId, userId),
    with: { activity: { columns: { title: true } } },
    orderBy: desc(activitySubmissions.submittedAt),
    limit: 5
  })

  return { user: userData, stats, recentSubmissions }
}
```

## 5. UI Components

### 5.1 Main Users Page Layout

**File**: `src/app/admin/users/page.tsx`

**Structure**: Follows established admin page patterns with `page-content` wrapper, `header-section`, and `mt-6` spacing.

```typescript
<div className="page-content">
  {/* Header */}
  <div className="header-section">
    <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
    <p className="text-muted-foreground">
      Manage user accounts, roles, and permissions
    </p>
  </div>

  {/* Filters Card */}
  <Card className="mt-6">
    <CardHeader>
      <CardTitle>Filters</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Search</Label>
          <Input placeholder="Username, email, or name..." />
        </div>
        <div className="space-y-2">
          <Label>Role</Label>
          <Select>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Stats Cards */}
  <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">156</div>
      </CardContent>
    </Card>
    {/* Additional stat cards... */}
  </div>

  {/* Users Table */}
  <Card className="mt-6">
    <CardContent className="pt-6">
      {error ? (
        <div className="py-8 text-center text-destructive">
          Failed to load users. Please try again.
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading users...</span>
        </div>
      ) : users.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          No users found matching your filters.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Stats</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatarUrl || undefined} />
                      <AvatarFallback>
                        {user.displayName?.charAt(0)?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {user.displayName || user.username || 'Anonymous'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getRoleVariant(user.role)}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(user.accountStatus)}>
                    {user.accountStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{user.stats.totalEarnings} $PULPA</div>
                    <div className="text-muted-foreground">
                      {user.stats.submissionsCount} submissions
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}`)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>Change Role</DropdownMenuItem>
                      <DropdownMenuItem>Suspend Account</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </CardContent>
  </Card>
</div>
```

**Key Layout Patterns Applied**:
- ✅ `page-content` wrapper class for consistent container
- ✅ `header-section` with `text-3xl font-bold tracking-tight` h1
- ✅ `mt-6` spacing between major sections
- ✅ `gap-4` for grid gaps
- ✅ Card components for all content containers
- ✅ No direct margin/padding - Tailwind utility classes only
- ✅ Consistent error/loading/empty state patterns

### 5.2 User Actions Menu

```
[⋮] Actions
  ├─ View Details
  ├─ Change Role →  [Member / Moderator / Admin]
  ├─ Suspend Account
  ├─ Reactivate Account
  ├─ Ban User (Permanent)
  └─ View Submissions
```

### 5.3 User Detail Page Layout

**File**: `src/app/admin/users/[id]/page.tsx`

**Structure**: Follows pending users card pattern with vertical sections and `mt-6` spacing.

```typescript
<div className="page-content">
  {/* Header with Back Button */}
  <div className="header-section">
    <Button variant="ghost" onClick={() => router.back()}>
      <ArrowLeft className="mr-2 h-4 w-4" />
      Back to Users
    </Button>
  </div>

  {/* User Profile Card */}
  <Card className="mt-6">
    <CardHeader>
      <div className="flex items-start gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.avatarUrl || undefined} />
          <AvatarFallback>
            {user.displayName?.charAt(0)?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-2xl">
            {user.displayName || user.username || 'Anonymous'}
          </CardTitle>
          {user.username && (
            <p className="text-lg text-muted-foreground">@{user.username}</p>
          )}
          {user.email && (
            <p className="text-sm text-muted-foreground">{user.email}</p>
          )}
          <div className="mt-2 flex items-center gap-2">
            <Badge variant={getRoleVariant(user.role)}>{user.role}</Badge>
            <Badge variant={getStatusVariant(user.accountStatus)}>
              {user.accountStatus}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </CardHeader>
  </Card>

  {/* Stats Cards */}
  <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{user.stats.totalEarnings} $PULPA</div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Submissions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{user.stats.submissionsCount}</div>
        <p className="text-xs text-muted-foreground">
          {user.stats.approvedCount} approved
        </p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{user.stats.activitiesCompleted}</div>
        <p className="text-xs text-muted-foreground">Completed</p>
      </CardContent>
    </Card>
  </div>

  {/* Profile Information */}
  {user.profile && (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {user.profile.city && user.profile.country && (
            <div>
              <p className="font-medium">Location</p>
              <p className="text-muted-foreground">
                {user.profile.city}, {user.profile.country}
              </p>
            </div>
          )}
          {user.profile.learningTracks && user.profile.learningTracks.length > 0 && (
            <div>
              <p className="font-medium">Learning Tracks</p>
              <p className="text-muted-foreground">
                {user.profile.learningTracks.join(', ')}
              </p>
            </div>
          )}
          {/* Social links similar to pending-users pattern */}
        </div>
      </CardContent>
    </Card>
  )}

  {/* Recent Submissions */}
  <Card className="mt-6">
    <CardHeader>
      <CardTitle>Recent Submissions</CardTitle>
    </CardHeader>
    <CardContent>
      {user.recentSubmissions.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          No submissions yet
        </p>
      ) : (
        <div className="space-y-4">
          {user.recentSubmissions.map((submission) => (
            <div key={submission.id} className="flex items-center justify-between border-b pb-4 last:border-0">
              <div>
                <p className="font-medium">{submission.activityTitle}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(submission.submittedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {submission.rewardPulpaAmount && (
                  <span className="text-sm">{submission.rewardPulpaAmount} $PULPA</span>
                )}
                <Badge variant={getStatusVariant(submission.status)}>
                  {submission.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>

  {/* Account Actions */}
  <Card className="mt-6">
    <CardHeader>
      <CardTitle>Account Actions</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex flex-wrap gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Change Role
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleRoleChange('member')}>
              Member
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleChange('moderator')}>
              Moderator
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleChange('admin')}>
              Admin
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" onClick={handleSuspend}>
          Suspend Account
        </Button>
        <Button variant="destructive" onClick={handleBan}>
          Ban User
        </Button>
      </div>
    </CardContent>
  </Card>
</div>
```

**Key Layout Patterns Applied**:
- ✅ `page-content` wrapper with `header-section` for back button
- ✅ Profile card similar to pending-users with Avatar + info layout
- ✅ Stats cards matching admin dashboard pattern (`grid gap-4 md:grid-cols-2 lg:grid-cols-4`)
- ✅ `mt-6` spacing between all major sections
- ✅ CardHeader + CardContent structure consistently
- ✅ `space-y-4` for vertical spacing within cards
- ✅ `gap-3` for button groups
- ✅ No direct margin/padding - Tailwind utilities only

## 6. Service Layer

### 6.1 Services

**File**: `src/services/user-management.ts`

```typescript
export interface User {
  id: string
  username: string | null
  displayName: string | null
  email: string | null
  avatarUrl: string | null
  role: 'member' | 'moderator' | 'admin'
  accountStatus: 'active' | 'pending' | 'suspended' | 'banned'
  createdAt: string
  stats: {
    totalEarnings: string
    submissionsCount: number
    approvedCount: number
    activitiesCompleted: number
  }
  profile: {
    city: string | null
    country: string | null
    learningTracks: string[]
  } | null
}

export interface ListUsersFilters {
  search?: string
  role?: string
  accountStatus?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export async function fetchUsers(filters?: ListUsersFilters): Promise<ListUsersResponse>

export async function fetchUserDetails(userId: string): Promise<UserDetailsResponse>

export async function updateUserRole(userId: string, data: {
  role: string
  reason?: string
}): Promise<UpdateRoleResponse>

export async function updateUserStatus(userId: string, data: {
  accountStatus: string
  reason?: string
}): Promise<UpdateStatusResponse>
```

### 6.2 Hooks

**File**: `src/hooks/use-user-management.ts`

```typescript
export function useUsers(filters?: ListUsersFilters)
export function useUserDetails(userId: string)
export function useUpdateUserRole()
export function useUpdateUserStatus()
```

## 7. Security & Authorization

### 7.1 Role-Based Permissions

| Action | Admin | Moderator | Member |
|--------|-------|-----------|--------|
| View Users List | ✅ | ✅ | ❌ |
| View User Details | ✅ | ✅ | ❌ |
| Change Role (to Member) | ✅ | ✅ | ❌ |
| Change Role (to Moderator) | ✅ | ❌ | ❌ |
| Change Role (to Admin) | ✅ | ❌ | ❌ |
| Suspend Account | ✅ | ✅ | ❌ |
| Ban Account (Permanent) | ✅ | ❌ | ❌ |
| Reactivate Account | ✅ | ✅ | ❌ |

### 7.2 Protection Rules

1. **Cannot modify yourself**: Admins cannot change their own role or status
2. **Cannot modify higher roles**: Moderators cannot modify admins
3. **Reason required**: Suspensions and bans require a reason field
4. **Audit logging**: All role/status changes should be logged (future enhancement)

## 8. Implementation Phases

### Phase 1: Core Functionality (MVP)
- ✅ List users with basic filters
- ✅ User detail page
- ✅ Change user role (admin only)
- ✅ Update account status (suspend/activate/ban)

### Phase 2: Enhanced Features
- ⏳ Advanced filtering and sorting
- ⏳ Bulk actions
- ⏳ Export users to CSV
- ⏳ User activity timeline

### Phase 3: Advanced Features
- ⏳ Audit log for all changes
- ⏳ Email notifications for role changes
- ⏳ User impersonation (for support)
- ⏳ Analytics dashboard

## 9. Testing Checklist

### Unit Tests
- [ ] User list query with filters
- [ ] User details query
- [ ] Role update validation
- [ ] Status update validation
- [ ] Permission checks

### Integration Tests
- [ ] API endpoints return correct data
- [ ] React Query cache invalidation works
- [ ] Toast notifications display
- [ ] Loading states work correctly

### E2E Tests
- [ ] Admin can view users list
- [ ] Admin can change user roles
- [ ] Admin can suspend/ban users
- [ ] Moderator has limited permissions
- [ ] Cannot modify own account

## 10. Database Considerations

### Performance Optimization
- Add index on `users.role` for filtering
- Add index on `users.accountStatus` for filtering
- Add composite index on `(role, accountStatus, createdAt)` for sorted queries
- Consider materialized view for aggregated stats (if performance becomes an issue)

### Migration Steps
1. No schema changes required (roles already exist)
2. Add audit log table (optional, Phase 2)
3. Add performance indexes

## 11. Future Enhancements

### Audit Logging
```typescript
// audit_logs table
{
  id: uuid
  adminId: uuid  // Who made the change
  userId: uuid   // Affected user
  action: 'role_change' | 'status_change' | 'suspension' | 'ban'
  oldValue: string
  newValue: string
  reason: string | null
  createdAt: timestamp
}
```

### User Activity Timeline
- Show all submissions chronologically
- Show role/status changes
- Show login history
- Show $PULPA earnings over time

### Analytics Dashboard
- User growth chart
- Role distribution pie chart
- Earnings leaderboard
- Submission trends

## 12. Summary

This design provides a comprehensive user management system with:
- ✅ Full CRUD operations for user data
- ✅ Role-based access control with proper permissions
- ✅ Rich user statistics and analytics
- ✅ Clean, maintainable architecture following established patterns
- ✅ Scalable design for future enhancements
- ✅ Security-first approach with validation and authorization

**Next Steps**: Implement Phase 1 (MVP) with the core functionality.
