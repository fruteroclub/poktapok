# E2-T1: Database Schema & Project CRUD API

**Epic:** Epic 2 - Portfolio Showcase
**Story Points:** 8
**Status:** ✅ Complete
**Completed:** December 27, 2024
**Assignee:** Backend Developer
**Dependencies:** E1-T4 (Profile Page exists)

**Implementation Summary:** [E2-T1-IMPLEMENTATION-SUMMARY.md](./E2-T1-IMPLEMENTATION-SUMMARY.md)

---

## Objective

Create database tables and REST API endpoints for projects and skills management.

---

## User Story

**As a** developer
**I want to** create and manage my portfolio projects via API
**So that** I can showcase my work on my profile

---

## Acceptance Criteria

### Database Schema

- [x] Create `projects` table with all required fields
- [x] Create `skills` table with preset skill library
- [x] Create `user_skills` table (many-to-many relationship)
- [x] Create `project_skills` table (many-to-many relationship)
- [x] All tables have proper indexes for performance
- [x] Foreign keys with appropriate cascade behavior
- [x] CHECK constraints for data validation

### API Endpoints

**Projects:**
- [ ] `POST /api/projects` - Create new project
- [ ] `GET /api/projects` - List user's projects (auth required)
- [ ] `GET /api/projects/:id` - Get single project details
- [ ] `PUT /api/projects/:id` - Update project (owner only)
- [ ] `DELETE /api/projects/:id` - Delete project (owner only)
- [ ] `PATCH /api/projects/:id/publish` - Toggle draft/published status

**Skills:**
- [ ] `GET /api/skills` - List all available skills
- [ ] `POST /api/users/:userId/skills` - Add skill to user (auth required)
- [ ] `DELETE /api/users/:userId/skills/:skillId` - Remove skill from user
- [ ] `POST /api/projects/:projectId/skills` - Link skill to project
- [ ] `DELETE /api/projects/:projectId/skills/:skillId` - Unlink skill from project

### Validation

- [ ] Zod schemas for all request bodies
- [ ] Field validation (length, format, required fields)
- [ ] Authorization checks (user can only edit own projects)
- [ ] Error responses follow API response pattern

---

## Database Schema Details

### `projects` Table

```typescript
projects {
  // Primary Key
  id: uuid (PK, default: gen_random_uuid())

  // Foreign Keys
  userId: uuid (FK users.id, NOT NULL, onDelete: CASCADE)

  // Core Fields
  title: varchar(100) (NOT NULL)
  description: varchar(280) (NOT NULL) // Short description, like Twitter

  // Project Links
  liveUrl: varchar(500) (nullable)
  repositoryUrl: varchar(500) (nullable) // GitHub, GitLab, etc.
  videoUrl: varchar(500) (nullable) // YouTube, Loom, etc.

  // Visual Identity
  logoUrl: varchar(500) (nullable) // Project logo/icon
  imageUrls: varchar(500)[] (nullable) // Screenshots, diagrams (max 5)

  // Project Metadata
  projectType: project_type_enum (NOT NULL)
    - personal
    - bootcamp
    - hackathon
    - work-related
    - freelance
    - bounty

  projectStatus: project_status_enum (NOT NULL, default: 'draft')
    - draft (work in progress, not published)
    - wip (work in progress, published)
    - completed (published and finished)
    - archived (no longer showcased)

  // Display & Organization
  displayOrder: integer (default: 0) // For manual sorting (0 = newest first)
  featured: boolean (default: false) // Pin to top of profile

  // Analytics (for future)
  viewCount: integer (default: 0)

  // Timestamps
  createdAt: timestamp (default: NOW())
  updatedAt: timestamp (default: NOW())
  publishedAt: timestamp (nullable) // When first published

  // Soft Delete
  deletedAt: timestamp (nullable)

  // Metadata
  metadata: jsonb (default: '{}') // Future extensibility
}
```

**Indexes:**
```sql
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(project_status);
CREATE INDEX idx_projects_type ON projects(project_type);
CREATE INDEX idx_projects_featured ON projects(featured) WHERE featured = true;
CREATE INDEX idx_projects_display_order ON projects(user_id, display_order);
CREATE INDEX idx_projects_published_at ON projects(published_at DESC) WHERE published_at IS NOT NULL;
CREATE INDEX idx_projects_deleted_at ON projects(deleted_at) WHERE deleted_at IS NULL;
```

