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

### Authentication & Web3

- **Privy** handles wallet authentication (embedded + external wallets)
- **Wagmi** manages blockchain interactions
- Default chain is Arbitrum; supports 6 chains total (Base, Ethereum, Optimism, Polygon, Scroll)
- Alchemy API key is optional (falls back to public RPCs)

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
