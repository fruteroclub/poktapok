# E3-T1: Database Schema Setup

> **Epic**: E3 - Program Management System
> **Status**: 🎯 Todo
> **Priority**: 🔴 Critical
> **Effort**: M (2 days)
> **Blocking**: All other E3 tickets
> **Phase**: 1 - Foundation

## 📋 Overview

Create all database tables and relationships required for the Program Management system. This includes programs, program-activity relationships, enrollments, and attendance tracking. Extend the existing applications table with new fields for goal commitment and social accounts.

**Critical Path**: This ticket BLOCKS all other implementation work. No feature development can begin until schema is complete.

## 🎯 Objectives

1. Create 4 new tables: `programs`, `program_activities`, `program_enrollments`, `attendance_records`
2. Extend `applications` table with 4 new columns
3. Seed 3 initial programs (De Cero a Chamba, DeFi-esta, Open)
4. Validate schema integrity and relationships
5. Ensure migrations are reversible

## 📦 Deliverables

- [x] `drizzle/schema/programs.ts` - Programs table definition
- [x] `drizzle/schema/program-activities.ts` - Junction table for programs↔activities
- [x] `drizzle/schema/program-enrollments.ts` - User enrollment tracking
- [x] `drizzle/schema/attendance-records.ts` - Session attendance tracking
- [x] `drizzle/schema/applications.ts` - Extended with program fields
- [x] `drizzle/schema/index.ts` - Export all new tables
- [x] `drizzle/migrations/XXXX_add_program_system.sql` - Generated migration
- [x] `scripts/seed-programs.ts` - Seed script for initial programs
- [x] `scripts/verify-program-schema.ts` - Schema validation script
- [x] Database tests passing

## 🔧 Technical Requirements

### Schema Files

#### 1. Programs Table (`drizzle/schema/programs.ts`)

```typescript
import { pgTable, uuid, varchar, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core'
import { timestamps, metadata } from './utils'

export const programs = pgTable('programs', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description').notNull(),
  programType: varchar('program_type', { length: 50 }).notNull(), // 'cohort' | 'evergreen'
  startDate: timestamp('start_date', { withTimezone: true }),
  endDate: timestamp('end_date', { withTimezone: true }),
  isActive: boolean('is_active').default(true).notNull(),
  ...timestamps,
  ...metadata,
})
```

**Validation Rules**:
- `programType` must be 'cohort' or 'evergreen'
- Cohort programs should have startDate and endDate
- Name must be unique (consider adding index)

#### 2. Program Activities Junction Table (`drizzle/schema/program-activities.ts`)

```typescript
import { pgTable, uuid, boolean, integer, timestamp, unique } from 'drizzle-orm/pg-core'
import { programs } from './programs'
import { activities } from './activities'

export const programActivities = pgTable('program_activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  programId: uuid('program_id').notNull().references(() => programs.id, { onDelete: 'cascade' }),
  activityId: uuid('activity_id').notNull().references(() => activities.id, { onDelete: 'cascade' }),
  isRequired: boolean('is_required').default(false).notNull(),
  orderIndex: integer('order_index'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueProgramActivity: unique().on(table.programId, table.activityId),
}))
```

**Key Features**:
- Cascade delete: removing program removes all activity links
- Unique constraint: prevent duplicate program-activity pairs
- Optional ordering: activities can be sorted within program

#### 3. Program Enrollments Table (`drizzle/schema/program-enrollments.ts`)

```typescript
import { pgTable, uuid, varchar, timestamp, jsonb, unique } from 'drizzle-orm/pg-core'
import { users } from './users'
import { programs } from './programs'
import { applications } from './applications'
import { timestamps, metadata } from './utils'

export const programEnrollments = pgTable('program_enrollments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  programId: uuid('program_id').notNull().references(() => programs.id, { onDelete: 'cascade' }),
  applicationId: uuid('application_id').references(() => applications.id),
  enrollmentStatus: varchar('enrollment_status', { length: 50 }).default('guest').notNull(), // 'guest' | 'active' | 'completed' | 'dropped'
  enrolledAt: timestamp('enrolled_at', { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  promotedAt: timestamp('promoted_at', { withTimezone: true }), // When guest → active
  ...timestamps,
  ...metadata,
}, (table) => ({
  uniqueUserProgram: unique().on(table.userId, table.programId),
}))
```

**Key Features**:
- One enrollment per user per program
- Track promotion from guest to active member
- Optional link to application record

#### 4. Attendance Records Table (`drizzle/schema/attendance-records.ts`)

