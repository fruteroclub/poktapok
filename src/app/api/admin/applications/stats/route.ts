import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { applications } from '@/lib/db/schema'
import { eq, count, sql } from 'drizzle-orm'
import { apiSuccess, apiErrors } from '@/lib/api/response'
import { requireAdmin } from '@/lib/auth/middleware'

/**
 * GET /api/admin/applications/stats
 * Get application statistics for admin dashboard
 */
export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    // Get counts by status
    const statusCounts = await db
      .select({
        status: applications.status,
        count: count(),
      })
      .from(applications)
      .groupBy(applications.status)

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(applications)

    // Get recent applications count (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const [{ recentCount }] = await db
      .select({ recentCount: count() })
      .from(applications)
      .where(sql`${applications.createdAt} >= ${sevenDaysAgo.toISOString()}`)

    // Transform status counts into an object
    const stats = statusCounts.reduce(
      (acc, { status, count }) => {
        acc[status] = count
        return acc
      },
      {
        pending: 0,
        approved: 0,
        rejected: 0,
      } as Record<string, number>,
    )

    return apiSuccess({
      total,
      recentCount,
      byStatus: stats,
    })
  } catch (error) {
    console.error('Error fetching application statistics:', error)
    return apiErrors.internal()
  }
})
