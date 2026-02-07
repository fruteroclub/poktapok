'use client'

import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { usePrivy } from '@privy-io/react-auth'

/**
 * Hook for project detail
 */
export function useProject(projectId: string) {
  const result = useQuery(
    api.projects.getById,
    projectId ? { projectId: projectId as Id<'projects'> } : 'skip'
  )

  return {
    data: result ?? null,
    isLoading: result === undefined,
    isError: false,
    error: null,
  }
}

/**
 * Hook for user's projects
 */
export function useUserProjects() {
  const { user } = usePrivy()
  const privyDid = user?.id

  const result = useQuery(
    api.projects.getMyProjects,
    privyDid ? { privyDid } : 'skip'
  )

  return {
    data: result ?? { projects: [] },
    isLoading: result === undefined,
    isError: false,
    error: null,
  }
}

/**
 * Hook for public projects
 */
export function usePublicProjects(options?: { status?: string; limit?: number }) {
  const result = useQuery(api.projects.listPublic, {
    status: options?.status,
    limit: options?.limit,
  })

  return {
    data: result ?? { projects: [] },
    isLoading: result === undefined,
    isError: false,
    error: null,
  }
}

/**
 * Hook for creating a project
 */
export function useCreateProject() {
  const mutation = useMutation(api.projects.create)

  return {
    mutate: mutation,
    mutateAsync: mutation,
    isPending: false,
  }
}

/**
 * Hook for updating a project
 */
export function useUpdateProject() {
  const mutation = useMutation(api.projects.update)

  return {
    mutate: mutation,
    mutateAsync: mutation,
    isPending: false,
  }
}

/**
 * Hook for deleting a project
 */
export function useDeleteProject() {
  const mutation = useMutation(api.projects.remove)

  return {
    mutate: mutation,
    mutateAsync: mutation,
    isPending: false,
  }
}
