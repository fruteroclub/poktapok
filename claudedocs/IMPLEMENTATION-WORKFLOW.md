# Implementation Workflow - Jam & Club Sections

**Date:** January 12, 2026
**Status:** Phase 2 In Progress
**Current Progress:** Phase 1 Complete ✅, Phase 2 Landing Page Complete ✅

---

## Overview

Three-phase implementation for Jam and Club sections with systematic bottom-up approach.

### Phase Summary

| Phase | Status | Description | Completion |
|-------|--------|-------------|------------|
| **Phase 1** | ✅ Complete | Foundation APIs, Services, Hooks | 100% |
| **Phase 2** | 🔄 In Progress | Jam Section (5 pages) | 20% |
| **Phase 3** | ⏳ Pending | Club Section (3 pages) | 0% |

---

## Phase 1: API Specifications ✅ COMPLETE

**Status:** ✅ Complete
**Completion Date:** January 12, 2026

### Completed Work

#### Type Definitions ([src/types/api-v1.ts](../src/types/api-v1.ts))
- ✅ `PublicProgramResponse` - Program detail with stats
- ✅ `SessionFilters` - Session filtering parameters
- ✅ `PublicSession` & `PublicSessionsResponse` - Session listings
- ✅ `SessionDetailResponse` - Session detail with access control
- ✅ `ProjectFilters` - Project filtering (already existed)

#### API Endpoints
- ✅ `GET /api/programs/[id]` - Public program detail
- ✅ `GET /api/sessions` - Public sessions list with filtering/pagination
- ✅ `GET /api/sessions/[id]` - Session detail with conditional access
- ✅ `GET /api/projects` - Projects list (already existed)

#### Service Functions
- ✅ [src/services/programs.ts](../src/services/programs.ts) - Added `fetchPublicProgram()`
- ✅ [src/services/sessions.ts](../src/services/sessions.ts) - NEW: `fetchPublicSessions()`, `fetchSessionDetail()`

#### React Query Hooks
- ✅ [src/hooks/use-programs.ts](../src/hooks/use-programs.ts) - Added `usePublicProgram()`
- ✅ [src/hooks/use-sessions.ts](../src/hooks/use-sessions.ts) - NEW: `usePublicSessions()`, `useSessionDetail()`

---

## Phase 2: Jam Section 🔄 IN PROGRESS

**Status:** 🔄 20% Complete (1 of 5 pages)
**Current Focus:** Remaining 4 pages

### Completed (Page 1/5)

#### ✅ Page 1: `/jam` - Jam Landing Page
- **Status:** ✅ Complete
- **Files Created:**
  - [src/app/jam/page.tsx](../src/app/jam/page.tsx) - Server component with metadata
  - [src/app/jam/jam-content.tsx](../src/app/jam/jam-content.tsx) - Client component with data fetching
  - [src/components/jam/jam-hero.tsx](../src/components/jam/jam-hero.tsx) - Hero section with stats
  - [src/components/jam/program-card.tsx](../src/components/jam/program-card.tsx) - Program card component
  - [src/components/jam/programs-grid.tsx](../src/components/jam/programs-grid.tsx) - Programs grid layout
  - [src/components/jam/session-card.tsx](../src/components/jam/session-card.tsx) - Session card component
  - [src/components/jam/sessions-preview.tsx](../src/components/jam/sessions-preview.tsx) - Sessions preview section
  - [src/components/jam/activities-preview.tsx](../src/components/jam/activities-preview.tsx) - Activities preview section
  - [src/components/jam/mentorship-cta.tsx](../src/components/jam/mentorship-cta.tsx) - Mentorship CTA placeholder

### Next Steps (Pages 2-5)

#### ⏳ Page 2: `/jam/programs` - Programs Directory
**Priority:** High
**Estimated Effort:** 2-3 hours

**Required Components:**
1. **ProgramsPage** (`src/app/jam/programs/page.tsx`)
   - Server component with metadata
   - Title: "Programas - Jam | Frutero Club"

2. **ProgramsContent** (`src/app/jam/programs/programs-content.tsx`)
   - Client component with data fetching
   - Uses `useActivePrograms()` hook
   - Filtering: type (all/cohort/evergreen), search input
   - Reuses `ProgramsGrid` and `ProgramCard` components

