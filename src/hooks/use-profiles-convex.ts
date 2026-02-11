/**
 * Profile hooks using Convex
 */

import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

/**
 * Get profile by user ID
 */
export function useProfile(userId: Id<'users'> | undefined) {
  return useQuery(api.profiles.getByUserId, userId ? { userId } : 'skip')
}

/**
 * Get profile by username
 */
export function useProfileByUsername(username: string | undefined) {
  return useQuery(api.profiles.getByUsername, username ? { username } : 'skip')
}

/**
 * Create or update profile
 */
export function useUpsertProfile() {
  return useMutation(api.profiles.upsert)
}

/**
 * Update profile
 */
export function useUpdateProfile() {
  return useMutation(api.profiles.update)
}
