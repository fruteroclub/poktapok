/**
 * API v1 Types - Centralized API response and request types
 * Single source of truth for all API-related TypeScript interfaces
 */

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string
  username: string | null
  displayName: string | null
  email: string | null
  bio: string | null
  avatarUrl: string | null
  accountStatus: string
  role: string
  createdAt?: Date | string // Optional for backward compatibility
}

// ============================================================================
// Profile Types
// ============================================================================

export interface Profile {
  id: string
  userId: string
  city: string
  country: string
  countryCode: string
  learningTracks: string[]
  availabilityStatus: string
  socialLinks: {
    github?: string // Username only (e.g., "octocat")
    twitter?: string // Username only (e.g., "@username" or "username")
    linkedin?: string // Username only (e.g., "username" from linkedin.com/in/username)
    telegram?: string // Username only (e.g., "@username" or "username")
  } | null
}

// ============================================================================
// Auth API Responses
// ============================================================================

export interface MeResponse {
  user: User
  profile: Profile | null
}

// ============================================================================
// User API Requests & Responses
// ============================================================================

export interface UpdateUserRequest {
  email?: string
  username?: string
  displayName?: string
  bio?: string
  avatarUrl?: string | null
}

export interface UpdateUserResponse {
  user: User
}

// ============================================================================
// Profile API Responses
// ============================================================================

export interface CreateProfileResponse {
  success: boolean
  profile: Profile
  message: string
}

export interface UploadAvatarResponse {
  avatarUrl: string
}

export interface DeleteAvatarResponse {
  success: boolean
}

// ============================================================================
// Directory Types
// ============================================================================

export interface DirectoryProfile {
  id: string
  userId: string
  username: string
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
  city: string | null
  country: string | null
  countryCode: string | null
  learningTracks: ('ai' | 'crypto' | 'privacy')[] | null
  availabilityStatus: 'available' | 'open_to_offers' | 'unavailable'
  completedBounties: number
  totalEarningsUsd: number
  githubUrl: string | null
  twitterUrl: string | null
  linkedinUrl: string | null
  telegramHandle: string | null
  createdAt: Date
}

export interface DirectoryFilters {
  search?: string
  learningTrack?: 'ai' | 'crypto' | 'privacy'
  availabilityStatus?: 'available' | 'open_to_offers' | 'unavailable'
  country?: string
  skills?: string[] // Filter by skill IDs
  page?: number
  limit?: number
}

export interface DirectoryPagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

/**
 * Directory data structure (wrapped in ApiResponse)
 */
export interface DirectoryData {
  profiles: DirectoryProfile[]
}

/**
 * Directory response type (API returns this wrapped in success envelope)
 * The pagination is in the meta field
 */
export interface DirectoryResponse {
  profiles: DirectoryProfile[]
  pagination: DirectoryPagination
}

export interface DirectoryCountry {
  country: string
  countryCode: string
  count: number
}

/**
 * Directory countries data structure (wrapped in ApiResponse)
 */
export interface DirectoryCountriesData {
  countries: DirectoryCountry[]
}

// ============================================================================
// Project Types (Epic 2: Portfolio Showcase)
// ============================================================================

import type { Project, Skill, UserSkill, ProjectSkill } from '@/lib/db/schema'

// Re-export schema types for convenience
export type { Project, Skill, UserSkill, ProjectSkill }

/**
 * Project with related data (skills, user info, etc.)
 */
export interface ProjectWithSkills extends Project {
  skills: Skill[]
}

/**
 * Project list item (minimal data for directory/profile views)
 */
export interface ProjectListItem {
  id: string
  userId: string
  title: string
  description: string
  logoUrl: string | null
  projectType: string
  projectStatus: string
  featured: boolean
  viewCount: number
  publishedAt: Date | null
  skillCount: number
  hasRepository: boolean
  hasLiveUrl: boolean
  hasVideo: boolean
}

/**
 * Response for POST /api/projects (create project)
 */
export interface CreateProjectResponse {
  project: ProjectWithSkills
}

/**
 * Response for GET /api/projects/:id (single project)
 */
export interface GetProjectResponse {
  project: ProjectWithSkills
}

/**
 * Response for GET /api/projects (list projects)
 */
