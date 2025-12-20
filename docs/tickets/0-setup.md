# Ticket E0-T0: PostgreSQL Database Setup

**Epic:** 0 - Project Setup & Infrastructure
**Story Points:** 3
**Dependencies:** None
**Assignee:** Backend Developer
**Estimated Time:** 2-3 hours

---

## Objective

Set up local PostgreSQL database with Docker Compose and Drizzle ORM to enable rapid development for the entire team.

---

## Success Criteria

- ✅ PostgreSQL 16 running in Docker container
- ✅ Drizzle ORM configured and connected
- ✅ Database schema defined for Epic 1 (users, profiles, applications, invitations)
- ✅ All team members can run `bun run db:setup` and have a working database
- ✅ Drizzle Studio accessible for visual database browsing

---

## Prerequisites

Before starting, ensure you have the following installed:

### 1. Docker Desktop Installation

**Why Docker?**
- Isolated PostgreSQL environment (no system-wide installation)
- Consistent across all team members (Windows, Mac, Linux)
- Easy cleanup and reset
- Production-like environment locally

#### Installation Instructions

**macOS:**
```bash
# Option 1: Download from Docker website
# Visit https://www.docker.com/products/docker-desktop
# Download and install Docker Desktop for Mac

# Option 2: Install via Homebrew
brew install --cask docker

# After installation, start Docker Desktop from Applications
```

**Windows:**
```bash
# Download Docker Desktop for Windows
# Visit https://www.docker.com/products/docker-desktop
# Download and install Docker Desktop for Windows

# Requirements:
# - Windows 10/11 Pro, Enterprise, or Education
# - WSL 2 backend enabled
# - Virtualization enabled in BIOS

# After installation, start Docker Desktop from Start menu
```

**Linux (Ubuntu/Debian):**
```bash
# Remove old versions
sudo apt-get remove docker docker-engine docker.io containerd runc

# Install Docker Engine
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group (avoid sudo)
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Log out and back in for group changes to take effect
```

#### Verify Docker Installation

```bash
# Check Docker version
docker --version
# Expected: Docker version 24.x.x or higher

# Check Docker Compose version
docker compose version
# Expected: Docker Compose version v2.x.x or higher

# Verify Docker is running
docker ps
# Expected: Empty table (no containers running yet)

# Test Docker with hello-world
docker run hello-world
# Expected: "Hello from Docker!" message
```

**Troubleshooting Docker:**

If `docker ps` shows permission denied:
```bash
# Linux only - ensure user is in docker group
groups
# Should show "docker" in the list

# If not, run:
sudo usermod -aG docker $USER
newgrp docker
```

If Docker Desktop won't start (macOS/Windows):
- Restart your computer
- Check system requirements (RAM, CPU virtualization)
- Check Docker Desktop logs (Settings → Troubleshoot → View logs)

### 2. Bun Runtime Installation

```bash
# Install Bun (macOS/Linux)
curl -fsSL https://bun.sh/install | bash

# Windows (via PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"

# Verify installation
bun --version
# Expected: 1.0.x or higher
```

### 3. Git (should already be installed)

```bash
# Verify Git installation
git --version
# Expected: git version 2.x or higher
```

---

## Implementation Steps

### Step 1: Install Node Dependencies

```bash
# Install Drizzle ORM and PostgreSQL client
bun add drizzle-orm postgres dotenv

# Install Drizzle Kit (development tools)
bun add -d drizzle-kit
```

**Why these packages:**
- `drizzle-orm` - Type-safe ORM for TypeScript
- `postgres` - PostgreSQL client optimized for Bun
- `drizzle-kit` - CLI for migrations and Drizzle Studio
- `dotenv` - Load environment variables (Bun has native support)

---

### Step 2: Create Docker Compose Configuration

**File:** `docker-compose.yml` (project root)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: poktapok-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: poktapok
      POSTGRES_PASSWORD: dev_password_123
      POSTGRES_DB: poktapok_dev
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U poktapok"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
    driver: local
```

**Configuration Details:**
- **Image:** PostgreSQL 16 Alpine (lightweight, matches Railway production)
- **Container name:** `poktapok-db` (easy to reference)
- **Port:** 5432 (standard PostgreSQL port)
- **Volume:** Persistent data storage (survives container restarts)
- **Health check:** Ensures database is ready before app connects

---

### Step 3: Create Drizzle Configuration

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
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
  migrations: {
    table: 'drizzle_migrations',
    schema: 'public',
  },
})
```

**Purpose:**
- Tells Drizzle Kit where to find schema definitions
- Configures migration output directory
- Connects to database via DATABASE_URL

