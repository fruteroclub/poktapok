# Program Management System

## Overview

The Program Management system enables structured learning programs with application-based enrollment, progress tracking, and tiered membership (Guest → Member). It provides a complete workflow from user onboarding through graduation to full membership.

**Epic Status**: ✅ Complete (E3-T1 through E3-T6)

## Architecture

### Database Schema

The system uses 5 core tables:

1. **users** - Core identity (linked to Privy DID) with `accountStatus` field
2. **profiles** - Extended user data (location, social links, learning tracks)
3. **applications** - Onboarding queue with program goals and admin review
4. **program_enrollments** - Active program participation tracking
5. **attendance** - Session attendance records for promotion eligibility
6. **activity_submissions** - Work submissions for quality tracking

**Status Flow**: `incomplete` → `pending` → `guest`/`active` → `active`

### API Architecture

All endpoints follow the standardized envelope pattern:
```typescript
// Success
{ success: true, data: {...}, meta?: {...} }

// Error
{ success: false, error: { message, code?, details? } }
```

## User Journeys

### 1. New User Onboarding (E3-T2)

**Flow**: [Login with Privy](src/app/onboarding/page.tsx:1) → Complete Profile → Select Program → Set Goal → Link Accounts → Submit

**Steps**:
1. User authenticates with Privy (wallet or social)
2. Fills profile form (username, display name, bio, avatar)
3. Selects program from active programs list
4. Sets 1-month goal (1-280 characters)
5. Links social accounts (GitHub, X, LinkedIn, Telegram)
6. Reviews and submits application
7. Status changes to `pending`

**Endpoints**:
- `POST /api/profiles` - Create profile
- `GET /api/programs/active` - List active programs
- `POST /api/applications` - Submit application

**Components**:
- [ProfileStep](src/components/onboarding/profile-step.tsx:1) - Profile form
- [ProgramStep](src/components/onboarding/program-step.tsx:1) - Program selection
- [GoalStep](src/components/onboarding/goal-step.tsx:1) - Goal setting with AI validation
- [SocialStep](src/components/onboarding/social-step.tsx:1) - Social account linking
- [ReviewStep](src/components/onboarding/review-step.tsx:1) - Final review before submission

### 2. Admin Application Review (E3-T4)

**Flow**: Queue View → Filter → Review Details → Decision (Guest/Member/Reject) → Process

**Steps**:
1. Admin navigates to [Applications Queue](src/app/admin/applications/page.tsx:1)
2. Views statistics cards (Total, Pending, Approved, Rejected)
3. Filters by status or program
4. Clicks application to open [detail drawer](src/components/admin/application-detail-drawer.tsx:1)
5. Reviews applicant profile, goal, and social links
6. Adds review notes (optional)
7. Makes decision:
   - **Approve as Guest**: Limited access, must earn membership
   - **Approve as Member**: Full access immediately
   - **Reject**: No platform access
8. System creates program enrollment (if approved)

**Endpoints**:
- `GET /api/admin/applications` - List with filtering
- `GET /api/admin/applications/:id` - Detailed view
- `GET /api/admin/applications/stats` - Dashboard statistics
- `POST /api/admin/applications/:id/approve` - Process application

**Components**:
- [ApplicationsTable](src/components/admin/applications-table.tsx:1) - Data table
- [ApplicationDetailDrawer](src/components/admin/application-detail-drawer.tsx:1) - Review UI

### 3. Guest User Experience (E3-T3)

**Capabilities**:
- ✅ Browse talent directory
- ✅ View activities and programs
- ✅ Submit work
- ✅ View bounties
- ✅ Access authenticated endpoints
- ❌ Mark attendance (admin-only)
- ❌ Access admin routes
- ❌ Vote on submissions

**Progress Tracking**:
- Attendance records (marked by admin)
- Submission approvals with quality scores
- Real-time eligibility calculation

**Promotion Requirements** (from [calculatePromotionEligibility](src/lib/promotion/calculate-eligibility.ts:1)):
- 5+ sessions attended (status='present')
- 3+ approved submissions
- 70%+ average quality score

**Components**:
- [AccountStatusBadge](src/components/common/account-status-badge.tsx:1) - Status display
- [GuestBadge](src/components/common/guest-badge.tsx:1) - Mark guest submissions
- [MemberOnly](src/components/common/member-only.tsx:1) - Restrict content
- [GuestRestricted](src/components/common/guest-restricted.tsx:1) - Block guest access

