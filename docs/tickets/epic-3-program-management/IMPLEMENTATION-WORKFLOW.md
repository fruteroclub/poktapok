# Epic 3: Program Management - Implementation Workflow

> **Strategy**: Systematic with Parallel Execution
> **Total Duration**: 4 weeks
> **Team Size**: 2-3 developers + 1 admin/tester
> **Risk Level**: Medium

## 🎯 Implementation Strategy

### Execution Approach
- **Parallel Development**: Frontend and backend work streams run concurrently
- **Progressive Enhancement**: Core functionality first, enhancements in later phases
- **Quality Gates**: Testing and validation at each phase boundary
- **Incremental Rollout**: Feature flags enable gradual production deployment

### Critical Success Factors
1. **Database Schema First**: All migrations must complete before feature development
2. **API Contracts Early**: Define and document all endpoints before implementation
3. **Component Isolation**: Pure UI components enable parallel frontend development
4. **Permission System**: Guest/Member distinction must be thoroughly tested

---

## 📋 Phase 1: Foundation (Days 1-10)

**Goal**: Establish database schema, core APIs, and onboarding flow infrastructure

**Team Split**:
- **Backend Lead**: Database migrations, API endpoints (T1, T2-backend)
- **Frontend Lead**: Onboarding components, program selector (T2-frontend, T3-frontend)
- **Full-Stack**: Guest permissions, status flow logic (T3-backend)

### E3-T1: Database Schema & Migrations
**Duration**: 2 days | **Priority**: 🔴 Critical | **Blocking**: All other tasks

**Objectives**:
- Create all new tables and relationships
- Extend existing applications table
- Seed initial 3 programs
- Validate schema in dev environment

**Deliverables**:
```
✅ drizzle/schema/programs.ts - Programs table definition
✅ drizzle/schema/program-activities.ts - Junction table
✅ drizzle/schema/program-enrollments.ts - Enrollments table
✅ drizzle/schema/attendance-records.ts - Attendance table
✅ drizzle/migrations/XXXX_add_program_system.sql - Combined migration
✅ scripts/seed-programs.ts - Seed initial programs
✅ Database tests passing
```

**Implementation Steps**:

**Step 1.1: Create Schema Files** (4 hours)
```typescript
// drizzle/schema/programs.ts
import { pgTable, uuid, varchar, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core'
import { timestamps, metadata } from './utils'

export const programs = pgTable('programs', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description').notNull(),
  programType: varchar('program_type', { length: 50 }).notNull(), // 'cohort' | 'evergreen'
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  isActive: boolean('is_active').default(true).notNull(),
  ...timestamps,
  ...metadata
})

// Similar patterns for other tables...
```

**Step 1.2: Generate Migration** (1 hour)
```bash
bun run db:generate
# Review generated SQL
# Test in dev environment
```

**Step 1.3: Extend Applications Table** (2 hours)
```typescript
// drizzle/schema/applications.ts
export const applications = pgTable('applications', {
  // ... existing fields
  programId: uuid('program_id').references(() => programs.id),
  goal: text('goal'), // CHECK constraint: length 1-280
  githubUsername: varchar('github_username', { length: 100 }),
  twitterUsername: varchar('twitter_username', { length: 100 }),
})
```

**Step 1.4: Create Seed Script** (2 hours)
```typescript
// scripts/seed-programs.ts
import { db } from '@/lib/db'
import { programs } from '@/lib/db/schema'

const initialPrograms = [
  {
    name: 'De Cero a Chamba',
    description: 'Learn web development fundamentals and land your first client',
    programType: 'cohort',
    isActive: true
  },
  // ... DeFi-esta, Open
]

async function seed() {
  await db.insert(programs).values(initialPrograms)
}
```

**Step 1.5: Run Migrations** (1 hour)
```bash
bun run db:migrate
bun run scripts/seed-programs.ts
bun run scripts/verify-migration.ts
```

**Acceptance Criteria**:
- [ ] All 5 tables created successfully
- [ ] applications table extended with 4 new columns
- [ ] 3 programs seeded in database
- [ ] Foreign key constraints working
- [ ] Migration reversible
- [ ] No data loss in existing tables

**Testing**:
```bash
# Verify schema
bun run db:studio # Visual inspection

# Test CRUD operations
bun run scripts/test-crud-operations.ts
```

---

### E3-T2: Onboarding Flow Updates
**Duration**: 4 days | **Priority**: 🔴 Critical | **Depends On**: E3-T1

**Split**: Backend (2 days) + Frontend (2 days) run in parallel after T1 completes

#### E3-T2A: Backend API Updates (2 days)

**Objectives**:
- Extend user update endpoint
- Create applications API
- Create programs read API

**Deliverables**:
```
✅ src/app/api/users/update/route.ts - Extended endpoint
✅ src/app/api/applications/me/route.ts - Get application status
✅ src/app/api/programs/route.ts - List programs
✅ src/app/api/programs/[id]/route.ts - Program details
✅ src/services/applications.ts - Application services
✅ src/services/programs.ts - Program services
✅ src/types/api-v1.ts - Updated type definitions
✅ API tests passing
```

**Implementation Steps**:

