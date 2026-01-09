/**
 * Admin service functions for pending user management
 * Abstracts API calls for admin dashboard operations
 */

import { apiFetch } from '@/lib/api/fetch'
import type {
  ListPendingUsersResponse,
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
} from '@/types/api-v1'

/**
 * Fetch all pending users with their profile data
 */
export async function fetchPendingUsers(): Promise<ListPendingUsersResponse> {
  return apiFetch<ListPendingUsersResponse>('/api/admin/pending-users')
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
