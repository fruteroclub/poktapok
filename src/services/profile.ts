/**
 * Profile Service - API abstractions for profile endpoints
 */

import { apiFetch } from '@/lib/api/fetch'
import type { ProfileFormData } from '@/lib/validators/profile'
import type {
  CreateProfileResponse,
  UploadAvatarResponse,
  DeleteAvatarResponse,
} from '@/types/api-v1'

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

/**
 * Upload avatar to Vercel Blob Storage
 *
 * Uploads an avatar image file and returns the public URL.
 * The server handles validation, old avatar cleanup, and database updates.
 *
 * @param file - Image file to upload (JPEG, PNG, WebP, max 5MB)
 * @returns The new avatar URL string
 * @throws ApiError if validation fails, file is too large, or upload fails
 *
 * @example
 * ```typescript
 * const avatarUrl = await uploadAvatar(file)
 * console.log(avatarUrl) // "https://[blob-id].public.blob.vercel-storage.com/..."
 * ```
 */
export async function uploadAvatar(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('avatar', file)

  const response = await apiFetch<UploadAvatarResponse>(
    '/api/profiles/avatar',
    {
      method: 'POST',
      body: formData,
    },
  )

  return response.avatarUrl
}

/**
 * Delete user's avatar from Vercel Blob Storage
 *
 * Removes the avatar image from blob storage and sets avatarUrl to null in database.
 * Gracefully handles missing files.
 *
 * @throws ApiError if deletion fails
 *
 * @example
 * ```typescript
 * await deleteAvatar()
 * // Avatar reverts to fallback (blo or initials)
 * ```
 */
export async function deleteAvatar(): Promise<void> {
  await apiFetch<DeleteAvatarResponse>('/api/profiles/avatar', {
    method: 'DELETE',
  })
}
