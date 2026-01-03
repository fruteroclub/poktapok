# Users Management Implementation Workflow

**Feature**: Admin user management system with role assignment and account status control
**Design Doc**: [design-users-management.md](./design-users-management.md)
**Target**: Phase 1 MVP Implementation
**Estimated Effort**: 8-12 hours

## Overview

This workflow implements a comprehensive user management interface for admins to view all platform users, manage roles, update account statuses, and view user statistics. The implementation follows established codebase patterns from activities, submissions, and pending-users pages.

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    Implementation Stack                      │
├─────────────────────────────────────────────────────────────┤
│ UI Layer         │ React 19 + Next.js 16 + shadcn/ui       │
│ State Management │ TanStack Query (React Query)             │
│ API Layer        │ Next.js API Routes + Validation          │
│ Database         │ PostgreSQL + Drizzle ORM                 │
│ Authorization    │ Role-based (admin, moderator, member)    │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

- [x] Database schema with users, profiles, activitySubmissions tables
- [x] Admin layout with PageWrapper + Sidebar established
- [x] Service layer pattern with apiFetch wrapper
- [x] React Query hooks pattern established
- [x] Authorization with AdminRoute wrapper

## Implementation Phases

### Phase 1A: Database & API Foundation (Backend)

**Goal**: Implement data layer with complex aggregations and API endpoints

**Files to Create**:
- `src/lib/db/queries/users.ts` - Database query functions

**Files to Modify**:
- `src/app/api/admin/users/route.ts` - List users endpoint
- `src/app/api/admin/users/[id]/route.ts` - Get user details endpoint

**Tasks**:

1. **Create Database Queries** (`src/lib/db/queries/users.ts`)
   ```typescript
   export async function listUsers(filters: {
     search?: string
     role?: string
     accountStatus?: string
     sortBy?: string
     sortOrder?: 'asc' | 'desc'
     page?: number
     limit?: number
   })

   export async function getUserDetails(userId: string)
   ```

   **Key Implementation Details**:
   - Use `db.select()` with LEFT JOINs to profiles and activitySubmissions
   - Implement SQL aggregations with `COALESCE` for null safety
   - Use `COUNT DISTINCT` for accurate submission counts
   - Filter with `ilike` for case-insensitive search
   - Group by `users.id` and `profiles.id`
   - Calculate pagination metadata (total, hasMore)

2. **Implement GET /api/admin/users**
   - Validate query parameters (page, limit, role, accountStatus)
   - Call `listUsers()` with filters
   - Return paginated response with stats
   - Handle errors with `apiError()` helper
   - Protect with admin role check

3. **Implement GET /api/admin/users/[id]**
   - Validate userId parameter
   - Call `getUserDetails()` with userId
   - Return user data with stats and recent submissions
   - Handle user not found with `apiErrors.notFound()`
   - Protect with admin role check

**Testing**:
```bash
# Test list users
curl -X GET "http://localhost:3000/api/admin/users?page=1&limit=24"

# Test user details
curl -X GET "http://localhost:3000/api/admin/users/{userId}"

# Test filters
curl -X GET "http://localhost:3000/api/admin/users?role=member&accountStatus=active"
```

**Acceptance Criteria**:
- ✅ List users returns paginated results with stats
- ✅ Filters work correctly (search, role, accountStatus)
- ✅ User details returns complete profile and stats
- ✅ Proper error handling for invalid requests
- ✅ Admin authorization enforced

---

### Phase 1B: Service Layer & Hooks (Integration)

**Goal**: Create TypeScript-typed service layer and React Query hooks

**Files to Create**:
- `src/services/user-management.ts` - API service functions
- `src/hooks/use-user-management.ts` - React Query hooks
- `src/types/api-v1.ts` - Add user management types

**Tasks**:

1. **Create Service Layer** (`src/services/user-management.ts`)
   ```typescript
   export interface User { /* ... */ }
   export interface ListUsersFilters { /* ... */ }
   export interface ListUsersResponse { /* ... */ }
   export interface UserDetailsResponse { /* ... */ }

   export async function fetchUsers(filters?: ListUsersFilters): Promise<ListUsersResponse>
   export async function fetchUserDetails(userId: string): Promise<UserDetailsResponse>
   ```

   **Key Details**:
   - Use `apiFetch<T>()` wrapper for automatic error handling
   - Build query string from filters using URLSearchParams
   - Type all responses with discriminated unions
   - Handle pagination metadata properly

