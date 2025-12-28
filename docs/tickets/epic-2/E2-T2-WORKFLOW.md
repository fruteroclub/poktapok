# E2-T2 Implementation Workflow: Portfolio Builder UI

**Status:** 🟡 In Progress
**Strategy:** Systematic (Component-by-Component)
**Estimated Time:** 2-3 days
**Complexity:** Medium

---

## 📋 Prerequisites Check

- ✅ E2-T1 complete (Database & API ready)
- ✅ API types exported in `src/types/api-v1.ts`
- ✅ Validators available in `src/lib/validators/project.ts`
- ✅ Skills seeded in database (43 skills)
- ✅ Privy authentication working
- ✅ React Hook Form + Zod already in dependencies

---

## 🎯 Implementation Strategy

### Approach: Bottom-Up Component Architecture

1. **Services Layer** → API communication
2. **Hooks Layer** → TanStack Query + state management
3. **UI Components** → Reusable form elements
4. **Form Component** → Main project form
5. **Pages** → Routes and layouts
6. **Integration** → Connect all pieces

**Rationale:** Build foundational layers first, then compose into features.

---

## 📦 Phase 1: Services & Hooks (Foundation)

### Task 1.1: Create Project Services
**File:** `src/services/projects.ts`

```typescript
// API service functions for projects
- createProject(data): Promise<CreateProjectResponse>
- updateProject(id, data): Promise<UpdateProjectResponse>
- deleteProject(id): Promise<DeleteProjectResponse>
- fetchProject(id): Promise<GetProjectResponse>
- fetchUserProjects(userId?, filters?): Promise<ListProjectsResponse>
```

**Dependencies:**
- `src/lib/api/fetch.ts` (existing)
- `src/types/api-v1.ts` (created in E2-T1)

**Validation:**
- Uses `apiFetch` wrapper for automatic error handling
- Returns unwrapped data (not envelope)
- Proper TypeScript types for all functions

---

### Task 1.2: Create Skills Services
**File:** `src/services/skills.ts`

```typescript
// API service functions for skills
- fetchSkills(filters?): Promise<ListSkillsResponse>
- searchSkills(query): Promise<ListSkillsResponse>
```

**Dependencies:**
- `src/lib/api/fetch.ts`
- `src/types/api-v1.ts`

---

### Task 1.3: Create TanStack Query Hooks
**File:** `src/hooks/use-projects.ts`

```typescript
// Query hooks
- useUserProjects(userId?) → List user's projects
- useProject(id) → Fetch single project
- useSkills(filters?) → Fetch skills for multi-select

// Mutation hooks
- useCreateProject() → Create new project
- useUpdateProject() → Update existing project
- useDeleteProject() → Soft delete project

// Features:
- Optimistic UI updates
- Cache invalidation
- Error handling with toast notifications
- Loading states
```

**Dependencies:**
- `@tanstack/react-query`
- `src/services/projects.ts`
- `src/services/skills.ts`
- `sonner` (for toasts)

**Validation:**
- Test queries return proper data structure
- Test mutations invalidate cache correctly
- Test error handling shows user-friendly messages

---

## 🎨 Phase 2: UI Components (Building Blocks)

### Task 2.1: URL Input Component
**File:** `src/components/projects/url-input.tsx`

**Features:**
- URL format validation (visual feedback)
- Label + optional indicator
- Error message display
- Placeholder with examples

**Props:**
```typescript
{
  label: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
}
```

---

### Task 2.2: Character Counter Component
**File:** `src/components/projects/character-counter.tsx`

**Features:**
- Real-time character count
- Color coding (green → yellow → red)
- Format: `{current}/{max}`

**Props:**
```typescript
{
  current: number
  max: number
  warning?: number  // Show yellow at this threshold
}
```

---

### Task 2.3: Skills Multi-Select Component
**File:** `src/components/projects/skills-select.tsx`

**Features:**
- Autocomplete search (debounced)
- Multi-select with tags
- Category grouping (language, framework, tool, blockchain, other)
- Max 10 skills validation
- Badge display with remove option

**Props:**
```typescript
{
  value: string[]  // Array of skill IDs
  onChange: (skillIds: string[]) => void
  error?: string
}
```

**Dependencies:**
- `useSkills()` hook
- `@radix-ui/react-select` or custom combobox
- Debounce search (300ms)

---

### Task 2.4: Project Type Selector
**File:** `src/components/projects/project-type-selector.tsx`

**Features:**
- Radio group with 6 options
- Icons for each type
- Responsive layout (2x3 grid desktop, 1 column mobile)

