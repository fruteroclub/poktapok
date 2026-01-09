# E3-T2: Onboarding Flow Migration

**Date**: 2026-01-06
**Ticket**: E3-T2 Onboarding Flow Implementation
**Migration**: 0003_onboarding_flow_social_accounts.sql

## Changes

This migration updates the `profiles` table to store social account usernames/handles instead of full URLs:

1. **Column Renames**:
   - `github_url` → `github_username` (stores username without @)
   - `twitter_url` → `twitter_username` (stores username without @)
   - `telegram_handle` → `telegram_username` (stores username without @)

2. **Type Changes**:
   - All renamed columns: `varchar(500)` → `varchar(100)`
   - `linkedin_url` remains as `varchar(500)` (stores full URL)

## How to Apply

### Method 1: Using the Migration Script (Recommended)

```bash
bun run scripts/apply-onboarding-migration.ts
```

This script:
- Applies the migration SQL safely
- Checks if migration was already applied
- Provides clear success/error messages

### Method 2: Manual SQL Execution

If you prefer to apply manually:

```bash
psql $DATABASE_URL < drizzle/migrations/0003_onboarding_flow_social_accounts.sql
```

## Verification

After applying, verify the changes:

```sql
-- Check column names and types
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('github_username', 'twitter_username', 'telegram_username', 'linkedin_url');
```

Expected output:
```
    column_name     |     data_type      | character_maximum_length
--------------------+--------------------+--------------------------
 github_username    | character varying  |                      100
 twitter_username   | character varying  |                      100
 telegram_username  | character varying  |                      100
 linkedin_url       | character varying  |                      500
```

## Data Impact

**No data loss**: The ALTER TABLE RENAME operations preserve all existing data.

**Data format change**: If you had full URLs stored in `github_url`, `twitter_url`, or `telegram_handle`, they will be preserved as-is. The application now expects usernames only (without `@` prefix), so:

- Old data: `https://github.com/username` or `https://twitter.com/username`
- New data: `username` (without @ or URL)

If you have existing data in these fields, you may want to run a data migration script to extract usernames from URLs.

## Rollback

To rollback (not recommended after data has been written in new format):

```sql
ALTER TABLE "profiles" RENAME COLUMN "github_username" TO "github_url";
ALTER TABLE "profiles" RENAME COLUMN "twitter_username" TO "twitter_url";
ALTER TABLE "profiles" RENAME COLUMN "telegram_username" TO "telegram_handle";

ALTER TABLE "profiles" ALTER COLUMN "github_url" TYPE varchar(500);
ALTER TABLE "profiles" ALTER COLUMN "twitter_url" TYPE varchar(500);
ALTER TABLE "profiles" ALTER COLUMN "telegram_handle" TYPE varchar(100);
```

## Dependencies

**Required**: E3-T1 (Program Management Schema) must be applied first.

**Blocks**: None - this migration is standalone for profiles table.

## Notes for Team

- This migration is part of the onboarding flow enhancement (E3-T2)
- The migration file is tracked in version control: `drizzle/migrations/0003_onboarding_flow_social_accounts.sql`
- The migration journal is updated: `drizzle/migrations/meta/_journal.json`
- The schema source of truth is: `drizzle/schema/profiles.ts`
