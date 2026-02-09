# Poktapok Implementation Plan

## PRD Ticket Breakdown

**Project:** Frutero Talent Platform MVP
**Timeline:** 8 weeks
**Tech Stack:** Next.js 16, React 19, TypeScript, Bun, PostgreSQL, Drizzle ORM, Privy, Wagmi

---

## Implementation Philosophy

### Ticket Structure

Each ticket follows this format:

- **ID:** `EPIC#-TICKET#` (e.g., `E1-T0`, `E1-T1`)
- **Title:** Clear, action-oriented description
- **Story Points:** Complexity estimate (1=simple, 3=medium, 5=complex, 8=very complex)
- **Dependencies:** Previous tickets that must be completed
- **Acceptance Criteria:** Measurable completion requirements
- **Files Changed:** List of files created/modified
- **Testing:** How to verify the implementation works

### Development Workflow

```
Setup (E0) → Epic 1 (E1) → Epic 2 (E2) → Epic 3 (E3) → Epic 4 (E4)
```

Each epic is broken into sequential tickets that can be worked on by different developers in parallel where possible.

---

## Epic 0: Project Setup & Infrastructure

### Ticket E0-T0: PostgreSQL Database Setup

**Story Points:** 2
**Dependencies:** None
**Assignee:** Backend Developer

**Objective:** Set up hosted PostgreSQL database (Railway/Vercel) with Drizzle ORM and migration-based synchronization for the team.

**Implementation Details:** See [0-setup.md](./0-setup.md)

**Success Criteria:**

- ✅ Hosted PostgreSQL database provisioned (Vercel Postgres or Railway)
- ✅ Drizzle ORM configured with connection pooling
- ✅ All developers can pull env variables via `vercel env pull .env.local`
- ✅ Migration system working (`bun run db:migrate` syncs everyone)
- ✅ Drizzle Studio accessible at `https://local.drizzle.studio`
- ✅ Schema definitions for Epic 1 tables created and migrated

---

## Epic 1: Talent Directory (Week 1)

**Goal:** Launch a simple, non-intimidating talent directory where builders can create profiles and be discovered.

**Success Metrics:**

- 100 approved profiles within 2 weeks
- < 3-minute average profile creation time
- < 5% spam/low-quality applications
- 30% of signups via referrals

### Ticket E1-T1: Authentication Integration (Privy Setup)

**Story Points:** 5
**Dependencies:** E0-T0
**Assignee:** Full-stack Developer

**Objective:** Integrate Privy for wallet + email authentication with user creation flow.

**Tasks:**

1. Install Privy SDK dependencies (already done)
2. Create authentication middleware for API routes
3. Build user registration flow:
   - New user → check if application approved
   - Create `users` record with Privy `authId`
   - Create linked `profiles` record (one-to-one)
4. Implement protected route wrapper component
5. Add session management with React Query

**Files to Create/Modify:**

- `src/lib/auth/privy-helpers.ts` - Auth utilities
- `src/lib/auth/middleware.ts` - API route protection
- `src/components/auth/login-button.tsx` - Login UI component
- `src/app/api/auth/me/route.ts` - Get current user endpoint
- `src/app/api/auth/register/route.ts` - User registration endpoint

**Acceptance Criteria:**

- ✅ Users can log in with wallet OR email via Privy
- ✅ User session persists across page refreshes
- ✅ Protected routes redirect unauthenticated users to login
- ✅ `/api/auth/me` returns user + profile data when authenticated
- ✅ New user creation automatically generates profile record

**Testing:**

```bash
# Manual testing
1. Click "Connect Wallet" → should open Privy modal
2. Authenticate → should redirect to profile setup
3. Refresh page → should remain logged in
4. Open /api/auth/me → should return JSON with user data
```

---

### Ticket E1-T2: Profile Creation Flow

**Story Points:** 5
**Dependencies:** E1-T1
**Assignee:** Frontend Developer

**Objective:** Build user-friendly profile setup form with real-time validation.

**Tasks:**

1. Create profile form with React Hook Form + Zod validation
2. Implement username availability check (debounced)
3. Add character counter for bio (max 280)
4. Build preview mode before submit
5. Create API endpoint for profile creation/update

