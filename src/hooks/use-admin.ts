'use client'

import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'

/**
 * Hook for pending users (applications)
 */
export function usePendingUsers() {
  const result = useQuery(api.applications.listPending)

  return {
    data: result ?? { pendingUsers: [] },
    isLoading: result === undefined,
    isError: false,
    error: null,
  }
}

/**
 * Hook for approving user
 */
export function useApproveUser() {
  const mutation = useMutation(api.applications.approve)

  return {
    mutate: mutation,
    mutateAsync: mutation,
    isPending: false,
  }
}

/**
 * Hook for rejecting user
 */
export function useRejectUser() {
  const mutation = useMutation(api.applications.reject)

  return {
    mutate: mutation,
    mutateAsync: mutation,
    isPending: false,
  }
}

/**
 * Hook for session attendance (placeholder)
 */
export function useSessionAttendance(_sessionId: string) {
  // TODO: Add attendance table
  return {
    data: null,
    isLoading: false,
    isError: false,
    error: null,
  }
}
