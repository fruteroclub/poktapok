# Convex Backend

**Project:** Poktapok  
**Status:** In development (`convex-migration` branch)  
**Deployment:** `efficient-manatee-738` (dev)  
**Dashboard:** https://dashboard.convex.dev/d/efficient-manatee-738

---

## Overview

Convex is the primary backend for Poktapok, replacing Neon/Drizzle.

### Why Convex?

- **Real-time queries** - UI updates automatically when data changes
- **TypeScript-native** - End-to-end type safety, auto-generated types
- **Built-in crons** - Scheduled functions for Luma sync
- **Serverless** - No connection pools, auto-scaling
- **Generous free tier** - 1M function calls/month

---

## Architecture

```
Frontend (Next.js)
├── ConvexProvider (src/providers/convex-provider.tsx)
├── Privy Auth → usePrivy() → privyDid
└── Convex Hooks
    ├── useQuery(api.xxx.yyy) → Real-time reads
    └── useMutation(api.xxx.yyy) → Writes

Convex Backend (convex/)
├── schema.ts         # Database schema (11 tables)
├── auth.ts           # User auth mutations
├── profiles.ts       # Profile management
├── applications.ts   # Onboarding applications
├── events.ts         # Event queries + Luma integration
├── crons.ts          # Scheduled jobs
└── luma/             # Luma calendar sync
    └── syncAction.ts
```

---

## Schema

### Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts (Privy auth) |
| `profiles` | Extended user info, social links |
| `events` | Community events (Luma sync) |
| `programs` | Training programs |
| `sessions` | Program sessions |
| `activities` | Community activities |
| `projects` | Member projects |
| `skills` | Skill taxonomy |
| `applications` | Onboarding applications |
| `invitations` | Invite codes |

### Key Indexes

```typescript
// Users
.index("by_privy_did", ["privyDid"])
.index("by_email", ["email"])
.index("by_username", ["username"])

// Events
.index("by_luma_slug", ["lumaSlug"])
.index("by_start_date", ["startDate"])
.index("by_published_date", ["isPublished", "startDate"])

// Profiles
.index("by_user_id", ["userId"])
```

Full schema: `convex/schema.ts`

---

## Functions

### Auth (`convex/auth.ts`)

| Function | Type | Purpose |
|----------|------|---------|
| `getOrCreateUser` | mutation | Create user on Privy login |
| `getCurrentUser` | query | Get user + profile by privyDid |
| `updateCurrentUser` | mutation | Update user fields |
| `updateLastLogin` | mutation | Update lastLoginAt timestamp |

**Usage:**
```typescript
// Create/get user after Privy login
const result = await getOrCreateUser({
  privyDid: "did:privy:xxx",
  email: "user@example.com",
  primaryAuthMethod: "social",
  loginMethod: "github",
});

// Query current user
const data = useQuery(api.auth.getCurrentUser, { privyDid });
// Returns: { user, profile } | null
```

### Profiles (`convex/profiles.ts`)

| Function | Type | Purpose |
|----------|------|---------|
| `upsert` | mutation | Create or update profile |
| `getByUserId` | query | Get profile by user ID |
| `getByUsername` | query | Get profile by username |

### Applications (`convex/applications.ts`)

| Function | Type | Purpose |
|----------|------|---------|
| `submit` | mutation | Submit onboarding application |
| `getByUser` | query | Get user's application |
| `list` | query | List applications (admin) |
| `approve` | mutation | Approve application |
| `reject` | mutation | Reject application |

**Usage:**
```typescript
// Submit application
await submitApplication({
  privyDid: "did:privy:xxx",
  goal: "Learn AI",
  motivationText: "I want to build...",
  githubUsername: "octocat",
});
```

### Events (`convex/events.ts`)

| Function | Type | Purpose |
|----------|------|---------|
| `listPublished` | query | Get published events |
| `upsert` | mutation | Create/update event |

### Luma Sync (`convex/luma/syncAction.ts`)

| Function | Type | Purpose |
|----------|------|---------|
| `syncLumaCalendar` | action | Fetch & sync Luma events |

**Cron:** Runs daily at 6 AM CDMX (12:00 UTC)

---

## Frontend Integration

### Provider Setup

```typescript
// src/providers/convex-provider.tsx
'use client'
import { ConvexProvider, ConvexReactClient } from 'convex/react'

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export function ConvexClientProvider({ children }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>
}
```

### Auth Flow

```
1. User clicks login → Privy modal
2. Privy authenticates → returns privyUser
3. AuthButtonConvex calls getOrCreateUser mutation
4. Convex creates/returns user
5. Redirect based on accountStatus:
   - incomplete → /onboarding
   - pending → /profile
   - active → /dashboard
```

### Type Safety

Convex types are different from the old API types (`src/types/api-v1.ts`).

**Convex types:**
- `Id<"users">` instead of `string`
- Optional fields with `v.optional()`
- Generated in `convex/_generated/dataModel.d.ts`

**Old API types:**
- `User`, `Profile` from `src/types/api-v1.ts`
- Used by Zustand store, TanStack Query hooks

**Bridge pattern:** Transform Convex data to API types when interfacing with old components:

