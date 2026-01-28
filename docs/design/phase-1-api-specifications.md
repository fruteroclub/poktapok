# Phase 1: API Specifications

**Date:** January 11, 2026
**Status:** Design Phase
**Dependencies:** None (foundation layer)

## Overview

This document specifies the 4 new API endpoints required for Club and Jam pages. All endpoints follow the existing API response envelope pattern and authentication strategy.

---

## 1. Public Program Detail

### Endpoint
```
GET /api/programs/[id]
```

### Purpose
Fetch public program information without requiring authentication. Provides overview data for unauthenticated users and non-enrolled members.

### Authentication
- **Required:** No
- **Optional:** Yes (for conditional features)

### Request Parameters

**Path Parameters:**
- `id` (string, required) - Program UUID

**Query Parameters:**
- None

### Response Schema

**Success Response (200):**
```typescript
{
  success: true,
  data: {
    program: {
      id: string
      name: string
      description: string
      type: 'cohort' | 'evergreen'
      isActive: boolean
      createdAt: string // ISO 8601
      metadata: Record<string, unknown>
    },
    stats: {
      totalEnrollments: number
      totalSessions: number
      totalActivities: number
    },
    sessions: Array<{
      id: string
      title: string
      description: string | null
      scheduledAt: string // ISO 8601
      activityCount: number
    }>,
    activities: Array<{
      id: string
      title: string
      description: string
      rewardPulpaAmount: string // Decimal as string
      difficulty: 'beginner' | 'intermediate' | 'advanced'
      activityType: string
    }>
  }
}
```

**Error Responses:**
- `404` - Program not found
- `500` - Internal server error

### Database Query

```typescript
// Main query
const program = await db.query.programs.findFirst({
  where: eq(programs.id, programId),
  columns: {
    id: true,
    name: true,
    description: true,
    type: true,
    isActive: true,
    createdAt: true,
    metadata: true,
  },
})

// Stats
const enrollments = await db
  .select({ count: count() })
  .from(programEnrollments)
  .where(eq(programEnrollments.programId, programId))

// Sessions with activity count
const sessions = await db
  .select({
    id: programSessions.id,
    title: programSessions.title,
    description: programSessions.description,
    scheduledAt: programSessions.scheduledAt,
    activityCount: count(sessionActivities.activityId),
  })
  .from(programSessions)
  .leftJoin(sessionActivities, eq(programSessions.id, sessionActivities.sessionId))
  .where(eq(programSessions.programId, programId))
  .groupBy(programSessions.id)
  .orderBy(asc(programSessions.scheduledAt))

// Activities
const activities = await db
  .select({
    id: activities.id,
    title: activities.title,
    description: activities.description,
    rewardPulpaAmount: activities.rewardPulpaAmount,
    difficulty: activities.difficulty,
    activityType: activities.activityType,
  })
  .from(activities)
  .innerJoin(programActivities, eq(activities.id, programActivities.activityId))
  .where(eq(programActivities.programId, programId))
  .orderBy(desc(activities.rewardPulpaAmount))
```

### Implementation Notes
- Return public data only (no meeting URLs, no user-specific data)
- Include inactive programs (for SEO/bookmarking), but mark with `isActive` flag
- Order sessions by `scheduledAt` ascending (soonest first)
- Order activities by reward amount descending (highest rewards first)
- Count activities per session for preview display

### File Location
```
src/app/api/programs/[id]/route.ts
```

### Service Function
```typescript
// src/services/programs.ts
export async function fetchPublicProgram(
  programId: string
): Promise<PublicProgramResponse> {
  return apiFetch<PublicProgramResponse>(`/api/programs/${programId}`)
}
```

### Hook
```typescript
// src/hooks/use-programs.ts (extend existing)
export function usePublicProgram(programId: string) {
  return useQuery({
    queryKey: ['programs', 'public', programId],
    queryFn: () => fetchPublicProgram(programId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
```

---

## 2. Public Sessions List

