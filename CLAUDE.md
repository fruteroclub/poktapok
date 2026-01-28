# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Poktapok** is a talent platform connecting Latin American developers with global opportunities through bounties and practical learning. The platform helps university students, recent graduates, and career transitioners earn money in 3 months learning AI, crypto/DeFi, and privacy through real-world challenges.

**Current State:** Full-stack Next.js 16 application with React 19, TypeScript, Tailwind CSS v4, PostgreSQL database via Neon DB, Drizzle ORM, and Web3 wallet integration via Privy.

**Architecture Flow:** `talent directory → portfolio showcase → bounty marketplace → onchain funding`

## Development Commands

```bash
# Development
bun dev                    # Start dev server (http://localhost:3000)
bun run build              # Build for production (uses Turbopack)
bun start                  # Run production build
bun run lint               # Lint codebase

# Database
bun run db:generate        # Generate migrations from schema changes
bun run db:migrate         # Apply pending migrations
bun run db:list-migrations # List all applied migrations
bun run db:studio          # Open Drizzle Studio (visual DB browser)
bun run db:check           # Check for schema drift

# Database Testing
bun run scripts/test-db-connection.ts      # Test database connectivity
bun run scripts/verify-migration.ts        # Verify all database objects
bun run scripts/test-crud-operations.ts    # Test CRUD operations

# Environment Setup
vercel env pull .env.local # Pull environment variables from Vercel
```

The project uses **Bun** as its package manager and runtime.

## Architecture

### Provider Hierarchy

The application uses a layered provider architecture that wraps all pages:

1. **AppProvider** (`src/providers/app-provider.tsx`) - Root provider with Suspense boundary
2. **PrivyProviderComponent** (`src/providers/auth/privy-provider.tsx`) - Privy authentication + React Query + Wagmi
3. **Wagmi Config** (`src/providers/onchain-config/index.tsx`) - Chain configuration with Alchemy/public RPC fallback

This creates a provider chain: `Suspense` → `Privy` → `QueryClient` → `Wagmi` → `{children}`

### Database Architecture

The application uses **PostgreSQL** (Neon DB via Vercel) with **Drizzle ORM** and **node-postgres**.

**Schema Structure:**

**Core Tables:**
- **users** - Core identity & authentication (linked to Privy DID)
- **profiles** - Extended user data (location, social links as usernames, learning tracks, stats)
  - E3-T2: Updated to store `github_username`, `twitter_username`, `telegram_username` (usernames without @), `linkedin_url` (full URL)
- **applications** - Onboarding queue (pending/approved/rejected signup applications)
  - E3-T1: Added `program_id` (foreign key to programs), `goal` (1-280 chars), `github_username`, `twitter_username`
- **invitations** - Referral system (invite codes with expiration tracking)

**Program Management (E3-T1):**
- **programs** - Program definitions (cohort/evergreen types, e.g., "De Cero a Chamba", "DeFi-esta", "Open")
- **program_activities** - Junction table linking programs to activities (many-to-many)
- **program_enrollments** - User enrollments in programs (tracks status, completion, promotion)
- **attendance** - Session attendance tracking (marked by admins, affects guest→member promotion)

**Projects & Skills:**
- **projects** - User portfolio projects
- **skills** - Skill catalog (languages, frameworks, tools)
- **user_skills** - User skill proficiency levels
- **project_skills** - Skills used in projects

**Activities & Bounties:**
- **activities** - Learning activities and bounties
- **activity_submissions** - User submissions to activities
- **pulpa_distributions** - Token distributions for completed work

**Connection Strategy:**

- `DATABASE_URL` - Pooled connection for application queries (10 connections max)
- `DATABASE_URL_UNPOOLED` - Direct connection for migrations
- Database client: `src/lib/db/index.ts` (exports `db`, `pool`, `closeDatabase`)
- Schema exports: `src/lib/db/schema.ts` (re-exports all tables for app use)

**Key Patterns:**

- Soft deletes via `deletedAt` timestamp (in users table)
- Timestamps (`createdAt`, `updatedAt`) on all tables
- Metadata JSONB column (default `'{}'::jsonb`) on all tables
- CHECK constraints with inlined regex patterns (required by Drizzle migrations)
- Composite indexes for common query patterns

