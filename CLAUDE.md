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
bun run db:studio          # Open Drizzle Studio (visual DB browser)
bun run db:check           # Check for schema drift
bun run db:push            # Push schema changes directly (dev only)

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
- **users** - Core identity & authentication (linked to Privy DID)
- **profiles** - Extended user data (location, social links, learning tracks, stats)
- **applications** - Onboarding queue (pending/approved/rejected signup applications)
- **invitations** - Referral system (invite codes with expiration tracking)

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
import { apiSuccess, apiError, apiValidationError, apiErrors } from "@/lib/api/response";

// Success response
return apiSuccess({ user, profile });

// Success with message
return apiSuccess({ profile }, { message: "Profile created successfully" });

// Success with metadata (e.g., pagination)
return apiSuccess(
  { profiles },
  { meta: { pagination: { page: 1, total: 100, hasMore: true } } }
);

// Validation error (from Zod)
const result = schema.safeParse(data);
if (!result.success) {
  return apiValidationError(result.error);
}

// Specific error shortcuts
return apiErrors.unauthorized();               // 401
return apiErrors.notFound("User");            // 404
return apiErrors.conflict("Username taken");  // 409
return apiErrors.internal("Database error");  // 500

// Custom error
return apiError("Custom error message", {
  code: "CUSTOM_ERROR",
  details: { field: "email" },
  status: 400
});
```

#### Client-Side Usage (Services)

Use the `apiFetch` wrapper from `src/lib/api/fetch.ts` for automatic error handling:

```typescript
import { apiFetch } from "@/lib/api/fetch";

// Simple GET request
export async function fetchMe(): Promise<MeResponse> {
  return apiFetch<MeResponse>("/api/auth/me");
}

// POST request with body
export async function createProfile(data: ProfileFormData): Promise<CreateProfileResponse> {
  return apiFetch<CreateProfileResponse>("/api/profiles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
```

The `apiFetch` wrapper:
- Automatically unwraps the `{ success, data }` envelope
- Throws structured `ApiError` on failure with `code`, `details`, and `status`
- Handles JSON parsing errors gracefully
- Provides type-safe responses

#### Error Handling in Hooks

```typescript
import { ApiError } from "@/lib/api/fetch";
import { toast } from "sonner";

const mutation = useMutation({
  mutationFn: createProfile,
  onSuccess: (data) => {
    toast.success("Profile created successfully");
  },
  onError: (error: ApiError) => {
    // Access structured error data
    toast.error(error.message);
    console.error("Error code:", error.code);
    console.error("Error details:", error.details);
  }
});
```

#### HTTP Status Code Standards

| Status | Use Case | Helper |
|--------|----------|--------|
| 200 | Success | `apiSuccess()` |
| 400 | Bad Request / Validation | `apiValidationError()` or `apiError(..., { status: 400 })` |
| 401 | Unauthorized | `apiErrors.unauthorized()` |
| 404 | Not Found | `apiErrors.notFound(resource)` |
| 409 | Conflict (duplicate) | `apiErrors.conflict(message)` |
| 500 | Internal Server Error | `apiErrors.internal()` |

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
    .then(res => res.json())
    .then(data => setUser(data.user));
}, []);

// ✅ CORRECT - Service + Hook pattern
// 1. Service (src/services/auth.ts)
export async function fetchMe(): Promise<MeResponse> {
  const response = await fetch("/api/auth/me");
  if (!response.ok) throw new Error("Failed to fetch user data");
  return response.json();
}

// 2. Hook (src/hooks/use-auth.ts)
export function useMe() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchMe,
    staleTime: 5 * 60 * 1000,
  });
}

// 3. Component
const { data, isLoading, isError } = useMe();
```

**Error Handling:**
- Use try-catch blocks in service functions
- Throw descriptive errors that can be displayed to users
- Use toast notifications (via `sonner`) for user-facing error messages
- Let TanStack Query handle loading and error states

### Styling

**NEVER use `bg-muted` or any variation of it** (e.g., `bg-muted/50`, `hover:bg-muted`) in component styling. Use explicit color classes or semantic alternatives from the design system.

### File Naming

**Always use kebab-case (snake-case with hyphens) for file names:**
- ✅ `user-card.tsx`, `profile-header.tsx`, `avatar-upload.tsx`
- ❌ `UserCard.tsx`, `profileHeader.tsx`, `AvatarUpload.tsx`

**Before creating new files:**
1. Search for existing files with similar names using Glob or Grep
2. Check the project structure to avoid duplicates
3. Follow the existing naming conventions in the directory

## Important Notes

### Database Schema Changes (Local Development)

**For local development and fast iteration**, use `db:push` to apply schema changes directly without generating migrations:

1. **Edit schema files** in `drizzle/schema/` (users.ts, profiles.ts, applications.ts, invitations.ts)
2. **Push changes directly**: `bun run db:push`
3. **Verify**: `bun run scripts/test-db-connection.ts`

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

**Migration workflow (v1 MVP freeze only):**
- During active development: Use `db:push` for all schema changes
- Once MVP schema is finalized: Generate a single comprehensive migration with `bun run db:generate`
- Future changes: Will use proper migration workflow (`db:generate` → `db:migrate`)

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