---

### Step 4: Update Environment Variables

**File:** `.env.local` (update existing file)

Add this line:

```bash
# Local Development Database
DATABASE_URL=postgresql://poktapok:dev_password_123@localhost:5432/poktapok_dev
```

**File:** `.env.example` (create new file for team onboarding)

```bash
# Local Development Database
DATABASE_URL=postgresql://poktapok:dev_password_123@localhost:5432/poktapok_dev

# Cloudflare R2 Configuration
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=

# Alchemy API Key
NEXT_PUBLIC_ALCHEMY_API_KEY=

# Privy Authentication
NEXT_PUBLIC_PRIVY_APP_ID=
NEXT_PUBLIC_PRIVY_CLIENT_ID=
NEXT_PUBLIC_PRIVY_APP_SECRET=
```

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
├── seed/
│   └── dev-seed.ts
└── migrate.ts
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

// Connection string from environment
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error(
    'DATABASE_URL is not set. Please add it to your .env.local file.'
  )
}

// PostgreSQL client
const client = postgres(connectionString, {
  max: 10, // Connection pool size
  idle_timeout: 20, // Close idle connections after 20s
  connect_timeout: 10, // Fail fast if DB unreachable
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

### Step 7: Create Seed Data Script

#### File: `drizzle/seed/dev-seed.ts`

```typescript
import { db } from '../../src/lib/db'
import { users, profiles, applications, invitations } from '../../src/lib/db/schema'

async function seed() {
  console.log('🌱 Seeding database...')

  try {
    // Create test users
    const [carlos] = await db
      .insert(users)
      .values({
        authId: 'test-privy-carlos',
        email: 'carlos@example.com',
        role: 'member',
        accountStatus: 'active',
      })
      .returning()

    const [sofia] = await db
      .insert(users)
      .values({
        authId: 'test-privy-sofia',
        email: 'sofia@example.com',
        role: 'member',
        accountStatus: 'active',
      })
      .returning()

    // Create profiles
    await db.insert(profiles).values([
      {
        userId: carlos.id,
        username: 'carlos_dev',
        displayName: 'Carlos Rodriguez',
        bio: 'Full-stack developer learning Web3 and DeFi. Building the future of money.',
        city: 'Buenos Aires',
        country: 'Argentina',
        learningTracks: ['crypto'],
        availabilityStatus: 'open-to-bounties',
        githubUsername: 'carlosdev',
        twitterUsername: 'carlos_builds',
        profileVisibility: 'public',
      },
      {
        userId: sofia.id,
        username: 'sofia_codes',
        displayName: 'Sofia Martinez',
        bio: 'CS student building AI projects. Passionate about machine learning and data science.',
        city: 'Mexico City',
        country: 'Mexico',
        learningTracks: ['ai'],
        availabilityStatus: 'learning',
        githubUsername: 'sofiacodes',
        linkedinSlug: 'sofia-martinez-dev',
        profileVisibility: 'public',
      },
    ])

    // Create pending applications
    await db.insert(applications).values([
      {
        email: 'juan@example.com',
        reason: 'Want to learn Web3 development and earn while learning',
        status: 'pending',
      },
      {
        email: 'maria@example.com',
        reason: 'Transitioning from traditional development to blockchain',
        status: 'pending',
      },
    ])

    // Create sample invitation
    await db.insert(invitations).values({
      inviterId: carlos.id,
      inviteeEmail: 'friend@example.com',
      code: 'WELCOME123',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    })

    console.log('✅ Database seeded successfully')
    console.log('📦 Created:')
    console.log('  - 2 test users (carlos_dev, sofia_codes)')
    console.log('  - 2 profiles with social links')
    console.log('  - 2 pending applications')
    console.log('  - 1 invitation code')
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }

  process.exit(0)
}

seed()
```

---

### Step 8: Add Database Scripts to package.json

**File:** `package.json` (add to existing `scripts` section)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",

    "db:start": "docker compose up -d",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:seed": "bun run drizzle/seed/dev-seed.ts",
    "db:setup": "bun run db:start && sleep 3 && bun run db:push && bun run db:seed"
  }
}
```

**Script Descriptions:**

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `db:start` | Start PostgreSQL container | Beginning of work session |
| `db:push` | Push schema directly to database (no migration files) | Local development, schema iteration |
| `db:studio` | Launch Drizzle Studio GUI | Browse/edit data visually |
| `db:seed` | Populate database with test data | After schema changes, fresh database |
| `db:setup` | One-command full setup | **First time setup or after `docker compose down -v`** |

**Why only 5 scripts:**
- **Simplicity:** Most developers only need these 5 commands
- **db:start:** Essential for starting the database
- **db:push:** Fastest way to sync schema during development (no migration overhead)
- **db:studio:** Visual debugging tool for data exploration
- **db:seed:** Quick way to populate test data
- **db:setup:** One-liner for new developers or after reset

**Removed scripts (from original plan):**
- ❌ `db:stop` - Container runs in background, rarely need to stop explicitly
- ❌ `db:restart` - Just run `db:start` again if needed
- ❌ `db:logs` - Use `docker logs poktapok-db` directly if troubleshooting
- ❌ `db:reset` - Use `docker compose down -v && bun run db:setup` manually (prevents accidents)
- ❌ `db:generate` - Production migrations (not needed for local dev iteration)
- ❌ `db:migrate` - Production-only (Railway will handle this)

---

### Step 9: Update .gitignore

**File:** `.gitignore` (add these lines)

```bash
# Drizzle Studio cache
.drizzle/