**Important Notes:**

- Schema files are in `drizzle/schema/` (utils.ts, users.ts, profiles.ts, applications.ts, invitations.ts)
- Never use parameterized CHECK constraints - inline all patterns directly
- Generated columns cannot use time-based functions (NOW(), CURRENT_TIMESTAMP)
- Application-level status computation for time-dependent fields

See [docs/database-setup.md](docs/database-setup.md) for complete setup guide, schema reference, and query patterns.

### API Response Pattern

All API endpoints follow a **standardized envelope pattern** with discriminated unions for type-safe response handling.

#### Response Structure

**Success Response:**

```typescript
{
  success: true,
  data: { ... },           // The actual response data
  message?: string,        // Optional success message
  meta?: { ... }           // Optional metadata (pagination, etc.)
}
```

**Error Response:**

```typescript
{
  success: false,
  error: {
    message: string,       // Human-readable error message
    code?: string,         // Machine-readable error code
    details?: unknown      // Additional error details (e.g., validation errors)
  }
}
```

#### Server-Side Usage (API Routes)

Use the response helpers from `src/lib/api/response.ts`:

```typescript
import { apiSuccess, apiError, apiValidationError, apiErrors } from '@/lib/api/response'

// Success response
return apiSuccess({ user, profile })

// Success with message
return apiSuccess({ profile }, { message: 'Profile created successfully' })

// Success with metadata (e.g., pagination)
return apiSuccess({ profiles }, { meta: { pagination: { page: 1, total: 100, hasMore: true } } })

// Validation error (from Zod)
const result = schema.safeParse(data)
if (!result.success) {
  return apiValidationError(result.error)
}

// Specific error shortcuts
return apiErrors.unauthorized() // 401
return apiErrors.notFound('User') // 404
return apiErrors.conflict('Username taken') // 409
return apiErrors.internal('Database error') // 500

// Custom error
return apiError('Custom error message', {
  code: 'CUSTOM_ERROR',
  details: { field: 'email' },
  status: 400,
})
```

#### Client-Side Usage (Services)

Use the `apiFetch` wrapper from `src/lib/api/fetch.ts` for automatic error handling:

```typescript
import { apiFetch } from '@/lib/api/fetch'

// Simple GET request
export async function fetchMe(): Promise<MeResponse> {
  return apiFetch<MeResponse>('/api/auth/me')
}

// POST request with body
export async function createProfile(data: ProfileFormData): Promise<CreateProfileResponse> {
  return apiFetch<CreateProfileResponse>('/api/profiles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}
```

The `apiFetch` wrapper:

- Automatically unwraps the `{ success, data }` envelope
- Throws structured `ApiError` on failure with `code`, `details`, and `status`
- Handles JSON parsing errors gracefully
- Provides type-safe responses

#### Error Handling in Hooks

```typescript
import { ApiError } from '@/lib/api/fetch'
import { toast } from 'sonner'

const mutation = useMutation({
  mutationFn: createProfile,
  onSuccess: (data) => {
    toast.success('Profile created successfully')
  },
  onError: (error: ApiError) => {
    // Access structured error data
    toast.error(error.message)
    console.error('Error code:', error.code)
    console.error('Error details:', error.details)
  },
})
```

#### HTTP Status Code Standards

| Status | Use Case                 | Helper                                                     |
| ------ | ------------------------ | ---------------------------------------------------------- |
| 200    | Success                  | `apiSuccess()`                                             |
| 400    | Bad Request / Validation | `apiValidationError()` or `apiError(..., { status: 400 })` |
| 401    | Unauthorized             | `apiErrors.unauthorized()`                                 |
| 404    | Not Found                | `apiErrors.notFound(resource)`                             |
| 409    | Conflict (duplicate)     | `apiErrors.conflict(message)`                              |
| 500    | Internal Server Error    | `apiErrors.internal()`                                     |

#### Type Definitions

All API types are centralized in `src/types/api-v1.ts`. Response wrappers are defined in `src/types/api-response.ts`.