**Form Fields:**

- Username (unique, 3-20 chars, alphanumeric + underscore)
- Display name (2-50 chars)
- Bio (max 280 chars, no URLs initially)
- City + Country (autocomplete dropdowns)
- Learning tracks (radio: AI, Crypto/DeFi, Privacy)
- Availability status (radio: learning, building, open-to-bounties)
- Social links (optional: GitHub, Twitter, LinkedIn, Telegram)

**Files to Create/Modify:**

- `src/components/profile/profile-form.tsx` - Main form component
- `src/components/profile/preview-card.tsx` - Profile preview
- `src/lib/validators/profile.ts` - Zod schemas
- `src/app/api/profiles/route.ts` - POST /api/profiles
- `src/app/api/profiles/[username]/route.ts` - GET/PUT profile by username
- `src/app/api/profiles/check-username/route.ts` - Username availability

**Acceptance Criteria:**

- ✅ Form completes in < 3 minutes (tested with 5 users)
- ✅ Real-time validation shows errors before submit
- ✅ Username check shows "available" or "taken" within 500ms
- ✅ Bio character count updates live
- ✅ Preview shows exact public profile appearance
- ✅ Mobile-responsive (tested on 375px viewport)

**Testing:**

```bash
# API testing
curl -X POST http://localhost:3000/api/profiles \
  -H "Content-Type: application/json" \
  -d '{"username":"carlos_dev","displayName":"Carlos Rodriguez",...}'

# Should return 201 with profile JSON
```

---

### Ticket E1-T3: Public Directory Page

**Story Points:** 5
**Dependencies:** E1-T2
**Assignee:** Frontend Developer

**Objective:** Build browsable directory with search, filters, and pagination.

**Tasks:**

1. Create directory page with card grid layout
2. Implement search bar (username, display name, bio)
3. Add filters (learning track, availability, location)
4. Build pagination (24 profiles per page)
5. Optimize query performance (indexed searches)

**Layout:**

- Desktop: 3-column card grid
- Mobile: 1-column stacked cards

**Card Content:**

- Avatar (generated from username or uploaded)
- Username + display name
- Bio (truncated to 100 chars)
- Location (city + country flag emoji)
- Learning track badges (colored pills)
- Availability indicator (colored dot)

**Files to Create/Modify:**

- `src/app/directory/page.tsx` - Directory page
- `src/components/directory/profile-card.tsx` - Profile card
- `src/components/directory/filters.tsx` - Filter sidebar
- `src/components/directory/search-bar.tsx` - Search input
- `src/app/api/directory/route.ts` - GET /api/directory with filters
- `src/lib/db/queries/profiles.ts` - Add `getDirectoryProfiles()` query

**Acceptance Criteria:**

- ✅ Search returns results in < 500ms (tested with 1000 profiles)
- ✅ Filters update results without full page reload
- ✅ Cards render in < 2s on 3G connection
- ✅ Pagination shows "Load More" button (infinite scroll on mobile)
- ✅ Default sort: Recently joined (newest first)

**Testing:**

```bash
# Test API endpoint
curl "http://localhost:3000/api/directory?search=carlos&track=crypto&page=1"

# Should return paginated profile array
```

---

### Ticket E1-T4: Individual Profile Page

**Story Points:** 3
**Dependencies:** E1-T2
**Assignee:** Frontend Developer

**Objective:** Create detailed profile view with tiered visibility controls.

**Tasks:**

1. Build profile page at `/profile/[username]`
2. Implement visibility tiers (public, members-only, private)
3. Add "Edit Profile" button (only for profile owner)
4. Create share button (copy link to clipboard)
5. Add report button (spam/abuse reporting modal)

**Visibility Tiers:**

**Public (anyone):**

- Username, display name, avatar
- Bio, location, learning tracks
- Join date, availability status

**Members-only (authenticated users):**

- All public data +
- Social links (GitHub, Twitter, LinkedIn, Telegram)
- "Send message" button (future epic)

**Private:**

