# Convex Development Workflow

**Purpose:** Guide for devs/agents working with Convex on Poktapok project  
**Audience:** Developers, AI agents  
**Last Updated:** 2026-02-06

---

## 🏗️ Architecture Overview

### Convex Environments

Convex has **two deployment models**:

1. **Cloud Dev (default)** - `npx convex dev`
   - Creates a cloud development project (free tier)
   - Code runs locally, syncs to cloud
   - Each dev gets their own project
   - **Cost:** Free for development

2. **Local-only Dev** - Not officially supported, but possible with workarounds
   - Run backend completely local
   - No cloud sync
   - Limited features (no auth, no file storage)

### Why Cloud Dev is Better

- **Free tier generous** - 1M function calls/month
- **Real-time sync** - See data changes instantly
- **Dashboard** - Visual DB browser at https://dashboard.convex.dev
- **Authentication** - Clerk/Privy integration works out of box
- **File storage** - Convex storage for uploads
- **Scheduled functions** - Cron jobs work in cloud only

---

## 💰 Cost Optimization Strategy

### Per-Developer Branches (Recommended)

**Problem:** Multiple devs sharing one Convex project = high function call count

**Solution:** Each dev works in their own Convex project linked to their branch

```bash
# Branch workflow
git checkout -b feature/my-feature
bunx convex dev  # Creates NEW Convex project for this branch
# Work locally, test, commit
git push origin feature/my-feature
# When ready: merge to main → deploy to shared prod
```

**Benefits:**
- Each dev's queries don't count against shared project
- Isolated testing (no data collisions)
- Free tier covers individual dev work
- Only production deploys cost money

### Shared Production

```bash
# When feature is ready
git checkout main
git merge feature/my-feature
bunx convex deploy --prod  # Deploy to shared production project
```

**Result:**
- Dev work: Free (each dev in their own project)
- Production: Shared cost (only one prod project)

---

## 🚀 Setup Guide

### First-Time Setup

1. **Install Convex:**
   ```bash
   bun add convex
   ```

2. **Initialize Convex (creates cloud project):**
   ```bash
   bunx convex dev
   ```
   - Opens browser for login
   - Creates new Convex project
   - Generates `convex/` directory
   - Starts dev server (hot-reload enabled)

3. **Project Structure Created:**
   ```
   convex/
   ├── schema.ts              # Database schema
   ├── _generated/            # Auto-generated (gitignored)
   │   ├── api.ts
   │   ├── server.ts
   │   └── dataModel.ts
   └── functions/             # Your queries/mutations
   ```

4. **Configure `.gitignore`:**
   ```gitignore
   # Convex
   convex/_generated/
   .convex/
   ```

5. **Link to specific project (if needed):**
   ```bash
   bunx convex dev --once  # One-time sync
   # Or configure in convex.json
   ```

---

## 📝 Development Workflow

### Daily Development

1. **Start dev server:**
   ```bash
   bunx convex dev
   ```
   - Watches `convex/` for changes
   - Auto-deploys to cloud on save
   - Terminal shows function logs

2. **Write schema changes:**
   ```typescript
   // convex/schema.ts
   export default defineSchema({
     users: defineTable({
       email: v.string(),
       role: v.string(),
     }).index("by_email", ["email"]),
   });
   ```
   - Save file → auto-deployed
   - Dashboard updates instantly

3. **Write queries/mutations:**
   ```typescript
   // convex/users.ts
   import { query } from "./_generated/server";
   
   export const list = query({
     args: {},
     handler: async (ctx) => {
       return await ctx.db.query("users").collect();
     },
   });
   ```

4. **Test in frontend:**
   ```typescript
   import { useQuery } from "convex/react";
   import { api } from "@/convex/_generated/api";
   
   function UserList() {
     const users = useQuery(api.users.list);
     return <div>{users?.map(u => u.email)}</div>;
   }
   ```

5. **View data in dashboard:**
   - Open https://dashboard.convex.dev
   - Select your project
   - Browse tables, run queries, insert test data

### Testing Changes

**Local Testing:**
```bash
# Terminal 1: Convex dev server
bunx convex dev

# Terminal 2: Next.js dev server
bun run dev
```

**Verify:**
- Open http://localhost:3000
- Changes to `convex/` trigger auto-reload
- Check browser console for query errors

---

## 🌿 Branch Strategy

### Feature Branch Workflow

```bash
# 1. Create feature branch
git checkout -b feature/user-profiles

# 2. Start Convex dev (creates new project)
bunx convex dev
# → Login and select "Create new project"
# → Name it: "poktapok-user-profiles-dev"

# 3. Develop locally
# Edit convex/schema.ts, add queries/mutations
# Test in localhost:3000

# 4. Commit changes
git add convex/
git commit -m "feat: add user profiles schema"

# 5. Push to GitHub
git push origin feature/user-profiles

# 6. Create PR for review
# Reviewers can pull your branch and test locally

# 7. After approval: merge to main
git checkout main
git merge feature/user-profiles

# 8. Deploy to production
bunx convex deploy --prod
# → This updates the SHARED production Convex project
```

