# Epic 2: Portfolio Showcase - Ticket Status

**Epic Goal:** Enable developers to showcase their work through projects, demonstrating skills with real evidence.

**Duration:** 2-3 weeks
**Story Points:** 21 (MVP) | 24 (with GitHub integration)
**Dependencies:** Epic 1 (Talent Directory) complete

---

## Success Metrics

- [ ] 60% of users add ≥1 project within first week
- [ ] Average 3 projects per portfolio
- [ ] 80% of projects include repository or video URL
- [ ] Skills earned through projects (not self-reported)
- [ ] Projects showcase top 5 skills per user

---

## Core Principles

### 1. Skills Must Be Demonstrated
- Skills earned through projects, not self-reported
- Each skill must be used in ≥1 project
- Profile shows top 5 skills by project count
- **Rationale:** Credibility through evidence, not claims

### 2. Projects Enable Before Bounties
- Users can showcase existing work (bootcamp, personal, hackathon)
- Builds credibility before bounty marketplace (Epic 3)
- Bounties will later link to projects as submissions

### 3. Restrictive but Focused
- Short descriptions (280 chars max, like Twitter)
- Heavy content lives in: repository README, video demo, live site
- Forces clarity and conciseness

---

## Ticket Status Overview

| Ticket | Title | Points | Status | Priority | Notes |
|--------|-------|--------|--------|----------|-------|
| E2-T1 | Database Schema & Project CRUD API | 5 | 🔴 Not Started | High | Blocks all |
| E2-T2 | Portfolio Builder UI | 5 | 🔴 Not Started | High | Core feature |
| E2-T3 | Image Upload System | 5 | 🔴 Not Started | High | Visual proof |
| E2-T4 | Skills Management System | 3 | 🔴 Not Started | High | Project-validated |
| E2-T5 | Enhanced Profile Page | 3 | 🔴 Not Started | High | Showcase |
| E2-T6 | GitHub Integration | 3 | 🔴 Not Started | Medium | Nice-to-have |

**Status Legend:**
- 🔴 Not Started
- 🟡 In Progress
- 🟢 Completed
- ⏭️ Deferred

---

## Implementation Strategy

### Phase 1: Backend Foundation (Days 1-3)
**E2-T1: Database Schema & Project CRUD API**
- Create `projects`, `skills`, `user_skills`, `project_skills` tables
- REST API for project CRUD
- Validation with Zod schemas
- Authorization middleware

**Key Decision:** Skills earned through projects, enforced at database level

---

### Phase 2: Frontend Core (Days 4-6)
**E2-T2: Portfolio Builder UI**
- Project creation/edit form
- Character limits: title (100), description (280)
- At least one URL required (repository, video, or live demo)
- Draft and publish modes

**Key Decision:** Restrictive character limits force clarity

---

### Phase 3: Visual Assets (Days 7-9)
**E2-T3: Image Upload System**
- Logo upload (project identifier)
- Additional images (up to 4: screenshots, diagrams)
- Vercel Blob Storage integration (consistent with avatars)
- Client-side compression

**Key Decision:** Use existing Vercel Blob infrastructure

---

### Phase 4: Skills System (Days 10-11)
**E2-T4: Skills Management System**
- Project-validated skills only
- Auto-sync user skills from projects
- Top 5 skills displayed on profile
- Directory filtering by skills

**Key Decision:** No self-reporting, skills come from projects

---

### Phase 5: Profile Enhancement (Days 12-13)
**E2-T5: Enhanced Profile Page**
- Portfolio section with project cards
- Skills section with badges
- Filtering by tech stack/type/status
- Manual reordering for owners

**Key Decision:** Showcase newest first by default, manual order for owners

---

### Phase 6: GitHub Integration (Optional, Days 14-15)
**E2-T6: GitHub Repository Integration**
- Auto-fetch repo data from GitHub API
- Extract title, description, topics
- Suggest skills from repo topics
- **Can defer to post-MVP if time-constrained**

**Key Decision:** One-time fetch, not periodic updates

---

## Work Streams (Parallelization)

### Stream A: Backend (E2-T1)
- Database schema design
- Migration with `bun run db:push`
- API endpoints implementation
- Validation and authorization

### Stream B: Frontend (E2-T2, E2-T3)
**Dependencies:** Requires E2-T1 API
- Project form (E2-T2)
- Image uploads (E2-T3)
- Can work in parallel after E2-T1

### Stream C: Skills & Profile (E2-T4, E2-T5)
**Dependencies:** Requires E2-T1, E2-T2
- Skills system (E2-T4)
- Profile enhancement (E2-T5)
- Can work in parallel

---

## Database Schema Summary

### `projects` table
```typescript
{
  id, userId, title (100), description (280),
  liveUrl, repositoryUrl, videoUrl, logoUrl,
  imageUrls (array, max 5),
  projectType (personal|bootcamp|hackathon|work-related|freelance|bounty),
  projectStatus (draft|wip|completed|archived),
  displayOrder, featured, viewCount,
  createdAt, updatedAt, publishedAt, deletedAt, metadata
}
```