```typescript
// Transform Convex user to API User type
function toApiUser(convexUser: Doc<"users">): User {
  return {
    id: convexUser._id,
    username: convexUser.username ?? null,
    displayName: convexUser.displayName ?? null,
    email: convexUser.email ?? null,
    bio: convexUser.bio ?? null,
    avatarUrl: convexUser.avatarUrl ?? null,
    accountStatus: convexUser.accountStatus,
    role: convexUser.role,
    createdAt: new Date(convexUser._creationTime).toISOString(),
  }
}
```

---

## Development Workflow

### Setup

```bash
# Install
bun add convex

# Start dev server (creates cloud project)
bunx convex dev

# Generates:
# - convex/_generated/ (gitignored)
# - .env.local with CONVEX_URL
```

### Daily Development

```bash
# Terminal 1: Convex dev server
bunx convex dev

# Terminal 2: Next.js
bun run dev
```

Changes to `convex/` auto-deploy to cloud.

### Commands

```bash
# Generate types without deploying
bunx convex codegen

# Deploy to production
bunx convex deploy --prod

# Run function manually
bunx convex run luma:syncLumaCalendar '{"calendarSlug":"fruteroclub"}'
```

### Branch Strategy

Each developer should use their own Convex project:

```bash
git checkout -b feature/my-feature
bunx convex dev  # Creates new project: "poktapok-my-feature-dev"
# Work, test, commit
git push origin feature/my-feature
```

**Why:** Avoids hitting shared function call limits, isolates test data.

---

## Environment Variables

### Development (.env.local)

```bash
# Auto-generated by `bunx convex dev`
CONVEX_DEPLOYMENT=dev:efficient-manatee-738
NEXT_PUBLIC_CONVEX_URL=https://efficient-manatee-738.convex.cloud
```

### Production (Vercel)

```bash
CONVEX_DEPLOYMENT=prod:your-prod-project
NEXT_PUBLIC_CONVEX_URL=https://your-prod-project.convex.cloud
```

### Vercel Build

Commit `convex/_generated/` files for Vercel builds:

```bash
# In .gitignore, these are NOT ignored:
# convex/_generated/api.d.ts
# convex/_generated/api.js
```

This is required because Vercel can't run `convex codegen` (needs auth).

---

## Testing

### Manual Testing

1. Open https://dashboard.convex.dev
2. Select project
3. Use "Data" tab to view/edit records
4. Use "Functions" tab to run queries/mutations

### Local Testing

```typescript
// Create test in scripts/
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function test() {
  const events = await client.query(api.events.listPublished);
  console.log(events);
}
```

---

## Migration Status

### Completed ✅

- [x] Schema created (11 tables)
- [x] ConvexProvider integrated
- [x] Auth functions (getOrCreateUser, getCurrentUser, checkUsername)
- [x] Profile functions (upsert, getByUserId)
- [x] Application functions (submit, approve, reject)
- [x] Events query (listPublished)
- [x] Luma sync action
- [x] Cron job (daily sync)
- [x] AuthButtonConvex component
- [x] Full onboarding form with Convex (4 steps: userInfo, goal, social, review)
- [x] Auth store integration (bridge Convex types to API types via convex-transforms.ts)
- [x] Type transforms (toApiUser, toApiProfile)

### In Progress 🔄

- [ ] Test full login → onboarding flow
- [ ] Migrate remaining components

### Pending ⏳

- [ ] Remove old API routes
- [ ] Production deployment
- [ ] Admin re-registration

---

## Troubleshooting

### "Cannot find module 'convex/_generated/api'"

Run codegen:
```bash
bunx convex codegen
```

### "Convex dev server not connected"

Start the dev server:
```bash
bunx convex dev
```

### "Function call limit exceeded"

- Use separate Convex project per dev
- Check for infinite re-renders in useQuery
- Add proper dependencies to useQuery calls

### "Type mismatch with store"

Convex types ≠ API types. Use transform functions (see Frontend Integration section).

---

## Resources

- **Convex Docs:** https://docs.convex.dev
- **Dashboard:** https://dashboard.convex.dev
- **Convex Skill:** `~/.openclaw/skills/convex/SKILL.md`
- **Discord:** https://convex.dev/community

---

## File Reference

```
convex/
├── schema.ts              # Database schema
├── auth.ts                # User auth mutations/queries
├── profiles.ts            # Profile management
├── applications.ts        # Onboarding applications
├── events.ts              # Event queries
├── users.ts               # User queries (if needed)
├── crons.ts               # Scheduled jobs
├── luma/
│   ├── actions.ts         # Luma API integration
│   └── syncAction.ts      # Sync action (public)
├── tsconfig.json          # Convex TS config
└── _generated/            # Auto-generated (mostly gitignored)
    ├── api.d.ts           # API types (committed)
    ├── api.js             # API runtime (committed)
    ├── dataModel.d.ts     # Data model types
    └── server.d.ts        # Server types

src/
├── providers/
│   └── convex-provider.tsx    # ConvexProvider wrapper
├── hooks/
│   ├── use-auth-with-convex.ts    # Convex auth hook
│   ├── use-onboarding-convex.ts   # Convex onboarding hooks
│   ├── use-events-convex.ts       # Convex events hook
│   └── use-profiles-convex.ts     # Convex profiles hook
└── components/
    ├── buttons/
    │   └── auth-button-convex.tsx     # Auth button with Convex
    └── onboarding/
        └── multi-step-onboarding-form-convex.tsx
```
