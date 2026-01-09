# Epic 3 Phase 2: Sessions Management UI - Implementation Plan

> **Status**: Ready for Implementation
> **Priority**: 🔴 Critical
> **Duration**: 6-8 hours
> **Depends On**: Sessions CRUD APIs (✅ Complete)

---

## 🎯 Overview

Build the complete admin interface for managing sessions within programs, including:
- Sessions list and CRUD operations
- Session-to-activities linking
- Attendance tracking interface

This completes the **Program → Sessions → Activities** workflow hierarchy.

---

## 📊 Current State Analysis

### ✅ Already Complete (Backend)
- Database schema: `sessions`, `session_activities` tables
- API endpoints: All CRUD operations for sessions
- React Query hooks: `useAllSessions`, `useCreateSession`, `useUpdateSession`, etc.
- Service functions: `fetchAllSessions`, `createSession`, etc.
- TypeScript types: Complete session type definitions

### ❌ Missing (Frontend)
- No admin pages for sessions management
- No UI components for session CRUD
- No session-activities linking interface
- No attendance marking UI
- Navigation exists (`/admin/sessions`) but no page

---

## 🏗️ Architecture

### File Structure
```
src/
├── app/admin/sessions/
│   ├── page.tsx                          # NEW: Sessions list page
│   └── [id]/
│       ├── page.tsx                      # NEW: Session detail page
│       └── attendance/
│           └── page.tsx                  # NEW: Attendance interface
│
├── components/admin/
│   ├── sessions-table.tsx                # NEW: Sessions data table
│   ├── session-form-dialog.tsx           # NEW: Create/edit form
│   ├── session-activities-manager.tsx    # NEW: Link activities
│   └── session-attendance-table.tsx      # NEW: Mark attendance
│
└── hooks/
    └── use-admin.ts                      # ✅ EXISTS: All hooks ready
```

### Component Hierarchy
```
SessionsManagementPage
├── SessionsTable
│   ├── SessionRow (per session)
│   └── SessionFormDialog (create/edit)
└── DeleteConfirmationDialog

SessionDetailPage
├── SessionHeader (title, dates, program)
├── SessionInfoCard (details)
└── SessionActivitiesManager
    ├── LinkedActivitiesList (drag-drop)
    └── AvailableActivitiesGrid

SessionAttendancePage
├── SessionHeader
├── AttendanceStats
└── SessionAttendanceTable
    └── AttendanceRow (per user)
```

---

## 📋 Implementation Tasks

### Part 1: Sessions List Page (2-3 hours)

#### Step 1.1: Create Sessions Table Component
**File**: `src/components/admin/sessions-table.tsx`

**Features**:
- Display sessions with: title, program, date, type, location
- Show activity count and attendance count per session
- Edit and delete actions per row
- Loading skeleton states
- Empty state when no sessions

**Columns**:
| Column | Data | Actions |
|--------|------|---------|
| Title | session.title | - |
| Program | session.program.name | Link to program |
| Date | sessionDate (formatted) | - |
| Type | In-Person/Virtual/Hybrid | Badge |
| Activities | activityCount | - |
| Attendance | attendanceCount | - |
| Actions | Edit, Delete, View | Buttons |

**Implementation Pattern**: Follow `ProgramsTable` structure

---

#### Step 1.2: Create Session Form Dialog
**File**: `src/components/admin/session-form-dialog.tsx`

**Form Fields**:
```typescript
interface SessionFormData {
  programId: string        // Select from programs
  title: string            // Required, max 200 chars
  description: string      // Optional, textarea
  sessionType: 'in-person' | 'virtual' | 'hybrid'
  sessionDate: string      // Date + time picker
  duration: string         // Optional (e.g., "2 hours")
  location: string         // Required (physical location OR meeting URL)
}
```

**Validation**:
- Program selection required
- Title required (1-200 chars)
- Session date required, must be future date
- Location required (adapts placeholder based on sessionType)
  - In-person: "e.g., Room 301, Building A"
  - Virtual: "e.g., https://meet.google.com/xxx"
  - Hybrid: "Location and/or meeting URL"

**Implementation Pattern**: Follow `ProgramFormDialog` structure

---

#### Step 1.3: Create Sessions List Page
**File**: `src/app/admin/sessions/page.tsx`