### Convex Project Naming Convention

- **Dev projects:** `poktapok-<feature>-dev` (per developer)
- **Production:** `poktapok-prod` (shared)
- **Staging (optional):** `poktapok-staging` (shared)

---

## 📦 Data Migration Strategy

### From Neon to Convex

**Phase 1: Schema Setup (this PR)**
- Create `convex/schema.ts` with all tables
- Define validators and indexes
- Test schema with empty data

**Phase 2: Write Migration Scripts**
```typescript
// scripts/migrate-to-convex.ts
import { ConvexHttpClient } from "convex/browser";

const client = new ConvexHttpClient(process.env.CONVEX_URL!);

async function migrateAdmins() {
  // 1. Export from Neon (existing script)
  const admins = await exportAdminsFromNeon();
  
  // 2. Import to Convex
  for (const admin of admins) {
    await client.mutation(api.users.create, {
      privyDid: admin.privy_did,
      email: admin.email,
      role: admin.role,
      // ... map fields
    });
  }
}
```

**Phase 3: Test Migration (dev environment)**
```bash
# In your feature branch
bunx convex dev
bun run scripts/migrate-to-convex.ts
# Verify data in dashboard
```

**Phase 4: Production Migration**
```bash
# When ready
bunx convex deploy --prod
CONVEX_URL=<prod-url> bun run scripts/migrate-to-convex.ts
```

---

## 🔧 Common Tasks

### Add New Table

1. **Define in schema:**
   ```typescript
   // convex/schema.ts
   export default defineSchema({
     // ... existing tables
     newTable: defineTable({
       field1: v.string(),
       field2: v.number(),
     }).index("by_field1", ["field1"]),
   });
   ```

2. **Auto-save triggers deployment**
   - Convex validates schema
   - Creates table in cloud
   - Generates TypeScript types

3. **Write queries:**
   ```typescript
   // convex/newTable.ts
   import { query, mutation } from "./_generated/server";
   
   export const list = query({ /* ... */ });
   export const create = mutation({ /* ... */ });
   ```

### Debug Function Errors

**Check logs:**
```bash
# Logs appear in terminal running `bunx convex dev`
# Or view in dashboard → Logs tab
```

**Common errors:**
- `Validation error` → Check validators in schema
- `Document not found` → Check ID exists
- `Index not defined` → Add index to schema

---

## 🔐 Environment Variables

### Development

Convex generates a `.env.local` with:
```bash
CONVEX_DEPLOYMENT=dev:your-project-123
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

**Gitignored** - each dev has their own URL

### Production

Set in Vercel:
```bash
CONVEX_DEPLOYMENT=prod:your-project-456
NEXT_PUBLIC_CONVEX_URL=https://your-prod-project.convex.cloud
```

---

## 📊 Monitoring & Costs

### Dashboard Metrics

https://dashboard.convex.dev → Your Project → Usage

**Watch for:**
- Function call count (1M free/month)
- Database storage (8GB free)
- Bandwidth (10GB free/month)

### Cost Alerts

**Setup alerts:**
1. Dashboard → Settings → Billing
2. Set alert at 80% of free tier
3. Get email before hitting paid tier

**If approaching limits:**
- Review query efficiency (pagination, indexes)
- Clear dev test data
- Optimize scheduled functions frequency

---

## 🚨 Common Pitfalls

### 1. Forgetting to Run `convex dev`

**Symptom:** Changes to `convex/` don't reflect in app

**Fix:**
```bash
bunx convex dev  # Must be running for hot-reload
```

### 2. Sharing Convex Project Across Branches

**Symptom:** High function call count, data collisions

**Fix:** Use separate Convex project per feature branch

### 3. Not Gitignoring `_generated/`

**Symptom:** Merge conflicts in auto-generated files

**Fix:**
```gitignore
convex/_generated/
```

### 4. Hardcoding IDs

**Symptom:** IDs from dev don't exist in prod

**Fix:** Use queries to find documents:
```typescript
const user = await ctx.db
  .query("users")
  .withIndex("by_email", (q) => q.eq("email", "scarf@frutero.club"))
  .unique();
```

---

## 🎓 Learning Resources

- **Convex Docs:** https://docs.convex.dev
- **Skill Reference:** `/home/scarf/.openclaw/skills/convex/SKILL.md`
- **Examples:** https://github.com/get-convex/convex-examples
- **Discord:** https://convex.dev/community

---

## 📋 Checklist for New Developers

- [ ] Install Convex: `bun add convex`
- [ ] Create feature branch: `git checkout -b feature/my-feature`
- [ ] Initialize Convex: `bunx convex dev`
- [ ] Name project: `poktapok-<feature>-dev`
- [ ] Add `.gitignore` entry for `convex/_generated/`
- [ ] Read `docs/CONVEX_MIGRATION.md` for schema reference
- [ ] Test changes locally before pushing
- [ ] Document any new patterns in this file

---

**Questions?** Ask Scarf or check Convex Discord.

**Next Steps:** See `docs/CONVEX_MIGRATION.md` for migration plan.
