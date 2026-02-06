# Convex Implementation Plan

**Project:** Poktapok  
**Branch:** `convex-migration`  
**Type:** Fresh implementation (no data migration)  
**Date:** 2026-02-06

---

## 🎯 Overview

Implementing Convex as the primary backend for Poktapok, replacing Neon/Drizzle ORM.

**Approach:** Fresh start - no data migration from Neon. Users and events will be created fresh in Convex.

---

## 📊 Why Convex?

### Advantages Over Neon + Drizzle

**Real-time by default:**
- Reactive queries (no polling needed)
- Automatic UI updates when data changes

**TypeScript-native:**
- End-to-end type safety
- Auto-generated types from schema
- No ORM abstractions

**Serverless & Scalable:**
- No connection pools to manage
- Auto-scaling
- Generous free tier (1M calls/month)

**Built-in Features:**
- Scheduled functions (cron jobs)
- File storage
- Authentication integration (Privy/Clerk)
- Transactions by default

**Developer Experience:**
- Hot-reload dev server
- Visual dashboard
- Simple query/mutation syntax

---

## 🏗️ Architecture

### Database Structure

```
Convex Backend
├── users              # User accounts (Privy integration)
├── profiles           # Extended user data
├── events             # Community events (Luma integration)
├── programs           # Training programs
├── sessions           # Program sessions
├── activities         # Community activities
├── projects           # Member projects
├── skills             # Skill taxonomy
└── ... (other tables as needed)
```

### Key Tables

#### 1. Users
- Privy authentication integration
- Role-based access (member, moderator, admin)
- Soft delete support
- Account status tracking

#### 2. Events
- Luma calendar integration
- Scheduled sync (daily cron)
- Cover images, location, RSVP tracking

#### 3. Profiles
- Extended user information
- Social links, learning tracks
- Profile visibility settings

---

## 📋 Schema Design: Convex

### Users Table

```typescript
users: defineTable({
  // Privy Authentication
  privyDid: v.string(),
  email: v.optional(v.string()),
  
  // Profile
  username: v.optional(v.string()),
  displayName: v.optional(v.string()),
  bio: v.optional(v.string()),
  avatarUrl: v.optional(v.string()),
  
  // Wallets
  extWallet: v.optional(v.string()),  // External wallet
  appWallet: v.optional(v.string()),  // Privy embedded wallet
  
  // Authentication
  primaryAuthMethod: v.union(
    v.literal("email"),
    v.literal("wallet"),
    v.literal("social")
  ),
  
  // Authorization
  role: v.union(
    v.literal("member"),
    v.literal("moderator"),
    v.literal("admin")
  ),
  
  // Account Status
  accountStatus: v.union(
    v.literal("incomplete"),
    v.literal("pending"),
    v.literal("active"),
    v.literal("suspended"),
    v.literal("banned")
  ),
  
  // Timestamps
  lastLoginAt: v.number(),  // Unix ms
  deletedAt: v.optional(v.number()),  // Soft delete
  
  // Metadata
  privyMetadata: v.optional(v.any()),
  metadata: v.optional(v.any()),
})
  .index("by_privy_did", ["privyDid"])
  .index("by_email", ["email"])
  .index("by_username", ["username"])
  .index("by_role", ["role"])
  .index("by_account_status", ["accountStatus"])
```

### Events Table

```typescript
events: defineTable({
  // Core Info
  title: v.string(),
  description: v.optional(v.string()),
  coverImage: v.optional(v.string()),
  
  // Luma Integration
  lumaUrl: v.string(),
  lumaEventId: v.optional(v.string()),
  lumaSlug: v.optional(v.string()),
  
  // Event Details
  eventType: v.union(
    v.literal("in-person"),
    v.literal("virtual"),
    v.literal("hybrid")
  ),
  startDate: v.number(),  // Unix ms
  endDate: v.optional(v.number()),
  timezone: v.string(),
  
  // Location
  location: v.optional(v.string()),
  locationDetails: v.optional(v.string()),
  locationUrl: v.optional(v.string()),
  coordinates: v.optional(v.object({
    lat: v.number(),
    lng: v.number(),
  })),
  
  // Organizers
  hosts: v.array(v.object({
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    handle: v.optional(v.string()),
  })),
  calendar: v.optional(v.string()),
  
  // Status
  status: v.union(
    v.literal("upcoming"),
    v.literal("live"),
    v.literal("past"),
    v.literal("cancelled")
  ),
  isPublished: v.boolean(),
  isFeatured: v.boolean(),
  
  // Registration
  registrationCount: v.number(),
  maxCapacity: v.optional(v.number()),
  registrationType: v.union(
    v.literal("free"),
    v.literal("paid"),
    v.literal("approval")
  ),
  
  // Metadata
  metadata: v.optional(v.any()),
})
  .index("by_luma_slug", ["lumaSlug"])
  .index("by_start_date", ["startDate"])
  .index("by_status", ["status"])
  .index("by_published", ["isPublished"])
  .index("by_calendar", ["calendar"])
```

