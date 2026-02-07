'use client'

import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'

/**
 * Hook for active programs
 */
export function useActivePrograms() {
  const result = useQuery(api.programs.listActive)

  return {
    data: result ?? { programs: [] },
    isLoading: result === undefined,
    isError: false,
    error: null,
  }
}

/**
 * Hook for public program
 */
export function usePublicProgram(programId: string) {
  const result = useQuery(
    api.programs.getById,
    programId ? { programId: programId as Id<'programs'> } : 'skip'
  )

  return {
    data: result ?? null,
    isLoading: result === undefined,
    isError: false,
    error: null,
  }
}

/**
 * Hook for program dashboard
 */
export function useProgramDashboard(programId: string) {
  const result = useQuery(
    api.programs.getDashboard,
    programId ? { programId: programId as Id<'programs'> } : 'skip'
  )

  return {
    data: result ?? null,
    isLoading: result === undefined,
    isError: false,
    error: null,
  }
}

/**
 * Hook for program sessions
 */
export function useProgramSessions(programId: string) {
  const result = useQuery(
    api.sessions.getByProgram,
    programId ? { programId: programId as Id<'programs'> } : 'skip'
  )

  return {
    data: result ?? { sessions: [] },
    isLoading: result === undefined,
    isError: false,
    error: null,
  }
}

/**
 * Hook for creating a program
 */
export function useCreateProgram() {
  const mutation = useMutation(api.programs.create)

  return {
    mutate: mutation,
    mutateAsync: mutation,
    isPending: false,
  }
}

/**
 * Hook for updating a program
 */
export function useUpdateProgram() {
  const mutation = useMutation(api.programs.update)

  return {
    mutate: mutation,
    mutateAsync: mutation,
    isPending: false,
  }
}

/**
 * Hook for deleting a program
 */
export function useDeleteProgram() {
  const mutation = useMutation(api.programs.remove)

  return {
    mutate: mutation,
    mutateAsync: mutation,
    isPending: false,
  }
}
