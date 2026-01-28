# Codebase Structure

**Analysis Date:** 2026-01-26

## Directory Layout

```
poktapok/
├── src/
│   ├── app/                         # Next.js App Router pages & API routes
│   │   ├── layout.tsx               # Root layout with AppProvider wrapper
│   │   ├── page.tsx                 # Landing page
│   │   ├── not-found.tsx            # 404 page
│   │   ├── (authenticated)/         # Routes requiring authentication (layout group)
│   │   ├── (public)/                # Public routes (layout group)
│   │   ├── api/                     # API route handlers
│   │   │   ├── auth/                # Authentication endpoints
│   │   │   ├── admin/               # Admin-only operations
│   │   │   ├── programs/            # Program management
│   │   │   ├── sessions/            # Program session management
│   │   │   ├── activities/          # Activity/bounty endpoints
│   │   │   ├── profiles/            # User profile operations
│   │   │   ├── projects/            # Portfolio project operations
│   │   │   ├── applications/        # Onboarding applications
│   │   │   ├── directory/           # Talent directory endpoints
│   │   │   ├── skills/              # Skill catalog
│   │   │   ├── users/               # User management
│   │   │   ├── events/              # Event management
│   │   │   └── luma/                # Luma event integration
│   │   ├── onboarding/              # Multi-step onboarding flow
│   │   ├── admin/                   # Admin dashboard pages
│   │   ├── directory/               # Public talent directory page
│   │   ├── profile/                 # User profile viewing
│   │   ├── programs/                # Program listing and details
│   │   ├── activities/              # Activity/bounty pages
│   │   ├── dashboard/               # User dashboard
│   │   ├── club/                    # Club/community pages
│   │   ├── jam/                     # Jam/program pages (alternate UI)
│   │   └── v2/                      # V2 landing page (deprecated)
│   │
│   ├── components/                  # React components organized by feature
│   │   ├── ui/                      # shadcn/ui primitives (auto-generated)
│   │   ├── layout/                  # Layout components (navbar, footer, wrappers)
│   │   ├── landing/                 # Landing page sections (hero, benefits, etc.)
│   │   ├── directory/               # Talent directory components
│   │   ├── programs/                # Program listing & dashboard components
│   │   ├── admin/                   # Admin dashboard components
│   │   ├── profile/                 # User profile components
│   │   ├── portfolio/               # Portfolio/project components
│   │   ├── onboarding/              # Onboarding form components
│   │   ├── club/                    # Club-specific components
│   │   ├── jam/                     # Jam program components
│   │   ├── buttons/                 # Auth & action buttons
│   │   ├── common/                  # Shared components (badges, avatars, etc.)
│   │   ├── stats/                   # Statistics display components
│   │   └── events/                  # Event components
│   │
│   ├── services/                    # Data fetching & business logic
│   │   ├── auth.ts                  # Authentication operations
│   │   ├── profile.ts               # User profile operations
│   │   ├── programs.ts              # Program operations
│   │   ├── onboarding.ts            # Onboarding endpoints
│   │   ├── activities.ts            # Activity/bounty operations
│   │   ├── admin.ts                 # Admin operations
│   │   ├── attendance.ts            # Attendance tracking
│   │   ├── sessions.ts              # Program session operations
│   │   ├── submissions.ts           # Activity submission operations
│   │   ├── projects.ts              # Portfolio project operations
│   │   ├── directory.ts             # Talent directory operations
│   │   ├── skills.ts                # Skill catalog operations
│   │   ├── user-management.ts       # User admin operations
│   │   ├── events.ts                # Event operations
│   │   └── admin/                   # Admin-specific services
│   │
│   ├── hooks/                       # TanStack Query + custom hooks
│   │   ├── use-auth.ts              # Authentication state
│   │   ├── use-programs.ts          # Program queries & mutations
│   │   ├── use-onboarding.ts        # Onboarding mutations
│   │   ├── use-admin.ts             # Admin queries & mutations
│   │   ├── use-activities.ts        # Activity queries & mutations
│   │   ├── use-programs.ts          # Program queries
│   │   ├── use-profile.ts           # Profile queries & mutations
│   │   ├── use-projects.ts          # Project queries & mutations
│   │   ├── use-directory.ts         # Directory queries
│   │   ├── use-sessions.ts          # Session queries
│   │   ├── use-attendance.ts        # Attendance mutations
│   │   ├── use-submissions.ts       # Submission queries & mutations
│   │   ├── use-skills.ts            # Skill queries & mutations
│   │   ├── use-user-management.ts   # User admin mutations
│   │   ├── use-program-enrollments.ts # Enrollment operations
│   │   ├── use-events.ts            # Event queries
│   │   └── index.ts                 # Barrel export for hooks
│   │
│   ├── lib/                         # Utilities & infrastructure
│   │   ├── db/                      # Database client & schema
│   │   │   ├── index.ts             # Drizzle client & pool export
│   │   │   ├── schema.ts            # Central schema re-export
│   │   │   └── queries/             # Query helpers (users, profiles, activities)
│   │   ├── api/                     # API utilities
│   │   │   ├── response.ts          # apiSuccess(), apiError() helpers
│   │   │   └── fetch.ts             # apiFetch wrapper (error handling, unwrapping)
│   │   ├── auth/                    # Auth utilities
│   │   │   ├── middleware.ts        # Auth decorators (requireAuth, requireAdmin)
│   │   │   └── helpers.ts           # Auth helper functions
│   │   ├── privy/                   # Privy wallet integration
│   │   │   └── middleware.ts        # Token verification (getAuthUser)
│   │   ├── validators/              # Zod input validation schemas
│   │   │   ├── profile.ts
│   │   │   ├── project.ts
│   │   │   ├── skill.ts
│   │   │   └── ...
│   │   ├── upload/                  # File upload utilities
│   │   │   ├── image-validation.ts  # File type/size checks
│   │   │   └── image-compression.ts # Image resizing
│   │   ├── promotion/               # Membership promotion logic
│   │   │   └── calculate-eligibility.ts # Compute guest→member requirements
│   │   ├── skills/                  # Skill utilities
│   │   │   └── sync-user-skills.ts  # Sync skill proficiency
│   │   ├── utils/                   # General utilities
│   │   ├── utils.ts                 # cn() helper (clsx + tailwind-merge)
│   │   ├── fonts.ts                 # Font definitions
│   │   └── error-filter.ts          # Console warning suppression
│   │
│   ├── providers/                   # React context providers
│   │   ├── app-provider.tsx         # Root provider with Suspense
│   │   ├── auth/                    # Auth providers
│   │   │   └── privy-provider.tsx   # Privy + Query Client + Wagmi
│   │   └── onchain-config/          # Blockchain configuration
│   │       └── index.tsx            # Wagmi config (Alchemy + public RPCs)
│   │
│   ├── store/                       # Zustand global state
│   │   └── auth-store.ts            # Auth user state (name, email, etc.)
│   │
│   ├── types/                       # TypeScript type definitions
│   │   ├── api-v1.ts                # API request/response types
│   │   └── api-response.ts          # Response envelope types
│   │
│   ├── data/                        # Static data & constants
│   ├── styles/                      # Global CSS
│   │   └── globals.css              # Tailwind + CSS variables
│   │
│   └── middleware/                  # Middleware utilities
│       └── guest-access.ts          # Guest access control checks
│
├── drizzle/                         # Database schema & migrations
│   ├── schema/                      # Drizzle schema definitions
│   │   ├── utils.ts                 # Shared utilities (timestamps, softDelete, metadata)
│   │   ├── users.ts                 # Users table & types
│   │   ├── profiles.ts              # Profiles table & types
│   │   ├── applications.ts          # Applications (onboarding queue)
│   │   ├── invitations.ts           # Referral invitations
│   │   ├── projects.ts              # Portfolio projects
│   │   ├── skills.ts                # Skills & user_skills & project_skills
│   │   ├── activities.ts            # Activities, submissions, distributions
│   │   ├── programs.ts              # Programs & program_enrollments
│   │   ├── sessions.ts              # Program sessions
│   │   ├── program-activities.ts    # Program-activity junction table
│   │   ├── session-activities.ts    # Session-activity junction table
│   │   ├── attendance.ts            # Attendance tracking
│   │   ├── events.ts                # Events table
│   │   ├── activity-relationships-view.ts # Database views
│   │   └── index.ts                 # Schema barrel export
│   │
│   └── migrations/                  # Auto-generated SQL migrations
│       └── XXXX_*.sql               # Timestamped migration files
│
├── docs/                            # Project documentation
│   ├── database-setup.md            # Database setup & schema reference
│   ├── database-migrations.md       # Migration workflow guide
│   ├── api-reference.md             # API endpoint documentation
│   ├── features/                    # Feature documentation
│   ├── guides/                      # How-to guides
│   └── ...                          # Other docs
│
├── scripts/                         # Utility scripts
│   ├── test-db-connection.ts        # Database connectivity test
│   ├── verify-migration.ts          # Verify schema objects
│   └── test-crud-operations.ts      # Test CRUD operations
│
├── .planning/                       # GSD phase planning (created by orchestrator)
│   └── codebase/                    # This analysis
│       ├── ARCHITECTURE.md          # Architecture patterns & layers
│       ├── STRUCTURE.md             # This file - directory layout
│       ├── STACK.md                 # Technology stack (optional)
│       ├── INTEGRATIONS.md          # External API integrations (optional)
│       ├── CONVENTIONS.md           # Code style & naming conventions (optional)
│       ├── TESTING.md               # Testing patterns (optional)
│       └── CONCERNS.md              # Tech debt & issues (optional)
│
└── Config files
    ├── tsconfig.json                # TypeScript config (excludes scripts/, drizzle/)
    ├── next.config.ts               # Next.js config (Turbopack, externals)
    ├── drizzle.config.ts            # Drizzle config (schema path, migrations)
    ├── package.json                 # Dependencies (Bun runtime)
    ├── tailwind.config.ts           # Tailwind CSS config
    ├── components.json              # shadcn/ui config
    └── .env.local / .env.production # Environment variables
```

