/**
 * Program service functions for user-facing operations
 * Abstracts API calls for program dashboard and activities
 */

import { apiFetch } from '@/lib/api/fetch'
import type {
  ProgramDashboardResponse,
  ProgramSessionsResponse,
  PublicProgramResponse,
} from '@/types/api-v1'

/**
 * Fetch program dashboard data for current user
 */
export async function fetchProgramDashboard(
  programId: string,
): Promise<ProgramDashboardResponse> {
  return apiFetch<ProgramDashboardResponse>(
    `/api/programs/${programId}/dashboard`,
  )
}

/**
 * Fetch program sessions
 */
export async function fetchProgramSessions(
  programId: string,
  upcoming = false,
): Promise<ProgramSessionsResponse> {
  const params = new URLSearchParams()
  if (upcoming) params.append('upcoming', 'true')

  const queryString = params.toString()
  const url = `/api/programs/${programId}/sessions${queryString ? `?${queryString}` : ''}`

  return apiFetch<ProgramSessionsResponse>(url)
}

/**
 * Fetch public program detail
 * No authentication required
 */
export async function fetchPublicProgram(
  programId: string,
): Promise<PublicProgramResponse> {
  return apiFetch<PublicProgramResponse>(`/api/programs/${programId}`)
}
