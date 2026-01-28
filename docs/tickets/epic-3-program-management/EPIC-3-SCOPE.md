# EPIC-3: Program Management System - MVP Scope

> **Status**: 🎯 Planning
> **Priority**: 🔴 Critical
> **Target Release**: MVP v1.0
> **Epic Lead**: TBD

## 📋 Executive Summary

Transform Frutero's onboarding into a **program-based application system** where users apply to specific learning programs (De Cero a Chamba, DeFi-esta, Open), commit to measurable 1-month goals, and earn "Club Guest" status while awaiting approval. This system enables cohort-based learning with attendance tracking, progress monitoring, and admin-reviewed applications.

**Core Value Proposition**: Structure learning pathways while maintaining platform accessibility through Club Guest status.

## 🎯 MVP Goals

### Primary Objectives
1. **Application-Based Onboarding**: Replace direct signup with application review process
2. **Program Selection**: Enable users to choose learning programs during onboarding
3. **Goal Commitment**: Capture measurable 1-month goals (1-280 characters)
4. **Club Guest Status**: Allow platform access before formal approval
5. **Social Verification**: Require GitHub and Twitter account linking

### Success Metrics
- [ ] 100% of new signups go through application flow
- [ ] Users can browse directory and submit to activities as Club Guests
- [ ] Admins can review and approve/reject applications
- [ ] Users can track attendance and progress in their chosen program

## 🚫 Out of Scope for MVP

**Explicitly Deferred to Phase 2:**
- ❌ POAP integration for attendance tracking
- ❌ LinkedIn/Telegram social account linking
- ❌ Program switching after enrollment
- ❌ Advanced program analytics and dashboards
- ❌ Automated approval workflows
- ❌ Program completion certificates
- ❌ Multi-program participation (except Open program)
- ❌ Program prerequisites enforcement
- ❌ Self-serve program attendance marking
- ❌ Program max participant limits

**Why Deferred**: These features add complexity without blocking core MVP value delivery. We can validate the application system and program structure first, then enhance with automation and advanced features.

## 🏗️ Architecture Overview

### Database Schema Changes

#### 1. Extend `applications` Table
```sql
-- New columns for applications table
ALTER TABLE applications ADD COLUMN program_id UUID REFERENCES programs(id);
ALTER TABLE applications ADD COLUMN goal TEXT CHECK (char_length(goal) BETWEEN 1 AND 280);
ALTER TABLE applications ADD COLUMN github_username VARCHAR(100);
ALTER TABLE applications ADD COLUMN twitter_username VARCHAR(100);
```

#### 2. New `programs` Table
```sql
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  program_type VARCHAR(50) NOT NULL, -- 'cohort' | 'evergreen'
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Initial programs
INSERT INTO programs (name, description, program_type, is_active) VALUES
  ('De Cero a Chamba', 'Learn web development fundamentals and land your first client', 'cohort', true),
  ('DeFi-esta', 'Master DeFi protocols and build decentralized applications', 'cohort', true),
  ('Open', 'Self-directed learning with community support', 'evergreen', true);
```

#### 3. New `program_activities` Table (Junction)
```sql
CREATE TABLE program_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT false,
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(program_id, activity_id)
);
```

#### 4. New `program_enrollments` Table
```sql
CREATE TABLE program_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  application_id UUID REFERENCES applications(id),
  enrollment_status VARCHAR(50) DEFAULT 'guest', -- 'guest' | 'active' | 'completed' | 'dropped'
  enrolled_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  promoted_at TIMESTAMP, -- When guest was promoted to active member
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id, program_id) -- One enrollment per user per program
);
```

#### 5. New `attendance_records` Table
```sql
CREATE TABLE attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  marked_by UUID NOT NULL REFERENCES users(id), -- Admin/moderator who marked
  attendance_status VARCHAR(50) NOT NULL, -- 'present' | 'absent' | 'excused'
  notes TEXT,
  marked_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id, activity_id) -- One attendance record per user per activity
);
```

### Account Status Flow