## Directory Purposes

**`src/app/`** - Next.js App Router pages and API routes. Organized by resource domain (auth, profiles, programs, admin, etc.). Each route handler exports GET/POST/PATCH/DELETE functions.

**`src/components/`** - React components organized by feature/domain. UI primitives in `ui/` (shadcn/ui, read-only), feature-specific components in subdirectories. Use kebab-case filenames.

**`src/services/`** - Pure async functions that call API endpoints using `apiFetch`. No React hooks. Each service exports 1-N functions per resource (e.g., fetchPrograms, createProgram, updateProgram).

**`src/hooks/`** - TanStack Query hooks that wrap service functions. Each hook manages a query/mutation and returns data, loading, error states. Export as `use{Feature}` (e.g., usePrograms, useAdmin).

**`src/lib/db/`** - Database client (Drizzle ORM instance), connection pool, and schema re-exports. `src/lib/db/queries/` contains helper functions for complex queries (joins, filtering).

**`src/lib/api/`** - Response helpers (`apiSuccess`, `apiError`) and fetch wrapper (`apiFetch`). Standardizes all API communication.

**`src/lib/auth/`** - Authentication decorators (requireAuth, requireAdmin) and helpers. These wrap route handlers to enforce auth checks.

**`src/lib/privy/`** - Privy SDK integration. `middleware.ts` exports `getAuthUser()` which verifies tokens and enriches with database user context.

