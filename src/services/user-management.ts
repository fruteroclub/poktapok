import { apiFetch } from '@/lib/api/fetch'

/**
 * User Management Service Layer
 *
 * Provides typed functions for all user management API calls
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface User {
  id: string
  username: string | null
  displayName: string | null
  email: string | null
  avatarUrl: string | null
  role: 'member' | 'moderator' | 'admin'
  accountStatus: 'active' | 'pending' | 'suspended' | 'banned'
  createdAt: string
  stats: {
    totalEarnings: string
    submissionsCount: number
    approvedCount: number
    activitiesCompleted: number
  }
  profile: {
    city: string | null
    country: string | null
    learningTracks: string[]
  } | null
}

export interface UserDetails {
  id: string
  username: string | null
  displayName: string | null
  email: string | null
  avatarUrl: string | null
  appWallet: string | null
  role: 'member' | 'moderator' | 'admin'
  accountStatus: 'active' | 'pending' | 'suspended' | 'banned'
  primaryAuthMethod: string
  createdAt: string
  updatedAt: string
  profile: {
    bio: string | null
    city: string | null
    country: string | null
    countryCode: string | null
    timezone: string | null
    learningTracks: string[]
    githubUrl: string | null
    linkedinUrl: string | null
    twitterUrl: string | null
    telegramUrl: string | null
    websiteUrl: string | null
  } | null
  stats: {
    totalEarnings: string
    submissionsCount: number
    approvedCount: number
    rejectedCount: number
    pendingCount: number
    activitiesCompleted: number
  }
  recentSubmissions: Array<{
    id: string
    activityId: string
    activityTitle: string
    status: string
    submittedAt: string
    rewardPulpaAmount: string | null
  }>
}

export interface ListUsersFilters {
  search?: string
  role?: string
  accountStatus?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface ListUsersResponse {
  users: User[]
  pagination: {
    total: number
    page: number
    limit: number
    hasMore: boolean
  }
}

export interface UserDetailsResponse {
  user: UserDetails
}

export interface UpdateRoleRequest {
  role: 'member' | 'moderator' | 'admin'
  reason?: string
}

export interface UpdateRoleResponse {
  userId: string
  oldRole: string
  newRole: string
  updatedAt: string
}

export interface UpdateStatusRequest {
  accountStatus: 'active' | 'suspended' | 'banned'
  reason?: string
}

export interface UpdateStatusResponse {
  userId: string
  oldStatus: string
  newStatus: string
  reason: string | null
  updatedAt: string
}

// ============================================================================
// API Service Functions
// ============================================================================

/**
 * Fetch paginated list of users with filters
 */
export async function fetchUsers(
  filters?: ListUsersFilters
): Promise<ListUsersResponse> {
  const params = new URLSearchParams()

  if (filters?.search) params.append('search', filters.search)
  if (filters?.role) params.append('role', filters.role)
  if (filters?.accountStatus)
    params.append('accountStatus', filters.accountStatus)
  if (filters?.sortBy) params.append('sortBy', filters.sortBy)
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const queryString = params.toString()
  const url = `/api/admin/users${queryString ? `?${queryString}` : ''}`

  return apiFetch<ListUsersResponse>(url)
}

/**
 * Fetch detailed information about a specific user
 */
export async function fetchUserDetails(
  userId: string
): Promise<UserDetailsResponse> {
  return apiFetch<UserDetailsResponse>(`/api/admin/users/${userId}`)
}

/**
 * Update user role
 */
export async function updateUserRole(
  userId: string,
  data: UpdateRoleRequest
): Promise<UpdateRoleResponse> {
  return apiFetch<UpdateRoleResponse>(`/api/admin/users/${userId}/role`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

/**
 * Update user account status
 */
export async function updateUserStatus(
  userId: string,
  data: UpdateStatusRequest
): Promise<UpdateStatusResponse> {
  return apiFetch<UpdateStatusResponse>(`/api/admin/users/${userId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}
