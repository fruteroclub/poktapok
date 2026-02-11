'use client'

import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'

/**
 * Hook for public activities
 */
export function usePublicActivities(options?: { status?: string }) {
  const result = useQuery(api.activities.listPublic, {
    status: options?.status,
  })

  return {
    data: result ?? { activities: [] },
    isLoading: result === undefined,
    isError: false,
    error: null,
  }
}

/**
 * Hook for activity detail
 */
export function useActivityDetail(activityId: string) {
  const result = useQuery(
    api.activities.getById,
    activityId ? { activityId: activityId as Id<'activities'> } : 'skip'
  )

  return {
    data: result ?? null,
    isLoading: result === undefined,
    isError: false,
    error: null,
  }
}

/**
 * Hook for submitting activity (placeholder - needs submission table)
 */
export function useSubmitActivity() {
  // TODO: Implement when submissions table is added
  return {
    mutate: () => {},
    mutateAsync: async () => {},
    isPending: false,
  }
}
