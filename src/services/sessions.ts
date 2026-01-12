/**
 * Session service functions for public session operations
 * Abstracts API calls for session browsing and detail views
 */

import { apiFetch } from '@/lib/api/fetch'
import type {
  PublicSessionsResponse,
  SessionDetailResponse,
  SessionFilters,
} from '@/types/api-v1'

/**
 * Fetch public sessions list with filtering and pagination
 * No authentication required
 */
export async function fetchPublicSessions(
  filters?: SessionFilters,
): Promise<PublicSessionsResponse> {
  const params = new URLSearchParams()

  if (filters?.upcoming) params.append('upcoming', 'true')
  if (filters?.programId) params.append('programId', filters.programId)
  if (filters?.standalone) params.append('standalone', 'true')
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const queryString = params.toString()
  const url = `/api/sessions${queryString ? `?${queryString}` : ''}`

  return apiFetch<PublicSessionsResponse>(url)
}

/**
 * Fetch session detail with conditional meeting URL access
 * Authentication optional - affects meeting URL visibility
 */
export async function fetchSessionDetail(
  sessionId: string,
): Promise<SessionDetailResponse> {
  return apiFetch<SessionDetailResponse>(`/api/sessions/${sessionId}`)
}