**Example:**

```typescript
// src/types/api-v1.ts
export interface User { id: string; username: string; ... }
export interface Profile { id: string; userId: string; ... }

export interface MeResponse {
  user: User;
  profile: Profile | null;
}

// Service returns unwrapped data
export async function fetchMe(): Promise<MeResponse> {
  return apiFetch<MeResponse>("/api/auth/me");
}
```

**Important:** Never mix patterns. Always use the envelope pattern for all new endpoints and migrations.

### Authentication & Web3

- **Privy** handles wallet authentication (embedded + external wallets)
- **Wagmi** manages blockchain interactions
- Default chain is Arbitrum; supports 6 chains total (Base, Ethereum, Optimism, Polygon, Scroll)
- Alchemy API key is optional (falls back to public RPCs)

### Epic 3: Program Management System

The Program Management system implements a complete tiered membership workflow from application through promotion.

**Status Flow**: `incomplete` → `pending` → `guest`/`active` → `active` (promoted)

#### User Onboarding (E3-T2)

Multi-step application process with program selection and goal commitment:

**API Endpoints:**
- `GET /api/programs/active` - Returns list of active programs for selection
- `POST /api/applications` - Submits onboarding application with program choice and goal

**Onboarding Steps:**
1. **Program Selection** - User chooses from active programs (cohort or evergreen)
2. **Goal Commitment** - User writes 1-month goal (1-280 characters)
3. **Social Accounts** - User links GitHub, Twitter/X, LinkedIn, Telegram (optional)
4. **Review & Submit** - User reviews and submits application

**Components:**
- [multi-step-onboarding-form](src/components/onboarding/multi-step-onboarding-form.tsx) - Main form with state management
- [program-selector](src/components/onboarding/program-selector.tsx) - Program selection with cards
- [goal-input](src/components/onboarding/goal-input.tsx) - Goal textarea with validation
- [social-accounts-form](src/components/onboarding/social-accounts-form.tsx) - Social account inputs

**Services & Hooks:**
- [onboarding service](src/services/onboarding.ts) - API abstractions for onboarding endpoints
- [use-onboarding hooks](src/hooks/use-onboarding.ts) - React Query hooks for data fetching

#### Guest Access Control (E3-T3)

Implements role-based access control for guest users with limited permissions.

**Guest Capabilities:**
- ✅ Browse talent directory, view activities, submit work
- ❌ Admin routes, voting, marking attendance

**Access Control:**
- [guest-access middleware](src/middleware/guest-access.ts) - Route-level restrictions
- [GuestBadge component](src/components/common/guest-badge.tsx) - Visual guest indicator
- [MemberOnly component](src/components/common/member-only.tsx) - Content restriction

#### Admin Application Review (E3-T4)

Admin queue for reviewing and processing user applications.

**API Endpoints:**
- `GET /api/admin/applications` - List applications with filtering (status, program)
- `GET /api/admin/applications/:id` - Detailed application view
- `GET /api/admin/applications/stats` - Dashboard statistics
- `POST /api/admin/applications/:id/approve` - Process application (guest/member/reject)

**Decision Types:**
- **Approve as Guest**: Limited access, must earn membership (most common)
- **Approve as Member**: Full access immediately (fast-track for exceptional cases)
- **Reject**: No platform access, can reapply

**Components:**
- [ApplicationsTable](src/components/admin/applications-table.tsx) - Applications data table
- [ApplicationDetailDrawer](src/components/admin/application-detail-drawer.tsx) - Review drawer with decision buttons

**Services & Hooks:**
- [admin service](src/services/admin.ts) - Admin operations
- [use-admin hooks](src/hooks/use-admin.ts) - React Query hooks for applications

#### Admin Attendance Management (E3-T5)

Session attendance tracking affecting guest promotion eligibility.

**API Endpoints:**
- `GET /api/admin/attendance/session/:id` - Session attendance with enrolled users
- `POST /api/admin/attendance/mark` - Mark attendance (bulk upsert)
- `POST /api/admin/attendance/bulk` - Bulk mark with different statuses

