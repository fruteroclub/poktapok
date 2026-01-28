/**
 * Admin service functions for pending user management
 * Abstracts API calls for admin dashboard operations
 */

import { apiFetch } from '@/lib/api/fetch'
import type {
  ListPendingUsersResponse,
  ListUsersResponse,
  ApproveUserResponse,
  RejectUserResponse,
  ApproveApplicationRequest,
  ApproveApplicationResponse,
  PromoteUserRequest,
  PromoteUserResponse,
  PromotionEligibilityResponse,
  ListApplicationsQuery,
  ListApplicationsResponse,
  GetApplicationDetailResponse,
  ApplicationStatsResponse,
  CreateProgramRequest,
  CreateProgramResponse,
  UpdateProgramRequest,
  UpdateProgramResponse,
  DeleteProgramResponse,
  GetAllProgramsResponse,
  GetProgramResponse,
  LinkActivityRequest,
  LinkActivityResponse,
  GetProgramActivitiesResponse,
  UpdateActivityLinkRequest,
  UpdateActivityLinkResponse,
  UnlinkActivityResponse,
  CreateSessionRequest,
  CreateSessionResponse,
  UpdateSessionRequest,
  UpdateSessionResponse,
  DeleteSessionResponse,
  GetAllSessionsResponse,
  GetSessionResponse,
  GetProgramSessionsResponse,
  LinkSessionActivityRequest,
  LinkSessionActivityResponse,
  GetSessionActivitiesResponse,
  UnlinkSessionActivityResponse,
} from '@/types/api-v1'

/**
 * Fetch all pending users with their profile data
 */
export async function fetchPendingUsers(): Promise<ListPendingUsersResponse> {
  return apiFetch<ListPendingUsersResponse>('/api/admin/pending-users')
}

/**
 * Fetch all users (for admin operations)
 */
export async function fetchAllUsers(): Promise<ListUsersResponse> {
  return apiFetch<ListUsersResponse>('/api/admin/users')
}

/**
 * Approve a pending user (set accountStatus to 'active')
 */
export async function approveUser(
  userId: string,
): Promise<ApproveUserResponse> {
  return apiFetch<ApproveUserResponse>(`/api/admin/users/${userId}/approve`, {
    method: 'POST',
  })
}

/**
 * Reject a pending user (set accountStatus to 'rejected')
 */
export async function rejectUser(userId: string): Promise<RejectUserResponse> {
  return apiFetch<RejectUserResponse>(`/api/admin/users/${userId}/reject`, {
    method: 'POST',
  })
}

/**
 * Approve or reject an application
 */
export async function approveApplication(
  applicationId: string,
  data: ApproveApplicationRequest,
): Promise<ApproveApplicationResponse> {
  return apiFetch<ApproveApplicationResponse>(
    `/api/admin/applications/${applicationId}/approve`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
  )
}

/**
 * Promote a guest user to full member
 */