### Endpoint
```
GET /api/sessions
```

### Purpose
Fetch all sessions (standalone and program-linked) with filtering capabilities. Public access for browsing.

### Authentication
- **Required:** No
- **Optional:** Yes (for future features)

### Request Parameters

**Query Parameters:**
- `upcoming` (boolean, optional) - Filter to only upcoming sessions (default: false)
- `programId` (string, optional) - Filter by specific program UUID
- `standalone` (boolean, optional) - Filter to only standalone sessions (null programId)
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20, max: 50)

### Response Schema

**Success Response (200):**
```typescript
{
  success: true,
  data: {
    sessions: Array<{
      id: string
      title: string
      description: string | null
      scheduledAt: string // ISO 8601
      programId: string | null
      programName: string | null
      activityCount: number
      createdAt: string // ISO 8601
    }>
  },
  meta: {
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasMore: boolean
    }
  }
}
```

**Error Responses:**
- `400` - Invalid query parameters
- `500` - Internal server error

### Database Query

```typescript
// Base query with filters
const query = db
  .select({
    id: sessions.id,
    title: sessions.title,
    description: sessions.description,
    scheduledAt: sessions.scheduledAt,
    programId: sessions.programId,
    programName: programs.name,
    activityCount: count(sessionActivities.activityId),
    createdAt: sessions.createdAt,
  })
  .from(sessions)
  .leftJoin(programs, eq(sessions.programId, programs.id))
  .leftJoin(sessionActivities, eq(sessions.id, sessionActivities.sessionId))
  .groupBy(sessions.id, programs.name)

// Apply filters
if (upcoming) {
  query.where(gte(sessions.scheduledAt, new Date()))
}
if (programId) {
  query.where(eq(sessions.programId, programId))
}
if (standalone) {
  query.where(isNull(sessions.programId))
}

// Pagination
query
  .orderBy(asc(sessions.scheduledAt))
  .limit(limit)
  .offset((page - 1) * limit)

// Count query for pagination
const totalCount = await db
  .select({ count: count() })
  .from(sessions)
  // Apply same filters
```

### Implementation Notes
- Default ordering: upcoming sessions first, then chronological
- Support multiple filters simultaneously (AND logic)
- Return program name via LEFT JOIN (null for standalone)
- Count activities per session for display
- Pagination mandatory to prevent large result sets

### File Location
```
src/app/api/sessions/route.ts
```

### Service Function
```typescript
// src/services/sessions.ts (new file)
export interface SessionFilters {
  upcoming?: boolean
  programId?: string
  standalone?: boolean
  page?: number
  limit?: number
}

export async function fetchPublicSessions(
  filters?: SessionFilters
): Promise<PublicSessionsResponse> {
  const params = new URLSearchParams()
  if (filters?.upcoming) params.append('upcoming', 'true')
  if (filters?.programId) params.append('programId', filters.programId)
  if (filters?.standalone) params.append('standalone', 'true')
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.limit) params.append('limit', String(filters.limit))

  const queryString = params.toString()
  const url = queryString ? `/api/sessions?${queryString}` : '/api/sessions'

  return apiFetch<PublicSessionsResponse>(url)
}
```

### Hook
```typescript
// src/hooks/use-sessions.ts (new file)
export function usePublicSessions(filters?: SessionFilters) {
  return useQuery({
    queryKey: ['sessions', 'public', filters],
    queryFn: () => fetchPublicSessions(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true, // For pagination
  })
}
```

---

## 3. Session Detail

### Endpoint
```
GET /api/sessions/[id]
```

### Purpose
Fetch detailed session information with conditional access to meeting URL based on user enrollment status.

### Authentication
- **Required:** No (for public info)
- **Optional:** Yes (for meeting URL access)

### Request Parameters

**Path Parameters:**
- `id` (string, required) - Session UUID

**Query Parameters:**
- None

### Response Schema

