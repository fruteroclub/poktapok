# Epic 3: Program Management - Tickets Summary

> **Status**: 🎯 Ready for Implementation
> **Total Tickets**: 8
> **Duration**: 4 weeks
> **Team**: 2-3 developers + admin/tester

## 📋 All Tickets Overview

### Phase 1: Foundation (Days 1-10)

#### ✅ E3-T1: Database Schema Setup
- **File**: [E3-T1-database-schema-setup.md](./E3-T1-database-schema-setup.md)
- **Duration**: 2 days
- **Priority**: 🔴 Critical (BLOCKING)
- **Assignee**: Backend Lead
- **Status**: Complete ticket documentation

**Deliverables**:
- 4 new tables (programs, program_activities, program_enrollments, attendance_records)
- Extended applications table
- Seed script for 3 initial programs
- Verification tests

---

#### E3-T2: Onboarding Flow Implementation
**Split into 2 parallel sub-tickets**

##### E3-T2A: Backend API Updates
- **Duration**: 2 days
- **Priority**: 🔴 Critical
- **Depends**: E3-T1
- **Assignee**: Backend Lead

**Key Deliverables**:
```
✅ src/types/api-v1.ts - UpdateUserRequest with program fields
✅ src/app/api/users/update/route.ts - Extended user update
✅ src/app/api/applications/me/route.ts - Get application status
✅ src/app/api/programs/route.ts - List active programs
✅ src/app/api/programs/[id]/route.ts - Program details
✅ src/services/applications.ts - Application service layer
✅ src/services/programs.ts - Program service layer
```

**Key Implementation**:
```typescript
// Extend user update to create application
interface UpdateUserRequest {
  // existing fields...
  programId?: string
  goal?: string // 1-280 chars
  githubUsername?: string
  twitterUsername?: string
}

// Service layer pattern
export async function applyToProgram(data: ApplicationData) {
  return apiFetch<Application>('/api/applications', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}
```

**Acceptance Criteria**:
- [ ] `/api/users/update` accepts program fields and creates application
- [ ] `/api/applications/me` returns application with program details
- [ ] `/api/programs` returns only active programs
- [ ] `/api/programs/:id` includes linked activities
- [ ] All services use `apiFetch` wrapper
- [ ] API envelope pattern followed

---

##### E3-T2B: Frontend Onboarding Components
- **Duration**: 2 days
- **Priority**: 🔴 Critical
- **Depends**: E3-T1 (data contracts)
- **Assignee**: Frontend Lead
- **Can run parallel with**: E3-T2A

**Key Deliverables**:
```
✅ src/components/onboarding/program-selector.tsx - Program cards
✅ src/components/onboarding/goal-commitment.tsx - Goal textarea
✅ src/components/onboarding/social-accounts-form.tsx - GitHub/Twitter
✅ src/hooks/use-programs.ts - TanStack Query hook
✅ src/components/onboarding/onboarding-form.tsx - Updated flow
```

**Key Implementation**:
```typescript
// Program selector with radio cards
<ProgramSelector
  selectedProgramId={formData.programId}
  onSelect={(id) => setFormData({...formData, programId: id})}
/>

// Goal with character counter
<GoalCommitment
  value={formData.goal}
  onChange={(value) => setFormData({...formData, goal: value})}
  minChars={1}
  maxChars={280}
/>

// Multi-step form flow
const steps = [
  { id: 1, name: 'Profile', component: ProfileFields },
  { id: 2, name: 'Program', component: ProgramSelector },
  { id: 3, name: 'Goal', component: GoalCommitment },
  { id: 4, name: 'Social', component: SocialAccountsForm },
]
```

**Acceptance Criteria**:
- [ ] Programs load from API and display
- [ ] Goal validation enforces 1-280 character count
- [ ] Social accounts marked required
- [ ] Form submission creates application with status 'pending'
- [ ] User redirected to profile after submission
- [ ] Loading/error states handled

---

#### E3-T3: Guest Status Implementation
**Combined full-stack ticket (backend + frontend)**

- **Duration**: 3 days
- **Priority**: 🔴 Critical
- **Depends**: E3-T1, E3-T2A
- **Assignee**: Full-Stack Developer

**Key Deliverables**:
```
Backend:
✅ src/lib/auth/permissions.ts - Permission system
✅ src/lib/auth/status-guards.ts - Status validation
✅ src/middleware/guest-access.ts - Guest middleware

Frontend:
✅ src/components/common/status-badge.tsx - Status badges
✅ src/components/profile/application-status-banner.tsx - Status banners
✅ src/hooks/use-permissions.ts - Permission hook
```

