/**
 * Admin hooks for pending user management
 * TanStack Query hooks for admin dashboard operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchPendingUsers, approveUser, rejectUser } from '@/services/admin'
import type { ApiError } from '@/lib/api/fetch'

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
