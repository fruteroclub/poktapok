import { db } from '@/lib/db'
import {
  activities,
  activitySubmissions,
  pulpaDistributions,
  profiles,
  users,
  type NewActivity,
  type NewActivitySubmission,
  type NewPulpaDistribution,
} from '@/lib/db/schema'
import {
  eq,
  and,
  desc,
  asc,
  sql,
  count,
  sum,
  isNull,
  or,
  gte,
  lte,
  ilike,
  SQL,
} from 'drizzle-orm'

// ============================================================
// TYPE GUARDS
// ============================================================

type ActivityType = 'github_commit' | 'x_post' | 'photo' | 'video' | 'blog_post' | 'workshop_completion' | 'build_in_public' | 'code_review' | 'custom'
type Difficulty = 'beginner' | 'intermediate' | 'advanced'
type ActivityStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
type SubmissionStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'revision_requested' | 'distributed'
type DistributionStatus = 'pending' | 'completed' | 'failed'
type DistributionMethod = 'manual' | 'smart_contract' | 'claim_portal'

function isActivityType(value: string): value is ActivityType {
  return ['github_commit', 'x_post', 'photo', 'video', 'blog_post', 'workshop_completion', 'build_in_public', 'code_review', 'custom'].includes(value)
}

function isDifficulty(value: string): value is Difficulty {
  return ['beginner', 'intermediate', 'advanced'].includes(value)
}

function isActivityStatus(value: string): value is ActivityStatus {
  return ['draft', 'active', 'paused', 'completed', 'cancelled'].includes(value)
}

function isSubmissionStatus(value: string): value is SubmissionStatus {
  return ['pending', 'under_review', 'approved', 'rejected', 'revision_requested', 'distributed'].includes(value)
}

function isDistributionStatus(value: string): value is DistributionStatus {
  return ['pending', 'completed', 'failed'].includes(value)
}

function isDistributionMethod(value: string): value is DistributionMethod {
  return ['manual', 'smart_contract', 'claim_portal'].includes(value)
}

// ============================================================
// ACTIVITY QUERIES
// ============================================================

/**
 * Get all activities with filters
 */
export async function getActivities(filters: {
  type?: string
  category?: string
  difficulty?: string
  status?: string
  search?: string
  page?: number
  limit?: number
  includeExpired?: boolean
}) {
  const {
    type,
    category,
    difficulty,
    status = 'active',
    search,
    page = 1,
    limit = 24,
    includeExpired = false,
  } = filters

  const offset = (page - 1) * limit
  const now = new Date()

  // Handle "expired" as a computed status (DB status is still 'active' but expiresAt < now)
  const isFilteringByExpired = status === 'expired'
  const dbStatusFilter = isFilteringByExpired ? 'active' : status

  const whereConditions: (SQL | undefined)[] = [
    isNull(activities.deletedAt),
    type && isActivityType(type) ? eq(activities.activityType, type) : undefined,
    category ? eq(activities.category, category) : undefined,
    difficulty && isDifficulty(difficulty) ? eq(activities.difficulty, difficulty) : undefined,
    dbStatusFilter && isActivityStatus(dbStatusFilter) ? eq(activities.status, dbStatusFilter) : undefined,
    search ? ilike(activities.title, `%${search}%`) : undefined,
    // If filtering by "expired", only get activities that have expired
    isFilteringByExpired ? lte(activities.expiresAt, now) : undefined,
    // Filter out expired activities unless includeExpired is true or explicitly filtering by expired
    !includeExpired && !isFilteringByExpired
      ? or(isNull(activities.expiresAt), gte(activities.expiresAt, now))
      : undefined,
  ]

  const query = db
    .select()
    .from(activities)
    .where(and(...whereConditions))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(activities.createdAt))

  const results = await query

  // Get total count for pagination
  const totalQuery = await db
    .select({ count: count() })
    .from(activities)
    .where(and(...whereConditions))

  const total = totalQuery[0]?.count || 0

  // Compute effective status based on expiration
  const activitiesWithComputedStatus = results.map((activity) => {
    const isExpired = activity.expiresAt ? new Date(activity.expiresAt) < now : false
    // Compute effective status: if status is 'active' but expired, it's effectively 'expired'
    const effectiveStatus =
      activity.status === 'active' && isExpired ? 'expired' : activity.status

    return {
      ...activity,
      isExpired,
      effectiveStatus,
    }
  })

  return {
    activities: activitiesWithComputedStatus,
    total: Number(total),
    page,
    limit,
    hasMore: offset + results.length < Number(total),
  }
}