**Success Response (200):**
```typescript
{
  success: true,
  data: {
    session: {
      id: string
      title: string
      description: string | null
      scheduledAt: string // ISO 8601
      meetingUrl: string | null // Conditional: only if userCanAccess = true
      programId: string | null
      programName: string | null
      createdAt: string // ISO 8601
    },
    activities: Array<{
      id: string
      title: string
      description: string
      rewardPulpaAmount: string
      difficulty: 'beginner' | 'intermediate' | 'advanced'
      activityType: string
    }>,
    userCanAccess: boolean // true if user can see meeting URL
  }
}
```

**Error Responses:**
- `404` - Session not found
- `500` - Internal server error

### Access Control Logic

```typescript
let userCanAccess = false
let meetingUrl: string | null = null

if (userId) {
  // Check if user is admin
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { role: true },
  })

  if (user?.role === 'admin') {
    userCanAccess = true
  } else if (session.programId) {
    // Check if user is enrolled in the program
    const enrollment = await db.query.programEnrollments.findFirst({
      where: and(
        eq(programEnrollments.programId, session.programId),
        eq(programEnrollments.userId, userId),
        inArray(programEnrollments.status, ['enrolled', 'completed'])
      ),
    })
    userCanAccess = !!enrollment
  } else {
    // Standalone session - accessible to all authenticated users
    userCanAccess = true
  }
}

// Only include meeting URL if user can access
if (userCanAccess) {
  meetingUrl = session.meetingUrl
}
```

### Database Query

```typescript
// Session with program info
const session = await db
  .select({
    id: sessions.id,
    title: sessions.title,
    description: sessions.description,
    scheduledAt: sessions.scheduledAt,
    meetingUrl: sessions.meetingUrl,
    programId: sessions.programId,
    programName: programs.name,
    createdAt: sessions.createdAt,
  })
  .from(sessions)
  .leftJoin(programs, eq(sessions.programId, programs.id))
  .where(eq(sessions.id, sessionId))
  .limit(1)

// Linked activities
const activities = await db
  .select({
    id: activities.id,
    title: activities.title,
    description: activities.description,
    rewardPulpaAmount: activities.rewardPulpaAmount,
    difficulty: activities.difficulty,
    activityType: activities.activityType,
  })
  .from(activities)
  .innerJoin(sessionActivities, eq(activities.id, sessionActivities.activityId))
  .where(eq(sessionActivities.sessionId, sessionId))
  .orderBy(desc(activities.rewardPulpaAmount))
```

### Implementation Notes
- Public info always visible (title, description, date, program)
- Meeting URL conditionally included based on access control
- Access granted if: admin OR enrolled in program OR standalone session (auth only)
- Return `userCanAccess` flag for client-side UI decisions
- Order activities by reward amount (highest first)

### File Location
```
src/app/api/sessions/[id]/route.ts
```

### Service Function
```typescript
// src/services/sessions.ts
export async function fetchSessionDetail(
  sessionId: string
): Promise<SessionDetailResponse> {
  return apiFetch<SessionDetailResponse>(`/api/sessions/${sessionId}`)
}
```

### Hook
```typescript
// src/hooks/use-sessions.ts
export function useSessionDetail(sessionId: string) {
  return useQuery({
    queryKey: ['sessions', 'detail', sessionId],
    queryFn: () => fetchSessionDetail(sessionId),
    staleTime: 1 * 60 * 1000, // 1 minute (meeting URLs should be fresh)
  })
}
```

---

## 4. Public Projects List

### Endpoint
```
GET /api/projects
```

### Purpose
Fetch public projects for showcase with filtering and pagination.

### Authentication
- **Required:** No
- **Optional:** Yes (for future user-specific features)

### Request Parameters

**Query Parameters:**
- `learningTrack` (string, optional) - Filter by learning track ('ai', 'crypto', 'privacy')
- `skills` (string[], optional) - Filter by skill IDs (comma-separated)
- `search` (string, optional) - Search in title and description
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20, max: 50)

### Response Schema