# Environment variables (already ignored, but ensure it's there)
.env*
!.env.example
```

---

## Testing & Verification

### Step 1: Start the Database

```bash
# Start PostgreSQL container
bun run db:start

# Verify container is running
docker ps
# Should show "poktapok-db" with status "Up"
```

### Step 2: Push Schema

```bash
# Push schema to database
bun run db:push

# You should see output like:
# ✓ Applying changes...
# ✓ Changes applied successfully
```

### Step 3: Seed Test Data

```bash
# Populate database with test data
bun run db:seed

# You should see:
# 🌱 Seeding database...
# ✅ Database seeded successfully
# 📦 Created: ...
```

### Step 4: Open Drizzle Studio

```bash
# Launch Drizzle Studio
bun run db:studio

# Open browser to https://local.drizzle.studio
# You should see tables: users, profiles, applications, invitations
```

**Manual Verification in Drizzle Studio:**
1. Click on `profiles` table
2. You should see 2 records (carlos_dev, sofia_codes)
3. Verify social links are populated correctly
4. Check that `applications` table has 2 pending applications

### Step 5: Test Database Connection

Create a test script: `test-db.ts`

```typescript
import { db } from './src/lib/db'
import { profiles } from './src/lib/db/schema'

async function testConnection() {
  try {
    const allProfiles = await db.select().from(profiles)
    console.log('✅ Database connection successful!')
    console.log(`Found ${allProfiles.length} profiles`)
    console.log(allProfiles)
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
# Found 2 profiles
# [ { username: 'carlos_dev', ... }, { username: 'sofia_codes', ... } ]
```

---

## Common Issues & Solutions

### Issue 1: "Port 5432 already in use"

**Cause:** Another PostgreSQL instance or container is running

**Solution:**
```bash
# Check what's using port 5432
lsof -i :5432

# If it's another Docker container
docker ps
docker stop <container-name>

# If it's system PostgreSQL
sudo systemctl stop postgresql
```

### Issue 2: "DATABASE_URL not set"

**Cause:** Missing or incorrect `.env.local` file

**Solution:**
```bash
# Check file exists
ls -la .env.local

# If missing, copy template
cp .env.example .env.local

# Verify DATABASE_URL is correct
cat .env.local | grep DATABASE_URL
```

### Issue 3: "Cannot connect to database"

**Cause:** Container not running or not healthy

**Solution:**
```bash
# Check container status
docker ps -a

# If exited, check logs
docker logs poktapok-db

# Restart container
docker compose down
docker compose up -d

# Wait for health check
docker ps
# Status should show "(healthy)"
```

### Issue 4: "Drizzle Studio shows no tables"

**Cause:** Schema not pushed to database

**Solution:**
```bash
# Push schema
bun run db:push

# Verify tables exist
docker exec -it poktapok-db psql -U poktapok -d poktapok_dev -c "\dt"

# Should list: users, profiles, applications, invitations
```

---

## Team Onboarding Checklist

Use this checklist for new developers joining the project:

**Prerequisites (one-time setup):**
- [ ] Docker Desktop installed
  - [ ] Verified with `docker --version` (24.x+)
  - [ ] Verified with `docker compose version` (v2.x+)
  - [ ] Tested with `docker run hello-world`
  - [ ] Docker Desktop is running (check system tray/menu bar)
- [ ] Bun installed
  - [ ] Run `curl -fsSL https://bun.sh/install | bash` (macOS/Linux)
  - [ ] Verified with `bun --version` (1.0+)
- [ ] Git installed and configured
  - [ ] Verified with `git --version`

**Project setup:**
- [ ] Repository cloned (`git clone ...`)
- [ ] Dependencies installed (`bun install`)
- [ ] `.env.local` created from `.env.example`
- [ ] Privy credentials added to `.env.local` (get from team lead)
- [ ] Database setup completed (`bun run db:setup`)
  - [ ] PostgreSQL container is running (`docker ps` shows `poktapok-db`)
  - [ ] Schema pushed successfully (no errors)
  - [ ] Seed data created (see success message)
- [ ] Drizzle Studio opened successfully (`bun run db:studio`)
  - [ ] Can see tables: users, profiles, applications, invitations
  - [ ] Can see 2 profiles in profiles table
- [ ] Test connection script runs (`bun run test-db.ts`)
- [ ] Dev server starts (`bun dev`)
  - [ ] Accessible at http://localhost:3000

**Total estimated onboarding time:**
- With Docker already installed: 10-15 minutes
- First-time Docker installation: 20-30 minutes

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│              Developer Machine (localhost)              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Next.js App (port 3000)                                │
│  ↓ imports src/lib/db/index.ts                         │
│  ↓ uses Drizzle ORM queries                            │
│                                                          │
│        DATABASE_URL (env var)                           │
│        ↓                                                 │
│                                                          │
│  Docker Container: poktapok-db                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  PostgreSQL 16                                  │    │
│  │  - Database: poktapok_dev                      │    │
│  │  - User: poktapok                              │    │
│  │  - Port: 5432                                  │    │
│  │  - Tables: users, profiles, applications,     │    │
│  │            invitations                         │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Volume: postgres_data (persistent storage)             │
│                                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│            Drizzle Studio (browser)                     │
│            https://local.drizzle.studio                  │
│                                                          │
│  Browse tables → View data → Run queries               │
└─────────────────────────────────────────────────────────┘
```

---

## Acceptance Criteria Checklist

Before marking this ticket as complete, verify:

- [ ] All dependencies installed (`drizzle-orm`, `postgres`, `drizzle-kit`, `dotenv`)
- [ ] `docker-compose.yml` created and container starts successfully
- [ ] `drizzle.config.ts` created and configured correctly
- [ ] `.env.local` contains correct `DATABASE_URL`
- [ ] `.env.example` created for team onboarding
- [ ] All 4 schema files created (`users.ts`, `profiles.ts`, `applications.ts`, `invitations.ts`)
- [ ] Schema index file exports all tables
- [ ] Database client (`src/lib/db/index.ts`) created
- [ ] Seed script creates test data successfully
- [ ] All 5 database scripts added to `package.json`
- [ ] `bun run db:setup` works end-to-end
- [ ] Drizzle Studio opens and shows all tables
- [ ] Test connection script confirms database connectivity
- [ ] `.gitignore` updated to exclude `.drizzle/` cache
- [ ] At least 2 team members have successfully run setup

---

## Files Changed Summary

**Created:**
- `docker-compose.yml`
- `drizzle.config.ts`
- `.env.example`
- `drizzle/schema/users.ts`
- `drizzle/schema/profiles.ts`
- `drizzle/schema/applications.ts`
- `drizzle/schema/invitations.ts`
- `drizzle/schema/index.ts`
- `drizzle/seed/dev-seed.ts`
- `src/lib/db/index.ts`
- `src/lib/db/schema.ts`
- `test-db.ts` (temporary, can delete after verification)

**Modified:**
- `.env.local` (add DATABASE_URL)
- `package.json` (add 5 db scripts)
- `.gitignore` (exclude .drizzle/)

**Total:** 12 new files, 3 modified files

---

## Next Steps

After completing this ticket:

1. **Commit changes:**
   ```bash
   git add .
   git commit -m "E0-T0: Set up PostgreSQL database with Drizzle ORM"
   git push origin E0-T0-database-setup
   ```

2. **Create PR:**
   - Title: `[E0-T0] PostgreSQL Database Setup`
   - Link to this ticket
   - Add screenshots of Drizzle Studio showing tables
   - Request review from team lead

3. **Team Sync:**
   - Share `.env.example` in team Slack
   - Distribute Privy credentials securely (1Password)
   - Schedule 15-min session to help team members run setup
   - Document any issues encountered during onboarding

4. **Move to Next Ticket:**
   - **E1-T1:** Authentication Integration (Privy Setup)

---

**Ticket Status:** ✅ Ready for Implementation
**Blocked By:** None
**Blocking:** All Epic 1 tickets