**Step 2A.1: Update Type Definitions** (1 hour)
```typescript
// src/types/api-v1.ts
export interface UpdateUserRequest {
  // existing fields...
  programId?: string
  goal?: string
  githubUsername?: string
  twitterUsername?: string
}

export interface ApplicationResponse {
  application: {
    id: string
    userId: string
    programId: string
    goal: string
    githubUsername: string
    twitterUsername: string
    status: 'pending' | 'approved' | 'rejected'
    // ...
  }
  program: Program
}
```

**Step 2A.2: Create Application Services** (3 hours)
```typescript
// src/services/applications.ts
export async function applyToProgram(data: ApplicationData): Promise<Application> {
  return apiFetch<Application>('/api/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
}

export async function getMyApplication(): Promise<ApplicationResponse> {
  return apiFetch<ApplicationResponse>('/api/applications/me')
}
```

**Step 2A.3: Create Programs Services** (2 hours)
```typescript
// src/services/programs.ts
export async function getPrograms(): Promise<Program[]> {
  const response = await apiFetch<ProgramsResponse>('/api/programs')
  return response.programs
}

export async function getProgramDetails(id: string): Promise<ProgramDetailResponse> {
  return apiFetch<ProgramDetailResponse>(`/api/programs/${id}`)
}
```

**Step 2A.4: Extend User Update API** (2 hours)
```typescript
// src/app/api/users/update/route.ts
export async function PATCH(request: Request) {
  const session = await getSession()
  if (!session?.user?.id) {
    return apiErrors.unauthorized()
  }

  const body = await request.json()
  const result = updateUserSchema.safeParse(body)
  if (!result.success) {
    return apiValidationError(result.error)
  }

  const { programId, goal, githubUsername, twitterUsername, ...userData } = result.data

  // Update user
  await db.update(users).set(userData).where(eq(users.id, session.user.id))

  // If program data provided, create/update application
  if (programId) {
    await db.insert(applications).values({
      userId: session.user.id,
      programId,
      goal,
      githubUsername,
      twitterUsername,
      status: 'pending'
    }).onConflictDoUpdate({
      target: applications.userId,
      set: { programId, goal, githubUsername, twitterUsername, updatedAt: new Date() }
    })
  }

  return apiSuccess({ message: 'User updated successfully' })
}
```

**Step 2A.5: Create Programs Read APIs** (3 hours)
```typescript
// src/app/api/programs/route.ts
export async function GET() {
  const programsList = await db
    .select()
    .from(programs)
    .where(eq(programs.isActive, true))
    .orderBy(programs.name)

  return apiSuccess({ programs: programsList })
}

// src/app/api/programs/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const program = await db.query.programs.findFirst({
    where: eq(programs.id, params.id),
    with: {
      programActivities: {
        with: {
          activity: true
        },
        orderBy: programActivities.orderIndex
      }
    }
  })

  if (!program) {
    return apiErrors.notFound('Program')
  }

  const enrollmentCount = await db
    .select({ count: count() })
    .from(programEnrollments)
    .where(eq(programEnrollments.programId, params.id))

  return apiSuccess({
    program,
    activities: program.programActivities.map(pa => pa.activity),
    enrollmentCount: enrollmentCount[0].count
  })
}
```

**Acceptance Criteria**:
- [ ] `/api/users/update` accepts program fields
- [ ] `/api/applications/me` returns application status
- [ ] `/api/programs` returns active programs only
- [ ] `/api/programs/:id` returns program with activities
- [ ] All service functions use `apiFetch` wrapper
- [ ] All endpoints follow API envelope pattern
- [ ] Error handling for missing/invalid data

---

#### E3-T2B: Frontend Onboarding Components (2 days)

**Objectives**:
- Create program selector component
- Create goal commitment component
- Create social accounts form
- Update onboarding form flow

**Deliverables**:
```
✅ src/components/onboarding/program-selector.tsx
✅ src/components/onboarding/goal-commitment.tsx
✅ src/components/onboarding/social-accounts-form.tsx
✅ src/components/onboarding/onboarding-form.tsx - Updated
✅ src/hooks/use-programs.ts - Programs query hook
✅ Component tests passing
```

**Implementation Steps**:

**Step 2B.1: Create Programs Hook** (1 hour)
```typescript
// src/hooks/use-programs.ts
import { useQuery } from '@tanstack/react-query'
import { getPrograms } from '@/services/programs'

export function usePrograms() {
  return useQuery({
    queryKey: ['programs'],
    queryFn: getPrograms,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}
```

**Step 2B.2: Program Selector Component** (3 hours)
```typescript
// src/components/onboarding/program-selector.tsx
interface ProgramSelectorProps {
  selectedProgramId: string | null
  onSelect: (programId: string) => void
  disabled?: boolean
}

export function ProgramSelector({ selectedProgramId, onSelect, disabled }: ProgramSelectorProps) {
  const { data: programs, isLoading, isError } = usePrograms()

  if (isLoading) return <ProgramsSkeleton />
  if (isError) return <ErrorState />

  return (
    <div className="space-y-4">
      {programs?.map(program => (
        <ProgramCard
          key={program.id}
          program={program}
          isSelected={selectedProgramId === program.id}
          onSelect={() => onSelect(program.id)}
          disabled={disabled}
        />
      ))}
    </div>
  )
}
```

