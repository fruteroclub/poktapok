# Database Migration Quick Reference

## 🚀 Common Workflows

### Making a Schema Change

```bash
# 1. Edit schema file
vim drizzle/schema/profiles.ts

# 2. Generate migration
bun run db:generate

# 3. Apply migration
bun run db:migrate
```

### Pulling Changes from Team

```bash
# 1. Pull code
git pull

# 2. Apply any new migrations
bun run db:migrate
```

### Checking Database State

```bash
# List applied migrations
bun run db:list-migrations

# Check for drift
bun run db:check

# Open database GUI
bun run db:studio
```

## ✅ DO's

- ✅ Always generate migrations: `db:generate` → `db:migrate`
- ✅ Review migrations before applying
- ✅ Commit migration files to git
- ✅ Run `db:migrate` after pulling changes
- ✅ Test migrations locally first

## ❌ DON'Ts

- ❌ Never use `db:push` (bypasses tracking)
- ❌ Never edit migration files manually
- ❌ Never delete migration files
- ❌ Never apply SQL directly

## 🆘 Troubleshooting

### "Type already exists" error

→ Migration partially applied. Contact team lead.

### "Schema drift detected"

→ Someone used `db:push`. Generate a migration to capture drift:

```bash
bun run db:generate
bun run db:migrate
```

### Migration conflict (same number)

→ Regenerate your migration with next number:

```bash
rm drizzle/migrations/000X_*.sql
bun run db:generate  # Will create next number
```

## 📚 Full Documentation

See [database-migrations.md](./database-migrations.md) for complete guide.