2. **Create React Query Hooks** (`src/hooks/use-user-management.ts`)
   ```typescript
   export function useUsers(filters?: ListUsersFilters)
   export function useUserDetails(userId: string)
   ```

   **Key Details**:
   - Query keys: `["admin", "users", filters]` and `["admin", "users", userId]`
   - Set `staleTime: 2 * 60 * 1000` (2 minutes)
   - Enable query only when userId is provided for user details

3. **Add Type Definitions** (`src/types/api-v1.ts`)
   - Add User interface
   - Add UserStats interface
   - Add UserProfile interface
   - Add ListUsersResponse and UserDetailsResponse

**Testing**:
- Import hooks in a test component
- Verify data fetching and caching work
- Check TypeScript types are correct
- Verify loading and error states

**Acceptance Criteria**:
- ✅ Service functions use apiFetch with proper types
- ✅ Hooks return typed data with loading/error states
- ✅ Query cache keys are properly structured
- ✅ TypeScript compilation passes

---

### Phase 1C: UI - Users List Page (Frontend)

**Goal**: Build main users management page with filters, stats, and table

**Files to Create**:
- `src/app/admin/users/page.tsx` - Main users list page

**Files to Modify**:
- `src/components/layout/sidebar.tsx` - Add Users Management link
- `src/components/layout/mobile-menu-dropdown.tsx` - Add to admin menu

**Tasks**:

1. **Create Users List Page** (`src/app/admin/users/page.tsx`)

   **Component Structure**:
   ```typescript
   'use client'

   export default function UsersPage() {
     const [search, setSearch] = useState('')
     const [role, setRole] = useState('all')
     const [accountStatus, setAccountStatus] = useState('all')
     const [page, setPage] = useState(1)

     const { data, isLoading, error } = useUsers({
       search,
       role,
       accountStatus,
       page,
       limit: 24
     })

     return (
       <div className="page-content">
         {/* Header */}
         {/* Filters Card */}
         {/* Stats Cards */}
         {/* Users Table */}
       </div>
     )
   }
   ```

   **Key Implementation Details**:
   - Use `page-content` wrapper with `header-section`
   - Filters Card with `grid grid-cols-1 gap-4 md:grid-cols-3`
   - Stats cards with `grid gap-4 md:grid-cols-2 lg:grid-cols-4`
   - Table with Avatar, Badge for role/status, stats display
   - DropdownMenu for actions (View Details initially)
   - Loading state with Loader2 icon
   - Error state with text-destructive
   - Empty state with text-muted-foreground
   - Pagination controls at bottom

2. **Helper Functions**
   ```typescript
   function getRoleVariant(role: string): BadgeProps['variant'] {
     switch (role) {
       case 'admin': return 'default'
       case 'moderator': return 'secondary'
       default: return 'outline'
     }
   }

   function getStatusVariant(status: string): BadgeProps['variant'] {
     switch (status) {
       case 'active': return 'default'
       case 'pending': return 'secondary'
       case 'suspended': return 'destructive'
       case 'banned': return 'destructive'
       default: return 'outline'
     }
   }
   ```

3. **Update Navigation**
   - Add "Users Management" to `SIDEBAR_ITEMS` in sidebar.tsx
   - Add "Users Management" to `ADMIN_MENU_ITEMS` in mobile-menu-dropdown.tsx
   - Set `href: "/admin/users"`

**Testing**:
- Visit `/admin/users` as admin
- Test all filters (search, role, accountStatus)
- Verify stats cards display correct counts
- Test pagination
- Verify table displays user data correctly
- Test "View Details" navigation

**Acceptance Criteria**:
- ✅ Page follows established layout patterns
- ✅ Filters work and update query parameters
- ✅ Stats cards display aggregated data
- ✅ Table shows all user information
- ✅ Loading, error, and empty states work
- ✅ Navigation link appears in sidebar and mobile menu

---

### Phase 1D: UI - User Detail Page (Frontend)