```
┌─────────────────┐
│  Privy Login    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  incomplete     │ ← User authenticated, profile not set
└────────┬────────┘
         │
         ↓ (complete onboarding + apply)
┌─────────────────┐
│  pending        │ ← Application submitted, awaiting review
└────────┬────────┘
         │
         ↓ (admin approval to guest)
┌─────────────────┐
│  guest          │ ← Club Guest, limited platform access
└────────┬────────┘
         │
         ↓ (progress-based promotion)
┌─────────────────┐
│  active         │ ← Full Member, proven through participation
└─────────────────┘
```

**Status Capabilities:**

**Pending** (`accountStatus: 'pending'`):
- ✅ Application submitted
- ❌ No platform access (wait for admin review)
- ⏳ Awaiting admin approval to Guest status

**Guest** (`accountStatus: 'guest'`):
- ✅ Browse talent directory
- ✅ View activities
- ✅ Submit to activities (marked as guest submissions)
- ✅ Participate in bounties
- ✅ Attend program sessions
- ✅ Build progress history (attendance + submissions)
- ❌ Cannot mark attendance (admin only)
- ❌ Cannot access admin features
- ❌ No voting rights (future features)

**Active/Member** (`accountStatus: 'active'`):
- ✅ All Guest capabilities
- ✅ Full member benefits
- ✅ Voting rights (future)
- ✅ Can refer others
- ✅ Priority for opportunities
- ✅ Alumni network access (future)

**Promotion Path**: Guest → Member based on:
- Consistent attendance (admin-tracked)
- Quality submissions to activities
- Community engagement
- Goal progress demonstration
- Admin review of participation history

## 👥 User Stories

### Program Management (Admin)

**Epic Story**: As an admin, I want to manage programs so that users have clear learning pathways to choose from and participate in.

**US-1: Create Program**
- **As an** admin
- **I want to** create a new program with name, description, type, and dates
- **So that** users can see it during onboarding and enroll

**Acceptance Criteria:**
- [ ] Admin can access program creation form at `/admin/programs/new`
- [ ] Form validates required fields (name, description, type)
- [ ] Cohort programs require start/end dates
- [ ] Evergreen programs have optional dates
- [ ] Program appears in user program selection immediately after creation
- [ ] Success toast confirmation after creation

**US-2: Edit Program**
- **As an** admin
- **I want to** update program details (name, description, dates, active status)
- **So that** users always see accurate and current information

**Acceptance Criteria:**
- [ ] Admin can edit any program from programs list
- [ ] Changes are reflected immediately for users
- [ ] Editing program does not affect existing enrollments
- [ ] Can mark program as inactive to hide from new applications
- [ ] Inactive programs still visible to enrolled users

**US-3: Delete Program**
- **As an** admin
- **I want to** delete programs that are no longer relevant
- **So that** the program list stays clean and manageable

**Acceptance Criteria:**
- [ ] Admin can delete programs without enrollments (hard delete)
- [ ] Programs with enrollments can only be deactivated (soft delete)
- [ ] Confirmation modal before deletion
- [ ] Deleting program removes program_activities relationships
- [ ] Deletion does not affect historical data

**US-4: Link Activities to Program**
- **As an** admin
- **I want to** associate activities with a program
- **So that** users see program-specific activities in their dashboard

**Acceptance Criteria:**
- [ ] Admin can link existing activities to programs
- [ ] Can mark activities as required or optional
- [ ] Can set display order for activities
- [ ] Same activity can belong to multiple programs
- [ ] Unlinking activity does not delete the activity itself

**US-5: Manage Program Activities**
- **As an** admin
- **I want to** update or remove activity relationships
- **So that** program curricula stay current and relevant

**Acceptance Criteria:**
- [ ] Admin can change required/optional status
- [ ] Admin can reorder activities within program
- [ ] Admin can unlink activities from program
- [ ] Changes visible immediately in program dashboard

### Program Discovery (User)

**US-6: Browse Programs**
- **As a** user during onboarding
- **I want to** see all available programs with descriptions
- **So that** I can choose the learning path that fits my goals

