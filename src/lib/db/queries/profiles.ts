import { db } from "@/lib/db";
import { profiles, users, userSkills } from "@/lib/db/schema";
import { and, or, like, eq, desc, isNull, sql, inArray } from "drizzle-orm";

/**
 * Directory Filters Type
 * Used for filtering profiles in the public directory
 */
export type DirectoryFilters = {
  search?: string;
  learningTrack?: "ai" | "crypto" | "privacy";
  availabilityStatus?: "available" | "open_to_offers" | "unavailable";
  country?: string;
  skills?: string[]; // Filter by skill IDs
  page?: number;
  limit?: number;
};

/**
 * Directory Profile Result Type
 * Merged user + profile data for directory display
 */
export type DirectoryProfile = {
  id: string;
  userId: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  city: string | null;
  country: string | null;
  countryCode: string | null;
  learningTracks: ("ai" | "crypto" | "privacy")[] | null;
  availabilityStatus: "available" | "open_to_offers" | "unavailable";
  completedBounties: number;
  totalEarningsUsd: number;
  githubUrl: string | null;
  twitterUrl: string | null;
  linkedinUrl: string | null;
  telegramHandle: string | null;
  createdAt: Date;
};

/**
 * Get directory profiles with filters and pagination
 *
 * Features:
 * - Full-text search across username, displayName, bio
 * - Filter by learning track, availability, country
 * - Pagination support
 * - Only returns public, non-deleted profiles with active users
 * - Sorted by most recent (createdAt DESC)
 *
 * @param filters - DirectoryFilters object
 * @returns Array of directory profiles
 */