export async function promoteUser(
  userId: string,
  data: PromoteUserRequest,
): Promise<PromoteUserResponse> {
  return apiFetch<PromoteUserResponse>(`/api/admin/users/${userId}/promote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

/**
 * Get promotion eligibility for a user
 */
export async function getPromotionEligibility(
  userId: string,
  enrollmentId: string,
): Promise<PromotionEligibilityResponse> {
  return apiFetch<PromotionEligibilityResponse>(
    `/api/admin/users/${userId}/eligibility?enrollmentId=${enrollmentId}`,
  )
}

/**
 * Fetch applications list with filtering and pagination
 */
export async function fetchApplications(
  query?: ListApplicationsQuery,
): Promise<ListApplicationsResponse> {
  const params = new URLSearchParams()

  if (query?.status) params.append('status', query.status)
  if (query?.programId) params.append('programId', query.programId)
  if (query?.page) params.append('page', query.page.toString())
  if (query?.limit) params.append('limit', query.limit.toString())

  const queryString = params.toString()
  const url = `/api/admin/applications${queryString ? `?${queryString}` : ''}`

  return apiFetch<ListApplicationsResponse>(url)
}

/**
 * Fetch single application detail
 */
export async function fetchApplicationDetail(
  applicationId: string,
): Promise<GetApplicationDetailResponse> {
  return apiFetch<GetApplicationDetailResponse>(
    `/api/admin/applications/${applicationId}`,
  )
}

/**
 * Fetch application statistics
 */
export async function fetchApplicationStats(): Promise<ApplicationStatsResponse> {
  return apiFetch<ApplicationStatsResponse>('/api/admin/applications/stats')
}

// ============================================================================
// Program CRUD Operations (E3-T8)
// ============================================================================

/**
 * Fetch all programs (including inactive)
 */
export async function fetchAllPrograms(): Promise<GetAllProgramsResponse> {
  return apiFetch<GetAllProgramsResponse>('/api/admin/programs')
}

/**
 * Fetch single program by ID
 */
export async function fetchProgram(programId: string): Promise<GetProgramResponse> {
  return apiFetch<GetProgramResponse>(`/api/admin/programs/${programId}`)
}

/**
 * Create new program
 */
export async function createProgram(data: CreateProgramRequest): Promise<CreateProgramResponse> {
  return apiFetch<CreateProgramResponse>('/api/admin/programs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

/**
 * Update existing program
 */
export async function updateProgram(
  programId: string,
  data: UpdateProgramRequest
): Promise<UpdateProgramResponse> {
  return apiFetch<UpdateProgramResponse>(`/api/admin/programs/${programId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

/**
 * Delete program (soft delete - sets isActive to false)
 */
export async function deleteProgram(programId: string): Promise<DeleteProgramResponse> {
  return apiFetch<DeleteProgramResponse>(`/api/admin/programs/${programId}`, {
    method: 'DELETE',
  })
}

/**
 * Fetch activities linked to a program
 */
export async function fetchProgramActivities(
  programId: string
): Promise<GetProgramActivitiesResponse> {
  return apiFetch<GetProgramActivitiesResponse>(`/api/admin/programs/${programId}/activities`)
}

/**
 * Link an activity to a program
 */
export async function linkActivityToProgram(
  programId: string,
  data: LinkActivityRequest
): Promise<LinkActivityResponse> {
  return apiFetch<LinkActivityResponse>(`/api/admin/programs/${programId}/activities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

/**
 * Update activity link (isRequired, orderIndex)
 */
export async function updateActivityLink(
  programId: string,
  activityId: string,
  data: UpdateActivityLinkRequest
): Promise<UpdateActivityLinkResponse> {
  return apiFetch<UpdateActivityLinkResponse>(
    `/api/admin/programs/${programId}/activities/${activityId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  )
}

/**
 * Unlink activity from program
 */
export async function unlinkActivityFromProgram(
  programId: string,
  activityId: string
): Promise<UnlinkActivityResponse> {
  return apiFetch<UnlinkActivityResponse>(
    `/api/admin/programs/${programId}/activities/${activityId}`,
    {
      method: 'DELETE',
    }
  )
}

// ============================================================================
// Session CRUD Operations (Epic 3 - Phase 2)
// ============================================================================

/**
 * Fetch all sessions
 */
export async function fetchAllSessions(): Promise<GetAllSessionsResponse> {
  return apiFetch<GetAllSessionsResponse>('/api/admin/sessions')
}

/**
 * Fetch single session by ID
 */
export async function fetchSession(sessionId: string): Promise<GetSessionResponse> {
  return apiFetch<GetSessionResponse>(`/api/admin/sessions/${sessionId}`)
}

/**
 * Create new session
 */
export async function createSession(data: CreateSessionRequest): Promise<CreateSessionResponse> {
  return apiFetch<CreateSessionResponse>('/api/admin/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

/**
 * Update existing session
 */
export async function updateSession(
  sessionId: string,
  data: UpdateSessionRequest
): Promise<UpdateSessionResponse> {
  return apiFetch<UpdateSessionResponse>(`/api/admin/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

/**
 * Delete session (hard delete with cascade)
 */
export async function deleteSession(sessionId: string): Promise<DeleteSessionResponse> {
  return apiFetch<DeleteSessionResponse>(`/api/admin/sessions/${sessionId}`, {
    method: 'DELETE',
  })
}

/**
 * Fetch sessions for a specific program
 */
export async function fetchProgramSessions(
  programId: string
): Promise<GetProgramSessionsResponse> {
  return apiFetch<GetProgramSessionsResponse>(`/api/admin/programs/${programId}/sessions`)
}

/**
 * Fetch activities linked to a session
 */
export async function fetchSessionActivities(
  sessionId: string
): Promise<GetSessionActivitiesResponse> {
  return apiFetch<GetSessionActivitiesResponse>(`/api/admin/sessions/${sessionId}/activities`)
}

/**
 * Link an activity to a session
 */
export async function linkActivityToSession(
  sessionId: string,
  data: LinkSessionActivityRequest
): Promise<LinkSessionActivityResponse> {
  return apiFetch<LinkSessionActivityResponse>(`/api/admin/sessions/${sessionId}/activities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

/**
 * Unlink activity from session
 */
export async function unlinkActivityFromSession(
  sessionId: string,
  activityId: string
): Promise<UnlinkSessionActivityResponse> {
  return apiFetch<UnlinkSessionActivityResponse>(
    `/api/admin/sessions/${sessionId}/activities/${activityId}`,
    {
      method: 'DELETE',
    }
  )
}