**Acceptance Criteria:**
- [ ] User sees program selector during onboarding
- [ ] All active programs displayed with descriptions
- [ ] Program type (cohort/evergreen) clearly indicated
- [ ] Cohort programs show start/end dates
- [ ] Can select one program to apply to

**US-7: View Program Details**
- **As a** user
- **I want to** view detailed information about a program
- **So that** I can understand what I'll learn and decide if it's right for me

**Acceptance Criteria:**
- [ ] User can click program to see full details
- [ ] Details include: description, type, dates, activities list
- [ ] Shows enrollment count (optional)
- [ ] Shows whether activities are required or optional
- [ ] Clear call-to-action to apply or enroll

## 📐 User Journeys

### Journey 1: New User Application (Happy Path)

```
1. [User] Connect wallet via Privy
   → accountStatus: 'incomplete'

2. [User] Complete profile fields
   - Email (from Privy)
   - Username
   - Display Name
   - Bio
   - Avatar

3. [User] Choose Program
   - "De Cero a Chamba" | "DeFi-esta" | "Open"
   - View program description and duration

4. [User] Set Goal (1-280 chars)
   - Free-form text
   - Example: "Build and deploy a portfolio website with 3 client projects,
     demonstrating HTML/CSS/JS skills and freelance readiness"

5. [User] Link Social Accounts
   - GitHub username (required)
   - Twitter username (required)

6. [User] Submit Application
   → accountStatus: 'pending'
   → User redirected to /profile with "Application Under Review" banner

7. [Admin] Review Application (Initial Screening)
   - View goal, social accounts, profile
   - Option 1: Approve as Guest
   - Option 2: Approve as Member (for users with prior participation history)
   - Option 3: Reject with feedback

8. [User] Approved as Guest
   → accountStatus: 'guest'
   → program_enrollments record created with status 'guest'
   → Welcome email sent

9. [User] Platform Access as Club Guest
   - Browse directory
   - View activities
   - Submit to bounties
   - Attend program sessions
   - Build participation history

10. [User] Participate and Build Progress
    - Attend sessions (admin marks attendance)
    - Complete activities and submit deliverables
    - Engage with community
    - Work toward goal

11. [Admin] Review Guest Progress (Periodic)
    - Review attendance record
    - Review submission quality
    - Assess goal progress
    - Promote to Member when ready

12. [User] Promoted to Member
    → accountStatus: 'active'
    → program_enrollments updated to status 'active'
    → Full member benefits unlocked
```

### Journey 2: Fast-Track to Member (Existing Participants)

```
1-6. [User] Same as Journey 1 (Login → Profile → Apply)

7. [Admin] Review Application with History
   - Recognize user from previous programs/activities
   - Review prior attendance records
   - Review prior submission quality
   - Assess demonstrated progress

8. [Admin] Approve Directly as Member
   → accountStatus: 'active' (skip Guest status)
   → program_enrollments record created with status 'active'
   → Welcome back email sent

9. [User] Full Member Access Immediately
   - All platform features unlocked
   - No Guest period required
   - Immediate program participation
```

### Journey 3: Application Rejection & Re-application

```
1. [Admin] Reject Application
   - Provide feedback: "Goal needs to be more specific and measurable"
   - accountStatus remains 'pending'

2. [User] Receives Rejection Notification
   - View admin feedback
   - Option to "Edit Application"

3. [User] Revise Application
   - Update goal text
   - Re-submit for review

4. [Admin] Re-review Application
   - Approve revised submission as Guest
   → User flow continues from Journey 1, step 8
```

### Journey 4: Guest Promotion to Member

```
1. [Guest User] Consistent Participation
   - Attends 4+ sessions in program
   - Submits 3+ quality deliverables
   - Demonstrates progress toward goal
   - Engages with community

2. [Admin] Periodic Progress Review
   - Review Guest's attendance record (>75% attendance rate)
   - Assess submission quality
   - Check goal progress and updates
   - Evaluate community contributions

3. [Admin] Promote to Member
   - Update accountStatus: 'guest' → 'active'
   - Update program_enrollments.status: 'guest' → 'active'
   - Notify user of promotion
   - Unlock full member benefits

4. [Member] Full Platform Access
   - Referral privileges
   - Priority for opportunities
   - Member-only features (future)
```

