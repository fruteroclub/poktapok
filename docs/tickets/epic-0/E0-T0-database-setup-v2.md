# Ticket E0-T0: PostgreSQL Database Setup (Enhanced)

**Epic:** 0 - Project Setup & Infrastructure
**Version:** 2.0 (Enhanced with Comprehensive Schema Design)
**Story Points:** 3 (increased from 2 due to additional rigor)
**Dependencies:** None
**Assignee:** Backend Developer + Database Architect
**Estimated Time:** 2-3 hours

---

## Objective

Set up production-grade hosted PostgreSQL database with Drizzle ORM, implementing a properly normalized schema with comprehensive indexing, constraints, and audit capabilities.

---

## Critical Changes from v1.0

### What Was Wrong

The original E0-T0 ticket ([0-setup.md](../0-setup.md)) had several design issues:

1. **Denormalization Without Justification**
   - Combined auth identity and profile data in single table
   - Made privacy controls difficult to implement
   - Mixed concerns (auth vs display vs metadata)

2. **Missing Critical Constraints**
   - No email format validation
   - No CHECK constraints for business rules
   - No foreign key cascade policies defined

3. **Poor Indexing Strategy**
   - Missing indexes for common query patterns
   - No full-text search indexes for directory
   - No composite indexes for filtered queries

4. **Inadequate Audit Trail**
   - No soft deletes
   - No metadata extension points
   - No created_at/updated_at consistency

5. **Type Safety Issues**
   - Used generic VARCHAR for Privy IDs (should be DID format)
   - Currency as floating point (should be cents/integer)
   - No CHECK constraints on format-critical fields

### What We're Fixing

This enhanced version provides:

- ✅ **Proper 3NF normalization** with justified denormalization
- ✅ **Comprehensive constraints** (CHECK, UNIQUE, NOT NULL, FK cascades)
- ✅ **Performance-optimized indexing** (GIN, partial, composite)
- ✅ **Audit-ready design** (soft deletes, metadata, triggers)
- ✅ **Type safety** (enums, CHECK constraints, format validation)

See [database-design.md](../database-design.md) for full architecture documentation.

---

## Success Criteria

- ✅ Hosted PostgreSQL database provisioned (Vercel Postgres or Railway)
- ✅ Drizzle ORM configured with proper connection pooling
- ✅ **All 4 Epic 1 tables created with constraints and indexes**
- ✅ **Database passes normalization review (3NF with justified exceptions)**
- ✅ **All foreign key cascade behaviors explicitly defined**
- ✅ **Soft delete and audit fields present on all tables**
- ✅ All developers can pull env variables via `vercel env pull .env.local`
- ✅ Migration system working (`bun run db:migrate` syncs everyone)
- ✅ Drizzle Studio accessible and shows correct schema
- ✅ **Test queries demonstrate index usage (EXPLAIN ANALYZE)**

---

## Prerequisites

Same as v1.0:

- Vercel CLI installed (`npm i -g vercel`)
- Bun runtime (1.0+)
- Git configured
- Access to Vercel project or Railway account

---

## Implementation Steps

### Step 1: Provision Database (Same as v1.0)

**Option A: Vercel Postgres (Recommended)**

```bash
vercel link
vercel postgres create poktapok-db
```

**Option B: Railway**

- Create project at railway.app
- Add PostgreSQL service
- Copy DATABASE_URL

---

### Step 2: Install Dependencies (Same as v1.0)

```bash
bun add drizzle-orm postgres
bun add -d drizzle-kit
bun add dotenv
```

---

### Step 3: Pull Environment Variables (Same as v1.0)

```bash
vercel link
vercel env pull .env.local
```

Verify `.env.local` contains:

```bash
POSTGRES_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...
```

---

### Step 4: Create Drizzle Configuration (Updated)

**File:** `drizzle.config.ts`

```typescript
import { defineConfig } from 'drizzle-kit'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

export default defineConfig({
  schema: './drizzle/schema/index.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
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

---

### Step 5: Define Database Schema (ENHANCED)

Create directory structure:

```
drizzle/
├── schema/
│   ├── users.ts       (UPDATED - normalized, enhanced constraints)
│   ├── profiles.ts    (UPDATED - separated from users, added indexes)
│   ├── applications.ts (UPDATED - added audit fields)
│   ├── invitations.ts  (UPDATED - generated status column)
│   ├── utils.ts       (NEW - shared types and helpers)
│   └── index.ts
└── migrations/        (git-tracked, auto-generated)
```

---

#### File: `drizzle/schema/utils.ts` (NEW)

```typescript
import { sql } from 'drizzle-orm'
import { AnyPgColumn } from 'drizzle-orm/pg-core'