- Only visible to profile owner
- Hidden from directory listings

**Files to Create/Modify:**

- `src/app/profile/[username]/page.tsx` - Profile page
- `src/components/profile/profile-header.tsx` - Avatar + bio section
- `src/components/profile/social-links.tsx` - Social media links
- `src/components/profile/share-button.tsx` - Share functionality
- `src/lib/utils/visibility.ts` - Visibility permission helpers

**Acceptance Criteria:**

- ✅ Profile loads in < 1s
- ✅ Visibility rules enforced correctly (tested with authenticated + guest users)
- ✅ Share button copies URL to clipboard with success toast
- ✅ Profile owner sees "Edit" button, others don't
- ✅ Social links construct correct URLs (https://github.com/{username})

**Testing:**

```bash
# Test as guest
curl http://localhost:3000/api/profiles/carlos_dev
# Should return public fields only

# Test as authenticated user
curl http://localhost:3000/api/profiles/carlos_dev \
  -H "Authorization: Bearer {token}"
# Should return public + members-only fields
```

---

### Ticket E1-T5: Application System

**Story Points:** 5
**Dependencies:** E0-T0
**Assignee:** Full-stack Developer

**Objective:** Build application submission form and admin review dashboard.

**Tasks:**

1. Create public application form (no auth required)
2. Build admin dashboard at `/admin/applications`
3. Implement approval flow (approve → send email → user can register)
4. Add rejection flow with optional notes
5. Create email templates (approval/rejection)

**Application Form Fields:**

- Email (required, verified)
- Reason for joining (textarea, 50-500 chars)
- Referral code (optional, validates against invitations table)

**Admin Dashboard:**

- Table view of pending applications
- Columns: Email, reason snippet, submitted date, actions
- Bulk actions: Approve selected, Delete spam
- Filter: Pending, Approved, Rejected, All

**Files to Create/Modify:**

- `src/app/apply/page.tsx` - Public application form
- `src/app/admin/applications/page.tsx` - Admin dashboard
- `src/components/admin/application-table.tsx` - Applications table
- `src/app/api/applications/route.ts` - POST /api/applications
- `src/app/api/admin/applications/[id]/approve/route.ts` - Approval endpoint
- `src/app/api/admin/applications/[id]/reject/route.ts` - Rejection endpoint
- `src/lib/email/templates.tsx` - Email templates (React Email)

**Acceptance Criteria:**

- ✅ Application form validates email format
- ✅ Spam protection: Simple CAPTCHA (e.g., hCaptcha)
- ✅ Admin can approve in 1 click (<2s roundtrip)
- ✅ Approved users receive email with registration link
- ✅ Registration link expires in 7 days
- ✅ Admins can add review notes (visible internally only)

**Testing:**

```bash
# Submit application
curl -X POST http://localhost:3000/api/applications \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","reason":"Want to learn Web3"}'

# Admin approve application
curl -X POST http://localhost:3000/api/admin/applications/{id}/approve \
  -H "Authorization: Bearer {admin_token}"
```

---

### Ticket E1-T6: Invitation System

**Story Points:** 3
**Dependencies:** E1-T1, E1-T5
**Assignee:** Backend Developer

**Objective:** Allow users to invite friends directly, bypassing the application process.

**Tasks:**

1. Create "Invite Friends" UI in user dashboard
2. Generate unique 8-char alphanumeric codes
3. Send invitation emails with link
4. Implement invite link redemption (skips application)
5. Track invitation usage and expiry (7 days)

**Invitation Limits:**

- Standard users: 2 invites
- Power users (3+ completed bounties): 5 invites
- Admins: Unlimited

**Files to Create/Modify:**

- `src/app/dashboard/page.tsx` - Add invitation section
- `src/components/invitations/invite-form.tsx` - Invite input form
- `src/components/invitations/invite-list.tsx` - List of sent invites
- `src/app/api/invitations/route.ts` - POST /api/invitations
- `src/app/api/invitations/me/route.ts` - GET user's invitations
- `src/app/invite/[code]/page.tsx` - Invite redemption page
- `src/lib/email/invitation-template.tsx` - Invitation email

**Acceptance Criteria:**

- ✅ Users cannot exceed invitation quota
- ✅ Invitation codes are unique and URL-safe
- ✅ Expired invitations show "Link expired" message
- ✅ Used invitations show "Already used" message
- ✅ Profile shows "Invited by @username" badge
- ✅ Inviters can see invitation status (sent, used, expired)

**Testing:**

```bash
# Create invitation
curl -X POST http://localhost:3000/api/invitations \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"email":"friend@example.com"}'

# Redeem invitation
curl http://localhost:3000/api/invite/{code}
# Should return invitation details if valid
```

---

## Epic 1 Summary

**Total Story Points:** 29
**Estimated Duration:** 1 week (7 days)
**Team Size:** 3 developers

**Parallel Work Streams:**

- Week 1 Days 1-2: E0-T0 (Database Setup)
- Week 1 Days 3-4: E1-T1 (Auth) + E1-T5 (Applications) in parallel
- Week 1 Days 5-6: E1-T2 (Profile Form) + E1-T3 (Directory)
- Week 1 Day 7: E1-T4 (Profile Page) + E1-T6 (Invitations) + Testing

**Definition of Done:**

- ✅ All acceptance criteria met
- ✅ Code reviewed by peer
- ✅ Manual testing completed
- ✅ Deployed to staging environment
- ✅ Product team sign-off

---

## Epic 2: Portfolio Showcase (Weeks 2-3)

**Status:** ✅ Mostly Complete (via Convex Migration)

**Completed:**

- ✅ E2-T1: Portfolio Builder UI (`/portfolio` page with CRUD)
- ✅ E2-T3: GitHub/Demo/Video links in projects
- ✅ E2-T4: Skills & Endorsements system (full implementation)
- ✅ Profile page shows projects and skills

**Deferred:**

- ⏳ E2-T2: Image Upload - Using Vercel Blob for avatars; project thumbnails TBD
- ⏳ E2-T5: Portfolio Analytics - **See Decision Log below**

### Decision Log

#### D-001: Portfolio Analytics Deferred (2026-02-08)

**Feature:** E2-T5 Portfolio Analytics (track profile views, most viewed projects, skills distribution)

**Decision:** Defer to post-MVP

**Rationale:**
1. **Admin-only feature** - No direct user value; doesn't help builders get hired
2. **Core journey unblocked** - Users can create profiles, add skills, build portfolio, get endorsed without analytics
3. **Epic 3 is higher priority** - Bounty Marketplace is the actual earning mechanism ("de cero a chamba en 3 meses")
4. **Data dependency** - Analytics are more valuable once there's real usage data to analyze

**Revisit when:**
- 100+ active profiles
- Epic 3 launched and stable
- Admin dashboard needs expanded

---

## Epic 3: Bounty Marketplace (Weeks 4-6)

**Status:** ✅ Core Flow Complete (via Convex Migration)

**Completed:**

- ✅ E3-T1: Bounty Listings Page (`/bounties` with categories, status filters)
- ✅ E3-T2: Bounty Detail & Claim Flow (users can claim available bounties)
- ✅ E3-T3: Submission System (URL submission with review workflow)
- ✅ E3-T4: Admin Review Dashboard (approve/reject submissions, incrementa stats)
- ✅ E3-T5: User Bounty Dashboard (`/dashboard` con "Mis Bounties" section)
- ✅ E3-T6: Earnings Tracking (profile shows `completedBounties` + `totalEarningsUsd`)
- ✅ Leaderboard: "Por bounties" category filter
- ✅ Directory: Shows bounties completed + earnings in cards

**Pending:**

- ⏳ **Build fix:** Add `completedBounties` to `Profile` type in `/src/types/api-v1.ts`
- ⏳ E3-T7: Bounty notifications (email when claimed/reviewed) - Future

---

## Epic 4: Onchain Funding (Weeks 7-8)

**Status:** 🔜 Pendiente - Next Epic

Smart contract escrow, multi-chain support, crypto payments

**Tickets:**

- ⏳ E4-T1: Smart Contract Development (escrow for bounty payments)
- ⏳ E4-T2: Testnet Deployment (Sepolia/Base Goerli)
- ⏳ E4-T3: Payment UI Integration (wallet connect → fund bounty)
- ⏳ E4-T4: Multi-Chain Support (ETH, USDC, possibly Monad)
- ⏳ E4-T5: Transaction Monitoring (track payment status)
- ⏳ E4-T6: Mainnet Launch

**Dependencies:**
- Epic 3 stable and tested
- Admin workflow validated with test bounties

---

## Overall Status Summary (2026-02-09)

| Epic | Status | Notes |
|------|--------|-------|
| E0: Setup | ✅ Complete | Convex deployed: `brainy-porcupine-595` |
| E1: Talent Directory | ✅ Complete | Auth, profiles, directory, invitations |
| E2: Portfolio Showcase | ✅ Complete | Projects CRUD, skills, endorsements |
| E3: Bounty Marketplace | ✅ Core Complete | Listings, claims, submissions, review, dashboard |
| E4: Onchain Funding | 🔜 Pending | Next priority after E3 stable |

**Immediate Blockers:**
1. TypeScript build error: `completedBounties` missing from `Profile` type

**Deferred Features:**
- Portfolio Analytics (D-001) - revisit at 100+ profiles
- Bounty email notifications - nice-to-have

---

## Development Guidelines

### Code Quality Standards

- All TypeScript (strict mode)
- ESLint + Prettier configured
- 80%+ test coverage for business logic
- No console.logs in production code
- Use absolute imports (`@/` prefix)

### Git Workflow

```bash
# Feature branch from dev
git checkout -b E1-T1-auth-integration

# Commit with ticket ID
git commit -m "E1-T1: Add Privy authentication middleware"

# Push and create PR
git push origin E1-T1-auth-integration
```

### PR Requirements

- Title format: `[E#-T#] Brief description`
- Link to ticket in description
- Screenshots for UI changes
- Review by at least 1 developer
- CI/CD checks pass (linting, type checking)

### Testing Strategy

- Unit tests: Core business logic (query functions, validators)
- Integration tests: API endpoints
- E2E tests: Critical user flows (signup, profile creation)
- Manual testing: UI/UX, mobile responsiveness

---

## Deployment Strategy

### Environments

1. **Local:** `localhost:3000` (individual developer machines)
2. **Staging:** `staging.poktapok.club` (pre-production testing)
3. **Production:** `poktapok.club` (live users)

### Continuous Deployment

- **main branch** → Auto-deploy to production (Vercel)
- **dev branch** → Auto-deploy to staging
- **feature branches** → Preview deployments (Vercel)

### Database Migrations

- Local: `bun run db:push` (rapid iteration)
- Staging/Prod: `bun run db:migrate` (tracked migrations)
- Migration files committed to git
- Never edit migrations after deployment

---

## Monitoring & Analytics

### Application Monitoring

- Error tracking: Sentry (client + server errors)
- Performance: Vercel Analytics (Web Vitals)
- Logs: Vercel logs + Railway PostgreSQL logs

### Product Analytics

- User events: PostHog (self-hosted or cloud)
- Key events to track:
  - Profile created
  - Application submitted
  - Profile viewed
  - Invitation sent/redeemed
  - Bounty claimed/completed (Epic 3)

---

## Support & Resources

### Documentation

- [PRD.md](./PRD.md) - Full product requirements
- [0-setup.md](./0-setup.md) - Database setup guide
- [CLAUDE.md](../CLAUDE.md) - Claude Code guide

### External Docs

- [Privy Docs](https://docs.privy.io)
- [Drizzle ORM](https://orm.drizzle.team)
- [Next.js 16](https://nextjs.org/docs)
- [Wagmi](https://wagmi.sh)

### Team Communication

- **Standup:** Daily, 15 min (async in Slack)
- **PR Reviews:** Within 24 hours
- **Deployments:** Announced in #eng channel
- **Incidents:** Alert in #alerts, create Notion doc

---

**Document Version:** 1.0
**Last Updated:** December 2024
**Next Review:** After Epic 1 completion
