# Convex Migration Plan

**Branch:** `convex-migration`  
**From:** Neon PostgreSQL + Drizzle ORM  
**To:** Convex Backend  
**Date:** 2026-02-06

---

## 🎯 Migration Goals

1. Migrate database schema from PostgreSQL to Convex
2. Migrate existing admin users data
3. Migrate events from Luma integration
4. Replicate cron job functionality for Luma calendar sync
5. Maintain all existing functionality

---

## 📊 Current Stack (Neon)

### Database
- **Provider:** Neon (serverless PostgreSQL)
- **ORM:** Drizzle ORM
- **Connection:** Pooled + Unpooled (for migrations)
- **Migrations:** Tracked in `drizzle/migrations/`

### Tables (17 total)
Critical for migration:
1. **users** - Admin accounts, profiles, authentication
2. **events** - Luma calendar events
3. **profiles** - Extended user data
4. **applications** - Onboarding queue
5. **invitations** - Referral system
6. **programs** - Training programs
7. **sessions** - Program sessions
8. **activities** - Community activities
9. **attendance** - Session attendance
10. **projects** - Member projects
11. **skills** - Skill taxonomy
12. **program_enrollments** - User-program relationships
13. **session_activities** - Session-activity links
14. **program_activities** - Program-activity links

### Key Features
- Soft deletes (`deleted_at` timestamp)
- UUID primary keys
- JSONB metadata fields
- Timestamps (`created_at`, `updated_at`)
- PostgreSQL CHECK constraints
- Foreign keys with CASCADE/SET NULL

---

## 🚀 Target Stack (Convex)

### Why Convex?
- **Real-time by default** - Reactive queries (vs polling)
- **TypeScript-native** - End-to-end type safety
- **Serverless** - No connection pools, auto-scaling
- **Built-in auth** - Clerk/Auth0 integration
- **File storage** - Native file uploads
- **Scheduled functions** - Replace cron jobs
- **Transactions** - Automatic via mutations
- **No SQL** - Document-oriented, flexible schema

### Architecture
```
convex/
├── schema.ts              # Define all tables + validators
├── users.ts              # User queries/mutations
├── events.ts             # Event queries/mutations
├── luma/
│   ├── sync.ts          # Luma calendar sync (scheduled)
│   └── fetch.ts         # Fetch individual event metadata
├── auth.ts              # Authentication logic
└── _generated/          # Auto-generated types
```

---

## 📋 Schema Mapping: Neon → Convex

### 1. Users Table

#### Neon (PostgreSQL + Drizzle)
```typescript
users {
  id: uuid (PK)
  privy_did: varchar(255) unique NOT NULL
  email: varchar(255) unique
  username: varchar(50) unique
  display_name: varchar(100)
  bio: text
  avatar_url: varchar(500)
  ext_wallet: varchar(42)
  app_wallet: varchar(42)
  primary_auth_method: enum('email', 'wallet', 'social')
  role: enum('member', 'moderator', 'admin')
  account_status: enum('incomplete', 'pending', 'active', 'suspended', 'banned')
  created_at: timestamp
  updated_at: timestamp
  last_login_at: timestamp
  deleted_at: timestamp (soft delete)
  privy_metadata: jsonb
  metadata: jsonb
}
```

#### Convex Schema
```typescript
users: defineTable({
  privyDid: v.string(),
  email: v.optional(v.string()),
  username: v.optional(v.string()),
  displayName: v.optional(v.string()),
  bio: v.optional(v.string()),
  avatarUrl: v.optional(v.string()),
  extWallet: v.optional(v.string()),
  appWallet: v.optional(v.string()),
  primaryAuthMethod: v.union(
    v.literal("email"),
    v.literal("wallet"),
    v.literal("social")
  ),
  role: v.union(
    v.literal("member"),
    v.literal("moderator"),
    v.literal("admin")
  ),
  accountStatus: v.union(
    v.literal("incomplete"),
    v.literal("pending"),
    v.literal("active"),
    v.literal("suspended"),
    v.literal("banned")
  ),
  lastLoginAt: v.number(), // Unix timestamp
  deletedAt: v.optional(v.number()), // Soft delete
  privyMetadata: v.optional(v.any()),
  metadata: v.optional(v.any()),
})
  .index("by_privy_did", ["privyDid"])
  .index("by_email", ["email"])
  .index("by_username", ["username"])
  .index("by_role", ["role"])
```

**Changes:**
- UUID → Convex auto-generates `_id`
- Timestamps → Unix milliseconds (numbers)
- JSONB → `v.any()` (flexible objects)
- CHECK constraints → Validated at app layer
- Soft delete preserved

---

### 2. Events Table