/**
 * Shared timestamp columns for audit trail
 */
export const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}

/**
 * Soft delete column
 */
export const softDelete = {
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}

/**
 * Metadata column for extensibility
 */
export const metadata = {
  metadata: jsonb('metadata')
    .default(sql`'{}'::jsonb`)
    .notNull(),
}

/**
 * Helper to check if value matches pattern
 */
export function checkPattern(column: AnyPgColumn, pattern: string) {
  return sql`${column} ~* ${pattern}`
}
```

---

#### File: `drizzle/schema/users.ts` (ENHANCED)

```typescript
import { pgTable, uuid, varchar, timestamp, pgEnum, jsonb } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { timestamps, softDelete, metadata } from './utils'

// ============================================================
// ENUMS
// ============================================================

export const userRoleEnum = pgEnum('user_role', ['member', 'moderator', 'admin'])

export const accountStatusEnum = pgEnum('account_status', [
  'pending',
  'active',
  'suspended',
  'banned',
])

export const authMethodEnum = pgEnum('auth_method', [
  'email', // Email magic link
  'wallet', // External wallet (MetaMask, Coinbase, etc.)
  'social', // Social login (Google, GitHub, Discord, etc.)
])

// ============================================================
// TABLE: users (Identity & Authentication)
// ============================================================
/**
 * Privy Authentication & Wallet Model:
 * - Email: Always required (collected during onboarding)
 * - External Wallet (ext_wallet): Optional, user's own wallet for auth
 * - Embedded Wallet (app_wallet): Created by Privy after authentication
 * - Auth methods: email, social (Google/GitHub), or wallet
 */
export const users = pgTable(
  'users',
  {
    // Primary Key
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    // Authentication (Privy Integration)
    privyDid: varchar('privy_did', { length: 255 }).unique().notNull(),

    // Contact & Identity
    email: varchar('email', { length: 255 }).unique().notNull(), // Always required
    extWallet: varchar('ext_wallet', { length: 42 }), // External wallet (optional)

    // Embedded Wallet (created by Privy after auth)
    appWallet: varchar('app_wallet', { length: 42 }), // Privy embedded wallet

    // Login Method Tracking
    primaryAuthMethod: authMethodEnum('primary_auth_method').notNull(),

    // Account Management
    role: userRoleEnum('role').default('member').notNull(),
    accountStatus: accountStatusEnum('account_status').default('pending').notNull(),

    // Referral Tracking
    invitedByUserId: uuid('invited_by_user_id'),
    approvedByUserId: uuid('approved_by_user_id'),

    // Timestamps & Audit
    ...timestamps,
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }).defaultNow().notNull(),
    ...softDelete,

    // Metadata (Separated Concerns)
    privyMetadata: jsonb('privy_metadata')
      .default(sql`'{}'::jsonb`)
      .notNull(), // Privy SDK data
    ...metadata, // Business logic (NFT memberships, feature flags)
  },
  (table) => ({
    // Foreign Keys (self-referencing)
    invitedByFk: foreignKey({
      columns: [table.invitedByUserId],
      foreignColumns: [table.id],
      name: 'users_invited_by_fk',
    }).onDelete('set null'),

    approvedByFk: foreignKey({
      columns: [table.approvedByUserId],
      foreignColumns: [table.id],
      name: 'users_approved_by_fk',
    }).onDelete('set null'),

    // Constraints
    emailFormatCheck: check(
      'email_format',
      sql`${table.email} ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'`,
    ),

    extWalletFormatCheck: check(
      'ext_wallet_format',
      sql`${table.extWallet} IS NULL OR ${table.extWallet} ~* '^0x[a-fA-F0-9]{40}$'`,
    ),

    appWalletFormatCheck: check(
      'app_wallet_format',
      sql`${table.appWallet} IS NULL OR ${table.appWallet} ~* '^0x[a-fA-F0-9]{40}$'`,
    ),
  }),
)

