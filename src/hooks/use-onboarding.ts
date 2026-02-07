'use client'

import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

/**
 * Hook for active programs (onboarding)
 */
export function useActivePrograms() {
  const result = useQuery(api.programs.listActive)

  // Transform to expected format
  const programs = (result?.programs || []).map((program) => ({
    id: program._id,
    name: program.name,
    description: program.description,
    programType: program.isActive ? 'continuous' : 'cohort',
    startDate: program.startDate,
    endDate: program.endDate,
    status: program.status,
  }))

  return {
    data: { programs },
    isLoading: result === undefined,
    error: null,
  }
}

/**
 * Hook for submitting application
 */
export function useSubmitApplication() {
  const mutation = useMutation(api.applications.submit)

  return {
    mutate: mutation,
    mutateAsync: mutation,
    isPending: false,
  }
}
