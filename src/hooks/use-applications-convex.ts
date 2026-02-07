/**
 * Application hooks using Convex
 */

import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

/**
 * Get application by current user
 */
export function useMyApplication(privyDid: string | undefined) {
  return useQuery(api.applications.getByUser, privyDid ? { privyDid } : 'skip')
}

/**
 * Submit onboarding application
 */
export function useSubmitApplication() {
  return useMutation(api.applications.submit)
}

/**
 * List applications (for admin)
 */
export function useApplications(
  status?: 'pending' | 'approved' | 'rejected'
) {
  return useQuery(api.applications.list, status ? { status } : {})
}

/**
 * Approve application (admin only)
 */
export function useApproveApplication() {
  return useMutation(api.applications.approve)
}

/**
 * Reject application (admin only)
 */
export function useRejectApplication() {
  return useMutation(api.applications.reject)
}
