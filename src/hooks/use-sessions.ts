/**
 * Session hooks for public session operations
 * TanStack Query hooks for session browsing and detail views
 */

import { useQuery } from '@tanstack/react-query'
import { fetchPublicSessions, fetchSessionDetail } from '@/services/sessions'
import type { SessionFilters } from '@/types/api-v1'

/**
 * Hook to fetch public sessions list with filtering and pagination
 * No authentication required
 */
export function usePublicSessions(filters?: SessionFilters) {
  return useQuery({
    queryKey: ['sessions', 'public', filters],
    queryFn: () => fetchPublicSessions(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch session detail with conditional meeting URL access
 * Authentication optional - affects meeting URL visibility
 */
export function useSessionDetail(sessionId: string) {
  return useQuery({
    queryKey: ['sessions', sessionId, 'detail'],
    queryFn: () => fetchSessionDetail(sessionId),
    enabled: !!sessionId,
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter for access control changes)
  })
}