**Key Implementation**:
```typescript
// Permission system
export function getPermissions(status: AccountStatus) {
  switch (status) {
    case 'pending': return { canBrowseDirectory: false, ... }
    case 'guest': return { canBrowseDirectory: true, canSubmit: true, ... }
    case 'active': return { ...allPermissions }
  }
}

// Status guard in API
export async function POST(request: Request) {
  const session = await getSession()
  requireGuestOrActive(session) // Allow guests
  // ... rest of endpoint
}

// Permission-based UI
const permissions = usePermissions()
if (!permissions?.canVote) return null
return <VoteButton />
```

**Acceptance Criteria**:
- [ ] Pending users cannot access platform features
- [ ] Guest users can browse directory, view activities, submit
- [ ] Active members have full access
- [ ] Status badges display correct labels/colors
- [ ] Application status banner shows for pending/guest
- [ ] Permission guards prevent unauthorized access

---

### Phase 2: Admin Features (Days 11-17)

#### E3-T4: Admin Applications Queue
- **Duration**: 2.5 days
- **Priority**: 🟡 High
- **Depends**: E3-T3
- **Assignee**: Full-Stack Developer

**Key Deliverables**:
```
Backend:
✅ src/app/api/admin/applications/route.ts - List applications
✅ src/app/api/admin/applications/[id]/route.ts - Review endpoint
✅ src/app/api/admin/users/[id]/promote/route.ts - Promote guest
✅ src/services/admin/applications.ts - Admin services

Frontend:
✅ src/app/admin/applications/page.tsx - Applications page
✅ src/components/admin/applications-queue.tsx - Queue table
✅ src/components/admin/application-review-modal.tsx - Review modal
✅ src/hooks/use-admin-applications.ts - Admin hooks
```

**Key Implementation**:
```typescript
// Review application endpoint
interface ReviewApplicationRequest {
  status: 'approved_guest' | 'approved_member' | 'rejected'
  feedback?: string
}

// Actions in transaction
await db.transaction(async (tx) => {
  // Update application
  await tx.update(applications).set({ status, reviewedBy, reviewedAt })

  // Update user status
  await tx.update(users).set({
    accountStatus: status === 'approved_guest' ? 'guest' : 'active'
  })

  // Create enrollment
  await tx.insert(programEnrollments).values({ userId, programId, enrollmentStatus })
})

// Review modal with 3 actions
<Button onClick={() => approve('guest')}>Approve as Guest</Button>
<Button onClick={() => approve('member')}>Approve as Member</Button>
<Button onClick={() => reject()}>Reject</Button>
```

**Acceptance Criteria**:
- [ ] Admin can list pending applications with filters
- [ ] Admin can approve as guest or member
- [ ] Admin can reject with required feedback
- [ ] Admin can promote guest to member
- [ ] Status transitions create correct DB records
- [ ] Transactions ensure data consistency
- [ ] Real-time UI updates after actions

---

#### E3-T5: Admin Attendance Management
- **Duration**: 2 days
- **Priority**: 🟡 High
- **Depends**: E3-T1
- **Assignee**: Full-Stack Developer

**Key Deliverables**:
```
Backend:
✅ src/app/api/admin/attendance/route.ts - Mark attendance
✅ src/app/api/users/[id]/attendance/route.ts - Get history
✅ src/services/admin/attendance.ts - Attendance services

Frontend:
✅ src/components/admin/attendance-marker.tsx - Mark UI
✅ src/components/programs/attendance-history.tsx - User view
```

**Key Implementation**:
```typescript
// Mark attendance
interface MarkAttendanceRequest {
  userId: string
  activityId: string
  programId?: string
  status: 'present' | 'absent' | 'excused'
  notes?: string
}

await db.insert(attendanceRecords).values({
  userId,
  activityId,
  programId,
  attendanceStatus: status,
  markedBy: session.user.id,
  notes
})

// Attendance stats calculation
const stats = {
  totalSessions: records.length,
  present: records.filter(r => r.status === 'present').length,
  attendanceRate: (present / total) * 100
}

// Bulk marking UI
<Select onValueChange={(status) => markAttendance(userId, status)}>
  <SelectItem value="present">Present</SelectItem>
  <SelectItem value="absent">Absent</SelectItem>
  <SelectItem value="excused">Excused</SelectItem>
</Select>
```

**Acceptance Criteria**:
- [ ] Admin can mark attendance for activities
- [ ] Attendance records linked to user, activity, program
- [ ] Users can view attendance history with stats
- [ ] Attendance statistics calculated correctly
- [ ] Notes can be added per record
- [ ] Bulk marking supported

---

