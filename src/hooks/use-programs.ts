/**
 * Program hooks for user-facing operations
 * TanStack Query hooks for program dashboard and activities
 */

import { useQuery } from '@tanstack/react-query'
import {
  fetchProgramDashboard,
  fetchProgramSessions,
  fetchPublicProgram,
} from '@/services/programs'

/**
 * Hook to fetch program dashboard data
 */
export function useProgramDashboard(programId: string) {
  return useQuery({
    queryKey: ['programs', programId, 'dashboard'],
    queryFn: () => fetchProgramDashboard(programId),
    enabled: !!programId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch program sessions
 */
export function useProgramSessions(programId: string, upcoming = false) {
  return useQuery({
    queryKey: ['programs', programId, 'sessions', { upcoming }],
    queryFn: () => fetchProgramSessions(programId, upcoming),
    enabled: !!programId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch public program detail
 * No authentication required
 */
export function usePublicProgram(programId: string) {
  return useQuery({
    queryKey: ['programs', programId, 'public'],
    queryFn: () => fetchPublicProgram(programId),
    enabled: !!programId,
    staleTime: 10 * 60 * 1000, // 10 minutes (public data, less volatile)
  })
}
