# E2-T2: Portfolio Builder UI

**Epic:** Epic 2 - Portfolio Showcase
**Story Points:** 5
**Status:** 🟢 Complete
**Started:** December 27, 2024
**Completed:** December 27, 2024
**Assignee:** Frontend Developer
**Dependencies:** E2-T1 (Project API exists) ✅ Complete
**Next Ticket:** E2-T6 (Individual Project View Page) - Essential for portfolio showcase

**Implementation Summary:** [E2-T2-PHASE-1-COMPLETE.md](./E2-T2-PHASE-1-COMPLETE.md)
**Implementation Workflow:** [E2-T2-WORKFLOW.md](./E2-T2-WORKFLOW.md)

---

## Objective

Build user interface for creating, editing, and managing portfolio projects.

---

## User Story

**As a** developer
**I want to** add and edit my portfolio projects through an intuitive UI
**So that** I can showcase my work without technical barriers

---

## Acceptance Criteria

### Project Form ✅ Complete
- [x] Form at `/portfolio/new` (authenticated users only)
- [x] Edit form at `/portfolio/[id]/edit` (owner only)
- [x] All fields from E2-T1 schema except images (handled in E2-T3)
- [x] React Hook Form + Zod validation
- [x] Real-time character counters (title: 100, description: 280)
- [x] Project type selector (personal/bootcamp/hackathon/work-related/freelance/bounty)
- [x] Project status selector (draft/wip/completed/archived)
- [x] URL validation with visual feedback
- [x] Skills multi-select (autocomplete from API)
- [x] "At least one URL" validation with clear messaging

### Project Dashboard ✅ Complete
- [x] Page at `/portfolio` (owner view)
- [x] List all user's projects (including drafts)
- [x] Project cards showing: title, description, status, type, skills
- [x] Edit/Delete actions on each card
- [x] "Add Project" CTA button
- [x] Empty state with helpful guidance
- [x] Draft badge for unpublished projects
- [x] Filter by status (all/draft/wip/completed/archived)
- [x] Filter by type (all/personal/bootcamp/hackathon/work-related/freelance/bounty)

### Actions ✅ Complete
- [x] Save as draft functionality (status defaults to 'draft')
- [x] Publish project (status: wip or completed)
- [x] Delete confirmation modal with warning (AlertDialog)
- [x] Success/error toasts (Sonner)
- [ ] Preview mode before publishing (deferred to E2-T6)

### Validation & UX ✅ Complete
- [x] Client-side validation matches API schema (Zod)
- [x] Clear error messages for each field
- [x] Loading states during API calls (React Query)
- [x] Success/error toasts with clear messaging
- [ ] Optimistic UI updates (deferred for stability)
- [ ] Unsaved changes warning (deferred for MVP)

---

## Wireframe

```
┌─────────────────────────────────────────┐
│  Add Project                            │
├─────────────────────────────────────────┤
│                                         │
│  Project Title *          [100/100]    │
│  ┌───────────────────────────────────┐ │
│  │                                   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Description *            [280/280]    │
│  ┌───────────────────────────────────┐ │
│  │                                   │ │
│  │                                   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Project Type *                        │
│  ○ Personal  ○ Bootcamp  ○ Hackathon  │
│  ○ Work-related  ○ Freelance          │
│                                         │
│  Status *                              │
│  ○ Draft  ○ Work in Progress           │
│  ○ Completed                           │
│                                         │
│  📎 Links (at least one required)     │
│  Repository URL  ┌──────────────────┐ │
│                  │                  │ │
│                  └──────────────────┘ │
│                                         │
│  Live Demo URL   ┌──────────────────┐ │
│                  │                  │ │
│                  └──────────────────┘ │
│                                         │
│  Video URL       ┌──────────────────┐ │
│                  │                  │ │
│                  └──────────────────┘ │
│                                         │
│  🏷️ Skills Used *                    │
│  [React] [TypeScript] [+ Add Skill]  │
│                                         │
│  [Save as Draft]  [Preview]  [Publish]│
└─────────────────────────────────────────┘
```

---

## Character Limits (Restrictive by Design)

| Field | Min | Max | Rationale |
|-------|-----|-----|-----------|
| Title | 5 | 100 | Clear, concise project name |
| Description | 20 | 280 | Tweet-length summary, forces clarity |

**Heavy Content Goes In:**
- Repository README (detailed docs)
- Video demo (visual explanation)
- Live site (interactive experience)

---

## Field Requirements

### Always Required:
- Title (5-100 chars)
- Description (20-280 chars)
- Project Type
- Status (draft/wip/completed)
- At least one URL (repository OR video OR live demo)
- At least one skill

### Optional (for WIP projects):
- Logo URL (added in E2-T3)
- Image URLs (added in E2-T3)
- Live Demo URL (if not ready yet)
- Video URL (if not recorded yet)

---

## Technical Implementation