**Implementation Steps:**
1. Create page structure with metadata
2. Create client content component
3. Add filter controls (inline component)
4. Implement search functionality
5. Wire up data fetching with filters
6. Add loading states and error handling

---

#### ⏳ Page 3: `/jam/programs/[id]` - Program Detail
**Priority:** High
**Estimated Effort:** 3-4 hours
**Dependencies:** Page 2

**Required Components:**
1. **ProgramDetailPage** (`src/app/jam/programs/[id]/page.tsx`)
   - Dynamic route with metadata
   - Title: "[Program Name] - Jam | Frutero Club"

2. **ProgramDetailContent** (`src/app/jam/programs/[id]/program-detail-content.tsx`)
   - Uses `usePublicProgram(programId)` hook
   - Program overview section
   - Stats display (enrollments, sessions, activities)
   - Sessions list (all program sessions)
   - Activities list (all program activities)
   - Enrollment CTA (conditional on auth status)

**Implementation Steps:**
1. Create dynamic route structure
2. Generate dynamic metadata from program data
3. Create program overview component
4. Create program stats component
5. Integrate sessions list
6. Integrate activities list
7. Add enrollment CTA logic
8. Handle loading and error states

---

#### ⏳ Page 4: `/jam/sessions` - Sessions Directory
**Priority:** Medium
**Estimated Effort:** 2-3 hours
**Dependencies:** None (can be parallel with Page 2)

**Required Components:**
1. **SessionsPage** (`src/app/jam/sessions/page.tsx`)
   - Server component with metadata
   - Title: "Sesiones - Jam | Frutero Club"

2. **SessionsContent** (`src/app/jam/sessions/sessions-content.tsx`)
   - Client component with data fetching
   - Uses `usePublicSessions(filters)` hook
   - Filtering: upcoming, program filter, standalone filter
   - Pagination controls
   - Reuses `SessionCard` component

**Implementation Steps:**
1. Create page structure with metadata
2. Create client content component
3. Add filter controls
4. Implement pagination
5. Wire up data fetching with filters
6. Add loading states and error handling

---

#### ⏳ Page 5: `/jam/sessions/[id]` - Session Detail
**Priority:** Medium
**Estimated Effort:** 3-4 hours
**Dependencies:** Page 4

**Required Components:**
1. **SessionDetailPage** (`src/app/jam/sessions/[id]/page.tsx`)
   - Dynamic route with metadata
   - Title: "[Session Title] - Jam | Frutero Club"

2. **SessionDetailContent** (`src/app/jam/sessions/[id]/session-detail-content.tsx`)
   - Uses `useSessionDetail(sessionId)` hook
   - Session overview section
   - Date/time/location display
   - Meeting URL (conditional on access)
   - Linked activities list
   - Program info (if linked to program)
   - Access control messaging

**Implementation Steps:**
1. Create dynamic route structure
2. Generate dynamic metadata from session data
3. Create session overview component
4. Implement conditional meeting URL display
5. Add access control UI logic
6. Integrate linked activities list
7. Add program info section
8. Handle loading and error states

---

## Phase 3: Club Section ⏳ PENDING

**Status:** ⏳ Not Started
**Estimated Start:** After Phase 2 completion

### Overview (3 pages)

#### Page 1: `/club` - Club Landing Page
- Club hero section
- Featured projects showcase
- Upcoming events preview
- Community stats

#### Page 2: `/club/projects` - Projects Showcase
- Projects grid with filtering
- Skills filter
- Search functionality
- Project cards

#### Page 3: `/club/calendar` - Event Calendar
- Calendar view component
- Sessions list view toggle
- Date filtering
- Event detail modal/drawer

---

## Implementation Strategy

### Bottom-Up Approach
1. **Foundation Layer** (Phase 1) ✅
   - APIs → Services → Hooks

2. **Component Layer** (Phase 2 & 3)
   - Reusable components → Page sections → Full pages

3. **Integration Layer**
   - Cross-page navigation
   - Shared state management
   - Error boundaries

