# Architecture

**Analysis Date:** 2026-01-26

## Pattern Overview

**Overall:** Tiered Next.js 16 full-stack application with provider-based state management, service/hook abstraction layer, and standardized API response patterns.

**Key Characteristics:**
- Client-server separation with clear API boundaries via Next.js App Router
- Multi-layer provider hierarchy (Suspense → Privy Auth → React Query → Wagmi)
- Service-Hook-Component abstraction pattern for all data fetching
- Standardized API response envelope (discriminated unions for type safety)
- Role-based and status-based access control (member, guest, admin)
- Drizzle ORM with PostgreSQL for type-safe database operations

## Layers

**Provider Layer (Client-Side State & Context):**
- Purpose: Root setup for authentication, queries, blockchain, and error handling
- Location: `src/providers/` (app-provider.tsx, auth/privy-provider.tsx, onchain-config/index.tsx)
- Contains: React context providers (Privy, Wagmi, Query Client, Suspense boundary)
- Depends on: React, Privy SDK, Wagmi, TanStack Query
- Used by: Every page and component via `<AppProvider>` wrapper

**Service Layer (Data Fetching Abstraction):**
- Purpose: Encapsulate API calls and business logic into reusable functions
- Location: `src/services/` (auth.ts, profiles.ts, programs.ts, onboarding.ts, admin.ts, etc.)
- Contains: Named export functions that call API endpoints via `apiFetch` wrapper
- Depends on: `@/lib/api/fetch.ts` (wraps fetch with error handling), types from `@/types/api-v1.ts`
- Used by: Custom React hooks via TanStack Query

**Hook Layer (React Query Integration):**
- Purpose: Wrap service functions with TanStack Query queries and mutations for caching, refetching, and loading states
- Location: `src/hooks/` (use-auth.ts, use-programs.ts, use-onboarding.ts, use-admin.ts, etc.)
- Contains: `useQuery` and `useMutation` hooks that call service functions
- Depends on: Service functions, TanStack Query, Zustand for auth store
- Used by: React components for data management

**Component Layer (UI Rendering):**
- Purpose: Consume hooks and render UI with Tailwind CSS and shadcn/ui
- Location: `src/components/` (organized by feature: landing, directory, programs, admin, profile, portfolio, etc.)
- Contains: React functional components (client and server components)
- Depends on: Hooks, UI library components (shadcn/ui), Tailwind CSS
- Used by: Pages and other components

**API Layer (Backend Request Handlers):**
- Purpose: Handle HTTP requests, verify authentication, enforce access control, query database, return standardized responses
- Location: `src/app/api/` (organized by resource domain and HTTP method via route.ts files)
- Contains: Route handler functions (GET, POST, PATCH, DELETE) with Next.js App Router
- Depends on: `@/lib/privy/middleware.ts` (token verification), `@/lib/auth/middleware.ts` (auth decorators), `@/lib/api/response.ts` (response helpers), database client
- Used by: Service layer functions via `apiFetch`

**Database Layer (Data Persistence):**
- Purpose: Define schema, manage migrations, provide ORM client for queries
- Location: `drizzle/schema/` (schema definitions), `src/lib/db/` (client and queries)
- Contains: Drizzle ORM table definitions, migration files, pooled database client
- Depends on: PostgreSQL, node-postgres (pg), Drizzle ORM
- Used by: API route handlers and query functions

**Middleware & Cross-Cutting Concerns:**
- Purpose: Shared utilities for authentication, authorization, validation, error handling
- Location: `src/lib/privy/middleware.ts`, `src/lib/auth/middleware.ts`, `src/middleware/guest-access.ts`, `src/lib/api/fetch.ts`, `src/lib/api/response.ts`, `src/lib/validators/`
- Contains: Auth verification, guest access control, response builders, data validators
- Depends on: Privy SDK, Next.js, Zod for validation
- Used by: API routes, services, hooks

## Data Flow

**Request → Response Lifecycle:**

1. **Client Component** calls custom hook (e.g., `const { data } = usePrograms()`)
2. **Hook** (TanStack Query) manages caching and calls service function on first query or when stale
3. **Service Function** (e.g., `fetchPrograms()`) calls `apiFetch('/api/programs')` with typed response
4. **apiFetch Wrapper** adds Authorization header (Privy token), catches errors, unwraps envelope
5. **API Route Handler** (e.g., `GET /api/programs/route.ts`):
   - Calls `requireAuth()` or `requireAdmin()` middleware decorator
   - Middleware extracts & verifies Privy token, fetches user context from database
   - Handler receives enriched `authUser` context (privyDid, userId, role, accountStatus)
   - Handler queries database using Drizzle ORM
   - Handler returns `apiSuccess(data)` with standardized envelope
6. **Response Envelope** `{ success: true, data: {...} }` received by client
7. **apiFetch Wrapper** unwraps envelope, throws `ApiError` on failure
8. **Hook** updates React Query cache, component re-renders with new data
9. **UI** displays fresh data with loading/error states from hook

**State Management:**

- **Authentication State**: Privy (client-side) + Zustand auth-store for caching current user
- **Server Queries**: TanStack React Query caches API responses with configurable staleTime
- **Form State**: React Hook Form (with shadcn/ui form components)
- **UI State** (modals, tabs, etc.): Component local state via `useState`

## Key Abstractions

**AuthUser (Context Token):**
- Purpose: Represents verified user identity from Privy token
- Examples: `src/lib/privy/middleware.ts` exports `AuthUser` type
- Pattern: Middleware extracts token → verifies with Privy → enriches with database context → passed to route handlers
- Fields: privyDid, userId, role, accountStatus