**Step 2B.3: Goal Commitment Component** (2 hours)
```typescript
// src/components/onboarding/goal-commitment.tsx
interface GoalCommitmentProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function GoalCommitment({ value, onChange, disabled }: GoalCommitmentProps) {
  const charCount = value.length
  const isValid = charCount >= 1 && charCount <= 280

  return (
    <div className="space-y-2">
      <label>1-Month Goal Commitment</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="What do you want to achieve in 1 month? Be specific and measurable..."
        className="min-h-32"
      />
      <div className="flex justify-between text-sm">
        <span>Character count: {charCount}/280</span>
        {charCount > 280 && (
          <span className="text-destructive">Too long</span>
        )}
      </div>
    </div>
  )
}
```

**Step 2B.4: Social Accounts Form** (2 hours)
```typescript
// src/components/onboarding/social-accounts-form.tsx
interface SocialAccountsFormProps {
  githubUsername: string
  twitterUsername: string
  onGithubChange: (value: string) => void
  onTwitterChange: (value: string) => void
  disabled?: boolean
}

export function SocialAccountsForm({
  githubUsername,
  twitterUsername,
  onGithubChange,
  onTwitterChange,
  disabled
}: SocialAccountsFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label>GitHub Username*</label>
        <input
          type="text"
          value={githubUsername}
          onChange={(e) => onGithubChange(e.target.value)}
          disabled={disabled}
          placeholder="octocat"
          required
        />
      </div>
      <div>
        <label>Twitter Username*</label>
        <input
          type="text"
          value={twitterUsername}
          onChange={(e) => onTwitterChange(e.target.value)}
          disabled={disabled}
          placeholder="handle"
          required
        />
      </div>
    </div>
  )
}
```

**Step 2B.5: Update Onboarding Form** (3 hours)
```typescript
// src/components/onboarding/onboarding-form.tsx
export function OnboardingForm() {
  const [step, setStep] = useState(1) // 1: profile, 2: program, 3: goal, 4: social
  const [formData, setFormData] = useState({
    // profile fields...
    programId: null,
    goal: '',
    githubUsername: '',
    twitterUsername: ''
  })

  const handleSubmit = async () => {
    // Validate all fields
    if (!validateForm(formData)) return

    // Upload avatar if selected
    let avatarUrl = null
    if (selectedAvatarFile) {
      avatarUrl = await uploadAvatar(selectedAvatarFile)
    }

    // Submit everything at once
    await updateUser({
      ...formData,
      avatarUrl
    })

    toast.success('Application submitted! Awaiting review.')
    router.push('/profile')
  }

  return (
    <form>
      {step === 1 && <ProfileFields />}
      {step === 2 && <ProgramSelector />}
      {step === 3 && <GoalCommitment />}
      {step === 4 && <SocialAccountsForm />}
      {/* Navigation buttons */}
    </form>
  )
}
```

**Acceptance Criteria**:
- [ ] Programs load and display in selector
- [ ] Goal textarea validates character count (1-280)
- [ ] Social accounts require valid usernames
- [ ] Form submission creates application with status 'pending'
- [ ] User redirected to profile after submission
- [ ] Loading and error states handled gracefully

---

### E3-T3: Guest Status Implementation
**Duration**: 3 days | **Priority**: 🔴 Critical | **Depends On**: E3-T1, E3-T2A

**Split**: Backend (1.5 days) + Frontend (1.5 days) run in parallel

#### E3-T3A: Backend Status Logic (1.5 days)

**Objectives**:
- Update authentication middleware for guest status
- Add permission guards for guest-restricted features
- Create status transition logic

**Deliverables**:
```
✅ src/lib/auth/permissions.ts - Permission system
✅ src/lib/auth/status-guards.ts - Status validation functions
✅ src/middleware/guest-access.ts - Guest permission middleware
✅ Permission tests passing
```

**Implementation Steps**:

**Step 3A.1: Permission System** (3 hours)
```typescript
// src/lib/auth/permissions.ts
export type AccountStatus = 'incomplete' | 'pending' | 'guest' | 'active'

export interface Permissions {
  canBrowseDirectory: boolean
  canViewActivities: boolean
  canSubmitToActivities: boolean
  canAttendSessions: boolean
  canMarkAttendance: boolean
  canAccessAdmin: boolean
  canVote: boolean
  canRefer: boolean
}

export function getPermissions(status: AccountStatus, role: string): Permissions {
  const base = {
    canBrowseDirectory: false,
    canViewActivities: false,
    canSubmitToActivities: false,
    canAttendSessions: false,
    canMarkAttendance: false,
    canAccessAdmin: false,
    canVote: false,
    canRefer: false,
  }

  switch (status) {
    case 'incomplete':
      return base
    case 'pending':
      return base
    case 'guest':
      return {
        ...base,
        canBrowseDirectory: true,
        canViewActivities: true,
        canSubmitToActivities: true,
        canAttendSessions: true,
      }
    case 'active':
      return {
        ...base,
        canBrowseDirectory: true,
        canViewActivities: true,
        canSubmitToActivities: true,
        canAttendSessions: true,
        canVote: true,
        canRefer: true,
        canMarkAttendance: role === 'admin' || role === 'moderator',
        canAccessAdmin: role === 'admin' || role === 'moderator',
      }
  }
}
```

**Step 3A.2: Status Guards** (2 hours)
```typescript
// src/lib/auth/status-guards.ts
export function requireGuestOrActive(session: Session) {
  const status = session.user.accountStatus
  if (status !== 'guest' && status !== 'active') {
    throw new Error('Guest or Active status required')
  }
}

export function requireActive(session: Session) {
  if (session.user.accountStatus !== 'active') {
    throw new Error('Active member status required')
  }
}
```

