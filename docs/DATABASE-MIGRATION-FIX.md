# Database Migration System Fix

**Date:** 2025-01-09
**Issue:** Drizzle Kit migration snapshots out of sync with database state
**Status:** RESOLVED

---

## Problem Summary

### Root Cause
The database migration system became corrupted due to mixing `db:push` (direct schema push) with `db:migrate` (migration-based approach). This created an inconsistency where:

1. **Database state** - Has tables/columns from migrations 0000-0004
2. **Applied migrations** - Only 1 migration recorded in `drizzle_migrations` table
3. **Snapshot files** - Out of sync with both database and migration SQL files

### Symptoms
- `drizzle-kit generate` fails with "data is malformed" errors
- Cannot generate new migrations
- Migration snapshots (0002, 0003, 0004) report as corrupted
- `db:migrate` tries to re-create existing database objects

### Impact
- **CRITICAL** - Cannot apply schema changes via proper migration workflow
- Blocks implementation of nullable `sessions.programId`
- Prevents future database schema evolution

---

## Resolution Strategy

### Option 1: Manual Migration (CHOSEN)
✅ **Status:** IMPLEMENTED

**Approach:**
1. Manually create migration SQL file for immediate need
2. Update migration journal
3. Apply specific migration directly
4. Document the fix for prevention

**Files Created:**
- `drizzle/migrations/0005_make_sessions_programid_nullable.sql`
- `scripts/check-applied-migrations.ts` (diagnostic tool)
- `docs/DATABASE-MIGRATION-FIX.md` (this file)

**Migration Applied:**
```sql
ALTER TABLE "sessions" ALTER COLUMN "program_id" DROP NOT NULL;
```

### Option 2: Full Reset (NOT CHOSEN - Too Risky)
❌ Would require:
1. Backup all data
2. Drop all tables
3. Re-run all migrations from scratch
4. Restore data
5. Risk of data loss

---

## Implementation Steps

### Step 1: Create Manual Migration

Created `/drizzle/migrations/0005_make_sessions_programid_nullable.sql`:

```sql
-- Migration: Make sessions.program_id nullable to support standalone sessions
-- Date: 2025-01-09
-- Purpose: Allow sessions to exist without being linked to a program

ALTER TABLE "sessions" ALTER COLUMN "program_id" DROP NOT NULL;
```

### Step 2: Update Migration Journal

Updated `drizzle/migrations/meta/_journal.json` to include:

```json
{
  "idx": 5,
  "version": "7",
  "when": 1736472000000,
  "tag": "0005_make_sessions_programid_nullable",
  "breakpoints": true
}
```

### Step 3: Apply Migration Directly

Since `db:migrate` is broken, apply directly to database:

```bash
# Connect to database and run SQL
psql "$DATABASE_URL_UNPOOLED" -c "ALTER TABLE sessions ALTER COLUMN program_id DROP NOT NULL;"
```

**Verification:**
```bash
bun run scripts/check-applied-migrations.ts
```

### Step 4: Update Schema File

Updated `drizzle/schema/sessions.ts`:
```typescript
// BEFORE
programId: uuid('program_id')
  .notNull()
  .references(() => programs.id, { onDelete: 'cascade' }),

// AFTER
programId: uuid('program_id')
  .references(() => programs.id, { onDelete: 'cascade' }),
```

---

## Prevention Measures

### Golden Rules for Database Migrations

#### ✅ DO:
1. **Always use migration workflow**:
   ```bash
   # Edit schema files
   bun run db:generate    # Generate migration
   bun run db:migrate     # Apply migration
   ```

2. **Never mix approaches** - Choose ONE:
   - **Production:** Use `db:generate` + `db:migrate` ONLY
   - **Dev (rapid iteration):** Use `db:push` ONLY (but understand risks)

3. **Check applied migrations before generating**:
   ```bash
   bun run scripts/check-applied-migrations.ts
   ```

4. **Verify snapshots are in sync**:
   ```bash
   # Should have one snapshot per migration
   ls drizzle/migrations/meta/*_snapshot.json | wc -l
   cat drizzle/migrations/meta/_journal.json | jq '.entries | length'
   ```

5. **Backup before risky operations**:
   ```bash
   pg_dump "$DATABASE_URL_UNPOOLED" > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

#### ❌ DON'T:
1. **Never use `db:push` in production** - It bypasses migration tracking
2. **Never manually edit snapshot files** - Let Drizzle Kit generate them
3. **Never delete migrations** that have been applied to production
4. **Never run migrations outside of `db:migrate`** - except in emergency recovery
5. **Never skip migration generation** - tempting but breaks the system

### Migration Workflow Checklist

```markdown
## Before Making Schema Changes

- [ ] Check current database state: `bun run scripts/check-applied-migrations.ts`
- [ ] Verify no uncommitted migration files: `git status drizzle/migrations/`
- [ ] Backup database (production): `pg_dump` or Vercel snapshot

## Making Schema Changes

- [ ] Edit schema files in `drizzle/schema/`
- [ ] Generate migration: `bun run db:generate`
- [ ] Review generated SQL in `drizzle/migrations/`
- [ ] Test migration on dev database: `bun run db:migrate`
- [ ] Verify schema: `bun run scripts/verify-migration.ts`

