# Database Migrations

This directory contains database migration files for the Poktapok application.

## How to Apply Migrations

### For Team Members (After Pulling New Code)

If you've pulled new code with database changes, apply migrations:

```bash
# Method 1: Use Drizzle migrate (Recommended)
bun run db:migrate

# Method 2: Use db:push for development (applies schema changes directly)
bun run db:push
```

### Verification

After applying migrations, verify the schema:

```bash
# Test database connection and list all tables
bun run scripts/test-db-connection.ts

# For program management schema specifically
bun run scripts/verify-program-schema.ts
```

## Migration Files

### 0000_futuristic_aaron_stack.sql
Initial schema setup with users, profiles, applications, invitations

### 0001_flimsy_wind_dancer.sql
Projects, skills, activities, and related junction tables

### 0002_program_management_schema.sql
**NEW - E3-T1: Program Management**
- Adds `programs` table (De Cero a Chamba, DeFi-esta, Open)
- Adds `program_activities` junction table
- Adds `program_enrollments` table
- Adds `attendance` table
- Updates `applications` with program_id, goal, github_username, twitter_username
- Seeds 3 initial programs automatically

## Creating New Migrations

When you modify schema files in `drizzle/schema/`:

```bash
# Generate migration from schema changes
bun run db:generate

# Review the generated SQL in drizzle/migrations/
# Apply the migration
bun run db:migrate

# Or push directly (dev only)
bun run db:push
```

## Rollback

To rollback a migration, you'll need to manually create a rollback script. See individual migration files for rollback SQL.

## Troubleshooting

### Error: "relation does not exist"
Migration not applied. Run `bun run db:migrate`

### Error: "duplicate key value"
Migration already applied. Check `drizzle_migrations` table in your database.

### Error: "type already exists"
Use `db:push` instead of `db:migrate` for development environments.

## Production Deployment

For production:
1. **Backup database** before migration
2. Review migration SQL carefully
3. Run `bun run db:migrate`
4. Verify with test queries
5. Monitor application logs

## Schema Documentation

See [docs/database-setup.md](../../docs/database-setup.md) for complete schema reference.