**Layout Structure**:
```tsx
<div className="page-content">
  {/* Header */}
  <div className="header-section">
    <h1>Sessions Management</h1>
    <p>Manage sessions across all programs</p>
    <Button onClick={openCreateDialog}>Create Session</Button>
  </div>

  {/* Filters */}
  <div className="filters-section">
    <Select placeholder="Filter by program" />
    <Select placeholder="Filter by type" />
    <DateRangePicker placeholder="Filter by date" />
  </div>

  {/* Table */}
  <SessionsTable
    sessions={data?.sessions || []}
    isLoading={isLoading}
    onEdit={handleEdit}
    onDelete={handleDelete}
  />

  {/* Dialogs */}
  <SessionFormDialog open={isDialogOpen} ... />
  <DeleteConfirmationDialog open={isDeleteDialogOpen} ... />
</div>
```

**State Management**:
- Create dialog state (open/closed, editing session ID)
- Delete confirmation state
- Filter state (program, type, date range)

**Hooks Used**:
- `useAllSessions()` - Fetch all sessions
- `useCreateSession()` - Create mutation
- `useUpdateSession()` - Update mutation
- `useDeleteSession()` - Delete mutation
- `useAllPrograms()` - For program selector

---

### Part 2: Session Detail & Activities (2-3 hours)

#### Step 2.1: Create Session Detail Page
**File**: `src/app/admin/sessions/[id]/page.tsx`

**Layout Structure**:
```tsx
<div className="page-content">
  {/* Breadcrumb */}
  <Breadcrumb>
    <BreadcrumbItem>Sessions</BreadcrumbItem>
    <BreadcrumbItem>{session.title}</BreadcrumbItem>
  </Breadcrumb>

  {/* Header with Actions */}
  <div className="header-section">
    <div>
      <h1>{session.title}</h1>
      <Badge>{session.sessionType}</Badge>
    </div>
    <div className="actions">
      <Button onClick={goToAttendance}>Mark Attendance</Button>
      <Button variant="outline" onClick={openEditDialog}>Edit</Button>
    </div>
  </div>

  {/* Session Info Card */}
  <Card>
    <CardHeader>Session Details</CardHeader>
    <CardContent>
      <InfoRow label="Program" value={session.program.name} />
      <InfoRow label="Date" value={formatDate(session.sessionDate)} />
      <InfoRow label="Duration" value={session.duration} />
      <InfoRow label="Type" value={session.sessionType} />
      <InfoRow label="Location" value={session.location} />
      <InfoRow label="Description" value={session.description} />
    </CardContent>
  </Card>

  {/* Activities Manager */}
  <SessionActivitiesManager sessionId={session.id} />
</div>
```

**Data Requirements**:
- Session details with program info
- Linked activities count
- Attendance stats

**Hooks Used**:
- `useSession(sessionId)` - Fetch session details
- `useSessionActivities(sessionId)` - Fetch linked activities

---

#### Step 2.2: Create Session Activities Manager
**File**: `src/components/admin/session-activities-manager.tsx`

**Features**:
- Display linked activities in order
- Drag-and-drop reordering
- Add activities from available pool
- Remove activities
- Show activity details (title, type, required/optional)

**Layout Structure**:
```tsx
<div className="space-y-6">
  {/* Linked Activities Section */}
  <Card>
    <CardHeader>
      <CardTitle>Session Activities ({linkedActivities.length})</CardTitle>
    </CardHeader>
    <CardContent>
      <DndContext onDragEnd={handleDragEnd}>
        <SortableContext items={linkedActivities}>
          {linkedActivities.map((link, index) => (
            <ActivityCard
              key={link.id}
              activity={link.activity}
              orderIndex={index + 1}
              onRemove={() => unlinkMutation.mutate(link.id)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </CardContent>
  </Card>

  {/* Available Activities Section */}
  <Card>
    <CardHeader>
      <CardTitle>Add Activities</CardTitle>
      <Input placeholder="Search activities..." />
    </CardHeader>
    <CardContent>
      <div className="grid gap-4">
        {availableActivities.map(activity => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onAdd={() => linkMutation.mutate({
              activityId: activity.id,
              orderIndex: linkedActivities.length + 1
            })}
          />
        ))}
      </div>
    </CardContent>
  </Card>
</div>
```

**Implementation Notes**:
- Use `@dnd-kit/core` for drag-and-drop (already in project)
- Filter available activities (exclude already linked)
- Update order indices on drag-end
- Optimistic updates for better UX

**Hooks Used**:
- `useSessionActivities(sessionId)` - Linked activities
- `useQuery(['activities'])` - All activities
- `useLinkSessionActivity()` - Link mutation
- `useUnlinkSessionActivity()` - Unlink mutation

---

### Part 3: Attendance Management (2-3 hours)

#### Step 3.1: Create Attendance Table Component
**File**: `src/components/admin/session-attendance-table.tsx`

