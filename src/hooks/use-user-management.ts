import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchUsers,
  fetchUserDetails,
  updateUserRole,
  updateUserStatus,
  type ListUsersFilters,
  type UpdateRoleRequest,
  type UpdateStatusRequest,
} from '@/services/user-management'

/**
 * React Query hooks for user management
 */

/**
 * Fetch list of users with filters
 */
export function useUsers(filters?: ListUsersFilters) {
  return useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: () => fetchUsers(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Fetch detailed information about a specific user
 */
export function useUserDetails(userId: string) {
  return useQuery({
    queryKey: ['admin', 'users', userId],
    queryFn: () => fetchUserDetails(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Update user role mutation
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      ...data
    }: UpdateRoleRequest & { userId: string }) =>
      updateUserRole(userId, data),
    onSuccess: (_, { userId }) => {
      // Invalidate users list and specific user details
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId] })
    },
  })
}

/**
 * Update user status mutation
 */
export function useUpdateUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      ...data
    }: UpdateStatusRequest & { userId: string }) =>
      updateUserStatus(userId, data),
    onSuccess: (_, { userId }) => {
      // Invalidate users list and specific user details
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId] })
    },
  })
}
