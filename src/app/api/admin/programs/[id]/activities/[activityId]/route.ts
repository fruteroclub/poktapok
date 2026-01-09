import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { programActivities } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { requireAdmin, handleApiError, successResponse } from '@/lib/auth/middleware'

const updateLinkSchema = z.object({
  isRequired: z.boolean().optional(),
  orderIndex: z.number().int().optional(),
})

/**
 * PATCH /api/admin/programs/:id/activities/:activityId - Update link
 * @requires Admin authentication
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; activityId: string } }
) {
  try {
    await requireAdmin(request)

    const body = await request.json()
    const result = updateLinkSchema.safeParse(body)

    if (!result.success) {
      return handleApiError(result.error)
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() }

    if (result.data.isRequired !== undefined) updates.isRequired = result.data.isRequired
    if (result.data.orderIndex !== undefined) updates.orderIndex = result.data.orderIndex

    const [link] = await db
      .update(programActivities)
      .set(updates)
      .where(
        and(
          eq(programActivities.programId, params.id),
          eq(programActivities.activityId, params.activityId)
        )
      )
      .returning()

    if (!link) {
      return handleApiError({ message: 'Activity link not found', code: 'NOT_FOUND' })
    }

    return successResponse({ link })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/admin/programs/:id/activities/:activityId - Unlink activity
 * @requires Admin authentication
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; activityId: string } }
) {
  try {
    await requireAdmin(request)

    const [link] = await db
      .delete(programActivities)
      .where(
        and(
          eq(programActivities.programId, params.id),
          eq(programActivities.activityId, params.activityId)
        )
      )
      .returning()

    if (!link) {
      return handleApiError({ message: 'Activity link not found', code: 'NOT_FOUND' })
    }

    return successResponse({ link })
  } catch (error) {
    return handleApiError(error)
  }
}
