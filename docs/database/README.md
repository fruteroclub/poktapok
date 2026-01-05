# Database Documentation

Database-specific documentation including migrations, schema reference, and database operations.

## 📋 Database Documents

### [Database Setup](../dev/database-setup.md)
**Location**: `/docs/dev/database-setup.md`
**Purpose**: Complete guide for setting up local and production database
**Contents**:
- Environment configuration
- Connection setup (pooled vs unpooled)
- Schema management
- Testing and verification

### [Migrations Guide](./migrations.md)
**Purpose**: Database migration workflows and best practices
**Contents**:
- Migration workflow (dev vs production)
- Drizzle commands reference
- Common migration patterns
- Troubleshooting

### [Migration Quick Reference](./migration-quick-reference.md)
**Purpose**: Quick command reference for common migration tasks
**Contents**:
- Essential commands
- Common patterns
- Quick troubleshooting

---

## 🗄️ Database Architecture

### Connection Strategy
- **Pooled Connection** (`DATABASE_URL`): Application queries (10 connections max)
- **Unpooled Connection** (`DATABASE_URL_UNPOOLED`): Migrations only

### Schema Organization
```
drizzle/
├── schema/
│   ├── utils.ts           # Shared helpers (timestamps, soft delete, metadata)
│   ├── users.ts           # Users table
│   ├── profiles.ts        # Profiles table
│   ├── applications.ts    # Applications table
│   ├── invitations.ts     # Invitations table
│   └── index.ts           # Schema exports
└── migrations/            # Generated SQL migrations
```

### Key Patterns
- **Soft Deletes**: `deletedAt` timestamp (in users table)
- **Timestamps**: `createdAt`, `updatedAt` on all tables
- **Metadata**: JSONB column (default `'{}'::jsonb`) on all tables
- **CHECK Constraints**: Inlined regex patterns (required by Drizzle)
- **Composite Indexes**: For common query patterns

---

## 📝 Database Development Workflow

### 1. Local Development (Fast Iteration)

```bash
# Edit schema files in drizzle/schema/
vim drizzle/schema/profiles.ts

# Push changes directly (no migration files)
bun run db:push

# Verify changes
bun run scripts/test-db-connection.ts
```

**Use `db:push` for**:
- Active development
- Iterative schema design
- Quick prototyping
- Testing changes

### 2. Production Workflow (Migration-Based)

```bash
# Generate migration from schema changes
bun run db:generate

# Review generated migration
cat drizzle/migrations/XXXXX_migration_name.sql

# Apply migration
bun run db:migrate

# Verify migration
bun run db:check
```

**Use migrations for**:
- Production deployments
- Team collaboration
- Version control
- Rollback capability

---

## 🚨 Important Constraints

### CHECK Constraints Must Use Inlined Patterns

❌ **Wrong** (variable reference):
```typescript
check('email_format', sql`${table.email} ~* ${PATTERNS.EMAIL}`)
```

✅ **Correct** (inlined pattern):
```typescript
check('email_format', sql`${table.email} ~* '^[A-Za-z0-9._%+-]+@...'`)
```

### Generated Columns Cannot Use Time Functions

❌ **Wrong** (time-based function):
```typescript
status: varchar('status').generatedAlwaysAs(
  sql`CASE WHEN expires_at < NOW() ...`
)
```

✅ **Correct** (application-level computation):
```typescript
status: varchar('status').default('pending').notNull()
// Compute status at query time or in application logic
```

---

## 📊 Schema Reference

### Core Tables

#### users
- Core identity and authentication
- Linked to Privy DID
- Soft delete support
- Account status management

#### profiles
- Extended user data
- Location and social links
- Learning tracks
- Availability status

#### applications
- Onboarding queue
- Pending/approved/rejected signup applications
- Admin review workflow

#### invitations
- Referral system
- Invite codes with expiration tracking
- Usage monitoring

---

## 🔧 Common Operations

### Adding a New Table

1. Create schema file: `drizzle/schema/table-name.ts`
2. Define table with standard patterns:
```typescript
import { pgTable, text, varchar } from 'drizzle-orm/pg-core'
import { timestamps, softDelete, metadata } from './utils'

export const tableName = pgTable('table_name', {
  id: text('id').primaryKey(),
  // ... other fields
  ...timestamps,
  ...softDelete, // if needed
  ...metadata,
})
```
3. Export from `drizzle/schema/index.ts`
4. For dev: `bun run db:push`
5. For production: `bun run db:generate && bun run db:migrate`

### Adding a Column

1. Edit schema file
2. Add column definition
3. For dev: `bun run db:push`
4. For production: `bun run db:generate && bun run db:migrate`

### Modifying a Column

1. Edit schema file
2. Update column definition
3. **Warning**: May require data migration
4. Test with `db:push` first
5. Review generated migration carefully
6. Backup data before applying to production

---

## 🔗 Related Documentation

- **[Database Setup Guide](../dev/database-setup.md)** - Complete setup instructions
- **[Product Database Design](../product/database-design.md)** - High-level architecture
- **[Developer Guides](../dev/)** - All technical guides