#### E3-T8: Admin Program CRUD
- **Duration**: 3 days
- **Priority**: 🟡 High
- **Depends**: E3-T1
- **Assignee**: Full-Stack Developer

**Key Deliverables**:
```
Backend:
✅ src/app/api/admin/programs/route.ts - Create program
✅ src/app/api/admin/programs/[id]/route.ts - Update/delete
✅ src/app/api/admin/programs/[id]/activities/route.ts - Link activities
✅ src/services/admin/programs.ts - Program services

Frontend:
✅ src/app/admin/programs/page.tsx - Programs list
✅ src/app/admin/programs/new/page.tsx - Create page
✅ src/app/admin/programs/[id]/edit/page.tsx - Edit page
✅ src/components/admin/programs-list.tsx - Programs table
✅ src/components/admin/program-form.tsx - Create/edit form
✅ src/components/admin/program-activities-manager.tsx - Activity linking
```

**Key Implementation**:
```typescript
// Create program
interface CreateProgramRequest {
  name: string
  description: string
  programType: 'cohort' | 'evergreen'
  startDate?: string // Required for cohort
  endDate?: string
  isActive?: boolean
}

// Smart delete (soft/hard)
const enrollmentCount = await db
  .select({ count: count() })
  .from(programEnrollments)
  .where(eq(programEnrollments.programId, id))

if (enrollmentCount > 0) {
  // Soft delete
  await db.update(programs).set({ isActive: false })
} else {
  // Hard delete
  await db.delete(programs).where(eq(programs.id, id))
}

// Link activity with order
await db.insert(programActivities).values({
  programId,
  activityId,
  isRequired,
  orderIndex
})

// Drag-and-drop activity reordering
<DndContext onDragEnd={handleReorder}>
  <SortableContext items={programActivities}>
    {activities.map(activity => <ActivityCard />)}
  </SortableContext>
</DndContext>
```

**Acceptance Criteria**:
- [ ] Admin can create programs with validation
- [ ] Admin can edit program details
- [ ] Admin can delete programs (soft/hard logic)
- [ ] Admin can link/unlink activities
- [ ] Admin can mark activities required/optional
- [ ] Admin can reorder activities with drag-drop
- [ ] Changes reflect immediately in user UI
- [ ] Validation prevents dangerous deletions

---

### Phase 3: UX & Testing (Days 18-20)

#### E3-T6: Program Dashboard
- **Duration**: 2.5 days
- **Priority**: 🟢 Medium
- **Depends**: E3-T2, E3-T5
- **Assignee**: Frontend Lead

**Key Deliverables**:
```
✅ src/app/programs/[id]/page.tsx - Dashboard page
✅ src/components/programs/program-dashboard.tsx - Dashboard layout
✅ src/components/programs/program-header.tsx - Program info
✅ src/components/programs/progress-tracker.tsx - Progress visualization
✅ src/components/programs/program-activities-list.tsx - Activities
```

**Key Implementation**:
```typescript
// Progress calculation
const requiredActivities = activities.filter(a => a.isRequired)
const completedRequired = requiredActivities.filter(a =>
  submissions.some(s => s.activityId === a.id && s.status === 'approved')
)
const progress = (completedRequired.length / requiredActivities.length) * 100

// Dashboard layout
<ProgramDashboard programId={params.id}>
  <ProgramHeader program={program} enrollment={enrollment} />
  <ProgressTracker
    activities={activities}
    attendance={attendance}
    submissions={submissions}
  />
  <div className="grid grid-cols-2 gap-6">
    <ProgramActivitiesList activities={activities} />
    <AttendanceHistory attendance={attendance} />
  </div>
</ProgramDashboard>
```

**Acceptance Criteria**:
- [ ] Users see program dashboard after enrollment
- [ ] Dashboard displays program details and dates
- [ ] Progress tracker shows completion percentage
- [ ] Attendance history with statistics
- [ ] Program activities listed with status
- [ ] Activities link to submission pages

---

#### E3-T7: Testing & Documentation
- **Duration**: 3 days
- **Priority**: 🔴 Critical
- **Depends**: All previous tickets
- **Assignee**: All team + QA

**Key Deliverables**:
```
Testing:
✅ tests/services/*.test.ts - Service layer tests
✅ tests/api/*.test.ts - API endpoint tests
✅ tests/components/*.test.tsx - Component tests
✅ tests/e2e/*.spec.ts - E2E flows

Documentation:
✅ CLAUDE.md - Updated with new tables/features
✅ docs/features/program-management.md - Feature docs
✅ docs/guides/admin-application-review.md - Admin guide
✅ docs/guides/user-onboarding.md - User guide
```