**Types:**
- Personal
- Bootcamp
- Hackathon
- Work-related
- Freelance
- Bounty

**Props:**
```typescript
{
  value: ProjectType
  onChange: (type: ProjectType) => void
  error?: string
}
```

---

### Task 2.5: Project Status Selector
**File:** `src/components/projects/project-status-selector.tsx`

**Features:**
- Radio group with 3 options (draft excluded from selector)
- Status badges with colors
- Help text explaining each status

**Statuses:**
- Work in Progress (wip)
- Completed
- Archived

**Props:**
```typescript
{
  value: ProjectStatus
  onChange: (status: ProjectStatus) => void
}
```

---

## 📝 Phase 3: Main Form Component

### Task 3.1: Project Form Component
**File:** `src/components/projects/project-form.tsx`

**Features:**
- React Hook Form + Zod validation
- All fields from schema
- Real-time validation
- Character counters
- "At least one URL" validation
- Unsaved changes warning
- Draft vs Publish modes

**Form Fields:**
1. Title (5-100 chars) + counter
2. Description (20-280 chars) + counter + textarea
3. Project Type (radio group)
4. Status (radio group, default: draft)
5. Repository URL (optional, with validation)
6. Live Demo URL (optional, with validation)
7. Video URL (optional, with validation)
8. Skills (multi-select, min 1, max 10)

**Actions:**
- Save as Draft (status: draft)
- Publish (status: wip or completed)
- Cancel (navigate back with warning)

**Validation Logic:**
```typescript
// At least one URL required
const hasUrl = repositoryUrl || videoUrl || liveUrl
if (!hasUrl) {
  error = "Please provide at least one URL"
}

// Character limits
title: min 5, max 100
description: min 20, max 280

// Skills
min: 1, max: 10
```

**Props:**
```typescript
{
  project?: ProjectWithSkills  // For edit mode
  mode: 'create' | 'edit'
  onSuccess?: () => void
  onCancel?: () => void
}
```

---

### Task 3.2: Delete Confirmation Modal
**File:** `src/components/projects/delete-confirmation-modal.tsx`

**Features:**
- Warning message
- Project title display
- Confirm/Cancel buttons
- Loading state during deletion

**Props:**
```typescript
{
  project: ProjectWithSkills
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
}
```

---

### Task 3.3: Project Preview Modal
**File:** `src/components/projects/project-preview-modal.tsx`

**Features:**
- Show how project will appear on profile
- All fields rendered (title, description, type, status, URLs, skills)
- Close button
- "Publish" button (if in draft mode)

**Props:**
```typescript
{
  project: Partial<ProjectWithSkills>
  open: boolean
  onOpenChange: (open: boolean) => void
  onPublish?: () => void
}
```

---

## 📄 Phase 4: Pages (Routes)

### Task 4.1: Create Project Page
**File:** `src/app/projects/new/page.tsx`

**Features:**
- Protected route (requires authentication)
- Page title: "Add New Project"
- Breadcrumbs: Home → Dashboard → New Project
- ProjectForm in "create" mode
- Success → Redirect to `/dashboard/projects`

**Layout:**
```typescript
<ProtectedRoute>
  <PageWrapper>
    <Breadcrumbs />
    <h1>Add New Project</h1>
    <ProjectForm mode="create" onSuccess={redirectToDashboard} />
  </PageWrapper>
</ProtectedRoute>
```

---

### Task 4.2: Edit Project Page
**File:** `src/app/projects/[id]/edit/page.tsx`

**Features:**
- Protected route + ownership validation
- Page title: "Edit Project"
- Breadcrumbs: Home → Dashboard → Edit
- Fetch project data
- ProjectForm in "edit" mode with prefilled data
- Success → Redirect to `/dashboard/projects`

**Authorization:**
```typescript
// Fetch project
const { data: project } = useProject(id)

// Check ownership
if (project.userId !== currentUser.id) {
  redirect('/dashboard/projects')
}
```

---

### Task 4.3: Project Dashboard Page
**File:** `src/app/dashboard/projects/page.tsx`

**Features:**
- Protected route (requires authentication)
- Page title: "My Projects"
- Grid layout (3 columns desktop, 2 tablet, 1 mobile)
- Project cards with actions
- "Add Project" CTA button
- Empty state with helpful guidance
- Filter by status (all, draft, published)

**Project Card Features:**
- Logo (placeholder if not set)
- Title + description (truncated)
- Status badge
- Type badge
- Skills (first 3, "+ N more")
- View count
- Edit/Delete actions
- Draft indicator

