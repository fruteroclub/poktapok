# Database Setup Guide

Complete guide for setting up and working with the Poktapok database.

## Prerequisites

- **Bun** installed (`curl -fsSL https://bun.sh/install | bash`)
- Access to Vercel project
- Git repository cloned

## Quick Start

### Step 1: Pull Environment Variables

Pull environment variables from Vercel:

```bash
vercel env pull .env.local
```

This will download:

- `DATABASE_URL` - Pooled connection for application queries
- `DATABASE_URL_UNPOOLED` - Direct connection for migrations

### Step 2: Install Dependencies

```bash
bun install
```

### Step 3: Run Migrations

Apply all pending migrations:

```bash
bun run db:migrate
```

**Expected output:**

```
✓ migrations applied successfully!
```

### Step 4: Verify Setup

Test database connection:

```bash
bun run scripts/test-db-connection.ts
```

**Expected output:**

```
✅ Database connected
✅ User count: 0
✅ Tables found: applications, invitations, profiles, users
```

### Step 5: Open Drizzle Studio (Optional)

Launch the visual database browser:

```bash
bun run db:studio
```

Open: https://local.drizzle.studio

---

## Available Commands

### Migration Commands

- `bun run db:generate` - Generate new migration from schema changes
- `bun run db:migrate` - Apply pending migrations
- `bun run db:push` - Push schema changes directly (dev only, bypasses migrations)
- `bun run db:check` - Check for schema drift

### Database Tools

- `bun run db:studio` - Open Drizzle Studio (visual DB browser)

### Test Scripts

- `bun run scripts/test-db-connection.ts` - Test database connectivity
- `bun run scripts/verify-migration.ts` - Verify all database objects
- `bun run scripts/test-crud-operations.ts` - Test CRUD operations

---

## Database Schema

### Tables

#### users (Identity & Authentication)

Core identity table linked to Privy authentication.

**Key Fields:**

- `privy_did` - Privy DID (unique identifier)
- `email` - User email (required)
- `username` - Unique username
- `displayName` - Display name
- `bio` - User bio (280 chars max at app level)
- `avatarUrl` - Profile picture URL
- `ext_wallet` - External wallet address (optional)
- `app_wallet` - Privy embedded wallet (created async)
- `primaryAuthMethod` - email | wallet | social
- `role` - member | moderator | admin
- `accountStatus` - pending | active | suspended | banned

**Relationships:**

- Self-referencing: `invited_by_user_id`, `approved_by_user_id`
- One-to-one with profiles (CASCADE DELETE)

#### profiles (Extended User Data)

Extended profile information separated from core identity.

**Key Fields:**

- `city`, `country`, `countryCode` - Location data
- `githubUrl`, `twitterUrl`, `linkedinUrl`, `telegramHandle` - Social links
- `learningTracks` - Array: ai, crypto, privacy
- `profileVisibility` - public | members | private
- `availabilityStatus` - available | open_to_offers | unavailable
- `completedBounties` - Count of completed bounties
- `totalEarningsUsd` - Total earnings in USD (real/float)
- `profileViews` - Profile view count

**Relationships:**

- One-to-one with users (`user_id` CASCADE DELETE)

#### applications (Onboarding Queue)

Tracks user signup applications pending admin review.

**Key Fields:**

- `userId` - Applicant user ID
- `motivationText` - Why they want to join
- `status` - pending | approved | rejected
- `reviewedByUserId` - Admin who reviewed
- `reviewedAt` - Review timestamp
- `reviewNotes` - Admin notes on decision

**Relationships:**

- Many-to-one with users (applicant and reviewer, SET NULL)

#### invitations (Referral System)

Tracks invitation codes with expiration and redemption.

**Key Fields:**

- `inviterUserId` - Who created the invite
- `redeemerUserId` - Who used the invite
- `inviteCode` - Unique invite code (16-32 chars)
- `status` - pending | redeemed | expired
- `redeemedAt` - Redemption timestamp
- `expiresAt` - Expiration timestamp

**Relationships:**

- Many-to-one with users (inviter CASCADE DELETE, redeemer SET NULL)

**Note on Status Field:** Originally designed as PostgreSQL generated column, but converted to regular field due to PostgreSQL immutability constraints with time-based expressions. Status should be computed at query time:

```typescript
const status = invitation.redeemedAt
  ? 'redeemed'
  : new Date(invitation.expiresAt) < new Date()
    ? 'expired'
    : 'pending'
```

---

## Making Schema Changes

### Workflow

1. **Edit schema files** in `drizzle/schema/`
2. **Generate migration:**
   ```bash
   bun run db:generate
   ```
