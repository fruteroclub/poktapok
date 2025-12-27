# E2-T5: Enhanced Profile Page with Portfolio

**Epic:** Epic 2 - Portfolio Showcase
**Story Points:** 3
**Status:** 🔴 Not Started
**Assignee:** Frontend Developer
**Dependencies:** E2-T2 (Projects exist), E2-T4 (Skills exist)

---

## Objective

Display portfolio projects and skills on user profile pages with filtering and manual ordering.

---

## Acceptance Criteria

### Portfolio Section
- [ ] Portfolio section below bio on profile page
- [ ] Project count displayed: "5 Projects"
- [ ] Grid layout: 3 columns desktop, 2 tablet, 1 mobile
- [ ] Show first 6 projects, "Load More" if >6
- [ ] Featured project pinned at top (if user selected one)
- [ ] Manual reordering (owner only, drag-and-drop)

### Project Cards
- [ ] Logo/thumbnail image
- [ ] Project title
- [ ] Description snippet (first 100 chars)
- [ ] Tech stack badges (max 3 skills shown, "+2 more")
- [ ] Project type badge (hackathon, personal, etc.)
- [ ] Project status indicator (WIP, Completed)
- [ ] Action links: GitHub, Live Demo, Video
- [ ] Hover effects and transitions

### Filtering & Sorting
- [ ] Filter by tech stack (multi-select)
- [ ] Filter by project type
- [ ] Filter by status (WIP, Completed)
- [ ] Sort: Newest First (default) OR Manual Order (owner-set)
- [ ] Clear filters button

### Skills Section
- [ ] Skills section below portfolio
- [ ] Top 5 skills displayed as badges
- [ ] Skills sorted by project count (descending)
- [ ] Category color-coding: language (blue), framework (green), tool (yellow), blockchain (purple)
- [ ] Project count per skill: "React (5 projects)"
- [ ] "View All Skills" modal if >5 skills

### Owner Actions (Profile Owner Only)
- [ ] "Reorder Projects" toggle (enables drag-drop)
- [ ] "Feature This Project" button on cards
- [ ] Save reordering changes to `displayOrder` field
- [ ] Visual feedback during reordering

---

## Wireframe

```
┌────────────────────────────────────────────┐
│ [Avatar] Username                          │
│ Bio text...                                │
│ 📍 Location | 🔗 Links                     │
│                                            │
│ ─────────────────────────────────────────  │
│                                            │
│ 📂 Projects (5)        [Filter ▾]         │
│                                            │
│ ┌──────┐ ┌──────┐ ┌──────┐               │
│ │ Logo │ │ Logo │ │ Logo │               │
│ │──────│ │──────│ │──────│               │
│ │Title │ │Title │ │Title │               │
│ │Desc..│ │Desc..│ │Desc..│               │
│ │[Tag] │ │[Tag] │ │[Tag] │               │
│ │🔗Live│ │🔗Live│ │🔗Live│               │
│ └──────┘ └──────┘ └──────┘               │
│                                            │
│ [Load More Projects]                       │
│                                            │
│ ─────────────────────────────────────────  │
│                                            │
│ 🏷️ Skills                                 │
│ [React (5)] [TypeScript (4)] [Node.js (3)]│
│ [PostgreSQL (2)] [Docker (1)]             │
│ [View All Skills →]                        │
└────────────────────────────────────────────┘
```

---

## Project Card Design

```typescript
<ProjectCard
  logo={project.logoUrl}
  title={project.title}
  description={project.description.slice(0, 100) + '...'}
  skills={project.skills.slice(0, 3)}
  type={project.projectType}
  status={project.projectStatus}
  links={{
    repository: project.repositoryUrl,
    live: project.liveUrl,
    video: project.videoUrl
  }}
  featured={project.featured}
  onFeature={() => toggleFeature(project.id)} // Owner only
/>
```

---

## Filtering Logic

```typescript
const [filters, setFilters] = useState({
  skills: [] as string[],
  types: [] as ProjectType[],
  statuses: [] as ProjectStatus[]
})

const filteredProjects = projects.filter(project => {
  const skillMatch = filters.skills.length === 0 ||
    project.skills.some(s => filters.skills.includes(s.id))

  const typeMatch = filters.types.length === 0 ||
    filters.types.includes(project.projectType)

  const statusMatch = filters.statuses.length === 0 ||
    filters.statuses.includes(project.projectStatus)

  return skillMatch && typeMatch && statusMatch
})
```

---

## Manual Reordering

```typescript
// Use @dnd-kit/core for drag-and-drop
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, arrayMove } from '@dnd-kit/sortable'

function handleDragEnd(event) {
  const { active, over } = event
  if (active.id !== over.id) {
    const oldIndex = projects.findIndex(p => p.id === active.id)
    const newIndex = projects.findIndex(p => p.id === over.id)

    const reordered = arrayMove(projects, oldIndex, newIndex)

    // Save new order to backend
    await updateProjectOrder(reordered.map((p, idx) => ({
      id: p.id,
      displayOrder: idx
    })))
  }
}
```

---

## Skills Display

```typescript
<div className="skills-section">
  <h3>🏷️ Skills</h3>
  <div className="skills-grid">
    {topSkills.map(skill => (
      <SkillBadge
        key={skill.id}
        name={skill.name}
        category={skill.category}
        projectCount={skill.projectCount}
        color={getCategoryColor(skill.category)}
      />
    ))}
  </div>
  {totalSkills > 5 && (
    <button onClick={openSkillsModal}>
      View All Skills ({totalSkills})
    </button>
  )}
</div>
```

---

## Testing Checklist

### Layout & Display
- [ ] Portfolio section displays below bio
- [ ] Project grid responsive (3/2/1 columns)
- [ ] Featured project pinned at top
- [ ] Skills section displays correctly
- [ ] Top 5 skills shown, "View All" if >5

### Filtering
- [ ] Filter by skills works
- [ ] Filter by project type works
- [ ] Filter by status works
- [ ] Multiple filters combine correctly (AND logic)
- [ ] Clear filters resets all

### Sorting & Ordering
- [ ] Default sort: newest first (by publishedAt)
- [ ] Manual order preserved for owner
- [ ] Drag-and-drop reordering works (owner only)
- [ ] Reordering saves to backend

### Permissions
- [ ] Non-owners cannot reorder projects
- [ ] Non-owners cannot feature projects
- [ ] Public users see published projects only
- [ ] Owners see all projects (including drafts) on own profile

---

## Success Criteria

- ✅ Portfolio projects displayed on profile
- ✅ Skills earned through projects shown
- ✅ Filtering by skills/type/status works
- ✅ Manual reordering for owners
- ✅ Featured project functionality
- ✅ Mobile-responsive design

---

**Estimated Time:** 1-2 days
**Complexity:** Medium (UI + drag-drop)