### Journey 5: Program Participation (All Statuses)

```
1. [User] View Program Dashboard
   - Program details
   - Upcoming sessions
   - Activities list
   - Progress tracker

2. [User] Attend Session
   - Join session (online or in-person)

3. [Admin] Mark Attendance
   - View session attendance list
   - Mark user as 'present' | 'absent'
   - Add notes if needed

4. [User] Complete Activity
   - Submit deliverable
   - Link to activity in program

5. [User] Track Progress
   - View attendance history
   - View completed activities
   - Monitor goal progress
```

## 🔧 Technical Implementation

### API Endpoints

#### Applications API

**`PATCH /api/users/update`** (Extend Existing)
```typescript
// Add new fields to existing endpoint
interface UpdateUserRequest {
  // Existing fields
  email?: string
  username?: string
  displayName?: string
  bio?: string
  avatarUrl?: string | null

  // New fields for MVP
  programId?: string // UUID of selected program
  goal?: string // 1-280 characters
  githubUsername?: string
  twitterUsername?: string
}
```

**`GET /api/applications/me`**
```typescript
// Get current user's application status
interface ApplicationResponse {
  application: {
    id: string
    userId: string
    programId: string
    goal: string
    githubUsername: string
    twitterUsername: string
    status: 'pending' | 'approved' | 'rejected'
    reviewedBy: string | null
    reviewedAt: string | null
    feedback: string | null
    createdAt: string
  }
  program: {
    id: string
    name: string
    description: string
    programType: 'cohort' | 'evergreen'
  }
}
```

**`PATCH /api/admin/applications/:id`** (New - Admin Only)
```typescript
interface ReviewApplicationRequest {
  status: 'approved_guest' | 'approved_member' | 'rejected'
  feedback?: string // Required for rejection
}

// Behavior:
// - If approved_guest:
//   - Update user.accountStatus to 'guest'
//   - Create program_enrollments record with status 'guest'
//   - Send welcome email
// - If approved_member:
//   - Update user.accountStatus to 'active'
//   - Create program_enrollments record with status 'active'
//   - Send welcome email (for users with prior participation history)
// - If rejected:
//   - Keep user.accountStatus as 'pending'
//   - Save feedback for user to view
```

**`PATCH /api/admin/users/:id/promote`** (New - Admin Only)
```typescript
interface PromoteUserRequest {
  fromStatus: 'guest'
  toStatus: 'active'
  notes?: string // Optional promotion notes
}

// Behavior:
// - Update user.accountStatus from 'guest' to 'active'
// - Update program_enrollments.status from 'guest' to 'active'
// - Send promotion notification
// - Log promotion event in metadata
```

#### Programs API

**`GET /api/programs`**
```typescript
// List all active programs
interface ProgramsResponse {
  programs: Array<{
    id: string
    name: string
    description: string
    programType: 'cohort' | 'evergreen'
    startDate: string | null
    endDate: string | null
    isActive: boolean
  }>
}
```

**`GET /api/programs/:id`**
```typescript
// Get program details with activities
interface ProgramDetailResponse {
  program: {
    id: string
    name: string
    description: string
    programType: 'cohort' | 'evergreen'
    startDate: string | null
    endDate: string | null
    isActive: boolean
    createdAt: string
    updatedAt: string
  }
  activities: Array<{
    id: string
    title: string
    description: string
    isRequired: boolean
    orderIndex: number
  }>
  enrollmentCount: number
}
```

**`POST /api/admin/programs`** (New - Admin Only)
```typescript
// Create new program
interface CreateProgramRequest {
  name: string // Required, 1-100 characters
  description: string // Required
  programType: 'cohort' | 'evergreen' // Required
  startDate?: string // ISO 8601 date, required for cohort type
  endDate?: string // ISO 8601 date, required for cohort type
  isActive?: boolean // Default true
}

interface CreateProgramResponse {
  program: {
    id: string
    name: string
    description: string
    programType: 'cohort' | 'evergreen'
    startDate: string | null
    endDate: string | null
    isActive: boolean
    createdAt: string
    updatedAt: string
  }
}
```

