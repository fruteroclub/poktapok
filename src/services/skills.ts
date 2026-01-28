/**
 * Skills API Service
 *
 * API communication layer for skills operations
 * Uses apiFetch wrapper for automatic error handling
 */

import { apiFetch } from '@/lib/api/fetch'
import type {
  ListSkillsResponse,
  ListUserSkillsResponse,
  LinkProjectSkillResponse,
  UnlinkProjectSkillResponse,
  ListSkillsQuery,
} from '@/types/api-v1'

/**
 * Fetch all available skills with optional filters
 */
export async function fetchSkills(
  filters?: ListSkillsQuery,
): Promise<ListSkillsResponse> {
  const params = new URLSearchParams()

  if (filters?.category) params.append('category', filters.category)
  if (filters?.search) params.append('search', filters.search)
  if (filters?.limit !== undefined)
    params.append('limit', String(filters.limit))
  if (filters?.offset !== undefined)
    params.append('offset', String(filters.offset))

  const queryString = params.toString()
  const url = queryString ? `/api/skills?${queryString}` : '/api/skills'

  return apiFetch<ListSkillsResponse>(url)
}

/**
 * Fetch user's skills with project counts
 */
export async function fetchUserSkills(
  userId: string,
): Promise<ListUserSkillsResponse> {
  return apiFetch<ListUserSkillsResponse>(`/api/users/${userId}/skills`)
}

/**
 * Link a skill to a project
 */
export async function linkProjectSkill(
  projectId: string,
  skillId: string,
): Promise<LinkProjectSkillResponse> {
  return apiFetch<LinkProjectSkillResponse>(
    `/api/projects/${projectId}/skills`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skillId }),
    },
  )
}

/**
 * Unlink a skill from a project
 */
export async function unlinkProjectSkill(
  projectId: string,
  skillId: string,
): Promise<UnlinkProjectSkillResponse> {
  return apiFetch<UnlinkProjectSkillResponse>(
    `/api/projects/${projectId}/skills/${skillId}`,
    {
      method: 'DELETE',
    },
  )
}