**Goal**: Build individual user detail page with profile, stats, and recent submissions

**Files to Create**:
- `src/app/admin/users/[id]/page.tsx` - User detail page

**Tasks**:

1. **Create User Detail Page** (`src/app/admin/users/[id]/page.tsx`)

   **Component Structure**:
   ```typescript
   'use client'

   export default function UserDetailPage({ params }: { params: { id: string } }) {
     const router = useRouter()
     const { data, isLoading, error } = useUserDetails(params.id)

     if (isLoading) return <LoadingState />
     if (error || !data) return <ErrorState />

     const { user } = data

     return (
       <div className="page-content">
         {/* Back Button */}
         {/* User Profile Card */}
         {/* Stats Cards */}
         {/* Profile Information */}
         {/* Recent Submissions */}
         {/* Account Actions */}
       </div>
     )
   }
   ```

   **Key Implementation Details**:
   - Back button with `<ArrowLeft>` icon in `header-section`
   - Profile card with large Avatar (h-20 w-20) and user info
   - Display badges for role and accountStatus
   - Stats cards grid matching admin dashboard pattern
   - Profile information card with location, learning tracks, social links
   - Recent submissions with `space-y-4` vertical spacing
   - Account actions card with non-functional buttons (Phase 1E)
   - All sections with `mt-6` spacing
   - Conditional rendering for optional profile data

2. **Profile Card Layout**
   ```typescript
   <Card className="mt-6">
     <CardHeader>
       <div className="flex items-start gap-4">
         <Avatar className="h-20 w-20">{/* ... */}</Avatar>
         <div className="flex-1">
           <CardTitle className="text-2xl">{displayName}</CardTitle>
           <p className="text-lg text-muted-foreground">@{username}</p>
           <p className="text-sm text-muted-foreground">{email}</p>
           <div className="mt-2 flex items-center gap-2">
             <Badge>{role}</Badge>
             <Badge>{accountStatus}</Badge>
             <span>Joined {date}</span>
           </div>
         </div>
       </div>
     </CardHeader>
   </Card>
   ```

3. **Recent Submissions Display**
   ```typescript
   <Card className="mt-6">
     <CardHeader><CardTitle>Recent Submissions</CardTitle></CardHeader>
     <CardContent>
       {submissions.length === 0 ? (
         <p className="py-8 text-center text-muted-foreground">No submissions yet</p>
       ) : (
         <div className="space-y-4">
           {submissions.map((submission) => (
             <div key={submission.id} className="flex justify-between border-b pb-4 last:border-0">
               {/* Submission info */}
             </div>
           ))}
         </div>
       )}
     </CardContent>
   </Card>
   ```

**Testing**:
- Click "View Details" from users list
- Verify all user information displays correctly
- Test back button navigation
- Verify stats cards show correct aggregations
- Check profile information conditional rendering
- Verify recent submissions display

**Acceptance Criteria**:
- ✅ Page follows pending-users card pattern
- ✅ Profile displays with avatar and all user info
- ✅ Stats cards match admin dashboard style
- ✅ Profile information shows conditionally
- ✅ Recent submissions display with proper formatting
- ✅ Back navigation works correctly

---

### Phase 1E: Mutation Operations (Full-Stack)

**Goal**: Implement role changes and status updates with proper validation

**Files to Create**:
- `src/app/api/admin/users/[id]/role/route.ts` - Update role endpoint
- `src/app/api/admin/users/[id]/status/route.ts` - Update status endpoint

**Files to Modify**:
- `src/services/user-management.ts` - Add mutation functions
- `src/hooks/use-user-management.ts` - Add mutation hooks
- `src/app/admin/users/[id]/page.tsx` - Integrate mutations

**Tasks**:

1. **Implement PATCH /api/admin/users/[id]/role**

   **Validation Rules**:
   - Role must be 'member', 'moderator', or 'admin'
   - Cannot change your own role
   - Moderators cannot promote to admin
   - Admin role required to make changes

   **Implementation**:
   ```typescript
   export async function PATCH(
     request: Request,
     { params }: { params: { id: string } }
   ) {
     // 1. Get current admin user from auth
     // 2. Validate request body (role, reason)
     // 3. Check cannot modify self
     // 4. Check role permissions (moderator limits)
     // 5. Update user role in database
     // 6. Return success with old/new role
   }
   ```