3. **Review generated SQL** in `drizzle/migrations/`
4. **Apply migration:**
   ```bash
   bun run db:migrate
   ```
5. **Commit migration files** to git

### Important Notes

- **Always pull latest** before creating new migrations
- **Review generated SQL** before applying
- **Test migrations** in development first
- **Communicate schema changes** in team chat before pushing
- **Migration files are version-controlled** - commit them!

### Pattern Inlining

CHECK constraints must have patterns inlined, not referenced from constants:

**❌ Wrong:**

```typescript
check('email_format', sql`${table.email} ~* ${PATTERNS.EMAIL}`)
```

**✅ Correct:**

```typescript
check('email_format', sql`${table.email} ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'`)
```

---

## Troubleshooting

### Can't connect to database

**Problem:** Connection refused or timeout

**Solution:**

1. Ensure `.env.local` exists with `DATABASE_URL`
2. Run `vercel env pull .env.local` to refresh
3. Check Vercel project access

### Migration already applied

**Problem:** `Migration already applied` error

**Solution:** This is normal if migrations are up to date. Drizzle tracks applied migrations automatically.

### Permission denied

**Problem:** Can't access Vercel project

**Solution:** Ask team lead to add you to the Vercel project.

### Schema drift detected

**Problem:** Local schema doesn't match database

**Solution:**

1. Pull latest code: `git pull`
2. Run migrations: `bun run db:migrate`
3. If issues persist, check for uncommitted schema changes

---

## Connection Pooling

The database uses **node-postgres** with connection pooling:

**Configuration:**

- Max connections: 10
- Idle timeout: 20 seconds
- Connection timeout: 10 seconds

**Best Practices:**

- Always close database connections in scripts
- Use `closeDatabase()` helper in finally blocks
- Application queries use pooled `DATABASE_URL`
- Migrations use direct `DATABASE_URL_UNPOOLED`

---

## Drizzle Studio

Visual database browser for exploring data and running queries.

### Launch

```bash
bun run db:studio
```

Open: https://local.drizzle.studio

### Features

- Browse all tables and relationships
- View and edit data
- Run SQL queries
- Visualize foreign keys
- Export data

### Security

- **Local only** - Not exposed to internet
- Uses DATABASE_URL from `.env.local`
- No authentication required (assumes trusted local environment)

---

## Testing

### Available Test Scripts

1. **Connection Test** - `scripts/test-db-connection.ts`
   - Tests database connectivity
   - Lists all tables
   - Counts users

2. **Migration Verification** - `scripts/verify-migration.ts`
   - Verifies all tables created
   - Checks all enums exist
   - Validates indexes and constraints

3. **CRUD Operations** - `scripts/test-crud-operations.ts`
   - Tests CREATE, READ, UPDATE, DELETE operations
   - Verifies CASCADE DELETE behavior
   - Tests soft delete functionality

### Running Tests

```bash
# Run all tests
bun run scripts/test-db-connection.ts
bun run scripts/verify-migration.ts
bun run scripts/test-crud-operations.ts
```

---

## CASCADE DELETE Behavior

### profiles → users

**Policy:** CASCADE DELETE
**Behavior:** Deleting a user deletes their profile

### applications → users

**Policy:** SET NULL (but user_id is NOT NULL)
**Behavior:** Must delete application before deleting user

### invitations → users (inviter)

**Policy:** CASCADE DELETE
**Behavior:** Deleting a user deletes their invitations

### invitations → users (redeemer)

**Policy:** SET NULL
**Behavior:** Deleting redeemer preserves invitation history

---

## Query Patterns

### Get User with Profile

```typescript
import { db } from '@/lib/db'
import { users, profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const userWithProfile = await db
  .select()
  .from(users)
  .leftJoin(profiles, eq(users.id, profiles.userId))
  .where(eq(users.email, 'user@example.com'))
```

### Get Active Users

```typescript
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq, isNull } from 'drizzle-orm'

const activeUsers = await db
  .select()
  .from(users)
  .where(eq(users.accountStatus, 'active'))
  .where(isNull(users.deletedAt))
```

### Soft Delete User

```typescript
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

await db.update(users).set({ deletedAt: new Date() }).where(eq(users.id, userId))
```

---

## Resources

- **Drizzle ORM Docs:** https://orm.drizzle.team
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **Vercel Postgres:** https://vercel.com/docs/storage/vercel-postgres
- **Project Database Design:** [docs/database-design.md](./database-design.md)

---

## Support

For database-related questions:

1. Check this guide first
2. Review [database-design.md](./database-design.md)
3. Ask in #eng-database Slack channel
4. Contact backend team lead

---

**Last Updated:** 2025-12-20
**Schema Version:** E0-T0.7 (Initial Migration)
