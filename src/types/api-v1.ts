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
// Profile API Responses
// ============================================================================

export interface CreateProfileResponse {
  success: boolean
  profile: Profile
  message: string
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
// Admin Types (Admin Dashboard)
// ============================================================================

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