**`PATCH /api/admin/programs/:id`** (New - Admin Only)
```typescript
// Update existing program
interface UpdateProgramRequest {
  name?: string
  description?: string
  programType?: 'cohort' | 'evergreen'
  startDate?: string | null
  endDate?: string | null
  isActive?: boolean
}

// Response: Same as CreateProgramResponse
```

**`DELETE /api/admin/programs/:id`** (New - Admin Only)
```typescript
// Soft delete program (set isActive to false)
// Hard delete only if no enrollments exist

// Behavior:
// - Check if program has any enrollments
// - If enrollments exist: Set isActive to false (soft delete)
// - If no enrollments: Delete program record (hard delete)
// - Cascade delete program_activities records
```

**`POST /api/admin/programs/:id/activities`** (New - Admin Only)
```typescript
// Link activity to program
interface LinkActivityRequest {
  activityId: string // UUID of existing activity
  isRequired: boolean // Default false
  orderIndex?: number // Optional sort order
}

interface LinkActivityResponse {
  programActivity: {
    id: string
    programId: string
    activityId: string
    isRequired: boolean
    orderIndex: number | null
    createdAt: string
  }
}
```

**`PATCH /api/admin/programs/:programId/activities/:activityId`** (New - Admin Only)
```typescript
// Update program-activity relationship
interface UpdateProgramActivityRequest {
  isRequired?: boolean
  orderIndex?: number
}

// Response: Same as LinkActivityResponse
```

**`DELETE /api/admin/programs/:programId/activities/:activityId`** (New - Admin Only)
```typescript
// Remove activity from program
// Behavior:
// - Delete program_activities record
// - Activity itself remains in activities table
// - Does not affect existing submissions
```

#### Attendance API

**`POST /api/admin/attendance`** (New - Admin Only)
```typescript
interface MarkAttendanceRequest {
  userId: string
  activityId: string
  programId?: string
  status: 'present' | 'absent' | 'excused'
  notes?: string
}
```

**`GET /api/users/:id/attendance`**
```typescript
// Get user's attendance history
interface UserAttendanceResponse {
  attendance: Array<{
    id: string
    activityId: string
    activityTitle: string
    programId: string | null
    programName: string | null
    status: 'present' | 'absent' | 'excused'
    markedBy: string
    markedAt: string
    notes: string | null
  }>
  stats: {
    totalSessions: number
    present: number
    absent: number
    attendanceRate: number
  }
}
```

### Service Layer Functions

**`src/services/applications.ts`** (New)
```typescript
export async function applyToProgram(data: ApplicationData): Promise<Application>
export async function getMyApplication(): Promise<ApplicationResponse>
export async function updateApplication(data: Partial<ApplicationData>): Promise<Application>
```

**`src/services/programs.ts`** (New)
```typescript
// User-facing program services
export async function getPrograms(): Promise<Program[]>
export async function getProgramDetails(id: string): Promise<ProgramDetailResponse>
export async function enrollInProgram(programId: string): Promise<Enrollment>
```

**`src/services/admin/programs.ts`** (New - Admin Only)
```typescript
// Admin program management
export async function createProgram(data: CreateProgramRequest): Promise<Program>
export async function updateProgram(id: string, data: UpdateProgramRequest): Promise<Program>
export async function deleteProgram(id: string): Promise<void>
export async function getAllPrograms(includeInactive?: boolean): Promise<Program[]>

// Program-activity relationship management
export async function linkActivityToProgram(
  programId: string,
  data: LinkActivityRequest
): Promise<ProgramActivity>

export async function updateProgramActivity(
  programId: string,
  activityId: string,
  data: UpdateProgramActivityRequest
): Promise<ProgramActivity>

export async function unlinkActivityFromProgram(
  programId: string,
  activityId: string
): Promise<void>
```

