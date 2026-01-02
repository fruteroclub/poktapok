/**
 * Profile Service - API abstractions for profile endpoints
 */

import { apiFetch } from '@/lib/api/fetch'
import type { ProfileFormData } from '@/lib/validators/profile'
import type { CreateProfileResponse } from '@/types/api-v1'

/**
 * Create or update a profile
 *
 * Uses the new apiFetch wrapper for automatic error handling
 * and type-safe responses.
 *
 * @param data - Profile form data
 * @throws ApiError if request fails or validation errors occur
 */
export async function createProfile(
  data: ProfileFormData,
): Promise<CreateProfileResponse> {
  // apiFetch automatically unwraps { success: true, data: { profile }, message }
  return apiFetch<CreateProfileResponse>('/api/profiles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}
