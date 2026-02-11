'use client'

import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

/**
 * Hook for creating profile
 */
export function useCreateProfile() {
  const mutation = useMutation(api.profiles.upsert)

  return {
    mutate: mutation,
    mutateAsync: mutation,
    isPending: false,
  }
}

/**
 * Hook for updating profile
 */
export function useUpdateProfile() {
  const mutation = useMutation(api.profiles.update)

  return {
    mutate: mutation,
    mutateAsync: mutation,
    isPending: false,
  }
}

/**
 * Hook for uploading avatar
 * Note: Avatar upload still uses the API route
 */
export function useUploadAvatar() {
  return {
    mutate: async (file: File) => {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await fetch('/api/profiles/avatar', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload avatar')
      }

      return response.json()
    },
    mutateAsync: async (file: File) => {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await fetch('/api/profiles/avatar', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload avatar')
      }

      return response.json()
    },
    isPending: false,
  }
}