**Features**:
- List all users enrolled in session's program
- Mark attendance status per user
- Add notes per user
- Bulk actions (mark all present/absent)
- Save automatically on status change

**Table Structure**:
| Column | Data | Input |
|--------|------|-------|
| User | displayName + avatar | - |
| Status | Current attendance status | Badge |
| Account Type | Guest/Member | Badge |
| Action | Mark attendance | Select (Present/Absent/Excused) |
| Notes | Attendance notes | Input |

**Attendance Status Options**:
- `present` - User attended (green badge)
- `absent` - User did not attend (red badge)
- `excused` - Excused absence (yellow badge)
- `null` - Not marked yet (gray badge)

**Implementation**:
```tsx
export function SessionAttendanceTable({
  sessionId,
  programId
}: Props) {
  const { data: enrollments } = useQuery({
    queryKey: ['program', programId, 'enrollments'],
    queryFn: () => fetchProgramEnrollments(programId)
  })

  const { data: attendanceRecords } = useQuery({
    queryKey: ['session', sessionId, 'attendance'],
    queryFn: () => fetchSessionAttendance(sessionId)
  })

  const markMutation = useMutation({
    mutationFn: markAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries(['session', sessionId, 'attendance'])
      toast.success('Attendance marked')
    }
  })

  // Merge enrollments with attendance records
  const usersWithAttendance = enrollments?.map(enrollment => ({
    ...enrollment,
    attendance: attendanceRecords?.find(
      r => r.userId === enrollment.userId
    )
  }))

  return (
    <Table>
      <TableBody>
        {usersWithAttendance?.map(user => (
          <AttendanceRow
            key={user.userId}
            user={user}
            onMarkAttendance={(status, notes) =>
              markMutation.mutate({
                userId: user.userId,
                sessionId,
                status,
                notes
              })
            }
          />
        ))}
      </TableBody>
    </Table>
  )
}
```

---

#### Step 3.2: Create Attendance Page
**File**: `src/app/admin/sessions/[id]/attendance/page.tsx`

**Layout Structure**:
```tsx
<div className="page-content">
  {/* Breadcrumb */}
  <Breadcrumb>
    <BreadcrumbItem href="/admin/sessions">Sessions</BreadcrumbItem>
    <BreadcrumbItem href={`/admin/sessions/${sessionId}`}>
      {session.title}
    </BreadcrumbItem>
    <BreadcrumbItem>Attendance</BreadcrumbItem>
  </Breadcrumb>

  {/* Header */}
  <div className="header-section">
    <div>
      <h1>Mark Attendance</h1>
      <p>{session.title} - {formatDate(session.sessionDate)}</p>
    </div>
    <div className="actions">
      <Button variant="outline" onClick={markAllPresent}>
        Mark All Present
      </Button>
      <Button variant="outline" onClick={markAllAbsent}>
        Mark All Absent
      </Button>
    </div>
  </div>

  {/* Stats Cards */}
  <div className="grid grid-cols-4 gap-4">
    <StatCard label="Total Users" value={stats.total} />
    <StatCard label="Present" value={stats.present} />
    <StatCard label="Absent" value={stats.absent} />
    <StatCard label="Excused" value={stats.excused} />
  </div>

  {/* Attendance Table */}
  <SessionAttendanceTable
    sessionId={sessionId}
    programId={session.programId}
  />
</div>
```

**Features**:
- Display session info at top
- Show attendance statistics
- Bulk actions (mark all present/absent)
- Real-time updates as attendance is marked
- Auto-save on status change

**Hooks Used**:
- `useSession(sessionId)` - Session details
- `useQuery(['program', programId, 'enrollments'])` - Program users
- `useQuery(['session', sessionId, 'attendance'])` - Attendance records
- `useMutation(markAttendance)` - Mark attendance

---

## 🎨 UI/UX Specifications

### Design Consistency
Follow existing admin patterns:
- Use `page-content` wrapper for all pages
- Use `header-section` for page headers
- Use existing Card, Button, Badge components
- Match Programs page styling and layout

### Color Coding
**Session Types**:
- In-Person: `blue` badge
- Virtual: `green` badge
- Hybrid: `purple` badge

**Attendance Status**:
- Present: `green` badge
- Absent: `red` badge
- Excused: `yellow` badge
- Not Marked: `gray` badge

**Account Status**:
- Member: `success` badge
- Guest: `info` badge

### Loading States
- Skeleton loaders for tables
- Spinner for form submissions
- Optimistic updates for attendance marking
- Toast notifications for all actions

### Empty States
- "No sessions yet" - Create first session CTA
- "No activities linked" - Add activities CTA
- "No users enrolled" - Message about enrollment

