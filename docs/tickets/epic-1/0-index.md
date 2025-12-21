# Epic 1: Talent Directory - Ticket Status

**Epic Goal:** Launch a simple, non-intimidating talent directory where builders can create profiles and be discovered.

**Duration:** Week 1 (7 days)
**Story Points:** 26 total
**Team Size:** 3 developers

---

## Success Metrics
- [ ] 100 approved profiles within 2 weeks of launch
- [ ] < 3-minute average profile creation time
- [ ] < 5% spam/low-quality applications
- [ ] 30% of signups via referrals

---

## Prerequisites Status

### Epic 0: Database Setup
- ✅ **COMPLETED** (2025-12-20)
- Database schema implemented (users, profiles, applications, invitations)
- Migrations applied to Neon DB
- All CRUD operations verified
- Documentation completed

**Key Infrastructure Ready:**
- PostgreSQL via Neon DB (pooled + unpooled connections)
- Drizzle ORM with node-postgres
- 4 tables, 7 enums, 31 indexes, 47+ CHECK constraints
- Scripts for testing and verification

---

## Ticket Status Overview

| Ticket ID | Title | Story Points | Status | Progress | Next Steps |
|-----------|-------|--------------|--------|----------|------------|
| E1-T1 | Authentication Integration | 5 | 🟡 In Progress | 60% - Auth flow working | Complete onboarding form, add /api/auth/me |
| E1-T2 | Profile Creation Flow | 5 | 🔴 Not Started | 0% | Blocked by E1-T1 |
| E1-T3 | Public Directory Page | 5 | 🔴 Not Started | 0% | Blocked by E1-T2 |
| E1-T4 | Individual Profile Page | 3 | 🔴 Not Started | 0% | Blocked by E1-T2 |
| E1-T5 | Application System | 5 | 🔴 Not Started | 0% | Can start (optional, deprioritized) |
| E1-T6 | Invitation System | 3 | 🔴 Not Started | 0% | Blocked by E1-T1, E1-T5 |

**Status Legend:**
- 🔴 Not Started
- 🟡 In Progress
- 🟢 Completed
- 🔵 Blocked

---

## Work Streams (Parallelization)

### ✅ Days 1-2: Infrastructure Setup (COMPLETED)
- **E0:** Database Setup ✅
  - Schema design and implementation
  - Migration system setup
  - Connection pooling with node-postgres
  - Verification scripts and documentation

### Days 1-2: Core Systems (Can Start Immediately)
- **Stream A:** E1-T1 (Auth Integration) - 5 points
  - Privy integration (already partially done)
  - User registration flow with application check
  - Protected routes and session management

- **Stream B:** E1-T5 (Application System) - 5 points
  - Public application form
  - Admin review dashboard
  - Email notifications (approval/rejection)

**Blockers Removed:** Database tables ready, can proceed with both streams in parallel

### Days 3-4: User-Facing Features
- **Stream A:** E1-T2 (Profile Form) - 5 points
  - React Hook Form with Zod validation
  - Username availability check
  - Preview mode before submission

- **Stream B:** E1-T3 (Directory Page) - 5 points
  - Profile card grid with search/filters
  - Pagination (desktop) and infinite scroll (mobile)
  - Skeleton loaders for better UX

**Dependencies:** Both require E1-T1 (Auth) to be completed

### Days 5-6: Polish & Secondary Features
- **Stream A:** E1-T4 (Profile Page) - 3 points
  - Individual profile view with visibility tiers
  - Share functionality and SEO metadata
  - Report abuse system

- **Stream B:** E1-T6 (Invitations) - 3 points
  - Invitation code generation and management
  - Invitation emails and redemption flow
  - Quota system based on user activity

**Dependencies:** E1-T4 needs E1-T2 (profile structure), E1-T6 needs E1-T1 + E1-T5

### Day 7: Testing & Launch Prep
- **Integration Testing:** All flows end-to-end
- **Performance Testing:** Load testing with 100+ profiles
- **Mobile Testing:** Responsive design verification
- **Deployment:** Staging → Production