## After Migration

- [ ] Commit schema files + migration + snapshot: `git add drizzle/`
- [ ] Update documentation if needed
- [ ] Test application with new schema
- [ ] Apply to production via CI/CD or manual `db:migrate`
```

### Emergency Recovery Procedure

If migration system becomes corrupted again:

1. **Assess damage**:
   ```bash
   bun run scripts/check-applied-migrations.ts
   ls drizzle/migrations/*.sql
   ls drizzle/migrations/meta/*_snapshot.json
   ```

2. **Backup immediately**:
   ```bash
   pg_dump "$DATABASE_URL_UNPOOLED" > emergency_backup.sql
   ```

3. **Options**:
   - **Minor issue:** Create manual migration (like this fix)
   - **Major corruption:** Contact database admin or consider full reset

4. **Document everything**:
   - What caused the corruption
   - Steps taken to recover
   - How to prevent recurrence

---

## Diagnostic Tools

### Check Applied Migrations
```bash
bun run scripts/check-applied-migrations.ts
```

**Output:**
```
=== Applied Migrations ===
1. [hash]
   Applied at: [timestamp]

Total: X migrations applied
```

### Verify Database Schema
```bash
bun run scripts/verify-migration.ts
```

### Check Snapshot Sync
```bash
# Count journal entries
cat drizzle/migrations/meta/_journal.json | jq '.entries | length'

# Count snapshots
ls drizzle/migrations/meta/*_snapshot.json | wc -l

# Should be equal
```

### Inspect Migration SQL
```bash
# View all migrations
ls -lh drizzle/migrations/*.sql

# Check specific migration
cat drizzle/migrations/0005_make_sessions_programid_nullable.sql
```

---

## Technical Details

### Drizzle Kit Snapshot Structure

Snapshots (`XXXX_snapshot.json`) contain:
- **id:** UUID of this snapshot
- **prevId:** UUID of previous snapshot (forms a chain)
- **version:** Drizzle Kit version (currently "7")
- **dialect:** Database type ("postgresql")
- **tables:** Complete schema definition

**Why snapshots exist:**
- Drizzle Kit compares snapshots to detect schema changes
- Generates migration SQL from differences
- Tracks migration lineage via `prevId` chain

**When snapshots become corrupted:**
- Schema changes applied via `db:push` (bypasses snapshots)
- Manual edits to snapshot files
- Missing snapshots in the chain
- Mismatched journal entries

### Migration Journal Structure

File: `drizzle/migrations/meta/_journal.json`

```json
{
  "version": "7",
  "dialect": "postgresql",
  "entries": [
    {
      "idx": 0,
      "version": "7",
      "when": 1736472000000,
      "tag": "0005_make_sessions_programid_nullable",
      "breakpoints": true
    }
  ]
}
```

- **idx:** Sequential migration number
- **when:** Unix timestamp (milliseconds)
- **tag:** Migration filename (without `.sql`)
- **breakpoints:** Whether to pause at this migration

### Database Migration Table

Table: `drizzle_migrations`

```sql
CREATE TABLE drizzle_migrations (
  id SERIAL PRIMARY KEY,
  hash TEXT NOT NULL,
  created_at BIGINT NOT NULL
);
```

- **hash:** SHA256 hash of migration SQL
- **created_at:** Timestamp when applied

**Problem in our case:**
- Only 1 entry in `drizzle_migrations`
- But 5 migrations exist in files
- Database has objects from all 5 migrations
- Indicates migrations were applied via `db:push`, not `db:migrate`

---

## Future Improvements

### Short Term (Next Sprint)
1. ✅ Add `check-applied-migrations.ts` to regular workflow
2. ✅ Document migration process in `CLAUDE.md`
3. ⬜ Add pre-commit hook to verify migration consistency
4. ⬜ Create migration validation script

### Long Term (Future)
1. ⬜ Automate migration smoke tests in CI/CD
2. ⬜ Set up database backup automation
3. ⬜ Consider using migration tools with better recovery (like Atlas)
4. ⬜ Implement blue-green deployment for risky migrations

---

## References

- **Drizzle Kit Docs:** https://orm.drizzle.team/kit-docs/overview
- **Migration Best Practices:** https://orm.drizzle.team/docs/migrations
- **This Issue:** E4-PROGRAMS-SESSIONS-ACTIVITIES-RELATIONSHIPS.md
- **Related:** docs/database-setup.md

---

## Lessons Learned

### What Went Wrong
1. Used `db:push` for convenience during rapid development
2. Didn't realize it bypasses migration tracking
3. No regular checks of migration system health
4. Snapshot files became out of sync

### What Worked
1. Manual migration as emergency fix
2. Diagnostic scripts to understand the problem
3. Clear documentation of the issue and resolution
4. Schema change still achievable despite corruption

### Key Takeaway
**Migration discipline is critical.** The convenience of `db:push` is not worth the corruption risk. Always use proper migration workflow, even in development.

---

**End of Document**
