import { db } from '@/lib/db'
import {
  users,
  profiles,
  activitySubmissions,
  activities,
} from '@/lib/db/schema'
import { eq, ilike, or, and, isNull, sql, desc, asc } from 'drizzle-orm'

/**
 * List Users Query
 *
 * Returns paginated list of users with aggregated stats
 */
export interface ListUsersFilters {
  search?: string
  role?: string
  accountStatus?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface UserWithStats {
  id: string
  username: string | null
  displayName: string | null
  email: string | null
  avatarUrl: string | null
  role: string
  accountStatus: string
  createdAt: Date
  profileId: string | null
  city: string | null
  country: string | null
  learningTracks: string[]
  totalEarnings: string
  submissionsCount: number
  approvedCount: number
  activitiesCompleted: number
}

export async function listUsers(filters: ListUsersFilters = {}) {
  const {
    search,
    role,
    accountStatus,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 24,
  } = filters

  // Build WHERE conditions
  const conditions = [isNull(users.deletedAt)]

  if (search) {
    conditions.push(
      or(
        ilike(users.username, `%${search}%`),
        ilike(users.email, `%${search}%`),
        ilike(users.displayName, `%${search}%`)
      )!
    )
  }

  if (role && role !== 'all') {
    conditions.push(eq(users.role, role as 'member' | 'moderator' | 'admin'))
  }

  if (accountStatus && accountStatus !== 'all') {
    conditions.push(
      eq(
        users.accountStatus,
        accountStatus as 'active' | 'pending' | 'suspended' | 'banned',
      ),
    )
  }

  // Build sort order
  const sortColumn =
    sortBy === 'username'
      ? users.username
      : sortBy === 'totalEarnings'
        ? sql<string>`total_earnings`
        : sortBy === 'submissionsCount'
          ? sql<number>`submissions_count`
          : users.createdAt

  const orderDirection = sortOrder === 'asc' ? asc : desc

  // Main query with aggregations
  const query = db
    .select({
      // User fields
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      email: users.email,
      avatarUrl: users.avatarUrl,
      role: users.role,
      accountStatus: users.accountStatus,
      createdAt: users.createdAt,

      // Profile fields
      profileId: profiles.id,
      city: profiles.city,
      country: profiles.country,
      learningTracks: profiles.learningTracks,

      // Aggregated stats
      totalEarnings: sql<string>`
        COALESCE(
          SUM(CASE
            WHEN ${activitySubmissions.status} = 'approved'
            THEN ${activitySubmissions.rewardPulpaAmount}::numeric
            ELSE 0
          END), 0
        )::text
      `.as('total_earnings'),
      submissionsCount: sql<number>`
        COUNT(DISTINCT ${activitySubmissions.id})
      `.as('submissions_count'),
      approvedCount: sql<number>`
        COUNT(DISTINCT CASE
          WHEN ${activitySubmissions.status} = 'approved'
          THEN ${activitySubmissions.id}
        END)
      `.as('approved_count'),
      activitiesCompleted: sql<number>`
        COUNT(DISTINCT CASE
          WHEN ${activitySubmissions.status} = 'approved'
          THEN ${activitySubmissions.activityId}
        END)
      `.as('activities_completed'),
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .leftJoin(activitySubmissions, eq(users.id, activitySubmissions.userId))
    .where(and(...conditions))
    .groupBy(users.id, profiles.id)
    .orderBy(orderDirection(sortColumn))
    .limit(limit)
    .offset((page - 1) * limit)

  // Execute query
  const results = (await query) as UserWithStats[]

  // Get total count for pagination
  const countQuery = db
    .select({ count: sql<number>`count(distinct ${users.id})` })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(and(...conditions))

  const [{ count: total }] = await countQuery

  return {
    users: results,
    pagination: {
      total,
      page,
      limit,
      hasMore: page * limit < total,
    },
  }
}

/**
 * Get User Details Query
 *
 * Returns complete user information with stats and recent submissions
 */
export interface UserDetails {
  id: string
  username: string | null
  displayName: string | null
  email: string | null
  avatarUrl: string | null
  appWallet: string | null
  role: string
  accountStatus: string
  primaryAuthMethod: string
  createdAt: Date
  updatedAt: Date
  profile: {
    bio: string | null
    city: string | null
    country: string | null
    countryCode: string | null
    timezone: string | null
    learningTracks: string[]
    githubUrl: string | null
    linkedinUrl: string | null
    twitterUrl: string | null
    telegramUrl: string | null
    websiteUrl: string | null
  } | null
  stats: {
    totalEarnings: string
    submissionsCount: number
    approvedCount: number
    rejectedCount: number
    pendingCount: number
    activitiesCompleted: number
  }
  recentSubmissions: Array<{
    id: string
    activityId: string
    activityTitle: string
    status: string
    submittedAt: Date
    rewardPulpaAmount: string | null
  }>
}

export async function getUserDetails(
  userId: string,
): Promise<UserDetails | null> {
  // Get user and profile data
  const userResults = await db
    .select()
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .limit(1)

  const userRow = userResults[0]
  if (!userRow) {
    return null
  }

  const userData = userRow.users
  const profileData = userRow.profiles

  // Get aggregated stats
  const statsResult = await db
    .select({
      totalEarnings: sql<string>`
        COALESCE(
          SUM(CASE
            WHEN ${activitySubmissions.status} = 'approved'
            THEN ${activitySubmissions.rewardPulpaAmount}::numeric
            ELSE 0
          END), 0
        )::text
      `,
      submissionsCount: sql<number>`COUNT(${activitySubmissions.id})`,
      approvedCount: sql<number>`
        COUNT(CASE
          WHEN ${activitySubmissions.status} = 'approved'
          THEN 1
        END)
      `,
      rejectedCount: sql<number>`
        COUNT(CASE
          WHEN ${activitySubmissions.status} = 'rejected'
          THEN 1
        END)
      `,
      pendingCount: sql<number>`
        COUNT(CASE
          WHEN ${activitySubmissions.status} = 'pending'
          THEN 1
        END)
      `,
      activitiesCompleted: sql<number>`
        COUNT(DISTINCT CASE
          WHEN ${activitySubmissions.status} = 'approved'
          THEN ${activitySubmissions.activityId}
        END)
      `,
    })
    .from(activitySubmissions)
    .where(eq(activitySubmissions.userId, userId))

  const stats = statsResult[0] || {
    totalEarnings: '0',
    submissionsCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    pendingCount: 0,
    activitiesCompleted: 0,
  }

  // Get recent submissions
  const recentSubmissionsData = await db
    .select({
      id: activitySubmissions.id,
      activityId: activitySubmissions.activityId,
      activityTitle: activities.title,
      status: activitySubmissions.status,
      submittedAt: activitySubmissions.submittedAt,
      rewardPulpaAmount: activitySubmissions.rewardPulpaAmount,
    })
    .from(activitySubmissions)
    .leftJoin(activities, eq(activitySubmissions.activityId, activities.id))
    .where(eq(activitySubmissions.userId, userId))
    .orderBy(desc(activitySubmissions.submittedAt))
    .limit(5)

  return {
    id: userData.id,
    username: userData.username,
    displayName: userData.displayName,
    email: userData.email,
    avatarUrl: userData.avatarUrl,
    appWallet: userData.appWallet,
    role: userData.role,
    accountStatus: userData.accountStatus,
    primaryAuthMethod: userData.primaryAuthMethod,
    createdAt: userData.createdAt,
    updatedAt: userData.updatedAt,
    profile: profileData
      ? {
          bio: null,
          city: profileData.city,
          country: profileData.country,
          countryCode: profileData.countryCode,
          timezone: null,
          learningTracks: profileData.learningTracks || [],
          githubUrl: profileData.githubUrl,
          linkedinUrl: profileData.linkedinUrl,
          twitterUrl: profileData.twitterUrl,
          telegramUrl: profileData.telegramHandle,
          websiteUrl: null,
        }
      : null,
    stats: {
      totalEarnings: stats.totalEarnings,
      submissionsCount: stats.submissionsCount,
      approvedCount: stats.approvedCount,
      rejectedCount: stats.rejectedCount,
      pendingCount: stats.pendingCount,
      activitiesCompleted: stats.activitiesCompleted,
    },
    recentSubmissions: recentSubmissionsData.map((s) => ({
      id: s.id,
      activityId: s.activityId,
      activityTitle: s.activityTitle || 'Unknown Activity',
      status: s.status,
      submittedAt: s.submittedAt,
      rewardPulpaAmount: s.rewardPulpaAmount,
    })),
  }
}