**Step 3A.3: Apply Guards to Endpoints** (3 hours)
```typescript
// Example: src/app/api/activities/[id]/submissions/route.ts
export async function POST(request: Request) {
  const session = await getSession()
  requireGuestOrActive(session) // Allow guests to submit

  // Rest of submission logic...
  // Tag submission as guest submission if status === 'guest'
}
```

**Acceptance Criteria**:
- [ ] Permission system correctly maps status to capabilities
- [ ] Guards prevent unauthorized access
- [ ] Guests can access allowed features
- [ ] Guests blocked from restricted features
- [ ] Status transitions validated

---

#### E3-T3B: Frontend Status UI (1.5 days)

**Objectives**:
- Create status badges and banners
- Add permission-based UI rendering
- Implement application status display

**Deliverables**:
```
✅ src/components/profile/application-status-banner.tsx
✅ src/components/common/status-badge.tsx
✅ src/hooks/use-permissions.ts - Permission hook
✅ Updated protected routes with guest support
```

**Implementation Steps**:

**Step 3B.1: Status Badge Component** (1 hour)
```typescript
// src/components/common/status-badge.tsx
interface StatusBadgeProps {
  status: AccountStatus
  size?: 'sm' | 'md' | 'lg'
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = {
    incomplete: { label: 'Incomplete', variant: 'secondary' },
    pending: { label: 'Pending Review', variant: 'warning' },
    guest: { label: 'Club Guest', variant: 'info' },
    active: { label: 'Member', variant: 'success' },
  }

  return <Badge variant={config[status].variant}>{config[status].label}</Badge>
}
```

**Step 3B.2: Application Status Banner** (2 hours)
```typescript
// src/components/profile/application-status-banner.tsx
export function ApplicationStatusBanner() {
  const { data: user } = useMe()
  const { data: application } = useQuery({
    queryKey: ['application', 'me'],
    queryFn: getMyApplication,
    enabled: user?.accountStatus === 'pending' || user?.accountStatus === 'guest'
  })

  if (!user || user.accountStatus === 'active') return null

  return (
    <Alert variant={user.accountStatus === 'pending' ? 'warning' : 'info'}>
      {user.accountStatus === 'pending' && (
        <>
          <AlertTitle>Application Under Review</AlertTitle>
          <AlertDescription>
            Your application is being reviewed by our team. You'll be notified once approved!
          </AlertDescription>
        </>
      )}
      {user.accountStatus === 'guest' && (
        <>
          <AlertTitle>Welcome, Club Guest!</AlertTitle>
          <AlertDescription>
            You have limited access to the platform. Build your participation history to become a full member.
          </AlertDescription>
        </>
      )}
    </Alert>
  )
}
```

**Step 3B.3: Permissions Hook** (1 hour)
```typescript
// src/hooks/use-permissions.ts
export function usePermissions() {
  const { data: user } = useMe()

  if (!user) return null

  return getPermissions(user.accountStatus, user.role)
}

// Usage in components
export function FeatureButton() {
  const permissions = usePermissions()

  if (!permissions?.canVote) return null

  return <Button>Vote</Button>
}
```

**Acceptance Criteria**:
- [ ] Status badges display correct labels and colors
- [ ] Application status banner shows for pending/guest users
- [ ] Permission-based UI rendering works correctly
- [ ] Guests see limited feature access
- [ ] Members see full feature access

---

## 📋 Phase 2: Admin Features (Days 11-15)

**Goal**: Build admin tools for application review, attendance management, and program CRUD

**Team Split**:
- **Backend Lead**: Admin APIs (T4-backend, T5-backend, T8-backend)
- **Frontend Lead**: Admin UI components (T4-frontend, T5-frontend, T8-frontend)
- **Full-Stack**: Integration and testing

### E3-T4: Admin Applications Queue
**Duration**: 2.5 days | **Priority**: 🟡 High | **Depends On**: E3-T3

#### E3-T4A: Backend Admin APIs (1 day)

**Deliverables**:
```
✅ src/app/api/admin/applications/route.ts - List applications
✅ src/app/api/admin/applications/[id]/route.ts - Review application
✅ src/app/api/admin/users/[id]/promote/route.ts - Promote guest
✅ src/services/admin/applications.ts - Admin services
```

**Implementation Steps**:

**Step 4A.1: List Applications API** (2 hours)
```typescript
// src/app/api/admin/applications/route.ts
export async function GET(request: Request) {
  const session = await getSession()
  requireAdmin(session)

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') // 'pending' | 'approved' | 'rejected'
  const programId = searchParams.get('programId')

  const query = db.query.applications.findMany({
    where: and(
      status ? eq(applications.status, status) : undefined,
      programId ? eq(applications.programId, programId) : undefined
    ),
    with: {
      user: true,
      program: true
    },
    orderBy: desc(applications.createdAt)
  })

  return apiSuccess({ applications: await query })
}
```