export interface ListProjectsResponse {
  projects: ProjectWithSkills[]
  total: number
}

/**
 * Response for PUT /api/projects/:id (update project)
 */
export interface UpdateProjectResponse {
  project: ProjectWithSkills
}

/**
 * Response for DELETE /api/projects/:id (soft delete)
 */
export interface DeleteProjectResponse {
  projectId: string
}

/**
 * Response for PATCH /api/projects/:id/publish (toggle status)
 */
export interface PublishProjectResponse {
  project: ProjectWithSkills
}

// ============================================================================
// Skill Types (Epic 2: Portfolio Showcase)
// ============================================================================

/**
 * Skill with usage count
 */
export interface SkillWithUsage extends Skill {
  usageCount: number
}

/**
 * User skill with project count
 */
export interface UserSkillWithDetails extends UserSkill {
  skill: Skill
  projectCount: number
}

/**
 * Response for GET /api/skills (list all skills)
 */
export interface ListSkillsResponse {
  skills: SkillWithUsage[]
  total: number
}

/**
 * Response for GET /api/users/:userId/skills (list user skills)
 */
export interface ListUserSkillsResponse {
  skills: UserSkillWithDetails[]
  total: number
}

/**
 * Response for POST /api/projects/:projectId/skills (link skill to project)
 */
export interface LinkProjectSkillResponse {
  projectSkill: ProjectSkill
}

/**
 * Response for DELETE /api/projects/:projectId/skills/:skillId (unlink skill)
 */
export interface UnlinkProjectSkillResponse {
  projectId: string
  skillId: string
}

// ============================================================================
// Query Parameter Types (Epic 2)
// ============================================================================

/**
 * Query params for GET /api/projects
 */
export interface ListProjectsQuery {
  userId?: string
  status?: 'draft' | 'wip' | 'completed' | 'archived'
  type?:
    | 'personal'
    | 'bootcamp'
    | 'hackathon'
    | 'work-related'
    | 'freelance'
    | 'bounty'
  featured?: boolean
  limit?: number
  offset?: number
}

/**
 * Query params for GET /api/skills
 */
export interface ListSkillsQuery {
  category?: 'language' | 'framework' | 'tool' | 'blockchain' | 'other'
  search?: string
  limit?: number
  offset?: number
}

// ============================================================================
// Program Management Types (Epic 3)
// ============================================================================

/**
 * Program type
 */
export interface Program {
  id: string
  name: string
  description: string
  programType: 'cohort' | 'evergreen'
  startDate?: string | null
  endDate?: string | null
  isActive: boolean
}

/**
 * Program enrollment type
 */