2. **Implement PATCH /api/admin/users/[id]/status**

   **Validation Rules**:
   - Status must be 'active', 'suspended', or 'banned'
   - Reason required for suspend/ban
   - Cannot change your own status
   - Cannot modify other admins
   - Admin role required (moderators can suspend, not ban)

   **Implementation**:
   ```typescript
   export async function PATCH(
     request: Request,
     { params }: { params: { id: string } }
   ) {
     // 1. Get current admin user from auth
     // 2. Validate request body (accountStatus, reason)
     // 3. Check reason required for suspend/ban
     // 4. Check cannot modify self or other admins
     // 5. Update account status in database
     // 6. Return success with old/new status and reason
   }
   ```

3. **Add Service Layer Functions**
   ```typescript
   export async function updateUserRole(userId: string, data: {
     role: string
     reason?: string
   }): Promise<UpdateRoleResponse>

   export async function updateUserStatus(userId: string, data: {
     accountStatus: string
     reason?: string
   }): Promise<UpdateStatusResponse>
   ```

4. **Add Mutation Hooks**
   ```typescript
   export function useUpdateUserRole() {
     const queryClient = useQueryClient()
     return useMutation({
       mutationFn: ({ userId, role, reason }: UpdateRoleParams) =>
         updateUserRole(userId, { role, reason }),
       onSuccess: (_, { userId }) => {
         queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
         queryClient.invalidateQueries({ queryKey: ["admin", "users", userId] })
       }
     })
   }

   export function useUpdateUserStatus() {
     const queryClient = useQueryClient()
     return useMutation({
       mutationFn: ({ userId, accountStatus, reason }: UpdateStatusParams) =>
         updateUserStatus(userId, { accountStatus, reason }),
       onSuccess: (_, { userId }) => {
         queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
         queryClient.invalidateQueries({ queryKey: ["admin", "users", userId] })
       }
     })
   }
   ```

5. **Integrate Mutations into UI**

   **Add State and Mutations**:
   ```typescript
   const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
   const [selectedRole, setSelectedRole] = useState<string>('')
   const [reason, setReason] = useState('')

   const updateRoleMutation = useUpdateUserRole()
   const updateStatusMutation = useUpdateUserStatus()
   ```

   **Handle Role Change**:
   ```typescript
   const handleRoleChange = async () => {
     try {
       await updateRoleMutation.mutateAsync({
         userId: user.id,
         role: selectedRole,
         reason: reason || undefined
       })
       toast.success(`Role changed to ${selectedRole}`)
       setIsRoleDialogOpen(false)
       setReason('')
     } catch (error) {
       const message = error instanceof Error ? error.message : 'Failed to change role'
       toast.error(message)
     }
   }
   ```

   **Add Dialogs for Confirmations**:
   - Role change dialog with role selection and optional reason
   - Suspend dialog with required reason input
   - Ban dialog with required reason input and warning message
   - Use shadcn/ui Dialog component
   - Show loading state during mutation (Loader2)
   - Disable actions during processing

**Testing**:
- Test role change as admin (member → moderator → admin)
- Test cannot change own role (button disabled or error)
- Test moderator cannot promote to admin
- Test suspend account with reason
- Test ban account with reason and warning
- Test reactivate suspended/banned account
- Verify toast notifications
- Verify cache invalidation refreshes data

**Acceptance Criteria**:
- ✅ Role changes work with proper validation
- ✅ Status updates work with proper validation
- ✅ Cannot modify self or higher roles
- ✅ Reason required for suspend/ban
- ✅ Toast notifications provide feedback
- ✅ Loading states show during mutations
- ✅ Cache invalidation refreshes UI
- ✅ Dialogs provide confirmation UX

---

### Phase 1F: Testing & Polish (Quality Assurance)

**Goal**: Comprehensive testing and UI polish

**Tasks**:

1. **Authorization Testing**
   - ✅ Non-admin users cannot access `/admin/users`
   - ✅ API endpoints reject non-admin requests
   - ✅ Moderators have limited permissions
   - ✅ Cannot modify own account
   - ✅ Cannot modify higher roles