**Step 4A.2: Review Application API** (3 hours)
```typescript
// src/app/api/admin/applications/[id]/route.ts
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  requireAdmin(session)

  const body = await request.json()
  const { status, feedback } = reviewApplicationSchema.parse(body)

  await db.transaction(async (tx) => {
    // Update application
    await tx.update(applications)
      .set({
        status: status === 'approved_guest' || status === 'approved_member' ? 'approved' : 'rejected',
        feedback,
        reviewedBy: session.user.id,
        reviewedAt: new Date()
      })
      .where(eq(applications.id, params.id))

    // Get application details
    const app = await tx.query.applications.findFirst({
      where: eq(applications.id, params.id)
    })

    if (status === 'approved_guest') {
      // Update user status to guest
      await tx.update(users)
        .set({ accountStatus: 'guest' })
        .where(eq(users.id, app.userId))

      // Create enrollment
      await tx.insert(programEnrollments).values({
        userId: app.userId,
        programId: app.programId,
        applicationId: app.id,
        enrollmentStatus: 'guest'
      })
    } else if (status === 'approved_member') {
      // Update user status to active
      await tx.update(users)
        .set({ accountStatus: 'active' })
        .where(eq(users.id, app.userId))

      // Create enrollment
      await tx.insert(programEnrollments).values({
        userId: app.userId,
        programId: app.programId,
        applicationId: app.id,
        enrollmentStatus: 'active'
      })
    }
  })

  return apiSuccess({ message: 'Application reviewed successfully' })
}
```

**Step 4A.3: Promote Guest API** (2 hours)
```typescript
// src/app/api/admin/users/[id]/promote/route.ts
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  requireAdmin(session)

  const { notes } = await request.json()

  await db.transaction(async (tx) => {
    // Update user status
    await tx.update(users)
      .set({ accountStatus: 'active' })
      .where(eq(users.id, params.id))

    // Update enrollment status
    await tx.update(programEnrollments)
      .set({
        enrollmentStatus: 'active',
        promotedAt: new Date(),
        metadata: { ...metadata, promotionNotes: notes }
      })
      .where(eq(programEnrollments.userId, params.id))
  })

  return apiSuccess({ message: 'User promoted to member successfully' })
}
```

**Acceptance Criteria**:
- [ ] Admin can list applications with filters
- [ ] Admin can approve as guest or member
- [ ] Admin can reject with feedback
- [ ] Admin can promote guest to member
- [ ] Status transitions create correct database records
- [ ] Transactions ensure data consistency

---

#### E3-T4B: Frontend Admin UI (1.5 days)

**Deliverables**:
```
✅ src/app/admin/applications/page.tsx - Applications queue page
✅ src/components/admin/applications-queue.tsx - Queue component
✅ src/components/admin/application-review-modal.tsx - Review modal
✅ src/hooks/use-admin-applications.ts - Admin query hooks
```

**Implementation Steps**:

**Step 4B.1: Admin Applications Hook** (1 hour)
```typescript
// src/hooks/use-admin-applications.ts
export function useAdminApplications(filters?: ApplicationFilters) {
  return useQuery({
    queryKey: ['admin', 'applications', filters],
    queryFn: () => getAdminApplications(filters),
  })
}

export function useReviewApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: reviewApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] })
      toast.success('Application reviewed successfully')
    },
    onError: (error: ApiError) => {
      toast.error(error.message)
    }
  })
}
```

**Step 4B.2: Applications Queue Component** (4 hours)
```typescript
// src/components/admin/applications-queue.tsx
export function ApplicationsQueue() {
  const [filters, setFilters] = useState({ status: 'pending' })
  const { data, isLoading } = useAdminApplications(filters)

  return (
    <div className="space-y-4">
      <ApplicationFilters filters={filters} onChange={setFilters} />

      {isLoading ? (
        <ApplicationsSkeleton />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Goal</TableHead>
              <TableHead>Social Accounts</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.applications.map(app => (
              <ApplicationRow key={app.id} application={app} />
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
```

**Step 4B.3: Review Modal** (4 hours)
```typescript
// src/components/admin/application-review-modal.tsx
export function ApplicationReviewModal({ application, onClose }: Props) {
  const reviewMutation = useReviewApplication()

  const handleApprove = (asStatus: 'guest' | 'member') => {
    reviewMutation.mutate({
      id: application.id,
      status: asStatus === 'guest' ? 'approved_guest' : 'approved_member'
    })
  }

  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review Application</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <UserProfilePreview user={application.user} />

          <div>
            <h4>Program</h4>
            <p>{application.program.name}</p>
          </div>

          <div>
            <h4>Goal Commitment</h4>
            <p>{application.goal}</p>
          </div>

          <div>
            <h4>Social Accounts</h4>
            <div className="flex gap-2">
              <a href={`https://github.com/${application.githubUsername}`}>
                GitHub: @{application.githubUsername}
              </a>
              <a href={`https://twitter.com/${application.twitterUsername}`}>
                Twitter: @{application.twitterUsername}
              </a>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={() => handleReject()}>
            Reject
          </Button>
          <Button onClick={() => handleApprove('guest')}>
            Approve as Guest
          </Button>
          <Button variant="default" onClick={() => handleApprove('member')}>
            Approve as Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

**Acceptance Criteria**:
- [ ] Admin can view pending applications
- [ ] Admin can filter by status and program
- [ ] Admin can review application details
- [ ] Admin can approve as guest or member
- [ ] Admin can reject with feedback
- [ ] Real-time updates after review actions

---

### E3-T5: Admin Attendance Management
**Duration**: 2 days | **Priority**: 🟡 High | **Depends On**: E3-T1