**`src/services/admin/applications.ts`** (New - Admin Only)
```typescript
export async function reviewApplication(id: string, decision: ReviewDecision): Promise<void>
export async function getPendingApplications(): Promise<Application[]>
export async function promoteUserToMember(userId: string, notes?: string): Promise<void>
```

**`src/services/admin/attendance.ts`** (New - Admin Only)
```typescript
export async function markAttendance(data: AttendanceData): Promise<AttendanceRecord>
export async function getSessionAttendance(activityId: string): Promise<AttendanceRecord[]>
```

### UI Components

#### Onboarding Flow Components

**`src/components/onboarding/program-selector.tsx`** (New)
- Display list of active programs
- Show program descriptions
- Radio selection for program choice
- Highlight "Open" as default option

**`src/components/onboarding/goal-commitment.tsx`** (New)
- Textarea with character counter (1-280)
- Real-time validation
- Examples/tips for writing measurable goals
- Preview of commitment text

**`src/components/onboarding/social-accounts-form.tsx`** (New)
- GitHub username input with validation
- Twitter username input with validation
- Optional: Preview GitHub profile (via API)
- Optional: Preview Twitter profile (via API)

#### Profile & Dashboard Components

**`src/components/profile/application-status-banner.tsx`** (New)
- Display application status badge
- Show pending/approved/rejected state
- Link to application details
- Call-to-action for rejected applications

**`src/components/programs/program-dashboard.tsx`** (New)
- Program header (name, dates, description)
- Upcoming sessions list
- Progress tracker
- Attendance history

**`src/components/programs/attendance-history.tsx`** (New)
- Table of attendance records
- Status indicators (present/absent/excused)
- Notes display
- Statistics summary

#### Admin Components

**`src/components/admin/applications-queue.tsx`** (New)
- List of pending applications
- Filter by program
- Sort by submission date
- Quick review actions

**`src/components/admin/application-review-modal.tsx`** (New)
- Full application details
- User profile preview
- Social account links
- Approve/reject buttons with feedback field

**`src/components/admin/attendance-marker.tsx`** (New)
- Session/activity selector
- User list with checkboxes
- Bulk mark actions
- Notes field per user

**`src/components/admin/programs-list.tsx`** (New)
- Table of all programs (active and inactive)
- Filter by type (cohort/evergreen/all)
- Filter by status (active/inactive)
- Quick actions: Edit, Delete, View Details
- Link to create new program

**`src/components/admin/program-form.tsx`** (New)
- Form for creating/editing programs
- Fields: name, description, type, start/end dates
- Validation for required fields
- Cohort-specific date requirements
- Active/inactive toggle
- Save and cancel actions

**`src/components/admin/program-activities-manager.tsx`** (New)
- List of activities linked to program
- Search/filter available activities to link
- Drag-and-drop reordering
- Toggle required/optional status
- Unlink activity action

## ✅ Acceptance Criteria

### Phase 1: Application System (E3-T1 to E3-T3)

#### Database & Schema
- [ ] `applications` table extended with program_id, goal, social accounts
- [ ] `programs` table created with 3 initial programs
- [ ] `program_activities` junction table created
- [ ] `program_enrollments` table created
- [ ] `attendance_records` table created
- [ ] All migrations run successfully in dev and staging

#### Onboarding Flow
- [ ] User sees program selection step after profile completion
- [ ] User can view program descriptions before selection
- [ ] Goal commitment field validates 1-280 characters
- [ ] GitHub and Twitter username fields are required
- [ ] Application submission updates accountStatus to 'pending'
- [ ] User redirected to profile with "Application Pending" banner

#### Club Guest Access
- [ ] Users with `accountStatus: 'pending'` can browse directory
- [ ] Club Guests can view all activities
- [ ] Club Guests can submit to bounties (marked as guest submissions)
- [ ] Club Guests cannot access admin features
- [ ] Club Guests see "Application Pending" UI indicators

#### Admin Review
- [ ] Admins see applications queue at `/admin/applications`
- [ ] Admins can filter pending applications by program
- [ ] Application review modal shows all user details
- [ ] Admins can approve with one click
- [ ] Admins can reject with required feedback field
- [ ] Approval creates program_enrollments record
- [ ] Approval updates user.accountStatus to 'active'
- [ ] Rejection keeps user as Club Guest, saves feedback

