# Ticket E0-T0: PostgreSQL Database Setup

**Epic:** 0 - Project Setup & Infrastructure
**Story Points:** 2
**Dependencies:** None
**Assignee:** Backend Developer
**Estimated Time:** 1-2 hours

---

## Objective

Set up shared hosted PostgreSQL database (Railway or Vercel Postgres) with Drizzle ORM and ensure all team members can sync to the latest database schema via migrations.

---

## Success Criteria

- ✅ Hosted PostgreSQL database provisioned (Railway or Vercel Postgres)
- ✅ Drizzle ORM configured and connected
- ✅ Database schema defined for Epic 1 (users, profiles, applications, invitations)
- ✅ Migration system set up for team synchronization
- ✅ All team members can pull environment variables via Vercel CLI
- ✅ Migrations run successfully to sync everyone to latest schema
- ✅ Drizzle Studio accessible for visual database browsing

---

## Prerequisites

### 1. Vercel CLI Installation

```bash
# Install Vercel CLI globally
npm i -g vercel

# Or via Bun
bun add -g vercel

# Verify installation
vercel --version
# Expected: Vercel CLI 33.x or higher
```

### 2. Bun Runtime

```bash
# Install Bun (macOS/Linux)
curl -fsSL https://bun.sh/install | bash

# Windows (via PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"

# Verify installation
bun --version
# Expected: 1.0.x or higher
```

### 3. Git

```bash
# Verify Git installation
git --version
# Expected: git version 2.x or higher
```

---

## Implementation Steps

### Step 1: Provision Hosted Database

**Option A: Vercel Postgres (Recommended for Vercel deployments)**

```bash
# In your project directory
vercel link  # Link to existing Vercel project

# Create Postgres database
vercel postgres create poktapok-db

# Copy connection string to .env.local
# Vercel will provide: POSTGRES_URL, POSTGRES_URL_NON_POOLING, etc.
```

**Option B: Railway (Alternative)**

```bash
# 1. Go to https://railway.app
# 2. Create new project
# 3. Add PostgreSQL database
# 4. Copy DATABASE_URL from Railway dashboard
# 5. Add to .env.local manually
```

**For this guide, we'll use Vercel Postgres** (seamless integration with Vercel deployments).

---

### Step 2: Install Dependencies

```bash
# Install Drizzle ORM and PostgreSQL client
bun add drizzle-orm postgres

# Install Drizzle Kit (development tools)
bun add -d drizzle-kit

# Install environment variable loader
bun add dotenv
```

**Why these packages:**
- `drizzle-orm` - Type-safe ORM for TypeScript
- `postgres` - PostgreSQL client optimized for serverless
- `drizzle-kit` - CLI for migrations and Drizzle Studio
- `dotenv` - Load environment variables

---

### Step 3: Pull Environment Variables

**For Team Members:**

```bash
# Link to Vercel project (first time only)
vercel link

# Pull environment variables from Vercel
vercel env pull .env.local

# This downloads all environment variables including:
# - POSTGRES_URL (connection pooler)
# - POSTGRES_URL_NON_POOLING (direct connection for migrations)
# - NEXT_PUBLIC_PRIVY_APP_ID
# - NEXT_PUBLIC_PRIVY_CLIENT_ID
# - etc.
```

**Manual Setup (if not using Vercel CLI):**

Create `.env.local` manually:

```bash
# Database (get from project lead or Railway/Vercel dashboard)
POSTGRES_URL=postgresql://user:password@host:5432/database
POSTGRES_URL_NON_POOLING=postgresql://user:password@host:5432/database

# Privy Authentication
NEXT_PUBLIC_PRIVY_APP_ID=
NEXT_PUBLIC_PRIVY_CLIENT_ID=
NEXT_PUBLIC_PRIVY_APP_SECRET=

# Alchemy API Key
NEXT_PUBLIC_ALCHEMY_API_KEY=

# Cloudflare R2 (optional for now)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
```

---

### Step 4: Create Drizzle Configuration

**File:** `drizzle.config.ts` (project root)