2. **Edge Case Testing**
   - ✅ Empty search results handled gracefully
   - ✅ Users with no profile data display correctly
   - ✅ Users with no submissions show empty state
   - ✅ Pagination at boundaries (first/last page)
   - ✅ Invalid user ID returns 404
   - ✅ Concurrent mutations handled properly

3. **UI/UX Polish**
   - ✅ Loading states are smooth and informative
   - ✅ Error messages are clear and actionable
   - ✅ Empty states provide helpful guidance
   - ✅ Form validation provides immediate feedback
   - ✅ Toast notifications are non-intrusive
   - ✅ Responsive design works on mobile
   - ✅ Keyboard navigation works properly

4. **Performance Testing**
   - ✅ List users query performs well with pagination
   - ✅ Aggregations don't cause slow queries
   - ✅ React Query caching reduces API calls
   - ✅ No unnecessary re-renders

5. **Manual Testing Checklist**
   - [ ] List users page loads correctly
   - [ ] All filters work (search, role, status)
   - [ ] Stats cards show correct counts
   - [ ] Pagination works forward and backward
   - [ ] Click "View Details" navigates correctly
   - [ ] User detail page shows all information
   - [ ] Back button returns to users list
   - [ ] Role change works and updates UI
   - [ ] Suspend account works with reason
   - [ ] Ban account works with warning
   - [ ] Reactivate account works
   - [ ] Cannot change own role
   - [ ] Cannot suspend/ban self
   - [ ] Toast notifications appear and disappear
   - [ ] Loading states show during operations
   - [ ] Error states display helpful messages

**Acceptance Criteria**:
- ✅ All authorization rules enforced
- ✅ All edge cases handled gracefully
- ✅ UI polish meets quality standards
- ✅ Performance is acceptable
- ✅ Manual testing checklist completed

---

## File Structure Summary

```
src/
├── app/
│   ├── admin/
│   │   └── users/
│   │       ├── page.tsx                      # NEW: Users list page
│   │       └── [id]/
│   │           └── page.tsx                  # NEW: User detail page
│   └── api/
│       └── admin/
│           └── users/
│               ├── route.ts                  # NEW: List users endpoint
│               └── [id]/
│                   ├── route.ts              # NEW: Get user details endpoint
│                   ├── role/
│                   │   └── route.ts          # NEW: Update role endpoint
│                   └── status/
│                       └── route.ts          # NEW: Update status endpoint
├── components/
│   └── layout/
│       ├── sidebar.tsx                       # MODIFY: Add users link
│       └── mobile-menu-dropdown.tsx          # MODIFY: Add users link
├── hooks/
│   └── use-user-management.ts                # NEW: React Query hooks
├── lib/
│   └── db/
│       └── queries/
│           └── users.ts                      # NEW: Database queries
├── services/
│   └── user-management.ts                    # NEW: Service layer
└── types/
    └── api-v1.ts                             # MODIFY: Add user types
```

## Success Metrics

- [ ] Admin can view all users with pagination
- [ ] Admin can filter users by search, role, and status
- [ ] Admin can view individual user details with stats
- [ ] Admin can change user roles
- [ ] Admin can suspend/ban/reactivate accounts
- [ ] Non-admin users cannot access user management
- [ ] All authorization rules enforced
- [ ] UI follows established patterns
- [ ] Loading and error states work correctly
- [ ] Toast notifications provide clear feedback

## Next Steps (Phase 2)

After Phase 1 MVP is complete:

1. **Advanced Filtering**: Add sorting by multiple columns, date range filters
2. **Bulk Actions**: Select multiple users and perform batch operations
3. **Export**: Export user list to CSV
4. **User Activity Timeline**: Show complete activity history
5. **Audit Log**: Track all role/status changes with reasons
6. **Analytics Dashboard**: User growth charts, role distribution

## Notes

- This implementation follows established patterns from activities, submissions, and pending-users pages
- All UI components use existing shadcn/ui library - no new components needed
- Database aggregations are complex but necessary for performance
- Authorization is critical - all API routes must validate admin role
- Cache invalidation is crucial for keeping UI in sync after mutations