**CHECK Constraints:**
```sql
-- Title length
CHECK (char_length(title) >= 5 AND char_length(title) <= 100)

-- Description length
CHECK (char_length(description) >= 20 AND char_length(description) <= 280)

-- At least one URL must be provided (repository or video)
CHECK (repository_url IS NOT NULL OR video_url IS NOT NULL OR live_url IS NOT NULL)

-- URL format validation (basic)
CHECK (live_url IS NULL OR live_url ~ '^https?://')
CHECK (repository_url IS NULL OR repository_url ~ '^https?://')
CHECK (video_url IS NULL OR video_url ~ '^https?://')

-- Logo URL format
CHECK (logo_url IS NULL OR logo_url ~ '^https?://')

-- View count non-negative
CHECK (view_count >= 0)

-- Display order non-negative
CHECK (display_order >= 0)
```

---

### `skills` Table (Preset Library)

```typescript
skills {
  // Primary Key
  id: uuid (PK, default: gen_random_uuid())

  // Core Fields
  name: varchar(50) (UNIQUE, NOT NULL)
  slug: varchar(50) (UNIQUE, NOT NULL) // URL-friendly version
  category: skill_category_enum (NOT NULL)
    - language (JavaScript, Python, Solidity, etc.)
    - framework (React, Next.js, Express, etc.)
    - tool (Git, Docker, PostgreSQL, etc.)
    - blockchain (Ethereum, Arbitrum, etc.)
    - other

  // Display
  description: text (nullable)
  iconUrl: varchar(500) (nullable) // Skill icon/logo

  // Popularity (computed from usage)
  usageCount: integer (default: 0) // How many users have this skill

  // Timestamps
  createdAt: timestamp (default: NOW())
  updatedAt: timestamp (default: NOW())
}
```

**Preset Skills to Seed:**
```typescript
// Languages
JavaScript, TypeScript, Python, Rust, Solidity, Go, Java

// Frontend Frameworks
React, Next.js, Vue.js, Angular, Svelte

// Backend Frameworks
Node.js, Express, NestJS, Django, FastAPI, Ruby on Rails

// Tools & Databases
Git, Docker, PostgreSQL, MongoDB, Redis, GraphQL

// Blockchain
Ethereum, Solidity, Wagmi, Ethers.js, Viem, Arbitrum, Base

// Other
Web3, DeFi, Smart Contracts, REST APIs, TypeScript, Tailwind CSS
```

---

### `user_skills` Table (Many-to-Many)

```typescript
user_skills {
  // Composite Primary Key
  id: uuid (PK, default: gen_random_uuid())

  // Foreign Keys
  userId: uuid (FK users.id, NOT NULL, onDelete: CASCADE)
  skillId: uuid (FK skills.id, NOT NULL, onDelete: CASCADE)

  // Proficiency (future: could be computed from projects)
  proficiencyLevel: proficiency_enum (NOT NULL, default: 'intermediate')
    - beginner
    - intermediate
    - advanced

  // Validation: Skill must be used in at least one project
  projectCount: integer (default: 0) // How many projects use this skill

  // Timestamps
  createdAt: timestamp (default: NOW())

  // Unique constraint
  UNIQUE(user_id, skill_id)
}
```

---

### `project_skills` Table (Many-to-Many)

```typescript
project_skills {
  // Composite Primary Key
  projectId: uuid (FK projects.id, NOT NULL, onDelete: CASCADE)
  skillId: uuid (FK skills.id, NOT NULL, onDelete: CASCADE)

  // Timestamps
  createdAt: timestamp (default: NOW())

  // Primary Key
  PRIMARY KEY (project_id, skill_id)
}
```

---

## API Specifications

### POST /api/projects

**Request Body:**
```typescript
{
  title: string (5-100 chars, required)
  description: string (20-280 chars, required)
  liveUrl?: string (valid URL)
  repositoryUrl?: string (valid URL)
  videoUrl?: string (valid URL)
  logoUrl?: string (valid URL)
  imageUrls?: string[] (max 5 URLs)
  projectType: 'personal' | 'bootcamp' | 'hackathon' | 'work-related' | 'freelance' | 'bounty'
  projectStatus: 'draft' | 'wip' | 'completed'
  skillIds: string[] (array of skill UUIDs)
}
```

**Response:** `201 Created`
```typescript
{
  success: true,
  data: {
    project: Project
  },
  message: "Project created successfully"
}
```

---

### GET /api/projects

**Query Params:**
```typescript
{
  userId?: string // Filter by user (public)
  status?: 'draft' | 'wip' | 'completed' // Filter by status (owner only sees drafts)
  type?: string // Filter by project type
  limit?: number (default: 20, max: 100)
  offset?: number (default: 0)
}
```