### Phase 2: Program Management (E3-T4 to E3-T6)

#### Program Dashboard
- [ ] Users see program dashboard after enrollment
- [ ] Dashboard displays program details and dates
- [ ] Upcoming sessions/activities listed
- [ ] Progress tracker shows completion percentage

#### Attendance Tracking
- [ ] Admins can mark attendance for any activity
- [ ] Attendance records link to user, activity, and program
- [ ] Users can view their attendance history
- [ ] Attendance statistics calculated correctly
- [ ] Attendance UI shows present/absent/excused states

#### Activities Integration
- [ ] Activities can be linked to programs via program_activities
- [ ] Activities can be marked as required or optional
- [ ] Program dashboard shows program-specific activities
- [ ] Generic activities remain program-agnostic
- [ ] Activity submissions link to program context when applicable

#### Program CRUD (Admin)
- [ ] Admin can create new programs with all required fields
- [ ] Admin can edit existing programs
- [ ] Admin can delete programs (soft delete if enrollments exist)
- [ ] Admin can view list of all programs (active and inactive)
- [ ] Admin can link activities to programs
- [ ] Admin can mark activities as required/optional
- [ ] Admin can reorder activities within program
- [ ] Admin can unlink activities from programs
- [ ] Changes to programs reflect immediately in user-facing interfaces
- [ ] Validation prevents deletion of programs with active enrollments

### Non-Functional Requirements
- [ ] All endpoints follow API envelope pattern
- [ ] All database operations use Drizzle ORM
- [ ] All components follow pure UI pattern (no API calls)
- [ ] All service functions use apiFetch wrapper
- [ ] TypeScript strict mode with no `any` types
- [ ] All files use kebab-case naming
- [ ] Toast notifications for all user actions
- [ ] Loading states for all async operations

## 📊 Implementation Phases

### Phase 1: Foundation (Week 1-2)

**E3-T1: Database Schema Setup**
- Extend applications table
- Create programs, program_activities, program_enrollments, attendance_records tables
- Seed initial programs
- Write and run migrations

**E3-T2: Onboarding Flow Updates**
- Update onboarding form with new steps
- Create program selector component
- Create goal commitment component
- Create social accounts form component
- Update form submission to include new fields

**E3-T3: Club Guest Implementation**
- Update account status logic
- Add Club Guest access controls
- Create "Application Pending" UI components
- Test guest permissions across platform

### Phase 2: Admin Features (Week 3)

**E3-T4: Admin Applications Queue**
- Create applications queue UI
- Implement filtering and sorting
- Create application review modal
- Add approve/reject functionality
- Test approval flow end-to-end

**E3-T5: Admin Attendance Management**
- Create attendance marker component
- Implement bulk attendance marking
- Add notes functionality
- Test attendance recording

### Phase 3: User Experience (Week 4)

**E3-T6: Program Dashboard**
- Create program dashboard layout
- Implement progress tracker
- Display attendance history
- Show program-specific activities
- Link to activity submissions

**E3-T7: Testing & Documentation**
- Write comprehensive tests
- Update CLAUDE.md with new features
- Create feature documentation
- Write user guides
- Perform end-to-end testing

## 🔗 Dependencies & Risks

### Technical Dependencies
- ✅ Existing users table with accountStatus field
- ✅ Existing activities and submissions tables
- ✅ Authentication via Privy
- ✅ Admin role permissions system
- ⚠️ Social account validation (may need API keys)

### Integration Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Social account linking complexity | High | Start with simple username validation, defer profile preview |
| Club Guest permissions edge cases | Medium | Comprehensive permission testing across all features |
| Application review backlog | Medium | Clear admin notification system, manageable cohort sizes |
| Goal validation subjectivity | Low | Provide clear examples and admin training |

## 📚 Documentation Requirements

### For Developers
- [ ] Update [CLAUDE.md](../../CLAUDE.md) with new database tables
- [ ] Create [docs/features/program-management.md](../features/program-management.md)
- [ ] Document API endpoints in [docs/specs/api-v1.md](../specs/api-v1.md)
- [ ] Add database diagrams to [docs/database/schema.md](../database/schema.md)

