import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { sessionActivities, activities, sessions } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { requireAdmin, handleApiError, successResponse } from '@/lib/auth/middleware'

const linkSessionActivitySchema = z.object({
  activityId: z.string().uuid('Invalid activity ID'),
  orderIndex: z.number().int().optional(),
})

/**
 * POST /api/admin/sessions/:id/activities - Link activity to session
 * @requires Admin authentication
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request)

    const body = await request.json()
    const result = linkSessionActivitySchema.safeParse(body)

    if (!result.success) {
      return handleApiError(result.error)
    }

    // Verify session exists
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, params.id))
      .limit(1)

    if (!session) {
      return handleApiError({ message: 'Session not found', code: 'NOT_FOUND' })
    }

    // Verify activity exists
    const [activity] = await db
      .select()
      .from(activities)
      .where(eq(activities.id, result.data.activityId))
      .limit(1)

    if (!activity) {
      return handleApiError({ message: 'Activity not found', code: 'NOT_FOUND' })
    }

    // Check if link already exists
    const [existingLink] = await db
      .select()
      .from(sessionActivities)
      .where(
        and(
          eq(sessionActivities.sessionId, params.id),
          eq(sessionActivities.activityId, result.data.activityId)
        )
      )
      .limit(1)

    if (existingLink) {
      return handleApiError({
        message: 'Activity is already linked to this session',
        code: 'CONFLICT',
      })
    }

    const [link] = await db
      .insert(sessionActivities)
      .values({
        sessionId: params.id,
        activityId: result.data.activityId,
        orderIndex: result.data.orderIndex || null,
      })
      .returning()

    return successResponse({ link }, 201)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * GET /api/admin/sessions/:id/activities - Get session activities
 * @requires Admin authentication
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request)

    const links = await db
      .select({
        id: sessionActivities.id,
        activityId: sessionActivities.activityId,
        orderIndex: sessionActivities.orderIndex,
        activity: {
          id: activities.id,
          title: activities.title,
          description: activities.description,
          activityType: activities.activityType,
          isActive: activities.isActive,
        },
      })
      .from(sessionActivities)
      .innerJoin(activities, eq(sessionActivities.activityId, activities.id))
      .where(eq(sessionActivities.sessionId, params.id))
      .orderBy(sessionActivities.orderIndex)

    return successResponse({ activities: links })
  } catch (error) {
    return handleApiError(error)
  }
}
