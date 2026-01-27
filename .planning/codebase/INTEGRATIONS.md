# External Integrations

**Analysis Date:** 2026-01-26

## APIs & External Services

**Web3 & Blockchain:**
- **Privy** - Wallet authentication and identity management
  - SDK/Client: `@privy-io/react-auth`, `@privy-io/server-auth`, `@privy-io/wagmi`
  - Auth: Token stored in `privy-token` cookie, verified server-side
  - Implementation: `src/providers/auth/privy-provider.tsx`, `src/lib/auth/helpers.ts`
  - Supports: Embedded wallets, MetaMask, Coinbase Wallet, Rainbow, WalletConnect

- **Wagmi** - Blockchain RPC interactions
  - SDK/Client: `wagmi`, `viem/chains`
  - Config: `src/providers/onchain-config/index.tsx`
  - Chains: Arbitrum, Base, Ethereum, Optimism, Polygon, Scroll
  - RPC Strategy: Alchemy (if `NEXT_PUBLIC_ALCHEMY_API_KEY` set) → Public fallback RPCs

- **Alchemy** - Blockchain RPC provider (optional)
  - API Key: `NEXT_PUBLIC_ALCHEMY_API_KEY`
  - Fallback: If not set, uses public RPC endpoints (Arbitrum RPC, Cloudflare Ethereum, etc.)
  - Used by: Chain transports configured in `src/providers/onchain-config/index.tsx`

**Event Management:**
- **lu.ma** - Event metadata extraction service
  - Endpoint: `POST /api/luma/fetch-event`
  - Implementation: `src/app/api/luma/fetch-event/route.ts`
  - Functionality: Parses event metadata from HTML (title, description, cover image, location, dates)
  - No authentication required (public HTML parsing)

## Data Storage

**Databases:**
- **PostgreSQL via Neon DB**
  - Connection: `DATABASE_URL` (pooled, 10 connections max, 20s idle timeout)
  - Direct: `DATABASE_URL_UNPOOLED` (for migrations only)
  - Client: `pg` (node-postgres)
  - ORM: Drizzle ORM with type-safe queries
  - Instance: `src/lib/db/index.ts` exports `db` and `pool`
  - Schema: `drizzle/schema/` directory with separate files per table
  - Migrations: Auto-generated via `drizzle-kit generate`, stored in `drizzle/migrations/`

**File Storage:**
- **Vercel Blob Storage**
  - Auth: `BLOB_READ_WRITE_TOKEN` environment variable
  - SDK: `@vercel/blob` (put, del functions)
  - Use Cases:
    - User avatars: `POST /api/profiles/avatar` → `avatars/{userId}/{filename}`
    - Project logos: `POST /api/projects/{id}/logo` → `projects/{projectId}/logo`
    - Project images: `POST /api/projects/{id}/images` → `projects/{projectId}/images`
  - File Validation:
    - Avatars: JPEG, PNG, WebP only; 5MB max
    - Project images: JPEG, PNG, WebP, SVG; 5MB max; max 4 additional images per project
  - Auto-cleanup: Old files deleted when new ones uploaded
  - URL Prefix: `https://*.public.blob.vercel-storage.com/**`

**Caching:**
- Client: React Query (TanStack Query) for server state caching
- No server-side cache detected (direct database queries)

## Authentication & Identity

**Auth Provider:**
- **Privy** - Primary authentication and identity management
  - Implementation: Custom (`src/lib/auth/helpers.ts`, `src/lib/privy/middleware.ts`)
  - Server-side verification: `PrivyClient` verifies auth token from cookies
  - User linking: Privy DID linked to local `users.id`
  - Cookie name: `privy-token`
  - Credentials:
    - `NEXT_PUBLIC_PRIVY_APP_ID` - Public app identifier
    - `NEXT_PUBLIC_PRIVY_CLIENT_ID` - Public client identifier
    - `PRIVY_APP_SECRET` - Server-side secret for token verification