```typescript
import { defineConfig } from 'drizzle-kit'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

export default defineConfig({
  schema: './drizzle/schema/index.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // Use non-pooling URL for migrations (direct connection)
    url: process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
  migrations: {
    table: 'drizzle_migrations',
    schema: 'public',
  },
})
```

**Important:** Use `POSTGRES_URL_NON_POOLING` for migrations to avoid connection pooler issues.

---

### Step 5: Define Database Schema

Create the following directory structure:

```
drizzle/
├── schema/
│   ├── users.ts
│   ├── profiles.ts
│   ├── applications.ts
│   ├── invitations.ts
│   └── index.ts
└── migrations/           # Auto-generated (git-tracked)
```

#### File: `drizzle/schema/users.ts`

```typescript
import { pgTable, uuid, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core'

// Enums
export const userRoleEnum = pgEnum('user_role', ['member', 'admin', 'moderator'])
export const accountStatusEnum = pgEnum('account_status', ['active', 'suspended', 'pending'])

// Users table (identity & auth)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  authId: varchar('auth_id', { length: 255 }).unique().notNull(), // Privy user ID
  email: varchar('email', { length: 255 }).unique().notNull(),
  walletAddress: varchar('wallet_address', { length: 42 }).unique(),
  role: userRoleEnum('role').default('member').notNull(),
  accountStatus: accountStatusEnum('account_status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at').defaultNow().notNull(),
  invitedBy: uuid('invited_by').references(() => users.id),
  approvedBy: uuid('approved_by').references(() => users.id),
})

// TypeScript types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
```

#### File: `drizzle/schema/profiles.ts`

```typescript
import { pgTable, uuid, varchar, text, timestamp, integer, bigint, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './users'

// Enums
export const learningTrackEnum = pgEnum('learning_track', ['ai', 'crypto', 'privacy'])
export const availabilityStatusEnum = pgEnum('availability_status', [
  'learning',
  'building',
  'open-to-bounties',
])
export const profileVisibilityEnum = pgEnum('profile_visibility', [
  'public',
  'private',
  'members-only',
])

// Profiles table (display data)
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).unique().notNull(),
  username: varchar('username', { length: 50 }).unique().notNull(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  bio: text('bio'), // Max 280 enforced at app level
  avatarUrl: varchar('avatar_url', { length: 500 }),
  city: varchar('city', { length: 100 }),
  country: varchar('country', { length: 100 }),
  learningTracks: learningTrackEnum('learning_tracks').array(),
  availabilityStatus: availabilityStatusEnum('availability_status').default('learning'),
  githubUsername: varchar('github_username', { length: 100 }),
  twitterUsername: varchar('twitter_username', { length: 100 }),
  linkedinSlug: varchar('linkedin_slug', { length: 100 }),
  telegramUsername: varchar('telegram_username', { length: 100 }),
  profileVisibility: profileVisibilityEnum('profile_visibility').default('public').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  completedBounties: integer('completed_bounties').default(0).notNull(),
  totalEarnings: bigint('total_earnings', { mode: 'number' }).default(0).notNull(),
})

export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert
```

#### File: `drizzle/schema/applications.ts`

```typescript
import { pgTable, uuid, varchar, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './users'

export const applicationStatusEnum = pgEnum('application_status', [
  'pending',
  'approved',
  'rejected',
])

export const applications = pgTable('applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull(),
  reason: text('reason').notNull(),
  referralCode: varchar('referral_code', { length: 50 }),
  status: applicationStatusEnum('status').default('pending').notNull(),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  reviewedAt: timestamp('reviewed_at'),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewNotes: text('review_notes'),
})

export type Application = typeof applications.$inferSelect
export type NewApplication = typeof applications.$inferInsert
```

#### File: `drizzle/schema/invitations.ts`

```typescript
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

export const invitations = pgTable('invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  inviterId: uuid('inviter_id').references(() => users.id).notNull(),
  inviteeEmail: varchar('invitee_email', { length: 255 }).notNull(),
  code: varchar('code', { length: 50 }).unique().notNull(),
  usedAt: timestamp('used_at'),
  usedBy: uuid('used_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
})

export type Invitation = typeof invitations.$inferSelect
export type NewInvitation = typeof invitations.$inferInsert
```