```typescript
import { pgTable, uuid, varchar, text, timestamp, jsonb, unique } from 'drizzle-orm/pg-core'
import { users } from './users'
import { activities } from './activities'
import { programs } from './programs'
import { timestamps, metadata } from './utils'

export const attendanceRecords = pgTable('attendance_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  activityId: uuid('activity_id').notNull().references(() => activities.id, { onDelete: 'cascade' }),
  programId: uuid('program_id').references(() => programs.id, { onDelete: 'set null' }),
  markedBy: uuid('marked_by').notNull().references(() => users.id), // Admin/moderator
  attendanceStatus: varchar('attendance_status', { length: 50 }).notNull(), // 'present' | 'absent' | 'excused'
  notes: text('notes'),
  markedAt: timestamp('marked_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  ...metadata,
}, (table) => ({
  uniqueUserActivity: unique().on(table.userId, table.activityId),
}))
```

**Key Features**:
- One attendance record per user per activity
- Track who marked attendance (admin/moderator)
- Optional program context
- Notes for special cases

#### 5. Extend Applications Table (`drizzle/schema/applications.ts`)

```typescript
// Add to existing applications table definition
export const applications = pgTable('applications', {
  // ... existing fields (id, userId, status, etc.)

  // NEW FIELDS
  programId: uuid('program_id').references(() => programs.id),
  goal: text('goal'), // 140-280 characters, validated at application layer
  githubUsername: varchar('github_username', { length: 100 }),
  twitterUsername: varchar('twitter_username', { length: 100 }),

  // ... existing timestamps, metadata
})
```

**Note**: CHECK constraints for goal length (140-280 characters) should be added in migration SQL directly, as Drizzle doesn't support inlined CHECK constraints well.

#### 6. Update Schema Index (`drizzle/schema/index.ts`)

```typescript
// Add to existing exports
export * from './programs'
export * from './program-activities'
export * from './program-enrollments'
export * from './attendance-records'
```

### Migration Strategy

**Step 1: Generate Migration**
```bash
bun run db:generate
```

**Step 2: Review Generated SQL**

The migration should include:
- CREATE TABLE statements for 4 new tables
- ALTER TABLE applications ADD COLUMN statements (4 columns)
- All foreign key constraints
- Unique constraints
- Indexes for foreign keys (auto-created by PostgreSQL)

**Step 3: Add CHECK Constraint Manually**

Add to migration file after applications ALTER statements:
```sql
ALTER TABLE applications
ADD CONSTRAINT goal_length_check
CHECK (goal IS NULL OR (char_length(goal) BETWEEN 140 AND 280));
```

**Step 4: Test Migration**

```bash
# Apply migration in dev
bun run db:migrate

# Verify tables created
bun run db:studio
```

### Seed Script (`scripts/seed-programs.ts`)

```typescript
import { db, closeDatabase } from '@/lib/db'
import { programs } from '@/lib/db/schema'

const initialPrograms = [
  {
    name: 'De Cero a Chamba',
    description: 'Learn web development fundamentals and land your first client. Build practical skills in HTML, CSS, JavaScript, and modern frameworks while completing real-world projects.',
    programType: 'cohort',
    isActive: true,
  },
  {
    name: 'DeFi-esta',
    description: 'Master DeFi protocols and build decentralized applications. Learn smart contract development, Web3 integration, and blockchain fundamentals through hands-on projects.',
    programType: 'cohort',
    isActive: true,
  },
  {
    name: 'Open',
    description: 'Self-directed learning with community support. Work on your own projects while staying connected with the community. Perfect for independent learners and ongoing skill development.',
    programType: 'evergreen',
    isActive: true,
  },
]

async function seed() {
  try {
    console.log('Seeding programs...')

    const seededPrograms = await db
      .insert(programs)
      .values(initialPrograms)
      .returning()

    console.log(`✅ Seeded ${seededPrograms.length} programs:`)
    seededPrograms.forEach(p => console.log(`  - ${p.name} (${p.programType})`))

  } catch (error) {
    console.error('Error seeding programs:', error)
    throw error
  } finally {
    await closeDatabase()
  }
}

seed()
```

**Run seed script**:
```bash
bun run scripts/seed-programs.ts
```

### Verification Script (`scripts/verify-program-schema.ts`)