**Response:** `200 OK`
```typescript
{
  success: true,
  data: {
    projects: Project[],
    total: number
  },
  meta: {
    pagination: {
      limit: number,
      offset: number,
      hasMore: boolean
    }
  }
}
```

---

### PUT /api/projects/:id

**Authorization:** Owner only

**Request Body:** Same as POST (all fields optional)

**Response:** `200 OK`
```typescript
{
  success: true,
  data: {
    project: Project
  },
  message: "Project updated successfully"
}
```

---

### PATCH /api/projects/:id/publish

**Authorization:** Owner only

**Request Body:**
```typescript
{
  status: 'wip' | 'completed' | 'archived'
}
```

**Response:** `200 OK`
```typescript
{
  success: true,
  data: {
    project: Project
  },
  message: "Project status updated"
}
```

---

## Technical Implementation

### File Structure

```
src/
├── lib/
│   └── db/
│       ├── schema/
│       │   ├── projects.ts       # Projects table schema
│       │   └── skills.ts         # Skills & relationships schemas
│       └── queries/
│           ├── projects.ts       # Project CRUD queries
│           └── skills.ts         # Skills queries
├── types/
│   └── api-v2.ts                 # API response types for Epic 2
└── app/
    └── api/
        ├── projects/
        │   ├── route.ts          # POST, GET /api/projects
        │   └── [id]/
        │       ├── route.ts      # GET, PUT, DELETE /api/projects/:id
        │       ├── publish/
        │       │   └── route.ts  # PATCH /api/projects/:id/publish
        │       └── skills/
        │           └── route.ts  # POST, DELETE /api/projects/:id/skills
        └── skills/
            └── route.ts          # GET /api/skills
```

---

## Validation Rules

### Zod Schemas

```typescript
// src/lib/validators/project.ts

const projectStatusEnum = z.enum(['draft', 'wip', 'completed', 'archived'])
const projectTypeEnum = z.enum(['personal', 'bootcamp', 'hackathon', 'work-related', 'freelance', 'bounty'])

export const createProjectSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(280),
  liveUrl: z.string().url().optional(),
  repositoryUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  imageUrls: z.array(z.string().url()).max(5).optional(),
  projectType: projectTypeEnum,
  projectStatus: projectStatusEnum,
  skillIds: z.array(z.string().uuid())
}).refine(
  (data) => data.repositoryUrl || data.videoUrl || data.liveUrl,
  { message: "At least one URL (repository, video, or live demo) is required" }
)

export const updateProjectSchema = createProjectSchema.partial()
```

---

## Authorization Logic

```typescript
// Middleware checks
function canEditProject(userId: string, project: Project): boolean {
  return project.userId === userId
}

function canViewProject(userId: string | null, project: Project): boolean {
  // Owner can always view
  if (userId && project.userId === userId) return true

  // Public can only see published (wip or completed)
  return project.projectStatus !== 'draft' && project.deletedAt === null
}
```

---

## Testing Checklist

### Unit Tests
- [ ] Zod schema validation (valid/invalid inputs)
- [ ] Authorization logic (owner vs public access)
- [ ] Database queries (CRUD operations)

### API Tests
- [ ] Create project with all fields
- [ ] Create project with minimal fields
- [ ] Update project (owner)
- [ ] Update project (unauthorized - should fail)
- [ ] Delete project (soft delete)
- [ ] List projects (pagination)
- [ ] Filter projects by status/type
- [ ] Link skills to project
- [ ] Skill must be in at least one project before adding to user

### Edge Cases
- [ ] Create project without required URL (should fail)
- [ ] Add >5 images (should fail)
- [ ] Update deleted project (should fail)
- [ ] Link non-existent skill to project (should fail)

---

## Success Criteria

- ✅ All tables created successfully via `bun run db:push`
- ✅ All API endpoints return correct status codes
- ✅ Authorization properly enforced
- ✅ Validation catches invalid data
- ✅ No N+1 query problems
- ✅ API follows existing response pattern

---

## Notes

- Skills can only be added to a user if they have at least one project that uses that skill
- `projectStatus='draft'` projects are only visible to the owner
- Projects require at least one URL (repository, video, or live demo)
- Image URLs are stored as array for flexibility (uploaded in E2-T3)
- Display order defaults to 0 (newest first), users can manually reorder in E2-T5

---

**Estimated Time:** 2-3 days
**Complexity:** Medium (database + REST API)
**Priority:** High (blocks E2-T2, E2-T3, E2-T4, E2-T5)