---

## 🔧 Technical Specifications

### API Integration
All hooks already exist in `src/hooks/use-admin.ts`:
```typescript
// Sessions CRUD
useAllSessions()
useSession(sessionId)
useCreateSession()
useUpdateSession()
useDeleteSession()
useProgramSessions(programId)

// Session Activities
useSessionActivities(sessionId)
useLinkSessionActivity()
useUnlinkSessionActivity()
```

### Type Safety
All types defined in `src/types/api-v1.ts`:
- `Session`
- `SessionWithProgram`
- `SessionWithActivityCount`
- `CreateSessionRequest`
- `UpdateSessionRequest`
- `SessionActivityLink`
- `SessionActivityLinkWithDetails`

### Form Validation
Use Zod schemas for form validation:
```typescript
const sessionFormSchema = z.object({
  programId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  sessionType: z.enum(['in-person', 'virtual', 'hybrid']),
  sessionDate: z.string().datetime(),
  duration: z.string().optional(),
  location: z.string().min(1)
})
```

### Error Handling
- Display API errors via toast notifications
- Show field-level validation errors
- Handle network errors gracefully
- Provide retry mechanisms

---

## ✅ Acceptance Criteria

### Functional Requirements
- [ ] Admin can view all sessions across all programs
- [ ] Admin can create new sessions with all required fields
- [ ] Admin can edit existing sessions
- [ ] Admin can delete sessions (with confirmation)
- [ ] Admin can filter sessions by program, type, and date
- [ ] Admin can link activities to sessions
- [ ] Admin can unlink activities from sessions
- [ ] Admin can reorder activities via drag-and-drop
- [ ] Admin can mark attendance for session participants
- [ ] Admin can add notes when marking attendance
- [ ] Admin can use bulk actions for attendance
- [ ] All operations show real-time updates
- [ ] All operations show loading states
- [ ] All operations show success/error feedback

### Technical Requirements
- [ ] Zero TypeScript errors
- [ ] All components follow existing patterns
- [ ] Responsive design (works on mobile)
- [ ] Accessibility (keyboard navigation, ARIA labels)
- [ ] Optimistic updates where appropriate
- [ ] React Query cache invalidation working
- [ ] Forms validate before submission
- [ ] Error boundaries for error handling

### UX Requirements
- [ ] Loading skeletons for all async operations
- [ ] Empty states with helpful messages
- [ ] Confirmation dialogs for destructive actions
- [ ] Toast notifications for all actions
- [ ] Breadcrumb navigation on detail pages
- [ ] Consistent styling with existing admin pages
- [ ] Smooth transitions and animations

---

## 📝 Implementation Checklist

### Phase 1: Sessions List (2-3 hours)
- [ ] Create `SessionsTable` component
- [ ] Create `SessionFormDialog` component
- [ ] Create `/admin/sessions/page.tsx`
- [ ] Add filters (program, type, date)
- [ ] Test CRUD operations
- [ ] Test validation and error handling

### Phase 2: Session Detail (2-3 hours)
- [ ] Create `/admin/sessions/[id]/page.tsx`
- [ ] Create `SessionActivitiesManager` component
- [ ] Implement drag-and-drop reordering
- [ ] Test activity linking/unlinking
- [ ] Test navigation between pages

### Phase 3: Attendance (2-3 hours)
- [ ] Create `SessionAttendanceTable` component
- [ ] Create `/admin/sessions/[id]/attendance/page.tsx`
- [ ] Implement bulk actions
- [ ] Test attendance marking flow
- [ ] Test statistics calculation

### Phase 4: Integration & Testing (1 hour)
- [ ] Test complete workflow end-to-end
- [ ] Verify navigation links work
- [ ] Check mobile responsiveness
- [ ] Verify accessibility
- [ ] Fix any bugs or issues
- [ ] Update CLAUDE.md documentation

---

## 🚀 Next Steps After Completion

Once Sessions UI is complete, the admin can:
1. Create programs
2. Create sessions within programs
3. Link activities to sessions
4. Mark attendance for sessions
5. Track user progress through programs

This completes the core **Program Management** workflow.

**Remaining Epic 3 Tasks**:
- E3-T2B: Onboarding Flow Updates (program selection during signup)
- E3-T3: Guest Status Implementation (permissions system)
- E3-T4B: Admin Applications Queue UI
- E3-T6: User-Facing Program Dashboard
- E3-T7: Testing & Documentation

---

**Created**: 2026-01-09
**Status**: Ready for Implementation
**Estimated Time**: 6-8 hours
**Priority**: 🔴 Critical