**`src/providers/`** - React context providers. AppProvider wraps Suspense → Privy → Query Client → Wagmi in correct nesting order.

**`src/store/`** - Zustand stores for global client state. Currently `auth-store.ts` for caching authenticated user data.

**`src/types/`** - Centralized TypeScript types. `api-v1.ts` for request/response types, `api-response.ts` for envelope types.

**`drizzle/schema/`** - Drizzle ORM table definitions. One file per logical entity (users, profiles, programs, etc.). Defines structure, constraints, relationships.

**`drizzle/migrations/`** - Auto-generated SQL migration files. Created via `bun run db:generate`. Never edit manually.

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx` - Root layout that wraps app with AppProvider
- `src/app/page.tsx` - Landing page
- `src/app/onboarding/page.tsx` - Onboarding flow for new users
- `src/app/admin/` - Admin dashboard pages (role-gated)

**Configuration:**
- `src/providers/app-provider.tsx` - Root provider nesting
- `src/providers/auth/privy-provider.tsx` - Privy + Query + Wagmi setup
- `src/providers/onchain-config/index.tsx` - Wagmi chain configuration
- `drizzle.config.ts` - Drizzle migration config
- `next.config.ts` - Next.js build config

**Core Logic:**
- `src/lib/db/index.ts` - Database client instance
- `src/lib/db/schema.ts` - Central schema re-export
- `src/lib/api/response.ts` - API response builders
- `src/lib/api/fetch.ts` - API fetch wrapper
- `src/lib/privy/middleware.ts` - Token verification
- `src/lib/auth/middleware.ts` - Auth decorators

**Testing:**
- `scripts/test-db-connection.ts` - Database connection test
- `scripts/verify-migration.ts` - Migration verification

## Naming Conventions

**Files:**
- **Components**: `kebab-case.tsx` (e.g., `user-card.tsx`, `profile-header.tsx`)
- **Hooks**: `use-{name}.ts` (e.g., `use-auth.ts`, `use-programs.ts`)
- **Services**: `{resource}.ts` (e.g., `auth.ts`, `programs.ts`)
- **Utilities**: `{purpose}.ts` (e.g., `response.ts`, `validation.ts`)
- **Schema**: `{entity}.ts` (e.g., `users.ts`, `programs.ts`)
- **Migrations**: `XXXX_{description}.sql` (auto-generated timestamp)

**Directories:**
- **Feature groups**: Plural, lowercase (e.g., `components/programs`, `services`, `hooks`)
- **Semantic groups**: Lowercase (e.g., `lib`, `api`, `auth`, `db`)
- **Next.js layout groups**: Parentheses (e.g., `(authenticated)`, `(public)`)

**TypeScript:**
- **Types**: PascalCase (e.g., `User`, `Profile`, `AuthUser`)
- **Interfaces**: PascalCase with `I` prefix optional (e.g., `AuthState`, `ApiResponse`)
- **Functions**: camelCase (e.g., `fetchUser`, `apiSuccess`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `DATABASE_URL`, `PRIVY_APP_ID`)
- **Exported types**: Use `export type` when possible to allow tree-shaking

## Where to Add New Code

**New Feature (e.g., bounties system):**

1. **Database Schema** - Add table definition to `drizzle/schema/bounties.ts`
   - Export table and NewBounty type
   - Include in `drizzle/schema/index.ts`

2. **API Route** - Create `src/app/api/bounties/route.ts`
   - GET handler to list bounties
   - POST handler to create bounty
   - Use `requireAuth()` or `requireAdmin()` middleware
   - Return `apiSuccess(data)` or `apiError(...)`

3. **Service** - Create `src/services/bounties.ts`
   - Export async functions: `fetchBounties()`, `createBounty()`, etc.
   - Use `apiFetch()` to call API routes
   - Type responses with `BountyResponse` from `@/types/api-v1`

4. **Hook** - Create `src/hooks/use-bounties.ts`
   - Export `useBounties()` query hook
   - Export `useCreateBounty()` mutation hook
   - Use TanStack Query with queryKey like `['bounties']`

5. **Component** - Create `src/components/bounties/bounty-card.tsx`
   - Import hook: `const { data } = useBounties()`
   - Render UI with data, loading, error states
   - Use shadcn/ui components for consistency

6. **Type** - Add to `src/types/api-v1.ts`
   - Export `Bounty` interface
   - Export request/response types

**New Component (within existing feature):**

- Create file in appropriate subdirectory: `src/components/{feature}/{component-name}.tsx`
- Use kebab-case filename
- Import hooks from `@/hooks`
- Use shadcn/ui components from `@/components/ui`
- Apply Tailwind styling

**Utilities:**

- **General utilities**: `src/lib/utils.ts`
- **Validation**: `src/lib/validators/{domain}.ts` (export Zod schemas)
- **Helpers**: `src/lib/{domain}/helper.ts` (domain-specific)
- **Database queries**: `src/lib/db/queries/{entity}.ts` (complex queries only)

## Special Directories

**`src/components/ui/`** - Generated UI primitives from shadcn/ui. Do not manually edit. Regenerate with `bunx shadcn@latest add [component]`.

**`drizzle/migrations/`** - Auto-generated SQL files. Do not edit manually. Generated by `bun run db:generate` and applied via `bun run db:migrate`.

**`drizzle/migrations/snapshot_backup/`** - Backup of previous migration snapshots. Do not delete.

**`.planning/codebase/`** - GSD analysis documents. Read-only. Used by phase planner to understand codebase conventions.

---

*Structure analysis: 2026-01-26*
