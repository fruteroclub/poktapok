/**
 * Projects API Service
 *
 * API communication layer for project operations
 * Uses apiFetch wrapper for automatic error handling
 */

import { apiFetch } from '@/lib/api/fetch';
import type {
  CreateProjectResponse,
  UpdateProjectResponse,
  DeleteProjectResponse,
  GetProjectResponse,
  ListProjectsResponse,
  PublishProjectResponse,
  ListProjectsQuery,
} from '@/types/api-v1';

/**
 * Create a new project
 */
export async function createProject(
  data: FormData | Record<string, unknown>
): Promise<CreateProjectResponse> {
  return apiFetch<CreateProjectResponse>('/api/projects', {
    method: 'POST',
    headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
}

/**
 * Update an existing project
 */
export async function updateProject(
  id: string,
  data: FormData | Record<string, unknown>
): Promise<UpdateProjectResponse> {
  return apiFetch<UpdateProjectResponse>(`/api/projects/${id}`, {
    method: 'PUT',
    headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
}

/**
 * Delete a project (soft delete)
 */
export async function deleteProject(id: string): Promise<DeleteProjectResponse> {
  return apiFetch<DeleteProjectResponse>(`/api/projects/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Fetch a single project by ID
 */
export async function fetchProject(id: string): Promise<GetProjectResponse> {
  return apiFetch<GetProjectResponse>(`/api/projects/${id}`);
}

/**
 * Fetch projects with optional filters
 */
export async function fetchProjects(
  filters?: ListProjectsQuery
): Promise<ListProjectsResponse> {
  const params = new URLSearchParams();

  if (filters?.userId) params.append('userId', filters.userId);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.type) params.append('type', filters.type);
  if (filters?.featured !== undefined) params.append('featured', String(filters.featured));
  if (filters?.limit !== undefined) params.append('limit', String(filters.limit));
  if (filters?.offset !== undefined) params.append('offset', String(filters.offset));

  const queryString = params.toString();
  const url = queryString ? `/api/projects?${queryString}` : '/api/projects';

  return apiFetch<ListProjectsResponse>(url);
}

/**
 * Toggle project publish status
 */
export async function publishProject(id: string): Promise<PublishProjectResponse> {
  return apiFetch<PublishProjectResponse>(`/api/projects/${id}/publish`, {
    method: 'PATCH',
  });
}