**Success Response (200):**
```typescript
{
  success: true,
  data: {
    projects: Array<{
      id: string
      title: string
      description: string
      imageUrl: string | null
      userId: string
      username: string
      avatarUrl: string | null
      skills: Array<{
        id: string
        name: string
        category: string
      }>
      createdAt: string // ISO 8601
    }>
  },
  meta: {
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasMore: boolean
    }
  }
}
```

**Error Responses:**
- `400` - Invalid query parameters
- `500` - Internal server error

### Database Query

```typescript
// Base query with user and skills
const query = db
  .selectDistinct({
    id: projects.id,
    title: projects.title,
    description: projects.description,
    imageUrl: projects.imageUrl,
    userId: projects.userId,
    username: users.username,
    avatarUrl: users.avatarUrl,
    createdAt: projects.createdAt,
  })
  .from(projects)
  .innerJoin(users, eq(projects.userId, users.id))
  .leftJoin(projectSkills, eq(projects.id, projectSkills.projectId))
  .leftJoin(skills, eq(projectSkills.skillId, skills.id))
  .leftJoin(profiles, eq(users.id, profiles.userId))

// Apply filters
if (learningTrack) {
  query.where(
    sql`${learningTrack} = ANY(${profiles.learningTracks})`
  )
}
if (skillIds?.length) {
  query.where(
    inArray(projectSkills.skillId, skillIds)
  )
}
if (search) {
  query.where(
    or(
      ilike(projects.title, `%${search}%`),
      ilike(projects.description, `%${search}%`)
    )
  )
}

// Pagination
query
  .orderBy(desc(projects.createdAt))
  .limit(limit)
  .offset((page - 1) * limit)

// Separately fetch skills for each project (to avoid duplication)
const projectIds = projectsResult.map(p => p.id)
const skillsResult = await db
  .select({
    projectId: projectSkills.projectId,
    skillId: skills.id,
    skillName: skills.name,
    skillCategory: skills.category,
  })
  .from(projectSkills)
  .innerJoin(skills, eq(projectSkills.skillId, skills.id))
  .where(inArray(projectSkills.projectId, projectIds))

// Group skills by project
const projectsWithSkills = projectsResult.map(project => ({
  ...project,
  skills: skillsResult
    .filter(s => s.projectId === project.id)
    .map(s => ({
      id: s.skillId,
      name: s.skillName,
      category: s.skillCategory,
    })),
}))
```

### Implementation Notes
- Only return projects from users with public profiles
- Skills are fetched separately to avoid JOIN duplication
- Support multiple skill filters (AND logic)
- Search is case-insensitive (ILIKE)
- Order by most recent first (DESC createdAt)
- Pagination mandatory

### File Location
```
src/app/api/projects/route.ts
```

### Service Function
```typescript
// src/services/projects.ts (new file)
export interface ProjectFilters {
  learningTrack?: 'ai' | 'crypto' | 'privacy'
  skills?: string[]
  search?: string
  page?: number
  limit?: number
}

export async function fetchPublicProjects(
  filters?: ProjectFilters
): Promise<PublicProjectsResponse> {
  const params = new URLSearchParams()
  if (filters?.learningTrack) params.append('learningTrack', filters.learningTrack)
  if (filters?.skills?.length) {
    filters.skills.forEach(skill => params.append('skills', skill))
  }
  if (filters?.search) params.append('search', filters.search)
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.limit) params.append('limit', String(filters.limit))

  const queryString = params.toString()
  const url = queryString ? `/api/projects?${queryString}` : '/api/projects'

  return apiFetch<PublicProjectsResponse>(url)
}
```

### Hook
```typescript
// src/hooks/use-projects.ts (new file)
export function usePublicProjects(filters?: ProjectFilters) {
  return useQuery({
    queryKey: ['projects', 'public', filters],
    queryFn: () => fetchPublicProjects(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true, // For pagination
  })
}
```

---

## Type Definitions