**Split**: Backend (1 day) + Frontend (1 day) run in parallel

#### E3-T5A: Backend Attendance APIs (1 day)

**Deliverables**:
```
✅ src/app/api/admin/attendance/route.ts - Mark attendance
✅ src/app/api/users/[id]/attendance/route.ts - Get attendance history
✅ src/services/admin/attendance.ts - Attendance services
```

**Implementation Steps**:

**Step 5A.1: Mark Attendance API** (3 hours)
```typescript
// src/app/api/admin/attendance/route.ts
export async function POST(request: Request) {
  const session = await getSession()
  requireAdmin(session)

  const body = await request.json()
  const { userId, activityId, programId, status, notes } = markAttendanceSchema.parse(body)

  const record = await db.insert(attendanceRecords).values({
    userId,
    activityId,
    programId,
    attendanceStatus: status,
    markedBy: session.user.id,
    notes
  }).returning()

  return apiSuccess({ attendance: record[0] })
}
```

**Step 5A.2: Get Attendance API** (2 hours)
```typescript
// src/app/api/users/[id]/attendance/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const attendanceList = await db.query.attendanceRecords.findMany({
    where: eq(attendanceRecords.userId, params.id),
    with: {
      activity: true,
      program: true,
      markedByUser: true
    },
    orderBy: desc(attendanceRecords.markedAt)
  })

  // Calculate stats
  const stats = {
    totalSessions: attendanceList.length,
    present: attendanceList.filter(a => a.attendanceStatus === 'present').length,
    absent: attendanceList.filter(a => a.attendanceStatus === 'absent').length,
    attendanceRate: 0
  }
  stats.attendanceRate = stats.totalSessions > 0
    ? (stats.present / stats.totalSessions) * 100
    : 0

  return apiSuccess({ attendance: attendanceList, stats })
}
```

**Acceptance Criteria**:
- [ ] Admin can mark attendance for users
- [ ] Attendance records created with correct data
- [ ] Users can view their attendance history
- [ ] Attendance statistics calculated correctly

---

#### E3-T5B: Frontend Attendance UI (1 day)

**Deliverables**:
```
✅ src/components/admin/attendance-marker.tsx - Mark attendance component
✅ src/components/programs/attendance-history.tsx - User attendance view
```

**Implementation Steps**:

**Step 5B.1: Attendance Marker** (4 hours)
```typescript
// src/components/admin/attendance-marker.tsx
export function AttendanceMarker({ activityId, programId }: Props) {
  const { data: enrollments } = useQuery({
    queryKey: ['program', programId, 'enrollments'],
    queryFn: () => getProgramEnrollments(programId)
  })

  const markMutation = useMutation({
    mutationFn: markAttendance,
    onSuccess: () => toast.success('Attendance marked')
  })

  return (
    <div>
      <h3>Mark Attendance for Session</h3>
      <Table>
        <TableBody>
          {enrollments?.map(enrollment => (
            <TableRow key={enrollment.userId}>
              <TableCell>{enrollment.user.displayName}</TableCell>
              <TableCell>
                <Select
                  onValueChange={(status) =>
                    markMutation.mutate({
                      userId: enrollment.userId,
                      activityId,
                      programId,
                      status
                    })
                  }
                >
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="excused">Excused</SelectItem>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```

**Acceptance Criteria**:
- [ ] Admin can mark attendance for activity participants
- [ ] Bulk marking supported
- [ ] Notes can be added per user
- [ ] Real-time feedback on marking

---

### E3-T8: Admin Program CRUD
**Duration**: 3 days | **Priority**: 🟡 High | **Depends On**: E3-T1

**Split**: Backend (1.5 days) + Frontend (1.5 days) run in parallel

#### E3-T8A: Backend Program APIs (1.5 days)

**Deliverables**:
```
✅ src/app/api/admin/programs/route.ts - Create program
✅ src/app/api/admin/programs/[id]/route.ts - Update/delete program
✅ src/app/api/admin/programs/[id]/activities/route.ts - Link activities
✅ src/services/admin/programs.ts - Program admin services
```

**Implementation Steps**:

**Step 8A.1: Create Program API** (2 hours)
```typescript
// src/app/api/admin/programs/route.ts
export async function POST(request: Request) {
  const session = await getSession()
  requireAdmin(session)

  const body = await request.json()
  const data = createProgramSchema.parse(body)

  const program = await db.insert(programs).values(data).returning()

  return apiSuccess({ program: program[0] }, { message: 'Program created successfully' })
}
```

**Step 8A.2: Update/Delete Program APIs** (3 hours)
```typescript
// src/app/api/admin/programs/[id]/route.ts
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  requireAdmin(session)

  const body = await request.json()
  const data = updateProgramSchema.parse(body)

  const program = await db.update(programs)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(programs.id, params.id))
    .returning()

  return apiSuccess({ program: program[0] })
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  requireAdmin(session)

  // Check for enrollments
  const enrollmentCount = await db
    .select({ count: count() })
    .from(programEnrollments)
    .where(eq(programEnrollments.programId, params.id))

  if (enrollmentCount[0].count > 0) {
    // Soft delete
    await db.update(programs)
      .set({ isActive: false })
      .where(eq(programs.id, params.id))

    return apiSuccess({ message: 'Program deactivated (has enrollments)' })
  } else {
    // Hard delete
    await db.delete(programs).where(eq(programs.id, params.id))

    return apiSuccess({ message: 'Program deleted successfully' })
  }
}
```