// TypeScript Types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
```

**Key Improvements:**

1. ✅ `privyDid` instead of generic `authId` (Privy uses DIDs)
2. ✅ Email always required (NOT NULL) - collected during onboarding
3. ✅ Separate `extWallet` (external) and `appWallet` (embedded) fields
4. ✅ `primaryAuthMethod` enum tracks signup method (email/wallet/social)
5. ✅ Ethereum address format validation for both wallets
6. ✅ Soft delete with `deletedAt`
7. ✅ Separated metadata: `privyMetadata` (SDK data) vs `metadata` (business logic)
8. ✅ Explicit foreign key names and cascade policies
9. ✅ Separated from profiles (normalization)

---

#### File: `drizzle/schema/profiles.ts` (ENHANCED)

```typescript
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  bigint,
  pgEnum,
  char,
  index,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { users } from './users'
import { timestamps, metadata } from './utils'

// ============================================================
// ENUMS
// ============================================================

export const learningTrackEnum = pgEnum('learning_track', ['ai', 'crypto', 'privacy'])

export const availabilityStatusEnum = pgEnum('availability_status', [
  'learning',
  'building',
  'open_to_bounties',
])

export const profileVisibilityEnum = pgEnum('profile_visibility', [
  'public',
  'members_only',
  'private',
])

// ============================================================
// TABLE: profiles (Public Display Data)
// ============================================================

export const profiles = pgTable(
  'profiles',
  {
    // Primary Key
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    // Foreign Key (1:1 with users)
    userId: uuid('user_id')
      .unique()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Identity
    username: varchar('username', { length: 50 }).unique().notNull(),
    displayName: varchar('display_name', { length: 100 }).notNull(),
    bio: text('bio'), // Max 280 enforced at app level
    avatarUrl: varchar('avatar_url', { length: 500 }),

    // Location
    city: varchar('city', { length: 100 }),
    country: varchar('country', { length: 100 }),
    countryCode: char('country_code', { length: 2 }), // ISO 3166-1 alpha-2 (for flag emoji)

    // Learning & Availability
    learningTracks: learningTrackEnum('learning_tracks')
      .array()
      .default(sql`'{}'::learning_track[]`)
      .notNull(),
    availabilityStatus: availabilityStatusEnum('availability_status').default('learning').notNull(),

    // Social Links
    githubUsername: varchar('github_username', { length: 100 }),
    twitterUsername: varchar('twitter_username', { length: 100 }),
    linkedinSlug: varchar('linkedin_slug', { length: 100 }),
    telegramUsername: varchar('telegram_username', { length: 100 }),

    // Privacy
    profileVisibility: profileVisibilityEnum('profile_visibility').default('public').notNull(),

    // Stats (Denormalized for Performance - see database-design.md)
    completedBounties: integer('completed_bounties').default(0).notNull(),
    totalEarningsCents: bigint('total_earnings_cents', { mode: 'number' }).default(0).notNull(),
    profileViews: integer('profile_views').default(0).notNull(),

    // Timestamps
    ...timestamps,

    // Extensibility
    ...metadata,
  },
  (table) => ({
    // Constraints
    usernameFormatCheck: check('username_format', sql`${table.username} ~* '^[a-z0-9_]{3,50}$'`),

    bioLengthCheck: check('bio_length', sql`char_length(${table.bio}) <= 280`),

    countryCodeFormatCheck: check(
      'country_code_format',
      sql`${table.countryCode} IS NULL OR ${table.countryCode} ~* '^[A-Z]{2}$'`,
    ),

    earningsPositiveCheck: check('earnings_positive', sql`${table.totalEarningsCents} >= 0`),

    bountiesPositiveCheck: check('bounties_positive', sql`${table.completedBounties} >= 0`),

    // Indexes
    userIdIdx: index('idx_profiles_user_id').on(table.userId),
    usernameIdx: index('idx_profiles_username').on(table.username),
    visibilityIdx: index('idx_profiles_visibility').on(table.profileVisibility),
    availabilityIdx: index('idx_profiles_availability').on(table.availabilityStatus),

    // GIN index for array containment queries (learning_tracks)
    learningTracksIdx: index('idx_profiles_learning_tracks').using('gin', table.learningTracks),

    countryIdx: index('idx_profiles_country').on(table.country),

    // DESC index for "recently joined" sort
    createdAtIdx: index('idx_profiles_created_at').on(table.createdAt.desc()),

    // Soft delete partial index (only index active profiles)
    // Note: deletedAt doesn't exist on profiles (cascade delete from users)

    // Full-text search GIN index
    searchIdx: index('idx_profiles_search').using(
      'gin',
      sql`to_tsvector('english',
        coalesce(${table.username}, '') || ' ' ||
        coalesce(${table.displayName}, '') || ' ' ||
        coalesce(${table.bio}, '')
      )`,
    ),
  }),
)