export interface ProgramEnrollment {
  id: string
  userId: string
  programId: string
  status: 'enrolled' | 'completed' | 'dropped'
  enrolledAt: string
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Response for GET /api/programs/active
 */
export interface ActiveProgramsResponse {
  programs: Program[]
}

/**
 * Application type
 */
export interface Application {
  id: string
  userId: string
  programId: string
  goal: string
  motivationText: string
  githubUsername?: string | null
  twitterUsername?: string | null
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy?: string | null
  reviewedAt?: string | null
  reviewNotes?: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Request for POST /api/applications
 */
export interface SubmitApplicationRequest {
  programId?: string
  goal: string
  motivationText: string
  githubUsername?: string
  twitterUsername?: string
  linkedinUrl?: string
  telegramUsername?: string
}

/**
 * Response for POST /api/applications
 */
export interface SubmitApplicationResponse {
  application: Application
}

// ============================================================================
// Admin Types (Admin Dashboard)
// ============================================================================

/**
 * Account status enum
 */
export type AccountStatus = 'incomplete' | 'pending' | 'guest' | 'active' | 'rejected'

/**
 * Pending user with profile data (extends existing User and Profile types)
 */
export interface PendingUserWithProfile {
  user: User
  profile: Profile | null
}

/**
 * Response for GET /api/admin/pending-users
 */
export interface ListPendingUsersResponse {
  pendingUsers: PendingUserWithProfile[]
}

/**
 * Response for GET /api/admin/users
 */
export interface ListUsersResponse {
  users: User[]
}

/**
 * Response for POST /api/admin/users/:id/approve
 */
export interface ApproveUserResponse {
  userId: string
  accountStatus: string
}

/**
 * Response for POST /api/admin/users/:id/reject
 */
export interface RejectUserResponse {
  userId: string
  accountStatus: string
}

// ============================================================================
// Guest Status Implementation (Epic 3 - Task 3)
// ============================================================================

/**
 * Request for POST /api/admin/applications/:id/approve
 */
export interface ApproveApplicationRequest {
  decision: 'approve_guest' | 'approve_member' | 'reject'
  reviewNotes?: string
}

/**
 * Response for POST /api/admin/applications/:id/approve
 */
export interface ApproveApplicationResponse {
  application: Application
}

/**
 * Request for POST /api/admin/users/:id/promote
 */
export interface PromoteUserRequest {
  enrollmentId: string
  promotionNotes?: string
}

/**
 * Response for POST /api/admin/users/:id/promote
 */
export interface PromoteUserResponse {
  userId: string
  accountStatus: 'active'
  enrollment: {
    id: string
    promotedAt: string
    metadata: Record<string, unknown>
  }
}

/**
 * Promotion eligibility criteria
 */
export interface PromotionEligibilityCriteria {
  attendanceCount: number
  attendanceRequired: number
  submissionCount: number
  submissionRequired: number
  qualityScore: number
  qualityRequired: number
}

/**
 * Promotion eligibility response
 */
export interface PromotionEligibility {
  isEligible: boolean
  criteria: PromotionEligibilityCriteria
  reasons: string[]
}

/**
 * Response for GET /api/admin/users/:id/eligibility
 */
export interface PromotionEligibilityResponse {
  eligibility: PromotionEligibility
}

// ============================================================================
// Admin Applications Queue (Epic 3 - Task 4)
// ============================================================================

/**
 * Application with full details (user, profile, program)
 */
export interface ApplicationWithDetails {
  application: Application
  user: User
  profile: Profile | null
  program: Program
}

/**
 * Application list item (for table display)
 */
export interface ApplicationListItem {
  application: Application
  user: {
    id: string
    username: string | null
    email: string | null
    accountStatus: string
  }
  profile: {
    id: string
    displayName: string | null
    avatarUrl: string | null
    city: string | null
    country: string | null
  } | null
  program: {
    id: string
    name: string
  } | null
}

/**
 * Query parameters for GET /api/admin/applications
 */
export interface ListApplicationsQuery {
  status?: 'pending' | 'approved' | 'rejected'
  programId?: string
  page?: number
  limit?: number
}

/**
 * Response for GET /api/admin/applications
 */
export interface ListApplicationsResponse {
  applications: ApplicationListItem[]
}

/**
 * Response for GET /api/admin/applications/:id
 */
export interface GetApplicationDetailResponse {
  application: Application
  user: User
  profile: Profile | null
  program: Program | null
  reviewer: {
    id: string
    username: string | null
    displayName: string | null
  } | null
}

/**
 * Application statistics
 */
export interface ApplicationStats {
  total: number
  recentCount: number
  byStatus: {
    pending: number
    approved: number
    rejected: number
    [key: string]: number
  }
}

/**
 * Response for GET /api/admin/applications/stats
 */
export interface ApplicationStatsResponse {
  total: number
  recentCount: number
  byStatus: ApplicationStats['byStatus']
}

// ============================================================================
// Admin Attendance Management (Epic 3 - Task 5)
// ============================================================================

/**
 * Attendance status types
 */
export type AttendanceStatus = 'present' | 'absent' | 'excused'

/**
 * Attendance record
 */
export interface AttendanceRecord {
  id: string
  userId: string
  sessionId: string
  status: AttendanceStatus
  markedBy: string | null
  markedAt: Date | string | null
  createdAt: Date | string
  updatedAt: Date | string
}

/**
 * Request for POST /api/admin/attendance/mark
 */
export interface MarkAttendanceRequest {
  sessionId: string
  userIds: string[]
  status: AttendanceStatus
}

/**
 * Response for POST /api/admin/attendance/mark
 */
export interface MarkAttendanceResponse {
  marked: number
}

/**
 * Request for POST /api/admin/attendance/bulk
 */
export interface BulkAttendanceRequest {
  sessionId: string
  records: Array<{
    userId: string
    status: AttendanceStatus
  }>
}

/**
 * Response for POST /api/admin/attendance/bulk
 */
export interface BulkAttendanceResponse {
  marked: number
}

/**
 * User with attendance status for a session
 */
export interface UserWithAttendance {
  user: {
    id: string
    username: string | null
    displayName: string | null
    email: string | null
    accountStatus: string
  }
  profile: {
    id: string
    displayName: string | null
    avatarUrl: string | null
  } | null
  enrollment: {
    id: string
    status: string
  } | null
  attendance: AttendanceRecord | null
  markedBy: {
    id: string
    username: string | null
    displayName: string | null
  } | null
}

/**
 * Session information
 */
export interface SessionInfo {
  id: string
  title: string
  description: string | null
  sessionDate: Date | string
  programId: string
}

/**
 * Response for GET /api/admin/attendance/session/:id
 */
export interface SessionAttendanceResponse {
  session: SessionInfo
  users: UserWithAttendance[]
}

// ============================================================================
// Program Dashboard (Epic 3 - Task 6)
// ============================================================================

/**
 * Program dashboard data
 */
export interface ProgramDashboardData {
  enrollment: {
    id: string
    status: string
    enrolledAt: Date | string
    promotedAt: Date | string | null
  }
  application: {
    id: string
    goal: string
    status: string
  } | null
  program: {
    id: string
    name: string
    description: string | null
    programType: string
    startDate: Date | string | null
    endDate: Date | string | null
  }
  user: {
    id: string
    username: string | null
    displayName: string | null
    accountStatus: string
  }
  stats: {
    attendance: {
      total: number
      present: number
    }
    submissions: {
      total: number
      approved: number
      pending: number
    }
    qualityScore: number
  }
}

/**
 * Response for GET /api/programs/:id/dashboard
 */
export type ProgramDashboardResponse = ProgramDashboardData

/**
 * Session item for program sessions list
 */
export interface ProgramSession {
  id: string
  title: string
  description: string | null
  sessionDate: Date | string
  sessionType: string
  location: string | null
  meetingUrl: string | null
  programId: string
}

/**
 * Response for GET /api/programs/:id/sessions
 */
export interface ProgramSessionsResponse {
  sessions: ProgramSession[]
}

// ============================================================================
// E3-T8: Admin Program CRUD
// ============================================================================

/**
 * Detailed program type for CRUD operations
 */
export interface ProgramDetail {
  id: string
  name: string
  description: string | null
  programType: 'cohort' | 'evergreen'
  startDate: string | null
  endDate: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  metadata: Record<string, unknown>
}

/**
 * Request body for POST /api/admin/programs
 */
export interface CreateProgramRequest {
  name: string
  description: string
  programType: 'cohort' | 'evergreen'
  startDate?: string // ISO datetime string
  endDate?: string // ISO datetime string
  isActive?: boolean
}

/**
 * Response for POST /api/admin/programs
 */
export interface CreateProgramResponse {
  program: ProgramDetail
}

/**
 * Request body for PATCH /api/admin/programs/:id
 */
export interface UpdateProgramRequest {
  name?: string
  description?: string
  programType?: 'cohort' | 'evergreen'
  startDate?: string | null // ISO datetime string or null
  endDate?: string | null // ISO datetime string or null
  isActive?: boolean
}

/**
 * Response for PATCH /api/admin/programs/:id
 */
export interface UpdateProgramResponse {
  program: ProgramDetail
}

/**
 * Response for DELETE /api/admin/programs/:id (soft delete)
 */
export interface DeleteProgramResponse {
  program: ProgramDetail
}

/**
 * Response for GET /api/admin/programs
 */
export interface GetAllProgramsResponse {
  programs: ProgramDetail[]
}

/**
 * Response for GET /api/admin/programs/:id (includes statistics)
 */
export interface GetProgramResponse {
  program: ProgramWithStats
}

/**
 * Program-Activity link
 */
export interface ProgramActivityLink {
  id: string
  programId: string
  activityId: string
  isRequired: boolean
  orderIndex: number | null
  createdAt: string
  updatedAt: string
}

/**
 * Program-Activity link with activity details
 */
export interface ProgramActivityLinkWithDetails {
  id: string
  activityId: string
  isRequired: boolean
  orderIndex: number | null
  activity: {
    id: string
    title: string
    description: string | null
    activityType: string
    isActive: boolean
  }
}

/**
 * Request body for POST /api/admin/programs/:id/activities
 */
export interface LinkActivityRequest {
  activityId: string
  isRequired?: boolean
  orderIndex?: number
}

/**
 * Response for POST /api/admin/programs/:id/activities
 */
export interface LinkActivityResponse {
  link: ProgramActivityLink
}

/**
 * Response for GET /api/admin/programs/:id/activities
 */
export interface GetProgramActivitiesResponse {
  activities: ProgramActivityLinkWithDetails[]
}

/**
 * Request body for PATCH /api/admin/programs/:programId/activities/:activityId
 */
export interface UpdateActivityLinkRequest {
  isRequired?: boolean
  orderIndex?: number
}

/**
 * Response for PATCH /api/admin/programs/:programId/activities/:activityId
 */
export interface UpdateActivityLinkResponse {
  link: ProgramActivityLink
}

/**
 * Response for DELETE /api/admin/programs/:programId/activities/:activityId
 */
export interface UnlinkActivityResponse {
  link: ProgramActivityLink
}

// ============================================================================
// Session Management Types (Epic 3 - Phase 2)
// ============================================================================

/**
 * Session type (content delivery unit within a program)
 */
export interface Session {
  id: string
  programId: string
  title: string
  description: string | null
  sessionType: 'in-person' | 'virtual' | 'hybrid'
  sessionDate: string // ISO datetime string
  duration: string | null
  location: string | null
  meetingUrl: string | null
  instructors: string[] | null
  materials: Array<{
    title: string
    url: string
    type: string
  }> | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  metadata: Record<string, unknown>
}

/**
 * Session with program details (program is nullable for standalone sessions)
 */
export interface SessionWithProgram extends Session {
  program: {
    id: string
    name: string
    slug: string
  } | null
}

/**
 * Session with activity count
 */
export interface SessionWithActivityCount extends Session {
  activityCount: number
  attendanceCount: number
}

/**
 * Activity with computed relationships (from activity_relationships_view)
 * Automatically includes transitive program links via sessions
 */
export interface ActivityWithRelationships {
  // Activity core fields
  activityId: string
  activityTitle: string
  activityType: string
  difficulty: string
  rewardPulpaAmount: string
  status: string

