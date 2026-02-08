/**
 * Convex Type Transforms
 *
 * Bridge between Convex types and API types.
 * Convex uses Id<"table"> and optional fields.
 * API uses string ids and specific type shapes.
 */

import type { Doc } from '../../convex/_generated/dataModel'
import type { User, Profile } from '@/types/api-v1'

/**
 * Transform Convex user document to API User type
 */
export function toApiUser(convexUser: Doc<'users'>): User {
  return {
    id: convexUser._id,
    username: convexUser.username ?? null,
    displayName: convexUser.displayName ?? null,
    email: convexUser.email ?? null,
    bio: convexUser.bio ?? null,
    avatarUrl: convexUser.avatarUrl ?? null,
    accountStatus: convexUser.accountStatus,
    role: convexUser.role,
    createdAt: new Date(convexUser._creationTime).toISOString(),
  }
}

/**
 * Transform Convex profile document to API Profile type
 */
export function toApiProfile(convexProfile: Doc<'profiles'>): Profile {
  return {
    id: convexProfile._id,
    userId: convexProfile.userId,
    city: convexProfile.city ?? '',
    country: convexProfile.country ?? '',
    countryCode: convexProfile.countryCode ?? '',
    learningTracks: convexProfile.learningTracks ?? [],
    availabilityStatus: convexProfile.availabilityStatus ?? 'unavailable',
    socialLinks: {
      github: convexProfile.githubUrl ?? undefined,
      twitter: convexProfile.twitterUrl ?? undefined,
      linkedin: convexProfile.linkedinUrl ?? undefined,
      telegram: convexProfile.telegramHandle ?? undefined,
    },
    // Stats
    projectsCount: convexProfile.projectsCount ?? 0,
    totalEarningsUsd: convexProfile.totalEarningsUsd ?? 0,
    profileViews: convexProfile.profileViews ?? 0,
    // Social usernames
    githubUsername: convexProfile.githubUsername ?? undefined,
    twitterUsername: convexProfile.twitterUsername ?? undefined,
    telegramUsername: convexProfile.telegramUsername ?? undefined,
  }
}

/**
 * Transform auth query result to API types
 */
export function toApiAuthData(data: {
  user: Doc<'users'>
  profile: Doc<'profiles'> | null
}): {
  user: User
  profile: Profile | null
} {
  return {
    user: toApiUser(data.user),
    profile: data.profile ? toApiProfile(data.profile) : null,
  }
}
