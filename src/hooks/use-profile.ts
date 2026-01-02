/**
 * Profile Hooks - TanStack Query hooks for profile operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createProfile } from '@/services/profile'
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
