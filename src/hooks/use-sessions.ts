'use client'

import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'

/**
 * Hook for public sessions
 */
export function usePublicSessions() {
  const result = useQuery(api.sessions.listPublic, {})

  return {
    data: result ?? { sessions: [] },
    isLoading: result === undefined,
    isError: false,
    error: null,
  }
}

/**
 * Hook for all sessions (admin)
 */
export function useAllSessions() {
  const result = useQuery(api.sessions.listAll)

  return {
    data: result ?? { sessions: [] },
    isLoading: result === undefined,
    isError: false,
    error: null,
  }
}

/**
 * Hook for session detail
 */
export function useSessionDetail(sessionId: string) {
  const result = useQuery(
    api.sessions.getById,
    sessionId ? { sessionId: sessionId as Id<'sessions'> } : 'skip'
  )

  return {
    data: result ?? null,
    isLoading: result === undefined,
    isError: false,
    error: null,
  }
}

/**
 * Alias for useSessionDetail
 */
export function useSession(sessionId: string) {
  return useSessionDetail(sessionId)
}

/**
 * Hook for creating a session
 */
export function useCreateSession() {
  const mutation = useMutation(api.sessions.create)

  return {
    mutate: mutation,
    mutateAsync: mutation,
    isPending: false,
  }
}

/**
 * Hook for updating a session
 */
export function useUpdateSession() {
  const mutation = useMutation(api.sessions.update)

  return {
    mutate: mutation,
    mutateAsync: mutation,
    isPending: false,
  }
}

/**
 * Hook for deleting a session
 */
export function useDeleteSession() {
  const mutation = useMutation(api.sessions.remove)

  return {
    mutate: mutation,
    mutateAsync: mutation,
    isPending: false,
  }
}
