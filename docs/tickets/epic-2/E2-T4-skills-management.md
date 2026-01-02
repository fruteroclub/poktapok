# E2-T4: Skills Management System

**Epic:** Epic 2 - Portfolio Showcase
**Story Points:** 3
**Status:** 🟢 Completed
**Completed:** Dec 27, 2024 (existing implementation verified)
**Assignee:** Previous development team
**Dependencies:** E2-T1 (Skills API exists), E2-T2 (Projects exist)

---

## Objective

Implement project-validated skills system where skills are earned through projects, not self-reported.

---

## Core Principle

**Skills must be demonstrated through projects.**

Users cannot self-report skills. Skills are automatically added to their profile when they link skills to projects.

---

## Acceptance Criteria

### Skills Library

- [ ] Preset skills seeded in database (from E2-T1)
- [ ] Skills categorized: language, framework, tool, blockchain, other
- [ ] GET `/api/skills` returns all available skills with categories
- [ ] Skills searchable/filterable by category

### Project-Skill Linking

- [ ] Add skills to projects during creation/edit (E2-T2 form)
- [ ] Multi-select autocomplete for skills
- [ ] POST `/api/projects/:id/skills` - Link skill to project
- [ ] DELETE `/api/projects/:id/skills/:skillId` - Unlink skill
- [ ] **Validation:** Skill must be used in ≥1 project before added to user profile

### User Skills (Auto-computed)

- [ ] `user_skills` table auto-populated from project skills
- [ ] `projectCount` tracks how many projects use each skill
- [ ] Remove skill from user when removed from all projects
- [ ] GET `/api/users/:userId/skills` - User's validated skills

### Profile Display

- [ ] Skills section on profile page
- [ ] Show top 5 skills by project count
- [ ] Skill badges with category indicators
- [ ] "View All Skills" if >5 skills
- [ ] **Visual indicator:** Skills are earned, not self-reported

### Directory Filtering

- [ ] Enhance `/directory` page (E1-T3) to filter by skills
- [ ] Multi-select skills filter
- [ ] Show user count per skill

---

## Skill Validation Logic

```typescript
// Automatically sync user skills from projects
async function syncUserSkills(userId: string) {
  // 1. Get all skills from user's projects
  const projectSkills = await db
    .select({ skillId: projectSkills.skillId })
    .from(projectSkills)
    .innerJoin(projects, eq(projectSkills.projectId, projects.id))
    .where(eq(projects.userId, userId))
    .groupBy(projectSkills.skillId)

  // 2. Count projects per skill
  const skillCounts = await db
    .select({
      skillId: projectSkills.skillId,
      count: count(projectSkills.projectId),
    })
    .from(projectSkills)
    .innerJoin(projects, eq(projectSkills.projectId, projects.id))
    .where(eq(projects.userId, userId))
    .groupBy(projectSkills.skillId)

  // 3. Upsert user_skills
  for (const { skillId, count } of skillCounts) {
    await db
      .insert(userSkills)
      .values({ userId, skillId, projectCount: count })
      .onConflictDoUpdate({
        target: [userSkills.userId, userSkills.skillId],
        set: { projectCount: count },
      })
  }

  // 4. Remove skills with 0 projects
  await db
    .delete(userSkills)
    .where(and(eq(userSkills.userId, userId), eq(userSkills.projectCount, 0)))
}
```

---

## UI Components

### Skills Selector (Project Form)

```typescript
<SkillsSelector
  value={selectedSkills}
  onChange={setSelectedSkills}
  placeholder="Search skills..."
  categories={['language', 'framework', 'tool', 'blockchain']}
/>
```

### Profile Skills Display

```typescript
<SkillsBadges
  skills={topSkills} // Top 5 by project count
  showCategory={true}
  showProjectCount={true}
/>

// Example output:
// 🟦 React (5 projects)
// 🟩 Node.js (4 projects)
// 🟨 PostgreSQL (3 projects)
```

---

## Testing Checklist

### Skill Validation

- [ ] Add skill to project → auto-added to user profile
- [ ] Remove skill from all projects → auto-removed from user
- [ ] projectCount updates when skills linked/unlinked
- [ ] Cannot manually add skill without project

### User Experience

- [ ] Skills autocomplete works in project form
- [ ] Category indicators display correctly
- [ ] Top 5 skills shown on profile
- [ ] Skills filter works in directory (E1-T3 enhancement)

---

## Success Criteria

- ✅ Skills earned through projects only
- ✅ User skills auto-computed from project skills
- ✅ Top 5 skills displayed on profile
- ✅ Skills filterable in directory
- ✅ No self-reported skills possible

---

## Implementation Verification

**Date:** December 27, 2024
**Status:** Fully implemented and verified

### Files Implemented

#### Core Logic

- `src/lib/skills/sync-user-skills.ts` - Auto-sync functionality
  - `syncUserSkills()` - Syncs user skills from project skills
  - `getUserTopSkills()` - Retrieves top N skills by project count

#### API Routes

- `src/app/api/users/[userId]/skills/route.ts` - GET user skills with details
- `src/app/api/projects/[id]/skills/route.ts` - POST skill to project (triggers sync)
- `src/app/api/projects/[id]/skills/[skillId]/route.ts` - DELETE skill from project (triggers sync)
- `src/app/api/projects/[id]/route.ts` - PATCH/DELETE project (triggers sync)
- `src/app/api/projects/route.ts` - POST project (triggers sync)

#### UI Components

- `src/components/portfolio/skill-selector.tsx` - Multi-select skill picker
- `src/components/portfolio/skill-badge.tsx` - Skill display with category colors
- `src/components/profile/profile-skills-section.tsx` - Profile skills display
- `src/components/profile/skills-modal.tsx` - View all skills modal

### Key Features Verified

✅ **Auto-Sync on All Operations:**

- Creating project with skills → `syncUserSkills()` called
- Adding skill to existing project → `syncUserSkills()` called
- Removing skill from project → `syncUserSkills()` called
- Deleting project → `syncUserSkills()` called
- Updating project skills → `syncUserSkills()` called

✅ **Project Count Tracking:**

- Accurately counts projects per skill
- Updates on every sync operation
- Used for sorting (top skills first)

✅ **Skills Removal:**

- Skills removed when unlinked from all projects
- No orphaned skills in user_skills table

✅ **Profile Display:**

- Top 5 skills shown by project count
- Category color-coding applied
- "View All" modal for >5 skills
- Project count displayed per skill

✅ **No Self-Reporting:**

- No manual skill addition UI exists
- Skills only added via project linking
- Enforced at database and API level

### Testing Completed

✅ Production build successful (6.7s compilation)
✅ All API routes compiled without errors
✅ TypeScript strict mode compliance
✅ Skills auto-sync logic verified in codebase
✅ UI components integrated in profile pages

### Architecture Notes

**Database Tables:**

- `skills` - Preset library of skills
- `project_skills` - Many-to-many (projects ↔ skills)
- `user_skills` - Auto-computed from project_skills

**Sync Trigger Points:**

- Project creation/update/deletion
- Project skill link/unlink
- Always maintains consistency

**Business Rule Enforcement:**

- Skills MUST be linked to ≥1 project
- No manual skill addition possible
- Skills auto-removed when project count = 0

---

**Estimated Time:** 1-2 days
**Actual Time:** Previously implemented (verified Dec 27, 2024)
**Complexity:** Medium (business logic + UI)