export async function getDirectoryProfiles(
  filters: DirectoryFilters
): Promise<DirectoryProfile[]> {
  const {
    search,
    learningTrack,
    availabilityStatus,
    country,
    skills,
    page = 1,
    limit = 24,
  } = filters;

  const conditions = [];

  // Only show public profiles
  conditions.push(eq(profiles.profileVisibility, "public"));

  // Only show non-deleted profiles
  conditions.push(isNull(profiles.deletedAt));

  // Only show profiles with active users (account_status = 'active')
  conditions.push(eq(users.accountStatus, "active"));

  // Only show non-deleted users
  conditions.push(isNull(users.deletedAt));

  // Search: username, displayName, bio (case-insensitive)
  if (search && search.length >= 2) {
    const searchPattern = `%${search.toLowerCase()}%`;
    conditions.push(
      or(
        sql`LOWER(${users.username}) LIKE ${searchPattern}`,
        sql`LOWER(${users.displayName}) LIKE ${searchPattern}`,
        sql`LOWER(${users.bio}) LIKE ${searchPattern}`
      )
    );
  }

  // Filter by learning track
  if (learningTrack) {
    // Check if learningTracks array contains the specified track
    conditions.push(sql`${learningTrack} = ANY(${profiles.learningTracks})`);
  }

  // Filter by availability status
  if (availabilityStatus) {
    conditions.push(eq(profiles.availabilityStatus, availabilityStatus));
  }

  // Filter by country
  if (country) {
    conditions.push(eq(profiles.country, country));
  }

  const offset = (page - 1) * limit;

  // Build query - add skills join if filtering by skills
  if (skills && skills.length > 0) {
    // Query with skills filter
    const results = await db
      .select({
        // Profile fields
        id: profiles.id,
        userId: profiles.userId,
        city: profiles.city,
        country: profiles.country,
        countryCode: profiles.countryCode,
        learningTracks: profiles.learningTracks,
        availabilityStatus: profiles.availabilityStatus,
        completedBounties: profiles.completedBounties,
        totalEarningsUsd: profiles.totalEarningsUsd,
        githubUrl: profiles.githubUrl,
        twitterUrl: profiles.twitterUrl,
        linkedinUrl: profiles.linkedinUrl,
        telegramHandle: profiles.telegramHandle,
        profileCreatedAt: profiles.createdAt,
        // User fields
        username: users.username,
        displayName: users.displayName,
        bio: users.bio,
        avatarUrl: users.avatarUrl,
      })
      .from(profiles)
      .innerJoin(users, eq(profiles.userId, users.id))
      .innerJoin(userSkills, eq(profiles.userId, userSkills.userId))
      .where(and(...conditions, inArray(userSkills.skillId, skills)))
      .orderBy(desc(profiles.createdAt))
      .limit(limit)
      .offset(offset);

    // Map to DirectoryProfile type
    return results.map((r) => ({
      id: r.id,
      userId: r.userId,
      username: r.username!,
      displayName: r.displayName,
      bio: r.bio,
      avatarUrl: r.avatarUrl,
      city: r.city,
      country: r.country,
      countryCode: r.countryCode,
      learningTracks: r.learningTracks,
      availabilityStatus: r.availabilityStatus,
      completedBounties: r.completedBounties,
      totalEarningsUsd: r.totalEarningsUsd,
      githubUrl: r.githubUrl,
      twitterUrl: r.twitterUrl,
      linkedinUrl: r.linkedinUrl,
      telegramHandle: r.telegramHandle,
      createdAt: r.profileCreatedAt,
    }));
  }

  // Query without skills filter
  const results = await db
    .select({
      // Profile fields
      id: profiles.id,
      userId: profiles.userId,
      city: profiles.city,
      country: profiles.country,
      countryCode: profiles.countryCode,
      learningTracks: profiles.learningTracks,
      availabilityStatus: profiles.availabilityStatus,
      completedBounties: profiles.completedBounties,
      totalEarningsUsd: profiles.totalEarningsUsd,
      githubUrl: profiles.githubUrl,
      twitterUrl: profiles.twitterUrl,
      linkedinUrl: profiles.linkedinUrl,
      telegramHandle: profiles.telegramHandle,
      profileCreatedAt: profiles.createdAt,
      // User fields
      username: users.username,
      displayName: users.displayName,
      bio: users.bio,
      avatarUrl: users.avatarUrl,
    })
    .from(profiles)
    .innerJoin(users, eq(profiles.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(profiles.createdAt))
    .limit(limit)
    .offset(offset);

  // Map to DirectoryProfile type
  return results.map((r) => ({
    id: r.id,
    userId: r.userId,
    username: r.username!,
    displayName: r.displayName,
    bio: r.bio,
    avatarUrl: r.avatarUrl,
    city: r.city,
    country: r.country,
    countryCode: r.countryCode,
    learningTracks: r.learningTracks,
    availabilityStatus: r.availabilityStatus,
    completedBounties: r.completedBounties,
    totalEarningsUsd: r.totalEarningsUsd,
    githubUrl: r.githubUrl,
    twitterUrl: r.twitterUrl,
    linkedinUrl: r.linkedinUrl,
    telegramHandle: r.telegramHandle,
    createdAt: r.profileCreatedAt,
  }));
}

/**
 * Get total count of profiles matching filters (for pagination)
 *
 * @param filters - DirectoryFilters object (without page/limit)
 * @returns Total count of matching profiles
 */
export async function getDirectoryProfilesCount(
  filters: Omit<DirectoryFilters, "page" | "limit">
): Promise<number> {
  const { search, learningTrack, availabilityStatus, country, skills } = filters;

  const conditions = [];

  // Only show public profiles
  conditions.push(eq(profiles.profileVisibility, "public"));

  // Only show non-deleted profiles
  conditions.push(isNull(profiles.deletedAt));

  // Only show profiles with active users
  conditions.push(eq(users.accountStatus, "active"));

  // Only show non-deleted users
  conditions.push(isNull(users.deletedAt));

  // Search
  if (search && search.length >= 2) {
    const searchPattern = `%${search.toLowerCase()}%`;
    conditions.push(
      or(
        sql`LOWER(${users.username}) LIKE ${searchPattern}`,
        sql`LOWER(${users.displayName}) LIKE ${searchPattern}`,
        sql`LOWER(${users.bio}) LIKE ${searchPattern}`
      )
    );
  }

  // Filter by learning track
  if (learningTrack) {
    conditions.push(sql`${learningTrack} = ANY(${profiles.learningTracks})`);
  }

  // Filter by availability status
  if (availabilityStatus) {
    conditions.push(eq(profiles.availabilityStatus, availabilityStatus));
  }

  // Filter by country
  if (country) {
    conditions.push(eq(profiles.country, country));
  }

  // Build query - add skills join if filtering by skills
  if (skills && skills.length > 0) {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(profiles)
      .innerJoin(users, eq(profiles.userId, users.id))
      .innerJoin(userSkills, eq(profiles.userId, userSkills.userId))
      .where(and(...conditions, inArray(userSkills.skillId, skills)));

    return Number(result[0]?.count ?? 0);
  }

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(profiles)
    .innerJoin(users, eq(profiles.userId, users.id))
    .where(and(...conditions));

  return Number(result[0]?.count ?? 0);
}

/**
 * Get list of countries with at least one profile
 * Used for country filter dropdown
 *
 * @returns Array of { country, countryCode, count } sorted alphabetically
 */
export async function getDirectoryCountries(): Promise<
  Array<{ country: string; countryCode: string; count: number }>
> {
  const results = await db
    .select({
      country: profiles.country,
      countryCode: profiles.countryCode,
      count: sql<number>`count(*)`,
    })
    .from(profiles)
    .innerJoin(users, eq(profiles.userId, users.id))
    .where(
      and(
        eq(profiles.profileVisibility, "public"),
        isNull(profiles.deletedAt),
        eq(users.accountStatus, "active"),
        isNull(users.deletedAt),
        sql`${profiles.country} IS NOT NULL`,
        sql`${profiles.countryCode} IS NOT NULL`
      )
    )
    .groupBy(profiles.country, profiles.countryCode)
    .orderBy(profiles.country);

  return results.map((r) => ({
    country: r.country!,
    countryCode: r.countryCode!,
    count: Number(r.count),
  }));
}

/**
 * Profile with User Data Type
 * Combined profile + user data for individual profile pages
 */
export type ProfileWithUser = {
  profile: typeof profiles.$inferSelect;
  user: typeof users.$inferSelect;
};

/**
 * Get profile by username with user data
 * Returns profile regardless of visibility (visibility check done at component level)
 *
 * @param username - The username to search for (case-insensitive)
 * @returns Profile with user data, or null if not found
 */
export async function getProfileByUsername(
  username: string
): Promise<ProfileWithUser | null> {
  const result = await db
    .select({
      profile: profiles,
      user: users,
    })
    .from(profiles)
    .innerJoin(users, eq(profiles.userId, users.id))
    .where(
      and(
        sql`LOWER(${users.username}) = LOWER(${username})`,
        isNull(profiles.deletedAt),
        isNull(users.deletedAt),
        eq(users.accountStatus, "active")
      )
    )
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  return {
    profile: result[0].profile,
    user: result[0].user,
  };
}