Add to `src/types/api-v1.ts`:

```typescript
// ============================================================================
// Public Programs
// ============================================================================

export interface PublicProgramResponse {
  program: {
    id: string
    name: string
    description: string
    type: 'cohort' | 'evergreen'
    isActive: boolean
    createdAt: string
    metadata: Record<string, unknown>
  }
  stats: {
    totalEnrollments: number
    totalSessions: number
    totalActivities: number
  }
  sessions: Array<{
    id: string
    title: string
    description: string | null
    scheduledAt: string
    activityCount: number
  }>
  activities: Array<{
    id: string
    title: string
    description: string
    rewardPulpaAmount: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    activityType: string
  }>
}

// ============================================================================
// Public Sessions
// ============================================================================

export interface SessionFilters {
  upcoming?: boolean
  programId?: string
  standalone?: boolean
  page?: number
  limit?: number
}

export interface PublicSession {
  id: string
  title: string
  description: string | null
  scheduledAt: string
  programId: string | null
  programName: string | null
  activityCount: number
  createdAt: string
}

export interface PublicSessionsResponse {
  sessions: PublicSession[]
}

export interface SessionDetailResponse {
  session: {
    id: string
    title: string
    description: string | null
    scheduledAt: string
    meetingUrl: string | null
    programId: string | null
    programName: string | null
    createdAt: string
  }
  activities: Array<{
    id: string
    title: string
    description: string
    rewardPulpaAmount: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    activityType: string
  }>
  userCanAccess: boolean
}

// ============================================================================
// Public Projects
// ============================================================================

export interface ProjectFilters {
  learningTrack?: 'ai' | 'crypto' | 'privacy'
  skills?: string[]
  search?: string
  page?: number
  limit?: number
}

export interface PublicProject {
  id: string
  title: string
  description: string
  imageUrl: string | null
  userId: string
  username: string
  avatarUrl: string | null
  skills: Array<{
    id: string
    name: string
    category: string
  }>
  createdAt: string
}

export interface PublicProjectsResponse {
  projects: PublicProject[]
}
```

---

## Testing Strategy

### Unit Tests
- Request validation (Zod schemas)
- Response formatting
- Error handling

### Integration Tests
- Database queries with filters
- Pagination logic
- Access control logic (session detail)

### Manual Testing Checklist
- [ ] Public program detail loads without auth
- [ ] Sessions list filters work correctly
- [ ] Session detail shows meeting URL conditionally
- [ ] Projects list pagination works
- [ ] All error responses return correct status codes
- [ ] Type safety validated in TypeScript

---

## Security Considerations

1. **Public Endpoints:** No sensitive data exposed
2. **Meeting URLs:** Protected by access control logic
3. **Input Validation:** Zod schemas for all query params
4. **SQL Injection:** Drizzle ORM prevents injection
5. **Rate Limiting:** Consider adding for production (future enhancement)

---

## Performance Considerations

1. **Database Indexes:**
   - `sessions.scheduledAt` (for upcoming filter)
   - `sessions.programId` (for program filter)
   - `projects.createdAt` (for ordering)
   - `project_skills.projectId` (for skills join)

2. **Query Optimization:**
   - LEFT JOIN for nullable relationships
   - Limit result sets with pagination
   - Separate queries for nested data (projects + skills)

3. **Caching Strategy:**
   - React Query client-side caching
   - Future: Redis cache for popular programs/sessions

---

## Next Steps

1. **Implementation Order:**
   1. Type definitions (`api-v1.ts`)
   2. API endpoints (4 route files)
   3. Service functions (2 service files)
   4. React Query hooks (2 hook files)

2. **Validation:**
   - Test each endpoint independently
   - Verify response schemas match types
   - Check access control logic

3. **Documentation:**
   - Update API reference docs
   - Add example requests/responses
   - Document authentication behavior

4. **Ready for Phase 2:**
   - Once all 4 endpoints tested
   - All services and hooks validated
   - Type safety confirmed