### For Users
- [ ] Create onboarding guide for new applicants
- [ ] Write program selection guide
- [ ] Document goal setting best practices
- [ ] Create Club Guest FAQ

### For Admins
- [ ] Write application review guidelines
- [ ] Create attendance marking manual
- [ ] Document approval criteria
- [ ] Write program management guide

## 🚀 Rollout Plan

### Pre-Launch
1. Run all migrations in staging environment
2. Seed 3 initial programs (De Cero a Chamba, DeFi-esta, Open)
3. Test onboarding flow end-to-end
4. Train admins on application review process
5. Create sample applications for testing

### Launch
1. Deploy to production with feature flag (disabled)
2. Enable feature for internal team testing
3. Monitor error logs and performance
4. Gradually enable for new signups
5. Announce new onboarding flow to community

### Post-Launch
1. Monitor application submission rate
2. Track admin review turnaround time
3. Gather user feedback on Club Guest experience
4. Measure program enrollment distribution
5. Iterate on goal quality and clarity

## 📈 Success Metrics & KPIs

### Application Funnel
- Application start rate (% of signups)
- Application completion rate
- Application approval rate
- Time to review (admin efficiency)

### Program Engagement
- Program enrollment distribution
- Activity completion rate by program
- Attendance rate by program
- Goal achievement rate (manual assessment)

### Platform Health
- Club Guest retention (vs active members)
- Directory listing quality (with goal visibility)
- Bounty submission rate (Club Guests vs active)

## 🔄 Future Enhancements (Post-MVP)

### Phase 2 Features (3-6 months)
- [ ] POAP integration for attendance verification
- [ ] LinkedIn and Telegram account linking
- [ ] Program switching with admin approval
- [ ] Automated goal progress tracking
- [ ] Program completion certificates
- [ ] Advanced analytics dashboard
- [ ] Self-serve attendance for virtual events

### Phase 3 Features (6-12 months)
- [ ] Multi-program participation (exceptions beyond Open)
- [ ] Program prerequisites enforcement
- [ ] Mentorship matching within programs
- [ ] Cohort-specific communities/channels
- [ ] Gamification and leaderboards
- [ ] Alumni network and referrals

## 📝 Open Questions & Decisions Needed

### Technical Decisions
- ✅ **Decided**: Extend applications table vs create new table → **Extend existing**
- ✅ **Decided**: Club Guest vs different status name → **Club Guest**
- ✅ **Decided**: Social account validation approach → **Simple username validation**
- ⏳ **Pending**: GitHub/Twitter API integration for profile preview? → **Defer to Phase 2**
- ⏳ **Pending**: Email notifications for application status? → **Decide in E3-T3**

### Product Decisions
- ⏳ **Pending**: Should rejected users see other Club Guests? → **Discuss with product team**
- ⏳ **Pending**: Can users update goal after submission? → **Decide in E3-T6**
- ⏳ **Pending**: Should attendance affect application approval? → **No for MVP**

## 🎫 Related Tickets

**Epic Breakdown:**
- [E3-T1: Database Schema Setup](./E3-T1-database-schema-setup.md)
- [E3-T2: Onboarding Flow Updates](./E3-T2-onboarding-flow-updates.md)
- [E3-T3: Club Guest Implementation](./E3-T3-club-guest-implementation.md)
- [E3-T4: Admin Applications Queue](./E3-T4-admin-applications-queue.md)
- [E3-T5: Admin Attendance Management](./E3-T5-admin-attendance-management.md)
- [E3-T6: Program Dashboard](./E3-T6-program-dashboard.md)
- [E3-T7: Testing & Documentation](./E3-T7-testing-documentation.md)

**Related Epics:**
- E2: Admin Dashboard (prerequisite for admin features)
- E4: Bounty System (benefits from program context)

---

**Last Updated**: 2026-01-05
**Contributors**: Product Team, Engineering Team
**Next Review**: After E3-T1 completion