```typescript
import { db, closeDatabase } from '@/lib/db'
import { programs, programActivities, programEnrollments, attendanceRecords, applications } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'

async function verify() {
  try {
    console.log('Verifying program schema...\n')

    // Test 1: Programs table
    const programCount = await db.select({ count: sql<number>`count(*)` }).from(programs)
    console.log(`✅ Programs table: ${programCount[0].count} records`)

    // Test 2: Program Activities table
    const paCount = await db.select({ count: sql<number>`count(*)` }).from(programActivities)
    console.log(`✅ Program Activities table: ${paCount[0].count} records`)

    // Test 3: Program Enrollments table
    const peCount = await db.select({ count: sql<number>`count(*)` }).from(programEnrollments)
    console.log(`✅ Program Enrollments table: ${peCount[0].count} records`)

    // Test 4: Attendance Records table
    const arCount = await db.select({ count: sql<number>`count(*)` }).from(attendanceRecords)
    console.log(`✅ Attendance Records table: ${arCount[0].count} records`)

    // Test 5: Applications table extensions
    const appSample = await db.select({
      hasProgram: sql<boolean>`program_id IS NOT NULL`,
      hasGoal: sql<boolean>`goal IS NOT NULL`,
      hasGithub: sql<boolean>`github_username IS NOT NULL`,
      hasTwitter: sql<boolean>`twitter_username IS NOT NULL`,
    }).from(applications).limit(1)
    console.log('✅ Applications table extended with new columns')

    // Test 6: Verify foreign key constraints
    console.log('\n🔗 Testing foreign key constraints...')

    // Try to insert enrollment with invalid program (should fail)
    try {
      await db.insert(programEnrollments).values({
        userId: '00000000-0000-0000-0000-000000000000',
        programId: '00000000-0000-0000-0000-000000000000',
        enrollmentStatus: 'guest',
      })
      console.log('❌ Foreign key constraint NOT working (invalid insert succeeded)')
    } catch (error) {
      console.log('✅ Foreign key constraints working (invalid insert rejected)')
    }

    console.log('\n✅ Schema verification complete!')

  } catch (error) {
    console.error('❌ Schema verification failed:', error)
    throw error
  } finally {
    await closeDatabase()
  }
}

verify()
```

**Run verification**:
```bash
bun run scripts/verify-program-schema.ts
```

## 🔄 User Flow

**Database Setup Flow**:
```
1. Generate migration from schema files
2. Review generated SQL
3. Add CHECK constraint manually
4. Apply migration to dev database
5. Run seed script for initial programs
6. Run verification script
7. Visual inspection in Drizzle Studio
8. Mark ticket complete
```

## ✅ Acceptance Criteria

### Database Structure
- [ ] `programs` table created with all fields and constraints
- [ ] `program_activities` table created with unique constraint
- [ ] `program_enrollments` table created with unique constraint
- [ ] `attendance_records` table created with unique constraint
- [ ] `applications` table extended with 4 new columns
- [ ] Goal length CHECK constraint applied (140-280 chars)
- [ ] All foreign key relationships working correctly
- [ ] Cascade deletes configured properly

### Data Seeding
- [ ] 3 programs seeded successfully
- [ ] "De Cero a Chamba" program exists (cohort type)
- [ ] "DeFi-esta" program exists (cohort type)
- [ ] "Open" program exists (evergreen type)
- [ ] All programs have `isActive = true`

### Schema Validation
- [ ] All tables visible in Drizzle Studio
- [ ] No migration errors in dev environment
- [ ] Foreign key constraints prevent invalid data
- [ ] Unique constraints prevent duplicate entries
- [ ] Verification script runs without errors
- [ ] Schema exports work in TypeScript

### Migration Safety
- [ ] Migration is reversible (DOWN migration works)
- [ ] No data loss in existing tables
- [ ] Existing user and activity records intact
- [ ] Migration tested in isolated dev environment

## 🔗 Dependencies

### Blocks
- E3-T2A: Backend API Updates
- E3-T2B: Frontend Onboarding Components
- E3-T3A: Backend Guest Status Logic
- E3-T3B: Frontend Status UI
- E3-T4: Admin Applications Queue
- E3-T5: Admin Attendance Management
- E3-T6: Program Dashboard
- E3-T8: Admin Program CRUD

### Blocked By
- None (first task in epic)

### Related
- Existing `users` table - Foreign key reference
- Existing `activities` table - Foreign key reference
- Existing `applications` table - Extended in this ticket

## 🧪 Testing Plan

### Manual Testing Checklist
- [ ] Run `bun run db:generate` successfully
- [ ] Review generated migration SQL
- [ ] Run `bun run db:migrate` in dev
- [ ] No errors during migration
- [ ] Run seed script successfully
- [ ] Verify 3 programs in database
- [ ] Run verification script successfully
- [ ] Open Drizzle Studio and inspect tables
- [ ] Verify foreign key relationships visually
- [ ] Test rollback: `bun run db:migrate:down`
- [ ] Re-apply migration successfully