**API Response Envelope (Discriminated Union):**
- Purpose: Type-safe response handling with success/error variants
- Examples: `src/types/api-response.ts` and `src/lib/api/response.ts`
- Pattern: All endpoints return either `{ success: true, data: T }` or `{ success: false, error: {...} }`
- Helpers: `apiSuccess()`, `apiError()`, `apiValidationError()`, `apiErrors.unauthorized()`, etc.

**Service → Hook → Component (Abstraction Stack):**
- Purpose: Separate concerns and enable testability
- Examples: `src/services/programs.ts` → `src/hooks/use-programs.ts` → `src/app/programs/page.tsx`
- Pattern: Service exports pure async functions, hook wraps with `useQuery`, component consumes hook result
- Benefits: Reusable API logic, centralized error handling, consistent loading/error states

**Guest Access Control:**
- Purpose: Enforce limited permissions for guest-status users
- Examples: `src/middleware/guest-access.ts` with `checkGuestAccess()` and `requireGuestAccess()` HOF
- Pattern: Routes check `accountStatus === 'guest'` and restrict admin/voting endpoints
- Fields: Guests can browse, submit, attend; cannot mark attendance or access admin

**Database Query Helpers:**
- Purpose: Encapsulate complex queries with type safety
- Examples: `src/lib/db/queries/users.ts`, `src/lib/db/queries/profiles.ts`
- Pattern: Named export functions that build Drizzle queries with joins, filtering, sorting

## Entry Points

**Web Application (Client-Side):**
- Location: `src/app/layout.tsx`
- Triggers: Browser load of `http://localhost:3000` or production domain
- Responsibilities: Wraps entire app with `<AppProvider>`, loads global CSS and fonts, renders metadata

**API Routes (Server-Side):**
- Location: `src/app/api/[domain]/[resource]/route.ts`
- Triggers: HTTP requests (GET, POST, PATCH, DELETE) to `/api/*` paths
- Responsibilities: Verify authentication, enforce authorization, query database, return envelope response

**Program Onboarding Flow:**
- Location: `src/app/onboarding/page.tsx` → `src/components/onboarding/multi-step-onboarding-form.tsx`
- Triggers: Unauthenticated user clicks "Sign Up" or authenticated user with incomplete status
- Responsibilities: Multi-step form for program selection, goal input, social accounts, then POST to `/api/applications`

**Admin Dashboard:**
- Location: `src/app/admin/` (applications, programs, sessions, attendance, submissions, etc.)
- Triggers: Authenticated user with `role === 'admin'` navigates to admin routes
- Responsibilities: Display admin tables with bulk actions, manage applications/users/programs/attendance

**Public Talent Directory:**
- Location: `src/app/directory/page.tsx`
- Triggers: Anyone (authenticated or not) navigates to `/directory`
- Responsibilities: Display filterable grid of user profiles with search, skills filtering, country filtering

## Error Handling

**Strategy:** Layered error handling with consistent error types and responses

**Patterns:**

1. **API Route Level** (`src/lib/api/response.ts`):
   - `apiError(message, { code, details, status })` - custom errors
   - `apiErrors.unauthorized()` - 401 for missing/invalid token
   - `apiErrors.notFound(resource)` - 404 for missing records
   - `apiErrors.conflict(message)` - 409 for duplicates
   - `apiErrors.internal()` - 500 for server errors
   - `apiValidationError(zodError)` - 400 with field-level validation details

2. **Service Layer** (`src/services/*.ts`):
   - Services throw descriptive errors on API failures
   - Errors are caught by `apiFetch` wrapper and re-thrown as `ApiError`
   - Example: "User not found", "Invalid email format"

3. **Hook/Component Level** (`src/hooks/*.ts`, React components):
   - `useQuery`/`useMutation` expose `error` state of type `ApiError`
   - Components catch `ApiError` in `onError` handlers
   - Display errors via toast notifications (sonner) or inline error messages
   - Example: `toast.error(error.message)` on mutation failure

4. **Privy Authentication Errors** (`src/lib/privy/middleware.ts`):
   - Token verification failures return `null` from `getAuthUser()`
   - Routes check for `null` and return `apiErrors.unauthorized()`
   - Wallet connection errors handled by Privy client on frontend

## Cross-Cutting Concerns

**Logging:** Console methods (console.log, console.error) in services and route handlers. Errors logged at middleware level for debugging. Third-party warnings suppressed via `src/lib/error-filter.ts` (imported in layout.tsx).

**Validation:**
- Input validation via Zod schemas in `src/lib/validators/` (profile.ts, project.ts, skill.ts, etc.)
- Schema validation in services before API calls
- Server-side validation in route handlers via `schema.safeParse(data)`
- Field-level error details returned in `apiValidationError()` response

**Authentication:**
- Privy handles wallet-based auth (embedded wallets + external wallets)
- Token verification via `PrivyClient.verifyAuthToken()` in `requireAuth()` middleware
- User context enriched from database (role, accountStatus)
- Token passed in Authorization header (Bearer) or as `privy-token` cookie

**Authorization:**
- Role-based: `requireAdmin()` decorator checks `role === 'admin'`
- Status-based: Guest users restricted via `requireGuestAccess()` or inline checks
- Route-level: API routes enforce authorization; components show/hide UI based on auth state
- Example: Admin routes (e.g., `/api/admin/*`) require admin role; guest routes (e.g., `/api/applications`) restrict based on accountStatus

**File Storage:**
- Avatar uploads via `POST /api/profiles/avatar` (Vercel Blob Storage)
- Project images via `POST /api/projects/[id]/images` (Vercel Blob Storage)
- File validation: 5MB max, JPEG/PNG/WebP only (in `src/lib/upload/`)
- Auto-cleanup: Old files deleted when new ones uploaded

---

*Architecture analysis: 2026-01-26*