#### File: `drizzle/schema/index.ts`

```typescript
// Export all schemas
export * from './users'
export * from './profiles'
export * from './applications'
export * from './invitations'
```

---

### Step 6: Create Database Client

Create this directory structure:

```
src/lib/db/
├── index.ts
├── schema.ts
└── queries/
    └── (query files will be added in Epic 1 tickets)
```

#### File: `src/lib/db/index.ts`

```typescript
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Get connection string from environment
// Use pooled connection for app queries
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL

if (!connectionString) {
  throw new Error(
    'POSTGRES_URL or DATABASE_URL is not set. Please add it to your .env.local file.'
  )
}

// PostgreSQL client with connection pooling
const client = postgres(connectionString, {
  prepare: false, // Required for Vercel Postgres connection pooler
})

// Drizzle ORM instance
export const db = drizzle(client, { schema })

// Export schema for type safety
export { schema }
```

#### File: `src/lib/db/schema.ts`

```typescript
// Re-export all schemas for convenient imports in app code
export * from '../../../drizzle/schema'
```

---

### Step 7: Add Database Scripts to package.json

**File:** `package.json` (add to existing `scripts` section)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",

    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "db:push": "drizzle-kit push"
  }
}
```

**Script Descriptions:**

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `db:generate` | Generate migration files from schema changes | After modifying schema files |
| `db:migrate` | Apply migrations to database | First setup, after pulling new migrations |
| `db:studio` | Launch Drizzle Studio GUI | Browse/edit data visually |
| `db:push` | Push schema directly (skip migrations) | Rapid prototyping only (not for shared DB) |

**Important:** With a shared hosted database, always use `db:generate` + `db:migrate` workflow. Never use `db:push` as it bypasses migration tracking.

---

### Step 8: Generate and Run Initial Migration

```bash
# Generate migration from schema definitions
bun run db:generate

# This creates files in drizzle/migrations/
# Example: drizzle/migrations/0000_initial.sql

# Review the generated SQL (optional but recommended)
cat drizzle/migrations/0000_*.sql

# Apply migration to hosted database
bun run db:migrate

# Expected output:
# ✓ Migrating...
# ✓ Migration applied successfully
```

**Important:** The person who creates the initial schema should run `db:generate` and commit the migration files to git. Other team members will pull these migrations and run `db:migrate`.

---

### Step 9: Update .gitignore

**File:** `.gitignore` (ensure these lines exist)

```bash
# Environment variables
.env*
!.env.example

# Drizzle Studio cache
.drizzle/

# Vercel
.vercel
```

**Important:** Migration files in `drizzle/migrations/` **should be committed to git** (do not ignore them).

---

## Testing & Verification

### Step 1: Verify Environment Variables

```bash
# Check that environment variables are loaded
echo $POSTGRES_URL
# Should output connection string

# Or check .env.local exists
cat .env.local | grep POSTGRES_URL
```

### Step 2: Test Database Connection

Create a test script: `test-db.ts`

```typescript
import { db } from './src/lib/db'
import { users } from './src/lib/db/schema'

async function testConnection() {
  try {
    const allUsers = await db.select().from(users)
    console.log('✅ Database connection successful!')
    console.log(`Found ${allUsers.length} users`)
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  }
  process.exit(0)
}

testConnection()
```

Run:
```bash
bun run test-db.ts

# Expected output:
# ✅ Database connection successful!
# Found 0 users (empty database initially)
```

### Step 3: Verify Migration Status

```bash
# Check which migrations have been applied
# Use Drizzle Studio or query directly
bun run db:studio

# Open browser to https://local.drizzle.studio
# Navigate to "drizzle_migrations" table
# Should see entry for initial migration
```

### Step 4: Verify Tables Exist

In Drizzle Studio:
1. Check left sidebar shows tables: `users`, `profiles`, `applications`, `invitations`
2. Click on each table to verify structure matches schema
3. Verify enums are created (in "Types" section)

---

## Team Synchronization Workflow

### For the First Developer (Initial Setup)

```bash
# 1. Create schema definitions (already done in Step 5)
# 2. Generate migration
bun run db:generate

