/**
 * Auth Service - API abstractions for authentication endpoints
 */

import { apiFetch } from '@/lib/api/fetch'
import type {
  MeResponse,
  UpdateUserRequest,
  UpdateUserResponse,
} from '@/types/api-v1'

/**
 * Fetch current authenticated user and their profile
 *
 * Uses the new apiFetch wrapper for automatic error handling
 * and type-safe responses.
 *
 * @throws ApiError if request fails or user is not authenticated
 */
export async function fetchMe(): Promise<MeResponse> {
  // apiFetch automatically unwraps { success: true, data: { user, profile } }
  return apiFetch<MeResponse>('/api/auth/me')
}

/**
 * Update user information (onboarding completion)
 *
 * Updates user fields and automatically transitions account status from
 * "incomplete" to "pending" when all required onboarding fields are complete.
 *
 * Required fields for completion:
 * - username: Valid pattern (3-50 chars, lowercase alphanumeric + underscore)
 * - email: Valid email address (not temporary)
 * - displayName: Not empty or temporary
 *
 * @param data - Partial user data to update
 * @returns Updated user object
 * @throws ApiError if validation fails or username/email already taken
 *
 * @example
 * ```typescript
 * // Complete onboarding
 * const { user } = await updateUser({
 *   username: 'johndoe',
 *   email: 'john@example.com',
 *   displayName: 'John Doe',
 *   bio: 'Software developer',
 *   avatarUrl: 'https://...'
 * })
 *
 * // Partial update
 * const { user } = await updateUser({
 *   displayName: 'John Smith'
 * })
 * ```
 */
export async function updateUser(
  data: UpdateUserRequest,
): Promise<UpdateUserResponse> {
  return apiFetch<UpdateUserResponse>('/api/users/update', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}
