import type { User, Profile } from "@/lib/db/schema";

export type VisibilityLevel = "public" | "members" | "private";

/**
 * Check if a field can be viewed based on profile visibility and current user
 *
 * Visibility Rules:
 * - Public profiles: All fields visible to everyone (authenticated or not)
 * - Private profiles: Only basic fields visible to non-owners, all fields to owner
 * - Owner: Always sees all fields regardless of profile visibility setting
 *
 * @param field - The field name to check
 * @param profile - The profile being viewed
 * @param currentUser - The current authenticated user (null if not authenticated)
 * @returns true if the field can be viewed
 */
export function canViewField(
  field: string,
  profile: Profile,
  currentUser: User | null
): boolean {
  // Owner can always view everything
  if (currentUser?.id === profile.userId) {
    return true;
  }

  // Define field categories
  const publicFields = [
    "username",
    "displayName",
    "avatar",
    "avatarUrl",
    "bio",
    "joinedAt",
    "createdAt",
  ];

  const membersOnlyFields = [
    "city",
    "country",
    "countryCode",
    "learningTracks",
    "availabilityStatus",
    "socialLinks",
    "githubUrl",
    "twitterUrl",
    "linkedinUrl",
    "telegramHandle",
    "lastActiveAt",
    "completedBounties",
    "totalEarningsUsd",
  ];

  // Private profile logic
  if (profile.profileVisibility === "private") {
    // Only basic data visible if not owner
    return publicFields.includes(field);
  }

  // Public profile logic - all fields are visible to everyone
  if (profile.profileVisibility === "public") {
    return publicFields.includes(field) || membersOnlyFields.includes(field);
  }

  // Default: not visible
  return false;
}

/**
 * Check if the entire profile is viewable
 * (i.e., not private or viewer is owner)
 */
export function canViewProfile(
  profile: Profile,
  currentUser: User | null
): boolean {
  // Owner can always view
  if (currentUser?.id === profile.userId) {
    return true;
  }

  // Private profiles still show basic data
  return true;
}

/**
 * Check if user is the profile owner
 */
export function isProfileOwner(
  profile: Profile,
  currentUser: User | null
): boolean {
  return currentUser?.id === profile.userId;
}

/**
 * Get visibility level for current user
 */
export function getVisibilityLevel(
  profile: Profile,
  currentUser: User | null
): VisibilityLevel {
  if (isProfileOwner(profile, currentUser)) {
    return "private"; // Owner sees everything
  }

  if (profile.profileVisibility === "private") {
    return "public"; // Non-owners see basic data only
  }

  if (currentUser) {
    return "members"; // Authenticated users see members-only data
  }

  return "public"; // Public visitors see public data only
}
