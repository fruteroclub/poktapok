import { NextRequest } from 'next/server'
import { getSubmissions } from '@/lib/db/queries/activities'
import { listSubmissionsQuerySchema } from '@/lib/validators/activity'
import { handleApiError, successResponse, requireAdmin } from '@/lib/auth/middleware'
import { count } from 'drizzle-orm'
import { db } from '@/lib/db'
import { activitySubmissions } from '@/lib/db/schema'
import { eq, and, gte } from 'drizzle-orm'

/**
 * GET /api/admin/submissions
 * List submissions for review (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req)

    const { searchParams } = new URL(req.url)

    const params = listSubmissionsQuerySchema.parse({
      status: searchParams.get('status'),
      activity_id: searchParams.get('activity_id'),
      user_id: searchParams.get('user_id'),
      sort: searchParams.get('sort') || 'submitted_at_desc',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '24',
    })

    const result = await getSubmissions({
      status: params.status,
      activityId: params.activity_id,
      userId: params.user_id,
      sort: params.sort,
      page: params.page,
      limit: params.limit,
    })

    // Get stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const stats = await Promise.all([
      db.select({ count: count() }).from(activitySubmissions).where(eq(activitySubmissions.status, 'pending')),
      db.select({ count: count() }).from(activitySubmissions).where(eq(activitySubmissions.status, 'under_review')),
      db.select({ count: count() }).from(activitySubmissions).where(
        and(
          eq(activitySubmissions.status, 'approved'),
          gte(activitySubmissions.reviewedAt, today)
        )
      ),
    ])

    return successResponse({
      ...result,
      stats: {
        pending_count: Number(stats[0][0]?.count || 0),
        under_review_count: Number(stats[1][0]?.count || 0),
        approved_today: Number(stats[2][0]?.count || 0),
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