# 3. Review migration SQL
cat drizzle/migrations/0000_*.sql

# 4. Apply migration
bun run db:migrate

# 5. Commit schema + migrations to git
git add drizzle/
git commit -m "E0-T0: Initial database schema and migration"
git push
```

### For Other Team Members (Joining Later)

```bash
# 1. Pull latest code
git pull origin dev

# 2. Install dependencies
bun install

# 3. Pull environment variables from Vercel
vercel env pull .env.local

# 4. Apply all migrations
bun run db:migrate

# 5. Verify connection
bun run test-db.ts

# 6. (Optional) Open Drizzle Studio
bun run db:studio
```

### When Schema Changes (Ongoing Development)

**Developer Making Changes:**

```bash
# 1. Modify schema files (e.g., add new column to profiles.ts)

# 2. Generate migration
bun run db:generate
# This creates a new migration file: 0001_add_column.sql

# 3. Review generated SQL
cat drizzle/migrations/0001_*.sql

# 4. Apply locally
bun run db:migrate

# 5. Test changes
bun dev

# 6. Commit changes
git add drizzle/
git commit -m "Add avatar_url to profiles table"
git push
```

**Other Team Members Syncing:**

```bash
# 1. Pull latest changes
git pull origin dev

# 2. Apply new migrations
bun run db:migrate
# Drizzle automatically detects and applies only new migrations

# 3. Restart dev server
bun dev
```

---

## Common Issues & Solutions

### Issue 1: "POSTGRES_URL not set"

**Cause:** Environment variables not loaded

**Solution:**
```bash
# Pull environment variables
vercel env pull .env.local

# Or verify .env.local exists and has POSTGRES_URL
cat .env.local | grep POSTGRES
```

### Issue 2: "Connection timeout" or "Cannot connect to database"

**Cause:** Wrong connection string or network issue

**Solution:**
```bash
# Verify connection string format
# Should be: postgresql://user:password@host:port/database

# Test connection directly
psql $POSTGRES_URL_NON_POOLING
# If this works, issue is with application code

# Check firewall/VPN settings
# Railway/Vercel Postgres are public, but some networks block outbound connections
```

### Issue 3: "Migration already applied" error

**Cause:** Trying to apply same migration twice

**Solution:**
```bash
# Check migration status in Drizzle Studio
bun run db:studio
# Look at drizzle_migrations table

# If migration is already applied, pull latest code
git pull origin dev

# Drizzle will skip already-applied migrations
bun run db:migrate
```

### Issue 4: "Table already exists" when running migrations

**Cause:** Database has tables but no migration history

**Solution:**
```bash
# This happens if someone used db:push instead of migrations
# Two options:

# Option 1: Reset database (destructive, lose all data)
# Contact DevOps to drop all tables and start fresh

# Option 2: Manually mark migrations as applied
# Insert records into drizzle_migrations table for each migration
# (Advanced, not recommended)
```

---

## Team Onboarding Checklist

Use this checklist for new developers joining the project:

**Prerequisites (one-time setup):**
- [ ] Vercel CLI installed (`npm i -g vercel`)
  - [ ] Verified with `vercel --version`
  - [ ] Logged in with `vercel login`
- [ ] Bun installed
  - [ ] Run `curl -fsSL https://bun.sh/install | bash` (macOS/Linux)
  - [ ] Verified with `bun --version` (1.0+)
- [ ] Git installed and configured
  - [ ] Verified with `git --version`

**Project setup:**
- [ ] Repository cloned (`git clone ...`)
- [ ] Dependencies installed (`bun install`)
- [ ] Linked to Vercel project (`vercel link`)
- [ ] Environment variables pulled (`vercel env pull .env.local`)
  - [ ] Verified POSTGRES_URL exists in `.env.local`
- [ ] Migrations applied (`bun run db:migrate`)
  - [ ] No errors during migration
  - [ ] All tables created successfully
- [ ] Database connection tested (`bun run test-db.ts`)
  - [ ] "Connection successful" message appears