#### Neon (PostgreSQL + Drizzle)
```typescript
events {
  id: uuid (PK)
  program_id: uuid (FK → programs.id)
  title: varchar(300) NOT NULL
  description: text
  cover_image: text
  luma_url: text NOT NULL
  luma_event_id: varchar(100)
  luma_slug: varchar(100)
  event_type: varchar(50) default 'in-person'
  start_date: timestamp NOT NULL
  end_date: timestamp
  timezone: varchar(100) default 'America/Mexico_City'
  location: text
  location_details: text
  location_url: text
  coordinates: jsonb (lat/lng)
  hosts: jsonb (array of host objects)
  calendar: varchar(100)
  status: varchar(20) default 'upcoming'
  is_published: boolean default false
  is_featured: boolean default false
  registration_count: integer default 0
  max_capacity: integer
  registration_type: varchar(50) default 'free'
  created_at: timestamp
  updated_at: timestamp
  metadata: jsonb
}
```

#### Convex Schema
```typescript
events: defineTable({
  programId: v.optional(v.id("programs")),
  title: v.string(),
  description: v.optional(v.string()),
  coverImage: v.optional(v.string()),
  lumaUrl: v.string(),
  lumaEventId: v.optional(v.string()),
  lumaSlug: v.optional(v.string()),
  eventType: v.union(
    v.literal("in-person"),
    v.literal("virtual"),
    v.literal("hybrid")
  ),
  startDate: v.number(), // Unix timestamp
  endDate: v.optional(v.number()),
  timezone: v.string(),
  location: v.optional(v.string()),
  locationDetails: v.optional(v.string()),
  locationUrl: v.optional(v.string()),
  coordinates: v.optional(v.object({
    lat: v.number(),
    lng: v.number(),
  })),
  hosts: v.array(v.object({
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    handle: v.optional(v.string()),
  })),
  calendar: v.optional(v.string()),
  status: v.union(
    v.literal("upcoming"),
    v.literal("live"),
    v.literal("past"),
    v.literal("cancelled")
  ),
  isPublished: v.boolean(),
  isFeatured: v.boolean(),
  registrationCount: v.number(),
  maxCapacity: v.optional(v.number()),
  registrationType: v.union(
    v.literal("free"),
    v.literal("paid"),
    v.literal("approval")
  ),
  metadata: v.optional(v.any()),
})
  .index("by_luma_slug", ["lumaSlug"])
  .index("by_start_date", ["startDate"])
  .index("by_status", ["status"])
  .index("by_published", ["isPublished"])
```

**Changes:**
- Foreign keys → Convex `v.id("table_name")`
- Timestamps → Unix milliseconds
- JSONB → Convex objects/arrays
- Defaults handled in mutations

---

## 🔄 Migration Strategy

### Phase 1: Setup Convex (✅ Skill installed)
- [x] Install Convex skill: `/home/scarf/.openclaw/skills/convex`
- [ ] Install Convex in project: `npm install convex`
- [ ] Initialize Convex: `npx convex dev`
- [ ] Create `convex/` directory

### Phase 2: Schema Migration
- [ ] Create `convex/schema.ts` with all table definitions
- [ ] Define validators for all fields
- [ ] Create indexes for query performance
- [ ] Test schema with `npx convex dev`

### Phase 3: Code Migration
- [ ] Replace Drizzle queries with Convex queries
- [ ] Migrate API routes to Convex mutations/queries
- [ ] Update authentication logic (Privy → Convex auth)
- [ ] Migrate file uploads to Convex storage

### Phase 4: Data Migration
- [ ] Export admins from Neon: `SELECT * FROM users WHERE role = 'admin'`
- [ ] Export events: `SELECT * FROM events WHERE is_published = true`
- [ ] Write migration script: `scripts/migrate-to-convex.ts`
- [ ] Run data import to Convex
- [ ] Verify data integrity

### Phase 5: Cron Jobs → Scheduled Functions
- [ ] Replace `/api/luma/sync-calendar` with Convex scheduled function
- [ ] Create `convex/luma/sync.ts` with cron schedule
- [ ] Test automatic event syncing
- [ ] Configure schedule (e.g., daily at 6am)

### Phase 6: Testing
- [ ] Test user authentication flow
- [ ] Test event display on landing page
- [ ] Test Luma calendar sync
- [ ] Test admin functionality
- [ ] Test real-time updates

### Phase 7: Deployment
- [ ] Deploy Convex backend: `npx convex deploy`
- [ ] Update environment variables
- [ ] Deploy frontend to Vercel
- [ ] Monitor for issues
- [ ] Backup Neon data (keep as fallback)

---

## 🛠️ Implementation Plan