**Empty State:**
```
📝 No Projects Yet
Start building your portfolio by adding your first project.
Projects help you showcase your skills and experience.

[Add Your First Project]
```

---

## 🔌 Phase 5: Integration & Polish

### Task 5.1: Unsaved Changes Hook
**File:** `src/hooks/use-unsaved-changes.ts`

**Features:**
- Detect form modifications
- Warning modal before navigation
- Browser beforeunload event
- Bypass on successful save

**Usage:**
```typescript
const { hasUnsavedChanges, setHasUnsavedChanges } = useUnsavedChanges()

// In form
useEffect(() => {
  setHasUnsavedChanges(formState.isDirty)
}, [formState.isDirty])
```

---

### Task 5.2: Navigation Updates
**File:** `src/components/layout/navbar.tsx`

**Add Links:**
- Dashboard → `/dashboard/projects`
- Add Project → `/projects/new` (if authenticated)

---

### Task 5.3: Responsive Design
- Mobile-first approach
- Form fields stack on mobile
- Dashboard grid adapts (3 → 2 → 1 columns)
- Touch-friendly buttons (min 44x44px)

---

### Task 5.4: Loading States
- Skeleton loaders for project cards
- Button loading spinners during save
- Full-page loader for route transitions

---

### Task 5.5: Error Boundaries
**File:** `src/app/projects/error.tsx`

**Features:**
- Catch and display errors gracefully
- "Try Again" button
- "Go Back" button

---

## ✅ Validation Checklist

### Form Validation
- [ ] Title: 5-100 characters
- [ ] Description: 20-280 characters
- [ ] At least one URL (repository, video, or live demo)
- [ ] URL format: starts with http:// or https://
- [ ] Skills: 1-10 selected
- [ ] Project type: required
- [ ] Status: required

### User Flows
- [ ] Create project → Save as draft
- [ ] Edit project → Update successfully
- [ ] Delete project → Confirmation → Soft delete
- [ ] Publish draft → Status changes
- [ ] Navigate with unsaved changes → Warning

### UI/UX
- [ ] Character counters update in real-time
- [ ] Error messages clear and actionable
- [ ] Loading states during API calls
- [ ] Success/error toasts
- [ ] Mobile responsive
- [ ] Keyboard navigation
- [ ] Focus management (accessibility)

---

## 🧪 Testing Strategy

### Unit Tests
```bash
# Components
- character-counter.test.tsx
- url-input.test.tsx
- skills-select.test.tsx

# Hooks
- use-projects.test.ts
- use-unsaved-changes.test.ts

# Services
- projects.service.test.ts
```

### Integration Tests (Manual)
1. Create new project with all fields
2. Edit existing project
3. Delete project (confirm modal works)
4. Try to submit without required fields
5. Try to submit with invalid URLs
6. Navigate away with unsaved changes
7. Mobile responsive check

---

## 📊 Progress Tracking

### Phase 1: Services & Hooks
- [ ] 1.1 Project services
- [ ] 1.2 Skills services
- [ ] 1.3 TanStack Query hooks

### Phase 2: UI Components
- [ ] 2.1 URL Input
- [ ] 2.2 Character Counter
- [ ] 2.3 Skills Multi-Select
- [ ] 2.4 Project Type Selector
- [ ] 2.5 Project Status Selector

### Phase 3: Main Form
- [ ] 3.1 Project Form Component
- [ ] 3.2 Delete Confirmation Modal
- [ ] 3.3 Project Preview Modal

### Phase 4: Pages
- [ ] 4.1 Create Project Page
- [ ] 4.2 Edit Project Page
- [ ] 4.3 Project Dashboard Page

### Phase 5: Integration
- [ ] 5.1 Unsaved Changes Hook
- [ ] 5.2 Navigation Updates
- [ ] 5.3 Responsive Design
- [ ] 5.4 Loading States
- [ ] 5.5 Error Boundaries

---

## 🚀 Next Steps After E2-T2

Once E2-T2 is complete:
1. **E2-T3: Image Upload System** - Add logo and screenshot uploads
2. **E2-T4: Skills Management** - Skills showcase on profile
3. **E2-T5: Enhanced Profile Page** - Display projects on profile
4. **E2-T6: GitHub Integration** - Auto-fill from GitHub repos

---

## 📝 Notes

- Logo/image uploads deferred to E2-T3 (use placeholder for now)
- Skills validation happens at API level (project-validated)
- Draft projects only visible to owner
- Use existing shadcn/ui components where possible
- Follow project's form pattern from profile form (E1-T4)

---

**Ready to Start:** Phase 1, Task 1.1 (Project Services)
