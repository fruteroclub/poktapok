'use client'

/**
 * Program Enrollments Hook
 * 
 * TODO: Add enrollments table to Convex schema
 */
export function useProgramEnrollments(_programId: string) {
  return {
    data: { enrollments: [] },
    isLoading: false,
    isError: false,
    error: null,
  }
}

export function useEnrollInProgram() {
  return {
    mutate: () => {},
    mutateAsync: async () => {},
    isPending: false,
  }
}