### File Structure
```
src/
├── app/
│   ├── projects/
│   │   ├── new/
│   │   │   └── page.tsx         # Create project form
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx     # Edit project form
│   └── dashboard/
│       └── projects/
│           └── page.tsx         # Project dashboard
├── components/
│   └── projects/
│       ├── project-form.tsx     # Main form component
│       ├── project-card.tsx     # Card for dashboard
│       ├── project-preview.tsx  # Preview modal
│       ├── delete-modal.tsx     # Delete confirmation
│       └── url-input.tsx        # URL field with validation
├── lib/
│   └── validators/
│       └── project.ts           # Zod schemas (from E2-T1)
└── hooks/
    ├── use-projects.ts          # TanStack Query hooks
    └── use-unsaved-changes.ts   # Warn before navigation
```

### Form Component

```typescript
// src/components/projects/project-form.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createProjectSchema } from '@/lib/validators/project'

export function ProjectForm({ project, mode }: Props) {
  const form = useForm({
    resolver: zodResolver(createProjectSchema),
    defaultValues: project || {
      projectType: 'personal',
      projectStatus: 'draft',
      skillIds: []
    }
  })

  // Validation: At least one URL
  const hasUrl = form.watch(['repositoryUrl', 'videoUrl', 'liveUrl'])
    .some(url => url && url.length > 0)

  return (
    <Form {...form}>
      {/* Title with character counter */}
      {/* Description textarea with counter */}
      {/* Project type radio group */}
      {/* Status selector */}
      {/* URL inputs with validation */}
      {/* Skills multi-select */}
      {/* Actions: Save Draft / Publish */}
    </Form>
  )
}
```

---

## Service Layer

```typescript
// src/services/projects.ts
import { apiFetch } from '@/lib/api/fetch'

export async function createProject(data: CreateProjectInput) {
  return apiFetch<CreateProjectResponse>('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
}

export async function updateProject(id: string, data: UpdateProjectInput) {
  return apiFetch<UpdateProjectResponse>(`/api/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
}

export async function deleteProject(id: string) {
  return apiFetch<DeleteProjectResponse>(`/api/projects/${id}`, {
    method: 'DELETE'
  })
}

export async function fetchUserProjects(userId?: string) {
  const query = userId ? `?userId=${userId}` : ''
  return apiFetch<FetchProjectsResponse>(`/api/projects${query}`)
}
```

---

## Hooks

```typescript
// src/hooks/use-projects.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as projectService from '@/services/projects'

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: projectService.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project created successfully!')
    },
    onError: (error: ApiError) => {
      toast.error(error.message)
    }
  })
}

export function useUserProjects(userId?: string) {
  return useQuery({
    queryKey: ['projects', userId],
    queryFn: () => projectService.fetchUserProjects(userId),
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}
```

---

## Validation Messages

```typescript
// Clear, actionable error messages
const validationMessages = {
  title: {
    min: "Title must be at least 5 characters",
    max: "Title cannot exceed 100 characters"
  },
  description: {
    min: "Description must be at least 20 characters (be specific!)",
    max: "Description cannot exceed 280 characters (keep it concise!)"
  },
  urls: {
    none: "Please provide at least one URL: repository, video, or live demo",
    invalid: "Please enter a valid URL starting with http:// or https://"
  },
  skills: {
    none: "Please add at least one skill you used or learned in this project"
  }
}
```

---

## Testing Checklist

### Form Validation
- [ ] Title: min 5 chars, max 100 chars
- [ ] Description: min 20 chars, max 280 chars
- [ ] At least one URL required (repository, video, or live demo)
- [ ] URL format validation (http:// or https://)
- [ ] At least one skill required
- [ ] Project type required
- [ ] Status required

### User Flows
- [ ] Create new project → saves as draft
- [ ] Edit existing project → updates successfully
- [ ] Delete project → confirmation modal → soft delete
- [ ] Publish draft → changes status to wip/completed
- [ ] Navigate away with unsaved changes → warning modal

### UI/UX
- [ ] Character counters update in real-time
- [ ] Error messages clear and actionable
- [ ] Loading states during API calls
- [ ] Success/error toasts
- [ ] Mobile responsive
- [ ] Keyboard navigation works

---

## Success Criteria ✅ All Met

- ✅ Users can create projects with all required fields
- ✅ Draft projects can be saved and edited later
- ✅ Form validation prevents invalid submissions
- ✅ Character limits enforced client and server-side
- ✅ At least one URL validation works correctly
- ✅ Skills can be added and linked to projects
- ✅ Project listing with filters (status, type)
- ✅ Edit/delete functionality with proper authorization
- ✅ Production build successful (zero errors)

---

## Notes

- Logo and image uploads handled in E2-T3 (next ticket)
- Skills must come from projects, not self-reported (enforced in E2-T4)
- Draft projects only visible to owner
- Mobile-first design approach

---

**Estimated Time:** 2-3 days
**Complexity:** Medium (forms + validation)
**Priority:** High (core feature)
