/**
 * Profile Hooks - TanStack Query hooks for profile operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createProfile,
  uploadAvatar,
  deleteAvatar,
} from '@/services/profile'
import type { ProfileFormData } from '@/lib/validators/profile'

/**
 * Hook to create or update a profile
 * Invalidates the "me" query on success to refetch user data
 */
export function useCreateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ProfileFormData) => createProfile(data),
    onSuccess: () => {
      // Invalidate and refetch user data to get updated profile
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
  })
}

/**
 * Hook to upload user avatar
 * Returns the new avatar URL on success
 *
 * @example
 * ```typescript
 * const uploadAvatarMutation = useUploadAvatar()
 *
 * const handleFileSelect = async (file: File) => {
 *   try {
 *     const avatarUrl = await uploadAvatarMutation.mutateAsync(file)
 *     console.log('New avatar URL:', avatarUrl)
 *   } catch (error) {
 *     toast.error('Failed to upload avatar')
 *   }
 * }
 * ```
 */
export function useUploadAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => uploadAvatar(file),
    onSuccess: () => {
      // Invalidate auth query to refetch user data with new avatar
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
  })
}

/**
 * Hook to delete user avatar
 * Reverts to fallback avatar (blo or initials)
 *
 * @example
 * ```typescript
 * const deleteAvatarMutation = useDeleteAvatar()
 *
 * const handleDelete = async () => {
 *   try {
 *     await deleteAvatarMutation.mutateAsync()
 *     toast.success('Avatar deleted')
 *   } catch (error) {
 *     toast.error('Failed to delete avatar')
 *   }
 * }
 * ```
 */
export function useDeleteAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteAvatar(),
    onSuccess: () => {
      // Invalidate auth query to refetch user data
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
  })
}