/**
 * Get activity by ID
 */
export async function getActivityById(id: string) {
  const result = await db
    .select()
    .from(activities)
    .where(and(eq(activities.id, id), isNull(activities.deletedAt)))
    .limit(1)

  return result[0] || null
}

/**
 * Create new activity
 */
export async function createActivity(data: NewActivity) {
  const result = await db.insert(activities).values(data).returning()

  return result[0]
}

/**
 * Update activity
 */
export async function updateActivity(id: string, data: Partial<NewActivity>) {
  const result = await db
    .update(activities)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(activities.id, id))
    .returning()

  return result[0] || null
}

/**
 * Hard delete activity (also deletes related submissions and distributions via CASCADE)
 */
export async function deleteActivity(id: string) {
  const result = await db
    .delete(activities)
    .where(eq(activities.id, id))
    .returning()

  return result[0] || null
}

/**
 * Increment activity submission count
 */
export async function incrementActivitySubmissionCount(activityId: string) {
  await db
    .update(activities)
    .set({
      currentSubmissionsCount: sql`${activities.currentSubmissionsCount} + 1`,
    })
    .where(eq(activities.id, activityId))
}

// ============================================================
// SUBMISSION QUERIES
// ============================================================

/**
 * Get submissions with filters
 */
export async function getSubmissions(filters: {
  status?: string
  activityId?: string
  userId?: string
  sort?: string
  page?: number
  limit?: number
}) {
  const {
    status,
    activityId,
    userId,
    sort = 'submitted_at_desc',
    page = 1,
    limit = 24,
  } = filters

  const offset = (page - 1) * limit

  // Determine sort order
  const orderBy =
    sort === 'submitted_at_asc'
      ? asc(activitySubmissions.submittedAt)
      : sort === 'reward_amount_desc'
        ? desc(activitySubmissions.rewardPulpaAmount)
        : desc(activitySubmissions.submittedAt)

  const results = await db
    .select({
      submission: activitySubmissions,
      activity: {
        id: activities.id,
        title: activities.title,
        activityType: activities.activityType,
        rewardPulpaAmount: activities.rewardPulpaAmount,
      },
      user: {
        id: users.id,
        username: users.username,
        email: users.email,
        appWallet: users.appWallet,
      },
    })
    .from(activitySubmissions)
    .innerJoin(activities, eq(activitySubmissions.activityId, activities.id))
    .innerJoin(users, eq(activitySubmissions.userId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(
      and(
        status && isSubmissionStatus(status) ? eq(activitySubmissions.status, status) : undefined,
        activityId ? eq(activitySubmissions.activityId, activityId) : undefined,
        userId ? eq(activitySubmissions.userId, userId) : undefined,
      ),
    )
    .limit(limit)
    .offset(offset)
    .orderBy(orderBy)

  // Get total count
  const totalQuery = await db
    .select({ count: count() })
    .from(activitySubmissions)
    .where(
      and(
        status && isSubmissionStatus(status) ? eq(activitySubmissions.status, status) : undefined,
        activityId ? eq(activitySubmissions.activityId, activityId) : undefined,
        userId ? eq(activitySubmissions.userId, userId) : undefined,
      ),
    )

  const total = totalQuery[0]?.count || 0

  return {
    submissions: results,
    total: Number(total),
    page,
    limit,
    hasMore: offset + results.length < Number(total),
  }
}

/**
 * Get submission by ID
 */
export async function getSubmissionById(id: string) {
  const result = await db
    .select({
      submission: activitySubmissions,
      activity: activities,
      user: {
        id: users.id,
        email: users.email,
        role: users.role,
        username: users.username,
        appWallet: users.appWallet,
        extWallet: users.extWallet,
        activitiesCompleted: profiles.activitiesCompleted,
        totalPulpaEarned: profiles.totalPulpaEarned,
      },
    })
    .from(activitySubmissions)
    .innerJoin(activities, eq(activitySubmissions.activityId, activities.id))
    .innerJoin(users, eq(activitySubmissions.userId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(eq(activitySubmissions.id, id))
    .limit(1)

  return result[0] || null
}

/**
 * Check if user has already submitted for an activity
 */
export async function hasUserSubmitted(activityId: string, userId: string) {
  const result = await db
    .select({ id: activitySubmissions.id })
    .from(activitySubmissions)
    .where(
      and(
        eq(activitySubmissions.activityId, activityId),
        eq(activitySubmissions.userId, userId),
        or(
          eq(activitySubmissions.status, 'pending'),
          eq(activitySubmissions.status, 'under_review'),
          eq(activitySubmissions.status, 'approved'),
          eq(activitySubmissions.status, 'distributed'),
        ),
      ),
    )
    .limit(1)

  return result.length > 0
}

/**
 * Create submission
 */
export async function createSubmission(data: NewActivitySubmission) {
  const result = await db.insert(activitySubmissions).values(data).returning()

  return result[0]
}

/**
 * Update submission
 */
export async function updateSubmission(
  id: string,
  data: Partial<NewActivitySubmission>,
) {
  const result = await db
    .update(activitySubmissions)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(activitySubmissions.id, id))
    .returning()

  return result[0] || null
}

/**
 * Get user submission stats
 */
export async function getUserSubmissionStats(userId: string) {
  const stats = await db
    .select({
      status: activitySubmissions.status,
      count: count(),
      totalReward: sum(activitySubmissions.rewardPulpaAmount),
    })
    .from(activitySubmissions)
    .where(eq(activitySubmissions.userId, userId))
    .groupBy(activitySubmissions.status)

  const totalSubmissions = stats.reduce((acc, s) => acc + Number(s.count), 0)
  const approved = stats.find((s) => s.status === 'approved')?.count || 0
  const pending = stats.find((s) => s.status === 'pending')?.count || 0
  const rejected = stats.find((s) => s.status === 'rejected')?.count || 0
  const totalPulpaEarned = stats.reduce(
    (acc, s) => acc + Number(s.totalReward || 0),
    0,
  )

  return {
    total_submissions: totalSubmissions,
    approved: Number(approved),
    pending: Number(pending),
    rejected: Number(rejected),
    total_pulpa_earned: totalPulpaEarned.toString(),
  }
}

// ============================================================
// DISTRIBUTION QUERIES
// ============================================================

/**
 * Get distributions with filters
 */
export async function getDistributions(filters: {
  status?: string
  method?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}) {
  const { status, method, startDate, endDate, page = 1, limit = 24 } = filters

  const offset = (page - 1) * limit

  const results = await db
    .select({
      distribution: pulpaDistributions,
      user: {
        id: users.id,
        username: users.username,
      },
      activity: {
        id: activities.id,
        title: activities.title,
      },
    })
    .from(pulpaDistributions)
    .innerJoin(users, eq(pulpaDistributions.userId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .innerJoin(activities, eq(pulpaDistributions.activityId, activities.id))
    .where(
      and(
        status && isDistributionStatus(status) ? eq(pulpaDistributions.status, status) : undefined,
        method && isDistributionMethod(method)
          ? eq(pulpaDistributions.distributionMethod, method)
          : undefined,
        startDate
          ? gte(pulpaDistributions.distributedAt, new Date(startDate))
          : undefined,
        endDate
          ? lte(pulpaDistributions.distributedAt, new Date(endDate))
          : undefined,
      ),
    )
    .limit(limit)
    .offset(offset)
    .orderBy(desc(pulpaDistributions.distributedAt))

  // Get stats
  const statsQuery = await db
    .select({
      status: pulpaDistributions.status,
      count: count(),
      totalDistributed: sum(pulpaDistributions.pulpaAmount),
    })
    .from(pulpaDistributions)
    .where(
      and(
        status && isDistributionStatus(status) ? eq(pulpaDistributions.status, status) : undefined,
        method && isDistributionMethod(method)
          ? eq(pulpaDistributions.distributionMethod, method)
          : undefined,
        startDate
          ? gte(pulpaDistributions.distributedAt, new Date(startDate))
          : undefined,
        endDate
          ? lte(pulpaDistributions.distributedAt, new Date(endDate))
          : undefined,
      ),
    )
    .groupBy(pulpaDistributions.status)

  const stats = {
    total_distributed: statsQuery
      .reduce((acc, s) => acc + Number(s.totalDistributed || 0), 0)
      .toString(),
    pending_count: Number(
      statsQuery.find((s) => s.status === 'pending')?.count || 0,
    ),
    completed_count: Number(
      statsQuery.find((s) => s.status === 'completed')?.count || 0,
    ),
    failed_count: Number(
      statsQuery.find((s) => s.status === 'failed')?.count || 0,
    ),
  }

  const totalQuery = await db
    .select({ count: count() })
    .from(pulpaDistributions)
    .where(
      and(
        status && isDistributionStatus(status) ? eq(pulpaDistributions.status, status) : undefined,
        method && isDistributionMethod(method)
          ? eq(pulpaDistributions.distributionMethod, method)
          : undefined,
        startDate
          ? gte(pulpaDistributions.distributedAt, new Date(startDate))
          : undefined,
        endDate
          ? lte(pulpaDistributions.distributedAt, new Date(endDate))
          : undefined,
      ),
    )

  const total = totalQuery[0]?.count || 0

  return {
    distributions: results,
    stats,
    total: Number(total),
    page,
    limit,
    hasMore: offset + results.length < Number(total),
  }
}

/**
 * Create distribution
 */
export async function createDistribution(data: NewPulpaDistribution) {
  const result = await db.insert(pulpaDistributions).values(data).returning()

  return result[0]
}

/**
 * Update distribution
 */
export async function updateDistribution(
  id: string,
  data: Partial<NewPulpaDistribution>,
) {
  const result = await db
    .update(pulpaDistributions)
    .set(data)
    .where(eq(pulpaDistributions.id, id))
    .returning()

  return result[0] || null
}

/**
 * Get pending distributions (approved submissions without distributions)
 */
export async function getPendingDistributions() {
  const results = await db
    .select({
      submission: activitySubmissions,
      user: {
        id: users.id,
        username: users.username,
        appWallet: users.appWallet,
        extWallet: users.extWallet,
      },
      activity: {
        id: activities.id,
        title: activities.title,
      },
    })
    .from(activitySubmissions)
    .innerJoin(users, eq(activitySubmissions.userId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .innerJoin(activities, eq(activitySubmissions.activityId, activities.id))
    .where(
      and(
        eq(activitySubmissions.status, 'approved'),
        sql`NOT EXISTS (
        SELECT 1 FROM ${pulpaDistributions}
        WHERE ${pulpaDistributions.submissionId} = ${activitySubmissions.id}
      )`,
      ),
    )
    .orderBy(asc(activitySubmissions.reviewedAt))

  return results
}

/**
 * Update user profile PULPA stats (called after distribution completes)
 */
export async function updateUserPulpaStats(
  userId: string,
  pulpaAmount: string,
) {
  await db
    .update(profiles)
    .set({
      totalPulpaEarned: sql`${profiles.totalPulpaEarned} + ${pulpaAmount}`,
      activitiesCompleted: sql`${profiles.activitiesCompleted} + 1`,
    })
    .where(eq(profiles.userId, userId))
}