**Step 8A.3: Link Activities APIs** (3 hours)
```typescript
// src/app/api/admin/programs/[id]/activities/route.ts
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  requireAdmin(session)

  const body = await request.json()
  const { activityId, isRequired, orderIndex } = linkActivitySchema.parse(body)

  const link = await db.insert(programActivities).values({
    programId: params.id,
    activityId,
    isRequired,
    orderIndex
  }).returning()

  return apiSuccess({ programActivity: link[0] })
}

// PATCH and DELETE for updating/unlinking activities
```

**Acceptance Criteria**:
- [ ] Admin can create programs with validation
- [ ] Admin can update program details
- [ ] Admin can delete programs (soft/hard logic)
- [ ] Admin can link/unlink activities
- [ ] Admin can reorder activities

---

#### E3-T8B: Frontend Program Management UI (1.5 days)

**Deliverables**:
```
✅ src/app/admin/programs/page.tsx - Programs list page
✅ src/app/admin/programs/new/page.tsx - Create program page
✅ src/app/admin/programs/[id]/edit/page.tsx - Edit program page
✅ src/components/admin/programs-list.tsx - Programs table
✅ src/components/admin/program-form.tsx - Create/edit form
✅ src/components/admin/program-activities-manager.tsx - Activity linking
```

**Implementation Steps**:

**Step 8B.1: Programs List** (2 hours)
```typescript
// src/components/admin/programs-list.tsx
export function ProgramsList() {
  const { data: programs, isLoading } = useQuery({
    queryKey: ['admin', 'programs'],
    queryFn: () => getAllPrograms(true) // include inactive
  })

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Enrollments</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {programs?.map(program => (
          <ProgramRow key={program.id} program={program} />
        ))}
      </TableBody>
    </Table>
  )
}
```

**Step 8B.2: Program Form** (3 hours)
```typescript
// src/components/admin/program-form.tsx
export function ProgramForm({ initialData, mode }: Props) {
  const [formData, setFormData] = useState(initialData || defaultValues)

  const mutation = useMutation({
    mutationFn: mode === 'create' ? createProgram : updateProgram,
    onSuccess: () => {
      toast.success(`Program ${mode === 'create' ? 'created' : 'updated'} successfully`)
      router.push('/admin/programs')
    }
  })

  return (
    <form onSubmit={handleSubmit}>
      <Input label="Name" value={formData.name} onChange={...} required />
      <Textarea label="Description" value={formData.description} onChange={...} required />
      <Select label="Type" value={formData.programType} onChange={...} required>
        <option value="cohort">Cohort</option>
        <option value="evergreen">Evergreen</option>
      </Select>

      {formData.programType === 'cohort' && (
        <>
          <DatePicker label="Start Date" value={formData.startDate} onChange={...} required />
          <DatePicker label="End Date" value={formData.endDate} onChange={...} required />
        </>
      )}

      <Switch label="Active" checked={formData.isActive} onChange={...} />

      <Button type="submit" disabled={mutation.isPending}>
        {mode === 'create' ? 'Create Program' : 'Update Program'}
      </Button>
    </form>
  )
}
```

**Step 8B.3: Activities Manager** (3 hours)
```typescript
// src/components/admin/program-activities-manager.tsx
export function ProgramActivitiesManager({ programId }: Props) {
  const { data: programActivities } = useQuery({
    queryKey: ['program', programId, 'activities'],
    queryFn: () => getProgramActivities(programId)
  })

  const { data: allActivities } = useQuery({
    queryKey: ['activities'],
    queryFn: getActivities
  })

  const linkMutation = useMutation({
    mutationFn: linkActivityToProgram,
    onSuccess: () => toast.success('Activity linked to program')
  })

  return (
    <div className="space-y-4">
      <div>
        <h3>Linked Activities</h3>
        <DndContext onDragEnd={handleDragEnd}>
          <SortableContext items={programActivities}>
            {programActivities?.map(pa => (
              <ActivityCard key={pa.id} programActivity={pa} />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div>
        <h3>Available Activities</h3>
        <Input placeholder="Search activities..." />
        {availableActivities?.map(activity => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onLink={() => linkMutation.mutate({ programId, activityId: activity.id })}
          />
        ))}
      </div>
    </div>
  )
}
```

**Acceptance Criteria**:
- [ ] Admin can view all programs
- [ ] Admin can create new programs
- [ ] Admin can edit program details
- [ ] Admin can delete/deactivate programs
- [ ] Admin can link activities with drag-and-drop
- [ ] Admin can mark activities required/optional

---

## 📋 Phase 3: User Experience & Testing (Days 16-20)

**Goal**: Build user-facing program dashboard, comprehensive testing, and documentation

### E3-T6: Program Dashboard
**Duration**: 2.5 days | **Priority**: 🟢 Medium | **Depends On**: E3-T2, E3-T5

**Split**: Frontend-focused with some backend enhancements

**Deliverables**:
```
✅ src/app/programs/[id]/page.tsx - Program dashboard page
✅ src/components/programs/program-dashboard.tsx - Dashboard layout
✅ src/components/programs/program-header.tsx - Program info header
✅ src/components/programs/progress-tracker.tsx - Progress visualization
✅ src/components/programs/attendance-history.tsx - Attendance display
✅ src/components/programs/program-activities-list.tsx - Activities list
```

