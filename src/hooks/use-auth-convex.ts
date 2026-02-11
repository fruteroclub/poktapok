/**
 * Auth hooks using Convex
 *
 * Integrates with Privy authentication.
 */

import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

/**
 * Get current user by Privy DID
 */
export function useCurrentUser(privyDid: string | undefined) {
  return useQuery(api.auth.getCurrentUser, privyDid ? { privyDid } : 'skip')
}

/**
 * Login mutation (get or create user)
 */
export function useLogin() {
  return useMutation(api.auth.getOrCreateUser)
}

/**
 * Update current user profile
 */
export function useUpdateCurrentUser() {
  return useMutation(api.auth.updateCurrentUser)
}

/**
 * Check if username is available
 */
export function useCheckUsername(username: string | undefined) {
  return useQuery(api.auth.checkUsername, username ? { username } : 'skip')
}

/**
 * Update last login timestamp
 */
export function useUpdateLastLogin() {
  return useMutation(api.auth.updateLastLogin)
}