### Profiles Table

```typescript
profiles: defineTable({
  userId: v.id("users"),  // Reference to users table
  
  // Location
  city: v.optional(v.string()),
  country: v.optional(v.string()),
  countryCode: v.optional(v.string()),
  
  // Social Links
  githubUrl: v.optional(v.string()),
  twitterUrl: v.optional(v.string()),
  linkedinUrl: v.optional(v.string()),
  telegramHandle: v.optional(v.string()),
  
  // Learning
  learningTracks: v.array(v.union(
    v.literal("ai"),
    v.literal("crypto"),
    v.literal("privacy")
  )),
  
  // Privacy
  profileVisibility: v.union(
    v.literal("public"),
    v.literal("members"),
    v.literal("private")
  ),
  
  // Status
  availabilityStatus: v.union(
    v.literal("available"),
    v.literal("open_to_offers"),
    v.literal("unavailable")
  ),
  
  // Stats
  completedBounties: v.number(),
  totalEarningsUsd: v.number(),
  profileViews: v.number(),
  
  // Metadata
  metadata: v.optional(v.any()),
})
  .index("by_user_id", ["userId"])
  .index("by_visibility", ["profileVisibility"])
```

---

## 🚀 Implementation Steps

### Phase 1: Setup & Schema ✅

1. **Install Convex**
   ```bash
   bun add convex
   ```

2. **Initialize Convex**
   ```bash
   bunx convex dev
   # Creates convex/ directory
   # Generates cloud dev project
   ```

3. **Create Schema**
   - Create `convex/schema.ts`
   - Define users, events, profiles tables
   - Add indexes for query performance

4. **Test Schema**
   - Verify in dashboard
   - Insert test data manually

### Phase 2: Core Functions

1. **User Management**
   ```typescript
   // convex/users.ts
   export const create = mutation(...)
   export const get = query(...)
   export const update = mutation(...)
   export const list = query(...)
   ```

2. **Event Management**
   ```typescript
   // convex/events.ts
   export const create = mutation(...)
   export const list = query(...)
   export const getPublished = query(...)
   ```

3. **Profile Management**
   ```typescript
   // convex/profiles.ts
   export const create = mutation(...)
   export const get = query(...)
   export const update = mutation(...)
   ```

### Phase 3: Luma Integration

1. **Scheduled Function**
   ```typescript
   // convex/crons.ts
   import { cronJobs } from "convex/server";
   
   const crons = cronJobs();
   
   crons.daily(
     "sync frutero luma calendar",
     { hourUTC: 12, minuteUTC: 0 },  // 6 AM CDMX
     internal.luma.syncCalendar,
     { calendarSlug: "fruteroclub" }
   );
   
   export default crons;
   ```

2. **Sync Function**
   ```typescript
   // convex/luma/syncCalendar.ts
   export const syncCalendar = internalMutation({
     args: { calendarSlug: v.string() },
     handler: async (ctx, args) => {
       // Fetch events from Luma API
       // Parse JSON-LD data
       // Create/update events in Convex
     },
   });
   ```

### Phase 4: Authentication

1. **Privy Integration**
   ```typescript
   // convex/auth.ts
   export const createUserFromPrivy = mutation({
     args: {
       privyDid: v.string(),
       email: v.optional(v.string()),
       primaryAuthMethod: v.string(),
     },
     handler: async (ctx, args) => {
       // Create user in Convex
       // Create profile
       // Return user
     },
   });
   ```

2. **Frontend Integration**
   ```typescript
   // src/app/layout.tsx
   import { ConvexProvider } from "convex/react";
   import { ConvexProviderWithAuth } from "convex/react-clerk";
   
   // Wrap app with ConvexProvider
   ```

### Phase 5: Frontend Migration