### Automated Testing
```typescript
// Example test (add to test suite)
describe('Program Schema', () => {
  it('should create programs table', async () => {
    const result = await db.select().from(programs).limit(1)
    expect(result).toBeDefined()
  })

  it('should enforce unique program-activity pairs', async () => {
    await expect(async () => {
      await db.insert(programActivities).values([
        { programId: 'test-id', activityId: 'test-activity' },
        { programId: 'test-id', activityId: 'test-activity' }, // duplicate
      ])
    }).rejects.toThrow()
  })

  it('should enforce goal length constraint', async () => {
    await expect(async () => {
      await db.insert(applications).values({
        userId: 'test-user',
        goal: 'too short', // < 140 chars
      })
    }).rejects.toThrow()
  })
})
```

## 📝 Implementation Notes

### Database Conventions
- Use `snake_case` for column names (PostgreSQL convention)
- Use `camelCase` in TypeScript/Drizzle definitions
- Include `createdAt`, `updatedAt` timestamps on all tables
- Include `metadata` JSONB column for extensibility
- Use UUID for all primary keys

### Common Pitfalls
1. **CHECK constraints**: Must be added in SQL migration file, not in Drizzle schema
2. **Cascade deletes**: Ensure `onDelete: 'cascade'` for junction tables
3. **Unique constraints**: Use table-level constraints, not column-level
4. **Timestamps**: Always use `withTimezone: true` for consistency

### Rollback Strategy
If migration fails in production:
1. Run down migration: `bun run db:migrate:down`
2. Fix schema issues
3. Generate new migration
4. Test thoroughly in staging
5. Re-apply to production

## 🚀 Deployment

### Pre-Deployment Checklist
- [ ] Migration tested in local dev
- [ ] Migration tested in staging environment
- [ ] Backup strategy confirmed
- [ ] Rollback procedure documented
- [ ] Team notified of deployment window

### Deployment Steps
```bash
# 1. Backup database (if production)
pg_dump $DATABASE_URL > backup_before_e3t1.sql

# 2. Apply migration
DATABASE_URL_UNPOOLED=$PROD_DB_UNPOOLED bun run db:migrate

# 3. Run seed script (production)
DATABASE_URL=$PROD_DB bun run scripts/seed-programs.ts

# 4. Verify schema
DATABASE_URL=$PROD_DB bun run scripts/verify-program-schema.ts

# 5. Check Vercel logs for errors
vercel logs
```

### Post-Deployment Verification
- [ ] No error logs in Vercel
- [ ] 3 programs visible in production database
- [ ] Can query programs via API (once T2 complete)
- [ ] Foreign key constraints working in production

## 📚 Documentation

### Files to Update
- [ ] [CLAUDE.md](../../CLAUDE.md) - Add new tables to Database Architecture section
- [ ] [docs/database/schema.md](../../database/schema.md) - Document new tables and relationships
- [ ] [docs/database/migrations.md](../../database/migrations.md) - Add migration notes

### Documentation Content

Add to CLAUDE.md:
```markdown
### Program Management Tables
- **programs** - Learning program definitions (De Cero a Chamba, DeFi-esta, Open)
- **program_activities** - Junction table linking programs to activities
- **program_enrollments** - User enrollment tracking (guest/active/completed status)
- **attendance_records** - Session attendance tracking (present/absent/excused)
- **applications** - Extended with programId, goal, githubUsername, twitterUsername
```

## 🔄 Future Iterations

### Phase 2 Enhancements (Post-MVP)
- Add `program_cohorts` table for cohort-specific data (start dates, end dates)
- Add `program_mentors` table for mentor assignment
- Add `program_prerequisites` table for course dependencies
- Add `program_certificates` table for completion certificates

### Phase 3 Enhancements (6-12 months)
- Add `program_analytics` table for metrics tracking
- Add `program_feedback` table for user feedback
- Add soft delete support (deletedAt timestamp)
- Add audit logging for program changes

## 📖 References

- **Database Design**: [docs/database/schema.md](../../database/schema.md)
- **Migration Guide**: [docs/database/migrations.md](../../database/migrations.md)
- **Drizzle Documentation**: https://orm.drizzle.team/docs/overview
- **PostgreSQL Constraints**: https://www.postgresql.org/docs/current/ddl-constraints.html

---

## 📊 Progress Tracking

### Time Tracking
- **Estimated**: 16 hours (2 days)
- **Actual**: ___ hours
- **Variance**: ___ hours

### Milestones
- [ ] Schema files created
- [ ] Migration generated
- [ ] CHECK constraint added
- [ ] Migration applied to dev
- [ ] Seed script run successfully
- [ ] Verification script passing
- [ ] Visual inspection complete
- [ ] Documentation updated

### Blockers
_None currently. Document any blockers that arise during implementation._

---

**Last Updated**: 2026-01-06
**Assignee**: Backend Lead
**Reviewer**: Tech Lead
**Status**: Ready for Implementation