**Authorization:**
- Role-based access control (RBAC):
  - User statuses: `incomplete`, `pending`, `guest`, `active`, `admin`
  - Guest users: Limited access (browse, submit work)
  - Members: Full access
  - Admins: Admin routes and operations
- Implementation: `src/middleware/guest-access.ts`, `src/components/layout/protected-route-wrapper.tsx`

## Monitoring & Observability

**Error Tracking:**
- Not detected - Using console error logging only

**Logs:**
- Console logging (Node.js/Browser console)
- Third-party library warning filter: `src/lib/error-filter.ts` suppresses known issues
  - Privy SVG attribute warnings
  - Privy styled-components hydration warnings
  - Coinbase Wallet SDK COOP check failures

## CI/CD & Deployment

**Hosting:**
- Vercel - Primary deployment platform (Next.js optimized)
- Integration: `vercel env pull .env.local` command for environment setup

**CI Pipeline:**
- Not configured - Manual deployments

**Database Migrations:**
- Manual trigger: `bun run db:migrate`
- Runs pending migrations from `drizzle/migrations/`
- Critical: Uses `DATABASE_URL_UNPOOLED` for direct connection
- Drizzle migrations table: `drizzle_migrations` in public schema

## Environment Configuration

**Required Environment Variables:**

```bash
# Authentication - REQUIRED
NEXT_PUBLIC_PRIVY_APP_ID=...
NEXT_PUBLIC_PRIVY_CLIENT_ID=...
PRIVY_APP_SECRET=...

# Database - REQUIRED
DATABASE_URL=postgresql://user:pass@host/db
DATABASE_URL_UNPOOLED=postgresql://user:pass@host/db

# File Storage - REQUIRED
BLOB_READ_WRITE_TOKEN=...

# Blockchain - OPTIONAL
NEXT_PUBLIC_ALCHEMY_API_KEY=...  # Falls back to public RPCs if missing
```

**Secrets Location:**
- Development: `.env.local` (git-ignored, loaded via `dotenv` and Next.js)
- Production: Vercel Environment Variables (pulled via `vercel env pull`)
- Note: `.env.local` is git-ignored; secrets are managed in Vercel dashboard

## Webhooks & Callbacks

**Incoming:**
- Not detected - No webhook receivers implemented

**Outgoing:**
- Not detected - No webhook senders implemented

## Data Exchange Patterns

**API Response Format:**
- Standardized envelope pattern for all endpoints
- Success: `{ success: true, data: {...}, message?: string, meta?: {...} }`
- Error: `{ success: false, error: { message: string, code?: string, details?: unknown } }`
- Implementation: `src/lib/api/response.ts` with helpers (`apiSuccess`, `apiError`, `apiValidationError`)
- Client wrapper: `src/lib/api/fetch.ts` (`apiFetch`) for automatic unwrapping and error handling

**Image Upload Pattern:**
- Multipart form-data to API routes
- File validation on server (type, size)
- Upload to Vercel Blob with random suffix for collision prevention
- URL stored in database for retrieval
- Old URLs cleaned up before replacement

**Form Validation:**
- Client: React Hook Form + custom validation
- Server: Zod schema validation with automatic error formatting
- Response: 400 status with validation details on failure

## Integration Points Summary

| Component | Service | Type | Required |
|-----------|---------|------|----------|
| Authentication | Privy | Web3 Wallet | Yes |
| Blockchain Calls | Wagmi + Alchemy | RPC Provider | No* |
| User Avatars | Vercel Blob | File Storage | Yes |
| Project Files | Vercel Blob | File Storage | Yes |
| Database | PostgreSQL (Neon) | SQL Database | Yes |
| Events | lu.ma | HTML Metadata | No |
| Deployment | Vercel | Hosting | Yes |

*Alchemy is optional; public RPCs used as fallback

---

*Integration audit: 2026-01-26*
