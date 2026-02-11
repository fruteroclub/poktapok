/**
 * DEPRECATED: Use useAuthWithConvex from './use-auth-with-convex'
 *
 * This is a compatibility stub that wraps the Convex implementation.
 */

'use client'

import { useAuthWithConvex } from './use-auth-with-convex'

export function useAuth() {
  const auth = useAuthWithConvex()

  return {
    user: auth.user,
    profile: auth.profile,
    isLoading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,
    refetch: () => {}, // No-op, Convex is real-time
  }
}
