# Technology Stack

**Analysis Date:** 2026-01-26

## Languages

**Primary:**
- TypeScript 5 - All application code, strict mode enabled
- JavaScript/JSX - Configuration files, build scripts

**Secondary:**
- SQL - PostgreSQL migrations and queries via Drizzle ORM

## Runtime

**Environment:**
- Node.js 20+ (inferred from package.json @types/node)
- Bun 1.x - Primary package manager and runtime

**Package Manager:**
- Bun 1.x - Replaces npm/yarn for package management and script execution
- Lockfile: `bun.lockb` (Bun's native lockfile format)

## Frameworks

**Core:**
- Next.js 16.0.10 - Full-stack framework with App Router
- React 19.2.1 - UI library with latest features
- TypeScript 5 - Type safety across entire codebase

**UI & Styling:**
- Tailwind CSS 4 - Latest major version with @tailwindcss/postcss plugin
- Radix UI - Primitive component library (accordion, dialog, dropdown, tabs, tooltip, progress, etc.)
- shadcn/ui - Pre-built component library built on Radix UI
- Motion 12.23.26 - Animation and motion library
- MagicUI - Additional component registry via shadcn CLI
- lucide-react 0.561.0 - Icon library

**Authentication & Web3:**
- Privy (@privy-io/react-auth 3.9.0, @privy-io/server-auth 1.32.5) - Wallet authentication and identity
- Wagmi 3.1.0 - Blockchain interaction library
- @privy-io/wagmi 2.1.1 - Privy integration with Wagmi
- viem - Ethereum library (via Wagmi dependency)

**Data Fetching & State:**
- TanStack React Query 5.90.12 - Server state management and data fetching
- Zustand 5.0.9 - Lightweight client state management
- React Hook Form 7.68.0 - Form state and validation
- Zod 4.2.1 - TypeScript-first schema validation

**Database:**
- PostgreSQL - Primary database (via Neon DB)
- Drizzle ORM 0.45.1 - Type-safe SQL builder and ORM
- pg (node-postgres) 8.16.3 - PostgreSQL client library
- drizzle-kit 0.31.8 - Schema management and migration tools

**File Storage:**
- @vercel/blob 2.0.0 - Vercel Blob Storage for file uploads (avatars, project images)

**Utilities:**
- clsx 2.1.1 - Conditional CSS class names
- tailwind-merge 3.4.0 - Merge Tailwind CSS classes without conflicts
- class-variance-authority 0.7.1 - Component variant system
- cmdk 1.1.1 - Command palette / combobox
- date-fns 4.1.0 - Date manipulation
- lodash.debounce 4.0.8 - Debounce utility
- browser-image-compression 2.0.2 - Client-side image compression
- sonner 2.0.7 - Toast notifications
- dotenv 17.2.3 - Environment variable loading

**UI Enhancements:**
- embla-carousel-react 8.6.0 - Carousel/slider component
- embla-carousel-autoplay 8.6.0 - Autoplay extension for carousel
- @dnd-kit/core 6.3.1 - Drag-and-drop primitives
- @dnd-kit/sortable 10.0.0 - Sortable drag-and-drop
- @dnd-kit/utilities 3.2.2 - Drag-and-drop utilities
- next-themes 0.4.6 - Dark/light mode support

**Custom Animations:**
- tw-animate-css 1.4.0 - Extended Tailwind animation utilities

## Testing & Quality

**Linting & Formatting:**
- ESLint 9 - Code linting with Next.js config
- Prettier 3.7.4 - Code formatting
- prettier-plugin-tailwindcss 0.7.2 - Tailwind class sorting for Prettier

**Build Tools:**
- Turbopack - Next.js 16 bundler (configured in `next.config.ts`)
- PostCSS 4 - CSS processing via @tailwindcss/postcss

## Key Dependencies

**Critical:**
- Privy - Web3 authentication and wallet management (cornerstone of platform)
- Wagmi - Blockchain RPC interactions and smart contract calls
- Drizzle ORM - Type-safe database queries and schema management
- PostgreSQL - User data, profiles, applications, programs, activities

**Infrastructure:**
- Next.js 16 - API routes, file storage handlers, server-side logic
- React Query - Data synchronization between server and client
- @vercel/blob - File storage for user avatars and project images

## Configuration

**Environment Variables:**

```bash
# Authentication (Privy)
NEXT_PUBLIC_PRIVY_APP_ID=...           # Public Privy app ID
NEXT_PUBLIC_PRIVY_CLIENT_ID=...        # Public Privy client ID
PRIVY_APP_SECRET=...                   # Secret key for server-side verification

# Blockchain (Optional)
NEXT_PUBLIC_ALCHEMY_API_KEY=...        # Optional, falls back to public RPCs

# Database
DATABASE_URL=postgresql://...          # Pooled connection for app queries
DATABASE_URL_UNPOOLED=postgresql://... # Direct connection for migrations

# File Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_... # Vercel Blob Storage token

# Deployment
VERCEL_ENV=...                        # Deployment environment
```

**Build Configuration:**
- `next.config.ts` - Turbopack settings, image optimization, server external packages
- `tsconfig.json` - Strict TypeScript, path aliases (@/*), excluded dirs (scripts/, drizzle/)
- `drizzle.config.ts` - PostgreSQL dialect, migration settings, schema location
- `tailwind.config.ts` - Not found; using default with PostCSS plugin
- `postcss.config.mjs` - PostCSS with @tailwindcss/postcss plugin
- `.eslintrc.json` - ESLint configuration (extends Next.js)
- `.prettierrc` - Prettier configuration

**Type Safety:**
- Strict mode: true
- No `any` type allowed (ESLint enforces)
- Path aliases: `@/*` → `src/*`

## Platform Requirements

**Development:**
- Bun 1.x (Node.js compatible)
- Git for version control
- Access to Neon DB for PostgreSQL
- Vercel account for deployment and Blob Storage

**Production:**
- Deployment: Vercel (Next.js optimized)
- Database: Neon DB (serverless PostgreSQL)
- File Storage: Vercel Blob Storage
- Authentication: Privy (SaaS)
- Blockchain RPC: Alchemy (optional) + public fallbacks

**Supported Blockchains:**
- Arbitrum (default)
- Base
- Ethereum Mainnet
- Optimism
- Polygon
- Scroll

---

*Stack analysis: 2026-01-26*