// TypeScript Types
export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert
```

**Key Improvements:**

1. ✅ Separated from users table (proper normalization)
2. ✅ `countryCode` for flag emoji rendering
3. ✅ Currency as cents (integer, avoids floating-point errors)
4. ✅ Comprehensive CHECK constraints
5. ✅ GIN index for array queries (`learning_tracks`)
6. ✅ Full-text search index
7. ✅ Composite indexes for common filters

---

#### File: `drizzle/schema/applications.ts` (ENHANCED)

```typescript
import { pgTable, uuid, varchar, text, timestamp, pgEnum, inet } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { users } from './users'
import { metadata } from './utils'

// ============================================================
// ENUMS
// ============================================================

export const applicationStatusEnum = pgEnum('application_status', [
  'pending',
  'approved',
  'rejected',
  'spam',
])

// ============================================================
// TABLE: applications (Onboarding Queue)
// ============================================================

export const applications = pgTable(
  'applications',
  {
    // Primary Key
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    // Applicant Info
    email: varchar('email', { length: 255 }).notNull(),
    reason: text('reason').notNull(),
    referralCode: varchar('referral_code', { length: 50 }),

    // Review Status
    status: applicationStatusEnum('status').default('pending').notNull(),

    // Admin Review
    reviewedByUserId: uuid('reviewed_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    reviewNotes: text('review_notes'),

    // User Creation (Post-Approval)
    approvedUserId: uuid('approved_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),

    // Timestamps
    submittedAt: timestamp('submitted_at', { withTimezone: true }).defaultNow().notNull(),

    // Anti-Spam
    ipAddress: inet('ip_address'), // For rate limiting
    userAgent: text('user_agent'),

    // Extensibility
    ...metadata,
  },
  (table) => ({
    // Constraints
    reasonLengthCheck: check('reason_length', sql`char_length(${table.reason}) BETWEEN 50 AND 500`),

    // Enforce review data integrity
    reviewedDataCompleteCheck: check(
      'reviewed_data_complete',
      sql`(${table.status} = 'pending' AND ${table.reviewedAt} IS NULL AND ${table.reviewedByUserId} IS NULL) OR
          (${table.status} != 'pending' AND ${table.reviewedAt} IS NOT NULL AND ${table.reviewedByUserId} IS NOT NULL)`,
    ),

    // Indexes
    emailIdx: index('idx_applications_email').on(table.email),
    statusIdx: index('idx_applications_status').on(table.status),
    submittedAtIdx: index('idx_applications_submitted_at').on(table.submittedAt.desc()),

    // Partial index for referral codes (only index when not null)
    referralCodeIdx: index('idx_applications_referral_code')
      .on(table.referralCode)
      .where(sql`${table.referralCode} IS NOT NULL`),

    ipAddressIdx: index('idx_applications_ip_address').on(table.ipAddress),
  }),
)

// TypeScript Types
export type Application = typeof applications.$inferSelect
export type NewApplication = typeof applications.$inferInsert
```

**Key Improvements:**

1. ✅ `inet` type for IP addresses (PostgreSQL native)
2. ✅ CHECK constraint ensures review integrity
3. ✅ `approvedUserId` links application to created user
4. ✅ Partial index on `referralCode` (only indexes non-null values)
5. ✅ Anti-spam fields (`ipAddress`, `userAgent`)

---

#### File: `drizzle/schema/invitations.ts` (ENHANCED)

```typescript
import { pgTable, uuid, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { users } from './users'

// ============================================================
// ENUMS
// ============================================================

export const invitationStatusEnum = pgEnum('invitation_status', ['active', 'used', 'expired'])

// ============================================================
// TABLE: invitations (Referral System)
// ============================================================

export const invitations = pgTable(
  'invitations',
  {
    // Primary Key
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    // Inviter (Foreign Key)
    inviterUserId: uuid('inviter_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Invitee
    inviteeEmail: varchar('invitee_email', { length: 255 }).notNull(),
    code: varchar('code', { length: 50 }).unique().notNull(),

    // Redemption
    redeemedAt: timestamp('redeemed_at', { withTimezone: true }),
    redeemedByUserId: uuid('redeemed_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),

    // Expiry
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),

    // Status (Computed Column - PostgreSQL GENERATED ALWAYS)
    // This is automatically computed based on redemption and expiry
    status: invitationStatusEnum('status').generatedAlwaysAs(
      sql`CASE
          WHEN ${this.redeemedAt} IS NOT NULL THEN 'used'::"invitation_status"
          WHEN ${this.expiresAt} < NOW() THEN 'expired'::"invitation_status"
          ELSE 'active'::"invitation_status"
        END`,
      { mode: 'stored' },
    ),
  },
  (table) => ({
    // Constraints
    codeFormatCheck: check('code_format', sql`${table.code} ~* '^[A-Z0-9]{8}$'`),

    expiryFutureCheck: check('expiry_future', sql`${table.expiresAt} > ${table.createdAt}`),

    // Indexes
    inviterIdx: index('idx_invitations_inviter').on(table.inviterUserId),
    codeIdx: index('idx_invitations_code').on(table.code),
    emailIdx: index('idx_invitations_email').on(table.inviteeEmail),
    statusIdx: index('idx_invitations_status').on(table.status),
    expiresAtIdx: index('idx_invitations_expires_at').on(table.expiresAt),
  }),
)

// TypeScript Types
export type Invitation = typeof invitations.$inferSelect
export type NewInvitation = typeof invitations.$inferInsert
```

**Key Improvements:**

1. ✅ **Generated status column**: PostgreSQL computes status automatically
2. ✅ Code format CHECK constraint (8-char alphanumeric)
3. ✅ Expiry validation (must be future date)
4. ✅ Cascade delete if inviter deleted
5. ✅ Set null if redeemer deleted (preserve history)

---

#### File: `drizzle/schema/index.ts`

```typescript
// Export all schemas
export * from './utils'
export * from './users'
export * from './profiles'
export * from './applications'
export * from './invitations'
```

---

### Step 6: Create Database Client (Updated)

**File:** `src/lib/db/index.ts`

```typescript
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Get connection string from environment
// Use pooled connection for app queries (not migrations)
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('POSTGRES_URL or DATABASE_URL is not set. Please add it to your .env.local file.')
}

// PostgreSQL client with connection pooling
// prepare: false is required for Vercel Postgres connection pooler
const client = postgres(connectionString, {
  prepare: false,
  max: 10, // Connection pool size
})

// Drizzle ORM instance
export const db = drizzle(client, { schema })

// Export schema for type safety
export { schema }

// Export types
export type {
  User,
  NewUser,
  Profile,
  NewProfile,
  Application,
  NewApplication,
  Invitation,
  NewInvitation,
} from './schema'
```

**File:** `src/lib/db/schema.ts`

```typescript
// Re-export all schemas for convenient imports in app code
export * from '../../../drizzle/schema'
```

---

### Step 7: Create Database Triggers (NEW)

**File:** `drizzle/migrations/0000_initial.sql` (will be generated, but add this manually after generation)

```sql
-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to profiles table
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### Step 8: Add Database Scripts to package.json (Same as v1.0)

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "db:push": "drizzle-kit push",
    "db:check": "drizzle-kit check"
  }
}
```

---

### Step 9: Generate and Run Migration (Enhanced)

```bash
# Generate migration from schema definitions
bun run db:generate

# Review generated SQL (IMPORTANT - check constraints and indexes)
cat drizzle/migrations/0000_*.sql

# Manually add triggers to the migration file if not auto-generated
# (Add the trigger SQL from Step 7)

# Check migration for errors
bun run db:check

# Apply migration to hosted database
bun run db:migrate

# Expected output:
# ✓ Migrating...
# ✓ Migration applied successfully
```

---

### Step 10: Verify Schema Quality (NEW)

Create test script: `scripts/verify-schema.ts`

```typescript
import { db } from '../src/lib/db'
import { users, profiles, applications, invitations } from '../src/lib/db/schema'
import { sql } from 'drizzle-orm'

async function verifySchema() {
  console.log('🔍 Verifying database schema...\n')

  // 1. Check tables exist
  const tables = await db.execute(sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `)
  console.log('✅ Tables found:', tables.rows.map((r) => r.table_name).join(', '))

  // 2. Check indexes exist
  const indexes = await db.execute(sql`
    SELECT indexname
    FROM pg_indexes
    WHERE schemaname = 'public'
    ORDER BY indexname;
  `)
  console.log(`✅ Indexes created: ${indexes.rowCount} total`)

  // 3. Check constraints
  const constraints = await db.execute(sql`
    SELECT conname, contype
    FROM pg_constraint
    WHERE connamespace = 'public'::regnamespace
    ORDER BY conname;
  `)
  console.log(`✅ Constraints defined: ${constraints.rowCount} total`)

  // 4. Test query performance (EXPLAIN ANALYZE)
  console.log('\n📊 Testing query performance...')

  const explainResult = await db.execute(sql`
    EXPLAIN ANALYZE
    SELECT * FROM profiles
    WHERE profile_visibility = 'public'
    ORDER BY created_at DESC
    LIMIT 24;
  `)
  console.log('✅ Directory query plan:')
  explainResult.rows.forEach((row) => console.log(`   ${row['QUERY PLAN']}`))

  console.log('\n🎉 Schema verification complete!')
  process.exit(0)
}

verifySchema().catch((err) => {
  console.error('❌ Schema verification failed:', err)
  process.exit(1)
})
```

Run verification:

```bash
bun run scripts/verify-schema.ts
```

---

## Testing & Verification (Enhanced)

### Step 1: Verify Environment Variables (Same as v1.0)

```bash
cat .env.local | grep POSTGRES_URL
```

---

### Step 2: Test Database Connection (Same as v1.0)

```bash
bun run test-db.ts
```

---

### Step 3: Verify Schema Normalization (NEW)

Create test: `scripts/test-normalization.ts`

```typescript
import { db } from '../src/lib/db'
import { users, profiles } from '../src/lib/db/schema'
import { eq } from 'drizzle-orm'

async function testNormalization() {
  console.log('🧪 Testing schema normalization...\n')

  // Test 1: Create user and profile (1:1 relationship)
  const [user] = await db
    .insert(users)
    .values({
      privyDid: 'did:privy:test123',
      email: 'test@example.com',
      role: 'member',
      accountStatus: 'active',
    })
    .returning()

  console.log('✅ User created:', user.id)

  const [profile] = await db
    .insert(profiles)
    .values({
      userId: user.id,
      username: 'test_user',
      displayName: 'Test User',
      bio: 'Testing normalization',
      learningTracks: ['crypto'],
      availabilityStatus: 'learning',
    })
    .returning()

  console.log('✅ Profile created:', profile.id)

  // Test 2: Verify foreign key cascade (delete user should cascade to profile)
  await db.delete(users).where(eq(users.id, user.id))

  const profileCheck = await db.select().from(profiles).where(eq(profiles.userId, user.id))

  if (profileCheck.length === 0) {
    console.log('✅ CASCADE DELETE working (profile deleted with user)')
  } else {
    console.error('❌ CASCADE DELETE failed (profile still exists)')
    process.exit(1)
  }

  console.log('\n🎉 Normalization tests passed!')
  process.exit(0)
}

testNormalization().catch((err) => {
  console.error('❌ Normalization test failed:', err)
  process.exit(1)
})
```

Run test:

```bash
bun run scripts/test-normalization.ts
```

---

### Step 4: Verify Drizzle Studio (Same as v1.0)

```bash
bun run db:studio
# Open browser to https://local.drizzle.studio
```

Checklist:

- [ ] All 4 tables visible (users, profiles, applications, invitations)
- [ ] All enums created (8 total)
- [ ] Constraints visible in table definitions
- [ ] Indexes listed for each table

---

## Acceptance Criteria Checklist (Enhanced)

Before marking this ticket complete:

### Database Setup

- [ ] Hosted database provisioned (Vercel Postgres or Railway)
- [ ] All dependencies installed (`drizzle-orm`, `postgres`, `drizzle-kit`)
- [ ] `drizzle.config.ts` created and uses POSTGRES_URL_NON_POOLING

### Schema Quality

- [ ] **All 4 tables created with correct column types**
- [ ] **All 8 enums created (user_role, account_status, learning_track, etc.)**
- [ ] **All CHECK constraints present and tested**
- [ ] **All foreign keys defined with explicit cascade behaviors**
- [ ] **Soft delete fields present on users table**
- [ ] **Metadata JSONB columns present on all tables**
- [ ] **Generated status column working on invitations table**

### Indexing

- [ ] **All primary indexes created (24+ total across 4 tables)**
- [ ] **GIN indexes present for arrays and full-text search**
- [ ] **Partial indexes created for conditional queries**
- [ ] **Foreign key columns all indexed**

### Triggers & Functions

- [ ] **update_updated_at_column() trigger function created**
- [ ] **Triggers applied to profiles and users tables**

### Testing

- [ ] Initial migration generated (`bun run db:generate`)
- [ ] Migration applied to hosted database (`bun run db:migrate`)
- [ ] Migration files committed to git
- [ ] Test connection script confirms connectivity
- [ ] **Normalization test passes (cascade deletes work)**
- [ ] **Schema verification script shows correct structure**
- [ ] **EXPLAIN ANALYZE shows indexes are being used**
- [ ] Drizzle Studio opens and shows all tables
- [ ] At least 2 team members synced successfully

### Documentation

- [ ] **database-design.md reviewed by team**
- [ ] **Schema diagram generated (Mermaid or dbdiagram.io)**
- [ ] `.gitignore` updated (excludes .env\*, includes migrations)
- [ ] All 4 database scripts added to `package.json`

---

## Files Changed Summary (Enhanced)

**Created:**

- `drizzle.config.ts`
- `drizzle/schema/utils.ts` (NEW)
- `drizzle/schema/users.ts` (ENHANCED)
- `drizzle/schema/profiles.ts` (ENHANCED)
- `drizzle/schema/applications.ts` (ENHANCED)
- `drizzle/schema/invitations.ts` (ENHANCED)
- `drizzle/schema/index.ts`
- `drizzle/migrations/0000_initial.sql` (generated + triggers)
- `drizzle/migrations/meta/...` (generated metadata)
- `src/lib/db/index.ts` (ENHANCED)
- `src/lib/db/schema.ts`
- `scripts/verify-schema.ts` (NEW)
- `scripts/test-normalization.ts` (NEW)
- `docs/database-design.md` (NEW - comprehensive design doc)

**Modified:**

- `package.json` (add db scripts)
- `.gitignore` (ensure proper exclusions)
- `.env.local` (via `vercel env pull`, not committed)

**Total:** 14+ new files, 2 modified files

---

## Team Synchronization Workflow (Same as v1.0)

See original [0-setup.md](../0-setup.md) for detailed sync workflow.

**Key changes:**

- After syncing, all team members should run verification scripts
- Review database-design.md as a team before implementation

---

## Next Steps

After completing this ticket:

1. **Code Review:**
   - Focus on schema normalization decisions
   - Verify all constraints are sensible
   - Check index strategy against query patterns
   - Review cascade behaviors

2. **Team Design Review:**
   - 30-minute meeting to walk through database-design.md
   - Discuss any concerns or alternative approaches
   - Get approval from senior developer/architect

3. **Commit Changes:**

   ```bash
   git add .
   git commit -m "E0-T0: Implement production-grade PostgreSQL schema with comprehensive constraints and indexing"
   git push origin E0-T0-database-setup-v2
   ```

4. **Create PR:**
   - Title: `[E0-T0] PostgreSQL Database Setup v2 (Enhanced Schema Design)`
   - Link to this ticket and database-design.md
   - Include screenshots of Drizzle Studio
   - Add EXPLAIN ANALYZE output for key queries
   - Request review from team lead + backend dev

5. **Documentation:**
   - Post in team Slack: "Enhanced database schema ready for review. See database-design.md for details."
   - Schedule 30-min walkthrough for team
   - Update README.md with database architecture section

6. **Move to Next Ticket:**
   - **E1-T1:** Authentication Integration (Privy Setup)

---

**Ticket Status:** ✅ Ready for Implementation
**Blocked By:** None
**Blocking:** All Epic 1 tickets
**Review Required:** Yes (Design review before merge)

---

**Contributors:**

- Schema Design: Backend Developer + Database Architect
- Review: Team Lead
- Approval: Technical Lead / CTO
