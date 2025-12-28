/**
 * Projects TanStack Query Hooks
 *
 * React Query hooks for project operations
 * Provides queries and mutations with optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ListProjectsQuery } from '@/types/api-v1';
import {
  createProject,
  updateProject,
  deleteProject,
  fetchProject,
  fetchProjects,
  publishProject,
} from '@/services/projects';

/**
 * Query key factory for projects
 */
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters?: ListProjectsQuery) => [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

/**
 * Fetch a single project by ID
 */
export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => fetchProject(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id,
  });
}

/**
 * Fetch projects with optional filters
 */
export function useProjects(filters?: ListProjectsQuery) {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: () => fetchProjects(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch user's projects
 */
export function useUserProjects(userId?: string, filters?: Omit<ListProjectsQuery, 'userId'>) {
  return useQuery({
    queryKey: projectKeys.list({ ...filters, userId }),
    queryFn: () => fetchProjects({ ...filters, userId }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!userId,
  });
}

/**
 * Create a new project
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      // Invalidate all project lists to refetch
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

/**
 * Update an existing project
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData | Record<string, unknown> }) =>
      updateProject(id, data),
    onSuccess: (response) => {
      // Invalidate the specific project detail
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(response.project.id) });
      // Invalidate all project lists
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

/**
 * Delete a project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: (response) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: projectKeys.detail(response.projectId) });
      // Invalidate all project lists
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

/**
 * Toggle project publish status
 */
export function usePublishProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publishProject,
    onSuccess: (response) => {
      // Invalidate the specific project detail
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(response.project.id) });
      // Invalidate all project lists
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}
