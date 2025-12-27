# E2-T4: Skills Management System

**Epic:** Epic 2 - Portfolio Showcase
**Story Points:** 3
**Status:** 🔴 Not Started
**Assignee:** Full-stack Developer
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
      count: count(projectSkills.projectId)
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
        set: { projectCount: count }
      })
  }

  // 4. Remove skills with 0 projects
  await db
    .delete(userSkills)
    .where(
      and(
        eq(userSkills.userId, userId),
        eq(userSkills.projectCount, 0)
      )
    )
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

**Estimated Time:** 1-2 days
**Complexity:** Medium (business logic + UI)