**Testing Coverage**:
```typescript
// Unit tests
- Service layer functions (>80% coverage)
- Permission system logic
- Status transition logic
- Utility functions

// Integration tests
- API endpoint behavior
- Database operations
- Status transition flows
- Application review process

// E2E tests
- Complete onboarding flow
- Application review (guest/member)
- Guest promotion flow
- Program CRUD operations
- Attendance marking
```

**Acceptance Criteria**:
- [ ] Unit tests >80% coverage, all passing
- [ ] Integration tests for all endpoints passing
- [ ] E2E tests for critical flows passing
- [ ] CLAUDE.md updated with new architecture
- [ ] Feature documentation complete
- [ ] Admin guides written and reviewed
- [ ] User guides written and reviewed
- [ ] No critical or high bugs remaining

---

## 🔀 Parallel Execution Map

```
Week 1-2 (Foundation):
Day 1-2:   [E3-T1] Database ────────────┐
Day 3-4:   [E3-T2A] Backend ─┐          │
           [E3-T2B] Frontend ┴─ PARALLEL├─ After T1
Day 5-7:   [E3-T3] Guest Status ────────┘

Week 3 (Admin Features):
Day 11-12: [E3-T4] Admin Apps ──┐
Day 13-14: [E3-T5] Attendance ──┼─ Can run parallel
Day 15-17: [E3-T8] Program CRUD ┘

Week 4 (UX & Testing):
Day 18-19: [E3-T6] Dashboard
Day 18-20: [E3-T7] Testing (starts Day 18, runs through Day 20)
```

## 📊 Ticket Status Tracking

| Ticket | Duration | Priority | Status | Assignee | Phase |
|--------|----------|----------|--------|----------|-------|
| E3-T1 | 2 days | 🔴 Critical | ✅ Documented | Backend | 1 |
| E3-T2A | 2 days | 🔴 Critical | 📋 Ready | Backend | 1 |
| E3-T2B | 2 days | 🔴 Critical | 📋 Ready | Frontend | 1 |
| E3-T3 | 3 days | 🔴 Critical | 📋 Ready | Full-Stack | 1 |
| E3-T4 | 2.5 days | 🟡 High | 📋 Ready | Full-Stack | 2 |
| E3-T5 | 2 days | 🟡 High | 📋 Ready | Full-Stack | 2 |
| E3-T8 | 3 days | 🟡 High | 📋 Ready | Full-Stack | 2 |
| E3-T6 | 2.5 days | 🟢 Medium | 📋 Ready | Frontend | 3 |
| E3-T7 | 3 days | 🔴 Critical | 📋 Ready | All + QA | 3 |

## 🎯 Sprint Planning Suggestion

### Sprint 1 (Week 1-2): Foundation
- **Goal**: Complete onboarding flow with guest status
- **Tickets**: E3-T1, E3-T2A, E3-T2B, E3-T3
- **Team**: Backend Lead + Frontend Lead + Full-Stack
- **Demo**: Working onboarding with program selection and guest status

### Sprint 2 (Week 3): Admin Tools
- **Goal**: Enable admin application review and program management
- **Tickets**: E3-T4, E3-T5, E3-T8
- **Team**: Full-Stack (all tickets can be done by one person or split)
- **Demo**: Admin can review apps, mark attendance, manage programs

### Sprint 3 (Week 4): Polish & Quality
- **Goal**: User dashboard and comprehensive testing
- **Tickets**: E3-T6, E3-T7
- **Team**: Frontend + All team for testing
- **Demo**: Complete program dashboard, all tests passing

## 🚀 Getting Started

**Day 1 Actions**:
1. Team standup: Review epic scope and tickets
2. Assign E3-T1 to Backend Lead
3. Backend Lead: Begin database schema work
4. Frontend Lead: Review E3-T2B requirements
5. Set up daily standups for coordination

**Day 3 Actions** (After E3-T1 complete):
1. Deploy E3-T1 to staging
2. Start E3-T2A and E3-T2B in parallel
3. Daily sync between backend and frontend on API contracts

**Week 2 Actions**:
1. Complete E3-T3
2. Test end-to-end onboarding flow
3. Prepare for Phase 2 (admin features)

---

## 📚 Additional Resources

- **Epic Scope**: [EPIC-3-SCOPE.md](./EPIC-3-SCOPE.md)
- **Implementation Workflow**: [IMPLEMENTATION-WORKFLOW.md](./IMPLEMENTATION-WORKFLOW.md)
- **Complete Ticket**: [E3-T1-database-schema-setup.md](./E3-T1-database-schema-setup.md)
- **Project README**: [README.md](./README.md)

---

**Last Updated**: 2026-01-06
**Epic Owner**: Product Team
**Status**: Ready for Sprint Planning
