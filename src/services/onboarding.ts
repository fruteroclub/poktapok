/**
 * Onboarding Service - API abstractions for onboarding flow
 */

import { apiFetch } from '@/lib/api/fetch'
import type {
  ActiveProgramsResponse,
  SubmitApplicationRequest,
  SubmitApplicationResponse,
} from '@/types/api-v1'

/**
 * Fetch list of active programs for onboarding selection
 *
 * @returns {Promise<ActiveProgramsResponse>} List of active programs
 * @throws ApiError if request fails
 */
export async function fetchActivePrograms(): Promise<ActiveProgramsResponse> {
  return apiFetch<ActiveProgramsResponse>('/api/programs/active')
}

/**
 * Submit onboarding application with program selection and goal
 *
 * @param data - Application data (programId, goal, optional social accounts)
 * @returns {Promise<SubmitApplicationResponse>} Created application
 * @throws ApiError if request fails (validation, duplicate, etc.)
 */
export async function submitApplication(
  data: SubmitApplicationRequest,
): Promise<SubmitApplicationResponse> {
  return apiFetch<SubmitApplicationResponse>('/api/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}