1. **Replace Drizzle Queries**
   ```typescript
   // Before (Drizzle)
   const users = await db.select().from(users);
   
   // After (Convex)
   const users = useQuery(api.users.list);
   ```

2. **Replace API Routes**
   - Move logic from `src/app/api/` to `convex/`
   - Use Convex queries/mutations directly
   - Remove Next.js API routes

3. **Update Components**
   - Use `useQuery` for reads
   - Use `useMutation` for writes
   - Real-time updates automatic

### Phase 6: Testing

1. **Local Testing**
   - Test all queries/mutations
   - Verify Luma sync works
   - Test Privy auth flow

2. **Create Test Users**
   - Register 3 admin users
   - Verify role assignment
   - Test permissions

3. **Verify Events**
   - Run Luma sync manually
   - Check events appear on landing page
   - Verify event details correct

### Phase 7: Production Deployment

1. **Deploy Convex**
   ```bash
   bunx convex deploy --prod
   ```

2. **Update Environment Variables**
   - Set `NEXT_PUBLIC_CONVEX_URL` in Vercel
   - Update Privy config if needed

3. **Deploy Frontend**
   ```bash
   vercel deploy --prod
   ```

4. **Post-Deploy**
   - Verify production Convex works
   - Run Luma sync in production
   - Test user registration flow

---

## 🔄 Luma Sync Implementation

### Scheduled Function (Cron)

```typescript
// convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run daily at 6 AM Mexico City time (12 PM UTC)
crons.daily(
  "sync frutero luma calendar",
  { hourUTC: 12, minuteUTC: 0 },
  internal.luma.syncCalendar,
  { calendarSlug: "fruteroclub" }
);

export default crons;
```

### Sync Logic

```typescript
// convex/luma/syncCalendar.ts
import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const syncCalendar = internalMutation({
  args: {
    calendarSlug: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Fetch calendar HTML
    const response = await fetch(
      `https://luma.com/${args.calendarSlug}`
    );
    const html = await response.text();
    
    // 2. Extract events from JSON-LD
    const events = extractCalendarEvents(html);
    
    // 3. Upsert events to Convex
    for (const event of events) {
      const existing = await ctx.db
        .query("events")
        .withIndex("by_luma_slug", (q) => 
          q.eq("lumaSlug", event.slug)
        )
        .unique();
      
      if (existing) {
        // Update existing event
        await ctx.db.patch(existing._id, {
          startDate: new Date(event.startDate).getTime(),
          endDate: event.endDate 
            ? new Date(event.endDate).getTime() 
            : undefined,
          // ... other fields
        });
      } else {
        // Create new event
        await ctx.db.insert("events", {
          title: event.title,
          lumaUrl: event.url,
          lumaSlug: event.slug,
          startDate: new Date(event.startDate).getTime(),
          // ... other fields
          isPublished: true,
          isFeatured: false,
          registrationCount: 0,
          registrationType: "free",
          hosts: [],
          status: "upcoming",
        });
      }
    }
    
    return { synced: events.length };
  },
});

function extractCalendarEvents(html: string) {
  // Parse JSON-LD from HTML
  // Return array of event objects
  // (Copy logic from existing Neon implementation)
}
```

---

## 🎯 Success Criteria

### Functionality
- [ ] Users can register with Privy (email/social)
- [ ] Admin role assignment works
- [ ] Events display on landing page
- [ ] Luma sync runs daily and updates events
- [ ] Real-time updates work (new event appears without refresh)

### Performance
- [ ] Query response time < 100ms
- [ ] Real-time updates < 1s latency
- [ ] Luma sync completes in < 30s

### Developer Experience
- [ ] Schema changes deploy automatically
- [ ] Hot-reload works in dev
- [ ] Dashboard useful for debugging
- [ ] Documentation clear for new devs

---

## 📝 Next Actions

1. **Create `convex/schema.ts`** with users, events, profiles
2. **Run `bunx convex dev`** to initialize project
3. **Write basic queries** (list users, list events)
4. **Implement Luma sync** as scheduled function
5. **Test locally** with dev project
6. **Deploy to production** when ready

---

## 🔗 Resources

- **Convex Docs:** https://docs.convex.dev
- **Dev Workflow:** `docs/dev/CONVEX_DEV_WORKFLOW.md`
- **Convex Skill:** `/home/scarf/.openclaw/skills/convex/SKILL.md`
- **Dashboard:** https://dashboard.convex.dev

---

**Status:** Ready to implement  
**Next Step:** Create schema and initialize Convex