### `skills` table (Preset Library)
```typescript
{
  id, name (unique), slug, category (language|framework|tool|blockchain|other),
  description, iconUrl, usageCount, createdAt, updatedAt
}
```

### `user_skills` table (Auto-computed from projects)
```typescript
{
  id, userId, skillId, proficiencyLevel, projectCount, createdAt
  UNIQUE(userId, skillId)
}
```

### `project_skills` table
```typescript
{
  projectId, skillId, createdAt
  PRIMARY KEY (projectId, skillId)
}
```

---

## Key Design Decisions

### 1. Project-Bounty Relationship
**Decision:** Separate tables
- `projects` = user-created portfolio items
- `bounties` (Epic 3) = platform challenges
- `bounty_submissions` can reference `projects`

### 2. Image Storage
**Decision:** Vercel Blob Storage
- Already used for avatars (consistency)
- 5MB max per image, 5 images total per project
- Client-side compression for performance

### 3. Skills System
**Decision:** Project-validated only
- Skills auto-added when linked to projects
- Skills auto-removed when unlinked from all projects
- `projectCount` tracks usage
- Top 5 skills showcased on profile

### 4. Character Limits
**Decision:** Restrictive by design
- Title: 5-100 chars (concise project name)
- Description: 20-280 chars (Twitter-length summary)
- Heavy content in: repository README, video, live site

### 5. GitHub Integration
**Decision:** Manual for MVP, auto-fetch as enhancement
- E2-T2: Manual description entry (full control)
- E2-T6: GitHub auto-fetch (optional, can defer)

### 6. Analytics
**Decision:** Defer to Epic 3 or later
- Profile/project view counts = ego metrics (not critical)
- Focus: Core showcase features first
- Add analytics after validation

---

## User Journey

### New User (No Bounties Yet)
```
1. Complete Epic 1 (profile with bio, location, learning tracks)
2. Add first project:
   - Title: "DeFi Yield Aggregator"
   - Description: "Built a yield farming optimizer..."
   - Repository: GitHub link
   - Skills: Solidity, React, Ethers.js
3. Skills auto-added to profile
4. Project visible on profile (E2-T5)
5. Add 2-3 more projects
6. Profile showcases top 5 skills
```

### User Journey with Bounties (Future, Epic 3+)
```
1. Complete bounty challenge
2. Submit project as bounty submission
3. Bounty automatically linked to project
4. Project tagged as "bounty" type
5. Bounty earnings tracked separately
```

---

## Testing Strategy

### E2-T1 (Backend)
- Unit tests for API endpoints
- Validation tests (Zod schemas)
- Authorization tests (owner-only edits)
- Edge cases (missing URLs, invalid formats)

### E2-T2 (Frontend Forms)
- Form validation (character limits)
- At least one URL validation
- Draft/publish functionality
- Unsaved changes warning

### E2-T3 (Images)
- Upload validation (size, format)
- Max images limit (5 total)
- Image compression
- Storage cleanup

### E2-T4 (Skills)
- Skill auto-sync from projects
- Skill removal when unlinked from all projects
- projectCount accuracy
- Top 5 skills sorting

### E2-T5 (Profile)
- Portfolio display
- Filtering by skills/type/status
- Manual reordering (owner only)
- Responsive design

---

## Deferred Features

### Analytics (Epic 2.5 or 3)
- Profile view count
- Project view count
- Skills distribution (platform-wide)
- **Rationale:** Ego metrics, not critical for showcase

### Peer Endorsements (Epic 3+)
- Skill endorsements from other users
- **Rationale:** Requires trust network, relationships
- **Current:** Self-validated through projects is sufficient

---

## Definition of Done (All Tickets)

- [ ] All acceptance criteria met
- [ ] Unit tests passing
- [ ] Manual testing completed
- [ ] Mobile responsive
- [ ] API response pattern followed
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Accessibility verified

---

## Risks & Mitigations

### Risk 1: Skills System Complexity
**Risk:** Auto-syncing user skills from projects could have edge cases
**Mitigation:** Comprehensive unit tests, clear validation logic

### Risk 2: Image Upload Performance
**Risk:** Large images slow down upload experience
**Mitigation:** Client-side compression, 5MB limit enforced

### Risk 3: GitHub API Rate Limits
**Risk:** E2-T6 could hit rate limits with many users
**Mitigation:** Authenticated API (5000 req/hr), cache results, optional feature

### Risk 4: Character Limit Pushback
**Risk:** Users might want longer descriptions
**Mitigation:** Force clarity, direct users to README/video for details

---

## Current Status

**Epic State:** Not Started
**Next Action:** Begin E2-T1 (Database Schema & API)
**Blockers:** None (Epic 1 complete)

---

## Notes

- **MVP Scope:** E2-T1 through E2-T5 (21 story points)
- **Optional:** E2-T6 GitHub integration (defer if time-constrained)
- **Database Changes:** Use `bun run db:push` (no migrations for MVP)
- **After Tickets:** Create wireframes for user journey validation

---

**Last Updated:** 2025-12-26
**Next Review:** After E2-T1 completion