### Step 1: Install Convex
```bash
cd /home/scarf/.openclaw/workspace/poktapok
npm install convex
npx convex dev
```

### Step 2: Create Schema
Create `convex/schema.ts`:
```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    // ... (see mapping above)
  }),
  events: defineTable({
    // ... (see mapping above)
  }),
  // ... other tables
});
```

### Step 3: Migrate API Routes

#### Before (Next.js API Route)
```typescript
// src/app/api/events/route.ts
export async function GET() {
  const events = await db.select().from(events).where(eq(events.isPublished, true));
  return Response.json(events);
}
```

#### After (Convex Query)
```typescript
// convex/events.ts
import { query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect();
  },
});
```

#### Frontend Usage
```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function EventsList() {
  const events = useQuery(api.events.list);
  // ... render events
}
```

### Step 4: Luma Sync (Scheduled Function)

Create `convex/luma/sync.ts`:
```typescript
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run daily at 6 AM Mexico City time
crons.daily(
  "sync luma calendar",
  { hourUTC: 12, minuteUTC: 0 }, // 6 AM CDMX = 12 PM UTC
  internal.luma.sync.syncCalendar
);

export default crons;
```

---

## 📦 Data to Migrate (Priority)

### 1. Admin Users (Critical)
```sql
SELECT * FROM users WHERE role = 'admin';
```
**Expected count:** 2-5 users  
**Why critical:** Need access to admin panel

### 2. Published Events (High Priority)
```sql
SELECT * FROM events WHERE is_published = true;
```
**Expected count:** 10-50 events  
**Why critical:** Landing page shows events

### 3. Luma Calendar Config (High Priority)
- Calendar slug: `frutero-club` (or whatever slug is used)
- Sync schedule: Daily at 6 AM

### 4. Other Data (Lower Priority)
- Applications (pending approvals)
- Invitations (active codes)
- Programs (training programs)
- Sessions (scheduled sessions)

---

## 🔍 Current Cron Jobs

### Luma Calendar Sync
- **Endpoint:** `POST /api/luma/sync-calendar`
- **Body:** `{ "calendarSlug": "frutero-club" }`
- **Frequency:** Unknown (need to check Vercel Cron config or manual trigger)
- **Action:** Fetches events from lu.ma calendar, creates/updates in DB

#### Convex Replacement
```typescript
// convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "sync frutero luma calendar",
  { hourUTC: 12, minuteUTC: 0 }, // 6 AM Mexico City
  internal.luma.syncCalendar,
  { calendarSlug: "frutero-club" }
);

export default crons;
```

---

## ⚠️ Breaking Changes & Considerations

### 1. Authentication
**Neon:** Privy DID stored in users table  
**Convex:** Can integrate Privy via Convex auth config

**Action needed:**
- Configure Convex auth to work with Privy
- Migrate `privy_did` to Convex user identity
- Test login flow

### 2. Soft Deletes
**Neon:** `deleted_at IS NULL` in queries  
**Convex:** Filter by `deletedAt` field

**Action needed:**
- Add filters to all queries: `.filter(q => q.eq(q.field("deletedAt"), undefined))`

### 3. Timestamps
**Neon:** PostgreSQL timestamps (ISO strings)  
**Convex:** Unix milliseconds (numbers)

**Action needed:**
- Convert on migration: `new Date(timestamp).getTime()`
- Convert on display: `new Date(timestamp).toISOString()`

### 4. Foreign Keys
**Neon:** Enforced by database  
**Convex:** Enforced by validators + app logic

**Action needed:**
- Use `v.id("table_name")` in schema
- Validate references in mutations

### 5. File Uploads
**Neon:** Vercel Blob Storage  
**Convex:** Convex File Storage

**Action needed:**
- Migrate avatar uploads to Convex storage
- Update upload API routes

---

## 📝 Next Steps

1. **Create comprehensive schema** in `convex/schema.ts`
2. **Write data migration script** to export from Neon
3. **Implement core queries/mutations** for users and events
4. **Replicate Luma sync logic** as scheduled function
5. **Test locally** with `npx convex dev`
6. **Migrate admins first**, then events
7. **Deploy to production** when stable

---

## 🔗 Resources

- **Convex Docs:** https://docs.convex.dev
- **Convex Skill:** `/home/scarf/.openclaw/skills/convex/SKILL.md`
- **Current DB Setup:** `docs/dev/database-setup.md`
- **Neon Schema:** `drizzle/schema/`
- **API Routes:** `src/app/api/`

---

**Status:** 📋 Planning Phase  
**Next Action:** Install Convex + create initial schema  
**Estimated Time:** 2-3 days for full migration
