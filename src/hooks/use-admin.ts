/**
 * Admin hooks for pending user management
 * TanStack Query hooks for admin dashboard operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchPendingUsers,
  approveUser,
  rejectUser,
  approveApplication,
  promoteUser,
  getPromotionEligibility,
  fetchApplications,
  fetchApplicationDetail,
  fetchApplicationStats,
  fetchAllPrograms,
  fetchProgram,
  createProgram,
  updateProgram,
  deleteProgram,
  fetchProgramActivities,
  linkActivityToProgram,
  updateActivityLink,
  unlinkActivityFromProgram,
} from '@/services/admin'
import type { ApiError } from '@/lib/api/fetch'
import type {
  ApproveApplicationRequest,
  PromoteUserRequest,
  ListApplicationsQuery,
  UpdateProgramRequest,
  LinkActivityRequest,
  UpdateActivityLinkRequest,
} from '@/types/api-v1'

/**
 * Hook to fetch all pending users with their profiles
 */
export function usePendingUsers() {
  return useQuery({
    queryKey: ['admin', 'pending-users'],
    queryFn: fetchPendingUsers,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook to approve a pending user
 */
export function useApproveUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: approveUser,
    onSuccess: () => {
      // Invalidate pending users query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-users'] })
    },
    onError: (error: ApiError) => {
      console.error('Failed to approve user:', error)
    },
  })
}

/**
 * Hook to reject a pending user
 */
export function useRejectUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: rejectUser,
    onSuccess: () => {
      // Invalidate pending users query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-users'] })
    },
    onError: (error: ApiError) => {
      console.error('Failed to reject user:', error)
    },
  })
}

/**
 * Hook to approve or reject an application
 */
export function useApproveApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      applicationId,
      data,
    }: {
      applicationId: string
      data: ApproveApplicationRequest
    }) => approveApplication(applicationId, data),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-users'] })
    },
    onError: (error: ApiError) => {
      console.error('Failed to approve application:', error)
    },
  })
}

/**
 * Hook to promote a guest user to full member
 */
export function usePromoteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string
      data: PromoteUserRequest
    }) => promoteUser(userId, data),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'eligibility'] })
    },
    onError: (error: ApiError) => {
      console.error('Failed to promote user:', error)
    },
  })
}

/**
 * Hook to fetch promotion eligibility for a user
 */
export function usePromotionEligibility(userId: string, enrollmentId: string) {
  return useQuery({
    queryKey: ['admin', 'eligibility', userId, enrollmentId],
    queryFn: () => getPromotionEligibility(userId, enrollmentId),
    enabled: !!userId && !!enrollmentId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

/**
 * Hook to fetch applications list with filtering
 */
export function useApplications(query?: ListApplicationsQuery) {
  return useQuery({
    queryKey: ['admin', 'applications', query],
    queryFn: () => fetchApplications(query),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook to fetch single application detail
 */
export function useApplicationDetail(applicationId: string) {
  return useQuery({
    queryKey: ['admin', 'applications', applicationId],
    queryFn: () => fetchApplicationDetail(applicationId),
    enabled: !!applicationId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook to fetch application statistics
 */
export function useApplicationStats() {
  return useQuery({
    queryKey: ['admin', 'applications', 'stats'],
    queryFn: fetchApplicationStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ============================================================================
// Program CRUD Hooks (E3-T8)
// ============================================================================

/**
 * Hook to fetch all programs (including inactive)
 */
export function useAllPrograms() {
  return useQuery({
    queryKey: ['admin', 'programs'],
    queryFn: fetchAllPrograms,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch single program
 */
export function useProgram(programId: string | null) {
  return useQuery({
    queryKey: ['admin', 'programs', programId],
    queryFn: () => fetchProgram(programId!),
    enabled: !!programId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to create new program
 */
export function useCreateProgram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProgram,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'programs'] })
    },
  })
}

/**
 * Hook to update existing program
 */
export function useUpdateProgram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ programId, data }: { programId: string; data: UpdateProgramRequest }) =>
      updateProgram(programId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'programs'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'programs', variables.programId] })
    },
  })
}

/**
 * Hook to delete program (soft delete)
 */
export function useDeleteProgram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProgram,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'programs'] })
    },
  })
}

/**
 * Hook to fetch program activities
 */
export function useProgramActivities(programId: string | null) {
  return useQuery({
    queryKey: ['admin', 'programs', programId, 'activities'],
    queryFn: () => fetchProgramActivities(programId!),
    enabled: !!programId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to link activity to program
 */
export function useLinkActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ programId, data }: { programId: string; data: LinkActivityRequest }) =>
      linkActivityToProgram(programId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'programs', variables.programId, 'activities'],
      })
    },
  })
}

/**
 * Hook to update activity link
 */
export function useUpdateActivityLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      programId,
      activityId,
      data,
    }: {
      programId: string
      activityId: string
      data: UpdateActivityLinkRequest
    }) => updateActivityLink(programId, activityId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'programs', variables.programId, 'activities'],
      })
    },
  })
}

/**
 * Hook to unlink activity from program
 */
export function useUnlinkActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ programId, activityId }: { programId: string; activityId: string }) =>
      unlinkActivityFromProgram(programId, activityId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'programs', variables.programId, 'activities'],
      })
    },
  })
}
