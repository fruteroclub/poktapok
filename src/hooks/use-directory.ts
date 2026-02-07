'use client'

import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

/**
 * Hook for directory profiles
 */
export function useDirectoryProfiles(options?: { limit?: number }) {
  const result = useQuery(api.profiles.listPublic, {
    limit: options?.limit,
  })

  return {
    data: result ?? { profiles: [] },
    isLoading: result === undefined,
    isError: false,
    error: null,
  }
}