**Attendance Statuses:**
- **Present**: Counts toward promotion eligibility
- **Absent**: Marked but not present
- **Excused**: Marked but does NOT count toward promotion

**Components:**
- [AttendanceMarker](src/components/admin/attendance-marker.tsx) - Bulk attendance marking UI with checkboxes

**Services & Hooks:**
- [attendance service](src/services/attendance.ts) - Attendance operations
- [use-attendance hooks](src/hooks/use-attendance.ts) - React Query hooks

#### Program Dashboard (E3-T6)

User-facing dashboard with participation tracking and promotion progress.

**API Endpoints:**
- `GET /api/programs/:id/dashboard` - Dashboard data with participation stats
- `GET /api/programs/:id/sessions` - Program sessions (optional upcoming filter)

**Dashboard Sections:**
- Program information and user's goal
- Participation statistics (attendance rate, submission approval, quality score)
- Promotion progress (guest users only) - tracks 3 requirements
- Upcoming sessions (top 3 with meeting URLs)

**Promotion Requirements (Guest → Member):**
- 5+ sessions attended (status='present')
- 3+ submissions approved
- 70%+ average quality score

**Components:**
- [ParticipationStatsCard](src/components/programs/participation-stats-card.tsx) - Statistics display
- [PromotionProgressCard](src/components/programs/promotion-progress-card.tsx) - Guest-specific progress tracking

**Services & Hooks:**
- [programs service](src/services/programs.ts) - Program operations
- [use-programs hooks](src/hooks/use-programs.ts) - React Query hooks

#### Testing & Documentation (E3-T7)

Comprehensive testing strategies and documentation:

- [Feature Documentation](docs/features/program-management.md) - Complete system architecture and workflows
- [Admin Application Review Guide](docs/guides/admin-application-review.md) - Application review process with examples
- [User Onboarding Guide](docs/guides/user-onboarding.md) - User-facing onboarding instructions
- [API Reference](docs/api-reference.md) - Complete API endpoint documentation
- [Testing Guide](docs/testing-guide.md) - Manual and automated testing strategies

### File Storage

- **Vercel Blob Storage** for avatar uploads
- Upload endpoint: `POST /api/profiles/avatar` (multipart/form-data)
- Delete endpoint: `DELETE /api/profiles/avatar`
- File validation: 5MB max, JPEG/PNG/WebP only
- Auto-cleanup: Old avatars deleted when new ones uploaded
- Storage location: `avatars/{userId}/{filename}` with random suffix

Required environment variables:

```
# Database
DATABASE_URL=postgresql://...              # Pooled connection
DATABASE_URL_UNPOOLED=postgresql://...     # Direct connection for migrations

# Web3
NEXT_PUBLIC_ALCHEMY_API_KEY=...            # Optional
NEXT_PUBLIC_PRIVY_APP_ID=...
NEXT_PUBLIC_PRIVY_CLIENT_ID=...
PRIVY_APP_SECRET=...

# Vercel Blob Storage (for avatar uploads)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...  # From Vercel Storage dashboard
```

### Project Structure

```
poktapok/
├── src/
│   ├── app/                    # Next.js App Router pages
│   ├── components/
│   │   ├── ui/                # shadcn/ui components (Radix UI primitives)
│   │   ├── layout/            # Navbar, PageWrapper, ProtectedRoute, MobileMenu
│   │   ├── landing/           # Landing page sections (Hero, Stats, FAQ, etc.)
│   │   ├── buttons/           # Auth buttons (Privy integration)
│   │   ├── common/            # Shared components
│   │   └── stats/             # Stats display components
│   ├── lib/
│   │   ├── db/                # Database client and schema exports
│   │   │   ├── index.ts       # Pool + Drizzle client
│   │   │   └── schema.ts      # Re-exports all tables
│   │   ├── utils.ts           # cn() utility (clsx + tailwind-merge)
│   │   ├── fonts.ts           # Font definitions
│   │   └── error-filter.ts    # Console error suppression
│   ├── providers/             # React context providers (AppProvider, PrivyProvider)
│   ├── store/                 # Zustand stores (future)
│   └── styles/                # Global CSS
├── drizzle/
│   ├── schema/                # Database schema definitions
│   │   ├── utils.ts           # Shared helpers (timestamps, softDelete, metadata)
│   │   ├── users.ts           # Users table
│   │   ├── profiles.ts        # Profiles table
│   │   ├── applications.ts    # Applications table
│   │   ├── invitations.ts     # Invitations table
│   │   └── index.ts           # Schema exports
│   └── migrations/            # SQL migrations (auto-generated)
├── scripts/                   # Database test scripts
├── docs/                      # Project documentation
└── ...                        # Config files (tsconfig, drizzle.config, next.config)
```