### Best Practices Applied
- ✅ Type-safe with TypeScript strict mode
- ✅ No `any` types (ESLint enforced)
- ✅ Service + Hook abstraction pattern (no useEffect for data fetching)
- ✅ Kebab-case file naming
- ✅ Server/Client component separation
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Loading states with skeleton loaders
- ✅ Error handling with user-friendly messages
- ✅ Accessibility considerations

### Quality Gates
- [ ] TypeScript compilation (no errors)
- [ ] ESLint passing (no errors)
- [ ] Build successful
- [ ] Manual testing (all pages)
- [ ] Responsive design validation
- [ ] Accessibility review

---

## Next Immediate Actions

### Priority 1: Complete Phase 2 (Jam Section)
**Focus:** Implement remaining 4 pages in order

1. **Next Up:** `/jam/programs` - Programs Directory
   - Estimated: 2-3 hours
   - Complexity: Low-Medium
   - Dependencies: None (reuses existing components)

2. **Then:** `/jam/programs/[id]` - Program Detail
   - Estimated: 3-4 hours
   - Complexity: Medium
   - Dependencies: Programs page for navigation

3. **Then:** `/jam/sessions` - Sessions Directory
   - Estimated: 2-3 hours
   - Complexity: Low-Medium
   - Dependencies: None (can be parallel)

4. **Finally:** `/jam/sessions/[id]` - Session Detail
   - Estimated: 3-4 hours
   - Complexity: Medium
   - Dependencies: Sessions page for navigation

**Total Phase 2 Remaining:** ~10-14 hours of focused implementation

---

## Success Criteria

### Phase 2 Completion Checklist
- [ ] All 5 Jam section pages implemented
- [ ] Full type safety with no TypeScript errors
- [ ] Build passes cleanly
- [ ] All pages responsive (mobile/tablet/desktop)
- [ ] Loading states implemented
- [ ] Error handling in place
- [ ] Navigation working between all pages
- [ ] Data fetching optimized (proper stale times)
- [ ] Manual testing complete

### Phase 3 Readiness
- Phase 2 complete and validated
- Phase 3 design reviewed
- Any Phase 2 learnings documented
- Ready to replicate patterns for Club section

---

## Technical Notes

### Key Patterns Established
1. **Page Structure:** Server component (metadata) + Client component (data fetching)
2. **Data Fetching:** Service abstraction → React Query hooks → Component usage
3. **Reusable Components:** Card components with flexible props
4. **Type Safety:** Import types from `@/types/api-v1` and service files
5. **Responsive Grids:** `grid gap-6 sm:grid-cols-2 lg:grid-cols-3`
6. **Loading States:** Skeleton components matching final layout

### Common Pitfalls to Avoid
- ❌ Don't use `export const metadata` with `'use client'` - separate into two files
- ❌ Don't mix local type definitions with imported API types - always import
- ❌ Don't use `any` type - use proper types or `unknown` with type guards
- ❌ Don't fetch data in `useEffect` - always use React Query hooks
- ❌ Don't forget `limit` parameter validation in API filters
- ❌ Don't use `bg-muted` - use explicit color classes
- ❌ Don't use margin/padding for container spacing - use `space-y-*` or `gap-*`

---

## Dependencies & Prerequisites

### External Dependencies (Already Installed)
- ✅ Next.js 16 (App Router)
- ✅ React 19
- ✅ TypeScript (strict mode)
- ✅ TanStack Query (React Query)
- ✅ Tailwind CSS v4
- ✅ shadcn/ui components
- ✅ date-fns (for date formatting)
- ✅ Lucide React (icons)

### Internal Dependencies (Already Implemented)
- ✅ Phase 1 APIs, services, hooks
- ✅ Existing UI components (Button, Card, Badge, Skeleton, etc.)
- ✅ Layout components (PageWrapper, Navbar)
- ✅ Database schema with sessions, programs, activities
- ✅ Authentication system (Privy + getCurrentUser helper)

---

## Contact & Support

**Implementation Lead:** Claude Code Agent
**Design Reference:** [docs/design/](../docs/design/)
**API Reference:** [docs/api-reference.md](../docs/api-reference.md)
**Project Board:** TodoWrite tracking in active sessions