**Middleware**:
- [guestAccessMiddleware](src/middleware/guest-access.ts:1) - Route-level access control

### 4. Member Promotion (E3-T3)

**Flow**: Meet Criteria → Admin Review → Promote → Full Access

**Steps**:
1. Guest user participates in program activities
2. System tracks attendance, submissions, quality scores
3. Admin checks [promotion eligibility](src/app/api/admin/users/[id]/eligibility/route.ts:1)
4. Admin views [PromotionEligibilityCard](src/components/admin/promotion-eligibility-card.tsx:1) with progress indicators
5. Admin promotes via `POST /api/admin/users/:id/promote`
6. User status changes to `active` (full member)
7. Enrollment metadata stores promotion timestamp and reviewer

**Endpoints**:
- `GET /api/admin/users/:id/eligibility` - Check eligibility
- `POST /api/admin/users/:id/promote` - Promote to member

**Business Logic**:
- [calculatePromotionEligibility](src/lib/promotion/calculate-eligibility.ts:1) - Eligibility calculation

### 5. Attendance Management (E3-T5)

**Flow**: Session → Mark Attendance → Update Records → Affect Eligibility

**Steps**:
1. Admin navigates to [Session Attendance](src/app/admin/sessions/[id]/attendance/page.tsx:1)
2. Views enrolled users for the session
3. Selects users (individual or bulk)
4. Marks as Present, Absent, or Excused
5. System updates attendance records
6. Affects promotion eligibility calculations

**Endpoints**:
- `GET /api/admin/attendance/session/:id` - Get session attendance
- `POST /api/admin/attendance/mark` - Mark attendance (bulk)
- `POST /api/admin/attendance/bulk` - Bulk mark with different statuses

**Components**:
- [AttendanceMarker](src/components/admin/attendance-marker.tsx:1) - Bulk marking UI

### 6. Program Dashboard (E3-T6)

**Flow**: View Progress → Track Participation → Monitor Promotion (Guests)

**User View**:
- Program information (name, description, dates)
- Account status badge
- Personal goal display
- Participation statistics:
  - Attendance rate
  - Submission approval rate
  - Quality score average
- Promotion progress (guests only)
- Upcoming sessions (top 3)

**Endpoints**:
- `GET /api/programs/:id/dashboard` - Dashboard data
- `GET /api/programs/:id/sessions` - Upcoming sessions

**Components**:
- [ParticipationStatsCard](src/components/programs/participation-stats-card.tsx:1) - Stats display
- [PromotionProgressCard](src/components/programs/promotion-progress-card.tsx:1) - Guest progress

## Status Tiers

### Incomplete
**Description**: Authenticated but profile not completed
**Access**: No platform access
**Badge**: 🚧 Incomplete
**Next Step**: Complete profile in onboarding

### Pending
**Description**: Application submitted, awaiting review
**Access**: View-only access to some pages
**Badge**: ⏳ Pending
**Next Step**: Admin reviews application

### Guest (Club Guest)
**Description**: Approved with limited access
**Access**:
- ✅ Browse directory, activities, programs
- ✅ Submit work
- ✅ View bounties
- ❌ Admin routes
- ❌ Voting
- ❌ Mark attendance

**Badge**: 👤 Guest
**Promotion Path**: Meet requirements → Admin promotes
**Requirements**: 5 sessions + 3 submissions + 70% quality

### Active (Full Member)
**Description**: Full platform access
**Access**: All features
**Badge**: ✅ Member
**Benefits**: Voting, referrals, priority support

## Technical Implementation

### Type Definitions

All API types are in [src/types/api-v1.ts](src/types/api-v1.ts:1):
- `AccountStatus` - Status union type
- `Application`, `ApplicationWithDetails` - Application types
- `PromotionEligibility` - Eligibility calculation result
- `AttendanceRecord`, `UserWithAttendance` - Attendance types
- `ProgramDashboardData` - Dashboard data structure

### Services

Service functions abstract API calls:
- [src/services/admin.ts](src/services/admin.ts:1) - Admin operations
- [src/services/attendance.ts](src/services/attendance.ts:1) - Attendance operations
- [src/services/programs.ts](src/services/programs.ts:1) - Program data