### UI Component System

- Uses **shadcn/ui** with "new-york" style variant
- Built on **Radix UI** primitives
- Components in `src/components/ui/` should not be manually edited (regenerate with shadcn CLI)
- Custom animations via `motion` library and `tw-animate-css`
- Path aliases configured in `components.json` (`@/components`, `@/lib`, etc.)
- **MagicUI** registry configured for additional components (`@magicui` registry in `components.json`)

### Error Handling

The `src/lib/error-filter.ts` file suppresses known console warnings from third-party libraries:

- SVG attribute warnings from Privy
- Hydration warnings from Privy's styled-components
- Coinbase Wallet SDK COOP check failures in dev

This file is imported globally in `layout.tsx` and should be updated if new third-party warnings need filtering.

### Styling

- **Tailwind CSS v4** (latest major version)
- CSS variables for theming (defined in `src/styles/globals.css`)
- `next-themes` for dark/light mode support
- Custom fonts loaded via `next/font` in `src/lib/fonts.ts`

### Type Safety

- Strict TypeScript mode enabled
- All components should be typed
- Use `import type` for type-only imports when possible
- TypeScript configuration excludes `scripts/**/*` and `drizzle/**/*` from Next.js build
- **NEVER use `any` type** - ESLint will reject it as an error
  - Use proper type definitions or `unknown` for truly unknown types
  - For error handling: Use `error instanceof Error` pattern instead of `error: any`
  - Example:

    ```typescript
    // ❌ WRONG
    catch (error: any) {
      console.error(error.message);
    }

    // ✅ CORRECT
    catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
    ```

## Development Best Practices

### Data Fetching

**NEVER use `useEffect` for data fetching.** Always prefer TanStack Query for all API interactions.

Follow this abstraction pattern:

1. **Service Layer** (`src/services/`) - Abstract API calls into dedicated service functions
2. **Hooks Layer** (`src/hooks/`) - Create custom hooks using TanStack Query (queries and mutations)
3. **Components** - Import and use the custom hooks

**Example:**

```typescript
// ❌ WRONG - Never do this
useEffect(() => {
  fetch('/api/auth/me')
    .then((res) => res.json())
    .then((data) => setUser(data.user))
}, [])

// ✅ CORRECT - Service + Hook pattern
// 1. Service (src/services/auth.ts)
export async function fetchMe(): Promise<MeResponse> {
  const response = await fetch('/api/auth/me')
  if (!response.ok) throw new Error('Failed to fetch user data')
  return response.json()
}

// 2. Hook (src/hooks/use-auth.ts)
export function useMe() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchMe,
    staleTime: 5 * 60 * 1000,
  })
}

// 3. Component
const { data, isLoading, isError } = useMe()
```

**Error Handling:**

- Use try-catch blocks in service functions
- Throw descriptive errors that can be displayed to users
- Use toast notifications (via `sonner`) for user-facing error messages
- Let TanStack Query handle loading and error states

### Styling

**NEVER use `bg-muted` or any variation of it** (e.g., `bg-muted/50`, `hover:bg-muted`) in component styling. Use explicit color classes or semantic alternatives from the design system.

### Layout and Spacing

**NEVER use margin or padding on the y-axis for spacing in containers.** Use Tailwind's spacing utilities instead:

- **For block/flex containers**: Use `space-y-{size}` to add consistent vertical spacing between children
- **For flex containers**: Use `gap-{size}` for both horizontal and vertical spacing
- **For grid containers**: Use `gap-{size}` for consistent spacing

**Examples:**