**Implementation Steps**:

**Step 6.1: Program Dashboard Layout** (4 hours)
```typescript
// src/components/programs/program-dashboard.tsx
export function ProgramDashboard({ programId }: Props) {
  const { data: program } = useProgramDetails(programId)
  const { data: enrollment } = useMyEnrollment(programId)
  const { data: attendance } = useMyAttendance()

  return (
    <div className="space-y-6">
      <ProgramHeader program={program} enrollment={enrollment} />
      <ProgressTracker
        activities={program.activities}
        attendance={attendance.records}
        submissions={enrollment.submissions}
      />
      <div className="grid grid-cols-2 gap-6">
        <ProgramActivitiesList activities={program.activities} />
        <AttendanceHistory attendance={attendance} />
      </div>
    </div>
  )
}
```

**Step 6.2: Progress Tracker** (3 hours)
```typescript
// src/components/programs/progress-tracker.tsx
export function ProgressTracker({ activities, attendance, submissions }: Props) {
  const requiredActivities = activities.filter(a => a.isRequired)
  const completedRequired = requiredActivities.filter(a =>
    submissions.some(s => s.activityId === a.id && s.status === 'approved')
  )

  const progress = (completedRequired.length / requiredActivities.length) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle>Program Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={progress} />
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <Stat label="Activities Completed" value={`${completedRequired.length}/${requiredActivities.length}`} />
          <Stat label="Attendance Rate" value={`${attendance.stats.attendanceRate.toFixed(0)}%`} />
          <Stat label="Overall Progress" value={`${progress.toFixed(0)}%`} />
        </div>
      </CardContent>
    </Card>
  )
}
```

**Acceptance Criteria**:
- [ ] Users see program dashboard after enrollment
- [ ] Dashboard displays program details and dates
- [ ] Progress tracker shows completion percentage
- [ ] Attendance history displayed with stats
- [ ] Program activities listed with completion status

---

### E3-T7: Testing & Documentation
**Duration**: 3 days | **Priority**: 🔴 Critical | **Depends On**: All previous tasks

**Deliverables**:
```
✅ Unit tests for all services
✅ Integration tests for API endpoints
✅ E2E tests for critical user flows
✅ Updated CLAUDE.md
✅ Feature documentation
✅ Admin guides
✅ User guides
```

**Implementation Steps**:

**Step 7.1: Unit Tests** (1 day)
- Service layer tests
- Component tests
- Permission system tests
- Utility function tests

**Step 7.2: Integration Tests** (1 day)
- API endpoint tests
- Database operation tests
- Status transition tests
- Application review flow tests

**Step 7.3: E2E Tests** (0.5 day)
- Complete onboarding flow
- Application review flow
- Guest to member promotion
- Program CRUD flows

**Step 7.4: Documentation** (0.5 day)
- Update CLAUDE.md
- Create feature documentation
- Write admin guides
- Write user guides

**Acceptance Criteria**:
- [ ] All unit tests passing (>80% coverage)
- [ ] All integration tests passing
- [ ] All E2E tests passing
- [ ] CLAUDE.md updated
- [ ] Feature documentation complete
- [ ] Admin guides complete
- [ ] User guides complete

---

## 🔀 Parallel Execution Strategy

### Week 1-2 (Foundation)
```
Day 1-2:   E3-T1 (Database) → BLOCKING
Day 3-4:   E3-T2A (Backend APIs) || E3-T2B (Frontend Components)
Day 5-7:   E3-T3A (Backend Status) || E3-T3B (Frontend Status UI)
Day 8-10:  Integration testing and fixes
```

### Week 3 (Admin Features)
```
Day 11-12: E3-T4A (Admin APIs) || E3-T4B (Admin UI)
Day 13-14: E3-T5A (Attendance APIs) || E3-T5B (Attendance UI)
Day 15:    E3-T8A (Program APIs) || E3-T8B (Program UI) [Start]
```

### Week 4 (UX & Testing)
```
Day 16-17: E3-T8B (Program UI completion) + E3-T6 (Dashboard)
Day 18-20: E3-T7 (Testing & Documentation)
```

## 🎯 Quality Gates

### Gate 1: End of Phase 1
- [ ] All database migrations successful
- [ ] Onboarding flow complete and tested
- [ ] Guest status permissions working
- [ ] No blocking bugs

### Gate 2: End of Phase 2
- [ ] Admin can review applications
- [ ] Admin can mark attendance
- [ ] Admin can manage programs
- [ ] Status transitions working correctly

### Gate 3: End of Phase 3
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Feature ready for staging deployment
- [ ] No critical or high-priority bugs

## 📊 Progress Tracking

Use TodoWrite tool to track:
- Daily progress on active tickets
- Blockers and dependencies
- Testing completion
- Documentation status

## 🚀 Deployment Strategy

### Staging Deployment (Day 18)
1. Run all migrations in staging
2. Seed programs in staging
3. Test end-to-end flows
4. Admin team testing

### Production Rollout (Day 21+)
1. Feature flag: `program_management_enabled`
2. Enable for internal team first
3. Monitor error logs and metrics
4. Gradually enable for all users
5. Announce to community

---

**Last Updated**: 2026-01-06
**Status**: Ready for Implementation
**Next Step**: Create individual ticket files with this workflow