### Hooks

React Query hooks for data fetching:
- [src/hooks/use-admin.ts](src/hooks/use-admin.ts:1) - Admin queries/mutations
- [src/hooks/use-attendance.ts](src/hooks/use-attendance.ts:1) - Attendance operations
- [src/hooks/use-programs.ts](src/hooks/use-programs.ts:1) - Program data

### Database Queries

Optimized query patterns:
- **Joins**: Use LEFT JOIN for optional relationships
- **Pagination**: `limit()` + `offset()` pattern
- **Statistics**: Aggregation with `count()`, `sql` templates
- **Transactions**: Wrap multi-table updates in `db.transaction()`

### Access Control

Three layers:
1. **Privy Authentication**: `getAuthUser()` for user endpoints
2. **Admin Authorization**: `requireAdmin()` HOF for admin endpoints
3. **Guest Middleware**: `guestAccessMiddleware()` for route restrictions

## Performance Considerations

### Database Optimization
- Composite indexes on `(userId, sessionId)` for attendance
- Indexed foreign keys for joins
- JSONB for flexible metadata
- Connection pooling (DATABASE_URL)

### Query Optimization
- Limit large result sets (default 20 items)
- Use aggregations instead of loading all records
- Cache dashboard data (5-minute staleTime)

### Frontend Optimization
- React Query caching (1-5 minute staleTime)
- Optimistic updates with query invalidation
- Skeleton loading states
- Lazy load heavy components

## Error Handling

### API Errors
All endpoints use standardized error responses:
```typescript
{
  success: false,
  error: {
    message: "Human-readable error",
    code: "MACHINE_READABLE_CODE",
    details: { field: "value" } // Optional validation details
  }
}
```

### Common Error Codes
- `UNAUTHORIZED` - Not authenticated
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource doesn't exist
- `CONFLICT` - Duplicate resource
- `VALIDATION_ERROR` - Invalid input
- `GUEST_ACCESS_RESTRICTED` - Guest user limitation

### Client Error Handling
```typescript
try {
  await mutation.mutateAsync(data)
  toast.success("Success message")
} catch (error) {
  if (error instanceof ApiError) {
    toast.error(error.message)
    console.error(error.code, error.details)
  }
}
```

## Security

### Authentication
- Privy handles wallet + social authentication
- JWT tokens in cookies (httpOnly, secure)
- User ID from Privy DID in database

### Authorization
- Role-based (`admin` vs `user`)
- Status-based (`guest` vs `active`)
- Middleware enforcement at route level

### Input Validation
- Zod schemas for all request bodies
- Server-side validation before database writes
- SQL injection prevention via parameterized queries

### Data Protection
- Soft deletes (`deletedAt` timestamp)
- Audit trails (`reviewedBy`, `markedBy`)
- Metadata JSONB for flexible tracking

## Troubleshooting

### Common Issues

**Issue**: User stuck in "incomplete" status
**Solution**: Ensure profile creation completed, check [src/app/api/profiles/route.ts](src/app/api/profiles/route.ts:1)

**Issue**: Application not appearing in queue
**Solution**: Verify `status='pending'`, check applications table

**Issue**: Guest can't submit work
**Solution**: Check guest middleware allowed routes in [src/middleware/guest-access.ts](src/middleware/guest-access.ts:1)

**Issue**: Promotion eligibility incorrect
**Solution**: Verify attendance records marked as 'present', submissions status='approved'

**Issue**: Statistics not updating
**Solution**: Check React Query cache, invalidate queries after mutations

## Future Enhancements

- **Automated Promotion**: Auto-promote when criteria met (optional admin approval)
- **Email Notifications**: Application status changes, promotion eligibility
- **Batch Operations**: Bulk approve/reject applications
- **Analytics Dashboard**: Program completion rates, promotion velocity
- **Referral System**: Track who invited whom
- **Program Templates**: Reusable program structures

## Related Documentation

- [Database Setup Guide](../database-setup.md)
- [Admin Application Review Guide](../guides/admin-application-review.md)
- [API Reference](../api-reference.md)
- [User Onboarding Guide](../guides/user-onboarding.md)
- [Testing Guide](../testing-guide.md)
