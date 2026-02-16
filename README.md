# poktapok

talent platform connecting Latin American developers with global opportunities through bounties, bootcamps, and practical learning.

## what it does

helps university students, recent grads, and career changers earn money in 3 months learning AI, crypto/DeFi, and privacy through real-world challenges.

## architecture

```
talent directory → portfolio showcase → bounty marketplace → bootcamp LMS → onchain funding
```

## tech stack

| layer | tech |
|-------|------|
| frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui |
| backend | Convex (database + real-time + file storage + cron jobs) |
| auth | Privy (email, wallet, social login) |
| blockchain | Wagmi, Arbitrum (default), Base, Polygon, Ethereum, Optimism, Scroll |
| package manager | Bun |
| hosting | Vercel |

## features

**talent directory** — profile creation, public directory with search/filters, skill endorsements

**portfolio** — project showcase, GitHub integration, skills management

**bounty marketplace** — claim bounties, submit work, admin review, crypto payments

**bootcamp LMS** — VibeCoding Bootcamp with enrollment codes, session tracking, deliverable submission, 4-tier grading (Core/Complete/Excellent/Bonus), API key distribution, admin review dashboard

**programs** — cohort management, attendance tracking, guest-to-member promotion

## getting started

### prerequisites

- [Bun](https://bun.sh/docs/installation)
- [Privy](https://privy.io/) app credentials
- [Convex](https://convex.dev/) account

### setup

```bash
git clone https://github.com/fruteroclub/poktapok.git
cd poktapok
bun install
```

configure `.env.local`:

```
NEXT_PUBLIC_PRIVY_APP_ID=...
NEXT_PUBLIC_PRIVY_CLIENT_ID=...
PRIVY_APP_SECRET=...

NEXT_PUBLIC_CONVEX_URL=...
CONVEX_DEPLOYMENT=...

NEXT_PUBLIC_ALCHEMY_API_KEY=...  # optional
```

### run

```bash
bun dev          # dev server at localhost:3000
npx convex dev   # sync Convex functions
```

### build

```bash
bun run build
bun start
```

### deploy

```bash
npx convex deploy -y   # deploy Convex to production
git push origin main    # triggers Vercel deploy
```

## project structure

```
poktapok/
├── src/
│   ├── app/              # Next.js pages and API routes
│   ├── components/       # React components (ui/, layout/, admin/, etc.)
│   ├── hooks/            # Custom React Query hooks
│   ├── services/         # API service layer
│   ├── lib/              # Utilities, fonts, error filter
│   ├── providers/        # Context providers (Privy, Wagmi, App)
│   └── styles/           # Global CSS
├── convex/
│   ├── schema.ts         # Database schema
│   ├── users.ts          # User queries/mutations
│   ├── bootcamp.ts       # Bootcamp LMS logic
│   ├── bounties.ts       # Bounty marketplace
│   ├── applications.ts   # Onboarding applications
│   └── ...               # Other modules
├── scripts/              # Utility scripts (email invites, etc.)
├── docs/                 # Documentation
└── vercel.json           # Vercel config (build skip for docs)
```

## key conventions

- **TypeScript strict mode** — no `any` types
- **kebab-case** for file names
- **TanStack Query** for all data fetching (never `useEffect` + `fetch`)
- **Service → Hook → Component** abstraction pattern
- **Convex** for all database operations (real-time, no REST APIs needed)
- **Tailwind `space-y` / `gap`** for spacing (no manual margins)

## contributing

contributions welcome. all code must be TypeScript with proper types.

---

built by [frutero club](https://frutero.club) for Latin American builders