  // Direct program link (via program_activities junction)
  directProgramId: string | null
  directProgramName: string | null
  isProgramRequired: boolean | null
  programOrderIndex: number | null

  // Session link (via session_activities junction)
  sessionId: string | null
  sessionTitle: string | null
  sessionDate: string | null
  sessionOrderIndex: number | null

  // Transitive program link (via session → program)
  transitiveProgramId: string | null
  transitiveProgramName: string | null

  // Computed effective relationship
  effectiveProgramId: string | null
  effectiveProgramName: string | null

  // Relationship type indicator
  relationshipType: 'standalone' | 'program' | 'session' | 'session_transitive' | 'both'

  // Timestamps
  createdAt: string
  updatedAt: string
}

/**
 * Program with statistics
 */
export interface ProgramWithStats extends ProgramDetail {
  stats: {
    totalEnrollments: number
    activeEnrollments: number
    completedEnrollments: number
    droppedEnrollments: number
    totalSessions: number
    completedSessions: number
    upcomingSessions: number
    totalActivities: number // Includes transitive
    directActivities: number
    transitiveActivities: number
    averageCompletionRate: number
  }
}

/**
 * Request body for POST /api/admin/sessions
 */
export interface CreateSessionRequest {
  programId?: string // Optional - allows standalone sessions
  title: string
  description?: string
  sessionType: 'in-person' | 'virtual' | 'hybrid'
  sessionDate: string // ISO datetime string
  duration?: string
  location?: string
  meetingUrl?: string
  instructors?: string[]
  materials?: Array<{
    title: string
    url: string
    type: string
  }>
  isActive?: boolean
}

/**
 * Response for POST /api/admin/sessions
 */
export interface CreateSessionResponse {
  session: Session
}

/**
 * Request body for PATCH /api/admin/sessions/:id
 */
export interface UpdateSessionRequest {
  programId?: string | null // Can update or remove program link
  title?: string
  description?: string | null
  sessionType?: 'in-person' | 'virtual' | 'hybrid'
  sessionDate?: string
  duration?: string | null
  location?: string | null
  meetingUrl?: string | null
  instructors?: string[] | null
  materials?: Array<{
    title: string
    url: string
    type: string
  }> | null
  isActive?: boolean
}

/**
 * Response for PATCH /api/admin/sessions/:id
 */
export interface UpdateSessionResponse {
  session: Session
}

/**
 * Response for DELETE /api/admin/sessions/:id (soft delete)
 */
export interface DeleteSessionResponse {
  session: Session
}

/**
 * Response for GET /api/admin/sessions
 */
export interface GetAllSessionsResponse {
  sessions: SessionWithActivityCount[]
}

// ============================================================================
// Program Enrollment Types
// ============================================================================

/**
 * Program enrollment with user and profile data
 */
export interface ProgramEnrollmentWithUser {
  id: string
  userId: string
  programId: string
  status: 'enrolled' | 'completed' | 'dropped'
  enrolledAt: string
  completedAt: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    username: string | null
    email: string | null
    displayName: string | null
    avatarUrl: string | null
  }
}

/**
 * Response for GET /api/admin/programs/:id/enrollments
 */
export interface GetProgramEnrollmentsResponse {
  enrollments: ProgramEnrollmentWithUser[]
}

/**
 * Request body for POST /api/admin/programs/:id/enrollments
 */
export interface CreateEnrollmentRequest {
  userId: string
  status?: 'enrolled' | 'completed' | 'dropped'
  enrolledAt?: string
  completedAt?: string | null
}

/**
 * Response for POST /api/admin/programs/:id/enrollments
 */
export interface CreateEnrollmentResponse {
  enrollment: ProgramEnrollment
}

/**
 * Request body for PATCH /api/admin/programs/:id/enrollments/:enrollmentId
 */
export interface UpdateEnrollmentRequest {
  status?: 'enrolled' | 'completed' | 'dropped'
  completedAt?: string | null
}

/**
 * Response for PATCH /api/admin/programs/:id/enrollments/:enrollmentId
 */
export interface UpdateEnrollmentResponse {
  enrollment: ProgramEnrollment
}

/**
 * Response for DELETE /api/admin/programs/:id/enrollments/:enrollmentId
 */
export interface DeleteEnrollmentResponse {
  enrollment: ProgramEnrollment
}

/**
 * Response for GET /api/admin/sessions/:id
 */
export interface GetSessionResponse {
  session: SessionWithProgram
}

/**
 * Response for GET /api/admin/programs/:id/sessions
 */
export interface GetProgramSessionsResponse {
  sessions: SessionWithActivityCount[]
}

/**
 * Session-Activity link
 */
export interface SessionActivityLink {
  id: string
  sessionId: string
  activityId: string
  orderIndex: number | null
  createdAt: string
}

/**
 * Session-Activity link with activity details
 */
export interface SessionActivityLinkWithDetails {
  id: string
  activityId: string
  orderIndex: number | null
  activity: {
    id: string
    title: string
    description: string | null
    activityType: string
    isActive: boolean
  }
}

/**
 * Request body for POST /api/admin/sessions/:id/activities
 */
export interface LinkSessionActivityRequest {
  activityId: string
  orderIndex?: number
}

/**
 * Response for POST /api/admin/sessions/:id/activities
 */
export interface LinkSessionActivityResponse {
  link: SessionActivityLink
}

/**
 * Response for GET /api/admin/sessions/:id/activities
 */
export interface GetSessionActivitiesResponse {
  activities: SessionActivityLinkWithDetails[]
}

/**
 * Response for DELETE /api/admin/sessions/:sessionId/activities/:activityId
 */
export interface UnlinkSessionActivityResponse {
  link: SessionActivityLink
}

// ============================================================================
// Public Programs (Phase 1)
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
// Public Sessions (Phase 1)
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
// Public Projects (Phase 1)
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
