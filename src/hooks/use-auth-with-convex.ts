'use client'

import { useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuthStore } from '@/store/auth-store'
import { toApiUser, toApiProfile } from '@/lib/convex-transforms'

/**
 * Unified Auth Hook with Convex + Privy
 *
 * Combines Privy authentication with Convex user management.
 * Syncs Convex data to Zustand store using type transforms.
 */
export function useAuthWithConvex() {
  const { authenticated, ready, user: privyUser } = usePrivy()
  const { setAuthData, setLoading, clearAuth } = useAuthStore()

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

  // Sync Convex data to Zustand store
  useEffect(() => {
    if (!ready) {
      setLoading(true)
      return
    }

    if (!authenticated || !privyDid) {
      clearAuth()
      return
    }

    if (currentUserData === undefined) {
      // Still loading from Convex
      setLoading(true)
      return
    }

    if (currentUserData) {
      // Transform Convex types to API types and sync to store
      const apiUser = toApiUser(currentUserData.user)
      const apiProfile = currentUserData.profile
        ? toApiProfile(currentUserData.profile)
        : null

      setAuthData({
        user: apiUser,
        profile: apiProfile,
      })
    } else {
      // User doesn't exist in Convex yet
      clearAuth()
    }
  }, [ready, authenticated, privyDid, currentUserData, setAuthData, setLoading, clearAuth])

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

      // Transform and sync to store
      if (result.user) {
        const apiUser = toApiUser(result.user)
        const apiProfile = result.profile
          ? toApiProfile(result.profile)
          : null

        setAuthData({
          user: apiUser,
          profile: apiProfile,
        })
      }

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

    // User data (API types for compatibility)
    user: currentUserData?.user ? toApiUser(currentUserData.user) : null,
    profile: currentUserData?.profile
      ? toApiProfile(currentUserData.profile)
      : null,

    // Raw Convex data (for components that need it)
    convexUser: currentUserData?.user ?? null,
    convexProfile: currentUserData?.profile ?? null,

    // Privy data
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
 * Hook to update current user
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
