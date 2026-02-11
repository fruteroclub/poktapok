'use client'

import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { usePrivy } from '@privy-io/react-auth'

/**
 * Onboarding hooks using Convex
 *
 * Handles the onboarding flow with Convex backend.
 */

/**
 * Hook to submit onboarding application
 */
export function useSubmitApplicationConvex() {
  const { user: privyUser } = usePrivy()
  const submitMutation = useMutation(api.applications.submit)

  const submit = async (data: {
    programId?: string
    goal: string
    motivationText: string
    githubUsername?: string
    twitterUsername?: string
    linkedinUrl?: string
    telegramUsername?: string
  }) => {
    if (!privyUser?.id) {
      throw new Error('Not authenticated')
    }

    return await submitMutation({
      privyDid: privyUser.id,
      programId: data.programId,
      goal: data.goal,
      motivationText: data.motivationText,
      githubUsername: data.githubUsername,
      twitterUsername: data.twitterUsername,
      linkedinUrl: data.linkedinUrl,
      telegramUsername: data.telegramUsername,
    })
  }

  return {
    submit,
    // For compatibility with the old mutation pattern
    mutate: (
      data: Parameters<typeof submit>[0],
      options?: {
        onSuccess?: () => void
        onError?: (error: Error) => void
      }
    ) => {
      submit(data)
        .then(() => options?.onSuccess?.())
        .catch((error) => options?.onError?.(error))
    },
    mutateAsync: submit,
    isPending: false, // Convex mutations don't have this built-in
  }
}

/**
 * Hook to get active programs for selection
 */
export function useActivePrograms() {
  // For now, programs are optional - return empty array
  // TODO: Implement programs query when needed
  return {
    data: { programs: [] },
    isLoading: false,
    error: null,
  }
}

/**
 * Hook to get current user's application status
 */
export function useMyApplicationConvex() {
  const { user: privyUser } = usePrivy()
  const privyDid = privyUser?.id

  return useQuery(
    api.applications.getByUser,
    privyDid ? { privyDid } : 'skip'
  )
}
