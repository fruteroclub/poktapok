import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { programActivities, activities } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { requireAdmin, handleApiError, successResponse } from '@/lib/auth/middleware'

const linkActivitySchema = z.object({
  activityId: z.string().uuid('Invalid activity ID'),
  isRequired: z.boolean().default(false),
  orderIndex: z.number().int().optional(),
})

/**
 * POST /api/admin/programs/:id/activities - Link activity to program
 * @requires Admin authentication
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(request)

    const body = await request.json()
    const result = linkActivitySchema.safeParse(body)

    if (!result.success) {
      return handleApiError(result.error)
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
      .from(programActivities)
      .where(
        and(
          eq(programActivities.programId, params.id),
          eq(programActivities.activityId, result.data.activityId)
        )
      )
      .limit(1)

    if (existingLink) {
      return handleApiError({
        message: 'Activity is already linked to this program',
        code: 'CONFLICT',
      })
    }

    const [link] = await db
      .insert(programActivities)
      .values({
        programId: params.id,
        activityId: result.data.activityId,
        isRequired: result.data.isRequired,
        orderIndex: result.data.orderIndex,
      })
      .returning()

    return successResponse({ link }, 201)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * GET /api/admin/programs/:id/activities - Get program activities
 * @requires Admin authentication
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(request)

    const links = await db
      .select({
        id: programActivities.id,
        activityId: programActivities.activityId,
        isRequired: programActivities.isRequired,
        orderIndex: programActivities.orderIndex,
        activity: {
          id: activities.id,
          title: activities.title,
          description: activities.description,
          activityType: activities.activityType,
          isActive: activities.isActive,
        },
      })
      .from(programActivities)
      .innerJoin(activities, eq(programActivities.activityId, activities.id))
      .where(eq(programActivities.programId, params.id))
      .orderBy(programActivities.orderIndex)

    return successResponse({ activities: links })
  } catch (error) {
    return handleApiError(error)
  }
}
