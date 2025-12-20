# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Current State:** Frutero Club is a Next.js 16 landing page application built with React 19, TypeScript, and Tailwind CSS v4. It features Web3 wallet integration via Privy, supporting multiple EVM chains (Arbitrum, Base, Ethereum, Optimism, Polygon, Scroll).

**Vision (from README.md):** The long-term goal is "poktapok" - a talent platform connecting Latin American developers with global opportunities through bounties and practical learning. The planned architecture includes PostgreSQL database, Drizzle ORM, Zustand state management, and a bounty marketplace with on-chain funding. However, **these backend features are not yet implemented** - the current codebase is a frontend-only landing page.

## Development Commands

```bash
# Start development server (http://localhost:3000)
bun dev

# Build for production
bun run build

# Run production build
bun start

# Lint codebase
bun run lint
```

The project uses Bun as its package manager and runtime.

## Architecture

### Provider Hierarchy

The application uses a layered provider architecture that wraps all pages:

1. **AppProvider** (`src/providers/app-provider.tsx`) - Root provider with Suspense boundary
2. **PrivyProviderComponent** (`src/providers/auth/privy-provider.tsx`) - Privy authentication + React Query + Wagmi
3. **Wagmi Config** (`src/providers/onchain-config/index.tsx`) - Chain configuration with Alchemy/public RPC fallback

This creates a provider chain: `Suspense` → `Privy` → `QueryClient` → `Wagmi` → `{children}`

### Authentication & Web3

- **Privy** handles wallet authentication (embedded + external wallets)
- **Wagmi** manages blockchain interactions
- Default chain is Arbitrum; supports 6 chains total
- Alchemy API key is optional (falls back to public RPCs)

Required environment variables:
```
NEXT_PUBLIC_PRIVY_APP_ID
NEXT_PUBLIC_PRIVY_CLIENT_ID
NEXT_PUBLIC_PRIVY_APP_SECRET
NEXT_PUBLIC_ALCHEMY_API_KEY (optional)
```

### Component Organization

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── ui/                # shadcn/ui components (Radix UI primitives)
│   ├── layout/            # Navbar, PageWrapper, ProtectedRoute, MobileMenu
│   ├── landing/           # Landing page sections (Hero, Stats, FAQ, etc.)
│   ├── buttons/           # Auth buttons (Privy integration)
│   ├── common/            # Shared components
│   └── stats/             # Stats display components
├── lib/
│   ├── utils.ts          # cn() utility (clsx + tailwind-merge)
│   ├── fonts.ts          # Font definitions (Funnel Display, Ledger, Raleway, Space Grotesk)
│   └── error-filter.ts   # Console error suppression for third-party libraries
├── providers/            # React context providers
└── styles/               # Global CSS
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

## Important Notes

### Database & Backend
The README.md describes future features including PostgreSQL, Drizzle ORM, Zustand stores, and API routes for a bounty marketplace. **These are not yet implemented.** The current codebase has no:
- Database configuration or schema files
- Drizzle setup or migrations
- Zustand stores
- Backend API routes beyond Next.js defaults

When implementing these features, refer to the architecture described in README.md but verify it aligns with current project needs.

### Adding shadcn/ui Components
To add new UI components from shadcn or MagicUI:
```bash
# shadcn/ui components
bunx shadcn@latest add [component-name]

# MagicUI components (via configured registry)
bunx shadcn@latest add @magicui/[component-name]
```
