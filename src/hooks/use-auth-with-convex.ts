'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

/**
 * Unified Auth Hook with Convex + Privy
 *
 * Combines Privy authentication with Convex user management.
 * Returns raw Convex data types - does not transform to API types.
 */
export function useAuthWithConvex() {
  const { authenticated, ready, user: privyUser } = usePrivy()

  // Get privyDid from Privy user
  const privyDid = privyUser?.id

  // Query Convex for current user
  const currentUserData = useQuery(
    api.auth.getCurrentUser,
    privyDid ? { privyDid } : 'skip'
  )

  // Login mutation (get or create user)
  const loginMutation = useMutation(api.auth.getOrCreateUser)

  // Update last login
  const updateLastLogin = useMutation(api.auth.updateLastLogin)

  // Create user in Convex after Privy login
  const handleLogin = async () => {
    if (!privyDid) return null

    // Determine auth method and email
    const email = privyUser?.email?.address
    const linkedAccounts = privyUser?.linkedAccounts || []

    // Find login method
    let loginMethod = 'email'
    let primaryAuthMethod: 'email' | 'wallet' | 'social' = 'email'

    for (const account of linkedAccounts) {
      if (account.type === 'github_oauth') {
        loginMethod = 'github'
        primaryAuthMethod = 'social'
        break
      } else if (account.type === 'google_oauth') {
        loginMethod = 'google'
        primaryAuthMethod = 'social'
        break
      } else if (account.type === 'twitter_oauth') {
        loginMethod = 'twitter'
        primaryAuthMethod = 'social'
        break
      } else if (account.type === 'discord_oauth') {
        loginMethod = 'discord'
        primaryAuthMethod = 'social'
        break
      } else if (account.type === 'wallet') {
        primaryAuthMethod = 'wallet'
      }
    }

    // Get wallet addresses
    const wallet = privyUser?.wallet
    const appWallet = wallet?.address

    try {
      const result = await loginMutation({
        privyDid,
        email,
        appWallet,
        primaryAuthMethod,
        loginMethod,
      })

      // Update last login
      await updateLastLogin({ privyDid })

      return result
    } catch (error) {
      console.error('Error creating user in Convex:', error)
      throw error
    }
  }

  return {
    // Auth state
    isAuthenticated: authenticated && !!currentUserData?.user,
    isLoading: !ready || currentUserData === undefined,
    isReady: ready,

    // User data (raw Convex types)
    user: currentUserData?.user ?? null,
    profile: currentUserData?.profile ?? null,
    privyDid,
    privyUser,

    // Actions
    handleLogin,
  }
}

/**
 * Hook for the onboarding form submission
 */
export function useOnboardingSubmit() {
  const { privyDid } = useAuthWithConvex()
  const submitApplication = useMutation(api.applications.submit)

  const submit = async (data: {
    programId?: string
    goal: string
    motivationText: string
    githubUsername?: string
    twitterUsername?: string
    linkedinUrl?: string
    telegramUsername?: string
  }) => {
    if (!privyDid) {
      throw new Error('Not authenticated')
    }

    return await submitApplication({
      privyDid,
      ...data,
    })
  }

  return { submit }
}

/**
 * Hook to update current user profile
 */
export function useUpdateCurrentUserConvex() {
  const { privyDid } = useAuthWithConvex()
  const updateUser = useMutation(api.auth.updateCurrentUser)

  const update = async (data: {
    username?: string
    email?: string
    displayName?: string
    bio?: string
    avatarUrl?: string
  }) => {
    if (!privyDid) {
      throw new Error('Not authenticated')
    }

    return await updateUser({
      privyDid,
      ...data,
    })
  }

  return { update }
}