---

## Ticket Files

- [E1-T1: Authentication Integration](./E1-T1-auth-integration.md)
- [E1-T2: Profile Creation Flow](./E1-T2-profile-creation.md)
- [E1-T3: Public Directory Page](./E1-T3-directory-page.md)
- [E1-T4: Individual Profile Page](./E1-T4-profile-page.md)
- [E1-T5: Application System](./E1-T5-application-system.md)
- [E1-T6: Invitation System](./E1-T6-invitation-system.md)

---

## Definition of Done (All Tickets)

- [ ] All acceptance criteria met
- [ ] Code reviewed by peer
- [ ] Manual testing completed
- [ ] Deployed to staging environment
- [ ] Product team sign-off

---

## Current Implementation Status

### 🟡 E1-T1: Authentication Integration (IN PROGRESS - 60%)

**✅ Completed:**
- Privy authentication working (wallet + email + social)
- Auth button component ([auth-button-privy.tsx](../../src/components/buttons/auth-button-privy.tsx))
- User creation API endpoint ([/api/auth/check-user](../../src/app/api/auth/check-user/route.ts))
- User record creation with `accountStatus` flow
- Onboarding page with ProtectedRoute wrapper ([/onboarding](../../src/app/onboarding/page.tsx))
- PageWrapper for consistent layout
- Redirect logic based on account status (incomplete → onboarding, active → profile)

**🔧 In Progress:**
- Onboarding form component (OnboardingForm - needs implementation)
- Profile data collection during onboarding

**⏳ Still Needed:**
- `/api/auth/me` endpoint (get current user + profile)
- Session management hook (useAuth)
- Profile completion logic
- Update user status from "incomplete" → "pending" → "active"

**Next Step:** Complete the onboarding form to collect username, email, display name, bio

---

### 📋 Simplified Flow (No Application/Email System for MVP)

**Decision:** Deprioritize E1-T5 (Application System) and E1-T6 (Invitations) for initial MVP
- Email service setup not needed yet
- CAPTCHA not needed yet
- Admin approval flow not needed yet

**Simplified User Flow:**
1. User authenticates with Privy → `accountStatus: "incomplete"`
2. User redirected to `/onboarding` form
3. User fills profile data → `accountStatus: "active"` (auto-approved for MVP)
4. User can access talent directory

This removes blockers and focuses on core functionality: **auth → profile → directory**

### 🎯 Updated Critical Path

1. **E1-T1** (complete onboarding form) → 40% remaining
2. **E1-T2** (profile creation/edit flow) → Next priority
3. **E1-T3** (directory page) → After profiles exist
4. **E1-T4** (individual profile page) → Parallel with E1-T3

**Later:**
- E1-T5 (Application System) - when we need quality control
- E1-T6 (Invitations) - when we need referral growth

---

## Notes & Blockers

_Use this section to track impediments, questions, or coordination needs._

### Current Blockers
- None - focusing on completing E1-T1 onboarding form

### Decisions Made
- ✅ Database schema finalized (4 tables ready)
- ✅ Privy for authentication
- ✅ node-postgres over postgres-js for database client
- ✅ **Simplified MVP flow** - no application/email/CAPTCHA system for now
- ✅ Auto-approve users during onboarding (no admin review needed initially)
- ✅ Onboarding form in E1-T1 (not separate E1-T2 ticket)

### Recent Changes
- **2025-12-20:** Epic 0 completed - database ready
- **2025-12-20:** E1-T1 started - auth flow + user creation working
- **2025-12-20:** Onboarding page created with ProtectedRoute wrapper
- **2025-12-20:** Deprioritized E1-T5 and E1-T6 for MVP simplicity

### Immediate Next Steps
1. Complete OnboardingForm component (collect username, email, display name, bio)
2. Create profile record on onboarding completion
3. Update user status: `incomplete` → `active`
4. Add `/api/auth/me` endpoint for session management
5. Move to E1-T3 (directory page) once users can create profiles

---

**Last Updated:** 2025-12-20
**Next Review:** After E1-T1 completion
