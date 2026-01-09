'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchActivePrograms, submitApplication } from '@/services/onboarding'
import type { SubmitApplicationRequest } from '@/types/api-v1'

/**
 * Hook to fetch list of active programs for onboarding
 *
 * @returns React Query result with programs list
 *
 * @example
 * const { data, isLoading, error } = useActivePrograms();
 *
 * if (isLoading) return <div>Loading programs...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 *
 * const programs = data?.programs || [];
 */
export function useActivePrograms() {
  return useQuery({
    queryKey: ['programs', 'active'],
    queryFn: fetchActivePrograms,
    staleTime: 5 * 60 * 1000, // 5 minutes (programs don't change often)
  })
}

/**
 * Hook to submit onboarding application
 *
 * @returns React Query mutation for submitting application
 *
 * @example
 * const submitMutation = useSubmitApplication();
 *
 * const handleSubmit = () => {
 *   submitMutation.mutate({
 *     programId: 'uuid',
 *     goal: 'My 1-month goal...',
 *     githubUsername: 'username',
 *   }, {
 *     onSuccess: () => {
 *       router.push('/profile');
 *     },
 *     onError: (error) => {
 *       toast.error(error.message);
 *     }
 *   });
 * };
 */
export function useSubmitApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SubmitApplicationRequest) => submitApplication(data),
    onSuccess: () => {
      // Invalidate auth query to refetch user with updated status
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
  })
}
