# E4: Programs-Sessions-Activities Relationship Model

**Status:** Planning & Implementation
**Created:** 2025-01-09
**Last Updated:** 2025-01-09

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Current State Analysis](#current-state-analysis)
3. [Relationship Model](#relationship-model)
4. [Database Schema](#database-schema)
5. [Automatic Transitive Relationships](#automatic-transitive-relationships)
6. [Migration Strategy](#migration-strategy)
7. [Implementation Gaps](#implementation-gaps)
8. [API Types & Responses](#api-types--responses)
9. [Service Layer Patterns](#service-layer-patterns)
10. [UI Components & Navigation](#ui-components--navigation)
11. [Success Criteria](#success-criteria)

---

## Architecture Overview

### Core Principles

**Poktapok** uses a **flexible, optional relationship model** between Programs, Sessions, and Activities:

1. **Programs** are optional containers for sessions and activities
2. **Sessions** can be standalone OR linked to a program
3. **Activities** can be:
   - Standalone (e.g., attending coworking, hackathon participation)
   - Linked to a program directly
   - Linked to a session (e.g., session deliverable)
   - Transitively linked to a program via session

### Key Design Decisions

- **Nullable Foreign Keys**: Support standalone entities
- **Junction Tables**: Many-to-many relationships for flexibility
- **Automatic Transitive Resolution**: Database view computes Activity → Session → Program
- **Database-Driven Logic**: Minimize application-level relationship computation

---

## Current State Analysis

### What Exists ✅

1. **Tables**:
   - `programs` - Program definitions
   - `sessions` - Session definitions (currently WRONG: programId is NOT NULL)
   - `activities` - Activity definitions
   - `program_enrollments` - User enrollment in programs
   - `program_activities` - Junction table (program ↔ activity)
   - `session_activities` - Junction table (session ↔ activity)

2. **Admin UI**:
   - Programs CRUD (`/admin/programs`)
   - Sessions CRUD (`/admin/sessions`)
   - Activities CRUD (`/admin/activities`)
   - Session detail with activity manager (`/admin/sessions/[id]`)
   - Session attendance tracking (`/admin/sessions/[id]/attendance`)

### Critical Issue 🚨

**Problem:** `sessions.programId` is defined as `.notNull()` in schema

**Impact:** Prevents creating standalone sessions

**Solution:** Must create migration to make `programId` nullable

---

## Relationship Model

### Entity Relationships

```
Programs (optional container)
├── Sessions (optional link via programId)
│   └── Activities (via session_activities junction)
└── Activities (optional link via program_activities junction)
```

### Relationship Types

| Type | Description | Example |
|------|-------------|---------|
| **Standalone Session** | `programId = NULL` | Open coworking session |
| **Program Session** | `programId = UUID` | "Week 3: Smart Contracts" |
| **Standalone Activity** | Not in any junction table | Attend hackathon |
| **Program Activity** | In `program_activities` | Complete capstone project |
| **Session Activity** | In `session_activities` | Submit session homework |
| **Transitive Activity** | Session has `programId` | Inherits program relationship |
| **Dual-Link Activity** | In both junction tables | Required program activity + session deliverable |

### Transitive Relationship Logic

**Rule:** If an activity is linked to a session, AND that session has a `programId`, the activity inherits the program relationship automatically.

**Example:**
```
Activity: "Build Smart Contract"
  ↓ (linked via session_activities)
Session: "Week 3: Smart Contracts"
  ↓ (has programId)
Program: "Solidity Bootcamp"

Result: Activity effectively belongs to "Solidity Bootcamp" program
```

---

## Database Schema

### Current Schema (With Issues)

#### sessions table
```typescript
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  programId: uuid('program_id')
    .notNull()  // ❌ WRONG - prevents standalone sessions
    .references(() => programs.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  sessionType: varchar('session_type', { length: 50 }).notNull().default('in-person'),
  sessionDate: timestamp('session_date', { withTimezone: true }).notNull(),
  duration: varchar('duration', { length: 50 }),
  location: text('location'),
  instructors: jsonb('instructors').$type<string[]>().default([]),
  materials: jsonb('materials').$type<{ title: string; url: string; type: string }[]>().default([]),
  isActive: boolean('is_active').default(true).notNull(),
  ...timestamps,
  ...metadata,
})
```

#### program_activities junction table
```typescript
export const programActivities = pgTable('program_activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  programId: uuid('program_id').notNull().references(() => programs.id, { onDelete: 'cascade' }),
  activityId: uuid('activity_id').notNull(),
  isRequired: boolean('is_required').default(false).notNull(),
  orderIndex: integer('order_index'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueProgramActivity: unique().on(table.programId, table.activityId),
}))
```

#### session_activities junction table
```typescript
export const sessionActivities = pgTable('session_activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => sessions.id, { onDelete: 'cascade' }),
  activityId: uuid('activity_id')
    .notNull()
    .references(() => activities.id, { onDelete: 'cascade' }),
  orderIndex: integer('order_index'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueSessionActivity: unique().on(table.sessionId, table.activityId),
}))
```

### Fixed Schema (Target State)

#### sessions table (FIXED)
```typescript
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  programId: uuid('program_id')  // ✅ NULLABLE - allows standalone sessions
    .references(() => programs.id, { onDelete: 'cascade' }),
  // ... rest of fields unchanged
})
```

### Referential Integrity

**Cascade Rules:**
- Delete program → cascade delete sessions with that programId
- Delete program → cascade delete entries in program_activities
- Delete session → cascade delete entries in session_activities
- Delete activity → cascade delete entries in both junction tables

**Orphan Prevention:**
- Activities can exist without any relationships (standalone)
- Sessions with `programId = NULL` are valid (standalone)
- Junction table unique constraints prevent duplicate links

---

## Automatic Transitive Relationships

### Database View: activity_relationships_view

**Purpose:** Automatically compute all activity relationships including transitive program links

**Definition:**
```sql
CREATE VIEW activity_relationships_view AS
SELECT
  -- Activity identification
  a.id AS activity_id,
  a.title AS activity_title,
  a.activity_type,
  a.difficulty,
  a.reward_pulpa_amount,
  a.status,

  -- Direct program link (via program_activities junction)
  pa.program_id AS direct_program_id,
  p1.name AS direct_program_name,
  pa.is_required AS is_program_required,
  pa.order_index AS program_order_index,

  -- Session link (via session_activities junction)
  sa.session_id AS session_id,
  s.title AS session_title,
  s.session_date,
  sa.order_index AS session_order_index,

  -- Transitive program link (via session → program)
  s.program_id AS transitive_program_id,
  p2.name AS transitive_program_name,

  -- Computed: final effective program relationship
  COALESCE(pa.program_id, s.program_id) AS effective_program_id,
  COALESCE(p1.name, p2.name) AS effective_program_name,

  -- Relationship type indicator
  CASE
    WHEN pa.program_id IS NOT NULL AND sa.session_id IS NOT NULL THEN 'both'
    WHEN pa.program_id IS NOT NULL THEN 'program'
    WHEN sa.session_id IS NOT NULL AND s.program_id IS NOT NULL THEN 'session_transitive'
    WHEN sa.session_id IS NOT NULL THEN 'session'
    ELSE 'standalone'
  END AS relationship_type,

  -- Timestamps
  a.created_at,
  a.updated_at

FROM activities a

-- Direct program link
LEFT JOIN program_activities pa ON pa.activity_id = a.id
LEFT JOIN programs p1 ON p1.id = pa.program_id

-- Session link
LEFT JOIN session_activities sa ON sa.activity_id = a.id
LEFT JOIN sessions s ON s.id = sa.session_id

-- Transitive program link
LEFT JOIN programs p2 ON p2.id = s.program_id

WHERE a.deleted_at IS NULL;
```

### View Benefits

✅ **Automatic computation** - No application logic needed
✅ **Single source of truth** - Consistent relationship resolution
✅ **Efficient querying** - Indexed joins with proper foreign keys
✅ **Type safety** - relationship_type enum for UI logic
✅ **Transitive support** - Session → Program inheritance built-in

### Query Patterns

**Get all activities with relationships:**
```typescript
const activities = await db.select().from(activityRelationshipsView)
```

**Get activities for a specific program (including transitive):**
```typescript
const programActivities = await db
  .select()
  .from(activityRelationshipsView)
  .where(eq(activityRelationshipsView.effectiveProgramId, programId))
```

**Get standalone activities only:**
```typescript
const standaloneActivities = await db
  .select()
  .from(activityRelationshipsView)
  .where(eq(activityRelationshipsView.relationshipType, 'standalone'))
```

---

## Migration Strategy

### Migration Workflow (NOT db:push)

**Proper Process:**
1. Update schema files in `drizzle/schema/`
2. Run `bun run db:generate` to create migration SQL
3. Review generated migration file in `drizzle/migrations/`
4. Run `bun run db:migrate` to apply migration
5. Verify with `bun run scripts/test-db-connection.ts`

### Migration 1: Make sessions.programId Nullable

**Schema Change:** `drizzle/schema/sessions.ts`
```typescript
// BEFORE
programId: uuid('program_id')
  .notNull()
  .references(() => programs.id, { onDelete: 'cascade' }),

// AFTER
programId: uuid('program_id')
  .references(() => programs.id, { onDelete: 'cascade' }),
```

**Expected SQL:**
```sql
ALTER TABLE sessions ALTER COLUMN program_id DROP NOT NULL;
```

**Verification:**
```sql
-- Should return sessions with NULL programId
SELECT id, title, program_id FROM sessions WHERE program_id IS NULL;
```

### Migration 2: Create activity_relationships_view

**File:** `drizzle/migrations/XXXX_create_activity_relationships_view.sql`

**SQL:**
```sql
CREATE VIEW activity_relationships_view AS
SELECT
  a.id AS activity_id,
  a.title AS activity_title,
  a.activity_type,
  a.difficulty,
  a.reward_pulpa_amount,
  a.status,
  pa.program_id AS direct_program_id,
  p1.name AS direct_program_name,
  pa.is_required AS is_program_required,
  pa.order_index AS program_order_index,
  sa.session_id AS session_id,
  s.title AS session_title,
  s.session_date,
  sa.order_index AS session_order_index,
  s.program_id AS transitive_program_id,
  p2.name AS transitive_program_name,
  COALESCE(pa.program_id, s.program_id) AS effective_program_id,
  COALESCE(p1.name, p2.name) AS effective_program_name,
  CASE
    WHEN pa.program_id IS NOT NULL AND sa.session_id IS NOT NULL THEN 'both'
    WHEN pa.program_id IS NOT NULL THEN 'program'
    WHEN sa.session_id IS NOT NULL AND s.program_id IS NOT NULL THEN 'session_transitive'
    WHEN sa.session_id IS NOT NULL THEN 'session'
    ELSE 'standalone'
  END AS relationship_type,
  a.created_at,
  a.updated_at
FROM activities a
LEFT JOIN program_activities pa ON pa.activity_id = a.id
LEFT JOIN programs p1 ON p1.id = pa.program_id
LEFT JOIN session_activities sa ON sa.activity_id = a.id
LEFT JOIN sessions s ON s.id = sa.session_id
LEFT JOIN programs p2 ON p2.id = s.program_id
WHERE a.deleted_at IS NULL;
```

### Migration 3: Add Performance Indexes

**SQL:**
```sql
-- Index for filtering sessions by program (including NULL)
CREATE INDEX idx_sessions_program_id ON sessions(program_id);

-- Partial index for standalone sessions
CREATE INDEX idx_sessions_standalone ON sessions(id)
  WHERE program_id IS NULL;

-- Index for junction table queries (if not already covered by unique constraint)
CREATE INDEX idx_program_activities_activity ON program_activities(activity_id);
CREATE INDEX idx_session_activities_activity ON session_activities(activity_id);
```

---

## Implementation Gaps

### Gap 1: Program Detail Page (Central Hub) 🚨 HIGH PRIORITY

**Status:** Missing entirely

**Purpose:** Central management hub for each program

**Navigation Structure:**
```
/admin/programs/[id]              → Program Overview
/admin/programs/[id]/sessions     → Sessions in this program
/admin/programs/[id]/activities   → Activities in this program (direct + transitive)
/admin/programs/[id]/enrollments  → Enrollment management
```

**Components to Create:**

#### 1. Program Detail Page
**File:** `src/app/admin/programs/[id]/page.tsx`

**Features:**
- Program overview card (name, description, dates, type)
- Statistics grid (enrollments, sessions, activities, completion rate)
- Quick action buttons (Edit, Activate/Deactivate, View Enrollments)
- Navigation to sessions, activities, enrollments

#### 2. Program Overview Card
**File:** `src/components/admin/program-overview-card.tsx`

**Features:**
- Program metadata display
- Active/inactive status toggle
- Edit program button
- Date range display (cohort type)

#### 3. Program Stats Grid
**File:** `src/components/admin/program-stats-grid.tsx`

**Metrics:**
- Total enrollments (active/completed/dropped)
- Total sessions (completed/upcoming)
- Total activities (direct + transitive)
- Average completion rate
- Active participation rate

---

### Gap 2: Program Enrollments Management 🚨 HIGH PRIORITY

**Status:** Missing entirely

**Purpose:** Manage user enrollments in programs (roster management)

**Features Needed:**

#### 1. Enrollments List Page
**File:** `src/app/admin/programs/[id]/enrollments/page.tsx`

**Features:**
- Enrollments table with user info
- Status badges (enrolled, completed, dropped)
- Enrollment date and completion date
- Manual enrollment button
- Bulk actions (CSV import, bulk status update)
- Search and filter capabilities

#### 2. Enrollments Table Component
**File:** `src/components/admin/program-enrollments-table.tsx`

**Columns:**
- User avatar and display name
- Email
- Enrollment date
- Status (with inline status change)
- Completion date (if applicable)
- Actions (Edit, Remove)

**Features:**
- Sort by enrollment date, completion date, status
- Filter by status
- Bulk select for batch operations

#### 3. Enrollment Form Dialog
**File:** `src/components/admin/enrollment-form-dialog.tsx`

**Fields:**
- User search/select (typeahead)
- Status selection (enrolled, completed, dropped)
- Enrollment date (defaults to now)
- Completion date (optional, for completed status)
- Notes/metadata (optional)

**Validation:**
- User must not already be enrolled
- Cannot enroll inactive users
- Completion date must be after enrollment date

#### 4. API Endpoints

**GET /api/admin/programs/[id]/enrollments**
```typescript
export interface GetProgramEnrollmentsResponse {
  enrollments: (ProgramEnrollment & {
    user: User
    profile: Profile | null
  })[]
}
```

**POST /api/admin/programs/[id]/enrollments**
```typescript
export interface CreateEnrollmentRequest {
  userId: string
  status?: 'enrolled' | 'completed' | 'dropped'
  enrolledAt?: string  // ISO date
  completedAt?: string  // ISO date
}
```

**PATCH /api/admin/programs/[id]/enrollments/[enrollmentId]**
```typescript
export interface UpdateEnrollmentRequest {
  status?: 'enrolled' | 'completed' | 'dropped'
  completedAt?: string | null
  promotedAt?: string | null
}
```

**DELETE /api/admin/programs/[id]/enrollments/[enrollmentId]**
- Soft delete enrollment record

#### 5. Services and Hooks

**File:** `src/services/enrollments.ts`
```typescript
export async function fetchProgramEnrollments(programId: string)
export async function createEnrollment(programId: string, data: CreateEnrollmentRequest)
export async function updateEnrollment(programId: string, enrollmentId: string, data: UpdateEnrollmentRequest)
export async function deleteEnrollment(programId: string, enrollmentId: string)
```

**File:** `src/hooks/use-enrollments.ts`
```typescript
export function useProgramEnrollments(programId: string)
export function useCreateEnrollment(programId: string)
export function useUpdateEnrollment(programId: string)
export function useDeleteEnrollment(programId: string)
```

---

### Gap 3: Standalone Entity Support 🚨 HIGH PRIORITY

**Status:** Partially implemented, needs enhancement

**Purpose:** Support creating and displaying standalone sessions/activities

#### A. Sessions Page Updates

**File:** `src/components/admin/session-form-dialog.tsx`

**Changes:**
- Make program selection **optional** (remove `.notNull()` validation)
- Add "No Program (Standalone)" option to program dropdown
- Update placeholder text: "Select a program (optional)"
- Show warning badge for standalone sessions in form preview

**File:** `src/components/admin/sessions-table.tsx`

**Changes:**
- Display "Standalone" badge when `programId === null`
- Make program name clickable link (when not null)
- Add filter dropdown: "All" | "With Program" | "Standalone"
- Sort: standalone sessions at top or bottom (user preference)

#### B. Activities Page Updates

**File:** `src/services/activities.ts`

**Changes:**
- Query from `activityRelationshipsView` instead of raw `activities` table
- Return `ActivityWithRelationships` type with computed relationships

**File:** `src/components/admin/activities-table.tsx`

**Changes:**
- Display relationship badges using `relationshipType` field:
  - `standalone` → Gray badge "Standalone"
  - `program` → Blue badge "Program: {name}"
  - `session` → Purple badge "Session: {title}"
  - `session_transitive` → Green badge "{session} → {program}"
  - `both` → Two badges side-by-side

**Badges should be clickable:**
- Click program badge → navigate to `/admin/programs/[id]`
- Click session badge → navigate to `/admin/sessions/[id]`

**Filter dropdown:**
- "All Activities"
- "Standalone Only"
- "Program-Linked" (direct or transitive)
- "Session-Linked" (direct or transitive)
- "Both Program & Session"

#### C. Activity Form Updates

**File:** `src/components/admin/activity-form-dialog.tsx`

**Changes:**
- Show relationship summary in form
- Display transitive relationships when linking to sessions
- Warning: "This session is part of {program}, so this activity will inherit that relationship"

---

### Gap 4: Cross-Hierarchy Navigation 🔵 MEDIUM PRIORITY

**Status:** Inconsistent navigation across pages

**Purpose:** Clear, consistent navigation showing entity relationships

#### A. Breadcrumb Standardization

**All detail pages should have breadcrumbs:**

**Programs:**
```
/admin/programs → Programs
/admin/programs/[id] → Programs > {program.name}
/admin/programs/[id]/sessions → Programs > {program.name} > Sessions
/admin/programs/[id]/enrollments → Programs > {program.name} > Enrollments
```

**Sessions:**
```
/admin/sessions → Sessions
/admin/sessions/[id] → Sessions > {session.title}
/admin/sessions/[id] → Sessions > {session.title} > Attendance

// If session has program:
/admin/sessions/[id] → Programs > {program.name} > Sessions > {session.title}
```

**Activities:**
```
/admin/activities → Activities
/admin/activities/[id] → Activities > {activity.title}

// If activity has relationships:
/admin/activities/[id] → Programs > {program.name} > Activities > {activity.title}
// OR
/admin/activities/[id] → Sessions > {session.title} > Activities > {activity.title}
```

#### B. Relationship Breadcrumb Component

**File:** `src/components/admin/relationship-breadcrumb.tsx`

**Props:**
```typescript
interface RelationshipBreadcrumbProps {
  entityType: 'program' | 'session' | 'activity'
  entityId: string
  relationshipData?: {
    programId?: string | null
    programName?: string | null
    sessionId?: string | null
    sessionTitle?: string | null
  }
}
```

**Behavior:**
- Automatically constructs breadcrumb based on relationships
- Fetches missing data if needed (via React Query)
- Links are clickable and navigate correctly
- Shows transitive path for activities with session → program

#### C. Relationship Path Display

**Component:** `src/components/admin/relationship-path.tsx`

**Purpose:** Visual display of entity relationships

**Example for activity with session_transitive:**
```
[Activity Card]
  ↓ linked via session
[Session Card]
  ↓ part of program
[Program Card]
```

---

## API Types & Responses

### New Types (src/types/api-v1.ts)

#### ActivityWithRelationships
```typescript
export interface ActivityWithRelationships extends Activity {
  // Direct program link (via program_activities)
  directProgramId: string | null
  directProgramName: string | null
  isProgramRequired: boolean | null
  programOrderIndex: number | null

  // Session link (via session_activities)
  sessionId: string | null
  sessionTitle: string | null
  sessionDate: string | null
  sessionOrderIndex: number | null

  // Transitive program link (via session → program)
  transitiveProgramId: string | null
  transitiveProgramName: string | null

  // Computed effective relationship
  effectiveProgramId: string | null
  effectiveProgramName: string | null

  // Relationship type indicator
  relationshipType: 'standalone' | 'program' | 'session' | 'session_transitive' | 'both'
}
```

#### SessionWithProgram (Updated)
```typescript
export interface SessionWithProgram extends Session {
  program: Program | null  // ✅ NOW NULLABLE (was non-null before)
}
```

#### ProgramWithStats
```typescript
export interface ProgramWithStats extends Program {
  stats: {
    totalEnrollments: number
    activeEnrollments: number
    completedEnrollments: number
    droppedEnrollments: number
    totalSessions: number
    completedSessions: number
    upcomingSessions: number
    totalActivities: number  // Includes transitive
    directActivities: number
    transitiveActivities: number
    averageCompletionRate: number
  }
}
```

### Updated API Responses

#### GET /api/admin/activities
```typescript
export interface GetActivitiesResponse {
  activities: ActivityWithRelationships[]
  meta?: {
    total: number
    filters: {
      relationshipType?: string
      programId?: string
      sessionId?: string
    }
  }
}
```

#### GET /api/admin/programs/[id]
```typescript
export interface GetProgramResponse {
  program: ProgramWithStats
}
```

#### GET /api/admin/sessions/[id]
```typescript
export interface GetSessionResponse {
  session: SessionWithProgram  // program is now nullable
}
```

---

## Service Layer Patterns

### Query Pattern: Use Database View

**File:** `src/services/activities.ts`

```typescript
import { db } from '@/lib/db'
import { activityRelationshipsView } from '@/lib/db/schema'
import type { ActivityWithRelationships } from '@/types/api-v1'

export async function fetchActivitiesWithRelationships(): Promise<ActivityWithRelationships[]> {
  // Query the view directly - relationships computed automatically
  const results = await db
    .select()
    .from(activityRelationshipsView)
    .orderBy(desc(activityRelationshipsView.createdAt))

  return results as ActivityWithRelationships[]
}

export async function fetchActivityById(activityId: string): Promise<ActivityWithRelationships | null> {
  const [result] = await db
    .select()
    .from(activityRelationshipsView)
    .where(eq(activityRelationshipsView.activityId, activityId))
    .limit(1)

  return result as ActivityWithRelationships | null
}

export async function fetchActivitiesByProgram(programId: string): Promise<ActivityWithRelationships[]> {
  // Includes both direct AND transitive links
  return await db
    .select()
    .from(activityRelationshipsView)
    .where(eq(activityRelationshipsView.effectiveProgramId, programId))
    .orderBy(asc(activityRelationshipsView.programOrderIndex))
}

export async function fetchActivitiesBySession(sessionId: string): Promise<ActivityWithRelationships[]> {
  return await db
    .select()
    .from(activityRelationshipsView)
    .where(eq(activityRelationshipsView.sessionId, sessionId))
    .orderBy(asc(activityRelationshipsView.sessionOrderIndex))
}

export async function fetchStandaloneActivities(): Promise<ActivityWithRelationships[]> {
  return await db
    .select()
    .from(activityRelationshipsView)
    .where(eq(activityRelationshipsView.relationshipType, 'standalone'))
}
```

### Benefits of View-Based Queries

✅ **No business logic in services** - Database handles computation
✅ **Consistent results** - Same logic everywhere
✅ **Type safety** - View structure matches TypeScript types
✅ **Performance** - Indexed joins, optimized queries
✅ **Maintainability** - Change logic in one place (view definition)

---

## UI Components & Navigation

### Relationship Badge Component

**File:** `src/components/admin/relationship-badge.tsx`

```typescript
interface RelationshipBadgeProps {
  relationshipType: 'standalone' | 'program' | 'session' | 'session_transitive' | 'both'
  programId?: string | null
  programName?: string | null
  sessionId?: string | null
  sessionTitle?: string | null
  clickable?: boolean
}

export function RelationshipBadge({ relationshipType, ... }: RelationshipBadgeProps) {
  // Render badge with appropriate color and text
  // Make clickable if clickable=true (navigates to entity detail)
}
```

**Badge Colors:**
- `standalone` → Gray (neutral)
- `program` → Blue (primary relationship)
- `session` → Purple (session context)
- `session_transitive` → Green (computed relationship)
- `both` → Multiple badges side-by-side

### Filter Dropdown Component

**File:** `src/components/admin/relationship-filter.tsx`

```typescript
interface RelationshipFilterProps {
  value: string
  onChange: (value: string) => void
  options: Array<{
    value: string
    label: string
    description?: string
  }>
}
```

**Usage in Activities Page:**
```typescript
const filterOptions = [
  { value: 'all', label: 'All Activities' },
  { value: 'standalone', label: 'Standalone Only', description: 'Not linked to any program or session' },
  { value: 'program', label: 'Program-Linked', description: 'Direct or transitive program relationship' },
  { value: 'session', label: 'Session-Linked', description: 'Linked to a session' },
  { value: 'both', label: 'Program & Session', description: 'Linked to both' },
]

<RelationshipFilter value={filter} onChange={setFilter} options={filterOptions} />
```

### Navigation Consistency

**Pattern: All detail pages use:**
1. Breadcrumb navigation (shows hierarchy)
2. Back button (goes to list page)
3. Action buttons (Edit, Delete, etc.)
4. Relationship indicators (badges, links)

**Example:** Session detail page header
```typescript
<div className="space-y-4">
  {/* Breadcrumb */}
  <Breadcrumb>
    {session.programId && (
      <>
        <BreadcrumbItem><Link href="/admin/programs">Programs</Link></BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem><Link href={`/admin/programs/${session.programId}`}>{session.program.name}</Link></BreadcrumbItem>
        <BreadcrumbSeparator />
      </>
    )}
    <BreadcrumbItem><Link href="/admin/sessions">Sessions</Link></BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem><BreadcrumbPage>{session.title}</BreadcrumbPage></BreadcrumbItem>
  </Breadcrumb>

  {/* Header with badges */}
  <div className="flex items-center justify-between">
    <div className="space-y-1">
      <h1 className="text-3xl font-bold">{session.title}</h1>
      {session.program && (
        <RelationshipBadge
          relationshipType="program"
          programId={session.programId}
          programName={session.program.name}
          clickable
        />
      )}
    </div>
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => router.push('/admin/sessions')}>Back to Sessions</Button>
      <Button onClick={() => setEditDialogOpen(true)}>Edit Session</Button>
    </div>
  </div>
</div>
```

---

## Success Criteria

### Database Migration ✅
- [ ] `sessions.programId` is nullable
- [ ] Migration applied via `db:migrate` (not `db:push`)
- [ ] `activity_relationships_view` created successfully
- [ ] Performance indexes added
- [ ] View queries return correct data
- [ ] Transitive relationships computed automatically

### Type System ✅
- [ ] `ActivityWithRelationships` type defined
- [ ] `SessionWithProgram.program` is nullable
- [ ] `ProgramWithStats` type includes relationship counts
- [ ] API response types updated
- [ ] No TypeScript errors in type definitions

### Functionality ✅
- [ ] Can create standalone sessions (no program)
- [ ] Can create standalone activities (no program or session)
- [ ] Activities show relationship_type correctly
- [ ] Transitive relationships display properly
- [ ] Program detail page works
- [ ] Enrollment management works
- [ ] Filters work correctly (standalone, program-linked, etc.)

### Navigation ✅
- [ ] Breadcrumbs consistent across all pages
- [ ] Relationship badges are clickable
- [ ] Navigation shows entity hierarchy
- [ ] Back buttons work correctly
- [ ] Cross-hierarchy links function

### Data Integrity ✅
- [ ] No orphaned records
- [ ] Cascade deletes work correctly
- [ ] Unique constraints prevent duplicates
- [ ] Referential integrity maintained
- [ ] Soft deletes respected in view

### Performance ✅
- [ ] View queries are fast (<100ms)
- [ ] Indexes improve query performance
- [ ] No N+1 query problems
- [ ] Batch queries used where appropriate

### User Experience ✅
- [ ] Clear indication of standalone vs linked entities
- [ ] Relationship badges display correctly
- [ ] Filters work intuitively
- [ ] Navigation is logical and consistent
- [ ] No confusing UI states

---

## Implementation Checklist

### Phase 1: Database (CRITICAL)
- [ ] Update `drizzle/schema/sessions.ts` (programId nullable)
- [ ] Run `bun run db:generate`
- [ ] Review migration file
- [ ] Run `bun run db:migrate`
- [ ] Create view migration file manually
- [ ] Apply view migration
- [ ] Create indexes migration
- [ ] Apply indexes migration
- [ ] Test queries against view

### Phase 2: Types & Services (FOUNDATION)
- [ ] Add `ActivityWithRelationships` to `src/types/api-v1.ts`
- [ ] Update `SessionWithProgram` type
- [ ] Add `ProgramWithStats` type
- [ ] Update `src/services/activities.ts` to use view
- [ ] Update `src/services/programs.ts` for stats
- [ ] Add `src/services/enrollments.ts`
- [ ] Create corresponding hooks in `src/hooks/`

### Phase 3: Program Detail Page (GAP 1)
- [ ] Create `src/app/admin/programs/[id]/page.tsx`
- [ ] Create `src/components/admin/program-overview-card.tsx`
- [ ] Create `src/components/admin/program-stats-grid.tsx`
- [ ] Add navigation links (sessions, activities, enrollments)
- [ ] Test page rendering and navigation

### Phase 4: Enrollments Management (GAP 2)
- [ ] Create `src/app/admin/programs/[id]/enrollments/page.tsx`
- [ ] Create `src/components/admin/program-enrollments-table.tsx`
- [ ] Create `src/components/admin/enrollment-form-dialog.tsx`
- [ ] Create API route `src/app/api/admin/programs/[id]/enrollments/route.ts`
- [ ] Create API route for individual enrollment updates
- [ ] Add enrollment services and hooks
- [ ] Test enrollment CRUD operations

### Phase 5: Standalone Support (GAP 3)
- [ ] Update `session-form-dialog.tsx` (optional program)
- [ ] Update `sessions-table.tsx` (standalone badges)
- [ ] Update `activities-table.tsx` (relationship badges)
- [ ] Update `activities.ts` service to query view
- [ ] Add filter dropdowns for standalone/linked
- [ ] Test creating standalone sessions/activities
- [ ] Test displaying relationship badges

### Phase 6: Navigation Improvements (GAP 4)
- [ ] Create `relationship-badge.tsx` component
- [ ] Create `relationship-breadcrumb.tsx` component
- [ ] Create `relationship-filter.tsx` component
- [ ] Add breadcrumbs to all detail pages
- [ ] Make badges clickable with navigation
- [ ] Test cross-hierarchy navigation
- [ ] Ensure consistent back button behavior

### Phase 7: Testing & Validation
- [ ] Test database queries performance
- [ ] Test transitive relationship display
- [ ] Test all CRUD operations
- [ ] Test filters and search
- [ ] Test navigation flows
- [ ] Verify referential integrity
- [ ] Check for edge cases (null values, empty states)
- [ ] Performance testing with large datasets

---

## Notes & Considerations

### Performance Optimization
- View queries should be fast due to indexed foreign keys
- Consider materialized view if performance issues arise
- Add pagination for large result sets
- Use React Query caching effectively

### Edge Cases
- Activity with both direct program link AND session with different program
  - Solution: Show both relationships, prioritize direct link
- Deleting a program that has sessions/activities
  - Cascade deletes handle cleanup automatically
  - Session becomes standalone if programId is cascade-set to NULL (depends on FK behavior)
- Bulk enrollments exceeding program capacity
  - Add capacity limits to programs table if needed

### Future Enhancements
- Activity completion tracking
- Session attendance affects enrollment status
- Program graduation/certification workflows
- Activity prerequisites and dependencies
- Session capacity limits
- Waitlist management for programs

---

**End of Document**