- [ ] Drizzle Studio opened successfully (`bun run db:studio`)
  - [ ] Can see tables: users, profiles, applications, invitations
- [ ] Dev server starts (`bun dev`)
  - [ ] Accessible at http://localhost:3000

**Total estimated onboarding time:** 10-15 minutes

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│           Developer Machines (Team Members)             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Developer 1               Developer 2                  │
│  ├─ Next.js App           ├─ Next.js App               │
│  ├─ .env.local            ├─ .env.local                │
│  └─ drizzle/migrations/   └─ drizzle/migrations/       │
│                                                          │
│              ↓ POSTGRES_URL ↓                           │
└─────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────┐
│         Hosted PostgreSQL (Railway/Vercel)              │
├─────────────────────────────────────────────────────────┤
│  Database: poktapok_production                          │
│  Tables:                                                 │
│  - users                                                 │
│  - profiles                                              │
│  - applications                                          │
│  - invitations                                           │
│  - drizzle_migrations (tracks applied migrations)       │
│                                                          │
│  Shared by all team members                             │
└─────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────┐
│              Drizzle Studio (Local)                     │
│              https://local.drizzle.studio                │
│                                                          │
│  Browse tables → View data → Edit records              │
│  (connects to hosted database)                          │
└─────────────────────────────────────────────────────────┘
```

---

## Acceptance Criteria Checklist

Before marking this ticket as complete, verify:

- [ ] Hosted database provisioned (Vercel Postgres or Railway)
- [ ] All dependencies installed (`drizzle-orm`, `postgres`, `drizzle-kit`)
- [ ] `drizzle.config.ts` created and uses POSTGRES_URL_NON_POOLING
- [ ] All 4 schema files created (`users.ts`, `profiles.ts`, `applications.ts`, `invitations.ts`)
- [ ] Schema index file exports all tables
- [ ] Database client (`src/lib/db/index.ts`) created with pooling configuration
- [ ] Initial migration generated (`bun run db:generate`)
- [ ] Migration applied to hosted database (`bun run db:migrate`)
- [ ] Migration files committed to git
- [ ] All 4 database scripts added to `package.json`
- [ ] `.gitignore` updated (excludes .env*, includes migrations)
- [ ] Test connection script confirms connectivity
- [ ] Drizzle Studio opens and shows all tables
- [ ] At least 2 team members have successfully synced to latest schema

---

## Files Changed Summary

**Created:**
- `drizzle.config.ts`
- `drizzle/schema/users.ts`
- `drizzle/schema/profiles.ts`
- `drizzle/schema/applications.ts`
- `drizzle/schema/invitations.ts`
- `drizzle/schema/index.ts`
- `drizzle/migrations/0000_initial.sql` (generated)
- `drizzle/migrations/meta/...` (generated metadata)
- `src/lib/db/index.ts`
- `src/lib/db/schema.ts`
- `test-db.ts` (temporary, can delete after verification)

**Modified:**
- `package.json` (add 4 db scripts)
- `.gitignore` (ensure proper exclusions)
- `.env.local` (via `vercel env pull`, not committed)

**Total:** 11+ new files, 2 modified files

---

## Next Steps

After completing this ticket:

1. **Commit changes:**
   ```bash
   git add .
   git commit -m "E0-T0: Set up hosted PostgreSQL with Drizzle ORM and migrations"
   git push origin E0-T0-database-setup
   ```

2. **Create PR:**
   - Title: `[E0-T0] PostgreSQL Database Setup (Hosted)`
   - Link to this ticket
   - Add screenshots of Drizzle Studio showing tables
   - Include migration SQL in PR description
   - Request review from team lead

3. **Team Sync:**
   - Post in team Slack: "Database setup complete! Run `vercel env pull .env.local` then `bun run db:migrate`"
   - Schedule 15-min walkthrough for team members
   - Document any connection issues specific to team's network setup

4. **Move to Next Ticket:**
   - **E1-T1:** Authentication Integration (Privy Setup)

---

**Ticket Status:** ✅ Ready for Implementation
**Blocked By:** None
**Blocking:** All Epic 1 tickets
