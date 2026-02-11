/**
 * Bootcamp hooks
 * 
 * Hooks for bootcamp enrollment status and data
 */

import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

/**
 * Check if user is a bootcamp participant
 * Returns enrollment status for navbar conditional rendering
 */
export function useBootcampStatus(userId: Id<'users'> | undefined) {
  return useQuery(
    api.bootcamp.getUserBootcampStatus,
    userId ? { userId } : 'skip'
  )
}

/**
 * Get enrollment details for a specific program
 */
export function useBootcampEnrollment(programSlug: string, userId: Id<'users'> | undefined) {
  return useQuery(
    api.bootcamp.getEnrollmentWithDetails,
    userId ? { programSlug, userId } : 'skip'
  )
}

/**
 * Get enrollment by code (for join page)
 */
export function useEnrollmentByCode(code: string) {
  return useQuery(api.bootcamp.getEnrollmentByCode, { code })
}

/**
 * Mutation to join with code
 */
export function useJoinBootcamp() {
  return useMutation(api.bootcamp.joinWithCode)
}

/**
 * Mutation to submit deliverable
 */
export function useSubmitDeliverable() {
  return useMutation(api.bootcamp.submitDeliverable)
}

/**
 * List all programs (for admin)
 */
export function useBootcampPrograms() {
  return useQuery(api.bootcamp.listPrograms)
}