```tsx
// ❌ WRONG - Manual margin/padding
<div className="py-4">
  <div className="mb-2">Item 1</div>
  <div className="mb-2">Item 2</div>
  <div>Item 3</div>
</div>

// ✅ CORRECT - space-y utility
<div className="space-y-2">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

// ✅ CORRECT - gap for flex
<div className="flex flex-col gap-2">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### File Naming

**Always use kebab-case (snake-case with hyphens) for file names:**

- ✅ `user-card.tsx`, `profile-header.tsx`, `avatar-upload.tsx`
- ❌ `UserCard.tsx`, `profileHeader.tsx`, `AvatarUpload.tsx`

**Before creating new files:**

1. Search for existing files with similar names using Glob or Grep
2. Check the project structure to avoid duplicates
3. Follow the existing naming conventions in the directory

## Important Notes

### Database Schema Changes

**⚠️ CRITICAL**: The project uses **migration-based workflow** for database changes. **NEVER use `db:push` - it corrupts the migration system.**

**Standard workflow for schema changes:**

1. **Check current state**: `bun run scripts/check-applied-migrations.ts`
2. **Edit schema files** in `drizzle/schema/` (users.ts, profiles.ts, applications.ts, invitations.ts, activities.ts, sessions.ts, etc.)
3. **Generate migration**: `bun run db:generate`
   - If this fails with "data is malformed", see [docs/DATABASE-MIGRATION-FIX.md](docs/DATABASE-MIGRATION-FIX.md)
4. **Review migration**: Check `drizzle/migrations/XXXX_*.sql` for correctness
5. **Apply migration**: `bun run db:migrate`
6. **Verify**: `bun run scripts/check-applied-migrations.ts`

**Emergency procedure if migration system is corrupted:**
- See [docs/DATABASE-MIGRATION-FIX.md](docs/DATABASE-MIGRATION-FIX.md) for recovery steps
- Key diagnostic: `bun run scripts/check-applied-migrations.ts`

**Important constraints to follow:**

- **CHECK constraints must use inlined patterns** - never use variable references:

  ```typescript
  // ✅ CORRECT
  check('email_format', sql`${table.email} ~* '^[A-Za-z0-9._%+-]+@...'`)

  // ❌ WRONG
  check('email_format', sql`${table.email} ~* ${PATTERNS.EMAIL}`)
  ```

- **Generated columns cannot use time-based functions** - use application-level computation:

  ```typescript
  // ❌ WRONG - PostgreSQL rejects as non-immutable
  status: varchar('status').generatedAlwaysAs(sql`CASE WHEN expires_at < NOW() ...`)

  // ✅ CORRECT - compute at query time
  status: varchar('status').default('pending').notNull()
  ```

**Migration rules:**

- ✅ Always use `db:generate` → `db:migrate` for schema changes
- ✅ Commit migration files to version control
- ✅ Apply migrations when pulling changes: `bun run db:migrate`
- ❌ Never use `db:push` (bypasses migration tracking)
- ❌ Never edit migration files manually
- ❌ Never delete migration files

See [docs/database-migrations.md](docs/database-migrations.md) for complete guide.

### Build Configuration (Next.js 16 + Turbopack)

The build configuration has been optimized for Next.js 16 with Turbopack:

- **TypeScript**: Excludes `scripts/` and `drizzle/` directories to prevent build failures
- **Turbopack**: Configured to resolve only production extensions (`.tsx`, `.ts`, `.jsx`, `.js`, `.mjs`, `.json`)
- **Server externals**: Packages like `thread-stream`, `pino`, and `@reown/appkit` are externalized to avoid bundling issues

If you encounter build errors related to test files or node_modules, check:

1. [tsconfig.json](tsconfig.json) - `include` and `exclude` arrays
2. [next.config.ts](next.config.ts) - `turbopack.resolveExtensions` and `serverExternalPackages`

### Adding shadcn/ui Components

To add new UI components from shadcn or MagicUI:

```bash
# shadcn/ui components
bunx shadcn@latest add [component-name]

# MagicUI components (via configured registry)
bunx shadcn@latest add @magicui/[component-name]
```
