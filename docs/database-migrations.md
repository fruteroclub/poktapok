# Database Migrations Guide

**Status**: ✅ Migration-based workflow active (Jan 2, 2026)

## Overview

The project has transitioned from `db:push` (direct schema sync) to **migration-based workflow** for better team collaboration and production deployment control.

## Current State

- **Baseline**: Migration `0000_futuristic_aaron_stack` (marked as applied, Jan 2, 2026)
- **Schema Coverage**: All 11 tables + 18 enums
  - Core: users, profiles, applications, invitations
  - Activities: activities, activity_submissions, pulpa_distributions
  - Portfolio: projects, skills, project_skills, user_skills

## Migration Workflow

### For Schema Changes

When you need to modify the database schema:

```bash
# 1. Edit schema files in drizzle/schema/
# Example: Add a new column to profiles table
vim drizzle/schema/profiles.ts

# 2. Generate migration from schema changes
bun run db:generate

# 3. Review generated migration
cat drizzle/migrations/0001_*.sql

# 4. Apply migration to database
bun run db:migrate

# 5. Verify migration applied
bun run db:list-migrations
```

### Checking Migration Status

```bash
# List all applied migrations
bun run db:list-migrations

# Check for schema drift (schema vs database mismatch)
bun run db:check

# Open database GUI for inspection
bun run db:studio
```

## Important Rules

### ✅ DO

- **Always generate migrations** for schema changes (`db:generate` → `db:migrate`)
- **Review migrations** before applying them
- **Test migrations locally** before pushing to shared branches
- **Commit migration files** to version control
- **Use `db:check`** regularly to detect drift

### ❌ DON'T

- **Never use `db:push`** - This bypasses migration tracking
- **Never edit migration files** - They are auto-generated
- **Never delete migrations** - They are historical records
- **Never apply migrations directly** with SQL - Use `db:migrate`

## Team Synchronization

### When pulling changes with migrations:

```bash
# 1. Pull latest code
git pull

# 2. Check if new migrations exist
ls -lt drizzle/migrations/*.sql

# 3. Apply any new migrations
bun run db:migrate

# 4. Verify your database is up to date
bun run db:list-migrations
```

### When creating new migrations:

```bash
# 1. Create feature branch
git checkout -b feat/add-user-badges

# 2. Edit schema files
# ... make your changes ...

# 3. Generate migration
bun run db:generate

# 4. Test migration
bun run db:migrate

# 5. Commit schema + migration files
git add drizzle/schema/ drizzle/migrations/
git commit -m "add user badges table"

# 6. Push and create PR
git push origin feat/add-user-badges
```

## Conflict Resolution

### If you encounter migration conflicts:

**Scenario**: Two developers create migrations simultaneously

```bash
# Developer A creates: 0001_cool_migration.sql
# Developer B creates: 0001_different_migration.sql
# Conflict: Same migration number!
```

**Resolution**:
1. Pull the main branch migration
2. Delete your local migration: `rm drizzle/migrations/0001_*.sql`
3. Clear journal: `rm drizzle/migrations/meta/_journal.json`
4. Recreate journal: `echo '{"version":"7","dialect":"postgresql","entries":[]}' > drizzle/migrations/meta/_journal.json`
5. Regenerate your migration: `bun run db:generate`
6. It will create `0002_*.sql` (next available number)

## Common Commands Reference

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `bun run db:generate` | Generate migration from schema | After editing schema files |
| `bun run db:migrate` | Apply pending migrations | After generating or pulling migrations |
| `bun run db:list-migrations` | List applied migrations | Check database state |
| `bun run db:check` | Detect schema drift | Verify schema matches database |
| `bun run db:studio` | Open database GUI | Visual database inspection |

## Schema Constraints

When editing schema files, follow these rules (enforced by Drizzle):

### CHECK Constraints
```typescript
// ✅ CORRECT: Inline patterns
check('email_format', sql`${table.email} ~* '^[A-Za-z0-9._%+-]+@...'`)

// ❌ WRONG: Variable references (won't generate)
check('email_format', sql`${table.email} ~* ${PATTERNS.EMAIL}`)
```

### Generated Columns
```typescript
// ❌ WRONG: Time-based functions (PostgreSQL rejects)
status: varchar('status').generatedAlwaysAs(sql`CASE WHEN expires_at < NOW() ...`)

// ✅ CORRECT: Compute at query time
status: varchar('status').default('pending').notNull()
```

## Troubleshooting

### "Migration already applied" error
```bash
# Check what's applied
bun run db:list-migrations

# If migration is listed but failed, manually rollback:
# (Contact team lead - rollbacks require careful handling)
```

### "Schema drift detected"
```bash
# Check what's different
bun run db:check

# If drift exists, someone used db:push instead of migrations
# Solution: Generate a migration to capture the drift
bun run db:generate
bun run db:migrate
```

### "Type already exists" error
```bash
# This means migration was partially applied
# Check applied migrations:
bun run db:list-migrations

# If migration is NOT listed but objects exist:
# The baseline wasn't marked correctly
# Contact team lead for resolution
```

## Production Deployment

**Important**: Migrations must be applied during deployment.

### Vercel Deployment
Migrations are automatically applied via `postbuild` script (future enhancement).

### Manual Deployment
```bash
# 1. Apply migrations using unpooled connection
DATABASE_URL=$DATABASE_URL_UNPOOLED bun run db:migrate

# 2. Verify migrations applied
bun run db:list-migrations

# 3. Deploy application code
```

## Database Connections

The project uses two connection strings:

- **`DATABASE_URL`**: Pooled connection (10 connections max)
  - Used by: Application queries, db:studio
  - Benefit: Better performance for concurrent requests

- **`DATABASE_URL_UNPOOLED`**: Direct connection
  - Used by: Migrations (`db:migrate`)
  - Benefit: Avoids connection pool issues during schema changes

## Architecture Reference

### Schema File Structure
```
drizzle/schema/
├── utils.ts              # Shared helpers (timestamps, softDelete, metadata)
├── users.ts              # Users + enums (auth_method, user_role, account_status)
├── profiles.ts           # Profiles + enums (availability, learning_track, visibility)
├── applications.ts       # Onboarding applications + enum (application_status)
├── invitations.ts        # Referral system
├── activities.ts         # Activities + enums (activity_type, status, difficulty, etc.)
├── projects.ts           # Portfolio projects + enums (project_type, project_status)
├── skills.ts             # Skills system + enums (skill_category, proficiency_level)
└── index.ts              # Schema exports
```

### Migration Naming
Drizzle auto-generates migration names: `XXXX_adjective_noun.sql`
- `XXXX`: Sequential number (0000, 0001, 0002, ...)
- `adjective_noun`: Random Marvel character names (for fun)

Example: `0000_futuristic_aaron_stack.sql`

## Historical Context

**Before Jan 2, 2026**: Used `db:push` for rapid iteration
**After Jan 2, 2026**: Switched to migration-based workflow for team collaboration

The baseline migration `0000_futuristic_aaron_stack` was generated from existing schema but **not executed** (tables already existed). It serves as the starting point for all future migrations.

## Questions?

- **Schema questions**: Check [docs/database-setup.md](./database-setup.md)
- **Migration conflicts**: Ask in #engineering-db Slack channel
- **Production issues**: Contact DevOps team lead

---

**Last Updated**: January 2, 2026
**Baseline Migration**: 0000_futuristic_aaron_stack (marked applied, not executed)
