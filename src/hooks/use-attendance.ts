/**
 * Attendance hooks for admin operations
 * TanStack Query hooks for attendance management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  markAttendance,
  bulkMarkAttendance,
  fetchSessionAttendance,
} from '@/services/attendance'
import type { ApiError } from '@/lib/api/fetch'
import type {
  MarkAttendanceRequest,
  BulkAttendanceRequest,
} from '@/types/api-v1'

/**
 * Hook to fetch session attendance
 */
export function useSessionAttendance(sessionId: string) {
  return useQuery({
    queryKey: ['admin', 'attendance', 'session', sessionId],
    queryFn: () => fetchSessionAttendance(sessionId),
    enabled: !!sessionId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

/**
 * Hook to mark attendance for users
 */
export function useMarkAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: MarkAttendanceRequest) => markAttendance(data),
    onSuccess: (_, variables) => {
      // Invalidate session attendance query
      queryClient.invalidateQueries({
        queryKey: ['admin', 'attendance', 'session', variables.sessionId],
      })
      // Invalidate eligibility queries that depend on attendance
      queryClient.invalidateQueries({
        queryKey: ['admin', 'eligibility'],
      })
    },
    onError: (error: ApiError) => {
      console.error('Failed to mark attendance:', error)
    },
  })
}

/**
 * Hook to bulk mark attendance
 */
export function useBulkMarkAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BulkAttendanceRequest) => bulkMarkAttendance(data),
    onSuccess: (_, variables) => {
      // Invalidate session attendance query
      queryClient.invalidateQueries({
        queryKey: ['admin', 'attendance', 'session', variables.sessionId],
      })
      // Invalidate eligibility queries
      queryClient.invalidateQueries({
        queryKey: ['admin', 'eligibility'],
      })
    },
    onError: (error: ApiError) => {
      console.error('Failed to mark bulk attendance:', error)
    },
  })
}
