/**
 * Admin service functions for pending user management
 * Abstracts API calls for admin dashboard operations
 */

import { apiFetch } from '@/lib/api/fetch'
import type {
  ListPendingUsersResponse,
  ApproveUserResponse,
  RejectUserResponse,
} from '@/types/api-v1'

/**
 * Fetch all pending users with their profile data
 */
export async function fetchPendingUsers(): Promise<ListPendingUsersResponse> {
  return apiFetch<ListPendingUsersResponse>('/api/admin/pending-users')
}

/**
 * Approve a pending user (set accountStatus to 'active')
 */
export async function approveUser(
  userId: string,
): Promise<ApproveUserResponse> {
  return apiFetch<ApproveUserResponse>(`/api/admin/users/${userId}/approve`, {
    method: 'POST',
  })
}

/**
 * Reject a pending user (set accountStatus to 'rejected')
 */
export async function rejectUser(userId: string): Promise<RejectUserResponse> {
  return apiFetch<RejectUserResponse>(`/api/admin/users/${userId}/reject`, {
    method: 'POST',
  })
}
